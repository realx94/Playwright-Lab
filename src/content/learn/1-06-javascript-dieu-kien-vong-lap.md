---
title: JavaScript – điều kiện và vòng lặp
level: 1
order: 6
minutes: 60
summary: Rẽ nhánh bằng if/else, switch và lặp bằng for, while, for...of.
keywords: [for of vs forEach, switch case javascript, truthy falsy]
---

## Mục tiêu bài học
- Viết được `if / else if / else` và `switch` để rẽ nhánh theo dữ liệu test.
- Dùng `for`, `while`, `for...of` để duyệt danh sách và biết khi nào chọn vòng nào.
- Dùng `break` và `continue` để dừng hoặc bỏ qua một lượt lặp.
- Từ một mảng dữ liệu, hiểu cách Playwright sinh ra nhiều test bằng vòng lặp.

## Bạn cần chuẩn bị
- Đã làm bài 1.5: có thư mục `thuc-hanh-js` đã cài `tsx` và có `tsconfig.json` (nếu chưa, xem bước 1 đến 3 của bài 1.5).
- Terminal đang đứng trong thư mục `thuc-hanh-js`. Mỗi bước dưới đây tạo một file mới rồi chạy bằng `npx tsx <tên file>`.

## Kiến thức cần nắm
- `if / else if / else`: chọn đúng một nhánh đầu tiên có điều kiện đúng.
- `switch / case / break / default`: chọn nhánh theo một giá trị cụ thể.
- Vòng lặp: `for` (biết trước số lần), `while` (lặp tới khi hết điều kiện), `for...of` (duyệt từng phần tử).
- `break` thoát hẳn vòng lặp; `continue` bỏ qua lượt hiện tại.
- Truthy / falsy: cách JS coi một giá trị là đúng hay sai trong điều kiện (nhắc ở bài 1.5).

## Giải thích dễ hiểu
Hãy nghĩ đến bảo vệ toà nhà. Điều kiện (`if`) là câu hỏi bảo vệ đặt ra: "Có thẻ nhân viên không? Có thì cho vào, không thì mời ra quầy khách". Mỗi câu hỏi có đáp án đúng hoặc sai và dẫn đến một hướng đi. Vòng lặp (`loop`) là việc bảo vệ lặp lại cùng một quy trình kiểm tra cho từng người trong hàng, đến khi hết người thì dừng.

Trong automation, bạn gặp hai việc này mỗi ngày. Điều kiện: "nếu trạng thái là `Locked` thì mong đợi thông báo khoá tài khoản". Vòng lặp: "chạy cùng một kịch bản đăng nhập với 10 bộ dữ liệu khác nhau". Nếu không có vòng lặp, bạn phải copy-paste 10 lần, và mỗi lần sửa lỗi phải sửa 10 chỗ.

Một điểm cần lưu ý: **điều kiện** dựa trên giá trị **boolean** (đúng/sai). JS cho phép đặt giá trị bất kỳ vào điều kiện và tự coi nó là truthy hoặc falsy, nhưng nếu bạn chưa quen, hãy viết điều kiện tường minh như `attempts >= 5` thay vì chỉ `attempts`.

## Thực hành từng bước

### Bước 1. `if / else if / else`
Mục đích: chọn một trong nhiều nhánh theo giá trị.

Tạo file `b1-if.ts`:

```ts
// file: b1-if.ts
const attempts = 5;
const maxAttempts = 5;

if (attempts >= maxAttempts) {
  console.log("Tài khoản bị khoá");
} else if (attempts >= 3) {
  console.log("Cảnh báo: sắp bị khoá");
} else {
  console.log("Đăng nhập bình thường");
}

console.log("Kết thúc kiểm tra");
```

| Dòng | Giải thích |
|------|------------|
| `if (attempts >= maxAttempts) { ... }` | Nếu điều kiện trong ngoặc tròn đúng thì chạy khối trong ngoặc nhọn |
| `else if (attempts >= 3) { ... }` | Chỉ được xét khi điều kiện trước sai |
| `else { ... }` | Nhánh cuối, chạy khi mọi điều kiện trên đều sai |
| `console.log("Kết thúc kiểm tra")` | Nằm ngoài khối nên luôn chạy |

Chạy `npx tsx b1-if.ts`. Kết quả mong đợi:

```text
Tài khoản bị khoá
Kết thúc kiểm tra
```

Chỉ **một** nhánh được chạy dù `attempts >= 3` cũng đúng, vì nhánh đầu đã khớp trước. Thứ tự các nhánh vì vậy rất quan trọng: đặt điều kiện cụ thể nhất lên trước. Thử đổi `attempts` thành `3`, rồi thành `1`, chạy lại và quan sát nhánh thay đổi (mong đợi lần lượt `Cảnh báo: sắp bị khoá` và `Đăng nhập bình thường`).

### Bước 2. Điều kiện ghép và toán tử ba ngôi
Mục đích: kết hợp nhiều điều kiện và chọn nhanh giữa hai giá trị.

Tạo `b2-ghep.ts`:

```ts
// file: b2-ghep.ts
const age = 20;
const hasCoupon = true;

if (age >= 18 && age <= 65) {
  console.log("Tuổi hợp lệ để đăng ký");
}

if (age < 18 || hasCoupon) {
  console.log("Được giảm giá");
}

const label = age >= 18 ? "người lớn" : "trẻ em";
console.log(`Nhóm tuổi: ${label}`);
```

- `&&` yêu cầu cả hai vế đúng; `||` chỉ cần một vế đúng (xem bài 1.5).
- `điều_kiện ? A : B` là **toán tử ba ngôi** (ternary): nếu điều kiện đúng thì lấy `A`, ngược lại lấy `B`. Dùng cho trường hợp đơn giản; việc phức tạp hãy dùng `if`.
- `age >= 18 && age <= 65` là cách viết một khoảng. Đây chính là cách bạn kiểm tra biên của giá trị khi học thiết kế test ở Level 3.

Kết quả mong đợi khi chạy `npx tsx b2-ghep.ts`:

```text
Tuổi hợp lệ để đăng ký
Được giảm giá
Nhóm tuổi: người lớn
```

### Bước 3. `switch`
Mục đích: chọn nhánh theo một giá trị cụ thể, gọn hơn nhiều `else if`.

Tạo `b3-switch.ts`:

```ts
// file: b3-switch.ts
const status: string = "Locked";

switch (status) {
  case "Active":
    console.log("Mong đợi: vào được dashboard");
    break;
  case "Locked":
    console.log("Mong đợi: thấy thông báo khoá");
    break;
  case "Pending":
  case "Disabled":
    console.log("Mong đợi: thấy thông báo chưa kích hoạt");
    break;
  default:
    console.log("Trạng thái lạ: " + status);
}
```

| Phần | Ý nghĩa |
|------|---------|
| `switch (status)` | So sánh `status` với từng `case` bằng `===` |
| `case "Locked":` | Nhánh khớp khi `status === "Locked"` |
| `break;` | Thoát khỏi `switch`. Thiếu `break`, JS chạy tiếp xuống `case` kế tiếp (gọi là fall-through) |
| `case "Pending": case "Disabled":` | Hai `case` liền nhau dùng chung một khối lệnh |
| `default:` | Chạy khi không `case` nào khớp |

Kết quả mong đợi:

```text
Mong đợi: thấy thông báo khoá
```

Thử xoá dòng `break;` của `case "Locked"` rồi chạy lại: bạn sẽ thấy dòng của `Pending/Disabled` cũng được in, đó là fall-through. Cho nên mỗi `case` thường kết thúc bằng `break`.

### Bước 4. Vòng lặp `for`
Mục đích: lặp một số lần đã biết hoặc đi theo chỉ số.

Tạo `b4-for.ts`:

```ts
// file: b4-for.ts
for (let i = 1; i <= 3; i++) {
  console.log(`Lần thử đăng nhập thứ ${i}`);
}

const emails = ["a@example.com", "b@example.com", "c@example.com"];
for (let i = 0; i < emails.length; i++) {
  console.log(`Chỉ số ${i}: ${emails[i]}`);
}
```

Ba phần trong ngoặc của `for`, ngăn bằng dấu `;`:

| Phần | Ý nghĩa |
|------|---------|
| `let i = 1` | Khởi tạo: chạy một lần trước vòng lặp |
| `i <= 3` | Điều kiện: kiểm tra trước mỗi lượt, sai thì dừng |
| `i++` | Bước nhảy: chạy sau mỗi lượt, tăng `i` thêm 1 |

Mảng đánh chỉ số từ **0**, nên vòng thứ hai dùng `i < emails.length` (không phải `<=`). Kết quả mong đợi:

```text
Lần thử đăng nhập thứ 1
Lần thử đăng nhập thứ 2
Lần thử đăng nhập thứ 3
Chỉ số 0: a@example.com
Chỉ số 1: b@example.com
Chỉ số 2: c@example.com
```

### Bước 5. Vòng lặp `while`
Mục đích: lặp khi chưa đạt điều kiện, không biết trước bao nhiêu lần (ví dụ thử lại tới khi thành công).

Tạo `b5-while.ts`:

```ts
// file: b5-while.ts
let attempts = 0;
const maxAttempts = 5;

while (attempts < maxAttempts) {
  attempts++;
  console.log(`Thử lần ${attempts}`);
}

console.log(`Dừng sau ${attempts} lần`);
```

`while (điều kiện)` kiểm tra điều kiện trước mỗi lượt; đúng thì chạy thân vòng lặp. **Phải có thứ làm điều kiện cuối cùng thành sai** (ở đây là `attempts++`), nếu không bạn có vòng lặp vô hạn, treo terminal. Khi bị treo, bấm `Ctrl + C` để dừng.

Kết quả mong đợi:

```text
Thử lần 1
Thử lần 2
Thử lần 3
Thử lần 4
Thử lần 5
Dừng sau 5 lần
```

### Bước 6. Vòng lặp `for...of`
Mục đích: duyệt từng phần tử của mảng, cách đọc dễ nhất và hay dùng nhất trong test.

Tạo `b6-for-of.ts`:

```ts
// file: b6-for-of.ts
const testCases = [
  { name: "Đúng mật khẩu", password: "Passw0rd!", expected: "dashboard" },
  { name: "Sai mật khẩu", password: "sai", expected: "lỗi" },
  { name: "Để trống", password: "", expected: "lỗi" },
];

for (const tc of testCases) {
  console.log(`${tc.name} -> mong đợi ${tc.expected}`);
}

for (const [index, tc] of testCases.entries()) {
  console.log(`#${index + 1}: ${tc.name}`);
}
```

- `for (const tc of testCases)` lấy lần lượt từng phần tử gán vào `tc`. Dùng `const` vì mỗi lượt là một biến mới.
- `testCases.entries()` trả về cặp `[chỉ số, phần tử]`; dấu `[index, tc]` là destructuring (bài 1.7) để tách hai giá trị.

Kết quả mong đợi:

```text
Đúng mật khẩu -> mong đợi dashboard
Sai mật khẩu -> mong đợi lỗi
Để trống -> mong đợi lỗi
#1: Đúng mật khẩu
#2: Sai mật khẩu
#3: Để trống
```

Lưu ý: `for...of` (có `of`) duyệt **giá trị**. Còn `for...in` duyệt **tên khoá**, dễ gây nhầm trên mảng; người mới nên tránh `for...in`.

### Bước 7. `break` và `continue`
Mục đích: kiểm soát vòng lặp khi đã tìm thấy kết quả hoặc muốn bỏ qua một số phần tử.

Tạo `b7-break-continue.ts`:

```ts
// file: b7-break-continue.ts
const rows = ["Nguyễn A", "", "Trần B", "Lê C"];

for (const name of rows) {
  if (name === "") {
    console.log("Bỏ qua dòng trống");
    continue;
  }
  console.log(`Xử lý ${name}`);
  if (name === "Trần B") {
    console.log("Đã tìm thấy Trần B, dừng");
    break;
  }
}
```

- `continue`: bỏ phần còn lại của lượt này, nhảy sang phần tử kế tiếp.
- `break`: thoát hẳn khỏi vòng lặp.

Kết quả mong đợi:

```text
Xử lý Nguyễn A
Bỏ qua dòng trống
Xử lý Trần B
Đã tìm thấy Trần B, dừng
```

`Lê C` không bao giờ được xử lý vì `break` đã dừng vòng lặp.

### Bước 8. `forEach` so với `for...of`
Mục đích: biết vì sao tài liệu Playwright dùng `for...of` khi có `await` bên trong.

Tạo `b8-foreach.ts`:

```ts
// file: b8-foreach.ts
const users = ["a@example.com", "b@example.com"];

users.forEach((email, i) => {
  console.log(`forEach ${i}: ${email}`);
});

for (const email of users) {
  console.log(`for-of: ${email}`);
}
```

Kết quả mong đợi:

```text
forEach 0: a@example.com
forEach 1: b@example.com
for-of: a@example.com
for-of: b@example.com
```

Với code đồng bộ thế này, cả hai cho cùng kết quả. Khác biệt xuất hiện khi bên trong có `await` (bài 1.10): `forEach` **không chờ** hàm bên trong, còn `for...of` thì chờ từng lượt xong mới sang lượt sau. Vì vậy trong test, nếu mỗi phần tử cần `await page.click(...)`, hãy dùng `for...of`.

## Demo code
Mô phỏng cách Playwright sinh nhiều test từ một mảng dữ liệu. Chưa cần trình duyệt: ta chỉ dựng danh sách "test" bằng vòng lặp rồi chạy các kiểm tra giả. Tạo `demo-du-lieu-test.ts`:

```ts
// file: demo-du-lieu-test.ts
type Case = { name: string; attempts: number; expectLocked: boolean };

const cases: Case[] = [
  { name: "thử 4 lần", attempts: 4, expectLocked: false },
  { name: "thử 5 lần", attempts: 5, expectLocked: true },
  { name: "thử 6 lần", attempts: 6, expectLocked: true },
];

const maxAttempts = 5;
let passed = 0;

for (const c of cases) {
  // đây là "ứng dụng" giả: khoá khi số lần thử đạt ngưỡng
  const actualLocked = c.attempts >= maxAttempts;

  if (actualLocked === c.expectLocked) {
    passed++;
    console.log(`PASS  ${c.name}`);
  } else {
    console.log(`FAIL  ${c.name}: mong đợi ${c.expectLocked}, thực tế ${actualLocked}`);
  }
}

console.log(`Kết quả: ${passed}/${cases.length} test đạt`);
```

Đoạn `type Case = {...}` là kiểu TypeScript (bài 1.9): mô tả mỗi bộ dữ liệu có `name`, `attempts`, `expectLocked`. Phần còn lại là `for...of` đã học. Kết quả mong đợi:

```text
PASS  thử 4 lần
PASS  thử 5 lần
PASS  thử 6 lần
Kết quả: 3/3 test đạt
```

Trong Playwright thật, cùng ý tưởng này trông như sau (chỉ để bạn nhận ra, bài 4.5 sẽ làm kỹ). Mỗi lượt của vòng lặp **đăng ký một test** với tên riêng:

```ts
import { test } from "@playwright/test";

const cases = [
  { name: "thử 4 lần", attempts: 4, expectLocked: false },
  { name: "thử 5 lần", attempts: 5, expectLocked: true },
];

for (const c of cases) {
  test(`khoá tài khoản: ${c.name}`, async ({ page }) => {
    // dùng c.attempts và c.expectLocked để thao tác và kiểm tra
  });
}
```

## Lỗi thường gặp
- **Triệu chứng:** terminal treo, không dừng. Nguyên nhân: vòng `while` hoặc `for` có điều kiện không bao giờ sai (quên `attempts++`, hoặc `i--` thay vì `i++`). Cách sửa: bấm `Ctrl + C`, rồi kiểm tra biến điều kiện có thay đổi trong thân vòng lặp không.
- **Triệu chứng:** mảng 3 phần tử nhưng in ra thêm dòng `undefined`. Nguyên nhân: dùng `i <= emails.length` thay vì `i < emails.length`, nên đọc quá cuối mảng. Cách sửa: dùng `<`, hoặc đơn giản hơn là `for...of`.
- **Triệu chứng:** nhiều nhánh `case` cùng chạy. Nguyên nhân: thiếu `break` trong `switch` (fall-through). Cách sửa: thêm `break;` cuối mỗi `case`.
- **Triệu chứng:** `SyntaxError: Unexpected token` ở dòng `else`. Nguyên nhân: thiếu hoặc thừa ngoặc nhọn `}`. Cách sửa: đếm cặp `{` `}`, dùng VS Code để chú ý cặp ngoặc đang tô sáng.
- **Triệu chứng:** điều kiện `if (x = 5)` luôn đúng. Nguyên nhân: dùng `=` (gán) thay vì `===` (so sánh). Cách sửa: viết `if (x === 5)`.
- **Triệu chứng:** test trong `forEach` chạy lộn xộn hoặc không chờ. Nguyên nhân: `forEach` không chờ `await` bên trong. Cách sửa: dùng `for...of` (bài 1.10).

## Tóm tắt
- `if / else if / else` chỉ chạy nhánh đầu tiên có điều kiện đúng, nên thứ tự các nhánh rất quan trọng.
- `switch` so sánh bằng `===` và cần `break` để tránh fall-through; `default` bắt trường hợp còn lại.
- `for` dùng khi cần chỉ số, `while` khi chưa biết số lần, `for...of` là lựa chọn mặc định để duyệt mảng.
- `break` thoát vòng lặp, `continue` bỏ qua lượt hiện tại.
- Một mảng dữ liệu cộng với vòng `for...of` chính là cách sinh nhiều test từ một kịch bản.
- Bên trong vòng lặp có `await`, dùng `for...of`, không dùng `forEach`.

## Bài tập
1. Viết `bt1.ts` nhận `score` (0 đến 100) và in `Giỏi` nếu từ 80, `Khá` nếu từ 65, `Trung bình` nếu từ 50, còn lại `Yếu`. Xong khi thử `score` bằng 49, 50, 64, 65, 79, 80 đều in đúng nhãn (đây cũng là các giá trị biên).
2. Viết `bt2.ts` dùng `switch` đổi mã trạng thái HTTP `200`, `401`, `404`, `500` thành câu mô tả; mã khác in `Không rõ`. Xong khi cả năm trường hợp in đúng và không bị fall-through.
3. Viết `bt3.ts` có mảng 5 email, trong đó có một email rỗng. Dùng `for...of` in từng email hợp lệ, bỏ qua email rỗng bằng `continue`, và dừng khi gặp email có đuôi `@blocked.dev` bằng `break`. Xong khi kết quả in đúng các email trước email bị chặn.
4. Viết `bt4.ts` mô phỏng đăng nhập: `while` thử mật khẩu từ danh sách `["sai1", "sai2", "Passw0rd!"]` cho đến khi gặp mật khẩu đúng hoặc hết danh sách, in số lần đã thử. Xong khi in `Thành công sau 3 lần thử`.
