import { Button, SecondaryButton } from "@repo/ui/components/primitives";
import { updateStatusAction } from "../../actions/obligations";
import type { ObligationStatusActionsProps } from "../../interfaces/obligations";

export function ObligationStatusActions({
  dictionary,
  locale,
  obligation,
}: ObligationStatusActionsProps) {
  return (
    <section className="grid gap-3">
      <h3 className="text-sm font-semibold">{dictionary.transitions}</h3>
      <div className="flex flex-wrap gap-2">
        {obligation.allowedTransitions.map((status) => (
          <form action={updateStatusAction} key={status}>
            <input name="locale" type="hidden" value={locale} />
            <input name="id" type="hidden" value={obligation.id} />
            <input
              name="expectedVersion"
              type="hidden"
              value={obligation.version}
            />
            <input name="status" type="hidden" value={status} />
            <Button type="submit">{dictionary.statuses[status]}</Button>
          </form>
        ))}

        {obligation.blockedTransitions.map((transition) => (
          <SecondaryButton disabled key={transition.status} type="button">
            {dictionary.statuses[transition.status]}
          </SecondaryButton>
        ))}
      </div>

      {obligation.blockedTransitions.map((transition) => (
        <p className="text-xs text-neutral-500" key={transition.status}>
          {transition.reason === "document_required"
            ? dictionary.documentRequired
            : transition.reason}
        </p>
      ))}

      {obligation.allowedTransitions.length === 0 &&
      obligation.blockedTransitions.length === 0 ? (
        <p className="text-sm text-neutral-500">{dictionary.noTransitions}</p>
      ) : null}
    </section>
  );
}
