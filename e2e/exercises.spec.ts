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
  await page.getByRole("dialog").getByRole("button", { name: "Vẫn xem đáp án" }).click();
  await expect(page.getByTestId("solution-login-1")).toContainText('getByTestId("dashboard")');
});

test("đề bài hiện rõ, tiêu chí tự đánh giá ẩn cho đến khi xác nhận", async ({ page }) => {
  await page.goto("/labs/login");
  await expect(page.getByRole("heading", { name: "Yêu cầu nghiệp vụ của lab" })).toBeVisible();
  const item = await open(page, "login-1");
  await expect(item.getByText("Viết test đăng nhập bằng tài khoản hợp lệ", { exact: false })).toBeVisible();
  await expect(page.getByTestId("criteria-login-1")).toHaveCount(0);
  await item.getByRole("button", { name: "Xem tiêu chí tự đánh giá" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Tiếp tục tự làm" }).click();
  await expect(page.getByTestId("criteria-login-1")).toHaveCount(0);
  await item.getByRole("button", { name: "Xem tiêu chí tự đánh giá" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Vẫn xem tiêu chí" }).click();
  await expect(page.getByTestId("criteria-login-1")).toBeVisible();
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

test("tự đánh giá ghi vào thống kê kèm cờ đã xem đáp án", async ({ page }) => {
  await page.goto("/labs/cart");
  const item = await open(page, "cart-1");
  await item.getByRole("button", { name: "Xem tiêu chí tự đánh giá" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Vẫn xem tiêu chí" }).click();
  await item.getByRole("checkbox").first().check();
  await item.getByRole("button", { name: "Xem đáp án" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Vẫn xem đáp án" }).click();
  await item.getByRole("button", { name: /Lưu tự đánh giá/ }).click();
  await expect(page.getByText("Đã lưu tự đánh giá: 1/5 tiêu chí")).toBeVisible();

  await page.goto("/stats");
  const row = page.getByTestId("exercise-history").getByRole("listitem").first();
  await expect(row).toContainText("cart-1");
  await expect(row).toContainText("Tự đánh giá");
  await expect(row).toContainText("Đã xem đáp án");
  await expect(row).toContainText("1/5");
});
