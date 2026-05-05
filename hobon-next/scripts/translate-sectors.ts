import { createClient } from "@sanity/client";
import {
  HOBON_GLOSSARY,
  mapLocaleHref,
  normalizeSlug,
  suggestSlug,
  translatePayload,
} from "./lib/translate-with-claude";

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

const isTest = process.argv.includes("--test");
const CONTEXT =
  "B2B verpakkingsfolie marketing copy voor Hobon; formele toon (vous/votre of you/your), jargon consistent.";

type SectorDoc = Record<string, any>;

async function translateSectorDoc(doc: SectorDoc, toLocale: "fr" | "en") {
  const slugBase = doc.slug?.current ?? doc.title ?? doc._id;
  const suggested = await suggestSlug({
    sourceText: slugBase,
    targetLocale: toLocale,
    context: "Hobon sectorpagina slug",
  });

  const payload = {
    title: doc.title,
    navLabel: doc.navLabel,
    listingEyebrow: doc.listingEyebrow,
    listingDescription: doc.listingDescription,
    heroEyebrow: doc.heroEyebrow,
    heroHeadline: doc.heroHeadline,
    heroIntro: doc.heroIntro,
    tapeItems: doc.tapeItems,
    problemBand: doc.problemBand?.map((x: any) => ({
      label: x.label,
      title: x.title,
      description: x.description,
    })),
    solutionsTag: doc.solutionsTag,
    solutionsTitle1: doc.solutionsTitle1,
    solutionsTitle2: doc.solutionsTitle2,
    solutionCards: doc.solutionCards?.map((x: any) => ({
      title: x.title,
      description: x.description,
      tags: x.tags,
      ctaLabel: x.cta?.label,
    })),
    uspStrip: doc.uspStrip?.map((x: any) => ({ title: x.title, description: x.description })),
    deepTag: doc.deepTag,
    deepTitle1: doc.deepTitle1,
    deepTitle2: doc.deepTitle2,
    deepBody: doc.deepBody,
    deepPhotoCaptionTag: doc.deepPhotoCaptionTag,
    deepPhotoCaption: doc.deepPhotoCaption,
    deepFaqs: doc.deepFaqs?.map((x: any) => ({ title: x.title, body: x.body, tags: x.tags })),
    complianceBig: doc.complianceBig,
    complianceIntro: doc.complianceIntro,
    complianceItems: doc.complianceItems?.map((x: any) => ({
      title: x.title,
      description: x.description,
    })),
    caseStudies: doc.caseStudies?.map((x: any) => ({
      sectorLabel: x.sectorLabel,
      title: x.title,
      description: x.description,
      resultLabel: x.resultLabel,
      quote: x.quote,
      quoteAttr: x.quoteAttr,
    })),
    ctaBandTag: doc.ctaBandTag,
    ctaBandTitle1: doc.ctaBandTitle1,
    ctaBandTitle2: doc.ctaBandTitle2,
    ctaBandBody: doc.ctaBandBody,
    ctaBandTeam: doc.ctaBandTeam?.map((x: any) => ({ name: x.name, role: x.role })),
    heroPrimaryCtaLabel: doc.heroPrimaryCta?.label,
    heroSecondaryCtaLabel: doc.heroSecondaryCta?.label,
    solutionsCtaLabel: doc.solutionsCta?.label,
    deepPrimaryCtaLabel: doc.deepPrimaryCta?.label,
    ctaBandPrimaryLabel: doc.ctaBandPrimary?.label,
    heroThumbLabels: doc.heroThumbs?.map((x: any) => x.label),
    seoMetaTitle: doc.seo?.metaTitle,
    seoMetaDescription: doc.seo?.metaDescription,
  };

  const translatedPayload = await translatePayload({
    payload,
    toLocale,
    context: CONTEXT,
    glossary: HOBON_GLOSSARY,
  });

  return {
    ...doc,
    _id: doc._id.replace("-nl-", `-${toLocale}-`),
    _type: doc._type,
    language: toLocale,
    slug: { ...doc.slug, current: normalizeSlug(suggested || slugBase) || slugBase },
    title: translatedPayload.title,
    navLabel: translatedPayload.navLabel,
    listingEyebrow: translatedPayload.listingEyebrow,
    listingDescription: translatedPayload.listingDescription,
    heroEyebrow: translatedPayload.heroEyebrow,
    heroHeadline: translatedPayload.heroHeadline,
    heroIntro: translatedPayload.heroIntro,
    tapeItems: translatedPayload.tapeItems,
    problemBand: doc.problemBand?.map((x: any, i: number) => ({
      ...x,
      label: translatedPayload.problemBand?.[i]?.label,
      title: translatedPayload.problemBand?.[i]?.title,
      description: translatedPayload.problemBand?.[i]?.description,
    })),
    solutionsTag: translatedPayload.solutionsTag,
    solutionsTitle1: translatedPayload.solutionsTitle1,
    solutionsTitle2: translatedPayload.solutionsTitle2,
    solutionCards: doc.solutionCards?.map((x: any, i: number) => ({
      ...x,
      title: translatedPayload.solutionCards?.[i]?.title,
      description: translatedPayload.solutionCards?.[i]?.description,
      tags: translatedPayload.solutionCards?.[i]?.tags,
      cta: x.cta
        ? {
            ...x.cta,
            label: translatedPayload.solutionCards?.[i]?.ctaLabel,
            href: mapLocaleHref(x.cta.href ?? "", toLocale),
          }
        : x.cta,
    })),
    uspStrip: doc.uspStrip?.map((x: any, i: number) => ({
      ...x,
      title: translatedPayload.uspStrip?.[i]?.title,
      description: translatedPayload.uspStrip?.[i]?.description,
    })),
    deepTag: translatedPayload.deepTag,
    deepTitle1: translatedPayload.deepTitle1,
    deepTitle2: translatedPayload.deepTitle2,
    deepBody: translatedPayload.deepBody,
    deepPhotoCaptionTag: translatedPayload.deepPhotoCaptionTag,
    deepPhotoCaption: translatedPayload.deepPhotoCaption,
    deepFaqs: doc.deepFaqs?.map((x: any, i: number) => ({
      ...x,
      title: translatedPayload.deepFaqs?.[i]?.title,
      body: translatedPayload.deepFaqs?.[i]?.body,
      tags: translatedPayload.deepFaqs?.[i]?.tags,
    })),
    complianceBig: translatedPayload.complianceBig,
    complianceIntro: translatedPayload.complianceIntro,
    complianceItems: doc.complianceItems?.map((x: any, i: number) => ({
      ...x,
      title: translatedPayload.complianceItems?.[i]?.title,
      description: translatedPayload.complianceItems?.[i]?.description,
    })),
    caseStudies: doc.caseStudies?.map((x: any, i: number) => ({
      ...x,
      sectorLabel: translatedPayload.caseStudies?.[i]?.sectorLabel,
      title: translatedPayload.caseStudies?.[i]?.title,
      description: translatedPayload.caseStudies?.[i]?.description,
      resultLabel: translatedPayload.caseStudies?.[i]?.resultLabel,
      quote: translatedPayload.caseStudies?.[i]?.quote,
      quoteAttr: translatedPayload.caseStudies?.[i]?.quoteAttr,
    })),
    ctaBandTag: translatedPayload.ctaBandTag,
    ctaBandTitle1: translatedPayload.ctaBandTitle1,
    ctaBandTitle2: translatedPayload.ctaBandTitle2,
    ctaBandBody: translatedPayload.ctaBandBody,
    ctaBandTeam: doc.ctaBandTeam?.map((x: any, i: number) => ({
      ...x,
      name: translatedPayload.ctaBandTeam?.[i]?.name,
      role: translatedPayload.ctaBandTeam?.[i]?.role,
    })),
    heroPrimaryCta: doc.heroPrimaryCta
      ? {
          ...doc.heroPrimaryCta,
          label: translatedPayload.heroPrimaryCtaLabel,
          href: mapLocaleHref(doc.heroPrimaryCta.href ?? "", toLocale),
        }
      : doc.heroPrimaryCta,
    heroSecondaryCta: doc.heroSecondaryCta
      ? {
          ...doc.heroSecondaryCta,
          label: translatedPayload.heroSecondaryCtaLabel,
          href: mapLocaleHref(doc.heroSecondaryCta.href ?? "", toLocale),
        }
      : doc.heroSecondaryCta,
    solutionsCta: doc.solutionsCta
      ? {
          ...doc.solutionsCta,
          label: translatedPayload.solutionsCtaLabel,
          href: mapLocaleHref(doc.solutionsCta.href ?? "", toLocale),
        }
      : doc.solutionsCta,
    deepPrimaryCta: doc.deepPrimaryCta
      ? {
          ...doc.deepPrimaryCta,
          label: translatedPayload.deepPrimaryCtaLabel,
          href: mapLocaleHref(doc.deepPrimaryCta.href ?? "", toLocale),
        }
      : doc.deepPrimaryCta,
    ctaBandPrimary: doc.ctaBandPrimary
      ? {
          ...doc.ctaBandPrimary,
          label: translatedPayload.ctaBandPrimaryLabel,
          href: mapLocaleHref(doc.ctaBandPrimary.href ?? "", toLocale),
        }
      : doc.ctaBandPrimary,
    heroThumbs: doc.heroThumbs?.map((x: any, i: number) => ({
      ...x,
      label: translatedPayload.heroThumbLabels?.[i],
    })),
    seo: doc.seo
      ? {
          ...doc.seo,
          metaTitle: translatedPayload.seoMetaTitle,
          metaDescription: translatedPayload.seoMetaDescription,
        }
      : doc.seo,
  };
}

async function main() {
  if (!token) throw new Error("Missing SANITY_API_WRITE_TOKEN");

  const sectors = await client.fetch<SectorDoc[]>(
    `*[_type == "sector" && language == "nl"] | order(sortOrder asc){
      ...,
      slug,
      seo
    }`,
  );

  const filtered = isTest
    ? sectors.filter((s) => s._id === "sector-nl-voeding")
    : sectors;

  let i = 0;
  for (const doc of filtered) {
    const fr = await translateSectorDoc(doc, "fr");
    const en = await translateSectorDoc(doc, "en");
    i += 1;

    if (isTest) {
      console.log("=== TEST SECTOR ===", doc._id);
      console.log("FR slug:", fr.slug?.current, "title:", fr.title);
      console.log("EN slug:", en.slug?.current, "title:", en.title);
      console.log("FR listingDescription:", fr.listingDescription);
      console.log("EN listingDescription:", en.listingDescription);
      continue;
    }

    await client.createOrReplace(fr);
    await client.createOrReplace(en);
    console.log(`Translated ${i}/${filtered.length} sectors to FR, EN`);
  }

  if (!filtered.length) {
    console.log("No sector documents found.");
  }

  if (isTest) {
    console.log("Test mode only. No writes executed.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
