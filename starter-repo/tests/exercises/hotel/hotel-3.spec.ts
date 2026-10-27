import { test } from "@playwright/test";

/**
 * hotel-3 · Sắp xếp: đọc data-price và so sánh mảng ★★
 *
 * Đọc data-price và data-rating của các thẻ kết quả thành mảng số, rồi so sánh với bản sao đã sắp xếp để chứng minh giá tăng dần, giá giảm dần và đánh giá cao nhất. Kiểm tra phân trang giữ đúng thứ tự, đổi sắp xếp quay về trang 1, và các thuộc tính trợ năng của thẻ (alt của ảnh, aria-label của sao, href của link chi tiết).
 *
 * Trang lab: /lab/hotel  ·  Đề, gợi ý và đáp án: /labs/hotel trên website
 *
 * Tiêu chí đạt:
 *  - Đọc giá trị bằng getAttribute rồi chuyển sang số (Number), không so sánh chuỗi
 *  - So sánh bằng toEqual với bản sao đã sort, không sort bằng chính mảng gốc
 *  - Kiểm tra trang 2 tiếp nối thứ tự của trang 1
 *  - Kiểm tra alt của ảnh, aria-label của sao và href của link
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Sắp xếp: đọc data-price và so sánh mảng", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/hotel");
});
