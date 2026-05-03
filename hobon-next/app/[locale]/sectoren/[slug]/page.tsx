import { SectorTemplate } from "@/components/sector/SectorTemplate";
import type { Locale } from "@/lib/i18n/config";
import { client } from "@/lib/sanity/client";
import { sectorBySlugQuery, sectorNavQuery } from "@/lib/sanity/queries";
import { getSeoDefaults } from "@/lib/sanity/seoDefaults";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const [doc, defaults] = await Promise.all([
    client.fetch(sectorBySlugQuery, { locale, slug }),
    getSeoDefaults(loc),
  ]);
  return buildPageMetadata({
    locale: loc,
    seo: doc?.seo ?? null,
    pathParts: [
      { type: "key", key: "sectors" },
      { type: "slug", value: slug },
    ],
    defaults,
  });
}

export default async function SectorDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [sector, navSectors] = await Promise.all([
    client.fetch(sectorBySlugQuery, { locale, slug }),
    client.fetch(sectorNavQuery, { locale }),
  ]);

  if (!sector) notFound();

  const nav = (navSectors ?? []).filter((s: { slug: string | null }) => s.slug);

  return (
    <SectorTemplate
      locale={locale as Locale}
      sector={sector}
      navSectors={nav}
      currentSlug={slug}
    />
  );
}
