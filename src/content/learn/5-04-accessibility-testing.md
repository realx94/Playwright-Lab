---
title: Kiểm thử khả năng truy cập (Accessibility)
level: 5
order: 4
minutes: 25
summary: Tự động hoá kiểm tra a11y với axe-core và những điều cần kiểm tra thủ công.
keywords: [axe core playwright, wcag là gì, accessibility testing]
---

## Mục tiêu bài học
- Hiểu accessibility (a11y) và tiêu chuẩn WCAG.
- Dùng axe-core để phát hiện lỗi tự động trong Playwright.

## Kiến thức cần nắm
- **a11y**: ứng dụng dùng được với người khiếm thị, khiếm thính, vận động hạn chế, dùng bàn phím hoặc trình đọc màn hình
- **WCAG**: bộ hướng dẫn quốc tế; mức A, AA, AAA (AA là mục tiêu phổ biến)
- Công cụ tự động: `@axe-core/playwright` phát hiện khoảng một phần ba các vấn đề
- Cần kiểm tra thủ công: thứ tự focus, nội dung hợp lý khi đọc bằng screen reader, tương phản trong ngữ cảnh
- Nguyên tắc: nhãn cho ô nhập, tên cho nút, văn bản thay thế cho ảnh, tương phản đủ, dùng được bằng bàn phím

## Giải thích dễ hiểu
Một toà nhà tốt có **lối đi cho xe lăn, biển báo chữ lớn, thang máy có chữ nổi**. a11y là phần đó của web: không chỉ phục vụ nhóm người thiệt thòi mà còn giúp người dùng trong tình huống khó (nắng chói, tay bận). Axe-core là máy quét tự động các lỗi phổ biến như “nút không có tên”.

## Demo code
```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("trang đăng nhập không có lỗi a11y nghiêm trọng", async ({ page }) => {
  await page.goto("/lab/login");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

Kiểm tra bàn phím bằng Playwright:

```ts
await page.getByLabel("Email").focus();
await page.keyboard.press("Tab");
await expect(page.getByLabel("Mật khẩu")).toBeFocused();
```

## Mối liên hệ với locator
Locator hướng người dùng như `getByRole` và `getByLabel` chỉ hoạt động khi phần tử có vai trò và tên đúng. Viết test theo cách này vô tình **kiểm tra a11y** giúp bạn.

## Lỗi thường gặp
- Tin rằng axe không báo lỗi nghĩa là trang đã “đạt chuẩn a11y”.
- Bỏ qua lỗi tương phản vì “trông vẫn đọc được” trên màn hình của bạn.
- Chỉ kiểm tra trang chủ mà bỏ qua các trạng thái lỗi, hộp thoại.

## Bài tập
1. Chạy axe trên 3 trang của site lab và ghi lại các vi phạm tìm được.
2. Dùng chỉ bàn phím để hoàn thành form LAB-02 và liệt kê chỗ khó thao tác.
