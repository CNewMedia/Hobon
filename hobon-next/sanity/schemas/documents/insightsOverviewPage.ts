import { defineField, defineType } from "sanity";

export const insightsOverviewPage = defineType({
  name: "insightsOverviewPage",
  title: "Insights overzicht",
  type: "document",
  fields: [
    defineField({ name: "language", type: "string", readOnly: true, hidden: true }),
    defineField({ name: "seo", type: "seo" }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "intro", type: "text" }),
  ],
});
