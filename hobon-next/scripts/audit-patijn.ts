/**
 * Audit — "Patijn" in Sanity (read-only).
 *
 *   npm run audit:patijn
 *   npm run audit:patijn -- --xlsx "exports/Hobon-website-teksten-NL-FR-EN update 7_7 2.xlsx"
 */
import { createClient } from "@sanity/client";
import path from "node:path";
import {
  parseDocId,
  portableTextToPlain,
  type Locale,
} from "./lib/export-translations";
import { readRedNlPatchesFromXlsx, clip } from "./lib/import-red-nl-translations";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token =
  process.env.SANITY_API_READ_TOKEN?.trim() || process.env.SANITY_API_WRITE_TOKEN?.trim();

const PATIJN_RE = /patijn/i;
const DEFAULT_CLIENT_XLSX = path.join(
  process.cwd(),
  "exports",
  "Hobon-website-teksten-NL-FR-EN update 7_7 2.xlsx",
);

const SKIP_KEYS = new Set([
  "_rev",
  "_createdAt",
  "_updatedAt",
  "_weak",
  "asset",
  "id",
]);

const SKIP_SUBTREE = new Set(["heroMedia"]);

function parseArgs() {
  const xlsxFlagIndex = process.argv.indexOf("--xlsx");
  const xlsxPath =
    xlsxFlagIndex !== -1 && process.argv[xlsxFlagIndex + 1]
      ? path.resolve(process.argv[xlsxFlagIndex + 1]!)
      : DEFAULT_CLIENT_XLSX;
  return { xlsxPath };
}

function isUrlLike(text: string): boolean {
  const t = text.trim();
  return (
    /^https?:\/\//i.test(t) ||
    /^\/[a-z]{2}\//i.test(t) ||
    /^#[\w-]+$/.test(t) ||
    /^mailto:/i.test(t) ||
    /^tel:/i.test(t)
  );
}

function isPortableText(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      (item as { _type?: string })._type === "block" &&
      Array.isArray((item as { children?: unknown[] }).children),
  );
}

function isCtaObject(value: Record<string, unknown>): boolean {
  return typeof value.label === "string" && ("href" in value || "externalUrl" in value);
}

function isImageWithAlt(value: Record<string, unknown>): boolean {
  return "alt" in value && ("image" in value || value._type === "imageWithAlt");
}

function walkAuditFields(
  value: unknown,
  fieldPath: string,
  out: Map<string, string>,
): void {
  if (value === null || value === undefined) return;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || isUrlLike(trimmed)) return;
    out.set(fieldPath, value);
    return;
  }

  if (typeof value === "number" || typeof value === "boolean") return;

  if (Array.isArray(value)) {
    if (value.length === 0) return;

    if (value.every((item) => typeof item === "string")) {
      value.forEach((item, index) => {
        if (typeof item === "string" && item.trim() && !isUrlLike(item)) {
          out.set(`${fieldPath}[${index}]`, item);
        }
      });
      return;
    }

    if (isPortableText(value)) {
      const plain = portableTextToPlain(value);
      if (plain) out.set(fieldPath, plain);
      return;
    }

    value.forEach((item, index) => {
      if (item && typeof item === "object" && "_ref" in item && Object.keys(item).length <= 3) {
        return;
      }
      walkAuditFields(item, `${fieldPath}[${index}]`, out);
    });
    return;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;

    if (isImageWithAlt(obj)) {
      const alt = obj.alt;
      if (typeof alt === "string" && alt.trim()) out.set(`${fieldPath}.alt`, alt);
      return;
    }

    if (isCtaObject(obj)) {
      const label = obj.label;
      if (typeof label === "string" && label.trim()) out.set(`${fieldPath}.label`, label);
      return;
    }

    for (const [key, child] of Object.entries(obj)) {
      if (SKIP_KEYS.has(key)) continue;
      if (key.startsWith("_") && key !== "_type") continue;
      if (SKIP_SUBTREE.has(key)) continue;
      walkAuditFields(child, fieldPath ? `${fieldPath}.${key}` : key, out);
    }
  }
}

function extractAllTextFields(doc: Record<string, unknown>): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(doc)) {
    if (key.startsWith("_") && key !== "_type") continue;
    if (SKIP_SUBTREE.has(key)) continue;
    walkAuditFields(value, key, out);
  }
  return out;
}

function docLanguage(doc: Record<string, unknown>): Locale | "?" {
  if (typeof doc.language === "string" && ["nl", "fr", "en"].includes(doc.language)) {
    return doc.language as Locale;
  }
  const { locale } = parseDocId(String(doc._id ?? ""));
  return locale ?? "?";
}

function isNlFrEnDoc(doc: Record<string, unknown>): boolean {
  const lang = docLanguage(doc);
  if (lang !== "?") return true;
  const id = String(doc._id ?? "");
  return id.includes("-nl-") || id.includes("-fr-") || id.includes("-en-") || /-(nl|fr|en)$/.test(id);
}

async function main() {
  const { xlsxPath } = parseArgs();

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: token || undefined,
    useCdn: false,
  });

  let redReferenties = new Set<string>();
  try {
    const redPatches = await readRedNlPatchesFromXlsx(xlsxPath);
    redReferenties = new Set(redPatches.map((p) => p.referentie));
  } catch {
    console.warn(`⚠️  Klant-xlsx niet gelezen (${xlsxPath}) — kolom "rood" = nee voor alles.\n`);
  }

  const docs = await client.fetch<Record<string, unknown>[]>(
    `*[_type != "sanity.imageAsset" && _type != "sanity.fileAsset"]`,
  );

  type Hit = {
    referentie: string;
    taal: string;
    tekst: string;
    rood: boolean;
  };

  const hits: Hit[] = [];

  for (const doc of docs) {
    if (!isNlFrEnDoc(doc)) continue;

    const docId = String(doc._id ?? "");
    const taal = docLanguage(doc);
    const fields = extractAllTextFields(doc);

    for (const [fieldPath, text] of fields) {
      if (!PATIJN_RE.test(text)) continue;
      const referentie = `${docId}·${fieldPath}`;
      hits.push({
        referentie,
        taal,
        tekst: text,
        rood: redReferenties.has(referentie),
      });
    }
  }

  hits.sort((a, b) => a.referentie.localeCompare(b.referentie, "nl"));

  console.log(`Audit "Patijn" — ${dataset} (read-only)`);
  console.log(`Documenten gescand: ${docs.length} | Treffers (NL/FR/EN): ${hits.length}\n`);

  if (hits.length === 0) {
    console.log("Geen treffers.");
    return;
  }

  for (const [index, hit] of hits.entries()) {
    console.log(`${index + 1}. ${hit.referentie}`);
    console.log(`   Taal:  ${hit.taal}`);
    console.log(`   Tekst: ${clip(hit.tekst, 200)}`);
    console.log(`   Rood in klant-xlsx: ${hit.rood ? "ja" : "nee"}`);
    console.log("");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
