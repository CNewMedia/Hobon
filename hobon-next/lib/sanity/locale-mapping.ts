import type { Locale } from "@/lib/i18n/config";
import { segmentByLocale } from "@/lib/i18n/segments";

export type LocalizedDocType = "sector" | "product" | "insightArticle";

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

export async function getLocalizedSlug(
  documentType: LocalizedDocType,
  key: string,
  locale: Locale,
  fetcher: (query: string, params: Record<string, string>) => Promise<{ slug?: { current?: string } | null } | null>,
): Promise<string> {
  const id = `${documentType}-${locale}-${key}`;
  const result = await fetcher(`*[_id == $id][0]{slug}`, { id });
  const slug = result?.slug?.current?.trim();
  if (slug) return slug;
  return getOverviewFallbackPath(documentType, locale);
}

export async function getDocKeyBySlug(
  documentType: LocalizedDocType,
  locale: Locale,
  slug: string,
  fetcher: (query: string, params: Record<string, string>) => Promise<{ _id?: string } | null>,
): Promise<string | null> {
  const result = await fetcher(`*[_type == $type && language == $locale && slug.current == $slug][0]{_id}`, {
    type: documentType,
    locale,
    slug,
  });
  const id = result?._id;
  if (!id) return null;
  const prefix = `${documentType}-${locale}-`;
  if (!id.startsWith(prefix)) return null;
  return id.slice(prefix.length);
}
