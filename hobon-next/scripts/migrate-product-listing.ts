/**
 * Zet product-overzichtvelden: listingEyebrow/listingDescription voor de 5
 * hoofdproducten (copy gelijk aan bestaande SEO-beschrijvingen uit migrate-products),
 * showInOverview false voor de drie niches.
 *
 * npm run seed:listing-products
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

const MARKER = "[Frederik nalezen aparte file]";

const mainProducts: {
  _id: string;
  listingEyebrow: string;
  listingDescription: string;
}[] = [
  {
    _id: "product-nl-blaasfolies",
    listingEyebrow: "Product · Blaasfolies",
    listingDescription:
      "PE-blaasfolies in HDPE en LDPE: krimpfolie, automatenfolie, buisfolie. Mono, 3-laags of 5-laags. Op maat van uw lijn.",
  },
  {
    _id: "product-nl-zakken",
    listingEyebrow: "Product · Zakken",
    listingDescription:
      "Zakken in LDPE en HDPE voor veevoeder, meststoffen, poeders en granen. Hoeklas, bloklas, kratzakken. Bedrukt tot 6 kleuren.",
  },
  {
    _id: "product-nl-vellen",
    listingEyebrow: "Product · Vellen",
    listingDescription:
      "PE-afdekvellen, topsheets en paperlookvellen op maat. Voor palletbescherming, vochtbescherming en industriële bescherming.",
  },
  {
    _id: "product-nl-stretch-hood",
    listingEyebrow: "Product · Stretch hood",
    listingDescription:
      "PE-stretch hoezen voor palletbescherming. Los of afscheurbaar van de rol. Op maat van uw palletformaten. Bedrukt tot 6 kleuren.",
  },
  {
    _id: "product-nl-pattyn",
    listingEyebrow: "Product · PATTYN",
    listingDescription:
      "PE-buisfolie met zijvouwen voor PATTYN-inpaklijnen en bag-in-box-systemen. Op maat in mono, 3-laags of 5-laags.",
  },
];

const nicheIds = ["product-nl-dolav-zakken", "product-nl-boterfolie", "product-nl-kratzakken"];

async function main() {
  if (!token) {
    console.error("Missing SANITY_API_WRITE_TOKEN");
    process.exit(1);
  }

  for (const p of mainProducts) {
    await client
      .patch(p._id)
      .set({
        listingEyebrow: p.listingEyebrow,
        listingDescription: p.listingDescription,
        showInOverview: true,
      })
      .commit({ visibility: "async" });
    console.log("Listing fields", p._id);
  }

  for (const id of nicheIds) {
    await client
      .patch(id)
      .set({
        showInOverview: false,
        listingDescription: MARKER,
      })
      .commit({ visibility: "async" });
    console.log("Niche hidden from overview", id);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
