---
title: So sánh ảnh và giả lập thiết bị
level: 4
order: 9
minutes: 25
summary: Visual comparison với toHaveScreenshot, giả lập thiết bị, ngôn ngữ, múi giờ và vị trí.
keywords: [visual regression testing, playwright emulation, toHaveScreenshot]
---

## Mục tiêu bài học
- Dùng so sánh ảnh để phát hiện thay đổi giao diện ngoài ý muốn.
- Giả lập thiết bị và môi trường người dùng.

## Kiến thức cần nắm
- `expect(page).toHaveScreenshot("ten.png")` so với ảnh chuẩn (baseline)
- Lần đầu chạy tạo baseline; lần sau so sánh với ngưỡng sai khác (`maxDiffPixelRatio`)
- Cố định yếu tố thay đổi: viewport, font, animation, dữ liệu động (ngày giờ)
- `devices["Pixel 7"]`, `viewport`, `locale`, `timezoneId`, `geolocation`, `permissions`, `colorScheme`
- Dùng `mask` để che phần động khi so sánh

## Giải thích dễ hiểu
So sánh ảnh giống **trò chơi tìm điểm khác nhau** giữa hai bức tranh: bản chuẩn và bản mới. Máy tìm giúp bạn mọi pixel khác nhau. Vì vậy nếu tranh có phần luôn thay đổi (đồng hồ), bạn phải **che nó đi** nếu không máy sẽ luôn báo “khác”.

## Demo code
```ts
import { test, expect } from "@playwright/test";

test("giao diện giỏ hàng không đổi ngoài ý muốn", async ({ page }) => {
  await page.goto("/lab/cart");
  await expect(page).toHaveScreenshot("cart.png", { maxDiffPixelRatio: 0.01 });
});

test.use({ viewport: { width: 390, height: 844 }, locale: "vi-VN", colorScheme: "dark" });
test("hiển thị đúng trên điện thoại ở chế độ tối", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
```

Cập nhật ảnh chuẩn sau khi thay đổi giao diện **có chủ đích**:

```bash
npx playwright test --update-snapshots
```

## Lưu ý quan trọng
- Ảnh chuẩn **phụ thuộc hệ điều hành và font**; nên tạo và so sánh trên cùng môi trường (ví dụ chạy trong cùng một Docker/CI).
- Chỉ dùng cho những màn hình ổn định; đừng áp dụng cho mọi trang.
- Ảnh baseline cũng là mã nguồn: review khi cập nhật.

## Lỗi thường gặp
- So sánh trang có dữ liệu thay đổi mỗi lần (ngày giờ, số ngẫu nhiên).
- Tạo baseline trên máy Windows nhưng so sánh trên CI Linux nên luôn lệch.
- Chạy `--update-snapshots` bừa bãi nên che mất lỗi thật.

## Bài tập
1. Chụp baseline cho trang `/labs` và cố ý đổi một chữ trong giao diện để thấy test đỏ.
2. Chạy bộ test trên project mobile với `locale` và `timezoneId` khác.
