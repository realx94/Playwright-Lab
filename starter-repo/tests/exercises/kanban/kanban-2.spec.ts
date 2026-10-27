import { test } from "@playwright/test";

/**
 * kanban-2 · Giới hạn WIP của cột Đang làm ★★★
 *
 * Cột Đang làm tối đa 3 thẻ. Đưa cột này lên 3 thẻ rồi kéo thêm thẻ thứ 4 vào: phải bị từ chối kèm thông báo, bộ đếm vẫn 3/3 và thẻ ở lại cột cũ. Kiểm tra thêm: sắp xếp lại trong cột đầy vẫn được phép, và chuyển bằng phím tắt Alt+ArrowRight cũng bị chặn như nhau. Test phải đỏ khi bật BUG-01.
 *
 * Trang lab: /lab/kanban  ·  Đề, gợi ý và đáp án: /labs/kanban trên website
 *
 * Tiêu chí đạt:
 *  - Kiểm tra bộ đếm count-doing đổi từ 2/3 sang 3/3 và giữ nguyên 3/3 sau lần thả thứ 4
 *  - Kiểm tra nội dung thông báo từ chối và thẻ vẫn nằm ở cột nguồn
 *  - Kiểm tra sắp xếp lại ngay trong cột đầy không bị chặn
 *  - Kiểm tra đường phím tắt (focus thẻ rồi Alt+ArrowRight) cũng bị chặn
 *  - Test đỏ với BUG-01
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Giới hạn WIP của cột Đang làm", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/kanban");
});
