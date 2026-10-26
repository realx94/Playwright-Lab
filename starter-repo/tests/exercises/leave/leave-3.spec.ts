import { test } from "@playwright/test";

/**
 * leave-3 · Biên số ngày phép và bắt BUG-01 ★★★
 *
 * Kiểm tra biên của phép năm (còn 12 ngày): đơn đúng 12 ngày được chấp nhận, đơn 13 ngày bị từ chối, và số ngày hiển thị phải tính cả ngày đầu lẫn ngày cuối. Test phải đỏ khi bật BUG-01.
 *
 * Trang lab: /lab/leave  ·  Đề, gợi ý và đáp án: /labs/leave trên website
 *
 * Tiêu chí đạt:
 *  - Có test đúng biên 12 ngày (chấp nhận) và 13 ngày (từ chối)
 *  - Kiểm tra số ngày hiển thị là 12 (tính cả ngày cuối)
 *  - Kiểm tra nội dung thông báo lỗi khi vượt số dư
 *  - Test xanh trên lab sạch và đỏ khi bật BUG-01
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Biên số ngày phép và bắt BUG-01", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/leave");
});
