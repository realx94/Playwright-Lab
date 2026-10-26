import { test } from "@playwright/test";

/**
 * inventory-3 · Đơn nhập hàng xuyên hai trang ★★★
 *
 * Trên trang Đơn nhập hàng tạo PO001 cho SKU-C số lượng 100 (tổng 150.000 ₫), đi hết luồng Nháp → Đã gửi → Đã nhận và chứng minh chưa gửi thì không có nút Nhận hàng. Sang trang Tồn kho kiểm tra SKU-C tăng từ 10 lên 110 và có dòng lịch sử Nhận hàng PO001. Thêm test huỷ đơn không đổi tồn kho và biên số lượng đặt 1–5000. Test phải đỏ khi bật BUG-02.
 *
 * Trang lab: /lab/inventory  ·  Đề, gợi ý và đáp án: /labs/inventory trên website
 *
 * Tiêu chí đạt:
 *  - Chuyển giữa hai trang bằng getByRole('link')
 *  - Kiểm tra tổng tiền và trạng thái Nháp của PO001
 *  - Kiểm tra sau khi nhận hàng không còn nút thao tác cho PO001
 *  - Kiểm tra tồn và lịch sử của SKU-C ở trang Tồn kho
 *  - Kiểm tra huỷ đơn và các biên số lượng đặt
 *  - Test đỏ với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Đơn nhập hàng xuyên hai trang", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/inventory");
});
