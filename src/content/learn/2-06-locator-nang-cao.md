---
title: Locator nâng cao
level: 2
order: 6
minutes: 30
summary: locator(), chaining, filter, nth, strictness và làm việc với danh sách, bảng.
keywords: [playwright filter locator, strict mode violation, locator chaining]
---

## Mục tiêu bài học
- Thu hẹp phạm vi tìm kiếm bằng chaining và filter.
- Làm việc với danh sách, bảng, nhiều phần tử.

## Kiến thức cần nắm
- `locator("css hoặc xpath")` là lối thoát khi `getBy*` không đủ
- **Chaining**: `card.getByRole("button")` tìm trong phạm vi `card`
- `filter({ hasText })`, `filter({ has: locator })`, `filter({ hasNot })`
- `first()`, `last()`, `nth(i)`, `count()`, `all()`
- **Strict mode**: locator khớp nhiều hơn một phần tử sẽ báo lỗi khi thao tác

## Giải thích dễ hiểu
Trang có nhiều nút “Thêm vào giỏ”. Chỉ nói “bấm nút Thêm vào giỏ” thì mơ hồ. Cách thông minh là **thu hẹp phạm vi**: “trong thẻ sản phẩm *Chuột không dây*, bấm nút Thêm vào giỏ”. Chaining và filter chính là cách nói đó.

## Demo code
```ts
// Thu hẹp bằng testid của thẻ sản phẩm (LAB-03)
const card = page.getByTestId("product-p2");
await card.getByRole("button", { name: "Thêm vào giỏ" }).click();

// Lọc theo nội dung
const row = page.getByRole("listitem").filter({ hasText: "Chuột không dây" });
await row.getByRole("button", { name: /^Tăng/ }).click();

// Đếm
await expect(page.getByRole("listitem")).toHaveCount(3);
```

## Khi nào dùng nth
`nth()` phụ thuộc thứ tự nên mong manh. Chỉ dùng khi thứ tự chính là điều cần kiểm tra (ví dụ “sản phẩm đầu tiên sau khi sắp xếp”).

## Lỗi thường gặp
- Thêm `.first()` chỉ để “hết lỗi strict mode” mà không hiểu vì sao có nhiều kết quả.
- Dùng `count()` ngay sau thao tác nên đếm trước khi danh sách cập nhật; hãy dùng `expect(...).toHaveCount()` vì nó tự thử lại.
- Dùng XPath dài thay vì chaining.

## Bài tập
1. Ở LAB-03, thêm lần lượt hai sản phẩm bằng chaining theo từng thẻ sản phẩm.
2. Viết hàm `addProduct(page, id, times)` dùng chaining rồi tái sử dụng trong hai test.
