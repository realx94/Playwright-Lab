---
title: HTML và DOM
level: 2
order: 1
minutes: 30
summary: Hiểu cây DOM, thẻ và thuộc tính, các phần tử form thường gặp.
keywords: [DOM là gì, shadow DOM, iframe là gì]
---

## Mục tiêu bài học
- Đọc được cấu trúc HTML của một trang và hiểu cây DOM.
- Nhận ra các phần tử mà automation hay tương tác.

## Kiến thức cần nắm
- HTML là **văn bản** mô tả trang; DOM là **cây đối tượng** trình duyệt dựng ra từ HTML
- Thẻ, thuộc tính (`id`, `class`, `name`, `type`, `aria-*`, `data-*`), nội dung văn bản
- Quan hệ cha – con – anh em trong cây
- Phần tử form: `input`, `select`, `textarea`, `button`, `label`; radio, checkbox, upload
- Cấu trúc đặc biệt: `iframe`, shadow DOM, `dialog`, bảng `table`

## Giải thích dễ hiểu
HTML như **bản vẽ ngôi nhà**; DOM là **ngôi nhà đã xây xong** mà bạn có thể tìm từng căn phòng (phần tử) để vào. Automation không “nhìn” màn hình như người, nó **đi tìm phần tử trong cây DOM** rồi tác động lên chúng: bấm, điền, đọc chữ. Vì vậy hiểu DOM là hiểu cách chọn đúng phần tử.

## Demo code
```html
<form aria-label="Đăng nhập">
  <label for="email">Email</label>
  <input id="email" type="email" />
  <button type="submit" data-testid="submit">Đăng nhập</button>
</form>
```

Cây DOM của đoạn trên: `form` có ba con là `label`, `input`, `button`. `label` gắn với `input` qua `for="email"`, nhờ đó Playwright tìm được ô nhập bằng `getByLabel("Email")`.

Mở DevTools (F12) → tab Elements để xem DOM thật của bất kỳ trang nào, bao gồm các lab của site này.

## Thực hành
Mở [LAB-02 Form đa dạng](/labs/forms) rồi dùng DevTools kiểm tra: radio, checkbox và select tuỳ biến được tạo bởi những thẻ nào?

## Lỗi thường gặp
- Nhầm giữa **HTML nguồn** (View Source) và **DOM hiện tại** (đã bị JavaScript thay đổi).
- Phần tử nằm trong `iframe` hoặc shadow DOM nên không tìm được bằng locator thông thường.
- Dùng `id`/`class` sinh tự động (đổi mỗi lần build) làm locator dễ vỡ.

## Bài tập
1. Mở DevTools ở trang Login của lab, tìm phần tử ô Email và ghi lại ít nhất 3 thuộc tính của nó.
2. Tìm trong trang một phần tử có `data-testid` và giải thích vì sao nhóm dev thêm thuộc tính này.
