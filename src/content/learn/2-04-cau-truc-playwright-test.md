---
title: Cấu trúc một Playwright test
level: 2
order: 4
minutes: 25
summary: test, expect, fixture page, describe, chạy lọc test theo tên hoặc tag.
keywords: [playwright test structure, test.describe, playwright tag grep]
---

## Mục tiêu bài học
- Viết được test Playwright đúng cấu trúc.
- Chạy một test, một nhóm test hoặc test theo tag.

## Kiến thức cần nắm
- `test("tên", async ({ page }) => { ... })`
- `expect(...)` là nơi kiểm tra kết quả
- `test.describe` nhóm các test liên quan
- Fixture `page`, `context`, `browser`, `request` được Playwright truyền vào
- Chạy lọc: `-g "tên"`, tag trong tên (`@smoke`), `test.only`, `test.skip`, `test.fixme`

## Giải thích dễ hiểu
Một test giống **một tình huống kiểm tra** có ba phần: **Arrange** (chuẩn bị: mở trang), **Act** (hành động: bấm, điền), **Assert** (đối chiếu: kết quả có đúng không). Fixture như **trợ lý** mang sẵn trình duyệt sạch cho mỗi test, bạn chỉ việc dùng.

## Demo code
```ts
import { test, expect } from "@playwright/test";

test.describe("LAB-01 Login", () => {
  test("đăng nhập hợp lệ @smoke", async ({ page }) => {
    // Arrange
    await page.goto("/lab/login");
    // Act
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByLabel("Mật khẩu").fill("Passw0rd!");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    // Assert
    await expect(page.getByTestId("dashboard")).toBeVisible();
  });

  test.fixme("đăng nhập bằng OTP", async () => {});   // tạm bỏ qua, nhắc việc cần làm
});
```

Chạy:

```bash
npx playwright test                      # tất cả
npx playwright test login                # file có "login" trong tên
npx playwright test -g "@smoke"          # theo tên/tag
```

## Lỗi thường gặp
- Để lại `test.only` khi commit làm cả bộ test chỉ chạy một case (dùng `forbidOnly` trong CI).
- Một test kiểm tra quá nhiều thứ nên khi hỏng khó biết vì sao.
- Các test phụ thuộc thứ tự nhau.

## Bài tập
1. Viết hai test cho LAB-01: một đăng nhập hợp lệ, một mật khẩu 7 ký tự bị từ chối.
2. Gắn tag `@smoke` cho test đầu và chạy riêng bằng `-g`.
