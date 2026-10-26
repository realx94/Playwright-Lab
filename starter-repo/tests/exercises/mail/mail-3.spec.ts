import { test } from "@playwright/test";

/**
 * mail-3 · Liên kết trong email và thời hạn 15 phút ★★
 *
 * Bấm liên kết Xem đơn hàng trong email và kiểm tra trang đơn; thử một đơn không tồn tại. Dùng đồng hồ giả để chứng minh liên kết đặt lại mật khẩu còn hiệu lực đúng ở giây thứ 900 và hết hạn ở giây thứ 901.
 *
 * Trang lab: /lab/mail  ·  Đề, gợi ý và đáp án: /labs/mail trên website
 *
 * Tiêu chí đạt:
 *  - Bấm liên kết bằng getByRole('link') với biểu thức chính quy khớp địa chỉ
 *  - Kiểm tra tiêu đề và tổng tiền trên trang đơn
 *  - Kiểm tra thông báo không tìm thấy với mã đơn không có
 *  - Dùng context.clock.setFixedTime để kiểm tra biên 900 và 901 giây
 *  - Sinh hai test bằng vòng for từ bảng dữ liệu
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Liên kết trong email và thời hạn 15 phút", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/mail");
});
