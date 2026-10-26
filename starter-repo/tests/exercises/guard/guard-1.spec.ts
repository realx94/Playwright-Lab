import { test } from "@playwright/test";

/**
 * guard-1 · CAPTCHA bắt buộc sau nhiều lần đăng nhập sai ★★★
 *
 * Gọi API đăng nhập sai 2 lần, rồi chứng minh lần kế tiếp bị chặn nếu thiếu CAPTCHA kể cả khi mật khẩu đúng (403 captcha_required), token giả cũng bị từ chối, và token hợp lệ thì đăng nhập được. Test phải đỏ khi bật BUG-01.
 *
 * Trang lab: /lab/guard  ·  Đề, gợi ý và đáp án: /labs/guard trên website
 *
 * Tiêu chí đạt:
 *  - Dùng request fixture, không mở trình duyệt
 *  - Kiểm tra 401 hai lần đầu và nội dung attemptsLeft
 *  - Kiểm tra 403 với mã captcha_required khi thiếu CAPTCHA
 *  - Kiểm tra token CAPTCHA giả bị từ chối và token captcha-ok được chấp nhận
 *  - Test đỏ với BUG-01
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("CAPTCHA bắt buộc sau nhiều lần đăng nhập sai", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/guard");
});
