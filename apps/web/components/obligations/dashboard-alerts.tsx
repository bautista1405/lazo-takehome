import { Alert } from "@repo/ui/components/primitives";
import type { DashboardAlertsProps } from "../../interfaces/obligations";

export function DashboardAlerts({
  apiError,
  dictionary,
  errorMessage,
  successMessage,
}: DashboardAlertsProps) {
  return (
    <>
      {apiError ? (
        <Alert
          message={`${apiError.message} ${dictionary.apiErrorHint}`}
          title={dictionary.apiErrorTitle}
          tone="danger"
        />
      ) : null}

      {errorMessage ? (
        <Alert message={errorMessage} title={dictionary.error} tone="danger" />
      ) : null}

      {successMessage ? (
        <Alert
          message={successMessage}
          title={dictionary.success}
          tone="success"
        />
      ) : null}
    </>
  );
}
