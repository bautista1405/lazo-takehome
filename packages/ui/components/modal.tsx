"use client";

import { useId, useRef, type MouseEvent } from "react";
import type { ModalProps, ModalTriggerVariant } from "../interfaces/components";
import { subtleActionClassName } from "./primitives";

const triggerClasses: Record<ModalTriggerVariant, string> = {
  danger: subtleActionClassName,
  primary: subtleActionClassName,
  secondary: subtleActionClassName,
  success:
    "inline-flex min-h-9 cursor-pointer items-center justify-center rounded-md border border-[color:var(--lazo-violet)] bg-[var(--lazo-violet)] px-3 text-sm font-medium text-white transition hover:border-[color:var(--lazo-violet-hover)] hover:bg-[var(--lazo-violet-hover)]",
};

export function Modal({
  children,
  className = "",
  closeLabel = "Close",
  description,
  title,
  triggerClassName = "",
  triggerLabel,
  triggerVariant = "secondary",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const widthClassName = /(?:^|\s)w-/.test(className)
    ? ""
    : "w-[min(640px,calc(100vw-2rem))]";

  function openDialog() {
    const dialog = dialogRef.current;

    if (!dialog || dialog.open) {
      return;
    }

    dialog.showModal();
  }

  function closeFromClick(event: MouseEvent<HTMLDialogElement>) {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (target === dialogRef.current || target.closest("[data-modal-close]")) {
      dialogRef.current?.close();
    }
  }

  return (
    <>
      <button
        className={`${triggerClasses[triggerVariant]} justify-center disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-500 ${triggerClassName}`}
        onClick={openDialog}
        type="button"
      >
        {triggerLabel}
      </button>

      <dialog
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        className={`fixed left-1/2 top-1/2 m-0 ${widthClassName} max-w-none -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[color:var(--border)] bg-white p-0 text-[color:var(--foreground)] shadow-[0_24px_60px_rgba(20,20,21,0.18)] backdrop:bg-neutral-950/30 ${className}`}
        onClick={closeFromClick}
        ref={dialogRef}
      >
        <div className="grid max-h-[calc(100vh-2rem)] overflow-hidden">
          <header className="flex items-start justify-between gap-4 border-b border-[color:var(--border)] bg-[var(--lazo-violet-soft)] px-4 py-3">
            <div className="grid gap-1">
              <h2 className="text-base font-semibold" id={titleId}>
                {title}
              </h2>
              {description ? (
                <p
                  className="text-sm text-[color:var(--muted)]"
                  id={descriptionId}
                >
                  {description}
                </p>
              ) : null}
            </div>
            <button
              aria-label={closeLabel}
              className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-[color:var(--lazo-violet-border)] bg-white text-sm font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--lazo-violet)] hover:text-[color:var(--foreground)]"
              data-modal-close
              type="button"
            >
              x
            </button>
          </header>
          <div className="overflow-y-auto p-4">{children}</div>
        </div>
      </dialog>
    </>
  );
}
