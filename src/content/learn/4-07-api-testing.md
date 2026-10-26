---
title: API Testing với Playwright
level: 4
order: 7
minutes: 55
summary: REST, method, status code, header, body; dùng fixture request để kiểm tra API và schema.
keywords: [rest api là gì, playwright api testing, status code]
---

## Mục tiêu bài học
- Đọc được một request/response HTTP: method, URL, query, header, body, status code.
- Viết test API bằng fixture `request` cho **API thật của site lab** (`/api/lab/books`): đọc danh sách, phân trang, tìm kiếm.
- Kiểm tra đủ bộ trường hợp của một endpoint: thành công, `401`, `403`, `404`, `422` kèm trường lỗi, `409`, `400`.
- Chạy được vòng đời CRUD (tạo, đọc, sửa, xoá) và tự dọn dữ liệu.
- Gói các lời gọi lặp thành một lớp helper (**API object**) dùng chung cho nhiều test.

## Bạn cần chuẩn bị
- Đã học bài 4.1 đến 4.6; biết `test`, `expect`, `async/await`.
- Site lab chạy, trang tài liệu `/lab/api` mở được (có bảng endpoint). Biến `BASE_URL` đúng, vì `request` cũng dùng `baseURL`.
- Biết JSON ở mức đọc hiểu: đối tượng `{ "key": value }`, mảng `[...]`.

## Kiến thức cần nắm
- **REST**: tài nguyên + method (`GET` đọc, `POST` tạo, `PUT`/`PATCH` sửa, `DELETE` xoá).
- **Status code**: 2xx thành công (200, 201, 204), 3xx chuyển hướng, 4xx lỗi phía client (400, 401, 403, 404, 409, 422), 5xx lỗi máy chủ.
- **Header** (ví dụ `Authorization`, `Content-Type`, `Location`) và **body** (thường JSON).
- Fixture **`request`**: gửi HTTP không cần mở trình duyệt, rất nhanh.
- Kiểm tra: status, header, nội dung body, cấu trúc (schema), thời gian phản hồi.
- `request` giữ **cookie** giữa các lời gọi trong cùng một test (như một trình duyệt tí hon); mỗi test có client riêng.

## Giải thích dễ hiểu
Website giống **nhà hàng**; giao diện là thực đơn và phục vụ bàn, còn API là **cửa sổ giao đồ với nhà bếp**. UI test là ngồi bàn gọi món; API test là đứng ở cửa sổ nhà bếp đưa phiếu và kiểm tra món trả ra có đúng không, nhanh hơn nhiều vì không cần trang trí bàn ăn.

Mỗi lời gọi API gồm hai nửa. **Request** (phiếu gọi món): món gì (method + URL), kèm thẻ khách hàng (header `Authorization`), kèm yêu cầu chi tiết (body JSON). **Response** (món trả ra): mã kết quả (status), nhãn trên hộp (header) và nội dung (body).

Status code là ngôn ngữ chung để nhà bếp nói "chuyện gì xảy ra". Cần nhớ nhất:

| Mã | Tên thường gọi | Ý nghĩa ngắn |
|----|----------------|--------------|
| 200 | OK | Thành công, có nội dung trả về. |
| 201 | Created | Đã tạo mới (thường kèm header `Location` chỉ tới tài nguyên mới). |
| 204 | No Content | Thành công và không có nội dung (hay dùng cho xoá). |
| 400 | Bad Request | Yêu cầu hỏng cấu trúc (ví dụ JSON sai cú pháp). |
| 401 | Unauthorized | Chưa đăng nhập hoặc token sai. |
| 403 | Forbidden | Có đăng nhập nhưng **không đủ quyền**. |
| 404 | Not Found | Không có tài nguyên đó. |
| 409 | Conflict | Xung đột với dữ liệu hiện có (ví dụ trùng khoá). |
| 422 | Unprocessable | Cấu trúc đúng nhưng **dữ liệu không hợp lệ** (giá âm, ISBN sai). |

Vì sao test API tách khỏi test UI? Một lỗi quy tắc nghiệp vụ (giá âm vẫn tạo được sách) có thể xảy ra ở API dù giao diện đã chặn. Kiểm tra ở tầng API vừa nhanh (mili giây), vừa ổn định (không phụ thuộc giao diện), vừa chạm đúng tầng chứa luật.

## Thực hành từng bước
Ta kiểm tra API thật của LAB-14 (tài liệu: `/lab/api`). Các endpoint chính:

| Endpoint | Ý nghĩa | Quyền |
|----------|---------|-------|
| `GET /api/lab/books` | Danh sách, phân trang, tìm kiếm (`page`, `pageSize`, `q`) | Mở |
| `GET /api/lab/books/{id}` | Một cuốn sách | Mở |
| `POST /api/lab/books` | Tạo sách | Token `admin-token` |
| `PUT /api/lab/books/{id}` | Sửa (một phần) | Token `admin-token` |
| `DELETE /api/lab/books/{id}` | Xoá | Chỉ `admin-token` |
| `POST /api/lab/reset` | Đưa dữ liệu về ban đầu (204) | Mở |

Token có hai giá trị: `Bearer admin-token` (đủ quyền) và `Bearer reader-token` (chỉ đọc, ghi sẽ bị `403`). Cấu trúc thư mục ta tạo: `tests/api/books.spec.ts` và `api/BooksApi.ts`.

### Bước 1. Test GET đầu tiên: danh sách sách
Mục đích: gửi request và đọc response.

Tạo `tests/api/books.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("GET /api/lab/books trả trang đầu", async ({ request }) => {
  const res = await request.get("/api/lab/books");

  expect(res.status()).toBe(200);

  const body = await res.json();
  expect(body.page).toBe(1);
  expect(body.pageSize).toBe(5);
  expect(body.total).toBe(12);
  expect(body.data).toHaveLength(5);
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `{ request }` | Fixture client HTTP có sẵn; tự dùng `baseURL` của config nên đường dẫn viết tương đối. |
| `request.get(url)` | Gửi `GET`, trả về **`APIResponse`**. Phải `await`. |
| `res.status()` | Mã trạng thái (số). |
| `await res.json()` | Đọc body và phân tích thành đối tượng JavaScript. Phải `await` vì đọc body bất đồng bộ. |
| `toHaveLength(5)` | Mảng đúng 5 phần tử. |

Chạy:

```bash
npx playwright test tests/api/books.spec.ts
```

Kết quả mong đợi:

```text
Running 1 test using 1 worker
  1 passed (0.9s)
```

Nếu gặp lỗi: `apiRequestContext.get: connect ECONNREFUSED 127.0.0.1:3000` nghĩa là site chưa chạy hoặc `BASE_URL` sai. `SyntaxError: Unexpected token '<'` khi `res.json()` nghĩa là bạn gọi nhầm đường dẫn nên nhận về HTML của trang lỗi, hãy in `await res.text()` để xem.

### Bước 2. Tham số truy vấn, header và so khớp cấu trúc
Mục đích: gửi `page`, `pageSize`, `q` và kiểm tra nhiều thứ cùng lúc.

```ts
test("phân trang: trang 2, mỗi trang 5 sách", async ({ request }) => {
  const res = await request.get("/api/lab/books", { params: { page: 2, pageSize: 5 } });

  expect(res.ok()).toBeTruthy();
  expect(res.headers()["content-type"]).toContain("application/json");

  const body = await res.json();
  expect(body).toMatchObject({ page: 2, pageSize: 5, total: 12 });
  expect(body.data[0]).toEqual({
    id: "b-6",
    title: "Test Driven Development",
    author: "Kent Beck",
    isbn: "978-0321146533",
    price: 380000,
    stock: 10,
  });
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `{ params: { page: 2, pageSize: 5 } }` | Playwright ghép thành `?page=2&pageSize=5` và mã hoá đúng cách. Không tự nối chuỗi. |
| `res.ok()` | `true` khi status từ 200 đến 299. |
| `res.headers()` | Đối tượng header; **tên header viết thường** (`content-type`). |
| `toMatchObject({...})` | Body phải **chứa** các trường này (có thể còn trường khác). Hợp để kiểm tra phần quan trọng. |
| `toEqual({...})` | So khớp **toàn bộ** đối tượng. Dùng cho một bản ghi biết rõ nội dung. |

Cũng nên có các ca biên và đặc biệt của phân trang, đúng với dữ liệu của lab (12 sách, mỗi trang 5):

```ts
test("trang cuối chỉ còn 2 sách", async ({ request }) => {
  const body = await (await request.get("/api/lab/books?page=3")).json();
  expect(body.data).toHaveLength(2);
});

test("pageSize quá lớn bị chặn ở 50", async ({ request }) => {
  const body = await (await request.get("/api/lab/books?pageSize=999")).json();
  expect(body.pageSize).toBe(50);
});

test("tìm kiếm không phân biệt hoa thường", async ({ request }) => {
  const body = await (await request.get("/api/lab/books?q=clean")).json();
  expect(body.total).toBe(2); // Clean Code và Clean Architecture
});
```

Kết quả mong đợi: bốn test xanh. Dòng `await (await request.get(...)).json()` là cách viết gọn: `await` ngoài cùng đợi `json()`, `await` trong đợi response.

### Bước 3. Kiểm tra cấu trúc (schema) không phụ thuộc giá trị cụ thể
Mục đích: kiểm tra "hình dạng" dữ liệu khi giá trị thay đổi.

```ts
test("mọi sách có đủ trường đúng kiểu", async ({ request }) => {
  const body = await (await request.get("/api/lab/books?pageSize=50")).json();

  for (const book of body.data) {
    expect(book).toEqual({
      id: expect.stringMatching(/^b-\d+$/),
      title: expect.any(String),
      author: expect.any(String),
      isbn: expect.stringMatching(/^978-\d{10}$/),
      price: expect.any(Number),
      stock: expect.any(Number),
    });
  }
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `expect.any(String)` | Khớp bất kỳ chuỗi. Dùng khi chỉ cần đúng kiểu. |
| `expect.stringMatching(/.../)` | Khớp chuỗi theo biểu thức chính quy; ở đây bắt mã `b-1`, `b-101`... và ISBN đúng dạng. |
| `toEqual` với `expect.xxx` | `toEqual` bên trong cho phép lồng các bộ so khớp "mềm" này. Nếu thiếu trường hoặc thừa trường thì đỏ. |

Với API lớn, bạn có thể dùng thư viện kiểm tra schema (ví dụ `zod`) để mô tả một lần rồi dùng ở nhiều test; với số lượng ít như bài này, `expect.any` đủ dùng.

### Bước 4. Test xác thực và phân quyền: 401, 403, 404
Mục đích: kiểm tra quy tắc ai được làm gì.

```ts
const book = { title: "Sách thử", author: "QA Team", isbn: "978-3333333333", price: 100000 };

test("401 khi không có token", async ({ request }) => {
  const res = await request.post("/api/lab/books", { data: book });
  expect(res.status()).toBe(401);
});

test("403 khi dùng token chỉ đọc", async ({ request }) => {
  const reader = { Authorization: "Bearer reader-token" };

  const create = await request.post("/api/lab/books", { headers: reader, data: book });
  const remove = await request.delete("/api/lab/books/b-1", { headers: reader });

  expect(create.status()).toBe(403);
  expect(remove.status()).toBe(403);
});

test("404 khi sách không tồn tại", async ({ request }) => {
  const res = await request.get("/api/lab/books/b-999");
  expect(res.status()).toBe(404);
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `{ data: book }` | Playwright biến đối tượng thành **JSON** và tự đặt `Content-Type: application/json`. |
| `{ headers: { Authorization: "Bearer ..." } }` | Gắn header xác thực cho lời gọi này. |
| 401 và 403 khác nhau | 401: không biết bạn là ai. 403: biết bạn là ai nhưng không cho phép. Hai test này kiểm tra hai tình huống khác nhau. |

Lưu ý quan trọng khi gặp lỗi 4xx: mặc định `request` **không ném lỗi** khi status là 4xx hay 5xx (bạn tự kiểm tra bằng `status()`). Nếu muốn ném lỗi ngay, thêm `failOnStatusCode: true` trong tuỳ chọn.

### Bước 5. Kiểm tra dữ liệu không hợp lệ: 422, 409, 400
Mục đích: kiểm tra luật nghiệp vụ và thông báo lỗi.

```ts
const admin = { Authorization: "Bearer admin-token" };

test("422 kèm danh sách trường lỗi", async ({ request }) => {
  const res = await request.post("/api/lab/books", {
    headers: admin,
    data: { title: "", author: "", isbn: "x", price: -1 },
  });

  expect(res.status()).toBe(422);
  const body = await res.json();
  const fields = body.errors.map((e: { field: string }) => e.field);
  expect(fields.sort()).toEqual(["author", "isbn", "price", "title"]);
});

test("409 khi trùng ISBN", async ({ request }) => {
  const res = await request.post("/api/lab/books", {
    headers: admin,
    data: { title: "Bản sao", author: "QA Team", isbn: "978-0132350884", price: 100000 },
  });
  expect(res.status()).toBe(409);
});

test("400 khi body không phải JSON hợp lệ", async ({ request }) => {
  const res = await request.post("/api/lab/books", {
    headers: { ...admin, "content-type": "application/json" },
    data: Buffer.from("{not json"),
  });
  expect(res.status()).toBe(400);
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `body.errors.map(...)` | API trả mảng `errors` gồm `{ field, message }`; test kiểm tra **tên trường** bị báo lỗi. |
| `.sort()` | Thứ tự trường không quan trọng nên sắp xếp trước khi so sánh. |
| ISBN `978-0132350884` | ISBN của sách `b-1` (Clean Code) đã có sẵn, nên tạo trùng bị `409`. |
| `Buffer.from("{not json")` + header | Gửi **byte thô** không phải JSON hợp lệ. Nếu truyền chuỗi/đối tượng, Playwright có thể tự xử lý; dùng `Buffer` để chắc chắn body sai cú pháp được gửi đi nguyên văn. |

Cũng nên kiểm tra thông báo không lộ chi tiết nội bộ (đường dẫn file, stack trace): đọc `body.message` và chắc chắn nó là câu dành cho người dùng.

### Bước 6. Vòng đời CRUD: tạo, đọc, sửa, xoá và dọn dẹp
Mục đích: kiểm tra chuỗi thao tác liên quan và để lại dữ liệu sạch.

```ts
test("vòng đời CRUD của một cuốn sách", async ({ request }) => {
  // CREATE
  const created = await request.post("/api/lab/books", {
    headers: admin,
    data: { title: "Sách thử", author: "QA Team", isbn: "978-4444444444", price: 100000 },
  });
  expect(created.status()).toBe(201);
  const book = await created.json();
  expect(book).toMatchObject({ title: "Sách thử", stock: 0 });
  expect(created.headers()["location"]).toBe(`/api/lab/books/${book.id}`);

  // READ
  const read = await request.get(`/api/lab/books/${book.id}`);
  expect((await read.json()).price).toBe(100000);

  // UPDATE (sửa một phần)
  const put = await request.put(`/api/lab/books/${book.id}`, { headers: admin, data: { price: 350000 } });
  expect((await put.json()).price).toBe(350000);

  // DELETE
  const del = await request.delete(`/api/lab/books/${book.id}`, { headers: admin });
  expect(del.status()).toBe(204);
  expect((await request.get(`/api/lab/books/${book.id}`)).status()).toBe(404);
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `201` và header `Location` | Tạo mới đúng chuẩn REST: status 201 và `Location` chỉ tới tài nguyên mới. |
| `book.id` | `id` do server sinh ra; các bước sau dùng nó. |
| `put` với `{ price: 350000 }` | Gửi **một phần** trường; API chấp nhận cập nhật từng phần. |
| `204` khi xoá | Xoá xong không trả body. Sau đó `GET` phải `404`: kiểm tra "đã thật sự xoá". |

Về trạng thái của lab: dữ liệu thay đổi (sách mới, giá mới) được server ghi vào **cookie** gắn với client. Hai điều rút ra: (1) trong cùng một test, các lời gọi nhìn thấy thay đổi của nhau; (2) mỗi test có client `request` riêng nên **không** thấy dữ liệu của test khác. Muốn đưa về ban đầu trong cùng client, gọi `POST /api/lab/reset` (trả 204).

Với hệ thống thật dùng cơ sở dữ liệu chung, hãy luôn dọn dẹp: xoá bản ghi bạn đã tạo (như bước DELETE ở trên) hoặc đặt dọn dẹp trong fixture sau `use` (bài 4.3) để dọn kể cả khi test thất bại giữa chừng.

### Bước 7. Gói lời gọi lặp thành API object
Mục đích: không lặp `headers: admin`, URL, kiểu dữ liệu ở mọi test; giống Page Object cho API.

Tạo `api/BooksApi.ts`:

```ts
import type { APIRequestContext, APIResponse } from "@playwright/test";

export type BookInput = { title: string; author: string; isbn: string; price: number; stock?: number };

/** API object cho /api/lab/books. Chỉ gửi request; assertion để test tự làm. */
export class BooksApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token = "admin-token",
  ) {}

  private get auth() {
    return { Authorization: `Bearer ${this.token}` };
  }

  list(params: Record<string, string | number> = {}): Promise<APIResponse> {
    return this.request.get("/api/lab/books", { params });
  }

  get(id: string): Promise<APIResponse> {
    return this.request.get(`/api/lab/books/${id}`);
  }

  create(book: BookInput): Promise<APIResponse> {
    return this.request.post("/api/lab/books", { headers: this.auth, data: book });
  }

  update(id: string, patch: Partial<BookInput>): Promise<APIResponse> {
    return this.request.put(`/api/lab/books/${id}`, { headers: this.auth, data: patch });
  }

  remove(id: string): Promise<APIResponse> {
    return this.request.delete(`/api/lab/books/${id}`, { headers: this.auth });
  }
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `private readonly request` | Client HTTP được truyền vào; class không tự tạo để dễ kiểm soát vòng đời. |
| `token = "admin-token"` | Tham số có giá trị mặc định; dùng `new BooksApi(request, "reader-token")` để thử quyền chỉ đọc. |
| Hàm trả `Promise<APIResponse>` | Hàm trả về nguyên response để **test** quyết định assert (status nào, body nào). |
| Chỉ gửi, không `expect` | Giống nguyên tắc POM: lớp helper không chứa ý đồ kiểm thử. |

Test dùng API object:

```ts
import { test, expect } from "@playwright/test";
import { BooksApi } from "../../api/BooksApi";

test("sửa giá sách qua API object", async ({ request }) => {
  const books = new BooksApi(request);

  const created = await books.create({ title: "Sách thử", author: "QA Team", isbn: "978-5555555555", price: 100000 });
  expect(created.status()).toBe(201);
  const { id } = await created.json();

  const updated = await books.update(id, { price: 350000 });
  expect((await updated.json()).price).toBe(350000);

  expect((await books.remove(id)).status()).toBe(204);
});
```

Kết quả mong đợi: test xanh; test đọc gần như văn xuôi. Khi nối với fixture bài 4.3, bạn có thể khai báo `booksApi` để test chỉ nhận `{ booksApi }`.

### Bước 8. Idempotency: gửi lại cùng một yêu cầu
Mục đích: kiểm tra việc gửi lại (do mạng chập chờn) không tạo bản ghi trùng. LAB-21 (`/api/lab/orders`) hỗ trợ header `Idempotency-Key`.

```ts
test("Idempotency-Key: gửi lại không tạo đơn thứ hai", async ({ request }) => {
  const headers = { Authorization: "Bearer admin-token", "Idempotency-Key": "key-123" };
  const data = { customer: "Nguyễn An", items: [{ sku: "SKU-A", qty: 2 }] };

  const first = await request.post("/api/lab/orders", { headers, data });
  const retry = await request.post("/api/lab/orders", { headers, data });

  expect(first.status()).toBe(201);
  expect(retry.status()).toBe(200);
  expect((await retry.json()).id).toBe((await first.json()).id);
});
```

Ý nghĩa: lần đầu `201` (tạo mới), lần gửi lại với cùng `Idempotency-Key` trả `200` và **cùng `id`** (không tạo đơn mới). Đây là một kiểm thử quan trọng cho thanh toán và đặt hàng.

### Bước 9. Chờ một điều kiện xảy ra bằng `expect.poll`
Mục đích: với API bất đồng bộ (ví dụ trạng thái đổi sau vài giây), đừng `sleep`; hãy hỏi lặp lại.

```ts
test("API sẵn sàng", async ({ request }) => {
  await expect
    .poll(async () => (await request.get("/api/lab/books")).status(), { timeout: 10_000 })
    .toBe(200);
});
```

`expect.poll` gọi hàm lặp lại (mặc định mỗi vài trăm mili giây) cho tới khi giá trị khớp hoặc hết thời gian. Dùng cho webhook, hàng đợi, job nền; thay thế hoàn toàn `waitForTimeout`.

## Demo code
Một file hoàn chỉnh `tests/api/books.spec.ts` tổng hợp, dùng API object:

```ts
import { test, expect } from "@playwright/test";
import { BooksApi } from "../../api/BooksApi";

const newBook = { title: "Sách thử", author: "QA Team", isbn: "978-6666666666", price: 100000 };

test.describe("LAB-14 Books API", () => {
  test("danh sách: mặc định trang 1, 5 sách, tổng 12", async ({ request }) => {
    const body = await (await new BooksApi(request).list()).json();

    expect(body).toMatchObject({ page: 1, pageSize: 5, total: 12 });
    expect(body.data).toHaveLength(5);
  });

  test("403 với token chỉ đọc", async ({ request }) => {
    const res = await new BooksApi(request, "reader-token").create(newBook);

    expect(res.status()).toBe(403);
  });

  test("422 khi giá âm", async ({ request }) => {
    const res = await new BooksApi(request).create({ ...newBook, price: -1 });

    expect(res.status()).toBe(422);
    expect((await res.json()).errors.map((e: { field: string }) => e.field)).toContain("price");
  });

  test("tạo rồi xoá: sau khi xoá là 404", async ({ request }) => {
    const books = new BooksApi(request);
    const { id } = await (await books.create(newBook)).json();

    expect((await books.remove(id)).status()).toBe(204);
    expect((await books.get(id)).status()).toBe(404);
  });
});
```

Giải thích: bốn test, mỗi test một ý nghĩa; `{ ...newBook, price: -1 }` là kiểu "ghi đè một trường" của bài 4.5.

## Checklist một endpoint
1. Đúng method và status cho trường hợp hợp lệ (200/201/204).
2. Body trả về có đủ trường và đúng kiểu.
3. Xác thực và phân quyền: 401 khi thiếu, 403 khi không đủ quyền.
4. Dữ liệu không hợp lệ cho lỗi rõ ràng (422 kèm trường lỗi), không lộ chi tiết nội bộ.
5. Biên: `pageSize` quá lớn, trang vượt giới hạn, chuỗi rỗng, số âm.
6. Idempotency: gửi lại cùng một yêu cầu có tạo bản ghi trùng không?

## Thử ngay trong lab
Mở `/lab/api` đọc bảng endpoint. Thử bật bug bằng truy vấn: `GET /api/lab/books?bugs=BUG-01&pageSize=5` làm phần tử đầu của trang bị lệch (trả `b-2` thay vì `b-1`); `POST /api/lab/books?bugs=BUG-02` trả `200` thay vì `201`; `DELETE /api/lab/books/b-999?bugs=BUG-03` trả `204` thay vì `404`. Viết test của bạn xanh trên lab sạch, rồi chạy lại với các đường dẫn có `bugs=` để thấy test đỏ đúng chỗ.

## Lỗi thường gặp
- **Triệu chứng:** test xanh nhưng API vẫn trả dữ liệu sai. **Nguyên nhân:** chỉ kiểm tra status mà không kiểm tra body. **Cách sửa:** luôn có ít nhất một assertion về nội dung (`toMatchObject`, `toEqual`).
- **Triệu chứng:** `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`. **Nguyên nhân:** gọi sai URL nên nhận về HTML, hoặc quên `/api/lab`. **Cách sửa:** in `await res.text()` và kiểm tra đường dẫn.
- **Triệu chứng:** chạy lần hai bị `409` hoặc dữ liệu cũ gây nhiễu (trên hệ thống thật). **Nguyên nhân:** dùng dữ liệu cố định và không dọn. **Cách sửa:** sinh dữ liệu duy nhất (bài 4.5) và xoá bản ghi đã tạo sau test.
- **Triệu chứng:** `403` ở chỗ bạn mong `401` (hoặc ngược lại). **Nguyên nhân:** nhầm hai khái niệm. **Cách sửa:** thiếu hoặc sai token là 401; token đúng nhưng vai trò thấp là 403.
- **Triệu chứng:** `expect(received).toBe(expected)` với `Received: undefined` khi đọc `res.headers().Location`. **Nguyên nhân:** tên header trong `headers()` là chữ thường. **Cách sửa:** `res.headers()["location"]`.
- **Triệu chứng:** test thứ hai không thấy sách mà test thứ nhất vừa tạo. **Nguyên nhân:** mỗi test có client `request` (và cookie) riêng; trạng thái của lab nằm trong cookie của client. **Cách sửa:** làm các bước liên quan **trong cùng một test**, hoặc dùng cùng một context bằng fixture `worker` có chủ đích.

## Tóm tắt
- API test gửi HTTP trực tiếp bằng fixture `request`, nhanh và ổn định; kiểm tra status, header, body và cấu trúc.
- Nhớ nghĩa các mã chính: 200, 201, 204, 400, 401, 403, 404, 409, 422.
- Kiểm tra đủ bộ trường hợp: thành công, thiếu/sai xác thực, không đủ quyền, dữ liệu sai, không tìm thấy, trùng.
- Vòng đời CRUD: tạo (201 + Location), đọc, sửa, xoá (204) rồi `GET` phải 404; luôn dọn dữ liệu đã tạo.
- Gói lời gọi lặp thành API object, chỉ gửi request; assertion để test tự quyết.

## Bài tập
1. Viết 4 test API cho `GET /api/lab/books`: mặc định, trang cuối, `pageSize` quá lớn, tìm kiếm `q=clean`. Xong khi mỗi test kiểm tra cả status lẫn body và chạy xanh 3 lần liên tiếp.
2. Viết test 401, 403 và 404 cho `POST /api/lab/books`, `DELETE /api/lab/books/b-1` và `GET /api/lab/books/b-999`. Xong khi bạn phân biệt được bằng lời khi nào là 401, khi nào là 403.
3. Dùng `expect(body).toMatchObject(...)` và `expect.any(...)` để kiểm tra cấu trúc của mọi sách. Xong khi test đỏ nếu bạn cố ý đổi một tên trường.
4. Viết vòng đời CRUD (tạo, đọc, sửa giá, xoá, đọc lại ra 404) và API object `BooksApi`. Xong khi test không còn chuỗi `/api/lab/books` lặp lại ở nhiều test.
5. Thử thách: bắt cả 3 bug có chủ đích của LAB-14 bằng các test của bạn, theo hướng dẫn ở phần "Thử ngay trong lab". Xong khi các test xanh trên lab sạch và đỏ đúng test tương ứng khi bật `BUG-01`, `BUG-02`, `BUG-03`.
