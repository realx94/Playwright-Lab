import { test } from "@playwright/test";

/**
 * kanban-4 · Phím tắt, hoàn tác và menu chuột phải ★★★
 *
 * Kiểm tra các thao tác bàn phím và chuột phải: N thêm thẻ (vào Cần làm, sửa tiêu đề ngay), / focus ô tìm, Alt+ArrowRight/Alt+ArrowLeft đổi cột trên thẻ đang focus (focus vẫn ở thẻ), Delete xoá có hộp xác nhận (Escape huỷ), Ctrl+Z hoàn tác thao tác di chuyển gần nhất về đúng cột gốc. Thêm một test cho menu chuột phải: 4 mục, đóng bằng Escape, Nhân bản và Xoá. Test hoàn tác phải đỏ khi bật BUG-03 (gợi ý: dùng thẻ xuất phát từ cột Đang làm).
 *
 * Trang lab: /lab/kanban  ·  Đề, gợi ý và đáp án: /labs/kanban trên website
 *
 * Tiêu chí đạt:
 *  - Dùng click({ button: 'right' }) và getByRole('menuitem') cho menu chuột phải
 *  - Kiểm tra menu đóng bằng Escape và hộp xác nhận xoá huỷ được bằng Escape
 *  - Kiểm tra hoàn tác đưa thẻ về đúng cột gốc và đúng vị trí, và lần hoàn tác thứ hai báo không còn gì để hoàn tác
 *  - Kiểm tra ô tìm lọc thẻ theo tiêu đề không phân biệt hoa thường
 *  - Test đỏ với BUG-03
 *  - Test chạy xanh 3 lần liên tiếp
 *  - Không dùng waitForTimeout hoặc sleep cố định
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("Phím tắt, hoàn tác và menu chuột phải", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/kanban");
});
