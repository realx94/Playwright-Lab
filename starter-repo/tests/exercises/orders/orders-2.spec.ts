import { test } from "@playwright/test";

/**
 * orders-2 · Rollback khi lỗi và Idempotency-Key ★★★
 *
 * Chứng minh lỗi không để lại dữ liệu nửa chừng: dữ liệu sai trả 422 và hết hàng trả 409, cả hai đều không tạo dòng nào trong DB. Sau đó gửi cùng Idempotency-Key hai lần và chứng minh chỉ có một đơn, tồn kho chỉ trừ một lần. Test phải đỏ khi bật BUG-03 hoặc BUG-04.
 *
 * Trang lab: /lab/orders  ·  Đề, gợi ý và đáp án: /labs/orders trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra 422 liệt kê đúng các trường lỗi và DB không có đơn nào
 *  - Kiểm tra 409 khi hết hàng, rồi đếm lại orders, order_items và tồn kho
 *  - Gửi hai lần cùng Idempotency-Key và kiểm tra status 201 rồi 200 cùng id
 *  - Đếm số dòng orders và kiểm tra tồn kho chỉ trừ một lần
 *  - Test đỏ với BUG-03 và với BUG-04
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Rollback khi lỗi và Idempotency-Key", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/orders");
});
