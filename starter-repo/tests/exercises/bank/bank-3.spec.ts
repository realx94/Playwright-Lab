import { test } from "@playwright/test";

/**
 * bank-3 · OTP: sai 3 lần và thời hạn 60 giây ★★★
 *
 * Chứng minh nhập sai OTP hai lần báo (1/3), (2/3) và lần thứ ba huỷ giao dịch quay về bước 1 với số dư không đổi; dùng đồng hồ giả để chứng minh OTP còn hiệu lực đúng ở giây thứ 60 và hết hạn ở giây thứ 61 (gửi lại OTP rồi thành công). Test phải đỏ khi bật BUG-03.
 *
 * Trang lab: /lab/bank  ·  Đề, gợi ý và đáp án: /labs/bank trên website
 *
 * Tiêu chí đạt:
 *  - Tạo mã sai chắc chắn khác mã thật
 *  - Kiểm tra từng thông báo đếm số lần sai
 *  - Kiểm tra giao dịch bị huỷ: quay về bước 1 và số dư giữ nguyên
 *  - Kiểm tra biên 60 giây và 61 giây bằng đồng hồ giả
 *  - Gửi lại OTP sau khi hết hạn và hoàn tất giao dịch
 *  - Test đỏ với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("OTP: sai 3 lần và thời hạn 60 giây", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/bank");
});
