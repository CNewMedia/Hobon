# Hardcoded images audit (HOB-58)

Audit van alle `components/**/*Template.tsx` en `app/**/page.tsx` op hardcoded beeld-URL's (content images, geen SVG/iconen).

**Status:** afgehandeld — alle runtime hardcodes verwijderd; waarden gemigreerd naar Sanity via `npm run migrate:hardcoded-images-58`.

---

## Samenvatting

| Bestand | Hardcoded URL / gedrag | Sanity-veld | Status |
|---------|------------------------|-------------|--------|
| `components/home/HomeTemplate.tsx` | Unsplash fallback `aboutImage` | `homePage.aboutImage` | ✅ verwijderd |
| `components/home/HomeTemplate.tsx` | Unsplash fallback sector rail cards | `sector.listingImage` (+ legacy `listingImageUrl`) | ✅ verwijderd |
| `components/sector/SectorTemplate.tsx` | Unsplash fallback hero | `sector.heroMainImage` (+ legacy `heroMainImageUrl`) | ✅ verwijderd |
| `components/sector/SectorTemplate.tsx` | Unsplash fallback deep dive | `sector.deepPhoto` (+ legacy `deepPhotoUrl`) | ✅ verwijderd |
| `components/sector/SectorTemplate.tsx` | Unsplash op "andere sectoren"-kaarten | `sector.listingImage` / `heroMainImage` via `sectorNavQuery` | ✅ verwijderd |
| `components/product/ProductTemplate.tsx` | `/assets/images/iStock-*` placeholder pools | `product.heroImage`, `heroThumbs`, `solutionCards`, `productGallery` | ✅ pools verwijderd |
| `components/insights/InsightsOverviewTemplate.tsx` | Unsplash `CARD_IMG_FALLBACK` | `insightsOverviewPage.articleCardFallbackImage` | ✅ verwijderd |
| `components/insights/InsightDetailTemplate.tsx` | Unsplash `HERO_FALLBACK` | zelfde fallback + `insightArticle.featuredImage` | ✅ verwijderd |
| `components/contact/ContactTemplate.tsx` | `/assets/images/hobon_map.jpg`, `vhp_map.jpg` | `siteSettings.locations[].mapImage` | ✅ verwijderd |
| `app/[locale]/layout.tsx` | `/assets/images/logo.png` logo fallback | `siteSettings.logo` / `headerNavigation.logo` | ✅ verwijderd |
| `lib/sanity/resolveImageSrc.ts` | `PRODUCT_PLACEHOLDER_POOLS` static paths | — (helper opgeschoond) | ✅ verwijderd |

## Geen bevinding (OK)

| Bestand | Opmerking |
|---------|-----------|
| `components/about/AboutTemplate.tsx` | Hero via `HeroMediaPanel` → Sanity `heroMedia` |
| `components/listing/ListingTemplate.tsx` | Kaartbeelden via Sanity queries; CSS placeholder zonder URL |
| `components/sustainability/SustainabilityTemplate.tsx` | Geen hardcoded image URL's |
| `app/**/page.tsx` | OG/metadata via `buildPageMetadata` → `seo.ogImage` / `seoDefaults.defaultOgImage` (geen hardcode in pages) |

## Buiten scope (bewust niet gemigreerd)

- **SVG-iconen** in layout/templates (`ArrowBtnIcon`, decoratieve SVG's in sector/product)
- **CSS placeholders** (`.p-hero-placeholder` — geen `src`, puur UI)
- **Homepage hero video** (`heroMedia` video-veld)
- **Seed/migrate scripts** (`scripts/seed.ts`, etc.) — brondata, geen runtime fallbacks

## Migratie

```bash
# Dry-run
npm run migrate:hardcoded-images-58

# Schrijven naar Sanity (SANITY_API_WRITE_TOKEN vereist)
npm run migrate:hardcoded-images-58 -- --write
```

Uploadt o.a. logo, kaartbeelden locaties, insight card fallback, default OG (indien leeg), home `aboutImage` (NL, indien leeg).

## Acceptatie

- [x] Auditdocument compleet
- [x] Geen hardcoded content-image URL's in templates/layout
- [x] Studio: hero, gallery, card, OG, map, logo bewerkbaar
- [ ] Handmatig: wijzig één image in Studio → zichtbaar op preview + publiek
- [ ] Handmatig: visuele check desktop / 768 / 375, NL/FR/EN
