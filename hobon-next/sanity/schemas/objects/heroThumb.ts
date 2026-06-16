import { defineField, defineType } from "sanity";

/** Hero-fotostrip (sector + product). */
export const heroThumb = defineType({
  name: "heroThumb",
  title: "Hero thumbnail",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Beeld (upload)",
      type: "imageWithAlt",
    }),
    defineField({
      name: "imageUrl",
      title: "Beeld (URL — legacy)",
      type: "url",
      description: "Fallback zolang geen upload is ingesteld.",
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "Korte titel onder/op de thumb (bijv. “Automatenfolie”).",
    }),
  ],
  preview: {
    select: { title: "label", media: "image.image" },
    prepare({ title, media }) {
      return { title: title || "Hero thumbnail", media };
    },
  },
});
