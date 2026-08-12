# HOB-62b — Audit (read-only)

Geen writes. Audit uitgevoerd op Sanity production + exports/Hobon-website-teksten-NL-FR-EN.xlsx.

---

## DEEL A — Corrigeren (doorgestreepte FR-termen → juiste term)

Doel-FR uit brief vs. huidige Sanity (62a import sloeg strike over).

### 1. sector-*-agro·solutionCards[3].title

Doel FR: Sacs prédécoupés, faciles à détacher
_key (gedeeld NL/FR/EN): 1sko6l5tfq

| Taal | Huidige waarde |
|------|----------------|
| NL | Bandverblokking en spaarverblokking |
| FR | Soudure en bande et soudure économique |
| EN | Band sealing and spot sealing |

Excel FR (nieuw) stond doorgestreept op: Sacs prédécoupés et sacs faciles à détacher

### 2. sector-*-agro·solutionCards[0].tags[1]

Doel FR: hoeklas/bloklas → coins soudés (i.p.v. "À fond bloc")
Parent _key: ney4xs30ez
tags zijn strings (geen _key per tag) → patchen via solutionCards[_key=ney4xs30ez].tags[1] of index

| Taal | tags[0] | tags[1] | tags[2] |
|------|---------|---------|---------|
| NL | Hoeklas | Bloklas | Paperlike |
| FR | À coins soudés | Fond plat | Aspect papier |
| EN | Pinch-bottom | Block-bottom | Paperlike |

Excel FR doorgestreept: À fond bloc

### 3. sector-*-agro·tapeItems[0]

Doel FR: coins soudés (i.p.v. "Coins soudés et fond bloc")
Geen _key — string-array → patchen op index [0]

| Taal | Huidige waarde |
|------|----------------|
| NL | Hoeklas & bloklas |
| FR | Sacs à coins soudés & sacs à fond plat |
| EN | Pinch-bottom & block-bottom |

Excel FR doorgestreept: Coins soudés et fond bloc

---

## DEEL B — Stuifbestendigheid → conception anti-poudroiement

2 Sanity-voorkomens (geen andere documenten gevonden).

### homePage-nl·productCards[0].description

_key per taal (NIET gedeeld):
- NL: g3e0qtdukw
- FR: 9c4189d0e022
- EN: 77d79f6e596c

| Taal | Huidige waarde |
|------|----------------|
| NL | Één van de weinige Belgische producenten met diepgaande expertise in DOLAV-zakken. Stuifbestendigheid, lassterkte en weerstand tegen mechanische belasting bepalen de materiaalkeuze. Een verkeerde samenstelling leidt tot breuk of productverlies op de lijn. |
| FR | Nous sommes l'un des rares producteurs belges à disposer d'une expertise approfondie en matière de sacs DOLAV. L'étanchéité à la poussière, la résistance des soudures et la bonne tenue aux contraintes mécaniques déterminent le choix du matériau. Une composition inadaptée entraînerait des ruptures ou des pertes de produit sur la ligne. |
| EN | One of the few Belgian producers with in-depth expertise in DOLAV bags. Dust resistance, weld strength and resistance to mechanical stress determine the material choice. A wrong composition leads to breakage or product loss on the line. |

### product-nl-dolav-zakken·listingDescription

| Taal | Huidige waarde |
|------|----------------|
| NL | DOLAV-zakken in LDPE/HDPE met hoge lassterkte en stuifbestendigheid, op maat van uw afvulinstallatie en mechanische belasting. |
| FR | Sacs DOLAV en PEBD/PEHD offrant étanchéité à la poussière et grande résistance au niveau des soudures, conçus sur mesure pour votre installation de conditionnement et adaptés à ses contraintes mécaniques. |
| EN | DOLAV bags in LDPE/HDPE with high weld strength and dust resistance, tailored to your filling line and mechanical load. |

Doel FR: conception anti-poudroiement — nog nergens aanwezig; huidige FR gebruikt étanchéité à la poussière; EN gebruikt dust resistance.

---

## DEEL C — ATEX-content verwijderen

### sector-*-chemie·problemBand[0] (heel item weg)

| Taal | _key | title | description |
|------|------|-------|-------------|
| NL | 3y6xr1u2ubNaGUAb3Z59ly | Statische ontlading risico | Bij gevoelige chemische producten of in ATEX-zones is anti-statische folie geen luxe. Het is veiligheid. |
| FR | p3bjx2F4QcENfZgwcGnCLH | Risque de décharge statique | Pour les produits chimiques sensibles ou en zones ATEX, le film antistatique n'est pas un luxe. C'est une question de sécurité. |
| EN | AfHw7cNo6fvLW2zKrp2zcS | Static discharge risk | For sensitive chemical products or in ATEX zones, anti-static film is not a luxury. It is safety. |

_key verschilt per taal — niet 1 gedeelde key; verwijderen per locale via eigen _key of index [0].

Alle problemBand _keys:
- NL: [0] 3y6xr1u2ubNaGUAb3Z59ly, [1] 3y6xr1u2ubNaGUAb3Z59oN, [2] 3y6xr1u2ubNaGUAb3Z59qm
- FR: [0] p3bjx2F4QcENfZgwcGnCLH, [1] p3bjx2F4QcENfZgwcGnCPg, [2] p3bjx2F4QcENfZgwcGnCU5
- EN: [0] AfHw7cNo6fvLW2zKrp2zcS, [1] AfHw7cNo6fvLW2zKrp2zhd, [2] AfHw7cNo6fvLW2zKrp2zmo

Na verwijderen problemBand (3 → 2 items):

| Index | NL | FR | EN |
|-------|----|----|-----|
| [0] (was [1]) | UV-degradatie tijdens opslag | Dégradation UV pendant le stockage | UV degradation during storage |
| [1] (was [2]) | Geen traceerbaarheid | Pas de traçabilité | No traceability |

### sector-*-chemie·deepFaqs[1] (heel item weg)

| Taal | _key | title | body (ingekort) |
|------|------|-------|-----------------|
| NL | gnzfk6fxel | Kunnen jullie folie maken voor ATEX-zones? | Ja, anti-statische PE-folie met de juiste oppervlakteweerstand. Specs op aanvraag. |
| FR | gnzfk6fxel | Pouvez-vous fabriquer du film pour zones ATEX ? | Oui, nous produisons du film PE antistatique affichant la résistance de surface appropriée… |
| EN | gnzfk6fxel | Can you make film for ATEX zones? | Yes, anti-static PE film with the correct surface resistance. Specs on request. |

Uniek identificeerbaar via _key=gnzfk6fxel over alle talen.

Alle deepFaqs _keys (gedeeld over talen):
[0] 6n16mthmun, [1] gnzfk6fxel, [2] k3xhk2kyje, [3] ga134jhdl1

Na verwijderen deepFaqs (4 → 3 items):

| Index | NL title |
|-------|----------|
| [0] | Hoe kies ik de juiste folie voor mijn toepassing? |
| [1] (was [2]) | Wat is het verschil tussen mono- en multilayer? |
| [2] (was [3]) | Leveren jullie ook kleine volumes? |

### sector-*-chemie·tapeItems[6] (item weg)

| Taal | Huidige waarde [6] |
|------|---------------------|
| NL | ATEX-advies |
| FR | Conseil ATEX |
| EN | ATEX advice |

Geen _key — string-array; filteren op index [6] of string-match.

Alle tapeItems (NL):
[0] Anti-statisch PE | [1] UV-bestendig | [2] Flexodruk 6 kleuren | [3] REACH-conform | [4] Maatwerk PE | [5] Mono / multi-layer | [6] ATEX-advies | [7] Industriële specs

Na verwijderen tapeItems[6] (8 → 7 items):

| Index | NL | FR |
|-------|----|----|
| [6] (was [7]) | Industriële specs | Spécifications industrielles |

---

## DEEL D — Frankrijk-uitbreiding

### Excel (exports/Hobon-website-teksten-NL-FR-EN.xlsx)

| Rij | Referentie | NL | FR (nieuw) | EN |
|-----|------------|-----|------------|-----|
| 691 | homePage-nl·heroEyebrow | Belgische producent · BE & NL &FR (typo) | Fabricant belge · BE, NL et FR | Belgian manufacturer · BE & NL |
| 753 | homePage-nl·stats[3].label | Actief in België en Nederland | Nous sommes actifs en Belgique, aux Pays-Bas et en France | Active in Belgium and the Netherlands |
| 754 | homePage-nl·stats[3].value | BE+NL | BE+NL+FR | BE+NL |

### Sanity live (na HOB-62a)

| Veld | NL | FR | EN |
|------|----|----|-----|
| heroEyebrow | Belgische producent · BE & NL | Fabricant belge · BE, NL et FR | Belgian manufacturer · BE & NL |
| stats[3].label (_key) | Actief in België en Nederland (tSPisjy2yHY5QX8S75B5lS) | Nous sommes actifs en Belgique, aux Pays-Bas et en France (afc60f67e33b) | Active in Belgium and the Netherlands (c2a08e93b14a) |
| stats[3].value | BE+NL | BE+NL+FR | BE+NL |

### Doel FR (uit brief)

- stats[3].label: Actif en Belgique, aux Pays-Bas et en France
- stats[3].value: BE+NL+FR

Sanity FR stats[3].label gebruikt nu "Nous sommes actifs en…" (inhoudelijk gelijk, andere formulering).

### Beslissingsvraag

FR lijkt grotendeels klaar na 62a; NL + EN nog niet uitgebreid met Frankrijk.

| Veld | FR status | NL/EN nog aan te passen? |
|------|-----------|--------------------------|
| heroEyebrow | BE, NL et FR | NL typo "&FR"; EN mist FR |
| stats[3].label | Frankrijk opgenomen | NL/EN nog alleen BE+NL |
| stats[3].value | BE+NL+FR | NL/EN nog BE+NL |

Moet dit ALLEEN FR, of ook NL/EN (bijv. "Actief in België, Nederland en Frankrijk" / "Active in Belgium, the Netherlands and France")?

---

Geen writes uitgevoerd tijdens deze audit.
