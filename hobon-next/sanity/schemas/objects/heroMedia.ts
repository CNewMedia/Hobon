import { defineField, defineType } from "sanity";

type HeroMediaValue = {
  mediaType?: "image" | "video";
  image?: unknown;
  video?: { src?: string };
};

export const heroMedia = defineType({
  name: "heroMedia",
  title: "Hero media",
  type: "object",
  fields: [
    defineField({
      name: "mediaType",
      type: "string",
      title: "Type media",
      options: {
        list: [
          { title: "Foto", value: "image" },
          { title: "Video", value: "video" },
        ],
        layout: "radio",
      },
      initialValue: "image",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      type: "imageWithAlt",
      title: "Foto",
      hidden: ({ parent }) => parent?.mediaType !== "image",
    }),
    defineField({
      name: "video",
      type: "object",
      title: "Video",
      hidden: ({ parent }) => parent?.mediaType !== "video",
      fields: [
        defineField({
          name: "src",
          type: "string",
          title: "Video URL of pad",
          description: 'Bijv. "/assets/video/Hobon-intro-web.mp4"',
        }),
        defineField({
          name: "poster",
          type: "imageWithAlt",
          title: "Poster image (preview)",
        }),
      ],
    }),
  ],
  validation: (Rule) =>
    Rule.custom((value: HeroMediaValue | undefined) => {
      if (!value) return true;
      if (value.mediaType === "image" && !value.image) {
        return 'Foto vereist als type "Foto" is gekozen';
      }
      if (value.mediaType === "video" && !value.video?.src) {
        return 'Video-URL vereist als type "Video" is gekozen';
      }
      return true;
    }),
});
