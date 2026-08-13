import type { QueryParams } from "sanity";
import type { Locale } from "@/lib/i18n/config";
import { isLocale, locales } from "@/lib/i18n/config";
import type { PathPart } from "@/lib/i18n/paths";
import { segmentByLocale, type SegmentKey } from "@/lib/i18n/segments";

export type LocalizedDocType = "sector" | "product" | "insightArticle";

/** Sanity `_id` prefix — insight docs use `insight-`, not `insightArticle-`. */
const ID_PREFIX: Record<LocalizedDocType, string> = {
  sector: "sector",
  product: "product",
  insightArticle: "insight",
};

export type LocaleMappingFetcher = <T>(query: string, params?: QueryParams) => Promise<T>;

export function getLocalizedRef(currentRef: string, targetLocale: Exclude<Locale, "nl"> | Locale): string {
  if (currentRef.includes("-nl-")) return currentRef.replace("-nl-", `-${targetLocale}-`);
  if (currentRef.includes("-fr-")) return currentRef.replace("-fr-", `-${targetLocale}-`);
  if (currentRef.includes("-en-")) return currentRef.replace("-en-", `-${targetLocale}-`);
  if (currentRef.endsWith("-nl")) return currentRef.replace(/-nl$/, `-${targetLocale}`);
  if (currentRef.endsWith("-fr")) return currentRef.replace(/-fr$/, `-${targetLocale}`);
  if (currentRef.endsWith("-en")) return currentRef.replace(/-en$/, `-${targetLocale}`);
  return currentRef;
}

export function getOverviewFallbackPath(type: LocalizedDocType, locale: Locale) {
  if (type === "sector") return `/${locale}/${segmentByLocale[locale].sectors}`;
  if (type === "product") return `/${locale}/${segmentByLocale[locale].products}`;
  return `/${locale}/${segmentByLocale[locale].insights}`;
}

function patternedKey(documentType: LocalizedDocType, locale: Locale, id: string): string | null {
  const prefix = `${ID_PREFIX[documentType]}-${locale}-`;
  if (!id.startsWith(prefix)) return null;
  return id.slice(prefix.length);
}

/**
 * Resolve sibling slugs for all locales.
 * 1) translation.metadata (UUID + mixed IDs)
 * 2) patterned `_id` (`{prefix}-{locale}-{key}`)
 * Missing siblings are omitted (caller: hreflang skip / switcher → overview).
 */
export async function resolveSiblingSlugsByLocale(
  documentType: LocalizedDocType,
  sourceLocale: Locale,
  sourceSlug: string,
  fetcher: LocaleMappingFetcher,
): Promise<Partial<Record<Locale, string>>> {
  const result: Partial<Record<Locale, string>> = { [sourceLocale]: sourceSlug };

  const source = await fetcher<{ _id?: string } | null>(
    `*[_type == $type && language == $locale && slug.current == $slug][0]{_id}`,
    { type: documentType, locale: sourceLocale, slug: sourceSlug },
  );
  if (!source?._id) return result;

  const meta = await fetcher<{ translations?: { ref?: string | null }[] } | null>(
    `*[_type == "translation.metadata" && references($id)][0]{
      translations[]{ "ref": value._ref }
    }`,
    { id: source._id },
  );
  const refs = (meta?.translations ?? []).map((t) => t.ref).filter((r): r is string => Boolean(r));
  if (refs.length > 0) {
    const docs = await fetcher<Array<{ language?: string | null; slug?: string | null }>>(
      `*[_id in $refs]{ language, "slug": slug.current }`,
      { refs },
    );
    for (const doc of docs ?? []) {
      if (!doc.language || !isLocale(doc.language)) continue;
      const slug = doc.slug?.trim();
      if (slug) result[doc.language] = slug;
    }
  }

  const key = patternedKey(documentType, sourceLocale, source._id);
  if (key) {
    const missing = locales.filter((loc) => !result[loc]);
    if (missing.length > 0) {
      const ids = missing.map((loc) => `${ID_PREFIX[documentType]}-${loc}-${key}`);
      const patterned = await fetcher<Array<{ language?: string | null; slug?: string | null }>>(
        `*[_id in $ids]{ language, "slug": slug.current }`,
        { ids },
      );
      for (const doc of patterned ?? []) {
        if (!doc.language || !isLocale(doc.language)) continue;
        const slug = doc.slug?.trim();
        if (slug) result[doc.language] = slug;
      }
    }
  }

  return result;
}

export async function resolveSiblingSlug(
  documentType: LocalizedDocType,
  sourceLocale: Locale,
  sourceSlug: string,
  targetLocale: Locale,
  fetcher: LocaleMappingFetcher,
): Promise<{ slug: string } | { path: string }> {
  if (sourceLocale === targetLocale) return { slug: sourceSlug };
  const slugs = await resolveSiblingSlugsByLocale(documentType, sourceLocale, sourceSlug, fetcher);
  const slug = slugs[targetLocale];
  if (slug) return { slug };
  return { path: getOverviewFallbackPath(documentType, targetLocale) };
}

export function pathPartsByLocaleFromSlugs(
  segmentKey: SegmentKey,
  slugs: Partial<Record<Locale, string>>,
): Partial<Record<Locale, PathPart[]>> {
  const out: Partial<Record<Locale, PathPart[]>> = {};
  for (const loc of locales) {
    const slug = slugs[loc];
    if (!slug) continue;
    out[loc] = [
      { type: "key", key: segmentKey },
      { type: "slug", value: slug },
    ];
  }
  return out;
}

/** Patterned-ID lookup. Prefer `resolveSiblingSlug` for UUID + metadata docs. */
export async function getLocalizedSlug(
  documentType: LocalizedDocType,
  key: string,
  locale: Locale,
  fetcher: LocaleMappingFetcher,
): Promise<string> {
  const id = `${ID_PREFIX[documentType]}-${locale}-${key}`;
  const result = await fetcher<{ slug?: { current?: string } | null } | null>(`*[_id == $id][0]{slug}`, { id });
  const slug = result?.slug?.current?.trim();
  if (slug) return slug;
  return getOverviewFallbackPath(documentType, locale);
}

/** Patterned-ID key only. UUID docs return null — use `resolveSiblingSlug`. */
export async function getDocKeyBySlug(
  documentType: LocalizedDocType,
  locale: Locale,
  slug: string,
  fetcher: LocaleMappingFetcher,
): Promise<string | null> {
  const result = await fetcher<{ _id?: string } | null>(
    `*[_type == $type && language == $locale && slug.current == $slug][0]{_id}`,
    { type: documentType, locale, slug },
  );
  const id = result?._id;
  if (!id) return null;
  return patternedKey(documentType, locale, id);
}
