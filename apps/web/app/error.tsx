"use client";

import { AppError } from "@repo/ui/components/app-error";
import type { ErrorBoundaryProps } from "../interfaces/app";

export default function Error({ error, reset }: ErrorBoundaryProps) {
  return (
    <AppError
      error={error}
      reset={reset}
      retryLabel="Retry"
      title="Dashboard error"
    />
  );
}
