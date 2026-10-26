import { test } from "@playwright/test";

/**
 * oauth-3 · Thời gian sống của code và phiên; tài khoản trùng ★★★
 *
 * Dùng đồng hồ giả để kiểm tra biên 60 giây của authorization code và biên 1 giờ của phiên. Thêm test đăng nhập lại cùng một email không tạo tài khoản trùng. Test phải đỏ khi bật BUG-03.
 *
 * Trang lab: /lab/oauth  ·  Đề, gợi ý và đáp án: /labs/oauth trên website
 *
 * Tiêu chí đạt:
 *  - Cố định thời gian bằng context.clock.setFixedTime
 *  - Chặn trang callback để giữ lại code chưa đổi, rồi đổi code ở giây 60 và 61
 *  - Kiểm tra phiên còn ở phút 59 và hết ở phút 61
 *  - Đăng nhập cùng email hai lần và kiểm tra số tài khoản vẫn là 1
 *  - Test đỏ với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Thời gian sống của code và phiên; tài khoản trùng", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/oauth");
});
