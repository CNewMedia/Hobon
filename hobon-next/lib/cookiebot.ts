/** Cookiebot Domain Group ID — public banner id (safe as NEXT_PUBLIC_). */
export function getCookiebotCbid(): string | null {
  const cbid = process.env.NEXT_PUBLIC_COOKIEBOT_CBID?.trim();
  if (!cbid || cbid === "[YOUR_COOKIEBOT_CBID]") return null;
  return cbid;
}

/** Cookiebot culture codes match our locales (uppercase). */
export function cookiebotCulture(locale: string): "NL" | "FR" | "EN" {
  if (locale === "fr") return "FR";
  if (locale === "en") return "EN";
  return "NL";
}
