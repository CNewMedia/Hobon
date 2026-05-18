import { urlFor } from "@/lib/sanity/image";

type ImageWithAlt = { image?: unknown; alt?: string | null } | null | undefined;

type SanityImageSource = Parameters<typeof urlFor>[0];

export function sectorListingCardSrc(
  heroMainImage?: ImageWithAlt,
  heroMainImageUrl?: string | null,
): string | null {
  if (heroMainImage?.image != null) {
    return urlFor(heroMainImage.image as SanityImageSource).width(640).quality(80).url();
  }
  if (heroMainImageUrl?.trim()) return heroMainImageUrl.trim();
  return null;
}

export function productListingCardSrc(heroImage?: ImageWithAlt): string | null {
  if (heroImage?.image == null) return null;
  return urlFor(heroImage.image as SanityImageSource).width(640).quality(80).url();
}
