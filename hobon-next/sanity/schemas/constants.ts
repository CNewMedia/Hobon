/** Document types that can be targeted from header/footer internal links. */
export const INTERNAL_LINK_TO = [
  { type: "homePage" },
  { type: "aboutPage" },
  { type: "sustainabilityPage" },
  { type: "contactPage" },
  { type: "productOverviewPage" },
  { type: "sectorOverviewPage" },
  { type: "insightsOverviewPage" },
  { type: "sector" },
  { type: "product" },
  { type: "insightArticle" },
] as const;
