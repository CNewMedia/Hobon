import type { ContactPayload } from "./types";

export type ContactSubmitResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitContactForm(payload: ContactPayload): Promise<ContactSubmitResult> {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = (await res.json().catch(() => null)) as { error?: string } | null;

  if (!res.ok) {
    return { ok: false, error: body?.error || "Verzenden mislukt. Probeer het later opnieuw." };
  }

  return { ok: true };
}
