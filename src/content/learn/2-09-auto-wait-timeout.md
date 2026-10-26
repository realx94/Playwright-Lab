---
title: Auto-wait và timeout
level: 2
order: 9
minutes: 25
summary: Hiểu cơ chế chờ tự động, các loại timeout và vì sao tránh waitForTimeout.
keywords: [playwright auto waiting, waitForTimeout, actionability checks]
---

## Mục tiêu bài học
- Hiểu Playwright chờ gì và khi nào.
- Biết cách xử lý trang chậm mà không dùng `sleep`.

## Kiến thức cần nắm
- **Actionability**: trước khi thao tác, Playwright chờ phần tử hiển thị, ổn định, nhận được sự kiện, được bật
- Assertion web-first tự thử lại tới `expect.timeout` (mặc định 5s)
- Timeout của test (`timeout`, mặc định 30s) và timeout thao tác (`actionTimeout`)
- Chờ có điều kiện: `locator.waitFor()`, `page.waitForURL()`, `page.waitForResponse()`
- `page.waitForTimeout()` chỉ nên dùng khi debug

## Giải thích dễ hiểu
Chờ cố định (`sleep 3 giây`) giống **đứng đợi xe buýt đúng 3 phút rồi đi**: có hôm xe đến sớm bạn phí thời gian, có hôm trễ bạn bỏ lỡ. Chờ theo điều kiện giống **nhìn bảng điện tử rồi lên xe ngay khi xe tới**: nhanh khi trang nhanh, vẫn đúng khi trang chậm.

## Demo code
```ts
// Tệ: chờ cố định
await page.waitForTimeout(3000);

// Tốt: chờ theo điều kiện
await page.getByRole("button", { name: "Đăng nhập" }).click();
await expect(page.getByTestId("dashboard")).toBeVisible({ timeout: 10_000 });

// Chờ phản hồi mạng cụ thể
const [res] = await Promise.all([
  page.waitForResponse((r) => r.url().includes("/api/orders") && r.ok()),
  page.getByRole("button", { name: "Đặt hàng" }).click(),
]);
```

Cấu hình trong `playwright.config.ts`:

```ts
export default defineConfig({
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: { actionTimeout: 10_000 },
});
```

## Lỗi thường gặp
- Rắc `waitForTimeout` khắp nơi để “cho chắc”; test chậm và vẫn flaky.
- Tăng timeout toàn cục để che một vấn đề cục bộ.
- Chờ `networkidle` khi trang có kết nối kéo dài (websocket) nên không bao giờ xong.

## Bài tập
1. Dùng `?delay=` (nếu lab hỗ trợ) hoặc DevTools throttling để làm trang chậm và chứng minh test của bạn vẫn xanh.
2. Tìm trong test cũ của bạn mọi `waitForTimeout` và thay bằng chờ theo điều kiện.
