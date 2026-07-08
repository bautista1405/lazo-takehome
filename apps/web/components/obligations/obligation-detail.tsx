import { Panel } from "@repo/ui/components/primitives";
import type { ObligationDetailProps } from "../../interfaces/obligations";
import { formatDate } from "../../utils/obligations";
import { DetailRow } from "./detail-row";
import { ObligationHistory } from "./obligation-history";
import { ObligationStatusActions } from "./obligation-status-actions";
import { StatusBadge } from "./status-badge";

export function ObligationDetail({
  dictionary,
  locale,
  obligation,
}: ObligationDetailProps) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-neutral-200 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-2">
          <h2 className="text-xl font-semibold">{obligation.title}</h2>
          <p className="max-w-3xl text-sm leading-6 text-neutral-600">
            {obligation.description}
          </p>
        </div>
        <StatusBadge dictionary={dictionary} status={obligation.status} />
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <dl className="grid gap-3 sm:grid-cols-2">
          <DetailRow
            label={dictionary.type}
            value={dictionary.types[obligation.type]}
          />
          <DetailRow
            label={dictionary.status}
            value={dictionary.statuses[obligation.status]}
          />
          <DetailRow
            label={dictionary.dueDate}
            value={formatDate(obligation.dueDate, locale)}
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
                  className="text-neutral-950 underline underline-offset-4"
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
            value={obligation.maskedCompanyTaxId}
          />
          <DetailRow
            label={dictionary.version}
            value={String(obligation.version)}
          />
        </dl>

        <div className="grid gap-5">
          <ObligationStatusActions
            dictionary={dictionary}
            locale={locale}
            obligation={obligation}
          />
          <ObligationHistory
            dictionary={dictionary}
            locale={locale}
            statusHistory={obligation.statusHistory}
          />
        </div>
      </div>
    </Panel>
  );
}
