import { defineField, defineType } from "sanity";

export const headlineBodyBlock = defineType({
  name: "headlineBodyBlock",
  title: "Headline + body",
  type: "object",
  fields: [
    defineField({ name: "headline", title: "Headline", type: "string" }),
    defineField({ name: "body", title: "Body", type: "richText" }),
  ],
});
