import { test } from "@playwright/test";

/**
 * i18n-1 · Ngôn ngữ mặc định theo trình duyệt và lựa chọn thủ công ★★
 *
 * Dùng test.use({ locale }) để kiểm tra trình duyệt vi-VN mở ra tiếng Việt (html lang=vi), en-US mở ra English, một ngôn ngữ khác (fr-FR) rơi về English, và chọn thủ công English được ghi nhớ sau khi tải lại. Test phải đỏ khi bật BUG-01.
 *
 * Trang lab: /lab/i18n  ·  Đề, gợi ý và đáp án: /labs/i18n trên website
 *
 * Tiêu chí đạt:
 *  - Đổi ngôn ngữ trình duyệt bằng tuỳ chọn locale, không đổi cài đặt máy
 *  - Kiểm tra thuộc tính lang của thẻ html
 *  - Dùng browser.newContext({ locale }) cho ngôn ngữ thứ ba
 *  - Kiểm tra lựa chọn thủ công thắng ngôn ngữ trình duyệt sau reload
 *  - Test đỏ với BUG-01
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Ngôn ngữ mặc định theo trình duyệt và lựa chọn thủ công", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/i18n");
});
