import { Panel } from "@repo/ui/components/primitives";
import type { ObligationDashboardProps } from "../../interfaces/obligations";
import {
  filterObligations,
  getMetrics,
  selectObligation,
  sortObligationsByDueDate,
} from "../../utils/obligations";
import { DashboardAlerts } from "./dashboard-alerts";
import { DashboardHeader } from "./dashboard-header";
import { ObligationDetail } from "./obligation-detail";
import {
  ObligationFilterForm,
  ObligationFilterPanel,
} from "./obligation-filters";
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
  selectedId,
  status,
  successMessage,
}: ObligationDashboardProps) {
  const filters = { query, status };
  const sortedObligations = sortObligationsByDueDate(obligations);
  const filteredObligations = filterObligations(sortedObligations, filters);
  const selectedObligation = selectObligation({
    filteredObligations,
    obligations: sortedObligations,
    selectedId,
  });
  const metrics = getMetrics(sortedObligations);

  return (
    <main lang={locale} className="min-h-screen bg-white text-neutral-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <DashboardHeader
          dictionary={dictionary}
          filters={filters}
          locale={locale}
          selectedId={selectedObligation?.id}
        />

        <DashboardAlerts
          apiError={apiError}
          dictionary={dictionary}
          errorMessage={errorMessage}
          successMessage={successMessage}
        />

        <ObligationKpis dictionary={dictionary} metrics={metrics} />

        <div className="grid gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
          <ObligationFilterPanel>
            <ObligationFilterForm
              dictionary={dictionary}
              filters={filters}
              locale={locale}
            />
            <ObligationsTable
              dictionary={dictionary}
              filters={filters}
              locale={locale}
              obligations={filteredObligations}
              selectedId={selectedObligation?.id}
            />
          </ObligationFilterPanel>

          <div className="grid gap-4">
            {selectedObligation ? (
              <ObligationDetail
                dictionary={dictionary}
                locale={locale}
                obligation={selectedObligation}
              />
            ) : (
              <Panel className="p-6">
                <p className="text-sm text-neutral-500">
                  {dictionary.noObligations}
                </p>
              </Panel>
            )}

            <div className="grid gap-4 xl:grid-cols-2">
              <ObligationForm
                dictionary={dictionary}
                locale={locale}
                mode="create"
              />
              {selectedObligation ? (
                <ObligationForm
                  dictionary={dictionary}
                  locale={locale}
                  mode="edit"
                  obligation={selectedObligation}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
