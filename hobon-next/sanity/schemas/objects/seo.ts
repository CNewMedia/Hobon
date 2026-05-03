import { defineArrayMember, defineField, defineType } from "sanity";

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
    defineField({
      name: "structuredData",
      title: "Structured data (override)",
      type: "object",
      fields: [
        defineField({
          name: "schemaType",
          title: "Schema type",
          type: "string",
          options: {
            list: [
              { title: "Article", value: "Article" },
              { title: "Product", value: "Product" },
              { title: "WebPage", value: "WebPage" },
              { title: "FAQPage", value: "FAQPage" },
            ],
            layout: "dropdown",
          },
        }),
        defineField({
          name: "headline",
          title: "Headline / name",
          type: "string",
        }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          rows: 3,
        }),
        defineField({
          name: "datePublished",
          title: "Date published",
          type: "datetime",
        }),
        defineField({
          name: "dateModified",
          title: "Date modified",
          type: "datetime",
        }),
        defineField({
          name: "authorName",
          title: "Author name",
          type: "string",
        }),
        defineField({
          name: "faqEntries",
          title: "FAQ entries",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              name: "faqEntry",
              fields: [
                defineField({ name: "question", type: "string" }),
                defineField({ name: "answer", type: "text", rows: 3 }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
});
