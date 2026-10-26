import { test } from "@playwright/test";

/**
 * table-3 · Sắp xếp theo ngày và bắt BUG-03 ★★★
 *
 * Chứng minh cột Ngày tạo sắp xếp đúng theo thời gian: đọc toàn bộ ngày trên trang, chuyển về thời gian thật và so sánh. Chạy lại với ?bugs=BUG-03 để thấy lỗi.
 *
 * Trang lab: /lab/table  ·  Đề, gợi ý và đáp án: /labs/table trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra aria-sort của tiêu đề cột sau mỗi lần bấm
 *  - So sánh các ngày bằng giá trị thời gian (không so sánh chuỗi dd/mm/yyyy)
 *  - Chờ bảng tải xong trước khi đọc dữ liệu, không dùng chờ cố định
 *  - Test xanh trên lab sạch và đỏ khi bật ?bugs=BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Sắp xếp theo ngày và bắt BUG-03", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/table");
});
