import { test } from "@playwright/test";

/**
 * insurance-1 · Biên tuổi chủ xe và năm sản xuất (data-driven) ★★★
 *
 * Cố định hôm nay là 15/06/2026 bằng page.clock.setFixedTime. Dùng một bảng dữ liệu để kiểm tra biên tuổi chủ xe 18–70 (17 tuổi 364 ngày, đúng 18, 19, 69, đúng 70, 70 tuổi 364 ngày, đúng 71), rồi kiểm tra năm sản xuất hợp lệ từ 2011 đến 2026 (2010 và 2027 bị từ chối). Test phải đỏ khi bật BUG-01.
 *
 * Trang lab: /lab/insurance  ·  Đề, gợi ý và đáp án: /labs/insurance trên website
 *
 * Tiêu chí đạt:
 *  - Gọi page.clock.setFixedTime trước page.goto để kết quả không phụ thuộc ngày chạy
 *  - Một bảng dữ liệu sinh ra nhiều test, mỗi dòng có ngày sinh và kết quả mong đợi
 *  - Kiểm tra cả hai phía của mỗi biên (18 và 70) và thông báo lỗi dưới ô Ngày sinh
 *  - Kiểm tra biên năm sản xuất ở hai đầu (2011 và 2026) và ngoài biên (2010, 2027)
 *  - Test đỏ với BUG-01
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Biên tuổi chủ xe và năm sản xuất (data-driven)", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/insurance");
});
