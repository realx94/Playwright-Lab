import { test } from "@playwright/test";

/**
 * login-2 · Data-driven: các lỗi mật khẩu ★★
 *
 * Tách dữ liệu khỏi logic: sinh nhiều test từ một mảng dữ liệu, mỗi trường hợp kiểm tra đúng thông báo lỗi mật khẩu.
 *
 * Trang lab: /lab/login  ·  Đề, gợi ý và đáp án: /labs/login trên website
 *
 * Tiêu chí đạt:
 *  - Mỗi bộ dữ liệu là một test riêng có tên mô tả
 *  - Có ít nhất 5 trường hợp, gồm biên 7 ký tự và 33 ký tự
 *  - Dữ liệu nằm trong một mảng, logic không bị lặp lại
 *  - Assert đúng nội dung thông báo lỗi, không chỉ kiểm tra có lỗi
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Data-driven: các lỗi mật khẩu", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/login");
});
