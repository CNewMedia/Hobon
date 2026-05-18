/**
 * Eenmalige patch: homePage heroMedia → video met bestaand /public bestand.
 *
 * npm run migrate:home-hero-media
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
  console.error("SANITY_API_WRITE_TOKEN ontbreekt (.env.local)");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const LOCALES = ["nl", "fr", "en"] as const;

const heroMedia = {
  _type: "heroMedia",
  mediaType: "video",
  video: {
    src: "/assets/video/Hobon-intro-web.mp4",
  },
};

async function main() {
  for (const locale of LOCALES) {
    const id = `homePage-${locale}`;
    await client
      .patch(id)
      .set({ heroMedia })
      .commit();
    console.log(`Patched ${id}`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
