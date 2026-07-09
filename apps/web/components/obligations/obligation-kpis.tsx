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
        value={metrics.overdue}
      />
      <MetricCard
        label={dictionary.dueSoon}
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
    danger: "text-[#5f2cc5]",
    neutral: "text-[color:var(--foreground)]",
    warning: "text-[#5f2cc5]",
  }[tone];
  const accentClass = {
    danger: "bg-[var(--lazo-violet)]",
    neutral: "bg-[var(--lazo-violet)]",
    warning: "bg-[var(--lazo-violet)]",
  }[tone];

  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-white p-4 shadow-[0_10px_24px_rgba(20,20,21,0.035)]">
      <div className={`mb-3 h-1 w-8 rounded-full ${accentClass}`} />
      <p className="text-sm text-[color:var(--muted)]">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
