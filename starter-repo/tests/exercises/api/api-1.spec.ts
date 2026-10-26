import { test } from "@playwright/test";

/**
 * api-1 · GET: danh sách, phân trang và tìm kiếm ★★
 *
 * Kiểm tra endpoint danh sách: giá trị mặc định, trang cuối, giới hạn pageSize và tìm kiếm không phân biệt hoa thường.
 *
 * Trang lab: /lab/api  ·  Đề, gợi ý và đáp án: /labs/api trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra cả status, cấu trúc body (page, pageSize, total, data) và số phần tử
 *  - Có test cho trang cuối và cho pageSize vượt giới hạn
 *  - Test tìm kiếm kiểm tra đúng nội dung từng phần tử trả về
 *  - Không dùng trình duyệt: chỉ dùng fixture request
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("GET: danh sách, phân trang và tìm kiếm", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/api");
});
