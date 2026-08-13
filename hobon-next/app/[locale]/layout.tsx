import { headers } from "next/headers";
import { GtmNoScript, SiteAnalytics } from "@/components/tracking/SiteAnalytics";
import { SiteEffects } from "@/components/site/SiteEffects";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { UILabelsProvider } from "@/components/providers/UILabelsProvider";
import { getCookiebotCbid } from "@/lib/cookiebot";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { SITE_ORIGIN } from "@/lib/siteUrl";
import { organizationJsonLd } from "@/lib/seo/structuredData";
import { fetchSanity } from "@/lib/sanity/fetchSanity";
import { urlFor } from "@/lib/sanity/image";
import { pathnameWithoutLocale } from "@/lib/sanity/resolveInternalHref";
import { getSeoDefaults } from "@/lib/sanity/seoDefaults";
import {
  analyticsAndTrackingQuery,
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

  const [settings, headerNav, footerNav, seoDefaults, tracking, rawUILabels] = await Promise.all([
    fetchSanity(siteSettingsQuery),
    fetchSanity(headerNavigationQuery, { locale }),
    fetchSanity(footerNavigationQuery, { locale }),
    getSeoDefaults(locale),
    fetchSanity(analyticsAndTrackingQuery),
    fetchSanity(uiLabelsQuery, { locale }),
  ]);
  const uiLabels = mergeUILabels(rawUILabels);

  const logoSrc =
    logoUrlFromImageWithAlt(settings?.logo ?? null) ??
    logoUrlFromImageWithAlt(headerNav?.logo ?? null) ??
    null;

  /** Tracking only when Cookiebot env CBID is set — banner blocks until consent (auto). */
  const consentReady = Boolean(getCookiebotCbid());

  const orgLd = organizationJsonLd({
    name: settings?.companyName?.trim() || "Hobon",
    legalName: seoDefaults?.organizationSchema?.legalName,
    url: SITE_ORIGIN,
    logoUrl: logoSrc?.startsWith("http") ? logoSrc : logoSrc ? `${SITE_ORIGIN}${logoSrc}` : undefined,
    foundingDate: seoDefaults?.organizationSchema?.foundingDate ?? undefined,
    vatId: seoDefaults?.organizationSchema?.vatNumber,
    sameAs: seoDefaults?.organizationSchema?.socialLinks ?? undefined,
    telephone: settings?.primaryPhone,
    email: settings?.primaryEmail,
    locations: settings?.locations ?? undefined,
  });

  return (
    <>
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
          logoSrc={logoSrc}
        />
        <main className="flex-1">{children}</main>
        <SiteFooter
          locale={locale}
          footerNav={footerNav}
          siteSettings={settings}
          logoSrc={logoSrc}
        />
      </UILabelsProvider>
    </>
  );
}
