import type { DetailRowProps } from "../../interfaces/obligations";

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="rounded-md border border-neutral-200 p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm text-neutral-950">{value}</dd>
    </div>
  );
}
