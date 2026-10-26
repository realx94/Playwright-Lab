import { test, expect } from "@playwright/test";

test("Ctrl+K mở tìm kiếm, gõ từ khoá và đi tới bài học", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  const input = page.getByPlaceholder(/Tìm bài học/);
  await expect(input).toBeVisible();
  await input.fill("xpath");
  await page.getByRole("option", { name: /XPath/ }).first().click();
  await expect(page).toHaveURL(/\/learn\//);
});

test("tìm kiếm không có kết quả hiện thông báo", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("open-search").click();
  await page.getByPlaceholder(/Tìm bài học/).fill("zzzxxyy");
  await expect(page.getByText("Không tìm thấy kết quả.")).toBeVisible();
});

test("tìm được lab theo tên", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("open-search").click();
  await page.getByPlaceholder(/Tìm bài học/).fill("giỏ hàng");
  await page.getByRole("option", { name: /LAB-03/ }).click();
  await expect(page).toHaveURL(/\/labs\/cart/);
});

test("trang thuật ngữ có nút hỏi AI và liên kết bài học", async ({ page }) => {
  await page.goto("/glossary");
  const first = page.getByTestId("glossary-term").filter({ hasText: "Assertion" }).first();
  await expect(first.getByRole("link", { name: "Xem bài học" })).toHaveAttribute("href", /2-08-assertions/);
  await expect(first.getByRole("button", { name: "Assertion" })).toBeVisible();
  expect(await page.getByTestId("glossary-term").count()).toBeGreaterThan(30);
});

test("cheat sheet có các nhóm chính", async ({ page }) => {
  await page.goto("/cheatsheet");
  for (const t of ["Locator", "Thao tác", "Assertion", "Dòng lệnh"])
    await expect(page.getByText(new RegExp(`^${t}`)).first()).toBeVisible();
});
