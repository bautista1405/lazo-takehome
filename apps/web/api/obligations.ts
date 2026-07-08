import "server-only";

import type {
  CreateObligationRequest,
  ObligationResponse,
  UpdateObligationRequest,
  UpdateObligationStatusRequest,
} from "@repo/types";
import type { ApiError } from "../types/api";

const API_BASE_URL =
  process.env.COMPLIANCE_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3002";

export class ComplianceApiError extends Error {
  readonly response: ApiError;

  constructor(response: ApiError) {
    super(response.message);
    this.name = "ComplianceApiError";
    this.response = response;
  }
}

export async function listObligations(): Promise<ObligationResponse[]> {
  return requestJson<ObligationResponse[]>("/obligation");
}

export async function createObligation(
  body: CreateObligationRequest,
): Promise<ObligationResponse> {
  return requestJson<ObligationResponse>("/obligation", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateObligation(
  id: string,
  body: UpdateObligationRequest,
): Promise<ObligationResponse> {
  return requestJson<ObligationResponse>(`/obligation/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function updateObligationStatus(
  id: string,
  body: UpdateObligationStatusRequest,
): Promise<ObligationResponse> {
  return requestJson<ObligationResponse>(`/obligation/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ComplianceApiError) {
    return error.response;
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "Unknown API error.",
  };
}

async function requestJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new ComplianceApiError(await readErrorResponse(response));
  }

  return (await response.json()) as T;
}

async function readErrorResponse(response: Response): Promise<ApiError> {
  const body = await readJson(response);

  if (isRecord(body)) {
    return {
      statusCode: readNumber(body.statusCode) ?? response.status,
      status: readString(body.status),
      message: readString(body.message) ?? response.statusText,
      details: readRecord(body.details),
      issues: Array.isArray(body.issues) ? body.issues : undefined,
    };
  }

  return {
    statusCode: response.status,
    message: response.statusText,
  };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}
