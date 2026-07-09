import type { DashboardHeaderProps } from "../../interfaces/obligations";
import { dashboardHref } from "../../utils/obligations";

export function DashboardHeader({
  dictionary,
  filters,
  locale,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-[color:var(--border)] pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8e53f4]">
          Lazo Challenge
        </p>
        <div className="grid gap-2">
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            {dictionary.title}
          </h1>
        </div>
      </div>

      <nav
        aria-label={dictionary.language}
        className="flex w-fit rounded-md border border-[color:var(--border)] bg-white p-1"
      >
        {(["es", "en"] as const).map((nextLocale) => (
          <a
            aria-current={locale === nextLocale ? "page" : undefined}
            className={`rounded px-3 py-1.5 text-sm font-medium transition ${
              locale === nextLocale
                ? "bg-[var(--lazo-violet-soft)] text-[#5f2cc5]"
                : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
            }`}
            href={dashboardHref({
              locale: nextLocale,
              query: filters.query,
              status: filters.status,
            })}
            key={nextLocale}
          >
            {nextLocale === "es" ? dictionary.spanish : dictionary.english}
          </a>
        ))}
      </nav>
    </header>
  );
}
