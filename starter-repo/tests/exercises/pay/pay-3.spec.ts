import { test } from "@playwright/test";

/**
 * pay-3 · Hoàn tiền một phần/toàn phần và webhook idempotent ★★★
 *
 * Trên đơn đã thanh toán 500.000 ₫: hoàn 200.000 ₫ rồi hoàn vượt mức phải bị từ chối, hoàn đủ phần còn lại thì đơn thành Đã hoàn tiền. Gửi lại webhook không được cộng doanh thu lần hai. Test phải đỏ khi bật BUG-02 hoặc BUG-03.
 *
 * Trang lab: /lab/pay  ·  Đề, gợi ý và đáp án: /labs/pay trên website
 *
 * Tiêu chí đạt:
 *  - Có thao tác hoàn một phần và kiểm tra trạng thái Hoàn một phần cùng doanh thu
 *  - Có test biên: hoàn 300001 khi còn 300000 bị từ chối và số tiền đã hoàn không đổi
 *  - Hoàn đủ thì trạng thái Đã hoàn tiền và biểu mẫu hoàn biến mất
 *  - Gửi lại webhook và kiểm tra doanh thu giữ nguyên
 *  - Test đỏ với BUG-02 và với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Hoàn tiền một phần/toàn phần và webhook idempotent", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/pay");
});
