export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  ...,
  logo,
  brcBadge,
  locations
}`;

export const headerNavigationQuery = `*[_type == "headerNavigation" && language == $locale][0]{
  ...,
  logo,
  menuItems[]{
    ...,
    internalLink->{_type, _id, "slug": slug.current},
    subItems[]{
      ...,
      internalLink->{_type, _id, "slug": slug.current},
      subItems[]{
        ...,
        internalLink->{_type, _id, "slug": slug.current}
      }
    }
  },
  ctaButton
}`;

export const footerNavigationQuery = `*[_type == "footerNavigation" && language == $locale][0]{
  ...,
  columns[]{
    title,
    links[]{
      ...,
      internalLink->{_type, _id, "slug": slug.current}
    }
  },
  bottomLinks[]{
    ...,
    internalLink->{_type, _id, "slug": slug.current}
  }
}`;

export const seoDefaultsQuery = `*[_type == "seoDefaults" && language == $locale][0]{
  defaultMetaTitle,
  defaultMetaTitleSuffix,
  defaultMetaDescription,
  defaultOgImage,
  twitterHandle,
  organizationSchema
}`;

export const cookieConsentQuery = `*[_type == "cookieConsent" && _id == "cookieConsent"][0]`;

export const analyticsAndTrackingQuery = `*[_type == "analyticsAndTracking" && _id == "analyticsAndTracking"][0]`;
export const uiLabelsQuery = `*[_type == "uiLabels" && language == $locale][0]`;

export const homePageQuery = `*[_type == "homePage" && language == $locale][0]{
  ...,
  seo,
  heroPrimaryCta,
  heroSecondaryCta,
  aboutImage,
  usps,
  processSteps,
  productCards,
  sectorsCta,
  processCta,
  contactSidebarCta,
  stats,
  qualityItems,
  contactTeam
}`;

export const sectorsForLocaleQuery = `*[_type == "sector" && language == $locale] | order(sortOrder asc, title asc) {
  _id,
  title,
  "slug": slug.current,
  navLabel,
  sortOrder,
  listingEyebrow,
  listingDescription,
  listingImageUrl,
  listingPills
}`;

/** Overzichtspagina /sectoren — geen listingImageUrl gebruikt in UI (placeholder). */
export const sectorsListingQuery = `*[_type == "sector" && language == $locale] | order(sortOrder asc, title asc) {
  _id,
  title,
  "slug": slug.current,
  navLabel,
  sortOrder,
  listingEyebrow,
  listingDescription,
  listingPills
}`;

export const sectorOverviewQuery = `*[_type == "sectorOverviewPage" && language == $locale][0]{
  ...,
  seo,
  heroEyebrow,
  heroTitle,
  heroIntro,
  ctaBandTitle,
  ctaBandBody,
  ctaBandPrimary,
  title,
  intro
}`;

export const sectorBySlugQuery = `*[_type == "sector" && language == $locale && slug.current == $slug][0]{
  ...,
  seo,
  slug,
  heroPrimaryCta,
  heroSecondaryCta,
  heroMainImage,
  heroThumbs,
  tapeItems,
  problemBand,
  solutionsCta,
  solutionCards,
  uspStrip,
  deepPrimaryCta,
  deepFaqs,
  complianceItems,
  caseStudies,
  ctaBandTeam
}`;

export const sectorNavQuery = `*[_type == "sector" && language == $locale] | order(sortOrder asc, title asc) {
  title,
  "slug": slug.current,
  navLabel
}`;

export const aboutPageQuery = `*[_type == "aboutPage" && language == $locale][0]{
  ...,
  seo,
  hero,
  storyBlocks[]{headline, body},
  keyFacts[]{number, label, description},
  approach{headline, body},
  cta{
    title,
    buttonLabel,
    buttonLink->{_type, _id, "slug": slug.current}
  }
}`;

export const sustainabilityPageQuery = `*[_type == "sustainabilityPage" && language == $locale][0]{
  ...,
  seo,
  hero,
  standpoint{headline, body},
  practicePoints[]{title, body},
  cta{
    title,
    buttonLabel,
    buttonLink->{_type, _id, "slug": slug.current}
  }
}`;

export const contactPageQuery = `*[_type == "contactPage" && language == $locale][0]{
  ...,
  seo,
  hero,
  intro,
  formTitle,
  formSubmitLabel,
  formThankYouMessage,
  formFields,
  additionalInfo
}`;

export const productOverviewPageQuery = `*[_type == "productOverviewPage" && language == $locale][0]`;
export const sectorOverviewPageQuery = `*[_type == "sectorOverviewPage" && language == $locale][0]`;

export const productOverviewQuery = `*[_type == "productOverviewPage" && language == $locale][0]{
  ...,
  seo,
  heroEyebrow,
  heroTitle,
  heroIntro,
  ctaBandTitle,
  ctaBandBody,
  ctaBandPrimary,
  title,
  intro
}`;

/** Overzichtspagina /producten — alleen producten met showInOverview true. */
export const productsListingQuery = `*[_type == "product" && language == $locale && (!defined(showInOverview) || showInOverview == true)] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  listingEyebrow,
  listingDescription,
  heroEyebrow,
  heroHeadline,
  seo
}`;
export const insightsOverviewPageQuery = `*[_type == "insightsOverviewPage" && language == $locale][0]{
  ...,
  seo,
  hero,
  intro
}`;

export const insightCategoriesQuery = `*[_type == "insightCategory" && language == $locale] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  description,
  color
}`;

export const insightsListQuery = `*[_type == "insightArticle" && language == $locale] | order(publishedAt desc) {
  ...,
  seo,
  "slug": slug.current,
  category->{title, "slug": slug.current, color},
  featuredImage
}`;

export const insightSlugsForLocaleQuery = `*[_type == "insightArticle" && language == $locale && defined(slug.current)]{
  "slug": slug.current
}`;

export const productBySlugQuery = `*[_type == "product" && language == $locale && slug.current == $slug][0]{
  ...,
  seo,
  heroImage,
  relatedSectors[]->{
    _id,
    title,
    "slug": slug.current,
    navLabel,
    listingDescription,
    listingImageUrl
  }
}`;

export const productsForLocaleQuery = `*[_type == "product" && language == $locale] | order(title asc) {
  title,
  "slug": slug.current
}`;

export const insightBySlugQuery = `*[_type == "insightArticle" && language == $locale && slug.current == $slug][0]{
  ...,
  seo,
  "slug": slug.current,
  featuredImage,
  category->{title, "slug": slug.current, color},
  body,
  relatedArticles[]->{
    title,
    "slug": slug.current,
    publishedAt,
    lead,
    featuredImage,
    category->{title}
  }
}`;

/** @deprecated use insightsListQuery */
export const insightsForLocaleQuery = insightsListQuery;
