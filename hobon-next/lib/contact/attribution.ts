/** Landing-URL attribution (UTM + gclid). No PII. */

export const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
] as const;

export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];

export type AttributionFields = Partial<Record<AttributionKey, string>>;

export const ATTRIBUTION_STORAGE_KEY = "hobon_landing_attribution";

const VALUE_MAX = 200;

function cleanAttr(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, VALUE_MAX);
}

/** First-touch: only keys present in the query become fields. */
export function parseAttributionFromSearch(
  search: string | URLSearchParams,
): AttributionFields {
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;

  const out: AttributionFields = {};
  for (const key of ATTRIBUTION_KEYS) {
    const v = cleanAttr(params.get(key));
    if (v) out[key] = v;
  }
  return out;
}

export function sanitizeAttribution(raw: Record<string, unknown> | null | undefined): AttributionFields {
  if (!raw || typeof raw !== "object") return {};
  const out: AttributionFields = {};
  for (const key of ATTRIBUTION_KEYS) {
    const v = cleanAttr(raw[key]);
    if (v) out[key] = v;
  }
  return out;
}

export function hasAttribution(attr: AttributionFields | undefined): boolean {
  if (!attr) return false;
  return ATTRIBUTION_KEYS.some((k) => Boolean(attr[k]));
}

/** One PII-free log line for a successful submission. */
export function formatAttributionLogLine(meta: {
  source: string;
  locale?: string;
  attribution?: AttributionFields;
}): string {
  const parts = [`source=${meta.source}`];
  if (meta.locale) parts.push(`locale=${meta.locale}`);
  const attr = meta.attribution ?? {};
  for (const key of ATTRIBUTION_KEYS) {
    if (attr[key]) parts.push(`${key}=${attr[key]}`);
  }
  return `[contact] submit ${parts.join(" ")}`;
}
