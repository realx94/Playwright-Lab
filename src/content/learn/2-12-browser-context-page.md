---
title: Browser, Context và Page
level: 2
order: 12
minutes: 40
summary: Phân biệt browser, context, page; chứng minh sự cô lập bằng LAB-04, dùng nhiều context và tái sử dụng storageState.
keywords: [browser context isolation, playwright storageState, multiple contexts]
---

## Mục tiêu bài học
- Vẽ lại được mô hình ba lớp browser, context, page và nói mỗi lớp chứa gì.
- Chứng minh bằng test rằng hai context không thấy dữ liệu của nhau, còn hai page trong cùng context thì có.
- Mở hai "người dùng" cùng lúc trong một test bằng `browser.newContext()`.
- Lưu và dùng lại `storageState`, và biết cách tránh commit tệp này lên Git.

## Bạn cần chuẩn bị
- Đã học bài 2.4 (fixture `page`), 2.10 (tab mới) và 2.11 (hooks).
- Site lab chạy được. Bài dùng LAB-04 `/lab/todo`: dữ liệu công việc lưu trong `localStorage` của trình duyệt, nên rất hợp để quan sát sự cô lập.

## Kiến thức cần nắm
- **Browser**: một tiến trình trình duyệt (Chromium, Firefox, WebKit). Khởi động tốn kém nên dùng chung cho cả worker.
- **Context** (`BrowserContext`): một "hồ sơ ẩn danh" độc lập với cookie, localStorage, quyền, múi giờ, kích thước màn hình riêng. Tạo rất nhanh.
- **Page**: một tab trong context. Một context có thể có nhiều page và chúng **chia sẻ** cookie và localStorage.
- Mỗi test mặc định nhận **context mới và page mới**, nên các test cô lập nhau.
- **`storageState`**: ảnh chụp cookie và localStorage, lưu ra tệp JSON để dùng lại cho context khác.

## Giải thích dễ hiểu
Browser là **toà nhà**. Mỗi context là **một căn hộ riêng**: có chìa khoá, đồ đạc và tủ lạnh riêng. Mỗi page là **một phòng** trong căn hộ. Hai phòng cùng một căn hộ dùng chung tủ lạnh (cùng cookie, localStorage); hai căn hộ khác nhau thì không nhìn thấy đồ của nhau.

Điều này giải thích vì sao các test của bạn không "dính" dữ liệu nhau dù chạy song song: Playwright đưa mỗi test vào một căn hộ mới tinh rồi dọn đi sau khi xong. Nó cũng giải thích tại sao bạn có thể mô phỏng hai người dùng (khách và quản trị viên) trong cùng một test: hãy mở hai căn hộ.

Tại sao không mở hai browser? Vì khởi động trình duyệt chậm (hàng trăm mili giây đến vài giây) và tốn bộ nhớ, còn tạo context chỉ mất vài chục mili giây mà vẫn cô lập hoàn toàn. Quy tắc: **một browser, nhiều context**.

## Thực hành từng bước

Tạo file `tests/context.spec.ts`. Mọi ví dụ dùng `/lab/todo`.

### Bước 1. Thấy hai fixture `page` và `context`

Mục đích: biết fixture `page` thuộc về `context` nào.

```ts
import { test, expect } from "@playwright/test";

test("page thuộc về context mặc định của test", async ({ page, context, browser }) => {
  expect(page.context()).toBe(context);
  expect(context.browser()).toBe(browser);
  expect(context.pages()).toHaveLength(1);
});
```

| Dòng | Giải thích |
|------|-----------|
| `page, context, browser` | Ba fixture bạn nhận được miễn phí trong test |
| `page.context()` | Context chứa page này |
| `context.pages()` | Danh sách các page đang mở trong context (ở đây đúng 1) |

Kết quả mong đợi: test xanh, chứng tỏ `page` nằm trong `context` do Playwright tạo sẵn cho test này.

### Bước 2. Hai page trong cùng context chia sẻ localStorage

Mục đích: quan sát "cùng căn hộ thì chung tủ lạnh".

```ts
test("hai tab trong cùng context thấy cùng dữ liệu", async ({ page, context }) => {
  await page.goto("/lab/todo");
  await page.getByTestId("reset-data").click();
  await page.getByLabel("Công việc mới").fill("Mua sữa");
  await page.getByRole("button", { name: "Thêm", exact: true }).click();

  const tab2 = await context.newPage();
  await tab2.goto("/lab/todo");
  await expect(tab2.getByTestId("todo-title")).toHaveText("Mua sữa");
});
```

| Dòng | Giải thích |
|------|-----------|
| `context.newPage()` | Mở tab mới trong **cùng** context (tương đương Ctrl+T) |
| `tab2.goto(...)` | Tải lại trang ở tab mới; ứng dụng đọc `localStorage` và thấy việc "Mua sữa" |

Kết quả mong đợi: test xanh. Đây chính là cơ sở để kiểm thử "nhiều tab" ở các lab như LAB-12 (chat giữa các tab).

### Bước 3. Hai context thì cô lập

Mục đích: chứng minh "hai căn hộ không thấy đồ của nhau".

```ts
test("hai context độc lập nhau", async ({ browser }) => {
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  await pageA.goto("/lab/todo");
  await pageA.getByTestId("reset-data").click();
  await pageA.getByLabel("Công việc mới").fill("Việc của A");
  await pageA.getByRole("button", { name: "Thêm", exact: true }).click();
  await expect(pageA.getByTestId("todo-item")).toHaveCount(1);

  await pageB.goto("/lab/todo");
  await expect(pageB.getByTestId("todo-empty")).toBeVisible();

  await ctxA.close();
  await ctxB.close();
});
```

| Dòng | Giải thích |
|------|-----------|
| `browser.newContext()` | Tạo context mới tinh từ browser của test |
| `ctxA.newPage()` | Mở tab trong context A |
| `pageB` thấy danh sách rỗng | `localStorage` của B tách khỏi A |
| `ctxA.close()` | Đóng context do bạn tự tạo, giải phóng tài nguyên |

Kết quả mong đợi: test xanh. Lưu ý: khi bạn dùng `browser.newContext()` trong Playwright Test, các tuỳ chọn trong `use` của config (như `baseURL`) vẫn được áp dụng, nên `goto("/lab/todo")` chạy đúng.

### Bước 4. Hai "người dùng" với vai trò khác nhau

Mục đích: mẫu thực tế cho test phân quyền hoặc luồng duyệt (LAB-07, LAB-26).

```ts
test("hai người dùng cùng thao tác trong một test", async ({ browser }) => {
  const customer = await browser.newContext({ locale: "vi-VN" });
  const manager = await browser.newContext({ locale: "vi-VN" });
  const customerPage = await customer.newPage();
  const managerPage = await manager.newPage();

  await customerPage.goto("/lab/todo");
  await managerPage.goto("/lab/todo");
  // Mỗi trang đăng nhập một danh tính riêng ở bài toán thật;
  // ở đây ta chỉ chứng minh hai phiên không ảnh hưởng nhau.
  await expect(customerPage).toHaveURL(/\/lab\/todo/);
  await expect(managerPage).toHaveURL(/\/lab\/todo/);

  await customer.close();
  await manager.close();
});
```

`newContext` nhận các tuỳ chọn như `locale`, `timezoneId`, `viewport`, `storageState`, `permissions`. Nhờ đó mỗi "người dùng" có thể có ngôn ngữ, múi giờ, kích thước màn hình riêng. Ở LAB-07 (nghỉ phép) và LAB-26 (phân quyền) bạn áp dụng đúng mẫu này: một context cho nhân viên, một context cho quản lý.

Kết quả mong đợi: test xanh.

### Bước 5. Lưu `storageState`

Mục đích: lưu lại cookie và localStorage sau khi chuẩn bị xong để dùng lại.

```ts
test("lưu trạng thái ra tệp", async ({ page, context }) => {
  await page.goto("/lab/todo");
  await page.getByTestId("reset-data").click();
  await page.getByLabel("Công việc mới").fill("Mua sữa");
  await page.getByRole("button", { name: "Thêm", exact: true }).click();

  await context.storageState({ path: ".auth/todo.json" });
});
```

| Dòng | Giải thích |
|------|-----------|
| `context.storageState({ path })` | Ghi cookie và localStorage của mọi origin đang có trong context ra tệp JSON; tạo thư mục nếu chưa có |
| `.auth/todo.json` | Đặt trong thư mục `.auth` để dễ đưa vào `.gitignore` |

Chạy xong, mở tệp `.auth/todo.json`; bạn sẽ thấy hai mảng `cookies` và `origins`, trong `origins` có `localStorage` chứa dữ liệu việc "Mua sữa".

Kết quả mong đợi: test xanh và tệp được tạo. Thêm dòng `.auth/` vào `.gitignore` ngay lập tức (xem phần Lỗi thường gặp), vì tệp này có thể chứa cookie phiên đăng nhập.

### Bước 6. Dùng lại `storageState`

Mục đích: tạo context đã "có sẵn dữ liệu" mà không cần thao tác lại.

```ts
test("dùng lại trạng thái đã lưu", async ({ browser }) => {
  const context = await browser.newContext({ storageState: ".auth/todo.json" });
  const page = await context.newPage();

  await page.goto("/lab/todo");
  await expect(page.getByTestId("todo-title")).toHaveText("Mua sữa");

  await context.close();
});
```

Hoặc áp dụng cho cả một file test bằng `test.use`:

```ts
test.use({ storageState: ".auth/todo.json" });

test("mở trang là thấy sẵn việc đã lưu", async ({ page }) => {
  await page.goto("/lab/todo");
  await expect(page.getByTestId("todo-title")).toHaveText("Mua sữa");
});
```

| Phần | Giải thích |
|------|-----------|
| `storageState: ".auth/todo.json"` | Đường dẫn tương đối tính từ thư mục chạy lệnh (thường là gốc dự án) |
| `test.use({ ... })` | Đặt tuỳ chọn context cho mọi test trong file hoặc nhóm `describe` |

Kết quả mong đợi: test xanh vì dữ liệu được nạp trước khi trang mở. Chạy bước 5 trước bước 6, nếu không sẽ gặp lỗi `ENOENT: no such file or directory, open '.auth/todo.json'`. Trong dự án thật, tệp này thường do một "setup project" tạo ra một lần trước mọi test (đăng nhập một lần, dùng cho nhiều test); chi tiết ở bài 4.6.

### Bước 7. Bắt đầu từ trạng thái trống khi config có sẵn `storageState`

Mục đích: ghi đè khi cấu hình toàn cục đã đặt `storageState`.

Cấu hình mẫu của repo bật `storageState` chứa cookie `lab_bugs` khi bạn chạy với biến `LAB_BUGS`. Nếu một test cần hoàn toàn sạch, ghi đè:

```ts
test.use({ storageState: { cookies: [], origins: [] } });
```

Kết quả mong đợi: context của các test trong file không mang cookie nào. Dùng khi bạn cần kiểm tra trạng thái "chưa đăng nhập".

## Demo code

Một file hoàn chỉnh chứng minh cô lập, không phụ thuộc tệp ngoài, chạy được ngay:

```ts
import { test, expect, type Page } from "@playwright/test";

async function addTask(page: Page, title: string) {
  await page.getByLabel("Công việc mới").fill(title);
  await page.getByRole("button", { name: "Thêm", exact: true }).click();
}

test.describe("Cô lập giữa các context", () => {
  test("cùng context thấy nhau, khác context không thấy", async ({ browser }) => {
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();

    const tabA = await ctx1.newPage();
    await tabA.goto("/lab/todo");
    await tabA.getByTestId("reset-data").click();
    await addTask(tabA, "Chỉ ctx1 có");

    // Tab thứ hai trong cùng ctx1: thấy
    const tabA2 = await ctx1.newPage();
    await tabA2.goto("/lab/todo");
    await expect(tabA2.getByTestId("todo-title")).toHaveText("Chỉ ctx1 có");

    // Tab trong ctx2: không thấy
    const tabB = await ctx2.newPage();
    await tabB.goto("/lab/todo");
    await expect(tabB.getByTestId("todo-empty")).toBeVisible();

    await ctx1.close();
    await ctx2.close();
  });
});
```

Giải thích: `ctx1` có hai tab và chúng thấy dữ liệu của nhau; `ctx2` là căn hộ khác nên thấy danh sách rỗng. Cuối test đóng hai context do ta tự tạo.

## Thử ngay trong lab
- `/lab/todo` (LAB-04): mở hai cửa sổ trình duyệt thường, thêm việc ở cửa sổ đầu, tải lại cửa sổ sau và thấy dữ liệu (cùng hồ sơ). Rồi mở một cửa sổ ẩn danh: danh sách rỗng, đó là một "context khác".
- `/lab/leave` (LAB-07) và `/lab/chat` (LAB-12): bài thực hành nâng cao cho hai người dùng và nhiều tab. Hãy quay lại sau khi nắm bước 3 và 4.

## Lỗi thường gặp
- Triệu chứng: hai "người dùng" trong test lại thấy dữ liệu của nhau. Nguyên nhân: dùng chung một context (hoặc dùng hai `page` của cùng `context`). Sửa: mỗi người dùng một `browser.newContext()`.
- Triệu chứng: tệp `.auth/*.json` nằm trong danh sách `git status` hoặc đã bị commit. Nguyên nhân: quên bỏ qua. Sửa: thêm `.auth/` vào `.gitignore`; nếu đã commit, xoá khỏi Git bằng `git rm --cached` rồi **đổi mật khẩu/thu hồi phiên** vì cookie có thể đã lộ.
- Triệu chứng: `Error: ENOENT: no such file or directory, open '.auth/todo.json'`. Nguyên nhân: tệp `storageState` chưa được tạo hoặc chạy lệnh từ thư mục khác. Sửa: tạo tệp trước (bước 5) và chạy từ gốc dự án.
- Triệu chứng: bộ nhớ tăng dần hoặc trình duyệt còn treo sau test. Nguyên nhân: tạo context bằng `browser.newContext()` mà không `close()`. Sửa: đóng trong cuối test hoặc trong `try/finally`/`afterEach`.
- Triệu chứng: test dựa vào `storageState` cũ nên xanh ở máy bạn mà đỏ ở CI. Nguyên nhân: tệp trạng thái cũ hoặc hết hạn. Sửa: tạo mới tệp ở bước setup mỗi lần chạy, không commit.
- Triệu chứng: `page.goto: Protocol error ... invalid URL` với context tự tạo. Nguyên nhân: tạo context bằng API ngoài Playwright Test (ví dụ thư viện `playwright` thuần) nên không có `baseURL`. Sửa: dùng `browser` fixture của `@playwright/test` hoặc truyền `baseURL` vào `newContext`.

## Tóm tắt
- Mô hình: một browser chứa nhiều context, mỗi context chứa nhiều page.
- Context cô lập cookie và localStorage; các page cùng context thì chia sẻ.
- Mỗi test tự động có context và page mới; muốn nhiều người dùng thì tạo thêm context.
- `storageState` lưu và nạp lại cookie, localStorage; tuyệt đối không commit tệp này.
- Tự tạo context thì tự `close()`.

## Bài tập
1. (Dễ) Viết test kiểm tra `page.context()` bằng `context` fixture (bước 1). Xong khi test xanh.
2. (Dễ) Viết test chứng minh hai context ở LAB-04 không thấy dữ liệu nhau. Xong khi `pageB` thấy danh sách rỗng khi `pageA` có một việc.
3. (Vừa) Viết test hai tab cùng một context: thêm việc ở tab 1, tải lại tab 2 và thấy việc đó. Xong khi bạn giải thích được vì sao tab 2 thấy dữ liệu.
4. (Vừa) Lưu `storageState` sau khi thêm hai việc vào `.auth/todo.json`, rồi viết test khác dùng tệp đó và kiểm tra có hai việc. Xong khi `.auth/` đã nằm trong `.gitignore`.
5. (Khó) Ở LAB-07 `/lab/leave`, mở hai context (nhân viên và quản lý) và mô tả bằng comment test cần thực hiện: nhân viên gửi đơn, quản lý duyệt. Xong khi bạn xác định được dữ liệu chia sẻ giữa hai context hay không và vì sao (đọc `leave-app` hoặc spec `e2e/leave-lab.spec.ts` để biết cơ chế).
