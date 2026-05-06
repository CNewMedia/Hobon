"use client";

import { useState } from "react";
import { ArrowBtnIcon } from "@/components/layout/icons";
import { useUILabels } from "@/components/providers/UILabelsProvider";

export function SectorCtaForm() {
  const labels = useUILabels();
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div
        id="cta-success"
        className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-md border border-[var(--rule-lt)] bg-[var(--chalk)] p-8 text-center"
      >
        <p className="font-[family-name:var(--f-head)] text-lg font-semibold text-[var(--navy)]">
          {labels.formSuccessMessage}
        </p>
      </div>
    );
  }

  return (
    <form
      id="cta-form"
      className="cf"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className="cf-row">
        <div className="cf-field">
          <label className="cf-lbl" htmlFor="cfn">
            {labels.formFieldNameLabel}
          </label>
          <input className="cf-in" id="cfn" type="text" placeholder="Jan Janssen" required />
        </div>
        <div className="cf-field">
          <label className="cf-lbl" htmlFor="cfb">
            {labels.formFieldCompanyLabel}
          </label>
          <input className="cf-in" id="cfb" type="text" placeholder="Uw bedrijfsnaam" required />
        </div>
      </div>
      <div className="cf-row">
        <div className="cf-field">
          <label className="cf-lbl" htmlFor="cfe">
            {labels.formFieldEmailLabel}
          </label>
          <input className="cf-in" id="cfe" type="email" placeholder="jan@bedrijf.be" required />
        </div>
        <div className="cf-field">
          <label className="cf-lbl" htmlFor="cft">
            {labels.formIntentLabel}
          </label>
          <select className="cf-sel" id="cft" defaultValue="">
            <option value="" disabled>
              {labels.formIntentPlaceholder}
            </option>
            {labels.formIntentOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="cf-row">
        <div className="cf-field full">
          <label className="cf-lbl" htmlFor="cfm">
            {labels.formFieldChallengeLabel}
          </label>
          <textarea
            className="cf-ta"
            id="cfm"
            placeholder={labels.formChallengePlaceholder}
          />
        </div>
      </div>
      <div className="cf-bottom">
        <button className="cf-btn" type="submit">
          <span>{labels.formSubmitLabel}</span>
          <ArrowBtnIcon size={14} />
        </button>
      </div>
      <div className="cf-privacy">
        {labels.formDisclaimerText} <a href="#">{labels.formPrivacyLinkLabel}</a>.
      </div>
    </form>
  );
}
