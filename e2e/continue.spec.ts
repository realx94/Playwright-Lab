import { test, expect } from "@playwright/test";

test("người mới được gợi ý bài đầu tiên", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("continue-learning")).toContainText("Tổng quan Automation Testing");
  await expect(page.getByTestId("continue-progress")).toContainText("0/55");
});

test("hoàn thành bài đầu thì gợi ý bài kế tiếp và tăng tiến độ", async ({ page }) => {
  await page.goto("/learn/0-1-tong-quan-automation");
  await page.getByRole("button", { name: "Đánh dấu hoàn thành" }).click();
  await expect(page.getByRole("button", { name: "Đã hoàn thành" })).toBeVisible();

  await page.goto("/");
  await expect(page.getByTestId("continue-progress")).toContainText("1/55");
  await expect(page.getByTestId("continue-learning")).toContainText("Cài đặt môi trường");
  await page.getByTestId("continue-link").click();
  await expect(page).toHaveURL(/0-2-cai-dat-moi-truong/);
});
