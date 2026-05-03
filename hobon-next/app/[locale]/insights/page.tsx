import Link from "next/link";
import { MinimalPage } from "@/components/templates/MinimalPage";
import type { Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/paths";
import { client } from "@/lib/sanity/client";
import { insightsForLocaleQuery, insightsOverviewPageQuery } from "@/lib/sanity/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const doc = await client.fetch(insightsOverviewPageQuery, { locale });
  return buildPageMetadata({
    locale: locale as Locale,
    seo: doc?.seo ?? null,
    pathParts: [{ type: "key", key: "insights" }],
  });
}

export default async function InsightsOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [doc, items] = await Promise.all([
    client.fetch(insightsOverviewPageQuery, { locale }),
    client.fetch(insightsForLocaleQuery, { locale }),
  ]);

  return (
    <MinimalPage title={doc?.title ?? "Insights"}>
      {doc?.intro ? <p className="mb-8 text-[#5a5f72]">{doc.intro}</p> : null}
      <ul className="space-y-6">
        {(items ?? []).map(
          (a: { title: string; slug: string | null; lead?: string | null }) =>
            a.slug ? (
              <li key={a.slug}>
                <Link
                  href={buildLocalizedPath(locale as Locale, [
                    { type: "key", key: "insights" },
                    { type: "slug", value: a.slug },
                  ])}
                  className="font-[family-name:var(--f-head)] text-xl font-semibold text-[var(--navy)] underline-offset-4 hover:underline"
                >
                  {a.title}
                </Link>
                {a.lead ? <p className="mt-2 text-[#5a5f72]">{a.lead}</p> : null}
              </li>
            ) : null,
        )}
      </ul>
    </MinimalPage>
  );
}
