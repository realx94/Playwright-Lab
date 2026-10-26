import { test } from "@playwright/test";

/**
 * chat-2 · Giới hạn tin nhắn và chuẩn hoá khoảng trắng ★★★
 *
 * Kiểm tra biên 200/201 ký tự, tin nhắn chỉ có khoảng trắng và việc cắt khoảng trắng hai đầu. Test phải đỏ khi bật BUG-01 hoặc BUG-03.
 *
 * Trang lab: /lab/chat  ·  Đề, gợi ý và đáp án: /labs/chat trên website
 *
 * Tiêu chí đạt:
 *  - Có test đúng biên 200 (gửi được) và 201 (bị từ chối, không tạo tin mới)
 *  - Có test tin chỉ gồm khoảng trắng
 *  - Kiểm tra nội dung thô (textContent) để phát hiện khoảng trắng chưa bị cắt
 *  - Test đỏ với BUG-01 và với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Giới hạn tin nhắn và chuẩn hoá khoảng trắng", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/chat");
});
