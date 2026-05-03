import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta title",
      type: "string",
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(155),
    }),
    defineField({
      name: "ogImage",
      title: "OG image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "canonical",
      title: "Canonical URL (override)",
      type: "url",
    }),
    defineField({
      name: "noindex",
      title: "No index",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
