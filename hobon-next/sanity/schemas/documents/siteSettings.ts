import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "brcBadgeImage",
      title: "BRC badge (optional override)",
      type: "image",
    }),
    defineField({ name: "phone", title: "Telefoon (Hobon)", type: "string" }),
    defineField({ name: "email", title: "E-mail", type: "string" }),
    defineField({
      name: "hobonAddress",
      title: "Adres Hobon",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "vhpAddress",
      title: "Adres Van Hollebeke Plastics",
      type: "text",
      rows: 3,
    }),
    defineField({ name: "vhpPhone", title: "Telefoon VHP", type: "string" }),
  ],
});
