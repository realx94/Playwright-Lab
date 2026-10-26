import { test } from "@playwright/test";

/**
 * api-3 · Dữ liệu sai: 422 và 409 ★★★
 *
 * Kiểm tra validation: giá âm, giá vượt trần, ISBN sai định dạng cho 422 kèm đúng trường lỗi; ISBN trùng cho 409.
 *
 * Trang lab: /lab/api  ·  Đề, gợi ý và đáp án: /labs/api trên website
 *
 * Tiêu chí đạt:
 *  - Dùng data-driven cho các trường hợp 422, mỗi trường hợp một test
 *  - Kiểm tra mảng errors chứa đúng tên trường bị lỗi
 *  - Có test biên cho price: 0 và 10.000.000 hợp lệ, -1 và 10.000.001 không hợp lệ
 *  - Có test ISBN trùng trả 409
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Dữ liệu sai: 422 và 409", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/api");
});
