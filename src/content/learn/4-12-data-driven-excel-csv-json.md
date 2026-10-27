---
title: Test theo dữ liệu từ Excel, CSV và JSON
level: 4
order: 12
minutes: 80
summary: Đọc dữ liệu test từ file Excel (exceljs), CSV (csv-parse) và JSON, chuyển thành kiểu TypeScript rõ ràng, sinh test động với tên duy nhất, lọc theo môi trường và cờ bật tắt, xử lý ô rỗng, ngày, số và các lỗi thường gặp.
keywords: [data driven testing playwright, đọc file excel exceljs, csv-parse, test từ file csv, dữ liệu test theo môi trường, playwright generate tests from data]
---

## Mục tiêu bài học
- Đọc dữ liệu test từ ba nguồn: file `.xlsx` bằng `exceljs`, file `.csv` bằng `csv-parse`, file `.json`; đưa cả ba về cùng một dạng "dòng thô" rồi chuyển thành kiểu TypeScript có kiểm tra.
- Sinh test động bằng vòng lặp, mỗi dòng dữ liệu thành một test riêng có **tên duy nhất** và thẻ ưu tiên.
- Lọc dòng theo cờ `enabled`, theo môi trường (`dev`, `qa`) và theo độ ưu tiên mà không sửa code.
- Xử lý ô rỗng, ngày, số, ô công thức của Excel; nhận ra và sửa các lỗi hay gặp về mã hoá, dấu phẩy trong ô và đường dẫn tương đối.

## Bạn cần chuẩn bị
- Đã học bài 4.4 (biến môi trường và config), 4.5 (data-driven cơ bản với mảng, JSON và CSV tự đọc) và 4.11 (global setup). Bài này **tiếp nối** 4.5: dùng thư viện thật cho CSV và Excel.
- Starter repo đã `npm install`, `npx playwright test tests/examples` chạy xanh, site lab đang chạy.
- Node LTS (starter ghi `.nvmrc` là 22). Lab dùng: `/lab/login` (LAB-01) với các quy tắc mật khẩu và email đã quen ở các bài trước.

## Kiến thức cần nắm
- **Dữ liệu thô** (raw) từ file luôn là **chuỗi** (CSV) hoặc kiểu hỗn hợp (Excel, JSON); phải chuyển sang kiểu đúng (`number`, `boolean`, `Date`) và kiểm tra trước khi dùng.
- `exceljs` đọc file `.xlsx` **bất đồng bộ** (`await workbook.xlsx.readFile(...)`); `csv-parse/sync` đọc CSV **đồng bộ**.
- Test trong Playwright phải được **khai báo ngay khi nạp file**; vì vậy dữ liệu cần có sẵn ở dạng đồng bộ lúc đó.
- Tên test phải **duy nhất** trong cùng một file; trùng tên là lỗi.
- Đường dẫn file dữ liệu nên tính từ **vị trí file code** (`__dirname`), không từ thư mục đang đứng khi gõ lệnh.

## Giải thích dễ hiểu
Ở bài 4.5 bạn đã tách dữ liệu ra mảng và JSON. Trong công ty thật, người viết **test case** thường là QA lead hoặc BA, và họ quen làm việc với **bảng tính**: mỗi dòng là một ca, các cột là đầu vào và kết quả mong đợi. Khi bảng tính trở thành nguồn dữ liệu của test, họ thêm một ca mới chỉ bằng cách thêm một dòng, không cần chạm vào code. Đó là sức mạnh của test theo dữ liệu từ Excel hoặc CSV.

Nhưng một file bảng tính khác một mảng trong code ở ba điểm, và hầu hết lỗi nằm ở đây:

1. **Mọi thứ là chữ.** Một ô `TRUE` trong CSV là chuỗi `"TRUE"`, không phải `true`; ô `3` là chuỗi `"3"`. Phải chuyển kiểu và báo lỗi rõ ràng (kèm số dòng) khi ô sai.
2. **Ô có thể rỗng, có thể có ngày, có thể là công thức.** Excel lưu ngày dưới dạng số đặc biệt và `exceljs` trả về `Date`; ô công thức trả về một object có `formula` và `result`.
3. **Mã hoá và dấu ngăn cách.** CSV lưu từ Excel có thể mang một ký tự đánh dấu mã hoá ở đầu (BOM), và ô chứa dấu phẩy phải nằm trong ngoặc kép.

Cách làm an toàn gồm **ba lớp** và bài này xây từng lớp:

1. **Lớp đọc**: mỗi định dạng có một hàm đọc, trả về cùng kiểu "dòng thô" là một object toàn chuỗi.
2. **Lớp chuyển kiểu**: một hàm duy nhất đổi dòng thô thành kiểu `LoginCase`, kiểm tra hợp lệ và báo lỗi kèm số dòng.
3. **Lớp sinh test**: vòng lặp tạo test từ danh sách đã lọc.

Nhờ lớp 2 dùng chung, đổi nguồn từ CSV sang Excel không đụng gì đến logic test.

## Thực hành từng bước
Mọi lệnh chạy trong thư mục gốc của starter repo. Kịch bản xuyên suốt: bảng 7 ca đăng nhập cho `/lab/login`, mỗi ca có email, mật khẩu, loại kết quả mong đợi và thông báo mong đợi.

### Bước 1. Cài thư viện
Mục đích: có thư viện đọc Excel và CSV. Thư viện chỉ dùng khi phát triển test nên cài vào `devDependencies`.

```bash
npm i -D exceljs csv-parse
```

| Phần lệnh | Ý nghĩa |
|-----------|---------|
| `npm i -D` | Cài gói vào `devDependencies` (`i` là viết tắt của `install`, `-D` là `--save-dev`). |
| `exceljs` | Thư viện đọc và ghi file `.xlsx` bằng JavaScript thuần, không cần cài Excel trên máy. |
| `csv-parse` | Thư viện phân tích CSV; ta dùng bản đồng bộ ở đường dẫn `csv-parse/sync`. |

Kết quả mong đợi: `npm` in `added ... packages` và `package.json` có thêm hai dòng trong `devDependencies`. Trong thử nghiệm khi soạn bài, `exceljs` là `^4.4.0` và `csv-parse` là `^7.0.3`; số phiên bản của bạn có thể mới hơn. Nếu gặp `npm error code E404` thì kiểm tra lại tên gói và kết nối mạng.

### Bước 2. Tự tạo file dữ liệu mẫu bằng script
Mục đích: không cần Excel trên máy; script tạo ra cả ba file (`.xlsx`, `.csv`, `.json`) với **cùng nội dung** để bạn so sánh.

Tạo `scripts/make-sample-data.mjs` (đuôi `.mjs` để chạy được bằng `node` thuần, không cần biên dịch):

```js
import ExcelJS from "exceljs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "tests", "data");
fs.mkdirSync(dataDir, { recursive: true });

const header = ["id", "title", "enabled", "env", "email", "password", "result", "message", "priority", "reviewedOn"];

const rows = [
  [1, "đăng nhập hợp lệ", true, "all", "user@lab.dev", "Passw0rd!", "success", null, 1, new Date("2026-03-01")],
  [2, "mật khẩu 7 ký tự", true, "all", "user@lab.dev", "Pass0r!", "password-error", "Mật khẩu tối thiểu 8 ký tự", 1, new Date("2026-03-01")],
  [3, "email có hai dấu chấm liền nhau", true, "all", "user@lab..dev", "Passw0rd!", "email-error", "Email không hợp lệ", 2, new Date("2026-03-02")],
  [4, "mật khẩu thiếu chữ hoa và ký tự đặc biệt", true, "qa", "user@lab.dev", "password1", "password-error", "Mật khẩu cần chữ hoa, chữ thường, số và ký tự đặc biệt", 2, new Date("2026-03-02")],
  [5, "để trống email", true, "all", null, "Passw0rd!", "email-error", "Vui lòng nhập email", 3, null],
  [6, "sai mật khẩu (đang chờ sửa)", false, "all", "user@lab.dev", "Wrong123!", "form-error", "Email hoặc mật khẩu không đúng", 3, new Date("2026-03-05")],
  [7, "sai mật khẩu, chỉ chạy trên dev", true, "dev", "user@lab.dev", "Wrong123!", "form-error", "Email hoặc mật khẩu không đúng", 3, new Date("2026-03-05")],
];

// 1. File Excel
const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet("login");
sheet.addRow(header);
for (const r of rows) sheet.addRow(r);
sheet.getColumn(10).numFmt = "yyyy-mm-dd";
await workbook.xlsx.writeFile(path.join(dataDir, "login-cases.xlsx"));

// 2. File CSV (có BOM như Excel "CSV UTF-8"; ô chứa dấu phẩy phải nằm trong ngoặc kép)
const csvCell = (v) => {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};
const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
fs.writeFileSync(path.join(dataDir, "login-cases.csv"), "﻿" + csv, "utf8");

// 3. File JSON
const json = rows.map((r) =>
  Object.fromEntries(header.map((h, i) => [h, r[i] instanceof Date ? r[i].toISOString().slice(0, 10) : r[i]])),
);
fs.writeFileSync(path.join(dataDir, "login-cases.json"), JSON.stringify(json, null, 2) + "\n", "utf8");

console.log("Đã tạo 3 file trong", dataDir);
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `import.meta.url`, `fileURLToPath` | Trong file `.mjs` (ES module) không có `__dirname`; hai thứ này cho đường dẫn của chính file script, từ đó tính ra thư mục `tests/data`. |
| `header` và `rows` | Mười cột và bảy dòng dữ liệu. `null` là ô rỗng; `new Date(...)` là ô ngày. |
| `workbook.addWorksheet("login")` | Tạo sheet tên `login`; test sẽ đọc theo tên này. |
| `sheet.addRow(...)` | Thêm một dòng; dòng đầu là tiêu đề cột. |
| `sheet.getColumn(10).numFmt = "yyyy-mm-dd"` | Định dạng hiển thị cột thứ 10 (ngày xem lại) khi mở bằng Excel. Giá trị trong ô vẫn là ngày thật. |
| `csvCell` | Tự viết dấu ngoặc kép quanh ô có dấu phẩy, ngoặc kép hoặc xuống dòng, đúng quy tắc CSV. Ô `"Mật khẩu cần chữ hoa, chữ thường, ..."` chứa dấu phẩy nên được bao ngoặc. |
| `"﻿" + csv` | Thêm **BOM** (ký tự đánh dấu UTF-8) ở đầu file, giống khi bạn chọn "CSV UTF-8" trong Excel, để bài thực hành gặp đúng tình huống thật. |
| `Object.fromEntries(...)` | Dựng object cho JSON; ngày đổi thành chuỗi `yyyy-mm-dd`. |

Chạy:

```bash
node scripts/make-sample-data.mjs
```

Kết quả mong đợi: một dòng `Đã tạo 3 file trong <đường dẫn>\tests\data` và thư mục `tests/data` có `login-cases.xlsx`, `login-cases.csv`, `login-cases.json`. Mở file `.xlsx` bằng Excel để thấy bảng 8 dòng (một dòng tiêu đề và bảy dòng dữ liệu). Nếu gặp `Cannot find package 'exceljs'`, bạn chưa chạy Bước 1 trong thư mục này.

Các cột có ý nghĩa như sau:

| Cột | Ý nghĩa |
|-----|---------|
| `id` | Số định danh ca, duy nhất; dùng làm phần đầu tên test. |
| `title` | Mô tả ngắn của ca. |
| `enabled` | `true` hoặc `false`: bật hoặc tắt ca mà không phải xoá dòng. |
| `env` | `all`, `qa` hoặc `dev`: ca chạy ở môi trường nào. |
| `email`, `password` | Đầu vào của form đăng nhập; `email` có thể rỗng. |
| `result` | Loại kết quả: `success`, `email-error`, `password-error`, `form-error`. |
| `message` | Thông báo lỗi mong đợi; rỗng nếu `result` là `success`. |
| `priority` | Độ ưu tiên: 1 cao nhất, dùng để chạy riêng bộ smoke. |
| `reviewedOn` | Ngày ca được xem lại lần cuối; có thể rỗng. |

### Bước 3. Kiểu TypeScript cho một dòng dữ liệu và hàm chuyển kiểu
Mục đích: lớp 2 của kiến trúc: biến dòng thô (toàn chuỗi) thành `LoginCase` có kiểu đúng, kiểm tra hợp lệ và báo lỗi kèm số dòng.

Tạo `utils/login-cases.ts`:

```ts
import { dataPath, type RawRow } from "./data-reader";

export type LoginCase = {
  id: number;
  title: string;
  enabled: boolean;
  env: string;
  email: string;
  password: string;
  result: "success" | "email-error" | "password-error" | "form-error";
  message: string;
  priority: number;
  reviewedOn: Date | null;
};

const RESULTS = ["success", "email-error", "password-error", "form-error"] as const;

/** Đổi dòng thô (toàn chuỗi) sang kiểu rõ ràng, báo lỗi kèm số dòng nếu dữ liệu sai. */
export function toLoginCase(raw: RawRow, line: number): LoginCase {
  const fail = (why: string): never => {
    throw new Error(`Dữ liệu dòng ${line} (id=${raw.id}): ${why}`);
  };
  const id = Number(raw.id);
  if (!Number.isInteger(id)) fail(`id "${raw.id}" không phải số nguyên`);

  const result = raw.result as LoginCase["result"];
  if (!RESULTS.includes(result)) fail(`result "${raw.result}" không hợp lệ`);

  const priority = raw.priority === "" ? 3 : Number(raw.priority);
  if (Number.isNaN(priority)) fail(`priority "${raw.priority}" không phải số`);

  return {
    id,
    title: raw.title,
    enabled: raw.enabled.toLowerCase() === "true",
    env: raw.env || "all",
    email: raw.email,
    password: raw.password,
    result,
    message: raw.message,
    priority,
    reviewedOn: raw.reviewedOn ? new Date(raw.reviewedOn) : null,
  };
}

/** Dòng 1 là tiêu đề nên dòng dữ liệu đầu tiên nằm ở dòng 2 trong file. */
export function loadCases(rows: RawRow[]): LoginCase[] {
  const cases = rows.map((raw, i) => toLoginCase(raw, i + 2));
  const ids = new Set<number>();
  for (const c of cases) {
    if (ids.has(c.id)) throw new Error(`id ${c.id} bị trùng trong file dữ liệu`);
    ids.add(c.id);
  }
  return cases;
}

export type Filter = { env: string; maxPriority?: number };

/** Giữ lại dòng bật cờ enabled, đúng môi trường (hoặc env = all) và đủ độ ưu tiên. */
export function selectCases(cases: LoginCase[], filter: Filter): LoginCase[] {
  return cases.filter(
    (c) =>
      c.enabled &&
      (c.env === "all" || c.env === filter.env) &&
      c.priority <= (filter.maxPriority ?? Infinity),
  );
}

export const casesFromExcel = dataPath(".generated/login-cases.json");
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `type LoginCase = {...}` | Kiểu của một dòng sau khi chuyển: `id` là số, `enabled` là `boolean`, `reviewedOn` là `Date` hoặc `null`. TypeScript sẽ gợi ý tên trường khi bạn viết test. |
| `result: "success" or ...` | Kiểu literal (bài 1.9): `result` chỉ nhận một trong bốn giá trị; gõ sai tên là lỗi biên dịch. |
| `const RESULTS = [...] as const` | Danh sách giá trị hợp lệ để kiểm tra lúc **chạy** (kiểu chỉ có tác dụng lúc biên dịch, còn dữ liệu từ file thì chỉ biết lúc chạy). |
| `fail(why): never` | Hàm ném lỗi có số dòng. Kiểu `never` báo cho TypeScript rằng hàm không bao giờ trả về. |
| `Number(raw.id)` và `Number.isInteger` | Chuyển chuỗi thành số rồi kiểm tra là số nguyên; ô chứa chữ cho `NaN` và bị bắt. |
| `raw.priority === "" ? 3 : ...` | Xử lý **ô rỗng**: không có độ ưu tiên thì mặc định là 3. Luôn quyết định rõ ô rỗng nghĩa là gì. |
| `raw.enabled.toLowerCase() === "true"` | Chấp nhận `TRUE`, `True`, `true`; mọi giá trị khác (kể cả rỗng) là tắt. Người dùng Excel hay gõ `TRUE` hoa. |
| `env: raw.env` kèm giá trị dự phòng `"all"` | Ô `env` rỗng được hiểu là `all`. Trong code dòng này viết `raw.env`, hai dấu gạch đứng (toán tử "hoặc"), rồi `"all"`: chuỗi rỗng là falsy nên bị thay bằng `"all"`. |
| `new Date(raw.reviewedOn)` | Chuỗi `2026-03-01` thành ngày. Chuỗi dạng `yyyy-mm-dd` được hiểu theo giờ UTC nên nhất quán giữa các máy; chuỗi kiểu `01/03/2026` thì mơ hồ giữa ngày/tháng, nên hãy giữ định dạng ISO trong file. |
| `loadCases` | Chuyển cả bảng và **kiểm tra id không trùng** để bắt lỗi nhập liệu sớm. `i + 2` vì dòng 1 của file là tiêu đề. |
| `selectCases` | Lọc theo ba tiêu chí: cờ `enabled`, môi trường (`all` hoặc khớp), độ ưu tiên (không đặt thì không giới hạn). |

Lưu ý: file `login-cases.ts` nhập `./data-reader` ở bước tiếp theo; chưa chạy được riêng lẻ.

### Bước 4. Lớp đọc: JSON, CSV, Excel
Mục đích: ba hàm đọc, mỗi hàm trả về `RawRow[]` (mảng object toàn chuỗi).

Tạo `utils/data-reader.ts`:

```ts
import ExcelJS from "exceljs";
import { parse } from "csv-parse/sync";
import fs from "node:fs";
import path from "node:path";

/** Một dòng dữ liệu "thô": mọi giá trị là chuỗi, ô rỗng là "". */
export type RawRow = Record<string, string>;

/** Đường dẫn tính từ gốc dự án, không phụ thuộc thư mục đang chạy lệnh. */
export const dataPath = (file: string) => path.resolve(__dirname, "..", "tests", "data", file);

/** Đổi giá trị một ô Excel (có thể là số, ngày, công thức, rich text...) thành chuỗi. */
export function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if ("result" in value) return cellToString(value.result as ExcelJS.CellValue); // ô công thức
    if ("richText" in value) return value.richText.map((part) => part.text).join("");
    if ("text" in value) return String(value.text); // ô hyperlink
    if ("error" in value) throw new Error(`Ô Excel chứa lỗi ${value.error}`);
  }
  return String(value);
}

export async function readExcelRows(file: string, sheetName: string): Promise<RawRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file);
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) throw new Error(`Không thấy sheet "${sheetName}" trong ${file}`);

  const headers: string[] = [];
  sheet.getRow(1).eachCell((cell, col) => {
    headers[col] = cellToString(cell.value).trim();
  });

  const rows: RawRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: RawRow = {};
    headers.forEach((name, col) => {
      if (name) record[name] = cellToString(row.getCell(col).value).trim();
    });
    if (Object.values(record).every((v) => v === "")) return; // bỏ dòng trống
    rows.push(record);
  });
  return rows;
}

export function readCsvRows(file: string): RawRow[] {
  return parse(fs.readFileSync(file), {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    trim: true,
  }) as RawRow[];
}

/** JSON có số, true/false, null: đổi hết về chuỗi để dùng chung bước chuyển kiểu với Excel và CSV. */
export function readJsonRows(file: string): RawRow[] {
  const items: Record<string, unknown>[] = JSON.parse(fs.readFileSync(file, "utf8"));
  return items.map((item) =>
    Object.fromEntries(Object.entries(item).map(([k, v]) => [k, v === null || v === undefined ? "" : String(v)])),
  );
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `path.resolve(__dirname, "..", "tests", "data", file)` | `__dirname` là thư mục chứa file `data-reader.ts` (tức `utils`). Đi lên một cấp rồi vào `tests/data`. Đường dẫn đúng dù bạn chạy lệnh từ thư mục nào. |
| `cellToString` | Mọi kiểu giá trị của ô thành chuỗi: rỗng thành `""`; `Date` thành `yyyy-mm-dd` (theo UTC); ô công thức lấy trường `result`; rich text (chữ có nhiều kiểu định dạng) nối các đoạn; hyperlink lấy chữ hiển thị; ô lỗi (`#N/A`, `#REF!`) thì ném lỗi rõ ràng. Số và `true`/`false` đổi bằng `String(...)`. |
| `workbook.xlsx.readFile(file)` | Nạp cả file Excel vào bộ nhớ. Hàm **bất đồng bộ** nên cần `await`. |
| `workbook.getWorksheet(sheetName)` | Lấy sheet theo tên; không có thì `undefined`, nên kiểm tra và ném lỗi dễ hiểu. |
| `sheet.getRow(1).eachCell(...)` | Duyệt các ô có dữ liệu ở dòng tiêu đề; `col` là số thứ tự cột **bắt đầu từ 1**, nên `headers` là mảng thưa (phần tử 0 bỏ trống). |
| `sheet.eachRow(...)` | Duyệt từng dòng có dữ liệu; `rowNumber` bắt đầu từ 1. |
| `row.getCell(col).value` | Giá trị ô ở cột `col`; ô rỗng cho `null`. |
| `.trim()` | Cắt khoảng trắng thừa hai đầu: lỗi nhập liệu rất phổ biến (ví dụ `"qa "`). |
| `Object.values(record).every((v) => v === "")` | Dòng mà mọi ô đều rỗng (dòng trống lơ lửng cuối bảng) thì bỏ. |
| `parse(buffer, {...})` | Hàm của `csv-parse/sync`. `columns: true` dùng dòng đầu làm tên khoá nên mỗi dòng thành object; `bom: true` **bỏ ký tự BOM** ở đầu file; `skip_empty_lines: true` bỏ dòng trống; `trim: true` cắt khoảng trắng quanh ô. |
| `fs.readFileSync(file)` không có mã hoá | Truyền `Buffer` để `csv-parse` tự nhận BOM; nếu đã đọc thành chuỗi thì BOM nằm ở đầu chuỗi và tuỳ chọn `bom` vẫn xử lý được. |
| `readJsonRows` | JSON giữ được số, `true` và `null`; hàm đổi hết sang chuỗi (`null` thành `""`) để bước chuyển kiểu ở Bước 3 dùng chung cho cả ba nguồn. |

Hai điểm cần nhớ về CSV: ô nào chứa **dấu phẩy** phải nằm trong ngoặc kép (thư viện tự hiểu, bạn không cần làm gì thêm); và nếu file của bạn dùng dấu chấm phẩy làm dấu ngăn cách (Excel với một số cấu hình vùng của Windows lưu như vậy, vì dấu phẩy được dùng làm dấu thập phân), thêm tuỳ chọn `delimiter: ";"` (hoặc `delimiter: [",", ";"]` để nhận cả hai).

Kiểm tra nhanh `readCsvRows` ngay ở dòng lệnh, tạo file tạm `scripts/check-csv.ts` rồi chạy bằng `npx tsx scripts/check-csv.ts` (tải `tsx` ở lần đầu, nhấn `y` khi được hỏi):

```ts
import { dataPath, readCsvRows } from "../utils/data-reader";

const rows = readCsvRows(dataPath("login-cases.csv"));
console.log(rows.length, "dòng");
console.log(rows[3].message);
```

Kết quả mong đợi:

```text
7 dòng
Mật khẩu cần chữ hoa, chữ thường, số và ký tự đặc biệt
```

Dòng thứ hai chứng tỏ ô chứa dấu phẩy không bị tách đôi. Xoá file tạm sau khi xem. (Lưu ý: `__dirname` hoạt động vì starter biên dịch sang CommonJS; không dùng được trong file `.mjs`.)

### Bước 5. Test động từ CSV
Mục đích: lớp 3: biến mỗi dòng thành một test riêng.

Tạo `tests/login-data-csv.spec.ts`:

```ts
import { test, expect } from "../fixtures";
import { dataPath, readCsvRows } from "../utils/data-reader";
import { loadCases, selectCases } from "../utils/login-cases";

const TEST_ENV = process.env.TEST_ENV ?? "qa";
const maxPriority = process.env.MAX_PRIORITY ? Number(process.env.MAX_PRIORITY) : undefined;

const cases = selectCases(loadCases(readCsvRows(dataPath("login-cases.csv"))), {
  env: TEST_ENV,
  maxPriority,
});

for (const c of cases) {
  test(`[CSV ${c.id}] ${c.title}`, { tag: `@p${c.priority}` }, async ({ loginPage }) => {
    await loginPage.login(c.email, c.password);

    switch (c.result) {
      case "success":
        await loginPage.expectLoggedIn();
        break;
      case "email-error":
        await expect(loginPage.emailError).toHaveText(c.message);
        break;
      case "password-error":
        await expect(loginPage.passwordError).toHaveText(c.message);
        break;
      case "form-error":
        await expect(loginPage.formError).toHaveText(c.message);
        break;
    }
  });
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `import { test, expect } from "../fixtures"` | Fixture của bài 4.3: `loginPage` đã mở trang và reset dữ liệu lab. |
| `process.env.TEST_ENV ?? "qa"` | Môi trường chạy lấy từ biến `TEST_ENV`, mặc định `qa`. |
| `Number(process.env.MAX_PRIORITY)` | Biến môi trường luôn là chuỗi nên phải đổi sang số; không đặt thì `undefined` (không lọc). |
| `selectCases(loadCases(readCsvRows(...)), {...})` | Đọc, chuyển kiểu, rồi lọc: ba lớp nối nhau. Việc này chạy **khi nạp file**, trước khi test chạy. |
| `` test(`[CSV ${c.id}] ${c.title}`, ...) `` | Tên test gồm **id duy nhất** và tiêu đề; có nguồn (`CSV`) để phân biệt với bản Excel ở bước sau. |
| ``{ tag: `@p${c.priority}` }`` | Gắn **thẻ** theo độ ưu tiên (`@p1`, `@p2`...) để chạy riêng bằng `--grep`. |
| `switch (c.result)` | Chọn cách kiểm tra theo loại kết quả; TypeScript biết mọi giá trị có thể của `result` nên báo nếu bạn bỏ sót. |
| `toHaveText(c.message)` | Kiểm tra thông báo bằng đúng chuỗi trong file; `toHaveText` tự gộp khoảng trắng thừa. |

Chạy:

```bash
npx playwright test tests/login-data-csv.spec.ts
```

Kết quả mong đợi: năm test (các ca có `env` là `all` hoặc `qa` và `enabled` là `true`: id 1, 2, 3, 4, 5), tất cả xanh, tên kèm thẻ:

```text
Running 5 tests using ... workers
  ok 1 [chromium] › tests\login-data-csv.spec.ts:14:7 › [CSV 1] đăng nhập hợp lệ @p1 (...)
  ok 2 [chromium] › tests\login-data-csv.spec.ts:14:7 › [CSV 2] mật khẩu 7 ký tự @p1 (...)
  ...
  5 passed
```

Ca id 6 (`enabled` là `false`) và id 7 (`env` là `dev`) không xuất hiện: đó là kết quả của bộ lọc. Thứ tự các dòng trong kết quả có thể khác nếu có nhiều worker.

### Bước 6. Excel: đọc bất đồng bộ nhưng test cần dữ liệu đồng bộ
Mục đích: giải quyết vướng mắc lớn nhất của dữ liệu Excel.

Vướng mắc: `exceljs` chỉ đọc file bằng `await` (bất đồng bộ), nhưng `test(...)` phải được gọi **ngay lúc nạp file** để Playwright biết danh sách test. Trong file test chạy ở CommonJS (cách starter đang dùng), bạn không thể `await` ở mức cao nhất của file.

Cách giải quyết gọn: dùng **`globalSetup`** (bài 4.11) để đọc Excel một lần rồi ghi ra file JSON; file test đọc JSON bằng hàm đồng bộ. Đã thử: `globalSetup` chạy **trước** khi Playwright nạp các file test, nên file JSON đã có sẵn lúc đó. Cách này **không** dùng được với project `setup` (bài 4.11), vì project `setup` chạy sau khi danh sách test đã được tạo.

Tạo `tests/global-data.ts`:

```ts
import fs from "node:fs";
import { dataPath, readExcelRows } from "../utils/data-reader";

export default async function globalSetup() {
  const rows = await readExcelRows(dataPath("login-cases.xlsx"), "login");
  fs.mkdirSync(dataPath(".generated"), { recursive: true });
  fs.writeFileSync(dataPath(".generated/login-cases.json"), JSON.stringify(rows, null, 2));
  console.log("[globalSetup] đã xuất", rows.length, "dòng");
}
```

Trong `playwright.config.ts`, thêm một khoá ở cấp cao nhất của `defineConfig`:

```ts
  globalSetup: "./tests/global-data.ts",
```

Thêm vào `.gitignore` của starter dòng sau, vì file sinh ra không nên đưa lên Git:

```text
tests/data/.generated/
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `readExcelRows(dataPath("login-cases.xlsx"), "login")` | Đọc sheet `login` thành mảng dòng thô (Bước 4). |
| `fs.mkdirSync(..., { recursive: true })` | Tạo thư mục `.generated` nếu chưa có; không báo lỗi nếu đã có. |
| `JSON.stringify(rows, null, 2)` | Ghi ra JSON với thụt lề 2 khoảng trắng cho dễ đọc. |
| `globalSetup: "./tests/global-data.ts"` | Chạy file này một lần trước mọi thứ; đường dẫn tính từ thư mục chứa `playwright.config.ts`. |

Tạo `tests/login-data-excel.spec.ts`:

```ts
import fs from "node:fs";
import { test, expect } from "../fixtures";
import type { RawRow } from "../utils/data-reader";
import { casesFromExcel, loadCases, selectCases } from "../utils/login-cases";

const TEST_ENV = process.env.TEST_ENV ?? "qa";

// File JSON này do globalSetup sinh ra từ login-cases.xlsx trước khi test được nạp.
const rows: RawRow[] = JSON.parse(fs.readFileSync(casesFromExcel, "utf8"));
const cases = selectCases(loadCases(rows), { env: TEST_ENV });

for (const c of cases) {
  test(`[Excel ${c.id}] ${c.title}`, async ({ loginPage }) => {
    await loginPage.login(c.email, c.password);

    if (c.result === "success") {
      await loginPage.expectLoggedIn();
      return;
    }
    const target = {
      "email-error": loginPage.emailError,
      "password-error": loginPage.passwordError,
      "form-error": loginPage.formError,
    }[c.result];
    await expect(target).toHaveText(c.message);
  });
}
```

Giải thích: spec này giống bản CSV ở lớp 2 và 3; khác ở chỗ lấy dòng thô từ file JSON do `globalSetup` ghi ra, và dùng bảng tra `{...}[c.result]` thay cho `switch` (nêu như một cách viết khác). Hai spec có hai tiền tố tên khác nhau (`CSV`, `Excel`) nên không trùng tên.

Chạy cả hai:

```bash
npx playwright test tests/login-data-csv.spec.ts tests/login-data-excel.spec.ts
```

Kết quả mong đợi: bạn thấy dòng `[globalSetup] đã xuất 7 dòng` ngay đầu, rồi `10 passed` (5 từ CSV và 5 từ Excel). Thư mục `tests/data/.generated` xuất hiện với file `login-cases.json`.

Nếu gặp lỗi:

- `ENOENT ... .generated\login-cases.json`: `globalSetup` chưa được khai báo trong config, hoặc bạn chạy bằng một config khác.
- `Không thấy sheet "login" trong ...`: tên sheet trong file Excel khác `login` (phân biệt hoa thường).

### Bước 7. Lọc theo môi trường, độ ưu tiên và thẻ
Mục đích: chạy đúng tập con của dữ liệu mà không sửa code.

Liệt kê (không chạy) test của môi trường `dev` để xem bộ lọc hoạt động. Trên macOS, Linux hoặc Git Bash:

```bash
TEST_ENV=dev npx playwright test tests/login-data-csv.spec.ts --list
```

Trên Windows PowerShell (gán biến cho phiên rồi gọi lệnh):

```powershell
$env:TEST_ENV = "dev"; npx playwright test tests/login-data-csv.spec.ts --list
```

Kết quả mong đợi: năm test với id 1, 2, 3, 5 và 7. Ca id 4 (chỉ `qa`) biến mất, ca id 7 (chỉ `dev`) xuất hiện, ca id 6 vẫn bị loại vì `enabled` là `false`.

```text
Listing tests:
  [chromium] › login-data-csv.spec.ts:14:7 › [CSV 1] đăng nhập hợp lệ
  [chromium] › login-data-csv.spec.ts:14:7 › [CSV 2] mật khẩu 7 ký tự
  [chromium] › login-data-csv.spec.ts:14:7 › [CSV 3] email có hai dấu chấm liền nhau
  [chromium] › login-data-csv.spec.ts:14:7 › [CSV 5] để trống email
  [chromium] › login-data-csv.spec.ts:14:7 › [CSV 7] sai mật khẩu, chỉ chạy trên dev
Total: 5 tests in 1 file
```

Chỉ chạy bộ ưu tiên cao (smoke) bằng cờ `--grep` theo thẻ:

```bash
npx playwright test tests/login-data-csv.spec.ts --grep @p1
```

Hoặc bằng biến `MAX_PRIORITY` ở trên: `MAX_PRIORITY=1 npx playwright test ...` (PowerShell: `$env:MAX_PRIORITY = "1"`). Với `@p1` bạn chọn các test có thẻ `@p1`, còn `MAX_PRIORITY=1` cắt dữ liệu ngay từ lúc tạo test; hai cách cho cùng tập test ở bộ dữ liệu này.

Gợi ý dùng cột ngày `reviewedOn`: cảnh báo các ca lâu chưa được xem lại.

```ts
const ageDays = (Date.now() - c.reviewedOn.getTime()) / 86_400_000; // 86.400.000 ms mỗi ngày
```

Chỉ gọi sau khi kiểm tra `c.reviewedOn` khác `null`, và đừng để việc này làm test đỏ: nên chỉ `console.warn`.

### Bước 8. Dùng JSON và hợp nhất nguồn
Mục đích: biết JSON tiện nhất, vì đọc đồng bộ và không cần thư viện.

```ts
import { dataPath, readJsonRows } from "../utils/data-reader";
import { loadCases } from "../utils/login-cases";

const cases = loadCases(readJsonRows(dataPath("login-cases.json")));
console.log(cases.length); // 7
```

Vì cả ba hàm đọc đều trả về `RawRow[]`, đổi nguồn chỉ là thay một dòng. Chọn nguồn thế nào: **JSON** cho dữ liệu do lập trình viên bảo trì (đồng bộ, review bằng Git); **CSV** khi cần xuất từ công cụ khác, đọc đồng bộ và diff được trong Git; **Excel** khi người không viết code phải sửa dữ liệu hằng ngày, đổi lại cần thêm bước chuyển đổi bất đồng bộ như Bước 6 và file nhị phân khó so sánh trong Git.

## Demo code
Phần chạy đủ ba lớp đã nằm ở Bước 3 đến 6. Để kiểm tra nhanh bộ đọc mà không cần chạy site, bạn có thể thử một ô công thức và ô nhiều định dạng của Excel bằng script tạm `scripts/check-cells.mjs`:

```js
import ExcelJS from "exceljs";

const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet("t");
ws.addRow(["a", "b", "c", "d", "e"]);
ws.addRow([
  1,
  { formula: "1+1", result: 2 },
  { richText: [{ text: "xin " }, { text: "chào", font: { bold: true } }] },
  { text: "site", hyperlink: "https://example.com" },
  new Date("2026-03-01"),
]);
await wb.xlsx.writeFile("check-cells.xlsx");

const read = new ExcelJS.Workbook();
await read.xlsx.readFile("check-cells.xlsx");
for (const cell of read.getWorksheet("t").getRow(2).values.slice(1)) console.log(cell);
```

Chạy `node scripts/check-cells.mjs`, bạn sẽ thấy các giá trị khác nhau của từng loại ô: số `1`; object `{ formula: '1+1', result: 2 }`; object có `richText`; object có `text` và `hyperlink`; và một đối tượng `Date`. Chính vì ô Excel có nhiều hình dạng như vậy nên hàm `cellToString` ở Bước 4 tồn tại. Xoá `check-cells.xlsx` và script tạm sau khi xem.

## Thử ngay trong lab
Mở `/lab/login` và tự thử từng dòng của bảng 7 ca bằng tay để chắc rằng "kết quả mong đợi" trong file khớp giao diện thật. Sau đó thêm một dòng mới vào `login-cases.xlsx` (hoặc sửa script rồi chạy lại Bước 2), ví dụ mật khẩu 33 ký tự với `message` là `Mật khẩu tối đa 32 ký tự` và `result` là `password-error`, rồi chạy lại: số test tăng thêm một mà không đổi dòng code nào. Thử cố tình viết sai `result` thành `pasword-error` để thấy thông báo lỗi kèm số dòng của Bước 3.

## Lỗi thường gặp
- **Triệu chứng:** `Dữ liệu dòng 2 (id=undefined): id "undefined" không phải số nguyên`. **Nguyên nhân:** file CSV có BOM nhưng bạn không bật `bom: true`, nên cột đầu có tên `"﻿id"` thay vì `id`. **Cách sửa:** thêm `bom: true` vào tuỳ chọn `parse` (hoặc lưu CSV không BOM); khi nghi ngờ, `console.log(Object.keys(rows[0]))` để xem tên cột thật.
- **Triệu chứng:** `Invalid Record Length: columns length is 2, got 3 on line 2` (từ `csv-parse`). **Nguyên nhân:** ô có dấu phẩy mà không nằm trong ngoặc kép, nên dòng bị tách thành nhiều cột hơn tiêu đề. **Cách sửa:** bao ô bằng ngoặc kép trong file nguồn, hoặc lưu từ Excel (Excel tự thêm ngoặc kép), hoặc đổi dấu ngăn cách sang `;` và khai báo `delimiter`.
- **Triệu chứng:** `Error: duplicate test title "đăng nhập sai", first declared in ...`. **Nguyên nhân:** hai dòng dữ liệu cho cùng tên test. **Cách sửa:** đưa cột `id` (duy nhất) vào tên test như bài này, và kiểm tra id trùng ngay lúc nạp dữ liệu (`loadCases`).
- **Triệu chứng:** `ENOENT: no such file or directory, open '...\tests\tests\data\login-cases.csv'` (hai chữ `tests` lặp lại) khi chạy lệnh từ thư mục con. **Nguyên nhân:** đường dẫn tương đối `"tests/data/..."` tính từ **thư mục đang đứng**, không từ vị trí file code. **Cách sửa:** luôn dựng đường dẫn từ `__dirname` như hàm `dataPath`.
- **Triệu chứng:** tiếng Việt trong file CSV hiện thành ký tự lạ (như `M?t kh?u` hoặc dấu hỏi trong ô vuông). **Nguyên nhân:** file CSV không lưu ở UTF-8 (Excel tuỳ chọn "CSV" thường dùng bảng mã cũ của Windows). **Cách sửa:** trong Excel chọn "Lưu dạng" kiểu **CSV UTF-8 (Comma delimited)**, hoặc dùng file `.xlsx` trực tiếp.
- **Triệu chứng:** ngày trong CSV xuất từ Excel là `01/03/2026` và bị hiểu thành ngày 3 tháng 1. **Nguyên nhân:** định dạng ngày theo vùng, mơ hồ giữa ngày/tháng và tháng/ngày. **Cách sửa:** định dạng cột ngày theo kiểu `yyyy-mm-dd` trong Excel, hoặc tự phân tích bằng quy tắc rõ ràng thay vì `new Date(...)`.
- **Triệu chứng:** `Không thấy sheet "login" trong ...`. **Nguyên nhân:** tên sheet khác (kể cả viết hoa, khoảng trắng thừa). **Cách sửa:** đối chiếu tên sheet trong Excel, hoặc đọc sheet đầu tiên bằng `workbook.worksheets[0]`.
- **Triệu chứng:** test đỏ vì giá trị ô có khoảng trắng thừa (ví dụ `"qa "` không khớp `"qa"`). **Nguyên nhân:** người nhập vô tình gõ dấu cách. **Cách sửa:** `trim()` ở lớp đọc, như `readExcelRows` và tuỳ chọn `trim: true` của CSV.
- **Triệu chứng:** ô công thức cho `[object Object]` trong chuỗi. **Nguyên nhân:** `exceljs` trả về object `{ formula, result }` chứ không phải giá trị. **Cách sửa:** dùng `cellToString` để lấy `result`.

## Tóm tắt
- Dữ liệu từ file là chuỗi hoặc kiểu hỗn hợp: đọc về "dòng thô" rồi **chuyển kiểu và kiểm tra** ở một chỗ duy nhất, báo lỗi kèm số dòng.
- `csv-parse/sync` với `columns`, `bom`, `trim`, `skip_empty_lines` xử lý hầu hết rắc rối của CSV; dấu phẩy trong ô cần ngoặc kép.
- `exceljs` đọc bất đồng bộ; dùng `globalSetup` để đổi `.xlsx` thành JSON trước khi nạp test, rồi sinh test đồng bộ từ JSON.
- Mỗi dòng thành một test với tên duy nhất (đưa `id` vào tên) và thẻ ưu tiên để chạy riêng bằng `--grep`.
- Cờ `enabled`, cột `env` và biến `TEST_ENV` cho phép bật tắt và chọn dữ liệu theo môi trường mà không sửa code.
- Dùng `__dirname` dựng đường dẫn tới file dữ liệu để không phụ thuộc thư mục chạy lệnh.

## Bài tập
1. Chạy Bước 1 đến 5 và xác nhận bạn có đúng 5 test từ CSV (id 1 đến 5). Xong khi `--list` với `TEST_ENV=dev` cho đúng các id 1, 2, 3, 5, 7.
2. Thêm hai dòng mới vào dữ liệu: một mật khẩu 33 ký tự (kỳ vọng `Mật khẩu tối đa 32 ký tự`) và một email có dấu chấm cuối phần tên (`user.@lab.dev`, kỳ vọng `Email không hợp lệ`). Xong khi tổng số test tăng thêm hai mà không đổi file `.spec.ts`.
3. Cố tình làm hỏng dữ liệu theo ba cách (id không phải số, `result` sai chính tả, hai dòng trùng id) và đọc thông báo lỗi. Xong khi mỗi lỗi nêu đúng số dòng hoặc đúng id trùng.
4. Viết `readExcelRows` hỗ trợ tham số tuỳ chọn để đọc **sheet đầu tiên** khi không truyền tên sheet. Xong khi bạn đọc được file có sheet tên khác `login`.
5. Thêm cột `browser` (`chromium` hoặc `firefox`) vào dữ liệu và lọc theo `testInfo.project.name` để dòng nào chỉ chạy trên đúng trình duyệt (dùng `test.skip(condition, reason)` trong thân test). Xong khi ca chỉ cho `firefox` bị đánh dấu skipped khi chạy dự án `chromium`.
6. Thử thách: viết kiểu `OrderCase` cho một bảng dữ liệu đơn hàng (khách, mã sản phẩm, số lượng, tổng tiền mong đợi) và test động trên API `/api/lab/orders` (tạo đơn rồi so `total`). Xong khi bảng có ít nhất một ô rỗng và một ô số được chuyển kiểu có kiểm tra.
