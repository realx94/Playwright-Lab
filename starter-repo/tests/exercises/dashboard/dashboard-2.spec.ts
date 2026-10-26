import { test } from "@playwright/test";

/**
 * dashboard-2 · Biểu đồ nhất quán với số liệu ★★
 *
 * Chứng minh biểu đồ đúng: có đúng 7 cột với ngày đầu 2026-03-25 và ngày cuối 2026-03-31, giá trị từng cột khớp số liệu kỳ vọng, tổng cột bằng KPI doanh thu, chiều cao tỷ lệ với giá trị (cột cao nhất cao 160), và bảng số liệu khớp. Test phải đỏ khi bật BUG-03.
 *
 * Trang lab: /lab/dashboard  ·  Đề, gợi ý và đáp án: /labs/dashboard trên website
 *
 * Tiêu chí đạt:
 *  - Đọc data-date và data-value của các cột bằng evaluateAll
 *  - Kiểm tra danh sách ngày đầy đủ gồm cả ngày kết thúc
 *  - Kiểm tra tổng các cột bằng KPI doanh thu
 *  - Kiểm tra tỷ lệ chiều cao với sai số tối đa 1 điểm
 *  - Kiểm tra dòng đầu của bảng bằng locator('td')
 *  - Test đỏ với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Biểu đồ nhất quán với số liệu", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/dashboard");
});
