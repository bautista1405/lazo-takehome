import { Badge } from "@repo/ui/components/primitives";
import type { DocumentStatusProps } from "../../interfaces/obligations";

export function DocumentStatus({ dictionary, obligation }: DocumentStatusProps) {
  if (obligation.documentUrl) {
    return (
      <a
        className="text-sm text-[color:var(--lazo-violet)] underline underline-offset-4 hover:text-[color:var(--lazo-violet-hover)]"
        href={obligation.documentUrl}
        rel="noreferrer"
        target="_blank"
      >
        {dictionary.documentAttached}
      </a>
    );
  }

  if (obligation.requiresDocument) {
    return <Badge tone="danger">{dictionary.documentMissing}</Badge>;
  }

  return (
    <span className="text-sm text-[color:var(--muted)]">
      {dictionary.documentNotRequired}
    </span>
  );
}
