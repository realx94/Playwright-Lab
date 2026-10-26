---
title: JavaScript – điều kiện và vòng lặp
level: 1
order: 6
minutes: 30
summary: Rẽ nhánh bằng if/else, switch và lặp bằng for, while, for...of.
keywords: [for of vs forEach, switch case javascript, truthy falsy]
---

## Mục tiêu bài học
- Điều khiển luồng chạy bằng điều kiện.
- Lặp qua dữ liệu để sinh nhiều test từ một mảng.

## Kiến thức cần nắm
- `if / else if / else` và toán tử ba ngôi `a ? b : c`
- `switch` cho nhiều trường hợp rời rạc
- Giá trị falsy: `false`, `0`, `""`, `null`, `undefined`, `NaN`
- Vòng lặp: `for`, `while`, `for...of`
- `break` thoát vòng, `continue` bỏ qua lần hiện tại

## Giải thích dễ hiểu
Điều kiện giống **ngã ba đường có biển chỉ dẫn**: nếu trời mưa đi đường mái che, nếu không thì đi đường tắt. Vòng lặp giống **việc kiểm tra từng hộp hàng trên băng chuyền**: làm cùng một thao tác cho đến khi hết hàng.

## Demo code
```ts
const ages = [17, 18, 65, 66];

for (const age of ages) {
  const valid = age >= 18 && age <= 65;
  console.log(`${age}: ${valid ? "hợp lệ" : "bị từ chối"}`);
}

let tries = 0;
while (tries < 5) {
  tries++;
  if (tries === 3) continue;   // bỏ qua lần 3
  console.log("lần", tries);
}
```

Trong Playwright, vòng lặp thường dùng để **sinh nhiều test từ một mảng dữ liệu** (data-driven).

## Lỗi thường gặp
- Điều kiện biên sai (`>` thay vì `>=`), lỗi kinh điển khi test giá trị biên.
- Vòng `while` quên cập nhật biến nên chạy vô hạn.
- Dùng `forEach` với `await` bên trong và không đợi kết quả (xem bài async/await).

## Bài tập
1. Viết hàm kiểm tra tuổi hợp lệ (18–65) rồi chạy với các giá trị biên.
2. Dùng `for...of` in ra mọi cặp (email, mật khẩu) trong một mảng dữ liệu test.
