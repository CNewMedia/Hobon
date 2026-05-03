import Link from "next/link";
import { MinimalPage } from "@/components/templates/MinimalPage";
import type { Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/paths";
import { client } from "@/lib/sanity/client";
import { productOverviewPageQuery, productsForLocaleQuery } from "@/lib/sanity/queries";
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
    client.fetch(productOverviewPageQuery, { locale }),
    getSeoDefaults(loc),
  ]);
  return buildPageMetadata({
    locale: loc,
    seo: doc?.seo ?? null,
    pathParts: [{ type: "key", key: "products" }],
    defaults,
  });
}

export default async function ProductsOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [doc, products] = await Promise.all([
    client.fetch(productOverviewPageQuery, { locale }),
    client.fetch(productsForLocaleQuery, { locale }),
  ]);

  return (
    <MinimalPage title={doc?.title ?? "Producten"}>
      {doc?.intro ? <p className="mb-8 text-[#5a5f72]">{doc.intro}</p> : null}
      <ul className="space-y-3">
        {(products ?? []).map((p: { title: string; slug: string | null }) =>
          p.slug ? (
            <li key={p.slug}>
              <Link
                href={buildLocalizedPath(locale as Locale, [
                  { type: "key", key: "products" },
                  { type: "slug", value: p.slug },
                ])}
                className="text-[var(--navy)] underline underline-offset-4"
              >
                {p.title}
              </Link>
            </li>
          ) : null,
        )}
      </ul>
    </MinimalPage>
  );
}
