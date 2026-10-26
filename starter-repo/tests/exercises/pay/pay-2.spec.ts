import { test } from "@playwright/test";

/**
 * pay-2 · 3D Secure, kiểm tra thẻ trong iframe và webhook trễ ★★★
 *
 * Kiểm tra thẻ 4000 0025 0000 3155 phải hiện hộp 3D Secure; Thất bại thì không tính tiền, Xác thực thì Đã thanh toán. Thêm test lỗi dữ liệu thẻ hiển thị trong iframe và test webhook chỉ về sau 2 giây bằng đồng hồ giả. Test phải đỏ khi bật BUG-01.
 *
 * Trang lab: /lab/pay  ·  Đề, gợi ý và đáp án: /labs/pay trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra hộp thoại 3D Secure hiện ra (role dialog) trước khi trạng thái đổi
 *  - Có test nhánh Thất bại và nhánh Xác thực
 *  - Kiểm tra thông báo lỗi của iframe cho số thẻ sai Luhn và thẻ hết hạn
 *  - Dùng context.clock.setFixedTime để đẩy thời gian qua mốc 2 giây của webhook
 *  - Test đỏ với BUG-01
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("3D Secure, kiểm tra thẻ trong iframe và webhook trễ", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/pay");
});
