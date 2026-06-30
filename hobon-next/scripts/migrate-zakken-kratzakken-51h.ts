/**
 * HOB-51h — Krat-zakken Sanity-assets hergebruiken op Zakken (product-nl-zakken).
 *
 * Dry-run (default):
 *   npm run migrate:zakken-kratzakken-51h
 *
 * Write (na goedgekeurde dry-run):
 *   npm run migrate:zakken-kratzakken-51h -- --write
 *
 * Geen nieuwe uploads — alleen bestaande asset-refs van product-nl-kratzakken.
 * Alleen client.patch().set() op product-nl-zakken.
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

const SOURCE_DOC = "product-nl-kratzakken";
const TARGET_DOC = "product-nl-zakken";
const FOLIE_DOC = "product-nl-blaasfolies";

/** Aantal productGallery-items naast hero (uit bron, exclusief hero-duplicaat). */
const GALLERY_COUNT = 2;

type ImageWithAlt = {
  _type: "imageWithAlt";
  alt: string;
  image: { _type: "image"; asset: { _type: "reference"; _ref: string } };
};

function parseArgs() {
  return { dryRun: !process.argv.includes("--write") };
}

function cloneRef(source: ImageWithAlt, alt: string): ImageWithAlt {
  const ref = source.image?.asset?._ref;
  if (!ref) throw new Error("Bron mist asset-ref");
  return {
    _type: "imageWithAlt",
    alt,
    image: {
      _type: "image",
      asset: { _type: "reference", _ref: ref },
    },
  };
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

async function main() {
  if (!token) {
    console.error("SANITY_API_WRITE_TOKEN ontbreekt in .env.local");
    process.exit(1);
  }

  const { dryRun } = parseArgs();

  const [source, target, folie] = await Promise.all([
    client.fetch<{ title?: string; heroImage?: ImageWithAlt; productGallery?: ImageWithAlt[] }>(
      `*[_id == $id][0]{ title, heroImage, productGallery }`,
      { id: SOURCE_DOC },
    ),
    client.fetch<{ title?: string; heroImage?: ImageWithAlt; productGallery?: ImageWithAlt[] }>(
      `*[_id == $id][0]{ title, heroImage, productGallery }`,
      { id: TARGET_DOC },
    ),
    client.fetch<{ heroImage?: ImageWithAlt }>(`*[_id == $id][0]{ heroImage }`, { id: FOLIE_DOC }),
  ]);

  if (!source?.heroImage?.image?.asset?._ref) {
    throw new Error(`${SOURCE_DOC} heeft geen heroImage — draai eerst 51c product-images.`);
  }

  const gallery = source.productGallery ?? [];
  const heroRef = source.heroImage.image.asset._ref;
  const folieRef = folie?.heroImage?.image?.asset?._ref ?? null;
  const targetHeroRef = target?.heroImage?.image?.asset?._ref ?? null;

  const extraGallery = gallery.filter((g) => g.image?.asset?._ref && g.image.asset._ref !== heroRef);
  const picked = extraGallery.slice(0, GALLERY_COUNT);
  if (picked.length < GALLERY_COUNT) {
    throw new Error(
      `${SOURCE_DOC} heeft minder dan ${GALLERY_COUNT} unieke galerij-beelden naast hero (gevonden: ${picked.length}).`,
    );
  }

  const zakkenAlts = {
    hero: target?.title ? `${target.title}` : "Zakken (LDPE/HDPE)",
    gallery: ["PE-zakken in productie", "Zakken op afvullijn"],
  };

  const set = {
    heroImage: cloneRef(source.heroImage, zakkenAlts.hero),
    productGallery: picked.map((img, i) => cloneRef(img, zakkenAlts.gallery[i] ?? img.alt)),
  };

  console.log(`\n${"=".repeat(72)}`);
  console.log(`HOB-51h — Zakken ← Kratzakken assets (${dryRun ? "DRY-RUN" : "WRITE"})`);
  console.log(`${"=".repeat(72)}\n`);

  console.log(`Bron:  ${SOURCE_DOC} (${source.title})`);
  console.log(`Doel:  ${TARGET_DOC} (${target?.title})`);
  console.log(`Modus: ${dryRun ? "geen writes" : "patch naar Sanity"}\n`);

  console.log("--- Gekozen Krat-zakken assets (hergebruik, geen upload) ---\n");
  console.log(`heroImage:`);
  console.log(`  asset: ${heroRef}`);
  console.log(`  bron-alt: "${source.heroImage.alt}"`);
  console.log(`  nieuw-alt: "${set.heroImage.alt}"`);
  console.log(`  bestand (51c): iStock-2158237125.jpg\n`);

  console.log(`productGallery (${set.productGallery.length} items):`);
  for (let i = 0; i < set.productGallery.length; i++) {
    const item = set.productGallery[i];
    const src = picked[i];
    console.log(`  [${i}] asset: ${item.image.asset._ref}`);
    console.log(`       bron-alt: "${src.alt}"`);
    console.log(`       nieuw-alt: "${item.alt}"`);
  }

  console.log("\n--- Huidige Zakken-status ---");
  console.log(`  hero asset: ${targetHeroRef ?? "(leeg)"}`);
  console.log(`  folie-fallback: ${folieRef && targetHeroRef === folieRef ? "JA" : "nee"}`);
  console.log(`  productGallery: ${(target?.productGallery ?? []).length} items`);

  console.log("\n--- Patch ---");
  console.log(`  ${TARGET_DOC}.set({ heroImage, productGallery })`);
  console.log(`  Nieuwe assets: 0`);

  console.log(`\n${"=".repeat(72)}`);
  if (dryRun) {
    console.log("🛑 STOP — dry-run afgerond. Bevestig → npm run migrate:zakken-kratzakken-51h -- --write");
  } else {
    await client.patch(TARGET_DOC).set(set).commit({ visibility: "async" });
    console.log(`PATCH OK ${TARGET_DOC} (heroImage, productGallery)`);
    console.log("Folie-fallback op Zakken vervalt (eigen Krat-zakken-asset).");
  }
  console.log(`${"=".repeat(72)}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
