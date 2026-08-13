# HOB-64 — Dry-run: i18n-resolutie (taalswitcher + hreflang)

**Status:** STOP — goedgekeurd voor review; **geen** code-write / deploy tot expliciete OK.  
**Audit:** `docs/pre-golive-audit.md` (§5 P0).  
**Test-URL:** altijd `https://hobon-next.vercel.app/…` — **niet** `www.hobon.be` (nog WordPress tot DNS-switch).

---

## Root cause (bevestigd)

| Functie | Nu | Waarom kapot voor insights |
|---------|-----|----------------------------|
| `getDocKeyBySlug` | eist `_id` prefix `insightArticle-{locale}-` | echte IDs: `insight-{locale}-…` of UUID → **key = null** → overview |
| `getLocalizedSlug` | zoekt `insightArticle-{locale}-{key}` | bestaat nooit; UUID-siblings onzichtbaar |
| `metadata.ts` r.58–61 | hergebruikt **zelfde** `pathParts.slug` voor nl/fr/en | hreflang = verkeerde URL’s |
| `translation.metadata` | niet gebruikt in runtime | terwijl dat de enige betrouwbare bron is voor UUID-groepen |

Sector/product werken toevallig: IDs zijn `sector-nl-…` / `product-nl-…` en matchen `${documentType}-{locale}-`.

**Let op:** in `translation.metadata` staan `translations[].language` vaak `null` — locale moet van het **gerefereerde doc** (`language` + `slug`) komen.

**Stats (Sanity production):** 24 insights, **13** met metadata, **11 zonder** (aparte P1 data-taak — niet in HOB-64).

---

## 1. Nieuwe resolutie-logica (voorstel)

```
resolveSiblingSlug(documentType, sourceLocale, sourceSlug, targetLocale)
→ { slug } | { path: overviewFallback }

1. Source-doc: *[_type==$type && language==$sourceLocale && slug.current==$sourceSlug][0]{_id}
   → miss → overview

2. PRIMARY — translation.metadata:
   meta = *[_type=="translation.metadata" && references($sourceId)][0]
   load alle translations[].value._ref → {_id, language, slug}
   pick language == targetLocale met slug
   → return slug

3. FALLBACK — patterned ID (sector/product/seed-insights):
   idPrefix: sector→sector, product→product, insightArticle→insight  ← niet documentType-naam
   als sourceId matcht `${prefix}-${sourceLocale}-{key}`:
     targetId = `${prefix}-${targetLocale}-${key}`
     slug van dat doc → return
   (UUID zonder metadata: geen key → skip)

4. Geen sibling → getOverviewFallbackPath (geen crash)
```

API `resolve-slug` + `switchLocalePathWithSlugLookup` blijven; alleen de mapping-laag verandert.

**Hreflang:** `buildPageMetadata` krijgt per detailpagina gelokaliseerde slugs (via zelfde resolver), plus `x-default` → NL-URL (primaire markt).

Sector/product: stap 2 (meta, indien aanwezig) of stap 3 (patterned) — zelfde pad, geen regressie.

Zonder sibling: die `hreflang`-entry **weglaten** (niet overview, niet verkeerde slug). Switcher: overview-fallback.

---

## 2. Voorbeeld-resolutie NL → FR → EN

### A) BRC/IFS-audit (UUID-siblings + metadata) — kritieke SEO-case

| | `_id` | slug |
|--|-------|------|
| **NL** | `insight-nl-audit-klaar-met-de-juiste-folie` | `brc-en-ifs-audit-hoe-uw-foliekeuze-het-verschil-maakt` |
| **FR** | `9d83f7de-2109-4a0c-b12f-0cc6fa3edb07` | `audit-brc-and-ifs-le-role-du-film` |
| **EN** | `822ba01f-be4e-466b-90e0-40534aad627b` | `brc-and-ifs-audits-why-film-choice-matters` |

Via `translation.metadata` `f5d582d7-644e-4b45-9259-d8a5e3b786c5`.

| Nu (kapot) | Na (voorstel) |
|------------|----------------|
| NL→FR: overview `/fr/insights` | `/fr/insights/audit-brc-and-ifs-le-role-du-film` |
| NL→EN: overview | `/en/insights/brc-and-ifs-audits-why-film-choice-matters` |

### B) Hobon-producent (allemaal UUID + metadata)

| | slug |
|--|------|
| NL | `is-hobon-zelf-producent-van-pe-folie` |
| FR | `hobon-est-il-lui-meme-fabricant-de-film-pe` |
| EN | `is-hobon-a-manufacturer-of-pe-film` |

Nu: overview. Na: correcte siblings via metadata.

### C) BRC AA (patterned IDs, **geen** metadata — dekt de 11-docs P1 deels)

| | `_id` | slug |
|--|-------|------|
| NL | `insight-nl-brc-aa-in-de-praktijk` | `brc-packaging-level-aa-uitgelegd-wat-betekent-het-voor-u` |
| FR | `insight-fr-brc-aa-in-de-praktijk` | `brc-packaging-aa-qu-est-ce-que-cela-signifie` |
| EN | `insight-en-brc-aa-in-de-praktijk` | `brc-packaging-level-aa-explained-what-does-it-mean-for-you` |

Nu: faalt (verkeerde prefix `insightArticle-`). Na: **stap 3** patterned met prefix `insight-` → siblings OK zonder metadata-datafix.

### Sector (regressie-check)

`voedingsindustrie` → FR `industrie-alimentaire` → EN `food-industry` (patterned `sector-*`, ongewijzigd gedrag).

---

## 3. Hreflang vóór → na

Op NL-auditpagina (`SITE_ORIGIN` nu ≈ `https://hobon-next.vercel.app`):

### Vóór (bug)

```html
<link rel="alternate" hreflang="nl" href="…/nl/insights/brc-en-ifs-audit-hoe-uw-foliekeuze-het-verschil-maakt" />
<link rel="alternate" hreflang="fr" href="…/fr/insights/brc-en-ifs-audit-hoe-uw-foliekeuze-het-verschil-maakt" />
<link rel="alternate" hreflang="en" href="…/en/insights/brc-en-ifs-audit-hoe-uw-foliekeuze-het-verschil-maakt" />
<!-- geen x-default -->
```

(FR/EN hergebruiken de NL-slug → verkeerde/404 URL’s voor Google.)

### Na (voorstel)

```html
<link rel="alternate" hreflang="nl" href="…/nl/insights/brc-en-ifs-audit-hoe-uw-foliekeuze-het-verschil-maakt" />
<link rel="alternate" hreflang="fr" href="…/fr/insights/audit-brc-and-ifs-le-role-du-film" />
<link rel="alternate" hreflang="en" href="…/en/insights/brc-and-ifs-audits-why-film-choice-matters" />
<link rel="alternate" hreflang="x-default" href="…/nl/insights/brc-en-ifs-audit-hoe-uw-foliekeuze-het-verschil-maakt" />
```

---

## Scope-grenzen

- **In scope:** runtime resolutie via metadata + patterned fallback; hreflang + `x-default`; switcher degradeert netjes naar overview.
- **Buiten scope:** 11 insights zonder `translation.metadata` vullen (aparte P1 data-taak). Patterned fallback dekt de seed-trio’s (`brc-aa`, `dunner-folie`, `recyclaat-of-virgin`, …).
- **Niet breken:** sector- en product-taalswitch (patterned IDs).

---

## Acceptatiecriteria (na write)

- [ ] Taalswitcher op insight-detail (incl. UUID) → vertaald artikel, niet overview
- [ ] Hreflang per taal eigen gelokaliseerde slug (page-source)
- [ ] `x-default` aanwezig (NL)
- [ ] Sectoren + producten taalswitch blijft werken
- [ ] Geen console errors, build slaagt

---

## Volgende stappen (na goedkeuring)

1. Write: `locale-mapping.ts` (+ eventueel shared helper), `resolve-slug` API, `metadata.ts` + detail-pages
2. Commit + push
3. `vercel --prod` (vanaf repo-root `/Hobon`)
4. Live verify op:
   - `https://hobon-next.vercel.app/nl/insights/brc-en-ifs-audit-hoe-uw-foliekeuze-het-verschil-maakt` (switcher + view-source hreflang)
   - FR/EN siblings + sector/product smoke
