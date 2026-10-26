import { test } from "@playwright/test";

/**
 * cart-2 · Mã SALE10 quanh các ngưỡng ★★
 *
 * Kiểm tra mã SALE10 ở ngưỡng tối thiểu 500.000đ và mức giảm tối đa 100.000đ (decision table).
 *
 * Trang lab: /lab/cart  ·  Đề, gợi ý và đáp án: /labs/cart trên website
 *
 * Tiêu chí đạt:
 *  - Có trường hợp đúng 500.000đ (giảm 50.000)
 *  - Có trường hợp dưới ngưỡng bị từ chối kèm thông báo
 *  - Có trường hợp đơn 3.200.000đ bị chặn trần giảm 100.000
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Mã SALE10 quanh các ngưỡng", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/cart");
});
