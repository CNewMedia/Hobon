import { SustainabilityTemplate } from "@/components/sustainability/SustainabilityTemplate";
import type { Locale } from "@/lib/i18n/config";
import { client } from "@/lib/sanity/client";
import { sustainabilityPageQuery } from "@/lib/sanity/queries";
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
    client.fetch(sustainabilityPageQuery, { locale }),
    getSeoDefaults(loc),
  ]);
  return buildPageMetadata({
    locale: loc,
    seo: doc?.seo ?? null,
    pathParts: [{ type: "key", key: "sustainability" }],
    defaults,
  });
}

export default async function SustainabilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const doc = await client.fetch(sustainabilityPageQuery, { locale });
  return <SustainabilityTemplate locale={locale as Locale} sustainabilityPage={doc} />;
}
