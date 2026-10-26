import { test } from "@playwright/test";

/**
 * guard-2 · 429, Retry-After và chờ đúng cách ★★★
 *
 * Làm bị khóa bằng 4 lần sai. Kiểm tra API trả 429 kèm Retry-After (1 đến 5 giây), mật khẩu đúng trong lúc khóa vẫn bị từ chối, rồi dùng expect.poll để chờ hết khóa thay vì chờ cố định. Test phải đỏ khi bật BUG-02 hoặc BUG-03.
 *
 * Trang lab: /lab/guard  ·  Đề, gợi ý và đáp án: /labs/guard trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra status 429 và đọc header retry-after
 *  - Kiểm tra Retry-After là số nằm trong khoảng 1 đến 5
 *  - Gửi mật khẩu đúng khi đang khóa và kiểm tra vẫn là 429
 *  - Dùng expect.poll với khoảng nghỉ để chờ đến khi đăng nhập được
 *  - Test đỏ với BUG-02 và với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("429, Retry-After và chờ đúng cách", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/guard");
});
