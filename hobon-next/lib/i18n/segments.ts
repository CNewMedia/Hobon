import type { Locale } from "./config";
import { locales } from "./config";

export type SegmentKey =
  | "about"
  | "sustainability"
  | "contact"
  | "sectors"
  | "products"
  | "insights";

export const segmentByLocale: Record<Locale, Record<SegmentKey, string>> = {
  nl: {
    about: "over",
    sustainability: "duurzaamheid",
    contact: "contact",
    sectors: "sectoren",
    products: "producten",
    insights: "insights",
  },
  fr: {
    about: "a-propos",
    sustainability: "durabilite",
    contact: "contact",
    sectors: "secteurs",
    products: "produits",
    insights: "insights",
  },
  en: {
    about: "about",
    sustainability: "sustainability",
    contact: "contact",
    sectors: "sectors",
    products: "products",
    insights: "insights",
  },
};

export function segmentFor(locale: string, key: SegmentKey): string {
  const map = segmentByLocale as Record<string, Record<SegmentKey, string>>;
  return map[locale][key];
}

/** Map any localized URL segment (any supported locale) to canonical SegmentKey */
export function segmentToKey(segment: string): SegmentKey | null {
  for (const locale of locales) {
    const entries = segmentByLocale[locale];
    for (const key of Object.keys(entries) as SegmentKey[]) {
      if (entries[key] === segment) return key;
    }
  }
  return null;
}
