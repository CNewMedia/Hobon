import type { Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/paths";

export function navLabels(locale: Locale) {
  const L = {
    nl: {
      sectors: "Sectoren",
      approach: "Werkwijze",
      products: "Producten",
      about: "Over Hobon",
      insights: "Insights",
      contact: "Contact",
      cta: "Vraag advies",
    },
    fr: {
      sectors: "Secteurs",
      approach: "Approche",
      products: "Produits",
      about: "À propos",
      insights: "Insights",
      contact: "Contact",
      cta: "Demander conseil",
    },
    en: {
      sectors: "Sectors",
      approach: "Approach",
      products: "Products",
      about: "About Hobon",
      insights: "Insights",
      contact: "Contact",
      cta: "Ask for advice",
    },
  };
  return L[locale];
}

export function headerLinks(locale: Locale) {
  const t = navLabels(locale);
  const base = `/${locale}`;
  return [
    { href: buildLocalizedPath(locale, [{ type: "key", key: "sectors" }]), label: t.sectors },
    { href: `${base}/#werkwijze`, label: t.approach },
    { href: `${base}/#producten`, label: t.products },
    { href: `${base}/#over`, label: t.about },
    { href: buildLocalizedPath(locale, [{ type: "key", key: "insights" }]), label: t.insights },
    { href: buildLocalizedPath(locale, [{ type: "key", key: "contact" }]), label: t.contact },
  ];
}
