import type { ObligationStatus } from "@repo/types";
import { Badge } from "@repo/ui/components/primitives";
import type { StatusBadgeProps } from "../../interfaces/obligations";

export function StatusBadge({ dictionary, status }: StatusBadgeProps) {
  const tone: Record<ObligationStatus, "neutral" | "success" | "warning"> = {
    done: "success",
    in_progress: "warning",
    pending: "neutral",
    submitted: "neutral",
  };
  const statusLabel = dictionary.statuses[
    status as keyof typeof dictionary.statuses
  ];

  return <Badge tone={tone[status]}>{statusLabel}</Badge>;
}
