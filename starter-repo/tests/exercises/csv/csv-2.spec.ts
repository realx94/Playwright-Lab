import { test } from "@playwright/test";

/**
 * csv-2 · Tệp sai định dạng và trường có dấu phẩy ★★
 *
 * Kiểm tra bốn kiểu tệp bị từ chối nguyên cả tệp (thiếu cột, rỗng, sai đuôi .txt, vượt 100 dòng) và kiểm tra trường có dấu phẩy, dấu nháy kép được đọc đúng khi được bao trong dấu nháy.
 *
 * Trang lab: /lab/csv  ·  Đề, gợi ý và đáp án: /labs/csv trên website
 *
 * Tiêu chí đạt:
 *  - Mỗi kiểu tệp lỗi có thông báo csv-fatal đúng nội dung
 *  - Kiểm tra sau khi bị từ chối bảng vẫn không có khách hàng
 *  - Tạo tệp 101 dòng bằng Array.from thay vì gõ tay
 *  - Kiểm tra tên Nguyễn, Văn "A" hiển thị đúng trong một ô, không bị tách cột
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Tệp sai định dạng và trường có dấu phẩy", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/csv");
});
