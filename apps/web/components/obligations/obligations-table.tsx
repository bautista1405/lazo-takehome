import { Modal } from "@repo/ui/components/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@repo/ui/components/table";
import type { ObligationTableProps } from "../../interfaces/obligations";
import { formatDate } from "../../utils/obligations";
import { DeleteObligationConfirmation } from "./delete-obligation-confirmation";
import { ObligationForm } from "./obligation-form";
import { ObligationStatusForm } from "./obligation-status-form";
import { StatusBadge } from "./status-badge";

export function ObligationsTable({
  dictionary,
  locale,
  obligations,
}: ObligationTableProps) {
  return (
    <div className="grid">
      {obligations.length > 0 ? (
        <Table className="max-h-[720px]">
          <TableHeader>
            <TableRow>
              <TableHeaderCell>{dictionary.titleField}</TableHeaderCell>
              <TableHeaderCell>{dictionary.type}</TableHeaderCell>
              <TableHeaderCell>{dictionary.status}</TableHeaderCell>
              <TableHeaderCell>{dictionary.dueDate}</TableHeaderCell>
              <TableHeaderCell>{dictionary.owner}</TableHeaderCell>
              <TableHeaderCell>{dictionary.maskedCompanyTaxId}</TableHeaderCell>
              <TableHeaderCell className="text-right">
                {dictionary.actions}
              </TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {obligations.map((obligation) => (
              <TableRow
                className={`transition hover:bg-[var(--lazo-blue-soft)] ${
                  obligation.overdue ? "bg-red-50/50" : ""
                }`}
                key={obligation.id}
              >
                <TableCell className="min-w-64 font-medium text-[color:var(--foreground)]">
                  <div className="grid gap-1">
                    <span>{obligation.title}</span>
                    <span className="line-clamp-2 text-xs font-normal leading-5 text-[color:var(--muted)]">
                      {obligation.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{dictionary.types[obligation.type]}</TableCell>
                <TableCell>
                  <StatusBadge
                    dictionary={dictionary}
                    status={obligation.status}
                  />
                </TableCell>
                <TableCell>{formatDate(obligation.dueDate, locale)}</TableCell>
                <TableCell>{obligation.owner}</TableCell>
                <TableCell>{obligation.maskedCompanyTaxId}</TableCell>
                <TableCell className="min-w-84">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Modal
                      className="w-[min(760px,calc(100vw-2rem))]"
                      closeLabel={dictionary.close}
                      title={dictionary.edit}
                      triggerLabel={dictionary.editDetails}
                    >
                      <ObligationForm
                        dictionary={dictionary}
                        locale={locale}
                        mode="edit"
                        obligation={obligation}
                      />
                    </Modal>
                    <Modal
                      closeLabel={dictionary.close}
                      title={dictionary.updateStatus}
                      triggerLabel={dictionary.updateStatus}
                      triggerVariant="primary"
                    >
                      <ObligationStatusForm
                        dictionary={dictionary}
                        locale={locale}
                        obligation={obligation}
                      />
                    </Modal>
                    <Modal
                      className="w-[min(460px,calc(100vw-2rem))]"
                      closeLabel={dictionary.close}
                      title={dictionary.deleteObligation}
                      triggerLabel={dictionary.delete}
                      triggerVariant="danger"
                    >
                      <DeleteObligationConfirmation
                        dictionary={dictionary}
                        locale={locale}
                        obligation={obligation}
                      />
                    </Modal>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="p-4 text-sm text-[color:var(--muted)]">
          {dictionary.noObligations}
        </p>
      )}
    </div>
  );
}
