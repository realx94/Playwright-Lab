---
title: CSS Selector
level: 2
order: 2
minutes: 30
summary: Chọn phần tử bằng tag, class, id, thuộc tính, tổ hợp và pseudo-class.
keywords: [css selector cheatsheet, nth-child, attribute selector]
---

## Mục tiêu bài học
- Viết CSS selector ngắn gọn, đúng và đủ ổn định.
- Biết khi nào CSS selector là lựa chọn phù hợp.

## Kiến thức cần nắm
- Theo tag, class, id: `button`, `.card`, `#email`
- Theo thuộc tính: `[type="email"]`, `[data-testid="submit"]`, `[href^="/lab"]`
- Tổ hợp: con cháu `a b`, con trực tiếp `a > b`, anh em kế `a + b`
- Pseudo-class: `:nth-child(2)`, `:first-child`, `:not(...)`, `:has(...)`
- Độ đặc hiệu và độ mong manh: selector càng dài, càng dễ vỡ

## Giải thích dễ hiểu
CSS selector là **địa chỉ nhà**. “Số 5, đường Lê Lợi” (`#email`) rất chính xác nếu số nhà không đổi. “Ngôi nhà thứ ba bên trái ngã tư thứ hai” (`div > div:nth-child(3)`) đúng hôm nay nhưng sai khi thêm một căn mới. Địa chỉ tốt là địa chỉ **gắn với ý nghĩa** chứ không gắn với vị trí.

## Demo code
```css
#email                        /* theo id */
button[type="submit"]         /* tag + thuộc tính */
[data-testid="dashboard"]     /* thuộc tính kiểm thử, ổn định nhất */
form > label + input          /* input ngay sau label, trong form */
li:not(.disabled):first-child /* kết hợp pseudo-class */
```

Dùng trong Playwright:

```ts
await page.locator('[data-testid="dashboard"]').isVisible();
```

Playwright khuyến nghị ưu tiên locator theo vai trò (`getByRole`) trước, chỉ dùng CSS khi không có cách nào tốt hơn (xem bài 2.5).

## Lỗi thường gặp
- Dùng chuỗi class dài sinh từ framework (`.css-1a2b3c`) vì đổi mỗi lần build.
- Phụ thuộc vị trí (`:nth-child`) khi thứ tự có thể thay đổi.
- Selector khớp nhiều phần tử nhưng chỉ định lấy một.

## Bài tập
1. Viết 3 selector khác nhau cho nút “Đăng nhập” ở LAB-01, rồi xếp hạng độ ổn định.
2. Dùng ô tìm kiếm của DevTools (Ctrl+F trong tab Elements) để thử selector và đếm số phần tử khớp.
