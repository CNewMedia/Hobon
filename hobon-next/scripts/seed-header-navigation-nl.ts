/**
 * Patch NL header navigation: 5 producten, 4 sectoren, CTA.
 * npm run seed:header-nl
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

function menuBlock(items: Record<string, unknown>[]) {
  return items;
}

function menuItem(
  label: string,
  linkType: "internal" | "external" | "dropdown",
  opts: { refId?: string; url?: string; sub?: ReturnType<typeof menuBlock> },
) {
  const base: Record<string, unknown> = {
    _type: "menuItem",
    _key: k(),
    label,
    linkType,
  };
  if (linkType === "internal" && opts.refId) base.internalLink = ref(opts.refId);
  if (linkType === "external" && opts.url) base.externalUrl = opts.url;
  if (linkType === "dropdown" && opts.sub) base.subItems = opts.sub;
  return base;
}

async function main() {
  if (!token) {
    console.error("Missing SANITY_API_WRITE_TOKEN");
    process.exit(1);
  }

  const menuItems = menuBlock([
    menuItem("Home", "internal", { refId: "homePage-nl" }),
    menuItem("Producten", "dropdown", {
      sub: menuBlock([
        menuItem("Blaasfolies", "internal", { refId: "product-nl-blaasfolies" }),
        menuItem("Zakken", "internal", { refId: "product-nl-zakken" }),
        menuItem("Vellen", "internal", { refId: "product-nl-vellen" }),
        menuItem("Stretch hood", "internal", { refId: "product-nl-stretch-hood" }),
        menuItem("PATTYN", "internal", { refId: "product-nl-pattyn" }),
      ]),
    }),
    menuItem("Sectoren", "dropdown", {
      sub: menuBlock([
        menuItem("Voeding", "internal", { refId: "sector-nl-voeding" }),
        menuItem("Logistiek", "internal", { refId: "sector-nl-logistiek" }),
        menuItem("Chemie & industrie", "internal", { refId: "sector-nl-chemie" }),
        menuItem("Agro-industrie", "internal", { refId: "sector-nl-agro" }),
      ]),
    }),
    menuItem("Over Hobon", "internal", { refId: "aboutPage-nl" }),
    menuItem("Duurzaamheid", "internal", { refId: "sustainabilityPage-nl" }),
    menuItem("Insights", "internal", { refId: "insightsOverviewPage-nl" }),
    menuItem("Contact", "internal", { refId: "contactPage-nl" }),
  ]);

  await client
    .patch("headerNavigation-nl")
    .set({
      menuItems,
      ctaButton: {
        label: "Bespreek uw vraag",
        url: "/nl/contact",
        style: "primary",
      },
    })
    .commit({ visibility: "async" });

  console.log("Patched headerNavigation-nl");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
