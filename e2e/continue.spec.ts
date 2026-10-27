import { test, expect } from "@playwright/test";
import fs from "node:fs";

// Số bài lấy từ nội dung thật để thêm bài không làm vỡ test.
const LESSONS = fs.readdirSync("src/content/learn").filter((f) => f.endsWith(".md")).length;

test("người mới được gợi ý bài đầu tiên", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("continue-learning")).toContainText("Tổng quan Automation Testing");
  await expect(page.getByTestId("continue-progress")).toContainText(`0/${LESSONS}`);
});

test("hoàn thành bài đầu thì gợi ý bài kế tiếp và tăng tiến độ", async ({ page }) => {
  await page.goto("/learn/0-1-tong-quan-automation");
  await page.getByRole("button", { name: "Đánh dấu hoàn thành" }).click();
  await expect(page.getByRole("button", { name: "Đã hoàn thành" })).toBeVisible();

  await page.goto("/");
  await expect(page.getByTestId("continue-progress")).toContainText(`1/${LESSONS}`);
  await expect(page.getByTestId("continue-learning")).toContainText("Cài đặt môi trường");
  await page.getByTestId("continue-link").click();
  await expect(page).toHaveURL(/0-2-cai-dat-moi-truong/);
});
