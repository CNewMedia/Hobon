import { ProductTemplate } from "@/components/product/ProductTemplate";
import type { Locale } from "@/lib/i18n/config";
import { fetchSanity } from "@/lib/sanity/fetchSanity";
import {
  pathPartsByLocaleFromSlugs,
  resolveSiblingSlugsByLocale,
} from "@/lib/sanity/locale-mapping";
import { productBySlugQuery } from "@/lib/sanity/queries";
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
  const [doc, defaults, siblingSlugs] = await Promise.all([
    fetchSanity(productBySlugQuery, { locale, slug }),
    getSeoDefaults(loc),
    resolveSiblingSlugsByLocale("product", loc, slug, fetchSanity),
  ]);
  return buildPageMetadata({
    locale: loc,
    seo: doc?.seo ?? null,
    pathParts: [
      { type: "key", key: "products" },
      { type: "slug", value: slug },
    ],
    languagePathParts: pathPartsByLocaleFromSlugs("products", siblingSlugs),
    defaults,
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const doc = await fetchSanity(productBySlugQuery, { locale, slug });
  if (!doc) notFound();

  return <ProductTemplate locale={loc} product={doc} />;
}
