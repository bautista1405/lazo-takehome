import { OBLIGATION_TYPES } from "@repo/types";
import {
  Button,
  Field,
  Input,
  Panel,
  Select,
  Textarea,
} from "@repo/ui/components/primitives";
import {
  createObligationAction,
  updateObligationAction,
} from "../../actions/obligations";
import type { ObligationFormProps } from "../../interfaces/obligations";

export function ObligationForm({
  dictionary,
  locale,
  mode,
  obligation,
}: ObligationFormProps) {
  const isEdit = mode === "edit";
  const formId = isEdit ? `edit-${obligation?.id}` : "create-obligation";

  return (
    <Panel className="p-5">
      <h2 className="text-base font-semibold">
        {isEdit ? dictionary.edit : dictionary.create}
      </h2>
      <form
        action={isEdit ? updateObligationAction : createObligationAction}
        className="mt-4 grid gap-4"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={dictionary.type}>
            <Select
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
          </Field>

          <Field label={dictionary.dueDate}>
            <Input
              defaultValue={obligation?.dueDate}
              id={`${formId}-due-date`}
              name="dueDate"
              required
              type="date"
            />
          </Field>
        </div>

        <Field label={dictionary.titleField}>
          <Input
            defaultValue={obligation?.title}
            minLength={1}
            name="title"
            required
          />
        </Field>

        <Field label={dictionary.description}>
          <Textarea
            defaultValue={obligation?.description}
            minLength={1}
            name="description"
            required
          />
        </Field>

        <Field label={dictionary.owner}>
          <Input
            defaultValue={obligation?.owner}
            minLength={1}
            name="owner"
            required
          />
        </Field>

        <label className="flex items-center gap-3 rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium">
          <input
            className="size-4 rounded border-neutral-300"
            defaultChecked={obligation?.requiresDocument ?? false}
            name="requiresDocument"
            type="checkbox"
          />
          {dictionary.requiresDocument}
        </label>

        <Field label={dictionary.documentUrl}>
          <Input
            defaultValue={obligation?.documentUrl ?? ""}
            name="documentUrl"
            placeholder="https://example.com/document.pdf"
            type="url"
          />
        </Field>

        <Field
          hint={isEdit ? dictionary.taxIdEditHint : undefined}
          label={dictionary.companyTaxId}
        >
          <Input
            autoComplete="off"
            defaultValue=""
            minLength={isEdit ? undefined : 4}
            name="companyTaxId"
            placeholder={isEdit ? obligation?.maskedCompanyTaxId : "12-3456789"}
            required={!isEdit}
          />
        </Field>

        <Button type="submit">
          {isEdit ? dictionary.updateButton : dictionary.createButton}
        </Button>
      </form>
    </Panel>
  );
}
