import { defineField, defineType } from "sanity";

export const pageHero = defineType({
  name: "pageHero",
  title: "Hero",
  type: "object",
  fields: [
    defineField({ name: "headline", title: "Headline", type: "string" }),
    defineField({ name: "subline", title: "Subline", type: "text", rows: 3 }),
  ],
});
