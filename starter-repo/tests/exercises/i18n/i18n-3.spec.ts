import { test } from "@playwright/test";

/**
 * i18n-3 · Responsive: điểm gãy 640 px và không cuộn ngang ★★
 *
 * Đặt viewport 640 px và 639 px để kiểm tra điểm gãy: từ 640 px có thanh điều hướng đầy đủ, dạng bảng và không có nút menu; dưới 640 px có nút menu (aria-expanded mở/đóng), sản phẩm dạng thẻ. Kiểm tra không có cuộn ngang ở 320, 639 và 640 px. Test phải đỏ khi bật BUG-03.
 *
 * Trang lab: /lab/i18n  ·  Đề, gợi ý và đáp án: /labs/i18n trên website
 *
 * Tiêu chí đạt:
 *  - Đặt viewport bằng page.setViewportSize
 *  - Kiểm tra phần tử hiện hoặc ẩn bằng toBeVisible và toBeHidden
 *  - Kiểm tra aria-expanded đổi khi bấm nút menu
 *  - Đo scrollWidth so với innerWidth bằng page.evaluate
 *  - Lặp qua nhiều bề rộng và ghi rõ bề rộng trong thông báo
 *  - Test đỏ với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Responsive: điểm gãy 640 px và không cuộn ngang", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/i18n");
});
