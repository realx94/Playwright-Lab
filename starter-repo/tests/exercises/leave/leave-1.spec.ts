import { test } from "@playwright/test";

/**
 * leave-1 · Gửi đơn hợp lệ và kiểm tra ngày ★★
 *
 * Gửi một đơn phép năm 09/03–11/03 và xác nhận đơn ở trạng thái Chờ duyệt, tính đủ 3 ngày và chưa trừ số dư phép. Đặt giờ giả để không phụ thuộc ngày thật.
 *
 * Trang lab: /lab/leave  ·  Đề, gợi ý và đáp án: /labs/leave trên website
 *
 * Tiêu chí đạt:
 *  - Đặt giờ giả bằng context.clock, không phụ thuộc ngày chạy test
 *  - Dùng hàm helper để điền và gửi đơn
 *  - Kiểm tra trạng thái, số ngày và số dư phép sau khi gửi
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Gửi đơn hợp lệ và kiểm tra ngày", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/leave");
});
