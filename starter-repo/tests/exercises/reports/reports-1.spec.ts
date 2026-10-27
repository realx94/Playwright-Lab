import { test } from "@playwright/test";

/**
 * reports-1 · Tải Excel và so tổng tiền với bảng trên trang ★★★
 *
 * Lọc tháng 2026-03, trạng thái Hoàn tất, bấm Xuất Excel, bắt sự kiện download và đọc tệp .xlsx bằng thư viện exceljs. Kiểm tra tên tệp, tên hai sheet, dòng tiêu đề, số dòng dữ liệu bằng số đơn trên trang, công thức SUM của dòng tổng phủ hết các dòng dữ liệu và giá trị tổng bằng tổng tiền hiển thị trên trang. Test phải đỏ khi bật BUG-01.
 *
 * Trang lab: /lab/reports  ·  Đề, gợi ý và đáp án: /labs/reports trên website
 *
 * Tiêu chí đạt:
 *  - Dùng page.waitForEvent('download') cùng lúc với thao tác bấm nút
 *  - Đọc tệp qua download.path() rồi mở bằng ExcelJS
 *  - Kiểm tra tên sheet, dòng tiêu đề và số dòng (tiêu đề + dữ liệu + tổng)
 *  - So tổng trong Excel (công thức và giá trị) với tổng tiền trên trang, có dung sai số thực
 *  - Tự cộng các ô số tiền để đối chiếu với dòng tổng
 *  - Test đỏ với BUG-01
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Tải Excel và so tổng tiền với bảng trên trang", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/reports");
});
