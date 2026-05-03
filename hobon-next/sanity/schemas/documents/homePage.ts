import { defineField, defineType } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "language",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
    defineField({ name: "heroEyebrow", type: "string" }),
    defineField({ name: "heroH1Line1", type: "string" }),
    defineField({ name: "heroH1Accent", type: "string" }),
    defineField({ name: "heroH1Soft", type: "string" }),
    defineField({ name: "heroSub", type: "text", rows: 5 }),
    defineField({ name: "heroPrimaryCta", type: "cta" }),
    defineField({ name: "heroSecondaryCta", type: "cta" }),
    defineField({ name: "brcTitle", type: "string" }),
    defineField({ name: "brcSub", type: "string" }),
    defineField({ name: "tapeItems", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "stats",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "kind", type: "string", options: { list: ["number", "text"] } },
            { name: "value", type: "string" },
            { name: "label", type: "string" },
          ],
        },
      ],
    }),
    defineField({ name: "aboutTag", type: "string" }),
    defineField({ name: "aboutHeadline1", type: "text", rows: 2 }),
    defineField({ name: "aboutHeadlineSub", type: "string" }),
    defineField({ name: "aboutBody", type: "text", rows: 4 }),
    defineField({ name: "aboutImage", type: "imageWithAlt" }),
    defineField({ name: "aboutPhotoTag", type: "string" }),
    defineField({ name: "aboutPhotoCaption", type: "string" }),
    defineField({ name: "aboutFloatNum", type: "string" }),
    defineField({ name: "aboutFloatTitle", type: "string" }),
    defineField({ name: "aboutFloatSub", type: "string" }),
    defineField({ name: "usps", type: "array", of: [{ type: "usp" }] }),
    defineField({ name: "processTag", type: "string" }),
    defineField({ name: "processTitle1", type: "string" }),
    defineField({ name: "processTitle2", type: "string" }),
    defineField({ name: "processCta", type: "cta" }),
    defineField({
      name: "processSteps",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "step", type: "string" },
            { name: "title", type: "string" },
            { name: "description", type: "text", rows: 3 },
          ],
        },
      ],
    }),
    defineField({ name: "productsTag", type: "string" }),
    defineField({ name: "productsTitle1", type: "string" }),
    defineField({ name: "productsTitle2", type: "string" }),
    defineField({
      name: "productCards",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "tag", type: "string" },
            { name: "title", type: "string" },
            { name: "description", type: "text", rows: 4 },
            { name: "featured", type: "boolean" },
            {
              name: "specs",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    { name: "key", type: "string" },
                    { name: "value", type: "string" },
                  ],
                },
              ],
            },
            { name: "cta", type: "cta" },
          ],
        },
      ],
    }),
    defineField({ name: "sectorsTag", type: "string" }),
    defineField({ name: "sectorsTitle1", type: "string" }),
    defineField({ name: "sectorsTitle2", type: "string" }),
    defineField({ name: "sectorsCta", type: "cta" }),
    defineField({ name: "qualityBig", type: "string" }),
    defineField({ name: "qualityLabel", type: "text", rows: 3 }),
    defineField({
      name: "qualityItems",
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
    defineField({ name: "contactTag", type: "string" }),
    defineField({ name: "contactHeadline1", type: "string" }),
    defineField({ name: "contactHeadline2", type: "string" }),
    defineField({ name: "contactBody", type: "text", rows: 4 }),
    defineField({
      name: "contactTeam",
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
    defineField({ name: "contactSidebarBody", type: "text" }),
    defineField({ name: "contactSidebarCta", type: "cta" }),
    defineField({ name: "footerTagline", type: "text" }),
  ],
});
