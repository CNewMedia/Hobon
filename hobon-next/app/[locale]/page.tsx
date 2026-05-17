import { HomeTemplate } from "@/components/home/HomeTemplate";
import type { Locale } from "@/lib/i18n/config";
import { fetchSanity } from "@/lib/sanity/fetchSanity";
import { homePageQuery, sectorsForLocaleQuery } from "@/lib/sanity/queries";
import { getSeoDefaults } from "@/lib/sanity/seoDefaults";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;
  const [data, defaults] = await Promise.all([
    fetchSanity(homePageQuery, { locale }),
    getSeoDefaults(loc),
  ]);
  return buildPageMetadata({
    locale: loc,
    seo: data?.seo ?? null,
    pathParts: [],
    defaults,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [home, sectors] = await Promise.all([
    fetchSanity(homePageQuery, { locale }),
    fetchSanity(sectorsForLocaleQuery, { locale }),
  ]);

  if (!home) {
    return (
      <div className="bg-[var(--ink)] px-6 py-24 text-center text-white">
        <p>Homepage-content ontbreekt in Sanity voor deze taal. Voer <code>npm run seed</code> uit.</p>
      </div>
    );
  }

  return <HomeTemplate locale={locale as Locale} data={home} sectors={sectors ?? []} />;
}
