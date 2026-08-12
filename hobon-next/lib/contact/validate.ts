import type { ContactPayload, ContactValidationResult } from "./types";
import type { ContactErrorCode } from "./error-codes";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max = 500): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function validateContactPayload(body: unknown): ContactValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, errorCode: "invalid_request" satisfies ContactErrorCode };
  }

  const raw = body as Record<string, unknown>;
  const source = raw.source === "cta" ? "cta" : "contact";
  const email = clean(raw.email, 254).toLowerCase();

  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, errorCode: "invalid_email" };
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
    if (!firstname) return { ok: false, errorCode: "required_firstname" };
    if (!lastname) return { ok: false, errorCode: "required_lastname" };
    if (!sector) return { ok: false, errorCode: "required_sector" };
    if (!message) return { ok: false, errorCode: "required_message" };
  } else {
    if (!name) return { ok: false, errorCode: "required_name" };
    if (!company) return { ok: false, errorCode: "required_company" };
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
