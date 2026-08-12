# HOB-62e — Diagnose: kapotte heading-structuur FR insight bodies

Read-only diagnose (2026-08-12). Geen writes uitgevoerd.

---

## Symptoom

Op FR-insight-detailpagina's is de body-heading-structuur kapot: sommige gewone alinea's renderen als H3 (###) en sommige echte tussenkoppen als gewone tekst.

Voorbeeld: /fr/insights/film-plus-fin-economisez-sans-compromis-sur-la-qualite

Renderer: ArticlePortableText.tsx — h2/h3/normal op block.style.

---

## Oorzaak (root cause)

replacePortableTextBody in scripts/lib/import-fr-translations-62a.ts is de directe oorzaak.

De functie:

1. Splitst FR-tekst uit de xlsx op \n\n (platte paragrafen)
2. Neemt per paragraaf-index i het bestaande FR-block als template: blockTemplates[Math.min(i, blockTemplates.length - 1)]
3. Kopieert style (h2/h3/normal) van dat FR-template — niet van het NL-origineel
4. Vervangt alleen de span-tekst

Relevante code (scripts/lib/import-fr-translations-62a.ts, regels 419–431):

  return paragraphs.map((para, index) => {
    const template = blockTemplates[Math.min(index, blockTemplates.length - 1)]!;
    return {
      ...template,  // style komt uit oud FR-block op index i
      children: [{ ...firstChild, text: para }],
    };
  });

Waarom styles "door elkaar" raken:

| Factor | Effect |
|--------|--------|
| NL body heeft meer blocks (lege spacer-blocks, headings apart van body) | FR krijgt minder paragrafen na \n\n-split |
| Xlsx FR-tekst heeft minder \n\n-breaks dan NL block-count | Block-delta NL−FR: 9–15 per artikel |
| Styles worden per index van het pre-patch FR-body (AI/Studio) overgenomen | Inhoud op index 8 ≠ dezelfde semantiek als NL index 8 → normal↔h3 swap |
| Geen heading-detectie in platte tekst | Echte FR-koppen in lopende tekst blijven normal als template normal was |

Simulatie bevestigt dit: huidige FR-styles matchen 100% met replacePortableTextBody(xlsxTekst, bestaandeFrBody) — de patch verklaart de huidige staat exact.

62c vs 62a: zelfde mechanisme; 62c gebruikt dezelfde buildFrPatchValue → replacePortableTextBody.

---

## 1. film-plus-fin (insight-fr-dunner-folie-zelfde-kwaliteit) — 62a, niet 62c

Slug FR: film-plus-fin-economisez-sans-compromis-sur-la-qualite
NL _id: insight-nl-dunner-folie-zelfde-kwaliteit
FR _id: insight-fr-dunner-folie-zelfde-kwaliteit

| | NL | FR |
|---|----|----|
| Blocks | 23 | 14 |
| h2/h3 | 5 | 4 |
| Xlsx \n\n-paragrafen | — | 14 (= FR blocks) |

Style-mismatches t.o.v. NL (zelfde index):

| Index | NL style | FR style | Probleem |
|-------|----------|----------|----------|
| 7 | normal (leeg) | h3 | Lopende FR-zin als H3 |
| 8 | h3 "De drie technische hefbomen voor downgauging" | normal | Echte kop als bodytekst |
| 12 | normal (leeg) | h3 | Lopende FR-zin als H3 |

Ontbrekend t.o.v. NL (index 14–22): o.a. "Hoeveel kan dit u opleveren?", "Waar past u op?", slotparagraaf — 9 NL-blocks vallen weg.

Block-by-block (film-plus-fin, selectie):

  0: NL h2  Dunner folie, zelfde kwaliteit… | FR h2  Un film plus fin pour une même qualité…
  7: ⚠️ STYLE — NL normal (leeg) | FR h3  L'utilisation d'un film multicouche…
  8: ⚠️ STYLE — NL h3  De drie technische hefbomen… | FR normal  L'optimisation de l'extrusion…
  12: ⚠️ STYLE — NL normal (leeg) | FR h3  Du point de vue de la sécurité…
  14–22: ⚠️ COUNT — alleen NL (secties ontbreken in FR)

---

## 2. 62c-artikelen

### audit-klaar (9d83f7de-2109-4a0c-b12f-0cc6fa3edb07)

NL _id: insight-nl-audit-klaar-met-de-juiste-folie
Slug FR: audit-brc-and-ifs-le-role-du-film

- NL 40 blocks → FR 25 blocks (delta 15)
- Xlsx \n\n-paragrafen: 25
- 4 style-mismatches (same index)
- Simulated styles match actual FR: 25/25

Style-mismatches:

| Index | NL style | FR style | NL tekst (ingekort) | FR tekst (ingekort) |
|-------|----------|----------|---------------------|---------------------|
| 10 | normal | h3 | Traceerbaarheid. Kunt u van een specifieke verpakking… | Déclaration de conformité (DoC) par lot |
| 14 | h3 | normal | Wat uw folieproducent moet kunnen leveren | Dossier sur la matière recyclée (le cas échéant) |
| 15 | normal | h3 | Voor een vlotte audit verwacht u… | Chaîne de traçabilité jusqu'à la matière première |
| 18 | normal | h3 | Migratietestrapporten voor de relevante voedingstypes | Hobon est certifié BRC Packaging Level AA… |

Trailing NL-secties ontbreken in FR (index 25–39): o.a. "BRC Packaging Level AA: waarom dit telt", "De drie meest voorkomende non-conformities op folie".

### ffs-lijn (8c316fb7-3998-4034-a98f-508fc4e9b017)

NL _id: insight-nl-ffs-lijn-65-meter
Slug FR: film-ffs-les-caracteristiques-qui-font-la-difference

- NL 29 → FR 21 (delta 8)
- Xlsx \n\n-paragrafen: 21
- 0 same-index style-mismatches — indices 0–20 alignen qua style
- Simulated styles match actual FR: 21/21
- 8 trailing NL-blocks ontbreken (index 21–28): checklist-items (Hot-tack curve, COF, etc.) + slot-CTA

Geen h3↔normal swap op bestaande indices; wel inhoud weg aan het einde.

### recyclaat (2cdeb230-166a-498d-970d-2da5e4a8752f)

NL _id: insight-nl-recyclaat-op-de-lijn
Slug FR: integrer-du-recycle-dans-le-film-pe-sans-arret-de-production

- NL 28 → FR 17 (delta 11)
- Xlsx \n\n-paragrafen: 17
- 2 style-mismatches
- Simulated styles match actual FR: 17/17

Style-mismatches:

| Index | NL style | FR style | NL tekst (ingekort) | FR tekst (ingekort) |
|-------|----------|----------|---------------------|---------------------|
| 12 | normal (leeg) | h3 | — | Deuxièmement, comparez l'IFC et la résistance… |
| 15 | h3 | normal | Wat te testen vóór u uw productielijn aanpast | Une transition réussie vers une composition… |

Trailing secties ontbreken (index 17–27): "De winst voor uw bedrijf", slotparagraaf.

---

## 3. Alle FR-insights met structuurprobleem

Scan van alle 8 FR-artikelen vs NL-pendant (production, 2026-08-12):

| FR slug | Bron | NL blocks | FR blocks | Delta | Style diffs (same index) |
|---------|------|-----------|-----------|-------|--------------------------|
| film-plus-fin-economisez-sans-compromis-sur-la-qualite | 62a | 23 | 14 | 9 | 3 |
| audit-brc-and-ifs-le-role-du-film | 62c | 40 | 25 | 15 | 4 |
| integrer-du-recycle-dans-le-film-pe-sans-arret-de-production | 62c | 28 | 17 | 11 | 2 |
| film-ffs-les-caracteristiques-qui-font-la-difference | 62c | 29 | 21 | 8 | 0 |
| brc-packaging-aa-qu-est-ce-que-cela-signifie | 62a | 33 | 19 | 14 | 3 |
| film-pe-recycle-ou-vierge-quand-utiliser-l-un-ou-l-autre | 62a | 31 | 18 | 13 | 5 |
| mauvais-choix-de-film-quel-cout-reel | 62a | 38 | 25 | 13 | 1 |
| hobon-est-il-lui-meme-fabricant-de-film-pe | Studio/AI | 19 | 12 | 7 | 4 |

Conclusie: het probleem is systeem-breed bij elke FR body-patch via 62a/62c, niet alleen 62c.

Style signature match (NL vs FR): false voor alle 8 artikelen.

---

## 4. Antwoord op onderzoeksvragen

### 1. Zijn block-styles gelijk gebleven of door elkaar geraakt bij FR-patch?

Door elkaar geraakt. Styles zijn niet van NL overgenomen; ze hangen aan de index van het pre-patch FR-body (Studio AI-vertaling). Waar FR minder paragrafen heeft dan NL, verschuift de index-alignment en ontstaan normal↔h3 swaps.

### 2. 62c-artikelen + film-plus-fin

Zie secties 1 en 2 hierboven. Alle vier geraakt; ffs-lijn alleen trailing content loss (geen same-index style swap).

### 3. Per artikel: verkeerde styles

Samenvatting style-mismatches (same index, NL vs FR):

- film-plus-fin: 3 (normal→h3 ×2, h3→normal ×1)
- audit-klaar (62c): 4
- ffs-lijn (62c): 0 (wel 8 blocks content missing)
- recyclaat (62c): 2

Overige FR-insights (62a): brc-aa 3, recyclaat-of-virgin 5, faalkosten 1, hobon-producent 4.

### 4. Oorzaak: replacePortableTextBody of platte tekst?

Beide, in combinatie:

| Hypothese | Verdict |
|-----------|---------|
| replacePortableTextBody overschrijft styles | Ja — per index van bestaand FR-body, niet NL |
| FR-tekst kwam als platte tekst binnen | Ja — xlsx kolom FR (nieuw), split op \n\n |
| Styles "verloren" | Styles blijven hangen aan verkeerde index; fewer paragraphs + geen NL-alignment → normal↔h3 swaps + ontbrekende secties |

Geen heading-detectie in de import-pipeline. NL lege blocks en fijnere paragraaf-splitsing worden niet gerepliceerd in FR.

---

## Aanbevolen fix-richting (voor vervolgticket, niet uitgevoerd)

1. Body-patch: NL block-styles kopiëren (index-aligned) i.p.v. FR-templates
2. Of: \n\n-split alignen op NL block-count (padding/truncation expliciet)
3. Of: heading-detectie in FR plain text (riskant)
4. Re-import met gecorrigeerde pipeline voor alle 8 FR-artikelen

---

## Technische referenties

- replacePortableTextBody: scripts/lib/import-fr-translations-62a.ts (regels 398–433)
- buildFrPatchValue (body): zelfde file, regels 435–446
- 62c patch: scripts/migrate-62c.ts → buildFrPatchValue
- 62a patch: scripts/import-fr-translations-62a.ts
- Renderer: components/portable/ArticlePortableText.tsx
- Xlsx bron: exports/Hobon-website-teksten-NL-FR-EN.xlsx, kolom FR (nieuw)
