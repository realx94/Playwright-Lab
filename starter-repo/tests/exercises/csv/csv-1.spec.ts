import { test } from "@playwright/test";

/**
 * csv-1 · Kiểm tra từng dòng khi nhập CSV ★★
 *
 * Tải lên tệp 5 dòng gồm một dòng hợp lệ và bốn dòng lỗi (email sai, điện thoại sai, email trùng khác hoa thường, tên rỗng). Kiểm tra bản tóm tắt, từng thông báo lỗi với đúng số dòng (dòng tiêu đề là dòng 1) và chỉ dòng hợp lệ được nhập. Test phải đỏ khi bật BUG-02 hoặc BUG-03.
 *
 * Trang lab: /lab/csv  ·  Đề, gợi ý và đáp án: /labs/csv trên website
 *
 * Tiêu chí đạt:
 *  - Dùng setInputFiles với buffer thay vì tạo tệp trên đĩa
 *  - Kiểm tra bản tóm tắt Đã nhập 1 dòng, bỏ qua 4 dòng lỗi
 *  - Kiểm tra toàn bộ danh sách lỗi theo đúng thứ tự và số dòng
 *  - Kiểm tra bảng chỉ có 1 khách hàng
 *  - Test đỏ với BUG-02 và với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Kiểm tra từng dòng khi nhập CSV", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/csv");
});
