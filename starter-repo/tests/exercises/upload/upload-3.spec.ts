import { test } from "@playwright/test";

/**
 * upload-3 · Kiểm tra kết quả tải lên: URL, kích thước, ảnh xem trước, giới hạn ★★
 *
 * Tải ảnh PNG thật (1×1) và kiểm tra tên, kích thước đúng bằng số byte, URL theo mẫu CDN và ảnh xem trước thật sự hiển thị (naturalWidth lớn hơn 0). Sau đó tải 5 tệp (có một tên trùng), kiểm tra hậu tố (1), thử tệp thứ sáu bị từ chối và danh sách giữ nguyên sau khi tải lại trang.
 *
 * Trang lab: /lab/upload  ·  Đề, gợi ý và đáp án: /labs/upload trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra URL bằng biểu thức chính quy
 *  - Kiểm tra kích thước hiển thị bằng đúng số byte của buffer
 *  - Dùng evaluate để đọc naturalWidth của ảnh xem trước
 *  - Kiểm tra thứ tự và tên các tệp, gồm a (1).pdf
 *  - Kiểm tra thông báo tệp thứ sáu và số tệp sau khi reload
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Kiểm tra kết quả tải lên: URL, kích thước, ảnh xem trước, giới hạn", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/upload");
});
