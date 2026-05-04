/**
 * Vult sectorOverviewPage / productOverviewPage met hero- en CTA-bandvelden.
 * Copy: [Frederik nalezen aparte file] behalve NL CTA-knop (goedgekeurd patroon).
 *
 * npm run seed:overview-singletons
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

const M = "[Frederik nalezen aparte file]";

const nlCta = { label: "Bespreek uw verpakkingsvraag", href: "/nl/contact" };

async function main() {
  if (!token) {
    console.error("Missing SANITY_API_WRITE_TOKEN");
    process.exit(1);
  }

  await client
    .patch("sectorOverviewPage-nl")
    .set({
      heroEyebrow: M,
      heroTitle: M,
      heroIntro: M,
      ctaBandTitle: M,
      ctaBandBody: M,
      ctaBandPrimary: nlCta,
    })
    .commit({ visibility: "async" });
  console.log("sectorOverviewPage-nl");

  await client
    .patch("productOverviewPage-nl")
    .set({
      heroEyebrow: M,
      heroTitle: M,
      heroIntro: M,
      ctaBandTitle: M,
      ctaBandBody: M,
      ctaBandPrimary: nlCta,
    })
    .commit({ visibility: "async" });
  console.log("productOverviewPage-nl");

  const frCta = { label: M, href: "/fr/contact" };
  const enCta = { label: M, href: "/en/contact" };

  await client
    .patch("sectorOverviewPage-fr")
    .set({
      heroEyebrow: M,
      heroTitle: M,
      heroIntro: M,
      ctaBandTitle: M,
      ctaBandBody: M,
      ctaBandPrimary: frCta,
    })
    .commit({ visibility: "async" });
  await client
    .patch("sectorOverviewPage-en")
    .set({
      heroEyebrow: M,
      heroTitle: M,
      heroIntro: M,
      ctaBandTitle: M,
      ctaBandBody: M,
      ctaBandPrimary: enCta,
    })
    .commit({ visibility: "async" });

  await client
    .patch("productOverviewPage-fr")
    .set({
      heroEyebrow: M,
      heroTitle: M,
      heroIntro: M,
      ctaBandTitle: M,
      ctaBandBody: M,
      ctaBandPrimary: frCta,
    })
    .commit({ visibility: "async" });
  await client
    .patch("productOverviewPage-en")
    .set({
      heroEyebrow: M,
      heroTitle: M,
      heroIntro: M,
      ctaBandTitle: M,
      ctaBandBody: M,
      ctaBandPrimary: enCta,
    })
    .commit({ visibility: "async" });

  console.log("FR/EN overview singletons patched");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
