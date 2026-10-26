import { test } from "@playwright/test";

/**
 * timezone-2 · Ngày chuyển giờ mùa hè (DST) ★★★
 *
 * Với trình duyệt ở New York, so sánh ngày thường 2026-03-01 (giờ liên tục, có 02:00) với ngày 2026-03-08 (chuyển giờ mùa hè: không có khung 02:00 địa phương). Test phải đỏ khi bật BUG-03.
 *
 * Trang lab: /lab/timezone  ·  Đề, gợi ý và đáp án: /labs/timezone trên website
 *
 * Tiêu chí đạt:
 *  - Đặt timezoneId là America/New_York
 *  - Ngày 2026-03-01: khung đầu là 20:00 và danh sách chứa 02:00
 *  - Ngày 2026-03-08: danh sách đúng 20:00 … 01:00 rồi 03:00 … 08:00 và không chứa 02:00
 *  - Dùng toEqual cho toàn bộ danh sách để bắt cả lỗi lệch giờ nhỏ
 *  - Test đỏ với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Ngày chuyển giờ mùa hè (DST)", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/timezone");
});
