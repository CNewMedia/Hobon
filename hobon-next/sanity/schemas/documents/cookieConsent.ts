import { defineField, defineType } from "sanity";

export const cookieConsent = defineType({
  name: "cookieConsent",
  title: "Cookie consent",
  type: "document",
  fields: [
    defineField({
      name: "provider",
      title: "Provider",
      type: "string",
      initialValue: "cookiebot",
    }),
    defineField({
      name: "cookiebotCbid",
      title: "Cookiebot Domain Group ID (CBID)",
      type: "string",
      description: "Ask the client for their Cookiebot account ID.",
      initialValue: "[YOUR_COOKIEBOT_CBID]",
    }),
    defineField({
      name: "cookiebotEnabled",
      title: "Cookiebot enabled",
      type: "boolean",
      initialValue: false,
      description: "Enable only when CBID is configured. When off, tracking snippets are not rendered.",
    }),
  ],
});
