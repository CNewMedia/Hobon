import { createClient } from "@sanity/client";
import { defaultUILabels } from "../types/uiLabels";

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

async function main() {
  if (!token) throw new Error("Missing SANITY_API_WRITE_TOKEN");

  const existing = await client.fetch<{ _id: string } | null>(`*[_id == "uiLabels-nl"][0]{ _id }`);

  if (existing) {
    await client
      .patch("uiLabels-nl")
      .set({ aboutKeyFactsTitle: defaultUILabels.aboutKeyFactsTitle })
      .commit();
    console.log("Patched uiLabels-nl: aboutKeyFactsTitle");
    return;
  }

  const doc = {
    _id: "uiLabels-nl",
    _type: "uiLabels",
    language: "nl",
    ...defaultUILabels,
  };

  await client.createOrReplace(doc);
  console.log("Created uiLabels-nl (full seed)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
