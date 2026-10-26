---
title: JavaScript – function và class
level: 1
order: 8
minutes: 70
summary: Viết hàm, arrow function, class, constructor và kế thừa — nền tảng của Page Object.
keywords: [arrow function this, javascript class extends, constructor là gì]
---

## Mục tiêu bài học
- Viết hàm có tham số, giá trị mặc định, giá trị trả về; phân biệt hàm thường và arrow function.
- Truyền hàm vào hàm khác (callback) và hiểu vì sao `test("...", async () => {...})` viết như vậy.
- Viết `class` có thuộc tính, `constructor`, method; dùng `new` để tạo đối tượng.
- Dùng `extends` và `super` để một class kế thừa class khác, rồi tự dựng được một Page Object mini.

## Bạn cần chuẩn bị
- Đã làm bài 1.5 đến 1.7: có thư mục `thuc-hanh-js` với `tsx` và `tsconfig.json`. Mỗi bước tạo một file mới và chạy bằng `npx tsx <tên file>`.

## Kiến thức cần nắm
- Hàm: tham số, `return`, tham số mặc định; hàm không `return` thì trả `undefined`.
- Arrow function: `(a, b) => a + b`.
- Hàm là giá trị: có thể gán vào biến, truyền vào hàm khác (callback).
- Class: thuộc tính, `constructor`, method, `new`, `this`.
- Kế thừa: `class B extends A`, `super(...)`.
- Modifier của TypeScript: `public`, `private`, `protected`, `readonly`.

## Giải thích dễ hiểu
Hàm (function) là **công thức nấu ăn**: cho nguyên liệu vào (tham số), nhận món ra (giá trị trả về), dùng lại bao nhiêu lần cũng được. Trong test, thay vì lặp lại ba dòng "điền email, điền mật khẩu, bấm đăng nhập" ở hai mươi test, bạn gói chúng vào hàm `dangNhap(email, matKhau)` và gọi hai mươi lần. Sửa giao diện đăng nhập thì chỉ sửa một chỗ.

Class là **bản thiết kế chiếc xe**; mỗi lần `new` là một chiếc xe thật được sản xuất theo bản thiết kế đó. Mỗi chiếc xe có dữ liệu riêng (biển số, màu) và hành động riêng (chạy, phanh). **Kế thừa** (inheritance) nghĩa là xe tải dùng lại bản thiết kế xe chung rồi thêm phần thùng hàng, khỏi vẽ lại từ đầu.

Với QA automation, class quan trọng vì nó là nền tảng của **Page Object Model** (bài 4.1): mỗi trang web là một class, các ô nhập và nút là thuộc tính, các hành động như `login()` là method. Học tốt bài này nghĩa là Level 4 sẽ rất nhẹ nhàng.

## Thực hành từng bước

### Bước 1. Hàm cơ bản
Mục đích: gói một đoạn logic lại để gọi nhiều lần.

Tạo `b1-ham.ts`:

```ts
// file: b1-ham.ts
function isLocked(attempts: number, maxAttempts: number = 5): boolean {
  return attempts >= maxAttempts;
}

console.log(isLocked(4));
console.log(isLocked(5));
console.log(isLocked(2, 3));

function logOnly(message: string): void {
  console.log("LOG: " + message);
}

const result = logOnly("xin chào");
console.log(result);
```

| Phần | Ý nghĩa |
|------|---------|
| `function isLocked(...)` | Khai báo hàm tên `isLocked` |
| `attempts: number` | Tham số tên `attempts`, kiểu số (kiểu của TypeScript, bài 1.9) |
| `maxAttempts: number = 5` | Tham số có **giá trị mặc định**: nếu không truyền thì dùng 5 |
| `: boolean` | Kiểu của giá trị trả về |
| `return ...` | Trả kết quả về nơi gọi và kết thúc hàm |
| `void` | Hàm không trả gì; nếu lấy kết quả sẽ là `undefined` |

Chạy `npx tsx b1-ham.ts`. Kết quả mong đợi:

```text
false
true
false
LOG: xin chào
undefined
```

Dòng 3: `isLocked(2, 3)` là `2 >= 3` nên `false`. Dòng cuối `undefined` vì `logOnly` không có `return`.

### Bước 2. Arrow function
Mục đích: cách viết hàm ngắn gọn, rất phổ biến trong Playwright.

Tạo `b2-arrow.ts`:

```ts
// file: b2-arrow.ts
const add = (a: number, b: number) => a + b;
const double = (n: number) => n * 2;
const greet = (name: string) => {
  const text = `Xin chào ${name}`;
  return text;
};

console.log(add(2, 3));
console.log(double(21));
console.log(greet("QA"));

const prices = [100, 200, 300];
console.log(prices.map((p) => p * 2));
console.log(prices.filter((p) => p > 150));
```

| Cú pháp | Ý nghĩa |
|---------|---------|
| `(a, b) => a + b` | Một biểu thức sau mũi tên được **trả về luôn**, không cần `return` |
| `(name) => { ...; return x; }` | Có ngoặc nhọn thì là khối lệnh, phải tự viết `return` |
| `(p) => p * 2` | Truyền thẳng vào `map` hoặc `filter` như một hàm không tên |

Kết quả mong đợi:

```text
5
42
Xin chào QA
[ 200, 400, 600 ]
[ 200, 300 ]
```

### Bước 3. Hàm là giá trị: callback
Mục đích: hiểu cú pháp `test("tên", async () => {...})` mà bạn viết hằng ngày.

Tạo `b3-callback.ts`:

```ts
// file: b3-callback.ts
function runStep(name: string, action: () => void) {
  console.log(`Bắt đầu: ${name}`);
  action();
  console.log(`Xong: ${name}`);
}

runStep("mở trang đăng nhập", () => {
  console.log("  ... đang mở /lab/login");
});

runStep("bấm nút", () => console.log("  ... đã bấm"));
```

`action: () => void` nghĩa là tham số `action` là một **hàm** không nhận gì, không trả gì. Hàm `runStep` gọi `action()` đúng lúc nó muốn. Hàm được truyền vào như vậy gọi là **callback**. Playwright làm y hệt: `test("tên", async ({ page }) => {...})` truyền một hàm cho `test`, và `test` sẽ gọi nó khi đến lượt chạy. Kết quả mong đợi:

```text
Bắt đầu: mở trang đăng nhập
  ... đang mở /lab/login
Xong: mở trang đăng nhập
Bắt đầu: bấm nút
  ... đã bấm
Xong: bấm nút
```

### Bước 4. Class đầu tiên
Mục đích: tạo bản thiết kế và sản xuất nhiều đối tượng từ nó.

Tạo `b4-class.ts`:

```ts
// file: b4-class.ts
class Calculator {
  total = 0;

  add(n: number): void {
    this.total += n;
  }

  subtract(n: number): void {
    this.total -= n;
  }
}

const calc = new Calculator();
calc.add(10);
calc.subtract(3);
console.log(calc.total);

const other = new Calculator();
console.log(other.total);
```

| Phần | Ý nghĩa |
|------|---------|
| `class Calculator { ... }` | Khai báo bản thiết kế |
| `total = 0;` | **Thuộc tính** (property): dữ liệu của mỗi đối tượng, khởi tạo bằng 0 |
| `add(n) { ... }` | **Method**: hàm nằm trong class |
| `this` | Chính đối tượng đang gọi method; `this.total` là `total` của đối tượng đó |
| `new Calculator()` | Tạo một đối tượng mới từ bản thiết kế |

Kết quả mong đợi:

```text
7
0
```

`calc` và `other` là hai đối tượng độc lập: thay đổi `calc` không ảnh hưởng `other`.

### Bước 5. `constructor`
Mục đích: nhận dữ liệu đầu vào khi tạo đối tượng.

Tạo `b5-constructor.ts`:

```ts
// file: b5-constructor.ts
class TestUser {
  email: string;
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  describe(): string {
    return `${this.email} (mật khẩu dài ${this.password.length} ký tự)`;
  }
}

const user = new TestUser("ban@example.com", "Passw0rd!");
console.log(user.describe());
console.log(user.email);
```

**Constructor** là hàm đặc biệt chạy **một lần** ngay khi bạn gọi `new`. Nó thường dùng để gán dữ liệu ban đầu cho thuộc tính. `new TestUser("ban@example.com", "Passw0rd!")` truyền hai giá trị vào `email` và `password` của constructor. Kết quả mong đợi:

```text
ban@example.com (mật khẩu dài 9 ký tự)
ban@example.com
```

TypeScript có cách viết rút gọn rất hay gặp trong Page Object: đặt modifier trước tham số, TypeScript tự khai báo thuộc tính và gán giá trị:

```ts
// file: b5-rut-gon.ts
class TestUser {
  constructor(
    public email: string,
    private password: string,
    readonly role: string = "user",
  ) {}

  hasStrongPassword(): boolean {
    return this.password.length >= 8;
  }
}

const user = new TestUser("ban@example.com", "Passw0rd!");
console.log(user.email);
console.log(user.role);
console.log(user.hasStrongPassword());
```

| Modifier | Ý nghĩa |
|----------|---------|
| `public` | Truy cập được từ mọi nơi (mặc định) |
| `private` | Chỉ dùng được bên trong class; bên ngoài gọi `user.password` sẽ bị TypeScript báo lỗi |
| `protected` | Dùng được trong class và các class con |
| `readonly` | Gán một lần (trong constructor), sau đó không được đổi |

Kết quả mong đợi:

```text
ban@example.com
user
true
```

### Bước 6. Kế thừa với `extends` và `super`
Mục đích: dùng lại phần chung, chỉ viết thêm phần riêng.

Tạo `b6-extends.ts`:

```ts
// file: b6-extends.ts
class Animal {
  constructor(protected name: string) {}

  speak(): string {
    return `${this.name} phát ra tiếng`;
  }
}

class Dog extends Animal {
  constructor(name: string, private tricks: number) {
    super(name);
  }

  speak(): string {
    return `${super.speak()}: gâu gâu (biết ${this.tricks} trò)`;
  }
}

const rex = new Dog("Rex", 2);
console.log(rex.speak());
console.log(rex instanceof Dog);
console.log(rex instanceof Animal);
```

| Phần | Ý nghĩa |
|------|---------|
| `class Dog extends Animal` | `Dog` thừa hưởng mọi thứ của `Animal` |
| `super(name)` | Gọi constructor của class cha. **Bắt buộc** có trong constructor của class con, và phải đứng trước khi dùng `this` |
| `super.speak()` | Gọi method `speak` của class cha |
| `speak()` trong `Dog` | **Ghi đè** (override): thay hành vi của cha bằng hành vi riêng |
| `instanceof` | Kiểm tra đối tượng có sinh ra từ class đó (hoặc class cha) không |

Kết quả mong đợi:

```text
Rex phát ra tiếng: gâu gâu (biết 2 trò)
true
true
```

### Bước 7. `this` và arrow function (bẫy kinh điển)
Mục đích: biết vì sao `this` đôi khi "biến mất" khi bạn lấy method ra khỏi đối tượng.

Tạo `b7-this.ts`:

```ts
// file: b7-this.ts
class Counter {
  count = 0;

  increment() {
    this.count++;
    return this.count;
  }

  incrementArrow = () => {
    this.count++;
    return this.count;
  };
}

const c = new Counter();
console.log(c.increment());

const detached = c.increment;
try {
  detached();
} catch (e) {
  console.log("Lỗi: " + (e as Error).constructor.name);
}

const fixed = c.incrementArrow;
console.log(fixed());
```

Khi bạn tách `c.increment` ra thành biến `detached` rồi gọi, nó không còn đi kèm `c`, nên `this` không phải đối tượng `c` nữa và code lỗi. Arrow function được khai báo như thuộc tính (`incrementArrow = () => {...}`) thì **giữ nguyên `this`** của chỗ định nghĩa, nên vẫn chạy khi tách ra. Kết quả mong đợi:

```text
1
Lỗi: TypeError
2
```

Tình huống thật gặp khi nào? Khi bạn truyền method làm callback, ví dụ `users.forEach(this.check)`: `this` bị mất bên trong `check`. Cách sửa là dùng arrow function: `users.forEach((u) => this.check(u))`.

## Demo code
Page Object mini cho trang đăng nhập, **chưa dùng trình duyệt thật**: ta giả lập `page` bằng một class đơn giản để thấy cấu trúc. Tạo `demo-page-object.ts`:

```ts
// file: demo-page-object.ts
// Một "page" giả để chạy được ngay không cần Playwright
class FakePage {
  log: string[] = [];
  async goto(url: string) { this.log.push(`goto ${url}`); }
  async fill(selector: string, value: string) { this.log.push(`fill ${selector}=${value}`); }
  async click(selector: string) { this.log.push(`click ${selector}`); }
}

// Lớp cha: phần dùng chung cho mọi trang
class BasePage {
  constructor(protected readonly page: FakePage, protected readonly baseUrl: string) {}

  async open(path: string) {
    await this.page.goto(this.baseUrl + path);
  }
}

// Lớp con: riêng cho trang đăng nhập
class LoginPage extends BasePage {
  private readonly emailInput = "#email";
  private readonly passwordInput = "#password";
  private readonly submitButton = "#submit";

  constructor(page: FakePage) {
    super(page, "https://lab.example");
  }

  async login(email: string, password: string) {
    await this.open("/lab/login");
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.submitButton);
  }
}

async function main() {
  const page = new FakePage();
  const loginPage = new LoginPage(page);
  await loginPage.login("ban@example.com", "Passw0rd!");
  console.log(page.log);
}

main();
```

Giải thích từng đoạn: `FakePage` chỉ ghi lại các thao tác, đóng vai `page` của Playwright. `BasePage` giữ phần chung (`page`, `baseUrl`, `open`). `LoginPage` kế thừa, khai báo các selector là thuộc tính `private readonly`, và có method `login` gom ba thao tác thành một hành động có nghĩa. `main` dùng `async/await` (bài 1.10) để gọi tuần tự. Kết quả mong đợi:

```text
[
  'goto https://lab.example/lab/login',
  'fill #email=ban@example.com',
  'fill #password=Passw0rd!',
  'click #submit'
]
```

Ở bài 4.1 bạn sẽ thay `FakePage` bằng `Page` thật của Playwright, và thay selector bằng locator như `page.getByLabel(...)`. Cấu trúc class vẫn y nguyên.

## Lỗi thường gặp
- **Triệu chứng:** `ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor`. Nguyên nhân: class con có constructor nhưng quên `super(...)` hoặc dùng `this` trước nó. Cách sửa: gọi `super(...)` ở dòng đầu của constructor.
- **Triệu chứng:** `TypeError: Class constructor Calculator cannot be invoked without 'new'`. Nguyên nhân: gọi `Calculator()` thay vì `new Calculator()`. Cách sửa: thêm `new`.
- **Triệu chứng:** `TypeError: Cannot read properties of undefined (reading 'count')`. Nguyên nhân: `this` mất khi bạn tách method khỏi đối tượng hoặc truyền làm callback. Cách sửa: dùng arrow function bọc lại hoặc khai báo method dạng arrow function.
- **Triệu chứng:** `Property 'password' is private and only accessible within class 'TestUser'`. Nguyên nhân: truy cập thuộc tính `private` từ bên ngoài class. Cách sửa: thêm method công khai, hoặc đổi sang `public` nếu thực sự cần.
- **Triệu chứng:** hàm in `undefined` thay vì kết quả. Nguyên nhân: quên `return`, hoặc dùng arrow function có ngoặc nhọn mà không viết `return`. Cách sửa: thêm `return`, hoặc bỏ ngoặc nhọn để trả về biểu thức.
- **Triệu chứng:** `console.log(add)` in ra `[Function: add]` thay vì số. Nguyên nhân: quên dấu `()` khi gọi hàm. Cách sửa: gọi `add(1, 2)`.

## Tóm tắt
- Hàm gom logic dùng lại; tham số mặc định và `return` quyết định cách gọi và kết quả.
- Arrow function viết gọn, phổ biến trong `map`, `filter` và trong `test(...)`; truyền hàm vào hàm khác gọi là callback.
- Class là bản thiết kế; `new` tạo đối tượng; constructor nhận dữ liệu ban đầu; `this` là đối tượng đang gọi.
- `extends` thừa hưởng, `super(...)` gọi constructor cha, ghi đè method khi cần hành vi riêng.
- `private` và `readonly` giúp bảo vệ dữ liệu, rất hữu ích khi viết Page Object.
- Một trang web tương ứng một class: đây chính là Page Object Model của bài 4.1.

## Bài tập
1. Viết hàm `isValidEmail(email: string): boolean` trả `true` khi chuỗi chứa `@` và có dấu chấm sau `@`. Xong khi hàm cho đúng với `ban@example.com`, và sai với `ban@`, `ban.example.com`, chuỗi rỗng.
2. Viết `class Calculator` có method `add`, `subtract`, `reset` và thuộc tính `total`. Xong khi chuỗi gọi `add(10)`, `subtract(4)` in ra 6, sau `reset()` in ra 0.
3. Viết `class Animal` và `class Dog extends Animal`, ghi đè method `speak` và gọi `super.speak()`. Xong khi kết quả in cả câu của cha lẫn phần riêng của con.
4. Viết hàm `retry(times: number, action: () => boolean)` gọi `action` tối đa `times` lần cho đến khi nó trả `true`, rồi in số lần đã thử. Xong khi thử với `action` luôn `false` thì in đúng `times` lần.
5. Dựa trên Page Object mini ở phần Demo, viết thêm class `CartPage extends BasePage` với method `addItem(name)` gồm ba thao tác: mở trang `/lab/cart`, điền tên sản phẩm vào `#search`, bấm `#add`. Xong khi `page.log` in đúng ba dòng tương ứng.
