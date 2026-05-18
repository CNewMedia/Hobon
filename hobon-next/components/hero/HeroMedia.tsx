"use client";

/* eslint-disable @next/next/no-img-element */
import { urlFor } from "@/lib/sanity/image";
import { hasHeroMedia, type HeroMediaData } from "./heroMediaTypes";

const HERO_OVERLAY_STYLE = {
  background:
    "linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.0) 100%)",
} as const;

type SanityImageSource = Parameters<typeof urlFor>[0];

export function HeroMedia({ media }: { media?: HeroMediaData }) {
  if (!media?.mediaType) return null;

  if (media.mediaType === "video" && media.video?.src?.trim()) {
    const posterSrc =
      media.video.poster?.image != null
        ? urlFor(media.video.poster.image as SanityImageSource).width(1200).quality(80).url()
        : undefined;
    return (
      <video autoPlay muted loop playsInline poster={posterSrc}>
        <source src={media.video.src.trim()} type="video/mp4" />
      </video>
    );
  }

  if (media.mediaType === "image" && media.image?.image != null) {
    return (
      <img
        src={urlFor(media.image.image as SanityImageSource).width(1200).quality(80).url()}
        alt={media.image.alt ?? ""}
      />
    );
  }

  return null;
}

/** Right-column hero panel (listing / optional content pages). */
export function HeroMediaPanel({
  media,
  className = "s-hero-r listing-overview-hero-r",
}: {
  media?: HeroMediaData;
  className?: string;
}) {
  if (!hasHeroMedia(media)) return null;

  return (
    <div className={className}>
      <div className="s-hero-r-main">
        <HeroMedia media={media} />
      </div>
      <div className="s-hero-r-overlay" style={HERO_OVERLAY_STYLE} aria-hidden="true" />
    </div>
  );
}
