/**
 * HOB-59 — Upload lokale foto's uit public/assets/images/ naar Sanity.
 *
 * Dry-run (default):
 *   npm run migrate:local-photos-59
 *   npm run migrate:local-photos-59 -- --batch=about
 *
 * Write (SANITY_API_WRITE_TOKEN vereist):
 *   npm run migrate:local-photos-59 -- --write
 *   npm run migrate:local-photos-59 -- --batch=products --write
 *
 * Idempotent: hergebruikt asset per bestand-hash; slaat patch over als veld al
 * naar dezelfde asset wijst (originalFilename-match). FR/EN krijgen dezelfde
 * asset-reference als NL (geen dubbele upload).
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { createClient, type SanityClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

const PUBLIC_IMAGES = join(process.cwd(), "public", "assets", "images");

const BATCHES = ["about", "folies", "contact", "products", "maps", "all"] as const;
type Batch = (typeof BATCHES)[number];

type ImageWithAlt = {
  _type: "imageWithAlt";
  alt: string;
  image: { _type: "image"; asset: { _type: "reference"; _ref: string } };
};

type HeroMediaValue = {
  _type: "heroMedia";
  mediaType: "image";
  image: ImageWithAlt;
};

type PlannedPatch = {
  batch: Batch;
  label: string;
  docIds: string[];
  set: Record<string, unknown>;
  files: string[];
  action: "patch" | "skip";
  skipReason?: string;
};

function parseArgs(): { dryRun: boolean; batch: Batch } {
  const batchArg = process.argv.find((a) => a.startsWith("--batch="));
  const batch = (batchArg?.split("=")[1] ?? "all") as Batch;
  if (!BATCHES.includes(batch)) {
    throw new Error(`Onbekende batch "${batch}". Kies: ${BATCHES.join(", ")}`);
  }
  return { dryRun: !process.argv.includes("--write"), batch };
}

function fileHash(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex").slice(0, 16);
}

function rel(filePath: string): string {
  return filePath.replace(`${process.cwd()}/`, "");
}

function buildImageWithAlt(assetRef: string, alt: string): ImageWithAlt {
  return {
    _type: "imageWithAlt",
    alt,
    image: { _type: "image", asset: { _type: "reference", _ref: assetRef } },
  };
}

function buildHeroMedia(assetRef: string, alt: string): HeroMediaValue {
  return {
    _type: "heroMedia",
    mediaType: "image",
    image: buildImageWithAlt(assetRef, alt),
  };
}

function siblingDocIds(nlDocId: string): string[] {
  if (nlDocId.includes("-nl-")) {
    return [nlDocId, nlDocId.replace("-nl-", "-fr-"), nlDocId.replace("-nl-", "-en-")];
  }
  if (nlDocId.endsWith("-nl")) {
    return [nlDocId, nlDocId.replace(/-nl$/, "-fr"), nlDocId.replace(/-nl$/, "-en")];
  }
  return [nlDocId];
}

function contentTypeFor(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

async function uploadFile(
  client: SanityClient,
  filePath: string,
  cache: Map<string, string>,
): Promise<string> {
  const hash = fileHash(filePath);
  const cached = cache.get(hash);
  if (cached) return cached;

  const buffer = readFileSync(filePath);
  const asset = await client.assets.upload("image", buffer, {
    filename: basename(filePath),
    contentType: contentTypeFor(filePath),
  });
  cache.set(hash, asset._id);
  return asset._id;
}

async function assetOriginalFilename(client: SanityClient, assetRef: string): Promise<string | null> {
  const asset = await client.fetch<{ originalFilename?: string }>(
    `*[_id == $id][0]{ originalFilename }`,
    { id: assetRef },
  );
  return asset?.originalFilename ?? null;
}

function getAssetRef(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const v = value as { image?: { asset?: { _ref?: string } }; asset?: { _ref?: string } };
  return v.image?.asset?._ref ?? v.asset?._ref ?? null;
}

async function fieldAlreadyHasFile(
  client: SanityClient,
  docId: string,
  path: string,
  filename: string,
): Promise<boolean> {
  const doc = await client.fetch<Record<string, unknown> | null>(`*[_id == $id][0]`, { id: docId });
  if (!doc) return false;

  const parts = path.split(".");
  let current: unknown = doc;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return false;
    current = (current as Record<string, unknown>)[part];
  }

  const ref = getAssetRef(current);
  if (!ref) return false;
  const existingName = await assetOriginalFilename(client, ref);
  return existingName === filename;
}

async function filterExistingDocIds(client: SanityClient, docIds: string[]): Promise<string[]> {
  const rows = await client.fetch<{ _id: string }[]>(`*[_id in $ids]{ _id }`, { ids: docIds });
  const found = new Set(rows.map((r) => r._id));
  return docIds.filter((id) => found.has(id));
}

async function resolveAssetForFile(
  client: SanityClient,
  filePath: string,
  cache: Map<string, string>,
  dryRun: boolean,
): Promise<string> {
  if (dryRun) return `dry-run-${fileHash(filePath)}`;
  return uploadFile(client, filePath, cache);
}

async function planProductHeroGallery(
  client: SanityClient,
  opts: {
    batch: Batch;
    label: string;
    nlDocId: string;
    files: string[];
    heroAlt: string;
    galleryAlts: string[];
    dryRun: boolean;
    cache: Map<string, string>;
  },
): Promise<PlannedPatch> {
  const { batch, label, nlDocId, files, heroAlt, galleryAlts, dryRun, cache } = opts;
  const docIds = await filterExistingDocIds(client, siblingDocIds(nlDocId));

  if (docIds.length === 0) {
    return {
      batch,
      label,
      docIds: siblingDocIds(nlDocId),
      set: {},
      files: files.map(rel),
      action: "skip",
      skipReason: "geen documenten gevonden in Sanity",
    };
  }

  const heroFile = files[0];
  const heroFilename = basename(heroFile);
  const already = await fieldAlreadyHasFile(client, docIds[0], "heroImage", heroFilename);
  if (already) {
    return {
      batch,
      label,
      docIds,
      set: {},
      files: files.map(rel),
      action: "skip",
      skipReason: `heroImage wijst al naar ${heroFilename}`,
    };
  }

  const heroRef = await resolveAssetForFile(client, heroFile, cache, dryRun);
  const gallery: ImageWithAlt[] = [];
  for (let i = 0; i < files.length; i++) {
    const alt = galleryAlts[i] ?? heroAlt;
    const ref = await resolveAssetForFile(client, files[i], cache, dryRun);
    gallery.push(buildImageWithAlt(ref, alt));
  }

  return {
    batch,
    label,
    docIds,
    set: { heroImage: gallery[0], productGallery: gallery },
    files: files.map(rel),
    action: "patch",
  };
}

async function planHeroMediaPatch(
  client: SanityClient,
  opts: {
    batch: Batch;
    label: string;
    nlDocId: string;
    file: string;
    alt: string;
    dryRun: boolean;
    cache: Map<string, string>;
  },
): Promise<PlannedPatch> {
  const { batch, label, nlDocId, file, alt, dryRun, cache } = opts;
  const docIds = await filterExistingDocIds(client, siblingDocIds(nlDocId));
  const filename = basename(file);

  if (docIds.length === 0) {
    return {
      batch,
      label,
      docIds: siblingDocIds(nlDocId),
      set: {},
      files: [rel(file)],
      action: "skip",
      skipReason: "geen documenten gevonden in Sanity",
    };
  }

  const already = await fieldAlreadyHasFile(client, docIds[0], "heroMedia.image", filename);
  if (already) {
    return {
      batch,
      label,
      docIds,
      set: {},
      files: [rel(file)],
      action: "skip",
      skipReason: `heroMedia.image wijst al naar ${filename}`,
    };
  }

  const ref = await resolveAssetForFile(client, file, cache, dryRun);
  return {
    batch,
    label,
    docIds,
    set: { heroMedia: buildHeroMedia(ref, alt) },
    files: [rel(file)],
    action: "patch",
  };
}

async function planFeaturedImagePatch(
  client: SanityClient,
  opts: {
    batch: Batch;
    label: string;
    nlDocId: string;
    file: string;
    alt: string;
    dryRun: boolean;
    cache: Map<string, string>;
  },
): Promise<PlannedPatch> {
  const { batch, label, nlDocId, file, alt, dryRun, cache } = opts;
  const docIds = await filterExistingDocIds(client, siblingDocIds(nlDocId));
  const filename = basename(file);

  if (docIds.length === 0) {
    return {
      batch,
      label,
      docIds: siblingDocIds(nlDocId),
      set: {},
      files: [rel(file)],
      action: "skip",
      skipReason: "insight-document niet gevonden — maak aan of pas mapping aan",
    };
  }

  const already = await fieldAlreadyHasFile(client, docIds[0], "featuredImage", filename);
  if (already) {
    return {
      batch,
      label,
      docIds,
      set: {},
      files: [rel(file)],
      action: "skip",
      skipReason: `featuredImage wijst al naar ${filename}`,
    };
  }

  const ref = await resolveAssetForFile(client, file, cache, dryRun);
  return {
    batch,
    label,
    docIds,
    set: { featuredImage: buildImageWithAlt(ref, alt) },
    files: [rel(file)],
    action: "patch",
  };
}

async function planBlaasfoliesFfsGallery(
  client: SanityClient,
  file: string,
  dryRun: boolean,
  cache: Map<string, string>,
): Promise<PlannedPatch> {
  const batch: Batch = "folies";
  const nlDocId = "product-nl-blaasfolies";
  const docIds = await filterExistingDocIds(client, siblingDocIds(nlDocId));
  const filename = basename(file);

  if (docIds.length === 0) {
    return {
      batch,
      label: "Blaasfolies — FFS galerij",
      docIds: siblingDocIds(nlDocId),
      set: {},
      files: [rel(file)],
      action: "skip",
      skipReason: "product-nl-blaasfolies niet gevonden",
    };
  }

  const doc = await client.fetch<{ productGallery?: ImageWithAlt[] }>(
    `*[_id == $id][0]{ productGallery }`,
    { id: nlDocId },
  );
  const existing = doc?.productGallery ?? [];
  const firstRef = getAssetRef(existing[0]);
  if (firstRef) {
    const name = await assetOriginalFilename(client, firstRef);
    if (name === filename) {
      return {
        batch,
        label: "Blaasfolies — FFS galerij",
        docIds,
        set: {},
        files: [rel(file)],
        action: "skip",
        skipReason: `productGallery[0] is al ${filename}`,
      };
    }
  }

  const ref = await resolveAssetForFile(client, file, cache, dryRun);
  const newItem = buildImageWithAlt(ref, "FFS-folie op lijn");
  const merged = [newItem, ...existing.filter((item) => getAssetRef(item) !== ref)];

  return {
    batch,
    label: "Blaasfolies — FFS vooraan in productGallery",
    docIds,
    set: { productGallery: merged },
    files: [rel(file)],
    action: "patch",
  };
}

async function planStretchHoodKrimphoezen(
  client: SanityClient,
  file: string,
  dryRun: boolean,
  cache: Map<string, string>,
): Promise<PlannedPatch[]> {
  const batch: Batch = "products";
  const filename = basename(file);
  const assetRef = await resolveAssetForFile(client, file, cache, dryRun);
  const patches: PlannedPatch[] = [];

  for (const docId of siblingDocIds("product-nl-stretch-hood")) {
    const doc = await client.fetch<{ solutionCards?: { _key?: string; title?: string; image?: ImageWithAlt }[] } | null>(
      `*[_id == $id][0]{ solutionCards[]{ _key, title, image } }`,
      { id: docId },
    );
    if (!doc) continue;

    const cards = doc.solutionCards ?? [];
    const idx = cards.findIndex((c) => /krimphoez/i.test(c.title ?? ""));
    if (idx < 0) {
      patches.push({
        batch,
        label: `Stretch hood — Krimphoezen (${docId})`,
        docIds: [docId],
        set: {},
        files: [rel(file)],
        action: "skip",
        skipReason: "geen solutionCard Krimphoezen",
      });
      continue;
    }

    const cardRef = getAssetRef(cards[idx].image);
    if (cardRef) {
      const name = await assetOriginalFilename(client, cardRef);
      if (name === filename) {
        patches.push({
          batch,
          label: `Stretch hood — Krimphoezen (${docId})`,
          docIds: [docId],
          set: {},
          files: [rel(file)],
          action: "skip",
          skipReason: `solutionCards[${idx}].image is al ${filename}`,
        });
        continue;
      }
    }

    const alt = cards[idx].image?.alt?.trim() || cards[idx].title?.trim() || "Krimphoezen";
    const updated = cards.map((card, i) =>
      i === idx
        ? {
            ...card,
            _key: card._key ?? `krimphoezen-${i}`,
            _type: "solutionCard",
            image: buildImageWithAlt(assetRef, alt),
          }
        : card,
    );

    patches.push({
      batch,
      label: `Stretch hood — Krimphoezen (${docId})`,
      docIds: [docId],
      set: { solutionCards: updated },
      files: [rel(file)],
      action: "patch",
    });
  }

  if (patches.length === 0) {
    patches.push({
      batch,
      label: "Stretch hood — Krimphoezen",
      docIds: siblingDocIds("product-nl-stretch-hood"),
      set: {},
      files: [rel(file)],
      action: "skip",
      skipReason: "geen stretch-hood documenten gevonden",
    });
  }

  return patches;
}

async function planLocationMaps(
  client: SanityClient,
  dryRun: boolean,
  cache: Map<string, string>,
): Promise<PlannedPatch[]> {
  const batch: Batch = "maps";
  const settings = await client.fetch<{
    _id: string;
    locations?: { _key?: string; name?: string | null; mapImage?: ImageWithAlt | null }[];
  } | null>(`*[_type == "siteSettings"][0]{ _id, locations }`);

  if (!settings?._id) {
    return [
      {
        batch,
        label: "siteSettings locatiekaarten",
        docIds: ["siteSettings"],
        set: {},
        files: [],
        action: "skip",
        skipReason: "siteSettings niet gevonden",
      },
    ];
  }

  const mapFiles: { file: string; match: (name: string, index: number) => boolean; alt: string }[] = [
    {
      file: join(PUBLIC_IMAGES, "hobon_map.jpg"),
      match: (name, index) =>
        index === 0 || name.toLowerCase().includes("hobon") || name.toLowerCase().includes("lievegem"),
      alt: "Kaart van Hobon Lievegem",
    },
    {
      file: join(PUBLIC_IMAGES, "vhp_map.jpg"),
      match: (name, index) =>
        index === 1 || name.toLowerCase().includes("vhp") || name.toLowerCase().includes("roeselare"),
      alt: "Kaart van VHP Roeselare",
    },
  ];

  const patches: PlannedPatch[] = [];
  const locations = settings.locations ?? [];

  for (const { file, match, alt } of mapFiles) {
    if (!existsSync(file)) {
      patches.push({
        batch,
        label: `Locatiekaart ${basename(file)}`,
        docIds: [settings._id],
        set: {},
        files: [rel(file)],
        action: "skip",
        skipReason: "bestand niet gevonden",
      });
      continue;
    }

    const locIndex = locations.findIndex((loc, i) => match(loc.name ?? "", i));
    if (locIndex < 0) {
      patches.push({
        batch,
        label: `Locatiekaart ${basename(file)}`,
        docIds: [settings._id],
        set: {},
        files: [rel(file)],
        action: "skip",
        skipReason: "geen passende locatie in siteSettings.locations",
      });
      continue;
    }

    const loc = locations[locIndex];
    const path = `locations[_key=="${loc._key}"].mapImage`;
    const filename = basename(file);
    const existingRef = getAssetRef(loc.mapImage);
    if (existingRef) {
      const name = await assetOriginalFilename(client, existingRef);
      if (name === filename) {
        patches.push({
          batch,
          label: `Locatiekaart ${loc.name ?? filename}`,
          docIds: [settings._id],
          set: {},
          files: [rel(file)],
          action: "skip",
          skipReason: `mapImage is al ${filename}`,
        });
        continue;
      }
    }

    const ref = await resolveAssetForFile(client, file, cache, dryRun);
    patches.push({
      batch,
      label: `Locatiekaart ${loc.name ?? filename}`,
      docIds: [settings._id],
      set: { [path]: buildImageWithAlt(ref, alt) },
      files: [rel(file)],
      action: "patch",
    });
  }

  return patches;
}

function sortedImages(dir: string, preferredOrder?: string[]): string[] {
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .map((f) => join(dir, f));

  if (preferredOrder?.length) {
    const byName = new Map(files.map((f) => [basename(f), f]));
    const ordered: string[] = [];
    for (const name of preferredOrder) {
      const hit = byName.get(name);
      if (hit) ordered.push(hit);
    }
    for (const f of files.sort((a, b) => a.localeCompare(b, "nl"))) {
      if (!ordered.includes(f)) ordered.push(f);
    }
    return ordered;
  }

  return files.sort((a, b) => a.localeCompare(b, "nl"));
}

/** Zelfde volgorde als migrate-product-content-51c (hero = eerste item). */
const PRODUCT_FILE_ORDER: Record<string, string[]> = {
  Stretchhood: [
    "iStock-1709161061.jpg",
    "iStock-1390200956.jpg",
    "iStock-946769474.jpg",
  ],
  "Krat zakken": [
    "iStock-2158237125.jpg",
    "iStock-1396946372.jpg",
    "iStock-1324670024.jpg",
  ],
  PATTYN: ["iStock-1290891988.jpg"],
};

async function buildAllPlans(client: SanityClient, dryRun: boolean): Promise<PlannedPatch[]> {
  const cache = new Map<string, string>();
  const plans: PlannedPatch[] = [];

  const aboutDir = join(PUBLIC_IMAGES, "Over Hobon");
  const aboutFiles = sortedImages(aboutDir);
  if (aboutFiles[0]) {
    plans.push(
      await planHeroMediaPatch(client, {
        batch: "about",
        label: "Over Hobon — heroMedia",
        nlDocId: "aboutPage-nl",
        file: aboutFiles[0],
        alt: "Onze aanpak bij Hobon",
        dryRun,
        cache,
      }),
    );
  }
  if (aboutFiles.length > 1) {
    plans.push({
      batch: "about",
      label: "Over Hobon — onze_aanpak_2-5",
      docIds: [],
      set: {},
      files: aboutFiles.slice(1).map(rel),
      action: "skip",
      skipReason: "aboutPage heeft geen gallery-veld — alleen onze_aanpak_1 → heroMedia",
    });
  }

  const boterfolieFile = join(PUBLIC_IMAGES, "Folies", "Boterfolie.png");
  if (existsSync(boterfolieFile)) {
    plans.push(
      await planProductHeroGallery(client, {
        batch: "folies",
        label: "Boterfolie",
        nlDocId: "product-nl-boterfolie",
        files: [boterfolieFile],
        heroAlt: "Boterfolie op rol",
        galleryAlts: ["Boterfolie op rol"],
        dryRun,
        cache,
      }),
    );
  }

  const ffsHobon = join(PUBLIC_IMAGES, "Folies", "FFS FOLIE HOBON.png");
  if (existsSync(ffsHobon)) {
    plans.push(
      await planFeaturedImagePatch(client, {
        batch: "folies",
        label: "FFS-lijn insight — featuredImage",
        nlDocId: "insight-nl-ffs-lijn-65-meter",
        file: ffsHobon,
        alt: "FFS-folie lijn Hobon",
        dryRun,
        cache,
      }),
    );
  }

  const ffsFolie = join(PUBLIC_IMAGES, "Folies", "FFS FOLIE.png");
  if (existsSync(ffsFolie)) {
    plans.push(await planBlaasfoliesFfsGallery(client, ffsFolie, dryRun, cache));
  }

  const contactDir = join(PUBLIC_IMAGES, "Contact");
  const contactFiles = sortedImages(contactDir);
  if (contactFiles[0]) {
    plans.push(
      await planHeroMediaPatch(client, {
        batch: "contact",
        label: "Contact — heroMedia",
        nlDocId: "contactPage-nl",
        file: contactFiles[0],
        alt: "Hobon contact",
        dryRun,
        cache,
      }),
    );
  }
  if (contactFiles[1]) {
    plans.push({
      batch: "contact",
      label: "Contact — contact_2",
      docIds: [],
      set: {},
      files: [rel(contactFiles[1])],
      action: "skip",
      skipReason: "contactPage heeft geen gallery-veld — alleen contact_1 → heroMedia",
    });
  }

  const pattynDir = join(PUBLIC_IMAGES, "PATTYN");
  const pattynFiles = sortedImages(pattynDir, PRODUCT_FILE_ORDER.PATTYN);
  if (pattynFiles.length) {
    plans.push(
      await planProductHeroGallery(client, {
        batch: "products",
        label: "PATTYN",
        nlDocId: "product-nl-pattyn",
        files: pattynFiles,
        heroAlt: "PATTYN folie op inpaklijn",
        galleryAlts: pattynFiles.map((_, i) =>
          i === 0 ? "PATTYN folie op inpaklijn" : `PATTYN — foto ${i + 1}`,
        ),
        dryRun,
        cache,
      }),
    );
  }

  const stretchDir = join(PUBLIC_IMAGES, "Stretchhood");
  const stretchFiles = sortedImages(stretchDir, PRODUCT_FILE_ORDER.Stretchhood);
  if (stretchFiles.length) {
    plans.push(
      await planProductHeroGallery(client, {
        batch: "products",
        label: "Stretch hood",
        nlDocId: "product-nl-stretch-hood",
        files: stretchFiles,
        heroAlt: "Stretch hood op pallet",
        galleryAlts: [
          "Stretch hood op pallet",
          "Palletbescherming met stretch hood",
          "Stretch hood in logistiek",
        ],
        dryRun,
        cache,
      }),
    );
  }

  const krimphoezenCard = join(PUBLIC_IMAGES, "Krimphoezen", "iStock-1151210422.jpg");
  if (existsSync(krimphoezenCard)) {
    plans.push(...(await planStretchHoodKrimphoezen(client, krimphoezenCard, dryRun, cache)));
  }
  const krimphoezenExtra = sortedImages(join(PUBLIC_IMAGES, "Krimphoezen")).filter(
    (f) => basename(f) !== "iStock-1151210422.jpg",
  );
  if (krimphoezenExtra.length) {
    plans.push({
      batch: "products",
      label: "Krimphoezen — overige bestanden",
      docIds: [],
      set: {},
      files: krimphoezenExtra.map(rel),
      action: "skip",
      skipReason: "geen apart gallery-veld — alleen iStock-1151210422 → solutionCards[Krimphoezen]",
    });
  }

  const kratDir = join(PUBLIC_IMAGES, "Krat zakken");
  const kratFiles = sortedImages(kratDir, PRODUCT_FILE_ORDER["Krat zakken"]);
  if (kratFiles.length) {
    plans.push(
      await planProductHeroGallery(client, {
        batch: "products",
        label: "Kratzakken",
        nlDocId: "product-nl-kratzakken",
        files: kratFiles,
        heroAlt: "Kratzakken (LDPE)",
        galleryAlts: ["Kratzak in productie", "Kratzak op lijn", "Kratzak toepassing"],
        dryRun,
        cache,
      }),
    );
  }

  plans.push(...(await planLocationMaps(client, dryRun, cache)));

  return plans;
}

function filterByBatch(plans: PlannedPatch[], batch: Batch): PlannedPatch[] {
  if (batch === "all") return plans;
  return plans.filter((p) => p.batch === batch);
}

function printPlans(plans: PlannedPatch[], dryRun: boolean) {
  console.log(`\n${"=".repeat(72)}`);
  console.log(`HOB-59 — lokale foto's → Sanity (${dryRun ? "DRY-RUN" : "WRITE"})`);
  console.log(`${"=".repeat(72)}\n`);

  for (const plan of plans) {
    const icon = plan.action === "patch" ? "PATCH" : "SKIP";
    console.log(`[${icon}] ${plan.label}`);
    for (const file of plan.files) console.log(`  bestand: ${file}`);
    if (plan.docIds.length) console.log(`  docs: ${plan.docIds.join(", ")}`);
    if (plan.action === "patch") {
      console.log(`  velden: ${Object.keys(plan.set).join(", ")}`);
    }
    if (plan.skipReason) console.log(`  reden: ${plan.skipReason}`);
    console.log("");
  }

  const patches = plans.filter((p) => p.action === "patch");
  const skips = plans.filter((p) => p.action === "skip");
  const uniqueFiles = new Set(plans.flatMap((p) => p.files));
  console.log("--- Samenvatting ---");
  console.log(`Patches: ${patches.length}`);
  console.log(`Overgeslagen: ${skips.length}`);
  console.log(`Unieke bestanden in plan: ${uniqueFiles.size}`);
  console.log(`Document-patches (incl. FR/EN): ${patches.reduce((n, p) => n + p.docIds.length, 0)}`);
}

async function applyPlans(client: SanityClient, plans: PlannedPatch[]) {
  for (const plan of plans) {
    if (plan.action !== "patch") continue;
    for (const docId of plan.docIds) {
      await client.patch(docId).set(plan.set).commit({ visibility: "async" });
      console.log(`OK ${docId} ← ${Object.keys(plan.set).join(", ")}`);
    }
  }
}

async function main() {
  const { dryRun, batch } = parseArgs();

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: dryRun ? undefined : token,
    useCdn: dryRun,
  });

  if (!dryRun && !token) {
    console.error("SANITY_API_WRITE_TOKEN ontbreekt in .env.local");
    process.exit(1);
  }

  const allPlans = await buildAllPlans(client, dryRun);
  const plans = filterByBatch(allPlans, batch);
  printPlans(plans, dryRun);

  if (!dryRun) {
    await applyPlans(client, plans);
    console.log("\nKlaar.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
