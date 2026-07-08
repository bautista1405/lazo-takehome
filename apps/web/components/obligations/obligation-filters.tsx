import { OBLIGATION_STATUSES } from "@repo/types";
import {
  Button,
  Field,
  Input,
  Panel,
  Select,
} from "@repo/ui/components/primitives";
import type {
  ObligationFilterPanelProps,
  ObligationFiltersProps,
} from "../../interfaces/obligations";
import { dashboardHref } from "../../utils/obligations";

export function ObligationFilterForm({
  dictionary,
  filters,
  locale,
}: ObligationFiltersProps) {
  return (
    <div className="border-b border-neutral-200 p-4">
      <h2 className="text-base font-semibold">{dictionary.filter}</h2>
      <form className="mt-4 grid gap-3" method="get">
        <input name="locale" type="hidden" value={locale} />
        <Field label={dictionary.search}>
          <Input
            defaultValue={filters.query}
            name="q"
            placeholder={dictionary.search}
            type="search"
          />
        </Field>
        <Field label={dictionary.status}>
          <Select defaultValue={filters.status ?? ""} name="status">
            <option value="">{dictionary.allStatuses}</option>
            {OBLIGATION_STATUSES.map((option) => (
              <option key={option} value={option}>
                {dictionary.statuses[option]}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex items-center gap-2">
          <Button type="submit">{dictionary.filter}</Button>
          <a
            className="inline-flex min-h-9 items-center rounded-md border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-950"
            href={dashboardHref({ locale })}
          >
            {dictionary.clear}
          </a>
        </div>
      </form>
    </div>
  );
}

export function ObligationFilterPanel({
  children,
}: ObligationFilterPanelProps) {
  return <Panel className="overflow-hidden">{children}</Panel>;
}
