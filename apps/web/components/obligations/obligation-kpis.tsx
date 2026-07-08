import type {
  MetricCardProps,
  ObligationKpisProps,
} from "../../interfaces/obligations";
import { formatStatusCounts } from "../../utils/obligations";

export function ObligationKpis({ dictionary, metrics }: ObligationKpisProps) {
  return (
    <section
      aria-label="KPIs"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      <MetricCard label={dictionary.total} value={metrics.total} />
      <MetricCard
        label={dictionary.overdue}
        tone="danger"
        value={metrics.overdue}
      />
      <MetricCard
        label={dictionary.dueSoon}
        tone="warning"
        value={metrics.dueSoon}
      />
      <MetricCard
        label={dictionary.byStatus}
        value={formatStatusCounts(metrics.byStatus, dictionary)}
      />
    </section>
  );
}

function MetricCard({ label, tone = "neutral", value }: MetricCardProps) {
  const toneClass = {
    danger: "text-red-600",
    neutral: "text-neutral-950",
    warning: "text-amber-600",
  }[tone];

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
