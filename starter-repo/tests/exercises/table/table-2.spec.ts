import { test } from "@playwright/test";

/**
 * table-2 · Phân trang và số dòng mỗi trang ★★
 *
 * Kiểm tra trang đầu, trang cuối (7 dòng), nút Trang trước/sau bị khoá đúng chỗ và đổi số dòng mỗi trang.
 *
 * Trang lab: /lab/table  ·  Đề, gợi ý và đáp án: /labs/table trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra chỉ số trang hiển thị (Trang x/y) và số dòng thực tế
 *  - Có test biên: trang đầu (Trang trước bị khoá) và trang cuối (Trang sau bị khoá)
 *  - Có test đổi số dòng mỗi trang về 20
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Phân trang và số dòng mỗi trang", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/table");
});
