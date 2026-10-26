import { test } from "@playwright/test";

/**
 * playground-3 · Kéo thả và nội dung tải trễ ★★★
 *
 * Kéo Thẻ A vào vùng thả. Sau đó mở trang với ?delay=3000, bấm Tải dữ liệu và chờ kết quả hiện ra mà không dùng chờ cố định.
 *
 * Trang lab: /lab/playground  ·  Đề, gợi ý và đáp án: /labs/playground trên website
 *
 * Tiêu chí đạt:
 *  - Dùng dragTo cho thao tác kéo thả
 *  - Kiểm tra kết quả thả bằng assertion, không phải bằng sleep
 *  - Chờ nội dung trễ bằng assertion có timeout phù hợp, không dùng waitForTimeout
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Kéo thả và nội dung tải trễ", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/playground");
});
