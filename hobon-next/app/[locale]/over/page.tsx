import { AboutTemplate } from "@/components/about/AboutTemplate";
import type { Locale } from "@/lib/i18n/config";
import { fetchSanity } from "@/lib/sanity/fetchSanity";
import { aboutPageQuery } from "@/lib/sanity/queries";
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
    fetchSanity(aboutPageQuery, { locale }),
    getSeoDefaults(loc),
  ]);
  return buildPageMetadata({
    locale: loc,
    seo: doc?.seo ?? null,
    pathParts: [{ type: "key", key: "about" }],
    defaults,
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const doc = await fetchSanity(aboutPageQuery, { locale });
  return <AboutTemplate locale={locale as Locale} aboutPage={doc} />;
}
