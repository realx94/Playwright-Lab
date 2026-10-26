import { test } from "@playwright/test";

/**
 * otp-3 · Biên hết hạn 5 phút với đồng hồ giả ★★★
 *
 * Dùng đồng hồ giả để kiểm tra đúng biên hiệu lực của mã: giây 299 và 300 còn hiệu lực, giây 301 đã hết hạn. Chạy lại với ?bugs=BUG-02 để thấy lỗi.
 *
 * Trang lab: /lab/otp  ·  Đề, gợi ý và đáp án: /labs/otp trên website
 *
 * Tiêu chí đạt:
 *  - Không dùng waitForTimeout hay chờ thật 5 phút
 *  - Đặt giờ giả bằng clock của context, không phụ thuộc thời gian thật của máy
 *  - Dùng data-driven cho ba mốc 299, 300, 301 giây
 *  - Test xanh trên lab sạch, đỏ khi bật ?bugs=BUG-02 (với mốc 301)
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Biên hết hạn 5 phút với đồng hồ giả", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/otp");
});
