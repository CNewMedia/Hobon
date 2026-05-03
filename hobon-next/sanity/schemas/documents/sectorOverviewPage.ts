import { defineField, defineType } from "sanity";

export const sectorOverviewPage = defineType({
  name: "sectorOverviewPage",
  title: "Sectoren overzicht",
  type: "document",
  fields: [
    defineField({ name: "language", type: "string", readOnly: true, hidden: true }),
    defineField({ name: "seo", type: "seo" }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "intro", type: "text" }),
  ],
});
