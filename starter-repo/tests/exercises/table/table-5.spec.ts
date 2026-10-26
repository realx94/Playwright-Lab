import { test } from "@playwright/test";

/**
 * table-5 · Bắt BUG-01 và BUG-02 ★★★
 *
 * Viết hai test bắt lỗi: tìm kiếm phải không phân biệt hoa thường (BUG-01) và đổi bộ lọc phải đưa về trang 1 (BUG-02). Mỗi test xanh trên lab sạch và đỏ khi bật bug tương ứng.
 *
 * Trang lab: /lab/table  ·  Đề, gợi ý và đáp án: /labs/table trên website
 *
 * Tiêu chí đạt:
 *  - Test tìm kiếm dùng chữ in hoa khác với dữ liệu gốc
 *  - Test phân trang đi sang trang 2 rồi mới đổi bộ lọc
 *  - Mỗi test đỏ đúng lý do khi bật bug tương ứng, không đỏ vì locator sai
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Bắt BUG-01 và BUG-02", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/table");
});
