import { test } from "@playwright/test";

/**
 * todo-1 · Thêm, hoàn thành và xoá có xác nhận ★
 *
 * Đi hết luồng chính: thêm một công việc, tick hoàn thành, thử xoá rồi chọn Giữ lại, sau đó xoá thật và kiểm tra danh sách trống.
 *
 * Trang lab: /lab/todo  ·  Đề, gợi ý và đáp án: /labs/todo trên website
 *
 * Tiêu chí đạt:
 *  - Dùng getByRole/getByLabel cho mọi thao tác, không dùng CSS dài
 *  - Kiểm tra bộ đếm sau khi thêm và sau khi hoàn thành
 *  - Kiểm tra cả hai nhánh của hộp thoại xác nhận (Giữ lại và Xoá hẳn)
 *  - Reset dữ liệu lab trước khi bắt đầu để test độc lập
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Thêm, hoàn thành và xoá có xác nhận", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/todo");
});
