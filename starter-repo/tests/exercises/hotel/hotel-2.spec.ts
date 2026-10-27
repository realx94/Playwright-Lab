import { test } from "@playwright/test";

/**
 * hotel-2 · Lọc tiện nghi: duyệt mọi thẻ kết quả bằng all() ★★
 *
 * Tìm khách sạn ở Hà Nội rồi chọn nhiều tiện nghi. Dùng locator.all() duyệt từng thẻ, đọc data-amenities và khẳng định mọi thẻ đều có đủ các tiện nghi đã chọn (AND); kiểm tra số kết quả giảm dần khi thêm tiện nghi, và trường hợp không có kết quả. Test phải đỏ khi bật BUG-03.
 *
 * Trang lab: /lab/hotel  ·  Đề, gợi ý và đáp án: /labs/hotel trên website
 *
 * Tiêu chí đạt:
 *  - Đưa phần tìm kiếm (thành phố, ngày) vào một hàm dùng lại
 *  - Duyệt mọi thẻ bằng all() và vòng lặp, kiểm tra từng thẻ
 *  - Kiểm tra số lượng kết quả bằng toHaveCount hoặc result-count
 *  - Kiểm tra thông báo Không tìm thấy khi không khớp
 *  - Test đỏ với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Lọc tiện nghi: duyệt mọi thẻ kết quả bằng all()", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/hotel");
});
