---
title: Báo cáo, screenshot và video
level: 2
order: 14
minutes: 40
summary: Reporter, ảnh chụp, quay video, mở báo cáo HTML bằng show-report và dùng bằng chứng cho bug report, thực hành trên LAB-04 Todo.
keywords: [playwright reporters, playwright screenshot, playwright video recording]
---

## Mục tiêu bài học
- Cấu hình reporter và các tuỳ chọn `screenshot`, `video`, `trace` phù hợp cho local và CI.
- Chạy test, mở báo cáo HTML bằng `npx playwright show-report` và tìm được ảnh, video, trace của test đỏ.
- Chụp ảnh thủ công (`page.screenshot`, `locator.screenshot`) và đính kèm vào báo cáo bằng `testInfo.attach`.
- Dùng ảnh/video làm bằng chứng trong một bug report rõ ràng.

## Bạn cần chuẩn bị
- Đã học bài 2.11 (hooks, `testInfo`) và 2.13 (trace, debug).
- Đã biết bài 1.4 (Markdown) để viết bug report.
- Site lab chạy được. Bài dùng LAB-04 `/lab/todo`, nơi bạn có thể bật `?bugs=BUG-02` để tạo một lỗi thật cho việc thu thập bằng chứng.

## Kiến thức cần nắm
- **Reporter**: thành phần quyết định kết quả test được trình bày ra sao. Có sẵn: `list`, `line`, `dot`, `html`, `json`, `junit`... Có thể dùng nhiều reporter cùng lúc.
- `screenshot`: `"off"`, `"on"`, `"only-on-failure"` (tự chụp khi test đỏ).
- `video`: `"off"`, `"on"`, `"retain-on-failure"` (quay mọi test, giữ lại nếu đỏ), `"on-first-retry"`.
- Chụp thủ công: `page.screenshot({ path, fullPage })` và `locator.screenshot()`.
- Đính kèm vào báo cáo: `testInfo.attach(tên, { body, contentType })`.
- Thư mục kết quả: `test-results/` (ảnh, video, trace) và `playwright-report/` (báo cáo HTML); cả hai không được commit.

## Giải thích dễ hiểu
Báo cáo là **biên bản sau buổi kiểm tra**; screenshot và video là **ảnh và video hiện trường**. Một bug report có ảnh chụp đúng thời điểm lỗi rút ngắn rất nhiều thời gian trao đổi giữa QA và dev: thay vì hỏi "bạn bấm gì, thấy gì?", dev xem video và hiểu ngay.

Các reporter có mục đích khác nhau:

| Reporter | Dành cho | Đặc điểm |
|----------|----------|----------|
| `list` | Người đọc ở terminal | In một dòng cho mỗi test; mặc định khi chạy local |
| `line` | Terminal gọn khi có nhiều test | Chỉ in lỗi và một dòng tiến độ |
| `dot` | CI với log dài | Mỗi test một chấm |
| `html` | Con người phân tích sâu | Trang web có ảnh, video, trace, step; mở bằng `show-report` |
| `json` | Máy đọc | Dùng cho script thống kê |
| `junit` | Công cụ CI (Jenkins, Azure DevOps...) | Tệp XML chuẩn JUnit |

Nên nhớ `html` mặc định tự mở trình duyệt khi có test đỏ; ta đặt `open: "never"` để không bị làm phiền (cấu hình của repo đã như vậy), rồi chủ động mở bằng lệnh khi cần.

Về dung lượng: quay video và ghi trace mọi test làm chậm và tốn đĩa. Chiến lược phổ biến là **chỉ giữ bằng chứng khi test đỏ** (`only-on-failure`, `retain-on-failure`, `on-first-retry`).

## Thực hành từng bước

Dùng một thư mục tests bất kỳ; tạo file `tests/evidence.spec.ts` (trong repo site thì `e2e/`).

### Bước 1. Xem cấu hình hiện tại

Mục đích: biết báo cáo của bạn đang ghi gì.

Mở `playwright.config.ts`. Starter repo có phần:

```ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
});
```

| Dòng | Ý nghĩa |
|------|---------|
| `retries: process.env.CI ? 2 : 0` | Chạy lại tối đa 2 lần khi ở CI, không chạy lại ở máy bạn |
| `reporter: [["list"], ["html", ...]]` | Dùng đồng thời hai reporter: in ra terminal **và** sinh báo cáo HTML |
| `["html", { open: "never" }]` | Mỗi reporter là một cặp `[tên, tuỳ chọn]`; `open: "never"` không tự mở trình duyệt |
| `screenshot: "only-on-failure"` | Chụp một ảnh khi test đỏ |
| `trace: "on-first-retry"` | Ghi trace ở lần chạy lại (xem bài 2.13) |

Kết quả mong đợi: bạn nhận ra starter đã bật ảnh khi lỗi nhưng **chưa** quay video. Cấu hình của repo site (`playwright.config.ts` ở gốc) tương tự nhưng chưa bật `screenshot`.

### Bước 2. Bật video khi lỗi

Mục đích: có thêm đoạn phim cho test đỏ.

```ts
use: {
  trace: "on-first-retry",
  screenshot: "only-on-failure",
  video: "retain-on-failure",
},
```

| Dòng | Ý nghĩa |
|------|---------|
| `video: "retain-on-failure"` | Quay mọi test nhưng **xoá video của test xanh**, chỉ giữ video test đỏ |

Kết quả mong đợi: không in gì mới; hiệu lực ở lần chạy sau. Với CI có nhiều test, `retain-on-failure` an toàn về dung lượng hơn `"on"`.

### Bước 3. Tạo một test đỏ có chủ đích để có bằng chứng

Mục đích: dùng BUG-02 của LAB-04 (bộ đếm tính cả việc đã xong) để sinh ra lỗi thật.

```ts
import { test, expect } from "@playwright/test";

test("BUG-02: hoàn thành việc thì bộ đếm phải giảm", async ({ page }) => {
  await page.goto("/lab/todo?bugs=BUG-02");
  await page.getByTestId("reset-data").click();

  await page.getByLabel("Công việc mới").fill("Mua sữa");
  await page.getByRole("button", { name: "Thêm", exact: true }).click();
  await page.getByRole("checkbox", { name: "Hoàn thành: Mua sữa" }).check();

  await expect(page.getByTestId("todo-count")).toHaveText("Còn 0 việc");
});
```

Chạy:

```bash
npx playwright test evidence
```

Kết quả mong đợi (rút gọn):

```text
  x  1 [chromium] › tests/evidence.spec.ts:3:5 › BUG-02: hoàn thành việc thì bộ đếm phải giảm
    Expected: "Còn 0 việc"
    Received: "Còn 1 việc"

  1 failed
```

Test đỏ là chủ đích: nó chứng tỏ ứng dụng có lỗi (xem BR của LAB-04 trong `docs/04-lab-catalog.md`).

### Bước 4. Xem các tệp bằng chứng trong `test-results/`

Mục đích: biết Playwright lưu bằng chứng ở đâu.

Mở thư mục `test-results/` (cạnh `playwright.config.ts`). Bạn thấy một thư mục tên ghép từ tên file, tên test và tên project, bên trong có:

| Tệp | Là gì |
|-----|------|
| `test-failed-1.png` | Ảnh chụp lúc lỗi (nhờ `screenshot: "only-on-failure"`) |
| `video.webm` | Video của test (nhờ `video: "retain-on-failure"`); mở bằng Chrome hoặc VLC |
| `trace.zip` | Trace, có khi dùng `--trace on` hoặc khi retry (xem bài 2.13) |
| `error-context.md` | Bản mô tả trạng thái trang lúc lỗi, hữu ích để dán vào công cụ trợ giúp |

Kết quả mong đợi: bạn có ít nhất ảnh và video của test đỏ. Thư mục `test-results/` bị xoá và tạo lại mỗi lần chạy; sao chép bằng chứng đi chỗ khác nếu muốn giữ.

### Bước 5. Mở báo cáo HTML

Mục đích: xem kết quả, ảnh, video, trace ở một nơi.

```bash
npx playwright show-report
```

| Phần | Ý nghĩa |
|------|---------|
| `show-report` | Mở máy chủ cục bộ phục vụ thư mục `playwright-report/` và mở trình duyệt (mặc định `http://localhost:9323`) |
| `--port 9400` (tuỳ chọn) | Đổi cổng nếu cổng 9323 đang bận |

Kết quả mong đợi: trình duyệt hiện báo cáo. Trang đầu có các bộ lọc **All**, **Passed**, **Failed**, **Flaky**, **Skipped** và danh sách test. Bấm vào test đỏ, bạn thấy:

1. Thông báo lỗi và đoạn code bị dừng.
2. Danh sách các **step** (xem bài 2.11, `test.step`).
3. Ảnh chụp, video, và trace (bấm hình trace để mở Trace Viewer ngay trong báo cáo).

Giữ cửa sổ terminal đang chạy `show-report` để xem; nhấn Ctrl+C để dừng máy chủ.

Nếu gặp lỗi: `No report found` hoặc `Error: ... playwright-report` không tồn tại nghĩa là bạn chưa chạy test với reporter `html`; thêm `["html", { open: "never" }]` rồi chạy lại. Có thể chỉ rõ thư mục khác: `npx playwright show-report ten-thu-muc`.

### Bước 6. Chọn reporter ngay trên dòng lệnh

Mục đích: đổi cách xem mà không sửa config.

```bash
npx playwright test evidence --reporter=line
npx playwright test evidence --reporter=dot
npx playwright test evidence --reporter=list,html
```

| Cờ | Ý nghĩa |
|----|---------|
| `--reporter=line` | Chỉ định reporter, ghi đè `reporter` trong config |
| `list,html` | Nhiều reporter cách nhau bằng dấu phẩy |

Kết quả mong đợi: cùng các test nhưng định dạng terminal khác nhau. Dùng `line` hoặc `dot` khi bạn chỉ muốn thấy kết quả gọn.

### Bước 7. Xuất JSON và JUnit

Mục đích: phục vụ máy đọc và công cụ CI.

```ts
reporter: [
  ["list"],
  ["html", { open: "never", outputFolder: "playwright-report" }],
  ["junit", { outputFile: "results/junit.xml" }],
  ["json", { outputFile: "results/report.json" }],
],
```

| Phần | Ý nghĩa |
|------|---------|
| `outputFolder` | Thư mục báo cáo HTML (mặc định `playwright-report`) |
| `outputFile` | Tệp đầu ra của reporter `junit` hoặc `json` |

Kết quả mong đợi: sau khi chạy, có `results/junit.xml` (thẻ `testsuite` và `testcase`, mỗi test đỏ có `failure`) và `results/report.json`. CI đọc tệp JUnit để hiển thị số test xanh/đỏ; bài 5.1 nói cách tải artifact và bài 5.2 nói về báo cáo nâng cao. Nhớ thêm `results/` vào `.gitignore` nếu bạn dùng thư mục này.

### Bước 8. Chụp ảnh thủ công và đính kèm vào báo cáo

Mục đích: có bằng chứng ở **đúng thời điểm** bạn chọn, kể cả khi test xanh.

```ts
test("chụp trang Todo trước và sau khi thêm việc", async ({ page }, testInfo) => {
  await page.goto("/lab/todo");
  await page.getByTestId("reset-data").click();

  const truoc = await page.screenshot({ fullPage: true });
  await testInfo.attach("1-truoc-khi-them", { body: truoc, contentType: "image/png" });

  await page.getByLabel("Công việc mới").fill("Mua sữa");
  await page.getByRole("button", { name: "Thêm", exact: true }).click();

  const sau = await page.screenshot({ fullPage: true });
  await testInfo.attach("2-sau-khi-them", { body: sau, contentType: "image/png" });

  // Chụp riêng một phần tử, lưu thành tệp
  await page.getByTestId("todo-count").screenshot({ path: testInfo.outputPath("bo-dem.png") });
});
```

| Dòng | Giải thích |
|------|-----------|
| `async ({ page }, testInfo)` | Tham số thứ hai là `testInfo` |
| `page.screenshot({ fullPage: true })` | Chụp cả trang (kể cả phần cuộn); trả về `Buffer` ảnh PNG |
| `testInfo.attach(tên, { body, contentType })` | Đính kèm vào báo cáo HTML; mở test xanh trong báo cáo vẫn thấy hai ảnh |
| `locator.screenshot({ path })` | Chụp riêng một phần tử |
| `testInfo.outputPath("bo-dem.png")` | Đường dẫn nằm trong thư mục kết quả của đúng test này, tránh các test ghi đè nhau |

Kết quả mong đợi: test xanh; mở báo cáo, bấm test sẽ thấy mục đính kèm "1-truoc-khi-them" và "2-sau-khi-them". Tệp `bo-dem.png` nằm trong thư mục test của `test-results/`.

Để che dữ liệu nhạy cảm trong ảnh, dùng tuỳ chọn `mask`:

```ts
await page.screenshot({
  path: testInfo.outputPath("an-email.png"),
  mask: [page.getByLabel("Email")],
});
```

`mask` phủ một ô màu lên phần tử được liệt kê, nên ảnh gửi ra ngoài không lộ thông tin.

## Demo code

Cấu hình đề xuất và một test hoàn chỉnh:

```ts
// playwright.config.ts (trích)
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["junit", { outputFile: "results/junit.xml" }],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

```ts
// tests/evidence.spec.ts
import { test, expect } from "@playwright/test";

test("LAB-04: thêm việc và đính kèm ảnh làm bằng chứng", async ({ page }, testInfo) => {
  await page.goto("/lab/todo");
  await page.getByTestId("reset-data").click();

  await page.getByLabel("Công việc mới").fill("Mua sữa");
  await page.getByRole("button", { name: "Thêm", exact: true }).click();
  await expect(page.getByTestId("todo-count")).toHaveText("Còn 1 việc");

  const anh = await page.screenshot({ fullPage: true });
  await testInfo.attach("todo-sau-khi-them", { body: anh, contentType: "image/png" });
});
```

Giải thích: cấu hình dùng ba reporter (terminal, HTML cho người, JUnit cho máy), chụp ảnh và quay video chỉ khi lỗi, ghi trace khi chạy lại. Test hoàn chỉnh có assertion nghiệp vụ rồi đính kèm một ảnh thể hiện kết quả.

## Bằng chứng cho bug report

Ảnh/video nên cho thấy rõ **bước đang làm, dữ liệu nhập, kết quả thực tế**. Một bug report tốt cho BUG-02 của LAB-04 viết theo mẫu ở bài Markdown:

```markdown
## [LAB-04] Bộ đếm "Còn N việc" không giảm khi hoàn thành việc

**Môi trường:** `/lab/todo?bugs=BUG-02`, Chromium, Windows 11

**Các bước tái hiện**
1. Mở trang, bấm "Reset dữ liệu lab".
2. Nhập "Mua sữa" vào "Công việc mới", bấm "Thêm".
3. Tick ô "Hoàn thành: Mua sữa".

**Kết quả thực tế:** bộ đếm hiển thị "Còn 1 việc".
**Kết quả mong đợi:** "Còn 0 việc" vì việc duy nhất đã hoàn thành.

**Bằng chứng:** `test-failed-1.png`, `video.webm`, `trace.zip` đính kèm.
```

Trước khi chia sẻ ra ngoài, che email, token và dữ liệu cá nhân trong ảnh và video.

## Thử ngay trong lab
- `/lab/todo?bugs=BUG-02` (LAB-04): chạy test ở bước 3, mở báo cáo bằng `show-report` và sao chép ảnh, video vào bug report mẫu ở trên.
- `/lab/todo` (không bật bug): chạy test bước 8 để thấy ảnh đính kèm trong test xanh.

## Lỗi thường gặp
- Triệu chứng: CI chậm và hết dung lượng artifact. Nguyên nhân: bật `video: "on"` cho mọi test. Sửa: dùng `retain-on-failure` hoặc `on-first-retry`.
- Triệu chứng: `npx playwright show-report` báo không có báo cáo hoặc mở báo cáo cũ. Nguyên nhân: chưa chạy với reporter `html` hoặc báo cáo bị ghi đè lần chạy sau. Sửa: chạy lại test, mở báo cáo ngay.
- Triệu chứng: `git status` hiện cả thư mục `playwright-report/` hoặc `test-results/`. Nguyên nhân: thiếu `.gitignore`. Sửa: thêm hai dòng này và nếu lỡ commit thì `git rm -r --cached`. Starter repo đã bỏ qua cả hai.
- Triệu chứng: `video.webm` không có hoặc rỗng ở test xanh. Nguyên nhân: `retain-on-failure` xoá video test xanh. Sửa: dùng `video: "on"` tạm thời khi cần xem video test xanh.
- Triệu chứng: ảnh so sánh (visual) khác nhau giữa các máy. Nguyên nhân: không cố định font và viewport. Sửa: chạy trong cùng môi trường, đặt `viewport` cố định (xem bài 4.9).
- Triệu chứng: ảnh đính kèm bị ghi đè giữa các test song song. Nguyên nhân: ghi vào cùng một đường dẫn cố định. Sửa: dùng `testInfo.outputPath(...)` hoặc `testInfo.attach` thay vì `path` chung.

## Tóm tắt
- Dùng nhiều reporter cùng lúc: `list` cho terminal, `html` cho người, `junit` hoặc `json` cho máy.
- `screenshot: "only-on-failure"`, `video: "retain-on-failure"`, `trace: "on-first-retry"` là bộ cấu hình cân bằng.
- Bằng chứng nằm ở `test-results/`, báo cáo ở `playwright-report/`; mở bằng `npx playwright show-report`.
- `testInfo.attach` đính kèm ảnh thủ công; `mask` che dữ liệu nhạy cảm.
- Bug report tốt có bước tái hiện, kết quả thực tế và mong đợi, kèm ảnh/video.

## Bài tập
1. (Dễ) Cấu hình reporter `html` và `junit`, chạy test rồi mở cả hai tệp. Xong khi bạn mở được `playwright-report` bằng `show-report` và thấy `results/junit.xml`.
2. (Dễ) Bật `video: "retain-on-failure"`, làm một test đỏ và tìm `video.webm`. Xong khi bạn xem được video.
3. (Vừa) Viết test LAB-04 chụp ảnh trước và sau khi thêm việc và đính kèm cả hai. Xong khi cả hai ảnh hiện trong báo cáo của test xanh.
4. (Vừa) Dùng `mask` che ô "Công việc mới" khi chụp ảnh. Xong khi ảnh không còn chữ bạn đã nhập trong ô đó.
5. (Khó) Với `?bugs=BUG-02`, thu thập ảnh, video và trace rồi viết bug report theo mẫu ở trên. Xong khi một người khác chỉ đọc bug report đã tái hiện được lỗi.
