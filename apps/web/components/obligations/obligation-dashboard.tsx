import { Panel } from "@repo/ui/components/primitives";
import { Modal } from "@repo/ui/components/modal";
import type { ObligationDashboardProps } from "../../interfaces/obligations";
import {
  filterObligations,
  getMetrics,
  sortObligationsByDueDate,
} from "../../utils/obligations";
import { DashboardAlerts } from "./dashboard-alerts";
import { DashboardHeader } from "./dashboard-header";
import { ObligationFilterForm } from "./obligation-filters";
import { ObligationForm } from "./obligation-form";
import { ObligationKpis } from "./obligation-kpis";
import { ObligationsTable } from "./obligations-table";

export function ObligationDashboard({
  apiError,
  dictionary,
  errorMessage,
  locale,
  obligations,
  query,
  status,
  successNotification,
}: ObligationDashboardProps) {
  const filters = { query, status };
  const sortedObligations = sortObligationsByDueDate(obligations);
  const filteredObligations = filterObligations(sortedObligations, filters);
  const metrics = getMetrics(sortedObligations);

  return (
    <main lang={locale} className="min-h-screen bg-white text-neutral-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <DashboardHeader
          dictionary={dictionary}
          filters={filters}
          locale={locale}
        />

        <DashboardAlerts
          apiError={apiError}
          dictionary={dictionary}
          errorMessage={errorMessage}
          successNotification={successNotification}
        />

        <ObligationKpis dictionary={dictionary} metrics={metrics} />

        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-neutral-200 px-4 py-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Modal
                className="w-[min(760px,calc(100vw-2rem))]"
                closeLabel={dictionary.close}
                title={dictionary.create}
                triggerLabel={dictionary.createNewObligation}
                triggerVariant="success"
              >
                <ObligationForm
                  dictionary={dictionary}
                  locale={locale}
                  mode="create"
                />
              </Modal>
            </div>
            <ObligationFilterForm
              dictionary={dictionary}
              filters={filters}
              locale={locale}
            />
          </div>
          <ObligationsTable
            dictionary={dictionary}
            locale={locale}
            obligations={filteredObligations}
          />
        </Panel>
      </div>
    </main>
  );
}
