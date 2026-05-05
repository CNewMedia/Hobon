import type { Locale } from "./config";
import { isLocale } from "./config";
import { buildLocalizedPath, type PathPart } from "./paths";
import { segmentToKey } from "./segments";

/** Switch locale while preserving route identity (uses localized segments per target locale). */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${target}/`;

  const maybeLocale = segments[0];
  if (!isLocale(maybeLocale)) return `/${target}/`;

  const rest = segments.slice(1);
  if (rest.length === 0) return `/${target}/`;

  const key = segmentToKey(rest[0]);
  const tail = rest.slice(1).map((s) => decodeURIComponent(s));

  if (key) {
    const parts: PathPart[] = [{ type: "key", key }];
    for (const s of tail) parts.push({ type: "slug", value: s });
    return buildLocalizedPath(target, parts);
  }

  return "/" + [target, ...rest].join("/");
}

/** Async locale switcher that resolves translated slugs for detail pages. */
export async function switchLocalePathWithSlugLookup(pathname: string, target: Locale): Promise<string> {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${target}/`;
  const maybeLocale = segments[0];
  if (!isLocale(maybeLocale)) return `/${target}/`;

  const sourceLocale = maybeLocale as Locale;
  const rest = segments.slice(1);
  if (rest.length === 0) return `/${target}/`;

  const key = segmentToKey(rest[0]);
  const tail = rest.slice(1).map((s) => decodeURIComponent(s));

  // Keep legacy behavior for static pages and non-detail routes.
  if (!key || tail.length === 0 || (key !== "sectors" && key !== "products" && key !== "insights")) {
    return switchLocalePath(pathname, target);
  }

  const documentType = key === "sectors" ? "sector" : key === "products" ? "product" : "insightArticle";
  const sourceSlug = tail[0];
  const url = new URL("/api/i18n/resolve-slug", window.location.origin);
  url.searchParams.set("documentType", documentType);
  url.searchParams.set("sourceLocale", sourceLocale);
  url.searchParams.set("targetLocale", target);
  url.searchParams.set("sourceSlug", sourceSlug);

  let targetSlug = "";
  try {
    const res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
    if (!res.ok) return switchLocalePath(pathname, target);
    const payload = (await res.json()) as { path?: string; slug?: string };
    if (payload.path) return payload.path;
    targetSlug = payload.slug ?? "";
  } catch {
    return switchLocalePath(pathname, target);
  }
  if (!targetSlug) return switchLocalePath(pathname, target);

  const parts: PathPart[] = [{ type: "key", key }];
  parts.push({ type: "slug", value: targetSlug });
  for (const seg of tail.slice(1)) parts.push({ type: "slug", value: seg });
  return buildLocalizedPath(target, parts);
}
