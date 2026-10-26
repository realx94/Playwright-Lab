import { test } from "@playwright/test";

/**
 * chat-1 · Hai người dùng trò chuyện thời gian thực ★★★
 *
 * Mở hai tab cho An và Bình trong cùng một context. An gõ dở một câu và Bình phải thấy chỉ báo đang nhập; sau khi An gửi, Bình thấy tin ngay không cần tải lại; Bình trả lời và An thấy.
 *
 * Trang lab: /lab/chat  ·  Đề, gợi ý và đáp án: /labs/chat trên website
 *
 * Tiêu chí đạt:
 *  - Dùng hai Page trong cùng một context, mỗi tab một tên
 *  - Kiểm tra chỉ báo đang nhập ở tab kia và việc nó biến mất sau khi gửi
 *  - Dùng assertion tự thử lại để chờ tin đến, không dùng chờ cố định
 *  - Viết hàm helper cho thao tác vào phòng và gửi tin
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Hai người dùng trò chuyện thời gian thực", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/chat");
});
