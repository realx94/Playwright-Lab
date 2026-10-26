---
title: JavaScript – string, array, object
level: 1
order: 7
minutes: 35
summary: Xử lý chuỗi, mảng, đối tượng; dùng map, filter, destructuring và spread.
keywords: [array map filter, destructuring javascript, spread operator]
---

## Mục tiêu bài học
- Thao tác thành thạo với chuỗi, mảng và đối tượng.
- Dùng `map`, `filter`, destructuring để xử lý dữ liệu test.

## Kiến thức cần nắm
- Chuỗi: `length`, `includes`, `startsWith`, `slice`, `split`, `trim`, `replace`
- Mảng: `push`, `pop`, `includes`, `find`, `map`, `filter`, `reduce`
- Đối tượng: cặp khoá–giá trị, truy cập `obj.key`, `Object.keys/values/entries`
- Destructuring: `const { email, password } = user`
- Spread: `{ ...base, extra: 1 }` và `[...a, ...b]`

## Giải thích dễ hiểu
Mảng là **dãy ngăn tủ đánh số**; đối tượng là **thẻ thông tin có nhãn** (họ tên, tuổi, email). `map` giống một dây chuyền **biến đổi** từng món, `filter` là cổng **lọc** chỉ cho món đạt chuẩn đi qua.

## Demo code
```ts
const users = [
  { email: "a@lab.dev", age: 17 },
  { email: "b@lab.dev", age: 30 },
  { email: "c@lab.dev", age: 70 },
];

const adults = users.filter((u) => u.age >= 18 && u.age <= 65);
const emails = adults.map((u) => u.email);   // ["b@lab.dev"]

const { email, age } = users[1];
const copy = { ...users[1], age: 31 };       // sao chép và đổi một trường

const total = [250_000, 450_000].reduce((sum, p) => sum + p, 0);
```

## Lỗi thường gặp
- Sửa trực tiếp mảng/đối tượng gốc khi chỉ định tạo bản sao.
- Dùng `.map` chỉ để lặp mà không dùng giá trị trả về.
- So sánh hai đối tượng bằng `===` (so sánh tham chiếu, không phải nội dung).

## Bài tập
1. Từ mảng người dùng, lấy danh sách email của những người từ 18 tuổi trở lên.
2. Tính tổng tiền của giỏ hàng gồm nhiều sản phẩm bằng `reduce`.
