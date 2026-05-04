import { ListingTemplate } from "@/components/listing/ListingTemplate";
import type { Locale } from "@/lib/i18n/config";
import { client } from "@/lib/sanity/client";
import { productOverviewQuery, productsListingQuery } from "@/lib/sanity/queries";
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
    client.fetch(productOverviewQuery, { locale }),
    getSeoDefaults(loc),
  ]);
  return buildPageMetadata({
    locale: loc,
    seo: doc?.seo ?? null,
    pathParts: [{ type: "key", key: "products" }],
    defaults,
  });
}

export default async function ProductsOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;
  const [overview, products] = await Promise.all([
    client.fetch(productOverviewQuery, { locale }),
    client.fetch(productsListingQuery, { locale }),
  ]);

  if (!overview) {
    console.warn(`[producten/overview] Missing productOverviewPage for locale=${locale}`);
  }

  return (
    <ListingTemplate
      locale={loc}
      overview={overview}
      items={products ?? []}
      variant="products"
      pathKey="products"
      itemCountAttr="data-pc-count"
    />
  );
}
