import { test } from "@playwright/test";

/**
 * reports-4 · So khớp xuyên định dạng: trang, CSV, Excel, XML ★★★
 *
 * Với ba bộ lọc (tất cả; tháng 2026-04; tháng 2026-02 + Đã huỷ), tải CSV, Excel và XML rồi khẳng định số dòng dữ liệu bằng số đơn trên trang ở cả ba tệp, và tổng tiền trong Excel/XML bằng tổng tiền hiển thị. Sinh test theo vòng lặp trên bảng dữ liệu các bộ lọc.
 *
 * Trang lab: /lab/reports  ·  Đề, gợi ý và đáp án: /labs/reports trên website
 *
 * Tiêu chí đạt:
 *  - Sinh một test cho mỗi bộ lọc từ mảng dữ liệu
 *  - CSV: bỏ BOM, tách dòng CRLF, trừ dòng tiêu đề
 *  - Excel: trừ dòng tiêu đề và dòng tổng; đọc giá trị công thức
 *  - XML: đếm phần tử order (chú ý trường hợp 0 hoặc 1 phần tử) và đọc thuộc tính total
 *  - Đối chiếu tổng tiền giữa trang, Excel và XML
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("So khớp xuyên định dạng: trang, CSV, Excel, XML", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/reports");
});
