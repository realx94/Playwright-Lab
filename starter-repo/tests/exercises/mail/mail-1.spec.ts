import { test } from "@playwright/test";

/**
 * mail-1 · Kiểm tra nội dung email xác nhận (đa ngôn ngữ) ★★
 *
 * Đặt 3 × Giày rồi mở hộp thư giả ở tab mới. Kiểm tra người nhận, tiêu đề, tên khách, dòng hàng và tổng tiền của email tiếng Việt; lặp lại với email tiếng Anh để kiểm tra định dạng tiền 750,000 VND. Test phải đỏ khi bật BUG-02.
 *
 * Trang lab: /lab/mail  ·  Đề, gợi ý và đáp án: /labs/mail trên website
 *
 * Tiêu chí đạt:
 *  - Mở hộp thư bằng context.newPage() vì cùng origin dùng chung localStorage
 *  - Kiểm tra email-to, email-subject và email-body bằng assertion tự thử lại
 *  - Kiểm tra dòng hàng 3 × Giày = 750.000 ₫ và tổng cộng
 *  - Kiểm tra bản tiếng Anh dùng dấu phẩy và hậu tố VND
 *  - Test đỏ với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Kiểm tra nội dung email xác nhận (đa ngôn ngữ)", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/mail");
});
