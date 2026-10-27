import { test } from "@playwright/test";

/**
 * insurance-2 · Trường điều kiện theo loại xe ★★★
 *
 * Kiểm tra: ô Tải trọng (tấn) chỉ hiện với Ô tô tải nhẹ và ẩn lại khi đổi loại xe; tải trọng chỉ hợp lệ trong khoảng 0,5 đến 3,5 (thử 0,4, 3,6, chữ, để trống, rồi 0,5 và 3,5); gói Toàn diện không tồn tại với Xe máy nhưng có với Ô tô con.
 *
 * Trang lab: /lab/insurance  ·  Đề, gợi ý và đáp án: /labs/insurance trên website
 *
 * Tiêu chí đạt:
 *  - Khẳng định ô Tải trọng không có trong DOM với Ô tô con và Xe máy (toHaveCount(0))
 *  - Thử cả bốn giá trị tải trọng sai và hai giá trị biên đúng
 *  - Dùng getByRole('radio', { name, exact: true }) cho các gói bảo hiểm
 *  - Kiểm tra gói Toàn diện xuất hiện lại sau khi đổi từ Xe máy sang Ô tô con
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Trường điều kiện theo loại xe", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/insurance");
});
