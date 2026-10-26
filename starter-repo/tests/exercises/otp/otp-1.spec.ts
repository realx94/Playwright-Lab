import { test } from "@playwright/test";

/**
 * otp-1 · Đăng nhập bằng OTP đọc từ hộp thư ★★★
 *
 * Gửi mã tới user@lab.dev, mở hộp thư giả ở một tab thứ hai để đọc mã OTP, rồi nhập mã vào tab đăng nhập và xác nhận vào được trang chính.
 *
 * Trang lab: /lab/otp  ·  Đề, gợi ý và đáp án: /labs/otp trên website
 *
 * Tiêu chí đạt:
 *  - Tách việc đọc OTP thành hàm riêng (helper) có thể dùng lại
 *  - Mở hộp thư bằng một page mới trong cùng context (cùng localStorage)
 *  - Chờ giao diện chuyển sang bước nhập mã trước khi đọc hộp thư
 *  - Dùng biểu thức chính quy để lấy đúng 6 chữ số, báo lỗi rõ nếu không tìm thấy
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Đăng nhập bằng OTP đọc từ hộp thư", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/otp");
});
