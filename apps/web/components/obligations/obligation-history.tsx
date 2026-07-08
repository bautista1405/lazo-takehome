import type { ObligationHistoryProps } from "../../interfaces/obligations";
import { formatDateTime } from "../../utils/obligations";

export function ObligationHistory({
  dictionary,
  locale,
  statusHistory,
}: ObligationHistoryProps) {
  return (
    <section className="grid gap-3">
      <h3 className="text-sm font-semibold">{dictionary.statusHistory}</h3>
      {statusHistory.length > 0 ? (
        <ol className="grid gap-2">
          {statusHistory.map((entry) => (
            <li
              className="rounded-md border border-neutral-200 p-3 text-sm"
              key={entry.id}
            >
              <p className="font-medium">
                {dictionary.statuses[entry.fromStatus]}
                {" -> "}
                {dictionary.statuses[entry.toStatus]}
              </p>
              <p className="text-xs text-neutral-500">
                {formatDateTime(entry.changedAt, locale)}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-neutral-500">{dictionary.noHistory}</p>
      )}
    </section>
  );
}
