import { defineField, defineType } from "sanity";

export const analyticsAndTracking = defineType({
  name: "analyticsAndTracking",
  title: "Analytics & tracking",
  type: "document",
  fields: [
    defineField({
      name: "googleAnalyticsId",
      title: "Google Analytics 4 ID",
      type: "string",
      description: 'GA4 Measurement ID, e.g. G-XXXXXXXXXX. Prefer GTM if both are set.',
    }),
    defineField({
      name: "googleTagManagerId",
      title: "Google Tag Manager ID",
      type: "string",
      description: "GTM Container ID, e.g. GTM-XXXXXXX",
    }),
    defineField({
      name: "customHeadScripts",
      title: "Custom head scripts",
      type: "text",
      rows: 6,
      description: "Raw HTML/JS injected in <head>. For pixels not loaded via GTM.",
    }),
    defineField({
      name: "customBodyEndScripts",
      title: "Custom body-end scripts",
      type: "text",
      rows: 6,
      description: "Raw HTML/JS before </body>.",
    }),
    defineField({
      name: "pageOverrides",
      title: "Per-page script overrides",
      type: "array",
      of: [{ type: "pageScriptOverride" }],
    }),
  ],
});
