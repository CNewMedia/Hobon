import Link from "next/link";
import { MinimalPage } from "@/components/templates/MinimalPage";
import type { Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/paths";
import { client } from "@/lib/sanity/client";
import { sectorOverviewPageQuery, sectorsForLocaleQuery } from "@/lib/sanity/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const doc = await client.fetch(sectorOverviewPageQuery, { locale });
  return buildPageMetadata({
    locale: locale as Locale,
    seo: doc?.seo ?? null,
    pathParts: [{ type: "key", key: "sectors" }],
  });
}

export default async function SectorsOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [doc, sectors] = await Promise.all([
    client.fetch(sectorOverviewPageQuery, { locale }),
    client.fetch(sectorsForLocaleQuery, { locale }),
  ]);

  return (
    <MinimalPage title={doc?.title ?? "Sectoren"}>
      {doc?.intro ? <p className="mb-8 text-[#5a5f72]">{doc.intro}</p> : null}
      <ul className="space-y-3">
        {(sectors ?? []).map((s: { title: string; slug: string | null }) =>
          s.slug ? (
            <li key={s.slug}>
              <Link
                href={buildLocalizedPath(locale as Locale, [
                  { type: "key", key: "sectors" },
                  { type: "slug", value: s.slug },
                ])}
                className="text-[var(--navy)] underline underline-offset-4"
              >
                {s.title}
              </Link>
            </li>
          ) : null,
        )}
      </ul>
    </MinimalPage>
  );
}
