import { test } from "@playwright/test";

/**
 * forms-2 · Biên của trường Tuổi (18–65) ★★
 *
 * Áp dụng Boundary Value Analysis: kiểm tra các giá trị 17, 18, 65, 66 và xác nhận chỉ hai giá trị ngoài khoảng bị báo lỗi.
 *
 * Trang lab: /lab/forms  ·  Đề, gợi ý và đáp án: /labs/forms trên website
 *
 * Tiêu chí đạt:
 *  - Có đủ 4 giá trị biên: 17, 18, 65, 66
 *  - Dùng data-driven thay vì bốn đoạn code lặp lại
 *  - Với giá trị hợp lệ, assert lỗi tuổi KHÔNG xuất hiện
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Biên của trường Tuổi (18–65)", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/forms");
});
