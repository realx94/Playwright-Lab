import { test } from "@playwright/test";

/**
 * inventory-2 · Nhập, xuất, điều chỉnh: biên tồn kho và dữ liệu đầu vào ★★★
 *
 * Chứng minh xuất 121 khi tồn 120 bị chặn (không ghi lịch sử), xuất 120 đưa tồn về 0 và nhãn Hết hàng; kiểm tra các số lượng không hợp lệ (abc, -5, 0, 10000); điều chỉnh bắt buộc ghi chú và đặt tồn theo số đếm (kể cả 0 và 9999). Test phải đỏ khi bật BUG-01.
 *
 * Trang lab: /lab/inventory  ·  Đề, gợi ý và đáp án: /labs/inventory trên website
 *
 * Tiêu chí đạt:
 *  - Sinh test cho các số lượng không hợp lệ từ một bảng dữ liệu
 *  - Kiểm tra tồn không đổi và không có lịch sử sau khi bị từ chối
 *  - Kiểm tra biên xuất đúng bằng tồn
 *  - Kiểm tra dòng lịch sử của điều chỉnh gồm tồn trước, tồn sau và ghi chú
 *  - Test đỏ với BUG-01
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Nhập, xuất, điều chỉnh: biên tồn kho và dữ liệu đầu vào", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/inventory");
});
