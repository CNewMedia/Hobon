/**
 * Vult of corrigeert sector.listingDescription alleen wanneer inhoud ontbreekt
 * of nog een [TODO]-placeholder is — afgeleid van heroIntro (platte tekst),
 * anders marker voor nalezen.
 *
 * npm run seed:listing-sectors
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

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function needsReplace(desc: string | null | undefined) {
  if (desc == null || !String(desc).trim()) return true;
  return String(desc).includes("[TODO]");
}

function deriveFromHero(heroIntro: string | null | undefined): string | null {
  if (heroIntro == null || !String(heroIntro).trim()) return null;
  const plain = stripHtml(heroIntro);
  if (!plain || plain.includes("[TODO]")) return null;
  if (plain.length <= 200) return plain;
  return `${plain.slice(0, 157).trim()}…`;
}

async function main() {
  if (!token) {
    console.error("Missing SANITY_API_WRITE_TOKEN");
    process.exit(1);
  }

  const sectors = await client.fetch<
    { _id: string; listingDescription?: string | null; heroIntro?: string | null }[]
  >(`*[_type == "sector" && language == "nl"]{_id, listingDescription, heroIntro}`);

  for (const s of sectors) {
    if (!needsReplace(s.listingDescription ?? undefined)) {
      console.log("Skip (already OK)", s._id);
      continue;
    }
    const derived = deriveFromHero(s.heroIntro);
    const next = derived ?? MARKER;
    await client.patch(s._id).set({ listingDescription: next }).commit({ visibility: "async" });
    console.log("Patched", s._id, derived ? "(from heroIntro)" : "(marker)");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
