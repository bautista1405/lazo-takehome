import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ThHTMLAttributes,
  TdHTMLAttributes,
} from "react";

export interface PanelProps {
  children: ReactNode;
  className?: string;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  className?: string;
}

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export interface FieldProps {
  children: ReactNode;
  hint?: string;
  label: string;
}

export interface BadgeProps {
  children: ReactNode;
  tone?: "danger" | "neutral" | "success" | "warning";
}

export interface AlertProps {
  message: string;
  title: string;
  tone: "danger" | "success";
}

export interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  retryLabel: string;
  title: string;
}

export interface TableProps {
  children: ReactNode;
  className?: string;
}

export interface TableHeaderCellProps
  extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  className?: string;
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  className?: string;
}

export interface CardProps {
  children: ReactNode;
  className?: string;
  href: string;
  title: string;
}

export interface CodeProps {
  children: ReactNode;
  className?: string;
}
