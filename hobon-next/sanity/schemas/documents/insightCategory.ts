import { defineField, defineType } from "sanity";

export const insightCategory = defineType({
  name: "insightCategory",
  title: "Insight category",
  type: "document",
  fields: [
    defineField({ name: "language", type: "string", readOnly: true, hidden: true }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({
      name: "color",
      title: "Color token (optional)",
      type: "string",
      description: "e.g. orange, navy — for UI differentiation",
    }),
  ],
  preview: {
    select: { title: "title", lang: "language" },
    prepare({ title, lang }) {
      return { title: title ?? "Category", subtitle: lang };
    },
  },
});
