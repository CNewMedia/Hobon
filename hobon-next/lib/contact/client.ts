import type { ContactPayload } from "./types";
import { isContactErrorCode, type ContactErrorCode } from "./error-codes";

export type ContactSubmitResult =
  | { ok: true }
  | { ok: false; errorCode: ContactErrorCode };

export async function submitContactForm(payload: ContactPayload): Promise<ContactSubmitResult> {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = (await res.json().catch(() => null)) as { errorCode?: string } | null;

  if (!res.ok) {
    const code = isContactErrorCode(body?.errorCode) ? body.errorCode : "send_failed";
    return { ok: false, errorCode: code };
  }

  return { ok: true };
}
