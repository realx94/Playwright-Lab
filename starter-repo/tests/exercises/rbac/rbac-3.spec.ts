import { test } from "@playwright/test";

/**
 * rbac-3 · Giao diện theo vai trò với hai người dùng cùng lúc ★★★
 *
 * Mở hai tab trong cùng một context: alice (admin) và dave (guest). Chứng minh guest không thấy nút Tạo, Sửa, Xoá trong khi admin thấy; sau khi admin xoá d-a2, tải lại tab của guest chỉ còn 2 tài liệu. Thêm test carol (staff) chỉ có nút Sửa trên d-a3 và erin chỉ thấy tài liệu tổ chức B.
 *
 * Trang lab: /lab/rbac  ·  Đề, gợi ý và đáp án: /labs/rbac trên website
 *
 * Tiêu chí đạt:
 *  - Dùng context.newPage() cho từng người dùng và đăng nhập bằng giao diện
 *  - Kiểm tra sự vắng mặt của nút bằng toHaveCount(0)
 *  - Admin xoá d-a2 và thấy thông báo thành công
 *  - Tải lại tab guest và kiểm tra số dòng giảm từ 3 xuống 2
 *  - Kiểm tra staff chỉ có một nút Sửa và erin chỉ thấy tài liệu tổ chức B
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Giao diện theo vai trò với hai người dùng cùng lúc", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/rbac");
});
