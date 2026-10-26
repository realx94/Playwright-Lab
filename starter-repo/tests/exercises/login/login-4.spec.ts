import { test } from "@playwright/test";

/**
 * login-4 · Bắt bug: mật khẩu 7 ký tự được chấp nhận ★★★
 *
 * Viết một test PASS trên lab bình thường nhưng FAIL khi bật bug bằng ?bugs=BUG-01. Đây là cách kiểm tra test của bạn có thật sự phát hiện lỗi hay không.
 *
 * Trang lab: /lab/login  ·  Đề, gợi ý và đáp án: /labs/login trên website
 *
 * Tiêu chí đạt:
 *  - Test xanh khi mở /lab/login
 *  - Test đỏ khi mở /lab/login?bugs=BUG-01
 *  - Test đỏ vì đúng lý do (thiếu thông báo lỗi), không phải do timeout hay lỗi locator
 *  - Dùng dữ liệu ở biên: mật khẩu đúng 7 ký tự
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Bắt bug: mật khẩu 7 ký tự được chấp nhận", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/login");
});
