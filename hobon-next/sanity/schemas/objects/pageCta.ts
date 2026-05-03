import { defineField, defineType } from "sanity";

export const pageCta = defineType({
  name: "pageCta",
  title: "CTA band",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "buttonLabel", title: "Button label", type: "string" }),
    defineField({
      name: "buttonLink",
      title: "Button link",
      type: "reference",
      to: [{ type: "contactPage" }],
    }),
  ],
});
