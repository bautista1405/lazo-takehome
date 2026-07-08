import type {
  TableCellProps,
  TableHeaderCellProps,
  TableProps,
} from "../interfaces/components";

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className={`overflow-auto ${className}`}>
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function TableHeader({ children, className = "" }: TableProps) {
  return (
    <thead className={`border-b border-neutral-200 bg-neutral-50 ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "" }: TableProps) {
  return <tbody className={`divide-y divide-neutral-200 ${className}`}>{children}</tbody>;
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
      className={`px-4 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500 ${className}`}
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
