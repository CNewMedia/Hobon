import { defineField, defineType } from "sanity";

export const footerColumn = defineType({
  name: "footerColumn",
  title: "Footer column",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Column title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      of: [{ type: "footerLink" }],
    }),
  ],
});
