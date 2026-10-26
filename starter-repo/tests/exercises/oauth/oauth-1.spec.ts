import { test } from "@playwright/test";

/**
 * oauth-1 · Đăng nhập OAuth: chuyển hướng, từ chối và popup ★★★
 *
 * Tự động hoá ba luồng: đăng nhập bằng chuyển hướng (chọn tài khoản rồi Cho phép), bấm Từ chối và đăng nhập bằng popup. Không đăng nhập vào Google/GitHub thật; luôn dùng IdP giả của lab.
 *
 * Trang lab: /lab/oauth  ·  Đề, gợi ý và đáp án: /labs/oauth trên website
 *
 * Tiêu chí đạt:
 *  - Chờ chuyển hướng sang trang IdP bằng waitForURL
 *  - Kiểm tra thông báo khi chưa chọn tài khoản và khi Từ chối
 *  - Dùng page.waitForEvent('popup') và thao tác trong popup, chờ popup đóng
 *  - Kiểm tra cửa sổ gốc đã đăng nhập sau khi popup đóng
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Đăng nhập OAuth: chuyển hướng, từ chối và popup", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/oauth");
});
