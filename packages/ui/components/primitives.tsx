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

export const subtleActionClassName =
  "inline-flex min-h-9 cursor-pointer items-center rounded-md border border-[color:var(--border)] bg-white px-3 text-sm font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--lazo-violet)] hover:bg-[var(--lazo-violet-soft)] hover:text-[color:var(--foreground)]";

export function Panel({ children, className = "" }: PanelProps) {
  return (
    <section
      className={`rounded-lg border border-[color:var(--border)] bg-[var(--lazo-surface)] shadow-[0_10px_30px_rgba(20,20,21,0.04)] ${className}`}
    >
      {children}
    </section>
  );
}

export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-8 cursor-pointer items-center justify-center rounded-md border border-[color:var(--lazo-violet)] bg-[var(--lazo-violet)] px-3 text-sm font-medium text-white transition hover:border-[color:var(--lazo-violet-hover)] hover:bg-[var(--lazo-violet-hover)] disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-500 ${className}`}
      {...props}
    />
  );
}

export function SecondaryButton({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-9 cursor-pointer items-center justify-center rounded-md border border-[color:var(--border)] bg-[var(--lazo-surface-muted)] px-3 text-sm font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--lazo-gray-border)] hover:bg-[var(--lazo-gray-hover)] disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500 ${className}`}
      {...props}
    />
  );
}

export function SuccessButton({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-9 cursor-pointer items-center justify-center rounded-md border border-[color:var(--lazo-violet)] bg-[var(--lazo-violet)] px-3 text-sm font-medium text-white transition hover:border-[color:var(--lazo-violet-hover)] hover:bg-[var(--lazo-violet-hover)] disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-500 ${className}`}
      {...props}
    />
  );
}

export function DangerButton({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-9 cursor-pointer items-center justify-center rounded-md border border-[color:var(--lazo-gray-border)] bg-[var(--lazo-surface-muted)] px-3 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-[var(--lazo-gray-hover)] disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-500 ${className}`}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`min-h-8 w-full rounded-md border border-[color:var(--border)] bg-white px-3 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[#8a8e93] focus:border-[color:var(--lazo-violet)] ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      className={`min-h-9 w-full rounded-md border border-[color:var(--border)] bg-white px-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--lazo-violet)] ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`min-h-24 w-full resize-y rounded-md border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[#8a8e93] focus:border-[color:var(--lazo-violet)] ${className}`}
      {...props}
    />
  );
}

export function Field({ children, hint, label }: FieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[color:var(--foreground)]">
      {label}
      {children}
      {hint ? (
        <span className="text-xs font-normal text-[color:var(--muted)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  const toneClass = {
    danger: "border-red-200 bg-red-50 text-red-700",
    neutral:
      "border-[color:var(--lazo-violet-border)] bg-[var(--lazo-violet-soft)] text-[#5f2cc5]",
    success:
      "border-[color:var(--lazo-green)] bg-[var(--lazo-green-soft)] text-[#151517]",
    warning:
      "border-[color:var(--lazo-blue)] bg-[var(--lazo-blue-soft)] text-[#3a4554]",
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
      : "border-[color:var(--lazo-green)] bg-[var(--lazo-green-soft)] text-[#151517]";

  return (
    <div className={`rounded-lg border p-4 ${toneClass}`} role="status">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}
