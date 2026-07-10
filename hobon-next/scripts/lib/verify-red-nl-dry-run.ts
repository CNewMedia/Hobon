/**
 * HOB-59 — verificatie dry-run wanneer xlsx nog geen rode cellen heeft.
 * Wordt aangeroepen door import-red-nl-translations.ts als fallback.
 */
import { createClient } from "@sanity/client";
import ExcelJS from "exceljs";
import {
  cellText,
  clip,
  getValueAtPath,
  parseReferentie,
  valueToComparableString,
  verifyPatchTarget,
} from "./import-red-nl-translations";
import { buildTranslationRows, EXPORT_DOC_TYPES } from "./export-translations";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token =
  process.env.SANITY_API_READ_TOKEN?.trim() || process.env.SANITY_API_WRITE_TOKEN?.trim();

export async function readNlValuesFromXlsxByReferentie(
  filePath: string,
): Promise<Map<string, string>> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.getWorksheet("Vertalingen");
  if (!sheet) throw new Error('Werkblad "Vertalingen" niet gevonden');

  const map = new Map<string, string>();
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const referentie = cellText(row.getCell(5)).trim();
    if (!referentie) return;
    map.set(referentie, cellText(row.getCell(2)).trim());
  });
  return map;
}

export async function runVerificationDryRun(xlsxPath: string, referenties: string[]) {
  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: token || undefined,
    useCdn: false,
  });

  const types = EXPORT_DOC_TYPES.map((t) => `"${t}"`).join(", ");
  const docs = await client.fetch<Record<string, unknown>[]>(`*[_type in [${types}]]`);
  const baseline = new Map(buildTranslationRows(docs).map((r) => [r.referentie, r.nl]));
  const xlsxNl = await readNlValuesFromXlsxByReferentie(xlsxPath);

  const docIds = [...new Set(referenties.map((r) => parseReferentie(r).docId))];
  const liveDocs = await client.fetch<Record<string, unknown>[]>(`*[_id in $ids]{...}`, {
    ids: docIds,
  });
  const byId = new Map(liveDocs.map((d) => [String(d._id), d]));

  let pass = 0;
  let fail = 0;

  console.log(`\n=== Verificatie dry-run (${referenties.length} velden) ===\n`);

  for (const [index, referentie] of referenties.entries()) {
    const { docId, fieldPath } = parseReferentie(referentie);
    const exportWas = baseline.get(referentie) ?? "";
    const raw = getValueAtPath(byId.get(docId) ?? {}, fieldPath);
    const sanityNow = valueToComparableString(raw);
    const verification = verifyPatchTarget(exportWas, sanityNow, fieldPath);
    const xlsxValue = xlsxNl.get(referentie) ?? "(niet in xlsx)";
    const wordtLabel =
      fieldPath === "body" && xlsxValue.includes("Mlldpe")
        ? "Mlldpe → mLLdpe (portable text)"
        : fieldPath === "body" && xlsxValue.includes("mLLdpe")
          ? "Mlldpe → mLLdpe (portable text)"
          : clip(xlsxValue, 95);

    console.log(`${index + 1}. ${referentie}`);
    console.log(`   Was (export):  ${clip(exportWas, 95)}`);
    console.log(`   Wordt (xlsx):  ${wordtLabel}`);
    console.log(
      `   Verificatie:   ${verification.ok ? "✅ PASS" : "🛑 FAIL"} — ${verification.reason}`,
    );
    if (!verification.ok) {
      console.log(`   Sanity nu:     ${clip(sanityNow, 95)}`);
    }
    console.log("");

    if (verification.ok) pass++;
    else fail++;
  }

  return { pass, fail };
}
