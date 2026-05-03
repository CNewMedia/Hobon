import { InsightsOverviewTemplate } from "@/components/insights/InsightsOverviewTemplate";
import type { Locale } from "@/lib/i18n/config";
import { client } from "@/lib/sanity/client";
import {
  insightCategoriesQuery,
  insightsForLocaleQuery,
  insightsOverviewPageQuery,
} from "@/lib/sanity/queries";
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
    client.fetch(insightsOverviewPageQuery, { locale }),
    getSeoDefaults(loc),
  ]);
  return buildPageMetadata({
    locale: loc,
    seo: doc?.seo ?? null,
    pathParts: [{ type: "key", key: "insights" }],
    defaults,
  });
}

export default async function InsightsOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;
  const [page, articles, categories] = await Promise.all([
    client.fetch(insightsOverviewPageQuery, { locale: loc }),
    client.fetch(insightsForLocaleQuery, { locale: loc }),
    client.fetch(insightCategoriesQuery, { locale: loc }),
  ]);

  return (
    <InsightsOverviewTemplate locale={loc} page={page} articles={articles ?? []} categories={categories ?? []} />
  );
}
