import { test } from "@playwright/test";

/**
 * hotel-4 · Combobox bàn phím và đặt phòng qua cuối tháng ★★★
 *
 * Chọn thành phố hoàn toàn bằng bàn phím (gõ để lọc không phân biệt dấu, ArrowDown, Enter), kiểm tra lỗi khi gõ chữ nhưng không chọn gợi ý. Sau đó đặt phòng với khoảng ngày vắt qua cuối tháng (30/03 → 02/04), kiểm tra số đêm, tiền phòng, phí bữa sáng, thuế 10%, tổng và mã xác nhận. Test phải đỏ khi bật BUG-02.
 *
 * Trang lab: /lab/hotel  ·  Đề, gợi ý và đáp án: /labs/hotel trên website
 *
 * Tiêu chí đạt:
 *  - Điều khiển combobox bằng press (ArrowDown, Enter), không click vào gợi ý
 *  - Kiểm tra giá trị ô sau khi chọn và listbox đã đóng
 *  - Tính tay số đêm, thuế 10% và tổng rồi đối chiếu với tóm tắt
 *  - Điền form liên hệ bằng getByLabel và kiểm tra mã xác nhận
 *  - Test đỏ với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Combobox bàn phím và đặt phòng qua cuối tháng", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/hotel");
});
