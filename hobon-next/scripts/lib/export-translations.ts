/** HOB-59 — read-only translation export helpers (Sanity → Excel rows). */

export const EXPORT_DOC_TYPES = [
  "sector",
  "product",
  "homePage",
  "aboutPage",
  "sustainabilityPage",
  "contactPage",
  "insightsOverviewPage",
  "insightArticle",
  "insightCategory",
] as const;

export type ExportDocType = (typeof EXPORT_DOC_TYPES)[number];
export type Locale = "nl" | "fr" | "en";

const HTML_TAG_RE = /<[^>]+>/;
const HTML_ENTITY_RE = /&(?:#\d+|#x[\da-f]+|\w+);/i;

export type TranslationRow = {
  referentie: string;
  paginaSectie: string;
  nl: string;
  fr: string;
  en: string;
  /** Originele waarde met HTML — alleen ingevuld als die taal HTML bevat (voor re-import). */
  nlOrigineel: string;
  frOrigineel: string;
  enOrigineel: string;
  sortType: number;
  sortPage: string;
  sortPath: string;
};

export type HtmlCellReport = {
  totalCells: number;
  byLocale: Record<Locale, number>;
  byFieldPath: { fieldPath: string; count: number }[];
};

const TYPE_ORDER: Record<ExportDocType, number> = {
  sector: 0,
  product: 1,
  homePage: 2,
  aboutPage: 3,
  sustainabilityPage: 4,
  contactPage: 5,
  insightsOverviewPage: 6,
  insightArticle: 7,
  insightCategory: 8,
};

const TYPE_LABELS: Record<ExportDocType, string> = {
  sector: "Sector",
  product: "Product",
  homePage: "Home",
  aboutPage: "Over Hobon",
  sustainabilityPage: "Duurzaamheid",
  contactPage: "Contact",
  insightsOverviewPage: "Insights overzicht",
  insightArticle: "Insight artikel",
  insightCategory: "Insight categorie",
};

const SKIP_KEYS = new Set([
  "_id",
  "_ref",
  "_type",
  "_key",
  "_rev",
  "_createdAt",
  "_updatedAt",
  "_weak",
  "slug",
  "language",
  "sortOrder",
  "showInOverview",
  "featured",
  "publishedAt",
  "color",
  "num",
  "initials",
  "icon",
  "asset",
  "id",
  "href",
  "url",
  "externalUrl",
  "imageUrl",
  "listingImageUrl",
  "heroMainImageUrl",
  "deepPhotoUrl",
  "current",
  "mediaType",
  "variant",
  "kind",
  "step",
  "buttonLink",
]);

const SKIP_SUBTREE_KEYS = new Set([
  "seo",
  "heroMedia",
  "relatedArticles",
  "relatedSectors",
  "category",
  "additionalNotes",
]);

const SKIP_STRING_SUFFIXES = ["Url", "Href"];

type PortableTextBlock = {
  _type?: string;
  style?: string;
  children?: { _type?: string; text?: string }[];
};

export function parseDocId(id: string): { locale: Locale | null; baseKey: string; docType: string } {
  const locales: Locale[] = ["nl", "fr", "en"];

  for (const locale of locales) {
    const suffix = `-${locale}`;
    if (id.endsWith(suffix)) {
      const docType = id.slice(0, -suffix.length);
      return { locale, baseKey: docType, docType };
    }

    const marker = `-${locale}-`;
    const idx = id.indexOf(marker);
    if (idx !== -1) {
      const docType = id.slice(0, idx);
      const rest = id.slice(idx + marker.length);
      return { locale, docType, baseKey: `${docType}-${rest}` };
    }
  }

  return { locale: null, baseKey: id, docType: id.split("-")[0] ?? id };
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

function shouldSkipStringKey(key: string): boolean {
  if (SKIP_KEYS.has(key)) return true;
  return SKIP_STRING_SUFFIXES.some((suffix) => key.endsWith(suffix));
}

function isPortableText(value: unknown): value is PortableTextBlock[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      (item as PortableTextBlock)._type === "block" &&
      Array.isArray((item as PortableTextBlock).children),
  );
}

export function containsHtml(text: string): boolean {
  return HTML_TAG_RE.test(text) || HTML_ENTITY_RE.test(text);
}

/** Zichtbare platte tekst voor vertalers; bewaart woordgrenzen rond verwijderde tags. */
export function stripHtmlToPlain(html: string): string {
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

function toTranslatorCell(raw: string): { plain: string; origineel: string } {
  if (!raw) return { plain: "", origineel: "" };
  if (!containsHtml(raw)) return { plain: raw, origineel: "" };
  return { plain: stripHtmlToPlain(raw), origineel: raw };
}

export function portableTextToPlain(blocks: PortableTextBlock[]): string {
  const parts: string[] = [];

  for (const block of blocks) {
    if (block._type !== "block") continue;
    const text = (block.children ?? [])
      .map((child) => (typeof child.text === "string" ? child.text : ""))
      .join("");
    if (!text.trim()) continue;

    const style = block.style ?? "normal";
    if (style === "h1" || style === "h2" || style === "h3" || style === "h4") {
      parts.push(text);
    } else if (style === "blockquote") {
      parts.push(`"${text}"`);
    } else {
      parts.push(text);
    }
  }

  return parts.join("\n\n").trim();
}

function isCtaObject(value: Record<string, unknown>): boolean {
  return typeof value.label === "string" && ("href" in value || "externalUrl" in value);
}

function isImageWithAlt(value: Record<string, unknown>): boolean {
  return "alt" in value && ("image" in value || value._type === "imageWithAlt");
}

function collectTextFields(doc: Record<string, unknown>, out: Map<string, string>, path = ""): void {
  for (const [key, value] of Object.entries(doc)) {
    if (shouldSkipStringKey(key)) continue;
    if (key.startsWith("_")) continue;
    if (SKIP_SUBTREE_KEYS.has(key)) continue;

    const fieldPath = path ? `${path}.${key}` : key;
    walkValue(value, fieldPath, out);
  }
}

function walkValue(value: unknown, fieldPath: string, out: Map<string, string>): void {
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
      walkValue(item, `${fieldPath}[${index}]`, out);
    });
    return;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;

    if (isImageWithAlt(obj)) {
      const alt = obj.alt;
      if (typeof alt === "string" && alt.trim()) {
        out.set(`${fieldPath}.alt`, alt);
      }
      return;
    }

    if (isCtaObject(obj)) {
      const label = obj.label;
      if (typeof label === "string" && label.trim()) {
        out.set(`${fieldPath}.label`, label);
      }
      return;
    }

    for (const [key, child] of Object.entries(obj)) {
      if (shouldSkipStringKey(key)) continue;
      if (SKIP_SUBTREE_KEYS.has(key)) continue;
      walkValue(child, `${fieldPath}.${key}`, out);
    }
  }
}

export function extractTextFields(doc: Record<string, unknown>): Map<string, string> {
  const fields = new Map<string, string>();
  collectTextFields(doc, fields);
  return fields;
}

function humanizeSegment(segment: string): string {
  return segment
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function humanizeFieldPath(fieldPath: string): string {
  return fieldPath
    .replace(/\[(\d+)\]/g, (_, index) => ` ${Number(index) + 1}`)
    .split(".")
    .map((part) => humanizeSegment(part.trim()))
    .join(" — ");
}

function pageTitleFromDoc(doc: Record<string, unknown> | undefined, baseKey: string): string {
  if (!doc) {
    const slugPart = baseKey.includes("-") ? baseKey.split("-").slice(1).join("-") : baseKey;
    return slugPart.replace(/-/g, " ");
  }

  const title = doc.title ?? doc.navLabel;
  if (typeof title === "string" && title.trim()) return title.trim();

  const slug = (doc.slug as { current?: string } | undefined)?.current;
  if (typeof slug === "string" && slug.trim()) return slug;

  return baseKey;
}

export function buildTranslationRows(docs: Record<string, unknown>[]): TranslationRow[] {
  type Group = {
    docType: ExportDocType;
    baseKey: string;
    byLocale: Partial<Record<Locale, { id: string; doc: Record<string, unknown> }>>;
  };

  const groups = new Map<string, Group>();

  for (const doc of docs) {
    const docType = doc._type as string;
    if (!EXPORT_DOC_TYPES.includes(docType as ExportDocType)) continue;

    const id = String(doc._id ?? "");
    const { locale, baseKey } = parseDocId(id);
    if (!locale) continue;

    const groupKey = `${docType}::${baseKey}`;
    let group = groups.get(groupKey);
    if (!group) {
      group = { docType: docType as ExportDocType, baseKey, byLocale: {} };
      groups.set(groupKey, group);
    }
    group.byLocale[locale] = { id, doc };
  }

  const rows: TranslationRow[] = [];

  for (const group of groups.values()) {
    const fieldsByLocale: Partial<Record<Locale, Map<string, string>>> = {};
    for (const locale of ["nl", "fr", "en"] as const) {
      const entry = group.byLocale[locale];
      if (entry) fieldsByLocale[locale] = extractTextFields(entry.doc);
    }

    const allPaths = new Set<string>();
    for (const map of Object.values(fieldsByLocale)) {
      if (map) for (const path of map.keys()) allPaths.add(path);
    }

    const refDocId =
      group.byLocale.nl?.id ?? group.byLocale.fr?.id ?? group.byLocale.en?.id ?? group.baseKey;
    const pageTitle = pageTitleFromDoc(group.byLocale.nl?.doc ?? group.byLocale.fr?.doc ?? group.byLocale.en?.doc, group.baseKey);
    const typeLabel = TYPE_LABELS[group.docType];

    for (const fieldPath of [...allPaths].sort()) {
      const nlCell = toTranslatorCell(fieldsByLocale.nl?.get(fieldPath) ?? "");
      const frCell = toTranslatorCell(fieldsByLocale.fr?.get(fieldPath) ?? "");
      const enCell = toTranslatorCell(fieldsByLocale.en?.get(fieldPath) ?? "");

      if (!nlCell.plain && !frCell.plain && !enCell.plain) continue;

      rows.push({
        referentie: `${refDocId}·${fieldPath}`,
        paginaSectie: `${typeLabel} · ${pageTitle} · ${humanizeFieldPath(fieldPath)}`,
        nl: nlCell.plain,
        fr: frCell.plain,
        en: enCell.plain,
        nlOrigineel: nlCell.origineel,
        frOrigineel: frCell.origineel,
        enOrigineel: enCell.origineel,
        sortType: TYPE_ORDER[group.docType],
        sortPage: pageTitle.toLowerCase(),
        sortPath: fieldPath,
      });
    }
  }

  rows.sort((a, b) => {
    if (a.sortType !== b.sortType) return a.sortType - b.sortType;
    if (a.sortPage !== b.sortPage) return a.sortPage.localeCompare(b.sortPage, "nl");
    return a.sortPath.localeCompare(b.sortPath, "nl");
  });

  return rows;
}

export function analyzeHtmlInRows(rows: TranslationRow[]): HtmlCellReport {
  const byLocale: Record<Locale, number> = { nl: 0, fr: 0, en: 0 };
  const fieldCounts = new Map<string, number>();
  let totalCells = 0;

  for (const row of rows) {
    const locales: { locale: Locale; origineel: string }[] = [
      { locale: "nl", origineel: row.nlOrigineel },
      { locale: "fr", origineel: row.frOrigineel },
      { locale: "en", origineel: row.enOrigineel },
    ];

    for (const { locale, origineel } of locales) {
      if (!origineel) continue;
      totalCells++;
      byLocale[locale]++;
      fieldCounts.set(row.sortPath, (fieldCounts.get(row.sortPath) ?? 0) + 1);
    }
  }

  const byFieldPath = [...fieldCounts.entries()]
    .map(([fieldPath, count]) => ({ fieldPath, count }))
    .sort((a, b) => b.count - a.count || a.fieldPath.localeCompare(b.fieldPath, "nl"));

  return { totalCells, byLocale, byFieldPath };
}

export function rowsWithHtml(rows: TranslationRow[]): TranslationRow[] {
  return rows.filter((row) => row.nlOrigineel || row.frOrigineel || row.enOrigineel);
}

export function formatHtmlAudit(report: HtmlCellReport): string {
  const lines = [
    `Totaal HTML-cellen: ${report.totalCells}`,
    `  NL: ${report.byLocale.nl}  |  FR: ${report.byLocale.fr}  |  EN: ${report.byLocale.en}`,
    "",
    "Velden met HTML (aantal cellen):",
  ];

  for (const { fieldPath, count } of report.byFieldPath) {
    lines.push(`  ${count}×  ${fieldPath}`);
  }

  return lines.join("\n");
}

export function formatHtmlExamples(rows: TranslationRow[], limit = 5): string {
  const examples = rowsWithHtml(rows).slice(0, limit);
  const blocks: string[] = [];

  for (const [index, row] of examples.entries()) {
    blocks.push(`--- Voorbeeld ${index + 1}: ${row.referentie} ---`);
    blocks.push(`Pagina/sectie: ${row.paginaSectie}`);

    for (const locale of ["nl", "fr", "en"] as const) {
      const origKey = `${locale}Origineel` as const;
      const origineel = row[origKey];
      if (!origineel) continue;

      const plain = row[locale];
      blocks.push(`[${locale.toUpperCase()} vóór]  ${origineel.replace(/\n/g, " ↵ ")}`);
      blocks.push(`[${locale.toUpperCase()} na]    ${plain.replace(/\n/g, " ↵ ")}`);
    }

    const origParts = [
      row.nlOrigineel ? `NL-origineel: ${row.nlOrigineel.replace(/\n/g, " ↵ ")}` : "",
      row.frOrigineel ? `FR-origineel: ${row.frOrigineel.replace(/\n/g, " ↵ ")}` : "",
      row.enOrigineel ? `EN-origineel: ${row.enOrigineel.replace(/\n/g, " ↵ ")}` : "",
    ].filter(Boolean);

    blocks.push(`[bewaard]       ${origParts.join(" | ")}`);
    blocks.push("");
  }

  return blocks.join("\n").trimEnd();
}

export function formatRowsAsTable(rows: TranslationRow[], limit?: number): string {
  const slice = limit ? rows.slice(0, limit) : rows;
  const header = ["Referentie", "Pagina/sectie", "NL", "FR", "EN"];
  const colWidths = header.map((h) => h.length);

  const data = slice.map((row) => {
    const cells = [row.referentie, row.paginaSectie, row.nl, row.fr, row.en];
    cells.forEach((cell, i) => {
      colWidths[i] = Math.max(colWidths[i], Math.min(cell.length, 80));
    });
    return cells;
  });

  const lines = [
    header.map((h, i) => h.padEnd(colWidths[i])).join(" | "),
    colWidths.map((w) => "-".repeat(w)).join("-+-"),
  ];

  for (const cells of data) {
    lines.push(
      cells
        .map((cell, i) => {
          const clipped = cell.length > 120 ? `${cell.slice(0, 117)}...` : cell;
          return clipped.replace(/\n/g, " ↵ ").padEnd(colWidths[i]);
        })
        .join(" | "),
    );
  }

  return lines.join("\n");
}
