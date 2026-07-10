/**
 * HOB-59 — Export visible NL/FR/EN content to Excel (read-only).
 *
 *   npm run export:translations
 *
 * Writes exports/Hobon-website-teksten-NL-FR-EN.xlsx
 */
import { createClient } from "@sanity/client";
import ExcelJS from "exceljs";
import fs from "node:fs";
import path from "node:path";
import { buildTranslationRows, EXPORT_DOC_TYPES, type TranslationRow } from "./lib/export-translations";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token =
  process.env.SANITY_API_READ_TOKEN?.trim() || process.env.SANITY_API_WRITE_TOKEN?.trim();

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token: token || undefined,
  useCdn: false,
});

const OUTPUT_PATH = path.join(process.cwd(), "exports", "Hobon-website-teksten-NL-FR-EN.xlsx");

const READONLY_HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFBFBFBF" },
};

const READONLY_CELL_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFEFEFEF" },
};

const INSTRUCTIONS = [
  "1. Vul de kolommen FR en EN in op basis van de Nederlandse tekst (NL).",
  "2. Laat de laatste twee kolommen (Referentie en Opmaak) ongemoeid — die zijn alleen voor terug-import.",
  "3. Een lege cel in FR of EN betekent: die vertaling moet nog ingevuld worden.",
];

async function fetchDocuments() {
  const types = EXPORT_DOC_TYPES.map((t) => `"${t}"`).join(", ");
  const query = `*[_type in [${types}]]`;
  return client.fetch<Record<string, unknown>[]>(query);
}

async function writeWorkbook(rows: TranslationRow[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Hobon";
  workbook.created = new Date();

  const readme = workbook.addWorksheet("Lees mij");
  readme.getColumn(1).width = 96;
  INSTRUCTIONS.forEach((text, index) => {
    const cell = readme.getCell(index + 1, 1);
    cell.value = text;
    cell.alignment = { wrapText: true, vertical: "top" };
    cell.font = { size: 12 };
  });

  const sheet = workbook.addWorksheet("Vertalingen");
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const headers = [
    "Pagina/sectie",
    "NL",
    "FR",
    "EN",
    "Referentie (niet bewerken)",
    "Opmaak (origineel NL) (niet bewerken)",
  ];

  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle", wrapText: true };

  for (let col = 1; col <= headers.length; col++) {
    const cell = headerRow.getCell(col);
    if (col >= 5) {
      cell.fill = READONLY_HEADER_FILL;
    }
  }

  for (const row of rows) {
    const dataRow = sheet.addRow([
      row.paginaSectie,
      row.nl,
      row.fr,
      row.en,
      row.referentie,
      row.nlOrigineel,
    ]);
    dataRow.alignment = { vertical: "top", wrapText: true };
    dataRow.getCell(5).fill = READONLY_CELL_FILL;
    dataRow.getCell(6).fill = READONLY_CELL_FILL;
  }

  sheet.columns = [
    { width: 56 },
    { width: 64 },
    { width: 64 },
    { width: 64 },
    { width: 48 },
    { width: 52 },
  ];

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  await workbook.xlsx.writeFile(OUTPUT_PATH);
}

async function main() {
  if (!token) {
    console.warn(
      "Geen SANITY_API_READ_TOKEN of SANITY_API_WRITE_TOKEN — probeert anonieme read (kan falen op production).",
    );
  }

  console.log(`HOB-59 — vertaalexport (${dataset})`);
  console.log(`Documenttypes: ${EXPORT_DOC_TYPES.join(", ")}\n`);

  const docs = await fetchDocuments();
  console.log(`Opgehaald: ${docs.length} documenten`);

  const rows = buildTranslationRows(docs);
  await writeWorkbook(rows);

  console.log(`\nTotaal rijen: ${rows.length}`);
  console.log(`Rijen met NL-opmaak: ${rows.filter((r) => r.nlOrigineel).length}`);
  console.log(`\nDefinitief bestand:\n${OUTPUT_PATH}`);
  console.log("(read-only — geen Sanity-writes)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
