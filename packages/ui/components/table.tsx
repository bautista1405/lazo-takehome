import type {
  TableCellProps,
  TableHeaderCellProps,
  TableProps,
} from "../interfaces/components";

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className={`overflow-auto ${className}`}>
      <table className="w-full border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = "" }: TableProps) {
  return (
    <thead
      className={`border-b border-[color:var(--border)] bg-[var(--lazo-violet-soft)] ${className}`}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "" }: TableProps) {
  return (
    <tbody className={`divide-y divide-[color:var(--border)] ${className}`}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = "" }: TableProps) {
  return <tr className={className}>{children}</tr>;
}

export function TableHeaderCell({
  children,
  className = "",
  ...props
}: TableHeaderCellProps) {
  return (
    <th
      className={`px-4 py-3 text-xs font-medium uppercase tracking-wide text-[color:var(--muted)] ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className = "",
  ...props
}: TableCellProps) {
  return (
    <td className={`px-4 py-3 align-top ${className}`} {...props}>
      {children}
    </td>
  );
}
