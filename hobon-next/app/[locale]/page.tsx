import { HomeTemplate } from "@/components/home/HomeTemplate";
import type { Locale } from "@/lib/i18n/config";
import { client } from "@/lib/sanity/client";
import { homePageQuery, sectorsForLocaleQuery } from "@/lib/sanity/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const data = await client.fetch(homePageQuery, { locale });
  return buildPageMetadata({
    locale: locale as Locale,
    seo: data?.seo ?? null,
    pathParts: [],
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [home, sectors] = await Promise.all([
    client.fetch(homePageQuery, { locale }),
    client.fetch(sectorsForLocaleQuery, { locale }),
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
