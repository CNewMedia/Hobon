/**
 * HOB-39b: Replace [Frederik nalezen aparte file] on overview singletons
 * and niche product listingDescription fields. Patch-only, one field per commit.
 *
 * npm run patch:overview-copy
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

type Patch = { docId: string; field: string; value: string };

/** 26 field patches — EN heroEyebrow only on productOverviewPage-en (batch C). */
const PATCHES: Patch[] = [
  // Batch A — sectorOverviewPage-nl
  { docId: "sectorOverviewPage-nl", field: "heroEyebrow", value: "Sectoren we bedienen" },
  { docId: "sectorOverviewPage-nl", field: "heroTitle", value: "De juiste folie voor elke sector" },
  {
    docId: "sectorOverviewPage-nl",
    field: "heroIntro",
    value:
      "Bekijk per sector welke PE-folies en zakken Hobon aanbiedt voor voeding, logistiek, chemie en agro. Oplossingen op maat van uw machine, lijnsnelheid en compliance — technisch onderbouwd, BRC AA waar vereist. De juiste folie voorkomt problemen op uw lijn.",
  },
  { docId: "sectorOverviewPage-nl", field: "ctaBandTitle", value: "Bespreek uw sector en toepassing" },
  {
    docId: "sectorOverviewPage-nl",
    field: "ctaBandBody",
    value:
      "Heeft u een specifieke machine, audit of compliance-vraag? <strong>Leg het ons voor.</strong> Wij analyseren uw situatie en adviseren zonder verplichtingen.",
  },

  // Batch B — productOverviewPage-nl
  { docId: "productOverviewPage-nl", field: "heroEyebrow", value: "Producten op maat" },
  { docId: "productOverviewPage-nl", field: "heroTitle", value: "PE-verpakkingen voor uw lijn" },
  {
    docId: "productOverviewPage-nl",
    field: "heroIntro",
    value:
      "Overzicht van Hobons kernproducten: blaasfolies, zakken, vellen, stretch hood en PATTYN-rollen. Elk product in HDPE of LDPE, mono tot 5-laags, afgestemd op uw afvulinstallatie en lijnsnelheid — geen cataloguskeuze.",
  },
  { docId: "productOverviewPage-nl", field: "ctaBandTitle", value: "Welk product past bij uw lijn?" },
  {
    docId: "productOverviewPage-nl",
    field: "ctaBandBody",
    value:
      "Heeft u een specifieke toepassing, machine of uitdaging? <strong>Leg het ons voor.</strong> Wij adviseren het juiste PE-product — zonder verplichtingen.",
  },

  // Batch C — productOverviewPage-en (heroEyebrow = NL "Producten op maat" → EN)
  { docId: "productOverviewPage-en", field: "heroEyebrow", value: "[AI-translated] Custom products" },
  { docId: "productOverviewPage-en", field: "heroTitle", value: "[AI-translated] PE packaging for your line" },
  {
    docId: "productOverviewPage-en",
    field: "heroIntro",
    value:
      "[AI-translated] Overview of Hobon's core products: blown films, bags, sheets, stretch hood and PATTYN rolls. Each in HDPE or LDPE, mono to 5-layer, tailored to your filling line and line speed — not an off-the-shelf catalogue choice.",
  },
  { docId: "productOverviewPage-en", field: "ctaBandTitle", value: "[AI-translated] Which product fits your line?" },
  {
    docId: "productOverviewPage-en",
    field: "ctaBandBody",
    value:
      "[AI-translated] Do you have a specific application, machine or challenge? <strong>Tell us about it.</strong> We advise on the right PE product — with no obligation.",
  },

  // Batch D — productOverviewPage-fr (CTA only)
  {
    docId: "productOverviewPage-fr",
    field: "ctaBandTitle",
    value: "[AI-translated] Quel produit convient à votre ligne ?",
  },
  {
    docId: "productOverviewPage-fr",
    field: "ctaBandBody",
    value:
      "[AI-translated] Vous avez une application, une machine ou un défi spécifique ? <strong>Présentez-nous votre situation.</strong> Nous vous conseillons le bon produit PE — sans engagement.",
  },

  // Batch E — niche listingDescription
  {
    docId: "product-nl-dolav-zakken",
    field: "listingDescription",
    value:
      "DOLAV-zakken in LDPE/HDPE met hoge lassterkte en stuifbestendigheid — op maat van uw afvulinstallatie en mechanische belasting.",
  },
  {
    docId: "product-fr-dolav-zakken",
    field: "listingDescription",
    value:
      "[AI-translated] Sacs DOLAV en LDPE/HDPE à haute résistance de soudure et étanchéité à la poussière — adaptés à votre ligne de remplissage et à la charge mécanique.",
  },
  {
    docId: "product-en-dolav-zakken",
    field: "listingDescription",
    value:
      "[AI-translated] DOLAV bags in LDPE/HDPE with high weld strength and dust resistance — tailored to your filling line and mechanical load.",
  },
  {
    docId: "product-nl-boterfolie",
    field: "listingDescription",
    value:
      "Paperlook boterfolie voor food-toepassingen — geschikt voor retailpresentatie en stabiele verwerking op uw lijn.",
  },
  {
    docId: "product-fr-boterfolie",
    field: "listingDescription",
    value:
      "[AI-translated] Film papier beurre paperlook pour applications alimentaires — adaptée à la présentation retail et à votre ligne.",
  },
  {
    docId: "product-en-boterfolie",
    field: "listingDescription",
    value:
      "[AI-translated] Paperlook butter film for food applications — suitable for retail presentation and stable processing on your line.",
  },
  {
    docId: "product-nl-kratzakken",
    field: "listingDescription",
    value:
      "Kratzakken op maat voor bulk en veevoeder — hoeklas of bloklas, afgestemd op uw bestaande afvulinstallatie.",
  },
  {
    docId: "product-fr-kratzakken",
    field: "listingDescription",
    value:
      "[AI-translated] Sacs pour caisses sur mesure pour vrac et aliments — soudure d'angle ou de bloc, adaptés à votre ligne de remplissage.",
  },
  {
    docId: "product-en-kratzakken",
    field: "listingDescription",
    value:
      "[AI-translated] Crate bags made to measure for bulk and animal feed — corner or block weld, matched to your existing filling line.",
  },
];

async function main() {
  if (!token) throw new Error("Missing SANITY_API_WRITE_TOKEN");
  if (PATCHES.length !== 26) {
    throw new Error(`Expected 26 patches, got ${PATCHES.length}`);
  }

  let ok = 0;
  let failed = 0;

  for (const { docId, field, value } of PATCHES) {
    try {
      await client.patch(docId).set({ [field]: value }).commit({ visibility: "async" });
      console.log(`OK  ${docId}.${field}`);
      ok += 1;
    } catch (e) {
      failed += 1;
      console.error(`FAIL ${docId}.${field}`, e);
    }
  }

  console.log(`\n--- HOB-39b patch report ---`);
  console.log(`Patched: ${ok}`);
  console.log(`Failed:  ${failed}`);

  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
