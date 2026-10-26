import { test } from "@playwright/test";

/**
 * table-1 · Tìm kiếm, lọc và tổng số ★★
 *
 * Kiểm tra tìm kiếm (có kết quả và không có kết quả), lọc vai trò, và lọc kết hợp vai trò với trạng thái. Luôn đối chiếu với tổng số hiển thị.
 *
 * Trang lab: /lab/table  ·  Đề, gợi ý và đáp án: /labs/table trên website
 *
 * Tiêu chí đạt:
 *  - Dùng getByLabel cho ô tìm kiếm và các bộ lọc
 *  - Kiểm tra tổng số người dùng sau mỗi thay đổi bằng assertion tự thử lại
 *  - Có test cho trạng thái không tìm thấy kết quả
 *  - Không dùng chờ cố định dù bảng có độ trễ khi tải
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Tìm kiếm, lọc và tổng số", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/table");
});
