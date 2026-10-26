import { test } from "@playwright/test";

/**
 * orders-3 · Xoá mềm và so sánh ba nguồn UI, API, DB ★★★
 *
 * Xoá một đơn qua API và chứng minh đó là xoá mềm: API trả 404 nhưng DB vẫn còn dòng với deleted_at, tồn kho được hoàn và audit có order.deleted. Thêm một test tạo đơn qua giao diện rồi so sánh con số hiển thị trên UI, trong API và trong DB.
 *
 * Trang lab: /lab/orders  ·  Đề, gợi ý và đáp án: /labs/orders trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra DELETE trả 204, GET trả 404 và danh sách không còn đơn
 *  - Kiểm tra dòng orders vẫn còn với status cancelled và deleted_at khác null
 *  - Kiểm tra tồn kho được hoàn và audit_log có thứ tự order.created, order.deleted
 *  - Tạo đơn bằng giao diện, lấy tổng tiền từ UI, API và DB rồi so sánh
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Xoá mềm và so sánh ba nguồn UI, API, DB", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/orders");
});
