"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { ArrowBtnIcon } from "@/components/layout/icons";
import { submitContactForm } from "@/lib/contact/client";

export type ContactFormLabels = {
  firstname?: string | null;
  lastname?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  sector?: string | null;
  message?: string | null;
};

const SECTOR_OPTIONS = [
  "Voeding",
  "Logistiek",
  "Chemie & industrie",
  "Agro-industrie",
  "Andere",
] as const;

const ERROR_FALLBACK: Record<string, string> = {
  nl: "Verzenden mislukt. Probeer het opnieuw of mail ons rechtstreeks.",
  fr: "L'envoi a échoué. Réessayez ou contactez-nous directement par e-mail.",
  en: "Sending failed. Please try again or email us directly.",
};

export function ContactForm({
  formFields,
  formTitle,
  formSubmitLabel,
  formDisclaimerText,
  formPrivacyHref,
  formPrivacyLinkLabel,
  onSubmitted,
}: {
  formFields: ContactFormLabels;
  formTitle: string;
  formSubmitLabel: string;
  formDisclaimerText?: string;
  formPrivacyHref?: string;
  formPrivacyLinkLabel?: string;
  onSubmitted?: () => void;
}) {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "nl";
  const labels = useMemo(() => formFields ?? {}, [formFields]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const result = await submitContactForm({
      source: "contact",
      locale,
      firstname: String(fd.get("firstname") ?? ""),
      lastname: String(fd.get("lastname") ?? ""),
      company: String(fd.get("company") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      sector: String(fd.get("sector") ?? ""),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error || ERROR_FALLBACK[locale] || ERROR_FALLBACK.nl);
      return;
    }

    form.reset();
    onSubmitted?.();
  }

  const L = (k: keyof ContactFormLabels, fallback: string) => labels[k] ?? fallback;

  return (
    <form className="c-form" onSubmit={onSubmit} noValidate>
      {formTitle ? <h2 className="c-form-title">{formTitle}</h2> : null}
      <div className="c-row">
        <div className="c-field">
          <label className="c-lbl" htmlFor="firstname">
            {L("firstname", "Voornaam")}
          </label>
          <input id="firstname" name="firstname" className="c-in" type="text" autoComplete="given-name" required />
        </div>
        <div className="c-field">
          <label className="c-lbl" htmlFor="lastname">
            {L("lastname", "Naam")}
          </label>
          <input id="lastname" name="lastname" className="c-in" type="text" autoComplete="family-name" required />
        </div>
      </div>
      <div className="c-row">
        <div className="c-field">
          <label className="c-lbl" htmlFor="company">
            {L("company", "Bedrijf")}
          </label>
          <input id="company" name="company" className="c-in" type="text" autoComplete="organization" />
        </div>
        <div className="c-field">
          <label className="c-lbl" htmlFor="email">
            {L("email", "E-mail")}
          </label>
          <input id="email" name="email" className="c-in" type="email" autoComplete="email" required />
        </div>
      </div>
      <div className="c-row">
        <div className="c-field">
          <label className="c-lbl" htmlFor="phone">
            {L("phone", "Telefoon")}
          </label>
          <input id="phone" name="phone" className="c-in" type="tel" autoComplete="tel" />
        </div>
        <div className="c-field">
          <label className="c-lbl" htmlFor="sector">
            {L("sector", "Sector")}
          </label>
          <select id="sector" name="sector" className="c-sel" required defaultValue="">
            <option value="" disabled>
              —
            </option>
            {SECTOR_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="c-row full">
        <div className="c-field">
          <label className="c-lbl" htmlFor="message">
            {L("message", "Bericht")}
          </label>
          <textarea id="message" name="message" className="c-ta" required />
        </div>
      </div>
      <div className="c-hp" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="c-form-bottom">
        <div className="c-privacy-wrap">
          {error ? (
            <p className="c-form-error" role="alert">
              {error}
            </p>
          ) : null}
          <p className="c-privacy">
            {formDisclaimerText ||
              "Uw gegevens worden uitsluitend gebruikt voor de behandeling van uw aanvraag."}
            {formPrivacyHref ? (
              <>
                {" "}
                <a href={formPrivacyHref}>{formPrivacyLinkLabel || "Privacybeleid"}</a>.
              </>
            ) : null}
          </p>
        </div>
        <button type="submit" className="c-submit" disabled={submitting}>
          <span>{submitting ? "…" : formSubmitLabel}</span>
          <ArrowBtnIcon size={14} />
        </button>
      </div>
    </form>
  );
}
