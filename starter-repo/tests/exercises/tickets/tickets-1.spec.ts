import { test } from "@playwright/test";

/**
 * tickets-1 · Hạn xử lý theo mức ưu tiên và đếm ngược SLA ★★
 *
 * Tạo ticket với ưu tiên Trung bình kèm tệp loi.txt và kiểm tra mã, trạng thái Mới, tên tệp, hạn 16:00 và SLA còn 8 giờ 0 phút. Sinh bốn test cho bốn mức ưu tiên (hạn 09:00, 12:00, 16:00 và 08:00 hôm sau), rồi dùng đồng hồ giả chứng minh đúng hạn chưa quá hạn còn quá một giây thì Quá hạn. Test phải đỏ khi bật BUG-01 hoặc BUG-02.
 *
 * Trang lab: /lab/tickets  ·  Đề, gợi ý và đáp án: /labs/tickets trên website
 *
 * Tiêu chí đạt:
 *  - Cố định giờ giả trước khi mở trang
 *  - Đính kèm tệp bằng setInputFiles với buffer
 *  - Sinh test cho từng mức ưu tiên từ một bảng dữ liệu
 *  - Kiểm tra các mốc 30 phút, đúng 1 giờ và 1 giờ 1 giây
 *  - Test đỏ với BUG-01 và với BUG-02
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Hạn xử lý theo mức ưu tiên và đếm ngược SLA", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/tickets");
});
