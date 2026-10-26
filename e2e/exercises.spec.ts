import { test, expect } from "@playwright/test";

const open = async (page: import("@playwright/test").Page, id: string) => {
  const item = page.getByTestId(`exercise-${id}`);
  const trigger = item.getByRole("button", { name: /./ }).first();
  // Trang có thể chưa hydrate xong khi bấm lần đầu: thử lại tới khi accordion thực sự mở.
  await expect(async () => {
    if ((await trigger.getAttribute("aria-expanded")) !== "true") await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true", { timeout: 1000 });
  }).toPass();
  return item;
};

test("đáp án ẩn mặc định và yêu cầu xác nhận mới hiện", async ({ page }) => {
  await page.goto("/labs/login");
  const item = await open(page, "login-1");
  await expect(page.getByTestId("solution-login-1")).toHaveCount(0);
  await item.getByRole("button", { name: "Xem đáp án" }).click();
  await expect(page.getByTestId("solution-login-1")).toHaveCount(0);
  await item.getByRole("button", { name: "Vẫn xem đáp án" }).click();
  await expect(page.getByTestId("solution-login-1")).toContainText('getByTestId("dashboard")');
});

test("gợi ý mở dần từng cái một", async ({ page }) => {
  await page.goto("/labs/forms");
  const item = await open(page, "forms-2");
  const hints = page.getByTestId("hints-forms-2").getByRole("listitem");
  await expect(hints).toHaveCount(0);
  await item.getByRole("button", { name: "Mở gợi ý tiếp theo" }).click();
  await expect(hints).toHaveCount(1);
  await item.getByRole("button", { name: "Mở gợi ý tiếp theo" }).click();
  await expect(hints).toHaveCount(2);
});

test("nộp bài ghi vào thống kê kèm cờ đã xem đáp án", async ({ page }) => {
  await page.goto("/labs/cart");
  const item = await open(page, "cart-1");
  await item.getByRole("checkbox").first().check();
  await item.getByRole("button", { name: "Xem đáp án" }).click();
  await item.getByRole("button", { name: "Vẫn xem đáp án" }).click();
  await item.getByRole("button", { name: /Nộp bài/ }).click();

  await page.goto("/stats");
  const row = page.getByTestId("exercise-history").getByRole("listitem").first();
  await expect(row).toContainText("cart-1");
  await expect(row).toContainText("Đã xem đáp án");
  await expect(row).toContainText("1/5");
});
