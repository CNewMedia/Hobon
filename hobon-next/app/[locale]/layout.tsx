import Script from "next/script";
import { headers } from "next/headers";
import { GtmNoScript, SiteAnalytics } from "@/components/tracking/SiteAnalytics";
import { SiteEffects } from "@/components/site/SiteEffects";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { UILabelsProvider } from "@/components/providers/UILabelsProvider";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { SITE_ORIGIN } from "@/lib/siteUrl";
import { organizationJsonLd } from "@/lib/seo/structuredData";
import { client } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { pathnameWithoutLocale } from "@/lib/sanity/resolveInternalHref";
import { getSeoDefaults } from "@/lib/sanity/seoDefaults";
import {
  analyticsAndTrackingQuery,
  cookieConsentQuery,
  footerNavigationQuery,
  headerNavigationQuery,
  siteSettingsQuery,
  uiLabelsQuery,
} from "@/lib/sanity/queries";
import { mergeUILabels } from "@/types/uiLabels";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return [{ locale: "nl" }, { locale: "fr" }, { locale: "en" }];
}

function normalizePath(p: string): string {
  const s = p.startsWith("/") ? p : `/${p}`;
  if (s === "/") return "/";
  return s.replace(/\/+$/, "") || "/";
}

function logoUrlFromImageWithAlt(iwa: { image?: unknown } | null | undefined): string | null {
  if (!iwa?.image) return null;
  try {
    return urlFor(iwa.image as Parameters<typeof urlFor>[0]).width(320).url();
  } catch {
    return null;
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const h = await headers();
  const pathnameBare = normalizePath(pathnameWithoutLocale(h.get("x-pathname") ?? "/"));

  const [settings, headerNav, footerNav, seoDefaults, cookieConsent, tracking, rawUILabels] = await Promise.all([
    client.fetch(siteSettingsQuery),
    client.fetch(headerNavigationQuery, { locale }),
    client.fetch(footerNavigationQuery, { locale }),
    getSeoDefaults(locale),
    client.fetch(cookieConsentQuery),
    client.fetch(analyticsAndTrackingQuery),
    client.fetch(uiLabelsQuery, { locale }),
  ]);
  const uiLabels = mergeUILabels(rawUILabels);

  const fallbackLogoSrc = "/assets/images/logo.jpg";
  const logoSrc =
    logoUrlFromImageWithAlt(settings?.logo ?? null) ??
    logoUrlFromImageWithAlt(headerNav?.logo ?? null) ??
    fallbackLogoSrc;

  const cookiebotCbid = cookieConsent?.cookiebotCbid?.trim();
  const showCookiebot =
    cookieConsent?.provider === "cookiebot" &&
    cookieConsent?.cookiebotEnabled === true &&
    Boolean(cookiebotCbid) &&
    cookiebotCbid !== "[YOUR_COOKIEBOT_CBID]";

  const consentReady =
    cookieConsent?.provider === "cookiebot" &&
    cookieConsent?.cookiebotEnabled === true &&
    Boolean(cookiebotCbid) &&
    cookiebotCbid !== "[YOUR_COOKIEBOT_CBID]";

  const orgLd = organizationJsonLd({
    name: settings?.companyName?.trim() || "Hobon",
    legalName: seoDefaults?.organizationSchema?.legalName,
    url: SITE_ORIGIN,
    logoUrl: logoSrc.startsWith("http") ? logoSrc : `${SITE_ORIGIN}${logoSrc}`,
    foundingDate: seoDefaults?.organizationSchema?.foundingDate ?? undefined,
    vatId: seoDefaults?.organizationSchema?.vatNumber,
    sameAs: seoDefaults?.organizationSchema?.socialLinks ?? undefined,
    telephone: settings?.primaryPhone,
    email: settings?.primaryEmail,
    locations: settings?.locations ?? undefined,
  });

  return (
    <>
      {showCookiebot && cookiebotCbid ? (
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid={cookiebotCbid}
          data-blockingmode="auto"
          strategy="beforeInteractive"
        />
      ) : null}
      <SiteAnalytics tracking={tracking} enabled={consentReady} pathnameBare={pathnameBare} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />
      <GtmNoScript tracking={tracking} enabled={consentReady} />
      <SiteEffects />
      <UILabelsProvider value={uiLabels}>
        <SiteHeader
          locale={locale}
          headerNav={headerNav}
          siteSettings={settings}
          fallbackLogoSrc={fallbackLogoSrc}
        />
        <main className="flex-1">{children}</main>
        <SiteFooter
          locale={locale}
          footerNav={footerNav}
          siteSettings={settings}
          fallbackLogoSrc={fallbackLogoSrc}
        />
      </UILabelsProvider>
    </>
  );
}
