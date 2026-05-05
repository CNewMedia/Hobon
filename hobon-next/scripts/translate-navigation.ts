import { createClient } from "@sanity/client";
import {
  HOBON_GLOSSARY,
  mapLocaleHref,
  translateText,
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

type AnyDoc = Record<string, any>;

const CONTEXT =
  "Navigatie labels voor Hobon website, B2B toon. Vertaal kort en natuurlijk voor menu- en footerlinks.";

async function t(value: string | undefined, toLocale: "fr" | "en") {
  if (value == null) return value;
  return translateText({
    text: value,
    fromLocale: "nl",
    toLocale,
    context: CONTEXT,
    glossary: HOBON_GLOSSARY,
  });
}

function mapRefId(id: string | undefined, toLocale: "fr" | "en") {
  if (!id) return id;
  if (id.includes("-nl-")) return id.replace("-nl-", `-${toLocale}-`);
  if (id.endsWith("-nl")) return id.replace(/-nl$/, `-${toLocale}`);
  return id;
}

async function getLocaleSlugMaps(toLocale: "fr" | "en") {
  const sectors = await client.fetch<{ _id: string; slug?: { current?: string } }[]>(
    `*[_type=="sector" && language==$locale]{_id, slug}`,
    { locale: toLocale },
  );
  const products = await client.fetch<{ _id: string; slug?: { current?: string } }[]>(
    `*[_type=="product" && language==$locale]{_id, slug}`,
    { locale: toLocale },
  );

  const sectorByKey = new Map<string, string>();
  const productByKey = new Map<string, string>();
  for (const s of sectors) {
    const key = s._id.replace(`sector-${toLocale}-`, "");
    if (s.slug?.current) sectorByKey.set(key, s.slug.current);
  }
  for (const p of products) {
    const key = p._id.replace(`product-${toLocale}-`, "");
    if (p.slug?.current) productByKey.set(key, p.slug.current);
  }
  return { sectorByKey, productByKey };
}

function mapExternalPath(
  input: string,
  toLocale: "fr" | "en",
  maps: { sectorByKey: Map<string, string>; productByKey: Map<string, string> },
) {
  if (!input.startsWith("/")) return input;
  let url = mapLocaleHref(input, toLocale);

  const sectorMatch = url.match(/^\/(fr|en)\/(secteurs|sectors)\/([^/?#]+)/);
  if (sectorMatch) {
    const nlSlug = sectorMatch[3];
    const key = nlSlug === "voedingsindustrie"
      ? "voeding"
      : nlSlug === "chemie-industrie"
        ? "chemie"
        : nlSlug === "agro-industrie"
          ? "agro"
          : nlSlug;
    const localized = maps.sectorByKey.get(key);
    if (localized) {
      url = url.replace(`/${nlSlug}`, `/${localized}`);
    }
  }

  const productMatch = url.match(/^\/(fr|en)\/(produits|products)\/([^/?#]+)/);
  if (productMatch) {
    const key = productMatch[3];
    const localized = maps.productByKey.get(key);
    if (localized) {
      url = url.replace(`/${key}`, `/${localized}`);
    }
  }

  return url;
}

async function translateMenuItems(
  items: any[] | undefined,
  toLocale: "fr" | "en",
  maps: { sectorByKey: Map<string, string>; productByKey: Map<string, string> },
): Promise<any[] | undefined> {
  if (!items) return items;
  const out: any[] = [];
  for (const item of items) {
    out.push({
      ...item,
      label: await t(item.label, toLocale),
      internalLink: item.internalLink?._ref
        ? {
            ...item.internalLink,
            _ref: mapRefId(item.internalLink._ref, toLocale),
          }
        : item.internalLink,
      externalUrl: item.externalUrl
        ? mapExternalPath(item.externalUrl, toLocale, maps)
        : item.externalUrl,
      subItems: await translateMenuItems(item.subItems, toLocale, maps),
    });
  }
  return out;
}

async function translateFooterLinks(
  links: any[] | undefined,
  toLocale: "fr" | "en",
  maps: { sectorByKey: Map<string, string>; productByKey: Map<string, string> },
) {
  if (!links) return links;
  const out: any[] = [];
  for (const link of links) {
    out.push({
      ...link,
      label: await t(link.label, toLocale),
      internalLink: link.internalLink?._ref
        ? {
            ...link.internalLink,
            _ref: mapRefId(link.internalLink._ref, toLocale),
          }
        : link.internalLink,
      externalUrl: link.externalUrl
        ? mapExternalPath(link.externalUrl, toLocale, maps)
        : link.externalUrl,
    });
  }
  return out;
}

async function translateNavigationForLocale(toLocale: "fr" | "en") {
  const [headerNl, footerNl] = await Promise.all([
    client.fetch<AnyDoc>(`*[_id=="headerNavigation-nl"][0]`),
    client.fetch<AnyDoc>(`*[_id=="footerNavigation-nl"][0]`),
  ]);
  if (!headerNl || !footerNl) throw new Error("Missing headerNavigation-nl or footerNavigation-nl");

  const maps = await getLocaleSlugMaps(toLocale);

  const headerDoc = {
    ...headerNl,
    _id: `headerNavigation-${toLocale}`,
    language: toLocale,
    menuItems: await translateMenuItems(headerNl.menuItems, toLocale, maps),
    ctaButton: headerNl.ctaButton
      ? {
          ...headerNl.ctaButton,
          label: await t(headerNl.ctaButton.label, toLocale),
          url: headerNl.ctaButton.url
            ? mapExternalPath(headerNl.ctaButton.url, toLocale, maps)
            : headerNl.ctaButton.url,
        }
      : headerNl.ctaButton,
  };

  const footerColumns = [];
  for (const col of footerNl.columns ?? []) {
    footerColumns.push({
      ...col,
      title: await t(col.title, toLocale),
      links: await translateFooterLinks(col.links, toLocale, maps),
    });
  }

  const footerDoc = {
    ...footerNl,
    _id: `footerNavigation-${toLocale}`,
    language: toLocale,
    slogan: await t(footerNl.slogan, toLocale),
    columns: footerColumns,
    bottomLinks: await translateFooterLinks(footerNl.bottomLinks, toLocale, maps),
    copyright: await t(footerNl.copyright, toLocale),
  };

  await client.createOrReplace(headerDoc);
  await client.createOrReplace(footerDoc);
  console.log(`Translated navigation to ${toLocale.toUpperCase()}`);
}

async function main() {
  if (!token) throw new Error("Missing SANITY_API_WRITE_TOKEN");
  await translateNavigationForLocale("fr");
  await translateNavigationForLocale("en");
  console.log("Translated navigation docs: headerNavigation-fr/en + footerNavigation-fr/en");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
