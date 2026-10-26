import { test } from "@playwright/test";

/**
 * booking-2 · Bộ đếm giữ chỗ và biên 300/301 giây ★★★
 *
 * Dùng context.clock.setFixedTime để kiểm tra bộ đếm giảm đúng (05:00 rồi 03:00 sau 120 giây), thanh toán đúng 300 giây vẫn thành công, còn 301 giây thì báo hết thời gian giữ chỗ và ghế được nhả. Test phải đỏ khi bật BUG-02.
 *
 * Trang lab: /lab/booking  ·  Đề, gợi ý và đáp án: /labs/booking trên website
 *
 * Tiêu chí đạt:
 *  - Cố định giờ trước khi mở trang
 *  - Kiểm tra giá trị bộ đếm ở hai thời điểm
 *  - Kiểm tra biên 300 giây còn hợp lệ
 *  - Kiểm tra 301 giây báo hết hạn và ghế chuyển về trống
 *  - Test đỏ với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Bộ đếm giữ chỗ và biên 300/301 giây", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/booking");
});
