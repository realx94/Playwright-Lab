---
title: Locator hướng người dùng
level: 2
order: 5
minutes: 35
summary: getByRole, getByLabel, getByText, getByPlaceholder, getByAltText, getByTestId và thứ tự ưu tiên.
keywords: [getByRole aria role, playwright locator best practices, accessible name]
---

## Mục tiêu bài học
- Chọn locator theo cách người dùng nhận biết phần tử.
- Nắm thứ tự ưu tiên khi chọn locator.

## Kiến thức cần nắm
- `getByRole("button", { name: "Đăng nhập" })`: theo vai trò và tên truy cập được
- `getByLabel("Email")`: theo nhãn của ô nhập
- `getByPlaceholder`, `getByText`, `getByAltText`, `getByTitle`
- `getByTestId("dashboard")`: theo `data-testid` khi không có cách tốt hơn
- Thứ tự ưu tiên: Role → Label → Placeholder → Text → TestId → CSS/XPath

## Giải thích dễ hiểu
Người dùng không biết `id` hay `class`; họ nói “bấm nút **Đăng nhập**”, “điền ô **Email**”. Locator hướng người dùng làm đúng như vậy nên **bền hơn** khi giao diện đổi cách code, và đồng thời **kiểm tra luôn khả năng truy cập** (accessibility): nếu nút không có tên, `getByRole` sẽ không tìm thấy.

## Demo code
```ts
await page.getByLabel("Email").fill("user@lab.dev");
await page.getByRole("button", { name: "Đăng nhập" }).click();
await page.getByRole("checkbox", { name: "Ghi nhớ đăng nhập" }).check();
await page.getByPlaceholder("Mã giảm giá").fill("SALE10");
await expect(page.getByText("Email không hợp lệ")).toBeVisible();
await page.getByTestId("reset-data").click();   // khi không có role/label rõ
```

## Lưu ý với shadcn/Base UI
Radio, checkbox và switch của site lab có thẻ `input` ẩn đi kèm, nên `getByLabel` có thể khớp 2 phần tử. Dùng `getByRole("radio" | "checkbox" | "switch", { name })` để chọn đúng phần tử người dùng nhìn thấy.

## Lỗi thường gặp
- `getByText("Đăng nhập")` khớp cả tiêu đề lẫn nút (strict mode violation). Dùng `getByRole` hoặc thêm `exact: true`.
- Đổi chữ trên giao diện (đa ngôn ngữ) làm vỡ locator theo text; dùng `getByRole` kèm `name` hoặc `testId` cho phần tử cố định.
- Lạm dụng `getByTestId` cho mọi thứ nên bỏ qua lợi ích kiểm tra accessibility.

## Bài tập
1. Điền toàn bộ form LAB-02 chỉ bằng `getByRole` và `getByLabel`.
2. Cố ý gây lỗi strict mode (tìm text trùng) rồi sửa bằng `name` hoặc `exact`.
