import type { StructureResolver } from "sanity/structure";

const singletonDoc = (S: Parameters<StructureResolver>[0], type: string, id: string, title: string) =>
  S.listItem()
    .title(title)
    .id(id)
    .child(S.document().schemaType(type).documentId(id).title(title));

const i18nSingleton = (
  S: Parameters<StructureResolver>[0],
  type: string,
  baseId: string,
  title: string,
) =>
  S.listItem()
    .title(title)
    .child(
      S.list()
        .title(title)
        .items([
          singletonDoc(S, type, `${baseId}-nl`, `${title} (NL)`),
          singletonDoc(S, type, `${baseId}-fr`, `${title} (FR)`),
          singletonDoc(S, type, `${baseId}-en`, `${title} (EN)`),
        ]),
    );

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Hobon")
    .items([
      S.listItem()
        .title("🏠 Pagina's")
        .id("pages")
        .child(
          S.list()
            .title("Pagina's")
            .items([
              i18nSingleton(S, "homePage", "homePage", "Home"),
              i18nSingleton(S, "aboutPage", "aboutPage", "Over"),
              i18nSingleton(S, "sustainabilityPage", "sustainabilityPage", "Duurzaamheid"),
              i18nSingleton(S, "contactPage", "contactPage", "Contact"),
              singletonDoc(S, "productOverviewPage", "productOverviewPage-nl", "Producten overview (NL)"),
              singletonDoc(S, "productOverviewPage", "productOverviewPage-fr", "Producten overview (FR)"),
              singletonDoc(S, "productOverviewPage", "productOverviewPage-en", "Producten overview (EN)"),
              singletonDoc(S, "sectorOverviewPage", "sectorOverviewPage-nl", "Sectoren overview (NL)"),
              singletonDoc(S, "sectorOverviewPage", "sectorOverviewPage-fr", "Sectoren overview (FR)"),
              singletonDoc(S, "sectorOverviewPage", "sectorOverviewPage-en", "Sectoren overview (EN)"),
              singletonDoc(S, "insightsOverviewPage", "insightsOverviewPage-nl", "Insights overview (NL)"),
              singletonDoc(S, "insightsOverviewPage", "insightsOverviewPage-fr", "Insights overview (FR)"),
              singletonDoc(S, "insightsOverviewPage", "insightsOverviewPage-en", "Insights overview (EN)"),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("📄 Content")
        .id("content")
        .child(
          S.list()
            .title("Content")
            .items([
              S.documentTypeListItem("sector").title("Sectoren"),
              S.documentTypeListItem("product").title("Producten"),
              S.documentTypeListItem("insightArticle").title("Insight articles"),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("⚙️ Site Foundation")
        .id("foundation")
        .child(
          S.list()
            .title("Site Foundation")
            .items([
              singletonDoc(S, "siteSettings", "siteSettings", "Site Settings"),
              i18nSingleton(S, "headerNavigation", "headerNavigation", "Header Navigation"),
              i18nSingleton(S, "footerNavigation", "footerNavigation", "Footer Navigation"),
              i18nSingleton(S, "seoDefaults", "seoDefaults", "SEO Defaults"),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("📊 Marketing")
        .id("marketing")
        .child(
          S.list()
            .title("Marketing")
            .items([
              singletonDoc(S, "analyticsAndTracking", "analyticsAndTracking", "Analytics & Tracking"),
              singletonDoc(S, "cookieConsent", "cookieConsent", "Cookie Consent"),
            ]),
        ),
    ]);
