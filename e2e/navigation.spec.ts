import { test, expect } from "@playwright/test";

test("sidebar liệt kê bài theo level và đánh dấu bài đang xem", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/learn/2-05-locator-huong-nguoi-dung");
  const nav = page.getByRole("navigation", { name: "Danh sách bài học" }).first();
  await expect(nav.getByText(/^Level 2/)).toBeVisible();
  await expect(nav.getByRole("link", { name: "Locator hướng người dùng" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("bài trước / bài tiếp theo điều hướng đúng thứ tự", async ({ page }) => {
  await page.goto("/learn/0-1-tong-quan-automation");
  await expect(page.getByTestId("prev-lesson")).toHaveCount(0);
  await page.getByTestId("next-lesson").click();
  await expect(page).toHaveURL(/0-2-cai-dat-moi-truong/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cài đặt môi trường");
  await page.getByTestId("prev-lesson").click();
  await expect(page).toHaveURL(/0-1-tong-quan-automation/);
});

test("chuyển giao diện sáng/tối và nhớ lựa chọn", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByTestId("theme-toggle");
  await toggle.click();
  const html = page.locator("html");
  const first = (await html.getAttribute("class")) ?? "";
  await toggle.click();
  const second = (await html.getAttribute("class")) ?? "";
  expect(first.includes("dark")).not.toBe(second.includes("dark"));
  await page.reload();
  expect(((await html.getAttribute("class")) ?? "").includes("dark")).toBe(second.includes("dark"));
});

test("khối code có tô màu cú pháp và nút copy", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/learn/0-3-chay-test-dau-tien");
  const block = page.locator("pre").filter({ hasText: "page.goto" }).first();
  await expect(block.locator(".hljs-keyword").first()).toBeVisible();
  await block.hover();
  await block.locator("xpath=..").getByRole("button", { name: "Copy code" }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('page.goto("/")');
});

test("trang Bài học nhóm theo level", async ({ page }) => {
  await page.goto("/learn");
  for (const lv of [0, 1, 2]) await expect(page.getByRole("region", { name: `Level ${lv}` })).toBeVisible();
});
