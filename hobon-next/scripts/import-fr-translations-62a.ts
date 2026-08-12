/**
 * HOB-62a — FR-import Alta Verba (kolom FR (nieuw)), dry-run / write.
 *
 * Dry-run: npm run import:fr-62a
 * Write:    npm run import:fr-62a -- --write
 */
import path from "node:path";
import { createClient } from "@sanity/client";
import {
  buildFrPatchPlans,
  buildFrPatchValue,
  getValueAtPath,
  nlDocIdToFr,
  readFrNieuwFromXlsx,
  STRUCK_REFERENTIES,
  valueToComparableString,
  verifyFrPatchTargetHtmlAware,
  type FrPatchPlan,
} from "./lib/import-fr-translations-62a";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token =
  process.env.SANITY_API_READ_TOKEN?.trim() || process.env.SANITY_API_WRITE_TOKEN?.trim();

const DEFAULT_XLSX = path.join(process.cwd(), "exports", "Hobon-website-teksten-NL-FR-EN.xlsx");

async function fetchBaselineFrByReferentie(): Promise<Map<string, string>> {
  const exportMod = await import("./lib/export-translations");
  const { buildTranslationRows, EXPORT_DOC_TYPES } =
    (exportMod as { default?: typeof exportMod }).default ?? exportMod;

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: token || undefined,
    useCdn: false,
  });

  const types = EXPORT_DOC_TYPES.map((t: string) => `"${t}"`).join(", ");
  const docs = await client.fetch<Record<string, unknown>[]>(`*[_type in [${types}]]`);
  return new Map(buildTranslationRows(docs).map((row) => [row.referentie, row.fr]));
}

function parseArgs() {
  const write = process.argv.includes("--write");
  const xlsxFlagIndex = process.argv.indexOf("--xlsx");
  const xlsxPath =
    xlsxFlagIndex !== -1 && process.argv[xlsxFlagIndex + 1]
      ? path.resolve(process.argv[xlsxFlagIndex + 1]!)
      : DEFAULT_XLSX;
  return { write, xlsxPath };
}

function clip(text: string, max = 100): string {
  const one = text.replace(/\s+/g, " ").trim();
  if (one.length <= max) return one;
  return `${one.slice(0, max - 3)}...`;
}

function printExamples(toPatch: FrPatchPlan[]) {
  const htmlExamples = toPatch.filter((p) => p.htmlPreserve).slice(0, 5);
  const plainExamples = toPatch.filter((p) => !p.htmlPreserve).slice(0, 5);

  console.log("\n--- HTML-behoud (voorbeelden) ---");
  for (const [i, p] of htmlExamples.entries()) {
    console.log(`${i + 1}. ${p.referentie}`);
    console.log(`   Was (Sanity):     ${clip(p.sanityFrNow)}`);
    console.log(`   Wordt (plain):    ${clip(p.wordt)}`);
    console.log(`   Wordt (met HTML): ${clip(p.patchPreview)}`);
    console.log("");
  }

  console.log("--- Platte tekst (voorbeelden) ---");
  for (const [i, p] of plainExamples.entries()) {
    console.log(`${i + 1}. ${p.referentie}`);
    console.log(`   Was:   ${clip(p.sanityFrNow)}`);
    console.log(`   Wordt: ${clip(p.wordt)}`);
    console.log("");
  }
}

async function applyFrPatches(
  toPatch: FrPatchPlan[],
  frDocs: Map<string, Record<string, unknown>>,
  baselineFrByReferentie: Map<string, string>,
) {
  const writeToken = process.env.SANITY_API_WRITE_TOKEN?.trim();
  if (!writeToken) throw new Error("SANITY_API_WRITE_TOKEN required for --write");

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: writeToken,
    useCdn: false,
  });

  // Groepeer per document — patch-only .set(), geen createOrReplace
  const byDoc = new Map<string, FrPatchPlan[]>();
  for (const plan of toPatch) {
    const list = byDoc.get(plan.frDocId) ?? [];
    list.push(plan);
    byDoc.set(plan.frDocId, list);
  }

  let patchedFields = 0;

  for (const [frDocId, plans] of byDoc) {
    const doc = frDocs.get(frDocId);
    if (!doc) throw new Error(`Document niet gevonden: ${frDocId}`);

    const setPayload: Record<string, unknown> = {};

    for (const plan of plans) {
      const exportFrWas = baselineFrByReferentie.get(plan.referentie) ?? "";
      const currentValue = getValueAtPath(doc, plan.fieldPath);
      const sanityFrNow = valueToComparableString(currentValue);
      const verification = verifyFrPatchTargetHtmlAware(exportFrWas, sanityFrNow, plan.fieldPath);

      if (!verification.ok) {
        throw new Error(`Verificatie gefaald voor ${plan.referentie}: ${verification.reason}`);
      }

      setPayload[plan.fieldPath] = buildFrPatchValue(plan, currentValue);
      patchedFields++;
    }

    await client.patch(frDocId).set(setPayload).commit();
    console.log(`PATCH OK ${frDocId} → ${plans.length} veld(en)`);
  }

  return patchedFields;
}

async function main() {
  const { write, xlsxPath } = parseArgs();

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: write ? process.env.SANITY_API_WRITE_TOKEN?.trim() : token || undefined,
    useCdn: false,
  });

  console.log(`HOB-62a — FR-import (${write ? "WRITE" : "DRY-RUN"}) — ${dataset}`);
  console.log(`Bron: ${xlsxPath}`);
  console.log(`Kolom: FR (nieuw)\n`);

  const xlsxRows = await readFrNieuwFromXlsx(xlsxPath);
  const baselineFrByReferentie = await fetchBaselineFrByReferentie();

  const frDocIds = [
    ...new Set(
      xlsxRows
        .filter((r) => r.wordt && !r.struck)
        .map((r) => nlDocIdToFr(r.referentie.split("·")[0]!)),
    ),
  ];

  const frDocsList = await client.fetch<Record<string, unknown>[]>(`*[_id in $ids]{...}`, {
    ids: frDocIds,
  });
  const frDocs = new Map(frDocsList.map((d) => [String(d._id), d]));

  const { toPatch, skipped } = buildFrPatchPlans(xlsxRows, frDocs, baselineFrByReferentie);

  const skippedStrike = skipped.filter((s) => s.reason === "strike");
  const skippedMissingDoc = skipped.filter((s) => s.reason === "missing_fr_doc");
  const skippedMissingPath = skipped.filter((s) => s.reason === "missing_path");
  const skippedUnchanged = skipped.filter((s) => s.reason === "unchanged");
  const skippedSafety = skipped.filter((s) => s.reason === "safety_mismatch");

  const htmlPatchCount = toPatch.filter((p) => p.htmlPreserve).length;

  console.log("--- Doorgestreepte 8 (overslaan, 62b) ---");
  for (const ref of STRUCK_REFERENTIES) {
    const inPatch = toPatch.some((p) => p.referentie === ref);
    console.log(`  ${ref} — ${inPatch ? "⚠️ IN PATCHLIJST" : "✅ niet in patchlijst"}`);
  }

  console.log("\n--- Expliciet overslaan (62b/c) ---");
  console.log(`  Ontbrekend FR-document (62c): ${skippedMissingDoc.length}`);
  console.log(`  Ontbrekend veldpad op FR-doc (62b): ${skippedMissingPath.length}`);

  console.log("\n--- Tellingen ---");
  console.log(`Totaal te patchen (PASS): ${toPatch.length}`);
  console.log(`  waarvan HTML-behoud: ${htmlPatchCount}`);
  console.log(`FAIL (safety mismatch): ${skippedSafety.length}`);
  console.log(`Overgeslagen ongewijzigd: ${skippedUnchanged.length}`);
  console.log(`Overgeslagen strike: ${skippedStrike.length}`);

  if (skippedSafety.length) {
    console.log("\n--- FAILs (safety mismatch) ---");
    skippedSafety.forEach((s, i) => {
      console.log(`${i + 1}. ${s.referentie} — ${s.detail}`);
    });
    console.error("\n🛑 STOP — verificatie gefaald, geen patches uitgevoerd.");
    process.exit(1);
  }

  if (!write) {
    printExamples(toPatch);
    console.log("🛑 STOP — dry-run afgerond. Schrijven: npm run import:fr-62a -- --write");
    return;
  }

  console.log("\nSanity patches (patch-only .set())...");
  const patchedFields = await applyFrPatches(toPatch, frDocs, baselineFrByReferentie);
  console.log(`\nKlaar — ${patchedFields} FR-velden bijgewerkt (${toPatch.length} plannen, ${skippedMissingPath.length + skippedMissingDoc.length + skippedStrike.length} overgeslagen).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
