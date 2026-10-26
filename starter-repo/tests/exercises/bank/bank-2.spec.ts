import { test } from "@playwright/test";

/**
 * bank-2 · Biểu phí ở các mốc biên và hạn mức trong ngày ★★★
 *
 * Kiểm tra phí tại các mốc 10.000, 499.999, 500.000, 500.001, 2.000.000 và 2.000.001. Sau đó chứng minh hạn mức ngày cộng dồn: chuyển 5.000.000 rồi 3.000.001 bị từ chối, 3.000.000 thành công, rồi đổi đồng hồ sang ngày hôm sau để hạn mức được đặt lại. Test phải đỏ khi bật BUG-01 hoặc BUG-02.
 *
 * Trang lab: /lab/bank  ·  Đề, gợi ý và đáp án: /labs/bank trên website
 *
 * Tiêu chí đạt:
 *  - Sinh test cho từng mốc phí từ một bảng dữ liệu
 *  - Chỉ cần dừng ở bước xác nhận để đọc phí
 *  - Kiểm tra biên hạn mức ngày bằng 3.000.001 và 3.000.000
 *  - Dùng context.clock.setFixedTime để sang ngày hôm sau
 *  - Test đỏ với BUG-01 và với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Biểu phí ở các mốc biên và hạn mức trong ngày", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/bank");
});
