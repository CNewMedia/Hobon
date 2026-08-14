import type { SlugIsUniqueValidator } from "sanity";

/**
 * Slug unique per document-type + language (niet globaal).
 * Routing is `language == $locale && slug.current == $slug`.
 */
export const isUniquePerLanguage: SlugIsUniqueValidator = async (slug, context) => {
  const { document, getClient } = context;
  const id = document?._id?.replace(/^drafts\./, "");
  const type = document?._type;
  const language = typeof document?.language === "string" ? document.language : undefined;
  if (!id || !type || !slug) return true;

  const client = getClient({ apiVersion: "2024-01-01" });
  const params = { draft: `drafts.${id}`, published: id, type, slug, language };
  const query = language
    ? `!defined(*[_type == $type && slug.current == $slug && language == $language && !(_id in [$draft, $published])][0]._id)`
    : `!defined(*[_type == $type && slug.current == $slug && !(_id in [$draft, $published])][0]._id)`;

  return client.fetch(query, params);
};
