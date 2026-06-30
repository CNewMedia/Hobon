# Dash migration dry-run (HOB-47-A)

Dataset: `production`
Mode: DRY-RUN

**Regels:**
- Alleen losse em-dash met spaties (` — `); koppeltekens in woorden (Pinch-bottom) blijven intact.
- **meta**-velden + **quoteAttr**: `—` → `-`
- **text**-velden: `—` → `,` of `.` (nieuwe hoofdzin: onderwerp + persoonsvorm → punt + hoofdletter)
- `[AI-translated]`-marker blijft staan; alleen de dash erin wordt vervangen.
- Bereiken `200–3600` → `200-3600`

## META-VELDEN (20) — em-dash → streepje (-)

### [meta] `seo.metaDescription` — aboutPage-en (aboutPage [en])

**Was:**
```
Hobon — your technical partner for custom packaging film.
```

**Wordt:**
```
Hobon - your technical partner for custom packaging film.
```

### [meta] `seo.metaDescription` — aboutPage-fr (aboutPage [fr])

**Was:**
```
Hobon — votre partenaire technique pour les films d'emballage sur mesure.
```

**Wordt:**
```
Hobon - votre partenaire technique pour les films d'emballage sur mesure.
```

### [meta] `seo.metaDescription` — aboutPage-nl (aboutPage [nl])

**Was:**
```
Hobon — uw technische partner voor verpakkingsfolie op maat.
```

**Wordt:**
```
Hobon - uw technische partner voor verpakkingsfolie op maat.
```

### [meta] `seo.metaTitle` — homePage-en (homePage [en])

**Was:**
```
Custom packaging film — The right film prevents problems
```

**Wordt:**
```
Custom packaging film - The right film prevents problems
```

### [meta] `seo.metaTitle` — homePage-fr (homePage [fr])

**Was:**
```
Hobon — Le bon film d’emballage | BE & NL
```

**Wordt:**
```
Hobon - Le bon film d’emballage | BE & NL
```

### [meta] `seo.metaTitle` — homePage-nl (homePage [nl])

**Was:**
```
Hobon — Verpakkingsfolie op maat | BE & NL
```

**Wordt:**
```
Hobon - Verpakkingsfolie op maat | BE & NL
```

### [meta] `caseStudies[0].quoteAttr` — sector-en-voeding (sector [en])

**Was:**
```
— Production Manager, meat processing company, Ghent
```

**Wordt:**
```
- Production Manager, meat processing company, Ghent
```

### [meta] `caseStudies[0].quoteAttr` — sector-fr-voeding (sector [fr])

**Was:**
```
[AI-translated] — Responsable production, entreprise de transformation de viande, Gand
```

**Wordt:**
```
[AI-translated] - Responsable production, entreprise de transformation de viande, Gand
```

### [meta] `caseStudies[0].quoteAttr` — sector-nl-voeding (sector [nl])

**Was:**
```
— Productiemanager, vleesverwerkend bedrijf, Gent
```

**Wordt:**
```
- Productiemanager, vleesverwerkend bedrijf, Gent
```

### [meta] `defaultMetaTitle` — seoDefaults-en (seoDefaults [en])

**Was:**
```
[AI-translated] Hobon — Custom packaging film
```

**Wordt:**
```
[AI-translated] Hobon - Custom packaging film
```

### [meta] `defaultMetaTitle` — seoDefaults-fr (seoDefaults [fr])

**Was:**
```
[AI-translated] Hobon — Film d’emballage sur mesure
```

**Wordt:**
```
[AI-translated] Hobon - Film d’emballage sur mesure
```

### [meta] `defaultMetaTitle` — seoDefaults-nl (seoDefaults [nl])

**Was:**
```
Hobon — Verpakkingsfolie op maat
```

**Wordt:**
```
Hobon - Verpakkingsfolie op maat
```

### [meta] `seo.metaDescription` — sustainabilityPage-en (sustainabilityPage [en])

**Was:**
```
[AI-translated] Sustainability without compromises to your production line — recyclate, virgin and material reduction.
```

**Wordt:**
```
[AI-translated] Sustainability without compromises to your production line - recyclate, virgin and material reduction.
```

### [meta] `seo.metaDescription` — sustainabilityPage-fr (sustainabilityPage [fr])

**Was:**
```
[AI-translated] Durabilité sans compromis sur votre ligne de production — recyclat, vierge et réduction de matière.
```

**Wordt:**
```
[AI-translated] Durabilité sans compromis sur votre ligne de production - recyclat, vierge et réduction de matière.
```

### [meta] `seo.metaDescription` — sustainabilityPage-nl (sustainabilityPage [nl])

**Was:**
```
Duurzaamheid zonder concessies aan uw productielijn — recyclaat, virgin en materiaalreductie.
```

**Wordt:**
```
Duurzaamheid zonder concessies aan uw productielijn - recyclaat, virgin en materiaalreductie.
```

### [meta] `seed.ts ~L359` — seed.ts (seed)

**Was:**
```
Hobon — Verpakkingsfolie op maat
```

**Wordt:**
```
Hobon - Verpakkingsfolie op maat
```

### [meta] `seed.ts ~L407` — seed.ts (seed)

**Was:**
```
Hobon — Verpakkingsfolie op maat — De juiste folie voorkomt problemen | BE & NL
```

**Wordt:**
```
Hobon - Verpakkingsfolie op maat - De juiste folie voorkomt problemen | BE & NL
```

### [meta] `seed.ts ~L632` — seed.ts (seed)

**Was:**
```
Hobon — uw technische partner voor verpakkingsfolie op maat.
```

**Wordt:**
```
Hobon - uw technische partner voor verpakkingsfolie op maat.
```

### [meta] `seed.ts ~L759` — seed.ts (seed)

**Was:**
```
Duurzaamheid zonder concessies aan uw productielijn — recyclaat, virgin en materiaalreductie.
```

**Wordt:**
```
Duurzaamheid zonder concessies aan uw productielijn - recyclaat, virgin en materiaalreductie.
```

### [meta] `seed.ts ~L1270` — seed.ts (seed)

**Was:**
```
— Productiemanager, vleesverwerkend bedrijf, Gent
```

**Wordt:**
```
- Productiemanager, vleesverwerkend bedrijf, Gent
```

## LOPENDE TEKST (259) — em-dash → komma/punt

### [text] `body[16].children[0].text` — 822ba01f-be4e-466b-90e0-40534aad627b (insightArticle [en])

**Was:**
```
Hobon is BRC Packaging Level AA certified. This means: the highest level of audit result – not just ‘complies with’ but ‘exceeds expectations’ across a large number of criteria. For you as a customer, this directly reduces your risk. You do not need to carry out your own annual on-site audit of a manufacturer with AA status as part of your own supplier management.
```

**Wordt:**
```
Hobon is BRC Packaging Level AA certified. This means: the highest level of audit result, not just ‘complies with’ but ‘exceeds expectations’ across a large number of criteria. For you as a customer, this directly reduces your risk. You do not need to carry out your own annual on-site audit of a manufacturer with AA status as part of your own supplier management.
```

### [text] `approach.body[0].children[0].text` — aboutPage-en (aboutPage [en])

**Was:**
```
We start with your application: line speed, seal zone, retail requirements and audits. Only then do we translate that into a concrete material proposal. Our team combines sales engineers with production expertise — you speak with people who actually produce your film.
```

**Wordt:**
```
We start with your application: line speed, seal zone, retail requirements and audits. Only then do we translate that into a concrete material proposal. Our team combines sales engineers with production expertise. You speak with people who actually produce your film.
```

### [text] `storyBlocks[0].body[1].children[0].text` — aboutPage-en (aboutPage [en])

**Was:**
```
Today, we help customers in food, logistics, industry and agro-industry to make the right choices before they order. Not from a catalogue, but based on their line, their product and the risks involved. Because the wrong film costs more than just material — it costs time, downtime and quality.
```

**Wordt:**
```
Today, we help customers in food, logistics, industry and agro-industry to make the right choices before they order. Not from a catalogue, but based on their line, their product and the risks involved. Because the wrong film costs more than just material. It costs time, downtime and quality.
```

### [text] `storyBlocks[1].body[2].children[0].text` — aboutPage-en (aboutPage [en])

**Was:**
```
This way, you get not only the right product, but also the assurance that your packaging is technically sound. Less risk of breakage, downtime or rejection — and a solution that does what it needs to do. Do you have a specific question? We'd love to think along with you.
```

**Wordt:**
```
This way, you get not only the right product, but also the assurance that your packaging is technically sound. Less risk of breakage, downtime or rejection, and a solution that does what it needs to do. Do you have a specific question? We'd love to think along with you.
```

### [text] `approach.body[0].children[0].text` — aboutPage-fr (aboutPage [fr])

**Was:**
```
Nous partons de votre application : vitesse de ligne, zone de soudure, exigences retail et audits. Ce n'est qu'ensuite que nous traduisons cela en une proposition de matériau concrète. Notre équipe combine des ingénieurs commerciaux avec une expertise en production — vous parlez avec des personnes qui produisent réellement votre film.
```

**Wordt:**
```
Nous partons de votre application : vitesse de ligne, zone de soudure, exigences retail et audits. Ce n'est qu'ensuite que nous traduisons cela en une proposition de matériau concrète. Notre équipe combine des ingénieurs commerciaux avec une expertise en production. Vous parlez avec des personnes qui produisent réellement votre film.
```

### [text] `storyBlocks[0].body[1].children[0].text` — aboutPage-fr (aboutPage [fr])

**Was:**
```
Aujourd'hui, nous aidons nos clients dans l'alimentation, la logistique, l'industrie et l'agro-industrie à faire les bons choix avant de commander. Non pas à partir d'un catalogue, mais à partir de leur ligne, leur produit et les risques qui y sont associés. Car un mauvais film coûte plus que du matériel — il coûte du temps, des arrêts et de la qualité.
```

**Wordt:**
```
Aujourd'hui, nous aidons nos clients dans l'alimentation, la logistique, l'industrie et l'agro-industrie à faire les bons choix avant de commander. Non pas à partir d'un catalogue, mais à partir de leur ligne, leur produit et les risques qui y sont associés. Car un mauvais film coûte plus que du matériel. Il coûte du temps, des arrêts et de la qualité.
```

### [text] `storyBlocks[1].body[2].children[0].text` — aboutPage-fr (aboutPage [fr])

**Was:**
```
Vous obtenez ainsi non seulement le bon produit, mais aussi la certitude que votre emballage est techniquement correct. Moins de risques de rupture, d'arrêt ou de rejet — et une solution qui fait ce qu'elle doit faire. Vous avez une question concrète ? Nous sommes heureux de réfléchir avec vous.
```

**Wordt:**
```
Vous obtenez ainsi non seulement le bon produit, mais aussi la certitude que votre emballage est techniquement correct. Moins de risques de rupture, d'arrêt ou de rejet, et une solution qui fait ce qu'elle doit faire. Vous avez une question concrète ? Nous sommes heureux de réfléchir avec vous.
```

### [text] `approach.body[1].children[0].text` — aboutPage-nl (aboutPage [nl])

**Was:**
```
Ons team combineert sales engineers met productie-expertise — u spreekt met mensen die uw folie ook daadwerkelijk produceren.
```

**Wordt:**
```
Ons team combineert sales engineers met productie-expertise. U spreekt met mensen die uw folie ook daadwerkelijk produceren.
```

### [text] `hero.subline` — contactPage-en (contactPage [en])

**Was:**
```
[AI-translated] Our specialists are happy to think along with you — without obligation
```

**Wordt:**
```
[AI-translated] Our specialists are happy to think along with you, without obligation
```

### [text] `hero.subline` — contactPage-fr (contactPage [fr])

**Was:**
```
[AI-translated] Nos spécialistes se feront un plaisir de réfléchir avec vous — sans engagement
```

**Wordt:**
```
[AI-translated] Nos spécialistes se feront un plaisir de réfléchir avec vous, sans engagement
```

### [text] `additionalInfo[0].children[0].text` — contactPage-nl (contactPage [nl])

**Was:**
```
Liever telefonisch? Bel Hobon of VHP — de nummers vindt u rechts bij de locaties.
```

**Wordt:**
```
Liever telefonisch? Bel Hobon of VHP, de nummers vindt u rechts bij de locaties.
```

### [text] `hero.subline` — contactPage-nl (contactPage [nl])

**Was:**
```
Onze specialisten denken graag met u mee — zonder verplichting
```

**Wordt:**
```
Onze specialisten denken graag met u mee, zonder verplichting
```

### [text] `slogan` — footerNavigation-en (footerNavigation [en])

**Was:**
```
[AI-translated] Hobon — your technical partner for custom packaging film.
```

**Wordt:**
```
[AI-translated] Hobon, your technical partner for custom packaging film.
```

### [text] `slogan` — footerNavigation-fr (footerNavigation [fr])

**Was:**
```
[AI-translated] Hobon — votre partenaire technique pour films d'emballage sur mesure.
```

**Wordt:**
```
[AI-translated] Hobon, votre partenaire technique pour films d'emballage sur mesure.
```

### [text] `slogan` — footerNavigation-nl (footerNavigation [nl])

**Was:**
```
Hobon — uw technische partner voor verpakkingsfolie op maat.
```

**Wordt:**
```
Hobon, uw technische partner voor verpakkingsfolie op maat.
```

### [text] `aboutPhotoCaption` — homePage-en (homePage [en])

**Was:**
```
From extrusion to 6-colour printing — everything in-house in Lievegem.
```

**Wordt:**
```
From extrusion to 6-colour printing, everything in-house in Lievegem.
```

### [text] `contactBody` — homePage-en (homePage [en])

**Was:**
```
Do you have a specific application, machine or challenge? <strong>Put it to us.</strong> We analyse your situation and provide technical advice — without obligation. Average response time: 1 working day.
```

**Wordt:**
```
Do you have a specific application, machine or challenge? <strong>Put it to us.</strong> We analyse your situation and provide technical advice, without obligation. Average response time: 1 working day.
```

### [text] `heroSub` — homePage-en (homePage [en])

**Was:**
```
Hobon helps you <strong>choose the right packaging film</strong> for your machine, your line and your sustainability goals — before you order. Not a catalogue product. <strong>Tailored technical advice</strong>, from extrusion to printing in 6&nbsp;colours.
```

**Wordt:**
```
Hobon helps you <strong>choose the right packaging film</strong> for your machine, your line and your sustainability goals, before you order. Not a catalogue product. <strong>Tailored technical advice</strong>, from extrusion to printing in 6&nbsp;colours.
```

### [text] `processSteps[1].description` — homePage-en (homePage [en])

**Was:**
```
Virgin or recycled, which PE composition, which thickness — tailored to your line requirements and your sustainability goals. Technically substantiated.
```

**Wordt:**
```
Virgin or recycled, which PE composition, which thickness, tailored to your line requirements and your sustainability goals. Technically substantiated.
```

### [text] `processSteps[2].description` — homePage-en (homePage [en])

**Was:**
```
Extrusion, pre-treatment, colouring, printing and processing into bags and sheets — everything in-house in Lievegem. Quality control at every stage.
```

**Wordt:**
```
Extrusion, pre-treatment, colouring, printing and processing into bags and sheets, everything in-house in Lievegem. Quality control at every stage.
```

### [text] `productCards[0].description` — homePage-en (homePage [en])

**Was:**
```
One of the few Belgian producers with in-depth expertise in DOLAV bags. Dust resistance, weld strength and resistance to mechanical stress determine the material choice — a wrong composition leads to breakage or product loss on the line.
```

**Wordt:**
```
One of the few Belgian producers with in-depth expertise in DOLAV bags. Dust resistance, weld strength and resistance to mechanical stress determine the material choice. A wrong composition leads to breakage or product loss on the line.
```

### [text] `productCards[2].description` — homePage-en (homePage [en])

**Was:**
```
Hobon is further expanding the stretch film range — from machine stretch film to hand wrap film, in various compositions for pallet stability and protection.
```

**Wordt:**
```
Hobon is further expanding the stretch film range, from machine stretch film to hand wrap film, in various compositions for pallet stability and protection.
```

### [text] `qualityItems[0].description` — homePage-en (homePage [en])

**Was:**
```
From extrusion through pre-treatment to printing — in-house in Lievegem, not outsourced.
```

**Wordt:**
```
From extrusion through pre-treatment to printing, in-house in Lievegem, not outsourced.
```

### [text] `qualityLabel` — homePage-en (homePage [en])

**Was:**
```
<strong>Highest certification level</strong> BRC Packaging Level AA — verified at every production stage. Virgin materials for food packaging.
```

**Wordt:**
```
<strong>Highest certification level</strong> BRC Packaging Level AA. Verified at every production stage. Virgin materials for food packaging.
```

### [text] `aboutPhotoCaption` — homePage-fr (homePage [fr])

**Was:**
```
De l'extrusion à l'impression en 6 couleurs — tout en interne à Lievegem.
```

**Wordt:**
```
De l'extrusion à l'impression en 6 couleurs, tout en interne à Lievegem.
```

### [text] `contactBody` — homePage-fr (homePage [fr])

**Was:**
```
Avez-vous une application, une machine ou un défi spécifique ? <strong>Soumettez-le nous.</strong> Nous analysons votre situation et fournissons des conseils techniques — sans engagement. Délai de réponse moyen : 1 jour ouvrable.
```

**Wordt:**
```
Avez-vous une application, une machine ou un défi spécifique ? <strong>Soumettez-le nous.</strong> Nous analysons votre situation et fournissons des conseils techniques, sans engagement. Délai de réponse moyen : 1 jour ouvrable.
```

### [text] `heroSub` — homePage-fr (homePage [fr])

**Was:**
```
Hobon vous aide à <strong>choisir le bon film d'emballage</strong> pour votre machine, votre ligne et vos objectifs de durabilité — avant de commander. Pas de produit catalogue. <strong>Conseil technique sur mesure</strong>, de l'extrusion à l'impression en 6&nbsp;couleurs.
```

**Wordt:**
```
Hobon vous aide à <strong>choisir le bon film d'emballage</strong> pour votre machine, votre ligne et vos objectifs de durabilité, avant de commander. Pas de produit catalogue. <strong>Conseil technique sur mesure</strong>, de l'extrusion à l'impression en 6&nbsp;couleurs.
```

### [text] `processSteps[1].description` — homePage-fr (homePage [fr])

**Was:**
```
Vierge ou recyclé, quelle composition PE, quelle épaisseur — adapté à vos exigences de ligne et à vos objectifs de durabilité. Techniquement étayé.
```

**Wordt:**
```
Vierge ou recyclé, quelle composition PE, quelle épaisseur, adapté à vos exigences de ligne et à vos objectifs de durabilité. Techniquement étayé.
```

### [text] `processSteps[2].description` — homePage-fr (homePage [fr])

**Was:**
```
Extrusion, prétraitement, coloration, impression et transformation en sacs et feuilles — tout en interne à Lievegem. Contrôle qualité à chaque étape.
```

**Wordt:**
```
Extrusion, prétraitement, coloration, impression et transformation en sacs et feuilles, tout en interne à Lievegem. Contrôle qualité à chaque étape.
```

### [text] `productCards[0].description` — homePage-fr (homePage [fr])

**Was:**
```
L'un des rares producteurs belges avec une expertise approfondie dans les sacs DOLAV. La résistance à la poussière, la solidité des soudures et la résistance aux contraintes mécaniques déterminent le choix du matériau — une mauvaise composition entraîne des ruptures ou des pertes de produit sur la ligne.
```

**Wordt:**
```
L'un des rares producteurs belges avec une expertise approfondie dans les sacs DOLAV. La résistance à la poussière, la solidité des soudures et la résistance aux contraintes mécaniques déterminent le choix du matériau. Une mauvaise composition entraîne des ruptures ou des pertes de produit sur la ligne.
```

### [text] `productCards[2].description` — homePage-fr (homePage [fr])

**Was:**
```
Hobon développe davantage l'offre de film étirable — du film étirable machine au film d'emballage manuel, dans diverses compositions pour la stabilité des palettes et la protection.
```

**Wordt:**
```
Hobon développe davantage l'offre de film étirable, du film étirable machine au film d'emballage manuel, dans diverses compositions pour la stabilité des palettes et la protection.
```

### [text] `qualityItems[0].description` — homePage-fr (homePage [fr])

**Was:**
```
De l'extrusion au prétraitement jusqu'à l'impression — en interne à Lievegem, pas externalisé.
```

**Wordt:**
```
De l'extrusion au prétraitement jusqu'à l'impression, en interne à Lievegem, pas externalisé.
```

### [text] `qualityLabel` — homePage-fr (homePage [fr])

**Was:**
```
<strong>Niveau de certification le plus élevé</strong> BRC Packaging Niveau AA — vérifié à chaque stade de production. Matériaux vierges pour les emballages alimentaires.
```

**Wordt:**
```
<strong>Niveau de certification le plus élevé</strong> BRC Packaging Niveau AA. Vérifié à chaque stade de production. Matériaux vierges pour les emballages alimentaires.
```

### [text] `aboutPhotoCaption` — homePage-nl (homePage [nl])

**Was:**
```
Van extrusie tot bedrukking in 6 kleuren — alles inhouse in Lievegem.
```

**Wordt:**
```
Van extrusie tot bedrukking in 6 kleuren, alles inhouse in Lievegem.
```

### [text] `contactBody` — homePage-nl (homePage [nl])

**Was:**
```
Heeft u een specifieke toepassing, machine of uitdaging? <strong>Leg het ons voor.</strong> Wij analyseren uw situatie en geven technisch advies — zonder verplichtingen. Gemiddelde reactietijd: 1 werkdag.
```

**Wordt:**
```
Heeft u een specifieke toepassing, machine of uitdaging? <strong>Leg het ons voor.</strong> Wij analyseren uw situatie en geven technisch advies, zonder verplichtingen. Gemiddelde reactietijd: 1 werkdag.
```

### [text] `heroSub` — homePage-nl (homePage [nl])

**Was:**
```
Hobon helpt u <strong>de juiste verpakkingsfolie kiezen</strong> voor uw machine, uw lijn en uw duurzaamheidsdoelstellingen — vóór u bestelt. Geen catalogusproduct. <strong>Technisch advies op maat</strong>, van extrusie tot bedrukking in 6&nbsp;kleuren.
```

**Wordt:**
```
Hobon helpt u <strong>de juiste verpakkingsfolie kiezen</strong> voor uw machine, uw lijn en uw duurzaamheidsdoelstellingen, vóór u bestelt. Geen catalogusproduct. <strong>Technisch advies op maat</strong>, van extrusie tot bedrukking in 6&nbsp;kleuren.
```

### [text] `processSteps[1].description` — homePage-nl (homePage [nl])

**Was:**
```
Virgin of recyclaat, welke PE-samenstelling, welke dikte — afgestemd op uw lijneisen én uw duurzaamheidsdoelstellingen. Technisch onderbouwd.
```

**Wordt:**
```
Virgin of recyclaat, welke PE-samenstelling, welke dikte, afgestemd op uw lijneisen én uw duurzaamheidsdoelstellingen. Technisch onderbouwd.
```

### [text] `processSteps[2].description` — homePage-nl (homePage [nl])

**Was:**
```
Extrusie, voorbehandeling, inkleuren, bedrukken en verwerking tot zakken en vellen — alles inhouse in Lievegem. Kwaliteitscontrole in elk stadium.
```

**Wordt:**
```
Extrusie, voorbehandeling, inkleuren, bedrukken en verwerking tot zakken en vellen, alles inhouse in Lievegem. Kwaliteitscontrole in elk stadium.
```

### [text] `productCards[0].description` — homePage-nl (homePage [nl])

**Was:**
```
Één van de weinige Belgische producenten met diepgaande expertise in DOLAV-zakken. Stuifbestendigheid, lassterkte en weerstand tegen mechanische belasting bepalen de materiaalkeuze — een verkeerde samenstelling leidt tot breuk of productverlies op de lijn.
```

**Wordt:**
```
Één van de weinige Belgische producenten met diepgaande expertise in DOLAV-zakken. Stuifbestendigheid, lassterkte en weerstand tegen mechanische belasting bepalen de materiaalkeuze. Een verkeerde samenstelling leidt tot breuk of productverlies op de lijn.
```

### [text] `productCards[2].description` — homePage-nl (homePage [nl])

**Was:**
```
Hobon bouwt het stretchfolieaanbod verder uit — van machinale stretchfolie tot handwikkelfolie, in diverse samenstellingen voor palletstabiliteit en bescherming.
```

**Wordt:**
```
Hobon bouwt het stretchfolieaanbod verder uit, van machinale stretchfolie tot handwikkelfolie, in diverse samenstellingen voor palletstabiliteit en bescherming.
```

### [text] `qualityItems[0].description` — homePage-nl (homePage [nl])

**Was:**
```
Van extrusie over voorbehandeling tot bedrukking — inhouse in Lievegem, niet uitbesteed.
```

**Wordt:**
```
Van extrusie over voorbehandeling tot bedrukking, inhouse in Lievegem, niet uitbesteed.
```

### [text] `qualityLabel` — homePage-nl (homePage [nl])

**Was:**
```
<strong>Hoogste certificeringsniveau</strong>BRC Packaging Level AA — geverifieerd in elk productiestadium. Virgin materialen voor food-verpakkingen.
```

**Wordt:**
```
<strong>Hoogste certificeringsniveau</strong>BRC Packaging Level AA. Geverifieerd in elk productiestadium. Virgin materialen voor food-verpakkingen.
```

### [text] `body[1].children[0].text` — insight-en-dunner-folie-zelfde-kwaliteit (insightArticle [en])

**Was:**
```
Ten years ago, a 50-micron film was standard, whereas today 35 microns is sufficient. For some applications, even 25 microns will do. Material reduction (downgauging) is the most underestimated sustainability gain, and at the same time a direct saving on your cost per package – provided you approach it technically correctly.
```

**Wordt:**
```
Ten years ago, a 50-micron film was standard, whereas today 35 microns is sufficient. For some applications, even 25 microns will do. Material reduction (downgauging) is the most underestimated sustainability gain, and at the same time a direct saving on your cost per package, provided you approach it technically correctly.
```

### [text] `lead` — insight-nl-dunner-folie-zelfde-kwaliteit (insightArticle [nl])

**Was:**
```
Materiaalreductie is de meest onderschatte duurzaamheidswinst — als u de technische specs goed afstemt.
```

**Wordt:**
```
Materiaalreductie is de meest onderschatte duurzaamheidswinst, als u de technische specs goed afstemt.
```

### [text] `whyHobonBody` — product-en-blaasfolies (product [en])

**Was:**
```
[AI-translated] The entire production process takes place in-house — from extrusion through pre-treatment to colouring. State-of-the-art machinery and quality control at every stage guarantee consistent quality, even for critical applications.
```

**Wordt:**
```
[AI-translated] The entire production process takes place in-house, from extrusion through pre-treatment to colouring. State-of-the-art machinery and quality control at every stage guarantee consistent quality, even for critical applications.
```

### [text] `body[0].children[0].text` — product-en-boterfolie (product [en])

**Was:**
```
[TODO: productdetail body — Copy Brief sectie 06]
```

**Wordt:**
```
[TODO: productdetail body. Copy Brief sectie 06]
```

### [text] `lead` — product-en-boterfolie (product [en])

**Was:**
```
[TODO: Copy Brief sectie 06 — producttemplate]
```

**Wordt:**
```
[TODO: Copy Brief sectie 06, producttemplate]
```

### [text] `listingDescription` — product-en-boterfolie (product [en])

**Was:**
```
[AI-translated] Paperlook butter film for food applications — suitable for retail presentation and stable processing on your line.
```

**Wordt:**
```
[AI-translated] Paperlook butter film for food applications, suitable for retail presentation and stable processing on your line.
```

### [text] `body[0].children[0].text` — product-en-dolav-zakken (product [en])

**Was:**
```
[TODO: productdetail body — Copy Brief sectie 06]
```

**Wordt:**
```
[TODO: productdetail body. Copy Brief sectie 06]
```

### [text] `lead` — product-en-dolav-zakken (product [en])

**Was:**
```
[TODO: Copy Brief sectie 06 — producttemplate]
```

**Wordt:**
```
[TODO: Copy Brief sectie 06, producttemplate]
```

### [text] `listingDescription` — product-en-dolav-zakken (product [en])

**Was:**
```
[AI-translated] DOLAV bags in LDPE/HDPE with high weld strength and dust resistance — tailored to your filling line and mechanical load.
```

**Wordt:**
```
[AI-translated] DOLAV bags in LDPE/HDPE with high weld strength and dust resistance, tailored to your filling line and mechanical load.
```

### [text] `listingDescription` — product-en-kratzakken (product [en])

**Was:**
```
Crate bags made to measure for bulk and animal feed — corner or block weld, matched to your existing filling line.
```

**Wordt:**
```
Crate bags made to measure for bulk and animal feed, corner or block weld, matched to your existing filling line.
```

### [text] `heroHeadline` — product-en-pattyn (product [en])

**Was:**
```
PATTYN — tubular film for automated packaging lines
```

**Wordt:**
```
PATTYN, tubular film for automated packaging lines
```

### [text] `heroIntro` — product-en-pattyn (product [en])

**Was:**
```
PE tubular film with side gussets for PATTYN installations and comparable bag-in-box systems — in multiple PE compositions and dimensions.
```

**Wordt:**
```
PE tubular film with side gussets for PATTYN installations and comparable bag-in-box systems, in multiple PE compositions and dimensions.
```

### [text] `heroHeadline` — product-en-stretch-hood (product [en])

**Was:**
```
Stretch hood — optimal pallet protection
```

**Wordt:**
```
Stretch hood, optimal pallet protection
```

### [text] `heroIntro` — product-en-stretch-hood (product [en])

**Was:**
```
PE shrink hoods custom-sized to your pallet format — individual or tear-off from the roll, for stable and moisture-resistant transport.
```

**Wordt:**
```
PE shrink hoods custom-sized to your pallet format, individual or tear-off from the roll, for stable and moisture-resistant transport.
```

### [text] `ctaBandBody` — product-en-zakken (product [en])

**Was:**
```
[AI-translated] We analyze your filling line and propose the right bag type, sealing and printing — tailored to your machine and product.
```

**Wordt:**
```
[AI-translated] We analyze your filling line and propose the right bag type, sealing and printing, tailored to your machine and product.
```

### [text] `whyHobonBody` — product-fr-blaasfolies (product [fr])

**Was:**
```
L'ensemble du processus de production se déroule en interne — de l'extrusion au prétraitement jusqu'à la coloration. Un parc machines ultramoderne et un contrôle qualité à chaque étape garantissent une qualité constante, même pour les applications critiques.
```

**Wordt:**
```
L'ensemble du processus de production se déroule en interne, de l'extrusion au prétraitement jusqu'à la coloration. Un parc machines ultramoderne et un contrôle qualité à chaque étape garantissent une qualité constante, même pour les applications critiques.
```

### [text] `body[0].children[0].text` — product-fr-boterfolie (product [fr])

**Was:**
```
[TODO: productdetail body — Copy Brief sectie 06]
```

**Wordt:**
```
[TODO: productdetail body. Copy Brief sectie 06]
```

### [text] `lead` — product-fr-boterfolie (product [fr])

**Was:**
```
[TODO: Copy Brief sectie 06 — producttemplate]
```

**Wordt:**
```
[TODO: Copy Brief sectie 06, producttemplate]
```

### [text] `listingDescription` — product-fr-boterfolie (product [fr])

**Was:**
```
[AI-translated] Film papier beurre paperlook pour applications alimentaires — adaptée à la présentation retail et à votre ligne.
```

**Wordt:**
```
[AI-translated] Film papier beurre paperlook pour applications alimentaires, adaptée à la présentation retail et à votre ligne.
```

### [text] `body[0].children[0].text` — product-fr-dolav-zakken (product [fr])

**Was:**
```
[TODO: productdetail body — Copy Brief sectie 06]
```

**Wordt:**
```
[TODO: productdetail body. Copy Brief sectie 06]
```

### [text] `lead` — product-fr-dolav-zakken (product [fr])

**Was:**
```
[TODO: Copy Brief sectie 06 — producttemplate]
```

**Wordt:**
```
[TODO: Copy Brief sectie 06, producttemplate]
```

### [text] `listingDescription` — product-fr-dolav-zakken (product [fr])

**Was:**
```
[AI-translated] Sacs DOLAV en LDPE/HDPE à haute résistance de soudure et étanchéité à la poussière — adaptés à votre ligne de remplissage et à la charge mécanique.
```

**Wordt:**
```
[AI-translated] Sacs DOLAV en LDPE/HDPE à haute résistance de soudure et étanchéité à la poussière, adaptés à votre ligne de remplissage et à la charge mécanique.
```

### [text] `body[0].children[0].text` — product-fr-kratzakken (product [fr])

**Was:**
```
[TODO: productdetail body — Copy Brief sectie 06]
```

**Wordt:**
```
[TODO: productdetail body. Copy Brief sectie 06]
```

### [text] `lead` — product-fr-kratzakken (product [fr])

**Was:**
```
[TODO: Copy Brief sectie 06 — producttemplate]
```

**Wordt:**
```
[TODO: Copy Brief sectie 06, producttemplate]
```

### [text] `listingDescription` — product-fr-kratzakken (product [fr])

**Was:**
```
[AI-translated] Sacs pour caisses sur mesure pour vrac et aliments — soudure d'angle ou de bloc, adaptés à votre ligne de remplissage.
```

**Wordt:**
```
[AI-translated] Sacs pour caisses sur mesure pour vrac et aliments, soudure d'angle ou de bloc, adaptés à votre ligne de remplissage.
```

### [text] `heroHeadline` — product-fr-pattyn (product [fr])

**Was:**
```
PATTYN — film tubulaire pour lignes d'emballage automatisées
```

**Wordt:**
```
PATTYN, film tubulaire pour lignes d'emballage automatisées
```

### [text] `heroIntro` — product-fr-pattyn (product [fr])

**Was:**
```
Film PE tubulaire à soufflets latéraux pour installations PATTYN et systèmes bag-in-box comparables — en plusieurs compositions PE et dimensions.
```

**Wordt:**
```
Film PE tubulaire à soufflets latéraux pour installations PATTYN et systèmes bag-in-box comparables, en plusieurs compositions PE et dimensions.
```

### [text] `heroHeadline` — product-fr-stretch-hood (product [fr])

**Was:**
```
Housses stretch — protection optimale des palettes
```

**Wordt:**
```
Housses stretch, protection optimale des palettes
```

### [text] `heroIntro` — product-fr-stretch-hood (product [fr])

**Was:**
```
Housses stretch PE sur mesure selon votre format de palette — en feuilles individuelles ou détachables du rouleau, pour un transport stable et résistant à l'humidité.
```

**Wordt:**
```
Housses stretch PE sur mesure selon votre format de palette, en feuilles individuelles ou détachables du rouleau, pour un transport stable et résistant à l'humidité.
```

### [text] `ctaBandBody` — product-fr-zakken (product [fr])

**Was:**
```
[AI-translated] Nous analysons votre ligne de remplissage et proposons le type de sac, la fermeture et l'impression appropriés — adaptés à votre machine et votre produit.
```

**Wordt:**
```
[AI-translated] Nous analysons votre ligne de remplissage et proposons le type de sac, la fermeture et l'impression appropriés, adaptés à votre machine et votre produit.
```

### [text] `faqs[0].answer` — product-nl-blaasfolies (product [nl])

**Was:**
```
Dat hangt af van uw toepassing, machine en de gewenste sterkte. Monolayer, 3-laags of 5-laags — wij bepalen het samen met u, vóór u bestelt.
```

**Wordt:**
```
Dat hangt af van uw toepassing, machine en de gewenste sterkte. Monolayer, 3-laags of 5-laags, wij bepalen het samen met u, vóór u bestelt.
```

### [text] `heroHeadline` — product-nl-blaasfolies (product [nl])

**Was:**
```
Folies —
op maat voor
uw verpakkingslijn
```

**Wordt:**
```
Folies, op maat voor
uw verpakkingslijn
```

### [text] `heroIntro` — product-nl-blaasfolies (product [nl])

**Was:**
```
Folie in uiteenlopende PE-samenstellingen en afmetingen, met of zonder zijvouwen — voor geautomatiseerde verpakkingslijnen en krimphoesinstallaties. Geen catalogusproduct, wel de juiste keuze voor uw toepassing.
```

**Wordt:**
```
Folie in uiteenlopende PE-samenstellingen en afmetingen, met of zonder zijvouwen, voor geautomatiseerde verpakkingslijnen en krimphoesinstallaties. Geen catalogusproduct, wel de juiste keuze voor uw toepassing.
```

### [text] `whyHobonBody` — product-nl-blaasfolies (product [nl])

**Was:**
```
Het volledige productieproces vindt inhouse plaats — van extruderen over voorbehandelen tot inkleuren. Een ultramodern machinepark en kwaliteitscontrole in elk stadium garanderen consistente kwaliteit, ook voor kritische toepassingen.
```

**Wordt:**
```
Het volledige productieproces vindt inhouse plaats, van extruderen over voorbehandelen tot inkleuren. Een ultramodern machinepark en kwaliteitscontrole in elk stadium garanderen consistente kwaliteit, ook voor kritische toepassingen.
```

### [text] `body[0].children[0].text` — product-nl-boterfolie (product [nl])

**Was:**
```
[TODO: productdetail body — Copy Brief sectie 06]
```

**Wordt:**
```
[TODO: productdetail body. Copy Brief sectie 06]
```

### [text] `lead` — product-nl-boterfolie (product [nl])

**Was:**
```
[TODO: Copy Brief sectie 06 — producttemplate]
```

**Wordt:**
```
[TODO: Copy Brief sectie 06, producttemplate]
```

### [text] `listingDescription` — product-nl-boterfolie (product [nl])

**Was:**
```
Paperlook boterfolie voor food-toepassingen — geschikt voor retailpresentatie en stabiele verwerking op uw lijn.
```

**Wordt:**
```
Paperlook boterfolie voor food-toepassingen, geschikt voor retailpresentatie en stabiele verwerking op uw lijn.
```

### [text] `body[0].children[0].text` — product-nl-dolav-zakken (product [nl])

**Was:**
```
[TODO: productdetail body — Copy Brief sectie 06]
```

**Wordt:**
```
[TODO: productdetail body. Copy Brief sectie 06]
```

### [text] `lead` — product-nl-dolav-zakken (product [nl])

**Was:**
```
[TODO: Copy Brief sectie 06 — producttemplate]
```

**Wordt:**
```
[TODO: Copy Brief sectie 06, producttemplate]
```

### [text] `listingDescription` — product-nl-dolav-zakken (product [nl])

**Was:**
```
DOLAV-zakken in LDPE/HDPE met hoge lassterkte en stuifbestendigheid — op maat van uw afvulinstallatie en mechanische belasting.
```

**Wordt:**
```
DOLAV-zakken in LDPE/HDPE met hoge lassterkte en stuifbestendigheid, op maat van uw afvulinstallatie en mechanische belasting.
```

### [text] `body[0].children[0].text` — product-nl-kratzakken (product [nl])

**Was:**
```
[TODO: productdetail body — Copy Brief sectie 06]
```

**Wordt:**
```
[TODO: productdetail body. Copy Brief sectie 06]
```

### [text] `heroIntro` — product-nl-kratzakken (product [nl])

**Was:**
```
Kratzakken met hoeklas of bloklas — afgestemd op uw bestaande afvulinstallatie en product.
```

**Wordt:**
```
Kratzakken met hoeklas of bloklas, afgestemd op uw bestaande afvulinstallatie en product.
```

### [text] `lead` — product-nl-kratzakken (product [nl])

**Was:**
```
[TODO: Copy Brief sectie 06 — producttemplate]
```

**Wordt:**
```
[TODO: Copy Brief sectie 06, producttemplate]
```

### [text] `listingDescription` — product-nl-kratzakken (product [nl])

**Was:**
```
Kratzakken op maat voor bulk en veevoeder — hoeklas of bloklas, afgestemd op uw bestaande afvulinstallatie.
```

**Wordt:**
```
Kratzakken op maat voor bulk en veevoeder, hoeklas of bloklas, afgestemd op uw bestaande afvulinstallatie.
```

### [text] `heroHeadline` — product-nl-pattyn (product [nl])

**Was:**
```
PATTYN — buisfolie voor geautomatiseerde inpaklijnen
```

**Wordt:**
```
PATTYN, buisfolie voor geautomatiseerde inpaklijnen
```

### [text] `heroIntro` — product-nl-pattyn (product [nl])

**Was:**
```
PE-buisfolie met zijvouwen voor PATTYN-installaties en vergelijkbare bag-in-box-systemen — in meerdere PE-samenstellingen en afmetingen.
```

**Wordt:**
```
PE-buisfolie met zijvouwen voor PATTYN-installaties en vergelijkbare bag-in-box-systemen, in meerdere PE-samenstellingen en afmetingen.
```

### [text] `heroHeadline` — product-nl-stretch-hood (product [nl])

**Was:**
```
Stretch hood — optimale palletbescherming
```

**Wordt:**
```
Stretch hood, optimale palletbescherming
```

### [text] `heroIntro` — product-nl-stretch-hood (product [nl])

**Was:**
```
PE-krimphoezen op maat van uw palletformaat — los of afscheurbaar van de rol, voor stabiel en vochtbestendig transport.
```

**Wordt:**
```
PE-krimphoezen op maat van uw palletformaat, los of afscheurbaar van de rol, voor stabiel en vochtbestendig transport.
```

### [text] `solutionCards[0].description` — product-nl-stretch-hood (product [nl])

**Was:**
```
PE-krimphoezen op maat van uw palletformaat — los of afscheurbaar van de rol.
```

**Wordt:**
```
PE-krimphoezen op maat van uw palletformaat, los of afscheurbaar van de rol.
```

### [text] `ctaBandBody` — product-nl-zakken (product [nl])

**Was:**
```
Wij analyseren uw afvullijn en stellen het juiste zaktype, de sluiting en de bedrukking voor — afgestemd op uw machine en product.
```

**Wordt:**
```
Wij analyseren uw afvullijn en stellen het juiste zaktype, de sluiting en de bedrukking voor, afgestemd op uw machine en product.
```

### [text] `ctaBandBody` — productOverviewPage-en (productOverviewPage [en])

**Was:**
```
[AI-translated] Do you have a specific application, machine or challenge? <strong>Tell us about it.</strong> We advise on the right PE product — with no obligation.
```

**Wordt:**
```
[AI-translated] Do you have a specific application, machine or challenge? <strong>Tell us about it.</strong> We advise on the right PE product, with no obligation.
```

### [text] `heroIntro` — productOverviewPage-en (productOverviewPage [en])

**Was:**
```
[AI-translated] Overview of Hobon's core products: blown films, bags, sheets, stretch hood and PATTYN rolls. Each in HDPE or LDPE, mono to 5-layer, tailored to your filling line and line speed — not an off-the-shelf catalogue choice.
```

**Wordt:**
```
[AI-translated] Overview of Hobon's core products: blown films, bags, sheets, stretch hood and PATTYN rolls. Each in HDPE or LDPE, mono to 5-layer, tailored to your filling line and line speed, not an off-the-shelf catalogue choice.
```

### [text] `intro` — productOverviewPage-en (productOverviewPage [en])

**Was:**
```
[AI-translated] Overview of Hobon's core products: blown films, bags, sheets, stretch hood and PATTYN rolls. Each in HDPE or LDPE, mono to 5-layer, tailored to your filling line and line speed — not an off-the-shelf catalogue choice.
```

**Wordt:**
```
[AI-translated] Overview of Hobon's core products: blown films, bags, sheets, stretch hood and PATTYN rolls. Each in HDPE or LDPE, mono to 5-layer, tailored to your filling line and line speed, not an off-the-shelf catalogue choice.
```

### [text] `ctaBandBody` — productOverviewPage-fr (productOverviewPage [fr])

**Was:**
```
[AI-translated] Vous avez une application, une machine ou un défi spécifique ? <strong>Présentez-nous votre situation.</strong> Nous vous conseillons le bon produit PE — sans engagement.
```

**Wordt:**
```
[AI-translated] Vous avez une application, une machine ou un défi spécifique ? <strong>Présentez-nous votre situation.</strong> Nous vous conseillons le bon produit PE, sans engagement.
```

### [text] `heroIntro` — productOverviewPage-fr (productOverviewPage [fr])

**Was:**
```
[AI-translated] Aperçu des produits clés de Hobon : films soufflés, sacs, feuilles, stretch hood et rouleaux PATTYN. Chaque produit en HDPE ou LDPE, mono à 5 couches, adapté à votre installation de remplissage et à votre vitesse de ligne — pas un choix sur catalogue.
```

**Wordt:**
```
[AI-translated] Aperçu des produits clés de Hobon : films soufflés, sacs, feuilles, stretch hood et rouleaux PATTYN. Chaque produit en HDPE ou LDPE, mono à 5 couches, adapté à votre installation de remplissage et à votre vitesse de ligne, pas un choix sur catalogue.
```

### [text] `intro` — productOverviewPage-fr (productOverviewPage [fr])

**Was:**
```
[AI-translated] Aperçu des produits clés de Hobon : films soufflés, sacs, feuilles, stretch hood et rouleaux PATTYN. Chaque produit en HDPE ou LDPE, mono à 5 couches, adapté à votre installation de remplissage et à votre vitesse de ligne — pas un choix sur catalogue.
```

**Wordt:**
```
[AI-translated] Aperçu des produits clés de Hobon : films soufflés, sacs, feuilles, stretch hood et rouleaux PATTYN. Chaque produit en HDPE ou LDPE, mono à 5 couches, adapté à votre installation de remplissage et à votre vitesse de ligne, pas un choix sur catalogue.
```

### [text] `ctaBandBody` — productOverviewPage-nl (productOverviewPage [nl])

**Was:**
```
Heeft u een specifieke toepassing, machine of uitdaging? <strong>Leg het ons voor.</strong> Wij adviseren het juiste PE-product — zonder verplichtingen.
```

**Wordt:**
```
Heeft u een specifieke toepassing, machine of uitdaging? <strong>Leg het ons voor.</strong> Wij adviseren het juiste PE-product, zonder verplichtingen.
```

### [text] `heroIntro` — productOverviewPage-nl (productOverviewPage [nl])

**Was:**
```
Overzicht van Hobons kernproducten: blaasfolies, zakken, vellen, stretch hood en PATTYN-rollen. Elk product in HDPE of LDPE, mono tot 5-laags, afgestemd op uw afvulinstallatie en lijnsnelheid — geen cataloguskeuze.
```

**Wordt:**
```
Overzicht van Hobons kernproducten: blaasfolies, zakken, vellen, stretch hood en PATTYN-rollen. Elk product in HDPE of LDPE, mono tot 5-laags, afgestemd op uw afvulinstallatie en lijnsnelheid, geen cataloguskeuze.
```

### [text] `complianceIntro` — sector-en-agro (sector [en])

**Was:**
```
<strong>Robust agro packaging</strong> — bags and films designed around your product, storage and filling speed.
```

**Wordt:**
```
<strong>Robust agro packaging</strong>. Bags and films designed around your product, storage and filling speed.
```

### [text] `complianceItems[0].description` — sector-en-agro (sector [en])

**Was:**
```
Pinch-bottom, block-bottom, paperlike and gusseted bags — matching your line.
```

**Wordt:**
```
Pinch-bottom, block-bottom, paperlike and gusseted bags, matching your line.
```

### [text] `deepFaqs[1].body` — sector-en-agro (sector [en])

**Was:**
```
Yes — reinforced PE in 3-layer or 5-layer for products up to 50kg. Larger upon request.
```

**Wordt:**
```
Yes, reinforced PE in 3-layer or 5-layer for products up to 50kg. Larger upon request.
```

### [text] `deepFaqs[2].body` — sector-en-agro (sector [en])

**Was:**
```
Yes — gusseted bags are a specific niche product of Hobon.
```

**Wordt:**
```
Yes, gusseted bags are a specific niche product of Hobon.
```

### [text] `deepPhoto.alt` — sector-en-agro (sector [en])

**Was:**
```
Pinch-bottom, block-bottom or gusseted bags — tailored to your installation.
```

**Wordt:**
```
Pinch-bottom, block-bottom or gusseted bags, tailored to your installation.
```

### [text] `deepPhotoCaption` — sector-en-agro (sector [en])

**Was:**
```
Pinch-bottom, block-bottom or gusseted bags — tailored to your installation.
```

**Wordt:**
```
Pinch-bottom, block-bottom or gusseted bags, tailored to your installation.
```

### [text] `heroIntro` — sector-en-agro (sector [en])

**Was:**
```
Robust bags and films for animal feed, fertilizers, powders and grains — tailored to your filling installation.
```

**Wordt:**
```
Robust bags and films for animal feed, fertilizers, powders and grains, tailored to your filling installation.
```

### [text] `listingDescription` — sector-en-agro (sector [en])

**Was:**
```
Bags and film for animal feed, fertilizers and bulk — pinch-bottom, block-bottom, gusseted bags and UV-resistant versions.
```

**Wordt:**
```
Bags and film for animal feed, fertilizers and bulk, pinch-bottom, block-bottom, gusseted bags and UV-resistant versions.
```

### [text] `problemBand[2].description` — sector-en-agro (sector [en])

**Was:**
```
Pinch-bottom, block-bottom, paperlike — each installation requires its own bag type. Wrong choice = line not running.
```

**Wordt:**
```
Pinch-bottom, block-bottom, paperlike, each installation requires its own bag type. Wrong choice = line not running.
```

### [text] `solutionCards[0].description` — sector-en-agro (sector [en])

**Was:**
```
Pinch-bottom, block-bottom, paperlike or gusseted bags — tailored to your existing line.
```

**Wordt:**
```
Pinch-bottom, block-bottom, paperlike or gusseted bags, tailored to your existing line.
```

### [text] `solutionCards[2].description` — sector-en-agro (sector [en])

**Was:**
```
Product name, composition and logo directly on the bag — flexo printing up to 6 colors.
```

**Wordt:**
```
Product name, composition and logo directly on the bag, flexo printing up to 6 colors.
```

### [text] `complianceIntro` — sector-en-chemie (sector [en])

**Was:**
```
<strong>Industrial PE film</strong> — REACH-compliant materials and technical support for chemical and machinery specs.
```

**Wordt:**
```
<strong>Industrial PE film</strong>. REACH-compliant materials and technical support for chemical and machinery specs.
```

### [text] `deepFaqs[1].body` — sector-en-chemie (sector [en])

**Was:**
```
[AI-translated] Yes — anti-static PE film with the correct surface resistance. Specs on request.
```

**Wordt:**
```
[AI-translated] Yes, anti-static PE film with the correct surface resistance. Specs on request.
```

### [text] `deepFaqs[3].body` — sector-en-chemie (sector [en])

**Was:**
```
[AI-translated] Minimum batches depending on the product. For custom solutions we work from 1 tonne — call us if you are looking for smaller quantities.
```

**Wordt:**
```
[AI-translated] Minimum batches depending on the product. For custom solutions we work from 1 tonne, call us if you are looking for smaller quantities.
```

### [text] `heroIntro` — sector-en-chemie (sector [en])

**Was:**
```
Anti-static, UV-resistant, custom printed — PE film that meets the most specific industrial requirements.
```

**Wordt:**
```
Anti-static, UV-resistant, custom printed. PE film that meets the most specific industrial requirements.
```

### [text] `problemBand[0].description` — sector-en-chemie (sector [en])

**Was:**
```
[AI-translated] For sensitive chemical products or in ATEX zones, anti-static film is not a luxury — it is safety.
```

**Wordt:**
```
[AI-translated] For sensitive chemical products or in ATEX zones, anti-static film is not a luxury. It is safety.
```

### [text] `solutionCards[2].description` — sector-en-chemie (sector [en])

**Was:**
```
[AI-translated] Product information, batch numbers, branding — directly on the film or bag.
```

**Wordt:**
```
[AI-translated] Product information, batch numbers, branding, directly on the film or bag.
```

### [text] `complianceIntro` — sector-en-logistiek (sector [en])

**Was:**
```
<strong>PE film for logistics</strong> — from advice to delivery, with focus on line compatibility and transport stability.
```

**Wordt:**
```
<strong>PE film for logistics</strong>. From advice to delivery, with focus on line compatibility and transport stability.
```

### [text] `deepBody` — sector-en-logistiek (sector [en])

**Was:**
```
From shrink hoods to top sheets: Hobon supplies PE film tailored to your pallet formats, line speed and transport — with technical advice before ordering.
```

**Wordt:**
```
From shrink hoods to top sheets: Hobon supplies PE film tailored to your pallet formats, line speed and transport, with technical advice before ordering.
```

### [text] `deepFaqs[1].body` — sector-en-logistiek (sector [en])

**Was:**
```
[AI-translated] Yes — often customers save up to 15% on inventory through film rationalization. We analyze your existing lines and propose standardization where sensible.
```

**Wordt:**
```
[AI-translated] Yes, often customers save up to 15% on inventory through film rationalization. We analyze your existing lines and propose standardization where sensible.
```

### [text] `deepFaqs[3].body` — sector-en-logistiek (sector [en])

**Was:**
```
[AI-translated] Yes — flexo printing up to 6 colors, for branding or identification.
```

**Wordt:**
```
[AI-translated] Yes, flexo printing up to 6 colors, for branding or identification.
```

### [text] `listingDescription` — sector-en-logistiek (sector [en])

**Was:**
```
Shrink hoods, machine film, top sheets and bundling film for logistics — PE film that keeps your automated line running.
```

**Wordt:**
```
Shrink hoods, machine film, top sheets and bundling film for logistics. PE film that keeps your automated line running.
```

### [text] `problemBand[2].description` — sector-en-logistiek (sector [en])

**Was:**
```
[AI-translated] Different lines, different formats — film inventory management becomes complex and expensive.
```

**Wordt:**
```
[AI-translated] Different lines, different formats, film inventory management becomes complex and expensive.
```

### [text] `solutionCards[3].description` — sector-en-logistiek (sector [en])

**Was:**
```
[AI-translated] Film that wraps multiple units together — efficient for distribution.
```

**Wordt:**
```
[AI-translated] Film that wraps multiple units together, efficient for distribution.
```

### [text] `caseStudies[0].image.alt` — sector-en-voeding (sector [en])

**Was:**
```
FFS line 65 metres/minute — breakage after supplier switch
```

**Wordt:**
```
FFS line 65 metres/minute, breakage after supplier switch
```

### [text] `caseStudies[0].title` — sector-en-voeding (sector [en])

**Was:**
```
FFS line 65 metres/minute — breakage after supplier switch
```

**Wordt:**
```
FFS line 65 metres/minute, breakage after supplier switch
```

### [text] `complianceIntro` — sector-en-voeding (sector [en])

**Was:**
```
<strong>Highest food certification level</strong>BRC Packaging Level AA — verified at every production stage.
```

**Wordt:**
```
<strong>Highest food certification level</strong>BRC Packaging Level AA. Verified at every production stage.
```

### [text] `complianceItems[0].title` — sector-en-voeding (sector [en])

**Was:**
```
BRC Packaging Level AA — highest level
```

**Wordt:**
```
BRC Packaging Level AA, highest level
```

### [text] `deepFaqs[3].title` — sector-en-voeding (sector [en])

**Was:**
```
My supplier no longer delivers — urgent alternative needed
```

**Wordt:**
```
My supplier no longer delivers, urgent alternative needed
```

### [text] `deepPhoto.alt` — sector-en-voeding (sector [en])

**Was:**
```
Quality control at every stage — in-house in Lievegem
```

**Wordt:**
```
Quality control at every stage, in-house in Lievegem
```

### [text] `deepPhotoCaption` — sector-en-voeding (sector [en])

**Was:**
```
Quality control at every stage — in-house in Lievegem
```

**Wordt:**
```
Quality control at every stage, in-house in Lievegem
```

### [text] `heroIntro` — sector-en-voeding (sector [en])

**Was:**
```
In the food industry, there is no room for incorrect material choice. <strong>BRC AA certified</strong>, fully food-safe, tailored to your machine and line speed. We ask the right questions first — only then the right film.
```

**Wordt:**
```
In the food industry, there is no room for incorrect material choice. <strong>BRC AA certified</strong>, fully food-safe, tailored to your machine and line speed. We ask the right questions first, only then the right film.
```

### [text] `problemBand[2].title` — sector-en-voeding (sector [en])

**Was:**
```
Technical advice before purchase — not a catalogue question
```

**Wordt:**
```
Technical advice before purchase, not a catalogue question
```

### [text] `complianceIntro` — sector-fr-agro (sector [fr])

**Was:**
```
<strong>Emballages agro robustes</strong> — sacs et films conçus autour de votre produit, de votre stockage et de votre vitesse de remplissage.
```

**Wordt:**
```
<strong>Emballages agro robustes</strong>. Sacs et films conçus autour de votre produit, de votre stockage et de votre vitesse de remplissage.
```

### [text] `complianceItems[0].description` — sector-fr-agro (sector [fr])

**Was:**
```
[AI-translated] Sacs à coins soudés, sacs à fond plat, paperlike et sacs à griffes — adaptés à votre ligne.
```

**Wordt:**
```
[AI-translated] Sacs à coins soudés, sacs à fond plat, paperlike et sacs à griffes, adaptés à votre ligne.
```

### [text] `deepFaqs[1].body` — sector-fr-agro (sector [fr])

**Was:**
```
[AI-translated] Oui — PE renforcé en 3 couches ou 5 couches pour des produits jusqu'à 50 kg. Plus grand sur demande.
```

**Wordt:**
```
[AI-translated] Oui. PE renforcé en 3 couches ou 5 couches pour des produits jusqu'à 50 kg. Plus grand sur demande.
```

### [text] `deepFaqs[2].body` — sector-fr-agro (sector [fr])

**Was:**
```
[AI-translated] Oui — les sacs à griffes sont un produit de niche spécifique de Hobon.
```

**Wordt:**
```
[AI-translated] Oui, les sacs à griffes sont un produit de niche spécifique de Hobon.
```

### [text] `deepPhoto.alt` — sector-fr-agro (sector [fr])

**Was:**
```
Sacs à coins soudés, sacs à fond plat ou sacs à griffes — adaptés à votre installation.
```

**Wordt:**
```
Sacs à coins soudés, sacs à fond plat ou sacs à griffes, adaptés à votre installation.
```

### [text] `deepPhotoCaption` — sector-fr-agro (sector [fr])

**Was:**
```
Sacs à coins soudés, sacs à fond plat ou sacs à griffes — adaptés à votre installation.
```

**Wordt:**
```
Sacs à coins soudés, sacs à fond plat ou sacs à griffes, adaptés à votre installation.
```

### [text] `heroIntro` — sector-fr-agro (sector [fr])

**Was:**
```
Sacs et films robustes pour aliments pour animaux, engrais, poudres et céréales — adaptés à votre installation de remplissage.
```

**Wordt:**
```
Sacs et films robustes pour aliments pour animaux, engrais, poudres et céréales, adaptés à votre installation de remplissage.
```

### [text] `listingDescription` — sector-fr-agro (sector [fr])

**Was:**
```
Sacs et films pour aliments pour animaux, engrais et vrac — sacs à coins soudés, sacs à fond plat, sacs à griffes et versions résistantes aux UV.
```

**Wordt:**
```
Sacs et films pour aliments pour animaux, engrais et vrac, sacs à coins soudés, sacs à fond plat, sacs à griffes et versions résistantes aux UV.
```

### [text] `problemBand[2].description` — sector-fr-agro (sector [fr])

**Was:**
```
[AI-translated] Sacs à coins soudés, sacs à fond plat, paperlike — chaque installation nécessite son propre type de sac. Mauvais choix = ligne à l'arrêt.
```

**Wordt:**
```
[AI-translated] Sacs à coins soudés, sacs à fond plat, paperlike, chaque installation nécessite son propre type de sac. Mauvais choix = ligne à l'arrêt.
```

### [text] `solutionCards[0].description` — sector-fr-agro (sector [fr])

**Was:**
```
Sacs à coins soudés, sacs à fond plat, paperlike ou sacs à griffes — adaptés à votre ligne existante.
```

**Wordt:**
```
Sacs à coins soudés, sacs à fond plat, paperlike ou sacs à griffes, adaptés à votre ligne existante.
```

### [text] `solutionCards[2].description` — sector-fr-agro (sector [fr])

**Was:**
```
[AI-translated] Nom du produit, composition et logo directement sur le sac — impression flexo jusqu'à 6 couleurs.
```

**Wordt:**
```
[AI-translated] Nom du produit, composition et logo directement sur le sac, impression flexo jusqu'à 6 couleurs.
```

### [text] `complianceIntro` — sector-fr-chemie (sector [fr])

**Was:**
```
<strong>Film PE industriel</strong> — matériaux conformes REACH et support technique pour specs chimie et parc machines.
```

**Wordt:**
```
<strong>Film PE industriel</strong>. Matériaux conformes REACH et support technique pour specs chimie et parc machines.
```

### [text] `deepFaqs[1].body` — sector-fr-chemie (sector [fr])

**Was:**
```
[AI-translated] Oui — film PE antistatique avec la résistance de surface appropriée. Specs sur demande.
```

**Wordt:**
```
[AI-translated] Oui. Film PE antistatique avec la résistance de surface appropriée. Specs sur demande.
```

### [text] `deepFaqs[3].body` — sector-fr-chemie (sector [fr])

**Was:**
```
[AI-translated] Lots minimums en fonction du produit. Pour le sur mesure, nous travaillons à partir d'1 tonne — contactez-nous si vous recherchez des quantités plus petites.
```

**Wordt:**
```
[AI-translated] Lots minimums en fonction du produit. Pour le sur mesure, nous travaillons à partir d'1 tonne, contactez-nous si vous recherchez des quantités plus petites.
```

### [text] `heroIntro` — sector-fr-chemie (sector [fr])

**Was:**
```
Antistatique, résistant aux UV, imprimé sur mesure — film PE répondant aux exigences industrielles les plus spécifiques.
```

**Wordt:**
```
Antistatique, résistant aux UV, imprimé sur mesure. Film PE répondant aux exigences industrielles les plus spécifiques.
```

### [text] `problemBand[0].description` — sector-fr-chemie (sector [fr])

**Was:**
```
[AI-translated] Pour les produits chimiques sensibles ou en zones ATEX, le film antistatique n'est pas un luxe — c'est une question de sécurité.
```

**Wordt:**
```
[AI-translated] Pour les produits chimiques sensibles ou en zones ATEX, le film antistatique n'est pas un luxe. C'est une question de sécurité.
```

### [text] `solutionCards[2].description` — sector-fr-chemie (sector [fr])

**Was:**
```
[AI-translated] Informations produit, numéros de lot, branding — directement sur le film ou le sac.
```

**Wordt:**
```
[AI-translated] Informations produit, numéros de lot, branding, directement sur le film ou le sac.
```

### [text] `complianceIntro` — sector-fr-logistiek (sector [fr])

**Was:**
```
[AI-translated] <strong>Film PE pour la logistique</strong> — du conseil à la livraison, avec un focus sur la compatibilité ligne et la stabilité transport.
```

**Wordt:**
```
[AI-translated] <strong>Film PE pour la logistique</strong>. Du conseil à la livraison, avec un focus sur la compatibilité ligne et la stabilité transport.
```

### [text] `deepBody` — sector-fr-logistiek (sector [fr])

**Was:**
```
[AI-translated] Des housses rétractables aux topsheets : Hobon fournit du film PE adapté à vos formats de palette, cadence de ligne et transport — avec conseil technique avant commande.
```

**Wordt:**
```
[AI-translated] Des housses rétractables aux topsheets : Hobon fournit du film PE adapté à vos formats de palette, cadence de ligne et transport, avec conseil technique avant commande.
```

### [text] `deepFaqs[1].body` — sector-fr-logistiek (sector [fr])

**Was:**
```
[AI-translated] Oui — souvent les clients économisent jusqu'à 15 % sur les stocks grâce à la rationalisation des films. Nous analysons vos lignes existantes et proposons une standardisation là où c'est pertinent.
```

**Wordt:**
```
[AI-translated] Oui, souvent les clients économisent jusqu'à 15 % sur les stocks grâce à la rationalisation des films. Nous analysons vos lignes existantes et proposons une standardisation là où c'est pertinent.
```

### [text] `deepFaqs[3].body` — sector-fr-logistiek (sector [fr])

**Was:**
```
[AI-translated] Oui — impression flexo jusqu'à 6 couleurs, pour le branding ou l'identification.
```

**Wordt:**
```
[AI-translated] Oui, impression flexo jusqu'à 6 couleurs, pour le branding ou l'identification.
```

### [text] `listingDescription` — sector-fr-logistiek (sector [fr])

**Was:**
```
Housses rétractables, film pour automates, topsheets et film de regroupement pour la logistique — film PE qui maintient votre ligne automatisée en marche.
```

**Wordt:**
```
Housses rétractables, film pour automates, topsheets et film de regroupement pour la logistique. Film PE qui maintient votre ligne automatisée en marche.
```

### [text] `problemBand[2].description` — sector-fr-logistiek (sector [fr])

**Was:**
```
[AI-translated] Différentes lignes, différents formats — la gestion des stocks de film devient complexe et coûteuse.
```

**Wordt:**
```
[AI-translated] Différentes lignes, différents formats, la gestion des stocks de film devient complexe et coûteuse.
```

### [text] `solutionCards[3].description` — sector-fr-logistiek (sector [fr])

**Was:**
```
[AI-translated] Film qui emballe plusieurs unités ensemble — efficace pour la distribution.
```

**Wordt:**
```
[AI-translated] Film qui emballe plusieurs unités ensemble, efficace pour la distribution.
```

### [text] `caseStudies[0].image.alt` — sector-fr-voeding (sector [fr])

**Was:**
```
[AI-translated] Ligne FFS 65 mètres/minute — rupture après changement de fournisseur
```

**Wordt:**
```
[AI-translated] Ligne FFS 65 mètres/minute, rupture après changement de fournisseur
```

### [text] `caseStudies[0].title` — sector-fr-voeding (sector [fr])

**Was:**
```
[AI-translated] Ligne FFS 65 mètres/minute — rupture après changement de fournisseur
```

**Wordt:**
```
[AI-translated] Ligne FFS 65 mètres/minute, rupture après changement de fournisseur
```

### [text] `complianceIntro` — sector-fr-voeding (sector [fr])

**Was:**
```
<strong>Niveau de certification alimentaire le plus élevé</strong>BRC Packaging Level AA — vérifié à chaque stade de production.
```

**Wordt:**
```
<strong>Niveau de certification alimentaire le plus élevé</strong>BRC Packaging Level AA. Vérifié à chaque stade de production.
```

### [text] `complianceItems[0].title` — sector-fr-voeding (sector [fr])

**Was:**
```
[AI-translated] BRC Packaging Level AA — niveau le plus élevé
```

**Wordt:**
```
[AI-translated] BRC Packaging Level AA, niveau le plus élevé
```

### [text] `deepFaqs[3].title` — sector-fr-voeding (sector [fr])

**Was:**
```
[AI-translated] Mon fournisseur ne livre plus — alternative urgente
```

**Wordt:**
```
[AI-translated] Mon fournisseur ne livre plus, alternative urgente
```

### [text] `deepPhoto.alt` — sector-fr-voeding (sector [fr])

**Was:**
```
Contrôle qualité à chaque étape — en interne à Lievegem
```

**Wordt:**
```
Contrôle qualité à chaque étape, en interne à Lievegem
```

### [text] `deepPhotoCaption` — sector-fr-voeding (sector [fr])

**Was:**
```
Contrôle qualité à chaque étape — en interne à Lievegem
```

**Wordt:**
```
Contrôle qualité à chaque étape, en interne à Lievegem
```

### [text] `heroIntro` — sector-fr-voeding (sector [fr])

**Was:**
```
Dans l'industrie alimentaire, il n'y a aucune marge d'erreur dans le choix des matériaux. <strong>Certifié BRC AA</strong>, totalement sûr pour le contact alimentaire, adapté à votre machine et à votre vitesse de ligne. Nous posons d'abord les bonnes questions — puis nous proposons le bon film.
```

**Wordt:**
```
Dans l'industrie alimentaire, il n'y a aucune marge d'erreur dans le choix des matériaux. <strong>Certifié BRC AA</strong>, totalement sûr pour le contact alimentaire, adapté à votre machine et à votre vitesse de ligne. Nous posons d'abord les bonnes questions, puis nous proposons le bon film.
```

### [text] `problemBand[2].title` — sector-fr-voeding (sector [fr])

**Was:**
```
[AI-translated] Conseil technique avant achat — pas de choix sur catalogue
```

**Wordt:**
```
[AI-translated] Conseil technique avant achat, pas de choix sur catalogue
```

### [text] `complianceIntro` — sector-nl-agro (sector [nl])

**Was:**
```
<strong>Robuuste agro-verpakkingen</strong> — zakken en folies ontworpen rond uw product, opslag en afvulsnelheid.
```

**Wordt:**
```
<strong>Robuuste agro-verpakkingen</strong>. Zakken en folies ontworpen rond uw product, opslag en afvulsnelheid.
```

### [text] `complianceItems[0].description` — sector-nl-agro (sector [nl])

**Was:**
```
Hoeklas, bloklas, paperlike en kratzakken — matching met uw lijn.
```

**Wordt:**
```
Hoeklas, bloklas, paperlike en kratzakken, matching met uw lijn.
```

### [text] `deepFaqs[1].body` — sector-nl-agro (sector [nl])

**Was:**
```
Ja — verstevigde PE in 3-laags of 5-laags voor producten tot 50kg. Op aanvraag groter.
```

**Wordt:**
```
Ja, verstevigde PE in 3-laags of 5-laags voor producten tot 50kg. Op aanvraag groter.
```

### [text] `deepFaqs[2].body` — sector-nl-agro (sector [nl])

**Was:**
```
Ja — kratzakken zijn een specifiek niche-product van Hobon.
```

**Wordt:**
```
Ja, kratzakken zijn een specifiek niche-product van Hobon.
```

### [text] `deepPhoto.alt` — sector-nl-agro (sector [nl])

**Was:**
```
Hoeklas, bloklas of kratzakken — afgestemd op uw installatie.
```

**Wordt:**
```
Hoeklas, bloklas of kratzakken, afgestemd op uw installatie.
```

### [text] `deepPhotoCaption` — sector-nl-agro (sector [nl])

**Was:**
```
Hoeklas, bloklas of kratzakken — afgestemd op uw installatie.
```

**Wordt:**
```
Hoeklas, bloklas of kratzakken, afgestemd op uw installatie.
```

### [text] `heroIntro` — sector-nl-agro (sector [nl])

**Was:**
```
Robuuste zakken en folies voor veevoeder, meststoffen, poeders en granen — op maat van uw afvulinstallatie.
```

**Wordt:**
```
Robuuste zakken en folies voor veevoeder, meststoffen, poeders en granen, op maat van uw afvulinstallatie.
```

### [text] `listingDescription` — sector-nl-agro (sector [nl])

**Was:**
```
Zakken en folie voor veevoeder, meststoffen en bulk — hoeklas, bloklas, kratzakken en UV-bestendige uitvoeringen.
```

**Wordt:**
```
Zakken en folie voor veevoeder, meststoffen en bulk, hoeklas, bloklas, kratzakken en UV-bestendige uitvoeringen.
```

### [text] `problemBand[2].description` — sector-nl-agro (sector [nl])

**Was:**
```
Hoeklas, bloklas, paperlike — elke installatie vraagt zijn eigen zaktype. Verkeerde keuze = lijn niet draaiend.
```

**Wordt:**
```
Hoeklas, bloklas, paperlike, elke installatie vraagt zijn eigen zaktype. Verkeerde keuze = lijn niet draaiend.
```

### [text] `solutionCards[0].description` — sector-nl-agro (sector [nl])

**Was:**
```
Hoeklas, bloklas, paperlike of kratzakken — afgestemd op uw bestaande lijn.
```

**Wordt:**
```
Hoeklas, bloklas, paperlike of kratzakken, afgestemd op uw bestaande lijn.
```

### [text] `solutionCards[2].description` — sector-nl-agro (sector [nl])

**Was:**
```
Productnaam, samenstelling en logo direct op de zak — flexodruk tot 6 kleuren.
```

**Wordt:**
```
Productnaam, samenstelling en logo direct op de zak, flexodruk tot 6 kleuren.
```

### [text] `complianceIntro` — sector-nl-chemie (sector [nl])

**Was:**
```
<strong>Industriële PE-folie</strong> — REACH-conforme materialen en technische ondersteuning voor chemie- en machinepark-specs.
```

**Wordt:**
```
<strong>Industriële PE-folie</strong>. REACH-conforme materialen en technische ondersteuning voor chemie- en machinepark-specs.
```

### [text] `deepFaqs[1].body` — sector-nl-chemie (sector [nl])

**Was:**
```
Ja — anti-statische PE-folie met de juiste oppervlakteweerstand. Specs op aanvraag.
```

**Wordt:**
```
Ja, anti-statische PE-folie met de juiste oppervlakteweerstand. Specs op aanvraag.
```

### [text] `deepFaqs[3].body` — sector-nl-chemie (sector [nl])

**Was:**
```
Minimum batches in functie van het product. Voor maatwerk werken we vanaf 1 ton — bel ons als u kleinere hoeveelheden zoekt.
```

**Wordt:**
```
Minimum batches in functie van het product. Voor maatwerk werken we vanaf 1 ton, bel ons als u kleinere hoeveelheden zoekt.
```

### [text] `heroIntro` — sector-nl-chemie (sector [nl])

**Was:**
```
Anti-statisch, UV-bestendig, op maat bedrukt — PE-folie die voldoet aan de meest specifieke industriële vereisten.
```

**Wordt:**
```
Anti-statisch, UV-bestendig, op maat bedrukt. PE-folie die voldoet aan de meest specifieke industriële vereisten.
```

### [text] `problemBand[0].description` — sector-nl-chemie (sector [nl])

**Was:**
```
Bij gevoelige chemische producten of in ATEX-zones is anti-statische folie geen luxe — het is veiligheid.
```

**Wordt:**
```
Bij gevoelige chemische producten of in ATEX-zones is anti-statische folie geen luxe. Het is veiligheid.
```

### [text] `solutionCards[2].description` — sector-nl-chemie (sector [nl])

**Was:**
```
Productinformatie, lotnummers, branding — direct op de folie of zak.
```

**Wordt:**
```
Productinformatie, lotnummers, branding, direct op de folie of zak.
```

### [text] `complianceIntro` — sector-nl-logistiek (sector [nl])

**Was:**
```
<strong>PE-folie voor logistiek</strong> — vanaf advies tot levering, met focus op lijncompatibiliteit en transportstabiliteit.
```

**Wordt:**
```
<strong>PE-folie voor logistiek</strong>. Vanaf advies tot levering, met focus op lijncompatibiliteit en transportstabiliteit.
```

### [text] `deepBody` — sector-nl-logistiek (sector [nl])

**Was:**
```
Van krimphoezen tot topsheets: Hobon levert PE-folie afgestemd op uw palletformaten, lijnsnelheid en transport — met technisch advies vóór bestelling.
```

**Wordt:**
```
Van krimphoezen tot topsheets: Hobon levert PE-folie afgestemd op uw palletformaten, lijnsnelheid en transport, met technisch advies vóór bestelling.
```

### [text] `deepFaqs[1].body` — sector-nl-logistiek (sector [nl])

**Was:**
```
Ja — vaak besparen klanten tot 15% op voorraad door folie-rationalisatie. Wij analyseren uw bestaande lijnen en stellen standaardisatie voor waar zinvol.
```

**Wordt:**
```
Ja, vaak besparen klanten tot 15% op voorraad door folie-rationalisatie. Wij analyseren uw bestaande lijnen en stellen standaardisatie voor waar zinvol.
```

### [text] `deepFaqs[3].body` — sector-nl-logistiek (sector [nl])

**Was:**
```
Ja — flexodruk tot 6 kleuren, voor branding of identificatie.
```

**Wordt:**
```
Ja, flexodruk tot 6 kleuren, voor branding of identificatie.
```

### [text] `listingDescription` — sector-nl-logistiek (sector [nl])

**Was:**
```
Krimphoezen, automatenfolie, topsheets en bundelfolie voor logistiek — PE-folie die uw geautomatiseerde lijn draaiende houdt.
```

**Wordt:**
```
Krimphoezen, automatenfolie, topsheets en bundelfolie voor logistiek. PE-folie die uw geautomatiseerde lijn draaiende houdt.
```

### [text] `problemBand[2].description` — sector-nl-logistiek (sector [nl])

**Was:**
```
Verschillende lijnen, verschillende formaten — beheer van folie-voorraad wordt complex en duur.
```

**Wordt:**
```
Verschillende lijnen, verschillende formaten, beheer van folie-voorraad wordt complex en duur.
```

### [text] `solutionCards[3].description` — sector-nl-logistiek (sector [nl])

**Was:**
```
Folie die meerdere units samen verpakt — efficiënt voor distributie.
```

**Wordt:**
```
Folie die meerdere units samen verpakt, efficiënt voor distributie.
```

### [text] `caseStudies[0].image.alt` — sector-nl-voeding (sector [nl])

**Was:**
```
FFS-lijn 65 meter/minuut — breuk na overschakeling leverancier
```

**Wordt:**
```
FFS-lijn 65 meter/minuut, breuk na overschakeling leverancier
```

### [text] `caseStudies[0].title` — sector-nl-voeding (sector [nl])

**Was:**
```
FFS-lijn 65 meter/minuut — breuk na overschakeling leverancier
```

**Wordt:**
```
FFS-lijn 65 meter/minuut, breuk na overschakeling leverancier
```

### [text] `complianceIntro` — sector-nl-voeding (sector [nl])

**Was:**
```
<strong>Hoogste food-certificeringsniveau</strong>BRC Packaging Level AA — geverifieerd in elk productiestadium.
```

**Wordt:**
```
<strong>Hoogste food-certificeringsniveau</strong>BRC Packaging Level AA. Geverifieerd in elk productiestadium.
```

### [text] `complianceItems[0].title` — sector-nl-voeding (sector [nl])

**Was:**
```
BRC Packaging Level AA — hoogste niveau
```

**Wordt:**
```
BRC Packaging Level AA, hoogste niveau
```

### [text] `deepFaqs[3].title` — sector-nl-voeding (sector [nl])

**Was:**
```
Mijn leverancier levert niet langer — dringend alternatief
```

**Wordt:**
```
Mijn leverancier levert niet langer, dringend alternatief
```

### [text] `deepPhoto.alt` — sector-nl-voeding (sector [nl])

**Was:**
```
Kwaliteitscontrole in elk stadium — inhouse in Lievegem
```

**Wordt:**
```
Kwaliteitscontrole in elk stadium, inhouse in Lievegem
```

### [text] `deepPhotoCaption` — sector-nl-voeding (sector [nl])

**Was:**
```
Kwaliteitscontrole in elk stadium — inhouse in Lievegem
```

**Wordt:**
```
Kwaliteitscontrole in elk stadium, inhouse in Lievegem
```

### [text] `heroIntro` — sector-nl-voeding (sector [nl])

**Was:**
```
In de voedingsindustrie is er geen ruimte voor foutieve materiaalkeuze. <strong>BRC AA gecertificeerd</strong>, volledig voedselveilig, afgestemd op uw machine en lijnsnelheid. Wij stellen eerst de juiste vragen — dan pas de juiste folie.
```

**Wordt:**
```
In de voedingsindustrie is er geen ruimte voor foutieve materiaalkeuze. <strong>BRC AA gecertificeerd</strong>, volledig voedselveilig, afgestemd op uw machine en lijnsnelheid. Wij stellen eerst de juiste vragen, dan pas de juiste folie.
```

### [text] `problemBand[2].title` — sector-nl-voeding (sector [nl])

**Was:**
```
Technisch advies vóór aankoop — geen catalogusvraag
```

**Wordt:**
```
Technisch advies vóór aankoop, geen catalogusvraag
```

### [text] `heroIntro` — sectorOverviewPage-nl (sectorOverviewPage [nl])

**Was:**
```
Bekijk per sector welke PE-folies en zakken Hobon aanbiedt voor voeding, logistiek, chemie en agro. Oplossingen op maat van uw machine, lijnsnelheid en compliance — technisch onderbouwd, BRC AA waar vereist. De juiste folie voorkomt problemen op uw lijn.
```

**Wordt:**
```
Bekijk per sector welke PE-folies en zakken Hobon aanbiedt voor voeding, logistiek, chemie en agro. Oplossingen op maat van uw machine, lijnsnelheid en compliance, technisch onderbouwd, BRC AA waar vereist. De juiste folie voorkomt problemen op uw lijn.
```

### [text] `intro` — sectorOverviewPage-nl (sectorOverviewPage [nl])

**Was:**
```
Bekijk per sector welke PE-folies en zakken Hobon aanbiedt voor voeding, logistiek, chemie en agro. Oplossingen op maat van uw machine, lijnsnelheid en compliance — technisch onderbouwd, BRC AA waar vereist. De juiste folie voorkomt problemen op uw lijn.
```

**Wordt:**
```
Bekijk per sector welke PE-folies en zakken Hobon aanbiedt voor voeding, logistiek, chemie en agro. Oplossingen op maat van uw machine, lijnsnelheid en compliance, technisch onderbouwd, BRC AA waar vereist. De juiste folie voorkomt problemen op uw lijn.
```

### [text] `practicePoints[0].body[0].children[0].text` — sustainabilityPage-nl (sustainabilityPage [nl])

**Was:**
```
Advies op maat per toepassing en sector — geen dogma's, wel technische realiteit.
```

**Wordt:**
```
Advies op maat per toepassing en sector, geen dogma's, wel technische realiteit.
```

### [text] `standpoint.body[1].children[0].text` — sustainabilityPage-nl (sustainabilityPage [nl])

**Was:**
```
We helpen klanten ESG-doelen te vertalen naar haalbare PE-specs — zonder stilstand of kwaliteitsverlies op de lijn.
```

**Wordt:**
```
We helpen klanten ESG-doelen te vertalen naar haalbare PE-specs, zonder stilstand of kwaliteitsverlies op de lijn.
```

### [text] `formSuccessMessage` — uiLabels-en (uiLabels [en])

**Was:**
```
[AI-translated] Thank you — we will contact you as soon as possible.
```

**Wordt:**
```
[AI-translated] Thank you, we will contact you as soon as possible.
```

### [text] `uiContactMapPlaceholder` — uiLabels-en (uiLabels [en])

**Was:**
```
[AI-translated] Map — later
```

**Wordt:**
```
[AI-translated] Map, later
```

### [text] `formSuccessMessage` — uiLabels-fr (uiLabels [fr])

**Was:**
```
[AI-translated] Merci — nous vous contacterons dans les plus brefs délais.
```

**Wordt:**
```
[AI-translated] Merci, nous vous contacterons dans les plus brefs délais.
```

### [text] `uiContactMapPlaceholder` — uiLabels-fr (uiLabels [fr])

**Was:**
```
[AI-translated] Carte — plus tard
```

**Wordt:**
```
[AI-translated] Carte, plus tard
```

### [text] `formSuccessMessage` — uiLabels-nl (uiLabels [nl])

**Was:**
```
Bedankt — we nemen zo snel mogelijk contact met u op.
```

**Wordt:**
```
Bedankt, we nemen zo snel mogelijk contact met u op.
```

### [text] `uiContactMapPlaceholder` — uiLabels-nl (uiLabels [nl])

**Was:**
```
Kaart — later
```

**Wordt:**
```
Kaart, later
```

### [text] `seed.ts ~L166` — seed.ts (seed)

**Was:**
```
[FR: Aperçu des produits (NL détail — contenu FR à venir)]
```

**Wordt:**
```
[FR: Aperçu des produits (NL détail, contenu FR à venir)]
```

### [text] `seed.ts ~L173` — seed.ts (seed)

**Was:**
```
[FR: Aperçu des secteurs (NL détail — contenu FR à venir)]
```

**Wordt:**
```
[FR: Aperçu des secteurs (NL détail, contenu FR à venir)]
```

### [text] `seed.ts ~L198` — seed.ts (seed)

**Was:**
```
[EN: Products overview (NL detail — EN content TODO)]
```

**Wordt:**
```
[EN: Products overview (NL detail. EN content TODO)]
```

### [text] `seed.ts ~L205` — seed.ts (seed)

**Was:**
```
[EN: Sectors overview (NL detail — EN content TODO)]
```

**Wordt:**
```
[EN: Sectors overview (NL detail. EN content TODO)]
```

### [text] `seed.ts ~L249` — seed.ts (seed)

**Was:**
```
Hobon — uw technische partner voor verpakkingsfolie op maat.
```

**Wordt:**
```
Hobon, uw technische partner voor verpakkingsfolie op maat.
```

### [text] `seed.ts ~L287` — seed.ts (seed)

**Was:**
```
[FR: Hobon — votre partenaire technique pour films d'emballage sur mesure.]
```

**Wordt:**
```
[FR: Hobon, votre partenaire technique pour films d'emballage sur mesure.]
```

### [text] `seed.ts ~L417` — seed.ts (seed)

**Was:**
```
Hobon helpt u <strong>de juiste verpakkingsfolie kiezen</strong> voor uw machine, uw lijn en uw duurzaamheidsdoelstellingen — vóór u bestelt. Geen catalogusproduct. <strong>Technisch advies op maat</strong>, van extrusie tot bedrukking in 6&nbsp;kleuren.
```

**Wordt:**
```
Hobon helpt u <strong>de juiste verpakkingsfolie kiezen</strong> voor uw machine, uw lijn en uw duurzaamheidsdoelstellingen, vóór u bestelt. Geen catalogusproduct. <strong>Technisch advies op maat</strong>, van extrusie tot bedrukking in 6&nbsp;kleuren.
```

### [text] `seed.ts ~L446` — seed.ts (seed)

**Was:**
```
Uw verpakkingsvraag is geen cataloguskeuze. De juiste folie hangt af van uw machine, uw lijnsnelheid, uw product en uw compliance-vereisten. <strong>Verkeerde keuzes kosten u meer dan u denkt</strong> — breuk op de lijn, auditproblemen, stilstand.
```

**Wordt:**
```
Uw verpakkingsvraag is geen cataloguskeuze. De juiste folie hangt af van uw machine, uw lijnsnelheid, uw product en uw compliance-vereisten. <strong>Verkeerde keuzes kosten u meer dan u denkt</strong>. Breuk op de lijn, auditproblemen, stilstand.
```

### [text] `seed.ts ~L448` — seed.ts (seed)

**Was:**
```
Van extrusie tot bedrukking in 6 kleuren — alles inhouse in Lievegem.
```

**Wordt:**
```
Van extrusie tot bedrukking in 6 kleuren, alles inhouse in Lievegem.
```

### [text] `seed.ts ~L455` — seed.ts (seed)

**Was:**
```
Wij helpen u de juiste specificaties bepalen vóór u bestelt — recyclaat of virgin, dunner of verstevigd, voeding of industrie.
```

**Wordt:**
```
Wij helpen u de juiste specificaties bepalen vóór u bestelt, recyclaat of virgin, dunner of verstevigd, voeding of industrie.
```

### [text] `seed.ts ~L463` — seed.ts (seed)

**Was:**
```
Recyclaat-oplossingen technisch en economisch haalbaar maken — zonder concessies aan lijnsnelheid of voedselveiligheid.
```

**Wordt:**
```
Recyclaat-oplossingen technisch en economisch haalbaar maken, zonder concessies aan lijnsnelheid of voedselveiligheid.
```

### [text] `seed.ts ~L481` — seed.ts (seed)

**Was:**
```
Virgin of recyclaat, welke PE-samenstelling, welke dikte — afgestemd op uw lijneisen én uw duurzaamheidsdoelstellingen. Technisch onderbouwd.
```

**Wordt:**
```
Virgin of recyclaat, welke PE-samenstelling, welke dikte, afgestemd op uw lijneisen én uw duurzaamheidsdoelstellingen. Technisch onderbouwd.
```

### [text] `seed.ts ~L487` — seed.ts (seed)

**Was:**
```
Extrusie, voorbehandeling, inkleuren, bedrukken en verwerking tot zakken en vellen — alles inhouse in Lievegem. Kwaliteitscontrole in elk stadium.
```

**Wordt:**
```
Extrusie, voorbehandeling, inkleuren, bedrukken en verwerking tot zakken en vellen, alles inhouse in Lievegem. Kwaliteitscontrole in elk stadium.
```

### [text] `seed.ts ~L504` — seed.ts (seed)

**Was:**
```
Één van de weinige Belgische producenten met diepgaande expertise in DOLAV-zakken. Stuifbestendigheid, lassterkte en weerstand tegen mechanische belasting bepalen de materiaalkeuze — een verkeerde samenstelling leidt tot breuk of productverlies op de lijn.
```

**Wordt:**
```
Één van de weinige Belgische producenten met diepgaande expertise in DOLAV-zakken. Stuifbestendigheid, lassterkte en weerstand tegen mechanische belasting bepalen de materiaalkeuze. Een verkeerde samenstelling leidt tot breuk of productverlies op de lijn.
```

### [text] `seed.ts ~L524` — seed.ts (seed)

**Was:**
```
Hobon bouwt het stretchfolieaanbod verder uit — van machinale stretchfolie tot handwikkelfolie, in diverse samenstellingen voor palletstabiliteit en bescherming.
```

**Wordt:**
```
Hobon bouwt het stretchfolieaanbod verder uit, van machinale stretchfolie tot handwikkelfolie, in diverse samenstellingen voor palletstabiliteit en bescherming.
```

### [text] `seed.ts ~L543` — seed.ts (seed)

**Was:**
```
<strong>Hoogste certificeringsniveau</strong>BRC Packaging Level AA — geverifieerd in elk productiestadium. Virgin materialen voor food-verpakkingen.
```

**Wordt:**
```
<strong>Hoogste certificeringsniveau</strong>BRC Packaging Level AA. Geverifieerd in elk productiestadium. Virgin materialen voor food-verpakkingen.
```

### [text] `seed.ts ~L549` — seed.ts (seed)

**Was:**
```
Van extrusie over voorbehandeling tot bedrukking — inhouse in Lievegem, niet uitbesteed.
```

**Wordt:**
```
Van extrusie over voorbehandeling tot bedrukking, inhouse in Lievegem, niet uitbesteed.
```

### [text] `seed.ts ~L568` — seed.ts (seed)

**Was:**
```
Heeft u een specifieke toepassing, machine of uitdaging? <strong>Leg het ons voor.</strong> Wij analyseren uw situatie en geven technisch advies — zonder verplichtingen. Gemiddelde reactietijd: 1 werkdag.
```

**Wordt:**
```
Heeft u een specifieke toepassing, machine of uitdaging? <strong>Leg het ons voor.</strong> Wij analyseren uw situatie en geven technisch advies, zonder verplichtingen. Gemiddelde reactietijd: 1 werkdag.
```

### [text] `seed.ts ~L643` — seed.ts (seed)

**Was:**
```
Hobon groeide uit een familiale onderneming met focus op productie én technische ondersteuning. [TODO: Frederik review — exact oprichtingsverhaal en cultuur aanvullen.]
```

**Wordt:**
```
Hobon groeide uit een familiale onderneming met focus op productie én technische ondersteuning. [TODO: Frederik review, exact oprichtingsverhaal en cultuur aanvullen.]
```

### [text] `seed.ts ~L651` — seed.ts (seed)

**Was:**
```
Wij geloven dat de juiste foliekeuze begint vóór de bestelling: machine, lijn, product en compliance samen bekijken — geen catalogusantwoord.
```

**Wordt:**
```
Wij geloven dat de juiste foliekeuze begint vóór de bestelling: machine, lijn, product en compliance samen bekijken, geen catalogusantwoord.
```

### [text] `seed.ts ~L667` — seed.ts (seed)

**Was:**
```
Advies, extrusie, bedrukking en kwaliteitscontrole onder één dak — minder interfaces, meer grip op uw lijnresultaat.
```

**Wordt:**
```
Advies, extrusie, bedrukking en kwaliteitscontrole onder één dak, minder interfaces, meer grip op uw lijnresultaat.
```

### [text] `seed.ts ~L710` — seed.ts (seed)

**Was:**
```
Ons team combineert sales engineers met productie-expertise — u spreekt met mensen die uw folie ook daadwerkelijk produceren. [TODO: Frederik review — teamcopy verfijnen.]
```

**Wordt:**
```
Ons team combineert sales engineers met productie-expertise. U spreekt met mensen die uw folie ook daadwerkelijk produceren. [TODO: Frederik review, teamcopy verfijnen.]
```

### [text] `seed.ts ~L774` — seed.ts (seed)

**Was:**
```
We helpen klanten ESG-doelen te vertalen naar haalbare PE-specs — zonder stilstand of kwaliteitsverlies op de lijn.
```

**Wordt:**
```
We helpen klanten ESG-doelen te vertalen naar haalbare PE-specs, zonder stilstand of kwaliteitsverlies op de lijn.
```

### [text] `seed.ts ~L784` — seed.ts (seed)

**Was:**
```
Advies op maat per toepassing en sector — geen dogma's, wel technische realiteit.
```

**Wordt:**
```
Advies op maat per toepassing en sector, geen dogma's, wel technische realiteit.
```

### [text] `seed.ts ~L848` — seed.ts (seed)

**Was:**
```
Onze specialisten denken graag met u mee — zonder verplichting
```

**Wordt:**
```
Onze specialisten denken graag met u mee, zonder verplichting
```

### [text] `seed.ts ~L864` — seed.ts (seed)

**Was:**
```
Liever telefonisch? Bel Hobon of VHP — de nummers vindt u rechts bij de locaties.
```

**Wordt:**
```
Liever telefonisch? Bel Hobon of VHP, de nummers vindt u rechts bij de locaties.
```

### [text] `seed.ts ~L917` — seed.ts (seed)

**Was:**
```
[TODO: Copy Brief sectie 06 — productoverzicht intro]
```

**Wordt:**
```
[TODO: Copy Brief sectie 06, productoverzicht intro]
```

### [text] `seed.ts ~L962` — seed.ts (seed)

**Was:**
```
[TODO: Copy Brief sectie 07 — sectorenoverzicht intro]
```

**Wordt:**
```
[TODO: Copy Brief sectie 07, sectorenoverzicht intro]
```

### [text] `seed.ts ~L1051` — seed.ts (seed)

**Was:**
```
In de voedingsindustrie is er geen ruimte voor foutieve materiaalkeuze. <strong>BRC AA gecertificeerd</strong>, volledig voedselveilig, afgestemd op uw machine en lijnsnelheid. Wij stellen eerst de juiste vragen — dan pas de juiste folie.
```

**Wordt:**
```
In de voedingsindustrie is er geen ruimte voor foutieve materiaalkeuze. <strong>BRC AA gecertificeerd</strong>, volledig voedselveilig, afgestemd op uw machine en lijnsnelheid. Wij stellen eerst de juiste vragen, dan pas de juiste folie.
```

### [text] `seed.ts ~L1098` — seed.ts (seed)

**Was:**
```
Technisch advies vóór aankoop — geen catalogusvraag
```

**Wordt:**
```
Technisch advies vóór aankoop, geen catalogusvraag
```

### [text] `seed.ts ~L1196` — seed.ts (seed)

**Was:**
```
Kwaliteitscontrole in elk stadium — inhouse in Lievegem
```

**Wordt:**
```
Kwaliteitscontrole in elk stadium, inhouse in Lievegem
```

### [text] `seed.ts ~L1219` — seed.ts (seed)

**Was:**
```
Mijn leverancier levert niet langer — dringend alternatief
```

**Wordt:**
```
Mijn leverancier levert niet langer, dringend alternatief
```

### [text] `seed.ts ~L1232` — seed.ts (seed)

**Was:**
```
<strong>Hoogste food-certificeringsniveau</strong>BRC Packaging Level AA — geverifieerd in elk productiestadium.
```

**Wordt:**
```
<strong>Hoogste food-certificeringsniveau</strong>BRC Packaging Level AA. Geverifieerd in elk productiestadium.
```

### [text] `seed.ts ~L1236` — seed.ts (seed)

**Was:**
```
BRC Packaging Level AA — hoogste niveau
```

**Wordt:**
```
BRC Packaging Level AA, hoogste niveau
```

### [text] `seed.ts ~L1263` — seed.ts (seed)

**Was:**
```
FFS-lijn 65 meter/minuut — breuk na overschakeling leverancier
```

**Wordt:**
```
FFS-lijn 65 meter/minuut, breuk na overschakeling leverancier
```

### [text] `seed.ts ~L1318` — seed.ts (seed)

**Was:**
```
[TODO: Copy Brief sectie 07 — logistiek sector samenvatting voor homepage-kaart]
```

**Wordt:**
```
[TODO: Copy Brief sectie 07, logistiek sector samenvatting voor homepage-kaart]
```

### [text] `seed.ts ~L1325` — seed.ts (seed)

**Was:**
```
[TODO: Copy Brief sectie 07 — volledige sectorcopy voor logistiek. Template volgt voeding-structuur.]
```

**Wordt:**
```
[TODO: Copy Brief sectie 07, volledige sectorcopy voor logistiek. Template volgt voeding-structuur.]
```

### [text] `seed.ts ~L1373` — seed.ts (seed)

**Was:**
```
[TODO: Copy Brief sectie 07 — chemie-industrie]
```

**Wordt:**
```
[TODO: Copy Brief sectie 07, chemie-industrie]
```

### [text] `seed.ts ~L1427` — seed.ts (seed)

**Was:**
```
[TODO: Copy Brief sectie 07 — agro-industrie]
```

**Wordt:**
```
[TODO: Copy Brief sectie 07, agro-industrie]
```

### [text] `seed.ts ~L1564` — seed.ts (seed)

**Was:**
```
BRC Packaging Level AA is het hoogste niveau binnen het Global Standard for Packaging Materials. Het betekent dat uw leverancier jaarlijks extern wordt geaudit op voedselveiligheid, traceerbaarheid en procesbeheersing — niet enkel op papier.
```

**Wordt:**
```
BRC Packaging Level AA is het hoogste niveau binnen het Global Standard for Packaging Materials. Het betekent dat uw leverancier jaarlijks extern wordt geaudit op voedselveiligheid, traceerbaarheid en procesbeheersing, niet enkel op papier.
```

### [text] `seed.ts ~L1579` — seed.ts (seed)

**Was:**
```
We leveren certificaten, specificatiebladen en batchdocumentatie klaar voor uw QA-team. Vraag ons naar het BRC-packaging dossier vóór uw audit — dan zijn er geen verrassingen op de lijn.
```

**Wordt:**
```
We leveren certificaten, specificatiebladen en batchdocumentatie klaar voor uw QA-team. Vraag ons naar het BRC-packaging dossier vóór uw audit, dan zijn er geen verrassingen op de lijn.
```

### [text] `seed.ts ~L1581` — seed.ts (seed)

**Was:**
```
Niet-conformiteit op folie is bijna altijd traceerbaar tot specificatie of batchdocumentatie — wij helpen die keten sluiten.
```

**Wordt:**
```
Niet-conformiteit op folie is bijna altijd traceerbaar tot specificatie of batchdocumentatie, wij helpen die keten sluiten.
```

### [text] `seed.ts ~L1588` — seed.ts (seed)

**Was:**
```
Recyclaat kan variëren in treksterkte, kleurstabiliteit en geur. Virgin PE is homogener — belangrijk wanneer uw retailer strikte sensorische limieten hanteert.
```

**Wordt:**
```
Recyclaat kan variëren in treksterkte, kleurstabiliteit en geur. Virgin PE is homogener, belangrijk wanneer uw retailer strikte sensorische limieten hanteert.
```

### [text] `seed.ts ~L1598` — seed.ts (seed)

**Was:**
```
Industriële zakken, secundaire verpakkingen of niet-hechtend food-contact — daar zien we recyclaat technisch en economisch renderen.
```

**Wordt:**
```
Industriële zakken, secundaire verpakkingen of niet-hechtend food-contact, daar zien we recyclaat technisch en economisch renderen.
```

### [text] `seed.ts ~L1611` — seed.ts (seed)

**Was:**
```
Een voedingsproducent schakelde naar goedkopere LDPE — binnen weken meldingen van geur in het eindproduct. Root cause: onvoldoende barrière en batchvariatie.
```

**Wordt:**
```
Een voedingsproducent schakelde naar goedkopere LDPE, binnen weken meldingen van geur in het eindproduct. Root cause: onvoldoende barrière en batchvariatie.
```

### [text] `seed.ts ~L1626` — seed.ts (seed)

**Was:**
```
Machineaudit, trek- en sealcurves, en batch-koppeling — we koppelen uw lijnparameters aan de folie-spec vóór productie.
```

**Wordt:**
```
Machineaudit, trek- en sealcurves, en batch-koppeling, we koppelen uw lijnparameters aan de folie-spec vóór productie.
```

### [text] `seed.ts ~L1639` — seed.ts (seed)

**Was:**
```
Multi-layer en additivering kunnen barrière en sterkte leveren bij lagere micron — minder PE per pallet.
```

**Wordt:**
```
Multi-layer en additivering kunnen barrière en sterkte leveren bij lagere micron, minder PE per pallet.
```

### [text] `seed.ts ~L1644` — seed.ts (seed)

**Was:**
```
Minder materiaal betekent minder extrusie-energie en transportgewicht — concrete CO₂-winst als de lijn het aankan.
```

**Wordt:**
```
Minder materiaal betekent minder extrusie-energie en transportgewicht, concrete CO₂-winst als de lijn het aankan.
```

### [text] `seed.ts ~L1649` — seed.ts (seed)

**Was:**
```
Klanten die van 80µm naar 50µm gingen zonder kwaliteitsverlies — na grondige lijntest en gecontroleerde trial-run.
```

**Wordt:**
```
Klanten die van 80µm naar 50µm gingen zonder kwaliteitsverlies, na grondige lijntest en gecontroleerde trial-run.
```

### [text] `seed.ts ~L1710` — seed.ts (seed)

**Was:**
```
Materiaalreductie is de meest onderschatte duurzaamheidswinst — als u de technische specs goed afstemt.
```

**Wordt:**
```
Materiaalreductie is de meest onderschatte duurzaamheidswinst, als u de technische specs goed afstemt.
```

---

**Sanity totaal:** 61 documenten, 224 velden.
**seed.ts:** 55 strings.
**META:** 20 · **TEXT:** 259

## Multi-dash strings (2 velden met 2+ spaced dash)

✅ Alle multi-dash strings correct verwerkt.

### ✅ `seed.ts ~L407` — seed.ts (seed) · 2 dashes

**Was:**
```
Hobon — Verpakkingsfolie op maat — De juiste folie voorkomt problemen | BE & NL
```

**Wordt:**
```
Hobon - Verpakkingsfolie op maat - De juiste folie voorkomt problemen | BE & NL
```

### ✅ `seed.ts ~L710` — seed.ts (seed) · 2 dashes

**Was:**
```
Ons team combineert sales engineers met productie-expertise — u spreekt met mensen die uw folie ook daadwerkelijk produceren. [TODO: Frederik review — teamcopy verfijnen.]
```

**Wordt:**
```
Ons team combineert sales engineers met productie-expertise. U spreekt met mensen die uw folie ook daadwerkelijk produceren. [TODO: Frederik review, teamcopy verfijnen.]
```
