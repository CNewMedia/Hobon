import { CookieDeclaration } from "@/components/cookies/CookieDeclaration";
import { MinimalPage } from "@/components/templates/MinimalPage";
import { getCookiebotCbid } from "@/lib/cookiebot";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { getSeoDefaults } from "@/lib/sanity/seoDefaults";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { notFound } from "next/navigation";

const COPY: Record<
  Locale,
  { title: string; metaTitle: string; metaDescription: string; intro: string }
> = {
  nl: {
    title: "Cookiebeleid",
    metaTitle: "Cookiebeleid",
    metaDescription: "Overzicht van cookies die Hobon gebruikt en hoe u uw voorkeuren beheert.",
    intro:
      "Hieronder vindt u een overzicht van de cookies die wij gebruiken. Via de cookie-banner kunt u uw voorkeuren op elk moment wijzigen.",
  },
  fr: {
    title: "Politique de cookies",
    metaTitle: "Politique de cookies",
    metaDescription:
      "Aperçu des cookies utilisés par Hobon et comment gérer vos préférences.",
    intro:
      "Vous trouverez ci-dessous un aperçu des cookies que nous utilisons. Vous pouvez modifier vos préférences à tout moment via la bannière de cookies.",
  },
  en: {
    title: "Cookie policy",
    metaTitle: "Cookie policy",
    metaDescription: "Overview of cookies used by Hobon and how to manage your preferences.",
    intro:
      "Below is an overview of the cookies we use. You can change your preferences at any time via the cookie banner.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const loc = locale as Locale;
  const defaults = await getSeoDefaults(loc);
  const copy = COPY[loc];
  return buildPageMetadata({
    locale: loc,
    seo: { metaTitle: copy.metaTitle, metaDescription: copy.metaDescription },
    pathParts: [{ type: "slug", value: "cookies" }],
    defaults,
  });
}

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const copy = COPY[loc];
  const cbid = getCookiebotCbid();

  return (
    <MinimalPage title={copy.title}>
      <p className="text-[#5a5f72]">{copy.intro}</p>
      {cbid ? (
        <CookieDeclaration cbid={cbid} locale={loc} />
      ) : (
        <p className="mt-10 text-sm text-[#5a5f72]">
          {loc === "fr"
            ? "La déclaration de cookies n'est pas encore configurée."
            : loc === "en"
              ? "The cookie declaration is not configured yet."
              : "De cookiedeclaratie is nog niet geconfigureerd."}
        </p>
      )}
    </MinimalPage>
  );
}
