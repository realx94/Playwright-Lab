import { test } from "@playwright/test";

/**
 * csv-3 · Xuất CSV đúng chuẩn và nhập lại (round trip) ★★
 *
 * Nhập hai khách hàng (một tên chứa dấu phẩy và dấu nháy), bấm Xuất CSV, đọc nội dung tệp tải về và kiểm tra đúng RFC 4180 (tiêu đề, CRLF, bao nháy kép). Sau đó xoá dữ liệu và nhập lại chính tệp vừa xuất để chứng minh dữ liệu không đổi. Test phải đỏ khi bật BUG-01.
 *
 * Trang lab: /lab/csv  ·  Đề, gợi ý và đáp án: /labs/csv trên website
 *
 * Tiêu chí đạt:
 *  - Dùng page.waitForEvent('download') song song với thao tác bấm nút
 *  - Kiểm tra tên tệp gợi ý là customers.csv
 *  - Đọc tệp tải về bằng download.path() và so sánh từng byte nội dung mong đợi
 *  - Xoá dữ liệu, nhập lại tệp vừa xuất và kiểm tra đủ dòng, tên còn nguyên dấu phẩy và nháy
 *  - Test đỏ với BUG-01
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Xuất CSV đúng chuẩn và nhập lại (round trip)", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/csv");
});
