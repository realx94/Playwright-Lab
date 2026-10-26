import { test } from "@playwright/test";

/**
 * oauth-2 · Bảo mật luồng OAuth: state, code dùng một lần, redirect_uri ★★★
 *
 * Chứng minh ba lớp bảo vệ: state giả bị từ chối (CSRF), authorization code đã dùng không dùng lại được, và IdP từ chối redirect_uri lạ. Test phải đỏ khi bật BUG-01 hoặc BUG-02.
 *
 * Trang lab: /lab/oauth  ·  Đề, gợi ý và đáp án: /labs/oauth trên website
 *
 * Tiêu chí đạt:
 *  - Lấy code và state thật từ lưu trữ của trình duyệt sau một lần đăng nhập
 *  - Mở lại callback với state giả và kiểm tra bị từ chối
 *  - Mở lại callback với code cũ và state đúng, kiểm tra báo đã sử dụng
 *  - Mở trang IdP với redirect_uri lạ và kiểm tra không có nút Cho phép
 *  - Test đỏ với BUG-01 và với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Bảo mật luồng OAuth: state, code dùng một lần, redirect_uri", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/oauth");
});
