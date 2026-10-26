---
title: Thao tác (Actions)
level: 2
order: 7
minutes: 30
summary: click, fill, check, selectOption, hover, upload, drag and drop và press.
keywords: [playwright fill vs type, setInputFiles, dragTo]
---

## Mục tiêu bài học
- Dùng đúng thao tác cho từng loại phần tử.
- Hiểu Playwright kiểm tra phần tử “sẵn sàng” trước khi thao tác.

## Kiến thức cần nắm
- `click()`, `dblclick()`, `hover()`, `press("Enter")`
- `fill(value)`: đặt giá trị cho ô nhập (xoá cũ); `pressSequentially()` gõ từng phím
- `check()` / `uncheck()` cho checkbox, radio, switch
- `selectOption()` cho `<select>` native
- `setInputFiles()` cho upload; `dragTo()` cho kéo thả
- Phần tử phải: hiển thị, ổn định, nhận được sự kiện, được bật

## Giải thích dễ hiểu
Mỗi thao tác giống một **hành vi của người thật** nhưng có “bảo hiểm”: trước khi bấm, Playwright chờ nút hiện ra, ngừng chuyển động và không bị che. Nhờ vậy bạn hiếm khi cần chờ thủ công.

## Demo code
```ts
await page.getByLabel("Họ tên").fill("Nguyễn Văn A");
await page.getByRole("radio", { name: "Nam" }).click();
await page.getByRole("checkbox", { name: "Đọc sách" }).check();
await page.getByLabel("Quốc gia (select native)").selectOption("vn");
await page.getByLabel(/Tệp đính kèm/).setInputFiles({
  name: "a.png",
  mimeType: "image/png",
  buffer: Buffer.from("x"),
});
await page.getByLabel("Họ tên").press("Tab");
```

`check()` còn **xác nhận trạng thái sau khi thao tác**; dùng nó thay vì `click()` cho checkbox để tránh bật rồi tắt nhầm.

## Lỗi thường gặp
- Dùng `click()` cho `<select>` rồi tự chọn `<option>`; hãy dùng `selectOption()` với select native.
- Dùng `type()` (đã cũ) thay vì `fill()` cho trường hợp thông thường.
- Select tuỳ biến (không phải thẻ `select`) cần click mở danh sách rồi chọn `getByRole("option")`.

## Bài tập
1. Điền form LAB-02 đủ các loại: input, radio, checkbox, select native, select tuỳ biến, switch.
2. Thử upload tệp `.exe` và quan sát thông báo lỗi.
