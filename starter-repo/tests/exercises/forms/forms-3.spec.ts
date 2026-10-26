import { test } from "@playwright/test";

/**
 * forms-3 · Upload tệp hợp lệ và không hợp lệ ★★
 *
 * Kiểm tra quy tắc tệp đính kèm: .exe bị từ chối, .png hợp lệ được chấp nhận. Không dùng tệp có sẵn trên ổ đĩa.
 *
 * Trang lab: /lab/forms  ·  Đề, gợi ý và đáp án: /labs/forms trên website
 *
 * Tiêu chí đạt:
 *  - Tạo tệp ngay trong test bằng buffer, không phụ thuộc đường dẫn máy
 *  - Có cả trường hợp sai định dạng và đúng định dạng
 *  - Assert thông báo lỗi đúng nội dung ở trường hợp sai
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Upload tệp hợp lệ và không hợp lệ", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/forms");
});
