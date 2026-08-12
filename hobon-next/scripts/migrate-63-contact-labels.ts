/**
 * HOB-63 — contact/CTA/API labels → uiLabels (NL/FR/EN).
 *
 * Dry-run: npm run migrate:63-contact-labels
 * Write:    npm run migrate:63-contact-labels -- --write
 *
 * API approach: error codes only from /api/contact; client maps via resolveContactErrorLabel.
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

type Option = { _key?: string; value: string; label: string };

const SECTOR_VALUES = [
  "voeding",
  "logistiek",
  "chemie-industrie",
  "agro-industrie",
  "andere",
] as const;

const STRING_KEYS = [
  "formFieldFirstnameLabel",
  "formFieldLastnameLabel",
  "formFieldPhoneLabel",
  "formFieldSectorLabel",
  "formFieldMessageLabel",
  "formPlaceholderName",
  "formPlaceholderCompany",
  "formPlaceholderEmail",
  "formContactSuccessMessage",
  "formSuccessKicker",
  "formAskAgain",
  "formErrorInvalidJson",
  "formErrorRateLimit",
  "formErrorSendFailed",
  "formErrorInvalidRequest",
  "formErrorInvalidEmail",
  "formErrorRequiredFirstname",
  "formErrorRequiredLastname",
  "formErrorRequiredSector",
  "formErrorRequiredMessage",
  "formErrorRequiredName",
  "formErrorRequiredCompany",
  // Existing keys that still appear in §1 P0 (ensure FR/EN + no em-dash)
  "formFieldNameLabel",
  "formFieldCompanyLabel",
  "formFieldEmailLabel",
  "formDisclaimerText",
  "formPrivacyLinkLabel",
  "formSuccessMessage",
] as const;

type StringKey = (typeof STRING_KEYS)[number];

const STRING_PATCHES: Record<"nl" | "fr" | "en", Record<StringKey, string>> = {
  nl: {
    formFieldFirstnameLabel: "Voornaam",
    formFieldLastnameLabel: "Naam",
    formFieldPhoneLabel: "Telefoon",
    formFieldSectorLabel: "Sector",
    formFieldMessageLabel: "Bericht",
    formPlaceholderName: "Jan Janssen",
    formPlaceholderCompany: "Uw bedrijfsnaam",
    formPlaceholderEmail: "jan@bedrijf.be",
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
    formFieldNameLabel: "Naam *",
    formFieldCompanyLabel: "Bedrijf *",
    formFieldEmailLabel: "E-mail *",
    formDisclaimerText: "Uw gegevens worden uitsluitend gebruikt voor de behandeling van uw aanvraag.",
    formPrivacyLinkLabel: "Privacybeleid",
    formSuccessMessage: "Bedankt, we nemen zo snel mogelijk contact met u op.",
  },
  fr: {
    formFieldFirstnameLabel: "Prénom",
    formFieldLastnameLabel: "Nom",
    formFieldPhoneLabel: "Téléphone",
    formFieldSectorLabel: "Secteur",
    formFieldMessageLabel: "Message",
    formPlaceholderName: "Jean Dupont",
    formPlaceholderCompany: "Le nom de votre entreprise",
    formPlaceholderEmail: "jean@entreprise.be",
    formContactSuccessMessage:
      "Merci pour votre message. L'un de nos spécialistes vous contactera dans un délai d'un jour ouvrable.",
    formSuccessKicker: "Demande reçue",
    formAskAgain: "Posez une nouvelle question",
    formErrorInvalidJson: "JSON non valide.",
    formErrorRateLimit: "Trop de demandes. Réessayez dans quelques minutes.",
    formErrorSendFailed:
      "L'envoi a échoué. Réessayez plus tard ou envoyez-nous un e-mail directement.",
    formErrorInvalidRequest: "Demande non valide.",
    formErrorInvalidEmail: "Saisissez une adresse e-mail valide.",
    formErrorRequiredFirstname: "Le prénom est obligatoire.",
    formErrorRequiredLastname: "Le nom est obligatoire.",
    formErrorRequiredSector: "Le secteur est obligatoire.",
    formErrorRequiredMessage: "Le message est obligatoire.",
    formErrorRequiredName: "Le nom est obligatoire.",
    formErrorRequiredCompany: "L'entreprise est obligatoire.",
    formFieldNameLabel: "Nom *",
    formFieldCompanyLabel: "Entreprise *",
    formFieldEmailLabel: "E-mail *",
    formDisclaimerText:
      "Vos données sont utilisées uniquement pour le traitement de votre demande.",
    formPrivacyLinkLabel: "Politique de confidentialité",
    formSuccessMessage: "Merci, nous vous contacterons dans les plus brefs délais.",
  },
  en: {
    formFieldFirstnameLabel: "First name",
    formFieldLastnameLabel: "Last name",
    formFieldPhoneLabel: "Phone",
    formFieldSectorLabel: "Sector",
    formFieldMessageLabel: "Message",
    formPlaceholderName: "John Smith",
    formPlaceholderCompany: "Your company name",
    formPlaceholderEmail: "john@company.com",
    formContactSuccessMessage:
      "Thank you for your message. One of our specialists will contact you within 1 working day.",
    formSuccessKicker: "Request received",
    formAskAgain: "Ask another question",
    formErrorInvalidJson: "Invalid JSON.",
    formErrorRateLimit: "Too many requests. Please try again in a few minutes.",
    formErrorSendFailed: "Sending failed. Please try again later or email us directly.",
    formErrorInvalidRequest: "Invalid request.",
    formErrorInvalidEmail: "Enter a valid email address.",
    formErrorRequiredFirstname: "First name is required.",
    formErrorRequiredLastname: "Last name is required.",
    formErrorRequiredSector: "Sector is required.",
    formErrorRequiredMessage: "Message is required.",
    formErrorRequiredName: "Name is required.",
    formErrorRequiredCompany: "Company is required.",
    formFieldNameLabel: "Name *",
    formFieldCompanyLabel: "Company *",
    formFieldEmailLabel: "Email *",
    formDisclaimerText: "Your data will only be used to process your request.",
    formPrivacyLinkLabel: "Privacy policy",
    formSuccessMessage: "Thank you, we will contact you as soon as possible.",
  },
};

const SECTOR_LABELS: Record<"nl" | "fr" | "en", Record<(typeof SECTOR_VALUES)[number], string>> = {
  nl: {
    voeding: "Voeding",
    logistiek: "Logistiek",
    "chemie-industrie": "Chemie & industrie",
    "agro-industrie": "Agro-industrie",
    andere: "Andere",
  },
  fr: {
    voeding: "Alimentation",
    logistiek: "Logistique",
    "chemie-industrie": "Chimie & industrie",
    "agro-industrie": "Agro-industrie",
    andere: "Autre",
  },
  en: {
    voeding: "Food",
    logistiek: "Logistics",
    "chemie-industrie": "Chemicals & industry",
    "agro-industrie": "Agro-industry",
    andere: "Other",
  },
};

function sectorOptions(locale: "nl" | "fr" | "en"): Option[] {
  return SECTOR_VALUES.map((value, i) => ({
    _key: `sector-${value}`,
    value,
    label: SECTOR_LABELS[locale][value],
  }));
}

function parseArgs() {
  return { write: process.argv.includes("--write") };
}

function clip(text: string, max = 78): string {
  const one = text.replace(/\s+/g, " ").trim();
  if (one.length <= max) return one;
  return `${one.slice(0, max - 3)}...`;
}

function optionsEqual(a: Option[] | undefined, b: Option[]): boolean {
  if (!a || a.length !== b.length) return false;
  return a.every((opt, i) => opt.value === b[i]?.value && opt.label === b[i]?.label);
}

async function main() {
  const { write } = parseArgs();
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
  const readToken = process.env.SANITY_API_READ_TOKEN?.trim() || token;
  if (write && !token) throw new Error("SANITY_API_WRITE_TOKEN required for --write");

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: write ? token : readToken || undefined,
    useCdn: false,
  });

  console.log(`HOB-63 — contact/CTA uiLabels (${write ? "WRITE" : "DRY-RUN"}) — ${dataset}\n`);
  console.log("API approach: (a) errorCode keys from /api/contact → client uiLabels\n");

  let patchCount = 0;

  for (const locale of ["nl", "fr", "en"] as const) {
    const id = `uiLabels-${locale}`;
    const projection = [...STRING_KEYS, "formSectorOptions"].join(", ");
    const doc = await client.fetch<
      | (Partial<Record<StringKey, string>> & { formSectorOptions?: Option[]; _id: string })
      | null
    >(`*[_id == $id][0]{ _id, ${projection} }`, { id });

    console.log(`=== uiLabels-${locale} ===`);
    if (!doc) {
      console.log("  ❌ document niet gevonden — skip\n");
      continue;
    }

    const setPayload: Record<string, unknown> = {};

    for (const key of STRING_KEYS) {
      const was = doc[key]?.trim() ?? "";
      const wordt = STRING_PATCHES[locale][key];
      const unchanged = was === wordt;
      console.log(`  ${key}`);
      console.log(`    was:   ${was ? clip(was) : "(leeg)"}`);
      console.log(`    wordt: ${clip(wordt)} ${unchanged ? "[unchanged]" : "[PATCH]"}`);
      if (!unchanged) setPayload[key] = wordt;
    }

    const nextSectors = sectorOptions(locale);
    const sectorUnchanged = optionsEqual(doc.formSectorOptions, nextSectors);
    console.log(`  formSectorOptions`);
    console.log(
      `    was:   ${
        doc.formSectorOptions?.length
          ? doc.formSectorOptions.map((o) => o.label).join(" | ")
          : "(leeg)"
      }`,
    );
    console.log(
      `    wordt: ${nextSectors.map((o) => o.label).join(" | ")} ${
        sectorUnchanged ? "[unchanged]" : "[PATCH]"
      }`,
    );
    if (!sectorUnchanged) setPayload.formSectorOptions = nextSectors;

    console.log("");

    if (Object.keys(setPayload).length === 0) {
      console.log(`  Geen patches nodig voor uiLabels-${locale}\n`);
      continue;
    }

    patchCount += Object.keys(setPayload).length;
    if (write) {
      await client.patch(id).set(setPayload).commit();
      console.log(`  ✅ patched ${Object.keys(setPayload).length} fields\n`);
    } else {
      console.log(`  (dry-run) would patch ${Object.keys(setPayload).length} fields\n`);
    }
  }

  console.log(`--- Summary: ${patchCount} field-patches ${write ? "applied" : "pending"} ---`);
  if (!write) console.log("Re-run with --write to apply.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
