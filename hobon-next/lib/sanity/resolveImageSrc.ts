import { urlFor } from "./image";

export type ImageWithAlt = { image?: unknown; alt?: string | null } | null | undefined;

export type ResolvedImage = { src: string | null; alt: string };

type ResolveImageOptions = {
  width?: number;
  quality?: number;
  placeholder?: string | null;
};

export function resolveImageSrc(
  source: ImageWithAlt,
  options: ResolveImageOptions = {},
): ResolvedImage {
  const { width = 800, quality = 80, placeholder } = options;
  const alt = source?.alt?.trim() ?? "";

  if (source?.image != null) {
    try {
      return {
        src: urlFor(source.image as Parameters<typeof urlFor>[0]).width(width).quality(quality).url(),
        alt,
      };
    } catch {
      /* fall through to placeholder */
    }
  }

  if (placeholder?.trim()) {
    return { src: placeholder.trim(), alt };
  }

  return { src: null, alt };
}

/** Static pools per slug until Sanity uploads (HOB-51c). */
const PRODUCT_PLACEHOLDER_POOLS: Record<string, string[]> = {
  pattyn: ["/assets/images/PATTYN/iStock-1290891988.jpg"],
  "pattyn-nl": ["/assets/images/PATTYN/iStock-1290891988.jpg"],
  blaasfolies: ["/assets/images/PATTYN/iStock-1290891988.jpg"],
  folies: ["/assets/images/PATTYN/iStock-1290891988.jpg"],
  "stretch-hood": [
    "/assets/images/Stretchhood/iStock-1709161061.jpg",
    "/assets/images/Stretchhood/iStock-1390200956.jpg",
    "/assets/images/Stretchhood/iStock-946769474.jpg",
    "/assets/images/Krimphoezen/iStock-1151210422.jpg",
    "/assets/images/Krimphoezen/iStock-457978677.jpg",
  ],
  "stretch-hood-nl": [
    "/assets/images/Stretchhood/iStock-1709161061.jpg",
    "/assets/images/Stretchhood/iStock-1390200956.jpg",
    "/assets/images/Stretchhood/iStock-946769474.jpg",
    "/assets/images/Krimphoezen/iStock-1151210422.jpg",
    "/assets/images/Krimphoezen/iStock-457978677.jpg",
  ],
  zakken: [
    "/assets/images/Krat zakken/iStock-2158237125.jpg",
    "/assets/images/Krat zakken/iStock-1396946372.jpg",
    "/assets/images/Krat zakken/iStock-1324670024.jpg",
  ],
  kratzakken: [
    "/assets/images/Krat zakken/iStock-2158237125.jpg",
    "/assets/images/Krat zakken/iStock-1396946372.jpg",
  ],
  vellen: ["/assets/images/Stretchhood/iStock-1709161061.jpg"],
};

export function productPlaceholderPool(slug?: string | null): string[] {
  if (!slug?.trim()) return [];
  return PRODUCT_PLACEHOLDER_POOLS[slug.trim()] ?? [];
}

export function resolveImageWithPool(
  source: ImageWithAlt,
  slug: string | null | undefined,
  index: number,
  width = 800,
): ResolvedImage {
  const pool = productPlaceholderPool(slug);
  const placeholder = pool.length ? pool[index % pool.length] : null;
  return resolveImageSrc(source, { width, placeholder });
}

export function sectorCardImageSrc(
  listingImage?: ImageWithAlt,
  listingImageUrl?: string | null,
  heroMainImage?: ImageWithAlt,
  heroMainImageUrl?: string | null,
): string | null {
  const primary = resolveImageSrc(listingImage, { width: 400 });
  if (primary.src) return primary.src;

  const hero = resolveImageSrc(heroMainImage, { width: 400 });
  if (hero.src) return hero.src;

  if (listingImageUrl?.trim()) return listingImageUrl.trim();
  if (heroMainImageUrl?.trim()) return heroMainImageUrl.trim();
  return null;
}
