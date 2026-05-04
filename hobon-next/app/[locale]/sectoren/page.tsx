import { ListingTemplate } from "@/components/listing/ListingTemplate";
import type { Locale } from "@/lib/i18n/config";
import { client } from "@/lib/sanity/client";
import { sectorOverviewQuery, sectorsListingQuery } from "@/lib/sanity/queries";
import { getSeoDefaults } from "@/lib/sanity/seoDefaults";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;
  const [doc, defaults] = await Promise.all([
    client.fetch(sectorOverviewQuery, { locale }),
    getSeoDefaults(loc),
  ]);
  return buildPageMetadata({
    locale: loc,
    seo: doc?.seo ?? null,
    pathParts: [{ type: "key", key: "sectors" }],
    defaults,
  });
}

export default async function SectorsOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;
  const [overview, sectors] = await Promise.all([
    client.fetch(sectorOverviewQuery, { locale }),
    client.fetch(sectorsListingQuery, { locale }),
  ]);

  if (!overview) {
    console.warn(`[sectoren/overview] Missing sectorOverviewPage for locale=${locale}`);
  }

  return (
    <ListingTemplate
      locale={loc}
      overview={overview}
      items={sectors ?? []}
      variant="sectors"
      pathKey="sectors"
      itemCountAttr="data-sol-count"
    />
  );
}
