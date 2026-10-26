import { test } from "@playwright/test";

/**
 * todo-3 · Bộ lọc, bộ đếm và dữ liệu sau khi tải lại ★★
 *
 * Kiểm tra bộ đếm chỉ tính việc chưa xong, ba bộ lọc hoạt động đúng và dữ liệu vẫn còn sau khi tải lại trang. Chạy lại với ?bugs=BUG-02 để thấy lỗi.
 *
 * Trang lab: /lab/todo  ·  Đề, gợi ý và đáp án: /labs/todo trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra số lượng và nội dung hiển thị của từng bộ lọc
 *  - Kiểm tra bộ đếm trước và sau khi hoàn thành một việc
 *  - Sau khi tải lại, xác nhận trạng thái đã xong của việc vẫn được giữ
 *  - Test đỏ với BUG-02 (bộ đếm đếm cả việc đã xong)
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Bộ lọc, bộ đếm và dữ liệu sau khi tải lại", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/todo");
});
