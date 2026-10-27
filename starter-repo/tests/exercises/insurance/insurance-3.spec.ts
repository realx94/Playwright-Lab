import { test } from "@playwright/test";

/**
 * insurance-3 · Tính phí qua nhiều tổ hợp (bảng dữ liệu) ★★★
 *
 * Tính tay phí cho 12 tổ hợp (loại xe, gói, tuổi dưới 25, quyền lợi thêm, số năm không bồi thường 0/1/2/3, kỳ tháng, làm tròn xuống nghìn) theo công thức trong BR rồi viết test data-driven so với tạm tính ở bước 3. Test phải đỏ khi bật BUG-02.
 *
 * Trang lab: /lab/insurance  ·  Đề, gợi ý và đáp án: /labs/insurance trên website
 *
 * Tiêu chí đạt:
 *  - Một mảng dữ liệu có cột phí năm và số tiền phải trả mỗi kỳ, vòng lặp sinh test
 *  - Có đủ bốn mức số năm không bồi thường 0, 1, 2, 3
 *  - Có trường hợp tuổi 24 (phụ phí) và đúng 25 (không phụ phí)
 *  - Có trường hợp kỳ tháng và trường hợp làm tròn xuống nghìn đồng
 *  - Đọc kết quả qua data-testid premium-annual và premium-payable
 *  - Test đỏ với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Tính phí qua nhiều tổ hợp (bảng dữ liệu)", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/insurance");
});
