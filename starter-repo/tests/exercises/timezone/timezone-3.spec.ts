import { test } from "@playwright/test";

/**
 * timezone-3 · Điều khiển đồng hồ: khung đã qua, đóng đặt 2 giờ, đếm ngược ★★★
 *
 * Dùng context.clock.setFixedTime để đặt 'bây giờ' là 04:00:00 UTC: các khung 01–04 là Đã qua, 05:00 Đã đóng đặt, 06:00 (đúng 2 giờ) vẫn đặt được; thêm 1 giây thì 06:00 cũng đóng. Sau đó đặt khung 07:00, kiểm tra đếm ngược và giá trị mới khi tiến đồng hồ 30 phút. Test phải đỏ khi bật BUG-02.
 *
 * Trang lab: /lab/timezone  ·  Đề, gợi ý và đáp án: /labs/timezone trên website
 *
 * Tiêu chí đạt:
 *  - Đặt giờ giả trước khi mở trang
 *  - Kiểm tra trạng thái từng khung đã qua bằng thuộc tính data-utc
 *  - Kiểm tra biên: đúng 2 giờ còn đặt được và 2 giờ trừ 1 giây thì đóng
 *  - Kiểm tra đếm ngược Còn 3 giờ 0 phút rồi Còn 2 giờ 30 phút sau khi đổi giờ giả
 *  - Test đỏ với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Điều khiển đồng hồ: khung đã qua, đóng đặt 2 giờ, đếm ngược", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/timezone");
});
