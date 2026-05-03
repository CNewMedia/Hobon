/** Public site origin for canonicals, sitemaps, JSON-LD (per deployment; env overrides). */
export const SITE_ORIGIN =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hobon-next.vercel.app").replace(/\/$/, "");
