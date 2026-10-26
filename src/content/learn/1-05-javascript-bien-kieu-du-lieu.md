---
title: JavaScript – biến, kiểu dữ liệu, toán tử
level: 1
order: 5
minutes: 60
summary: Dùng let/const, hiểu các kiểu dữ liệu cơ bản và toán tử so sánh.
keywords: [var let const khác nhau, javascript === vs ==, template literal]
---

## Mục tiêu bài học
- Tạo thư mục thực hành và chạy được một file `.ts` bằng `npx tsx` (và file `.js` bằng `node`).
- Khai báo biến bằng `const` và `let`, giải thích được vì sao không dùng `var`.
- Nhận biết các kiểu dữ liệu cơ bản bằng `typeof` và biết chỗ "bẫy" của `null`, `undefined`, `NaN`.
- Dùng đúng `===`, `&&`, `||`, `!`, `??` và template literal khi viết dữ liệu test và kiểm tra kết quả test.

## Bạn cần chuẩn bị
- Đã cài Node.js LTS và VS Code (bài 0.2). Mở terminal gõ `node -v` phải thấy số phiên bản, ví dụ `v22.12.0` (số của bạn có thể khác).
- Có kết nối Internet ở bước cài `tsx` lần đầu.
- Mọi ví dụ của bài đều chạy **ngoài** dự án Playwright, trong một thư mục thực hành riêng nên bạn không làm hỏng gì.

## Kiến thức cần nắm
- `const` cho giá trị không gán lại, `let` cho giá trị sẽ đổi; tránh `var`.
- Kiểu cơ bản: `string`, `number`, `boolean`, `null`, `undefined`, `object` (mảng và đối tượng).
- So sánh nghiêm ngặt `===`; tránh `==` vì nó tự ép kiểu.
- Toán tử logic `&&`, `||`, `!` và toán tử `??`.
- Template literal: `` `Xin chào ${ten}` ``.

## Giải thích dễ hiểu
**Biến** (variable) là chiếc hộp có dán nhãn. Bạn đặt đồ vào hộp (gán giá trị) rồi gọi đồ ra bằng nhãn (tên biến). `const` là hộp dán kín nhãn: cái nhãn không đổi được sang hộp khác, còn nếu bên trong là một danh sách thì bạn vẫn thêm bớt món trong đó. `let` là hộp cho phép đổi đồ vật bên trong bất cứ lúc nào.

**Kiểu dữ liệu** (data type) là loại đồ trong hộp: chữ, số, đúng/sai. Máy tính xử lý từng loại theo cách khác nhau: cộng hai số cho ra số, nhưng "cộng" hai chuỗi lại là nối chữ.

Vì sao một QA cần học việc này? Vì test automation thực chất là: lưu dữ liệu test vào biến (email, mật khẩu, số lần thử), so sánh kết quả thật với kết quả mong đợi (`===`), và dựng thông báo lỗi dễ đọc (template literal). Nếu so sánh sai kiểu, test có thể xanh khi sản phẩm đang lỗi, tức là test nói dối bạn.

> **Lưu ý:** JavaScript (JS) là ngôn ngữ gốc; TypeScript (TS) là JS cộng thêm hệ thống kiểu (bài 1.9). Playwright của chúng ta viết bằng TS, nhưng mọi thứ trong bài này đều hợp lệ trong cả hai.

## Thực hành từng bước

### Bước 1. Tạo thư mục thực hành
Mục đích: có một chỗ riêng để thử code mà không đụng tới dự án thật.

Mở **PowerShell** (Windows) hoặc **Terminal** (macOS). Lệnh giống nhau ở cả hai hệ điều hành:

```bash
mkdir thuc-hanh-js
cd thuc-hanh-js
```

| Phần | Ý nghĩa |
|------|---------|
| `mkdir thuc-hanh-js` | Tạo (make) thư mục tên `thuc-hanh-js` ở vị trí hiện tại |
| `cd thuc-hanh-js` | Đi vào (change directory) thư mục vừa tạo |

Kết quả mong đợi: không có thông báo gì (lệnh thành công thì im lặng). Dòng nhắc lệnh đổi thành đường dẫn kết thúc bằng `thuc-hanh-js`.

Nếu gặp lỗi: `A subdirectory or file thuc-hanh-js already exists` nghĩa là thư mục đã có, chỉ cần `cd thuc-hanh-js`.

### Bước 2. Khởi tạo và cài `tsx`
Mục đích: cài công cụ cho phép chạy file `.ts` trực tiếp.

```bash
npm init -y
```

`npm init` tạo file `package.json` mô tả dự án; cờ `-y` (yes) trả lời "đồng ý" cho mọi câu hỏi để khỏi phải gõ. Kết quả mong đợi: in ra nội dung `package.json` với `"name": "thuc-hanh-js"`.

```bash
npm install --save-dev tsx typescript @types/node
```

| Phần | Ý nghĩa |
|------|---------|
| `npm install` | Tải gói (package) về thư mục `node_modules` |
| `--save-dev` | Ghi gói vào mục `devDependencies`, tức gói chỉ dùng khi phát triển |
| `tsx` | Chạy file TypeScript trực tiếp, không cần biên dịch riêng |
| `typescript` | Trình biên dịch/kiểm tra kiểu `tsc` (dùng ở bài 1.9) |
| `@types/node` | Khai báo kiểu cho `console`, `process`... của Node |

Kết quả mong đợi: sau vài giây thấy dòng dạng `added 12 packages` (số có thể khác). Nếu lỗi `npm : The term 'npm' is not recognized` thì Node chưa được cài hoặc bạn cần mở lại terminal (xem bài 0.2).

Vì sao chọn `tsx`? Node mới (từ khoảng 22.18) có thể chạy `node file.ts`, nhưng chỉ hỗ trợ một phần cú pháp TypeScript và thông báo lỗi khác nhau theo phiên bản. `tsx` hoạt động ổn định trên mọi Node LTS gần đây, nên bài này dùng nó. Lưu ý quan trọng: **`tsx` chỉ chạy, không kiểm tra kiểu**. Muốn kiểm tra kiểu bạn dùng `npx tsc --noEmit` (bài 1.9).

### Bước 3. Tạo `tsconfig.json`
Mục đích: để VS Code coi mỗi file thực hành là một "module" riêng, tránh báo lỗi đỏ giả khi hai file cùng đặt tên biến `attempts`.

Một file `.ts` không có `import` hay `export` bị TypeScript coi là script toàn cục, nên mọi biến của các file trong thư mục dùng chung một phạm vi và báo `Cannot redeclare block-scoped variable`. Tạo file `tsconfig.json` (trong VS Code: chuột phải trong khung Explorer, chọn New File) với nội dung:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "moduleDetection": "force",
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["node"]
  }
}
```

| Khoá | Ý nghĩa |
|------|---------|
| `target`, `module`, `moduleResolution` | Chọn chuẩn JS hiện đại, giống cấu hình của Playwright |
| `strict` | Bật kiểm tra kiểu chặt, tập thói quen tốt |
| `moduleDetection: "force"` | Coi mọi file là module riêng, giải quyết lỗi trùng tên biến |
| `noEmit` | `tsc` chỉ kiểm tra, không sinh file `.js` |
| `types: ["node"]` | Nạp kiểu của Node để `console` được nhận diện |

Kết quả mong đợi: các dòng đỏ `Cannot redeclare block-scoped variable` biến mất. Một số dòng đỏ còn lại ở các bước sau là **cố ý**: TypeScript đang cảnh báo đúng chỗ bạn đang thử một cái bẫy của JavaScript (ví dụ so sánh `5 === "5"`). `tsx` vẫn chạy được các file đó.

### Bước 4. File đầu tiên: `const` và `let`
Mục đích: thấy rõ khác biệt giữa hộp "đổi được" và "không đổi được".

Trong VS Code, mở thư mục này (`code .`) và tạo file `b3-const-let.ts` với nội dung:

```ts
// file: b3-const-let.ts
const baseUrl = "/lab/login";      // địa chỉ trang, không bao giờ đổi
let attempts = 0;                  // số lần đã thử đăng nhập, sẽ tăng dần

attempts = attempts + 1;           // gán lại giá trị mới cho let: hợp lệ
attempts += 1;                     // viết gọn của dòng trên

console.log(baseUrl);
console.log(attempts);
```

| Dòng | Giải thích |
|------|------------|
| `const baseUrl = "/lab/login";` | Khai báo hộp không đổi, bên trong là chuỗi (chữ). Dấu `;` kết thúc câu lệnh |
| `let attempts = 0;` | Khai báo hộp đổi được, bên trong là số 0 |
| `attempts = attempts + 1;` | Lấy giá trị cũ, cộng 1, rồi cất lại vào chính hộp đó |
| `attempts += 1;` | Cách viết ngắn của `attempts = attempts + 1` |
| `console.log(...)` | In giá trị ra terminal, công cụ gỡ lỗi quen thuộc nhất |
| `// ...` | Chú thích, máy bỏ qua |

Chạy file:

```bash
npx tsx b3-const-let.ts
```

`npx tsx <file>` nghĩa là chạy chương trình `tsx` đã cài trong dự án, truyền vào tên file. Kết quả mong đợi:

```text
/lab/login
2
```

Giải thích: `attempts` bắt đầu 0, tăng 1 hai lần nên thành 2.

Thử thêm để thấy lỗi: thêm dòng `baseUrl = "/lab/other";` vào cuối file rồi chạy lại.

```ts
// demo-error: b3-loi.ts
const baseUrl = "/lab/login";
baseUrl = "/lab/other";
```

Bạn sẽ thấy thông báo gần giống:

```text
TypeError: Assignment to constant variable.
```

Đó là cách JavaScript bảo vệ bạn: thứ đã khai báo `const` không được gán lại. Xoá dòng thử nghiệm đi. Quy tắc nên nhớ: **mặc định dùng `const`; chỉ đổi sang `let` khi thật sự cần gán lại**. Còn `var` là cú pháp cũ có phạm vi (scope) khó đoán, người mới nên không dùng.

### Bước 5. Các kiểu dữ liệu và `typeof`
Mục đích: biết giá trị đang thuộc loại nào, nhất là những chỗ dễ nhầm.

Tạo `b4-kieu.ts`:

```ts
// file: b4-kieu.ts
const email = "ban@example.com";   // string
const age = 25;                    // number
const price = 199.5;               // number (không phân biệt số nguyên và số thập phân)
const isLocked = false;            // boolean
const nothing = null;              // null: chủ động "không có gì"
let notSet;                        // chưa gán gì, tự động là undefined
const user = { email, age };       // object
const tags = ["smoke", "login"];   // array (cũng là một object)

console.log(typeof email);
console.log(typeof age);
console.log(typeof price);
console.log(typeof isLocked);
console.log(typeof nothing);
console.log(typeof notSet);
console.log(typeof user);
console.log(typeof tags);
console.log(Array.isArray(tags));
```

`typeof x` trả về tên kiểu của `x` dưới dạng chuỗi. `Array.isArray(x)` trả `true` nếu `x` là mảng. Chạy `npx tsx b4-kieu.ts`, kết quả mong đợi:

```text
string
number
number
boolean
object
undefined
object
object
true
```

Hai điều ngạc nhiên cần nhớ:
- `typeof null` trả về `"object"`. Đây là lỗi lịch sử của JavaScript và không bao giờ được sửa. Muốn kiểm tra null phải viết `x === null`.
- `typeof` của mảng cũng là `"object"`; muốn biết có phải mảng, dùng `Array.isArray`.

Phân biệt `null` và `undefined`: `undefined` là "hộp chưa có gì, chưa ai bỏ vào"; `null` là "có người cố ý để hộp rỗng". Khi test API, trường `"middleName": null` khác hoàn toàn với việc thiếu hẳn trường `middleName`.

### Bước 6. Toán tử số học và bẫy ép kiểu
Mục đích: tránh sai số khi tính tiền và khi lấy chữ từ giao diện (luôn là chuỗi).

Tạo `b5-toan-tu.ts` (VS Code có thể gạch đỏ dòng `"10" - 5`: đó là cảnh báo cố ý của TypeScript):

```ts
// file: b5-toan-tu.ts
console.log(7 + 3);            // cộng
console.log(7 % 3);            // chia lấy dư
console.log(2 ** 10);          // luỹ thừa
console.log("10" + 5);         // chuỗi + số: nối chuỗi
console.log("10" - 5);         // chuỗi - số: chuyển "10" thành số rồi trừ
console.log(Number("10") + 5); // chuyển rõ ràng bằng Number()
console.log(Number("abc"));    // không chuyển được
console.log(0.1 + 0.2);        // sai số số thực
console.log((0.1 + 0.2).toFixed(2));
```

Chạy `npx tsx b5-toan-tu.ts`, kết quả mong đợi:

```text
10
1
1024
105
5
15
NaN
0.30000000000000004
0.30
```

| Dòng | Giải thích |
|------|------------|
| `"10" + 5` ra `105` | Có một vế là chuỗi nên `+` thành **nối chuỗi**, không phải cộng |
| `"10" - 5` ra `5` | Phép trừ không áp dụng cho chuỗi nên JS tự đổi `"10"` thành số 10 |
| `Number("abc")` ra `NaN` | `NaN` (Not a Number) là "không phải số". Nó là kiểu `number` nhưng khác mọi giá trị, kể cả chính nó |
| `0.1 + 0.2` | Máy lưu số thực dạng nhị phân nên có sai số nhỏ. Khi so sánh tiền, hãy làm tròn hoặc tính bằng đơn vị nhỏ nhất (đồng) |
| `toFixed(2)` | Làm tròn và trả về **chuỗi** có 2 chữ số thập phân |

Liên hệ test: `await page.getByTestId("total").textContent()` luôn trả về chuỗi như `"450000"`. Muốn so với số, bạn phải `Number(...)` trước.

### Bước 7. So sánh `===` và `==`
Mục đích: viết phép so sánh không bị ép kiểu ngầm.

Tạo `b6-so-sanh.ts`:

```ts
// file: b6-so-sanh.ts
console.log(5 === 5);        // cùng kiểu, cùng giá trị
console.log(5 === "5");      // khác kiểu
console.log(5 == "5");       // == ép kiểu rồi mới so
console.log(0 == "");        // bẫy
console.log(null == undefined);
console.log(null === undefined);
console.log(NaN === NaN);    // NaN không bằng chính nó
console.log(Number.isNaN(NaN));
console.log(5 !== 6);        // khác nghiêm ngặt
console.log(18 >= 18);       // lớn hơn hoặc bằng
```

Nếu VS Code gạch đỏ dưới `5 === "5"` kèm cảnh báo "This comparison appears to be unintentional", đó là TypeScript cảnh báo đúng chỗ bạn đang thử; `tsx` vẫn chạy bình thường. Kết quả mong đợi khi chạy `npx tsx b6-so-sanh.ts`:

```text
true
false
true
true
true
false
false
true
true
true
```

Quy tắc: **luôn dùng `===` và `!==`**. `==` chỉ tạo ra các kết quả khó đoán như `0 == ""` là `true`. Riêng kiểm tra `NaN`, dùng `Number.isNaN(x)` vì `NaN === NaN` là `false`.

Trong assertion của Playwright, `expect(a).toBe(b)` hoạt động giống `===` (dùng `Object.is`), nên cùng một tư duy: `expect(5).toBe("5")` sẽ thất bại.

### Bước 8. Toán tử logic, truthy/falsy và `??`
Mục đích: ghép nhiều điều kiện và đặt giá trị mặc định. Tên file `b7-logic.ts` chỉ là gợi ý (số trong tên không trùng số bước). VS Code có thể gạch đỏ dòng dùng `??` với chuỗi rỗng vì TypeScript biết vế trái không bao giờ là `null`; đó là cảnh báo cố ý.

Tạo `b7-logic.ts`:

```ts
// file: b7-logic.ts
const attempts = 5;
const isAdmin = false;

console.log(attempts >= 5 && !isAdmin);   // và: cả hai vế đúng
console.log(attempts >= 5 || isAdmin);    // hoặc: một vế đúng là đủ
console.log(!isAdmin);                    // phủ định: đảo đúng/sai

const nameFromUi = "";
console.log(nameFromUi || "Khách");       // || dùng giá trị phải nếu vế trái là falsy
console.log(nameFromUi ?? "Khách");       // ?? chỉ dùng giá trị phải nếu vế trái là null/undefined
console.log(0 || 10);
console.log(0 ?? 10);

console.log(Boolean(""));
console.log(Boolean("0"));
console.log(Boolean([]));
```

Kết quả mong đợi:

```text
true
true
true
Khách

10
0
false
true
true
```

Dòng thứ 5 trong kết quả là một dòng trống: `nameFromUi ?? "Khách"` giữ nguyên chuỗi rỗng `""`, và `console.log("")` in ra dòng trống.

**Falsy** là các giá trị bị coi là "sai" khi đặt vào điều kiện: `false`, `0`, `""`, `null`, `undefined`, `NaN`. Mọi giá trị còn lại là **truthy**, kể cả `"0"` và mảng rỗng `[]`. Vì vậy `||` có thể "ăn" mất số 0 hợp lệ, còn `??` thì giữ lại. Khi dùng giá trị mặc định cho số lượng hay tiền, hãy ưu tiên `??`.

### Bước 9. Template literal
Mục đích: dựng chuỗi có chèn biến, thay cho cách nối bằng dấu `+`.

Tạo `b8-template.ts`:

```ts
// file: b8-template.ts
const email = "ban@example.com";
const attempts = 3;
const maxAttempts = 5;

const cu = "Tài khoản " + email + " đã thử " + attempts + " lần";
const moi = `Tài khoản ${email} đã thử ${attempts}/${maxAttempts} lần`;
const conLai = `Còn lại ${maxAttempts - attempts} lần thử`;

console.log(cu);
console.log(moi);
console.log(conLai);
console.log(`Dòng 1
Dòng 2`);
```

Template literal dùng **dấu huyền** (backtick `` ` ``, phím bên trái số 1) chứ không phải dấu nháy đơn. Trong `${...}` bạn có thể đặt bất kỳ biểu thức nào. Kết quả mong đợi:

```text
Tài khoản ban@example.com đã thử 3 lần
Tài khoản ban@example.com đã thử 3/5 lần
Còn lại 2 lần thử
Dòng 1
Dòng 2
```

Nếu gặp lỗi: in ra nguyên văn `${email}` nghĩa là bạn đã dùng nháy đơn hoặc nháy kép thay vì dấu huyền.

## Demo code
Ví dụ gắn với test: kiểm tra kết quả đăng nhập trên lab và dựng thông báo cho báo cáo test. Tạo `demo-ket-qua-test.ts`:

```ts
// file: demo-ket-qua-test.ts
const baseUrl = "/lab/login";
const email = "ban@example.com";
let attempts = 0;
const maxAttempts = 5;

// giả lập chữ lấy từ trang web: luôn là chuỗi
const attemptsText = "3";
attempts = Number(attemptsText);

const isLocked = attempts >= maxAttempts;
const expected = false;

const message = `Trang ${baseUrl}: ${email} thử ${attempts}/${maxAttempts}, khoá=${isLocked}`;
console.log(message);

// so sánh kết quả thật với kết quả mong đợi
if (isLocked === expected) {
  console.log("PASS: trạng thái khoá đúng như mong đợi");
} else {
  console.log("FAIL: mong đợi " + expected + " nhưng nhận " + isLocked);
}

console.log(typeof attemptsText === "string");
console.log(typeof attempts === "number");
```

Giải thích: `attemptsText` mô phỏng chuỗi lấy từ giao diện; ta đổi sang số bằng `Number`, tính `isLocked`, dựng thông báo bằng template literal, rồi so sánh bằng `===`. Hai dòng cuối xác nhận `attemptsText` là chuỗi còn `attempts` đã là số.

Chạy `npx tsx demo-ket-qua-test.ts`, kết quả mong đợi:

```text
Trang /lab/login: ban@example.com thử 3/5, khoá=false
PASS: trạng thái khoá đúng như mong đợi
true
true
```

## Lỗi thường gặp
- **Triệu chứng:** `TypeError: Assignment to constant variable.` Nguyên nhân: gán lại cho biến `const`. Cách sửa: nếu thật sự cần đổi giá trị thì khai báo bằng `let`.
- **Triệu chứng:** `ReferenceError: attempts is not defined`. Nguyên nhân: gõ sai tên biến (JS phân biệt hoa thường: `Attempts` khác `attempts`) hoặc dùng biến trước khi khai báo. Cách sửa: kiểm tra chính tả và thứ tự dòng.
- **Triệu chứng:** kết quả `"10" + 5` ra `105` thay vì `15`. Nguyên nhân: một vế là chuỗi nên `+` nối chuỗi. Cách sửa: `Number("10") + 5`.
- **Triệu chứng:** `0 == ""` là `true`, test xanh một cách vô lý. Nguyên nhân: `==` tự ép kiểu. Cách sửa: luôn dùng `===`.
- **Triệu chứng:** `typeof null` ra `"object"` nên điều kiện kiểm tra sai. Nguyên nhân: lỗi lịch sử của JS. Cách sửa: kiểm tra `x === null` riêng.
- **Triệu chứng:** `0 || 10` ra `10`, làm mất số 0 hợp lệ. Nguyên nhân: `0` là falsy. Cách sửa: dùng `0 ?? 10`.
- **Triệu chứng:** `npx tsx` báo `could not determine executable to run`. Nguyên nhân: chưa cài `tsx` hoặc đang đứng sai thư mục. Cách sửa: `cd` vào `thuc-hanh-js` rồi chạy lại `npm install --save-dev tsx`.

## Tóm tắt
- Mặc định dùng `const`, chỉ dùng `let` khi cần gán lại, bỏ hẳn `var`.
- Các kiểu cơ bản: `string`, `number`, `boolean`, `null`, `undefined`, `object`; `typeof null` là `"object"` do lỗi lịch sử.
- Dữ liệu đọc từ giao diện luôn là chuỗi, cần `Number(...)` trước khi tính toán.
- Luôn dùng `===` và `!==`; dùng `??` để đặt giá trị mặc định khi `0` hoặc `""` là hợp lệ.
- Template literal bằng dấu huyền giúp dựng thông báo test gọn và dễ đọc.
- `npx tsx file.ts` chạy TypeScript, nhưng không kiểm tra kiểu.

## Bài tập
1. Tạo `bt1.ts` với các biến `email`, `password`, `attempts`, rồi in dòng `ban@example.com đã thử 2 lần` bằng template literal. Xong khi in ra đúng dòng đó và không dùng dấu `+` để nối chuỗi.
2. Không chạy máy trước, dự đoán kết quả của `"10" + 5`, `"10" - 5`, `"10" === 10`, `"5" * "2"`. Ghi dự đoán ra giấy rồi chạy để đối chiếu. Xong khi bạn giải thích được vì sao từng dòng ra kết quả như vậy.
3. Viết hàm kiểm tra nhỏ bằng biến: cho `total = "450000"` (chuỗi), chuyển sang số, so với `450000` bằng `===`, in `PASS` hoặc `FAIL`. Xong khi in `PASS`, và in `FAIL` nếu bạn quên bước chuyển sang số.
4. Cho `quantity = 0`. Dùng `||` và `??` để đặt mặc định là 1 khi thiếu số lượng. Xong khi bạn chỉ ra được cách nào làm mất giá trị 0 hợp lệ và giải thích bằng khái niệm falsy.
