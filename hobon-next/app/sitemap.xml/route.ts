import { SITE_ORIGIN } from "@/lib/siteUrl";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${escapeXml(`${SITE_ORIGIN}/sitemap-nl.xml`)}</loc></sitemap>
  <sitemap><loc>${escapeXml(`${SITE_ORIGIN}/sitemap-fr.xml`)}</loc></sitemap>
  <sitemap><loc>${escapeXml(`${SITE_ORIGIN}/sitemap-en.xml`)}</loc></sitemap>
</sitemapindex>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
