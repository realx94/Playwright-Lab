import { test } from "@playwright/test";

/**
 * booking-1 · Chọn ghế, giá thường/VIP và giới hạn 6 ghế ★★
 *
 * Kiểm tra ghế A1 đã bán bị vô hiệu; chọn B1 (thường) và D2 (VIP) rồi kiểm tra tổng 200.000 ₫, giữ chỗ, thanh toán và mã vé VE0001. Thêm test chọn đủ 6 ghế (tổng 480.000 ₫) và ghế thứ 7 bị từ chối. Test phải đỏ khi bật BUG-01 hoặc BUG-03.
 *
 * Trang lab: /lab/booking  ·  Đề, gợi ý và đáp án: /labs/booking trên website
 *
 * Tiêu chí đạt:
 *  - Dùng thuộc tính data-state của từng ghế để kiểm tra trạng thái
 *  - Kiểm tra tổng tiền theo loại ghế
 *  - Chạy hết luồng giữ chỗ và thanh toán và kiểm tra mã vé
 *  - Kiểm tra biên 6 ghế và 7 ghế với thông báo lỗi và trạng thái ghế thứ 7
 *  - Test đỏ với BUG-01 và với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Chọn ghế, giá thường/VIP và giới hạn 6 ghế", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/booking");
});
