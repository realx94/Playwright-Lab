import { test } from "@playwright/test";

/**
 * clinic-1 · Đặt lịch thành công và trạng thái khung giờ ★★
 *
 * Đặt lịch cho bác sĩ An ngày 2026-03-03 khung 10:00 và kiểm tra mã lịch, dòng trong danh sách, khung chuyển sang kín (không chọn được). Kiểm tra dữ liệu có sẵn của ngày 2026-03-02: An kín 08:00 và 09:00, Bình kín cả 12 khung. Test phải đỏ khi bật BUG-01.
 *
 * Trang lab: /lab/clinic  ·  Đề, gợi ý và đáp án: /labs/clinic trên website
 *
 * Tiêu chí đạt:
 *  - Cố định giờ giả bằng context.clock.setFixedTime trước khi mở trang
 *  - Kiểm tra mã lịch KH0001 và nội dung dòng lịch hẹn
 *  - Kiểm tra data-state của khung vừa đặt là taken và nút bị vô hiệu
 *  - Kiểm tra các khung kín có sẵn và đếm 12 khung kín của bác sĩ Bình
 *  - Test đỏ với BUG-01
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Đặt lịch thành công và trạng thái khung giờ", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/clinic");
});
