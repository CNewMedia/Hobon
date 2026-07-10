/** HOB-59 — import rode NL-cellen uit vertaal-xlsx naar Sanity (patch-only). */

import ExcelJS from "exceljs";
import { portableTextToPlain } from "./export-translations";

export type RedNlPatch = {
  referentie: string;
  docId: string;
  fieldPath: string;
  wordt: string;
  rowNumber: number;
};

export type PathVerification = {
  ok: boolean;
  reason: string;
  exportWas: string;
  sanityNow: string;
  usesIndex: boolean;
};

const RED_ARGB = new Set(["FFFF0000", "FF0000", "FFFF0000FF"]);

export function parseReferentie(referentie: string): { docId: string; fieldPath: string } {
  const sep = referentie.indexOf("·");
  if (sep === -1) {
    throw new Error(`Ongeldige referentie (verwacht docId·veldpad): ${referentie}`);
  }
  return {
    docId: referentie.slice(0, sep),
    fieldPath: referentie.slice(sep + 1),
  };
}

export function isNlDocumentId(docId: string): boolean {
  return docId.endsWith("-nl") || docId.includes("-nl-");
}

export function fieldPathUsesArrayIndex(fieldPath: string): boolean {
  return /\[\d+\]/.test(fieldPath);
}

export function isRedFontColor(color?: Partial<ExcelJS.Color>): boolean {
  if (!color) return false;
  const argb = color.argb?.toUpperCase();
  if (argb && RED_ARGB.has(argb)) return true;
  if (color.indexed === 10) return true;
  return false;
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

export function cellHasRedNlText(cell: ExcelJS.Cell): boolean {
  const argb = cell.font?.color?.argb?.toUpperCase();
  if (argb === "FFFF0000" || argb === "FF0000") return true;
  return false;
}

export async function readRedNlPatchesFromXlsx(filePath: string): Promise<RedNlPatch[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.getWorksheet("Vertalingen");
  if (!sheet) {
    throw new Error('Werkblad "Vertalingen" niet gevonden in xlsx');
  }

  const patches: RedNlPatch[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const nlCell = row.getCell(2);
    if (!cellHasRedNlText(nlCell)) return;

    const referentie = cellText(row.getCell(5)).trim();
    if (!referentie) return;

    const { docId, fieldPath } = parseReferentie(referentie);
    if (!isNlDocumentId(docId)) return;

    patches.push({
      referentie,
      docId,
      fieldPath,
      wordt: cellText(nlCell).trim(),
      rowNumber,
    });
  });

  return patches;
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
          item &&
          typeof item === "object" &&
          (item as { _type?: string })._type === "block",
      )
    ) {
      return portableTextToPlain(value as Parameters<typeof portableTextToPlain>[0]);
    }
    return value.map((item) => valueToComparableString(item)).join(" | ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
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

export function verifyPatchTarget(
  exportWas: string,
  sanityNow: string,
  fieldPath: string,
): PathVerification {
  const usesIndex = fieldPathUsesArrayIndex(fieldPath);

  if (fieldPath === "body") {
    if (exportWas === sanityNow) {
      return { ok: true, reason: "OK — body plain-text komt overeen met export-baseline", exportWas, sanityNow, usesIndex: false };
    }
    return {
      ok: false,
      reason: "MISMATCH — body gewijzigd sinds export; geen blind patchen",
      exportWas,
      sanityNow,
      usesIndex: false,
    };
  }

  if (!usesIndex) {
    if (exportWas === sanityNow) {
      return { ok: true, reason: "OK — waarde komt overeen met export-baseline", exportWas, sanityNow, usesIndex: false };
    }
    return {
      ok: false,
      reason: "MISMATCH — waarde gewijzigd sinds export",
      exportWas,
      sanityNow,
      usesIndex: false,
    };
  }

  if (exportWas === sanityNow) {
    return { ok: true, reason: "OK — index-waarde komt overeen met export-baseline", exportWas, sanityNow, usesIndex: true };
  }

  return {
    ok: false,
    reason: "MISMATCH — array-index drift? Export-baseline ≠ huidige Sanity op dit pad",
    exportWas,
    sanityNow,
    usesIndex: true,
  };
}

export function buildPatchValue(
  fieldPath: string,
  wordt: string,
  currentValue: unknown,
): unknown {
  if (fieldPath === "body") {
    if (!Array.isArray(currentValue)) {
      throw new Error("body is geen portable-text array");
    }
    const wasPlain = portableTextToPlain(currentValue as Parameters<typeof portableTextToPlain>[0]);
    const expectedPlain = wasPlain.replace(/Mlldpe/g, "mLLdpe");
    if (wordt !== expectedPlain && !wordt.includes("mLLdpe")) {
      throw new Error("body-patch: verwacht Mlldpe→mLLdpe substitutie in portable text");
    }
    return replaceInPortableText(currentValue as Record<string, unknown>[], "Mlldpe", "mLLdpe");
  }

  return wordt;
}

export function replaceInPortableText(
  blocks: Record<string, unknown>[],
  find: string,
  replace: string,
): Record<string, unknown>[] {
  return blocks.map((block) => {
    if (block._type !== "block" || !Array.isArray(block.children)) return block;
    return {
      ...block,
      children: block.children.map((child) => {
        if (!child || typeof child !== "object" || typeof (child as { text?: string }).text !== "string") {
          return child;
        }
        const text = (child as { text: string }).text;
        if (!text.includes(find)) return child;
        return { ...child, text: text.replaceAll(find, replace) };
      }),
    };
  });
}

export function sanityPatchPath(fieldPath: string): string {
  return fieldPath;
}

export function clip(text: string, max = 120): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  if (oneLine.length <= max) return oneLine;
  return `${oneLine.slice(0, max - 3)}...`;
}
