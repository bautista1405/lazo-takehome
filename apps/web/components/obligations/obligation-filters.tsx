import { OBLIGATION_STATUSES } from "@repo/types";
import {
  Button,
  Field,
  Panel,
  Select,
  subtleActionClassName,
} from "@repo/ui/components/primitives";
import type {
  ObligationFilterPanelProps,
  ObligationFiltersProps,
} from "../../interfaces/obligations";
import { dashboardHref } from "../../utils/obligations";
import { DebouncedSearchInput } from "./debounced-search-input";

export function ObligationFilterForm({
  dictionary,
  filters,
  locale,
}: ObligationFiltersProps) {
  return (
    <form
      className="grid gap-3 sm:grid-cols-[minmax(180px,260px)_180px_auto] sm:items-end"
      method="get"
    >
      <input name="locale" type="hidden" value={locale} />
      <Field label={dictionary.search}>
        <DebouncedSearchInput
          defaultValue={filters.query}
          locale={locale}
          placeholder={dictionary.search}
        />
      </Field>
      <Field label={dictionary.status}>
        <Select
          defaultValue={filters.status ?? ""}
          name="status"
          className="h-8"
        >
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
        <a className={subtleActionClassName} href={dashboardHref({ locale })}>
          {dictionary.clear}
        </a>
      </div>
    </form>
  );
}

export function ObligationFilterPanel({
  children,
}: ObligationFilterPanelProps) {
  return <Panel className="overflow-hidden">{children}</Panel>;
}
