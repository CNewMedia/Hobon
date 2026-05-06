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

  const doc = {
    _id: "uiLabels-nl",
    _type: "uiLabels",
    language: "nl",
    ...defaultUILabels,
  };

  await client.createOrReplace(doc);
  console.log("Seeded uiLabels-nl");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
