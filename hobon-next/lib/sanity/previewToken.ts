import { createHmac, timingSafeEqual } from "node:crypto";

const TTL_MS = 15 * 60 * 1000;

function previewSecret(): string {
  const secret = process.env.SANITY_PREVIEW_SECRET?.trim();
  if (!secret) throw new Error("SANITY_PREVIEW_SECRET is not configured");
  return secret;
}

export function signPreviewToken(documentId: string): { expires: string; sig: string } {
  const expires = String(Date.now() + TTL_MS);
  const sig = createHmac("sha256", previewSecret())
    .update(`${documentId}:${expires}`)
    .digest("hex");
  return { expires, sig };
}

export function verifyPreviewToken(documentId: string, expires: string, sig: string): boolean {
  const expiresMs = Number(expires);
  if (!Number.isFinite(expiresMs) || Date.now() > expiresMs) return false;
  if (!/^[a-f0-9]{64}$/.test(sig)) return false;

  const expected = createHmac("sha256", previewSecret())
    .update(`${documentId}:${expires}`)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function verifyPreviewSecret(secret: string | null): boolean {
  if (!secret?.trim()) return false;
  const expected = process.env.SANITY_PREVIEW_SECRET?.trim();
  if (!expected) return false;
  try {
    return timingSafeEqual(Buffer.from(secret), Buffer.from(expected));
  } catch {
    return false;
  }
}
