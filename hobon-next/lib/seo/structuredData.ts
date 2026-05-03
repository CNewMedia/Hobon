import type { Locale } from "@/lib/i18n/config";
import { SITE_ORIGIN } from "@/lib/siteUrl";
import { buildLocalizedPath, type PathPart } from "@/lib/i18n/paths";

type OrgInput = {
  name: string;
  legalName?: string | null;
  url: string;
  logoUrl?: string | null;
  foundingDate?: string | null;
  vatId?: string | null;
  sameAs?: string[] | null;
  telephone?: string | null;
  email?: string | null;
  locations?: Array<{
    name?: string | null;
    streetAddress?: string | null;
    postalCode?: string | null;
    city?: string | null;
    country?: string | null;
    phone?: string | null;
    email?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    openingHours?: string[] | null;
  }> | null;
};

export function organizationJsonLd(input: OrgInput): Record<string, unknown> {
  const locs = (input.locations ?? []).filter(Boolean).map((loc) => {
    const entry: Record<string, unknown> = {
      "@type": "LocalBusiness",
      name: loc.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: loc.streetAddress,
        postalCode: loc.postalCode,
        addressLocality: loc.city,
        addressCountry: loc.country ?? "BE",
      },
    };
    if (loc.phone) entry.telephone = loc.phone;
    if (loc.email) entry.email = loc.email;
    if (loc.latitude != null && loc.longitude != null) {
      entry.geo = {
        "@type": "GeoCoordinates",
        latitude: loc.latitude,
        longitude: loc.longitude,
      };
    }
    if (loc.openingHours?.length) {
      entry.openingHours = loc.openingHours;
    }
    return entry;
  });

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: input.name,
    ...(input.legalName ? { legalName: input.legalName } : {}),
    url: input.url,
    ...(input.logoUrl ? { logo: input.logoUrl } : {}),
    ...(input.foundingDate ? { foundingDate: input.foundingDate } : {}),
    ...(input.vatId ? { vatID: input.vatId } : {}),
    ...(input.sameAs?.length ? { sameAs: input.sameAs } : {}),
    ...(input.telephone || input.email
      ? {
          contactPoint: [
            {
              "@type": "ContactPoint",
              ...(input.telephone ? { telephone: input.telephone } : {}),
              ...(input.email ? { email: input.email } : {}),
              contactType: "Sales",
            },
          ],
        }
      : {}),
    ...(locs.length ? { location: locs } : {}),
  };
}

export function articleJsonLd(input: {
  headline: string;
  description?: string | null;
  url: string;
  datePublished?: string | null;
  dateModified?: string | null;
  authorName?: string | null;
  locale: Locale;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    ...(input.description ? { description: input.description } : {}),
    url: input.url,
    inLanguage: input.locale,
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    ...(input.authorName
      ? { author: { "@type": "Person", name: input.authorName } }
      : {}),
  };
}

export function productJsonLd(input: {
  name: string;
  description?: string | null;
  url: string;
  locale: Locale;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    url: input.url,
    inLanguage: input.locale,
  };
}

export function webPageJsonLd(input: {
  name: string;
  description?: string | null;
  url: string;
  locale: Locale;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    url: input.url,
    inLanguage: input.locale,
  };
}

export function faqPageJsonLd(input: {
  url: string;
  entries: Array<{ question?: string | null; answer?: string | null }>;
}): Record<string, unknown> {
  const mainEntity = input.entries
    .filter((e) => e.question && e.answer)
    .map((e) => ({
      "@type": "Question" as const,
      name: e.question,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: e.answer,
      },
    }));

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: input.url,
    mainEntity,
  };
}

export function breadcrumbJsonLd(
  locale: Locale,
  crumbs: Array<{ name: string; pathParts: PathPart[] }>,
): Record<string, unknown> {
  const items = crumbs.map((c, i) => ({
    "@type": "ListItem" as const,
    position: i + 1,
    name: c.name,
    item: `${SITE_ORIGIN}${buildLocalizedPath(locale, c.pathParts)}`,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}
