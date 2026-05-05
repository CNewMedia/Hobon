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
  "B2B overzichtspagina copy voor Hobon; formele toon (vous/votre of you/your), beknopt en scanbaar.";

type OverviewDoc = Record<string, any>;

async function translateOverview(doc: OverviewDoc, toLocale: "fr" | "en") {
  const slugBase = doc.slug?.current ?? doc.title ?? doc._id;
  const suggested = doc.slug?.current
    ? await suggestSlug({
        sourceText: slugBase,
        targetLocale: toLocale,
        context: `${doc._type} slug`,
      })
    : "";

  const payload = {
    title: doc.title,
    intro: doc.intro,
    heroEyebrow: doc.heroEyebrow,
    heroTitle: doc.heroTitle,
    heroIntro: doc.heroIntro,
    ctaBandTitle: doc.ctaBandTitle,
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
    _id: doc._id.replace("-nl", `-${toLocale}`),
    _type: doc._type,
    language: toLocale,
    ...(doc.slug
      ? { slug: { ...doc.slug, current: normalizeSlug(suggested || slugBase) || slugBase } }
      : {}),
    title: translatedPayload.title,
    intro: translatedPayload.intro,
    heroEyebrow: translatedPayload.heroEyebrow,
    heroTitle: translatedPayload.heroTitle,
    heroIntro: translatedPayload.heroIntro,
    ctaBandTitle: translatedPayload.ctaBandTitle,
    ctaBandBody: translatedPayload.ctaBandBody,
    ctaBandPrimary: doc.ctaBandPrimary
      ? {
          ...doc.ctaBandPrimary,
          label: translatedPayload.ctaBandPrimaryLabel,
          href: mapLocaleHref(doc.ctaBandPrimary.href ?? "", toLocale),
        }
      : doc.ctaBandPrimary,
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

  const docs = await client.fetch<OverviewDoc[]>(
    `*[_type in ["sectorOverviewPage","productOverviewPage"] && language == "nl"]{..., seo}`,
  );

  for (const doc of docs) {
    const fr = await translateOverview(doc, "fr");
    const en = await translateOverview(doc, "en");

    if (isTest) {
      console.log(`=== TEST OVERVIEW ${doc._id} ===`);
      console.log("FR heroTitle:", fr.heroTitle);
      console.log("EN heroTitle:", en.heroTitle);
      continue;
    }

    await client.createOrReplace(fr);
    await client.createOrReplace(en);
    console.log(`Translated overview ${doc._id} to FR, EN`);
  }

  if (!docs.length) console.log("No overview singleton docs found.");
  if (isTest) console.log("Test mode only. No writes executed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
