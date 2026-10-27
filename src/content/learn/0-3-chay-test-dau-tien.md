---
title: Chạy test đầu tiên
level: 0
order: 3
minutes: 45
summary: Tạo project Playwright bằng npm init, đọc hiểu cấu trúc thư mục và playwright.config.ts, chạy test headless, headed, UI mode và mở báo cáo HTML.
keywords: [playwright.config.ts, headed vs headless, playwright html report]
---

## Mục tiêu bài học
- Tạo được một project Playwright mới bằng `npm init playwright@latest` và trả lời đúng các câu hỏi của trình cài đặt.
- Đọc hiểu cấu trúc thư mục và các mục chính của `playwright.config.ts`.
- Chạy test ở ba chế độ: mặc định (headless), `--headed` và `--ui`, rồi mở báo cáo HTML.
- Viết và chạy một test đầu tiên trên Playwright Lab, đọc được thông báo khi test đỏ.

## Bạn cần chuẩn bị
- Đã hoàn thành bài 0.2: `node -v`, `npm -v` hoạt động.
- Một thư mục trống để làm bài, ví dụ `playwright-first` trong thư mục Documents.
- Địa chỉ của Playwright Lab. Nếu bạn chạy site ở máy, thường là `http://localhost:3000`; nếu dùng bản triển khai, dùng địa chỉ đó. Trong bài này ta gọi nó là `BASE_URL`.

## Kiến thức cần nắm
- Lệnh khởi tạo: `npm init playwright@latest`.
- File `playwright.config.ts`: `testDir`, `baseURL`, `projects`, `reporter`, `use`.
- Thư mục `tests/` chứa các file `*.spec.ts`.
- Lệnh chạy: `npx playwright test`, thêm `--headed`, `--ui`, `-g "tên test"`.
- Chế độ headless (không hiện cửa sổ trình duyệt) và headed (hiện cửa sổ).

## Giải thích dễ hiểu
Một test Playwright giống kịch bản của một **diễn viên robot**: mở trang, bấm nút, đọc chữ, rồi đối chiếu với kỳ vọng. `playwright.config.ts` là bản hướng dẫn cho đạo diễn: diễn ở sân khấu nào (`baseURL`), dùng trình duyệt nào (`projects`), quay lại những gì khi hỏng (`trace`, `screenshot`).

**Headless** nghĩa là trình duyệt chạy ngầm, không hiện cửa sổ: nhanh, phù hợp máy chủ CI. **Headed** là hiện cửa sổ để bạn nhìn robot thao tác, phù hợp lúc học và gỡ lỗi. **Test runner** là chương trình tìm các file test, chạy chúng song song và báo kết quả; ở đây là chính `npx playwright test`.

## Thực hành từng bước

### Bước 1. Tạo thư mục và đứng vào đó
Mục đích: có một nơi sạch để chứa project.

```bash
mkdir playwright-first
cd playwright-first
```

| Lệnh | Ý nghĩa |
|------|---------|
| `mkdir playwright-first` | Tạo thư mục mới tên `playwright-first` |
| `cd playwright-first` | Di chuyển terminal vào thư mục đó |

Kết quả mong đợi: không in gì; dấu nhắc của terminal đổi để hiện tên thư mục mới. Dùng PowerShell trên Windows hay Terminal trên macOS đều chạy được các lệnh này.

### Bước 2. Khởi tạo project Playwright
Mục đích: tự động sinh khung project, cài thư viện và trình duyệt.

```bash
npm init playwright@latest
```

| Phần của lệnh | Ý nghĩa |
|---------------|---------|
| `npm init` | Chạy một "trình khởi tạo" (initializer) của npm |
| `playwright@latest` | Dùng gói `create-playwright` bản mới nhất |

Lần đầu, npm có thể hỏi "Need to install the following packages ... Ok to proceed?": nhấn `y` rồi Enter. Sau đó trình cài đặt hỏi một loạt câu. Dùng phím mũi tên để chọn, Enter để xác nhận:

| Câu hỏi (theo mã nguồn `create-playwright`) | Mặc định | Nên chọn | Lý do |
|--------------------|----------|----------|-------|
| Do you want to use TypeScript or JavaScript? | TypeScript | TypeScript | Khoá học này dùng TypeScript |
| Where to put your end-to-end tests? | `tests` (nếu đã có thư mục `tests` thì là `e2e`) | `tests` | Thư mục mặc định, giữ nguyên |
| Add a GitHub Actions workflow? | Yes | Chọn No | Bài CI sẽ dạy riêng ở Level 5 (nếu lỡ chọn Yes thì sẽ có thêm file `.github/workflows/playwright.yml`, xoá đi cũng được) |
| Install Playwright browsers (can be done manually via 'npx playwright install')? | Yes | Yes | Tải Chromium, Firefox, WebKit để chạy test |

Riêng trên Linux còn có thêm câu "Install Playwright operating system dependencies (requires sudo / root ...)?" (mặc định No); Windows và macOS không có câu này. Nội dung câu hỏi có thể thay đổi nhẹ giữa các phiên bản; nếu có thêm câu hỏi, chọn mặc định. Muốn bỏ qua mọi câu hỏi (dùng trong script), thêm cờ: `npm init playwright@latest -- --quiet --lang=ts` (có thể thêm `--browser=chromium` để chỉ tải Chromium; ở chế độ `--quiet` trình cài đặt không tạo workflow GitHub Actions).

Kết quả mong đợi: sau vài phút (có thể lâu vì phải tải trình duyệt), bạn thấy thông báo cuối như:

```text
Getting started with writing end-to-end tests with Playwright:
Initializing project in '.'
Initializing NPM project (npm init -y)…
Installing Playwright Test (npm install --save-dev @playwright/test)…
Installing Types (npm install --save-dev @types/node)…
Writing playwright.config.ts.
Writing tests\example.spec.ts.
Writing package.json.
Downloading browsers (npx playwright install)…
✔ Success! Created a Playwright Test project at ...

Inside that directory, you can run several commands:

  npx playwright test
    Runs the end-to-end tests.
  npx playwright test --ui
    Starts the interactive UI mode.
  ...
We suggest that you begin by typing:

  npx playwright test
```

Trình cài đặt còn in thêm nội dung `package.json` vừa tạo và tiến trình tải trình duyệt; đoạn trên là các dòng chính (đối chiếu với `create-playwright` và bản chạy thật với Playwright 1.64). Playwright 1.64 chỉ sinh một file test mẫu `tests/example.spec.ts`; thư mục `tests-examples/` của các bản cũ không còn.

Nếu gặp lỗi: `npm ERR! network` nghĩa là mạng yếu, chạy lại lệnh; `EACCES` (macOS) nghĩa là thư mục không có quyền ghi, đừng dùng `sudo`, hãy chọn thư mục thuộc quyền bạn như Documents.

### Bước 3. Xem cấu trúc thư mục
Mục đích: biết file nào làm gì.

Mở thư mục bằng VS Code: `code .`. Bạn thấy:

```text
playwright-first/
  node_modules/          thư viện đã cài (không chỉnh sửa, không commit)
  tests/
    example.spec.ts      test mẫu do Playwright tạo
  .gitignore             đã chặn node_modules, test-results, playwright-report...
  package.json           khai báo dự án và thư viện
  package-lock.json      khoá chính xác phiên bản thư viện
  playwright.config.ts   cấu hình Playwright
```

Bạn cũng sẽ thấy `playwright-report/` (báo cáo HTML) và `test-results/` (ảnh, trace, file lỗi của lần chạy) sau lần chạy đầu: đó là kết quả sinh ra, không cần sửa. Nếu lúc cài bạn chọn thêm GitHub Actions, sẽ có thêm `.github/workflows/playwright.yml`.

### Bước 4. Chạy test mẫu
Mục đích: chắc chắn mọi thứ hoạt động.

```bash
npx playwright test
```

| Phần của lệnh | Ý nghĩa |
|---------------|---------|
| `npx` | Chạy chương trình nằm trong `node_modules` của dự án |
| `playwright test` | Lệnh con: tìm và chạy mọi test |

Kết quả mong đợi (số lượng và thời gian có thể khác; ở bản chạy thử, một project chỉ có Chromium cho kết quả như dưới; với cấu hình mặc định đủ ba trình duyệt thì là "Running 6 tests"):

```text
Running 2 tests using 2 workers

[1/2] [chromium] › tests\example.spec.ts:10:5 › get started link
[2/2] [chromium] › tests\example.spec.ts:3:5 › has title
  2 passed (5.4s)

To open last HTML report run:
  npx playwright show-report
```

Mỗi test mẫu chạy trên mọi project trong `playwright.config.ts`: với cấu hình mặc định là ba trình duyệt (Chromium, Firefox, WebKit) nên 2 test thành 6 lượt. Chạy ở chế độ headless nên bạn không thấy cửa sổ trình duyệt. Lưu ý: test mẫu truy cập `https://playwright.dev` nên cần có mạng. Dòng "To open last HTML report run" chỉ hiện khi test xanh và chạy trong terminal tương tác; reporter mặc định của file cấu hình sinh ra là `html`, nên không có danh sách từng test.

### Bước 5. Xem báo cáo HTML
Mục đích: biết cách đọc kết quả khi có nhiều test.

```bash
npx playwright show-report
```

Lệnh mở một trang web cục bộ (mặc định cổng 9323) hiển thị danh sách test, trạng thái xanh hoặc đỏ, thời gian chạy từng bước. Bấm vào một test để xem chi tiết từng dòng lệnh. Khi test đỏ, trang này hiển thị dòng lỗi, ảnh chụp màn hình và trace (nếu có). Nhấn Ctrl + C trong terminal để dừng máy chủ báo cáo. Với cấu hình mặc định (`reporter: 'html'`, `open` là `on-failure`), khi có test đỏ báo cáo tự mở trong trình duyệt và terminal in `Serving HTML report at http://localhost:9323. Press Ctrl+C to quit.`

### Bước 6. Tuỳ chỉnh `playwright.config.ts`
Mục đích: trỏ Playwright đến ứng dụng cần test.

Mở file, bạn sẽ thấy nội dung gồm nhiều chú thích. Thay bằng bản gọn dưới đây, chỉ giữ Chromium cho nhanh và thêm `baseURL`:

```ts
import { defineConfig, devices } from "@playwright/test";

// BASE_URL lấy từ biến môi trường, mặc định là site chạy ở máy bạn.
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",           // nơi chứa file *.spec.ts
  fullyParallel: true,          // chạy các test song song
  reporter: [["list"], ["html", { open: "never" }]], // in ra terminal và sinh báo cáo HTML
  use: {
    baseURL,                    // page.goto("/x") sẽ ghép thành baseURL + "/x"
    trace: "on-first-retry",    // ghi trace khi test chạy lại lần đầu
    screenshot: "only-on-failure", // chụp ảnh khi test đỏ
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

| Mục | Ý nghĩa |
|-----|---------|
| `defineConfig` | Hàm giúp TypeScript gợi ý đúng tên cấu hình |
| `testDir` | Thư mục Playwright tìm test |
| `fullyParallel` | Cho phép các test trong cùng một file chạy song song |
| `reporter` | Định dạng kết quả: `list` in ra terminal, `html` tạo báo cáo |
| `use.baseURL` | Địa chỉ gốc; nhờ đó test chỉ viết `/lab/login` |
| `projects` | Danh sách "môi trường chạy": mỗi project một trình duyệt hoặc thiết bị |

Lưu ý: `open: "never"` ngăn báo cáo tự bật mỗi lần đỏ; bạn tự mở bằng `show-report`.

### Bước 7. Viết test đầu tiên trên Playwright Lab
Mục đích: kết nối với ứng dụng thật. Xoá `tests/example.spec.ts` và tạo `tests/first.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("trang danh sách lab hiện tiêu đề", async ({ page }) => {
  await page.goto("/labs");
  await expect(page.getByRole("heading", { name: "Danh sách Lab" })).toBeVisible();
});

test("đăng nhập đúng vào được trang chính", async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Passw0rd!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByTestId("dashboard")).toBeVisible();
});
```

Giải thích từng dòng:

| Dòng | Ý nghĩa |
|------|---------|
| `import { test, expect }` | Lấy hai công cụ chính: `test` khai báo test, `expect` kiểm tra kết quả |
| `test("tên", async ({ page }) => {...})` | Khai báo một test; `page` là một tab trình duyệt mới, sạch, do Playwright cấp |
| `await page.goto("/labs")` | Mở địa chỉ `baseURL` + `/labs` và chờ trang tải |
| `page.getByRole("heading", { name: ... })` | Tìm phần tử theo vai trò (tiêu đề) và tên hiển thị |
| `page.getByLabel("Email")` | Tìm ô nhập theo nhãn "Email" |
| `.fill("...")` | Điền chữ vào ô nhập |
| `.click()` | Bấm vào phần tử |
| `expect(...).toBeVisible()` | Kỳ vọng phần tử đang hiện; Playwright tự chờ đến khi đúng hoặc hết thời gian |
| `await` | Chờ thao tác hoàn thành trước khi sang dòng sau (xem bài async/await) |

Trước khi chạy, hãy chắc chắn Playwright Lab đang chạy và bạn mở được `BASE_URL` trên trình duyệt. Chạy test:

```bash
npx playwright test
```

Kết quả mong đợi:

```text
Running 2 tests using 2 workers
  2 passed (3.1s)
```

Nếu bạn đã đặt biến `BASE_URL` khác, trên PowerShell dùng `$env:BASE_URL="https://dia-chi-cua-ban"` rồi chạy lệnh; trên macOS dùng `BASE_URL=https://dia-chi-cua-ban npx playwright test`.

### Bước 8. Chạy ở các chế độ khác
Mục đích: so sánh cách quan sát test.

```bash
npx playwright test --headed
npx playwright test --ui
npx playwright test -g "đăng nhập đúng"
```

| Lệnh | Ý nghĩa | Bạn sẽ thấy |
|------|---------|-------------|
| `--headed` | Hiện cửa sổ Chromium thật | Cửa sổ mở, trang tự điền và bấm, rồi đóng rất nhanh |
| `--ui` | Mở UI Mode: giao diện chạy từng test, xem từng bước, có dòng thời gian | Cửa sổ riêng với danh sách test bên trái, ảnh chụp trang ở giữa; bấm vào từng bước để xem trạng thái trang |
| `-g "đăng nhập đúng"` | Chỉ chạy test có tên chứa chuỗi đó (`-g` là `--grep`) | Một test duy nhất chạy, test khác bị bỏ qua |

Có thể chạy một file: `npx playwright test tests/first.spec.ts`. Ngoài ra, extension VS Code cho phép bấm tam giác xanh cạnh mỗi test để chạy.

### Bước 9. Cố ý làm test đỏ và đọc báo cáo
Mục đích: quen với thông báo lỗi. Sửa dòng đầu của test thứ nhất thành `name: "Danh sách Labb"` rồi chạy lại. Kết quả mong đợi (rút gọn; thông báo thật từ Playwright 1.64):

```text
  1) [chromium] › testsirst.spec.ts:3:5 › trang danh sách lab hiện tiêu đề ──────

    Error: expect(locator).toBeVisible() failed

    Locator: getByRole('heading', { name: 'Danh sách Labb' })
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" getByRole('heading', { name: 'Danh sách Labb' }) with timeout 5000ms
      - waiting for getByRole('heading', { name: 'Danh sách Labb' })
    ...
    Error Context: test-results\...\error-context.md
```

Cách đọc: dòng `Locator` cho biết Playwright tìm gì, `Expected` là kỳ vọng, `Timeout` là thời gian chờ tối đa trước khi bỏ cuộc, `element(s) not found` là lý do, `Call log` là nhật ký các lần chờ. Playwright cũng ghi file `error-context.md` (mô tả trang lúc lỗi) vào `test-results`. Mở `npx playwright show-report` để xem ảnh chụp trang lúc lỗi. Sửa lại tên đúng và chạy lại để test xanh.

## Demo code
Bản đầy đủ của một file test có hai trường hợp (đúng và sai) cho đăng nhập, dùng cho cả cuộc thử ở Bước 7 và bài tập:

```ts
import { test, expect } from "@playwright/test";

test.describe("Đăng nhập (LAB-01)", () => {
  // beforeEach chạy trước mỗi test: mở trang và đưa dữ liệu về trạng thái sạch.
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/login");
    await page.getByTestId("reset-data").click();
  });

  test("đúng thông tin thì vào dashboard", async ({ page }) => {
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

`test.describe` gom các test liên quan thành một nhóm; `reset-data` là nút Reset của lab, giúp mỗi test bắt đầu từ trạng thái sạch.

## Thử ngay trong lab
Dùng [starter repo](/starter): đặt `BASE_URL` trong `.env`, rồi chạy `npx playwright test 00-smoke`. Khi test xanh, bạn đã sẵn sàng cho bài tiếp theo. Sau đó thử mở `/lab/login?bugs=BUG-01` trong trình duyệt, nhập mật khẩu `Pass0r!` rồi so sánh với test "mật khẩu 7 ký tự bị từ chối": test sẽ đỏ trên trang có bug, đó là cách automation phát hiện lỗi.

## Lỗi thường gặp
- **Triệu chứng:** test đỏ ngẫu nhiên hoặc xanh nhưng không kiểm tra gì. **Nguyên nhân:** quên `await` trước thao tác của `page` (xem bài async/await). **Cách sửa:** thêm `await` cho mọi lời gọi `page.*` và `expect(...)`.
- **Triệu chứng:** `Executable doesn't exist at ...` hoặc "Looks like Playwright Test or Playwright was just installed". **Nguyên nhân:** chưa tải trình duyệt. **Cách sửa:** chạy `npx playwright install`.
- **Triệu chứng:** `net::ERR_CONNECTION_REFUSED at http://localhost:3000/labs`. **Nguyên nhân:** site chưa chạy hoặc `baseURL` sai cổng. **Cách sửa:** mở `BASE_URL` trên trình duyệt thường để chắc chắn mở được, sửa `BASE_URL`.
- **Triệu chứng:** `page.goto("/")` mở nhầm trang hoặc báo "Cannot navigate to invalid URL". **Nguyên nhân:** thiếu `baseURL` trong `use`. **Cách sửa:** khai báo `baseURL` như Bước 6.
- **Triệu chứng:** `Error: No tests found`. **Nguyên nhân:** file không đặt trong `testDir` hoặc tên không có đuôi `.spec.ts`. **Cách sửa:** đặt file vào `tests/` và đặt tên dạng `ten.spec.ts`.

## Tóm tắt
- `npm init playwright@latest` sinh sẵn project, cấu hình và trình duyệt.
- `playwright.config.ts` quyết định test ở đâu, chạy gì, ghi lại gì khi hỏng.
- `npx playwright test` chạy headless; thêm `--headed` hoặc `--ui` để quan sát.
- Báo cáo HTML (`npx playwright show-report`) giúp tìm lỗi nhanh.
- Mọi thao tác với `page` đều cần `await`.

## Bài tập
1. Chạy test với `--headed` rồi với `--ui`; ghi lại ba điểm khác nhau. Xong khi: bạn mô tả được lúc nào dùng chế độ nào.
2. Cố ý sửa kỳ vọng để test đỏ, mở báo cáo HTML và tìm dòng lỗi. Xong khi: bạn chỉ ra được `Locator`, `Expected` và `Timeout` trong thông báo.
3. Dùng `-g` để chỉ chạy test "mật khẩu 7 ký tự bị từ chối". Xong khi: terminal báo đúng 1 test chạy.
4. Thêm một test thứ ba: mở `/lab/login`, bấm Đăng nhập khi để trống rồi kiểm tra có thông báo lỗi hiện ra (gợi ý: lỗi email có `data-testid` là `email-error`; hãy tự bấm thử trên trang để biết nội dung chữ). Xong khi: test xanh trên lab sạch.
5. Đặt `BASE_URL` bằng biến môi trường thay vì sửa file. Xong khi: bạn chạy test trỏ vào hai địa chỉ khác nhau mà không đổi code.
