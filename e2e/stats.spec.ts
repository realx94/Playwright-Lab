import { test, expect } from "@playwright/test";

const LESSON = "/learn/0-1-tong-quan-automation";

test("đánh dấu hoàn thành được ghi vào thống kê", async ({ page }) => {
  await page.goto("/stats");
  await expect(page.getByTestId("stat-done")).toContainText("0/1");

  await page.goto(LESSON);
  await page.getByRole("button", { name: "Đánh dấu hoàn thành" }).click();
  await expect(page.getByRole("button", { name: "Đã hoàn thành" })).toBeVisible();

  await page.goto("/stats");
  await expect(page.getByTestId("stat-done")).toContainText("1/1 bài (100%)");
});

test("xuất rồi nhập lại dữ liệu", async ({ page }) => {
  await page.goto(LESSON);
  await page.getByRole("button", { name: "Đánh dấu hoàn thành" }).click();
  await expect(page.getByRole("button", { name: "Đã hoàn thành" })).toBeVisible();

  await page.goto("/stats");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Xuất JSON" }).click(),
  ]);
  const file = await download.path();

  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Xoá dữ liệu" }).click();
  await expect(page.getByTestId("stat-done")).toContainText("0/1");

  await page.getByTestId("import-input").setInputFiles(file);
  await expect(page.getByTestId("stat-done")).toContainText("1/1");
});

test("popover Hỏi Google AI hiện khi bôi đen và mở tab mới", async ({ page, context }) => {
  await page.goto(LESSON);
  await page.getByRole("heading", { name: "Giải thích dễ hiểu" }).scrollIntoViewIfNeeded();
  const term = page.locator("[data-ask-ai] strong", { hasText: "manual" }).first();
  await term.selectText();
  const btn = page.getByRole("button", { name: "Hỏi Google AI" }).first();
  await expect(btn).toBeVisible();
  const [popup] = await Promise.all([context.waitForEvent("page"), btn.click()]);
  expect(popup.url()).toContain("google.com/search");
});
