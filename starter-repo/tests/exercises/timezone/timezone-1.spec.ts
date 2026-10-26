import { test } from "@playwright/test";

/**
 * timezone-1 · Múi giờ trình duyệt và múi giờ được chọn ★★★
 *
 * Đặt timezoneId của context là Asia/Ho_Chi_Minh và kiểm tra 12 khung giờ hiển thị 08:00 đến 19:00. Sau đó chọn America/New_York và kiểm tra khung đầu là 20:00 trong khi data-utc không đổi. Cuối cùng kiểm tra xác nhận đặt lịch hiển thị cả giờ địa phương và UTC. Test phải đỏ khi bật BUG-01.
 *
 * Trang lab: /lab/timezone  ·  Đề, gợi ý và đáp án: /labs/timezone trên website
 *
 * Tiêu chí đạt:
 *  - Dùng test.use({ timezoneId }) cho nhóm test, không đổi múi giờ của máy
 *  - Kiểm tra toàn bộ danh sách giờ bằng allInnerTexts và toEqual
 *  - Kiểm tra data-utc không đổi khi đổi múi giờ hiển thị
 *  - Đặt lịch với giờ giả cố định và kiểm tra dòng xác nhận có cả giờ địa phương lẫn UTC
 *  - Test đỏ với BUG-01
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Múi giờ trình duyệt và múi giờ được chọn", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/timezone");
});
