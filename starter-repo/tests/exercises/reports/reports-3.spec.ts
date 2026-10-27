import { test } from "@playwright/test";

/**
 * reports-3 · Tên tệp, MIME và nội dung Word/PDF theo bộ lọc ★★★
 *
 * Lọc tháng 2026-03, trạng thái Hoàn tất. Tải Word và PDF: kiểm tra tên tệp, đọc nội dung (mammoth cho .docx, pdf-parse cho .pdf) và khẳng định chỉ có 5 đơn Hoàn tất, không có đơn đã huỷ DH-006. Ghi nhớ PDF dùng chữ không dấu. Ngoài ra dùng page.request kiểm tra Content-Type và Content-Disposition của cả 5 định dạng. Test phải đỏ khi bật BUG-03.
 *
 * Trang lab: /lab/reports  ·  Đề, gợi ý và đáp án: /labs/reports trên website
 *
 * Tiêu chí đạt:
 *  - Đọc suggestedFilename() của cả Word và PDF
 *  - Trích văn bản .docx bằng mammoth và .pdf bằng pdf-parse; kiểm tra chữ ký %PDF-
 *  - Khẳng định tiêu đề, dòng tóm tắt và các mã đơn mong đợi có mặt
 *  - Khẳng định đơn đã huỷ KHÔNG có mặt trong cả hai tệp
 *  - Kiểm tra MIME và Content-Disposition của 5 định dạng qua page.request
 *  - Test đỏ với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Tên tệp, MIME và nội dung Word/PDF theo bộ lọc", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/reports");
});
