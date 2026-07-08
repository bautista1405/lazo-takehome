import type {
  ObligationResponse,
  ObligationStatus,
  ObligationStatusChange,
} from "@repo/types";
import type { ReactNode } from "react";
import type { ApiError } from "../types/api";
import type { Dictionary, Locale } from "../i18n";
import type {
  MetricTone,
  ObligationFilters,
  ObligationFormMode,
  ObligationMetrics,
} from "../types/obligations";

export interface ObligationDashboardProps {
  apiError?: ApiError;
  dictionary: Dictionary;
  errorMessage?: string;
  locale: Locale;
  obligations: ObligationResponse[];
  query?: string;
  selectedId?: string;
  status?: ObligationStatus;
  successMessage?: string;
}

export interface DashboardHeaderProps {
  dictionary: Dictionary;
  filters: ObligationFilters;
  locale: Locale;
  selectedId?: string;
}

export interface DashboardAlertsProps {
  apiError?: ApiError;
  dictionary: Dictionary;
  errorMessage?: string;
  successMessage?: string;
}

export interface ObligationKpisProps {
  dictionary: Dictionary;
  metrics: ObligationMetrics;
}

export interface MetricCardProps {
  label: string;
  tone?: MetricTone;
  value: number | string;
}

export interface ObligationFiltersProps {
  dictionary: Dictionary;
  filters: ObligationFilters;
  locale: Locale;
}

export interface ObligationFilterPanelProps {
  children: ReactNode;
}

export interface ObligationTableProps {
  dictionary: Dictionary;
  filters: ObligationFilters;
  locale: Locale;
  obligations: ObligationResponse[];
  selectedId?: string;
}

export interface ObligationDetailProps {
  dictionary: Dictionary;
  locale: Locale;
  obligation: ObligationResponse;
}

export interface ObligationFormProps {
  dictionary: Dictionary;
  locale: Locale;
  mode: ObligationFormMode;
  obligation?: ObligationResponse;
}

export interface ObligationStatusActionsProps {
  dictionary: Dictionary;
  locale: Locale;
  obligation: ObligationResponse;
}

export interface ObligationHistoryProps {
  dictionary: Dictionary;
  locale: Locale;
  statusHistory: ObligationStatusChange[];
}

export interface StatusBadgeProps {
  dictionary: Dictionary;
  status: ObligationStatus;
}

export interface DetailRowProps {
  label: string;
  value: ReactNode;
}
