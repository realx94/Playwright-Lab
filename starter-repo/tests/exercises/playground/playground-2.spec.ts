import { test } from "@playwright/test";

/**
 * playground-2 · Tab mới và iframe ★★
 *
 * Bắt tab mới sau khi bấm liên kết trợ giúp và kiểm tra nội dung của nó; sau đó điền và gửi form nằm trong iframe thanh toán.
 *
 * Trang lab: /lab/playground  ·  Đề, gợi ý và đáp án: /labs/playground trên website
 *
 * Tiêu chí đạt:
 *  - Bắt tab mới bằng sự kiện của context, chạy song song với thao tác bấm
 *  - Dùng đối tượng Page của tab mới để kiểm tra tiêu đề
 *  - Thao tác trong iframe bằng frameLocator, không dùng page.getBy... trực tiếp
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Tab mới và iframe", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/playground");
});
