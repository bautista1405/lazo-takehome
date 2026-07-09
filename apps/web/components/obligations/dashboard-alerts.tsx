import { Alert } from "@repo/ui/components/primitives";
import { Toast } from "@repo/ui/components/toast";
import type { DashboardAlertsProps } from "../../interfaces/obligations";

export function DashboardAlerts({
  apiError,
  dictionary,
  errorMessage,
  successNotification,
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

      {successNotification ? (
        <Toast
          message={successNotification.message}
          title={successNotification.title}
          tone="success"
        />
      ) : null}
    </>
  );
}
