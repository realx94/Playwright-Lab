import { test } from "@playwright/test";

/**
 * todo-2 · Quy tắc thêm: rỗng, trùng, biên 80 và 20 ★★
 *
 * Kiểm tra các quy tắc khi thêm việc: tên rỗng/khoảng trắng, tên 80 và 81 ký tự, trùng tên khác hoa thường và giới hạn 20 việc. Chạy lại với ?bugs=BUG-01 và ?bugs=BUG-03 để thấy lỗi.
 *
 * Trang lab: /lab/todo  ·  Đề, gợi ý và đáp án: /labs/todo trên website
 *
 * Tiêu chí đạt:
 *  - Có đủ biên tên 80/81 ký tự và biên số lượng 20/21 việc
 *  - Test trùng tên dùng chữ hoa khác chữ thường (Mua sữa và mua SỮA)
 *  - Dùng hàm helper để thêm việc, không lặp lại các bước
 *  - Test đỏ với BUG-01 (trùng tên) và BUG-03 (giới hạn 21)
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Quy tắc thêm: rỗng, trùng, biên 80 và 20", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/todo");
});
