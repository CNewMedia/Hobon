import { defineField, defineType } from "sanity";

export const usp = defineType({
  name: "usp",
  title: "USP",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
    defineField({
      name: "iconKey",
      title: "Icon key (optional)",
      type: "string",
      description: "Optional identifier for SVG/icon mapping in frontend",
    }),
  ],
});
