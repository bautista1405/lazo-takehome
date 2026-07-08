import type {
  CreateObligationRequest,
  ObligationStatus,
  ObligationType,
  UpdateObligationRequest,
} from "@repo/types";
import { OBLIGATION_STATUSES, OBLIGATION_TYPES } from "@repo/types";

export function readCreatePayload(
  formData: FormData,
): CreateObligationRequest {
  return {
    type: readType(formData, "type"),
    title: readRequiredString(formData, "title"),
    description: readRequiredString(formData, "description"),
    dueDate: readRequiredString(formData, "dueDate"),
    owner: readRequiredString(formData, "owner"),
    requiresDocument: readCheckbox(formData, "requiresDocument"),
    documentUrl: readNullableString(formData, "documentUrl"),
    companyTaxId: readRequiredString(formData, "companyTaxId"),
  };
}

export function readUpdatePayload(
  formData: FormData,
): UpdateObligationRequest {
  const companyTaxId = readOptionalString(formData, "companyTaxId");

  return {
    expectedVersion: readVersion(formData),
    type: readType(formData, "type"),
    title: readRequiredString(formData, "title"),
    description: readRequiredString(formData, "description"),
    dueDate: readRequiredString(formData, "dueDate"),
    owner: readRequiredString(formData, "owner"),
    requiresDocument: readCheckbox(formData, "requiresDocument"),
    documentUrl: readNullableString(formData, "documentUrl"),
    ...(companyTaxId ? { companyTaxId } : {}),
  };
}

export function readOptionalString(
  formData: FormData,
  field: string,
): string | undefined {
  const value = formData.get(field);

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function readRequiredString(formData: FormData, field: string): string {
  const value = readOptionalString(formData, field);

  if (!value) {
    throw new Error(`Missing ${field}.`);
  }

  return value;
}

export function readVersion(formData: FormData): number {
  const version = Number(readRequiredString(formData, "expectedVersion"));

  if (!Number.isInteger(version) || version < 1) {
    throw new Error("Invalid expectedVersion.");
  }

  return version;
}

export function readStatus(formData: FormData, field: string): ObligationStatus {
  const value = readRequiredString(formData, field);

  if (!OBLIGATION_STATUSES.includes(value as ObligationStatus)) {
    throw new Error(`Invalid ${field}.`);
  }

  return value as ObligationStatus;
}

function readType(formData: FormData, field: string): ObligationType {
  const value = readRequiredString(formData, field);

  if (!OBLIGATION_TYPES.includes(value as ObligationType)) {
    throw new Error(`Invalid ${field}.`);
  }

  return value as ObligationType;
}

function readNullableString(formData: FormData, field: string): string | null {
  return readOptionalString(formData, field) ?? null;
}

function readCheckbox(formData: FormData, field: string): boolean {
  return formData.get(field) === "on";
}
