import type { Locale } from "./config";
import { isLocale, locales } from "./config";
import { buildLocalizedPath, type PathPart } from "./paths";
import { segmentToKey } from "./segments";
import {
  getOverviewFallbackPath,
  resolveSiblingSlug,
  type LocaleMappingFetcher,
  type LocalizedDocType,
} from "@/lib/sanity/locale-mapping";

export type LocaleSwitchResult = {
  href: string;
  /** True when no published translation exists; href is overview fallback for the switcher only. */
  isFallback: boolean;
};

export type LocaleSwitchMap = Record<Locale, LocaleSwitchResult>;

type DetailRoute = {
  documentType: LocalizedDocType;
  segmentKey: "sectors" | "products" | "insights";
  sourceLocale: Locale;
  sourceSlug: string;
  tail: string[];
};

function parseDetailRoute(pathname: string): DetailRoute | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 3) return null;
  const maybeLocale = segments[0];
  if (!isLocale(maybeLocale)) return null;
  const key = segmentToKey(segments[1]);
  if (key !== "sectors" && key !== "products" && key !== "insights") return null;
  const sourceSlug = decodeURIComponent(segments[2] ?? "").trim();
  if (!sourceSlug) return null;
  const documentType: LocalizedDocType =
    key === "sectors" ? "sector" : key === "products" ? "product" : "insightArticle";
  return {
    documentType,
    segmentKey: key,
    sourceLocale: maybeLocale,
    sourceSlug,
    tail: segments.slice(3).map((s) => decodeURIComponent(s)),
  };
}

export function isDetailLocalePath(pathname: string): boolean {
  return parseDetailRoute(pathname) !== null;
}

/** Safe sync rewrite for non-detail routes only (home, contact, overviews, …). */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${target}`;

  const maybeLocale = segments[0];
  if (!isLocale(maybeLocale)) return `/${target}`;

  const rest = segments.slice(1);
  if (rest.length === 0) return `/${target}`;

  const key = segmentToKey(rest[0]);
  const tail = rest.slice(1).map((s) => decodeURIComponent(s));

  // Detail routes must not guess the same slug in another locale.
  if (key === "sectors" || key === "products" || key === "insights") {
    if (tail.length > 0) {
      return getOverviewFallbackPath(
        key === "sectors" ? "sector" : key === "products" ? "product" : "insightArticle",
        target,
      );
    }
  }

  if (key) {
    const parts: PathPart[] = [{ type: "key", key }];
    for (const s of tail) parts.push({ type: "slug", value: s });
    return buildLocalizedPath(target, parts);
  }

  return "/" + [target, ...rest].join("/");
}

function syncMap(pathname: string): LocaleSwitchMap {
  return {
    nl: { href: switchLocalePath(pathname, "nl"), isFallback: false },
    fr: { href: switchLocalePath(pathname, "fr"), isFallback: false },
    en: { href: switchLocalePath(pathname, "en"), isFallback: false },
  };
}

async function resolveDetailTarget(
  detail: DetailRoute,
  target: Locale,
  fetcher: LocaleMappingFetcher,
): Promise<LocaleSwitchResult> {
  const resolved = await resolveSiblingSlug(
    detail.documentType,
    detail.sourceLocale,
    detail.sourceSlug,
    target,
    fetcher,
  );
  if (resolved.kind === "missing") {
    return { href: resolved.fallbackPath, isFallback: true };
  }
  const parts: PathPart[] = [
    { type: "key", key: detail.segmentKey },
    { type: "slug", value: resolved.slug },
  ];
  for (const seg of detail.tail) parts.push({ type: "slug", value: seg });
  return { href: buildLocalizedPath(target, parts), isFallback: false };
}

/**
 * Server-safe locale switch map for the current pathname.
 * Detail pages resolve published sibling slugs; never emit a guessed same-slug URL.
 */
export async function resolveLocaleSwitchHrefs(
  pathname: string,
  fetcher: LocaleMappingFetcher,
): Promise<LocaleSwitchMap> {
  const detail = parseDetailRoute(pathname);
  if (!detail) return syncMap(pathname);

  const entries = await Promise.all(
    locales.map(async (loc) => [loc, await resolveDetailTarget(detail, loc, fetcher)] as const),
  );
  return Object.fromEntries(entries) as LocaleSwitchMap;
}

/**
 * Client resolver via /api/i18n/resolve-slug.
 * On detail routes: never falls back to a guessed same-slug path.
 */
export async function switchLocalePathWithSlugLookup(
  pathname: string,
  target: Locale,
): Promise<LocaleSwitchResult> {
  const detail = parseDetailRoute(pathname);
  if (!detail) {
    return { href: switchLocalePath(pathname, target), isFallback: false };
  }

  const overview = getOverviewFallbackPath(detail.documentType, target);
  const url = new URL("/api/i18n/resolve-slug", window.location.origin);
  url.searchParams.set("documentType", detail.documentType);
  url.searchParams.set("sourceLocale", detail.sourceLocale);
  url.searchParams.set("targetLocale", target);
  url.searchParams.set("sourceSlug", detail.sourceSlug);

  try {
    const res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
    if (!res.ok) return { href: overview, isFallback: true };
    const payload = (await res.json()) as {
      slug?: string;
      missing?: boolean;
      fallbackPath?: string;
    };
    if (payload.missing) {
      return { href: payload.fallbackPath || overview, isFallback: true };
    }
    const targetSlug = payload.slug?.trim() ?? "";
    if (!targetSlug) return { href: overview, isFallback: true };
    const parts: PathPart[] = [
      { type: "key", key: detail.segmentKey },
      { type: "slug", value: targetSlug },
    ];
    for (const seg of detail.tail) parts.push({ type: "slug", value: seg });
    return { href: buildLocalizedPath(target, parts), isFallback: false };
  } catch {
    return { href: overview, isFallback: true };
  }
}

export async function resolveLocaleSwitchHrefsClient(pathname: string): Promise<LocaleSwitchMap> {
  const detail = parseDetailRoute(pathname);
  if (!detail) return syncMap(pathname);
  const entries = await Promise.all(
    locales.map(async (loc) => [loc, await switchLocalePathWithSlugLookup(pathname, loc)] as const),
  );
  return Object.fromEntries(entries) as LocaleSwitchMap;
}
