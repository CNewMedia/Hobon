import { SectorTemplate } from "@/components/sector/SectorTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/lib/i18n/config";
import { fetchSanity } from "@/lib/sanity/fetchSanity";
import {
  pathPartsByLocaleFromSlugs,
  resolveSiblingSlugsByLocale,
} from "@/lib/sanity/locale-mapping";
import { sectorBySlugQuery, sectorNavQuery } from "@/lib/sanity/queries";
import { getSeoDefaults } from "@/lib/sanity/seoDefaults";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/structuredData";
import { notFound } from "next/navigation";

const sectorsCrumb: Record<Locale, string> = {
  nl: "Sectoren",
  fr: "Secteurs",
  en: "Sectors",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const [doc, defaults, siblingSlugs] = await Promise.all([
    fetchSanity(sectorBySlugQuery, { locale, slug }),
    getSeoDefaults(loc),
    resolveSiblingSlugsByLocale("sector", loc, slug, fetchSanity),
  ]);
  return buildPageMetadata({
    locale: loc,
    seo: doc?.seo ?? null,
    pathParts: [
      { type: "key", key: "sectors" },
      { type: "slug", value: slug },
    ],
    languagePathParts: pathPartsByLocaleFromSlugs("sectors", siblingSlugs),
    defaults,
  });
}

export default async function SectorDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const [sector, navSectors] = await Promise.all([
    fetchSanity(sectorBySlugQuery, { locale, slug }),
    fetchSanity(sectorNavQuery, { locale }),
  ]);

  if (!sector) notFound();

  const nav = (navSectors ?? []).filter((s: { slug: string | null }) => s.slug);
  const title = sector.title?.trim() || sector.heroHeadline?.trim() || slug;
  const crumbLd = breadcrumbJsonLd(loc, [
    { name: "Hobon", pathParts: [] },
    { name: sectorsCrumb[loc], pathParts: [{ type: "key", key: "sectors" }] },
    {
      name: title,
      pathParts: [
        { type: "key", key: "sectors" },
        { type: "slug", value: slug },
      ],
    },
  ]);

  return (
    <>
      <JsonLd data={crumbLd} />
      <SectorTemplate locale={loc} sector={sector} navSectors={nav} currentSlug={slug} />
    </>
  );
}
