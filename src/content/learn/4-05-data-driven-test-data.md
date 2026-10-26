---
title: Data-driven và quản lý dữ liệu test
level: 4
order: 5
minutes: 45
summary: Tách dữ liệu khỏi logic, dùng JSON/CSV, factory và tạo dữ liệu độc lập cho từng test.
keywords: [data driven testing, faker js, test data management]
---

## Mục tiêu bài học
- Viết một đoạn logic test rồi chạy nó với nhiều bộ dữ liệu (mảng, file JSON, file CSV) và mỗi bộ hiện thành một test riêng trong báo cáo.
- Viết **factory** (`buildUser`, `buildBook`) sinh dữ liệu hợp lệ, cho phép ghi đè từng phần.
- Tạo dữ liệu **độc lập** cho mỗi test (email, ISBN không trùng) để test chạy song song không đụng nhau.
- Biết khi nào dùng dữ liệu tĩnh, khi nào dữ liệu sinh động, và dùng thư viện **faker** đúng cách.

## Bạn cần chuẩn bị
- Đã học bài 4.1 đến 4.3 (Page Object, fixture); starter repo chạy được.
- Biết vòng lặp `for...of`, mảng đối tượng, `import` của TypeScript (Level 1).
- Biết biên giá trị (BVA) ở mức cơ bản: kiểm tra giá trị ngay ở biên (7, 8, 32, 33 ký tự) thay vì giá trị tuỳ ý.
- Lab `/lab/login` và `/lab/api` mở được.

## Kiến thức cần nắm
- **Data-driven**: một đoạn logic, nhiều bộ dữ liệu (mảng, JSON, CSV).
- **Test data builder/factory**: hàm sinh dữ liệu hợp lệ mặc định, cho phép ghi đè từng trường.
- Thư viện **faker** sinh dữ liệu giả (tên, email) để tránh trùng; chỉ là một cách, không bắt buộc.
- Dữ liệu **độc lập**: mỗi test dùng email/mã riêng, không đụng nhau, có thể chạy song song.
- Tách dữ liệu tĩnh (`tests/data/*.json`) khỏi dữ liệu sinh động (factory).
- Tiêu đề mỗi test phải **duy nhất**; nên chứa tên bộ dữ liệu để biết bộ nào đỏ.

## Giải thích dễ hiểu
Dữ liệu test giống **nguyên liệu nấu ăn**. Nếu mọi đầu bếp cùng dùng chung một nồi thịt, họ tranh nhau và món nào cũng hỏng. Cho mỗi đầu bếp một **phần nguyên liệu riêng** thì mọi người nấu song song thoải mái.

Data-driven thì giống **cùng một công thức, nhiều phần nguyên liệu khác nhau**. Công thức "đăng nhập với mật khẩu X rồi kiểm tra lời báo lỗi Y" chỉ viết một lần; bạn chỉ thay bảng (X, Y). Lợi ích: thêm một ca kiểm thử mới chỉ là thêm **một dòng dữ liệu**, không phải copy cả test; và người không biết code (BA, QA lead) có thể đọc, bổ sung bảng dữ liệu.

Có hai loại dữ liệu cần phân biệt:
1. **Dữ liệu tĩnh**: không đổi giữa các lần chạy, ví dụ bảng "mật khẩu và thông báo mong đợi". Lưu trong file JSON hoặc CSV, review được bằng Git.
2. **Dữ liệu sinh động**: phải khác nhau mỗi lần để không đụng nhau, ví dụ email đăng ký, ISBN sách mới. Sinh bằng **factory**.

Một nguyên tắc vàng: **mỗi test tự tạo và tự dọn dữ liệu của mình**, không phụ thuộc test khác để lại gì.

## Thực hành từng bước
Cấu trúc thư mục ta sẽ tạo:

```text
tests/
  data/
    password-cases.json     bảng mật khẩu và thông báo mong đợi
    coupons.csv             ví dụ dữ liệu CSV (tuỳ chọn)
  login-data.spec.ts        test lặp trên dữ liệu JSON
utils/
  data.ts                   factory: buildUser, buildBook, uniqueIsbn
```

### Bước 1. Data-driven đơn giản bằng mảng ngay trong file
Mục đích: hiểu cơ chế "lặp để sinh test" trước khi dùng file.

Tạo `tests/login-data.spec.ts`:

```ts
import { test, expect } from "../fixtures";

const cases = [
  { name: "7 ký tự", password: "Pass0r!", error: "tối thiểu 8" },
  { name: "33 ký tự", password: "Aa1!aaaaaaaaaaaaaaaaaaaaaaaaaaaaa", error: "tối đa 32" },
  { name: "thiếu ký tự đặc biệt", password: "Passw0rdd", error: "ký tự đặc biệt" },
];

for (const c of cases) {
  test(`mật khẩu ${c.name} bị từ chối`, async ({ loginPage }) => {
    await loginPage.login("user@lab.dev", c.password);
    await expect(loginPage.passwordError).toContainText(c.error);
  });
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `const cases = [...]` | Mảng các bộ dữ liệu; mỗi phần tử là một đối tượng có tên, mật khẩu, thông báo mong đợi. |
| `for (const c of cases)` | Lặp từng bộ. **Mỗi vòng gọi `test(...)` một lần**, nên Playwright thấy ba test riêng biệt. |
| `` `mật khẩu ${c.name} bị từ chối` `` | Tiêu đề chứa tên bộ dữ liệu, nên báo cáo hiện `mật khẩu 7 ký tự bị từ chối`. Nếu hai test trùng tiêu đề Playwright báo lỗi. |
| `{ loginPage }` | Fixture đã mở trang và reset (bài 4.3). |
| `toContainText(c.error)` | Kiểm tra thông báo có chứa chuỗi mong đợi. |

Giá trị 7 và 33 ký tự là **biên** của quy tắc 8 đến 32 ký tự (xem BR của LAB-01): mật khẩu 7 ký tự là ngay dưới biên dưới, 33 là ngay trên biên trên.

Chạy:

```bash
npx playwright test tests/login-data.spec.ts
```

Kết quả mong đợi:

```text
Running 3 tests using 3 workers
  3 passed (4.5s)
```

Nếu gặp lỗi: `Error: duplicate test title` nghĩa là hai bộ dữ liệu có cùng `name`. Đặt tên khác nhau.

### Bước 2. Chuyển dữ liệu sang file JSON
Mục đích: tách dữ liệu khỏi logic để sửa dữ liệu mà không đụng code.

Tạo `tests/data/password-cases.json`:

```json
[
  { "name": "7 ký tự", "password": "Pass0r!", "error": "tối thiểu 8" },
  { "name": "33 ký tự", "password": "Aa1!aaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "error": "tối đa 32" },
  { "name": "thiếu ký tự đặc biệt", "password": "Passw0rdd", "error": "ký tự đặc biệt" },
  { "name": "8 ký tự là hợp lệ về định dạng", "password": "Pass0rd!", "error": null }
]
```

Dòng cuối có `"error": null` để biểu diễn "không có lỗi định dạng". Giữ nó, ta sẽ xử lý khác đi trong test.

Sửa `tests/login-data.spec.ts`:

```ts
import { test, expect } from "../fixtures";
import cases from "./data/password-cases.json";

for (const c of cases) {
  test(`mật khẩu: ${c.name}`, async ({ loginPage }) => {
    await loginPage.login("user@lab.dev", c.password);

    if (c.error) {
      await expect(loginPage.passwordError).toContainText(c.error);
    } else {
      // Qua được kiểm tra định dạng; bị từ chối ở bước sau vì không khớp tài khoản
      await expect(loginPage.passwordError).toBeHidden();
      await expect(loginPage.formError).toContainText("không đúng");
    }
  });
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `import cases from "./data/password-cases.json"` | Nhập trực tiếp file JSON như một module; TypeScript tự suy ra kiểu. Starter dùng `moduleResolution: "Bundler"` nên không cần cấu hình thêm. |
| `if (c.error) {...} else {...}` | Một bộ dữ liệu có thể mong đợi **không lỗi**; nhánh `else` kiểm tra điều khác. |
| `toBeHidden()` | Phần tử không hiển thị (hoặc không tồn tại). |
| `formError` chứa "không đúng" | Mật khẩu `Pass0rd!` hợp định dạng nhưng sai tài khoản, nên form báo `Email hoặc mật khẩu không đúng`. |

Chạy lại lệnh ở bước 1. Kết quả mong đợi: 4 test xanh (tăng từ 3 vì thêm một dòng dữ liệu, không thêm dòng code nào).

Nếu gặp lỗi: `locator.fill: Test timeout ... waiting for getByLabel('Email')` khi chạy cả bộ có `storageState` đăng nhập sẵn (bài 4.6): form đăng nhập không hiện vì trình duyệt đã đăng nhập. Test cần form đăng nhập phải dùng context **không** có phiên (`test.use({ storageState: { cookies: [], origins: [] } })`).

### Bước 3. Dùng file CSV (khi dữ liệu đến từ bảng tính)
Mục đích: BA hay xuất dữ liệu từ Excel ra CSV; test đọc được trực tiếp.

Tạo `tests/data/password-cases.csv`:

```text
name,password,error
thiếu chữ hoa,passw0rd!,chữ hoa
thiếu số,Password!,số
```

Đọc CSV bằng thư viện chuẩn của Node (không cần cài gì), đặt trong `utils/data.ts`:

```ts
import { readFileSync } from "node:fs";
import path from "node:path";

/** Đọc CSV đơn giản: dòng đầu là tiêu đề, không có dấu phẩy hay xuống dòng nằm trong ô. */
export function readCsv(relativePath: string): Record<string, string>[] {
  const file = path.resolve(__dirname, "..", relativePath);
  const [header, ...rows] = readFileSync(file, "utf8").trim().split(/\r?\n/);
  const names = header.split(",");
  return rows.map((line) => {
    const cells = line.split(",");
    return Object.fromEntries(names.map((n, i) => [n, cells[i] ?? ""]));
  });
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `path.resolve(__dirname, "..", relativePath)` | Đường dẫn tuyệt đối từ thư mục gốc dự án (`utils/..`), nên chạy lệnh ở đâu cũng đọc đúng file. |
| `.trim().split(/\r?\n/)` | Cắt thành các dòng; `\r?\n` xử lý cả xuống dòng kiểu Windows và macOS. |
| `const [header, ...rows] = ...` | Tách dòng đầu (tiêu đề) và phần còn lại. |
| `Object.fromEntries(names.map(...))` | Ghép tên cột với giá trị từng ô thành đối tượng `{ name, password, error }`. |

Giới hạn: hàm này **không** xử lý ô chứa dấu phẩy hoặc có dấu ngoặc kép. Dữ liệu thật phức tạp hơn thì dùng thư viện `csv-parse` (`npm i -D csv-parse`). Dùng trong test:

```ts
import { readCsv } from "../utils/data";

for (const c of readCsv("tests/data/password-cases.csv")) {
  test(`csv: mật khẩu ${c.name}`, async ({ loginPage }) => {
    await loginPage.login("user@lab.dev", c.password);
    await expect(loginPage.passwordError).toContainText(c.error);
  });
}
```

Chạy xong, kết quả mong đợi: 2 test xanh ("thiếu chữ hoa", "thiếu số"). Thông báo lỗi của lab chứa các cụm "chữ hoa" và "số" nên `toContainText` khớp.

### Bước 4. Viết factory `buildBook` có thể ghi đè
Mục đích: tạo dữ liệu hợp lệ mặc định, mỗi test chỉ nêu phần **khác biệt**.

LAB-14 (`/lab/api`) có endpoint tạo sách yêu cầu `title`, `author`, `isbn` dạng `978-` kèm 10 chữ số (không trùng), `price` là số nguyên từ 0 đến 10.000.000. ISBN trùng sẽ bị `409`. Vì vậy ISBN phải **duy nhất mỗi lần**.

Thêm vào `utils/data.ts`:

```ts
import { randomInt, randomUUID } from "node:crypto";

export type NewBook = { title: string; author: string; isbn: string; price: number; stock?: number };
export type TestUser = { email: string; password: string };

/** ISBN hợp lệ của lab, khác nhau mỗi lần gọi: "978-" + 10 chữ số. */
export function uniqueIsbn(): string {
  return `978-${String(randomInt(0, 10_000_000_000)).padStart(10, "0")}`;
}

/** Sách hợp lệ; truyền phần cần đổi qua `overrides`. */
export function buildBook(overrides: Partial<NewBook> = {}): NewBook {
  return {
    title: `Sách thử ${randomUUID().slice(0, 6)}`,
    author: "QA Team",
    isbn: uniqueIsbn(),
    price: 100_000,
    ...overrides,
  };
}

/** Người dùng test có email duy nhất. */
export function buildUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    email: `qa+${randomUUID().slice(0, 8)}@lab.dev`,
    password: "Passw0rd!",
    ...overrides,
  };
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `Partial<NewBook>` | Kiểu "mọi trường đều tuỳ chọn": cho phép truyền `{ price: -1 }` mà không phải liệt kê hết. |
| `...overrides` đặt **sau** giá trị mặc định | Trường nào có trong `overrides` sẽ **ghi đè** mặc định. Đảo thứ tự thì ghi đè không hoạt động. |
| `randomInt(0, 10_000_000_000)` | Số nguyên ngẫu nhiên từ 0 đến dưới 10 tỷ, dùng bộ sinh số ngẫu nhiên an toàn của Node. |
| `.padStart(10, "0")` | Bù số 0 phía trước cho đủ đúng 10 chữ số (ví dụ `42` thành `0000000042`). |
| `randomUUID().slice(0, 8)` | Lấy 8 ký tự đầu của UUID ngẫu nhiên để làm hậu tố email. |

Dùng với `request` (xem bài 4.7 để hiểu chi tiết lời gọi API):

```ts
import { test, expect } from "@playwright/test";
import { buildBook } from "../utils/data";

const admin = { Authorization: "Bearer admin-token" };

test("tạo sách hợp lệ trả 201 và có id", async ({ request }) => {
  const res = await request.post("/api/lab/books", { headers: admin, data: buildBook() });

  expect(res.status()).toBe(201);
  expect((await res.json()).id).toBeTruthy();
});

test("giá âm bị từ chối 422", async ({ request }) => {
  const res = await request.post("/api/lab/books", { headers: admin, data: buildBook({ price: -1 }) });

  expect(res.status()).toBe(422);
});
```

Ý nghĩa: test thứ hai chỉ nêu điều **khác biệt** (`price: -1`), phần còn lại hợp lệ. Nhờ đó khi test đỏ bạn biết chắc nguyên nhân do giá, không phải do trường khác sai. ISBN và tiêu đề sinh mới mỗi lần gọi nên chạy lại bao nhiêu lần cũng không trùng.

### Bước 5. Dùng faker (tuỳ chọn) để dữ liệu giống thật
Mục đích: tên, địa chỉ, email trông giống thật giúp phát hiện lỗi hiển thị (dấu, độ dài).

Cài thư viện:

```bash
npm i -D @faker-js/faker
```

Dùng trong factory:

```ts
import { faker } from "@faker-js/faker";

export function buildCustomer() {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
  };
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `faker.person.fullName()` | Sinh họ tên ngẫu nhiên. |
| `faker.internet.email()` | Sinh email ngẫu nhiên. |

Cẩn thận: dữ liệu ngẫu nhiên làm lỗi **khó tái hiện**. Hai cách: (1) ghi dữ liệu vào tên test hoặc `test.info().annotations`/log để biết lần nào hỏng; (2) đặt **seed** để dãy số ngẫu nhiên lặp lại: `faker.seed(123)` ở đầu file thì mỗi lần chạy sinh cùng dữ liệu. Nếu chỉ cần email không trùng, `randomUUID` đã đủ và không cần thêm thư viện.

### Bước 6. Dữ liệu độc lập khi chạy song song
Mục đích: kiểm chứng test không đụng nhau.

Chạy các test API ở bước 4 với nhiều worker và lặp lại 5 lần:

```bash
npx playwright test tests/api-data.spec.ts --workers=4 --repeat-each=5
```

| Cờ | Ý nghĩa |
|----|---------|
| `--workers=4` | Chạy tối đa 4 tiến trình song song. |
| `--repeat-each=5` | Lặp **mỗi test** 5 lần; dùng để phát hiện test chập chờn hoặc đụng dữ liệu. |

Kết quả mong đợi: tất cả xanh (ví dụ `10 passed`). Lưu ý riêng của lab: trạng thái API của LAB-14 được giữ trong cookie của **từng client `request`**, và mỗi test có client riêng, nên hai test khác nhau dùng cùng một ISBN cố định vẫn không đụng nhau. Nhưng trên hệ thống thật, nơi mọi test dùng chung một cơ sở dữ liệu, ISBN cố định sẽ gây `409` ngẫu nhiên khi chạy song song hoặc chạy lần hai. Hãy tập thói quen luôn sinh giá trị duy nhất; riêng trong **một test**, tạo hai sách cùng ISBN luôn trả `409`.

## Demo code
`utils/data.ts` hoàn chỉnh:

```ts
import { randomInt, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

export type NewBook = { title: string; author: string; isbn: string; price: number; stock?: number };
export type TestUser = { email: string; password: string };

export function uniqueIsbn(): string {
  return `978-${String(randomInt(0, 10_000_000_000)).padStart(10, "0")}`;
}

export function buildBook(overrides: Partial<NewBook> = {}): NewBook {
  return {
    title: `Sách thử ${randomUUID().slice(0, 6)}`,
    author: "QA Team",
    isbn: uniqueIsbn(),
    price: 100_000,
    ...overrides,
  };
}

export function buildUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    email: `qa+${randomUUID().slice(0, 8)}@lab.dev`,
    password: "Passw0rd!",
    ...overrides,
  };
}

export function readCsv(relativePath: string): Record<string, string>[] {
  const file = path.resolve(__dirname, "..", relativePath);
  const [header, ...rows] = readFileSync(file, "utf8").trim().split(/\r?\n/);
  const names = header.split(",");
  return rows.map((line) => {
    const cells = line.split(",");
    return Object.fromEntries(names.map((n, i) => [n, cells[i] ?? ""]));
  });
}
```

Một fixture tạo sách và **tự dọn** sau test (kết hợp bài 4.3):

```ts
createdBook: async ({ adminApi }, use) => {
  const res = await adminApi.post("/api/lab/books", { data: buildBook() });
  const book = await res.json();

  await use(book);

  await adminApi.delete(`/api/lab/books/${book.id}`);
},
```

Giải thích: trước `use` tạo sách hợp lệ qua API (nhanh hơn thao tác giao diện); test nhận `book` để dùng; sau `use` xoá sách. Test sau không thấy sách của test trước.

## Nguyên tắc
1. Dữ liệu cho test **nằm cạnh test** hoặc trong thư mục `tests/data/`, không rải rác.
2. Đặt tên rõ nghĩa cho giá trị quan trọng (`overLimitPassword`) hoặc cho từng bộ dữ liệu (`name`).
3. Dữ liệu mỗi test **tự tạo và tự dọn**.
4. Không dùng dữ liệu thật hoặc nhạy cảm; email ví dụ dùng miền `example.com` hoặc `lab.dev`.
5. Một bộ dữ liệu = một ý nghĩa kiểm thử; đừng nhồi nhiều lỗi vào một dòng.

## Thử ngay trong lab
Mở `/lab/login` và thử tay 4 mật khẩu của bảng JSON để thấy thông báo thật. Rồi mở `/lab/api` đọc quy tắc của `POST /api/lab/books` (ISBN, giá), thêm vào bảng dữ liệu các ca: giá 0 (hợp lệ), giá 10.000.000 (hợp lệ, biên trên), giá 10.000.001 (422), ISBN sai định dạng (422).

## Lỗi thường gặp
- **Triệu chứng:** chạy song song (hoặc chạy lần hai) trên hệ thống thật báo `409`, hoặc dữ liệu của test này xuất hiện ở test kia. **Nguyên nhân:** cả bộ test dùng chung một tài khoản/ISBN cố định trong cơ sở dữ liệu chung. **Cách sửa:** dùng factory sinh giá trị duy nhất.
- **Triệu chứng:** `Error: duplicate test title`. **Nguyên nhân:** vòng lặp sinh test có tiêu đề trùng. **Cách sửa:** đưa tên bộ dữ liệu vào tiêu đề.
- **Triệu chứng:** `Cannot find module './data/password-cases.json'`. **Nguyên nhân:** đường dẫn sai (tính từ file test) hoặc quên đuôi `.json`. **Cách sửa:** đường dẫn tương đối tính từ file đang import.
- **Triệu chứng:** test đỏ một lần rồi xanh lại, không ai tái hiện được. **Nguyên nhân:** dữ liệu ngẫu nhiên nhưng không ghi lại. **Cách sửa:** đưa dữ liệu vào thông điệp lỗi/tiêu đề hoặc dùng seed.
- **Triệu chứng:** dữ liệu `{ ...overrides, ...defaults }` không bị ghi đè. **Nguyên nhân:** đặt `overrides` **trước** mặc định. **Cách sửa:** mặc định trước, `...overrides` sau.
- **Triệu chứng:** CSV đọc ra ô bị lệch cột. **Nguyên nhân:** ô chứa dấu phẩy. **Cách sửa:** đặt dữ liệu trong dấu ngoặc kép và dùng thư viện `csv-parse`, hoặc chuyển sang JSON.

## Tóm tắt
- Data-driven: một logic, nhiều bộ dữ liệu; mỗi vòng `for` tạo một test riêng có tiêu đề duy nhất.
- Dữ liệu tĩnh để trong `tests/data/*.json` hoặc CSV; dữ liệu sinh động dùng factory.
- Factory đặt giá trị mặc định hợp lệ, `...overrides` cuối cùng để ghi đè phần cần đổi.
- Mỗi test tự tạo và tự dọn dữ liệu; dùng `--workers` và `--repeat-each` để kiểm tra tính độc lập.
- faker tiện nhưng làm lỗi khó tái hiện; dùng seed hoặc ghi lại dữ liệu.

## Bài tập
1. Viết `buildUser` và dùng nó trong ba test khác nhau với phần ghi đè khác nhau (ví dụ mật khẩu yếu, email sai định dạng, mật khẩu hợp lệ). Xong khi không có chuỗi `"user@lab.dev"` cố định nào trong file test của bạn ngoài tài khoản có sẵn của lab.
2. Chuyển mảng dữ liệu mật khẩu sang file JSON như bài và import vào test. Xong khi thêm một dòng JSON làm xuất hiện thêm một test mà không sửa code.
3. Viết `tests/data/coupons.json` cho giỏ hàng LAB-03 (mã `SALE10`, giỏ 250.000 và 500.000) và test lặp trên đó bằng `CartPage.applyCoupon`. Xong khi bảng gồm ít nhất 3 dòng và mỗi dòng nêu giảm giá mong đợi tính bằng tay.
4. Viết test API tạo sách bằng `buildBook`, chạy `--workers=4 --repeat-each=5` không lần nào lỗi. Xong khi bạn giải thích được vì sao `uniqueIsbn` giữ test độc lập trên một hệ thống dùng chung cơ sở dữ liệu.
5. Thử thách: viết fixture `createdBook` tự tạo và tự xoá một sách; dùng nó trong test "sửa giá sách bằng PUT". Xong khi chạy test hai lần liên tiếp đều xanh và trong fixture có bước xoá sách sau `use`.
