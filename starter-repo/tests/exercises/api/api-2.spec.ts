import { test } from "@playwright/test";

/**
 * api-2 · Xác thực và phân quyền (401, 403) ★★
 *
 * Chứng minh rằng thao tác ghi bị chặn khi thiếu token (401) hoặc dùng token chỉ đọc (403), và xoá chỉ dành cho admin.
 *
 * Trang lab: /lab/api  ·  Đề, gợi ý và đáp án: /labs/api trên website
 *
 * Tiêu chí đạt:
 *  - Có test thiếu token và test token chỉ đọc
 *  - Dùng cùng một body hợp lệ để chỉ có yếu tố xác thực thay đổi
 *  - Có test kiểm tra xoá bằng token chỉ đọc bị từ chối
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Xác thực và phân quyền (401, 403)", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/api");
});
