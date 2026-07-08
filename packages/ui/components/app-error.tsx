"use client";

import type { AppErrorProps } from "../interfaces/components";

export function AppError({
  error,
  reset,
  retryLabel,
  title,
}: AppErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 text-neutral-950">
      <section
        aria-labelledby="app-error-title"
        className="grid max-w-lg gap-4 rounded-lg border border-neutral-200 p-6"
      >
        <div className="grid gap-2">
          <h1 className="text-xl font-semibold" id="app-error-title">
            {title}
          </h1>
          <p className="text-sm leading-6 text-neutral-600">{error.message}</p>
        </div>
        <button
          className="inline-flex min-h-9 w-fit items-center rounded-md border border-neutral-950 bg-neutral-950 px-3 text-sm font-medium text-white"
          onClick={reset}
          type="button"
        >
          {retryLabel}
        </button>
      </section>
    </main>
  );
}
