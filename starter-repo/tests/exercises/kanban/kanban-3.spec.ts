import { test } from "@playwright/test";

/**
 * kanban-3 · Sửa tiêu đề tại chỗ: double click, Enter, Escape ★★
 *
 * Double click tiêu đề để sửa tại chỗ. Enter lưu, Escape huỷ (tiêu đề giữ nguyên giá trị cũ), tiêu đề rỗng hoặc toàn khoảng trắng bị từ chối và vẫn ở chế độ sửa, tối đa 80 ký tự (80 được, 81 bị từ chối). Test phải đỏ khi bật BUG-02.
 *
 * Trang lab: /lab/kanban  ·  Đề, gợi ý và đáp án: /labs/kanban trên website
 *
 * Tiêu chí đạt:
 *  - Dùng dblclick để vào chế độ sửa và kiểm tra ô nhập title-input xuất hiện
 *  - Có test Enter lưu và test Escape huỷ, kiểm tra tiêu đề sau khi thoát
 *  - Kiểm tra biên 80 và 81 ký tự, và tiêu đề rỗng, cùng nội dung thông báo lỗi
 *  - Kiểm tra giá trị đã lưu vẫn còn sau page.reload()
 *  - Test đỏ với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Sửa tiêu đề tại chỗ: double click, Enter, Escape", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/kanban");
});
