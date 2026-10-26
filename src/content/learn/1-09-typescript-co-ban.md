---
title: TypeScript cơ bản
level: 1
order: 9
minutes: 75
summary: Thêm kiểu dữ liệu cho JavaScript với type, interface, union và generic cơ bản.
keywords: [type vs interface, typescript union type, typescript enum]
---

## Mục tiêu bài học
- Giải thích được TypeScript khác JavaScript ở điểm nào và vì sao Playwright dùng nó.
- Khai báo kiểu cho biến, hàm, mảng và đối tượng bằng `type` và `interface`.
- Dùng union, literal type, thuộc tính tuỳ chọn `?` và `enum` cho dữ liệu test.
- Chạy `npx tsc --noEmit` và đọc hiểu thông báo lỗi kiểu thường gặp.
- Đọc được các kiểu generic nhẹ: `Promise<void>`, `Array<T>`, `Record<string, number>`.

## Bạn cần chuẩn bị
- Đã làm bài 1.5 đến 1.8: thư mục `thuc-hanh-js` có `tsx`, `typescript` và `tsconfig.json`.
- VS Code đã mở thư mục này. Nếu chưa, chạy `code .` trong thư mục.

## Kiến thức cần nắm
- Chú thích kiểu: `let age: number`, và **suy luận kiểu** (type inference) khi không cần viết.
- `type` và `interface` mô tả hình dạng đối tượng.
- Union `"vn" | "us"`, kiểu tuỳ chọn `name?: string`, `string | undefined`.
- Mảng kiểu: `string[]`, `Array<number>`.
- Generic mức nhẹ: `Promise<void>`, `Record<string, number>`.
- `enum` và vì sao nhiều dự án thích union kiểu chuỗi hơn.
- `any` và `unknown`.

## Giải thích dễ hiểu
TypeScript (TS) là JavaScript cộng thêm **hệ thống kiểu**. Hãy nghĩ đến những chiếc hộp có dán nhãn ghi rõ trong hộp phải đựng gì: "chỉ chứa sách", "chỉ chứa số". Nếu ai bỏ nhầm đồ, người đóng gói (trình soạn thảo và trình kiểm tra `tsc`) báo ngay từ lúc bạn gõ, chứ không đợi đến khi test chạy giữa chừng mới vỡ.

Điều quan trọng cần hiểu: **TypeScript chỉ tồn tại lúc viết code**. Khi chạy, kiểu bị xoá hết và ta còn lại JavaScript thuần. Nghĩa là kiểu giúp bạn bắt lỗi sớm, nhưng không thay thế việc kiểm tra dữ liệu thật lúc chạy.

Với automation, lợi ích rất cụ thể: gõ sai tên thuộc tính (`user.emial`), truyền thiếu tham số, hoặc truyền `"fr"` vào chỗ chỉ nhận `"vn" | "us"` đều bị báo lỗi đỏ ngay trong VS Code. Gợi ý tự động khi gõ `page.` cũng nhờ kiểu mà có. Playwright được viết bằng TypeScript nên toàn bộ API của nó có sẵn kiểu cho bạn.

## Thực hành từng bước

### Bước 1. Chú thích kiểu và suy luận kiểu
Mục đích: biết khi nào cần ghi kiểu, khi nào TypeScript tự hiểu.

Tạo `b1-kieu-co-ban.ts`:

```ts
// file: b1-kieu-co-ban.ts
const baseUrl = "/lab/login";
let attempts = 0;

let email: string = "ban@example.com";
let isLocked: boolean = false;
let nothingYet: string | undefined;

attempts = attempts + 1;
email = email.toUpperCase();

console.log(baseUrl, attempts, email, isLocked, nothingYet);
console.log(typeof attempts);
```

| Dòng | Giải thích |
|------|------------|
| `const baseUrl = "/lab/login"` | Không ghi kiểu: TS **suy luận** đây là chuỗi |
| `let attempts = 0` | TS suy luận `number`. Sau này gán `attempts = "a"` sẽ bị báo lỗi |
| `let email: string = ...` | Ghi kiểu tường minh sau dấu `:` (thường không cần khi đã gán giá trị luôn) |
| `let nothingYet: string` kèm `undefined` | Dòng khai báo ghi kiểu là hợp (union) của chuỗi và `undefined`, nên biến có thể là chuỗi hoặc `undefined` (xem bước 3) |

Chạy `npx tsx b1-kieu-co-ban.ts`. Kết quả mong đợi:

```text
/lab/login 1 BAN@EXAMPLE.COM false undefined
number
```

Quy tắc thực dụng: **để TS tự suy luận khi giá trị khởi tạo đã rõ**, và ghi kiểu tường minh ở những chỗ ranh giới: tham số hàm, giá trị trả về, và dữ liệu đối tượng.

### Bước 2. `interface` và `type` cho đối tượng
Mục đích: mô tả "hình dạng" của dữ liệu test để mọi nơi dùng đúng.

Tạo `b2-interface.ts`:

```ts
// file: b2-interface.ts
interface TestUser {
  email: string;
  password: string;
  remember?: boolean;
}

type Product = {
  name: string;
  price: number;
};

const user: TestUser = { email: "ban@example.com", password: "Passw0rd!" };
const withRemember: TestUser = { ...user, remember: true };
const shoes: Product = { name: "Giày", price: 450000 };

console.log(user);
console.log(withRemember);
console.log(shoes);
console.log(user.remember);
```

| Phần | Ý nghĩa |
|------|---------|
| `interface TestUser { ... }` | Khai báo hình dạng: có `email` và `password` kiểu chuỗi |
| `remember?: boolean` | Dấu `?` nghĩa là thuộc tính **tuỳ chọn**, có thể vắng mặt |
| `type Product = { ... }` | Cách khai báo khác (type alias), kết quả tương tự |
| `const user: TestUser = ...` | Đối tượng phải khớp hình dạng, thiếu hoặc thừa thuộc tính sẽ báo lỗi |

Kết quả mong đợi:

```text
{ email: 'ban@example.com', password: 'Passw0rd!' }
{ email: 'ban@example.com', password: 'Passw0rd!', remember: true }
{ name: 'Giày', price: 450000 }
undefined
```

Dòng cuối là `undefined` vì `remember` chưa được gán; khi thuộc tính là tuỳ chọn, kiểu của nó thực chất là `boolean | undefined`.

**Chọn `type` hay `interface`?** Ở hầu hết trường hợp hai cách này như nhau. Điểm khác biệt chính: `interface` mở rộng bằng `extends` (và khai báo lại cùng tên sẽ gộp); `type` linh hoạt hơn vì biểu diễn được union (`"a" | "b"`), tuple và kiểu tính toán. Quy ước dễ nhớ: dùng `interface` cho hình dạng đối tượng, dùng `type` cho union và phần còn lại, và quan trọng nhất là **thống nhất trong cả dự án**.

### Bước 3. Union, literal và thu hẹp kiểu
Mục đích: giới hạn giá trị hợp lệ và xử lý giá trị có thể có nhiều kiểu.

Tạo `b3-union.ts`:

```ts
// file: b3-union.ts
type Country = "vn" | "us" | "jp";
type Id = string | number;

function currencyOf(country: Country): string {
  if (country === "vn") return "VND";
  if (country === "us") return "USD";
  return "JPY";
}

function show(id: Id): string {
  if (typeof id === "number") {
    return `ID số: ${id.toFixed(0)}`;
  }
  return `ID chuỗi: ${id.toUpperCase()}`;
}

console.log(currencyOf("vn"));
console.log(currencyOf("jp"));
console.log(show(42));
console.log(show("dh-001"));
```

- `"vn" | "us" | "jp"` là **union** của các giá trị cụ thể (literal): biến kiểu `Country` chỉ được là một trong ba chuỗi đó. Gõ `currencyOf("fr")` sẽ bị báo lỗi ngay.
- `string | number` là union của hai kiểu. Muốn gọi phương thức riêng của từng kiểu, bạn phải **thu hẹp** (narrowing) bằng `typeof` như trong hàm `show`: trong nhánh `typeof id === "number"` TS biết `id` là số, nên cho dùng `toFixed`.

Kết quả mong đợi:

```text
VND
JPY
ID số: 42
ID chuỗi: DH-001
```

### Bước 4. Mảng kiểu và hàm có kiểu
Mục đích: viết hàm xử lý danh sách dữ liệu test và để TS kiểm tra hộ.

Tạo `b4-mang-ham.ts`:

```ts
// file: b4-mang-ham.ts
interface Product {
  name: string;
  price: number;
}

const cart: Product[] = [
  { name: "Áo", price: 250000 },
  { name: "Giày", price: 450000 },
];

const names: Array<string> = cart.map((p) => p.name);

function totalOf(items: Product[]): number {
  return items.reduce((sum, p) => sum + p.price, 0);
}

const logResult = (name: string, ok: boolean): void => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
};

console.log(names);
console.log(totalOf(cart));
logResult("tổng giỏ hàng", totalOf(cart) === 700000);
```

| Phần | Ý nghĩa |
|------|---------|
| `Product[]` | Mảng các `Product` |
| `Array<string>` | Cách viết khác của `string[]` (generic, xem bước 5) |
| `(items: Product[]): number` | Hàm nhận mảng sản phẩm và trả về số |
| `(name: string, ok: boolean): void` | Arrow function có kiểu; `void` là không trả giá trị |

Kết quả mong đợi:

```text
[ 'Áo', 'Giày' ]
700000
PASS tổng giỏ hàng
```

### Bước 5. Generic mức nhẹ
Mục đích: đọc được các kiểu có dấu `< >` thường thấy trong tài liệu Playwright.

Tạo `b5-generic.ts`:

```ts
// file: b5-generic.ts
const stock: Record<string, number> = { "Áo": 10, "Giày": 0 };
stock["Mũ"] = 5;

function firstOf<T>(items: T[]): T | undefined {
  return items[0];
}

async function getTitle(): Promise<string> {
  return "Trang đăng nhập";
}

async function main(): Promise<void> {
  console.log(await getTitle());
}

console.log(stock);
console.log(firstOf([10, 20, 30]));
console.log(firstOf(["a", "b"]));
console.log(firstOf([]));
main();
```

| Kiểu | Ý nghĩa |
|------|---------|
| `Record<string, number>` | Đối tượng có khoá là chuỗi bất kỳ và giá trị là số (như từ điển tên sản phẩm sang số lượng tồn) |
| `Array<T>` / `T[]` | Mảng chứa phần tử kiểu `T` |
| `function firstOf<T>(items: T[])` | Hàm **generic**: `T` là "kiểu sẽ biết sau". Truyền mảng số thì `T` là số, truyền mảng chuỗi thì `T` là chuỗi; kết quả trả về là `T` hoặc `undefined` (mảng rỗng) |
| `Promise<string>` | "Lời hứa" sẽ trả về một chuỗi (bài 1.10) |
| `Promise<void>` | "Lời hứa" hoàn thành mà không trả giá trị: kiểu trả về của hầu hết hàm test async |

Bạn chưa cần tự viết generic phức tạp. Chỉ cần đọc được: `Locator[]` là mảng locator, `Promise<string>` là `await` ra chuỗi, `Record<string, string>` là bảng tra cứu chuỗi sang chuỗi. Kết quả mong đợi:

```text
{ 'Áo': 10, 'Giày': 0, 'Mũ': 5 }
10
a
undefined
Trang đăng nhập
```

### Bước 6. `enum` và lựa chọn thay thế
Mục đích: đặt tên cho tập giá trị cố định như vai trò hoặc trạng thái.

Tạo `b6-enum.ts`:

```ts
// file: b6-enum.ts
enum Role {
  Admin = "admin",
  Editor = "editor",
  Viewer = "viewer",
}

const Status = {
  Active: "Active",
  Locked: "Locked",
} as const;
type Status = (typeof Status)[keyof typeof Status];

function canDelete(role: Role): boolean {
  return role === Role.Admin;
}

function banner(status: Status): string {
  return status === Status.Locked ? "Tài khoản bị khoá" : "Hoạt động";
}

console.log(Role.Editor);
console.log(canDelete(Role.Admin), canDelete(Role.Viewer));
console.log(banner("Locked"));
```

- `enum Role { ... }` tạo nhóm hằng số có tên. `Role.Editor` có giá trị chuỗi `"editor"`.
- Cách thay thế: một đối tượng `as const` cộng một `type` suy ra từ nó. Cách này không sinh code đặc biệt khi chạy và cũng dễ dùng với giá trị chuỗi thuần như `"Locked"`. Nhiều đội thích cách thứ hai hoặc đơn giản dùng union (`"Active" | "Locked"`). Cả hai đều ổn, miễn là nhất quán.

Kết quả mong đợi:

```text
editor
true false
Tài khoản bị khoá
```

### Bước 7. `any` và `unknown`
Mục đích: biết vì sao tránh `any`.

Tạo `b7-any-unknown.ts`:

```ts
// file: b7-any-unknown.ts
function parseJson(text: string): unknown {
  return JSON.parse(text);
}

const data = parseJson('{"email":"ban@example.com"}');

if (typeof data === "object" && data !== null && "email" in data) {
  console.log("Có email:", (data as { email: string }).email);
}

const risky: any = "abc";
console.log(risky.khongTonTai);
```

`any` tắt hoàn toàn kiểm tra kiểu nên lỗi chỉ lộ ra lúc chạy: dòng `risky.khongTonTai` trong TS không báo gì, kết quả ở runtime là `undefined`. `unknown` là phiên bản an toàn hơn: nó nhận mọi giá trị nhưng bạn **phải kiểm tra** (như `typeof`, `in`) trước khi dùng. Dữ liệu từ ngoài (JSON của API) nên được coi là `unknown`, rồi kiểm tra hoặc ép sang kiểu bạn mong đợi một cách có chủ đích. Kết quả mong đợi:

```text
Có email: ban@example.com
undefined
```

### Bước 8. Kiểm tra kiểu bằng `tsc`
Mục đích: tự mình thấy TypeScript bắt lỗi, và đọc được thông báo.

Cách thức: `tsx` chạy được code sai kiểu, nên muốn kiểm tra phải dùng `tsc`. Tạo thư mục `kiem-tra` và file `kiem-tra/loi-kieu.ts` với nội dung sau **chính xác từng dòng** (không thêm dòng trống ở đầu để số dòng khớp thông báo):

```ts
interface TestUser {
  email: string;
  password: string;
  remember?: boolean;
}

type Country = "vn" | "us" | "jp";

function describeUser(user: TestUser, country: Country): string {
  return `${user.email} (${country})`;
}

describeUser({ email: "a@lab.dev" }, "vn");
describeUser({ email: "a@lab.dev", password: "Passw0rd!" }, "fr");
const age: number = "25";
const user: TestUser = { email: "a@lab.dev", password: "x" };
console.log(user.emial);
```

Tạo thêm file `tsconfig.kiem-tra.json` ở thư mục gốc `thuc-hanh-js`, chỉ để kiểm tra thư mục `kiem-tra`:

```json
{
  "extends": "./tsconfig.json",
  "include": ["kiem-tra/*.ts"]
}
```

Chạy:

```bash
npx tsc -p tsconfig.kiem-tra.json --pretty false
```

| Phần | Ý nghĩa |
|------|---------|
| `npx tsc` | Chạy trình biên dịch TypeScript đã cài trong dự án |
| `-p tsconfig.kiem-tra.json` | Dùng file cấu hình này (`-p` là project) |
| `--pretty false` | In ngắn gọn một lỗi một dòng (mặc định terminal in có màu và khung code) |

Kết quả mong đợi (bốn lỗi):

```text
kiem-tra/loi-kieu.ts(13,14): error TS2741: Property 'password' is missing in type '{ email: string; }' but required in type 'TestUser'.
kiem-tra/loi-kieu.ts(14,61): error TS2345: Argument of type '"fr"' is not assignable to parameter of type 'Country'.
kiem-tra/loi-kieu.ts(15,7): error TS2322: Type 'string' is not assignable to type 'number'.
kiem-tra/loi-kieu.ts(17,18): error TS2551: Property 'emial' does not exist on type 'TestUser'. Did you mean 'email'?
```

Cách đọc một dòng: `kiem-tra/loi-kieu.ts(13,14)` là file, dòng 13, cột 14; `TS2741` là mã lỗi (có thể tra trên mạng); phần sau là mô tả. Bốn lỗi trên tương ứng: thiếu thuộc tính bắt buộc, giá trị `"fr"` ngoài union, gán chuỗi vào biến số, gõ sai tên thuộc tính (TS còn gợi ý "Did you mean"). Khi mọi thứ đúng, `tsc` **không in gì** và thoát với mã 0. Sửa bốn dòng cho đúng rồi chạy lại để thấy im lặng.

Trong dự án Playwright, bạn thường thêm script `"typecheck": "tsc --noEmit"` vào `package.json`; starter repo của khoá học này đã có sẵn lệnh `npm run typecheck`.

## Demo code
Dữ liệu test đăng nhập có kiểu chặt, và hàm kiểm tra kết quả. Tạo `demo-du-lieu-co-kieu.ts`:

```ts
// file: demo-du-lieu-co-kieu.ts
type Outcome = "success" | "wrong-password" | "locked";

interface LoginCase {
  title: string;
  email: string;
  password: string;
  attemptsBefore: number;
  expected: Outcome;
}

const cases: LoginCase[] = [
  { title: "đúng mật khẩu", email: "ban@example.com", password: "Passw0rd!", attemptsBefore: 0, expected: "success" },
  { title: "sai mật khẩu", email: "ban@example.com", password: "sai", attemptsBefore: 2, expected: "wrong-password" },
  { title: "sai lần thứ 5", email: "ban@example.com", password: "sai", attemptsBefore: 4, expected: "locked" },
];

// "ứng dụng" giả để chạy được ngay, không cần trình duyệt
function fakeLogin(c: LoginCase): Outcome {
  if (c.password === "Passw0rd!") return "success";
  return c.attemptsBefore + 1 >= 5 ? "locked" : "wrong-password";
}

function runAll(list: LoginCase[]): Record<Outcome, number> {
  const summary: Record<Outcome, number> = { success: 0, "wrong-password": 0, locked: 0 };
  for (const c of list) {
    const actual = fakeLogin(c);
    summary[actual]++;
    console.log(`${actual === c.expected ? "PASS" : "FAIL"} ${c.title}: ${actual}`);
  }
  return summary;
}

console.log(runAll(cases));
```

Điểm đáng chú ý: `Outcome` là union nên gõ `expected: "sucess"` (sai chính tả) sẽ bị báo đỏ; `Record<Outcome, number>` buộc `summary` phải có đủ ba khoá; `LoginCase` bảo đảm mỗi bộ dữ liệu có đầy đủ trường. Kết quả mong đợi:

```text
PASS đúng mật khẩu: success
PASS sai mật khẩu: wrong-password
PASS sai lần thứ 5: locked
{ success: 1, 'wrong-password': 1, locked: 1 }
```

Cấu trúc này chính là dạng bạn sẽ dùng cho kiểm thử theo dữ liệu (bài 4.5): mảng `LoginCase[]` rồi vòng `for...of` sinh test.

## Lỗi thường gặp
- **Triệu chứng:** `Type 'string' is not assignable to type 'number'`. Nguyên nhân: gán giá trị sai kiểu. Cách sửa: kiểm tra kiểu của vế phải (`Number(...)` nếu cần đổi chuỗi sang số).
- **Triệu chứng:** `Property 'x' does not exist on type '...'`. Nguyên nhân: gõ sai tên thuộc tính, hoặc kiểu chưa khai báo thuộc tính đó. Cách sửa: sửa chính tả theo gợi ý "Did you mean", hoặc bổ sung thuộc tính vào `interface`.
- **Triệu chứng:** `'x' is possibly 'undefined'` hoặc `Object is possibly 'null'`. Nguyên nhân: giá trị có thể không tồn tại (thuộc tính `?`, kết quả `find`). Cách sửa: kiểm tra trước (`if (x)`), dùng `?.`, hoặc `??` để đặt giá trị mặc định.
- **Triệu chứng:** `Argument of type '"fr"' is not assignable to parameter of type 'Country'`. Nguyên nhân: giá trị nằm ngoài union. Cách sửa: dùng giá trị hợp lệ, hoặc thêm giá trị mới vào union nếu nghiệp vụ thật sự có.
- **Triệu chứng:** dùng `any` khắp nơi và vẫn gặp lỗi lúc chạy. Nguyên nhân: `any` tắt kiểm tra kiểu. Cách sửa: dùng `unknown` rồi thu hẹp, hoặc khai báo `interface` cho dữ liệu.
- **Triệu chứng:** code sai kiểu nhưng `npx tsx` vẫn chạy được. Nguyên nhân: `tsx` bỏ qua kiểu, chỉ chạy. Cách sửa: chạy `npx tsc --noEmit` (hoặc `npm run typecheck`) trước khi commit.
- **Triệu chứng:** quên kiểu trả về `Promise<...>` của hàm async. Nguyên nhân: hàm có `async` luôn trả `Promise`. Cách sửa: ghi `Promise<void>` hoặc `Promise<string>` (hoặc bỏ qua để TS tự suy luận).

## Tóm tắt
- TypeScript là JavaScript cộng kiểu; kiểu bị xoá lúc chạy, nên chúng chỉ giúp bắt lỗi sớm.
- Để TS tự suy luận khi giá trị đã rõ; ghi kiểu ở tham số hàm, kiểu trả về và dữ liệu đối tượng.
- `interface` và `type` mô tả hình dạng dữ liệu; union và literal type giới hạn giá trị hợp lệ.
- Thuộc tính `?` có thể là `undefined`: kiểm tra, dùng `?.` hoặc `??`.
- Generic nhẹ bạn cần đọc được: `T[]`, `Promise<T>`, `Record<K, V>`.
- Dùng `unknown` thay `any`; chạy `npx tsc --noEmit` để kiểm tra kiểu thật sự.

## Bài tập
1. Khai báo `interface Product { name: string; price: number; qty: number }` và mảng ba sản phẩm của lab giỏ hàng (`/lab/cart`), viết hàm `totalOf(items: Product[]): number`. Xong khi `tsc` không báo lỗi và tổng khớp phép tính tay.
2. Cố ý gán sai kiểu (`const price: number = "450000"`) và gọi hàm thiếu một tham số. Chạy `npx tsc --noEmit` và ghi lại hai thông báo lỗi. Xong khi bạn giải thích được từng thông báo bằng lời của mình.
3. Tạo `type Browser = "chromium" | "firefox" | "webkit"` và hàm `isSupported(b: Browser): boolean`. Xong khi gọi với `"safari"` bị `tsc` báo lỗi nhưng `"webkit"` thì không.
4. Viết `interface LoginCase` có thuộc tính tuỳ chọn `note?: string`; viết hàm in `title` kèm ghi chú nếu có (dùng `??` đặt giá trị mặc định `"không có ghi chú"`). Xong khi hai bộ dữ liệu có và không có `note` đều in đúng.
5. Viết hàm generic `lastOf<T>(items: T[]): T | undefined`. Xong khi `lastOf([1, 2, 3])` trả 3, `lastOf([])` trả `undefined`, và `lastOf(["a"])` được TS hiểu là kiểu `string | undefined` (rê chuột lên kết quả trong VS Code để kiểm tra).
