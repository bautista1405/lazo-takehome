import type { ObligationHistoryProps } from "../../interfaces/obligations";
import { formatDateTime } from "../../utils/obligations";

export function ObligationHistory({
  dictionary,
  locale,
  statusHistory,
}: ObligationHistoryProps) {
  return (
    <section className="grid gap-3">
      <h4 className="text-sm font-semibold">{dictionary.statusHistory}</h4>
      {statusHistory.length > 0 ? (
        <ol className="grid max-h-44 gap-2 overflow-y-auto pr-1">
          {statusHistory.map((entry) => (
            <li
              className="rounded-md border border-[color:var(--border)] bg-[var(--lazo-blue-soft)] px-3 py-2 text-sm"
              key={entry.id}
            >
              <p className="font-medium">
                {dictionary.statuses[entry.fromStatus]}
                {" -> "}
                {dictionary.statuses[entry.toStatus]}
              </p>
              <p className="text-xs text-[color:var(--muted)]">
                {formatDateTime(entry.changedAt, locale)}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-[color:var(--muted)]">
          {dictionary.noHistory}
        </p>
      )}
    </section>
  );
}
