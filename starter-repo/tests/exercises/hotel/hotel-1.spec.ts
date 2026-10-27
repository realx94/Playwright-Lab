import { test } from "@playwright/test";

/**
 * hotel-1 · Lịch tuỳ biến: khoảng ngày, biên 1 và 30 đêm ★★
 *
 * Điều khiển lịch tuỳ biến (không phải input type=date) với hôm nay cố định bằng page.clock.setFixedTime. Kiểm tra ngày quá khứ bị vô hiệu, chọn khoảng 1 đêm và 30 đêm (ngày thứ 31 bị vô hiệu), chọn lại ngày trả không sau ngày nhận thì bắt đầu lại từ ngày nhận mới, và khoảng ngày được tô nổi bật. Test phải đỏ khi bật BUG-01.
 *
 * Trang lab: /lab/hotel  ·  Đề, gợi ý và đáp án: /labs/hotel trên website
 *
 * Tiêu chí đạt:
 *  - Cố định ngày hiện tại bằng page.clock.setFixedTime trước khi mở trang
 *  - Chọn ngày bằng data-testid day-YYYY-MM-DD, chuyển tháng bằng nút Tháng sau
 *  - Kiểm tra số đêm ở biên 1 và 30, ngày thứ 31 bị vô hiệu (toBeDisabled)
 *  - Kiểm tra trạng thái tô nổi bật qua thuộc tính data-state
 *  - Test đỏ với BUG-01
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Lịch tuỳ biến: khoảng ngày, biên 1 và 30 đêm", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/hotel");
});
