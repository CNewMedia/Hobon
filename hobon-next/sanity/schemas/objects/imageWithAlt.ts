import { defineField, defineType } from "sanity";

export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Image with alt",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
  ],
});
