/** Contact API/client error codes — never send NL prose from the server. */
export const CONTACT_ERROR_CODES = [
  "invalid_json",
  "rate_limit",
  "send_failed",
  "invalid_request",
  "invalid_email",
  "required_firstname",
  "required_lastname",
  "required_sector",
  "required_message",
  "required_name",
  "required_company",
] as const;

export type ContactErrorCode = (typeof CONTACT_ERROR_CODES)[number];

export function isContactErrorCode(value: unknown): value is ContactErrorCode {
  return typeof value === "string" && (CONTACT_ERROR_CODES as readonly string[]).includes(value);
}
