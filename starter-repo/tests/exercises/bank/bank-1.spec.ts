import { test } from "@playwright/test";

/**
 * bank-1 · Chuyển tiền qua 4 bước và kiểm tra dữ liệu đầu vào ★★★
 *
 * Tự động hoá một lần chuyển 1.000.000 ₫ qua đủ 4 bước: kiểm tra màn xác nhận (tên người nhận, phí, tổng trừ), đọc OTP giả lập trên màn hình, kiểm tra số dư, mã giao dịch và lịch sử. Thêm test data-driven cho sáu kiểu đầu vào bị từ chối ở bước 1.
 *
 * Trang lab: /lab/bank  ·  Đề, gợi ý và đáp án: /labs/bank trên website
 *
 * Tiêu chí đạt:
 *  - Viết hàm helper cho từng bước (nhập, xác nhận, OTP)
 *  - Đọc OTP giả lập từ data-testid otp-hint thay vì đoán
 *  - Kiểm tra phí 3.300 ₫ và tổng trừ 1.003.300 ₫ ở bước xác nhận
 *  - Kiểm tra số dư mới, mã giao dịch TX0001 và một dòng lịch sử
 *  - Sinh test cho các đầu vào bị từ chối bằng vòng for từ mảng dữ liệu
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Chuyển tiền qua 4 bước và kiểm tra dữ liệu đầu vào", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/bank");
});
