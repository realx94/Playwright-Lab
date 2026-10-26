---
title: Cấu trúc một Playwright test
level: 2
order: 4
minutes: 50
summary: test, expect, fixture page, describe, tag; chạy lọc test bằng npx playwright test với -g, --headed, --ui, --project và các cờ thường dùng.
keywords: [playwright test structure, test.describe, playwright tag grep]
---

## Mục tiêu bài học
- Viết được một file `*.spec.ts` đúng cấu trúc: `import`, `test`, `expect`, fixture `page`.
- Giải thích mô hình Arrange, Act, Assert và áp dụng vào một test đăng nhập trên LAB-01.
- Chạy một file, một test theo tên, một nhóm theo tag, và đọc được output của `npx playwright test`.
- Dùng đúng các cờ `--headed`, `--ui`, `--debug`, `-g`, `--project`, `--list`, `--workers`, `--retries`, `--reporter`.
- Dùng `test.describe`, `test.skip`, `test.fixme`, `test.only` và biết vì sao `test.only` không được commit.

## Bạn cần chuẩn bị
- Đã cài Node.js và Playwright (bài 0.2), đã chạy test đầu tiên (bài 0.3).
- Biết các khái niệm JavaScript và TypeScript cơ bản, nhất là hàm mũi tên và `async/await` (bài 1.8 đến 1.10).
- Một thư mục dự án có `playwright.config.ts` với `baseURL` trỏ vào site lab (ví dụ `http://localhost:3000`). Nếu bạn dùng starter repo, cấu hình đã có sẵn và test nằm trong thư mục `tests/`.

## Kiến thức cần nắm
- `test("tên", async ({ page }) => { ... })` là một test.
- `expect(...)` là nơi kiểm tra kết quả; có loại tự chờ (web-first) và loại không chờ.
- `test.describe` nhóm các test liên quan.
- Fixture `page`, `context`, `browser`, `request` do Playwright truyền vào.
- Chạy lọc: tên file, `-g "tên"`, tag trong tên (`@smoke`), `test.only`, `test.skip`, `test.fixme`.
- Cờ dòng lệnh quan trọng của `npx playwright test`.

## Giải thích dễ hiểu

### Một test là một tình huống kiểm tra
Một test giống **một tình huống kiểm tra** có ba phần, thường gọi là AAA:

- **Arrange** (chuẩn bị): mở trang, đưa hệ thống về trạng thái ban đầu.
- **Act** (hành động): bấm, điền, chọn, giống người dùng thật.
- **Assert** (đối chiếu): kiểm tra kết quả có đúng như mong đợi không.

Mỗi test nên trả lời đúng một câu hỏi, ví dụ "đăng nhập hợp lệ có vào được dashboard không?". Test càng tập trung, khi hỏng bạn càng biết lỗi ở đâu.

### Fixture: trợ lý mang sẵn đồ nghề
Bạn không tự tạo trình duyệt. Khi viết `async ({ page }) => ...`, Playwright (người chạy test, gọi là **test runner**) tự mở trình duyệt, tạo một tab sạch, đưa cho bạn dưới tên `page`, rồi đóng lại sau test. Những thứ được đưa sẵn như vậy gọi là **fixture** (đồ nghề dựng sẵn cho từng test). Mỗi test nhận một bộ **riêng**: cookie và localStorage của test này không lẫn sang test khác. Đây là lý do test độc lập với nhau.

Các fixture hay dùng:

| Fixture | Là gì | Khi dùng |
|---------|-------|----------|
| `page` | Một tab trình duyệt sạch | Hầu hết test giao diện |
| `context` | "Hồ sơ" trình duyệt chứa nhiều tab, cookie | Mở nhiều tab, đa người dùng (bài 2.12) |
| `browser` | Cả trình duyệt | Tạo context riêng bằng tay |
| `request` | Máy khách gọi API (không mở giao diện) | Test API (bài 4.7) |
| `baseURL` | Địa chỉ gốc trong config | Ghép với `page.goto("/lab/login")` |

### Cấu hình và baseURL
File `playwright.config.ts` chứa các thiết lập chung. Nhờ `use: { baseURL: "http://localhost:3000" }`, bạn viết `page.goto("/lab/login")` thay vì địa chỉ dài, và đổi môi trường chỉ cần sửa một chỗ.

## Thực hành từng bước

Các bước dưới đây tạo một file test đăng nhập cho LAB-01. Nếu bạn dùng starter repo, đặt file ở `tests/login.spec.ts`; nếu tự dựng dự án, đặt vào thư mục `tests` hoặc thư mục bạn đã khai báo `testDir`.

### Bước 1. Kiểm tra môi trường và config

Mục đích: đảm bảo Playwright sẵn sàng và biết nó lấy test ở đâu.

```bash
npx playwright --version
```

Giải thích: `npx` chạy chương trình đã cài trong dự án (không cần cài toàn cục); `--version` in phiên bản.

Kết quả mong đợi: một dòng như `Version 1.64.1`. Nếu báo `command not found` hoặc `Cannot find module`, bạn đang đứng sai thư mục hoặc chưa chạy `npm install` (quay lại bài 0.2).

Mở `playwright.config.ts` và tìm ba chỗ quan trọng:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",                       // nơi chứa file *.spec.ts
  use: { baseURL: "http://localhost:3000" }, // gốc cho page.goto("/...")
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }], // trình duyệt dùng để chạy
});
```

Giải thích: `testDir` là thư mục Playwright quét tìm test; `use.baseURL` là địa chỉ gốc; `projects` là danh sách "cấu hình chạy", mỗi project thường tương ứng một trình duyệt, tên của project (ở đây là `chromium`) dùng với cờ `--project`.

### Bước 2. Viết test đầu tiên: import và test

Mục đích: dựng khung tối thiểu của một test.

Tạo file `tests/login.spec.ts` với nội dung:

```ts
import { test, expect } from "@playwright/test";

test("đăng nhập hợp lệ", async ({ page }) => {
  await page.goto("/lab/login");
});
```

Giải thích từng dòng:

| Dòng | Ý nghĩa |
|------|---------|
| `import { test, expect } from "@playwright/test"` | Lấy hai hàm cần thiết từ thư viện: `test` để khai báo test, `expect` để kiểm tra |
| `test("đăng nhập hợp lệ", ...)` | Khai báo một test; chuỗi đầu là **tên**, hiện trong báo cáo và dùng để lọc |
| `async ({ page }) => { ... }` | Hàm chạy test. `{ page }` là cú pháp lấy fixture `page` ra khỏi đối tượng Playwright truyền vào. `async` vì mọi thao tác trình duyệt đều bất đồng bộ |
| `await page.goto("/lab/login")` | Mở địa chỉ `baseURL + /lab/login` và chờ trang tải xong |

Chạy:

```bash
npx playwright test login
```

Giải thích: `test` là lệnh chạy bộ test; `login` là một **bộ lọc** (chuỗi đưa vào là regex so khớp với đường dẫn file), nên chỉ file có chữ `login` trong đường dẫn được chạy.

Kết quả mong đợi:

```text
Running 1 test using 1 worker

  1 passed (2.1s)

To open last HTML report run:

  npx playwright show-report
```

Nếu gặp `Error: No tests found`: tên file không kết thúc bằng `.spec.ts` hoặc nằm ngoài `testDir`. Nếu gặp `net::ERR_CONNECTION_REFUSED`: site lab chưa chạy hoặc `baseURL` sai cổng; mở `http://localhost:3000` bằng trình duyệt để kiểm tra.

### Bước 3. Thêm hành động và kiểm tra (Act và Assert)

Mục đích: hoàn chỉnh một test theo mô hình AAA.

Thay nội dung test bằng:

```ts
import { test, expect } from "@playwright/test";

test("đăng nhập hợp lệ", async ({ page }) => {
  // Arrange: mở trang và đưa lab về trạng thái ban đầu
  await page.goto("/lab/login");
  await page.getByTestId("reset-data").click();

  // Act: điền thông tin và gửi
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Passw0rd!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  // Assert: vùng dashboard phải hiện ra
  await expect(page.getByTestId("dashboard")).toBeVisible();
});
```

Giải thích từng dòng quan trọng:

| Dòng | Ý nghĩa |
|------|---------|
| `getByTestId("reset-data").click()` | Bấm nút "Reset dữ liệu lab" để xoá trạng thái lưu từ lần trước (LAB-01 lưu số lần sai vào localStorage) |
| `getByLabel("Email").fill("user@lab.dev")` | Tìm ô có nhãn Email rồi gõ vào; `fill` xoá nội dung cũ trước |
| `getByRole("button", { name: "Đăng nhập" }).click()` | Tìm nút có tên truy cập là "Đăng nhập" rồi bấm |
| `expect(locator).toBeVisible()` | Khẳng định phần tử hiển thị; **tự chờ và thử lại** đến khi đúng hoặc hết thời gian (mặc định 5 giây) |

Điểm cực kỳ quan trọng: **luôn có `await` trước `expect(...)` và trước mọi thao tác**. Thiếu `await` thì test kết thúc trước khi kiểm tra xong, có thể "xanh giả".

Chạy lại bằng `npx playwright test login`. Kết quả mong đợi: `1 passed`. Nếu hỏng, bạn sẽ thấy thông báo dạng:

```text
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('dashboard')
Expected: visible
Timeout: 5000ms
Error: element(s) not found
```

Cách đọc: dòng đầu cho biết kiểm tra nào hỏng; `Locator` là phần tử cần tìm; `Timeout: 5000ms` là Playwright đã thử lại 5 giây; `element(s) not found` là không có phần tử nào khớp (thường do sai tên, sai mật khẩu hoặc trang chưa vào dashboard).

### Bước 4. Gom nhóm bằng test.describe và thêm nhiều test

Mục đích: tổ chức nhiều tình huống của cùng một chức năng.

```ts
import { test, expect } from "@playwright/test";

test.describe("LAB-01 Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/login");
    await page.getByTestId("reset-data").click();
  });

  test("đăng nhập hợp lệ", async ({ page }) => {
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByLabel("Mật khẩu").fill("Passw0rd!");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.getByTestId("dashboard")).toBeVisible();
  });

  test("mật khẩu 7 ký tự bị từ chối", async ({ page }) => {
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByLabel("Mật khẩu").fill("Pass0r!");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.getByTestId("password-error")).toContainText("tối thiểu 8");
  });
});
```

Giải thích:

| Thành phần | Ý nghĩa |
|------------|---------|
| `test.describe("LAB-01 Login", () => { ... })` | Một nhóm có tên; tên nhóm được nối vào tên từng test trong báo cáo |
| `test.beforeEach(...)` | Hàm chạy **trước mỗi test** trong nhóm, gom phần Arrange chung (bài 2.11 nói sâu hơn) |
| `toContainText("tối thiểu 8")` | Kiểm tra chữ của phần tử có chứa chuỗi này |

Chạy: `npx playwright test login`. Kết quả mong đợi: `2 passed`.

### Bước 5. Thêm tag và chạy lọc bằng -g

Mục đích: chọn một nhóm test theo nhãn, ví dụ chỉ chạy test quan trọng.

Sửa tên test hoặc thêm tag bằng tuỳ chọn thứ hai (cách chính thức từ Playwright 1.42):

```ts
test("đăng nhập hợp lệ", { tag: "@smoke" }, async ({ page }) => {
  // ... như cũ
});

test("mật khẩu 7 ký tự bị từ chối", { tag: ["@regression", "@validation"] }, async ({ page }) => {
  // ... như cũ
});
```

Giải thích: tham số thứ hai là đối tượng chi tiết; `tag` nhận một chuỗi hoặc mảng chuỗi, mỗi tag bắt đầu bằng `@`. Cách cũ vẫn dùng được là viết thẳng vào tên: `test("đăng nhập hợp lệ @smoke", ...)`.

Chạy lọc:

```bash
npx playwright test -g "@smoke"
```

Giải thích: `-g` (viết đầy đủ là `--grep`) chỉ chạy test có tên (kèm tag) khớp **biểu thức chính quy** đó. `@smoke` không có ký tự đặc biệt nên khớp nguyên văn.

Kết quả mong đợi: `Running 1 test using 1 worker` rồi `1 passed`. Một số biến thể:

| Lệnh | Tác dụng |
|------|----------|
| `npx playwright test -G "@regression"` | Chạy mọi test **trừ** test có tag đó (`--grep-invert`) |
| `npx playwright test -g "mật khẩu"` | Lọc theo chữ trong tên test |

Muốn chạy test có một trong hai tag, dùng regex với ký tự "hoặc" (thanh đứng) giữa hai tag, đặt cả biểu thức trong dấu nháy kép, ví dụ `-g "@smoke|@regression"`.

Nếu không có test nào khớp, bạn thấy `Error: No tests found`.

### Bước 6. Liệt kê test mà không chạy: --list

Mục đích: xem Playwright "thấy" những test nào, rất hữu ích để kiểm tra bộ lọc.

```bash
npx playwright test --list
```

Giải thích: `--list` chỉ thu thập và in danh sách, không mở trình duyệt.

Kết quả mong đợi (tên file và cột sẽ khác tuỳ dự án):

```text
Listing tests:
  [chromium] › login.spec.ts:11:7 › LAB-01 Login › đăng nhập hợp lệ @smoke
  [chromium] › login.spec.ts:18:7 › LAB-01 Login › mật khẩu 7 ký tự bị từ chối @regression @validation
Total: 2 tests in 1 file
```

Cách đọc mỗi dòng: `[chromium]` là project, rồi tên file kèm số dòng và cột, rồi tên nhóm, rồi tên test, cuối cùng là các tag.

### Bước 7. Xem trình duyệt chạy: --headed

Mục đích: thấy từng thao tác bằng mắt.

```bash
npx playwright test login --headed
```

Giải thích: mặc định Playwright chạy **headless** (không hiện cửa sổ). `--headed` bật cửa sổ trình duyệt thật.

Kết quả mong đợi: một cửa sổ Chromium mở ra, ô Email và Mật khẩu được điền rất nhanh, rồi cửa sổ tự đóng. Nếu quá nhanh để nhìn, dùng `--debug` (Bước 9) hoặc `--ui` (Bước 8).

### Bước 8. Chế độ UI: --ui

Mục đích: giao diện tương tác để chọn test, xem từng bước và ảnh chụp DOM.

```bash
npx playwright test --ui
```

Giải thích: `--ui` mở một cửa sổ riêng gọi là **UI Mode**. Bên trái là danh sách test (bấm biểu tượng tam giác để chạy từng cái), bên phải là dòng thời gian và ảnh chụp trang sau mỗi bước.

Kết quả mong đợi: cửa sổ UI Mode hiện cây test như `login.spec.ts > LAB-01 Login > đăng nhập hợp lệ`. Bấm tam giác ở một test: các bước hiện ở cột giữa (`Navigate to "/lab/login"`, `Fill "user@lab.dev"`, ...). Bấm vào một bước, ảnh chụp trang tại thời điểm đó hiện ở bên phải. Nút "Watch" (biểu tượng con mắt) giúp tự chạy lại khi bạn lưu file.

Nếu cửa sổ không mở được trong máy ảo hoặc server không có màn hình, thêm `--ui-host=0.0.0.0 --ui-port=8080` để mở bằng trình duyệt qua mạng (cần cẩn thận về bảo mật mạng).

### Bước 9. Gỡ lỗi từng dòng: --debug

Mục đích: dừng và đi từng bước khi cần tìm nguyên nhân.

```bash
npx playwright test login -g "hợp lệ" --debug
```

Giải thích: `--debug` mở trình duyệt có đầu cùng cửa sổ **Playwright Inspector**, chạy một worker, tắt timeout, và dừng ở dòng đầu tiên. Bạn dùng nút **Step over** (mũi tên cong) hoặc **Resume** (tam giác) để đi tiếp. (Bài 2.13 dạy sâu.)

Kết quả mong đợi: hai cửa sổ hiện ra, Inspector tô sáng dòng `page.goto(...)`. Bấm Step over từng lần để xem trang thay đổi.

### Bước 10. Chọn trình duyệt: --project

Mục đích: chỉ chạy trên một project trong config.

```bash
npx playwright test --project=chromium
```

Giải thích: `--project` lọc theo tên project đã khai báo trong `projects` của config. Nếu config có thêm project `firefox` và `webkit`, bạn sẽ thấy `[firefox]` và `[webkit]` trong danh sách và có thể chọn một trong số đó. Có thể liệt kê nhiều project: `--project=chromium --project=firefox`.

Kết quả mong đợi: dòng đầu in `Running 2 tests using 2 workers` (số tuỳ máy) và mọi dòng test đều có tiền tố `[chromium]`. Nếu bạn gõ tên không tồn tại, bạn nhận `Error: Project(s) "chrome" not found. Available projects: "chromium"`. Đọc dòng `Available projects` để sửa lại.

### Bước 11. Các cờ thường dùng khác

Mục đích: biết công cụ để xử lý các tình huống hằng ngày.

| Lệnh | Tác dụng | Khi nào dùng |
|------|----------|--------------|
| `npx playwright test tests/login.spec.ts` | Chạy một file cụ thể | Đang làm việc một file |
| `npx playwright test login.spec.ts:18` | Chạy test bắt đầu ở dòng 18 | Chạy đúng một test |
| `npx playwright test --workers=1` | Chạy lần lượt, không song song (`-j 1`) | Test phụ thuộc dữ liệu chung hoặc cần log dễ đọc |
| `npx playwright test --retries=2` | Thử lại tối đa 2 lần khi test hỏng | CI, để nhận ra test chập chờn (bài 5.6) |
| `npx playwright test --reporter=line` | Chọn kiểu báo cáo trên màn hình | `list` (mặc định), `line`, `dot`, `html` |
| `npx playwright test --last-failed` | Chỉ chạy lại các test hỏng lần trước | Sau khi sửa lỗi |
| `npx playwright test -x` | Dừng sau lỗi đầu tiên | Muốn thấy lỗi sớm |
| `npx playwright test --repeat-each=5` | Chạy mỗi test 5 lần | Săn test chập chờn |
| `npx playwright test --trace on` | Ghi trace cho mọi test | Phân tích sau (bài 2.13) |
| `npx playwright show-report` | Mở báo cáo HTML của lần chạy gần nhất | Xem chi tiết lỗi và ảnh chụp |

Kết quả mong đợi khi chạy `npx playwright show-report`: trình duyệt mở một trang HTML liệt kê mọi test với trạng thái xanh hoặc đỏ. Bấm một test để xem từng bước và lỗi.

### Bước 12. Bỏ qua và đánh dấu tạm: skip, fixme, only

Mục đích: kiểm soát test mà không xoá chúng.

```ts
test.skip("khoá tài khoản sau 5 lần sai", async ({ page }) => {
  // tạm bỏ qua: chưa làm xong
});

test.fixme("đăng nhập bằng OTP", async ({ page }) => {
  // chức năng chưa hỗ trợ hoặc test đang hỏng, cần sửa
});

test.only("chạy riêng test này", async ({ page }) => {
  // chỉ test này chạy, mọi test khác trong dự án bị bỏ qua
});
```

Giải thích: `test.skip` bỏ qua test và ghi nhận "skipped"; `test.fixme` giống skip nhưng mang nghĩa "việc cần sửa" để dễ tìm lại; `test.only` ép runner chỉ chạy các test đánh dấu `only`.

Kết quả mong đợi khi chạy: dòng tổng có dạng `1 passed, 2 skipped` (mỗi `skip` và `fixme` tính là skipped). Cảnh báo quan trọng: **đừng commit `test.only`**, vì CI sẽ chỉ chạy một test và báo xanh giả. Để chặn, đặt `forbidOnly: !!process.env.CI` trong config (đã có sẵn ở starter repo): khi chạy trên CI mà còn `test.only`, Playwright báo lỗi và dừng.

## Demo code

File hoàn chỉnh `tests/login.spec.ts` (chạy được với site lab). Có chú thích từng đoạn:

```ts
import { test, expect } from "@playwright/test";

// Nhóm các test của LAB-01. Tên nhóm xuất hiện trong báo cáo.
test.describe("LAB-01 Login", () => {
  // Chạy trước mỗi test: mở trang và xoá trạng thái lưu để test độc lập.
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/login");
    await page.getByTestId("reset-data").click();
  });

  test("đăng nhập hợp lệ", { tag: "@smoke" }, async ({ page }) => {
    // Act: điền biểu mẫu như người thật
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByLabel("Mật khẩu").fill("Passw0rd!");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    // Assert: web-first assertion, tự chờ tới khi hiện
    await expect(page.getByTestId("dashboard")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Chào mừng/ })).toContainText("user@lab.dev");
  });

  test("mật khẩu 7 ký tự bị từ chối", { tag: ["@regression", "@validation"] }, async ({ page }) => {
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByLabel("Mật khẩu").fill("Pass0r!");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.getByTestId("password-error")).toContainText("tối thiểu 8");
    // Không vào được dashboard
    await expect(page.getByTestId("dashboard")).toHaveCount(0);
  });

  test("email để trống hiện lỗi", { tag: "@validation" }, async ({ page }) => {
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.getByTestId("email-error")).toBeVisible();
  });

  test.fixme("đăng nhập bằng OTP", async () => {
    // Nhắc việc: viết khi làm LAB-17
  });
});
```

Giải thích: ba test có ba mục đích khác nhau (happy path, giá trị biên mật khẩu, bắt buộc nhập), tag giúp chạy lọc; `fixme` nhắc việc còn lại mà không làm hỏng bộ test. Hàm `toHaveCount(0)` là cách kiểm tra "không có phần tử này" và cũng tự chờ.

## Thử ngay trong lab
Dùng [LAB-01 Login](/labs/login) (ứng dụng ở `/lab/login`). Làm ba việc rồi quan sát:

1. Chạy `npx playwright test login --headed` và xem trình duyệt điền form.
2. Chạy `npx playwright test --ui`, chạy từng test, bấm các bước để xem ảnh chụp trang.
3. Trong test "mật khẩu 7 ký tự bị từ chối", thêm một dòng `await page.goto("/lab/login?bugs=BUG-01");` ngay trước dòng điền Email. Lab bật lỗi BUG-01 (cho phép mật khẩu 7 ký tự) nên test sẽ **đỏ**. Đó là cách bật bug của lab và quan sát test bắt bug. Xoá dòng đó khi xong.

## Lỗi thường gặp
- **Triệu chứng**: test báo xanh nhưng giao diện rõ ràng sai. **Nguyên nhân**: quên `await` trước `expect` hoặc trước thao tác. **Cách sửa**: thêm `await`; bật quy tắc ESLint `@typescript-eslint/no-floating-promises`.
- **Triệu chứng**: `Error: No tests found`. **Nguyên nhân**: tên file không có đuôi `.spec.ts` hoặc `-g` không khớp tên test nào. **Cách sửa**: kiểm tra bằng `npx playwright test --list`.
- **Triệu chứng**: CI chỉ chạy một test. **Nguyên nhân**: còn `test.only`. **Cách sửa**: xoá `.only` và bật `forbidOnly` trong config.
- **Triệu chứng**: `Timeout 30000ms exceeded` trong cả test. **Nguyên nhân**: một bước chờ phần tử không bao giờ xuất hiện, hoặc server chưa chạy. **Cách sửa**: đọc dòng `waiting for locator(...)` trong thông báo để biết đang chờ gì.
- **Triệu chứng**: test chạy một mình thì xanh, chạy cả bộ thì đỏ. **Nguyên nhân**: các test phụ thuộc thứ tự hoặc dùng chung trạng thái (localStorage, dữ liệu máy chủ). **Cách sửa**: mỗi test tự chuẩn bị dữ liệu (như bấm Reset trong `beforeEach`) và độc lập thứ tự.

## Tóm tắt
- Một test gồm tên, hàm `async ({ page }) => ...`, và theo mô hình Arrange, Act, Assert.
- Fixture `page` mang sẵn tab sạch cho từng test; `baseURL` trong config cho phép viết `page.goto("/lab/login")`.
- `await expect(locator).toBeVisible()` tự chờ và thử lại; luôn nhớ `await`.
- Chọn test để chạy bằng tên file, `file:dòng`, `-g` theo tên hoặc tag, `--project`; kiểm tra bằng `--list`.
- Xem và gỡ lỗi bằng `--headed`, `--ui`, `--debug`; xem kết quả bằng `show-report`.
- Không commit `test.only`; dùng `fixme` và `skip` để đánh dấu việc chưa xong.

## Bài tập
1. **Dễ**: Viết hai test cho LAB-01: một đăng nhập hợp lệ, một mật khẩu 7 ký tự bị từ chối. Xong khi `npx playwright test login` báo `2 passed`.
2. **Dễ**: Chạy file trên với `--headed` rồi với `--list` và nêu sự khác nhau của hai lệnh. Xong khi bạn ghi được một câu mô tả mỗi lệnh làm gì.
3. **Vừa**: Gắn tag `@smoke` cho test đầu và `@validation` cho test thứ hai, rồi chạy riêng từng tag bằng `-g`. Xong khi mỗi lệnh chạy đúng một test (kiểm tra bằng dòng `Running 1 test`).
4. **Vừa**: Đưa phần mở trang và Reset vào `test.beforeEach` trong một `test.describe`. Xong khi cả hai test vẫn xanh và không còn lặp lại `page.goto` trong thân test.
5. **Khó**: Bật `--ui`, chạy test "đăng nhập hợp lệ", rồi dùng ảnh chụp tại từng bước để chỉ ra bước nào làm `dashboard` xuất hiện. Sau đó thêm `?bugs=BUG-01` vào địa chỉ của test thứ hai và quan sát nó đỏ. Xong khi bạn mô tả được vì sao đỏ bằng thông báo lỗi của Playwright.
