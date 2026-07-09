import { expect, test, type Locator, type Page } from "@playwright/test";

const companyTaxId = "98-7654321";

async function openModal(page: Page, trigger: Locator): Promise<Locator> {
  const dialog = page.locator("dialog[open]");

  await expect(async () => {
    if ((await dialog.count()) > 0) {
      await page.keyboard.press("Escape");
    }
    await trigger.click({ timeout: 2_000 });
    await expect(dialog).toBeVisible({ timeout: 2_000 });
  }).toPass();

  return dialog;
}

test("document-gated submission is enforced end to end", async ({ page }) => {
  const title = `Doc gate e2e ${Date.now()}`;

  await page.goto("/?locale=en");

  //create an obligation that requires a document without attaching one
  const createDialog = await openModal(
    page,
    page.getByRole("button", { name: "New Obligation" }),
  );

  await createDialog.getByLabel("Title", { exact: true }).fill(title);
  await createDialog.getByLabel("Owner").fill("Legal Ops");
  await createDialog.getByLabel("Due date").fill("2026-12-31");
  await createDialog.getByLabel("Description").fill("Playwright doc gate flow");
  await createDialog.getByLabel("Requires document").check();
  await createDialog.getByLabel("Company tax ID").fill(companyTaxId);
  await createDialog
    .getByRole("button", { name: "Create", exact: true })
    .click();

  const row = page.locator("tr").filter({ hasText: title });
  await expect(row).toBeVisible();
  await expect(row).toContainText("Pending");

  //render masked taxId
  await expect(row).toContainText("**-***4321");
  await expect(page.locator("body")).not.toContainText(companyTaxId);

  //update to in_progress (the only allowed from pending)
  let statusDialog = await openModal(
    page,
    row.getByRole("button", { name: "Update status" }),
  );
  await statusDialog
    .getByLabel("Next status")
    .selectOption({ label: "In progress" });
  await statusDialog.getByRole("button", { name: "Update" }).click();
  await expect(row).toContainText("In progress");

  //submitted is blocked by the backend when there is no document
  //navigate to a clean URL so the pending success-param cleanup cannot
  //trigger a re-render that closes the modal about to open
  await expect(async () => {
    await page.goto("/?locale=en");
    statusDialog = await openModal(
      page,
      row.getByRole("button", { name: "Update status" }),
    );
    await expect(
      statusDialog.getByRole("option", { name: "Submitted" }),
    ).toHaveJSProperty("disabled", true, { timeout: 1_000 });
  }).toPass();
  await expect(
    statusDialog.getByText("Attach a document before submitting."),
  ).toBeVisible();
  await statusDialog.getByRole("button", { name: "Cancel" }).click();

  //attach a document through the edit form.
  const editDialog = await openModal(
    page,
    row.getByRole("button", { name: "Edit details" }),
  );
  await editDialog
    .getByLabel("Document URL")
    .fill("https://example.com/evidence.pdf");
  await editDialog.getByRole("button", { name: "Update" }).click();

  //the gate opens once the document is attached: submitted becomes selectable
  await expect(async () => {
    await page.goto("/?locale=en");
    statusDialog = await openModal(
      page,
      row.getByRole("button", { name: "Update status" }),
    );
    await expect(
      statusDialog.getByRole("option", { name: "Submitted" }),
    ).toHaveJSProperty("disabled", false, { timeout: 1_000 });
  }).toPass();
  await statusDialog
    .getByLabel("Next status")
    .selectOption({ label: "Submitted" });
  await statusDialog.getByRole("button", { name: "Update" }).click();
  await expect(row).toContainText("Submitted");

  //delete flow
  await page.goto("/?locale=en");
  const deleteDialog = await openModal(
    page,
    row.getByRole("button", { name: "Delete", exact: true }),
  );
  await deleteDialog.getByRole("button", { name: "Yes, delete" }).click();
  await expect(row).toHaveCount(0);
});
