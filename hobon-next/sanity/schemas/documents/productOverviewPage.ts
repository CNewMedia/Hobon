import { defineField, defineType } from "sanity";

export const productOverviewPage = defineType({
  name: "productOverviewPage",
  title: "Producten overzicht",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "cta", title: "CTA-band" },
    { name: "seo", title: "SEO" },
    { name: "legacy", title: "Legacy" },
  ],
  fields: [
    defineField({ name: "language", type: "string", readOnly: true, hidden: true }),
    defineField({ name: "seo", type: "seo", group: "seo" }),
    defineField({
      name: "heroEyebrow",
      title: "Hero — eyebrow",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero — titel (H1)",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroIntro",
      title: "Hero — intro",
      type: "text",
      rows: 5,
      group: "hero",
    }),
    defineField({
      name: "heroMedia",
      title: "Hero media (foto of video)",
      type: "heroMedia",
      group: "hero",
    }),
    defineField({
      name: "ctaBandTitle",
      title: "CTA-band — titel",
      type: "string",
      group: "cta",
    }),
    defineField({
      name: "ctaBandBody",
      title: "CTA-band — body",
      type: "text",
      rows: 4,
      group: "cta",
    }),
    defineField({
      name: "ctaBandPrimary",
      title: "CTA-band — knop",
      type: "object",
      group: "cta",
      fields: [
        defineField({ name: "label", type: "string", validation: (r) => r.required() }),
        defineField({
          name: "href",
          type: "string",
          title: "URL of pad",
          validation: (r) => r.required(),
        }),
      ],
    }),
    defineField({
      name: "title",
      type: "string",
      group: "legacy",
      description: "Fallback als heroTitle leeg is",
    }),
    defineField({
      name: "intro",
      type: "text",
      rows: 4,
      group: "legacy",
      description: "Fallback als heroIntro leeg is",
    }),
  ],
});
