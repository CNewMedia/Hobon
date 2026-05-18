/** GROQ fragment for heroMedia (embed in page queries). */
export const heroMediaProjection = `heroMedia {
  mediaType,
  image {
    alt,
    caption,
    image {
      asset->{ _id, url }
    }
  },
  video {
    src,
    poster {
      alt,
      image {
        asset->{ _id, url }
      }
    }
  }
}`;
