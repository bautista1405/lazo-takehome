import type { DetailRowProps } from "../../interfaces/obligations";

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="rounded-md border border-[color:var(--border)] px-3 py-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-sm text-[color:var(--foreground)]">
        {value}
      </dd>
    </div>
  );
}
