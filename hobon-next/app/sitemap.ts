import type { MetadataRoute } from "next";
import type { Locale } from "@/lib/i18n/config";
import { isLocale as isLocaleGuard, locales } from "@/lib/i18n/config";
import { buildLocalizedPath, type PathPart } from "@/lib/i18n/paths";
import { client } from "@/lib/sanity/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  const [sectors, products, insights] = await Promise.all([
    client.fetch<{ language: string; slug: string | null }[]>(
      `*[_type == "sector" && defined(slug.current)]{ language, "slug": slug.current }`,
    ),
    client.fetch<{ language: string; slug: string | null }[]>(
      `*[_type == "product" && defined(slug.current)]{ language, "slug": slug.current }`,
    ),
    client.fetch<{ language: string; slug: string | null }[]>(
      `*[_type == "insightArticle" && defined(slug.current)]{ language, "slug": slug.current }`,
    ),
  ]);

  const staticParts: PathPart[][] = [
    [],
    [{ type: "key", key: "about" }],
    [{ type: "key", key: "sustainability" }],
    [{ type: "key", key: "contact" }],
    [{ type: "key", key: "sectors" }],
    [{ type: "key", key: "products" }],
    [{ type: "key", key: "insights" }],
  ];

  const urls: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const parts of staticParts) {
      urls.push({
        url: `${base}${buildLocalizedPath(locale, parts)}`,
        lastModified: new Date(),
      });
    }
    for (const row of sectors ?? []) {
      if (!row.slug || !isLocaleGuard(row.language)) continue;
      urls.push({
        url: `${base}${buildLocalizedPath(row.language as Locale, [
          { type: "key", key: "sectors" },
          { type: "slug", value: row.slug },
        ])}`,
        lastModified: new Date(),
      });
    }
    for (const row of products ?? []) {
      if (!row.slug || !isLocaleGuard(row.language)) continue;
      urls.push({
        url: `${base}${buildLocalizedPath(row.language as Locale, [
          { type: "key", key: "products" },
          { type: "slug", value: row.slug },
        ])}`,
        lastModified: new Date(),
      });
    }
    for (const row of insights ?? []) {
      if (!row.slug || !isLocaleGuard(row.language)) continue;
      urls.push({
        url: `${base}${buildLocalizedPath(row.language as Locale, [
          { type: "key", key: "insights" },
          { type: "slug", value: row.slug },
        ])}`,
        lastModified: new Date(),
      });
    }
  }

  return urls;
}
