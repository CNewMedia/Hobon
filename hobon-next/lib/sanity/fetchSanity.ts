import type { QueryParams } from "sanity";
import { draftMode } from "next/headers";
import { client } from "@/lib/sanity/client";
import { stripAIMarkersDeep } from "@/lib/text/strip-ai-marker";

async function isDraftModeEnabled(): Promise<boolean> {
  try {
    const { isEnabled } = await draftMode();
    return isEnabled;
  } catch {
    // draftMode() is unavailable during static generation (generateStaticParams, etc.)
    return false;
  }
}

/**
 * Fetches from Sanity and strips "[AI-translated] " from all string fields
 * before data reaches components or metadata builders.
 *
 * When Next.js Draft Mode is enabled: uses SANITY_API_READ_TOKEN (server-only)
 * with perspective previewDrafts to read unpublished drafts.
 */
export async function fetchSanity<QueryResponse = any>(
  query: string,
  params: QueryParams = {},
): Promise<QueryResponse> {
  const isEnabled = await isDraftModeEnabled();

  if (isEnabled) {
    const token = process.env.SANITY_API_READ_TOKEN?.trim();
    if (!token) {
      throw new Error("SANITY_API_READ_TOKEN is required for draft preview");
    }

    const result = await client
      .withConfig({
        token,
        perspective: "previewDrafts",
        useCdn: false,
        stega: { enabled: false },
      })
      .fetch(query, params);

    return stripAIMarkersDeep(result) as QueryResponse;
  }

  const result = await client.fetch(query, params);
  return stripAIMarkersDeep(result) as QueryResponse;
}
