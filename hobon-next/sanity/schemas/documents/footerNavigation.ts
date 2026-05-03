import { defineField, defineType } from "sanity";

export const footerNavigation = defineType({
  name: "footerNavigation",
  title: "Footer navigation",
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
      name: "slogan",
      title: "Slogan (under logo)",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "columns",
      title: "Columns",
      type: "array",
      of: [{ type: "footerColumn" }],
    }),
    defineField({
      name: "bottomLinks",
      title: "Bottom links (Privacy, Cookies, …)",
      type: "array",
      of: [{ type: "footerLink" }],
    }),
    defineField({
      name: "copyright",
      title: "Copyright line",
      type: "string",
      initialValue: "© 2026 Hobon. Alle rechten voorbehouden.",
    }),
    defineField({
      name: "showBrcBadge",
      title: "Show BRC badge",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { lang: "language" },
    prepare({ lang }) {
      return { title: `Footer navigation (${lang ?? "?"})` };
    },
  },
});
