import { defineField, defineType } from "sanity";

export const headerNavigation = defineType({
  name: "headerNavigation",
  title: "Header navigation",
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
      name: "logo",
      title: "Logo override",
      type: "imageWithAlt",
      description: "Optional — falls back to Site settings logo",
    }),
    defineField({
      name: "menuItems",
      title: "Menu items",
      type: "array",
      of: [{ type: "menuItem" }],
    }),
    defineField({
      name: "ctaButton",
      title: "CTA button",
      type: "object",
      fields: [
        defineField({ name: "label", type: "string", validation: (r) => r.required() }),
        defineField({
          name: "url",
          type: "string",
          title: "URL or path",
          description: "Internal path (e.g. /nl/contact) or full URL",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "style",
          type: "string",
          initialValue: "primary",
          options: {
            list: [
              { title: "Primary", value: "primary" },
              { title: "Secondary", value: "secondary" },
            ],
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { lang: "language" },
    prepare({ lang }) {
      return { title: `Header navigation (${lang ?? "?"})` };
    },
  },
});
