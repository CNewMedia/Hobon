import { cache } from "react";
import type { Locale } from "@/lib/i18n/config";
import { fetchSanity } from "@/lib/sanity/fetchSanity";
import { seoDefaultsQuery } from "@/lib/sanity/queries";

export type SeoDefaults = {
  defaultMetaTitle?: string | null;
  defaultMetaTitleSuffix?: string | null;
  defaultMetaDescription?: string | null;
  defaultOgImage?: unknown;
  twitterHandle?: string | null;
  organizationSchema?: {
    legalName?: string | null;
    foundingDate?: string | null;
    vatNumber?: string | null;
    socialLinks?: string[] | null;
  } | null;
} | null;

export const getSeoDefaults = cache(async (locale: Locale): Promise<SeoDefaults> => {
  return fetchSanity(seoDefaultsQuery, { locale });
});
