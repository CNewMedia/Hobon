import { defineField, defineType } from "sanity";

export const sustainabilityPage = defineType({
  name: "sustainabilityPage",
  title: "Duurzaamheid",
  type: "document",
  fields: [
    defineField({ name: "language", type: "string", readOnly: true, hidden: true }),
    defineField({ name: "seo", type: "seo" }),
    defineField({ name: "hero", title: "Hero", type: "pageHero" }),
    defineField({ name: "standpoint", title: "Standpunt", type: "headlineBodyBlock" }),
    defineField({
      name: "practicePoints",
      title: "Practice points",
      type: "array",
      of: [{ type: "titleBodyBlock" }],
    }),
    defineField({ name: "cta", title: "CTA band", type: "pageCta" }),
  ],
});
