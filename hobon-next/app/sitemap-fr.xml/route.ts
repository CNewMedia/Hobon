import { buildLocaleSitemapXml } from "@/lib/sitemap/localeSitemap";

export async function GET() {
  const body = await buildLocaleSitemapXml("fr");
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
