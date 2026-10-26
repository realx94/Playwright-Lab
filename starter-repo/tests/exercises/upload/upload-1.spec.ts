import { test } from "@playwright/test";

/**
 * upload-1 · Bảng kiểm tra định dạng và dung lượng (data-driven) ★★
 *
 * Dùng hai mảng dữ liệu để sinh test: các tệp phải bị từ chối (đuôi lạ, đuôi và MIME không khớp, tệp rỗng, lớn hơn 2 MB một byte) cùng thông báo, và các tệp phải được chấp nhận (đúng 2 MB, đuôi viết hoa). Test phải đỏ khi bật BUG-01 hoặc BUG-02.
 *
 * Trang lab: /lab/upload  ·  Đề, gợi ý và đáp án: /labs/upload trên website
 *
 * Tiêu chí đạt:
 *  - Tạo tệp trong bộ nhớ bằng Buffer.alloc và setInputFiles, không ghi tệp ra đĩa
 *  - Kiểm tra đúng biên 2 MB và 2 MB cộng 1 byte
 *  - Kiểm tra thông báo lỗi đầy đủ gồm tên tệp
 *  - Kiểm tra không có tệp nào được thêm sau khi bị từ chối
 *  - Test đỏ với BUG-01 và với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Bảng kiểm tra định dạng và dung lượng (data-driven)", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/upload");
});
