---
title: Data-driven và quản lý dữ liệu test
level: 4
order: 5
minutes: 30
summary: Tách dữ liệu khỏi logic, dùng JSON/CSV, factory và tạo dữ liệu độc lập cho từng test.
keywords: [data driven testing, faker js, test data management]
---

## Mục tiêu bài học
- Tổ chức dữ liệu test gọn gàng, dễ mở rộng.
- Tạo dữ liệu độc lập để test chạy song song được.

## Kiến thức cần nắm
- **Data-driven**: một đoạn logic, nhiều bộ dữ liệu (mảng, JSON, CSV)
- **Test data builder/factory**: hàm sinh dữ liệu hợp lệ, cho phép ghi đè từng phần
- Thư viện **faker** sinh dữ liệu giả (tên, email) để tránh trùng
- Dữ liệu **độc lập**: mỗi test dùng email/mã riêng, không đụng nhau
- Tách dữ liệu tĩnh (`tests/data/*.json`) khỏi dữ liệu sinh động

## Giải thích dễ hiểu
Dữ liệu test giống **nguyên liệu nấu ăn**. Nếu mọi đầu bếp cùng dùng chung một nồi thịt, họ tranh nhau và món nào cũng hỏng. Cho mỗi đầu bếp một **phần nguyên liệu riêng** thì mọi người nấu song song thoải mái.

## Demo code
Factory có thể ghi đè:

```ts
import { randomUUID } from "node:crypto";

export function buildUser(overrides: Partial<TestUser> = {}): TestUser {
  const id = randomUUID().slice(0, 8);
  return {
    email: `qa+${id}@lab.dev`,
    password: "Passw0rd!",
    ...overrides,
  };
}

const weak = buildUser({ password: "Pass0r!" });   // chỉ đổi mật khẩu
```

Dữ liệu từ file JSON:

```ts
import cases from "./data/age-cases.json";

for (const c of cases) {
  test(`tuổi ${c.age} → ${c.valid ? "hợp lệ" : "bị từ chối"}`, async ({ page }) => {
    // ...
  });
}
```

## Nguyên tắc
1. Dữ liệu cho test **nằm cạnh test** hoặc trong thư mục `data/`, không rải rác.
2. Giá trị quan trọng đặt tên rõ nghĩa (`overLimitPassword`).
3. Dữ liệu mỗi test **tự tạo và tự dọn**.
4. Không dùng dữ liệu thật hoặc nhạy cảm.

## Lỗi thường gặp
- Cả bộ test dùng chung một tài khoản nên chạy song song bị xung đột.
- Hard-code dữ liệu giống nhau ở nhiều nơi.
- Dữ liệu sinh ngẫu nhiên nhưng không ghi lại nên không tái lập được lỗi.

## Bài tập
1. Viết `buildUser` và dùng nó trong ba test khác nhau với phần ghi đè khác nhau.
2. Chuyển mảng dữ liệu tuổi sang file JSON và import vào test.
