import { test } from "@playwright/test";

/**
 * otp-2 · Nhập sai 3 lần và bắt BUG-01 ★★★
 *
 * Chứng minh rằng sau 3 lần nhập sai thì mã bị huỷ và ngay cả mã đúng cũng không còn dùng được. Chạy lại với ?bugs=BUG-01 để chắc chắn test của bạn phát hiện được lỗi.
 *
 * Trang lab: /lab/otp  ·  Đề, gợi ý và đáp án: /labs/otp trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra thông báo còn lại bao nhiêu lần sau lần sai đầu tiên
 *  - Kiểm tra thông báo mã đã bị huỷ sau lần sai thứ ba
 *  - Sau đó nhập mã ĐÚNG và khẳng định vẫn bị từ chối
 *  - Test xanh trên lab sạch và đỏ khi bật ?bugs=BUG-01
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Nhập sai 3 lần và bắt BUG-01", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/otp");
});
