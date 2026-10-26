import { test } from "@playwright/test";

/**
 * clinic-3 · Kiểm tra dữ liệu bệnh nhân, huỷ lịch 24 giờ và giới hạn 3 lịch ★★★
 *
 * Kiểm tra họ tên (1 và 51 ký tự bị từ chối, 2 ký tự hợp lệ), số điện thoại, lý do 201 ký tự và việc phải chọn khung giờ. Dùng đồng hồ giả để chứng minh huỷ lịch đúng 24 giờ được còn quá một giây thì không, và số điện thoại thứ tư không đặt được lịch thứ 4. Test phải đỏ khi bật BUG-03.
 *
 * Trang lab: /lab/clinic  ·  Đề, gợi ý và đáp án: /labs/clinic trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra từng thông báo lỗi bằng data-testid error-*
 *  - Kiểm tra bộ đếm lý do hiển thị 201/200
 *  - Kiểm tra biên tên 2 ký tự hợp lệ
 *  - Kiểm tra huỷ lịch ở hai mốc thời gian bằng setFixedTime
 *  - Kiểm tra giới hạn 3 lịch cho một số điện thoại
 *  - Test đỏ với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Kiểm tra dữ liệu bệnh nhân, huỷ lịch 24 giờ và giới hạn 3 lịch", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/clinic");
});
