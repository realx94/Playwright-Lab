---
title: Page Object Model
level: 4
order: 1
minutes: 35
summary: Gom locator và hành động của từng trang vào class, giúp test gọn và dễ bảo trì.
keywords: [page object model, pom playwright, page object vs fixture]
---

## Mục tiêu bài học
- Hiểu vì sao cần Page Object Model (POM).
- Viết được Page Object đúng nguyên tắc.

## Kiến thức cần nắm
- POM: mỗi trang (hoặc vùng giao diện) là một **class**
- Class chứa **locator** (khai báo một lần) và **hành động nghiệp vụ** (`login`, `addToCart`)
- Test chỉ **gọi hành động** và **assert**, không chứa chi tiết locator
- Assertion nên nằm trong test (hoặc hàm `expectXxx` rõ nghĩa), không rải rác trong POM
- `BasePage` giữ phần dùng chung (đường dẫn, `goto`)

## Giải thích dễ hiểu
Hãy tưởng tượng một **điều khiển TV**: bạn bấm nút “Tăng âm lượng” mà không cần biết bên trong mạch điện thế nào. Nếu nhà sản xuất đổi mạch, bạn vẫn bấm nút cũ. POM là điều khiển cho trang web: khi giao diện đổi, bạn chỉ sửa **một nơi** (class), mọi test vẫn chạy.

## Demo code
Không có POM, locator lặp ở mọi test:

```ts
await page.getByLabel("Email").fill("user@lab.dev");
await page.getByLabel("Mật khẩu").fill("Passw0rd!");
await page.getByRole("button", { name: "Đăng nhập" }).click();
```

Với POM:

```ts
import { expect, type Locator, type Page } from "@playwright/test";

export class LoginPage {
  private readonly email: Locator;
  private readonly password: Locator;
  private readonly submit: Locator;
  readonly dashboard: Locator;

  constructor(private readonly page: Page) {
    this.email = page.getByLabel("Email");
    this.password = page.getByLabel("Mật khẩu");
    this.submit = page.getByRole("button", { name: "Đăng nhập" });
    this.dashboard = page.getByTestId("dashboard");
  }

  async goto() {
    await this.page.goto("/lab/login");
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}

// trong test
const login = new LoginPage(page);
await login.goto();
await login.login("user@lab.dev", "Passw0rd!");
await expect(login.dashboard).toBeVisible();
```

Starter repo của site đã có `LoginPage` và `CartPage` theo đúng cách này.

## Nguyên tắc
1. Tên hành động theo **nghiệp vụ** (`login`, `applyCoupon`), không theo thao tác (`clickButton1`).
2. Locator `private`, chỉ để lộ những gì test cần assert.
3. Mỗi class một trang hoặc một vùng giao diện.
4. Không để POM chứa logic kiểm tra phức tạp.

## Lỗi thường gặp
- POM quá lớn, ôm cả ứng dụng vào một class.
- Đặt `expect` khắp nơi trong POM nên test khó đọc và khó tái sử dụng.
- Tạo POM nhưng test vẫn tự viết lại locator.

## Bài tập
1. Viết `FormsPage` cho LAB-02 với hàm `fillValidForm()` và các locator lỗi.
2. Viết lại bài tập đăng nhập khoá tài khoản bằng `LoginPage`.
