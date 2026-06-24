# Photo audit post HOB-58 / HOB-59 (HOB-60)

Gegenereerd: 2026-06-24  
Dataset: `production` · project `14bi8ppf`  
Scope: product, sector, page, insight-documenten — hero-/featured-/about-beelden (geen patches, alleen rapport).

## Samenvatting

| Metriek | Aantal |
|---------|--------|
| Documenten gescand (types) | product (24), sector (12), about (3), contact (3), home (3), insight (17), overige pages (12) |
| Hero/featured slots | 62 |
| **Gaps gevonden** | **33** |
| Locale leeg (NL wel gevuld) | 16 |
| Locale asset-ref mismatch | 0 |
| Filename/titel mismatch | 0 |
| Folie-fallback op verkeerd product | 3 |
| Leeg in alle talen | 13 |

## Gerapporteerde issues (gebruiker)

| Issue | Status in audit | Feitelijke bevinding |
|-------|-----------------|----------------------|
| `/fr/produits/feuilles` geen heroImage | ✅ **Bevestigd** | `product-fr-vellen.heroImage` is **leeg**; NL heeft `folies-hero.jpg` (zelfde ref als blaasfolies/dolav). EN idem leeg. |
| `/nl/producten/vellen` stretch-hood foto | ⚠️ **Deels bevestigd** | NL hero is **`folies-hero.jpg`** (asset `image-53d95e8ddf…`), **niet** stretch-hood iStock. Wel **dezelfde folie-fallback** als `product-nl-blaasfolies` en `product-nl-dolav-zakken` — visueel kan blauw/industrieel overkomen als verkeerd product. Stretch-hood gebruikt aparte asset `iStock-1709161061.jpg`. |
| `/fr/a-propos` vergaderfoto | ⚠️ **Content review** | FR/NL/EN about hebben **identieke** asset `onze_aanpak_1.png` (HOB-59). Geen locale-mismatch. Als de foto een vergadering toont, is dat **editorial** — geen technische FR-bug. |

### P0 — Aanbevolen fixes (uit gebruikersmelding + data)

| Prioriteit | Document | Probleem | Voorgestelde fix |
|------------|----------|----------|------------------|
| P0 | `product-fr-vellen`, `product-en-vellen` | heroImage leeg | Sync asset-ref van NL **of** (beter) upload productspecifieke vellen-foto naar alle drie talen |
| P0 | `product-nl-vellen` (+ dolav) | `folies-hero.jpg` = gedeelde blaasfolie-fallback | Upload echte vellen-foto; vervang heroImage — niet folie-fallback hergebruiken |
| P1 | Alle `product-fr-*` / `product-en-*` (8 producten) | heroImage leeg terwijl NL gevuld | Batch-sync NL asset-ref naar FR/EN (zelfde ref, geen her-upload) — **uitgezonderd** vellen/dolav tot echte foto beschikbaar is |
| P2 | `aboutPage-*` | `onze_aanpak_1.png` mogelijk onbedoeld vergaderbeeld | Redactie: vervang in Studio indien verkeerde foto; alle talen tegelijk |

---

## Gaps (actie vereist)

| Document ID | Taal | Veld | Huidige asset | Verwachte asset | Type | Voorgestelde fix |
|-------------|------|------|---------------|-----------------|------|------------------|
| `product-nl-vellen` | nl | heroImage | folies-hero.jpg (gedeeld met blaasfolies) | Productspecifieke vellen-foto | folie-fallback-wrong-product | Upload vellen-foto; vervang folie-fallback — niet `folies-hero.jpg` van blaasfolies |
| `product-nl-dolav-zakken` | nl | heroImage | folies-hero.jpg (gedeeld met blaasfolies) | Productspecifieke DOLAV-zakken foto | folie-fallback-wrong-product | Zelfde issue als vellen — folie-fallback i.p.v. productspecifiek beeld |
| `product-fr-vellen` | fr | heroImage | — leeg — | Vellen-foto (niet leeg laten) | locale-empty | **Niet** blind folies-hero syncen — eerst echte vellen-foto op NL, dan FR/EN dezelfde ref |
| `aboutPage-fr` | fr | heroMedia.image | onze_aanpak_1.png | Redactioneel: gewenste about-hero | content-review | Identiek aan NL/EN; vervang in Studio als vergaderfoto onbedoeld is |
| `homePage-en` | en | aboutImage | — leeg — | migrated-hob58.jpg | locale-empty | Kopieer asset-ref van homePage-nl (migrated-hob58.jpg) naar homePage-en.aboutImage; hergebruik dezelfde Sanity-asset (geen her-upload). |
| `homePage-fr` | fr | aboutImage | — leeg — | migrated-hob58.jpg | locale-empty | Kopieer asset-ref van homePage-nl (migrated-hob58.jpg) naar homePage-fr.aboutImage; hergebruik dezelfde Sanity-asset (geen her-upload). |
| `insight-en-brc-aa-in-de-praktijk` | en | featuredImage | — leeg — | (geen — productspecifieke foto nodig) | empty-all-locales | Upload en koppel asset via Studio of migrate-script. |
| `insight-en-dunner-folie-zelfde-kwaliteit` | en | featuredImage | — leeg — | (geen — productspecifieke foto nodig) | empty-all-locales | Upload en koppel asset via Studio of migrate-script. |
| `insight-en-faalkosten-verkeerde-foliekeuze` | en | featuredImage | — leeg — | (geen — productspecifieke foto nodig) | empty-all-locales | Upload en koppel asset via Studio of migrate-script. |
| `insight-en-recyclaat-of-virgin-de-juiste-keuze` | en | featuredImage | — leeg — | (geen — productspecifieke foto nodig) | empty-all-locales | Upload en koppel asset via Studio of migrate-script. |
| `insight-fr-brc-aa-in-de-praktijk` | fr | featuredImage | — leeg — | (geen — productspecifieke foto nodig) | empty-all-locales | Upload en koppel asset via Studio of migrate-script. |
| `insight-fr-dunner-folie-zelfde-kwaliteit` | fr | featuredImage | — leeg — | (geen — productspecifieke foto nodig) | empty-all-locales | Upload en koppel asset via Studio of migrate-script. |
| `insight-fr-recyclaat-of-virgin-de-juiste-keuze` | fr | featuredImage | — leeg — | (geen — productspecifieke foto nodig) | empty-all-locales | Upload en koppel asset via Studio of migrate-script. |
| `insight-nl-audit-klaar-met-de-juiste-folie` | nl | featuredImage | — leeg — | (geen — productspecifieke foto nodig) | empty-all-locales | Upload en koppel asset via Studio of migrate-script. |
| `insight-nl-brc-aa-in-de-praktijk` | nl | featuredImage | — leeg — | (geen — productspecifieke foto nodig) | empty-all-locales | Upload en koppel asset via Studio of migrate-script. |
| `insight-nl-dunner-folie-zelfde-kwaliteit` | nl | featuredImage | — leeg — | (geen — productspecifieke foto nodig) | empty-all-locales | Upload en koppel asset via Studio of migrate-script. |
| `insight-nl-faalkosten-verkeerde-foliekeuze` | nl | featuredImage | — leeg — | (geen — productspecifieke foto nodig) | empty-all-locales | Upload en koppel asset via Studio of migrate-script. |
| `insight-nl-recyclaat-of-virgin-de-juiste-keuze` | nl | featuredImage | — leeg — | (geen — productspecifieke foto nodig) | empty-all-locales | Upload en koppel asset via Studio of migrate-script. |
| `insight-nl-recyclaat-op-de-lijn` | nl | featuredImage | — leeg — | (geen — productspecifieke foto nodig) | empty-all-locales | Upload en koppel asset via Studio of migrate-script. |
| `product-en-blaasfolies` | en | heroImage | — leeg — | folies-hero.jpg | locale-empty | Kopieer asset-ref van product-nl-blaasfolies (folies-hero.jpg) naar product-en-blaasfolies.heroImage; hergebruik dezelfde Sanity-asset (geen her-upload). |
| `product-en-dolav-zakken` | en | heroImage | — leeg — | folies-hero.jpg | locale-empty | Kopieer asset-ref van product-nl-dolav-zakken (folies-hero.jpg) naar product-en-dolav-zakken.heroImage; hergebruik dezelfde Sanity-asset (geen her-upload). |
| `product-en-kratzakken` | en | heroImage | — leeg — | iStock-2158237125.jpg | locale-empty | Kopieer asset-ref van product-nl-kratzakken (iStock-2158237125.jpg) naar product-en-kratzakken.heroImage; hergebruik dezelfde Sanity-asset (geen her-upload). |
| `product-en-pattyn` | en | heroImage | — leeg — | iStock-1290891988.jpg | locale-empty | Kopieer asset-ref van product-nl-pattyn (iStock-1290891988.jpg) naar product-en-pattyn.heroImage; hergebruik dezelfde Sanity-asset (geen her-upload). |
| `product-en-stretch-hood` | en | heroImage | — leeg — | iStock-1709161061.jpg | locale-empty | Kopieer asset-ref van product-nl-stretch-hood (iStock-1709161061.jpg) naar product-en-stretch-hood.heroImage; hergebruik dezelfde Sanity-asset (geen her-upload). |
| `product-en-vellen` | en | heroImage | — leeg — | Productspecifieke vellen-foto | locale-empty | Eerst echte vellen-foto op NL; daarna dezelfde asset-ref naar EN (niet folies-hero syncen). |
| `product-en-zakken` | en | heroImage | — leeg — | iStock-2158237125.jpg | locale-empty | Kopieer asset-ref van product-nl-zakken (iStock-2158237125.jpg) naar product-en-zakken.heroImage; hergebruik dezelfde Sanity-asset (geen her-upload). |
| `product-fr-blaasfolies` | fr | heroImage | — leeg — | folies-hero.jpg | locale-empty | Kopieer asset-ref van product-nl-blaasfolies (folies-hero.jpg) naar product-fr-blaasfolies.heroImage; hergebruik dezelfde Sanity-asset (geen her-upload). |
| `product-fr-dolav-zakken` | fr | heroImage | — leeg — | folies-hero.jpg | locale-empty | Kopieer asset-ref van product-nl-dolav-zakken (folies-hero.jpg) naar product-fr-dolav-zakken.heroImage; hergebruik dezelfde Sanity-asset (geen her-upload). |
| `product-fr-kratzakken` | fr | heroImage | — leeg — | iStock-2158237125.jpg | locale-empty | Kopieer asset-ref van product-nl-kratzakken (iStock-2158237125.jpg) naar product-fr-kratzakken.heroImage; hergebruik dezelfde Sanity-asset (geen her-upload). |
| `product-fr-pattyn` | fr | heroImage | — leeg — | iStock-1290891988.jpg | locale-empty | Kopieer asset-ref van product-nl-pattyn (iStock-1290891988.jpg) naar product-fr-pattyn.heroImage; hergebruik dezelfde Sanity-asset (geen her-upload). |
| `product-fr-stretch-hood` | fr | heroImage | — leeg — | iStock-1709161061.jpg | locale-empty | Kopieer asset-ref van product-nl-stretch-hood (iStock-1709161061.jpg) naar product-fr-stretch-hood.heroImage; hergebruik dezelfde Sanity-asset (geen her-upload). |
| `product-fr-zakken` | fr | heroImage | — leeg — | iStock-2158237125.jpg | locale-empty | Kopieer asset-ref van product-nl-zakken (iStock-2158237125.jpg) naar product-fr-zakken.heroImage; hergebruik dezelfde Sanity-asset (geen her-upload). |

---

## Inventaris per document (hero / featured)

| Document ID | Taal | Titel | Veld | Asset filename | Asset ref | Alt |
|-------------|------|-------|------|----------------|-----------|-----|
| `2aee894a-edf2-40de-bc82-facb9b6e58bb` | fr | Êtes-vous vous-mêmes producteur ? | featuredImage | chemie_industrie.jpg | image-9d645b4f49… | — |
| `568ba116-f398-4f92-9a2c-4ada05247a87` | nl | Zijn jullie zelf producent? | featuredImage | chemie_industrie.jpg | image-9d645b4f49… | — |
| `94e6427f-6888-459a-8b28-e882230091b0` | en | Do you produce this yourself? | featuredImage | chemie_industrie.jpg | image-9d645b4f49… | — |
| `aboutPage-en` | en | aboutPage-en | heroMedia.image | onze_aanpak_1.png | image-dd8358f0c2… | — |
| `aboutPage-fr` | fr | aboutPage-fr | heroMedia.image | onze_aanpak_1.png | image-dd8358f0c2… | — |
| `aboutPage-nl` | nl | aboutPage-nl | heroMedia.image | onze_aanpak_1.png | image-dd8358f0c2… | — |
| `contactPage-en` | en | contactPage-en | heroMedia.image | contact_1.png | image-f5db112ee1… | — |
| `contactPage-fr` | fr | contactPage-fr | heroMedia.image | contact_1.png | image-f5db112ee1… | — |
| `contactPage-nl` | nl | contactPage-nl | heroMedia.image | contact_1.png | image-f5db112ee1… | — |
| `homePage-en` | en | homePage-en | aboutImage | — | — | — |
| `homePage-fr` | fr | homePage-fr | aboutImage | — | — | — |
| `homePage-nl` | nl | homePage-nl | aboutImage | migrated-hob58.jpg | image-f4a5244e21… | — |
| `insight-en-brc-aa-in-de-praktijk` | en | [AI-translated] BRC Packaging Level AA: what does this mean in concrete terms? | featuredImage | — | — | — |
| `insight-en-dunner-folie-zelfde-kwaliteit` | en | [AI-translated] Thinner film, same quality: why advice saves money | featuredImage | — | — | — |
| `insight-en-faalkosten-verkeerde-foliekeuze` | en | [AI-translated] What does the wrong film choice really cost? | featuredImage | — | — | — |
| `insight-en-recyclaat-of-virgin-de-juiste-keuze` | en | [AI-translated] Recyclate or virgin: when do you choose what? | featuredImage | — | — | — |
| `insight-fr-brc-aa-in-de-praktijk` | fr | [AI-translated] BRC Packaging Level AA : que signifie cela concrètement ? | featuredImage | — | — | — |
| `insight-fr-dunner-folie-zelfde-kwaliteit` | fr | [AI-translated] Film plus fin, même qualité : pourquoi les conseils permettent d'économiser de l'argent | featuredImage | — | — | — |
| `insight-fr-recyclaat-of-virgin-de-juiste-keuze` | fr | Recyclat ou vierge : quand choisir quoi ? | featuredImage | — | — | — |
| `insight-nl-audit-klaar-met-de-juiste-folie` | nl | Audit-klaar met de juiste foliekeuze | featuredImage | — | — | — |
| `insight-nl-brc-aa-in-de-praktijk` | nl | BRC Packaging Level AA: wat betekent dit concreet? | featuredImage | — | — | — |
| `insight-nl-dunner-folie-zelfde-kwaliteit` | nl | Dunner folie, zelfde kwaliteit: waarom advies geld bespaart | featuredImage | — | — | — |
| `insight-nl-faalkosten-verkeerde-foliekeuze` | nl | Wat kost een verkeerde foliekeuze écht? | featuredImage | — | — | — |
| `insight-nl-ffs-lijn-65-meter` | nl | FFS op hoge snelheid: specs die tellen | featuredImage | FFS FOLIE HOBON.png | image-2fc4d6bb28… | — |
| `insight-nl-recyclaat-of-virgin-de-juiste-keuze` | nl | Recyclaat of virgin: wanneer kiest u wat? | featuredImage | — | — | — |
| `insight-nl-recyclaat-op-de-lijn` | nl | Recyclaat op de lijn zonder stilstand | featuredImage | — | — | — |
| `product-en-blaasfolies` | en | Films (HDPE/LDPE) | heroImage | — | — | — |
| `product-en-boterfolie` | en | Butter film | heroImage | Boterfolie.png | image-42a87db7da… | — |
| `product-en-dolav-zakken` | en | DOLAV bags | heroImage | — | — | — |
| `product-en-kratzakken` | en | Scratch Bags | heroImage | — | — | — |
| `product-en-pattyn` | en | PATTYN | heroImage | — | — | — |
| `product-en-stretch-hood` | en | Stretch hood | heroImage | — | — | — |
| `product-en-vellen` | en | Sheets (LDPE/HDPE) | heroImage | — | — | — |
| `product-en-zakken` | en | Bags (LDPE/HDPE) | heroImage | — | — | — |
| `product-fr-blaasfolies` | fr | Films (HDPE/LDPE) | heroImage | — | — | — |
| `product-fr-boterfolie` | fr | Film pour beurre | heroImage | Boterfolie.png | image-42a87db7da… | — |
| `product-fr-dolav-zakken` | fr | Sacs DOLAV | heroImage | — | — | — |
| `product-fr-kratzakken` | fr | Sacs à gratter | heroImage | — | — | — |
| `product-fr-pattyn` | fr | PATTYN | heroImage | — | — | — |
| `product-fr-stretch-hood` | fr | Housses stretch | heroImage | — | — | — |
| `product-fr-vellen` | fr | Feuilles (LDPE/HDPE) | heroImage | — | — | — |
| `product-fr-zakken` | fr | Sacs (LDPE/HDPE) | heroImage | — | — | — |
| `product-nl-blaasfolies` | nl | Folies (HDPE/LDPE) | heroImage | folies-hero.jpg | image-53d95e8ddf… | — |
| `product-nl-boterfolie` | nl | Boterfolie | heroImage | Boterfolie.png | image-42a87db7da… | — |
| `product-nl-dolav-zakken` | nl | DOLAV-zakken | heroImage | folies-hero.jpg | image-53d95e8ddf… | — |
| `product-nl-kratzakken` | nl | Kratzakken | heroImage | iStock-2158237125.jpg | image-2d8990711c… | — |
| `product-nl-pattyn` | nl | PATTYN | heroImage | iStock-1290891988.jpg | image-e69019498d… | — |
| `product-nl-stretch-hood` | nl | Stretch hood | heroImage | iStock-1709161061.jpg | image-db57dad557… | — |
| `product-nl-vellen` | nl | Vellen (LDPE/HDPE) | heroImage | folies-hero.jpg | image-53d95e8ddf… | — |
| `product-nl-zakken` | nl | Zakken (LDPE/HDPE) | heroImage | iStock-2158237125.jpg | image-2d8990711c… | — |
| `sector-en-agro` | en | Agro-industry | heroMainImage | photo-1500651230702-0e2d8a49d4ad-w-1000-q-80-auto-format-fit-crop.jpg | image-a6e0dfd709… | — |
| `sector-en-chemie` | en | Chemical industry | heroMainImage | chemie_industrie.jpg | image-9d645b4f49… | — |
| `sector-en-logistiek` | en | Logistics & pallet packaging | heroMainImage | photo-1553413077-190dd305871c-w-1000-q-80-auto-format-fit-crop.jpg | image-469d6e439a… | — |
| `sector-en-voeding` | en | Food & Beverages | heroMainImage | photo-1504674900247-0877df9cc836-w-1000-q-80-auto-format-fit-crop.jpg | image-e8000a034a… | — |
| `sector-fr-agro` | fr | Agro-industrie | heroMainImage | photo-1500651230702-0e2d8a49d4ad-w-1000-q-80-auto-format-fit-crop.jpg | image-a6e0dfd709… | — |
| `sector-fr-chemie` | fr | Industrie chimique | heroMainImage | chemie_industrie.jpg | image-9d645b4f49… | — |
| `sector-fr-logistiek` | fr | Logistique & emballage palette | heroMainImage | photo-1553413077-190dd305871c-w-1000-q-80-auto-format-fit-crop.jpg | image-469d6e439a… | — |
| `sector-fr-voeding` | fr | Alimentation & denrées alimentaires | heroMainImage | photo-1504674900247-0877df9cc836-w-1000-q-80-auto-format-fit-crop.jpg | image-e8000a034a… | — |
| `sector-nl-agro` | nl | Agro-industrie | heroMainImage | photo-1500651230702-0e2d8a49d4ad-w-1000-q-80-auto-format-fit-crop.jpg | image-a6e0dfd709… | — |
| `sector-nl-chemie` | nl | Chemie-industrie | heroMainImage | chemie_industrie.jpg | image-9d645b4f49… | — |
| `sector-nl-logistiek` | nl | Logistiek & palletverpakking | heroMainImage | photo-1553413077-190dd305871c-w-1000-q-80-auto-format-fit-crop.jpg | image-469d6e439a… | — |
| `sector-nl-voeding` | nl | Voeding & levensmiddelen | heroMainImage | photo-1504674900247-0877df9cc836-w-1000-q-80-auto-format-fit-crop.jpg | image-e8000a034a… | — |

---

## NL / FR / EN asset-ref vergelijking (hero-velden)

- **2aee894a-edf2-40de-bc82-facb9b6e58bb::40de-bc82-facb9b6e58bb::featuredImage** — 🟢 zelfde ref of leeg consistent: fr:chemie_industrie.jpg (1024-jpg)
- **568ba116-f398-4f92-9a2c-4ada05247a87::4f92-9a2c-4ada05247a87::featuredImage** — 🟢 zelfde ref of leeg consistent: nl:chemie_industrie.jpg (1024-jpg)
- **94e6427f-6888-459a-8b28-e882230091b0::459a-8b28-e882230091b0::featuredImage** — 🟢 zelfde ref of leeg consistent: en:chemie_industrie.jpg (1024-jpg)
- **aboutPage::::heroMedia.image** — 🟢 zelfde ref of leeg consistent: en:onze_aanpak_1.png (x264-png) · fr:onze_aanpak_1.png (x264-png) · nl:onze_aanpak_1.png (x264-png)
- **contactPage::::heroMedia.image** — 🟢 zelfde ref of leeg consistent: en:contact_1.png (x316-png) · fr:contact_1.png (x316-png) · nl:contact_1.png (x316-png)
- **homePage::::aboutImage** — 🟢 zelfde ref of leeg consistent: en:leeg (—) · fr:leeg (—) · nl:migrated-hob58.jpg (x534-jpg)
- **insight-en-brc-aa-in-de-praktijk::brc-aa-in-de-praktijk::featuredImage** — 🟢 zelfde ref of leeg consistent: en:leeg (—)
- **insight-en-dunner-folie-zelfde-kwaliteit::dunner-folie-zelfde-kwaliteit::featuredImage** — 🟢 zelfde ref of leeg consistent: en:leeg (—)
- **insight-en-faalkosten-verkeerde-foliekeuze::faalkosten-verkeerde-foliekeuze::featuredImage** — 🟢 zelfde ref of leeg consistent: en:leeg (—)
- **insight-en-recyclaat-of-virgin-de-juiste-keuze::recyclaat-of-virgin-de-juiste-keuze::featuredImage** — 🟢 zelfde ref of leeg consistent: en:leeg (—)
- **insight-fr-brc-aa-in-de-praktijk::brc-aa-in-de-praktijk::featuredImage** — 🟢 zelfde ref of leeg consistent: fr:leeg (—)
- **insight-fr-dunner-folie-zelfde-kwaliteit::dunner-folie-zelfde-kwaliteit::featuredImage** — 🟢 zelfde ref of leeg consistent: fr:leeg (—)
- **insight-fr-recyclaat-of-virgin-de-juiste-keuze::recyclaat-of-virgin-de-juiste-keuze::featuredImage** — 🟢 zelfde ref of leeg consistent: fr:leeg (—)
- **insight-nl-audit-klaar-met-de-juiste-folie::audit-klaar-met-de-juiste-folie::featuredImage** — 🟢 zelfde ref of leeg consistent: nl:leeg (—)
- **insight-nl-brc-aa-in-de-praktijk::brc-aa-in-de-praktijk::featuredImage** — 🟢 zelfde ref of leeg consistent: nl:leeg (—)
- **insight-nl-dunner-folie-zelfde-kwaliteit::dunner-folie-zelfde-kwaliteit::featuredImage** — 🟢 zelfde ref of leeg consistent: nl:leeg (—)
- **insight-nl-faalkosten-verkeerde-foliekeuze::faalkosten-verkeerde-foliekeuze::featuredImage** — 🟢 zelfde ref of leeg consistent: nl:leeg (—)
- **insight-nl-ffs-lijn-65-meter::ffs-lijn-65-meter::featuredImage** — 🟢 zelfde ref of leeg consistent: nl:FFS FOLIE HOBON.png (1254-png)
- **insight-nl-recyclaat-of-virgin-de-juiste-keuze::recyclaat-of-virgin-de-juiste-keuze::featuredImage** — 🟢 zelfde ref of leeg consistent: nl:leeg (—)
- **insight-nl-recyclaat-op-de-lijn::recyclaat-op-de-lijn::featuredImage** — 🟢 zelfde ref of leeg consistent: nl:leeg (—)
- **product::blaasfolies::heroImage** — 🟢 zelfde ref of leeg consistent: en:leeg (—) · fr:leeg (—) · nl:folies-hero.jpg (x713-jpg)
- **product::boterfolie::heroImage** — 🟢 zelfde ref of leeg consistent: en:Boterfolie.png (1122-png) · fr:Boterfolie.png (1122-png) · nl:Boterfolie.png (1122-png)
- **product::dolav-zakken::heroImage** — 🟢 zelfde ref of leeg consistent: en:leeg (—) · fr:leeg (—) · nl:folies-hero.jpg (x713-jpg)
- **product::kratzakken::heroImage** — 🟢 zelfde ref of leeg consistent: en:leeg (—) · fr:leeg (—) · nl:iStock-2158237125.jpg (2160-jpg)
- **product::pattyn::heroImage** — 🟢 zelfde ref of leeg consistent: en:leeg (—) · fr:leeg (—) · nl:iStock-1290891988.jpg (1610-jpg)
- **product::stretch-hood::heroImage** — 🟢 zelfde ref of leeg consistent: en:leeg (—) · fr:leeg (—) · nl:iStock-1709161061.jpg (1414-jpg)
- **product::vellen::heroImage** — 🟢 zelfde ref of leeg consistent: en:leeg (—) · fr:leeg (—) · nl:folies-hero.jpg (x713-jpg)
- **product::zakken::heroImage** — 🟢 zelfde ref of leeg consistent: en:leeg (—) · fr:leeg (—) · nl:iStock-2158237125.jpg (2160-jpg)
- **sector::agro::heroMainImage** — 🟢 zelfde ref of leeg consistent: en:photo-1500651230702-0e2d8a49d4ad-w-1000-q-80-auto-format-fit-crop.jpg (x667-jpg) · fr:photo-1500651230702-0e2d8a49d4ad-w-1000-q-80-auto-format-fit-crop.jpg (x667-jpg) · nl:photo-1500651230702-0e2d8a49d4ad-w-1000-q-80-auto-format-fit-crop.jpg (x667-jpg)
- **sector::chemie::heroMainImage** — 🟢 zelfde ref of leeg consistent: en:chemie_industrie.jpg (1024-jpg) · fr:chemie_industrie.jpg (1024-jpg) · nl:chemie_industrie.jpg (1024-jpg)
- **sector::logistiek::heroMainImage** — 🟢 zelfde ref of leeg consistent: en:photo-1553413077-190dd305871c-w-1000-q-80-auto-format-fit-crop.jpg (1333-jpg) · fr:photo-1553413077-190dd305871c-w-1000-q-80-auto-format-fit-crop.jpg (1333-jpg) · nl:photo-1553413077-190dd305871c-w-1000-q-80-auto-format-fit-crop.jpg (1333-jpg)
- **sector::voeding::heroMainImage** — 🟢 zelfde ref of leeg consistent: en:photo-1504674900247-0877df9cc836-w-1000-q-80-auto-format-fit-crop.jpg (x667-jpg) · fr:photo-1504674900247-0877df9cc836-w-1000-q-80-auto-format-fit-crop.jpg (x667-jpg) · nl:photo-1504674900247-0877df9cc836-w-1000-q-80-auto-format-fit-crop.jpg (x667-jpg)

---

## Opmerkingen

- **Geen patches uitgevoerd** — dit is een read-only audit.
- Filename-mismatch gebruikt heuristiek (stretch-hood IDs, folies-hero fallback, contact/vergader keywords); twijfelgevallen staan expliciet gemarkeerd.
- `onze_aanpak_2–5` en `contact_2` zijn niet gekoppeld (geen gallery-veld) — zie HOB-59 skips.
- Producten met folie-fallback (`folies-hero.jpg`) op **vellen** en **dolav-zakken** delen dezelfde asset-ref als `product-nl-blaasfolies` — dit verklaart “verkeerde” hero zonder stretch-hood asset.
- **FR/EN producten:** 14 van 16 product-docs (excl. boterfolie) hebben lege `heroImage` terwijl NL wel gevuld is — waarschijnlijk translate-placeholders zonder image-sync.
