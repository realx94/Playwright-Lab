import { test } from "@playwright/test";

/**
 * rbac-1 · Ma trận quyền theo vai trò (data-driven) ★★★
 *
 * Viết một test chạy lặp cho từng vai trò admin, bob (manager), carol (staff) và dave (guest): kiểm tra kết quả tạo, sửa tài liệu của người khác và xoá d-a2 đúng theo ma trận quyền. Thêm test staff chỉ sửa được tài liệu của chính mình. Test phải đỏ khi bật BUG-03.
 *
 * Trang lab: /lab/rbac  ·  Đề, gợi ý và đáp án: /labs/rbac trên website
 *
 * Tiêu chí đạt:
 *  - Khai báo ma trận dưới dạng mảng và sinh test bằng vòng for
 *  - Kiểm tra đúng status code cho từng ô của ma trận: 201/200/204 hoặc 403
 *  - Dùng request context mới cho mỗi test để dữ liệu không ảnh hưởng nhau
 *  - Có test staff sửa d-a3 và tài liệu tự tạo được (200) nhưng không sửa được d-a2 (403)
 *  - Test đỏ với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Ma trận quyền theo vai trò (data-driven)", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/rbac");
});
