import { type JSX } from "react";
import type { CodeProps } from "../interfaces/components";

export function Code({
  children,
  className,
}: CodeProps): JSX.Element {
  return <code className={className}>{children}</code>;
}
