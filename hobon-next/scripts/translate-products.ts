import { createClient } from "@sanity/client";
import {
  HOBON_GLOSSARY,
  mapLocaleHref,
  normalizeSlug,
  suggestSlug,
  translatePayload,
} from "./lib/translate-with-claude";
import { getLocalizedRef } from "../lib/sanity/locale-mapping";

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

type ProductDoc = Record<string, any>;

async function translateProductDoc(doc: ProductDoc, toLocale: "fr" | "en") {
  const slugBase = doc.slug?.current ?? doc.title ?? doc._id;
  const suggested = await suggestSlug({
    sourceText: slugBase,
    targetLocale: toLocale,
    context: "Hobon productpagina slug",
  });

  const payload = {
    title: doc.title,
    listingEyebrow: doc.listingEyebrow,
    listingDescription: doc.listingDescription,
    heroEyebrow: doc.heroEyebrow,
    heroHeadline: doc.heroHeadline,
    heroIntro: doc.heroIntro,
    heroPrimaryCtaLabel: doc.heroPrimaryCta?.label,
    heroSecondaryCtaLabel: doc.heroSecondaryCta?.label,
    specifications: doc.specifications?.map((x: any) => ({ title: x.title, body: x.body })),
    applications: doc.applications,
    whyHobonTitle: doc.whyHobonTitle,
    whyHobonBody: doc.whyHobonBody,
    ctaBandTitle1: doc.ctaBandTitle1,
    ctaBandBody: doc.ctaBandBody,
    ctaBandPrimaryLabel: doc.ctaBandPrimary?.label,
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
    listingEyebrow: translatedPayload.listingEyebrow,
    listingDescription: translatedPayload.listingDescription,
    heroEyebrow: translatedPayload.heroEyebrow,
    heroHeadline: translatedPayload.heroHeadline,
    heroIntro: translatedPayload.heroIntro,
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
    specifications: doc.specifications
      ? doc.specifications.map((x: any, i: number) => ({
            ...x,
            title: translatedPayload.specifications?.[i]?.title,
            body: translatedPayload.specifications?.[i]?.body,
          }))
      : doc.specifications,
    applications: translatedPayload.applications,
    whyHobonTitle: translatedPayload.whyHobonTitle,
    whyHobonBody: translatedPayload.whyHobonBody,
    ctaBandTitle1: translatedPayload.ctaBandTitle1,
    ctaBandBody: translatedPayload.ctaBandBody,
    ctaBandPrimary: doc.ctaBandPrimary
      ? {
          ...doc.ctaBandPrimary,
          label: translatedPayload.ctaBandPrimaryLabel,
          href: mapLocaleHref(doc.ctaBandPrimary.href ?? "", toLocale),
        }
      : doc.ctaBandPrimary,
    relatedSectors: doc.relatedSectors?.map((ref: any) => ({
      ...ref,
      _ref: typeof ref?._ref === "string" ? getLocalizedRef(ref._ref, toLocale) : ref?._ref,
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

  const products = await client.fetch<ProductDoc[]>(
    `*[_type == "product" && language == "nl"] | order(title asc){
      ...,
      slug,
      seo
    }`,
  );

  const filtered = isTest
    ? products.filter((p) => p._id === "product-nl-pattyn")
    : products;

  let i = 0;
  for (const doc of filtered) {
    const fr = await translateProductDoc(doc, "fr");
    const en = await translateProductDoc(doc, "en");
    i += 1;

    if (isTest) {
      console.log("=== TEST PRODUCT ===", doc._id);
      console.log("FR slug:", fr.slug?.current, "title:", fr.title);
      console.log("EN slug:", en.slug?.current, "title:", en.title);
      console.log("FR whyHobonBody:", fr.whyHobonBody);
      console.log("EN whyHobonBody:", en.whyHobonBody);
      continue;
    }

    await client.createOrReplace(fr);
    await client.createOrReplace(en);
    console.log(`Translated ${i}/${filtered.length} products to FR, EN`);
  }

  if (!filtered.length) console.log("No product documents found.");
  if (isTest) console.log("Test mode only. No writes executed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
