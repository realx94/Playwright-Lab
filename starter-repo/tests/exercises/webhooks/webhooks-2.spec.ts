import { test } from "@playwright/test";

/**
 * webhooks-2 · Chống replay và sự kiện trùng (idempotency) ★★★
 *
 * Kiểm tra timestamp lệch 600 giây bị 400 còn lệch 290 giây thì được nhận, và một sự kiện gửi hai lần chỉ được cộng doanh thu một lần (lần hai trả duplicate: true). Test phải đỏ khi bật BUG-02 hoặc BUG-03.
 *
 * Trang lab: /lab/webhooks  ·  Đề, gợi ý và đáp án: /labs/webhooks trên website
 *
 * Tiêu chí đạt:
 *  - Ký đúng nhưng đặt timestamp quá khứ và tương lai 600 giây để kiểm tra 400
 *  - Kiểm tra biên: timestamp cách 290 giây vẫn được chấp nhận
 *  - Gửi cùng một event id hai lần và kiểm tra duplicate: true
 *  - Kiểm tra doanh thu chỉ tăng một lần
 *  - Test đỏ với BUG-02 và với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Chống replay và sự kiện trùng (idempotency)", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/webhooks");
});
