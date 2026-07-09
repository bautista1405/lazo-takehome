import { DangerButton, SecondaryButton } from "@repo/ui/components/primitives";
import { deleteObligationAction } from "../../actions/obligations";
import type { DeleteObligationConfirmationProps } from "../../interfaces/obligations";

export function DeleteObligationConfirmation({
  dictionary,
  locale,
  obligation,
}: DeleteObligationConfirmationProps) {
  return (
    <div className="grid gap-4">
      <p className="text-sm leading-6 text-[color:var(--muted)]">
        {dictionary.deleteConfirmation}
      </p>
      <div className="rounded-md border border-red-200 bg-red-50 p-3">
        <p className="text-sm font-semibold text-red-900">{obligation.title}</p>
        <p className="mt-1 text-xs text-red-700">
          {dictionary.maskedCompanyTaxId}: {obligation.maskedCompanyTaxId}
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-[color:var(--border)] pt-4 sm:flex-row sm:justify-end">
        <SecondaryButton data-modal-close type="button">
          {dictionary.no}
        </SecondaryButton>
        <form action={deleteObligationAction}>
          <input name="locale" type="hidden" value={locale} />
          <input name="id" type="hidden" value={obligation.id} />
          <DangerButton className="w-full sm:w-auto" type="submit">
            {dictionary.confirmDelete}
          </DangerButton>
        </form>
      </div>
    </div>
  );
}
