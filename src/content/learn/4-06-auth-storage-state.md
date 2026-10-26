---
title: Đăng nhập một lần với storageState và setup project
level: 4
order: 6
minutes: 30
summary: Đăng nhập một lần, lưu phiên và tái sử dụng cho nhiều test để tiết kiệm thời gian.
keywords: [playwright storageState, setup project, global setup]
---

## Mục tiêu bài học
- Không phải đăng nhập lại trong từng test.
- Dùng project `setup` để chuẩn bị phiên đăng nhập.

## Kiến thức cần nắm
- Mỗi test có context mới nên mặc định **chưa đăng nhập**
- `context.storageState({ path })` lưu cookie và localStorage ra file
- `use: { storageState: "path" }` nạp phiên đó cho test
- **Project phụ thuộc**: project `setup` chạy trước, các project khác `dependencies: ["setup"]`
- File trạng thái là dữ liệu nhạy cảm: đưa vào `.gitignore`

## Giải thích dễ hiểu
Mỗi lần vào toà nhà bạn phải qua cổng bảo vệ, quét thẻ. Nếu 100 test đều quét thẻ riêng thì rất tốn thời gian. `storageState` giống **một chiếc thẻ ra vào đã quét sẵn**: đăng nhập một lần, rồi mọi test “mượn” thẻ đó để vào thẳng.

## Demo code
```ts
// tests/auth.setup.ts
import { test as setup, expect } from "@playwright/test";

setup("đăng nhập và lưu phiên", async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Passw0rd!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByTestId("dashboard")).toBeVisible();
  await page.context().storageState({ path: ".auth/user.json" });
});
```

```ts
// playwright.config.ts
projects: [
  { name: "setup", testMatch: /auth\.setup\.ts/ },
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"], storageState: ".auth/user.json" },
    dependencies: ["setup"],
  },
],
```

Với lab của site, phiên đăng nhập lưu trong `localStorage` của trang `/lab/login`; `storageState` ghi lại cả localStorage theo origin nên có thể tái sử dụng.

## Lưu ý
- Với test cần **nhiều người dùng khác nhau**, tạo nhiều file trạng thái (`admin.json`, `customer.json`).
- Test kiểm tra chính màn hình đăng nhập phải dùng context **không** nạp `storageState`.
- Phiên hết hạn: để project `setup` luôn chạy lại trước mỗi lần chạy.

## Lỗi thường gặp
- Commit `.auth/*.json` lên Git.
- Dùng chung một tài khoản cho test ghi dữ liệu nên chạy song song bị đè nhau.
- Quên khai báo `dependencies` nên test chạy trước khi có file trạng thái.

## Bài tập
1. Viết `auth.setup.ts` cho LAB-01 và dùng trạng thái đó trong một test kiểm tra trang chính.
2. Viết một test dùng context **không** có phiên để chứng minh người chưa đăng nhập không thấy trang chính.
