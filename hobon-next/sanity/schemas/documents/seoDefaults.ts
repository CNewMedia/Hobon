import { defineField, defineType } from "sanity";

export const seoDefaults = defineType({
  name: "seoDefaults",
  title: "SEO defaults",
  type: "document",
  fields: [
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "defaultMetaTitle",
      title: "Default meta title",
      type: "string",
      description: 'e.g. "Hobon — Verpakkingsfolie op maat"',
    }),
    defineField({
      name: "defaultMetaTitleSuffix",
      title: "Title suffix",
      type: "string",
      initialValue: " | Hobon",
      description: "Appended to page titles when not already present.",
    }),
    defineField({
      name: "defaultMetaDescription",
      title: "Default meta description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "defaultOgImage",
      title: "Default OG image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "twitterHandle",
      title: "Twitter / X handle",
      type: "string",
      description: "Without @",
    }),
    defineField({
      name: "organizationSchema",
      title: "Organization (schema.org)",
      type: "object",
      fields: [
        defineField({ name: "legalName", title: "Legal name", type: "string" }),
        defineField({ name: "foundingDate", title: "Founding date", type: "date" }),
        defineField({ name: "vatNumber", title: "VAT number", type: "string" }),
        defineField({
          name: "socialLinks",
          title: "Social profile URLs",
          type: "array",
          of: [{ type: "url" }],
        }),
      ],
    }),
  ],
  preview: {
    select: { lang: "language" },
    prepare({ lang }) {
      return { title: `SEO defaults (${lang ?? "?"})` };
    },
  },
});
