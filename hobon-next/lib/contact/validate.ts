import type { ContactPayload, ContactValidationResult } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max = 500): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function validateContactPayload(body: unknown): ContactValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Ongeldige aanvraag." };
  }

  const raw = body as Record<string, unknown>;
  const source = raw.source === "cta" ? "cta" : "contact";
  const email = clean(raw.email, 254).toLowerCase();

  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Voer een geldig e-mailadres in." };
  }

  const firstname = clean(raw.firstname, 120);
  const lastname = clean(raw.lastname, 120);
  const name = clean(raw.name, 240);
  const company = clean(raw.company, 200);
  const phone = clean(raw.phone, 40);
  const sector = clean(raw.sector, 120);
  const intent = clean(raw.intent, 120);
  const intentLabel = clean(raw.intentLabel, 200);
  const message = clean(raw.message, 8000);
  const locale = clean(raw.locale, 8);
  const website = clean(raw.website, 200);

  if (source === "contact") {
    if (!firstname) return { ok: false, error: "Voornaam is verplicht." };
    if (!lastname) return { ok: false, error: "Naam is verplicht." };
    if (!sector) return { ok: false, error: "Sector is verplicht." };
    if (!message) return { ok: false, error: "Bericht is verplicht." };
  } else {
    if (!name) return { ok: false, error: "Naam is verplicht." };
    if (!company) return { ok: false, error: "Bedrijf is verplicht." };
  }

  return {
    ok: true,
    data: {
      source,
      firstname: firstname || undefined,
      lastname: lastname || undefined,
      name: name || undefined,
      company: company || undefined,
      email,
      phone: phone || undefined,
      sector: sector || undefined,
      intent: intent || undefined,
      intentLabel: intentLabel || undefined,
      message: message || undefined,
      locale: locale || undefined,
      website: website || undefined,
    },
  };
}
