import { test } from "@playwright/test";

/**
 * mail-2 · Quên mật khẩu: chống dò tài khoản và liên kết một lần ★★
 *
 * Chứng minh email lạ nhận cùng thông báo trung tính nhưng không có thư nào, email đã đăng ký nhận đúng một thư; lấy liên kết trong thư, đặt mật khẩu mới (kiểm tra mật khẩu yếu bị chặn) và chứng minh liên kết không dùng lại được. Test phải đỏ khi bật BUG-01 hoặc BUG-03.
 *
 * Trang lab: /lab/mail  ·  Đề, gợi ý và đáp án: /labs/mail trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra thông báo trung tính giống nhau cho email lạ và email đã đăng ký
 *  - Kiểm tra hộp thư vẫn 0 thư sau khi gửi cho email lạ
 *  - Lấy href của liên kết trong thư bằng getAttribute
 *  - Kiểm tra mật khẩu yếu bị từ chối rồi đổi thành công bằng mật khẩu hợp lệ
 *  - Mở lại liên kết cũ và kiểm tra báo không hợp lệ
 *  - Test đỏ với BUG-01 và BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Quên mật khẩu: chống dò tài khoản và liên kết một lần", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/mail");
});
