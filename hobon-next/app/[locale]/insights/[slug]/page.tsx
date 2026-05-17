import { InsightDetailTemplate } from "@/components/insights/InsightDetailTemplate";
import type { Locale } from "@/lib/i18n/config";
import { fetchSanity } from "@/lib/sanity/fetchSanity";
import { insightBySlugQuery } from "@/lib/sanity/queries";
import { getSeoDefaults } from "@/lib/sanity/seoDefaults";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { notFound } from "next/navigation";

export const dynamicParams = true;

export async function generateStaticParams() {
  const rows = await fetchSanity<{ locale: string; slug: string }[]>(
    `*[_type == "insightArticle" && defined(slug.current)]{ "locale": language, "slug": slug.current }`,
  );
  return rows.map((r) => ({ locale: r.locale, slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const [doc, defaults] = await Promise.all([
    fetchSanity(insightBySlugQuery, { locale, slug }),
    getSeoDefaults(loc),
  ]);
  return buildPageMetadata({
    locale: loc,
    seo: doc?.seo ?? null,
    pathParts: [
      { type: "key", key: "insights" },
      { type: "slug", value: slug },
    ],
    defaults,
  });
}

export default async function InsightArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const doc = await fetchSanity(insightBySlugQuery, { locale, slug });
  if (!doc) notFound();

  return <InsightDetailTemplate locale={loc} article={doc} />;
}
