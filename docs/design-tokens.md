# Design tokens

Nguồn token là `src/app/globals.css`. Giá trị trong `:root` và `.dark` là hai theme; component dùng tên ngữ nghĩa, không gắn mã màu trực tiếp. `@theme inline` nối các token này với utility của Tailwind.

| Vai trò | Token CSS | Utility thường dùng |
| --- | --- | --- |
| Nền trang | `--background` | `bg-background` |
| Mặt thẻ / header | `--card`, `--surface` | `bg-card`, `bg-surface` |
| Chữ chính / phụ | `--foreground`, `--muted-foreground` | `text-foreground`, `text-muted-foreground` |
| Hành động chính | `--primary`, `--primary-foreground` | `bg-primary`, `text-primary` |
| Nền nhấn nhẹ | `--brand-soft`, `--accent` | `bg-brand-soft`, `bg-accent` |
| Thành công | `--success` | `text-success` |
| Viền và focus | `--border`, `--ring` | `border-border`, `ring-ring` |
| Độ nổi của thẻ | `--panel-shadow` | `shadow-panel` |
| Bo góc | `--radius` | `rounded-lg`, `rounded-2xl` |

Các bậc khoảng cách dùng thang Tailwind: `gap-3`/`p-3` cho chi tiết, `gap-4`/`p-4` cho nhóm nhỏ, `p-5`/`p-6` cho thẻ, `mt-10`/`mt-12` cho section. Cỡ chữ: 14px cho thông tin phụ, 16px trở lên cho nội dung đọc, 30–48px cho tiêu đề trang. Nội dung dài dùng `leading-7` hoặc `leading-8`.

Khi thêm giao diện mới, chọn token theo vai trò hiển thị và kiểm tra cả light/dark; nếu cần màu mới, thêm cặp giá trị vào `:root` và `.dark` trước khi dùng.
