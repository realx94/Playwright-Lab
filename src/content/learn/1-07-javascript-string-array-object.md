---
title: JavaScript – string, array, object
level: 1
order: 7
minutes: 70
summary: Xử lý chuỗi, mảng, đối tượng; dùng map, filter, destructuring và spread.
keywords: [array map filter, destructuring javascript, spread operator]
---

## Mục tiêu bài học
- Xử lý chuỗi lấy từ giao diện: cắt khoảng trắng, kiểm tra nội dung, tách và thay thế.
- Dùng `push`, `find`, `filter`, `map`, `reduce`, `some`, `every` trên mảng dữ liệu test.
- Đọc, thêm, sửa thuộc tính của đối tượng; dùng `Object.keys/values/entries`.
- Dùng destructuring và spread để tách và sao chép dữ liệu mà không sửa nhầm bản gốc.

## Bạn cần chuẩn bị
- Đã làm bài 1.5 và 1.6: có thư mục `thuc-hanh-js` với `tsx` và `tsconfig.json`. Mỗi bước tạo một file mới và chạy bằng `npx tsx <tên file>` ngay trong thư mục đó.

## Kiến thức cần nắm
- Chuỗi: `length`, `trim`, `includes`, `startsWith`, `slice`, `split`, `replace`, `toLowerCase`.
- Mảng: `push`, `pop`, `includes`, `find`, `filter`, `map`, `reduce`, `some`, `every`, `join`.
- Đối tượng: cặp khoá–giá trị, `obj.key`, `obj["key"]`, `Object.keys/values/entries`, `?.`.
- Destructuring: `const { email, password } = user`.
- Spread: `{ ...base, extra: 1 }` và `[...a, ...b]`.

## Giải thích dễ hiểu
**Chuỗi** (string) là một dòng chữ. Chữ lấy từ trang web hiếm khi "sạch": thường thừa khoảng trắng, khác hoa thường, kèm ký hiệu tiền tệ. Bạn phải làm sạch trước khi so sánh.

**Mảng** (array) là dãy ngăn tủ đánh số từ 0, mỗi ngăn đựng một món. **Đối tượng** (object) là thẻ thông tin có nhãn: họ tên, tuổi, email. Dữ liệu test thường là mảng các đối tượng: mỗi đối tượng là một người dùng hoặc một test case.

`map` giống dây chuyền **biến đổi**: vào 3 món thì ra 3 món đã xử lý. `filter` là cổng **lọc**: vào 3 món, chỉ những món đạt chuẩn mới ra. `reduce` là **gộp** cả dãy thành một giá trị (tổng tiền).

Vì sao quan trọng với automation? Playwright trả về danh sách phần tử, nội dung bảng, response API (JSON là đối tượng và mảng), tất cả đều được xử lý bằng chính các thao tác này.

## Thực hành từng bước

### Bước 1. Các hàm thường dùng của chuỗi
Mục đích: làm sạch và kiểm tra chữ lấy từ giao diện.

Tạo `b1-chuoi.ts`:

```ts
// file: b1-chuoi.ts
const raw = "  Tổng cộng: 450.000 đ  ";

console.log(raw.length);
console.log(raw.trim());
console.log(raw.trim().length);
console.log(raw.includes("450"));
console.log(raw.trim().startsWith("Tổng"));
console.log(raw.trim().toLowerCase());
console.log(raw.replace("đ", "VND").trim());
console.log(raw.trim().split(": "));
console.log("Passw0rd!".slice(0, 4));
console.log("ban@example.com".split("@")[1]);
```

| Phương thức | Ý nghĩa |
|-------------|---------|
| `length` | Số ký tự (kể cả khoảng trắng). Đây là thuộc tính, không có dấu `()` |
| `trim()` | Cắt khoảng trắng hai đầu |
| `includes("450")` | Có chứa chuỗi con hay không (trả `true` hoặc `false`) |
| `startsWith("Tổng")` | Có bắt đầu bằng chuỗi này không (hoa thường được phân biệt) |
| `toLowerCase()` | Đổi toàn bộ sang chữ thường (kiểu so sánh không phân biệt hoa thường) |
| `replace("đ", "VND")` | Thay lần xuất hiện đầu tiên |
| `split(": ")` | Tách thành mảng theo dấu phân cách |
| `slice(0, 4)` | Lấy từ vị trí 0 đến trước vị trí 4 |

Chạy `npx tsx b1-chuoi.ts`. Kết quả mong đợi:

```text
24
Tổng cộng: 450.000 đ
20
true
true
tổng cộng: 450.000 đ
Tổng cộng: 450.000 VND
[ 'Tổng cộng', '450.000 đ' ]
Pass
example.com
```

Lưu ý: chuỗi là **bất biến** (immutable). `raw.trim()` không sửa `raw`, nó trả về chuỗi mới. Nếu cần giữ kết quả, hãy gán vào biến: `const clean = raw.trim();`.

### Bước 2. Biến chuỗi giao diện thành số
Mục đích: lấy giá trị tiền hiển thị `450.000 đ` để so sánh với số.

Tạo `b2-chuoi-so.ts`:

```ts
// file: b2-chuoi-so.ts
const text = "Tổng cộng: 450.000 đ";

const digits = text.replace(/[^0-9]/g, "");
const total = Number(digits);

console.log(digits);
console.log(total);
console.log(total === 450000);
console.log(typeof total);
```

`/[^0-9]/g` là **biểu thức chính quy** (regex): `[^0-9]` nghĩa là "mọi ký tự không phải chữ số", cờ `g` là thay thế tất cả lần xuất hiện. Cả đoạn xoá mọi thứ không phải số, còn lại `450000`. Kết quả mong đợi:

```text
450000
450000
true
number
```

Cách này dùng thật khi lấy tổng tiền từ trang và so sánh. Trong Playwright, bạn thường kết hợp với assertion `toContainText`, nhưng cần so số thì phải làm như trên.

### Bước 3. Mảng cơ bản
Mục đích: thêm, bớt, tìm và đọc phần tử.

Tạo `b3-mang.ts`:

```ts
// file: b3-mang.ts
const tags = ["smoke", "login"];

tags.push("regression");
console.log(tags);
console.log(tags.length);
console.log(tags[0]);
console.log(tags[tags.length - 1]);
console.log(tags.includes("login"));
console.log(tags.indexOf("regression"));
console.log(tags.pop());
console.log(tags);
console.log(tags.join(" - "));
```

| Phương thức | Ý nghĩa |
|-------------|---------|
| `push(x)` | Thêm `x` vào cuối mảng (sửa chính mảng gốc) |
| `pop()` | Lấy ra và trả về phần tử cuối (cũng sửa mảng gốc) |
| `tags[0]` | Phần tử đầu tiên (chỉ số từ 0) |
| `tags[tags.length - 1]` | Phần tử cuối |
| `includes(x)` | Mảng có chứa `x` không |
| `indexOf(x)` | Vị trí của `x`, hoặc `-1` nếu không có |
| `join(" - ")` | Nối các phần tử thành một chuỗi, dùng chuỗi đã cho làm dấu nối |

Kết quả mong đợi:

```text
[ 'smoke', 'login', 'regression' ]
3
smoke
regression
true
2
regression
[ 'smoke', 'login' ]
smoke - login
```

### Bước 4. `filter` và `map`
Mục đích: lọc và biến đổi danh sách người dùng test mà không dùng vòng lặp thủ công.

Tạo `b4-filter-map.ts`:

```ts
// file: b4-filter-map.ts
const users = [
  { email: "a@lab.dev", age: 17 },
  { email: "b@lab.dev", age: 30 },
  { email: "c@lab.dev", age: 70 },
];

const adults = users.filter((u) => u.age >= 18 && u.age <= 65);
const emails = adults.map((u) => u.email);
const allEmails = users.map((u) => u.email.toUpperCase());

console.log(adults);
console.log(emails);
console.log(allEmails);
console.log(users.length);
```

Hãy đọc `(u) => u.age >= 18` như sau: "với mỗi `u`, cho giá trị `u.age >= 18`". Đây là **arrow function** (bài 1.8). `filter` giữ phần tử khi hàm trả về `true`; `map` thay mỗi phần tử bằng giá trị hàm trả về. Cả hai **trả về mảng mới**, mảng `users` gốc không đổi. Kết quả mong đợi:

```text
[ { email: 'b@lab.dev', age: 30 } ]
[ 'b@lab.dev' ]
[ 'A@LAB.DEV', 'B@LAB.DEV', 'C@LAB.DEV' ]
3
```

### Bước 5. `find`, `some`, `every`, `reduce`
Mục đích: tìm một phần tử, kiểm tra điều kiện trên cả mảng, và tính tổng.

Tạo `b5-find-reduce.ts`:

```ts
// file: b5-find-reduce.ts
const cart = [
  { name: "Áo", price: 250000, qty: 1 },
  { name: "Giày", price: 450000, qty: 2 },
];

const shoes = cart.find((p) => p.name === "Giày");
const missing = cart.find((p) => p.name === "Mũ");
const hasExpensive = cart.some((p) => p.price > 400000);
const allInStock = cart.every((p) => p.qty > 0);
const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

console.log(shoes);
console.log(missing);
console.log(hasExpensive);
console.log(allInStock);
console.log(total);
```

| Phương thức | Ý nghĩa |
|-------------|---------|
| `find(f)` | Trả về phần tử **đầu tiên** thoả điều kiện, hoặc `undefined` nếu không có |
| `some(f)` | `true` nếu **có ít nhất một** phần tử thoả |
| `every(f)` | `true` nếu **mọi** phần tử thoả |
| `reduce((sum, p) => ..., 0)` | Gộp mảng thành một giá trị. `0` là giá trị khởi đầu của `sum`; mỗi lượt `sum` nhận kết quả của lượt trước |

Kết quả mong đợi:

```text
{ name: 'Giày', price: 450000, qty: 2 }
undefined
true
true
1150000
```

Kiểm tra tay: 250.000 × 1 + 450.000 × 2 = 1.150.000. Đây chính là phép tính để bạn đối chiếu tổng tiền trên trang giỏ hàng.

### Bước 6. Đối tượng và `Object.keys/values/entries`
Mục đích: đọc, thêm, sửa thuộc tính; duyệt toàn bộ cặp khoá–giá trị.

Tạo `b6-doi-tuong.ts`:

```ts
// file: b6-doi-tuong.ts
const user = { email: "ban@example.com", role: "admin", active: true };

console.log(user.email);
console.log(user["role"]);

user.active = false;
(user as Record<string, unknown>).phone = "0900000000";

console.log(Object.keys(user));
console.log(Object.values(user));
console.log(Object.entries(user));

for (const [key, value] of Object.entries(user)) {
  console.log(`${key} = ${value}`);
}

console.log("role" in user);
```

| Cú pháp | Ý nghĩa |
|---------|---------|
| `user.email` | Đọc thuộc tính bằng dấu chấm |
| `user["role"]` | Đọc bằng ngoặc vuông, dùng khi tên khoá nằm trong biến hoặc có ký tự đặc biệt |
| `user.active = false` | Sửa giá trị thuộc tính. Dù `user` là `const`, thuộc tính bên trong vẫn sửa được |
| `Object.keys(o)` | Mảng các tên khoá |
| `Object.values(o)` | Mảng các giá trị |
| `Object.entries(o)` | Mảng các cặp `[khoá, giá trị]` |
| `"role" in user` | Có khoá `role` hay không |

Dòng `(user as Record<string, unknown>).phone = ...` chỉ cần ở TypeScript để cho phép thêm khoá mới vào đối tượng đã có kiểu cố định (bài 1.9 giải thích). Kết quả mong đợi:

```text
ban@example.com
admin
[ 'email', 'role', 'active', 'phone' ]
[ 'ban@example.com', 'admin', false, '0900000000' ]
[
  [ 'email', 'ban@example.com' ],
  [ 'role', 'admin' ],
  [ 'active', false ],
  [ 'phone', '0900000000' ]
]
email = ban@example.com
role = admin
active = false
phone = 0900000000
true
```

### Bước 7. Destructuring và optional chaining
Mục đích: tách nhanh dữ liệu và truy cập an toàn khi thuộc tính có thể không tồn tại.

Tạo `b7-destructuring.ts`:

```ts
// file: b7-destructuring.ts
const user = { email: "ban@example.com", password: "Passw0rd!", profile: { city: "Hà Nội" } };

const { email, password } = user;
const { email: loginEmail } = user;
const { role = "user" } = user as { role?: string };

console.log(email, password);
console.log(loginEmail);
console.log(role);

const [first, second] = ["smoke", "login", "regression"];
console.log(first, second);

const noProfile = {} as { profile?: { city: string } };
console.log(user.profile?.city);
console.log(noProfile.profile?.city);
console.log(noProfile.profile?.city ?? "Không rõ");
```

| Cú pháp | Ý nghĩa |
|---------|---------|
| `const { email, password } = user` | Tách `user.email` và `user.password` thành hai biến cùng tên |
| `{ email: loginEmail }` | Tách nhưng đổi tên biến thành `loginEmail` |
| `{ role = "user" }` | Nếu thiếu `role` thì dùng giá trị mặc định `"user"` |
| `const [first, second] = [...]` | Tách mảng theo thứ tự |
| `a?.b` | **Optional chaining**: nếu `a` là `null` hoặc `undefined` thì trả `undefined` thay vì báo lỗi |

Kết quả mong đợi:

```text
ban@example.com Passw0rd!
ban@example.com
user
smoke login
Hà Nội
undefined
Không rõ
```

Không có `?.`, dòng `noProfile.profile.city` sẽ ném lỗi `TypeError: Cannot read properties of undefined (reading 'city')`, một lỗi cực phổ biến.

### Bước 8. Spread và chuyện "sao chép"
Mục đích: tạo bản sao dữ liệu test và hiểu vì sao `===` không so sánh được hai đối tượng.

Tạo `b8-spread.ts`:

```ts
// file: b8-spread.ts
const baseUser = { email: "ban@example.com", password: "Passw0rd!", role: "user" };

const admin = { ...baseUser, role: "admin" };
const sameRef = baseUser;
sameRef.password = "DaDoi!";

console.log(admin);
console.log(baseUser.password);

const a = ["smoke"];
const b = ["login"];
const merged = [...a, ...b, "regression"];
console.log(merged);

console.log({ x: 1 } === { x: 1 });
console.log(JSON.stringify({ x: 1 }) === JSON.stringify({ x: 1 }));
```

- `{ ...baseUser, role: "admin" }`: sao chép mọi thuộc tính của `baseUser` rồi **ghi đè** `role`. Phần ghi đè phải đứng sau phần spread.
- `const sameRef = baseUser` **không** sao chép: cả hai tên cùng trỏ vào một đối tượng, nên sửa qua `sameRef` thì `baseUser` cũng đổi (đây gọi là so sánh/gán theo **tham chiếu**).
- `[...a, ...b]` ghép mảng.
- `{ x: 1 } === { x: 1 }` là `false` vì là hai đối tượng khác nhau trong bộ nhớ. Cách so nội dung đơn giản: `JSON.stringify` cả hai (chỉ phù hợp dữ liệu nhỏ, cùng thứ tự khoá). Trong Playwright dùng `expect(a).toEqual(b)` để so nội dung.

Kết quả mong đợi:

```text
{ email: 'ban@example.com', password: 'Passw0rd!', role: 'admin' }
DaDoi!
[ 'smoke', 'login', 'regression' ]
false
true
```

Chú ý dòng 2: `admin` giữ mật khẩu cũ vì nó là bản sao được tạo **trước** khi sửa, còn `baseUser.password` đã đổi thành `DaDoi!` do `sameRef`.

## Demo code
Mô phỏng xử lý dữ liệu một bảng đơn hàng lấy từ trang: lấy các dòng, lọc đơn đã giao, tính tổng và dựng dữ liệu cho báo cáo. Tạo `demo-don-hang.ts`:

```ts
// file: demo-don-hang.ts
type Order = { id: string; status: string; total: string };

// giả lập chữ đọc được từ các dòng bảng
const rows: Order[] = [
  { id: " DH-001 ", status: "Delivered", total: "250.000 đ" },
  { id: "DH-002", status: "Pending", total: "450.000 đ" },
  { id: "dh-003 ", status: "Delivered", total: "100.000 đ" },
];

// làm sạch: trim, viết hoa mã, đổi tiền sang số
const orders = rows.map((r) => ({
  id: r.id.trim().toUpperCase(),
  status: r.status,
  amount: Number(r.total.replace(/[^0-9]/g, "")),
}));

const delivered = orders.filter((o) => o.status === "Delivered");
const revenue = delivered.reduce((sum, o) => sum + o.amount, 0);
const ids = delivered.map((o) => o.id).join(", ");

console.log(orders);
console.log(`Đơn đã giao: ${ids}`);
console.log(`Doanh thu: ${revenue}`);
console.log(`Có đơn Pending: ${orders.some((o) => o.status === "Pending")}`);
```

Giải thích: `map` biến chuỗi thô thành dữ liệu sạch có số; `filter` giữ đơn đã giao; `reduce` cộng tiền; `join` ghép mã đơn thành một chuỗi để in. Kết quả mong đợi:

```text
[
  { id: 'DH-001', status: 'Delivered', amount: 250000 },
  { id: 'DH-002', status: 'Pending', amount: 450000 },
  { id: 'DH-003', status: 'Delivered', amount: 100000 }
]
Đơn đã giao: DH-001, DH-003
Doanh thu: 350000
Có đơn Pending: true
```

## Lỗi thường gặp
- **Triệu chứng:** `TypeError: Cannot read properties of undefined (reading 'city')`. Nguyên nhân: truy cập thuộc tính của giá trị `undefined`. Cách sửa: dùng `?.` (`user.profile?.city`), hoặc kiểm tra dữ liệu trước.
- **Triệu chứng:** `TypeError: users.map is not a function`. Nguyên nhân: biến không phải mảng (có thể là đối tượng hoặc chuỗi). Cách sửa: in `Array.isArray(users)` và `console.log(users)` để xem đúng dữ liệu.
- **Triệu chứng:** dữ liệu gốc bị đổi bất ngờ. Nguyên nhân: gán `const b = a` không sao chép; hoặc dùng `sort`, `push`, `pop`, `splice` vốn sửa trực tiếp mảng gốc. Cách sửa: sao chép bằng spread (`[...a]`, `{ ...a }`) trước khi sửa.
- **Triệu chứng:** `console.log(users.map(...))` in `[ undefined, undefined ]`. Nguyên nhân: hàm trong `map` dùng ngoặc nhọn nhưng quên `return` (ví dụ `(u) => { u.email }`). Cách sửa: bỏ ngoặc nhọn `(u) => u.email` hoặc thêm `return`.
- **Triệu chứng:** `{ a: 1 } === { a: 1 }` ra `false`. Nguyên nhân: `===` so sánh tham chiếu với đối tượng. Cách sửa: so từng thuộc tính, hoặc dùng `expect(actual).toEqual(expected)` trong Playwright.
- **Triệu chứng:** `"450.000".split(".")` cho ra `[ '450', '000' ]` chứ không phải số 450000. Nguyên nhân: `split` chỉ tách, không đổi kiểu. Cách sửa: `Number(text.replace(/[^0-9]/g, ""))`.

## Tóm tắt
- Chuỗi bất biến: mọi phương thức như `trim`, `replace` trả về chuỗi mới, nhớ gán lại.
- `map` biến đổi, `filter` lọc, `find` tìm một phần tử, `reduce` gộp; chúng trả về giá trị mới và không sửa mảng gốc.
- `push`, `pop`, `sort`, `splice` thì sửa mảng gốc, cẩn thận với dữ liệu dùng chung giữa các test.
- Destructuring tách dữ liệu gọn; `?.` tránh lỗi khi thuộc tính vắng mặt.
- Spread sao chép nông (shallow copy); gán `const b = a` chỉ tạo thêm một cái tên trỏ vào cùng đối tượng.
- Đối tượng và mảng không so sánh bằng `===`; trong Playwright dùng `toEqual`.

## Bài tập
1. Từ mảng `["  A@Lab.dev ", "b@lab.dev", " C@lab.dev"]`, tạo mảng email đã `trim` và viết thường. Xong khi in ra `[ 'a@lab.dev', 'b@lab.dev', 'c@lab.dev' ]`.
2. Từ mảng người dùng có `age`, lấy danh sách email của những người từ 18 tuổi trở lên, rồi in tuổi lớn nhất bằng `reduce` hoặc `Math.max(...)`. Xong khi kết quả khớp với tính tay.
3. Giỏ hàng gồm 3 sản phẩm `{ name, price, qty }`. Tính tổng tiền bằng `reduce` và kiểm tra `some` có sản phẩm nào `qty` bằng 0 không. Xong khi tổng khớp với phép tính tay.
4. Tạo `baseUser`, rồi tạo `lockedUser` bằng spread với `status: "Locked"` mà không làm đổi `baseUser`. Chứng minh bằng `console.log` cả hai. Xong khi `baseUser` vẫn giữ nguyên.
5. Cho chuỗi `"Tổng cộng: 1.250.000 đ"`. Viết đoạn code lấy ra số `1250000` và kiểm tra `typeof` là `number`. Xong khi `typeof` in `number` và giá trị đúng.
