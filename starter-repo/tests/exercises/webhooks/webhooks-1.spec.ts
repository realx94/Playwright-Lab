import { test } from "@playwright/test";

/**
 * webhooks-1 · Ký HMAC và gửi webhook hợp lệ; từ chối chữ ký sai ★★★
 *
 * Đóng vai đối tác: tự tính chữ ký HMAC-SHA256 và gửi sự kiện invoice.paid. Kiểm tra hóa đơn và doanh thu được cập nhật qua endpoint trạng thái. Sau đó chứng minh chữ ký sai, thiếu chữ ký hoặc body bị sửa đều bị 401 và không đổi dữ liệu. Test phải đỏ khi bật BUG-01.
 *
 * Trang lab: /lab/webhooks  ·  Đề, gợi ý và đáp án: /labs/webhooks trên website
 *
 * Tiêu chí đạt:
 *  - Tính chữ ký bằng node:crypto với chuỗi timestamp + '.' + body
 *  - Gửi body dạng Buffer để từng byte khớp với chuỗi đã ký
 *  - Kiểm tra 200 và trạng thái hóa đơn qua GET /api/lab/webhook/state
 *  - Có test chữ ký sai, thiếu chữ ký và chữ ký của body khác, tất cả đều 401
 *  - Kiểm tra dữ liệu không đổi sau các lần bị từ chối
 *  - Test đỏ với BUG-01
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Ký HMAC và gửi webhook hợp lệ; từ chối chữ ký sai", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/webhooks");
});
