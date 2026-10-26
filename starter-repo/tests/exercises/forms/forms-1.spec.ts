import { test } from "@playwright/test";

/**
 * forms-1 · Điền form hợp lệ bằng đúng locator ★
 *
 * Điền toàn bộ các trường bắt buộc (input, radio, checkbox, select native, select tuỳ biến, switch) rồi gửi và kiểm tra kết quả.
 *
 * Trang lab: /lab/forms  ·  Đề, gợi ý và đáp án: /labs/forms trên website
 *
 * Tiêu chí đạt:
 *  - Radio, checkbox và switch dùng getByRole
 *  - Select native dùng selectOption, select tuỳ biến dùng click rồi chọn option
 *  - Assert kết quả JSON chứa đúng ít nhất 3 trường đã nhập
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Điền form hợp lệ bằng đúng locator", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/forms");
});
