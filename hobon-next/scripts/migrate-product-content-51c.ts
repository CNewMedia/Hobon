/**
 * HOB-51c — Folie-content (buisfolie-demo) + productfoto's naar Sanity.
 *
 * Dry-run (default):
 *   npm run migrate:product-content -- --batch=folie
 *   npm run migrate:product-content -- --batch=product-images
 *   npm run migrate:product-content -- --batch=all
 *
 * Write (na goedgekeurde dry-run):
 *   npm run migrate:product-content -- --batch=all --write
 *
 * Alleen client.patch().set() — geen createOrReplace.
 */
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

const DEMO_HTML = join(process.cwd(), "..", "tmp", "buisfolie__4___1_.html");
const PUBLIC_IMAGES = join(process.cwd(), "public", "assets", "images");

type ImageWithAlt = {
  _type: "imageWithAlt";
  alt: string;
  image: { _type: "image"; asset: { _type: "reference"; _ref: string } };
};

type HeroThumb = {
  _key: string;
  _type: "heroThumb";
  label?: string;
  image: ImageWithAlt;
};

type SolutionCard = {
  _key: string;
  _type: "solutionCard";
  title: string;
  description?: string;
  image: ImageWithAlt;
};

type FaqItem = {
  _key: string;
  _type: "faqItem";
  question: string;
  answer: string;
};

const BATCHES = ["folie", "product-images", "all"] as const;
type Batch = (typeof BATCHES)[number];

function parseArgs() {
  const args = process.argv.slice(2);
  const batchArg = args.find((a) => a.startsWith("--batch="));
  const batch = (batchArg?.split("=")[1] ?? "all") as Batch;
  const write = args.includes("--write");
  if (!BATCHES.includes(batch)) {
    throw new Error(`Onbekende batch "${batch}". Kies: ${BATCHES.join(", ")}`);
  }
  return { batch, write, dryRun: !write };
}

function key() {
  return Math.random().toString(36).slice(2, 12);
}

/** Koppen / namen: buisfolie → Folies */
function normalizeHeading(text: string): string {
  return text
    .replace(/Buisfolie/g, "Folies")
    .replace(/buisfolie/g, "folies")
    .replace(/Blaasfolies/g, "Folies")
    .replace(/blaasfolies/g, "folies");
}

/** Lopende tekst: buisfolie → folie */
function normalizeBody(text: string): string {
  return text
    .replace(/Buisfolie/g, "folie")
    .replace(/buisfolie/g, "folie")
    .replace(/Blaasfolies/g, "folies")
    .replace(/blaasfolies/g, "folies");
}

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function extractDataUrls(sectionHtml: string): string[] {
  return [...sectionHtml.matchAll(/src="(data:image\/[^"]+)"/g)].map((m) => m[1]);
}

function parseDemoHtml(html: string) {
  const eyebrow = stripTags((html.match(/s-hero-eyebrow-txt">([^<]*)</) ?? [])[1] ?? "");
  const h1raw = (html.match(/class="s-hero-h1">([\s\S]*?)<\/h1>/) ?? [])[1] ?? "";
  const heroHeadline = decodeEntities(
    h1raw
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<span class="soft">/gi, "")
      .replace(/<\/span>/gi, "")
      .trim(),
  );
  const heroIntro = stripTags((html.match(/class="s-hero-intro">([\s\S]*?)<\/p>/) ?? [])[1] ?? "");

  const heroR = html.match(/class="s-hero-r"[\s\S]*?class="s-hero-scroll"/)?.[0] ?? "";
  const heroMain = extractDataUrls(heroR.match(/class="s-hero-r-main"[\s\S]*?<\/div>/)?.[0] ?? "");
  const heroThumbs = extractDataUrls(
    heroR.match(/class="s-hero-thumbs"[\s\S]*?<\/div>\s*<div class="s-hero-scroll"/)?.[0] ?? "",
  );

  const cards: { title: string; description: string; imageDataUrl: string }[] = [];
  const solSection = html.match(/class="sol-grid"[\s\S]*?<\/div>\s*<\/section>/)?.[0] ?? "";
  const cardBlocks = [...solSection.matchAll(/<div class="sol rv[\s\S]*?(?=<div class="sol rv|<\/div>\s*<\/div>\s*<\/section>)/g)];
  for (const block of cardBlocks) {
    const title = stripTags((block[0].match(/class="sol-title">([^<]*)</) ?? [])[1] ?? "");
    const description = stripTags((block[0].match(/class="sol-desc">([\s\S]*?)<\/p>/) ?? [])[1] ?? "");
    const imageDataUrl = (block[0].match(/src="(data:image\/[^"]+)"/) ?? [])[1];
    if (title && imageDataUrl) cards.push({ title, description, imageDataUrl });
  }

  const faqs: { question: string; answer: string }[] = [];
  const faqRe =
    /<button[^>]*class="di-hd"[\s\S]*?<span class="di-title">([^<]*)<\/span>[\s\S]*?<p class="di-desc">([\s\S]*?)<\/p>/g;
  let m: RegExpExecArray | null;
  while ((m = faqRe.exec(html)) !== null) {
    faqs.push({ question: stripTags(m[1]), answer: stripTags(m[2]) });
  }

  const galleryCaps = [...html.matchAll(/class="gal-cap-txt">([^<]*)</g)].map((x) => stripTags(x[1]));
  const galSection = html.match(/class="gal-grid"[\s\S]*?<\/section>/)?.[0] ?? "";
  const galleryImages = [...galSection.matchAll(/class="gal-item[\s\S]*?src="(data:image\/[^"]+)"/g)].map((x) => x[1]);

  const ctaTitleRaw = (html.match(/class="cta-h2[^"]*">([\s\S]*?)<\/h2>/) ?? [])[1] ?? "";
  const ctaTitle = stripTags(ctaTitleRaw.replace(/<span>/g, " ").replace(/<\/span>/g, " "));

  return {
    eyebrow,
    heroHeadline,
    heroIntro,
    heroMain: heroMain[0] ?? null,
    heroThumbs,
    cards,
    faqs,
    galleryCaps,
    galleryImages,
    ctaTitle,
  };
}

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function neutralGalleryAlt(caption: string): string {
  return capitalizeFirst(normalizeBody(caption.replace(/Pasfrost/gi, "").trim()));
}

function hashDataUrl(dataUrl: string): string {
  const base64 = dataUrl.split(",")[1] ?? dataUrl;
  return createHash("sha256").update(base64).digest("hex").slice(0, 16);
}

function hashBuffer(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

function buildImageWithAlt(assetRef: string, alt: string): ImageWithAlt {
  return {
    _type: "imageWithAlt",
    alt,
    image: {
      _type: "image",
      asset: { _type: "reference", _ref: assetRef },
    },
  };
}

async function uploadDataUrl(
  client: ReturnType<typeof createClient>,
  dataUrl: string,
  filename: string,
  cache: Map<string, string>,
): Promise<string> {
  const h = hashDataUrl(dataUrl);
  const cached = cache.get(`data:${h}`);
  if (cached) return cached;

  const match = dataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
  if (!match) throw new Error("Ongeldige data-URL");
  const contentType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  const asset = await client.assets.upload("image", buffer, { filename, contentType });
  cache.set(`data:${h}`, asset._id);
  return asset._id;
}

async function uploadFile(
  client: ReturnType<typeof createClient>,
  filePath: string,
  cache: Map<string, string>,
): Promise<string> {
  const h = hashBuffer(readFileSync(filePath));
  const cached = cache.get(`file:${h}`);
  if (cached) return cached;

  const buffer = readFileSync(filePath);
  const ext = basename(filePath).split(".").pop()?.toLowerCase();
  const contentType = ext === "png" ? "image/png" : "image/jpeg";
  const asset = await client.assets.upload("image", buffer, {
    filename: basename(filePath),
    contentType,
  });
  cache.set(`file:${h}`, asset._id);
  return asset._id;
}

type FoliePatchPlan = {
  docId: string;
  set: Record<string, unknown>;
  uploads: { label: string; kind: "data" | "file" }[];
};

async function planFoliePatch(
  client: ReturnType<typeof createClient>,
  dryRun: boolean,
): Promise<{ plan: FoliePatchPlan; assetCache: Map<string, string> }> {
  if (!existsSync(DEMO_HTML)) {
    throw new Error(`Demo HTML niet gevonden: ${DEMO_HTML}`);
  }
  const html = readFileSync(DEMO_HTML, "utf8");
  const demo = parseDemoHtml(html);
  const assetCache = new Map<string, string>();
  const uploads: { label: string; kind: "data" | "file" }[] = [];

  async function assetFromData(dataUrl: string, filename: string, alt: string): Promise<ImageWithAlt> {
    uploads.push({ label: filename, kind: "data" });
    if (dryRun) {
      return buildImageWithAlt("dry-run-asset", alt);
    }
    const ref = await uploadDataUrl(client, dataUrl, filename, assetCache);
    return buildImageWithAlt(ref, alt);
  }

  const heroImage = demo.heroMain
    ? await assetFromData(demo.heroMain, "folies-hero.jpg", "Folies op de verpakkingslijn")
    : undefined;

  const heroThumbs: HeroThumb[] = [];
  for (let i = 0; i < demo.heroThumbs.length; i++) {
    const cap = demo.galleryCaps[i] ?? `Folie ${i + 1}`;
    const alt = neutralGalleryAlt(cap);
    heroThumbs.push({
      _key: key(),
      _type: "heroThumb",
      label: alt,
      image: await assetFromData(demo.heroThumbs[i], `folies-hero-thumb-${i + 1}.jpg`, alt),
    });
  }

  const solutionCards: SolutionCard[] = [];
  for (let i = 0; i < demo.cards.length; i++) {
    const card = demo.cards[i];
    solutionCards.push({
      _key: key(),
      _type: "solutionCard",
      title: normalizeHeading(card.title),
      description: normalizeBody(card.description),
      image: await assetFromData(card.imageDataUrl, `folies-solution-${i + 1}.jpg`, normalizeHeading(card.title)),
    });
  }

  const faqs: FaqItem[] = demo.faqs.map((f) => ({
    _key: key(),
    _type: "faqItem",
    question: normalizeBody(f.question),
    answer: normalizeBody(f.answer),
  }));

  const productGallery: ImageWithAlt[] = [];
  for (let i = 0; i < demo.galleryImages.length; i++) {
    const cap = demo.galleryCaps[i] ?? `Folie in productie ${i + 1}`;
    const alt = neutralGalleryAlt(cap);
    productGallery.push(await assetFromData(demo.galleryImages[i], `folies-gallery-${i + 1}.jpg`, alt));
  }

  const existing = await client.fetch<{
    specifications?: { _key?: string; title?: string; body?: string }[];
  }>(`*[_id == "product-nl-blaasfolies"][0]{ specifications }`);

  const specifications = (existing.specifications ?? []).map((row) => ({
    ...row,
    body: row.body ? normalizeBody(row.body) : row.body,
    title: row.title,
  }));

  const set: Record<string, unknown> = {
    heroEyebrow: normalizeHeading(demo.eyebrow || "Product · Folies"),
    heroHeadline: normalizeHeading(demo.heroHeadline),
    heroIntro: capitalizeFirst(normalizeBody(demo.heroIntro)),
    heroImage,
    heroThumbs,
    solutionsTitle: "Folies op maat",
    solutionCards,
    galleryTitle: "In de praktijk",
    productGallery,
    faqs,
    ctaBandTitle1: normalizeBody(demo.ctaTitle),
    specifications,
    listingDescription:
      "PE-folies in HDPE en LDPE: krimpfolie, automatenfolie en folie met zijvouwen. Mono, 3-laags of 5-laags. Op maat van uw lijn.",
    seo: {
      metaTitle: "Folies op maat | Hobon",
      metaDescription:
        "PE-folies in HDPE en LDPE: krimpfolie, automatenfolie en folie met zijvouwen. Mono, 3-laags of 5-laags. Op maat van uw lijn.",
    },
  };

  return {
    plan: { docId: "product-nl-blaasfolies", set, uploads },
    assetCache,
  };
}

type ProductImageTarget = {
  docId: string;
  label: string;
  heroFile?: string;
  galleryFiles?: string[];
  solutionCard?: { title: string; description: string; imageFile: string };
  heroAlt: string;
  galleryAlts?: string[];
  richHero?: {
    heroEyebrow: string;
    heroHeadline: string;
    heroIntro: string;
    heroPrimaryCta: { label: string; href: string };
    heroSecondaryCta: { label: string; href: string };
  };
};

const PRODUCT_IMAGE_TARGETS: ProductImageTarget[] = [
  {
    docId: "product-nl-pattyn",
    label: "PATTYN",
    heroFile: join(PUBLIC_IMAGES, "PATTYN", "iStock-1290891988.jpg"),
    galleryFiles: [join(PUBLIC_IMAGES, "PATTYN", "iStock-1290891988.jpg")],
    heroAlt: "PATTYN folie op inpaklijn",
    galleryAlts: ["PATTYN folie in productie"],
  },
  {
    docId: "product-nl-stretch-hood",
    label: "Stretch hood",
    heroFile: join(PUBLIC_IMAGES, "Stretchhood", "iStock-1709161061.jpg"),
    galleryFiles: [
      join(PUBLIC_IMAGES, "Stretchhood", "iStock-1709161061.jpg"),
      join(PUBLIC_IMAGES, "Stretchhood", "iStock-1390200956.jpg"),
      join(PUBLIC_IMAGES, "Stretchhood", "iStock-946769474.jpg"),
    ],
    heroAlt: "Stretch hood op pallet",
    galleryAlts: ["Stretch hood op pallet", "Palletbescherming met stretch hood", "Stretch hood in logistiek"],
    solutionCard: {
      title: "Krimphoezen",
      description: "PE-krimphoezen op maat van uw palletformaat — los of afscheurbaar van de rol.",
      imageFile: join(PUBLIC_IMAGES, "Krimphoezen", "iStock-1151210422.jpg"),
    },
  },
  {
    docId: "product-nl-kratzakken",
    label: "Kratzakken",
    heroFile: join(PUBLIC_IMAGES, "Krat zakken", "iStock-2158237125.jpg"),
    galleryFiles: [
      join(PUBLIC_IMAGES, "Krat zakken", "iStock-2158237125.jpg"),
      join(PUBLIC_IMAGES, "Krat zakken", "iStock-1396946372.jpg"),
      join(PUBLIC_IMAGES, "Krat zakken", "iStock-1324670024.jpg"),
    ],
    heroAlt: "Kratzakken (LDPE)",
    galleryAlts: ["Kratzak in productie", "Kratzak op lijn", "Kratzak toepassing"],
    richHero: {
      heroEyebrow: "Product · Kratzakken",
      heroHeadline: "Kratzakken op maat voor bulk en veevoeder",
      heroIntro:
        "Kratzakken met hoeklas of bloklas — afgestemd op uw bestaande afvulinstallatie en product.",
      heroPrimaryCta: { label: "Vraag een offerte aan", href: "/nl/contact" },
      heroSecondaryCta: { label: "Bekijk specificaties", href: "#specs" },
    },
  },
];

const FALLBACK_PRODUCT_IDS = [
  "product-nl-zakken",
  "product-nl-vellen",
  "product-nl-dolav-zakken",
  "product-nl-boterfolie",
];

async function planProductImages(
  client: ReturnType<typeof createClient>,
  dryRun: boolean,
  folieHeroAssetRef: string | null,
): Promise<{ plans: FoliePatchPlan[]; uploads: { label: string; path: string }[] }> {
  const assetCache = new Map<string, string>();
  const uploads: { label: string; path: string }[] = [];
  const plans: FoliePatchPlan[] = [];

  async function fromFile(filePath: string, alt: string): Promise<ImageWithAlt> {
    if (!existsSync(filePath)) throw new Error(`Bestand niet gevonden: ${filePath}`);
    uploads.push({ label: basename(filePath), path: filePath });
    if (dryRun) return buildImageWithAlt("dry-run-asset", alt);
    const ref = await uploadFile(client, filePath, assetCache);
    return buildImageWithAlt(ref, alt);
  }

  for (const target of PRODUCT_IMAGE_TARGETS) {
    const set: Record<string, unknown> = {};
    const patchUploads: { label: string; kind: "data" | "file" }[] = [];

    if (target.heroFile) {
      set.heroImage = await fromFile(target.heroFile, target.heroAlt);
      patchUploads.push({ label: basename(target.heroFile), kind: "file" });
    }

    if (target.galleryFiles?.length) {
      const gallery: ImageWithAlt[] = [];
      for (let i = 0; i < target.galleryFiles.length; i++) {
        const alt = target.galleryAlts?.[i] ?? target.heroAlt;
        gallery.push(await fromFile(target.galleryFiles[i], alt));
        patchUploads.push({ label: basename(target.galleryFiles[i]), kind: "file" });
      }
      set.productGallery = gallery;
    }

    if (target.solutionCard) {
      set.solutionCards = [
        {
          _key: key(),
          _type: "solutionCard",
          title: target.solutionCard.title,
          description: target.solutionCard.description,
          image: await fromFile(target.solutionCard.imageFile, target.solutionCard.title),
        },
      ];
      patchUploads.push({ label: basename(target.solutionCard.imageFile), kind: "file" });
    }

    if (target.richHero) {
      Object.assign(set, target.richHero);
    }

    plans.push({ docId: target.docId, set, uploads: patchUploads });
  }

  if (folieHeroAssetRef || dryRun) {
    for (const docId of FALLBACK_PRODUCT_IDS) {
      const doc = await client.fetch<{ title?: string }>(`*[_id == $id][0]{ title }`, { id: docId });
      const alt = doc?.title ?? "Folie";
      plans.push({
        docId,
        set: {
          heroImage: dryRun
            ? buildImageWithAlt("dry-run-folie-fallback", alt)
            : buildImageWithAlt(folieHeroAssetRef!, alt),
        },
        uploads: [{ label: "folie-fallback (gedeeld asset)", kind: "file" }],
      });
    }
  }

  return { plans, uploads };
}

function printFoliePlan(plan: FoliePatchPlan, dryRun: boolean) {
  console.log(`\n${"=".repeat(72)}`);
  console.log(`BATCH: folie → ${plan.docId}`);
  console.log(`MODE: ${dryRun ? "DRY-RUN" : "WRITE"}`);
  console.log(`${"=".repeat(72)}\n`);

  console.log("Tekstvelden:");
  for (const [field, value] of Object.entries(plan.set)) {
    if (typeof value === "string") {
      console.log(`  ${field}: ${value.slice(0, 120)}${value.length > 120 ? "…" : ""}`);
    } else if (Array.isArray(value)) {
      console.log(`  ${field}: [${value.length} items]`);
      if (field === "solutionCards") {
        for (const c of value as SolutionCard[]) {
          console.log(`    · ${c.title}`);
        }
      }
      if (field === "faqs") {
        for (const f of value as FaqItem[]) {
          console.log(`    · ${f.question}`);
        }
      }
      if (field === "productGallery") {
        for (const g of value as ImageWithAlt[]) {
          console.log(`    · alt: "${g.alt}"`);
        }
      }
      if (field === "heroThumbs") {
        for (const t of value as HeroThumb[]) {
          console.log(`    · ${t.label}`);
        }
      }
    } else if (value && typeof value === "object" && "alt" in (value as ImageWithAlt)) {
      console.log(`  ${field}: image alt="${(value as ImageWithAlt).alt}"`);
    }
  }

  console.log(`\nUploads (uniek): ${plan.uploads.length}`);
  for (const u of plan.uploads) {
    console.log(`  · ${u.label} (${u.kind})`);
  }
}

function printProductImagePlans(plans: FoliePatchPlan[], dryRun: boolean) {
  console.log(`\n${"=".repeat(72)}`);
  console.log(`BATCH: product-images`);
  console.log(`MODE: ${dryRun ? "DRY-RUN" : "WRITE"}`);
  console.log(`${"=".repeat(72)}\n`);

  for (const plan of plans) {
    const fields = Object.keys(plan.set).join(", ");
    console.log(`${plan.docId} → set(${fields})`);
    for (const u of plan.uploads) {
      console.log(`  upload: ${u.label}`);
    }
  }
}

async function applyPatch(docId: string, set: Record<string, unknown>) {
  await client.patch(docId).set(set).commit({ visibility: "async" });
  console.log(`PATCH OK ${docId} (${Object.keys(set).join(", ")})`);
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

  const { batch, dryRun } = parseArgs();
  console.log(`HOB-51c migrate — batch=${batch} ${dryRun ? "(dry-run)" : "(WRITE)"}`);
  console.log(`Demo bron: ${DEMO_HTML}`);

  let folieHeroRef: string | null = null;

  if (batch === "folie" || batch === "all") {
    const { plan, assetCache } = await planFoliePatch(client, dryRun);
    printFoliePlan(plan, dryRun);
    if (!dryRun) {
      await applyPatch(plan.docId, plan.set);
      folieHeroRef = (plan.set.heroImage as ImageWithAlt | undefined)?.image.asset._ref ?? null;
      console.log(`\nFolie hero asset: ${folieHeroRef}`);
      console.log(`Assets geüpload: ${assetCache.size}`);
    } else {
      folieHeroRef = "dry-run-folie-hero";
    }
  }

  if (batch === "product-images" || batch === "all") {
    if (batch === "product-images" && !folieHeroRef) {
      const folieDoc = await client.fetch<{ heroImage?: ImageWithAlt }>(
        `*[_id == "product-nl-blaasfolies"][0]{ heroImage }`,
      );
      folieHeroRef = folieDoc?.heroImage?.image?.asset?._ref ?? null;
      if (!folieHeroRef) {
        console.warn("\nWaarschuwing: geen folie heroImage in Sanity — fallback-producten worden overgeslagen.");
      }
    }

    const { plans } = await planProductImages(client, dryRun, folieHeroRef);
    printProductImagePlans(plans, dryRun);
    if (!dryRun) {
      for (const plan of plans) {
        await applyPatch(plan.docId, plan.set);
      }
    }
  }

  if (dryRun) {
    console.log("\n--- Dry-run afgerond. Geen writes. Voeg --write toe na goedkeuring. ---");
  } else {
    console.log("\n--- Write afgerond. ---");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
