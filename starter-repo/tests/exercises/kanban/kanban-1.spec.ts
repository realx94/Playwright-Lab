import { test } from "@playwright/test";

/**
 * kanban-1 · Kéo thả thẻ giữa các cột và sắp xếp lại trong cột ★★
 *
 * Dùng locator.dragTo để chuyển thẻ giữa các cột và kiểm tra cột đích: thả lên vùng thả của cột thì thẻ nằm cuối cột; thả lên một thẻ khác thì thẻ được chèn trước thẻ đó (sắp xếp lại ngay trong cột). Kiểm tra bộ đếm cột, thông báo và dữ liệu còn nguyên sau khi tải lại trang.
 *
 * Trang lab: /lab/kanban  ·  Đề, gợi ý và đáp án: /labs/kanban trên website
 *
 * Tiêu chí đạt:
 *  - Dùng dragTo với data-testid của vùng thả (drop-<cột>) và của thẻ
 *  - Kiểm tra thứ tự thẻ trong cột bằng toHaveText với mảng, không đếm vị trí thủ công
 *  - Có ca sắp xếp lại trong cùng cột và ca thả xuống phần trống ở đáy cột (targetPosition)
 *  - Kiểm tra dữ liệu giữ nguyên sau page.reload()
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Kéo thả thẻ giữa các cột và sắp xếp lại trong cột", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/kanban");
});
