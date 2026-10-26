import { test } from "@playwright/test";

/**
 * leave-4 · Phân quyền và đơn trùng ngày (BUG-02, BUG-03) ★★★
 *
 * Chứng minh nhân viên không có nút Duyệt/Từ chối còn quản lý thì có, và hệ thống chặn đơn trùng khoảng ngày. Test phải đỏ khi bật BUG-02 hoặc BUG-03.
 *
 * Trang lab: /lab/leave  ·  Đề, gợi ý và đáp án: /labs/leave trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra nút Duyệt không tồn tại ở vai trò nhân viên (toHaveCount(0))
 *  - Kiểm tra nút Duyệt có ở tab quản lý
 *  - Có test đơn trùng ngày bị từ chối kèm đúng thông báo, và đơn không trùng được chấp nhận
 *  - Test đỏ với BUG-02 và với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Phân quyền và đơn trùng ngày (BUG-02, BUG-03)", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/leave");
});
