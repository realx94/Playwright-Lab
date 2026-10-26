import { test } from "@playwright/test";

/**
 * rbac-2 · Tách tổ chức và IDOR ★★★
 *
 * Chứng minh mỗi tổ chức chỉ thấy dữ liệu của mình và rằng đổi id trong URL sang tài liệu tổ chức khác luôn trả 404 (đọc, sửa, xoá), không phải 403, và không làm đổi dữ liệu. Test phải đỏ khi bật BUG-01 hoặc BUG-02.
 *
 * Trang lab: /lab/rbac  ·  Đề, gợi ý và đáp án: /labs/rbac trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra danh sách của alice (tổ chức A) và erin (tổ chức B) không giao nhau
 *  - Kiểm tra GET, PATCH và DELETE tài liệu tổ chức khác đều trả 404
 *  - Kiểm tra sau các lần thử đó danh sách của tổ chức bị nhắm tới không đổi
 *  - Kiểm tra token thiếu hoặc lạ trả 401
 *  - Test đỏ với BUG-01 và với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Tách tổ chức và IDOR", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/rbac");
});
