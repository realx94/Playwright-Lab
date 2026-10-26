---
title: JavaScript – function và class
level: 1
order: 8
minutes: 35
summary: Viết hàm, arrow function, class, constructor và kế thừa — nền tảng của Page Object.
keywords: [arrow function this, javascript class extends, constructor là gì]
---

## Mục tiêu bài học
- Viết hàm tái sử dụng và hiểu arrow function.
- Dùng class, constructor, method và `extends`.

## Kiến thức cần nắm
- Hàm có tham số, giá trị trả về; tham số mặc định
- Arrow function: `(a, b) => a + b`
- Class: thuộc tính, `constructor`, method
- Kế thừa: `class B extends A` và `super(...)`
- Modifier của TypeScript: `public`, `private`, `readonly`

## Giải thích dễ hiểu
Hàm là **công thức nấu ăn**: cho nguyên liệu vào, nhận món ra, dùng lại bao nhiêu lần cũng được. Class là **bản thiết kế chiếc xe**; mỗi lần `new` là một chiếc xe thật. Kế thừa nghĩa là xe tải dùng lại bản thiết kế xe chung rồi thêm phần thùng hàng.

## Demo code
```ts
const add = (a: number, b: number = 0) => a + b;

class BasePage {
  constructor(protected readonly baseUrl: string) {}
  open(path: string) {
    return this.baseUrl + path;
  }
}

class LoginPage extends BasePage {
  constructor() {
    super("https://lab.example");
  }
  loginUrl() {
    return this.open("/lab/login");
  }
}

const page = new LoginPage();
console.log(page.loginUrl());
```

Đây chính là cách bạn sẽ viết **Page Object** ở Level 4: mỗi trang là một class, `BasePage` giữ phần dùng chung.

## Lỗi thường gặp
- Quên `super()` trong constructor của class con.
- Dùng `this` trong hàm thường lồng bên trong method nên `this` bị đổi nghĩa; arrow function giữ `this` của chỗ định nghĩa.
- Quên `new` khi tạo đối tượng từ class.

## Bài tập
1. Viết class `Calculator` có method `add` và `subtract`.
2. Viết `class Animal` và `class Dog extends Animal`, ghi đè một method và gọi `super`.
