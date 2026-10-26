---
title: Đăng nhập một lần với storageState và setup project
level: 4
order: 6
minutes: 45
summary: Đăng nhập một lần, lưu phiên và tái sử dụng cho nhiều test để tiết kiệm thời gian.
keywords: [playwright storageState, setup project, global setup]
---

## Mục tiêu bài học
- Giải thích được vì sao mỗi test mặc định "chưa đăng nhập" và `storageState` giải quyết chuyện đó thế nào.
- Viết project `setup` đăng nhập một lần và lưu phiên vào `.auth/user.json`, rồi cho project chính dùng phiên đó qua `dependencies`.
- Đọc được nội dung file `.auth/user.json` (cookies, localStorage theo origin).
- Viết được test cần **chưa đăng nhập** (form đăng nhập) và test dùng **nhiều phiên khác nhau** mà không lẫn.
- Bảo vệ file phiên khỏi bị commit lên Git.

## Bạn cần chuẩn bị
- Đã học bài 4.1 đến 4.4 (Page Object, fixture, config, biến môi trường).
- Hiểu cơ chế đăng nhập của lab `/lab/login`: tài khoản `user@lab.dev`, mật khẩu `Passw0rd!`; phiên của lab lưu trong **localStorage** của trình duyệt.
- Biết `projects` và `--project` trong `playwright.config.ts` (bài 4.4).

## Kiến thức cần nắm
- Mỗi test chạy trong một **browser context** mới, trống: không cookie, không localStorage, nên mặc định **chưa đăng nhập**.
- `context.storageState({ path })` lưu cookie và localStorage ra file JSON.
- `use: { storageState: "path" }` nạp phiên đó vào context của mọi test trong project.
- **Project phụ thuộc**: project `setup` chạy trước; project khác khai báo `dependencies: ["setup"]`.
- File trạng thái chứa dữ liệu phiên nhạy cảm: đưa vào `.gitignore`.
- Phiên chỉ có hiệu lực cho **origin** (địa chỉ + cổng) đã lưu; đổi `BASE_URL` sang site khác thì không nạp được.

## Giải thích dễ hiểu
Mỗi lần vào toà nhà bạn phải qua cổng bảo vệ, quét thẻ. Nếu 100 test đều quét thẻ riêng thì rất tốn thời gian. `storageState` giống **một chiếc thẻ ra vào đã quét sẵn**: đăng nhập một lần, rồi mọi test "mượn" thẻ đó để vào thẳng.

Tính nhanh: một lần đăng nhập bằng giao diện mất khoảng 1 đến 2 giây (mở trang, gõ hai ô, bấm nút, chờ). Với 200 test cần đăng nhập, bạn tốn 200 đến 400 giây chỉ cho bước chuẩn bị, chưa kể đăng nhập là nơi hay gặp lỗi chập chờn. Với `storageState`, bạn đăng nhập **một lần** rồi mỗi test chỉ tốn vài mili giây để nạp file.

Vì sao cần **project `setup` riêng** thay vì để test đầu tiên đăng nhập? Vì các test chạy **song song** và theo thứ tự không đảm bảo. Project `setup` có `dependencies` đảm bảo: "mọi thứ trong `setup` phải xong và xanh trước khi project chính bắt đầu". Nếu `setup` đỏ, project phụ thuộc **không chạy**, nên bạn thấy ngay nguyên nhân thay vì 200 lỗi dây chuyền.

Cuối cùng, tại sao file phiên nhạy cảm? Vì nó chứa **mã phiên** (cookie, token) của tài khoản. Ai có file đó là có thể đóng giả bạn. Giống như bản sao chìa khoá: đừng để lên Git.

## Thực hành từng bước
Mọi lệnh chạy trong thư mục gốc của starter repo.

### Bước 1. Quan sát vấn đề: test mới thì chưa đăng nhập
Mục đích: thấy bằng mắt rằng phiên không "tự" sang test khác.

Tạo `tests/auth-problem.spec.ts`:

```ts
import { test, expect } from "../fixtures";

test("test A đăng nhập xong thấy dashboard", async ({ loginPage }) => {
  await loginPage.login("user@lab.dev", "Passw0rd!");
  await loginPage.expectLoggedIn();
});

test("test B mở lại trang vẫn chưa đăng nhập", async ({ loginPage }) => {
  await expect(loginPage.dashboard).toBeHidden();
});
```

Chạy:

```bash
npx playwright test tests/auth-problem.spec.ts
```

Kết quả mong đợi: cả hai test xanh. Test B chứng minh: dù test A đã đăng nhập, test B bắt đầu với context trống nên chưa có phiên (và fixture `loginPage` còn bấm reset). Xoá file này sau khi xem.

### Bước 2. Tạo file `tests/auth.setup.ts` đăng nhập và lưu phiên
Mục đích: đăng nhập đúng một lần và ghi phiên ra đĩa.

```ts
import { test as setup, expect } from "@playwright/test";

const authFile = ".auth/user.json";

setup("đăng nhập và lưu phiên", async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Passw0rd!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page.getByTestId("dashboard")).toBeVisible();

  await page.context().storageState({ path: authFile });
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `import { test as setup, ... }` | Đổi tên `test` thành `setup` cho dễ đọc: đây là một bước **chuẩn bị**, không phải test kiểm thử. |
| `const authFile = ".auth/user.json"` | Đường dẫn tương đối tới file lưu phiên, tính từ thư mục chạy lệnh. Thư mục `.auth` được tạo tự động. |
| `page.goto` đến `fill` đến `click` | Đăng nhập bằng giao diện thật, giống người dùng. |
| `expect(...dashboard).toBeVisible()` | **Bắt buộc** chờ đăng nhập xong **trước** khi lưu. Nếu lưu quá sớm, file sẽ rỗng (chưa có phiên). |
| `page.context().storageState({ path })` | Lấy "trạng thái lưu trữ" của context (cookie, localStorage) và ghi ra file JSON. |

Lưu ý: file này **không** dùng fixture `loginPage` của bài 4.3, vì project `setup` chạy độc lập và tránh phụ thuộc vào fixture có thể đổi sau này. Bạn vẫn có thể dùng `LoginPage` bằng `new LoginPage(page)` nếu muốn.

### Bước 3. Khai báo project `setup` và phụ thuộc trong config
Mục đích: để Playwright tự chạy `setup` trước, rồi nạp phiên cho các test.

Trong `playwright.config.ts`, đổi `projects`:

```ts
projects: [
  { name: "setup", testMatch: /auth\.setup\.ts/ },
  {
    name: "chromium",
    testIgnore: /auth\.setup\.ts/,
    use: { ...devices["Desktop Chrome"], storageState: ".auth/user.json" },
    dependencies: ["setup"],
  },
],
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `name: "setup"` | Tên project chuẩn bị. |
| `testMatch: /auth\.setup\.ts/` | Project này **chỉ** chạy file khớp mẫu (biểu thức chính quy; `\.` là dấu chấm thật). |
| `testIgnore: /auth\.setup\.ts/` | Project chính **bỏ qua** file setup, nếu không nó sẽ chạy hai lần. |
| `storageState: ".auth/user.json"` | Mọi test của project `chromium` bắt đầu với phiên đã lưu. |
| `dependencies: ["setup"]` | `chromium` chỉ chạy sau khi `setup` hoàn thành và xanh. |

Hai điều cần để ý với starter: (1) cấu hình starter đã dùng `use.storageState` để chèn cookie `lab_bugs` khi chạy chấm bài với biến `LAB_BUGS`. Nếu bạn đặt `storageState` trong project, giá trị của project **ghi đè** giá trị ở cấp config; khi cần cả hai, hãy chạy `setup` riêng và tự thêm cookie `lab_bugs` vào file phiên. (2) Nếu bạn có test cần chưa đăng nhập, xem bước 6.

### Bước 4. Chạy và đọc kết quả
Mục đích: thấy `setup` chạy trước rồi các test dùng phiên.

Tạo `tests/dashboard.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("đã có phiên: vào thẳng dashboard", async ({ page }) => {
  await page.goto("/lab/login");

  await expect(page.getByTestId("dashboard")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Chào mừng, user@lab.dev" })).toBeVisible();
});
```

Chạy:

```bash
npx playwright test tests/dashboard.spec.ts
```

Kết quả mong đợi:

```text
Running 2 tests using 1 worker
  ✓ 1 [setup] › tests\auth.setup.ts:5:7 › đăng nhập và lưu phiên (1.4s)
  ✓ 2 [chromium] › tests\dashboard.spec.ts:3:5 › đã có phiên: vào thẳng dashboard (0.6s)
  2 passed (3.0s)
```

Đọc kỹ: có **2** test dù bạn chỉ viết 1 test thật. Dòng `[setup]` chạy trước, dòng `[chromium]` chạy sau. Test thật **không có bước đăng nhập nào** nhưng vẫn thấy dashboard.

Nếu gặp lỗi: nếu test thật báo `expect(locator).toBeVisible() ... element(s) not found` với `dashboard`, hãy kiểm tra (1) project có `storageState` chưa, (2) file `.auth/user.json` có nội dung không (bước 5), (3) `BASE_URL` có khác origin lúc lưu không.

### Bước 5. Mở file `.auth/user.json` để hiểu nó chứa gì
Mục đích: gỡ "phép màu" bằng cách đọc dữ liệu thật.

```bash
cat .auth/user.json
```

```powershell
Get-Content .auth/user.json
```

Nội dung (rút gọn) có dạng:

```json
{
  "cookies": [],
  "origins": [
    {
      "origin": "http://localhost:3000",
      "localStorage": [
        {
          "name": "lab:login",
          "value": "{\"fails\":0,\"lockedUntil\":null,\"session\":{\"email\":\"user@lab.dev\",\"remember\":false}}"
        }
      ]
    }
  ]
}
```

| Trường | Ý nghĩa |
|--------|---------|
| `cookies` | Danh sách cookie của trình duyệt. Lab login không dùng cookie nên rỗng; site thật thường lưu mã phiên ở đây. |
| `origins[].origin` | Địa chỉ gốc nơi dữ liệu thuộc về. Phiên chỉ nạp cho **đúng origin này**. |
| `localStorage` | Các cặp tên–giá trị trong localStorage. Lab lưu phiên ở khoá `lab:login`. |

Điều rút ra: nếu `BASE_URL` của bạn đổi từ `http://localhost:3000` sang `https://staging.example.com`, file này **không** áp dụng nữa vì origin khác; project `setup` phải chạy lại (nó luôn chạy lại mỗi lần bạn chạy `npx playwright test`).

### Bước 6. Test cần "chưa đăng nhập": ghi đè `storageState`
Mục đích: kiểm tra chính màn hình đăng nhập vẫn làm được.

```ts
import { test, expect } from "@playwright/test";

test.describe("chưa đăng nhập", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("thấy form đăng nhập, không thấy dashboard", async ({ page }) => {
    await page.goto("/lab/login");

    await expect(page.getByTestId("dashboard")).toBeHidden();
    await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
  });
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `test.use({ storageState: {...} })` | Ghi đè tuỳ chọn cho nhóm test trong `describe`. |
| `{ cookies: [], origins: [] }` | Một "phiên rỗng" viết thẳng trong code: không cookie, không localStorage. |

Chạy và kết quả mong đợi: test xanh. Quên bước này là lỗi phổ biến: test form đăng nhập (ví dụ kiểm tra mật khẩu 7 ký tự) báo `waiting for getByLabel('Email')` vì form không hiện khi đã đăng nhập sẵn.

### Bước 7. Hai phiên khác nhau (ví dụ "ghi nhớ đăng nhập")
Mục đích: khi cần nhiều "người dùng" thì mỗi người một file.

Lab login cho đánh dấu "Ghi nhớ đăng nhập", khi đó dashboard hiện `Phiên: 7 ngày`. Thêm một bước setup thứ hai vào `tests/auth.setup.ts`:

```ts
const rememberFile = ".auth/remember.json";

setup("đăng nhập có ghi nhớ và lưu phiên", async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Passw0rd!");
  await page.getByRole("checkbox", { name: "Ghi nhớ đăng nhập" }).check();
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page.getByText("Phiên: 7 ngày")).toBeVisible();

  await page.context().storageState({ path: rememberFile });
});
```

Dùng cho từng nhóm test:

```ts
test.describe("phiên ghi nhớ", () => {
  test.use({ storageState: ".auth/remember.json" });

  test("dashboard hiện phiên 7 ngày", async ({ page }) => {
    await page.goto("/lab/login");
    await expect(page.getByText("Phiên: 7 ngày")).toBeVisible();
  });
});
```

Ý nghĩa: ô đánh dấu là `checkbox` (component của shadcn có input ẩn) nên chọn bằng `getByRole("checkbox", { name: ... })`, không dùng `getByLabel`. Mỗi vai trò/người dùng một file (`admin.json`, `customer.json`) cho phép test đổi người **chỉ bằng một dòng `test.use`**.

### Bước 8. Bảo vệ file phiên bằng `.gitignore`
Mục đích: không để mã phiên lọt lên Git.

Thêm vào `.gitignore`:

```text
.auth/
```

Kiểm tra:

```bash
git status
```

Kết quả mong đợi: thư mục `.auth/` không xuất hiện trong danh sách thay đổi. Nếu đã lỡ commit, chạy `git rm -r --cached .auth` rồi commit, và đổi mật khẩu hoặc vô hiệu hoá phiên đó nếu là tài khoản thật.

## Demo code
Gộp lại: file setup và cấu hình.

```ts
// tests/auth.setup.ts
import { test as setup, expect } from "@playwright/test";

setup("đăng nhập và lưu phiên", async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Passw0rd!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByTestId("dashboard")).toBeVisible();
  await page.context().storageState({ path: ".auth/user.json" });
});
```

```ts
// playwright.config.ts (phần projects)
projects: [
  { name: "setup", testMatch: /auth\.setup\.ts/ },
  {
    name: "chromium",
    testIgnore: /auth\.setup\.ts/,
    use: { ...devices["Desktop Chrome"], storageState: ".auth/user.json" },
    dependencies: ["setup"],
  },
],
```

Với lab của site, phiên đăng nhập lưu trong `localStorage` của trang `/lab/login`; `storageState` ghi lại localStorage theo origin nên tái sử dụng được. Với site thật dùng cookie phiên thì cùng cách, chỉ khác nội dung file.

## Thử ngay trong lab
Chạy toàn bộ bước 2 đến 6 với `/lab/login`. Thử thêm: trong một test dùng phiên rỗng (bước 6), nhập sai mật khẩu liên tiếp để quan sát quy tắc khoá tài khoản (khoá ở lần sai thứ 5; bật `?bugs=BUG-02` thì thành lần thứ 6). Test này **bắt buộc** dùng phiên rỗng vì form đăng nhập chỉ hiện khi chưa có phiên.

## Lưu ý
- Test cần **nhiều người dùng khác nhau**: tạo nhiều file (`admin.json`, `customer.json`) và chọn bằng `test.use({ storageState })`.
- Test kiểm tra chính màn hình đăng nhập phải dùng context **không** nạp phiên.
- Phiên hết hạn: để project `setup` luôn chạy lại trước mỗi lần chạy (mặc định đúng như vậy).
- Test **ghi dữ liệu** dùng chung một tài khoản có thể đè nhau khi chạy song song: dùng tài khoản riêng cho mỗi worker (bài 4.5 và 4.10).
- Ngoài UI, có thể đăng nhập bằng API (`request.post` rồi `request.storageState({ path })`) nhanh hơn nếu site có endpoint đăng nhập.

## Lỗi thường gặp
- **Triệu chứng:** thấy `.auth/user.json` trong `git status`. **Nguyên nhân:** chưa thêm `.auth/` vào `.gitignore`. **Cách sửa:** thêm dòng đó và `git rm -r --cached .auth`.
- **Triệu chứng:** `Error: ENOENT: no such file or directory, open '.auth/user.json'` khi chạy test. **Nguyên nhân:** quên `dependencies: ["setup"]` (hoặc chạy kèm cờ `--no-deps` bỏ qua phụ thuộc), nên test chạy khi file chưa được tạo. **Cách sửa:** khai báo `dependencies` và không dùng `--no-deps` khi chưa có file.
- **Triệu chứng:** test thấy form đăng nhập thay vì dashboard. **Nguyên nhân:** lưu phiên **trước** khi đăng nhập xong (không chờ `dashboard`), hoặc `BASE_URL` đổi origin. **Cách sửa:** `expect(...).toBeVisible()` rồi mới `storageState`; chạy lại `setup`.
- **Triệu chứng:** test kiểm tra form đăng nhập báo `waiting for getByLabel('Email')`. **Nguyên nhân:** project đã nạp phiên nên form không hiện. **Cách sửa:** `test.use({ storageState: { cookies: [], origins: [] } })`.
- **Triệu chứng:** hai test ghi dữ liệu trên cùng tài khoản đè nhau khi chạy song song. **Cách sửa:** mỗi worker một tài khoản (fixture `worker`), hoặc test không dùng chung dữ liệu.
- **Triệu chứng:** `setup` chạy hai lần. **Nguyên nhân:** project chính không có `testIgnore` cho file setup. **Cách sửa:** thêm `testIgnore: /auth\.setup\.ts/`.

## Tóm tắt
- Mỗi test có context mới nên mặc định chưa đăng nhập; `storageState` lưu và nạp lại cookie và localStorage.
- Project `setup` đăng nhập một lần, project chính `dependencies: ["setup"]` và dùng `use.storageState`.
- Phải chờ đăng nhập xong (assert dashboard) rồi mới `storageState({ path })`.
- Phiên chỉ áp dụng cho đúng origin đã lưu; file `.auth/*.json` chứa dữ liệu nhạy cảm nên phải nằm trong `.gitignore`.
- Test cần chưa đăng nhập thì ghi đè bằng `test.use({ storageState: { cookies: [], origins: [] } })`.

## Bài tập
1. Viết `auth.setup.ts` cho LAB-01 và dùng trạng thái đó trong một test kiểm tra trang chính. Xong khi test không chứa bước nhập email/mật khẩu nào mà vẫn xanh, và `.auth/` nằm trong `.gitignore`.
2. Viết một test dùng context **không** có phiên để chứng minh người chưa đăng nhập không thấy trang chính. Xong khi test xanh cả khi project chính có `storageState`.
3. Mở `.auth/user.json` và tìm `origin`. Viết hai câu giải thích điều gì xảy ra nếu bạn đổi `BASE_URL` sang một site khác mà **không** chạy lại `setup`, và vì sao project `setup` luôn chạy trước giúp tránh lỗi đó. Xong khi bạn nêu đúng vai trò của `origin`.
4. Thêm phiên thứ hai `remember.json` (bước 7) và hai test dùng hai phiên khác nhau. Xong khi test thứ nhất thấy "7 ngày" và test thứ hai (phiên thường) không thấy.
5. Thử thách: đăng xuất trong một test (bấm "Đăng xuất") rồi chạy test khác trong cùng bộ. Giải thích vì sao test khác vẫn đăng nhập (mỗi test nạp lại bản sao phiên từ file, nên việc đăng xuất ở test này không làm hỏng file). Xong khi chạy cả bộ vài lần đều xanh.
