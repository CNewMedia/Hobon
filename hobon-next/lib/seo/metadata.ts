import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { locales } from "@/lib/i18n/config";
import { SITE_ORIGIN } from "@/lib/siteUrl";
import { buildLocalizedPath, type PathPart } from "@/lib/i18n/paths";
import { urlFor } from "@/lib/sanity/image";
import type { SeoDefaults } from "@/lib/sanity/seoDefaults";
import { stripAIMarker } from "@/lib/text/strip-ai-marker";

export type SeoInput = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: unknown;
  canonical?: string | null;
  noindex?: boolean | null;
} | null;

function ogUrlFromImage(source: unknown): string | undefined {
  if (!source || typeof source !== "object") return undefined;
  try {
    return urlFor(source as Parameters<typeof urlFor>[0]).width(1200).height(630).url();
  } catch {
    return undefined;
  }
}

function normalizeTitleWithSuffix(baseRaw: string, suffixRaw: string | null | undefined): string {
  const suffix = (suffixRaw ?? " | Hobon").trim();
  if (!suffix) return baseRaw;
  const normalizedSuffix = suffix.startsWith("|") ? ` ${suffix}` : suffix;
  const trimmedBase = baseRaw.trim();
  if (trimmedBase.endsWith(normalizedSuffix.trim())) return trimmedBase;
  return `${trimmedBase}${normalizedSuffix}`;
}

export async function buildPageMetadata(input: {
  locale: Locale;
  seo: SeoInput;
  pathParts: PathPart[];
  defaults?: SeoDefaults | null;
}): Promise<Metadata> {
  const suffix = input.defaults?.defaultMetaTitleSuffix;
  const baseTitle =
    stripAIMarker(input.seo?.metaTitle?.trim()) ||
    stripAIMarker(input.defaults?.defaultMetaTitle?.trim()) ||
    "Hobon";
  const title = normalizeTitleWithSuffix(baseTitle, suffix);

  const description =
    stripAIMarker(input.seo?.metaDescription?.trim()) ||
    stripAIMarker(input.defaults?.defaultMetaDescription?.trim()) ||
    "";

  const path = buildLocalizedPath(input.locale, input.pathParts);
  const canonical =
    input.seo?.canonical?.trim() || `${SITE_ORIGIN}${path}`;

  const languageAlternates: Record<string, string> = {};
  for (const loc of locales) {
    languageAlternates[loc] = `${SITE_ORIGIN}${buildLocalizedPath(loc, input.pathParts)}`;
  }

  const ogImage =
    ogUrlFromImage(input.seo?.ogImage) ?? ogUrlFromImage(input.defaults?.defaultOgImage);

  const handle = input.defaults?.twitterHandle?.replace(/^@/, "").trim();
  const twitter: Metadata["twitter"] =
    handle || ogImage
      ? {
          card: "summary_large_image",
          ...(handle ? { site: `@${handle}`, creator: `@${handle}` } : {}),
          title,
          description,
          ...(ogImage ? { images: [ogImage] } : {}),
        }
      : { card: "summary_large_image", title, description };

  return {
    title,
    description,
    metadataBase: new URL(SITE_ORIGIN),
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
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter,
  };
}
