import { createClient } from "@sanity/client";
import { defaultUILabels } from "../types/uiLabels";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

/** Velden die seed altijd mag bijwerken zonder bestaande vertalingen te overschrijven. */
const PATCH_ON_EXISTING: Partial<typeof defaultUILabels> = {
  aboutKeyFactsTitle: defaultUILabels.aboutKeyFactsTitle,
  insightsListTitle: defaultUILabels.insightsListTitle,
  insightsListSubtitle: defaultUILabels.insightsListSubtitle,
  insightsCtaTitle: defaultUILabels.insightsCtaTitle,
  insightsCtaBody: defaultUILabels.insightsCtaBody,
  insightsCtaButton: defaultUILabels.insightsCtaButton,
  insightsEmpty: defaultUILabels.insightsEmpty,
  insightsCtaParagraph: defaultUILabels.insightsCtaParagraph,
  insightsBackToList: defaultUILabels.insightsBackToList,
  insightsReadingTime: defaultUILabels.insightsReadingTime,
  insightsRelatedTitle: defaultUILabels.insightsRelatedTitle,
  insightsAllLink: defaultUILabels.insightsAllLink,
  // HOB-63 — contact/CTA (NL seed only; FR/EN via migrate:63-contact-labels)
  formFieldFirstnameLabel: defaultUILabels.formFieldFirstnameLabel,
  formFieldLastnameLabel: defaultUILabels.formFieldLastnameLabel,
  formFieldPhoneLabel: defaultUILabels.formFieldPhoneLabel,
  formFieldSectorLabel: defaultUILabels.formFieldSectorLabel,
  formFieldMessageLabel: defaultUILabels.formFieldMessageLabel,
  formPlaceholderName: defaultUILabels.formPlaceholderName,
  formPlaceholderCompany: defaultUILabels.formPlaceholderCompany,
  formPlaceholderEmail: defaultUILabels.formPlaceholderEmail,
  formSectorOptions: defaultUILabels.formSectorOptions.map((opt) => ({
    ...opt,
    _key: `sector-${opt.value}`,
  })),
  formContactSuccessMessage: defaultUILabels.formContactSuccessMessage,
  formSuccessKicker: defaultUILabels.formSuccessKicker,
  formAskAgain: defaultUILabels.formAskAgain,
  formErrorInvalidJson: defaultUILabels.formErrorInvalidJson,
  formErrorRateLimit: defaultUILabels.formErrorRateLimit,
  formErrorSendFailed: defaultUILabels.formErrorSendFailed,
  formErrorInvalidRequest: defaultUILabels.formErrorInvalidRequest,
  formErrorInvalidEmail: defaultUILabels.formErrorInvalidEmail,
  formErrorRequiredFirstname: defaultUILabels.formErrorRequiredFirstname,
  formErrorRequiredLastname: defaultUILabels.formErrorRequiredLastname,
  formErrorRequiredSector: defaultUILabels.formErrorRequiredSector,
  formErrorRequiredMessage: defaultUILabels.formErrorRequiredMessage,
  formErrorRequiredName: defaultUILabels.formErrorRequiredName,
  formErrorRequiredCompany: defaultUILabels.formErrorRequiredCompany,
  formSuccessMessage: defaultUILabels.formSuccessMessage,
  // HOB-67 — product sectiekoppen + lightbox-aria (NL seed only; FR/EN via migrate:67-product-labels)
  productGalleryTag: defaultUILabels.productGalleryTag,
  productGalleryTitle: defaultUILabels.productGalleryTitle,
  productSolutionsTag: defaultUILabels.productSolutionsTag,
  productSolutionsTitle: defaultUILabels.productSolutionsTitle,
  productFaqTitle: defaultUILabels.productFaqTitle,
  uiAriaClose: defaultUILabels.uiAriaClose,
  uiAriaPrev: defaultUILabels.uiAriaPrev,
  uiAriaNext: defaultUILabels.uiAriaNext,
  uiLightboxEnlarge: defaultUILabels.uiLightboxEnlarge,
};

async function main() {
  if (!token) throw new Error("Missing SANITY_API_WRITE_TOKEN");

  const existing = await client.fetch<{ _id: string } | null>(`*[_id == "uiLabels-nl"][0]{ _id }`);

  if (existing) {
    await client.patch("uiLabels-nl").set(PATCH_ON_EXISTING).commit();
    console.log("Patched uiLabels-nl:", Object.keys(PATCH_ON_EXISTING).join(", "));
    return;
  }

  const doc = {
    _id: "uiLabels-nl",
    _type: "uiLabels",
    language: "nl",
    ...defaultUILabels,
  };

  await client.createOrReplace(doc);
  console.log("Created uiLabels-nl (full seed)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
