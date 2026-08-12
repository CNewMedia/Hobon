import { defineField, defineType } from "sanity";

export const uiLabels = defineType({
  name: "uiLabels",
  title: "UI labels",
  type: "document",
  groups: [
    { name: "product", title: "Product", default: true },
    { name: "sector", title: "Sector" },
    { name: "listing", title: "Listing" },
    { name: "home", title: "Home" },
    { name: "about", title: "About" },
    { name: "insights", title: "Insights" },
    { name: "ui", title: "UI" },
    { name: "form", title: "Form" },
  ],
  fields: [
    defineField({ name: "language", type: "string", readOnly: true, hidden: true }),

    defineField({ name: "productAllProducts", type: "string", group: "product" }),
    defineField({ name: "productHighestCertLevel", type: "string", group: "product" }),
    defineField({ name: "productTechnical", type: "string", group: "product" }),
    defineField({ name: "productSpecifications", type: "string", group: "product" }),
    defineField({ name: "productApplications", type: "string", group: "product" }),
    defineField({ name: "productApplicationsQuestion", type: "string", group: "product" }),
    defineField({ name: "productExpertise", type: "string", group: "product" }),
    defineField({ name: "productSectors", type: "string", group: "product" }),
    defineField({ name: "productCommonlyUsedIn", type: "string", group: "product" }),
    defineField({ name: "productContact", type: "string", group: "product" }),
    defineField({ name: "productExtra", type: "string", group: "product" }),
    defineField({ name: "productNotes", type: "string", group: "product" }),
    defineField({ name: "productSolutionsTag", type: "string", group: "product" }),
    defineField({ name: "productSolutionsTitle", type: "string", group: "product" }),
    defineField({ name: "productGalleryTag", type: "string", group: "product" }),
    defineField({ name: "productGalleryTitle", type: "string", group: "product" }),
    defineField({ name: "productFaqTitle", type: "string", group: "product" }),

    defineField({ name: "sectorHighestCertLevel", type: "string", group: "sector" }),
    defineField({ name: "sectorYearsExpertise", type: "string", group: "sector" }),
    defineField({ name: "sectorMaterialsForFood", type: "string", group: "sector" }),
    defineField({ name: "sectorScroll", type: "string", group: "sector" }),
    defineField({ name: "sectorCommonChallenges", type: "string", group: "sector" }),
    defineField({ name: "sectorComplianceGuarantees", type: "string", group: "sector" }),
    defineField({ name: "sectorApplicationsInPractice", type: "string", group: "sector" }),
    defineField({ name: "sectorTypicalChallenges", type: "string", group: "sector" }),
    defineField({ name: "sectorOtherSectors", type: "string", group: "sector" }),
    defineField({ name: "sectorAlsoActiveIn", type: "string", group: "sector" }),

    defineField({ name: "listingSectorFallback", type: "string", group: "listing" }),
    defineField({ name: "listingProductFallback", type: "string", group: "listing" }),
    defineField({ name: "listingReadMore", type: "string", group: "listing" }),
    defineField({ name: "listingContact", type: "string", group: "listing" }),

    defineField({ name: "homeScroll", type: "string", group: "home" }),
    defineField({ name: "homeSectorFallback", type: "string", group: "home" }),
    defineField({ name: "homeDragSectors", type: "string", group: "home" }),

    defineField({ name: "aboutKeyFactsTitle", title: "Kerncijfers (sectietitel)", type: "string", group: "about" }),

    defineField({ name: "insightsListTitle", title: "Lijst — titel", type: "string", group: "insights" }),
    defineField({ name: "insightsListSubtitle", title: "Lijst — ondertitel", type: "string", group: "insights" }),
    defineField({ name: "insightsCtaTitle", title: "CTA — titel", type: "string", group: "insights" }),
    defineField({ name: "insightsCtaBody", title: "CTA — ondertitel (span)", type: "string", group: "insights" }),
    defineField({ name: "insightsCtaButton", title: "CTA — knop", type: "string", group: "insights" }),
    defineField({ name: "insightsEmpty", title: "Lege staat", type: "string", group: "insights" }),
    defineField({ name: "insightsCtaParagraph", title: "CTA — paragraaf", type: "string", group: "insights" }),
    defineField({ name: "insightsBackToList", title: "Detail — terug naar lijst", type: "string", group: "insights" }),
    defineField({
      name: "insightsReadingTime",
      title: "Detail — leestijd ({n} = minuten)",
      type: "string",
      group: "insights",
    }),
    defineField({ name: "insightsRelatedTitle", title: "Detail — gerelateerde artikels", type: "string", group: "insights" }),
    defineField({ name: "insightsAllLink", title: "Detail — alle artikels (fallback)", type: "string", group: "insights" }),

    defineField({ name: "uiOpenMenu", type: "string", group: "ui" }),
    defineField({ name: "uiBrcLevelLabel", type: "string", group: "ui" }),
    defineField({ name: "uiContactMailSubject", type: "string", group: "ui" }),
    defineField({ name: "uiContactMapPlaceholder", type: "string", group: "ui" }),

    defineField({ name: "formFieldNameLabel", type: "string", group: "form" }),
    defineField({ name: "formFieldCompanyLabel", type: "string", group: "form" }),
    defineField({ name: "formFieldEmailLabel", type: "string", group: "form" }),
    defineField({ name: "formFieldChallengeLabel", type: "string", group: "form" }),
    defineField({ name: "formChallengePlaceholder", type: "text", rows: 3, group: "form" }),
    defineField({ name: "formIntentLabel", type: "string", group: "form" }),
    defineField({ name: "formIntentPlaceholder", type: "string", group: "form" }),
    defineField({
      name: "formIntentOptions",
      type: "array",
      group: "form",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "value", type: "string", validation: (r) => r.required() }),
            defineField({ name: "label", type: "string", validation: (r) => r.required() }),
          ],
        },
      ],
    }),
    defineField({ name: "formSubmitLabel", type: "string", group: "form" }),
    defineField({ name: "formDisclaimerText", type: "text", rows: 3, group: "form" }),
    defineField({ name: "formPrivacyLinkLabel", type: "string", group: "form" }),
    defineField({ name: "formSuccessMessage", type: "string", group: "form" }),
  ],
  preview: {
    select: { lang: "language" },
    prepare({ lang }) {
      return { title: `UI labels (${lang ?? "?"})` };
    },
  },
});
