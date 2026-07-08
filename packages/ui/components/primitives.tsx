import type {
  AlertProps,
  BadgeProps,
  ButtonProps,
  FieldProps,
  InputProps,
  PanelProps,
  SelectProps,
  TextareaProps,
} from "../interfaces/components";

export function Panel({
  children,
  className = "",
}: PanelProps) {
  return (
    <section className={`rounded-lg border border-neutral-200 bg-white ${className}`}>
      {children}
    </section>
  );
}

export function Button({
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-9 items-center justify-center rounded-md border border-neutral-950 bg-neutral-950 px-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-500 ${className}`}
      {...props}
    />
  );
}

export function SecondaryButton({
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-9 items-center justify-center rounded-md border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-950 transition hover:border-neutral-400 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500 ${className}`}
      {...props}
    />
  );
}

export function Input({
  className = "",
  ...props
}: InputProps) {
  return (
    <input
      className={`min-h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 ${className}`}
      {...props}
    />
  );
}

export function Select({
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <select
      className={`min-h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-950 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className = "",
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={`min-h-24 w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 ${className}`}
      {...props}
    />
  );
}

export function Field({
  children,
  hint,
  label,
}: FieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-neutral-950">
      {label}
      {children}
      {hint ? (
        <span className="text-xs font-normal text-neutral-500">{hint}</span>
      ) : null}
    </label>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: BadgeProps) {
  const toneClass = {
    danger: "border-red-200 bg-red-50 text-red-700",
    neutral: "border-neutral-200 bg-neutral-50 text-neutral-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
  }[tone];

  return (
    <span
      className={`inline-flex w-fit items-center rounded-md border px-2 py-1 text-xs font-medium ${toneClass}`}
    >
      {children}
    </span>
  );
}

export function Alert({ message, title, tone }: AlertProps) {
  const toneClass =
    tone === "danger"
      ? "border-red-200 bg-red-50 text-red-900"
      : "border-emerald-200 bg-emerald-50 text-emerald-900";

  return (
    <div className={`rounded-lg border p-4 ${toneClass}`} role="status">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}
