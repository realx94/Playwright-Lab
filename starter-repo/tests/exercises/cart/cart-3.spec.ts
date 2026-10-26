import { test } from "@playwright/test";

/**
 * cart-3 · Vòng đời đơn và bắt BUG-03 ★★★
 *
 * Kiểm tra đơn đi đúng chuỗi trạng thái và KHÔNG huỷ được khi đang giao. Sau đó chạy lại với ?bugs=BUG-03 để chắc chắn test của bạn phát hiện được lỗi.
 *
 * Trang lab: /lab/cart  ·  Đề, gợi ý và đáp án: /labs/cart trên website
 *
 * Tiêu chí đạt:
 *  - Đi qua đủ: Mới → Đã thanh toán → Đang giao
 *  - Khẳng định nút Huỷ đơn không tồn tại khi Đang giao
 *  - Test xanh trên lab sạch và đỏ khi bật ?bugs=BUG-03
 *  - Test đỏ vì đúng lý do (nút Huỷ xuất hiện), không phải do locator sai
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Vòng đời đơn và bắt BUG-03", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/cart");
});
