export type HeroMediaData = {
  mediaType?: "image" | "video" | null;
  image?: { image?: unknown; alt?: string | null } | null;
  video?: {
    src?: string | null;
    poster?: { image?: unknown; alt?: string | null } | null;
  } | null;
} | null;

export function hasHeroMedia(media: HeroMediaData | undefined): boolean {
  if (!media?.mediaType) return false;
  if (media.mediaType === "video") return Boolean(media.video?.src?.trim());
  if (media.mediaType === "image") return media.image?.image != null;
  return false;
}
