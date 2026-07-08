import type { ObligationResponse, ObligationStatus } from "@repo/types";
import { OBLIGATION_STATUSES } from "@repo/types";
import type { Dictionary, Locale } from "../i18n";
import type {
  DashboardHrefParams,
  ObligationFilters,
  ObligationMetrics,
  SelectObligationParams,
} from "../types/obligations";

const dueSoonDays = 14;

export function sortObligationsByDueDate(
  obligations: ObligationResponse[],
): ObligationResponse[] {
  return [...obligations].sort((left, right) =>
    left.dueDate.localeCompare(right.dueDate),
  );
}

export function filterObligations(
  obligations: ObligationResponse[],
  filters: ObligationFilters,
): ObligationResponse[] {
  return obligations.filter((obligation) => matchesFilter(obligation, filters));
}

export function selectObligation({
  filteredObligations,
  obligations,
  selectedId,
}: SelectObligationParams): ObligationResponse | undefined {
  return (
    obligations.find((obligation) => obligation.id === selectedId) ??
    filteredObligations[0] ??
    obligations[0]
  );
}

export function getMetrics(
  obligations: ObligationResponse[],
): ObligationMetrics {
  const today = startOfToday();
  const byStatus: Record<ObligationStatus, number> = {
    done: 0,
    in_progress: 0,
    pending: 0,
    submitted: 0,
  };

  for (const obligation of obligations) {
    byStatus[obligation.status] += 1;
  }

  return {
    byStatus,
    dueSoon: obligations.filter((obligation) => isDueSoon(obligation, today))
      .length,
    overdue: obligations.filter((obligation) => obligation.overdue).length,
    total: obligations.length,
  };
}

export function formatStatusCounts(
  metrics: Record<ObligationStatus, number>,
  dictionary: Dictionary,
): string {
  return OBLIGATION_STATUSES.map(
    (status) => `${dictionary.statuses[status]} ${metrics[status]}`,
  ).join(" / ");
}

export function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
    dateStyle: "medium",
  }).format(parseDate(value));
}

export function formatDateTime(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function dashboardHref({
  error,
  locale,
  query,
  selectedId,
  status,
  success,
}: DashboardHrefParams): string {
  const params = new URLSearchParams({ locale });

  if (query) {
    params.set("q", query);
  }

  if (status) {
    params.set("status", status);
  }

  if (selectedId) {
    params.set("id", selectedId);
  }

  if (success) {
    params.set("success", success);
  }

  if (error) {
    params.set("error", error);
  }

  return `/?${params.toString()}`;
}

function matchesFilter(
  obligation: ObligationResponse,
  filters: ObligationFilters,
): boolean {
  const normalizedQuery = filters.query?.trim().toLowerCase();
  const matchesStatus = filters.status
    ? obligation.status === filters.status
    : true;

  if (!normalizedQuery) {
    return matchesStatus;
  }

  const matchesQuery = [
    obligation.title,
    obligation.description,
    obligation.owner,
    obligation.maskedCompanyTaxId,
  ].some((field) => field.toLowerCase().includes(normalizedQuery));

  return matchesStatus && matchesQuery;
}

function isDueSoon(obligation: ObligationResponse, today: Date): boolean {
  if (obligation.overdue || obligation.status === "done") {
    return false;
  }

  const dueDate = parseDate(obligation.dueDate);
  const diff = dueDate.getTime() - today.getTime();

  return diff >= 0 && diff <= dueSoonDays * 24 * 60 * 60 * 1000;
}

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
