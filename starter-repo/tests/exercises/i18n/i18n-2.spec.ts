import { test } from "@playwright/test";

/**
 * i18n-2 · Định dạng số, tiền, ngày và số nhiều theo ngôn ngữ ★★
 *
 * Kiểm tra định dạng của hai ngôn ngữ: giá 1.250.000 ₫ và ₫1,250,000, số lớn 1.234.567,891 và 1,234,567.891, ngày ngắn 8/3/26 và 3/8/26, ngày đầy đủ, cùng quy tắc số nhiều (1 mục, 2 mục, 1 item, 2 items). Test phải đỏ khi bật BUG-02.
 *
 * Trang lab: /lab/i18n  ·  Đề, gợi ý và đáp án: /labs/i18n trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra giá, số lớn và ngày ở tiếng Việt
 *  - Đổi sang English và kiểm tra lại cả ba loại định dạng
 *  - Kiểm tra ngày đầy đủ ở hai ngôn ngữ
 *  - Kiểm tra số nhiều 1 và 2 ở cả hai ngôn ngữ
 *  - Test đỏ với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Định dạng số, tiền, ngày và số nhiều theo ngôn ngữ", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/i18n");
});
