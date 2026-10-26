import { test } from "@playwright/test";

/**
 * guard-3 · Giao diện: CAPTCHA chế độ test và đếm ngược khóa ★★★
 *
 * Trên giao diện, mở trang với ?captcha=test để CAPTCHA tự đạt, nhập sai 4 lần và kiểm tra thông báo khóa, nút Đăng nhập bị vô hiệu cùng bộ đếm ngược. Chờ nút mở lại rồi đăng nhập đúng.
 *
 * Trang lab: /lab/guard  ·  Đề, gợi ý và đáp án: /labs/guard trên website
 *
 * Tiêu chí đạt:
 *  - Mở trang với tham số ?captcha=test thay vì giải CAPTCHA
 *  - Kiểm tra thông báo còn bao nhiêu lần thử sau lần sai đầu
 *  - Kiểm tra nút bị vô hiệu và bộ đếm ngược khi bị khóa
 *  - Chờ nút được bật lại bằng assertion có timeout thích hợp, không dùng waitForTimeout
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Giao diện: CAPTCHA chế độ test và đếm ngược khóa", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/guard");
});
