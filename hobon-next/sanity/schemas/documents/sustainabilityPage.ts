import { defineField, defineType } from "sanity";

export const sustainabilityPage = defineType({
  name: "sustainabilityPage",
  title: "Duurzaamheid",
  type: "document",
  fields: [
    defineField({ name: "language", type: "string", readOnly: true, hidden: true }),
    defineField({ name: "seo", type: "seo" }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "intro", type: "text" }),
    defineField({ name: "body", type: "richText" }),
  ],
});
