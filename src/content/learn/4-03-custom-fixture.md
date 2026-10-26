---
title: Custom fixture
level: 4
order: 3
minutes: 50
summary: Dùng test.extend để tự tạo fixture, tự động chuẩn bị và dọn dẹp cho test.
keywords: [playwright fixtures, test.extend, fixture scope]
---

## Mục tiêu bài học
- Giải thích được fixture khác hook (`beforeEach`/`afterEach`) ở đâu và vì sao fixture được ưa chuộng hơn.
- Viết file `fixtures/index.ts` với `test.extend` để đưa `loginPage`, `cartPage` vào test đã mở sẵn trang và reset dữ liệu.
- Viết fixture có **dọn dẹp** (sau `use`), fixture phụ thuộc fixture khác, fixture `auto`, fixture `worker` và fixture dạng **option**.
- Gộp nhiều bộ fixture bằng `mergeTests`.

## Bạn cần chuẩn bị
- Đã học bài 4.1 và 4.2: có `pages/LoginPage.ts`, `pages/CartPage.ts`.
- Biết hàm `async` và `await`, destructuring `({ page })` trong test.
- Starter repo đã `npm install`, `npx playwright test tests/examples` chạy xanh.

## Kiến thức cần nắm
- **Fixture** là thứ được **đưa vào test theo tên** trong tham số: `async ({ page, request }) => {...}`. Playwright có sẵn `page`, `context`, `browser`, `request`...
- Tự viết bằng `test.extend<T>({ ... })`.
- Cú pháp: `async ({ page }, use) => { /* chuẩn bị */ await use(giá_trị); /* dọn dẹp */ }`.
- Fixture chỉ được tạo khi test **thực sự dùng** (lazy); hook thì chạy cho mọi test.
- Phạm vi (`scope`): `"test"` (mặc định, tạo mới cho mỗi test) hoặc `"worker"` (tạo một lần cho mỗi tiến trình worker).
- `auto: true`: fixture luôn chạy dù test không nhắc tên. `option: true`: giá trị có thể đổi bằng `test.use(...)`.
- Fixture có thể **dùng fixture khác** (khai báo trong tham số) và Playwright tự sắp thứ tự.

## Giải thích dễ hiểu
Hook giống **lịch dọn phòng cứng**: mỗi sáng dọn mọi phòng dù chẳng ai ở. Fixture giống **dịch vụ gọi theo nhu cầu**: phòng nào có khách mới được dọn đúng loại khách cần. Bạn chỉ "gọi tên" fixture trong tham số, Playwright lo phần còn lại.

Hãy nhìn một vấn đề cụ thể. Trong bài 4.1, mỗi test có ba dòng mở đầu giống nhau: `new CartPage(page)`, `goto()`, `reset()`. Bạn có thể chuyển ba dòng vào `beforeEach`, nhưng `beforeEach` có ba nhược điểm:
1. Biến dùng chung phải khai báo ngoài (`let cart: CartPage;`) rồi gán trong hook, dễ sai kiểu (`undefined`).
2. Mọi test trong `describe` bị chạy hook, kể cả test không cần giỏ hàng.
3. Việc dọn dẹp nằm ở hook `afterEach` **tách rời** việc chuẩn bị, dễ quên hoặc lệch.

Fixture khắc phục cả ba: giá trị đi thẳng vào tham số test (có kiểu rõ ràng), chỉ chạy khi test gọi tên, và phần chuẩn bị với dọn dẹp nằm trong **cùng một hàm**, ôm quanh dòng `await use(...)`. Có thể hình dung `use` là điểm "giao hàng": mọi thứ trước `use` là chuẩn bị, `use` là lúc test chạy, mọi thứ sau `use` là dọn dẹp.

## Thực hành từng bước
Mọi lệnh chạy trong thư mục gốc của starter repo. Chúng ta sẽ phát triển file `fixtures/index.ts` thành từng phần.

### Bước 1. Xem fixture có sẵn trong starter
Mục đích: biết file mẫu trông thế nào trước khi sửa.

Mở `fixtures/index.ts`:

```ts
import { test as base, expect } from "@playwright/test";
import { CartPage } from "../pages/CartPage";
import { LoginPage } from "../pages/LoginPage";

type Fixtures = {
  loginPage: LoginPage;
  cartPage: CartPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.reset();
    await use(loginPage);
  },
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.reset();
    await use(cartPage);
  },
});

export { expect };
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `import { test as base, expect }` | Nhập `test` gốc của Playwright và **đổi tên** thành `base` để dùng làm nền cho `test` của bạn. |
| `type Fixtures = {...}` | Khai báo **tên và kiểu** các fixture bạn thêm. TypeScript dùng nó để gợi ý tên trong tham số test và báo lỗi nếu bạn gõ sai. |
| `base.extend<Fixtures>({...})` | Tạo ra `test` mới = test gốc + fixture của bạn. Mọi fixture có sẵn (`page`, `request`...) vẫn dùng được. |
| `loginPage: async ({ page }, use) => {` | Định nghĩa fixture tên `loginPage`. Tham số đầu là **các fixture nó cần** (ở đây `page`); tham số thứ hai là hàm `use`. |
| `await use(loginPage)` | "Giao" đối tượng cho test. Playwright chạy test tại đây, **chờ test xong**, rồi mới chạy tiếp dòng sau `use`. |
| `export { expect }` | Xuất lại `expect` để test chỉ cần import một nơi: `import { test, expect } from "../fixtures"`. |

Chú ý: tham số đầu tiên **bắt buộc là một mẫu destructuring** (`{ page }` hoặc `{}`). Playwright đọc tên fixture từ đó. Đừng viết `async (fixtures, use)`.

Chạy ví dụ có sẵn:

```bash
npx playwright test tests/examples
```

Kết quả mong đợi: 4 test xanh. Test `login.spec.ts` chỉ nhận `{ loginPage }` mà không phải mở trang hay reset.

### Bước 2. Viết lại test để thấy lợi ích
Mục đích: so sánh trước/sau.

Trước (chưa có fixture):

```ts
import { test, expect } from "@playwright/test";
import { CartPage } from "../pages/CartPage";

test("hết hàng không thêm được", async ({ page }) => {
  const cartPage = new CartPage(page);
  await cartPage.goto();
  await cartPage.reset();

  await expect(cartPage.addButton("p4")).toBeDisabled();
});
```

Sau (dùng fixture):

```ts
import { test, expect } from "../fixtures";

test("hết hàng không thêm được", async ({ cartPage }) => {
  await expect(cartPage.addButton("p4")).toBeDisabled();
});
```

Thay đổi quan trọng: import `test` từ `"../fixtures"` (file của bạn), **không** từ `"@playwright/test"`. Nếu import nhầm, Playwright báo `Error: ... cartPage` hoặc TypeScript báo thiếu fixture. Đây là lỗi hay gặp nhất ở người mới.

### Bước 3. Thêm fixture có dọn dẹp: `adminApi`
Mục đích: học quy tắc "chuẩn bị trước `use`, dọn sau `use`".

Thêm vào `type Fixtures`:

```ts
import type { APIRequestContext } from "@playwright/test";

type Fixtures = {
  loginPage: LoginPage;
  cartPage: CartPage;
  adminApi: APIRequestContext;
};
```

Thêm vào `base.extend`:

```ts
  adminApi: async ({ playwright, baseURL }, use) => {
    // Chuẩn bị: tạo một client HTTP luôn kèm token quản trị
    const ctx = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { Authorization: "Bearer admin-token" },
    });

    await use(ctx); // giao cho test

    // Dọn dẹp: chạy sau khi test xong, kể cả khi test thất bại
    await ctx.dispose();
  },
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `{ playwright, baseURL }` | Hai fixture có sẵn: `playwright` (đối tượng gốc, có `playwright.request`) và `baseURL` (đọc từ `use.baseURL` của config). |
| `playwright.request.newContext({...})` | Tạo một "trình gọi API" mới độc lập (bài 4.7 sẽ nói kỹ). |
| `extraHTTPHeaders` | Header gắn vào **mọi** request của client này, nên test không phải ghi lại `Authorization` mỗi lần. |
| `await ctx.dispose()` | Giải phóng tài nguyên. Nằm **sau** `use`, nên chạy khi test kết thúc. |

Dùng trong test, bạn sẽ có một client API sẵn sàng:

```ts
import { test, expect } from "../fixtures";

test("đọc sách đầu tiên bằng API", async ({ adminApi }) => {
  const res = await adminApi.get("/api/lab/books/b-1");

  expect(res.status()).toBe(200);
  expect((await res.json()).title).toBe("Clean Code");
});
```

Kết quả mong đợi: test xanh; sách `b-1` có tiêu đề "Clean Code" (đây là dữ liệu gốc của LAB-14). Nếu thấy `apiRequestContext.get: connect ECONNREFUSED`, site lab chưa chạy hoặc `BASE_URL` sai.

Nếu đặt dọn dẹp **trước** `use`, API bị đóng khi test còn dùng nên lỗi `Request context disposed`. Luôn đặt sau.

### Bước 4. Fixture phụ thuộc fixture khác: `loggedInPage`
Mục đích: tạo fixture "đã đăng nhập sẵn" dựa trên `loginPage`.

```ts
  loggedInPage: async ({ loginPage }, use) => {
    await loginPage.login("user@lab.dev", "Passw0rd!");
    await loginPage.expectLoggedIn();
    await use(loginPage);
  },
```

Khai báo `loggedInPage: LoginPage;` trong `type Fixtures`. Giải thích:

| Phần code | Ý nghĩa |
|-----------|---------|
| `({ loginPage }, use)` | Fixture này **cần** `loginPage`; Playwright tạo `loginPage` trước (mở trang, reset) rồi mới chạy fixture này. |
| `loginPage.expectLoggedIn()` | Kiểm tra ngay trong fixture để nếu đăng nhập hỏng, test báo lỗi rõ ở giai đoạn chuẩn bị. |
| `use(loginPage)` | Trả lại cùng đối tượng cho test dùng tiếp (ví dụ đăng xuất). |

Lưu ý: bài 4.6 sẽ cho cách tốt hơn (đăng nhập **một lần** bằng `storageState`) khi có hàng trăm test. Fixture `loggedInPage` hợp với vài test cần đăng nhập thật bằng giao diện.

### Bước 5. Fixture phạm vi `worker` và dữ liệu duy nhất cho mỗi worker
Mục đích: sinh một mã chạy dùng chung trong cả worker, để dữ liệu tạo ra không đụng nhau giữa các worker song song.

Fixture `worker` được khai báo ở tham số kiểu thứ hai của `extend`, và dùng dạng mảng `[hàm, { scope: "worker" }]`:

```ts
import { randomUUID } from "node:crypto";

type WorkerFixtures = { runId: string };

export const test = base.extend<Fixtures, WorkerFixtures>({
  runId: [
    async ({}, use, workerInfo) => {
      await use(`w${workerInfo.workerIndex}-${randomUUID().slice(0, 6)}`);
    },
    { scope: "worker" },
  ],
  // ... các fixture khác
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `base.extend<Fixtures, WorkerFixtures>` | Kiểu thứ nhất là fixture theo test, kiểu thứ hai là fixture theo worker. |
| `[ hàm, { scope: "worker" } ]` | Dạng mảng cho phép truyền tuỳ chọn. Fixture tạo **một lần** cho mỗi worker. |
| `async ({}, use, workerInfo)` | Tham số thứ ba là thông tin worker (`workerIndex` là số thứ tự worker, bắt đầu từ 0). Mẫu `{}` rỗng vì fixture không cần fixture nào khác. |
| `randomUUID().slice(0, 6)` | Lấy 6 ký tự đầu của UUID để chuỗi ngắn nhưng gần như không trùng. |

Một fixture theo test có thể dùng nó để tạo tài khoản riêng cho từng worker:

```ts
  testUser: async ({ runId }, use) => {
    await use({ email: `qa+${runId}@lab.dev`, password: "Passw0rd!" });
  },
```

Quy tắc: fixture `worker` **không được** phụ thuộc fixture `test` (như `page`), vì worker sống lâu hơn từng test.

### Bước 6. Fixture `auto` để kiểm tra chung cho mọi test
Mục đích: tự chạy ở mọi test mà không cần gọi tên, ví dụ bắt lỗi JavaScript của trang.

```ts
  failOnConsoleError: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));

      await use();

      expect(errors, "Trang không được ném lỗi JavaScript").toEqual([]);
    },
    { auto: true },
  ],
```

Khai báo `failOnConsoleError: void;` trong `type Fixtures`.

| Phần code | Ý nghĩa |
|-----------|---------|
| `{ auto: true }` | Fixture chạy cho mọi test dùng `test` này, dù test không nhắc tên. |
| `page.on("pageerror", ...)` | Lắng nghe **lỗi JavaScript chưa bắt** trong trang; thu vào mảng. |
| `await use()` | Không có giá trị để giao nên gọi `use()` rỗng. Test chạy ở đây. |
| `expect(errors, "...").toEqual([])` | Sau khi test xong, nếu có lỗi JS thì test **đỏ** kèm lời nhắn. Tham số thứ hai của `expect` là thông điệp tuỳ chỉnh. |

Cẩn thận: fixture `auto` làm **mọi test** chậm hơn một chút và có thể khiến cả bộ test đỏ nếu có lỗi nền; chỉ dùng cho kiểm tra thật sự chung.

### Bước 7. Fixture dạng option: đổi giá trị bằng `test.use`
Mục đích: để test hoặc nhóm test tự chọn tham số cho fixture.

```ts
type Fixtures = {
  // ...
  seedEmail: string;
};

  seedEmail: ["user@lab.dev", { option: true }],
  loggedInPage: async ({ loginPage, seedEmail }, use) => {
    await loginPage.login(seedEmail, "Passw0rd!");
    await loginPage.expectLoggedIn();
    await use(loginPage);
  },
```

Trong test:

```ts
test.describe("tài khoản khác", () => {
  test.use({ seedEmail: "khac@lab.dev" });

  test("tài khoản không tồn tại bị từ chối", async ({ loginPage, seedEmail }) => {
    await loginPage.login(seedEmail, "Passw0rd!");
    await expect(loginPage.formError).toBeVisible();
  });
});
```

Ý nghĩa: `["user@lab.dev", { option: true }]` đặt giá trị mặc định là `"user@lab.dev"` và cho phép `test.use` ghi đè. Cũng cấu hình được trong `playwright.config.ts` ở khối `use` (khi đó khai báo thêm kiểu cho `defineConfig`), nhưng `test.use` trong file là cách đơn giản nhất.

### Bước 8. Gộp nhiều bộ fixture bằng `mergeTests`
Mục đích: khi fixture nhiều lên, tách thành nhiều file nhỏ theo chủ đề rồi gộp.

```ts
// fixtures/pages.ts  -> export const test = base.extend<{ loginPage: LoginPage; cartPage: CartPage }>(...)
// fixtures/api.ts    -> export const test = base.extend<{ adminApi: APIRequestContext }>(...)

// fixtures/index.ts
import { mergeTests, expect } from "@playwright/test";
import { test as pagesTest } from "./pages";
import { test as apiTest } from "./api";

export const test = mergeTests(pagesTest, apiTest);
export { expect };
```

`mergeTests(a, b)` trả về một `test` có **tất cả** fixture của `a` và `b`. Cách này tránh file `fixtures/index.ts` phình thành vài trăm dòng và cho phép mỗi người sở hữu một file.

## Demo code
File `fixtures/index.ts` hoàn chỉnh (đã gộp các bước 1 đến 7):

```ts
import { test as base, expect, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { CartPage } from "../pages/CartPage";
import { LoginPage } from "../pages/LoginPage";

export type TestUser = { email: string; password: string };

type Fixtures = {
  loginPage: LoginPage;
  cartPage: CartPage;
  adminApi: APIRequestContext;
  testUser: TestUser;
  loggedInPage: LoginPage;
  failOnConsoleError: void;
  seedEmail: string;
};
type WorkerFixtures = { runId: string };

export const test = base.extend<Fixtures, WorkerFixtures>({
  seedEmail: ["user@lab.dev", { option: true }],

  runId: [
    async ({}, use, workerInfo) => {
      await use(`w${workerInfo.workerIndex}-${randomUUID().slice(0, 6)}`);
    },
    { scope: "worker" },
  ],

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.reset();
    await use(loginPage);
  },

  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.reset();
    await use(cartPage);
  },

  adminApi: async ({ playwright, baseURL }, use) => {
    const ctx = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { Authorization: "Bearer admin-token" },
    });
    await use(ctx);
    await ctx.dispose();
  },

  testUser: async ({ runId }, use) => {
    await use({ email: `qa+${runId}@lab.dev`, password: "Passw0rd!" });
  },

  loggedInPage: async ({ loginPage, seedEmail }, use) => {
    await loginPage.login(seedEmail, "Passw0rd!");
    await loginPage.expectLoggedIn();
    await use(loginPage);
  },

  failOnConsoleError: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await use();
      expect(errors, "Trang không được ném lỗi JavaScript").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
```

Và một test dùng nhiều fixture:

```ts
import { test, expect } from "../fixtures";

test("đăng nhập bằng fixture rồi thấy lời chào", async ({ loggedInPage }) => {
  await expect(loggedInPage.dashboard).toBeVisible();
});

test("giỏ hàng sạch cho mỗi test", async ({ cartPage }) => {
  await cartPage.add("p2", 2);
  expect(await cartPage.amount("subtotal")).toBe(500_000);
});

test("tài khoản duy nhất theo worker", async ({ testUser, runId }) => {
  expect(testUser.email).toContain(runId);
});
```

Giải thích: ba test dùng ba bộ fixture khác nhau. Test thứ hai không động tới `adminApi` nên `adminApi` **không** được tạo (lazy). `failOnConsoleError` chạy ở cả ba vì là `auto`.

## Khi nào dùng fixture, khi nào dùng hook
| Cần | Chọn |
|-----|------|
| Đưa đối tượng (Page Object, dữ liệu) vào test | Fixture |
| Việc dọn dẹp luôn đi kèm với việc chuẩn bị | Fixture (đặt sau `use`) |
| Chuẩn bị rất đơn giản, chỉ ở một file | `beforeEach` |
| Chạy một lần cho cả worker (dữ liệu, kết nối) | Fixture `scope: "worker"` |

## Lỗi thường gặp
- **Triệu chứng:** test treo đến khi hết thời gian, báo `Test timeout of 30000ms exceeded`. **Nguyên nhân:** quên `await use(...)` hoặc gọi `use` hai lần. **Cách sửa:** đúng **một** `await use(...)` trong mỗi fixture.
- **Triệu chứng:** TypeScript báo `Property 'cartPage' does not exist on type ...` hoặc test báo thiếu fixture. **Nguyên nhân:** import `test` từ `@playwright/test` thay vì từ `../fixtures`. **Cách sửa:** `import { test, expect } from "../fixtures"`.
- **Triệu chứng:** `Error: First argument must use the object destructuring pattern`. **Nguyên nhân:** viết `async (args, use)`. **Cách sửa:** luôn destructure, kể cả rỗng: `async ({}, use)`.
- **Triệu chứng:** dữ liệu bị xoá khi test còn chạy, hoặc dữ liệu rác còn lại sau test. **Nguyên nhân:** đặt dọn dẹp trước `use`, hoặc không có dọn dẹp. **Cách sửa:** dọn dẹp **sau** `use` trong cùng fixture.
- **Triệu chứng:** Playwright báo lỗi khi khởi chạy rằng fixture phạm vi worker không được phụ thuộc fixture phạm vi test (thông báo nêu tên fixture, ví dụ `page`). **Nguyên nhân:** fixture `worker` dùng `page`. **Cách sửa:** chuyển sang scope `test`, hoặc tạo context riêng trong fixture worker.
- **Triệu chứng:** fixture quá lớn ôm đủ việc (đăng nhập, tạo dữ liệu, mở 3 trang). **Cách sửa:** tách thành các fixture nhỏ và cho chúng phụ thuộc nhau.

## Tóm tắt
- Fixture là phần chuẩn bị và dọn dẹp, được "gọi tên" trong tham số test; tạo bằng `base.extend<T>()`.
- Phần trước `await use(...)` là chuẩn bị, sau `use` là dọn dẹp; test chạy ở chính dòng `use`.
- Fixture chỉ chạy khi test gọi tên (trừ `auto: true`), nên nhanh và gọn hơn hook chung.
- Scope `worker` cho tài nguyên dùng chung trong một tiến trình; option fixture cho phép `test.use` đổi giá trị.
- Tách fixture ra nhiều file rồi gộp bằng `mergeTests`.

## Bài tập
1. Viết fixture `loginPage` mở LAB-01 và reset dữ liệu (nếu chưa có), rồi viết test dùng nó mà không có dòng `goto`/`reset` nào. Xong khi test xanh và file test chỉ import từ `../fixtures`.
2. Viết fixture `loggedInPage` đã đăng nhập sẵn rồi dùng nó cho hai test (ví dụ kiểm tra lời chào, kiểm tra nút "Đăng xuất"). Xong khi cả hai test xanh và không lặp lại bước đăng nhập.
3. Thêm fixture `adminApi` và viết test dùng nó để tạo một sách mới (`POST /api/lab/books`) rồi xoá trong phần dọn dẹp của một fixture `createdBook`. Xong khi chạy test hai lần liên tiếp đều xanh (không dính lỗi `409` do dữ liệu cũ).
4. Thêm fixture `auto` ghi tên test vào console khi test bắt đầu và kết thúc (`testInfo.title`). Xong khi bạn thấy hai dòng log cho mỗi test nhưng không sửa test nào.
5. Thử thách: tách fixture thành `fixtures/pages.ts` và `fixtures/api.ts`, gộp bằng `mergeTests`. Xong khi toàn bộ `tests/examples` vẫn xanh sau khi chuyển.
