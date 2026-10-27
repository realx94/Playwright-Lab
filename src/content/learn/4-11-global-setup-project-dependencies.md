---
title: Global setup, teardown và project dependencies
level: 4
order: 11
minutes: 70
summary: Chuẩn bị dữ liệu và đăng nhập một lần trước cả bộ test, dọn dẹp một lần sau đó, bằng globalSetup hoặc project setup với dependencies và teardown; so sánh hai cách và biết khi nào không nên dùng.
keywords: [playwright globalSetup, globalTeardown, project dependencies, setup project, storageState, teardown project]
---

## Mục tiêu bài học
- Viết `globalSetup` và `globalTeardown` trong `playwright.config.ts` để chuẩn bị và dọn dẹp **một lần** cho cả lần chạy.
- Viết project `setup` kèm `dependencies` và `teardown` (cách Playwright khuyến nghị), đọc được thứ tự chạy trong báo cáo.
- Đăng nhập một lần, lưu `storageState`, tạo dữ liệu mẫu một lần và truyền mã dữ liệu sang các test bằng biến môi trường hoặc file.
- Chọn đúng giữa `globalSetup` và project `setup`; nhận ra các trường hợp không nên dùng setup toàn cục.

## Bạn cần chuẩn bị
- Đã học bài 4.3 (custom fixture), 4.4 (biến môi trường và config), 4.6 (đăng nhập một lần bằng `storageState`) và 4.7 (API testing, dùng `request`).
- Starter repo đã `npm install` và site lab đang chạy (`BASE_URL` đúng, mặc định `http://localhost:3000`).
- Hai lab được dùng: `/lab/login` (phiên đăng nhập lưu ở `localStorage`) và API đơn hàng của `/lab/orders` (`/api/lab/orders`, dữ liệu lưu trong cookie của phiên).

## Kiến thức cần nắm
- **`globalSetup`**: một hàm async chạy **một lần** trước mọi test, ngoài trình chạy test; không có fixture, không có trace, không hiện trong báo cáo HTML.
- **`globalTeardown`**: hàm chạy một lần sau mọi test. `globalSetup` cũng có thể **trả về một hàm** để làm việc dọn dẹp.
- **Project setup**: một project bình thường chứa các "test" chuẩn bị; project khác khai báo `dependencies: ["setup"]` để chạy sau nó.
- **Project teardown**: project khai báo trong `teardown: "tên"` của project setup, chạy sau khi mọi project phụ thuộc vào setup đã xong.
- **`storageState`**: file JSON chứa cookie và `localStorage` của một phiên (bài 4.6).
- Dữ liệu giữa các bước truyền qua: file, `storageState`, hoặc biến môi trường (xem các lưu ý ở Bước 6).

## Giải thích dễ hiểu
Hình dung một nhà hàng. Trước giờ mở cửa, bếp trưởng **chuẩn bị một lần**: bật bếp, nhập nguyên liệu, mở sổ đặt bàn. Suốt buổi, nhiều đầu bếp (các worker) nấu song song. Sau giờ đóng cửa, có người **dọn một lần**: tắt bếp, đổ rác, đóng sổ. Nếu mỗi đầu bếp lại tự bật bếp và nhập nguyên liệu trước mỗi món thì mất thời gian và dễ giẫm chân nhau.

Test tự động cũng vậy. Có những việc **đắt và chung cho cả bộ**: đăng nhập tài khoản quản trị, tạo một đơn hàng mẫu, nạp dữ liệu danh mục. Làm lại trước mỗi test thì chậm và dễ lỗi. Playwright cho hai chỗ để làm "một lần":

1. **`globalSetup` và `globalTeardown`** trong config: hai hàm chạy ở đầu và cuối cả lần chạy. Đơn giản, nhưng chúng nằm **ngoài** thế giới test: không có `page` sẵn, không có trace khi hỏng, không hiện trong báo cáo, không tự retry.
2. **Project `setup` với `dependencies`** (và `teardown`): chuẩn bị được viết **như một test thường**. Nhờ vậy bạn có fixture (`page`, `request`), có trace, có báo cáo, có retry, nhìn thấy nó đỏ hay xanh. Playwright khuyến nghị cách này cho phần lớn trường hợp.

Quy tắc nhớ nhanh: **việc gì cần quan sát và gỡ lỗi khi hỏng, hãy để thành project `setup`**. `globalSetup` hợp với việc rất nhỏ hoặc phải xảy ra **trước khi Playwright nạp test** (ví dụ chuyển file Excel thành JSON, bài 4.12).

## Thực hành từng bước
Mọi lệnh chạy trong thư mục gốc của starter repo. Ta dùng chung một kịch bản: **đăng nhập** vào `/lab/login`, **tạo một đơn hàng mẫu** qua API `/api/lab/orders`, để mọi test sau đó có sẵn phiên đăng nhập và đơn mẫu; cuối cùng **xoá** đơn mẫu và file tạm. Làm hai lần: bằng `globalSetup` (Bước 1 đến 3) rồi bằng project setup (Bước 4 đến 7).

### Bước 1. Viết `globalSetup`: đăng nhập và tạo dữ liệu một lần
Mục đích: chạy đúng một lần trước mọi test, lưu phiên vào file và nhớ mã đơn mẫu.

Tạo file `tests/global/global-setup.ts`:

```ts
import { chromium, type FullConfig } from "@playwright/test";
import fs from "node:fs";

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL;
  if (!baseURL) throw new Error("Thiếu baseURL trong playwright.config.ts (khối use)");

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  await page.goto("/lab/login");
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Passw0rd!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.getByTestId("dashboard").waitFor();

  const res = await page.request.post("/api/lab/orders", {
    headers: { Authorization: "Bearer admin-token" },
    data: { customer: "Khách mẫu", items: [{ sku: "SKU-A", qty: 1 }] },
  });
  if (res.status() !== 201) throw new Error(`Tạo đơn mẫu thất bại: HTTP ${res.status()}`);
  const order = await res.json();
  process.env.SEED_ORDER_ID = order.id;

  fs.mkdirSync(".auth", { recursive: true });
  await context.storageState({ path: ".auth/user.json" });
  await browser.close();
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `export default async function globalSetup(config: FullConfig)` | Playwright tìm **export mặc định** của file và gọi nó một lần, truyền vào toàn bộ cấu hình đã được xử lý (`FullConfig`). |
| `config.projects[0].use.baseURL` | Lấy `baseURL` từ khối `use` của project đầu tiên, vì `globalSetup` không có fixture `baseURL`. Thiếu thì ném lỗi rõ ràng thay vì để `goto("/lab/login")` báo lỗi khó hiểu. |
| `chromium.launch()`, `browser.newContext(...)`, `context.newPage()` | Tự mở trình duyệt, tạo context và trang (bài 2.12): trong `globalSetup` bạn **phải tự làm** vì không có fixture `page`. |
| Bốn dòng `goto`, `fill`, `fill`, `click` | Đăng nhập bằng giao diện như người dùng (bài 4.6). |
| `getByTestId("dashboard").waitFor()` | Chờ đăng nhập xong trước khi lưu phiên; lưu sớm sẽ được file chưa có phiên. |
| `page.request.post(...)` | Gọi API bằng **cùng context** với trang, nên cookie của API đơn hàng (nơi lab giữ dữ liệu) nằm chung trong context này. |
| `process.env.SEED_ORDER_ID = order.id` | Ghi mã đơn mẫu vào biến môi trường của tiến trình chạy test; các worker được tạo sau đó **thừa hưởng** biến này. |
| `context.storageState({ path: ".auth/user.json" })` | Ghi cookie và `localStorage` ra file để test dùng lại. |
| `browser.close()` | Đóng trình duyệt; không đóng thì tiến trình có thể treo. |

Lưu ý quan trọng về lab: dữ liệu đơn hàng của lab giữ trong **cookie** (`lab_orders_db`) chứ không ở máy chủ. Cookie này nằm trong `storageState`, nên khi test nạp file phiên, test sẽ "thấy" đơn mẫu. Với hệ thống thật, dữ liệu nằm ở máy chủ và test chỉ cần biết mã đơn.

Kết quả mong đợi: chưa chạy gì, mới có file. Tiếp bước sau.

### Bước 2. Khai báo `globalSetup` và `globalTeardown` trong config
Mục đích: cho Playwright biết hai file nào chạy ở đầu và cuối.

Tạo `tests/global/global-teardown.ts`:

```ts
import fs from "node:fs";

export default async function globalTeardown() {
  fs.rmSync(".auth", { recursive: true, force: true });
}
```

Trong `playwright.config.ts` đặt `testDir` trỏ vào thư mục của phần này và thêm hai khoá ở cấp cao nhất của `defineConfig`:

```ts
  testDir: "./tests/global",
  globalSetup: "./tests/global/global-setup.ts",
  globalTeardown: "./tests/global/global-teardown.ts",
  use: {
    baseURL,
    storageState: ".auth/user.json",
    // ...các tuỳ chọn khác giữ nguyên
  },
```

| Phần | Ý nghĩa |
|------|---------|
| `globalSetup: "./tests/global/global-setup.ts"` | Đường dẫn **tính từ thư mục chứa `playwright.config.ts`**, không phải từ thư mục bạn đang đứng khi gõ lệnh. |
| `testDir: "./tests/global"` | Chỉ tìm test trong thư mục này, để các test cũ của starter không bị kéo vào khi bạn thử nghiệm. |
| `globalTeardown` | File chạy một lần sau khi mọi test kết thúc, kể cả khi có test đỏ. |
| `fs.rmSync(".auth", { recursive: true, force: true })` | Xoá cả thư mục `.auth`; `force: true` để không báo lỗi nếu thư mục không còn. |
| `storageState: ".auth/user.json"` ở khối `use` | Mọi context của test bắt đầu với phiên đã lưu. |

Starter có sẵn một `storageState` ở khối `use` (để chèn cookie `lab_bugs` khi chấm bài với `LAB_BUGS`). Giá trị bạn đặt ở đây **ghi đè** giá trị đó; khi cần cả hai, xem lưu ý của bài 4.6.

Tạo file test `tests/global/app.spec.ts` để kiểm tra kết quả:

```ts
import { test, expect } from "@playwright/test";

test("đã đăng nhập sẵn nhờ storageState", async ({ page }) => {
  await page.goto("/lab/login");
  await expect(page.getByTestId("dashboard")).toBeVisible();
});

test("đơn mẫu có sẵn qua API", async ({ request }) => {
  const orderId = process.env.SEED_ORDER_ID;
  expect(orderId, "globalSetup phải đặt SEED_ORDER_ID").toBeTruthy();

  const res = await request.get(`/api/lab/orders/${orderId}`);
  expect(res.status()).toBe(200);
  expect((await res.json()).customer).toBe("Khách mẫu");
});
```

Chạy:

```bash
npx playwright test
```

Kết quả mong đợi: hai test xanh, và **không** có dòng nào cho `globalSetup` trong danh sách (nó không phải test).

```text
Running 2 tests using 1 worker
  ok 1 [chromium] › tests\global\app.spec.ts:4:5 › đã đăng nhập sẵn nhờ storageState (...)
  ok 2 [chromium] › tests\global\app.spec.ts:9:5 › đơn mẫu có sẵn qua API (...)
  2 passed
```

Nếu gặp lỗi:

- `Error: Thiếu baseURL...`: config chưa có `use.baseURL`; xem bài 4.4.
- `net::ERR_CONNECTION_REFUSED` ngay đầu: site lab chưa chạy; lúc này lỗi nằm trong `globalSetup` và Playwright **không chạy test nào**.
- Test thứ hai đỏ vì `SEED_ORDER_ID` rỗng: file config chưa khai báo `globalSetup`, hoặc bạn chạy bằng một config khác.

### Bước 3. `globalSetup` trả về hàm dọn dẹp (cách thay cho `globalTeardown`)
Mục đích: gom chuẩn bị và dọn dẹp **vào cùng một file**, dùng được các biến đã tạo ở phần chuẩn bị mà không cần truyền qua lại.

```ts
export default async function globalSetup() {
  console.log("[setup] bắt đầu");
  const orderId = "o-1001"; // giả sử vừa tạo

  return async () => {
    console.log("[teardown] dọn đơn", orderId);
  };
}
```

Khi `globalSetup` trả về một hàm, Playwright gọi hàm đó **sau khi mọi test xong**. Hàm này nhìn thấy `orderId` vì là closure (hàm bên trong nhớ biến của hàm ngoài, bài 1.8). Khi dùng cách này bạn bỏ khoá `globalTeardown` trong config. Chạy thử với một test bất kỳ, bạn sẽ thấy dòng `[setup]` in trước khi test chạy và dòng `[teardown]` in sau khi test kết thúc.

Hạn chế chung của hai cách trên: nếu `globalSetup` ném lỗi thì **không test nào chạy** và bạn không có trace hay báo cáo để xem vì sao. Đó là lý do chính để chuyển sang project setup.

### Bước 4. Viết project `setup` như một test thường
Mục đích: cùng kịch bản nhưng có `page`, `request`, trace và báo cáo.

Tạo `tests/project/seed.setup.ts` (thư mục `tests/project` mới, tách khỏi `tests/global`):

```ts
import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";

setup("đăng nhập và tạo đơn mẫu", async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Passw0rd!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByTestId("dashboard")).toBeVisible();

  const res = await page.request.post("/api/lab/orders", {
    headers: { Authorization: "Bearer admin-token" },
    data: { customer: "Khách mẫu", items: [{ sku: "SKU-A", qty: 1 }] },
  });
  expect(res.status(), "tạo đơn mẫu").toBe(201);
  const order = await res.json();

  fs.mkdirSync(".auth", { recursive: true });
  fs.writeFileSync(".auth/run.json", JSON.stringify({ orderId: order.id }));
  await page.context().storageState({ path: ".auth/user.json" });
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `import { test as setup, ... }` | Đổi tên `test` thành `setup` cho dễ đọc: đây là bước chuẩn bị. Về kỹ thuật vẫn là `test` bình thường. |
| `async ({ page })` | Có sẵn fixture `page` đã gắn `baseURL`, không phải tự mở trình duyệt như ở `globalSetup`. |
| `expect(...)` thay cho `if ... throw` | Dùng assertion của Playwright nên thông báo lỗi rõ và kèm thông điệp bạn đặt (`"tạo đơn mẫu"`). |
| `fs.writeFileSync(".auth/run.json", ...)` | Ghi mã đơn mẫu ra **file** để các test khác đọc. Lý do chọn file ở Bước 6. |
| `page.context().storageState({ path })` | Lưu phiên đăng nhập và cookie dữ liệu như ở Bước 1. |

### Bước 5. Viết project teardown và nối các project bằng `dependencies`
Mục đích: dọn đơn mẫu sau cùng, và bảo Playwright thứ tự: `setup`, rồi test, rồi `cleanup`.

Tạo `tests/project/cleanup.teardown.ts`:

```ts
import { test as teardown, expect } from "@playwright/test";
import fs from "node:fs";

teardown("dọn đơn mẫu và file tạm", async ({ playwright, baseURL }) => {
  if (fs.existsSync(".auth/run.json") && fs.existsSync(".auth/user.json")) {
    const { orderId } = JSON.parse(fs.readFileSync(".auth/run.json", "utf8"));
    const api = await playwright.request.newContext({ baseURL, storageState: ".auth/user.json" });
    const res = await api.delete(`/api/lab/orders/${orderId}`, {
      headers: { Authorization: "Bearer admin-token" },
    });
    expect(res.status()).toBe(204);
    await api.dispose();
  }
  fs.rmSync(".auth", { recursive: true, force: true });
});
```

Tạo `tests/project/app.spec.ts` (nội dung gần giống Bước 2, nhưng đọc mã đơn từ **file**):

```ts
import { test, expect } from "@playwright/test";
import fs from "node:fs";

test("đã đăng nhập sẵn nhờ storageState", async ({ page }) => {
  await page.goto("/lab/login");
  await expect(page.getByTestId("dashboard")).toBeVisible();
});

test("đơn mẫu có sẵn qua API", async ({ request }) => {
  const { orderId } = JSON.parse(fs.readFileSync(".auth/run.json", "utf8"));
  const res = await request.get(`/api/lab/orders/${orderId}`);
  expect(res.status()).toBe(200);
  expect((await res.json()).customer).toBe("Khách mẫu");
});
```

Sửa `playwright.config.ts`: **gỡ** `globalSetup`, `globalTeardown` và `storageState` ở khối `use` của Bước 2, đổi `testDir` thành `"./tests/project"`, rồi khai báo ba project:

```ts
  projects: [
    { name: "setup", testMatch: /seed\.setup\.ts/, teardown: "cleanup" },
    { name: "cleanup", testMatch: /cleanup\.teardown\.ts/ },
    {
      name: "chromium",
      testMatch: /.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: ".auth/user.json" },
      dependencies: ["setup"],
    },
  ],
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `name: "setup"` và `testMatch: /seed\.setup\.ts/` | Project chuẩn bị chỉ chạy đúng file khớp mẫu. `\.` là dấu chấm thật trong biểu thức chính quy. |
| `teardown: "cleanup"` | "Sau khi **mọi project phụ thuộc vào `setup`** chạy xong, hãy chạy project tên `cleanup`." Playwright gọi đây là teardown của project. |
| `playwright.request.newContext({ baseURL, storageState })` trong teardown | Teardown tự tạo client API và nạp phiên đã lưu: lab giữ dữ liệu đơn trong cookie của phiên (Bước 1) nên phải mang đúng cookie đó mới xoá được đơn. Không đặt `storageState` ở cấp project `cleanup`: xem Bước 7. |
| `testMatch: /.*\.spec\.ts/` của `chromium` | Chỉ lấy file `.spec.ts`, nên không chạy lại `seed.setup.ts` hay `cleanup.teardown.ts`. |
| `dependencies: ["setup"]` | `chromium` chỉ chạy sau khi `setup` **xanh**. Nếu `setup` đỏ, các test của `chromium` được đánh dấu "did not run". |
| `if (fs.existsSync(...) && fs.existsSync(...))` | Teardown vẫn chạy khi `setup` hỏng; lúc đó các file chưa có, nên cần chặn để không phát sinh lỗi thứ hai che mất lỗi thật. |

Chạy:

```bash
npx playwright test
```

Kết quả mong đợi: bốn test, theo đúng thứ tự `setup`, hai test `chromium`, rồi `cleanup`:

```text
Running 4 tests using 1 worker
  ok 1 [setup] › tests\project\seed.setup.ts:4:6 › đăng nhập và tạo đơn mẫu (...)
  ok 2 [chromium] › tests\project\app.spec.ts:4:5 › đã đăng nhập sẵn nhờ storageState (...)
  ok 3 [chromium] › tests\project\app.spec.ts:9:5 › đơn mẫu có sẵn qua API (...)
  ok 4 [cleanup] › tests\project\cleanup.teardown.ts:4:9 › dọn đơn mẫu và file tạm (...)
  4 passed
```

Khác `globalSetup`, bạn thấy setup và teardown là các dòng thật trong kết quả và trong báo cáo HTML (`npx playwright show-report`), có thể mở trace khi chúng hỏng.

### Bước 6. Truyền dữ liệu giữa các bước: file, `storageState` hay biến môi trường
Mục đích: biết kênh nào đáng tin trong từng trường hợp.

| Kênh | Dùng khi | Lưu ý |
|------|----------|-------|
| `storageState` (file JSON) | Truyền phiên đăng nhập, cookie, `localStorage` | Cách chuẩn cho đăng nhập (bài 4.6). Đưa `.auth/` vào `.gitignore` vì file chứa phiên thật. |
| File tuỳ ý (`.auth/run.json`) | Truyền mã dữ liệu đã tạo (mã đơn, id người dùng) giữa project setup, test và teardown | Đáng tin trong mọi trường hợp vì mọi worker đều đọc được đĩa. Ghi trước khi test chạy. |
| Biến môi trường gán trong **`globalSetup`** | Giá trị nhỏ, chuỗi | Các worker được tạo **sau đó** thừa hưởng biến (đã thử ở Bước 2). |
| Biến môi trường gán trong **test của project setup** | Không nên dựa vào | Biến chỉ nằm trong tiến trình worker đang chạy setup. Test chạy ở worker khác không thấy, và trong thử nghiệm với một worker bạn có thể thấy "may mắn" rồi lỗi khi tăng số worker. Dùng file. |

Biến môi trường luôn là **chuỗi**; muốn truyền số hay object phải tự đổi (`Number(...)`, `JSON.parse`). Một biến chưa đặt cho giá trị `undefined`, nên kiểm tra sớm như ở Bước 2 (`expect(orderId, "...").toBeTruthy()`).

### Bước 7. Thấy thứ tự và hành vi khi `setup` hỏng
Mục đích: tự quan sát điều gì xảy ra khi chuẩn bị thất bại, để tin tưởng cơ chế.

Tạm sửa dòng `expect(res.status(), "tạo đơn mẫu").toBe(201)` trong `seed.setup.ts` thành `.toBe(999)` rồi chạy `npx playwright test`. Kết quả mong đợi:

```text
Running 4 tests using 1 worker
  x  1 [setup] › tests\project\seed.setup.ts:4:6 › đăng nhập và tạo đơn mẫu (...)
  ok 2 [cleanup] › tests\project\cleanup.teardown.ts:4:9 › dọn đơn mẫu và file tạm (...)
  1 failed
    [setup] › tests\project\seed.setup.ts:4:6 › đăng nhập và tạo đơn mẫu
  2 did not run
```

Đọc kết quả: `setup` đỏ nên hai test `chromium` **không chạy** (`2 did not run`), nhưng `cleanup` **vẫn chạy** để dọn những gì đã tạo dở. Đây là điều bạn muốn, và cũng là lý do teardown phải viết phòng thủ: lúc này `.auth/user.json` chưa được lưu. Nếu bạn viết teardown dùng fixture `request` và đặt `storageState: ".auth/user.json"` cho project `cleanup`, Playwright sẽ cố nạp file phiên ngay khi tạo `request`, và teardown đỏ thêm một lỗi `ENOENT: no such file or directory, open '...\.auth\user.json'`, che mất lỗi gốc của setup. Cách làm ở Bước 5 (tự tạo client sau khi kiểm tra file tồn tại) tránh được lỗi đó. Hoàn tác về `.toBe(201)` sau khi xem xong.

Các cờ dòng lệnh liên quan:

```bash
npx playwright test --project=chromium
npx playwright test --no-deps --project=chromium
```

- Cờ `--project=chromium` chỉ chọn project `chromium`, nhưng Playwright **vẫn tự chạy `setup`** (và `cleanup`) vì chúng là phụ thuộc. Đây là lý do chạy một test lẻ vẫn có đăng nhập sẵn.
- Cờ `--no-deps` bỏ qua phụ thuộc. Hữu ích khi bạn đã có sẵn `.auth/user.json` từ lần trước và muốn chạy lại thật nhanh; nhưng nếu file phiên đã bị `cleanup` xoá thì test sẽ lỗi `ENOENT` khi đọc `.auth/user.json`. Vì vậy trong lúc viết test, tạm thời **bỏ `teardown` xoá `.auth`** hoặc giữ file phiên ở thư mục khác.

Trong UI mode (`npx playwright test --ui`), nhớ **bật cả project `setup`** trong bộ lọc project, nếu không test sẽ chạy mà không có phiên.

## Demo code
Cấu hình hoàn chỉnh dùng project setup và teardown cho kịch bản trên:

```ts
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/project",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL, trace: "on-first-retry" },
  projects: [
    { name: "setup", testMatch: /seed\.setup\.ts/, teardown: "cleanup" },
    { name: "cleanup", testMatch: /cleanup\.teardown\.ts/ },
    {
      name: "chromium",
      testMatch: /.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: ".auth/user.json" },
      dependencies: ["setup"],
    },
  ],
});
```

Giải thích: mặc định Playwright chỉ nhận file `.spec.ts` hoặc `.test.ts`; `testMatch` riêng của mỗi project **thay thế** quy tắc đó nên project `setup` nhìn thấy `seed.setup.ts`, project `cleanup` nhìn thấy `cleanup.teardown.ts`, còn `chromium` chỉ nhận `.spec.ts` và không chạy nhầm hai file kia. `trace: "on-first-retry"` giúp mở được trace nếu một test lỗi ở lần chạy lại. Các test trong `chromium` dùng chung phiên đã đăng nhập mà không có dòng đăng nhập nào, nên toàn bộ bộ test chỉ đăng nhập một lần.

## Khi nào KHÔNG nên dùng setup toàn cục
- **Dữ liệu mà test làm thay đổi.** Nếu mỗi test sửa hoặc xoá đơn mẫu chung, test này làm hỏng test kia và kết quả phụ thuộc thứ tự chạy. Dữ liệu chung chỉ nên **đọc**; dữ liệu bị thay đổi nên tạo riêng cho mỗi test bằng fixture (bài 4.3, bài 4.5).
- **Việc nhẹ chỉ một vài test cần.** Mở một trang hay tạo một bản ghi nhỏ cho hai test thì để trong fixture hoặc `beforeEach`; dựng project setup cho việc đó là thừa.
- **Việc cần chạy lại cho từng worker.** `globalSetup` và project setup chạy **một lần cho cả lần chạy**, không phải một lần cho mỗi worker. Dữ liệu riêng của từng worker nên là fixture phạm vi `worker` (bài 4.3).
- **Khi bạn cần xem trace, video, báo cáo cho bước chuẩn bị.** Dùng `globalSetup` thì không có những thứ này; dùng project `setup`.
- **Khi phụ thuộc quá sâu.** Chuỗi `dependencies` dài khiến chạy một test lẻ cũng kéo theo cả loạt bước, chậm và khó hiểu. Giữ một tầng `setup` đơn giản.
- **Đăng nhập cho nhiều vai trò.** Đừng nhồi tất cả vào một `setup`: mỗi vai trò một file `storageState`, mỗi project dùng một file (bài 4.6).

## So sánh nhanh

| Tiêu chí | `globalSetup` và `globalTeardown` | Project `setup` kèm `dependencies` và `teardown` |
|----------|-----------------------------------|--------------------------------------------------|
| Có fixture (`page`, `request`) | Không, phải tự mở trình duyệt hoặc tạo client | Có |
| Có trace, báo cáo, retry | Không | Có |
| Chạy trước khi nạp file test | Có | Không |
| Khi hỏng | Không test nào chạy, ít thông tin để gỡ lỗi | Setup đỏ, test phụ thuộc ghi "did not run", xem được trace |
| Hợp với | Việc chuẩn bị rất nhỏ hoặc phải xong trước khi nạp test | Đăng nhập, tạo dữ liệu, dọn dẹp: phần lớn trường hợp |

## Thử ngay trong lab
Mở `/lab/login`, đăng nhập thủ công rồi mở DevTools, thẻ Application, mục Local Storage để xem phiên lab lưu ở đâu: đó chính là dữ liệu mà `storageState` chép lại. Sau đó, để tận mắt thấy file phiên, tạm đặt dấu `//` trước dòng `fs.rmSync` trong teardown, chạy `npx playwright test`, rồi mở `.auth/user.json`: bạn sẽ thấy mục `localStorage` của phiên đăng nhập và cookie `lab_orders_db` chứa dữ liệu đơn hàng. Nhớ bỏ dấu `//` và xoá thư mục `.auth` bằng tay sau khi xem. Trang `/lab/orders` cho bạn xem các đơn hàng của lab trên giao diện.

## Lỗi thường gặp
- **Triệu chứng:** `Error: Cannot find module './tests/global/global-setup.ts'` ngay khi vừa chạy lệnh. **Nguyên nhân:** đường dẫn `globalSetup` tính từ thư mục chứa config, và thiếu `./` hoặc sai thư mục. **Cách sửa:** dùng `./tests/global/global-setup.ts` đúng so với vị trí `playwright.config.ts`.
- **Triệu chứng:** `Error: tests\global\global-setup.ts: file must export a single function.` **Nguyên nhân:** file không có `export default` hoặc export một thứ không phải hàm. **Cách sửa:** `export default async function globalSetup() {...}`.
- **Triệu chứng:** setup chạy hai lần, hoặc file `seed.setup.ts` xuất hiện trong project `chromium`. **Nguyên nhân:** `testMatch` của `chromium` nhận cả file setup. **Cách sửa:** `testMatch: /.*\.spec\.ts/` cho project test, `testMatch` riêng cho project setup.
- **Triệu chứng:** `ENOENT: no such file or directory, open '.auth/user.json'` khi chạy test. **Nguyên nhân:** setup chưa chạy (dùng `--no-deps`), hoặc teardown đã xoá file ở lần trước. **Cách sửa:** chạy không có `--no-deps`; không xoá file phiên trong lúc đang viết test.
- **Triệu chứng:** `did not run` cho mọi test. **Nguyên nhân:** project setup đỏ nên project phụ thuộc bị bỏ. **Cách sửa:** mở báo cáo hoặc trace của setup để xem lý do; sửa lỗi ở setup trước.
- **Triệu chứng:** `process.env.SEED_ORDER_ID` là `undefined` trong test dù đã gán ở setup. **Nguyên nhân:** gán trong test của project setup (worker khác nhau) thay vì trong `globalSetup`. **Cách sửa:** truyền qua file, hoặc chuyển phần gán vào `globalSetup`.
- **Triệu chứng:** teardown báo thêm lỗi `ENOENT` che mất lỗi gốc. **Nguyên nhân:** setup hỏng giữa chừng nên chưa có file dữ liệu. **Cách sửa:** teardown kiểm tra tồn tại (`fs.existsSync`) và dọn từng phần một cách phòng thủ.

## Tóm tắt
- Việc đắt và chung cho cả bộ test (đăng nhập, dữ liệu mẫu) nên làm **một lần**, không lặp trong từng test.
- `globalSetup` và `globalTeardown` đơn giản nhưng nằm ngoài thế giới test: không fixture, không trace, không báo cáo.
- Project `setup` kèm `dependencies` và `teardown` cho bạn mọi thứ của test thường; đây là cách Playwright khuyến nghị.
- Truyền dữ liệu bằng `storageState` và file; biến môi trường chỉ đáng tin khi gán trong `globalSetup`.
- Teardown phải chịu được trường hợp setup hỏng giữa chừng.
- Không dùng setup toàn cục cho dữ liệu mà test sẽ thay đổi hoặc cho việc nhẹ; dùng fixture.

## Bài tập
1. Thực hiện Bước 1 và 2 bằng `globalSetup`. Xong khi hai test xanh và bạn khẳng định được `globalSetup` không xuất hiện thành dòng test nào trong kết quả.
2. Chuyển kịch bản sang project `setup` và `cleanup` (Bước 4 và 5). Xong khi `npx playwright test` in đúng bốn dòng theo thứ tự setup, hai test, cleanup và thư mục `.auth` biến mất sau khi chạy.
3. Cố ý làm `setup` đỏ như Bước 7. Xong khi bạn đọc được dòng `did not run` và xác nhận `cleanup` vẫn chạy mà không báo lỗi thứ hai.
4. Mở rộng `setup` để tạo **hai** đơn mẫu (khách khác nhau), lưu cả hai mã vào `run.json` dưới dạng mảng, và sửa teardown để xoá cả hai. Xong khi chạy lại không lỗi, mỗi lần `DELETE` trả 204 và thư mục `.auth` biến mất.
5. Thử thách: dùng `--no-deps` kết hợp `--project=chromium` để chạy nhanh một test lẻ, và viết hai dòng nhận xét về khi nào cách này an toàn, khi nào nguy hiểm.
