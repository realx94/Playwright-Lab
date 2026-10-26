import { test } from "@playwright/test";

/**
 * otp-4 · Gửi lại mã và bắt BUG-03 ★★★
 *
 * Kiểm tra nút Gửi lại mã bị khoá 60 giây đầu, mở khoá sau đó, và khi đã xin mã mới thì mã cũ phải bị từ chối. Chạy lại với ?bugs=BUG-03 để thấy lỗi.
 *
 * Trang lab: /lab/otp  ·  Đề, gợi ý và đáp án: /labs/otp trên website
 *
 * Tiêu chí đạt:
 *  - Khẳng định nút bị khoá và có thông báo đếm ngược ngay sau khi gửi
 *  - Dùng đồng hồ giả để vượt 60 giây, không chờ thật
 *  - Đọc được cả hai mã từ hộp thư và phân biệt mã cũ, mã mới
 *  - Mã cũ bị từ chối, mã mới được chấp nhận; đỏ khi bật ?bugs=BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Gửi lại mã và bắt BUG-03", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/otp");
});
