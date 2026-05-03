import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { locales } from "@/lib/i18n/config";
import { buildLocalizedPath, type PathPart } from "@/lib/i18n/paths";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export type SeoInput = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonical?: string | null;
  noindex?: boolean | null;
} | null;

export function buildPageMetadata(input: {
  locale: Locale;
  seo: SeoInput;
  pathParts: PathPart[];
}): Metadata {
  const title = input.seo?.metaTitle ?? "Hobon";
  const description = input.seo?.metaDescription ?? "";
  const path = buildLocalizedPath(input.locale, input.pathParts);
  const canonical =
    input.seo?.canonical ?? `${siteUrl.replace(/\/$/, "")}${path}`;

  const languageAlternates: Record<string, string> = {};
  for (const loc of locales) {
    languageAlternates[loc] = `${siteUrl.replace(/\/$/, "")}${buildLocalizedPath(loc, input.pathParts)}`;
  }

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical,
      languages: languageAlternates,
    },
    robots: input.seo?.noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: input.locale,
    },
  };
}
