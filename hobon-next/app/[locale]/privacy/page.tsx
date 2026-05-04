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
    seo: { metaTitle: "Privacy Policy | Hobon", metaDescription: "Privacybeleid Hobon." },
    pathParts: [{ type: "slug", value: "privacy" }],
    defaults,
  });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isNl = locale === "nl";
  return (
    <MinimalPage title={isNl ? "Privacy Policy" : locale === "fr" ? "[FR] Politique de confidentialité" : "[EN] Privacy Policy"}>
      <p className="text-[#5a5f72]">
        {isNl
          ? "Deze pagina is een tijdelijke placeholder. Definitieve juridische tekst volgt via Hobon."
          : locale === "fr"
            ? "[FR] Placeholder — contenu juridique à venir."
            : "[EN] Placeholder — legal content to follow."}
      </p>
    </MinimalPage>
  );
}
