import { test } from "@playwright/test";

/**
 * playground-1 · Xử lý hộp thoại confirm ★★
 *
 * Kiểm tra hai nhánh của hộp thoại confirm: chấp nhận hiển thị “Đồng ý”, từ chối hiển thị “Huỷ”. Hộp thoại phải được xử lý bằng code.
 *
 * Trang lab: /lab/playground  ·  Đề, gợi ý và đáp án: /labs/playground trên website
 *
 * Tiêu chí đạt:
 *  - Đăng ký xử lý hộp thoại TRƯỚC khi bấm nút gây ra nó
 *  - Có đủ hai nhánh: chấp nhận và từ chối
 *  - Kiểm tra nội dung thông báo của hộp thoại (dialog.message())
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Xử lý hộp thoại confirm", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/playground");
});
