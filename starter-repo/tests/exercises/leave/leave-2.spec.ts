import { test } from "@playwright/test";

/**
 * leave-2 · Hai vai trò trên hai tab ★★★
 *
 * Nhân viên gửi đơn ở tab thứ nhất; mở tab thứ hai chuyển sang vai trò Quản lý để duyệt. Quay lại tab nhân viên xác nhận trạng thái và số dư phép đã cập nhật mà không tải lại trang.
 *
 * Trang lab: /lab/leave  ·  Đề, gợi ý và đáp án: /labs/leave trên website
 *
 * Tiêu chí đạt:
 *  - Dùng hai Page trong cùng một context (dùng chung localStorage)
 *  - Chọn vai trò Quản lý ở tab thứ hai bằng selectOption
 *  - Kiểm tra cả hai tab đều thấy trạng thái Đã duyệt
 *  - Số dư phép giảm đúng 3 ngày sau khi duyệt
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Hai vai trò trên hai tab", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/leave");
});
