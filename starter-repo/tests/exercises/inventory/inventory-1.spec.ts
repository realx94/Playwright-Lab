import { test } from "@playwright/test";

/**
 * inventory-1 · Nhãn tồn kho theo mức đặt lại (biên 51/50/49) ★★
 *
 * Kiểm tra nhãn ban đầu (SKU-B đúng bằng mức đặt lại phải là Sắp hết) và thao tác xuất kho để đưa SKU-A qua các biên 51 (Đủ hàng), 50 (Sắp hết), 49 (Sắp hết) rồi nhập lại thành 51. Test phải đỏ khi bật BUG-03.
 *
 * Trang lab: /lab/inventory  ·  Đề, gợi ý và đáp án: /labs/inventory trên website
 *
 * Tiêu chí đạt:
 *  - Dùng data-sku và data-testid để đọc tồn và nhãn từng sản phẩm
 *  - Kiểm tra nhãn ban đầu của cả ba sản phẩm
 *  - Đưa tồn về đúng 51, 50, 49 bằng các lần xuất kho nhỏ
 *  - Kiểm tra nhãn đổi đúng ở mỗi biên
 *  - Test đỏ với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Nhãn tồn kho theo mức đặt lại (biên 51/50/49)", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/inventory");
});
