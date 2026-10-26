---
title: Biến môi trường và cấu hình nhiều môi trường
level: 4
order: 4
minutes: 25
summary: Dùng .env, dotenv và projects để chạy cùng bộ test trên nhiều môi trường.
keywords: [dotenv là gì, playwright projects, environment variables]
---

## Mục tiêu bài học
- Tách cấu hình khỏi code bằng biến môi trường.
- Chạy cùng bộ test cho nhiều môi trường (local, staging).

## Kiến thức cần nắm
- Biến môi trường: cặp tên–giá trị nằm ngoài code (`process.env.BASE_URL`)
- File `.env` + thư viện `dotenv`; **không commit** `.env`, chỉ commit `.env.example`
- `playwright.config.ts` đọc biến để đặt `baseURL`, timeout, số worker
- **Projects**: định nghĩa nhiều cấu hình (trình duyệt, môi trường) trong một file
- Bí mật (mật khẩu, API key) lưu ở **secrets của CI**, không để trong mã

## Giải thích dễ hiểu
Địa chỉ nhà không nên khắc cứng vào chìa khoá. Biến môi trường là **tấm thẻ ghi địa chỉ** bạn thay khi chuyển nhà: chìa (code) vẫn vậy, chỉ cần đổi thẻ. Nhờ đó cùng một bộ test chạy ở máy bạn, ở staging và trên CI.

## Demo code
```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  testDir: "./tests",
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:3000" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
```

```bash
# .env.example (được commit)
BASE_URL=http://localhost:3000
```

Chạy theo môi trường:

```bash
BASE_URL=https://staging.example.com npx playwright test
npx playwright test --project=mobile
```

## Quy tắc an toàn
1. `.env` nằm trong `.gitignore`.
2. Có `.env.example` liệt kê tên biến (không có giá trị bí mật).
3. Kiểm tra biến bắt buộc ngay khi khởi động để báo lỗi sớm.

## Lỗi thường gặp
- Commit `.env` chứa mật khẩu lên GitHub.
- Quên đặt giá trị mặc định nên chạy trên máy đồng nghiệp bị lỗi khó hiểu.
- Hard-code URL trong test thay vì dùng `baseURL`.

## Bài tập
1. Tạo `.env.example` và đọc `BASE_URL` trong config của starter repo.
2. Thêm một project `mobile` và chạy bộ test trên đó.
