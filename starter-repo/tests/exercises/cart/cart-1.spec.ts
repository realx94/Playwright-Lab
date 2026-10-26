import { test } from "@playwright/test";

/**
 * cart-1 · Tính tiền đơn dưới 1 triệu ★★
 *
 * Thêm Chuột không dây (250.000đ) vào giỏ và kiểm tra phí ship, VAT và tổng cộng theo business rules.
 *
 * Trang lab: /lab/cart  ·  Đề, gợi ý và đáp án: /labs/cart trên website
 *
 * Tiêu chí đạt:
 *  - Có hàm helper đọc số tiền từ giao diện thành number
 *  - Assert 3 giá trị: ship, VAT và tổng
 *  - Tính kỳ vọng từ quy tắc (ship 30.000, VAT 8%), không sao chép giá trị đang hiển thị
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Tính tiền đơn dưới 1 triệu", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/cart");
});
