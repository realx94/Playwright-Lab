import { test } from "@playwright/test";

/**
 * dashboard-1 · KPI: đối chiếu với giá trị tính độc lập (oracle) ★★
 *
 * Đọc công thức dữ liệu mô phỏng ở đầu trang lab, tự viết hàm tính doanh thu, số đơn, giá trị TB/đơn và tăng trưởng cho 7 ngày cuối dữ liệu (kỳ trước là 18–24/03) rồi so với bốn KPI trên giao diện. Thêm test Tháng 2 không có kỳ trước. Test phải đỏ khi bật BUG-01 hoặc BUG-02.
 *
 * Trang lab: /lab/dashboard  ·  Đề, gợi ý và đáp án: /labs/dashboard trên website
 *
 * Tiêu chí đạt:
 *  - Tự tính số liệu kỳ vọng bằng code, không sao chép số từ giao diện
 *  - Định dạng tiền kiểu 1.234.567 ₫ trong test để so sánh
 *  - Kiểm tra giá trị TB/đơn chia cho số đơn
 *  - Kiểm tra tăng trưởng với mẫu số là kỳ trước và đúng một chữ số thập phân
 *  - Kiểm tra thông báo không có dữ liệu kỳ trước cho Tháng 2
 *  - Test đỏ với BUG-01 và với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("KPI: đối chiếu với giá trị tính độc lập (oracle)", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/dashboard");
});
