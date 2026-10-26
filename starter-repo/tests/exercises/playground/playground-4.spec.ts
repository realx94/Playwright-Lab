import { test } from "@playwright/test";

/**
 * playground-4 · Shadow DOM và cuộn vô hạn ★★★
 *
 * Bấm nút nằm trong shadow DOM và kiểm tra kết quả. Sau đó cuộn danh sách tới cuối để tải thêm mục và kiểm tra số lượng tăng đúng.
 *
 * Trang lab: /lab/playground  ·  Đề, gợi ý và đáp án: /labs/playground trên website
 *
 * Tiêu chí đạt:
 *  - Tìm nút trong shadow DOM bằng getByRole (không cần cú pháp đặc biệt)
 *  - Cuộn bằng cách tác động lên đúng phần tử cuộn, không cuộn cả trang
 *  - Kiểm tra số lượng bằng assertion tự thử lại (toHaveText/toHaveCount)
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Shadow DOM và cuộn vô hạn", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/playground");
});
