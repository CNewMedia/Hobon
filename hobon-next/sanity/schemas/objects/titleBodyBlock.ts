import { defineField, defineType } from "sanity";

export const titleBodyBlock = defineType({
  name: "titleBodyBlock",
  title: "Title + body",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "body", title: "Body", type: "richText" }),
  ],
});
