import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/lib/sanity/client";

/** Server-only client for draft slug resolution (never import from client components). */
export function createPreviewClient() {
  const token = process.env.SANITY_API_READ_TOKEN?.trim();
  if (!token) {
    throw new Error("SANITY_API_READ_TOKEN is not configured");
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    perspective: "previewDrafts",
    useCdn: false,
    stega: { enabled: false },
  });
}
