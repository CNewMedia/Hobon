import type { UILabels } from "@/types/uiLabels";
import type { ContactErrorCode } from "./error-codes";

const ERROR_LABEL_KEY: Record<ContactErrorCode, keyof UILabels> = {
  invalid_json: "formErrorInvalidJson",
  rate_limit: "formErrorRateLimit",
  send_failed: "formErrorSendFailed",
  invalid_request: "formErrorInvalidRequest",
  invalid_email: "formErrorInvalidEmail",
  required_firstname: "formErrorRequiredFirstname",
  required_lastname: "formErrorRequiredLastname",
  required_sector: "formErrorRequiredSector",
  required_message: "formErrorRequiredMessage",
  required_name: "formErrorRequiredName",
  required_company: "formErrorRequiredCompany",
};

export function resolveContactErrorLabel(
  labels: UILabels,
  code: ContactErrorCode | null | undefined,
): string {
  if (!code) return labels.formErrorSendFailed;
  const key = ERROR_LABEL_KEY[code];
  const value = labels[key];
  return typeof value === "string" && value ? value : labels.formErrorSendFailed;
}
