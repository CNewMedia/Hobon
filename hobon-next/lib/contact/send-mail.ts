import nodemailer from "nodemailer";
import type { ContactPayload } from "./types";

function displayName(data: ContactPayload): string {
  if (data.source === "cta" && data.name) return data.name;
  return [data.firstname, data.lastname].filter(Boolean).join(" ").trim() || data.email;
}

function buildPlainText(data: ContactPayload): string {
  const lines = [
    "Nieuwe contactaanvraag via hobon.be",
    "",
    `Formulier: ${data.source === "cta" ? "Sector/product CTA" : "Contactpagina"}`,
    data.locale ? `Taal: ${data.locale.toUpperCase()}` : null,
    "",
  ];

  if (data.source === "contact") {
    lines.push(
      `Voornaam: ${data.firstname ?? "—"}`,
      `Naam: ${data.lastname ?? "—"}`,
    );
  } else {
    lines.push(`Naam: ${data.name ?? "—"}`);
  }

  lines.push(
    `Bedrijf: ${data.company || "—"}`,
    `E-mail: ${data.email}`,
    `Telefoon: ${data.phone || "—"}`,
  );

  if (data.sector) lines.push(`Sector: ${data.sector}`);
  if (data.intent || data.intentLabel) {
    lines.push(`Intentie: ${data.intentLabel || data.intent}`);
  }

  lines.push("", "Bericht:", data.message || "—", "");

  return lines.filter((line) => line !== null).join("\n");
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || "smtp.office365.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO;

  if (!user || !pass || !to) {
    throw new Error("SMTP_USER, SMTP_PASS en CONTACT_TO zijn vereist.");
  }

  return { host, port, user, pass, to };
}

export async function sendContactEmail(data: ContactPayload): Promise<void> {
  const { host, port, user, pass, to } = getSmtpConfig();
  const name = displayName(data);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { user, pass },
    tls: { minVersion: "TLSv1.2" },
  });

  await transporter.sendMail({
    from: `"Hobon website" <${user}>`,
    to,
    replyTo: data.email,
    subject: `Contactaanvraag hobon.be — ${name}${data.company ? ` (${data.company})` : ""}`,
    text: buildPlainText(data),
  });
}
