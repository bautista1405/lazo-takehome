import type { ObligationResponse, ObligationStatus } from "@repo/types";
import type { Locale } from "../i18n";

export type SearchParams = Record<string, string | string[] | undefined>;

export type ObligationFilters = {
  query?: string;
  status?: ObligationStatus;
};

export type ObligationMetrics = {
  byStatus: Record<ObligationStatus, number>;
  dueSoon: number;
  overdue: number;
  total: number;
};

export type DashboardHrefParams = {
  error?: string;
  locale: Locale;
  query?: string;
  selectedId?: string;
  status?: ObligationStatus;
  success?: string;
};

export type ObligationFormMode = "create" | "edit";

export type MetricTone = "danger" | "neutral" | "warning";

export type SelectObligationParams = {
  filteredObligations: ObligationResponse[];
  obligations: ObligationResponse[];
  selectedId?: string;
};
