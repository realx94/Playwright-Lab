import { test } from "@playwright/test";

/**
 * dashboard-3 · Bộ lọc: danh mục, nút đặt nhanh và biên khoảng ngày ★★
 *
 * Kiểm tra lọc danh mục Điện tử đổi doanh thu và tiêu đề biểu đồ; nút 30 ngày cuối dữ liệu đặt Từ ngày 2026-03-02 và vẽ 30 cột; kiểm tra khoảng ngày đảo ngược, ngoài dữ liệu, đúng 31 ngày (hợp lệ) và 32 ngày (bị từ chối), và khoảng một ngày.
 *
 * Trang lab: /lab/dashboard  ·  Đề, gợi ý và đáp án: /labs/dashboard trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra tiêu đề biểu đồ nêu đúng danh mục và khoảng ngày
 *  - Kiểm tra nút đặt nhanh cập nhật ô ngày và số cột
 *  - Kiểm tra từng thông báo lỗi của khoảng ngày
 *  - Kiểm tra biên 31 ngày và 32 ngày
 *  - Kiểm tra khi có lỗi thì không vẽ cột nào
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Bộ lọc: danh mục, nút đặt nhanh và biên khoảng ngày", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/dashboard");
});
