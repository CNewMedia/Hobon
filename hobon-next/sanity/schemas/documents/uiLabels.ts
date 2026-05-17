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
