"use client";

import { useMemo, type FormEvent } from "react";
import { ArrowBtnIcon } from "@/components/layout/icons";

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

export function ContactForm({
  formFields,
  formTitle,
  formSubmitLabel,
  onSubmitted,
}: {
  formFields: ContactFormLabels;
  formTitle: string;
  formSubmitLabel: string;
  onSubmitted?: () => void;
}) {
  const labels = useMemo(() => formFields ?? {}, [formFields]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.currentTarget.reset();
    onSubmitted?.();
  }

  const L = (k: keyof ContactFormLabels, fallback: string) => labels[k] ?? fallback;

  return (
    <form className="c-form" onSubmit={onSubmit}>
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
      <div className="c-form-bottom">
        <div className="c-privacy-wrap">
          <p className="c-privacy">
            Door te verzenden bevestigen we uw aanvraag meteen op deze pagina. Een echte koppeling met het
            aanvraagsysteem volgt later.
          </p>
        </div>
        <button type="submit" className="c-submit">
          <span>{formSubmitLabel}</span>
          <ArrowBtnIcon size={14} />
        </button>
      </div>
    </form>
  );
}
