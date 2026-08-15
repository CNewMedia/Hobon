/**
 * HOB-65 phase-2 — Herbouw de 3 EN insights waarvan Herman-tekst bullets miste.
 *
 * Dry-run: npm run migrate:65-phase-2
 * Write:    npm run migrate:65-phase-2 -- --write
 *
 * Patch-only .set({ body }) op 3 EN-docs. NL/FR blijven ongemoeid.
 * De 5 phase-1 docs worden niet aangeraakt.
 */
import { createClient } from "@sanity/client";
import {
  bodyStyleSignature,
  countNlNonEmptyTextBlocks,
  getBlockSpanText,
  isNlTextBlock,
  mapFrBodyFromNlStructure,
  splitFrParagraphs,
} from "./lib/import-fr-translations-62a";
import { PHASE_2_EN_PLAIN } from "./lib/hob-65-phase-2-en";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

const ARTICLES = [
  {
    key: "audit-klaar",
    nl: "insight-nl-audit-klaar-met-de-juiste-folie",
    fr: "9d83f7de-2109-4a0c-b12f-0cc6fa3edb07",
    en: "822ba01f-be4e-466b-90e0-40534aad627b",
  },
  {
    key: "ffs-lijn",
    nl: "insight-nl-ffs-lijn-65-meter",
    fr: "8c316fb7-3998-4034-a98f-508fc4e9b017",
    en: "99992a49-5c23-4d88-bebd-0625f3253cdb",
  },
  {
    key: "faalkosten",
    nl: "insight-nl-faalkosten-verkeerde-foliekeuze",
    fr: "insight-fr-faalkosten-verkeerde-foliekeuze",
    en: "insight-en-faalkosten-verkeerde-foliekeuze",
  },
] as const;

function parseArgs() {
  return { write: process.argv.includes("--write") };
}

function clip(text: string, max = 65): string {
  const one = text.replace(/\s+/g, " ").trim();
  if (one.length <= max) return one;
  return `${one.slice(0, max - 3)}...`;
}

function countStyleMismatches(
  nlBody: Record<string, unknown>[],
  otherBody: Record<string, unknown>[],
): number {
  let mismatches = 0;
  for (let i = 0; i < Math.min(nlBody.length, otherBody.length); i++) {
    const nl = nlBody[i]!;
    const other = otherBody[i]!;
    if (!isNlTextBlock(nl) || !getBlockSpanText(nl)) continue;
    const nlStyle = String(nl.style ?? "normal");
    const otherStyle = String(other.style ?? "normal");
    if (nlStyle !== otherStyle) mismatches++;
  }
  return mismatches;
}

function lastNonEmptyText(blocks: Record<string, unknown>[]): string {
  for (let i = blocks.length - 1; i >= 0; i--) {
    const b = blocks[i]!;
    if (isNlTextBlock(b)) {
      const t = getBlockSpanText(b);
      if (t) return t;
    }
  }
  return "";
}

function countListItems(body: Record<string, unknown>[]): number {
  return body.filter((b) => b._type === "block" && Boolean(b.listItem) && getBlockSpanText(b).length > 0)
    .length;
}

async function main() {
  const { write } = parseArgs();
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
  const readToken = process.env.SANITY_API_READ_TOKEN?.trim() || token;
  if (write && !token) throw new Error("SANITY_API_WRITE_TOKEN required for --write");

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: write ? token : readToken || undefined,
    useCdn: false,
  });

  console.log(`HOB-65 phase-2 — 3 EN bodies NL-structuur + Herman EN bullets (${write ? "WRITE" : "DRY-RUN"}) — ${dataset}`);
  console.log("Bron EN-tekst: scripts/lib/hob-65-phase-2-en.ts (Herman, incl. bullets)");
  console.log("Patch-only (.set({ body })) op 3 EN-docs — NL/FR ongewijzigd\n");

  let pass = 0;
  let flagged = 0;
  const flaggedKeys: string[] = [];
  const patchDocs: string[] = [];

  for (const article of ARTICLES) {
    console.log(`=== ${article.key} ===`);
    console.log(`  NL: ${article.nl}  (structuurbron — geen patch)`);
    console.log(`  FR: ${article.fr}  (reeds 62f — geen patch)`);
    console.log(`  EN: ${article.en}  (doel .set({ body }))`);

    const [nlDoc, frDoc, enDoc] = await Promise.all([
      client.fetch<{ title?: string; slug?: string; body?: Record<string, unknown>[] }>(
        `*[_id == $id][0]{ title, "slug": slug.current, body }`,
        { id: article.nl },
      ),
      client.fetch<{ body?: Record<string, unknown>[] }>(`*[_id == $id][0]{ body }`, { id: article.fr }),
      client.fetch<{ title?: string; slug?: string; body?: Record<string, unknown>[] }>(
        `*[_id == $id][0]{ title, "slug": slug.current, body }`,
        { id: article.en },
      ),
    ]);

    const nlBody = nlDoc?.body ?? [];
    const frBody = frDoc?.body ?? [];
    const currentEnBody = enDoc?.body ?? [];
    const nlTextBlocks = countNlNonEmptyTextBlocks(nlBody);
    const enPlain = PHASE_2_EN_PLAIN[article.key];
    if (!enPlain) {
      console.log("  ❌ FLAG — geen Herman EN in phase-2 bron");
      flagged++;
      flaggedKeys.push(article.key);
      console.log("");
      continue;
    }
    const enParas = splitFrParagraphs(enPlain);
    const frMm = countStyleMismatches(nlBody, frBody);
    const nlLists = countListItems(nlBody);
    const currentEnLists = countListItems(currentEnBody);

    console.log(`  EN titel: ${enDoc?.title ?? "—"}`);
    console.log(`  EN slug: /en/insights/${enDoc?.slug ?? "?"}`);
    console.log(
      `  Preconditie: NL tekst-blocks=${nlTextBlocks} | Herman EN alinea's=${enParas.length} | FR style-mm vs NL=${frMm}`,
    );
    console.log(`  List-items: NL=${nlLists} | huidige EN=${currentEnLists}`);

    if (nlTextBlocks !== enParas.length) {
      console.log("  ❌ FLAG — paragraph count mismatch (niet forceren)");
      console.log(`     NL ${nlTextBlocks} ≠ EN ${enParas.length}`);
      flagged++;
      flaggedKeys.push(article.key);
      console.log("");
      continue;
    }

    const mapped = mapFrBodyFromNlStructure(nlBody, enPlain);
    if (!mapped.ok) {
      console.log(`  ❌ FLAG — ${mapped.reason}`);
      flagged++;
      flaggedKeys.push(article.key);
      console.log("");
      continue;
    }

    const newEnBody = mapped.body;
    const nlSig = bodyStyleSignature(nlBody);
    const newEnSig = bodyStyleSignature(newEnBody);
    const styleMismatches = countStyleMismatches(nlBody, newEnBody);
    const enLast = lastNonEmptyText(newEnBody);
    const srcLast = enParas[enParas.length - 1] ?? "";
    const currentMm = countStyleMismatches(nlBody, currentEnBody);
    const newEnLists = countListItems(newEnBody);

    console.log(`  Block count: NL=${nlBody.length} → new EN=${newEnBody.length} (was EN=${currentEnBody.length})`);
    console.log(`  Style signature: NL  ${nlSig.slice(0, 120)}${nlSig.length > 120 ? "..." : ""}`);
    console.log(`  Style signature: EN  ${newEnSig.slice(0, 120)}${newEnSig.length > 120 ? "..." : ""}`);
    console.log(`  Signatures identical: ${nlSig === newEnSig ? "✅" : "❌"}`);
    console.log(`  Style mismatches (NL vs new EN): ${styleMismatches} (was ${currentMm})`);
    console.log(`  List-items new EN: ${newEnLists} (NL=${nlLists}) ${newEnLists === nlLists ? "✅" : "❌"}`);
    console.log(`  Slotparagraaf Herman: ${clip(srcLast)}`);
    console.log(`  Slotparagraaf new EN: ${clip(enLast)}`);
    console.log(`  Slotparagraaf match: ${clip(srcLast) === clip(enLast) ? "✅" : "❌"}`);

    console.log("  Heading + bullets (NL vs new EN):");
    let shown = 0;
    for (let i = 0; i < nlBody.length && shown < 14; i++) {
      const nl = nlBody[i]!;
      const en = newEnBody[i]!;
      if (!isNlTextBlock(nl) || !getBlockSpanText(nl)) continue;
      const nlStyle = String(nl.listItem ? `list:${nl.listItem}` : (nl.style ?? "normal"));
      const enStyle = String(en.listItem ? `list:${en.listItem}` : (en.style ?? "normal"));
      if (nlStyle === "normal" && shown >= 8) continue;
      shown++;
      const match = nlStyle === enStyle ? "✅" : "❌";
      console.log(
        `    [${i}] ${match} ${nlStyle} | NL: ${clip(getBlockSpanText(nl), 40)} | EN: ${clip(getBlockSpanText(en), 40)}`,
      );
    }

    if (
      styleMismatches === 0 &&
      nlSig === newEnSig &&
      nlBody.length === newEnBody.length &&
      newEnLists === nlLists
    ) {
      console.log("  ✅ PASS — 0 style-mismatches, structuur identiek, bullets hersteld");
      console.log(`  PATCH (dry-run): ${article.en} .set({ body })  ${currentEnBody.length} → ${newEnBody.length} blocks`);
      pass++;
      patchDocs.push(article.en);

      if (write) {
        await client.patch(article.en).set({ body: newEnBody }).commit();
        console.log(`  PATCH OK ${article.en} → body (${newEnBody.length} blocks)`);
      }
    } else {
      console.log("  ❌ FLAG — onverwachte structuur na mapping");
      flagged++;
      flaggedKeys.push(article.key);
    }

    console.log("");
  }

  console.log("--- Samenvatting ---");
  console.log(`  PASS (zou patchen): ${pass}/${ARTICLES.length}`);
  console.log(`  FLAG (geen patch):  ${flagged} → ${flaggedKeys.join(", ") || "—"}`);
  console.log(`  Velden gepatcht:    ${write ? pass : 0}  |  dry-run zou patchen: ${pass}× body (EN-docs)`);
  console.log(`  NL-velden:          0 (structuurbron)`);
  console.log(`  FR-velden:          0 (reeds HOB-62f)`);
  if (patchDocs.length) {
    console.log("  EN docs klaar voor .set({ body }):");
    for (const id of patchDocs) console.log(`    - ${id}`);
  }

  if (!write) {
    console.log("\n🛑 STOP — dry-run afgerond. Geen Sanity-write. Schrijven: npm run migrate:65-phase-2 -- --write");
  } else if (flagged > 0) {
    console.log("\nKlaar — met geflagde artikelen (niet gepatcht).");
  } else {
    console.log("\nKlaar — 3 EN bodies herbouwd (patch-only, bullets hersteld).");
  }

  if (flagged > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
