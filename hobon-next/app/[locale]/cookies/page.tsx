import { MinimalPage } from "@/components/templates/MinimalPage";
import type { Locale } from "@/lib/i18n/config";
import { getSeoDefaults } from "@/lib/sanity/seoDefaults";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = locale as Locale;
  const defaults = await getSeoDefaults(loc);
  return buildPageMetadata({
    locale: loc,
    seo: { metaTitle: "Cookiebeleid | Hobon", metaDescription: "Cookiebeleid Hobon." },
    pathParts: [{ type: "slug", value: "cookies" }],
    defaults,
  });
}

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isNl = locale === "nl";
  return (
    <MinimalPage title={isNl ? "Cookiebeleid" : locale === "fr" ? "[FR] Politique cookies" : "[EN] Cookie policy"}>
      <p className="text-[#5a5f72]">
        {isNl
          ? "Deze pagina is een tijdelijke placeholder. Definitieve cookie- en privacyteksten volgen via Hobon."
          : locale === "fr"
            ? "[FR] Placeholder — texte cookies à venir."
            : "[EN] Placeholder — cookie policy to follow."}
      </p>
    </MinimalPage>
  );
}
