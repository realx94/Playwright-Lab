import { test } from "@playwright/test";

/**
 * booking-3 · Hai người tranh một ghế và bán hết vé ★★★
 *
 * Mở hai tab trong cùng một context. Tab B chọn ghế C1 nhưng chưa giữ; tab A giữ C1 trước. Chứng minh tab B thấy C1 ở trạng thái đang giữ, bấm Giữ chỗ nhận thông báo, và C1 tự trống khi A huỷ hoặc khi hết hạn. Thêm test bán hết ghế của suất 20:00.
 *
 * Trang lab: /lab/booking  ·  Đề, gợi ý và đáp án: /labs/booking trên website
 *
 * Tiêu chí đạt:
 *  - Dùng context.newPage() cho người thứ hai và cùng đồng hồ giả
 *  - Kiểm tra trạng thái held ở tab còn lại
 *  - Kiểm tra thông báo khi người sau giữ ghế đã bị chiếm
 *  - Kiểm tra ghế tự nhả sau khi huỷ và sau khi quá hạn
 *  - Kiểm tra thông báo hết vé và suất khác không bị ảnh hưởng
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Hai người tranh một ghế và bán hết vé", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/booking");
});
