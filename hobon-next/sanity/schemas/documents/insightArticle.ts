import { defineArrayMember, defineField, defineType } from "sanity";
import { SlugUrlPreview } from "../../components/SlugUrlPreview";
import { isUniquePerLanguage } from "../isUniquePerLanguage";

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
      options: { source: "title", maxLength: 96, isUnique: isUniquePerLanguage },
      validation: (Rule) => Rule.required(),
      components: { field: SlugUrlPreview },
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(200),
    }),
    defineField({ name: "featuredImage", title: "Featured image", type: "imageWithAlt" }),
    defineField({ name: "publishedAt", type: "datetime" }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "insightCategory" }],
    }),
    defineField({ name: "body", type: "richText" }),
    defineField({
      name: "relatedArticles",
      title: "Related articles",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "insightArticle" }],
        }),
      ],
    }),
  ],
});
