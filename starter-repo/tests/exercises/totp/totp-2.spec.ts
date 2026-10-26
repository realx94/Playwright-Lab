import { test } from "@playwright/test";

/**
 * totp-2 · Độ lệch thời gian và chống dùng lại mã ★★★
 *
 * Kiểm tra biên của cửa sổ chấp nhận (±1 chu kỳ được, ±2 chu kỳ bị từ chối) và việc một mã đã dùng không được dùng lại. Test phải đỏ khi bật BUG-01 hoặc BUG-03.
 *
 * Trang lab: /lab/totp  ·  Đề, gợi ý và đáp án: /labs/totp trên website
 *
 * Tiêu chí đạt:
 *  - Có test mã lệch -1 chu kỳ (được chấp nhận) và -2 chu kỳ (bị từ chối)
 *  - Có test dùng lại cùng một mã sau khi đăng xuất và nhận thông báo đã được sử dụng
 *  - Tính mã ở thời điểm lệch bằng cách truyền thời gian vào hàm totp, không chờ thật
 *  - Test đỏ với BUG-01 và với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Độ lệch thời gian và chống dùng lại mã", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/totp");
});
