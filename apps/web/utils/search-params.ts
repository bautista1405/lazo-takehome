import type { ObligationStatus } from "@repo/types";
import { OBLIGATION_STATUSES } from "@repo/types";

export function readOptionalParam(
  value: string | string[] | undefined,
): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;

  return candidate?.trim() || undefined;
}

export function readStatusParam(
  value: string | string[] | undefined,
): ObligationStatus | undefined {
  const candidate = readOptionalParam(value);

  if (!candidate) {
    return undefined;
  }

  return OBLIGATION_STATUSES.includes(candidate as ObligationStatus)
    ? (candidate as ObligationStatus)
    : undefined;
}
