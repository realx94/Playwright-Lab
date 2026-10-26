---
title: JavaScript – biến, kiểu dữ liệu, toán tử
level: 1
order: 5
minutes: 30
summary: Dùng let/const, hiểu các kiểu dữ liệu cơ bản và toán tử so sánh.
keywords: [var let const khác nhau, javascript === vs ==, template literal]
---

## Mục tiêu bài học
- Khai báo biến đúng cách và hiểu kiểu dữ liệu.
- Dùng toán tử so sánh chính xác.

## Kiến thức cần nắm
- `const` cho giá trị không gán lại, `let` cho giá trị đổi; tránh `var`
- Kiểu: `string`, `number`, `boolean`, `null`, `undefined`, `object`
- So sánh nghiêm ngặt `===` (không tự ép kiểu), tránh `==`
- Toán tử logic `&&`, `||`, `!`
- Template literal: `` `Xin chào ${ten}` ``

## Giải thích dễ hiểu
Biến là **chiếc hộp có nhãn**. `const` là hộp dán kín nhãn: nhãn không đổi được, còn nội dung bên trong (nếu là danh sách) vẫn có thể thêm bớt. `let` là hộp có thể đổi nhãn. Kiểu dữ liệu là loại đồ trong hộp: chữ, số, đúng/sai.

## Demo code
```ts
const url = "/lab/login";
let attempts = 0;
attempts = attempts + 1;

const isLocked = attempts >= 5;      // boolean
const message = `Đã thử ${attempts} lần`;

console.log(5 === "5");  // false: khác kiểu
console.log(5 == "5");   // true: bị ép kiểu, dễ gây lỗi khó thấy
```

## Lỗi thường gặp
- Dùng `==` nên `0 == ""` thành true gây kết quả khó hiểu.
- Gán lại một biến `const` gây lỗi chạy.
- Nhầm `null` (chủ động rỗng) với `undefined` (chưa có giá trị).

## Bài tập
1. Viết biến lưu email, mật khẩu, số lần thử; in ra thông báo bằng template literal.
2. Dự đoán kết quả của `"10" + 5`, `"10" - 5` và `"10" === 10`, rồi chạy để kiểm tra.
