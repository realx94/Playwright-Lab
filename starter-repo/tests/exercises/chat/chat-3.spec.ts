import { test } from "@playwright/test";

/**
 * chat-3 · Bộ đếm tin chưa đọc khi tab bị ẩn ★★★
 *
 * Chứng minh bộ đếm chưa đọc không tăng khi tab đang được xem, tăng khi tab bị ẩn và về 0 khi hiện lại. Giả lập tab ẩn bằng code. Test phải đỏ khi bật BUG-02.
 *
 * Trang lab: /lab/chat  ·  Đề, gợi ý và đáp án: /labs/chat trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra bộ đếm bằng 0 khi tab đang hiển thị mà nhận tin
 *  - Giả lập tab ẩn và tab hiện lại bằng visibilityState và sự kiện visibilitychange
 *  - Kiểm tra bộ đếm bằng 2 sau hai tin khi ẩn và về 0 khi hiện lại
 *  - Test đỏ với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Bộ đếm tin chưa đọc khi tab bị ẩn", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/chat");
});
