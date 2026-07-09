import { OBLIGATION_TYPES } from "@repo/types";
import type { ReactNode } from "react";
import {
  Button,
  Input,
  Select,
  SecondaryButton,
  SuccessButton,
  Textarea,
} from "@repo/ui/components/primitives";
import {
  createObligationAction,
  updateObligationAction,
} from "../../actions/obligations";
import type { ObligationFormProps } from "../../interfaces/obligations";

const compactInputClassName = "min-h-8 px-2.5";
const compactTextareaClassName = "min-h-14 max-h-14 resize-none px-2.5 py-1.5";

export function ObligationForm({
  dictionary,
  locale,
  mode,
  obligation,
}: ObligationFormProps) {
  const isEdit = mode === "edit";
  const formId = isEdit ? `edit-${obligation?.id}` : "create-obligation";

  return (
    <form
      action={isEdit ? updateObligationAction : createObligationAction}
      className="grid gap-3"
    >
      <input name="locale" type="hidden" value={locale} />
      {isEdit && obligation ? (
        <>
          <input name="id" type="hidden" value={obligation.id} />
          <input
            name="expectedVersion"
            type="hidden"
            value={obligation.version}
          />
        </>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <CompactField label={dictionary.titleField}>
          <Input
            className={compactInputClassName}
            defaultValue={obligation?.title}
            minLength={1}
            name="title"
            required
          />
        </CompactField>

        <CompactField label={dictionary.owner}>
          <Input
            className={compactInputClassName}
            defaultValue={obligation?.owner}
            minLength={1}
            name="owner"
            required
          />
        </CompactField>

        <CompactField label={dictionary.type}>
          <Select
            className={compactInputClassName}
            defaultValue={obligation?.type ?? "annual_report"}
            name="type"
            required
          >
            {OBLIGATION_TYPES.map((type) => (
              <option key={type} value={type}>
                {dictionary.types[type]}
              </option>
            ))}
          </Select>
        </CompactField>

        <CompactField label={dictionary.dueDate}>
          <Input
            className={compactInputClassName}
            defaultValue={obligation?.dueDate}
            id={`${formId}-due-date`}
            name="dueDate"
            required
            type="date"
          />
        </CompactField>
      </div>

      <CompactField label={dictionary.description}>
        <Textarea
          className={compactTextareaClassName}
          defaultValue={obligation?.description}
          minLength={1}
          name="description"
          required
        />
      </CompactField>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-end">
        <CompactField label={dictionary.documentUrl}>
          <Input
            className={compactInputClassName}
            defaultValue={obligation?.documentUrl ?? ""}
            name="documentUrl"
            placeholder="https://example.com/document.pdf"
            type="url"
          />
        </CompactField>

        <label className="flex min-h-8 items-center gap-2 rounded-md border border-neutral-200 px-2.5 text-sm font-medium">
          <input
            className="size-4 rounded border-neutral-300"
            defaultChecked={obligation?.requiresDocument ?? false}
            name="requiresDocument"
            type="checkbox"
          />
          {dictionary.requiresDocument}
        </label>
      </div>

      <CompactField
        hint={isEdit ? dictionary.taxIdEditHint : undefined}
        label={dictionary.companyTaxId}
      >
        <Input
          autoComplete="off"
          className={compactInputClassName}
          defaultValue=""
          minLength={isEdit ? undefined : 4}
          name="companyTaxId"
          placeholder={isEdit ? obligation?.maskedCompanyTaxId : "12-3456789"}
          required={!isEdit}
        />
      </CompactField>

      <div className="flex flex-col-reverse gap-2 border-t border-neutral-200 pt-3 sm:flex-row sm:justify-end">
        <SecondaryButton data-modal-close type="button">
          {dictionary.cancel}
        </SecondaryButton>
        {isEdit ? (
          <Button type="submit">{dictionary.updateButton}</Button>
        ) : (
          <SuccessButton type="submit">{dictionary.createButton}</SuccessButton>
        )}
      </div>
    </form>
  );
}

function CompactField({
  children,
  hint,
  label,
}: {
  children: ReactNode;
  hint?: string;
  label: string;
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-neutral-950">
      {label}
      {children}
      {hint ? (
        <span className="text-xs font-normal text-neutral-500">{hint}</span>
      ) : null}
    </label>
  );
}
