import { defineField, defineType } from "sanity";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "Over Hobon",
  type: "document",
  fields: [
    defineField({ name: "language", type: "string", readOnly: true, hidden: true }),
    defineField({ name: "seo", type: "seo" }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "body", type: "richText" }),
  ],
});
