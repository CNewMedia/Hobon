import { defineField, defineType } from "sanity";

/** FAQ-item voor product-template (accordeon). */
export const faqItem = defineType({
  name: "faqItem",
  title: "FAQ item",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "Vraag",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Antwoord",
      type: "text",
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "question" },
    prepare({ title }) {
      return { title: title || "FAQ item" };
    },
  },
});
