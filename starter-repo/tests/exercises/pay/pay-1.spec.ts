import { test } from "@playwright/test";

/**
 * pay-1 · Thanh toán bằng thẻ test: thành công, từ chối, không đủ số dư ★★★
 *
 * Thanh toán bằng thẻ 4242… và chờ đơn chuyển từ Đang chờ webhook sang Đã thanh toán. Sau đó kiểm tra thẻ bị từ chối và thẻ không đủ số dư không làm đổi trạng thái đơn. Ô nhập thẻ nằm trong iframe.
 *
 * Trang lab: /lab/pay  ·  Đề, gợi ý và đáp án: /labs/pay trên website
 *
 * Tiêu chí đạt:
 *  - Dùng frameLocator để nhập số thẻ, hạn dùng và CVC
 *  - Chờ trạng thái đơn bằng assertion tự thử lại, không dùng chờ cố định
 *  - Kiểm tra doanh thu và sự kiện webhook sau khi thanh toán thành công
 *  - Kiểm tra thông báo và trạng thái đơn khi thẻ bị từ chối hoặc không đủ số dư
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Thanh toán bằng thẻ test: thành công, từ chối, không đủ số dư", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/pay");
});
