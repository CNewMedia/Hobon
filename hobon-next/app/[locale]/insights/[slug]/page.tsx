import { MinimalPage } from "@/components/templates/MinimalPage";
import { SimpleRichText } from "@/components/portable/SimpleRichText";
import type { Locale } from "@/lib/i18n/config";
import { client } from "@/lib/sanity/client";
import { insightBySlugQuery } from "@/lib/sanity/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const doc = await client.fetch(insightBySlugQuery, { locale, slug });
  return buildPageMetadata({
    locale: locale as Locale,
    seo: doc?.seo ?? null,
    pathParts: [
      { type: "key", key: "insights" },
      { type: "slug", value: slug },
    ],
  });
}

export default async function InsightArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const doc = await client.fetch(insightBySlugQuery, { locale, slug });
  if (!doc) notFound();

  return (
    <MinimalPage title={doc.title ?? "Insight"}>
      {doc.lead ? <p className="mb-6 text-lg text-[#5a5f72]">{doc.lead}</p> : null}
      <SimpleRichText value={doc.body} />
    </MinimalPage>
  );
}
