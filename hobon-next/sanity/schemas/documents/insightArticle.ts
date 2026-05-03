import { defineField, defineType } from "sanity";

export const insightArticle = defineType({
  name: "insightArticle",
  title: "Insight artikel",
  type: "document",
  fields: [
    defineField({ name: "language", type: "string", readOnly: true, hidden: true }),
    defineField({ name: "seo", type: "seo" }),
    defineField({ name: "title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "publishedAt", type: "datetime" }),
    defineField({ name: "lead", type: "text" }),
    defineField({ name: "body", type: "richText" }),
  ],
});
