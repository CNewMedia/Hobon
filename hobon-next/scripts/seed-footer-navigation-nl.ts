/**
 * Patch NL footer: producten-, sectoren-, bedrijf-kolommen + bottom links + slogan.
 * Bottom links gebruiken paden /nl/privacy en /nl/cookies (externe string in CMS).
 * npm run seed:footer-nl
 */
import { createClient } from "@sanity/client";

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

const k = () => Math.random().toString(36).slice(2, 12);
const ref = (id: string) => ({ _type: "reference", _ref: id });

function footerLink(
  label: string,
  linkType: "internal" | "external",
  opts: { refId?: string; url?: string },
) {
  const o: Record<string, unknown> = {
    _type: "footerLink",
    _key: k(),
    label,
    linkType,
  };
  if (linkType === "internal" && opts.refId) o.internalLink = ref(opts.refId);
  if (linkType === "external" && opts.url) o.externalUrl = opts.url;
  return o;
}

function footerColumn(title: string, links: Record<string, unknown>[]) {
  return {
    _type: "footerColumn",
    _key: k(),
    title,
    links,
  };
}

async function main() {
  if (!token) {
    console.error("Missing SANITY_API_WRITE_TOKEN");
    process.exit(1);
  }

  const columns = [
    footerColumn("Producten", [
      footerLink("Productoverzicht", "internal", { refId: "productOverviewPage-nl" }),
      footerLink("Blaasfolies", "internal", { refId: "product-nl-blaasfolies" }),
      footerLink("Zakken", "internal", { refId: "product-nl-zakken" }),
      footerLink("Vellen", "internal", { refId: "product-nl-vellen" }),
      footerLink("Stretch hood", "internal", { refId: "product-nl-stretch-hood" }),
      footerLink("PATTYN", "internal", { refId: "product-nl-pattyn" }),
    ]),
    footerColumn("Sectoren", [
      footerLink("Alle sectoren", "internal", { refId: "sectorOverviewPage-nl" }),
      footerLink("Voeding", "internal", { refId: "sector-nl-voeding" }),
      footerLink("Logistiek", "internal", { refId: "sector-nl-logistiek" }),
      footerLink("Chemie & industrie", "internal", { refId: "sector-nl-chemie" }),
      footerLink("Agro-industrie", "internal", { refId: "sector-nl-agro" }),
    ]),
    footerColumn("Bedrijf", [
      footerLink("Over Hobon", "internal", { refId: "aboutPage-nl" }),
      footerLink("Duurzaamheid", "internal", { refId: "sustainabilityPage-nl" }),
      footerLink("Contact", "internal", { refId: "contactPage-nl" }),
    ]),
  ];

  const bottomLinks = [
    footerLink("Privacy Policy", "external", { url: "/nl/privacy" }),
    footerLink("Cookiebeleid", "external", { url: "/nl/cookies" }),
    footerLink("BRC-certificaat", "external", { url: "https://www.brcgs.com/" }),
  ];

  await client
    .patch("footerNavigation-nl")
    .set({
      slogan: "Hobon — uw technische partner voor verpakkingsfolie op maat.",
      columns,
      bottomLinks,
    })
    .commit({ visibility: "async" });

  console.log("Patched footerNavigation-nl");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
