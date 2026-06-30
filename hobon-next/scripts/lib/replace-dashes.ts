/** Em/en-dash replacement — spaced dashes only; compounds (Pinch-bottom) untouched. */

export type FieldKind = "meta" | "text";

const UNICODE_DASH_RE = /[\u2013\u2014]/;
/** Only em/en dashes with whitespace on BOTH sides (losse em-dash). */
const SPACED_DASH_RE = /(\s)[\u2013\u2014](\s)/g;
const SPACED_DASH_TEST = /(\s)[\u2013\u2014](\s)/;
const NUMERIC_RANGE_RE = /(\d)\s*[\u2013\u2014]\s*(\d)/g;
const NUMERIC_RANGE_TEST = /(\d)\s*[\u2013\u2014]\s*(\d)/;
/** Leading attribution: `— Naam` or `[AI-translated] — Naam` (no space before dash). */
const LEADING_ATTR_DASH_RE = /^(\[AI-translated\]\s*)?[\u2013\u2014](\s)/;
const LEADING_ATTR_DASH_TEST = /^(\[AI-translated\]\s*)?[\u2013\u2014]\s/;

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
  "href",
  "url",
  "externalUrl",
  "asset",
  "id",
]);

const META_FIELD_KEYS = new Set([
  "metaTitle",
  "metaDescription",
  "defaultMetaTitle",
  "defaultMetaDescription",
  "titleSuffix",
  "ogTitle",
  "ogDescription",
  "shareTitle",
  "shareDescription",
  "twitterTitle",
  "twitterDescription",
  "quoteAttr",
]);

/** Subject + finite verb / new independent clause after a spaced dash (NL, EN, FR). */
const MAIN_CLAUSE_PATTERNS: RegExp[] = [
  // NL
  /^u\s+(spreekt|bent|krijgt|heeft|wilt|kunt|kan)(?=\s)/i,
  /^het\s+(is|kost)(?=\s)/i,
  /^een\s+(verkeerde|verkeerd)(?=\s)/i,
  /^een\s+\w+\s+\w+\s+(leidt|kost|betekent|veroorzaakt|zorgt)(?=\s)/i,
  // EN
  /^you\s+(speak|are|get|have|will)(?=\s)/i,
  /^it\s+(is|costs)(?=\s)/i,
  /^a\s+wrong(?=\s)/i,
  // FR
  /^vous\s+(parlez|êtes|obtenez|avez)(?=\s)/i,
  /^il\s+(est|coûte)(?=\s)/i,
  /^c['']est(?=\s)/i,
  /^une\s+mauvaise(?=\s)/i,
  // Participle-led clause (qualityLabel)
  /^(geverifieerd|verified|vérifié)(?=\s)/i,
  // Product noun sentence (chemie heroIntro — parallel NL/EN/FR)
  /^(PE[\s-]?folie|PE\s+film|film\s+PE)(?=\s)/i,
];

function isUrlLike(text: string): boolean {
  const t = text.trim();
  return /^https?:\/\//i.test(t) || /^\/[a-z]{2}\//i.test(t) || /^#[\w-]+$/.test(t);
}

function stripHtmlForAnalysis(text: string): string {
  return text.replace(/<[^>]+>/g, "").trim();
}

/** Detect a new main clause after the dash (comma-splice → period). */
function isNewMainClause(before: string, after: string): boolean {
  const afterClean = stripHtmlForAnalysis(after);
  const beforeClean = stripHtmlForAnalysis(before);

  if (MAIN_CLAUSE_PATTERNS.some((re) => re.test(afterClean))) {
    return true;
  }

  // FR heroIntro: attribute list ends, lowercase "film/folie" starts a new sentence
  if (/((bedrukt|printed|imprimé)(\s+sur\s+mesure)?)\s*$/i.test(beforeClean)) {
    if (/^(film|folie)\s/i.test(afterClean)) {
      return true;
    }
  }

  return false;
}

/** Bold label then continuation (complianceIntro: `</strong> — matériaux` → period). */
function isLabelContinuation(before: string): boolean {
  return /<\/strong>\s*$/i.test(before.trimEnd());
}

/** Quote attribution: em-dash → hyphen, never comma/period. */
function isQuoteAttribution(fieldPath: string, before: string, after: string): boolean {
  if (fieldPath.endsWith(".quoteAttr") || fieldPath === "quoteAttr") {
    return true;
  }

  const beforeTrim = before.trimEnd();
  const afterTrim = after.trimStart();

  // Closing quote + name/title
  if (/["'»]$/.test(beforeTrim) && /^[A-ZÀ-ÖØ-Þ]/.test(afterTrim)) {
    return true;
  }

  // Leading attribution: "— Naam, …" (optionally after [AI-translated])
  if (/^(\[AI-translated\]\s*)?$/.test(beforeTrim) && /^[A-ZÀ-ÖØ-Þ]/.test(afterTrim)) {
    return true;
  }

  return false;
}

/** Leading `— Naam` attribution (quoteAttr / meta). */
function replaceLeadingAttributionDash(text: string, fieldPath: string, fieldKind: FieldKind): string {
  if (!LEADING_ATTR_DASH_TEST.test(text)) {
    return text;
  }

  const isAttribution =
    fieldKind === "meta" ||
    fieldPath.includes("quoteAttr") ||
    /^(\[AI-translated\]\s*)?[\u2013\u2014]\s*[A-ZÀ-ÖØ-Þ]/.test(text);

  if (!isAttribution) {
    return text;
  }

  return text.replace(LEADING_ATTR_DASH_RE, "$1-$2");
}

/** Classify field path for replacement rule (meta → hyphen, text → comma/period). */
export function classifyFieldPath(fieldPath: string): FieldKind {
  const segments = fieldPath.split(/[.[\]]+/).filter(Boolean);
  const last = segments[segments.length - 1] ?? "";

  if (META_FIELD_KEYS.has(last)) {
    return "meta";
  }

  if (fieldPath.includes("seo.") && (last === "headline" || last === "description")) {
    return "meta";
  }

  if (last === "title" && fieldPath.includes("seo")) {
    return "meta";
  }

  return "text";
}

type ReplacementKind = "hyphen" | "period" | "comma";

function chooseReplacement(before: string, after: string, fieldPath: string, fieldKind: FieldKind): ReplacementKind {
  if (fieldKind === "meta" || isQuoteAttribution(fieldPath, before, after)) {
    return "hyphen";
  }

  const afterTrim = after.trimStart();

  if (isNewMainClause(before, after)) {
    return "period";
  }

  if (isLabelContinuation(before)) {
    return "period";
  }

  if (/^[A-ZÀ-ÖØ-Þ]/.test(afterTrim)) {
    return "period";
  }

  return "comma";
}

function replaceSpacedDashes(text: string, fieldPath: string, fieldKind: FieldKind): string {
  const re = /(\s)[\u2013\u2014](\s)/g;
  let result = "";
  let cursor = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    const dashStart = m.index;
    const dashEnd = dashStart + m[0].length;
    const before = text.slice(0, dashStart);
    const after = text.slice(dashEnd);
    const kind = chooseReplacement(before, after, fieldPath, fieldKind);

    result += text.slice(cursor, dashStart);

    if (kind === "hyphen") {
      result += `${m[1]}- `;
      cursor = dashEnd;
    } else if (kind === "comma") {
      result += ", ";
      cursor = dashEnd;
    } else {
      const afterTrim = after.trimStart();
      const lead = after.slice(0, after.length - afterTrim.length);
      if (/^[a-zà-ÿ]/.test(afterTrim)) {
        // Only replace dash + capitalize first letter; do not consume rest of string
        // (avoids duplication when multiple dashes exist in one string).
        result += `. ${lead}${afterTrim.charAt(0).toUpperCase()}`;
        cursor = dashEnd + lead.length + 1;
      } else {
        result += ". ";
        cursor = dashEnd;
      }
    }
  }

  result += text.slice(cursor);
  return result;
}

/**
 * Replace em/en dashes in user-facing text.
 * - Only spaced unicode dashes ( — ) and numeric ranges (200–3600).
 * - ASCII hyphens in compounds (Pinch-bottom, food-eisen) are never matched.
 * - [AI-translated] markers are left intact; only dashes inside the string are replaced.
 */
export function replaceDashes(text: string, fieldPath = "", kind?: FieldKind): string {
  if (!text || !containsReplaceableDash(text)) {
    return text;
  }

  if (fieldPath.endsWith(".current") || fieldPath === "slug.current") {
    return text;
  }

  if (isUrlLike(text)) {
    return text;
  }

  const fieldKind = kind ?? classifyFieldPath(fieldPath);

  let result = text.replace(NUMERIC_RANGE_RE, "$1-$2");
  result = replaceLeadingAttributionDash(result, fieldPath, fieldKind);
  result = replaceSpacedDashes(result, fieldPath, fieldKind);

  return result
    .replace(/,\s*,/g, ", ")
    .replace(/\.\s*\./g, ". ")
    .replace(/\s{2,}/g, " ")
    .replace(/ ,/g, ",")
    .replace(/ \./g, ".");
}

/** Count spaced em/en dashes in text. */
export function countSpacedDashes(text: string): number {
  const re = /(\s)[\u2013\u2014](\s)/g;
  let count = 0;
  while (re.exec(text) !== null) count++;
  // Leading dash without whitespace before (`"— Naam"` at string start)
  if (/^[\u2013\u2014]\s/.test(text)) count++;
  return count;
}

/** True when text has a spaced em-dash or numeric range dash (not word-internal). */
export function containsReplaceableDash(text: string): boolean {
  return NUMERIC_RANGE_TEST.test(text) || SPACED_DASH_TEST.test(text) || LEADING_ATTR_DASH_TEST.test(text);
}

/** @deprecated use containsReplaceableDash */
export function containsDash(text: string): boolean {
  return containsReplaceableDash(text);
}

export function shouldSkipKey(key: string, parentKey?: string): boolean {
  if (SKIP_KEYS.has(key)) return true;
  if (key === "current" && parentKey === "slug") return true;
  return false;
}

export function inferSeedFieldKind(seedContext: string): FieldKind {
  if (/metaTitle|defaultMetaTitle|metaDescription|defaultMetaDescription|titleSuffix/.test(seedContext)) {
    return "meta";
  }
  if (/quoteAttr/.test(seedContext)) {
    return "meta";
  }
  return "text";
}
