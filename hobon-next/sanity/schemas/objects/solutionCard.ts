import { defineField, defineType } from "sanity";

/**
 * Oplossings-/variantkaart (sector + product).
 * Product gebruikt vooral image, title, description.
 * Sector gebruikt optioneel num, tags, cta.
 */
export const solutionCard = defineType({
  name: "solutionCard",
  title: "Solution card",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Beeld (upload)",
      type: "imageWithAlt",
    }),
    defineField({
      name: "imageUrl",
      title: "Beeld (URL — legacy)",
      type: "url",
      description: "Fallback zolang geen upload is ingesteld.",
    }),
    defineField({
      name: "title",
      title: "Titel",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Omschrijving",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "num",
      title: "Nummer (optioneel)",
      type: "string",
      description: "Alleen sector-template (bijv. “01”). Product-template laat dit weg.",
    }),
    defineField({
      name: "tags",
      title: "Tags (optioneel)",
      type: "array",
      of: [{ type: "string" }],
      description: "Spec-chips op sector-kaarten.",
    }),
    defineField({
      name: "cta",
      title: "CTA (optioneel)",
      type: "cta",
      description: "Alleen sector-template.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "num", media: "image.image" },
    prepare({ title, subtitle, media }) {
      return {
        title: subtitle ? `${subtitle} · ${title ?? "Solution card"}` : title ?? "Solution card",
        media,
      };
    },
  },
});
