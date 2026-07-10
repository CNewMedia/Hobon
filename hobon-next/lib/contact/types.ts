export type ContactFormSource = "contact" | "cta";

export type ContactPayload = {
  source: ContactFormSource;
  firstname?: string;
  lastname?: string;
  name?: string;
  company?: string;
  email: string;
  phone?: string;
  sector?: string;
  intent?: string;
  intentLabel?: string;
  message?: string;
  locale?: string;
  /** Honeypot — must stay empty. */
  website?: string;
};

export type ContactValidationResult =
  | { ok: true; data: ContactPayload }
  | { ok: false; error: string };
