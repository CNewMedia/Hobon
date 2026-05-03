import type { SchemaTypeDefinition } from "sanity";
import { seo } from "./objects/seo";
import { cta } from "./objects/cta";
import { usp } from "./objects/usp";
import { imageWithAlt } from "./objects/imageWithAlt";
import { richText } from "./objects/richText";
import { siteSettings } from "./documents/siteSettings";
import { homePage } from "./documents/homePage";
import { aboutPage } from "./documents/aboutPage";
import { sustainabilityPage } from "./documents/sustainabilityPage";
import { contactPage } from "./documents/contactPage";
import { productOverviewPage } from "./documents/productOverviewPage";
import { sectorOverviewPage } from "./documents/sectorOverviewPage";
import { insightsOverviewPage } from "./documents/insightsOverviewPage";
import { sector } from "./documents/sector";
import { product } from "./documents/product";
import { insightArticle } from "./documents/insightArticle";

export const schemaTypes: SchemaTypeDefinition[] = [
  seo,
  cta,
  usp,
  imageWithAlt,
  richText,
  siteSettings,
  homePage,
  aboutPage,
  sustainabilityPage,
  contactPage,
  productOverviewPage,
  sectorOverviewPage,
  insightsOverviewPage,
  sector,
  product,
  insightArticle,
];
