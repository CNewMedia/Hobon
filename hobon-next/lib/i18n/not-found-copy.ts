import type { Locale } from "./config";
import { isLocale } from "./config";

export const notFoundCopy: Record<Locale, { title: string; home: string }> = {
  nl: { title: "Pagina niet gevonden", home: "Terug naar home" },
  fr: { title: "Page non trouvée", home: "Retour à l'accueil" },
  en: { title: "Page not found", home: "Back to home" },
};

export function localeFromHeader(raw: string | null): Locale {
  const value = (raw ?? "nl").trim().toLowerCase();
  return isLocale(value) ? value : "nl";
}
