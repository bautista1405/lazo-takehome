"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createObligation,
  deleteObligation,
  toApiError,
  updateObligation,
  updateObligationStatus,
} from "../api/obligations";
import { getLocale } from "../i18n";
import {
  readCreatePayload,
  readOptionalString,
  readRequiredString,
  readStatus,
  readUpdatePayload,
  readVersion,
} from "../utils/obligation-form";
import { dashboardHref } from "../utils/obligations";

export async function createObligationAction(
  formData: FormData,
): Promise<void> {
  const locale = getLocale(readOptionalString(formData, "locale"));
  let createdId: string;

  try {
    const created = await createObligation(readCreatePayload(formData));
    createdId = created.id;
  } catch (error) {
    redirect(dashboardHref({ locale, error: toApiError(error).message }));
  }

  revalidatePath("/");
  redirect(
    dashboardHref({ locale, selectedId: createdId, success: "created" }),
  );
}

export async function updateObligationAction(
  formData: FormData,
): Promise<void> {
  const locale = getLocale(readOptionalString(formData, "locale"));
  const id = readRequiredString(formData, "id");

  try {
    await updateObligation(id, readUpdatePayload(formData));
  } catch (error) {
    redirect(
      dashboardHref({
        locale,
        selectedId: id,
        error: toApiError(error).message,
      }),
    );
  }

  revalidatePath("/");
  redirect(dashboardHref({ locale, selectedId: id, success: "updated" }));
}

export async function updateStatusAction(formData: FormData): Promise<void> {
  const locale = getLocale(readOptionalString(formData, "locale"));
  const id = readRequiredString(formData, "id");
  let updatedId: string;

  try {
    const updated = await updateObligationStatus(id, {
      status: readStatus(formData, "status"),
      expectedVersion: readVersion(formData),
    });
    updatedId = updated.id;
  } catch (error) {
    redirect(
      dashboardHref({
        locale,
        selectedId: id,
        error: toApiError(error).message,
      }),
    );
  }

  revalidatePath("/");
  redirect(
    dashboardHref({
      locale,
      selectedId: updatedId,
      success: "status-updated",
    }),
  );
}

export async function deleteObligationAction(
  formData: FormData,
): Promise<void> {
  const locale = getLocale(readOptionalString(formData, "locale"));
  const id = readRequiredString(formData, "id");

  try {
    await deleteObligation(id);
  } catch (error) {
    redirect(
      dashboardHref({
        locale,
        selectedId: id,
        error: toApiError(error).message,
      }),
    );
  }

  revalidatePath("/");
  redirect(dashboardHref({ locale, success: "deleted" }));
}
