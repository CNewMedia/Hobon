import { urlFor } from "./image";

export type ImageWithAlt = { image?: unknown; alt?: string | null } | null | undefined;

export type ResolvedImage = { src: string | null; alt: string };

type ResolveImageOptions = {
  width?: number;
  quality?: number;
};

export function resolveImageSrc(
  source: ImageWithAlt,
  options: ResolveImageOptions = {},
): ResolvedImage {
  const { width = 800, quality = 80 } = options;
  const alt = source?.alt?.trim() ?? "";

  if (source?.image != null) {
    try {
      return {
        src: urlFor(source.image as Parameters<typeof urlFor>[0]).width(width).quality(quality).url(),
        alt,
      };
    } catch {
      /* fall through */
    }
  }

  return { src: null, alt };
}

/** Sanity imageWithAlt first, then legacy URL field from CMS (not a code fallback). */
export function resolveImageWithLegacyUrl(
  source: ImageWithAlt,
  legacyUrl?: string | null,
  options: ResolveImageOptions = {},
): ResolvedImage {
  const resolved = resolveImageSrc(source, options);
  if (resolved.src) return resolved;
  const url = legacyUrl?.trim();
  if (url) return { src: url, alt: resolved.alt };
  return resolved;
}

export function sectorCardImageSrc(
  listingImage?: ImageWithAlt,
  listingImageUrl?: string | null,
  heroMainImage?: ImageWithAlt,
  heroMainImageUrl?: string | null,
  width = 400,
): string | null {
  const primary = resolveImageSrc(listingImage, { width });
  if (primary.src) return primary.src;

  const hero = resolveImageSrc(heroMainImage, { width });
  if (hero.src) return hero.src;

  if (listingImageUrl?.trim()) return listingImageUrl.trim();
  if (heroMainImageUrl?.trim()) return heroMainImageUrl.trim();
  return null;
}

export function imageWithAltToUrl(
  source: ImageWithAlt,
  options: ResolveImageOptions = {},
): string | null {
  return resolveImageSrc(source, options).src;
}
