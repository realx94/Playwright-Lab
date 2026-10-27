import { test } from "@playwright/test";

/**
 * insurance-4 · Giữ dữ liệu khi quay lại giữa các bước ★★★
 *
 * Đi tới bước 3 rồi bấm Quay lại hai lần và khẳng định mọi trường của bước 2 và bước 1 vẫn còn nguyên; đi tiếp tới bước 4 không phải nhập lại và nhận số hợp đồng sau khi đồng ý điều khoản. Thêm một test: chưa đồng ý điều khoản thì không có số hợp đồng, và gói đã chọn vẫn được giữ khi quay lại từ bước 4. Test phải đỏ khi bật BUG-03.
 *
 * Trang lab: /lab/insurance  ·  Đề, gợi ý và đáp án: /labs/insurance trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra giá trị từng ô bằng toHaveValue sau mỗi lần Quay lại
 *  - Kiểm tra thanh tiến trình đổi theo bước (aria-valuenow hoặc step-label)
 *  - Đi tiếp tới cuối mà không nhập lại dữ liệu và nhận số hợp đồng BH-2026-0001
 *  - Kiểm tra radio và checkbox của bước 3 còn được tick sau khi quay lại từ bước 4
 *  - Test đỏ với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Giữ dữ liệu khi quay lại giữa các bước", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/insurance");
});
