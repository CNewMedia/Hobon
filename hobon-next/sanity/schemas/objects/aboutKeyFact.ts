import { defineField, defineType } from "sanity";

export const aboutKeyFact = defineType({
  name: "aboutKeyFact",
  title: "Key fact",
  type: "object",
  fields: [
    defineField({ name: "number", title: "Number / value", type: "string" }),
    defineField({ name: "label", title: "Label", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
  ],
});
