import { test } from "@playwright/test";

/**
 * table-4 · Chọn nhiều và khoá hàng loạt ★★★
 *
 * Chọn tất cả trên trang hiện tại (phải là 10, không phải 37), khoá hàng loạt rồi dùng bộ lọc trạng thái để xác nhận số người bị khoá tăng đúng và Admin không bị khoá.
 *
 * Trang lab: /lab/table  ·  Đề, gợi ý và đáp án: /labs/table trên website
 *
 * Tiêu chí đạt:
 *  - Khẳng định số dòng đã chọn là 10 sau khi chọn tất cả
 *  - Tính số người bị khoá kỳ vọng từ dữ liệu: 9 ban đầu + 4 người hoạt động không phải Admin ở trang 1 = 13
 *  - Kiểm tra riêng rằng Admin vẫn không bị khoá
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Chọn nhiều và khoá hàng loạt", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/table");
});
