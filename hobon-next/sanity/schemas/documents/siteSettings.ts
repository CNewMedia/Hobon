import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "companyName",
      title: "Company name",
      type: "string",
      initialValue: "Hobon",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "imageWithAlt",
    }),
    defineField({
      name: "brcBadge",
      title: "BRC badge",
      type: "imageWithAlt",
      description: "Optional image for BRC certification mark in footer",
    }),
    defineField({
      name: "formRecipientEmail",
      title: "Form recipient email",
      type: "string",
      initialValue: "info@cnip.be",
      description: "Change to info@hobon.be at go-live",
    }),
    defineField({
      name: "primaryPhone",
      title: "Primary phone (structured data / contact)",
      type: "string",
    }),
    defineField({
      name: "primaryEmail",
      title: "Primary email (structured data / contact)",
      type: "string",
    }),
    defineField({
      name: "locations",
      title: "Locations",
      type: "array",
      of: [{ type: "location" }],
    }),
  ],
});
