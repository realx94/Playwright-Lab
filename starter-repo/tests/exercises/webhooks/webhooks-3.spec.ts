import { test } from "@playwright/test";

/**
 * webhooks-3 · Retry với backoff và cập nhật bất đồng bộ trên giao diện ★★★
 *
 * Gửi sự kiện evt_flaky_1 theo vòng retry có backoff lũy thừa cho tới khi thành công (503, 503 rồi 200). Thêm test giao diện: bấm giả lập đối tác trả inv-2, chờ hóa đơn tự chuyển sang Đã thanh toán và doanh thu cập nhật.
 *
 * Trang lab: /lab/webhooks  ·  Đề, gợi ý và đáp án: /labs/webhooks trên website
 *
 * Tiêu chí đạt:
 *  - Vòng retry tối đa 5 lần, dừng khi res.ok() và ghi lại dãy status
 *  - Dãy status chính xác là 503, 503, 200
 *  - Backoff tăng dần giữa các lần thử, không dùng một khoảng chờ cố định lớn
 *  - Test giao diện chờ trạng thái bằng assertion có timeout đủ lớn
 *  - Kiểm tra doanh thu và nhật ký webhook trên giao diện
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Retry với backoff và cập nhật bất đồng bộ trên giao diện", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/webhooks");
});
