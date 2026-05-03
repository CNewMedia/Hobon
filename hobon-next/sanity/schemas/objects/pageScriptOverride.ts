import { defineField, defineType } from "sanity";

export const pageScriptOverride = defineType({
  name: "pageScriptOverride",
  title: "Page script override",
  type: "object",
  fields: [
    defineField({
      name: "pagePath",
      title: "Path (no locale prefix)",
      type: "string",
      description: 'e.g. "/contact" — matched against pathname without /nl, /fr, /en',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "extraHeadScripts",
      title: "Extra head scripts",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "extraBodyEndScripts",
      title: "Extra body-end scripts",
      type: "text",
      rows: 4,
    }),
  ],
});
