import { test } from "@playwright/test";

/**
 * tickets-3 · Kiểm tra dữ liệu tạo ticket và tệp đính kèm ★★
 *
 * Kiểm tra ba lỗi thiếu thông tin, biên độ dài tiêu đề 5 và mô tả 10 ký tự hợp lệ còn 101 và 1001 thì bị từ chối, và ba kiểu tệp đính kèm: .exe, lớn hơn 1 MB một byte, đúng 1 MB.
 *
 * Trang lab: /lab/tickets  ·  Đề, gợi ý và đáp án: /labs/tickets trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra từng thông báo lỗi bằng data-testid error-*
 *  - Kiểm tra biên 5 và 10 ký tự hợp lệ
 *  - Kiểm tra biên 1 MB và 1 MB cộng 1 byte bằng Buffer.alloc
 *  - Kiểm tra sau khi sửa lỗi ticket được tạo với mã T0001
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Kiểm tra dữ liệu tạo ticket và tệp đính kèm", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/tickets");
});
