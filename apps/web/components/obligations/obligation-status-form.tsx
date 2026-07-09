import {
  Button,
  Field,
  SecondaryButton,
  Select,
} from "@repo/ui/components/primitives";
import { updateStatusAction } from "../../actions/obligations";
import type { ObligationStatusFormProps } from "../../interfaces/obligations";
import { StatusBadge } from "./status-badge";

export function ObligationStatusForm({
  dictionary,
  locale,
  obligation,
}: ObligationStatusFormProps) {
  const defaultStatus = obligation.allowedTransitions[0] ?? "";
  const canUpdate = obligation.allowedTransitions.length > 0;

  return (
    <form action={updateStatusAction} className="grid gap-4">
      <input name="locale" type="hidden" value={locale} />
      <input name="id" type="hidden" value={obligation.id} />
      <input name="expectedVersion" type="hidden" value={obligation.version} />

      <div className="grid gap-2 rounded-md border border-[color:var(--border)] bg-[var(--lazo-blue-soft)] p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">
          {dictionary.currentStatus}
        </p>
        <StatusBadge dictionary={dictionary} status={obligation.status} />
      </div>

      <Field label={dictionary.nextStatus}>
        <Select
          defaultValue={defaultStatus}
          disabled={!canUpdate}
          name="status"
          required
        >
          {obligation.allowedTransitions.map((status) => (
            <option key={status} value={status}>
              {dictionary.statuses[status]}
            </option>
          ))}
          {obligation.blockedTransitions.map((transition) => (
            <option disabled key={transition.status} value={transition.status}>
              {dictionary.statuses[transition.status]}
            </option>
          ))}
        </Select>
      </Field>

      {obligation.blockedTransitions.map((transition) => (
        <p
          className="text-sm text-[color:var(--muted)]"
          key={transition.status}
        >
          {transition.reason === "document_required"
            ? dictionary.documentRequired
            : transition.reason}
        </p>
      ))}

      {!canUpdate && obligation.blockedTransitions.length === 0 ? (
        <p className="text-sm text-[color:var(--muted)]">
          {dictionary.noTransitions}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t border-[color:var(--border)] pt-4 sm:flex-row sm:justify-end">
        <SecondaryButton data-modal-close type="button">
          {dictionary.cancel}
        </SecondaryButton>
        <Button
          className="border-[color:var(--lazo-violet)] bg-[var(--lazo-violet)] hover:border-[color:var(--lazo-violet-hover)] hover:bg-[var(--lazo-violet-hover)]"
          disabled={!canUpdate}
          type="submit"
        >
          {dictionary.updateButton}
        </Button>
      </div>
    </form>
  );
}
