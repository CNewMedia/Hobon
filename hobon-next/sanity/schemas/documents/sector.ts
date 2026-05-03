import { defineField, defineType } from "sanity";

export const sector = defineType({
  name: "sector",
  title: "Sector",
  type: "document",
  fields: [
    defineField({ name: "language", type: "string", readOnly: true, hidden: true }),
    defineField({ name: "seo", type: "seo" }),
    defineField({ name: "title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "sortOrder", type: "number", initialValue: 0 }),
    defineField({ name: "navLabel", type: "string", description: "Kort label in sector-switcher" }),
    defineField({
      name: "listingEyebrow",
      title: "Home kaart — label",
      type: "string",
      initialValue: "Sector",
    }),
    defineField({ name: "listingDescription", title: "Home kaart — beschrijving", type: "text", rows: 4 }),
    defineField({ name: "listingImageUrl", title: "Home kaart — beeld (URL)", type: "url" }),
    defineField({
      name: "listingPills",
      title: "Home kaart — tags",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "heroEyebrow", type: "string" }),
    defineField({
      name: "heroHeadline",
      type: "array",
      of: [{ type: "string" }],
      description: "Regels van de H1 (met <br> in frontend)",
    }),
    defineField({ name: "heroIntro", type: "text", rows: 5 }),
    defineField({ name: "heroPrimaryCta", type: "cta" }),
    defineField({ name: "heroSecondaryCta", type: "cta" }),
    defineField({
      name: "heroMainImageUrl",
      title: "Hero hoofdbeeld (URL)",
      type: "url",
    }),
    defineField({ name: "heroMainImage", type: "imageWithAlt" }),
    defineField({
      name: "heroThumbs",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "imageUrl", type: "url" },
            { name: "label", type: "string" },
          ],
        },
      ],
    }),
    defineField({ name: "tapeItems", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "problemBand",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "variant", type: "string", options: { list: ["problem", "approach"] } },
            { name: "label", type: "string" },
            { name: "title", type: "string" },
            { name: "description", type: "text" },
          ],
        },
      ],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({ name: "solutionsTag", type: "string" }),
    defineField({ name: "solutionsTitle1", type: "string" }),
    defineField({ name: "solutionsTitle2", type: "string" }),
    defineField({ name: "solutionsCta", type: "cta" }),
    defineField({
      name: "solutionCards",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "imageUrl", type: "url" },
            { name: "num", type: "string" },
            { name: "title", type: "string" },
            { name: "description", type: "text" },
            { name: "tags", type: "array", of: [{ type: "string" }] },
            { name: "cta", type: "cta" },
          ],
        },
      ],
    }),
    defineField({
      name: "uspStrip",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "num", type: "string" },
            { name: "title", type: "string" },
            { name: "description", type: "text" },
          ],
        },
      ],
    }),
    defineField({ name: "deepTag", type: "string" }),
    defineField({ name: "deepTitle1", type: "string" }),
    defineField({ name: "deepTitle2", type: "string" }),
    defineField({ name: "deepBody", type: "text", rows: 8 }),
    defineField({ name: "deepPhotoUrl", type: "url" }),
    defineField({ name: "deepPhotoCaptionTag", type: "string" }),
    defineField({ name: "deepPhotoCaption", type: "string" }),
    defineField({ name: "deepPrimaryCta", type: "cta" }),
    defineField({
      name: "deepFaqs",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "num", type: "string" },
            { name: "title", type: "string" },
            { name: "body", type: "text" },
            {
              name: "tags",
              type: "array",
              of: [{ type: "string" }],
            },
          ],
        },
      ],
    }),
    defineField({ name: "complianceBig", type: "string" }),
    defineField({ name: "complianceIntro", type: "text" }),
    defineField({
      name: "complianceItems",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "num", type: "string" },
            { name: "title", type: "string" },
            { name: "description", type: "text" },
          ],
        },
      ],
    }),
    defineField({
      name: "caseStudies",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "featured", type: "boolean" },
            { name: "imageUrl", type: "url" },
            { name: "sectorLabel", type: "string" },
            { name: "title", type: "string" },
            { name: "description", type: "text" },
            { name: "resultValue", type: "string" },
            { name: "resultLabel", type: "string" },
            { name: "quote", type: "text" },
            { name: "quoteAttr", type: "string" },
          ],
        },
      ],
    }),
    defineField({ name: "ctaBandTag", type: "string" }),
    defineField({ name: "ctaBandTitle1", type: "string" }),
    defineField({ name: "ctaBandTitle2", type: "string" }),
    defineField({ name: "ctaBandBody", type: "text" }),
    defineField({
      name: "ctaBandTeam",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "initials", type: "string" },
            { name: "name", type: "string" },
            { name: "role", type: "string" },
          ],
        },
      ],
    }),
  ],
});
