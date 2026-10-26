import { test } from "@playwright/test";

/**
 * login-3 · Khoá tài khoản sau 5 lần sai ★★★
 *
 * Kiểm tra quy tắc khoá: lần sai thứ 4 chưa khoá, lần sai thứ 5 thì khoá. Tránh lặp code và luôn bắt đầu từ trạng thái sạch.
 *
 * Trang lab: /lab/login  ·  Đề, gợi ý và đáp án: /labs/login trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra cả lần sai thứ 4 (chưa khoá) và lần thứ 5 (khoá)
 *  - Dùng hàm helper hoặc Page Object, không lặp lại các bước đăng nhập
 *  - Có beforeEach đưa dữ liệu lab về trạng thái ban đầu
 *  - Dùng test.step để báo cáo dễ đọc
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Khoá tài khoản sau 5 lần sai", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/login");
});
