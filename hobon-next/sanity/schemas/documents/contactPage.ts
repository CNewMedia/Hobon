import { defineField, defineType } from "sanity";

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact",
  type: "document",
  fields: [
    defineField({ name: "language", type: "string", readOnly: true, hidden: true }),
    defineField({ name: "seo", type: "seo" }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "intro", type: "text", rows: 4 }),
    defineField({ name: "body", type: "richText" }),
  ],
});
