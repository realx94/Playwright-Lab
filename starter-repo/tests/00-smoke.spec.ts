import { test, expect } from "@playwright/test";

// Chạy test này đầu tiên để chắc chắn môi trường đã sẵn sàng.
test("kết nối được tới Playwright Lab", async ({ page }) => {
  await page.goto("/labs");
  await expect(page.getByRole("heading", { name: "Danh sách Lab" })).toBeVisible();
});
