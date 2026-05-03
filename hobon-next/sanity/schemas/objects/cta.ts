import { defineField, defineType } from "sanity";

export const cta = defineType({
  name: "cta",
  title: "Call to action",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string" }),
    defineField({
      name: "href",
      title: "URL",
      type: "string",
      description: "Absolute URL, relative path, #anchor, or mailto:/tel:",
    }),
  ],
});
