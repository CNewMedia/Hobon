import { InsightDetailTemplate } from "@/components/insights/InsightDetailTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/lib/i18n/config";
import { SITE_ORIGIN } from "@/lib/siteUrl";
import { fetchSanity } from "@/lib/sanity/fetchSanity";
import {
  pathPartsByLocaleFromSlugs,
  resolveSiblingSlugsByLocale,
} from "@/lib/sanity/locale-mapping";
import { insightBySlugQuery, insightsOverviewPageQuery } from "@/lib/sanity/queries";
import { getSeoDefaults } from "@/lib/sanity/seoDefaults";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/structuredData";
import { buildLocalizedPath } from "@/lib/i18n/paths";
import { notFound } from "next/navigation";

export const dynamicParams = true;

const insightsCrumb: Record<Locale, string> = {
  nl: "Insights",
  fr: "Insights",
  en: "Insights",
};

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
  const [doc, defaults, siblingSlugs] = await Promise.all([
    fetchSanity(insightBySlugQuery, { locale, slug }),
    getSeoDefaults(loc),
    resolveSiblingSlugsByLocale("insightArticle", loc, slug, fetchSanity),
  ]);
  return buildPageMetadata({
    locale: loc,
    seo: doc?.seo ?? null,
    pathParts: [
      { type: "key", key: "insights" },
      { type: "slug", value: slug },
    ],
    languagePathParts: pathPartsByLocaleFromSlugs("insights", siblingSlugs),
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
  const [doc, overview] = await Promise.all([
    fetchSanity(insightBySlugQuery, { locale, slug }),
    fetchSanity(insightsOverviewPageQuery, { locale: loc }),
  ]);
  if (!doc) notFound();

  const title = doc.title?.trim() || slug;
  const pageUrl = `${SITE_ORIGIN}${buildLocalizedPath(loc, [
    { type: "key", key: "insights" },
    { type: "slug", value: slug },
  ])}`;

  const crumbLd = breadcrumbJsonLd(loc, [
    { name: "Hobon", pathParts: [] },
    { name: insightsCrumb[loc], pathParts: [{ type: "key", key: "insights" }] },
    {
      name: title,
      pathParts: [
        { type: "key", key: "insights" },
        { type: "slug", value: slug },
      ],
    },
  ]);

  const articleLd = articleJsonLd({
    headline: title,
    description: doc.lead ?? doc.seo?.metaDescription ?? null,
    url: pageUrl,
    datePublished: doc.publishedAt ?? null,
    dateModified: doc._updatedAt ?? doc.publishedAt ?? null,
    locale: loc,
  });

  return (
    <>
      <JsonLd data={crumbLd} />
      <JsonLd data={articleLd} />
      <InsightDetailTemplate
        locale={loc}
        article={doc}
        cardFallbackImage={overview?.articleCardFallbackImage ?? null}
      />
    </>
  );
}
