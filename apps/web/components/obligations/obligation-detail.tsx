import { Badge } from "@repo/ui/components/primitives";
import type { ObligationDetailProps } from "../../interfaces/obligations";
import { formatDate } from "../../utils/obligations";
import { DetailRow } from "./detail-row";
import { ObligationHistory } from "./obligation-history";
import { StatusBadge } from "./status-badge";

export function ObligationDetail({
  dictionary,
  locale,
  obligation,
}: ObligationDetailProps) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1">
          <h3 className="text-base font-semibold">{obligation.title}</h3>
          <p className="line-clamp-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
            {obligation.description}
          </p>
        </div>
        <StatusBadge dictionary={dictionary} status={obligation.status} />
      </div>

      <dl className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        <DetailRow
          label={dictionary.type}
          value={dictionary.types[obligation.type]}
        />
        <DetailRow
          label={dictionary.dueDate}
          value={
            <span className="inline-flex items-center gap-2">
              {formatDate(obligation.dueDate, locale)}
              {obligation.overdue ? (
                <Badge tone="danger">{dictionary.overdue}</Badge>
              ) : null}
            </span>
          }
        />
        <DetailRow label={dictionary.owner} value={obligation.owner} />
        <DetailRow
          label={dictionary.requiresDocument}
          value={obligation.requiresDocument ? dictionary.yes : dictionary.no}
        />
        <DetailRow
          label={dictionary.documentUrl}
          value={
            obligation.documentUrl ? (
              <a
                className="break-all text-[color:var(--lazo-violet)] underline underline-offset-4 hover:text-[color:var(--lazo-violet-hover)]"
                href={obligation.documentUrl}
                rel="noreferrer"
                target="_blank"
              >
                {obligation.documentUrl}
              </a>
            ) : (
              "-"
            )
          }
        />
        <DetailRow
          label={dictionary.maskedCompanyTaxId}
          value={
            <span className="inline-flex items-center gap-2">
              {obligation.maskedCompanyTaxId}
              <span className="text-xs text-[color:var(--muted)]">
                v{obligation.version}
              </span>
            </span>
          }
        />
      </dl>

      <div className="grid gap-4">
        <section className="grid content-start gap-3">
          <h4 className="text-sm font-semibold">{dictionary.transitions}</h4>
          <div className="flex flex-wrap items-center gap-2">
            {obligation.allowedTransitions.map((status) => (
              <Badge key={status} tone="success">
                {dictionary.statuses[status]}
              </Badge>
            ))}
            {obligation.blockedTransitions.map((transition) => (
              <Badge key={transition.status} tone="danger">
                {dictionary.statuses[transition.status]}
              </Badge>
            ))}
            {obligation.allowedTransitions.length === 0 &&
            obligation.blockedTransitions.length === 0 ? (
              <p className="text-sm text-[color:var(--muted)]">
                {dictionary.noTransitions}
              </p>
            ) : null}
          </div>
          {obligation.blockedTransitions.map((transition) => (
            <p
              className="text-xs text-[color:var(--muted)]"
              key={transition.status}
            >
              {transition.reason === "document_required"
                ? dictionary.documentRequired
                : transition.reason}
            </p>
          ))}
        </section>

        <ObligationHistory
          dictionary={dictionary}
          locale={locale}
          statusHistory={obligation.statusHistory}
        />
      </div>
    </div>
  );
}
