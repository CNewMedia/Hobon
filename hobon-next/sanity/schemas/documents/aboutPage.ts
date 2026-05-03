import { defineField, defineType } from "sanity";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "Over Hobon",
  type: "document",
  fields: [
    defineField({ name: "language", type: "string", readOnly: true, hidden: true }),
    defineField({ name: "seo", type: "seo" }),
    defineField({ name: "hero", title: "Hero", type: "pageHero" }),
    defineField({
      name: "storyBlocks",
      title: "Bedrijfsverhaal",
      type: "array",
      of: [{ type: "headlineBodyBlock" }],
    }),
    defineField({
      name: "keyFacts",
      title: "Kerncijfers",
      type: "array",
      of: [{ type: "aboutKeyFact" }],
    }),
    defineField({ name: "approach", title: "Aanpak", type: "headlineBodyBlock" }),
    defineField({ name: "cta", title: "CTA band", type: "pageCta" }),
  ],
});
