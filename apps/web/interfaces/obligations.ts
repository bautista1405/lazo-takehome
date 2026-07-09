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
  status?: ObligationStatus;
  successNotification?: DashboardNotification;
}

export interface DashboardHeaderProps {
  dictionary: Dictionary;
  filters: ObligationFilters;
  locale: Locale;
}

export interface DashboardAlertsProps {
  apiError?: ApiError;
  dictionary: Dictionary;
  errorMessage?: string;
  successNotification?: DashboardNotification;
}

export interface DashboardNotification {
  message: string;
  title: string;
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

export interface DebouncedSearchInputProps {
  defaultValue?: string;
  delayMs?: number;
  locale: Locale;
  placeholder: string;
}

export interface ObligationFilterPanelProps {
  children: ReactNode;
}

export interface ObligationTableProps {
  dictionary: Dictionary;
  locale: Locale;
  obligations: ObligationResponse[];
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

export interface DocumentStatusProps {
  dictionary: Dictionary;
  obligation: ObligationResponse;
}

export interface ObligationStatusFormProps {
  dictionary: Dictionary;
  locale: Locale;
  obligation: ObligationResponse;
}

export interface DeleteObligationConfirmationProps {
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
