import type { QueryParams } from "sanity";
import { client } from "@/lib/sanity/client";
import { stripAIMarkersDeep } from "@/lib/text/strip-ai-marker";

/**
 * Fetches from Sanity and strips "[AI-translated] " from all string fields
 * before data reaches components or metadata builders.
 */
export async function fetchSanity<QueryResponse = any>(
  query: string,
  params: QueryParams = {},
): Promise<QueryResponse> {
  const result = await client.fetch(query, params);
  return stripAIMarkersDeep(result) as QueryResponse;
}
