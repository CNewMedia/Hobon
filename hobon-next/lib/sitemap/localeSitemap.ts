import type { Locale } from "@/lib/i18n/config";
import { SITE_ORIGIN } from "@/lib/siteUrl";
import { buildLocalizedPath, type PathPart } from "@/lib/i18n/paths";
import { client } from "@/lib/sanity/client";

type SitemapRow = { loc: string; lastmod?: string; priority: string; changefreq: string };

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function lastmodFrom(ts: string | undefined): string | undefined {
  if (!ts) return undefined;
  try {
    return new Date(ts).toISOString().split("T")[0];
  } catch {
    return undefined;
  }
}

const staticQuery = `{
  "home": *[_type == "homePage" && language == $locale][0]._updatedAt,
  "about": *[_type == "aboutPage" && language == $locale][0]._updatedAt,
  "sustainability": *[_type == "sustainabilityPage" && language == $locale][0]._updatedAt,
  "contact": *[_type == "contactPage" && language == $locale][0]._updatedAt,
  "productsOverview": *[_type == "productOverviewPage" && language == $locale][0]._updatedAt,
  "sectorsOverview": *[_type == "sectorOverviewPage" && language == $locale][0]._updatedAt,
  "insightsOverview": *[_type == "insightsOverviewPage" && language == $locale][0]._updatedAt
}`;

const dynamicQuery = `{
  "sectors": *[_type == "sector" && language == $locale && defined(slug.current)]{ "slug": slug.current, _updatedAt },
  "products": *[_type == "product" && language == $locale && defined(slug.current)]{ "slug": slug.current, _updatedAt },
  "insights": *[_type == "insightArticle" && language == $locale && defined(slug.current)]{ "slug": slug.current, _updatedAt }
}`;

export async function buildLocaleSitemapXml(locale: Locale): Promise<string> {
  const [st, dyn] = await Promise.all([
    client.fetch<Record<string, string | undefined>>(staticQuery, { locale }),
    client.fetch<{
      sectors: Array<{ slug: string; _updatedAt?: string }>;
      products: Array<{ slug: string; _updatedAt?: string }>;
      insights: Array<{ slug: string; _updatedAt?: string }>;
    }>(dynamicQuery, { locale }),
  ]);

  const rows: SitemapRow[] = [];

  const add = (parts: PathPart[], ts: string | undefined, priority: string, changefreq: string) => {
    rows.push({
      loc: `${SITE_ORIGIN}${buildLocalizedPath(locale, parts)}`,
      lastmod: lastmodFrom(ts),
      priority,
      changefreq,
    });
  };

  add([], st.home, "1.0", "monthly");
  add([{ type: "key", key: "about" }], st.about, "0.9", "monthly");
  add([{ type: "key", key: "sustainability" }], st.sustainability, "0.9", "monthly");
  add([{ type: "key", key: "contact" }], st.contact, "0.9", "monthly");
  add([{ type: "key", key: "products" }], st.productsOverview, "0.9", "monthly");
  add([{ type: "key", key: "sectors" }], st.sectorsOverview, "0.9", "monthly");
  add([{ type: "key", key: "insights" }], st.insightsOverview, "0.9", "weekly");

  for (const s of dyn.sectors ?? []) {
    if (!s.slug) continue;
    add(
      [
        { type: "key", key: "sectors" },
        { type: "slug", value: s.slug },
      ],
      s._updatedAt,
      "0.8",
      "monthly",
    );
  }
  for (const p of dyn.products ?? []) {
    if (!p.slug) continue;
    add(
      [
        { type: "key", key: "products" },
        { type: "slug", value: p.slug },
      ],
      p._updatedAt,
      "0.8",
      "monthly",
    );
  }
  for (const a of dyn.insights ?? []) {
    if (!a.slug) continue;
    add(
      [
        { type: "key", key: "insights" },
        { type: "slug", value: a.slug },
      ],
      a._updatedAt,
      "0.6",
      "weekly",
    );
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows
  .map(
    (r) => `  <url>
    <loc>${escapeXml(r.loc)}</loc>
    ${r.lastmod ? `<lastmod>${r.lastmod}</lastmod>` : ""}
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return body;
}
