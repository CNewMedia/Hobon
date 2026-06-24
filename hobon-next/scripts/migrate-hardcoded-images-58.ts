/**
 * HOB-58 — Migreer hardcoded runtime-beelden naar Sanity.
 *
 * Dry-run (default):
 *   npm run migrate:hardcoded-images-58
 *
 * Write:
 *   npm run migrate:hardcoded-images-58 -- --write
 */
import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

type ImageWithAlt = {
  _type?: string;
  alt?: string;
  image?: { _type?: string; asset?: { _type?: string; _ref?: string } };
};

type LocationRow = {
  _key?: string;
  name?: string | null;
  mapImage?: ImageWithAlt | null;
};

type SiteSettingsDoc = {
  _id: string;
  logo?: ImageWithAlt | null;
  locations?: LocationRow[] | null;
};

type SeoDefaultsDoc = {
  _id: string;
  language?: string;
  defaultOgImage?: unknown;
};

type HomePageDoc = {
  _id: string;
  language?: string;
  aboutImage?: ImageWithAlt | null;
};

type InsightsOverviewDoc = {
  _id: string;
  language?: string;
  articleCardFallbackImage?: ImageWithAlt | null;
};

type PlannedPatch = {
  docId: string;
  path: string;
  label: string;
  action: "upload" | "skip";
  skipReason?: string;
  localFile?: string;
  remoteUrl?: string;
  alt: string;
};

const ROOT = path.join(process.cwd());
const PUBLIC = path.join(ROOT, "public");

const INSIGHT_FALLBACK_URL =
  "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200&q=80&auto=format&fit=crop";
const HOME_ABOUT_FALLBACK_URL =
  "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800&q=80&auto=format&fit=crop";

function parseArgs() {
  const write = process.argv.includes("--write");
  return { dryRun: !write, write };
}

function hasAsset(field?: ImageWithAlt | null): boolean {
  return Boolean(field?.image?.asset?._ref);
}

function hasOgAsset(field: unknown): boolean {
  if (!field || typeof field !== "object") return false;
  const asset = (field as { asset?: { _ref?: string } }).asset;
  return Boolean(asset?._ref);
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

async function uploadLocalFile(
  client: ReturnType<typeof createClient>,
  filePath: string,
  cache: Map<string, string>,
): Promise<string> {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(PUBLIC, filePath.replace(/^\//, ""));
  const key = `file:${abs}`;
  const cached = cache.get(key);
  if (cached) return cached;

  if (!fs.existsSync(abs)) {
    throw new Error(`Bestand niet gevonden: ${abs}`);
  }

  const buffer = fs.readFileSync(abs);
  const ext = path.extname(abs).toLowerCase();
  const contentType =
    ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  const asset = await client.assets.upload("image", buffer, {
    filename: path.basename(abs),
    contentType,
  });
  cache.set(key, asset._id);
  return asset._id;
}

async function uploadRemoteUrl(
  client: ReturnType<typeof createClient>,
  url: string,
  cache: Map<string, string>,
): Promise<string> {
  const key = `url:${url}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download mislukt ${res.status} voor ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const asset = await client.assets.upload("image", buffer, {
    filename: "migrated-hob58.jpg",
    contentType,
  });
  cache.set(key, asset._id);
  return asset._id;
}

function locationMapFile(name?: string | null, index?: number): { file: string; alt: string } | null {
  const normalized = name?.toLowerCase() ?? "";
  if (normalized.includes("vhp") || normalized.includes("roeselare") || index === 1) {
    return { file: "assets/images/vhp_map.jpg", alt: "Kaart van VHP Roeselare" };
  }
  if (normalized.includes("hobon") || normalized.includes("lievegem") || index === 0) {
    return { file: "assets/images/hobon_map.jpg", alt: "Kaart van Hobon Lievegem" };
  }
  return null;
}

function planPatches(
  siteSettings: SiteSettingsDoc | null,
  seoDefaults: SeoDefaultsDoc[],
  homePages: HomePageDoc[],
  insightsPages: InsightsOverviewDoc[],
): PlannedPatch[] {
  const patches: PlannedPatch[] = [];

  if (siteSettings) {
    if (hasAsset(siteSettings.logo)) {
      patches.push({
        docId: siteSettings._id,
        path: "logo",
        label: "siteSettings.logo",
        action: "skip",
        skipReason: "logo heeft al asset",
        alt: "Hobon",
      });
    } else {
      patches.push({
        docId: siteSettings._id,
        path: "logo",
        label: "siteSettings.logo",
        action: "upload",
        localFile: "assets/images/logo.png",
        alt: "Hobon",
      });
    }

    (siteSettings.locations ?? []).forEach((loc, index) => {
      const map = locationMapFile(loc.name, index);
      if (!map) return;
      const fieldPath = `locations[_key=="${loc._key}"].mapImage`;
      if (hasAsset(loc.mapImage)) {
        patches.push({
          docId: siteSettings._id,
          path: fieldPath,
          label: `location map: ${loc.name ?? index}`,
          action: "skip",
          skipReason: "mapImage heeft al asset",
          alt: map.alt,
        });
      } else {
        patches.push({
          docId: siteSettings._id,
          path: fieldPath,
          label: `location map: ${loc.name ?? index}`,
          action: "upload",
          localFile: map.file,
          alt: map.alt,
        });
      }
    });
  }

  for (const doc of seoDefaults) {
    if (hasOgAsset(doc.defaultOgImage)) {
      patches.push({
        docId: doc._id,
        path: "defaultOgImage",
        label: `seoDefaults.defaultOgImage (${doc.language})`,
        action: "skip",
        skipReason: "defaultOgImage al ingevuld",
        alt: "Hobon",
      });
    } else {
      patches.push({
        docId: doc._id,
        path: "defaultOgImage",
        label: `seoDefaults.defaultOgImage (${doc.language})`,
        action: "upload",
        localFile: "assets/images/logo.png",
        alt: "Hobon — default OG",
      });
    }
  }

  for (const doc of homePages) {
    if (doc.language !== "nl") continue;
    if (hasAsset(doc.aboutImage)) {
      patches.push({
        docId: doc._id,
        path: "aboutImage",
        label: `homePage.aboutImage (${doc.language})`,
        action: "skip",
        skipReason: "aboutImage al ingevuld",
        alt: "Hobon productie",
      });
    } else {
      patches.push({
        docId: doc._id,
        path: "aboutImage",
        label: `homePage.aboutImage (${doc.language})`,
        action: "upload",
        remoteUrl: HOME_ABOUT_FALLBACK_URL,
        alt: "Hobon productie",
      });
    }
  }

  for (const doc of insightsPages) {
    if (hasAsset(doc.articleCardFallbackImage)) {
      patches.push({
        docId: doc._id,
        path: "articleCardFallbackImage",
        label: `insightsOverviewPage.articleCardFallbackImage (${doc.language})`,
        action: "skip",
        skipReason: "fallback al ingevuld",
        alt: "Insights",
      });
    } else {
      patches.push({
        docId: doc._id,
        path: "articleCardFallbackImage",
        label: `insightsOverviewPage.articleCardFallbackImage (${doc.language})`,
        action: "upload",
        remoteUrl: INSIGHT_FALLBACK_URL,
        alt: "Insights",
      });
    }
  }

  return patches;
}

async function main() {
  const { dryRun, write } = parseArgs();
  if (write && !token) {
    console.error("SANITY_API_WRITE_TOKEN ontbreekt in .env.local");
    process.exit(1);
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: write ? token : undefined,
    useCdn: !write,
  });

  const [siteSettings, seoDefaults, homePages, insightsPages] = await Promise.all([
    client.fetch<SiteSettingsDoc | null>(`*[_type == "siteSettings"][0]{ _id, logo, locations }`),
    client.fetch<SeoDefaultsDoc[]>(`*[_type == "seoDefaults"]{ _id, language, defaultOgImage }`),
    client.fetch<HomePageDoc[]>(`*[_type == "homePage"]{ _id, language, aboutImage }`),
    client.fetch<InsightsOverviewDoc[]>(
      `*[_type == "insightsOverviewPage"]{ _id, language, articleCardFallbackImage }`,
    ),
  ]);

  const patches = planPatches(siteSettings, seoDefaults, homePages, insightsPages);
  console.log(`MODE: ${dryRun ? "DRY-RUN" : "WRITE"}\n`);

  for (const p of patches) {
    if (p.action === "skip") {
      console.log(`SKIP ${p.label} — ${p.skipReason}`);
      continue;
    }
    const source = p.localFile ?? p.remoteUrl ?? "";
    console.log(`UPLOAD ${p.label} ← ${source} (alt: "${p.alt}")`);
  }

  const toApply = patches.filter((p) => p.action === "upload");
  console.log(`\nTotaal uploads: ${toApply.length}, skips: ${patches.length - toApply.length}`);

  if (dryRun) return;

  const cache = new Map<string, string>();
  for (const patch of toApply) {
    let assetRef: string;
    if (patch.localFile) {
      assetRef = await uploadLocalFile(client, patch.localFile, cache);
    } else if (patch.remoteUrl) {
      assetRef = await uploadRemoteUrl(client, patch.remoteUrl, cache);
    } else {
      continue;
    }

    const value =
      patch.path === "defaultOgImage"
        ? {
            _type: "image",
            asset: { _type: "reference", _ref: assetRef },
          }
        : buildImageWithAlt(assetRef, patch.alt);

    await client.patch(patch.docId).set({ [patch.path]: value }).commit({ visibility: "async" });
    console.log(`PATCH OK ${patch.docId} → ${patch.path}`);
  }

  console.log("\nKlaar.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
