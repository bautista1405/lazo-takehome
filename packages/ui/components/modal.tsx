"use client";

import { useId, useRef, type MouseEvent } from "react";
import type { ModalProps, ModalTriggerVariant } from "../interfaces/components";

const triggerClasses: Record<ModalTriggerVariant, string> = {
  danger:
    "border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700",
  primary:
    "border-neutral-950 bg-neutral-950 text-white hover:border-neutral-800 hover:bg-neutral-800",
  secondary:
    "border-neutral-200 bg-white text-neutral-950 hover:border-neutral-400",
  success:
    "border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700",
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
        className={`inline-flex min-h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-500 ${triggerClasses[triggerVariant]} ${triggerClassName}`}
        onClick={openDialog}
        type="button"
      >
        {triggerLabel}
      </button>

      <dialog
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        className={`fixed left-1/2 top-1/2 m-0 ${widthClassName} max-w-none -translate-x-1/2 -translate-y-1/2 rounded-lg border border-neutral-200 bg-white p-0 text-neutral-950 shadow-2xl backdrop:bg-neutral-950/30 ${className}`}
        onClick={closeFromClick}
        ref={dialogRef}
      >
        <div className="grid max-h-[calc(100vh-2rem)] overflow-hidden">
          <header className="flex items-start justify-between gap-4 border-b border-neutral-200 px-4 py-3">
            <div className="grid gap-1">
              <h2 className="text-base font-semibold" id={titleId}>
                {title}
              </h2>
              {description ? (
                <p className="text-sm text-neutral-500" id={descriptionId}>
                  {description}
                </p>
              ) : null}
            </div>
            <button
              aria-label={closeLabel}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-sm font-semibold text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-950"
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
