/**
 * HOB-36b / HOB-37 — Translate [FR]/[EN] placeholders via targeted patches.
 * Supports colon placeholders ([FR: vertaling nodig]) and bare brackets ([FR] / [EN]).
 */
import { createClient, type SanityClient } from "@sanity/client";
import { HOBON_GLOSSARY, translateText } from "./lib/translate-with-claude";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

const isDryRun = process.argv.includes("--dry-run");

/** Matches [FR], [EN], [FR: ...], [EN translation], [FR vertaling], etc. */
export const PLACEHOLDER_REGEX = /\[(FR|EN)(\s+[^\]]*)?\]/;

const COLON_PLACEHOLDER_REGEX = /\[(FR|EN):\s[^\]]*\]/;

/** HOB-33a Matthieu docs — skip entirely. */
const MATTHIEU_SKIP_DOC_IDS = new Set([
  "drafts.homePage-nl",
  "drafts.headerNavigation-fr",
  "headerNavigation-fr",
  "drafts.sector-fr-logistiek",
  "drafts.sector-fr-voeding",
  "sector-en-agro",
  "drafts.sector-en-agro",
  "drafts.product-fr-pattyn",
  "drafts.product-fr-stretch-hood",
  "drafts.product-fr-vellen",
  "drafts.product-fr-zakken",
  "drafts.product-fr-blaasfolies",
]);

const DOC_TYPES = [
  "homePage",
  "aboutPage",
  "contactPage",
  "sustainabilityPage",
  "sector",
  "product",
  "sectorOverviewPage",
  "productOverviewPage",
  "insightsOverviewPage",
  "headerNavigation",
  "footerNavigation",
  "uiLabels",
  "siteSettings",
  "insightArticle",
  "insightCategory",
  "seoDefaults",
];

const CONTEXT_BY_TYPE: Record<string, string> = {
  homePage: "Homepage marketing copy voor Hobon (B2B verpakkingsfolie).",
  contactPage: "Contactpagina — formele B2B toon.",
  sustainabilityPage: "Duurzaamheidspagina — technisch en geloofwaardig.",
  insightsOverviewPage: "Insights/actualités overzichtspagina.",
  insightArticle: "Insight artikel — korte titel, lead en SEO.",
  insightCategory: "Insight categorie — titel en beschrijving.",
  aboutPage: "Over Hobon pagina.",
  sector: "Sectorpagina.",
  product: "Productpagina.",
};

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

type MarkerKind = "bare-bracket" | "colon-placeholder" | "mixed";

type FieldHit = {
  docId: string;
  docType: string;
  locale: "fr" | "en";
  path: string;
  currentValue: string;
  markerKind: MarkerKind;
};

function nlDocId(targetId: string): string {
  const drafts = targetId.startsWith("drafts.") ? "drafts." : "";
  const base = targetId.replace(/^drafts\./, "");
  if (/-(fr|en)$/.test(base)) return drafts + base.replace(/-(fr|en)$/, "-nl");
  return drafts + base.replace(/-fr-/, "-nl-").replace(/-en-/, "-nl-");
}

function getAtPath(obj: unknown, path: string): unknown {
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function classifyMarker(text: string): MarkerKind | null {
  if (!PLACEHOLDER_REGEX.test(text)) return null;
  const trimmed = text.trim();
  const isBareOnly = /^\[(FR|EN)\]$/i.test(trimmed);
  const hasColon = COLON_PLACEHOLDER_REGEX.test(text);
  if (isBareOnly) return "bare-bracket";
  if (hasColon && trimmed.replace(COLON_PLACEHOLDER_REGEX, "").trim().length > 0) return "mixed";
  if (hasColon) return "colon-placeholder";
  return "bare-bracket";
}

export function hasPlaceholder(text: string): boolean {
  return classifyMarker(text) !== null;
}

function scanStrings(
  value: unknown,
  path: string,
  hits: FieldHit[],
  ctx: Pick<FieldHit, "docId" | "docType" | "locale">,
): void {
  if (typeof value === "string") {
    const kind = classifyMarker(value);
    if (kind) hits.push({ ...ctx, path: path || "(root)", currentValue: value, markerKind: kind });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => scanStrings(item, `${path}[${i}]`, hits, ctx));
    return;
  }
  if (value && typeof value === "object") {
    const skip = new Set(["_rev", "_createdAt", "_updatedAt", "_type", "_ref", "_weak", "_key"]);
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === "_id") continue;
      if (k.startsWith("_") && skip.has(k)) continue;
      scanStrings(v, path ? `${path}.${k}` : k, hits, ctx);
    }
  }
}

function inferLocale(doc: { _id: string; language?: string }): "fr" | "en" | null {
  if (doc.language === "fr" || doc.language === "en") return doc.language;
  const m = doc._id.replace(/^drafts\./, "").match(/-(fr|en)$/);
  return m && (m[1] === "fr" || m[1] === "en") ? m[1] : null;
}

function nlSourceUsable(text: unknown): text is string {
  if (typeof text !== "string") return false;
  const t = text.trim();
  if (!t) return false;
  if (hasPlaceholder(t)) return false;
  return true;
}

function patchKeyFromPath(path: string): string {
  return path.replace(/\[(\d+)\]/g, "[$1]");
}

function isCtaPath(path: string): boolean {
  return (
    path.includes("Cta.label") ||
    path.includes("cta.buttonLabel") ||
    path === "formSubmitLabel" ||
    path === "formTitle"
  );
}

function isSeoPath(path: string): boolean {
  return path.startsWith("seo.");
}

async function collectHits(): Promise<FieldHit[]> {
  const docs = await client.fetch<Record<string, unknown>[]>(`*[_type in $types]{ ... }`, {
    types: DOC_TYPES,
  });
  const hits: FieldHit[] = [];
  for (const doc of docs) {
    const locale = inferLocale(doc as { _id: string; language?: string });
    if (!locale) continue;
    if (MATTHIEU_SKIP_DOC_IDS.has(String(doc._id))) continue;
    scanStrings(doc, "", hits, {
      docId: String(doc._id),
      docType: String(doc._type),
      locale,
    });
  }
  hits.sort((a, b) => a.docId.localeCompare(b.docId) || a.path.localeCompare(b.path));
  return hits;
}

async function translateField(hit: FieldHit, nlText: string): Promise<string> {
  const context = CONTEXT_BY_TYPE[hit.docType] ?? `Hobon ${hit.docType} content`;
  // Bare-bracket and colon: always replace entire field with NL-based translation.
  return translateText({
    text: nlText,
    fromLocale: "nl",
    toLocale: hit.locale,
    context,
    glossary: HOBON_GLOSSARY,
  });
}

async function applyPatch(
  sanity: SanityClient,
  docId: string,
  path: string,
  newValue: string,
  expectedOld: string,
): Promise<void> {
  const fresh = await sanity.fetch<Record<string, unknown> | null>(`*[_id == $id][0]`, { id: docId });
  if (!fresh) throw new Error(`Document ${docId} not found`);
  const current = getAtPath(fresh, path);
  if (typeof current !== "string" || !hasPlaceholder(current)) {
    throw new Error(`Safety check failed: ${docId} ${path} no longer has placeholder`);
  }
  if (current !== expectedOld) {
    throw new Error(`Safety check failed: ${docId} ${path} value changed since plan`);
  }
  const key = patchKeyFromPath(path);
  await sanity.patch(docId).set({ [key]: newValue }).commit();
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n - 3)}...`;
}

async function main() {
  if (!token) throw new Error("Missing SANITY_API_WRITE_TOKEN");
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }

  const hits = await collectHits();
  const plans: Array<{
    hit: FieldHit;
    nlText: string;
    translated: string;
    status: "ok" | "skip";
    reason?: string;
  }> = [];

  for (const hit of hits) {
    const nlId = nlDocId(hit.docId);
    const nlDoc = await client.fetch<Record<string, unknown> | null>(`*[_id == $id][0]`, { id: nlId });
    if (!nlDoc) {
      plans.push({ hit, nlText: "", translated: "", status: "skip", reason: `No NL doc ${nlId}` });
      continue;
    }
    const nlVal = getAtPath(nlDoc, hit.path);
    if (!nlSourceUsable(nlVal)) {
      plans.push({
        hit,
        nlText: typeof nlVal === "string" ? nlVal : "",
        translated: "",
        status: "skip",
        reason: "Skipped: no NL source",
      });
      continue;
    }

    const translated = await translateField(hit, nlVal);
    plans.push({ hit, nlText: nlVal, translated, status: "ok" });
  }

  const okPlans = plans.filter((p) => p.status === "ok");
  const skipped = plans.filter((p) => p.status === "skip");
  const ctaPlans = okPlans.filter((p) => isCtaPath(p.hit.path));
  const seoPlans = okPlans.filter((p) => isSeoPath(p.hit.path));

  console.log(`Plan to translate ${okPlans.length} fields (${skipped.length} skipped):\n`);
  console.log(
    `Marker breakdown: ${okPlans.filter((p) => p.hit.markerKind === "bare-bracket").length} bare-bracket, ` +
      `${okPlans.filter((p) => p.hit.markerKind === "colon-placeholder").length} colon, ` +
      `${okPlans.filter((p) => p.hit.markerKind === "mixed").length} mixed\n`,
  );

  if (ctaPlans.length) {
    console.log("--- CTA / form labels ---");
    for (const p of ctaPlans) {
      console.log(`  ${p.hit.docId} · ${p.hit.path} [${p.hit.markerKind}]`);
      console.log(`    NL:  "${truncate(p.nlText, 80)}"`);
      console.log(`    →:  "${truncate(p.translated, 80)}"`);
    }
    console.log("");
  }

  if (seoPlans.length) {
    console.log("--- SEO meta ---");
    for (const p of seoPlans) {
      console.log(`  ${p.hit.docId} · ${p.hit.path} [${p.hit.markerKind}]`);
      console.log(`    NL:  "${truncate(p.nlText, 80)}"`);
      console.log(`    →:  "${truncate(p.translated, 80)}"`);
    }
    console.log("");
  }

  let lastDoc = "";
  for (const p of plans) {
    if (p.hit.docId !== lastDoc) {
      console.log(`\n${p.hit.docId}:`);
      lastDoc = p.hit.docId;
    }
    if (p.status === "skip") {
      console.log(`  SKIP ${p.hit.path}: ${p.reason}`);
      continue;
    }
    const oldShort = truncate(p.hit.currentValue, 50);
    const newShort = truncate(p.translated, 70);
    console.log(`  ${p.hit.path} [${p.hit.markerKind}]: "${oldShort}" → "${newShort}"`);
  }

  console.log(`\n[${okPlans.length} fields total, ${skipped.length} skipped]`);

  if (isDryRun) {
    console.log("\nDry-run complete. No writes. Use without --dry-run after PM approval.");
    return;
  }

  let patched = 0;
  let failed = 0;
  for (const p of okPlans) {
    try {
      await applyPatch(client, p.hit.docId, p.hit.path, p.translated, p.hit.currentValue);
      console.log(`✓ Patched ${p.hit.docId} ${p.hit.path}`);
      patched++;
    } catch (e) {
      console.error(`✗ Failed ${p.hit.docId} ${p.hit.path}:`, e instanceof Error ? e.message : e);
      failed++;
    }
  }

  console.log(`\nDone: ${patched} patched, ${failed} failed, ${skipped.length} skipped (NL source empty).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
