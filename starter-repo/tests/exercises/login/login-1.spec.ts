import { test } from "@playwright/test";

/**
 * login-1 · Đăng nhập thành công ★
 *
 * Viết test đăng nhập bằng tài khoản hợp lệ và xác nhận người dùng vào được trang chính.
 *
 * Trang lab: /lab/login  ·  Đề, gợi ý và đáp án: /labs/login trên website
 *
 * Tiêu chí đạt:
 *  - Lấy ô nhập bằng getByLabel hoặc getByRole, không dùng CSS selector dài
 *  - Có assertion web-first (expect(...).toBeVisible hoặc tương đương)
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Đăng nhập thành công", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/login");
});
