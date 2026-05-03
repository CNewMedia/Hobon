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

export const aboutPageQuery = `*[_type == "aboutPage" && language == $locale][0]`;
export const sustainabilityPageQuery = `*[_type == "sustainabilityPage" && language == $locale][0]`;
export const contactPageQuery = `*[_type == "contactPage" && language == $locale][0]`;
export const productOverviewPageQuery = `*[_type == "productOverviewPage" && language == $locale][0]`;
export const sectorOverviewPageQuery = `*[_type == "sectorOverviewPage" && language == $locale][0]`;
export const insightsOverviewPageQuery = `*[_type == "insightsOverviewPage" && language == $locale][0]`;

export const productBySlugQuery = `*[_type == "product" && language == $locale && slug.current == $slug][0]`;

export const productsForLocaleQuery = `*[_type == "product" && language == $locale] | order(title asc) {
  title,
  "slug": slug.current
}`;

export const insightBySlugQuery = `*[_type == "insightArticle" && language == $locale && slug.current == $slug][0]`;

export const insightsForLocaleQuery = `*[_type == "insightArticle" && language == $locale] | order(publishedAt desc) {
  title,
  "slug": slug.current,
  publishedAt,
  lead
}`;
