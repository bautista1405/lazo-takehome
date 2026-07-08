import Link from "next/link";
import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@repo/ui/components/table";
import type { ObligationTableProps } from "../../interfaces/obligations";
import { dashboardHref, formatDate } from "../../utils/obligations";
import { StatusBadge } from "./status-badge";

export function ObligationsTable({
  dictionary,
  filters,
  locale,
  obligations,
  selectedId,
}: ObligationTableProps) {
  return (
    <div className="grid max-h-[760px] overflow-auto">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <h2 className="text-base font-semibold">{dictionary.obligationList}</h2>
        <span className="text-sm text-neutral-500">{obligations.length}</span>
      </div>

      {obligations.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>{dictionary.titleField}</TableHeaderCell>
              <TableHeaderCell>{dictionary.status}</TableHeaderCell>
              <TableHeaderCell>{dictionary.dueDate}</TableHeaderCell>
              <TableHeaderCell>{dictionary.owner}</TableHeaderCell>
              <TableHeaderCell>{dictionary.view}</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {obligations.map((obligation) => {
              const href = dashboardHref({
                locale,
                query: filters.query,
                selectedId: obligation.id,
                status: filters.status,
              });
              const linkLabel = `${dictionary.view}: ${obligation.title}`;

              return (
                <TableRow
                  className={`transition hover:bg-neutral-50 ${
                    obligation.id === selectedId ? "bg-neutral-50" : ""
                  } ${obligation.overdue ? "bg-red-50/50" : ""}`}
                  key={obligation.id}
                >
                  <TableCell className="font-medium">
                    <TableCellLink href={href} label={linkLabel}>
                      {obligation.title}
                    </TableCellLink>
                  </TableCell>
                  <TableCell>
                    <TableCellLink href={href} label={linkLabel}>
                      <StatusBadge
                        dictionary={dictionary}
                        status={obligation.status}
                      />
                    </TableCellLink>
                  </TableCell>
                  <TableCell>
                    <TableCellLink href={href} label={linkLabel}>
                      {formatDate(obligation.dueDate, locale)}
                    </TableCellLink>
                  </TableCell>
                  <TableCell>
                    <TableCellLink href={href} label={linkLabel}>
                      {obligation.owner}
                    </TableCellLink>
                  </TableCell>
                  <TableCell>
                    <TableCellLink
                      className="font-medium underline underline-offset-4"
                      href={href}
                      label={linkLabel}
                    >
                      {dictionary.view}
                    </TableCellLink>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <p className="p-4 text-sm text-neutral-500">
          {dictionary.noObligations}
        </p>
      )}
    </div>
  );
}

function TableCellLink({
  children,
  className = "",
  href,
  label,
}: {
  children: ReactNode;
  className?: string;
  href: string;
  label: string;
}) {
  return (
    <Link
      aria-label={label}
      className={`block -mx-4 -my-3 px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 ${className}`}
      href={href}
    >
      {children}
    </Link>
  );
}
