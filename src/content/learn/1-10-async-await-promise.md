---
title: Async/await và Promise
level: 1
order: 10
minutes: 35
summary: Hiểu bất đồng bộ, Promise và vì sao mọi thao tác Playwright đều cần await.
keywords: [javascript promise là gì, async await, event loop]
---

## Mục tiêu bài học
- Hiểu bất đồng bộ và Promise.
- Dùng `async/await` đúng cách trong test.

## Kiến thức cần nắm
- Thao tác mất thời gian (mạng, trình duyệt) trả về **Promise**
- Promise có ba trạng thái: đang chờ, thành công, thất bại
- `await` tạm dừng hàm async cho tới khi Promise có kết quả
- Hàm có `await` phải khai báo `async`
- Bắt lỗi bằng `try/catch`; chạy song song bằng `Promise.all`

## Giải thích dễ hiểu
Bạn gọi món ở quán: nhân viên đưa **phiếu hẹn** (Promise) chứ chưa có món ngay. `await` là **đứng chờ tại quầy cho tới khi món xong**. Quên `await` giống việc cầm phiếu đi luôn rồi tưởng đã có món, nên test của bạn kiểm tra khi trang chưa kịp phản hồi.

## Demo code
```ts
import { test, expect } from "@playwright/test";

test("đăng nhập", async ({ page }) => {
  await page.goto("/lab/login");                       // chờ trang mở
  await page.getByLabel("Email").fill("user@lab.dev"); // chờ điền xong
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByTestId("dashboard")).toBeVisible();
});
```

Chạy hai việc độc lập cùng lúc:

```ts
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

## Lỗi thường gặp
- Quên `await` nên test không chờ và kết quả không ổn định.
- Dùng `await` trong `forEach` — vòng này không chờ. Hãy dùng `for...of`.
- Nuốt lỗi bằng `catch` rỗng làm test xanh khi thực tế đã hỏng.

## Bài tập
1. Viết hàm `delay(ms)` trả về Promise và dùng `await` để in hai dòng cách nhau 1 giây.
2. Cố ý bỏ một `await` trong test đăng nhập và quan sát điều gì xảy ra.
