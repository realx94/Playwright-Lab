import { test } from "@playwright/test";

/**
 * reports-2 · Parse XML xuất ra và so từng đơn với bảng trên trang ★★★
 *
 * Lọc tháng 2026-03 (mọi trạng thái), bấm Xuất XML, đọc tệp, kiểm tra tệp là XML hợp lệ (tên khách có &, < và dấu nháy phải được escape), rồi parse bằng fast-xml-parser và so từng phần tử order (mã, khách hàng, trạng thái, số tiền) với từng dòng của bảng trên trang. Test phải đỏ khi bật BUG-02.
 *
 * Trang lab: /lab/reports  ·  Đề, gợi ý và đáp án: /labs/reports trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra tên tệp .xml từ download.suggestedFilename()
 *  - Dùng XMLValidator.validate để khẳng định tệp parse được
 *  - Kiểm tra văn bản thô có &amp; và &lt;&gt; ở đúng chỗ
 *  - Duyệt từng order và so với từng dòng trang (mã, khách hàng, trạng thái, số tiền)
 *  - Xử lý trường hợp chỉ có một order (parser trả về object, không phải mảng)
 *  - Test đỏ với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Parse XML xuất ra và so từng đơn với bảng trên trang", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/reports");
});
