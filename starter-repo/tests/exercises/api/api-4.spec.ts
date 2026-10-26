import { test } from "@playwright/test";

/**
 * api-4 · Vòng đời CRUD và bắt bug ★★★
 *
 * Đi hết vòng đời: tạo → đọc → sửa → xoá → đọc lại (404). Sau đó chạy lại với ?bugs=BUG-02 và ?bugs=BUG-03 để chắc chắn test của bạn phát hiện được lỗi.
 *
 * Trang lab: /lab/api  ·  Đề, gợi ý và đáp án: /labs/api trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra status của từng bước và header Location sau khi tạo
 *  - Dùng id lấy từ phản hồi của lần tạo cho các bước sau
 *  - Test đỏ khi bật BUG-02 (tạo trả 200 thay vì 201)
 *  - Có test riêng cho DELETE sách không tồn tại, đỏ khi bật BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Vòng đời CRUD và bắt bug", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/api");
});
