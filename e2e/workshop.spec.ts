import { test, expect } from "@playwright/test";

test("đáp án ẩn mặc định, hiện sau khi bấm và có ma trận BR×TC", async ({ page }) => {
  await page.goto("/labs/login");
  await expect(page.getByTestId("tc-TC-L-001")).toHaveCount(0);
  await page.getByRole("button", { name: "Hiện đáp án" }).click();
  await expect(page.getByTestId("tc-TC-L-001")).toBeVisible();
  await page.getByRole("tab", { name: "Ma trận BR × TC" }).click();
  await expect(page.getByRole("cell", { name: /BR-03/ })).toBeVisible();
});

test("tải CSV test case", async ({ page }) => {
  await page.goto("/labs/cart");
  await page.getByRole("button", { name: "Hiện đáp án" }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Tải CSV" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("test-cases-cart.csv");
});
