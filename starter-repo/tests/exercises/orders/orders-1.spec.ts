import { test } from "@playwright/test";

/**
 * orders-1 · POST /orders rồi kiểm tra DB: ba bảng, tổng tiền và tồn kho ★★★
 *
 * Tạo đơn 2×SKU-A + 1×SKU-B bằng API, kiểm tra response (201, Location, total) rồi đọc DB để xác nhận orders, order_items, audit_log và tồn kho. Tổng tiền trong DB phải bằng response. Test phải đỏ khi bật BUG-01 hoặc BUG-02.
 *
 * Trang lab: /lab/orders  ·  Đề, gợi ý và đáp án: /labs/orders trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra status 201, header Location và total trong response
 *  - Đọc bảng orders theo id và so sánh total, status, deleted_at, created_at gần với hiện tại
 *  - Đọc order_items và kiểm tra từng dòng sku/qty/price
 *  - Đọc audit_log và kiểm tra có đúng một bản ghi order.created
 *  - Kiểm tra tồn kho trong bảng products đã bị trừ
 *  - Test đỏ với BUG-01 và với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("POST /orders rồi kiểm tra DB: ba bảng, tổng tiền và tồn kho", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/orders");
});
