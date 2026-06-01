import { expect, test } from "@playwright/test";

test("landing and login render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Una vista más clara del expediente académico",
  );

  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Entrar al portal" })).toBeVisible();
});
