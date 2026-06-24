export const PREVIEW_SINGLETON_TYPES = [
  "homePage",
  "aboutPage",
  "sustainabilityPage",
  "contactPage",
  "productOverviewPage",
  "sectorOverviewPage",
  "insightsOverviewPage",
] as const;

export const PREVIEW_SLUG_TYPES = ["product", "sector"] as const;

export const PREVIEW_SCHEMA_TYPES = new Set<string>([
  ...PREVIEW_SINGLETON_TYPES,
  ...PREVIEW_SLUG_TYPES,
]);

export function isPreviewableSchemaType(type: string): boolean {
  return PREVIEW_SCHEMA_TYPES.has(type);
}
