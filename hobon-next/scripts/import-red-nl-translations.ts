/**
 * HOB-59 — Import rode NL-cellen uit klant-xlsx naar Sanity (patch-only).
 *
 * Dry-run: npm run import:red-nl
 * Write:    npm run import:red-nl -- --write
 *
 * Opties:
 *   --xlsx <pad>   (default: exports/Hobon-website-teksten-NL-FR-EN.xlsx)
 */
import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";
import {
  buildPatchValue,
  clip,
  getValueAtPath,
  readRedNlPatchesFromXlsx,
  sanityPatchPath,
  valueToComparableString,
  verifyPatchTarget,
  type RedNlPatch,
} from "./lib/import-red-nl-translations";
import { buildTranslationRows, EXPORT_DOC_TYPES } from "./lib/export-translations";
import { updateSeedFromPatches } from "./lib/update-seed-red-nl";
import { runVerificationDryRun } from "./lib/verify-red-nl-dry-run";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token =
  process.env.SANITY_API_READ_TOKEN?.trim() || process.env.SANITY_API_WRITE_TOKEN?.trim();

const DEFAULT_XLSX = path.join(process.cwd(), "exports", "Hobon-website-teksten-NL-FR-EN.xlsx");

/** Verwachte referenties — gebruikt voor verificatie-dry-run als xlsx nog geen rode cellen heeft. */
const EXPECTED_REFERENTIES = [
  "sector-nl-agro·listingPills[0]",
  "sector-nl-logistiek·listingPills[2]",
  "sector-nl-voeding·solutionCards[3].image.alt",
  "sector-nl-voeding·solutionCards[3].title",
  "sector-nl-voeding·tapeItems[5]",
  "product-nl-blaasfolies·solutionCards[3].image.alt",
  "product-nl-blaasfolies·solutionCards[3].title",
  "product-nl-pattyn·applications[1]",
  "homePage-nl·tapeItems[2]",
  "insight-nl-dunner-folie-zelfde-kwaliteit·body",
];

function parseArgs() {
  const write = process.argv.includes("--write");
  const xlsxFlagIndex = process.argv.indexOf("--xlsx");
  const xlsxPath =
    xlsxFlagIndex !== -1 && process.argv[xlsxFlagIndex + 1]
      ? path.resolve(process.argv[xlsxFlagIndex + 1]!)
      : DEFAULT_XLSX;
  return { write, xlsxPath };
}

async function fetchExportBaselineByReferentie(): Promise<Map<string, string>> {
  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: token || undefined,
    useCdn: false,
  });

  const types = EXPORT_DOC_TYPES.map((t) => `"${t}"`).join(", ");
  const docs = await client.fetch<Record<string, unknown>[]>(`*[_type in [${types}]]`);
  const rows = buildTranslationRows(docs);
  return new Map(rows.map((row) => [row.referentie, row.nl]));
}

async function fetchDocumentsById(docIds: string[]): Promise<Map<string, Record<string, unknown>>> {
  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: token || undefined,
    useCdn: false,
  });

  const docs = await client.fetch<Record<string, unknown>[]>(
    `*[_id in $ids]{...}`,
    { ids: docIds },
  );

  return new Map(docs.map((doc) => [String(doc._id), doc]));
}

function printPatchPlan(
  patches: RedNlPatch[],
  baseline: Map<string, string>,
  docs: Map<string, Record<string, unknown>>,
) {
  let pass = 0;
  let fail = 0;

  console.log(`\n=== ${patches.length} rode NL-cellen ===\n`);

  for (const [index, patch] of patches.entries()) {
    const exportWas = baseline.get(patch.referentie) ?? "";
    const doc = docs.get(patch.docId);
    const sanityRaw = doc ? getValueAtPath(doc, patch.fieldPath) : undefined;
    const sanityNow = valueToComparableString(sanityRaw);
    const verification = verifyPatchTarget(exportWas, sanityNow, patch.fieldPath);

    console.log(`${index + 1}. ${patch.referentie}`);
    console.log(`   Was (export):  ${clip(exportWas, 100)}`);
    console.log(`   Sanity nu:     ${clip(sanityNow, 100)}`);
    console.log(`   Wordt (xlsx):  ${clip(patch.wordt, 100)}`);
    console.log(
      `   Verificatie:   ${verification.ok ? "✅ PASS" : "🛑 FAIL"} — ${verification.reason}`,
    );
    console.log("");

    if (verification.ok) pass++;
    else fail++;
  }

  return { pass, fail };
}

async function applyPatches(
  patches: RedNlPatch[],
  docs: Map<string, Record<string, unknown>>,
  baseline: Map<string, string>,
) {
  if (!token) throw new Error("SANITY_API_WRITE_TOKEN required for --write");

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token,
    useCdn: false,
  });

  for (const patch of patches) {
    const exportWas = baseline.get(patch.referentie) ?? "";
    const doc = docs.get(patch.docId);
    if (!doc) throw new Error(`Document niet gevonden: ${patch.docId}`);

    const sanityRaw = getValueAtPath(doc, patch.fieldPath);
    const sanityNow = valueToComparableString(sanityRaw);
    const verification = verifyPatchTarget(exportWas, sanityNow, patch.fieldPath);
    if (!verification.ok) {
      throw new Error(`Verificatie gefaald voor ${patch.referentie}: ${verification.reason}`);
    }

    const patchValue = buildPatchValue(patch.fieldPath, patch.wordt, sanityRaw);
    const setPath = sanityPatchPath(patch.fieldPath);

    await client.patch(patch.docId).set({ [setPath]: patchValue }).commit();
    console.log(`PATCH OK ${patch.docId} → ${setPath}`);
  }
}

async function main() {
  const { write, xlsxPath } = parseArgs();

  if (!fs.existsSync(xlsxPath)) {
    throw new Error(`Xlsx niet gevonden: ${xlsxPath}`);
  }

  console.log(`HOB-59 — import rode NL-cellen (${write ? "WRITE" : "DRY-RUN"}) — ${dataset}`);
  console.log(`Bron: ${xlsxPath}\n`);

  const patches = await readRedNlPatchesFromXlsx(xlsxPath);

  if (patches.length === 0) {
    console.warn(
      "⚠️  Geen rode NL-cellen (FFFF0000) in xlsx — toon verificatie-dry-run voor de 10 verwachte velden.\n" +
        "   Voor --write: plaats het klantbestand met rode markeringen in de NL-kolom.\n",
    );

    const { pass, fail } = await runVerificationDryRun(xlsxPath, EXPECTED_REFERENTIES);
    console.log(`Verificatie: ${pass} PASS, ${fail} FAIL`);

    if (fail > 0) {
      console.error("\n🛑 STOP — verificatie gefaald.");
      process.exit(1);
    }

    console.log("\n🛑 STOP — dry-run afgerond (geen rode cellen om te patchen).");
    console.log("   Schrijven zodra klant-xlsx met rode NL-cellen beschikbaar is:");
    console.log("   npm run import:red-nl -- --write");
    console.log("   npm run import:red-nl -- --write --xlsx /pad/naar/klantbestand.xlsx");
    return;
  }

  const docIds = [...new Set(patches.map((p) => p.docId))];
  const [baseline, docs] = await Promise.all([
    fetchExportBaselineByReferentie(),
    fetchDocumentsById(docIds),
  ]);

  const { pass, fail } = printPatchPlan(patches, baseline, docs);

  console.log(`Verificatie: ${pass} PASS, ${fail} FAIL`);

  if (fail > 0) {
    console.error("\n🛑 STOP — verificatie gefaald, geen patches uitgevoerd.");
    process.exit(1);
  }

  if (!write) {
    console.log("\n🛑 STOP — dry-run afgerond. Schrijven: npm run import:red-nl -- --write");
    return;
  }

  console.log("\nSanity patches...");
  await applyPatches(patches, docs, baseline);

  console.log("\nseed.ts bijwerken...");
  const { updated, skipped } = updateSeedFromPatches(patches, baseline);
  for (const ref of updated) console.log(`  seed OK  ${ref}`);
  for (const ref of skipped) console.log(`  seed SKIP ${ref}`);

  console.log("\nVertaalexport vernieuwen...");
  const { execSync } = await import("node:child_process");
  execSync("npm run export:translations", { stdio: "inherit", cwd: process.cwd() });

  console.log("\nKlaar — alleen rode NL-velden gepatcht (geen FR/EN).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
