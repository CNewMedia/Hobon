export type UILabelOption = {
  value: string;
  label: string;
};

export type UILabels = {
  productAllProducts: string;
  productHighestCertLevel: string;
  productTechnical: string;
  productSpecifications: string;
  productApplications: string;
  productApplicationsQuestion: string;
  productExpertise: string;
  productSectors: string;
  productCommonlyUsedIn: string;
  productContact: string;
  productExtra: string;
  productNotes: string;
  productSolutionsTag: string;
  productSolutionsTitle: string;
  productGalleryTag: string;
  productGalleryTitle: string;
  productFaqTitle: string;

  sectorHighestCertLevel: string;
  sectorYearsExpertise: string;
  sectorMaterialsForFood: string;
  sectorScroll: string;
  sectorCommonChallenges: string;
  sectorComplianceGuarantees: string;
  sectorApplicationsInPractice: string;
  sectorTypicalChallenges: string;
  sectorOtherSectors: string;
  sectorAlsoActiveIn: string;

  listingSectorFallback: string;
  listingProductFallback: string;
  listingReadMore: string;
  listingContact: string;

  homeScroll: string;
  homeSectorFallback: string;
  homeDragSectors: string;

  aboutKeyFactsTitle: string;

  insightsListTitle: string;
  insightsListSubtitle: string;
  insightsCtaTitle: string;
  insightsCtaBody: string;
  insightsCtaButton: string;
  insightsEmpty: string;
  insightsCtaParagraph: string;
  insightsBackToList: string;
  insightsReadingTime: string;
  insightsRelatedTitle: string;
  insightsAllLink: string;

  uiOpenMenu: string;
  uiBrcLevelLabel: string;
  uiContactMailSubject: string;
  uiContactMapPlaceholder: string;

  formFieldNameLabel: string;
  formFieldFirstnameLabel: string;
  formFieldLastnameLabel: string;
  formFieldCompanyLabel: string;
  formFieldEmailLabel: string;
  formFieldPhoneLabel: string;
  formFieldSectorLabel: string;
  formFieldMessageLabel: string;
  formFieldChallengeLabel: string;
  formChallengePlaceholder: string;
  formPlaceholderName: string;
  formPlaceholderCompany: string;
  formPlaceholderEmail: string;
  formIntentLabel: string;
  formIntentPlaceholder: string;
  formIntentOptions: UILabelOption[];
  formSectorOptions: UILabelOption[];
  formSubmitLabel: string;
  formDisclaimerText: string;
  formPrivacyLinkLabel: string;
  formSuccessMessage: string;
  formContactSuccessMessage: string;
  formSuccessKicker: string;
  formAskAgain: string;
  formErrorInvalidJson: string;
  formErrorRateLimit: string;
  formErrorSendFailed: string;
  formErrorInvalidRequest: string;
  formErrorInvalidEmail: string;
  formErrorRequiredFirstname: string;
  formErrorRequiredLastname: string;
  formErrorRequiredSector: string;
  formErrorRequiredMessage: string;
  formErrorRequiredName: string;
  formErrorRequiredCompany: string;
};

export const defaultUILabels: UILabels = {
  productAllProducts: "Alle producten",
  productHighestCertLevel: "Hoogste certificeringsniveau",
  productTechnical: "Technisch",
  productSpecifications: "Specificaties",
  productApplications: "Toepassingen",
  productApplicationsQuestion: "Waar gebruikt u het voor?",
  productExpertise: "Expertise",
  productSectors: "Sectoren",
  productCommonlyUsedIn: "Veel gebruikt in",
  productContact: "Contact",
  productExtra: "Extra",
  productNotes: "Notities",
  productSolutionsTag: "Varianten",
  productSolutionsTitle: "Folie op maat",
  productGalleryTag: "Beelden",
  productGalleryTitle: "In de praktijk",
  productFaqTitle: "Veelgestelde vragen",

  sectorHighestCertLevel: "Hoogste certificeringsniveau",
  sectorYearsExpertise: "Jaar food-expertise",
  sectorMaterialsForFood: "Materialen voor voeding",
  sectorScroll: "Scroll",
  sectorCommonChallenges: "Veelgestelde uitdagingen",
  sectorComplianceGuarantees: "Compliance garanties",
  sectorApplicationsInPractice: "Toepassingen in de praktijk",
  sectorTypicalChallenges: "Typische uitdagingen die wij oplossen",
  sectorOtherSectors: "Andere sectoren",
  sectorAlsoActiveIn: "Ook actief in",

  listingSectorFallback: "Sector",
  listingProductFallback: "Product",
  listingReadMore: "Lees meer",
  listingContact: "Contact",

  homeScroll: "Scroll",
  homeSectorFallback: "Sector",
  homeDragSectors: "Versleep om meer sectoren te bekijken",

  aboutKeyFactsTitle: "Kerncijfers",

  insightsListTitle: "Artikels",
  insightsListSubtitle: "Praktische inzichten voor uw verpakkingslijn.",
  insightsCtaTitle: "Vraag over folie of lijn?",
  insightsCtaBody: "We denken technisch mee.",
  insightsCtaButton: "Naar contact",
  insightsEmpty: "Nog geen artikels in deze taal.",
  insightsCtaParagraph: "Neem contact op voor advies op maat, zonder verplichting.",
  insightsBackToList: "Terug naar insights",
  insightsReadingTime: "{n} min leestijd",
  insightsRelatedTitle: "Gerelateerde artikels",
  insightsAllLink: "Alle insights",

  uiOpenMenu: "Menu openen",
  uiBrcLevelLabel: "BRC Packaging Level AA",
  uiContactMailSubject: "Verpakkingsvraag via hobon.be",
  uiContactMapPlaceholder: "Kaart — later",

  formFieldNameLabel: "Naam *",
  formFieldFirstnameLabel: "Voornaam",
  formFieldLastnameLabel: "Naam",
  formFieldCompanyLabel: "Bedrijf *",
  formFieldEmailLabel: "E-mail *",
  formFieldPhoneLabel: "Telefoon",
  formFieldSectorLabel: "Sector",
  formFieldMessageLabel: "Bericht",
  formFieldChallengeLabel: "Uw uitdaging of machine",
  formChallengePlaceholder:
    "Beschrijf uw machine, lijnsnelheid, product of probleem. Hoe meer detail, hoe sneller en gerichter ons advies.",
  formPlaceholderName: "Jan Janssen",
  formPlaceholderCompany: "Uw bedrijfsnaam",
  formPlaceholderEmail: "jan@bedrijf.be",
  formIntentLabel: "Ik zoek...",
  formIntentPlaceholder: "Kies een optie",
  formIntentOptions: [
    { value: "technical-food-advies", label: "Technisch advies food-folie" },
    { value: "brc-alternative", label: "BRC-gecertificeerd alternatief" },
    { value: "line-break-solution", label: "Oplossing voor lijnbreuk" },
    { value: "recyclate-food-solution", label: "Recyclaat-oplossing food" },
    { value: "request-quote", label: "Offerte aanvragen" },
    { value: "other-question", label: "Andere vraag" },
  ],
  formSectorOptions: [
    { value: "voeding", label: "Voeding" },
    { value: "logistiek", label: "Logistiek" },
    { value: "chemie-industrie", label: "Chemie & industrie" },
    { value: "agro-industrie", label: "Agro-industrie" },
    { value: "andere", label: "Andere" },
  ],
  formSubmitLabel: "Vraag versturen",
  formDisclaimerText: "Uw gegevens worden uitsluitend gebruikt voor de behandeling van uw aanvraag.",
  formPrivacyLinkLabel: "Privacybeleid",
  formSuccessMessage: "Bedankt, we nemen zo snel mogelijk contact met u op.",
  formContactSuccessMessage:
    "Bedankt voor uw bericht. Een van onze specialisten neemt binnen 1 werkdag contact met u op.",
  formSuccessKicker: "Aanvraag ontvangen",
  formAskAgain: "Stel een nieuwe vraag",
  formErrorInvalidJson: "Ongeldige JSON.",
  formErrorRateLimit: "Te veel aanvragen. Probeer het over enkele minuten opnieuw.",
  formErrorSendFailed: "Verzenden mislukt. Probeer het later opnieuw of mail ons rechtstreeks.",
  formErrorInvalidRequest: "Ongeldige aanvraag.",
  formErrorInvalidEmail: "Voer een geldig e-mailadres in.",
  formErrorRequiredFirstname: "Voornaam is verplicht.",
  formErrorRequiredLastname: "Naam is verplicht.",
  formErrorRequiredSector: "Sector is verplicht.",
  formErrorRequiredMessage: "Bericht is verplicht.",
  formErrorRequiredName: "Naam is verplicht.",
  formErrorRequiredCompany: "Bedrijf is verplicht.",
};

export function mergeUILabels(input?: Partial<UILabels> | null): UILabels {
  return {
    ...defaultUILabels,
    ...(input ?? {}),
    formIntentOptions: input?.formIntentOptions?.length
      ? input.formIntentOptions
      : defaultUILabels.formIntentOptions,
    formSectorOptions: input?.formSectorOptions?.length
      ? input.formSectorOptions
      : defaultUILabels.formSectorOptions,
  };
}
