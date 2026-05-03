import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { documentInternationalization } from "@sanity/document-internationalization";
import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";

const i18nSchemaTypes = [
  "homePage",
  "aboutPage",
  "sustainabilityPage",
  "contactPage",
  "productOverviewPage",
  "sectorOverviewPage",
  "insightsOverviewPage",
  "sector",
  "product",
  "insightArticle",
  "headerNavigation",
  "footerNavigation",
  "seoDefaults",
] as const;

export default defineConfig({
  name: "hobon",
  title: "Hobon",
  basePath: "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "14bi8ppf",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [
    structureTool({ structure }),
    visionTool(),
    documentInternationalization({
      supportedLanguages: [
        { id: "nl", title: "Nederlands" },
        { id: "fr", title: "Français" },
        { id: "en", title: "English" },
      ],
      schemaTypes: [...i18nSchemaTypes],
      languageField: "language",
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
