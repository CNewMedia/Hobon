import { SITE_ORIGIN } from "@/lib/siteUrl";
import { buildLocalizedPath } from "@/lib/i18n/paths";
import { client } from "@/lib/sanity/client";

export async function GET() {
  const [seoNl, insights] = await Promise.all([
    client.fetch<{ defaultMetaTitle?: string; defaultMetaDescription?: string } | null>(
      `*[_type == "seoDefaults" && language == "nl"][0]{ defaultMetaTitle, defaultMetaDescription }`,
    ),
    client.fetch<Array<{ title?: string; slug?: string | null }>>(
      `*[_type == "insightArticle" && language == "nl"] | order(publishedAt desc) [0...10]{ title, "slug": slug.current }`,
    ),
  ]);

  const tagline =
    seoNl?.defaultMetaDescription?.trim() ||
    "Hobon is een Belgische technische partner voor verpakkingsfolie op maat. PE-folies, krimphoezen, automatenfolie en sectorspecifieke oplossingen voor B2B in voeding, logistiek, chemie en agro-industrie.";

  const insightLines = (insights ?? [])
    .filter((a) => a.slug && a.title)
    .map((a) => `- [${a.title}](${SITE_ORIGIN}${buildLocalizedPath("nl", [{ type: "key", key: "insights" }, { type: "slug", value: a.slug! }])})`);

  const body = `# ${seoNl?.defaultMetaTitle?.trim() ?? "Hobon"}

> ${tagline}

## Kerncompetenties

- Advies vóór aankoop: technische specs op maat
- BRC Packaging Level AA-gecertificeerd
- 100% inhouse productie
- Actief in BE, NL, FR

## Belangrijke pagina's

- [Home](${SITE_ORIGIN}/nl/)
- [Over Hobon](${SITE_ORIGIN}${buildLocalizedPath("nl", [{ type: "key", key: "about" }])})
- [Sectoren](${SITE_ORIGIN}${buildLocalizedPath("nl", [{ type: "key", key: "sectors" }])})
- [Producten](${SITE_ORIGIN}${buildLocalizedPath("nl", [{ type: "key", key: "products" }])})
- [Duurzaamheid](${SITE_ORIGIN}${buildLocalizedPath("nl", [{ type: "key", key: "sustainability" }])})
- [Contact](${SITE_ORIGIN}${buildLocalizedPath("nl", [{ type: "key", key: "contact" }])})

## Insights

${insightLines.length ? insightLines.join("\n") : "- (Nog geen artikelen in CMS)"}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
    },
  });
}
