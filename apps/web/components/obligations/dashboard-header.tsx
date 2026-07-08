import type { DashboardHeaderProps } from "../../interfaces/obligations";
import { dashboardHref } from "../../utils/obligations";

export function DashboardHeader({
  dictionary,
  filters,
  locale,
  selectedId,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-neutral-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
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
        className="flex w-fit rounded-md border border-neutral-200 p-1"
      >
        {(["es", "en"] as const).map((nextLocale) => (
          <a
            aria-current={locale === nextLocale ? "page" : undefined}
            className={`rounded px-3 py-1.5 text-sm font-medium transition ${
              locale === nextLocale
                ? "bg-neutral-200 text-white"
                : "text-neutral-600 hover:text-neutral-950"
            }`}
            href={dashboardHref({
              locale: nextLocale,
              query: filters.query,
              selectedId,
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
