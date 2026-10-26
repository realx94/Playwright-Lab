import { test } from "@playwright/test";

/**
 * totp-3 · Mã khôi phục dùng một lần và khóa tài khoản ★★★
 *
 * Đăng nhập bằng mã khôi phục, chứng minh mã đó bị gạch và không dùng lại được. Thêm test nhập sai 3 lần thì tài khoản bị khóa, kể cả khi nhập đúng sau đó. Test phải đỏ khi bật BUG-02.
 *
 * Trang lab: /lab/totp  ·  Đề, gợi ý và đáp án: /labs/totp trên website
 *
 * Tiêu chí đạt:
 *  - Lấy một mã khôi phục từ giao diện sau khi bật 2FA
 *  - Kiểm tra mã được đánh dấu đã dùng (thuộc tính data-used) sau lần dùng đầu
 *  - Dùng lại mã đó và nhận thông báo đã được sử dụng
 *  - Có test sai 3 lần dẫn đến khóa, và nhập đúng vẫn bị từ chối
 *  - Test đỏ với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Mã khôi phục dùng một lần và khóa tài khoản", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/totp");
});
