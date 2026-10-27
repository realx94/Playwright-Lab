---
title: "API automation đầy đủ: GET, POST, PUT, PATCH, DELETE"
level: 4
order: 13
minutes: 75
summary: Xây bộ test API hoàn chỉnh bằng fixture request - query, body tĩnh và động, token, PUT vs PATCH, DELETE, schema, kiểu TypeScript, ApiClient và dọn dữ liệu.
keywords: [playwright api automation, request fixture, put vs patch, api client typescript, schema validation zod, bearer token]
---

## Mục tiêu bài học
- Dựng một **bộ test API có cấu trúc** gồm: kiểu TypeScript (`interface`), lớp `ApiClient` dùng chung, API object cho từng tài nguyên và fixture của Playwright.
- Gọi đủ năm method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), gửi query parameter, body tĩnh và body **sinh động** (không trùng dữ liệu giữa các lần chạy).
- Làm việc với header và token: đăng nhập lấy token, đặt token một lần rồi dùng lại; phân biệt `401` và `403`.
- Giải thích và kiểm tra được khác biệt **PUT và PATCH**, kể cả khi API không hỗ trợ method đó.
- Kiểm tra status code, header và **schema** của response; dọn dữ liệu sau test kể cả khi test thất bại.

## Bạn cần chuẩn bị
- Đã học bài 4.3 (fixture) và **bài 4.7** (REST, status code, fixture `request`, CRUD cơ bản, API object đơn giản). Bài này không lặp lại phần cơ bản đó; nếu chưa chắc `request.get`, `res.json()`, `toMatchObject` thì xem lại bài 4.7 trước.
- Site lab chạy và `baseURL` đúng. Trang tài liệu API của lab nằm ở `/lab/api` (mô tả lab ở `/labs/api`).
- Cài thêm thư viện kiểm tra schema (dùng ở bước 9):

```bash
npm i -D zod
```

## Kiến thức cần nắm
- Năm method và ý nghĩa: `GET` đọc (không đổi dữ liệu), `POST` tạo mới, `PUT` thay thế, `PATCH` sửa một phần, `DELETE` xoá.
- **Query parameter** đi sau dấu `?`; **body** đi kèm `POST`/`PUT`/`PATCH`; **header** mang thông tin về chính request.
- Token kiểu **Bearer** nằm ở header `Authorization: Bearer <token>`.
- `request.fetch(url, { method })` là hàm tổng quát; `get/post/put/patch/delete` là cách viết tắt.
- Kiểu TypeScript chỉ tồn tại lúc biên dịch: nó giúp gõ code đúng, **không** thay cho assertion lúc chạy.
- Test API tốt tự tạo dữ liệu của mình và tự dọn.

## Giải thích dễ hiểu
Hãy tưởng tượng bạn quản lý một **thư viện**. Năm method là năm loại phiếu bạn đưa thủ thư. `GET` là "cho tôi xem cuốn này" (thủ thư không được đổi gì). `POST` là "nhập cuốn mới vào kho". `PUT` là "thay hẳn thông tin cuốn số 7 bằng phiếu này". `PATCH` là "chỉ sửa giá cuốn số 7, các thông tin khác giữ nguyên". `DELETE` là "bỏ cuốn số 7 khỏi kho".

Khác biệt quan trọng giữa **PUT** và **PATCH** theo chuẩn HTTP: PUT gửi **toàn bộ** bản mô tả mới, trường nào bạn không gửi có thể bị xoá hoặc về mặc định; PATCH chỉ gửi **phần thay đổi**. Trên thực tế nhiều API làm khác chuẩn (API của lab này cho `PUT` chấp nhận body một phần). Vì vậy đừng suy luận từ tên method, hãy **đọc tài liệu API và viết test chứng minh hành vi thật**: gửi một trường rồi đọc lại xem các trường khác còn nguyên không.

Vì sao cần cấu trúc (kiểu, `ApiClient`, API object, fixture)? Ví dụ 30 test cùng gọi `request.post("/api/lab/books", { headers: { Authorization: "Bearer admin-token" }, data: ... })`. Một ngày token đổi tên, bạn phải sửa 30 chỗ. Nếu mọi test đi qua `ApiClient` và `BooksApi`, bạn sửa đúng một chỗ. TypeScript còn bắt lỗi chính tả như `book.titel` ngay lúc gõ.

Sơ đồ các lớp trong bài:

```text
test (assert)  ->  BooksApi (đường dẫn, kiểu)  ->  ApiClient (header, parse JSON)  ->  request (Playwright)
```

## Thực hành từng bước
Ta kiểm tra API sách của LAB-14. Tóm tắt hành vi (đọc từ mã nguồn của lab): `GET /api/lab/books` (phân trang `page`, `pageSize` tối đa 50, tìm `q`), `GET /api/lab/books/{id}`, `POST` tạo (`201` + header `Location`), `PUT /api/lab/books/{id}` sửa, `DELETE /api/lab/books/{id}` xoá (`204`). Ghi cần header `Authorization: Bearer admin-token`; `reader-token` bị `403`; thiếu token bị `401`. `POST /api/lab/reset` đưa dữ liệu về ban đầu. Cấu trúc thư mục:

```text
api/types.ts        kiểu dữ liệu
api/ApiClient.ts    lớp gọi HTTP dùng chung
api/BooksApi.ts     API object cho sách
fixtures.ts         fixture + hàm sinh dữ liệu
tests/api/books.spec.ts
```

### Bước 1. Khai báo kiểu dữ liệu
Mục đích: mô tả hình dạng request và response một lần.

Tạo `api/types.ts`:

```ts
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  price: number;
  stock: number;
}

export type BookInput = Omit<Book, "id" | "stock"> & { stock?: number };

export interface Page<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiError {
  message: string;
  errors?: { field: string; message: string }[];
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `interface Book` | Hình dạng một cuốn sách trả về từ server (có `id` do server sinh). |
| `Omit<Book, ...>` | Loại bỏ các khoá khỏi `Book` (ở đây là `id` và `stock`, liệt kê bằng kiểu hợp). Sau đó `& { stock?: number }` thêm lại `stock` nhưng là tuỳ chọn. |
| `Page<T>` | Kiểu **generic**: một trang kết quả chứa mảng `data` kiểu `T`. `Page<Book>` là trang sách. |
| `ApiError` | Hình dạng lỗi: `message` và (với `422`) mảng `errors` mỗi phần tử có `field`. |

Kết quả mong đợi: file không chạy gì, nhưng trình soạn thảo bắt đầu gợi ý trường khi bạn gõ `book.`.

### Bước 2. Viết `ApiClient` dùng chung
Mục đích: một nơi duy nhất lo header token, parse JSON và trả về kết quả có kiểu.

Tạo `api/ApiClient.ts`:

```ts
import type { APIRequestContext } from "@playwright/test";

export interface ApiResult<T> {
  status: number;
  headers: Record<string, string>;
  body: T;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Params = Record<string, string | number>;

export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token?: string,
  ) {}

  async send<T>(method: Method, path: string, options: { params?: Params; data?: unknown } = {}): Promise<ApiResult<T>> {
    const res = await this.request.fetch(path, {
      method,
      params: options.params,
      data: options.data,
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    });
    const text = await res.text();
    let body: unknown = undefined;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
    return { status: res.status(), headers: res.headers(), body: body as T };
  }

  get<T>(path: string, params?: Params) {
    return this.send<T>("GET", path, { params });
  }
  post<T>(path: string, data: unknown) {
    return this.send<T>("POST", path, { data });
  }
  put<T>(path: string, data: unknown) {
    return this.send<T>("PUT", path, { data });
  }
  patch<T>(path: string, data: unknown) {
    return this.send<T>("PATCH", path, { data });
  }
  delete<T = undefined>(path: string) {
    return this.send<T>("DELETE", path);
  }
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `private readonly token?: string` | Token tuỳ chọn. Có token thì mọi lời gọi tự gắn header; không có thì gọi ẩn danh. |
| `request.fetch(path, { method, ... })` | Hàm tổng quát: truyền method dưới dạng chuỗi. `get/post/...` của Playwright là cách viết gọn của hàm này. |
| `params` | Playwright tự ghép thành `?page=2&pageSize=5` và mã hoá ký tự đặc biệt. |
| `res.text()` rồi `JSON.parse` | Phản hồi `204` không có body, `res.json()` sẽ ném lỗi. Đọc text trước để xử lý được cả body rỗng. |
| `<T>` | Kiểu của `body` do người gọi khai báo, ví dụ `client.get<Page<Book>>(...)`. Đây là **lời hứa** của bạn với trình biên dịch, không phải kiểm tra lúc chạy. |
| `delete<T = undefined>` | Mặc định xoá không có body nên kiểu là `undefined`. |

Kết quả mong đợi: biên dịch không lỗi (Playwright tự biên dịch TypeScript khi chạy test). Nếu bạn thấy `Property 'fetch' does not exist`, bản `@playwright/test` quá cũ: nâng lên phiên bản từ 1.64 trở đi.

### Bước 3. Viết `BooksApi` và fixture
Mục đích: ẩn đường dẫn và token khỏi test; cấp sẵn các "vai" (admin, reader, ẩn danh).

Tạo `api/BooksApi.ts`:

```ts
import type { ApiClient } from "./ApiClient";
import type { ApiError, Book, BookInput, Page } from "./types";

export class BooksApi {
  constructor(private readonly client: ApiClient) {}

  list(params: { page?: number; pageSize?: number; q?: string } = {}) {
    const query = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)) as Record<string, string | number>;
    return this.client.get<Page<Book>>("/api/lab/books", query);
  }
  get(id: string) {
    return this.client.get<Book | ApiError>(`/api/lab/books/${id}`);
  }
  create(input: BookInput) {
    return this.client.post<Book | ApiError>("/api/lab/books", input);
  }
  update(id: string, input: Partial<BookInput>) {
    return this.client.put<Book | ApiError>(`/api/lab/books/${id}`, input);
  }
  remove(id: string) {
    return this.client.delete(`/api/lab/books/${id}`);
  }
}
```

Tạo `fixtures.ts`:

```ts
import { test as base, expect } from "@playwright/test";
import { ApiClient } from "./api/ApiClient";
import { BooksApi } from "./api/BooksApi";
import type { Book, BookInput } from "./api/types";

let counter = 0;

/** Sinh dữ liệu động: ISBN duy nhất mỗi lần gọi. */
export function makeBook(over: Partial<BookInput> = {}): BookInput {
  counter += 1;
  const unique = `${Date.now()}${counter}`.slice(-10).padStart(10, "0");
  return { title: `Sách thử ${unique}`, author: "QA Team", isbn: `978-${unique}`, price: 100000, ...over };
}

type Fixtures = {
  admin: BooksApi;
  reader: BooksApi;
  anonymous: BooksApi;
  newBook: Book;
};

export const test = base.extend<Fixtures>({
  admin: async ({ request }, use) => {
    await use(new BooksApi(new ApiClient(request, "admin-token")));
  },
  reader: async ({ request }, use) => {
    await use(new BooksApi(new ApiClient(request, "reader-token")));
  },
  anonymous: async ({ request }, use) => {
    await use(new BooksApi(new ApiClient(request)));
  },
  newBook: async ({ admin }, use) => {
    const created = await admin.create(makeBook());
    expect(created.status).toBe(201);
    const book = created.body as Book;
    await use(book);
    await admin.remove(book.id);
  },
});

export { expect };
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `Partial<BookInput>` | Mọi trường thành tuỳ chọn: dùng cho "sửa một phần". |
| `makeBook(over)` | Hàm sinh **body động**: ISBN gồm 10 chữ số lấy từ thời gian và bộ đếm nên không bao giờ trùng giữa các lần chạy. `...over` cho phép ghi đè từng trường (ví dụ giá âm). |
| `base.extend<Fixtures>` | Khai báo fixture (xem bài 4.3). `admin`, `reader`, `anonymous` chỉ khác token. |
| `newBook` | Fixture **tạo trước, dọn sau**: phần trước `use` chạy trước test, phần sau `use` chạy sau test, kể cả khi test đỏ. |

Kết quả mong đợi: chưa có test nên chưa chạy; các file biên dịch được.

### Bước 4. GET danh sách với query parameters
Mục đích: kiểm tra phân trang, giới hạn và tìm kiếm.

Tạo `tests/api/books.spec.ts` (các import dùng chung cho các bước sau):

```ts
import { test, expect, makeBook } from "../../fixtures";
import type { ApiError, Book } from "../../api/types";

test("GET danh sách trang 2, mỗi trang 5", async ({ admin }) => {
  const res = await admin.list({ page: 2, pageSize: 5 });

  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toContain("application/json");
  expect(res.body.data.map((b) => b.id)).toEqual(["b-6", "b-7", "b-8", "b-9", "b-10"]);
  expect(res.body).toMatchObject({ page: 2, pageSize: 5, total: 12 });
});

test("GET tìm kiếm q=clean", async ({ admin }) => {
  const res = await admin.list({ q: "clean" });
  expect(res.body.total).toBe(2);
});
```

Chạy:

```bash
npx playwright test tests/api/books.spec.ts
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `admin.list({ page: 2, pageSize: 5 })` | Gửi `GET /api/lab/books?page=2&pageSize=5`. |
| `res.body.data.map((b) => b.id)` | Nhờ kiểu `Page<Book>`, `b` có kiểu `Book` và trình soạn thảo gợi ý `id`. |
| `res.headers["content-type"]` | Tên header luôn viết thường. |

Kết quả mong đợi: `2 passed`. Nếu `total` khác 12, dữ liệu lab đang bị thay đổi bởi test khác trong cùng cookie; mỗi test của Playwright có `request` riêng nên thường không xảy ra, trừ khi bạn dùng `newContext` chung.

### Bước 5. GET theo id và lỗi 404
Mục đích: đọc một bản ghi, kiểm tra cả trường hợp không có.

```ts
test("GET theo id", async ({ admin }) => {
  const found = await admin.get("b-1");
  expect(found.status).toBe(200);
  expect((found.body as Book).title).toBe("Clean Code");

  const missing = await admin.get("b-999");
  expect(missing.status).toBe(404);
  expect((missing.body as ApiError).message).toBe("Không tìm thấy sách");
});
```

Giải thích: `body` có kiểu `Book | ApiError` nên phải **thu hẹp kiểu** bằng `as Book` hoặc `as ApiError` sau khi bạn đã kiểm tra `status`. Cách chặt hơn là viết hàm kiểm tra kiểu (type guard), nhưng với test thì `as` sau khi assert status là đủ. Kết quả mong đợi: test xanh.

### Bước 6. POST với body tĩnh và động, tự dọn dữ liệu
Mục đích: tạo bản ghi, kiểm tra `201`, `Location`, và dọn.

```ts
test("POST tạo sách (body tĩnh)", async ({ admin }) => {
  const created = await admin.create({ title: "Sách tĩnh", author: "QA Team", isbn: "978-1111111111", price: 90000 });

  expect(created.status).toBe(201);
  const book = created.body as Book;
  expect(created.headers["location"]).toBe(`/api/lab/books/${book.id}`);
  expect(book).toMatchObject({ title: "Sách tĩnh", stock: 0 });

  await admin.remove(book.id); // dọn dẹp
});

test("POST tạo sách (body động từ fixture)", async ({ newBook, admin }) => {
  expect(newBook.id).toMatch(/^b-1\d\d$/);
  const read = await admin.get(newBook.id);
  expect(read.status).toBe(200);
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| Body tĩnh | ISBN cố định: lần thứ hai chạy trong cùng dữ liệu sẽ bị `409` nếu chưa dọn. Dùng khi dữ liệu thật sự cần cố định. |
| `newBook` | Fixture đã tạo sách bằng `makeBook()` (ISBN động) và sẽ xoá sau test. Test chỉ nhận một đối tượng `Book` sẵn có. |
| `location` | Header trỏ tới tài nguyên mới: kiểm tra đúng id. |

Kết quả mong đợi: `2 passed`. Lưu ý: nếu test tĩnh đỏ trước dòng `remove`, sách còn sót lại; đó là lý do nên chuyển sang fixture (bước 11).

### Bước 7. Header và token: ba vai trò
Mục đích: kiểm tra quyền.

```ts
test("ghi dữ liệu: 401 khi ẩn danh, 403 khi chỉ đọc, 422 khi dữ liệu sai", async ({ anonymous, reader, admin }) => {
  expect((await anonymous.create(makeBook())).status).toBe(401);
  expect((await reader.create(makeBook())).status).toBe(403);
  expect((await reader.remove("b-1")).status).toBe(403);

  const invalid = await admin.create(makeBook({ price: -5 }));
  expect(invalid.status).toBe(422);
  expect((invalid.body as ApiError).errors?.map((e) => e.field)).toEqual(["price"]);
});
```

Mỗi `ApiClient` gắn token một lần trong constructor nên test không phải nhớ header. Ba giá trị `401`, `403`, `422` đã được giải thích ở bài 4.7; ở đây trọng tâm là cách tổ chức: đổi vai chỉ cần đổi fixture.

Kết quả mong đợi: test xanh.

### Bước 8. Đăng nhập lấy token rồi dùng lại
Mục đích: luồng thật của hầu hết hệ thống: gọi API đăng nhập, lấy token, đính vào các lời gọi sau.

Lab có endpoint đăng nhập ở LAB-24 (`POST /api/lab/guard/login`, tài khoản `user@lab.dev` / `Passw0rd!`). Nó trả `{ token: "session-ok", email }`. Ta dùng nó làm ví dụ luồng:

```ts
import { test as base, expect as pwExpect } from "@playwright/test";
import { ApiClient } from "../../api/ApiClient";

base("đăng nhập lấy token rồi dùng lại", async ({ request }) => {
  const login = await request.post("/api/lab/guard/login", {
    data: { email: "user@lab.dev", password: "Passw0rd!" },
  });
  pwExpect(login.status()).toBe(200);
  const { token } = (await login.json()) as { token: string };
  pwExpect(token).toBeTruthy();

  // dùng lại token cho mọi lời gọi tiếp theo qua ApiClient
  const client = new ApiClient(request, token);
  const res = await client.get<unknown>("/api/lab/rbac/docs");
  console.log("status với token của dịch vụ khác:", res.status);
});
```

Quan sát: token `session-ok` của dịch vụ guard **không** được tài liệu RBAC chấp nhận, nên lời gọi cuối trả `401`. Điều này đúng thực tế: token chỉ có giá trị với hệ thống đã cấp nó. Với sách, token cố định `admin-token`; với RBAC, token là tên người dùng (`alice`, `bob`...). Mẫu chung bạn mang đi: đăng nhập một lần trong fixture (hoặc `globalSetup`), đưa token vào `ApiClient`, cho phần còn lại của test dùng.

Mẹo cấu hình: nếu **mọi** request cùng một token, đặt trong `playwright.config.ts`:

```ts
use: {
  baseURL: process.env.BASE_URL,
  extraHTTPHeaders: { Authorization: `Bearer ${process.env.API_TOKEN}` },
},
```

Khi đó fixture `request` tự gắn header; không cần `ApiClient` thêm token. Không bao giờ ghi token thật vào code, dùng biến môi trường (xem bài 4.4).

### Bước 9. Kiểm tra schema của response bằng zod
Mục đích: kiểm tra mọi bản ghi có đúng hình dạng, thiếu hoặc thừa trường đều đỏ.

```ts
import { z } from "zod";

const BookSchema = z
  .object({
    id: z.string().regex(/^b-\d+$/),
    title: z.string(),
    author: z.string(),
    isbn: z.string().regex(/^978-\d{10}$/),
    price: z.number().int(),
    stock: z.number().int(),
  })
  .strict();

test("mọi sách khớp schema", async ({ admin }) => {
  const res = await admin.list({ pageSize: 50 });
  for (const book of res.body.data) {
    BookSchema.parse(book); // ném lỗi chi tiết nếu sai
  }
  expect(BookSchema.safeParse({ id: "b-1" }).success).toBe(false);
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `z.object({...})` | Mô tả hình dạng đối tượng. |
| `.strict()` | Trường thừa không khai báo cũng bị coi là lỗi (hợp để phát hiện API tự ý thêm trường). |
| `parse` | Trả dữ liệu nếu đúng, **ném lỗi** nêu rõ đường dẫn trường sai nếu không. |
| `safeParse` | Không ném lỗi; trả `{ success: false, error }`: dùng để chứng minh schema thật sự bắt lỗi. |

Kiểu TypeScript khác schema: interface chỉ giúp lúc gõ code; schema zod kiểm tra dữ liệu **thật** lúc chạy. Có thể sinh kiểu từ schema bằng `z.infer<typeof BookSchema>` để không viết hai lần. Kết quả mong đợi: test xanh; thử đổi `.strict()` bỏ trường `stock` khỏi schema rồi chạy lại sẽ thấy đỏ (trường thừa).

### Bước 10. PUT và PATCH: kiểm tra bằng thực nghiệm
Mục đích: không đoán hành vi, chứng minh nó.

Với sách, API chỉ có `PUT` nhưng nhận body một phần. Test chứng minh các trường khác giữ nguyên:

```ts
test("PUT /books/{id} với một trường: trường khác giữ nguyên", async ({ newBook, admin }) => {
  const updated = await admin.update(newBook.id, { price: 250000 });

  expect(updated.status).toBe(200);
  expect(updated.body).toEqual({ ...newBook, price: 250000 });

  const reread = await admin.get(newBook.id);
  expect((reread.body as Book).price).toBe(250000);
});
```

Giải thích: `{ ...newBook, price: 250000 }` là sách cũ với giá mới; `toEqual` so khớp toàn bộ nên xác nhận `title`, `author`, `isbn`, `stock` không đổi. Đọc lại bằng `GET` xác nhận thay đổi đã lưu thật, không chỉ nằm trong response.

Nếu gửi `PATCH` tới đường dẫn sách thì sao? Route sách không cài `PATCH`, nên server trả **`405 Method Not Allowed`**:

```ts
test("PATCH tới books bị từ chối 405", async ({ newBook, request }) => {
  const res = await request.patch(`/api/lab/books/${newBook.id}`, {
    headers: { Authorization: "Bearer admin-token" },
    data: { price: 1 },
  });
  expect(res.status()).toBe(405);
});
```

Một API thật sự dùng `PATCH` trong lab là tài liệu RBAC (LAB-26), nơi `PATCH` đổi tiêu đề:

```ts
base("PATCH đổi tiêu đề tài liệu", async ({ request }) => {
  const alice = { Authorization: "Bearer alice" };

  const ok = await request.patch("/api/lab/rbac/docs/d-a1", { headers: alice, data: { title: "Kế hoạch mới" } });
  pwExpect(ok.status()).toBe(200);
  pwExpect(await ok.json()).toEqual({ id: "d-a1", tenant: "A", title: "Kế hoạch mới", owner: "alice" });

  const forbidden = await request.patch("/api/lab/rbac/docs/d-a1", { headers: { Authorization: "Bearer dave" }, data: { title: "x" } });
  pwExpect(forbidden.status()).toBe(403);

  const otherTenant = await request.patch("/api/lab/rbac/docs/d-b1", { headers: alice, data: { title: "x" } });
  pwExpect(otherTenant.status()).toBe(404);
});
```

Kết quả mong đợi: các test xanh. Trường hợp cuối cho thấy `404` thay vì `403` khi sửa tài liệu của tổ chức khác: server giấu sự tồn tại (xem lab `/labs/rbac`).

Bảng tóm tắt khi viết test cho PUT và PATCH:

| Câu hỏi cần kiểm tra | Cách chứng minh |
|----------------------|-----------------|
| Trường không gửi có bị mất không | Gửi một trường, đọc lại toàn bộ bản ghi và so sánh |
| Method nào được hỗ trợ | Gọi thử; không hỗ trợ thì mong `405` |
| Thay đổi có lưu thật không | `GET` lại sau khi sửa |
| Dữ liệu sai có bị chặn | Gửi giá âm hoặc kiểu sai, mong `422` và `errors` |
| Ai được sửa | Thử với token đủ quyền, thiếu quyền, không token |

### Bước 11. DELETE và dọn dữ liệu bền vững
Mục đích: xoá đúng, và bảo đảm dọn kể cả khi test đỏ.

```ts
test("DELETE xoá sách: 204 rồi 404", async ({ newBook, admin }) => {
  const removed = await admin.remove(newBook.id);
  expect(removed.status).toBe(204);
  expect(removed.body).toBeUndefined();

  expect((await admin.get(newBook.id)).status).toBe(404);
});
```

Lưu ý: ở test này fixture `newBook` sẽ cố xoá lần nữa sau test và nhận `404`. Fixture không kiểm tra status của lần dọn cuối nên không đỏ; đó là cách dọn **an toàn**: dọn nên chịu được trường hợp đã bị xoá.

Nguyên tắc dọn dữ liệu:
- Dọn trong phần sau `use()` của fixture, không ở cuối thân test (test đỏ giữa chừng sẽ bỏ qua dòng dọn).
- Hàm dọn không `expect` mạnh tay; chấp nhận bản ghi đã không còn.
- Với hệ thống dùng chung (staging), đặt tiền tố nhận biết (ví dụ `Sách thử`) để người dọn thủ công biết đâu là dữ liệu test.
- Lab này lưu trạng thái trong cookie của client `request`, nên mỗi test tự cô lập; hệ thống thật dùng cơ sở dữ liệu chung thì dọn là bắt buộc.

### Bước 12. Thêm request tuỳ chọn: lỗi tự động và thời gian chờ
Mục đích: biết hai tuỳ chọn hay dùng.

```ts
base("failOnStatusCode và newContext có header mặc định", async ({ playwright, baseURL }) => {
  const api = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { Authorization: "Bearer admin-token" },
  });

  const created = await api.post("/api/lab/books", { data: makeBook() });
  await pwExpect(created).toBeOK();

  await pwExpect(api.get("/api/lab/books/b-999", { failOnStatusCode: true })).rejects.toThrow(/404/);

  await api.dispose();
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `playwright.request.newContext({...})` | Tạo client riêng, có cookie jar riêng và header mặc định. Phải `dispose()` khi xong. |
| `await expect(response).toBeOK()` | Assertion có sẵn: đỏ nếu status ngoài 200 đến 299 và in nội dung response để dễ debug. |
| `failOnStatusCode: true` | Request tự ném lỗi nếu status là 4xx hoặc 5xx. Hợp cho bước chuẩn bị mà bạn **không** muốn đi tiếp khi thất bại. |
| `{ timeout: 5000 }` | Tuỳ chọn của từng lời gọi để giới hạn thời gian chờ; mặc định là 0, nghĩa là không giới hạn riêng (test vẫn bị giới hạn bởi timeout của test). |

Kết quả mong đợi: test xanh.

## Demo code
Bộ file hoàn chỉnh đã nằm ở các bước 1 đến 3 (kiểu, `ApiClient`, `BooksApi`, fixture). Spec tổng hợp `tests/api/books.spec.ts` gom các test chính:

```ts
import { test, expect, makeBook } from "../../fixtures";
import type { ApiError, Book } from "../../api/types";

test.describe("API sách", () => {
  test("danh sách phân trang", async ({ admin }) => {
    const res = await admin.list({ page: 2, pageSize: 5 });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.total).toBe(12);
  });

  test("tạo, sửa, xoá một cuốn sách", async ({ admin }) => {
    const created = await admin.create(makeBook({ price: 100000 }));
    expect(created.status).toBe(201);
    const { id } = created.body as Book;

    const updated = await admin.update(id, { price: 120000 });
    expect((updated.body as Book).price).toBe(120000);

    expect((await admin.remove(id)).status).toBe(204);
    expect((await admin.get(id)).status).toBe(404);
  });

  test("ghi dữ liệu cần đúng quyền", async ({ anonymous, reader }) => {
    expect((await anonymous.create(makeBook())).status).toBe(401);
    expect((await reader.create(makeBook())).status).toBe(403);
  });

  test("dữ liệu sai trả 422 kèm trường lỗi", async ({ admin }) => {
    const res = await admin.create(makeBook({ price: -1 }));
    expect(res.status).toBe(422);
    expect((res.body as ApiError).errors?.[0].field).toBe("price");
  });
});
```

Ghi chú: các test trên đã được chạy thử trên site lab (dev server) và đều xanh; riêng ví dụ đăng nhập (bước 8) trả `401` ở lời gọi cuối, đúng như mô tả.

## Thử ngay trong lab
- Mở `/lab/api` và đọc bảng endpoint. Sau đó thử bật `?bugs=BUG-02` bằng cách gọi `POST /api/lab/books?bugs=BUG-02` trong một test: mong `201` nhưng nhận `200`, test của bạn phải đỏ. Thử tương tự `BUG-03` với `DELETE /api/lab/books/b-999`: mong `404` nhưng nhận `204`.
- Đọc `/labs/api` để xem quy tắc nghiệp vụ và danh sách bug gợi ý của lab.

## Lỗi thường gặp
- **`SyntaxError: Unexpected end of JSON input`** khi `res.json()`: response `204` hoặc rỗng. Đọc `res.text()` trước (như `ApiClient`) hoặc chỉ gọi `json()` khi status có body.
- **`405 Method Not Allowed`** khi gọi `PATCH`: API chỉ cài `PUT`. Đọc tài liệu endpoint, đừng giả định cả hai đều có.
- **`409 Conflict` ở lần chạy thứ hai**: ISBN tĩnh đã tồn tại vì lần trước không dọn. Dùng dữ liệu động (`makeBook`) và dọn bằng fixture.
- **`401` dù đã đặt token**: sai tiền tố (thiếu `Bearer `), token của dịch vụ khác, hoặc token hết hạn. In `res.headers()` và thử gọi bằng công cụ khác để chắc chắn.
- **`apiRequestContext.fetch: Request timed out`**: server không phản hồi trong thời gian cho phép. Kiểm tra `BASE_URL` và server; không tăng timeout để che lỗi.
- **Kiểu đúng nhưng test vẫn sai**: `as Book` không kiểm tra gì lúc chạy. Nếu server trả hình dạng khác, hãy thêm kiểm tra schema (bước 9).
- **Dữ liệu "biến mất" giữa các test**: lab giữ trạng thái trong cookie của từng client `request`; test sau không thấy dữ liệu test trước. Đó là cô lập có chủ đích, không phải lỗi.

## Tóm tắt
- Tách lớp: kiểu (`types.ts`), `ApiClient` (header, parse), API object (đường dẫn), fixture (vai trò và dọn dẹp) để test ngắn và dễ đọc.
- Dùng `request.fetch` với `method` để viết một hàm gửi chung; xử lý được body rỗng (`204`).
- PUT và PATCH phải được **chứng minh bằng test**: gửi một trường rồi đọc lại toàn bộ bản ghi; method không hỗ trợ phải trả `405`.
- Token đặt một lần (trong `ApiClient`, `extraHTTPHeaders` hoặc fixture đăng nhập); luôn kiểm tra cả `401` và `403`.
- Kiểu TypeScript giúp lúc gõ, schema (zod) kiểm tra dữ liệu thật; nên dùng cả hai ở nơi quan trọng.
- Dữ liệu động và dọn trong fixture giúp test chạy lặp lại được và không để rác.

## Bài tập
1. Viết test `GET` phân trang cho trang cuối (`page=3`) và cho `pageSize=999`; xong khi test kiểm tra `data` chỉ còn 2 phần tử và `pageSize` bị giới hạn ở 50.
2. Thêm hàm `makeBook` có thể sinh ISBN theo yêu cầu và viết test `409` bằng cách tạo hai sách cùng ISBN; xong khi test tự dọn cả hai và chạy lặp lại 3 lần vẫn xanh.
3. Viết test chứng minh `PUT` một phần giữ nguyên trường khác, rồi bổ sung kiểm tra `422` khi sửa `price` thành số âm và `404` khi sửa id không tồn tại; xong khi mỗi trường hợp có assertion về status và nội dung lỗi.
4. Dùng `z.infer` để sinh kiểu `Book` từ schema zod và thay `interface Book`; xong khi `ApiClient` vẫn biên dịch và mọi test xanh.
5. Viết fixture `adminClient` đăng nhập qua `POST /api/lab/guard/login`, lưu token và dùng lại cho nhiều test (chia sẻ trong một worker bằng fixture phạm vi `worker`); xong khi chỉ có một lời gọi đăng nhập cho mỗi worker.
