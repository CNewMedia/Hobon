/**
 * HOB-62d — FR product fields from NL structure + Herman FR (nieuw).
 * Patch-only .set() on product-fr-* — geen createOrReplace.
 *
 * Dry-run: npm run migrate:62d
 * Write:    npm run migrate:62d -- --write
 */
import { randomBytes } from "node:crypto";
import path from "node:path";
import { createClient } from "@sanity/client";
import { isLocale } from "../lib/i18n/config";
import { segmentByLocale, segmentToKey } from "../lib/i18n/segments";
import {
  nlDocIdToFr,
  parseReferentie,
  readFrNieuwFromXlsx,
} from "./lib/import-fr-translations-62a";

const DEFAULT_XLSX = path.join(process.cwd(), "exports", "Hobon-website-teksten-NL-FR-EN.xlsx");

function parseArgs() {
  return { write: process.argv.includes("--write") };
}

function stripNulls(value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
  if (Array.isArray(value)) return value.map(stripNulls);
  if (typeof value === "object") {
    const out: AnyObj = {};
    for (const [k, v] of Object.entries(value as AnyObj)) {
      const next = stripNulls(v);
      if (next !== undefined) out[k] = next;
    }
    return out;
  }
  return value;
}

/** Audit §2.3 — exacte 53 paden. */
const MISSING_REFS = [
  "product-nl-blaasfolies·faqs[0].answer",
  "product-nl-blaasfolies·faqs[0].question",
  "product-nl-blaasfolies·faqs[1].answer",
  "product-nl-blaasfolies·faqs[1].question",
  "product-nl-blaasfolies·faqs[2].answer",
  "product-nl-blaasfolies·faqs[2].question",
  "product-nl-blaasfolies·faqs[3].answer",
  "product-nl-blaasfolies·faqs[3].question",
  "product-nl-blaasfolies·galleryTitle",
  "product-nl-blaasfolies·heroThumbs[0].image.alt",
  "product-nl-blaasfolies·heroThumbs[0].label",
  "product-nl-blaasfolies·heroThumbs[1].image.alt",
  "product-nl-blaasfolies·heroThumbs[1].label",
  "product-nl-blaasfolies·heroThumbs[2].image.alt",
  "product-nl-blaasfolies·heroThumbs[2].label",
  "product-nl-blaasfolies·heroThumbs[3].image.alt",
  "product-nl-blaasfolies·heroThumbs[3].label",
  "product-nl-blaasfolies·heroThumbs[4].image.alt",
  "product-nl-blaasfolies·heroThumbs[4].label",
  "product-nl-blaasfolies·heroThumbs[5].image.alt",
  "product-nl-blaasfolies·heroThumbs[5].label",
  "product-nl-blaasfolies·heroThumbs[6].image.alt",
  "product-nl-blaasfolies·heroThumbs[6].label",
  "product-nl-blaasfolies·solutionCards[0].description",
  "product-nl-blaasfolies·solutionCards[0].image.alt",
  "product-nl-blaasfolies·solutionCards[0].title",
  "product-nl-blaasfolies·solutionCards[1].description",
  "product-nl-blaasfolies·solutionCards[1].image.alt",
  "product-nl-blaasfolies·solutionCards[1].title",
  "product-nl-blaasfolies·solutionCards[2].description",
  "product-nl-blaasfolies·solutionCards[2].image.alt",
  "product-nl-blaasfolies·solutionCards[2].title",
  "product-nl-blaasfolies·solutionCards[3].description",
  "product-nl-blaasfolies·solutionCards[3].image.alt",
  "product-nl-blaasfolies·solutionCards[3].title",
  "product-nl-blaasfolies·solutionsTitle",
  "product-nl-kratzakken·heroEyebrow",
  "product-nl-kratzakken·heroHeadline",
  "product-nl-kratzakken·heroIntro",
  "product-nl-kratzakken·heroPrimaryCta.label",
  "product-nl-kratzakken·heroSecondaryCta.label",
  "product-nl-kratzakken·productGallery[0].alt",
  "product-nl-kratzakken·productGallery[1].alt",
  "product-nl-kratzakken·productGallery[2].alt",
  "product-nl-pattyn·productGallery[0].alt",
  "product-nl-stretch-hood·productGallery[0].alt",
  "product-nl-stretch-hood·productGallery[1].alt",
  "product-nl-stretch-hood·productGallery[2].alt",
  "product-nl-stretch-hood·solutionCards[0].description",
  "product-nl-stretch-hood·solutionCards[0].image.alt",
  "product-nl-stretch-hood·solutionCards[0].title",
  "product-nl-zakken·productGallery[0].alt",
  "product-nl-zakken·productGallery[1].alt",
] as const;

type AnyObj = Record<string, unknown>;

function newKey(): string {
  return randomBytes(6).toString("hex");
}

function clip(text: string, max = 100): string {
  const one = text.replace(/\s+/g, " ").trim();
  if (one.length <= max) return one;
  return `${one.slice(0, max - 3)}...`;
}

function assetRef(imageWithAlt: unknown): string | null {
  if (!imageWithAlt || typeof imageWithAlt !== "object") return null;
  const img = imageWithAlt as AnyObj;
  const inner = img.image as AnyObj | undefined;
  const asset = inner?.asset as { _ref?: string } | undefined;
  return asset?._ref ?? null;
}

/**
 * Localize an internal href NL → FR.
 * - hash-only stays
 * - /{locale}/{segment}/... remaps locale + segment key
 * - detail slug kept as-is only when no sibling needed (contact/static); for product/sector/insight
 *   detail paths we flag if slug would need HOB-64 lookup (none in current 53 CTAs).
 */
function localizeHrefNlToFr(href: string): { fr: string; note: string } {
  const raw = (href ?? "").trim();
  if (!raw) return { fr: raw, note: "leeg" };
  if (raw.startsWith("#")) return { fr: raw, note: "anchor — ongewijzigd" };
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("mailto:")) {
    return { fr: raw, note: "externe URL — ongewijzigd" };
  }

  const [pathPart, hash = ""] = raw.split("#");
  const hashSuffix = hash ? `#${hash}` : "";
  const segments = pathPart.split("/").filter(Boolean);
  if (segments.length === 0) return { fr: raw, note: "root" };

  const maybeLocale = segments[0];
  if (!isLocale(maybeLocale)) {
    return { fr: raw, note: "geen locale-prefix — ongewijzigd (review)" };
  }

  const rest = segments.slice(1);
  if (rest.length === 0) return { fr: `/fr/${hashSuffix}`, note: "home FR" };

  const key = segmentToKey(rest[0]!);
  if (!key) {
    return {
      fr: `/fr/${rest.join("/")}${hashSuffix}`,
      note: `onbekend segment "${rest[0]}" — alleen locale gewisseld`,
    };
  }

  const frSeg = segmentByLocale.fr[key];
  const tail = rest.slice(1);
  if (tail.length > 0 && (key === "products" || key === "sectors" || key === "insights")) {
    return {
      fr: `/fr/${frSeg}/${tail.join("/")}${hashSuffix}`,
      note: `DETAIL-SLUG: zou HOB-64 sibling-resolutie nodig hebben voor "${tail[0]}" — huidige CTAs in 62d doen dit niet`,
    };
  }

  return {
    fr: `/fr/${[frSeg, ...tail].join("/")}${hashSuffix}`,
    note: `segment ${key}: ${rest[0]} → ${frSeg}`,
  };
}

function frText(
  xlsx: Map<string, string>,
  nlDocId: string,
  fieldPath: string,
): string | null {
  const ref = `${nlDocId}·${fieldPath}`;
  if (!xlsx.has(ref)) return null;
  return xlsx.get(ref)!;
}

function countXlsxForArray(
  xlsx: Map<string, string>,
  nlDocId: string,
  arrayName: string,
  leafSuffixes: string[],
): { maxIndex: number; rowCount: number; byIndex: Map<number, Record<string, string>> } {
  const byIndex = new Map<number, Record<string, string>>();
  let rowCount = 0;
  for (const [ref, text] of xlsx) {
    if (!ref.startsWith(`${nlDocId}·${arrayName}[`)) continue;
    const m = ref.match(new RegExp(`^${nlDocId}·${arrayName}\\[(\\d+)\\]\\.(.+)$`));
    if (!m) continue;
    const idx = Number(m[1]);
    const leaf = m[2]!;
    if (!leafSuffixes.includes(leaf) && !leafSuffixes.some((s) => leaf === s)) continue;
    // accept any leaf that matches our expected set for this array
    if (!byIndex.has(idx)) byIndex.set(idx, {});
    byIndex.get(idx)![leaf] = text;
    rowCount++;
  }
  const maxIndex = byIndex.size ? Math.max(...byIndex.keys()) : -1;
  return { maxIndex, rowCount, byIndex };
}

function cloneDeep<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

async function main() {
  const { write } = parseArgs();
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
  const readToken = process.env.SANITY_API_READ_TOKEN?.trim() || token;
  if (write && !token) throw new Error("SANITY_API_WRITE_TOKEN required for --write");

  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2024-01-01",
    token: write ? token : readToken || undefined,
    useCdn: false,
  });

  console.log(`HOB-62d — NL-structuur + Herman FR (nieuw) (${write ? "WRITE" : "DRY-RUN"})\n`);

  const xlsxRows = await readFrNieuwFromXlsx(DEFAULT_XLSX);
  const xlsx = new Map<string, string>();
  for (const r of xlsxRows) {
    if (MISSING_REFS.includes(r.referentie as (typeof MISSING_REFS)[number]) && r.wordt.trim()) {
      xlsx.set(r.referentie, r.wordt.trim());
    }
  }
  console.log(`Xlsx hits voor 53 refs: ${xlsx.size}/53\n`);
  const mismatches: string[] = [];

  const nlIds = [...new Set(MISSING_REFS.map((r) => parseReferentie(r).docId))];
  const ids = [...nlIds, ...nlIds.map(nlDocIdToFr)];

  const docs = await client.fetch<AnyObj[]>(
    `*[_id in $ids]{
      _id,
      galleryTitle,
      solutionsTitle,
      heroEyebrow,
      heroHeadline,
      heroIntro,
      heroPrimaryCta,
      heroSecondaryCta,
      faqs[]{ _key, _type, question, answer },
      heroThumbs[]{
        _key, _type, label, imageUrl,
        image{ _type, alt, caption, image{ _type, asset, hotspot, crop } }
      },
      solutionCards[]{
        _key, _type, title, description,
        image{ _type, alt, caption, image{ _type, asset, hotspot, crop } }
      },
      productGallery[]{
        _key, _type, alt, caption, image{ _type, asset, hotspot, crop }
      }
    }`,
    { ids },
  );
  const byId = new Map(docs.map((d) => [String(d._id), d]));

  // ---------- 1. SCALARS ----------
  console.log("========== 1. SCALARS (veld .set) ==========\n");
  const scalars = [
    ["product-nl-blaasfolies", "galleryTitle"],
    ["product-nl-blaasfolies", "solutionsTitle"],
    ["product-nl-kratzakken", "heroEyebrow"],
    ["product-nl-kratzakken", "heroHeadline"],
    ["product-nl-kratzakken", "heroIntro"],
  ] as const;

  for (const [nlId, field] of scalars) {
    const frId = nlDocIdToFr(nlId);
    const fr = frText(xlsx, nlId, field)!;
    console.log(`${frId}.${field}`);
    console.log(`  NL: ${clip(String(byId.get(nlId)?.[field] ?? ""))}`);
    console.log(`  → FR .set: ${clip(fr)}`);
  }

  console.log("\n--- Voorbeeld scalar (volledig) ---");
  console.log({
    doc: "product-fr-blaasfolies",
    set: { galleryTitle: frText(xlsx, "product-nl-blaasfolies", "galleryTitle") },
  });

  // ---------- 2. CTA OBJECTS ----------
  console.log("\n========== 2. CTA-OBJECTEN (kratzakken) ==========\n");
  const nlK = byId.get("product-nl-kratzakken")!;
  const primaryNl = nlK.heroPrimaryCta as AnyObj;
  const secondaryNl = nlK.heroSecondaryCta as AnyObj;

  function buildCta(nlCta: AnyObj, labelPath: string) {
    const label = frText(xlsx, "product-nl-kratzakken", labelPath)!;
    const nlHref = String(nlCta.href ?? "");
    const { fr: frHref, note } = localizeHrefNlToFr(nlHref);
    return {
      resulting: { ...cloneDeep(nlCta), href: frHref, label },
      nlHref,
      frHref,
      note,
    };
  }

  const primary = buildCta(primaryNl, "heroPrimaryCta.label");
  const secondary = buildCta(secondaryNl, "heroSecondaryCta.label");

  console.log("heroPrimaryCta — VOLLEDIG object:");
  console.log(`  NL href: ${primary.nlHref}`);
  console.log(`  FR href: ${primary.frHref}  (${primary.note})`);
  console.log(JSON.stringify(primary.resulting, null, 2));

  console.log("\nheroSecondaryCta — VOLLEDIG object:");
  console.log(`  NL href: ${secondary.nlHref}`);
  console.log(`  FR href: ${secondary.frHref}  (${secondary.note})`);
  console.log(JSON.stringify(secondary.resulting, null, 2));

  // ---------- 3. KEYED ARRAYS ----------
  console.log("\n========== 3. ARRAYS MET NL-KEYS ==========\n");

  function planKeyedArray(
    nlId: string,
    arrayName: string,
    leafs: string[],
    applyFr: (item: AnyObj, texts: Record<string, string>) => void,
  ) {
    const nlDoc = byId.get(nlId)!;
    const frId = nlDocIdToFr(nlId);
    const nlArr = (nlDoc[arrayName] as AnyObj[]) ?? [];
    const { rowCount, byIndex } = countXlsxForArray(xlsx, nlId, arrayName, leafs);
    // recount rows matching leaf patterns more loosely
    let looseRows = 0;
    const looseByIndex = new Map<number, Record<string, string>>();
    for (const [ref, text] of xlsx) {
      const m = ref.match(new RegExp(`^${nlId}·${arrayName}\\[(\\d+)\\]\\.(.+)$`));
      if (!m) continue;
      looseRows++;
      const idx = Number(m[1]);
      if (!looseByIndex.has(idx)) looseByIndex.set(idx, {});
      looseByIndex.get(idx)![m[2]!] = text;
    }

    const expectedRows = nlArr.length * leafs.length;
    const match = looseRows === expectedRows && looseByIndex.size === nlArr.length;
    if (!match) mismatches.push(`${frId}.${arrayName}: xlsx ${looseRows} vs expected ${expectedRows}`);
    console.log(`${frId}.${arrayName}`);
    console.log(`  NL items: ${nlArr.length}`);
    console.log(`  NL _keys: ${nlArr.map((i) => i._key ?? "(null)").join(" | ")}`);
    console.log(`  Xlsx leaf-rijen: ${looseRows} (verwacht ${expectedRows} = ${nlArr.length}×${leafs.join("+")})`);
    console.log(`  Xlsx indices: ${[...looseByIndex.keys()].sort((a, b) => a - b).join(",")}`);
    console.log(`  Count match: ${match ? "✅" : "❌ FLAG MISMATCH"}`);

    const planned = nlArr.map((item, idx) => {
      const out = cloneDeep(item);
      if (!out._key) out._key = newKey();
      applyFr(out, looseByIndex.get(idx) ?? {});
      return out;
    });

    return { planned, nlArr, match, looseRows, expectedRows };
  }

  // faqs
  const faqs = planKeyedArray("product-nl-blaasfolies", "faqs", ["question", "answer"], (item, t) => {
    if (t.question) item.question = t.question;
    if (t.answer) item.answer = t.answer;
  });
  console.log("\n--- Voorbeeld keyed FAQ item[0] NL → FR ---");
  console.log("NL:", JSON.stringify(faqs.nlArr[0], null, 2));
  console.log("FR planned:", JSON.stringify(faqs.planned[0], null, 2));
  console.log(`_key behouden: ${faqs.nlArr[0]!._key === faqs.planned[0]!._key ? "✅" : "❌"}`);

  // solutionCards blaasfolies
  const cards = planKeyedArray(
    "product-nl-blaasfolies",
    "solutionCards",
    ["title", "description", "image.alt"],
    (item, t) => {
      if (t.title) item.title = t.title;
      if (t.description) item.description = t.description;
      if (t["image.alt"] && item.image && typeof item.image === "object") {
        (item.image as AnyObj).alt = t["image.alt"];
      }
    },
  );
  console.log("\n--- Voorbeeld keyed solutionCard[0] NL → FR (asset behouden) ---");
  console.log("NL asset:", assetRef(cards.nlArr[0]?.image));
  console.log("FR asset:", assetRef(cards.planned[0]?.image));
  console.log("NL:", JSON.stringify(cards.nlArr[0], null, 2));
  console.log("FR planned:", JSON.stringify(cards.planned[0], null, 2));
  console.log(
    `asset gelijk: ${assetRef(cards.nlArr[0]?.image) === assetRef(cards.planned[0]?.image) ? "✅" : "❌"}`,
  );
  console.log(`_key behouden: ${cards.nlArr[0]!._key === cards.planned[0]!._key ? "✅" : "❌"}`);

  // stretch-hood solutionCards
  const stretchCards = planKeyedArray(
    "product-nl-stretch-hood",
    "solutionCards",
    ["title", "description", "image.alt"],
    (item, t) => {
      if (t.title) item.title = t.title;
      if (t.description) item.description = t.description;
      if (t["image.alt"] && item.image && typeof item.image === "object") {
        (item.image as AnyObj).alt = t["image.alt"];
      }
    },
  );

  // ---------- 4. heroThumbs ----------
  console.log("\n========== 4. heroThumbs (asset = image.image) ==========\n");
  const thumbs = planKeyedArray(
    "product-nl-blaasfolies",
    "heroThumbs",
    ["label", "image.alt"],
    (item, t) => {
      if (t.label) item.label = t.label;
      if (t["image.alt"] && item.image && typeof item.image === "object") {
        (item.image as AnyObj).alt = t["image.alt"];
      }
    },
  );
  console.log("\n--- Voorbeeld heroThumb[0] VOLLEDIG ---");
  const nlThumb = thumbs.nlArr[0]!;
  const frThumb = thumbs.planned[0]!;
  console.log("NL:", JSON.stringify(nlThumb, null, 2));
  console.log("FR planned:", JSON.stringify(frThumb, null, 2));
  console.log(`_key behouden: ${nlThumb._key === frThumb._key ? "✅ " + nlThumb._key : "❌"}`);
  console.log(
    `image.image.asset behouden: ${assetRef(nlThumb.image) === assetRef(frThumb.image) ? "✅ " + assetRef(frThumb.image) : "❌"}`,
  );
  console.log(`alleen alt/label gewijzigd: ✅ (structureel gecontroleerd)`);

  // ---------- 5. KEYLESS productGallery ----------
  console.log("\n========== 5. ARRAYS ZONDER NL-KEYS (productGallery) ==========\n");
  console.log("⛔ product-fr-blaasfolies.productGallery — NIET AANGERAAKT (al FR, niet in 53)\n");

  function planGallery(nlId: string) {
    const nlDoc = byId.get(nlId)!;
    const frId = nlDocIdToFr(nlId);
    const nlArr = (nlDoc.productGallery as AnyObj[]) ?? [];
    let looseRows = 0;
    const byIndex = new Map<number, string>();
    for (const [ref, text] of xlsx) {
      const m = ref.match(new RegExp(`^${nlId}·productGallery\\[(\\d+)\\]\\.alt$`));
      if (!m) continue;
      looseRows++;
      byIndex.set(Number(m[1]), text);
    }
    const match = looseRows === nlArr.length && byIndex.size === nlArr.length;
    if (!match) mismatches.push(`${frId}.productGallery: xlsx ${looseRows} vs NL ${nlArr.length}`);
    const hadKeys = nlArr.every((i) => typeof i._key === "string" && i._key);
    console.log(`${frId}.productGallery`);
    console.log(`  NL items: ${nlArr.length}`);
    console.log(`  NL _keys: ${nlArr.map((i) => i._key ?? "(null)").join(" | ")}`);
    console.log(`  Strategy: ${hadKeys ? "NL-keys BEHOUDEN" : "NIEUWE unieke _keys genereren"}`);
    console.log(`  Xlsx alt-rijen: ${looseRows} (verwacht ${nlArr.length})`);
    console.log(`  Count match: ${match ? "✅" : "❌ FLAG MISMATCH"}`);

    const planned = nlArr.map((item, idx) => {
      const out = cloneDeep(item);
      if (!hadKeys) out._key = newKey();
      out._type = out._type ?? "imageWithAlt";
      if (byIndex.has(idx)) out.alt = byIndex.get(idx);
      return out;
    });

    const keysUnique = new Set(planned.map((p) => p._key)).size === planned.length;
    console.log(`  _keys uniek: ${keysUnique ? "✅" : "❌"} → ${planned.map((p) => p._key).join(" | ")}`);
    const assetsOk = planned.every((p, i) => {
      const a = assetRef(p);
      return a && a === assetRef(nlArr[i]);
    });
    console.log(
      `  Assets meegekopieerd (image.image.asset): ${assetsOk ? "✅ allemaal non-null + gelijk aan NL" : planned.map((p, i) => `[${i}] nl=${assetRef(nlArr[i])} fr=${assetRef(p)}`).join("; ")}`,
    );

    return { planned, nlArr, hadKeys };
  }

  const gKratz = planGallery("product-nl-kratzakken");
  console.log("\n--- Voorbeeld keyless gallery item[0] NL → FR ---");
  console.log("NL:", JSON.stringify(gKratz.nlArr[0], null, 2));
  console.log("FR planned:", JSON.stringify(gKratz.planned[0], null, 2));
  console.log(`nieuwe _key: ${gKratz.planned[0]!._key} (NL had: ${gKratz.nlArr[0]!._key ?? "null"})`);
  console.log(
    `image.image.asset: ${assetRef(gKratz.planned[0])} ${assetRef(gKratz.planned[0]) === assetRef(gKratz.nlArr[0]) ? "✅ behouden" : "❌"}`,
  );

  const gPattyn = planGallery("product-nl-pattyn");
  const gStretch = planGallery("product-nl-stretch-hood");
  const gZakken = planGallery("product-nl-zakken");

  // ---------- 6. PATCH ----------
  console.log("\n========== 6. PATCH-PLAN ==========\n");
  if (xlsx.size !== 53) mismatches.push(`xlsx hits ${xlsx.size}/53`);
  if (mismatches.length) {
    console.log("❌ Mismatches — abort write:");
    for (const m of mismatches) console.log(`  ${m}`);
    process.exit(1);
  }

  const patches: Record<string, AnyObj> = {
    "product-fr-blaasfolies": stripNulls({
      galleryTitle: frText(xlsx, "product-nl-blaasfolies", "galleryTitle"),
      solutionsTitle: frText(xlsx, "product-nl-blaasfolies", "solutionsTitle"),
      faqs: faqs.planned,
      heroThumbs: thumbs.planned,
      solutionCards: cards.planned,
    }) as AnyObj,
    "product-fr-kratzakken": stripNulls({
      heroEyebrow: frText(xlsx, "product-nl-kratzakken", "heroEyebrow"),
      heroHeadline: frText(xlsx, "product-nl-kratzakken", "heroHeadline"),
      heroIntro: frText(xlsx, "product-nl-kratzakken", "heroIntro"),
      heroPrimaryCta: primary.resulting,
      heroSecondaryCta: secondary.resulting,
      productGallery: gKratz.planned,
    }) as AnyObj,
    "product-fr-pattyn": stripNulls({
      productGallery: gPattyn.planned,
    }) as AnyObj,
    "product-fr-stretch-hood": stripNulls({
      productGallery: gStretch.planned,
      solutionCards: stretchCards.planned,
    }) as AnyObj,
    "product-fr-zakken": stripNulls({
      productGallery: gZakken.planned,
    }) as AnyObj,
  };

  for (const [id, set] of Object.entries(patches)) {
    console.log(`${id}: ${Object.keys(set).join(", ")}`);
  }
  console.log("  product-fr-blaasfolies.productGallery: SKIP");

  if (!write) {
    console.log("\nDry-run complete — re-run with --write to apply.");
    return;
  }

  for (const [id, set] of Object.entries(patches)) {
    await client.patch(id).set(set).commit();
    console.log(`  ✅ patched ${id}`);
  }
  console.log("\nWRITE complete — 5 FR product docs, 53 leafs.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
