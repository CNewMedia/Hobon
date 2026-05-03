import type { Locale } from "@/lib/i18n/config";
import { buildLocalizedPath, type PathPart } from "@/lib/i18n/paths";

export type InternalLinkTarget = {
  _type?: string;
  slug?: string | null;
} | null;

export function resolveInternalHref(locale: Locale, doc: InternalLinkTarget): string | null {
  if (!doc?._type) return null;

  const slug = doc.slug ?? undefined;

  switch (doc._type) {
    case "homePage":
      return buildLocalizedPath(locale, []);
    case "aboutPage":
      return buildLocalizedPath(locale, [{ type: "key", key: "about" }]);
    case "sustainabilityPage":
      return buildLocalizedPath(locale, [{ type: "key", key: "sustainability" }]);
    case "contactPage":
      return buildLocalizedPath(locale, [{ type: "key", key: "contact" }]);
    case "productOverviewPage":
      return buildLocalizedPath(locale, [{ type: "key", key: "products" }]);
    case "sectorOverviewPage":
      return buildLocalizedPath(locale, [{ type: "key", key: "sectors" }]);
    case "insightsOverviewPage":
      return buildLocalizedPath(locale, [{ type: "key", key: "insights" }]);
    case "sector":
      if (!slug) return null;
      return buildLocalizedPath(locale, [
        { type: "key", key: "sectors" },
        { type: "slug", value: slug },
      ]);
    case "product":
      if (!slug) return null;
      return buildLocalizedPath(locale, [
        { type: "key", key: "products" },
        { type: "slug", value: slug },
      ]);
    case "insightArticle":
      if (!slug) return null;
      return buildLocalizedPath(locale, [
        { type: "key", key: "insights" },
        { type: "slug", value: slug },
      ]);
    default:
      return null;
  }
}

/** Strip locale prefix for tracking override matching: `/nl/contact` → `/contact` */
export function pathnameWithoutLocale(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length && ["nl", "fr", "en"].includes(parts[0])) {
    return "/" + parts.slice(1).join("/");
  }
  return pathname || "/";
}
