import { MinimalPage } from "@/components/templates/MinimalPage";
import { SimpleRichText } from "@/components/portable/SimpleRichText";
import type { Locale } from "@/lib/i18n/config";
import { client } from "@/lib/sanity/client";
import { contactPageQuery } from "@/lib/sanity/queries";
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
    client.fetch(contactPageQuery, { locale }),
    getSeoDefaults(loc),
  ]);
  return buildPageMetadata({
    locale: loc,
    seo: doc?.seo ?? null,
    pathParts: [{ type: "key", key: "contact" }],
    defaults,
  });
}

export default async function ContactPageRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const doc = await client.fetch(contactPageQuery, { locale });
  return (
    <MinimalPage title={doc?.title ?? "Contact"}>
      {doc?.intro ? <p className="mb-6 text-[#5a5f72]">{doc.intro}</p> : null}
      <SimpleRichText value={doc?.body} />
    </MinimalPage>
  );
}
