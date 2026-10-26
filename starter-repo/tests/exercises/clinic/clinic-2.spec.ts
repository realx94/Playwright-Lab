import { test } from "@playwright/test";

/**
 * clinic-2 · Quy tắc ngày khám và biên 2 giờ ★★★
 *
 * Kiểm tra ba kiểu ngày bị từ chối (đã qua, Chủ nhật, quá 30 ngày), đúng 30 ngày vẫn hợp lệ, và biên 2 giờ: lúc 06:00:00 khung 08:00 còn trống, lúc 06:00:01 khung 08:00 không chọn được còn 08:30 thì được. Test phải đỏ khi bật BUG-02.
 *
 * Trang lab: /lab/clinic  ·  Đề, gợi ý và đáp án: /labs/clinic trên website
 *
 * Tiêu chí đạt:
 *  - Sinh test cho các ngày không hợp lệ từ một bảng dữ liệu
 *  - Kiểm tra thông báo lỗi ngày đúng nội dung
 *  - Kiểm tra biên đúng 30 ngày hợp lệ và 31 ngày bị từ chối
 *  - Kiểm tra biên 2 giờ bằng cách đổi giờ giả thêm một giây
 *  - Test đỏ với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Quy tắc ngày khám và biên 2 giờ", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/clinic");
});
