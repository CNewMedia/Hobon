/** HOB-62a — FR-import helpers (Alta Verba, kolom FR (nieuw)). */

import ExcelJS from "exceljs";

const HTML_TAG_RE = /<[^>]+>/;
const HTML_ENTITY_RE = /&(?:#\d+|#x[\da-f]+|\w+);/i;

function containsHtml(text: string): boolean {
  return HTML_TAG_RE.test(text) || HTML_ENTITY_RE.test(text);
}

function stripHtmlToPlain(html: string): string {
  let text = html;
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/(p|div|li|h[1-6])>/gi, "\n");
  text = text.replace(/<[^>]+>/g, "");
  text = text.replace(/&nbsp;/gi, " ");
  text = text.replace(/&amp;/gi, "&");
  text = text.replace(/&lt;/gi, "<");
  text = text.replace(/&gt;/gi, ">");
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
  text = text.replace(/&#x([\da-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  text = text.replace(/[ \t]+\n/g, "\n");
  text = text.replace(/\n[ \t]+/g, "\n");
  text = text.replace(/[ \t]{2,}/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

function portableTextToPlain(blocks: { _type?: string; children?: { text?: string }[] }[]): string {
  const parts: string[] = [];
  for (const block of blocks) {
    if (block._type !== "block") continue;
    const text = (block.children ?? [])
      .map((child) => (typeof child.text === "string" ? child.text : ""))
      .join("");
    if (text.trim()) parts.push(text);
  }
  return parts.join("\n\n").trim();
}

export function parseReferentie(referentie: string): { docId: string; fieldPath: string } {
  const sep = referentie.indexOf("·");
  if (sep === -1) throw new Error(`Ongeldige referentie: ${referentie}`);
  return { docId: referentie.slice(0, sep), fieldPath: referentie.slice(sep + 1) };
}

export function cellText(cell: ExcelJS.Cell): string {
  const value = cell.value;
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object" && "richText" in value && Array.isArray(value.richText)) {
    return value.richText.map((part) => part.text ?? "").join("");
  }
  if (typeof value === "object" && "text" in value && typeof value.text === "string") {
    return value.text;
  }
  return cell.text ?? String(value);
}

export function valueToComparableString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (
      value.length > 0 &&
      value.every(
        (item) =>
          item && typeof item === "object" && (item as { _type?: string })._type === "block",
      )
    ) {
      return portableTextToPlain(value as Parameters<typeof portableTextToPlain>[0]);
    }
    return value.map((item) => valueToComparableString(item)).join(" | ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

type PathToken = { type: "key"; key: string } | { type: "index"; index: number };

function tokenizeFieldPath(fieldPath: string): PathToken[] {
  const tokens: PathToken[] = [];
  const re = /([^[.\]]+)|\[(\d+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(fieldPath)) !== null) {
    if (match[1]) tokens.push({ type: "key", key: match[1] });
    if (match[2]) tokens.push({ type: "index", index: Number(match[2]) });
  }
  return tokens;
}

export function getValueAtPath(doc: Record<string, unknown>, fieldPath: string): unknown {
  const tokens = tokenizeFieldPath(fieldPath);
  let current: unknown = doc;
  for (const token of tokens) {
    if (current == null) return undefined;
    if (token.type === "key") {
      if (typeof current !== "object" || Array.isArray(current)) return undefined;
      current = (current as Record<string, unknown>)[token.key];
      continue;
    }
    if (!Array.isArray(current)) return undefined;
    current = current[token.index];
  }
  return current;
}

export const FR_HEADER = "FR (nieuw)";
export const REFERENTIE_HEADER = "Referentie (niet bewerken)";
export const OPMAAK_HEADER_PREFIX = "Opmaak";

/** Doorgestreept — overslaan (62b). */
export const STRUCK_REFERENTIES = [
  "sector-nl-agro·solutionCards[0].tags[1]",
  "sector-nl-agro·solutionCards[3].title",
  "sector-nl-agro·tapeItems[0]",
  "sector-nl-chemie·deepFaqs[1].title",
  "sector-nl-chemie·problemBand[0].description",
  "sector-nl-chemie·problemBand[0].title",
  "sector-nl-chemie·tapeItems[6]",
  "product-nl-pattyn·applications[1]",
] as const;

export type FrXlsxRow = {
  referentie: string;
  wordt: string;
  opmaakNl: string;
  struck: boolean;
  rowNumber: number;
};

export type FrPatchPlan = {
  referentie: string;
  frDocId: string;
  fieldPath: string;
  wordt: string;
  opmaakNl: string;
  sanityFrNow: string;
  exportFrWas: string;
  htmlPreserve: boolean;
  patchPreview: string;
};

export type FrSkipReason =
  | "strike"
  | "unchanged"
  | "missing_fr_doc"
  | "missing_path"
  | "safety_mismatch";

export function nlDocIdToFr(nlDocId: string): string {
  if (nlDocId.endsWith("-nl")) return nlDocId.slice(0, -3) + "-fr";
  return nlDocId.replace("-nl-", "-fr-");
}

/** Normaliseer voor vergelijking: strip HTML, br→newline, &nbsp;→spatie, collapse whitespace. */
export function normalizeForCompare(text: string): string {
  if (!text) return "";
  return stripHtmlToPlain(text).replace(/\s+/g, " ").trim();
}

export function cellIsStruck(cell: ExcelJS.Cell): boolean {
  const font = cell.font;
  return Boolean(font?.strike || font?.strikethrough || (font as { strikeThrough?: boolean })?.strikeThrough);
}

export function verifyFrPatchTargetHtmlAware(
  exportFrWas: string,
  sanityFrNow: string,
  fieldPath: string,
): { ok: boolean; reason: string } {
  const exportNorm = normalizeForCompare(exportFrWas);
  const sanityNorm = normalizeForCompare(sanityFrNow);

  if (fieldPath === "body") {
    if (exportNorm === sanityNorm) {
      return { ok: true, reason: "OK — body plain-text komt overeen met export-baseline (HTML-aware)" };
    }
    return {
      ok: false,
      reason: "MISMATCH — body gewijzigd sinds export (HTML-aware)",
    };
  }

  if (exportNorm === sanityNorm) {
    return { ok: true, reason: "OK — genormaliseerde waarde komt overeen met export-baseline" };
  }

  return {
    ok: false,
    reason: "MISMATCH — waarde gewijzigd sinds export (genormaliseerd)",
  };
}

export function needsHtmlPreserve(sanityFrNow: string, opmaakNl: string): boolean {
  return containsHtml(sanityFrNow) || containsHtml(opmaakNl);
}

/**
 * Voor dry-run: schat patch-waarde met behoud van HTML-structuur.
 * Gebruikt NL-opmaak-sjabloon + FR-tekst; valt terug op bestaande Sanity HTML-shell.
 */
export function buildHtmlPreservePreview(
  sanityFrNow: string,
  opmaakNl: string,
  wordtPlain: string,
): string {
  if (containsHtml(sanityFrNow)) {
    return applyFrTextToHtmlShell(sanityFrNow, wordtPlain);
  }
  if (containsHtml(opmaakNl)) {
    return applyFrTextToHtmlShell(opmaakNl, wordtPlain);
  }
  return wordtPlain;
}

function applyFrTextToHtmlShell(htmlShell: string, wordtPlain: string): string {
  const plainShell = stripHtmlToPlain(htmlShell);
  if (!plainShell.trim()) return wordtPlain;

  // Enkelvoudige <strong>…</strong> rond eerste zin/deel (veelvoorkomend patroon).
  const strongMatch = htmlShell.match(/^<strong>([\s\S]*?)<\/strong>([\s\S]*)$/i);
  if (strongMatch) {
    const restShell = stripHtmlToPlain(strongMatch[2] ?? "").trim();
    const wordtParts = wordtPlain.split(/(?<=[.!?])\s+/);
    const strongFr = wordtParts[0]?.trim() ?? wordtPlain;
    const restFr = wordtParts.slice(1).join(" ").trim();

    if (restShell && restFr) {
      return `<strong>${strongFr}</strong>${restFr.startsWith(" ") ? "" : " "}${restFr}`;
    }
    return `<strong>${strongFr}</strong>`;
  }

  // <br> in sjabloon: behoud line breaks op dezelfde posities als in FR-tekst
  if (/<br\s*\/?>/i.test(htmlShell)) {
    const lines = wordtPlain.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1) return lines.join("<br>");
  }

  // Fallback: behoud tags uit shell, vervang inner text globaal
  if (htmlShell !== plainShell) {
    return htmlShell.replace(plainShell, wordtPlain);
  }

  return wordtPlain;
}

export async function readFrNieuwFromXlsx(filePath: string): Promise<FrXlsxRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.getWorksheet("Vertalingen");
  if (!sheet) throw new Error('Werkblad "Vertalingen" niet gevonden');

  const headerRow = sheet.getRow(1);
  let frCol = -1;
  let referentieCol = -1;
  let opmaakCol = -1;

  for (let c = 1; c <= headerRow.cellCount; c++) {
    const label = cellText(headerRow.getCell(c)).trim();
    if (label === FR_HEADER) frCol = c;
    if (label === REFERENTIE_HEADER) referentieCol = c;
    if (label.startsWith(OPMAAK_HEADER_PREFIX)) opmaakCol = c;
  }

  if (frCol === -1 || referentieCol === -1) {
    throw new Error(`Kolom mapping faalt: frCol=${frCol}, referentieCol=${referentieCol}`);
  }

  const rows: FrXlsxRow[] = [];
  const maxRow = sheet.actualRowCount || sheet.rowCount;

  for (let r = 2; r <= maxRow; r++) {
    const row = sheet.getRow(r);
    const referentie = cellText(row.getCell(referentieCol)).trim();
    if (!referentie) continue;

    const frCell = row.getCell(frCol);
    rows.push({
      referentie,
      wordt: cellText(frCell).trim(),
      opmaakNl: opmaakCol > 0 ? cellText(row.getCell(opmaakCol)).trim() : "",
      struck: cellIsStruck(frCell),
      rowNumber: r,
    });
  }

  return rows;
}

export function pathExists(doc: Record<string, unknown>, fieldPath: string): boolean {
  return getValueAtPath(doc, fieldPath) !== undefined;
}

export function buildFrPatchPlans(
  rows: FrXlsxRow[],
  frDocs: Map<string, Record<string, unknown>>,
  baselineFrByReferentie: Map<string, string>,
): {
  toPatch: FrPatchPlan[];
  skipped: { referentie: string; reason: FrSkipReason; detail?: string }[];
} {
  const toPatch: FrPatchPlan[] = [];
  const skipped: { referentie: string; reason: FrSkipReason; detail?: string }[] = [];

  for (const row of rows) {
    if (row.struck || STRUCK_REFERENTIES.includes(row.referentie as (typeof STRUCK_REFERENTIES)[number])) {
      skipped.push({ referentie: row.referentie, reason: "strike" });
      continue;
    }

    if (!row.wordt) continue;

    const { docId: nlDocId, fieldPath } = parseReferentie(row.referentie);
    const frDocId = nlDocIdToFr(nlDocId);
    const doc = frDocs.get(frDocId);

    if (!doc) {
      skipped.push({
        referentie: row.referentie,
        reason: "missing_fr_doc",
        detail: `Geen FR-document: ${frDocId}`,
      });
      continue;
    }

    if (!pathExists(doc, fieldPath)) {
      skipped.push({
        referentie: row.referentie,
        reason: "missing_path",
        detail: `${frDocId}·${fieldPath}`,
      });
      continue;
    }

    const sanityFrNow = valueToComparableString(getValueAtPath(doc, fieldPath));
    const exportFrWas = baselineFrByReferentie.get(row.referentie) ?? "";

    if (normalizeForCompare(row.wordt) === normalizeForCompare(sanityFrNow)) {
      skipped.push({ referentie: row.referentie, reason: "unchanged" });
      continue;
    }

    const verification = verifyFrPatchTargetHtmlAware(exportFrWas, sanityFrNow, fieldPath);
    if (!verification.ok) {
      skipped.push({
        referentie: row.referentie,
        reason: "safety_mismatch",
        detail: verification.reason,
      });
      continue;
    }

    const htmlPreserve = needsHtmlPreserve(sanityFrNow, row.opmaakNl);
    const patchPreview = htmlPreserve
      ? buildHtmlPreservePreview(sanityFrNow, row.opmaakNl, row.wordt)
      : row.wordt;

    toPatch.push({
      referentie: row.referentie,
      frDocId,
      fieldPath,
      wordt: row.wordt,
      opmaakNl: row.opmaakNl,
      sanityFrNow,
      exportFrWas,
      htmlPreserve,
      patchPreview,
    });
  }

  return { toPatch, skipped };
}

function isPortableText(value: unknown): value is Record<string, unknown>[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        (item as { _type?: string })._type === "block",
    )
  );
}

function randomKey(): string {
  return Math.random().toString(36).slice(2, 12);
}

/** Vervang portable-text inhoud; behoud block/spans-structuur per paragraaf. */
export function replacePortableTextBody(
  blocks: Record<string, unknown>[],
  newPlain: string,
): Record<string, unknown>[] {
  const paragraphs = newPlain.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return blocks;

  const blockTemplates = blocks.filter((b) => b._type === "block");
  if (blockTemplates.length === 0) {
    return [
      {
        _type: "block",
        _key: randomKey(),
        style: "normal",
        markDefs: [],
        children: [{ _type: "span", _key: randomKey(), marks: [], text: newPlain.trim() }],
      },
    ];
  }

  return paragraphs.map((para, index) => {
    const template = blockTemplates[Math.min(index, blockTemplates.length - 1)]!;
    const children = Array.isArray(template.children) ? template.children : [];
    const firstChild =
      children[0] && typeof children[0] === "object"
        ? (children[0] as Record<string, unknown>)
        : { _type: "span", _key: randomKey(), marks: [], text: "" };

    return {
      ...template,
      _key: typeof template._key === "string" ? template._key : randomKey(),
      children: [{ ...firstChild, text: para }],
    };
  });
}

export function buildFrPatchValue(plan: FrPatchPlan, currentValue: unknown): unknown {
  const text = plan.htmlPreserve ? plan.patchPreview : plan.wordt;

  if (plan.fieldPath === "body" || isPortableText(currentValue)) {
    if (!isPortableText(currentValue)) {
      throw new Error(`Verwacht portable text op ${plan.referentie}`);
    }
    return replacePortableTextBody(currentValue, text);
  }

  return text;
}
