import type { Locale } from "@/lib/i18n/config";
import { locales } from "@/lib/i18n/config";
import { segmentByLocale, type SegmentKey } from "@/lib/i18n/segments";
import { buildLocalizedPath } from "@/lib/i18n/paths";
import { resolveInternalHref } from "@/lib/sanity/resolveInternalHref";
import { defineDocuments, defineLocations } from "sanity/presentation";

const SINGLETON_PAGE_TYPES = {
  homePage: null,
  aboutPage: "about" as SegmentKey,
  sustainabilityPage: "sustainability" as SegmentKey,
  contactPage: "contact" as SegmentKey,
  productOverviewPage: "products" as SegmentKey,
  sectorOverviewPage: "sectors" as SegmentKey,
} as const;

function singletonHref(locale: Locale, type: keyof typeof SINGLETON_PAGE_TYPES): string {
  if (type === "homePage") return buildLocalizedPath(locale, []);
  const key = SINGLETON_PAGE_TYPES[type];
  return buildLocalizedPath(locale, [{ type: "key", key: key! }]);
}

export const presentationMainDocuments = defineDocuments(
  locales.flatMap((locale) => {
    const loc = locale as Locale;
    const productsSeg = segmentByLocale[loc].products;
    const sectorsSeg = segmentByLocale[loc].sectors;

    const singletonRoutes = Object.entries(SINGLETON_PAGE_TYPES).map(([type, segmentKey]) => {
      const path =
        segmentKey === null ? `/${locale}` : `/${locale}/${segmentByLocale[loc][segmentKey]}`;
      return {
        route: path,
        filter: `_type == "${type}" && language == "${locale}"`,
      };
    });

    return [
      {
        route: `/${locale}/${productsSeg}/:slug`,
        filter: `_type == "product" && language == "${locale}" && slug.current == $slug`,
      },
      {
        route: `/${locale}/${sectorsSeg}/:slug`,
        filter: `_type == "sector" && language == "${locale}" && slug.current == $slug`,
      },
      ...singletonRoutes,
    ];
  }),
);

export const presentationLocations = {
  product: defineLocations({
    select: { title: "title", slug: "slug.current", language: "language" },
    resolve: (doc) => {
      const locale = doc?.language as Locale | undefined;
      const slug = doc?.slug;
      if (!locale || !slug) return { locations: [] };
      const href = resolveInternalHref(locale, { _type: "product", slug });
      if (!href) return { locations: [] };
      return {
        locations: [{ title: doc?.title || "Product", href }],
      };
    },
  }),

  sector: defineLocations({
    select: { title: "title", slug: "slug.current", language: "language" },
    resolve: (doc) => {
      const locale = doc?.language as Locale | undefined;
      const slug = doc?.slug;
      if (!locale || !slug) return { locations: [] };
      const href = resolveInternalHref(locale, { _type: "sector", slug });
      if (!href) return { locations: [] };
      return {
        locations: [{ title: doc?.title || "Sector", href }],
      };
    },
  }),

  homePage: defineLocations({
    select: { language: "language" },
    resolve: (doc) => {
      const locale = doc?.language as Locale | undefined;
      if (!locale) return { locations: [] };
      return { locations: [{ title: "Homepage", href: singletonHref(locale, "homePage") }] };
    },
  }),

  aboutPage: defineLocations({
    select: { language: "language" },
    resolve: (doc) => {
      const locale = doc?.language as Locale | undefined;
      if (!locale) return { locations: [] };
      return { locations: [{ title: "Over", href: singletonHref(locale, "aboutPage") }] };
    },
  }),

  sustainabilityPage: defineLocations({
    select: { language: "language" },
    resolve: (doc) => {
      const locale = doc?.language as Locale | undefined;
      if (!locale) return { locations: [] };
      return {
        locations: [{ title: "Duurzaamheid", href: singletonHref(locale, "sustainabilityPage") }],
      };
    },
  }),

  contactPage: defineLocations({
    select: { language: "language" },
    resolve: (doc) => {
      const locale = doc?.language as Locale | undefined;
      if (!locale) return { locations: [] };
      return { locations: [{ title: "Contact", href: singletonHref(locale, "contactPage") }] };
    },
  }),

  productOverviewPage: defineLocations({
    select: { language: "language" },
    resolve: (doc) => {
      const locale = doc?.language as Locale | undefined;
      if (!locale) return { locations: [] };
      return {
        locations: [{ title: "Producten", href: singletonHref(locale, "productOverviewPage") }],
      };
    },
  }),

  sectorOverviewPage: defineLocations({
    select: { language: "language" },
    resolve: (doc) => {
      const locale = doc?.language as Locale | undefined;
      if (!locale) return { locations: [] };
      return {
        locations: [{ title: "Sectoren", href: singletonHref(locale, "sectorOverviewPage") }],
      };
    },
  }),
};

export function presentationPreviewOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export function presentationAllowOrigins(): string[] {
  const origin = presentationPreviewOrigin();
  return [
    "http://localhost:3000",
    "http://localhost:3333",
    origin,
    "https://hobon-next.vercel.app",
  ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i);
}
