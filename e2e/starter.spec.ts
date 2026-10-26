import { test, expect } from "@playwright/test";

test("trang starter có link tải và file zip hợp lệ", async ({ page, request }) => {
  await page.goto("/starter");
  const link = page.getByTestId("download-starter");
  await expect(link).toHaveAttribute("href", "/starter-repo.zip");

  const res = await request.get("/starter-repo.zip");
  expect(res.status()).toBe(200);
  const body = await res.body();
  expect(body.length).toBeGreaterThan(5_000);
  // Chữ ký file ZIP: "PK"
  expect(body.subarray(0, 2).toString()).toBe("PK");
});

test("checklist thiết lập hiện tiến độ và lưu lại", async ({ page }) => {
  await page.goto("/starter");
  await expect(page.getByTestId("setup-progress")).toContainText("0/5");
  await page.getByRole("checkbox", { name: /Đã cài Git/ }).check();
  await expect(page.getByTestId("setup-progress")).toContainText("1/5");
  await page.reload();
  await expect(page.getByTestId("setup-progress")).toContainText("1/5");
});

test("chuyển tab Windows / macOS", async ({ page }) => {
  await page.goto("/starter");
  await expect(page.getByText("Cài NVM for Windows")).toBeVisible();
  await page.getByRole("tab", { name: "macOS" }).click();
  await expect(page.getByText("Cài Homebrew và Git")).toBeVisible();
});
