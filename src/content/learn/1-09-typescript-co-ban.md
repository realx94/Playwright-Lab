---
title: TypeScript cơ bản
level: 1
order: 9
minutes: 30
summary: Thêm kiểu dữ liệu cho JavaScript với type, interface, union và generic cơ bản.
keywords: [type vs interface, typescript union type, typescript enum]
---

## Mục tiêu bài học
- Hiểu vì sao dùng TypeScript trong automation.
- Khai báo kiểu cho biến, hàm, đối tượng.

## Kiến thức cần nắm
- Chú thích kiểu: `let age: number`
- `type` và `interface` mô tả hình dạng đối tượng
- Union: `"vn" | "us"`, kiểu tuỳ chọn `name?: string`
- Mảng kiểu: `string[]`, `Array<number>`
- Generic mức nhẹ: `Promise<void>`, `Record<string, number>`

## Giải thích dễ hiểu
TypeScript giống **nhãn dán trên hộp** nói rõ trong hộp phải là gì. Nếu ai bỏ nhầm đồ, trình soạn thảo báo ngay từ lúc bạn viết, thay vì để test chạy đến giữa chừng mới vỡ. Với automation, điều này bắt được lỗi gõ sai tên thuộc tính hay truyền sai tham số từ sớm.

## Demo code
```ts
interface TestUser {
  email: string;
  password: string;
  remember?: boolean;       // tuỳ chọn
}

type Country = "vn" | "us" | "jp";

function describe(user: TestUser, country: Country): string {
  return `${user.email} (${country})`;
}

const users: TestUser[] = [{ email: "a@lab.dev", password: "Passw0rd!" }];
describe(users[0], "vn");
// describe(users[0], "fr");  // lỗi ngay khi viết: "fr" không thuộc Country
```

`interface` và `type` giống nhau ở hầu hết trường hợp; `interface` có thể mở rộng bằng `extends`, `type` linh hoạt hơn với union.

## Lỗi thường gặp
- Dùng `any` khắp nơi làm mất lợi ích của kiểu.
- Quên kiểu trả về của hàm async: `Promise<void>`, `Promise<string>`.
- Nhầm giá trị `undefined` với tuỳ chọn khi truy cập thuộc tính.

## Bài tập
1. Khai báo `interface Product` và mảng sản phẩm của lab giỏ hàng, viết hàm tính tổng tiền.
2. Thử gán sai kiểu và đọc thông báo lỗi của trình biên dịch.
