import { test } from "@playwright/test";

/**
 * upload-2 · Tiến trình, huỷ giữa chừng và nhiều tệp ★★
 *
 * Chọn một tệp hợp lệ và kiểm tra thanh tiến trình xuất hiện rồi biến mất khi tệp được thêm; chọn tệp khác rồi huỷ giữa chừng và chứng minh tệp không được thêm; chọn hai tệp (một hợp lệ, một lỗi) cùng lúc. Test phải đỏ khi bật BUG-03.
 *
 * Trang lab: /lab/upload  ·  Đề, gợi ý và đáp án: /labs/upload trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra thanh tiến trình có tên truy cập Tiến trình tải lên
 *  - Bấm Huỷ tải lên và kiểm tra thông báo đã huỷ
 *  - Kiểm tra số tệp trong danh sách bằng toHaveCount với timeout phù hợp
 *  - Chọn hai tệp bằng một lần setInputFiles với mảng
 *  - Test đỏ với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Tiến trình, huỷ giữa chừng và nhiều tệp", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/upload");
});
