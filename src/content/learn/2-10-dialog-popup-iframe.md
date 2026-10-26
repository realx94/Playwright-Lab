---
title: Dialog, popup, tab mới và iframe
level: 2
order: 10
minutes: 30
summary: Xử lý alert/confirm, cửa sổ popup, tab mới, iframe và tải xuống.
keywords: [playwright handle dialog, frameLocator, new tab playwright]
---

## Mục tiêu bài học
- Xử lý các thành phần “nằm ngoài luồng bình thường” của trang.

## Kiến thức cần nắm
- **Dialog của trình duyệt** (`alert`, `confirm`, `prompt`): bắt bằng `page.on("dialog")`
- **Popup / tab mới**: `context.waitForEvent("page")` hoặc `page.waitForEvent("popup")`
- **iframe**: `page.frameLocator("iframe[...]")` để tìm phần tử bên trong
- **Tải xuống**: `page.waitForEvent("download")`
- Modal trong trang (HTML) khác với dialog của trình duyệt: modal dùng locator thường

## Giải thích dễ hiểu
Dialog là **người lạ gõ cửa giữa buổi họp**: nếu bạn không nói trước sẽ xử lý thế nào, buổi họp dừng lại. Tab mới là **một căn phòng khác**: bạn phải “bước sang phòng đó” (đổi đối tượng `page`) mới thao tác được. iframe là **cửa sổ nhìn vào một nhà khác**: phải khai báo bạn đang tìm bên trong cửa sổ nào.

## Demo code
```ts
// Dialog xác nhận: đăng ký xử lý TRƯỚC khi gây ra dialog
page.once("dialog", (dialog) => dialog.accept());
await page.getByRole("button", { name: "Xoá dữ liệu" }).click();

// Tab mới
const [popup] = await Promise.all([
  page.context().waitForEvent("page"),
  page.getByRole("link", { name: "Hỏi Google AI" }).click(),
]);
await popup.waitForLoadState();
expect(popup.url()).toContain("google.com");

// iframe
await page.frameLocator("#payment").getByLabel("Số thẻ").fill("4242 4242 4242 4242");

// Tải xuống
const [download] = await Promise.all([
  page.waitForEvent("download"),
  page.getByRole("button", { name: "Tải CSV" }).click(),
]);
expect(download.suggestedFilename()).toContain(".csv");
```

## Lỗi thường gặp
- Đăng ký `page.on("dialog")` **sau** khi dialog đã hiện nên test treo.
- Quên rằng popup là `Page` khác; tiếp tục thao tác trên `page` cũ.
- Tìm phần tử bên trong iframe bằng `page.getByLabel` thay vì `frameLocator`.

## Bài tập
1. Ở trang `/stats`, bấm “Xoá dữ liệu” và chấp nhận dialog xác nhận bằng code.
2. Ở một bài học, bôi đen một thuật ngữ rồi bấm nút Hỏi Google AI và kiểm tra tab mới mở.
