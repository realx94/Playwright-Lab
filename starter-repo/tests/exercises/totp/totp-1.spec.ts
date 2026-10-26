import { test } from "@playwright/test";

/**
 * totp-1 · Bật 2FA và đăng nhập bằng mã TOTP ★★★
 *
 * Bật 2FA: đọc khoá base32 trên trang rồi tự tính mã TOTP trong test. Sau đó đăng xuất, đăng nhập bằng mật khẩu và mã TOTP của chu kỳ kế tiếp. Dùng đồng hồ giả để mã không đổi giữa chừng.
 *
 * Trang lab: /lab/totp  ·  Đề, gợi ý và đáp án: /labs/totp trên website
 *
 * Tiêu chí đạt:
 *  - Đọc khoá từ giao diện (data-testid totp-secret) và tự tính mã 6 số trong test
 *  - Cố định thời gian bằng context.clock.setFixedTime để mã ổn định
 *  - Kiểm tra hiện 10 mã khôi phục sau khi bật
 *  - Đăng nhập lại qua hai bước: mật khẩu rồi mã TOTP
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Bật 2FA và đăng nhập bằng mã TOTP", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/totp");
});
