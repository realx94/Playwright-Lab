import { test } from "@playwright/test";

/**
 * tickets-2 · Luồng trạng thái, điều kiện giải quyết và khoá ticket đóng ★★★
 *
 * Đi hết luồng Mới → Đang xử lý → Đã giải quyết → Đóng, ở mỗi trạng thái kiểm tra các nút chuyển hợp lệ. Chứng minh giải quyết khi chưa có bình luận bị chặn, ticket đóng không nhận bình luận, và giải quyết sau hạn được ghi nhận là trễ hạn. Test phải đỏ khi bật BUG-03.
 *
 * Trang lab: /lab/tickets  ·  Đề, gợi ý và đáp án: /labs/tickets trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra danh sách nút Chuyển sang ... ở từng trạng thái bằng toHaveText mảng
 *  - Kiểm tra thông báo khi giải quyết mà chưa có bình luận và trạng thái không đổi
 *  - Sau khi đóng không còn nút chuyển và bình luận mới bị từ chối
 *  - Dùng đồng hồ giả để kiểm tra Giải quyết trễ hạn
 *  - Test đỏ với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Luồng trạng thái, điều kiện giải quyết và khoá ticket đóng", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/tickets");
});
