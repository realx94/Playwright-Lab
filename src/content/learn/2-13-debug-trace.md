---
title: Debug với Inspector, UI Mode và Trace Viewer
level: 2
order: 13
minutes: 45
summary: Tìm nguyên nhân test hỏng bằng --debug, UI Mode, codegen, page.pause và Trace Viewer, thực hành trên LAB-04 Todo.
keywords: [playwright trace viewer, playwright inspector, playwright codegen]
---

## Mục tiêu bài học
- Chọn đúng công cụ cho từng tình huống: `--debug`, `--ui`, `codegen`, `page.pause()`, Trace Viewer.
- Chạy một test đỏ có chủ đích, đọc thông báo lỗi và `Call log` để xác định nguyên nhân.
- Sinh ra tệp trace, mở bằng `npx playwright show-trace` và đọc từng bước (Actions, Network, Console).
- Hiểu vì sao cấu hình `trace: "on-first-retry"` của repo không tạo trace khi chạy local và cách bật tạm bằng `--trace on`.

## Bạn cần chuẩn bị
- Đã học bài 2.8 (assertion), 2.9 (timeout), 2.11 (hooks).
- Site lab chạy được (`npm run dev`, mặc định cổng 3000) và biến `BASE_URL` đúng nếu bạn dùng starter repo.
- Máy có giao diện đồ hoạ để mở Inspector, UI Mode và Trace Viewer (trên CI không có màn hình thì chỉ dùng trace và báo cáo).

## Kiến thức cần nắm
- `npx playwright test --debug`: mở **Playwright Inspector**, chạy từng bước, có nút Step over và Resume.
- `npx playwright test --ui`: **UI Mode**, giao diện tương tác có dòng thời gian, lọc test, xem DOM tại mỗi bước và chạy lại khi sửa code (watch).
- `npx playwright codegen <url>`: ghi lại thao tác của bạn thành code nháp.
- `await page.pause()`: dừng test ngay tại dòng đó và mở Inspector.
- **Trace**: tệp `trace.zip` ghi lại toàn bộ test (DOM snapshot trước/sau mỗi hành động, mạng, console, mã nguồn). Mở bằng `npx playwright show-trace`.

## Giải thích dễ hiểu
Trace giống **camera hành trình của xe**: khi tai nạn xảy ra (test đỏ), bạn tua lại từng giây xem trang trông thế nào ở mỗi bước và mạng đã trả về gì. Không cần đoán, không cần chạy lại nhiều lần cho đến khi lỗi tái hiện (đặc biệt quý ở CI nơi bạn không ngồi trước màn hình).

Các công cụ còn lại giống các cách **kiểm tra xe**: Inspector là **lái chậm từng mét**, UI Mode là **ngồi trong xưởng có màn hình quan sát mọi bộ phận và chạy thử liên tục**, codegen là **ghi âm thao tác để làm bản nháp**. Có một quy tắc ngón tay cái:

| Tình huống | Công cụ |
|-----------|---------|
| Đang viết test mới, cần thử locator | `codegen`, Inspector (Pick locator) |
| Test đỏ ở máy bạn, cần xem từng bước | `--ui` hoặc `--debug` |
| Test đỏ ở CI hoặc máy người khác | Trace (tải trace về mở bằng `show-trace`) |
| Muốn dừng đúng một chỗ trong test dài | `page.pause()` |
| Cần xem log chi tiết các lệnh Playwright | biến môi trường `DEBUG=pw:api` |

## Thực hành từng bước

Mọi bước dùng LAB-04 `/lab/todo`. Tạo file `tests/debug-demo.spec.ts` (trong repo site thì `e2e/`).

### Bước 1. Viết một test đỏ có chủ đích

Mục đích: có thứ để điều tra. Test dưới đây kỳ vọng sai bộ đếm ("Còn 5 việc" trong khi đúng phải là "Còn 1 việc").

```ts
import { test, expect } from "@playwright/test";

test("thêm một việc thì bộ đếm tăng", async ({ page }) => {
  await page.goto("/lab/todo");
  await page.getByTestId("reset-data").click();

  await page.getByLabel("Công việc mới").fill("Mua sữa");
  await page.getByRole("button", { name: "Thêm", exact: true }).click();

  await expect(page.getByTestId("todo-count")).toHaveText("Còn 5 việc", { timeout: 2_000 });
});
```

Chạy:

```bash
npx playwright test debug-demo
```

Kết quả mong đợi (rút gọn):

```text
Error: expect(locator).toHaveText(expected) failed

Locator:  getByTestId('todo-count')
Expected: "Còn 5 việc"
Received: "Còn 1 việc"
Timeout:  2000ms

Call log:
  - Expect "toHaveText" getByTestId('todo-count') with timeout 2000ms
  - waiting for getByTestId('todo-count')
    19 × locator resolved to <p class="text-sm" data-testid="todo-count">Còn 1 việc</p>
       - unexpected value "Còn 1 việc"
...
    Error Context: test-results\...\error-context.md
```

(Định dạng lấy từ lần chạy thật với Playwright 1.64; số `19 ×` là số lần Playwright thử lại trong thời gian chờ nên sẽ khác ở máy bạn. Dòng `Error Context` trỏ tới file `error-context.md` mô tả trang lúc lỗi.)

Cách đọc thông báo:

| Dòng | Nói gì |
|------|--------|
| `Locator` | Phần tử đang kiểm tra |
| `Expected` và `Received` | Giá trị mong đợi so với thực tế sau khi hết timeout |
| `Timeout` | Thời gian đã chờ |
| `locator resolved to <p ...>` | Locator **đã tìm thấy** phần tử, tức locator đúng; vấn đề nằm ở giá trị |
| `unexpected value` | Giá trị khác mong đợi |

Đây là thông tin quan trọng nhất: locator tìm thấy phần tử và giá trị là "Còn 1 việc", nên lỗi nằm ở **kỳ vọng của test**, không phải ở ứng dụng. Test vẫn tạo ra thư mục `test-results/` và nếu cấu hình có `screenshot: "only-on-failure"` (như starter repo) thì có cả ảnh chụp lúc lỗi.

### Bước 2. Xem log chi tiết từng lệnh bằng `DEBUG=pw:api`

Mục đích: khi cần biết Playwright thực sự làm gì ở từng lệnh, không cần mở giao diện.

Git Bash hoặc macOS/Linux Terminal:

```bash
DEBUG=pw:api npx playwright test debug-demo
```

PowerShell (Windows):

```powershell
$env:DEBUG = "pw:api"; npx playwright test debug-demo; Remove-Item Env:DEBUG
```

| Phần | Ý nghĩa |
|------|---------|
| `DEBUG=pw:api` | Biến môi trường bật log mức API của Playwright |
| `Remove-Item Env:DEBUG` | Xoá biến sau khi chạy, tránh ảnh hưởng các lệnh sau trong cùng cửa sổ PowerShell |

Kết quả mong đợi: các dòng dạng `pw:api => page.goto started` và `pw:api <= page.goto succeeded` cho từng lệnh. Hữu ích để biết lệnh nào chậm.

### Bước 3. Chạy với `--debug` (Playwright Inspector)

Mục đích: chạy chậm từng bước và quan sát trang.

```bash
npx playwright test debug-demo --debug
```

| Phần | Ý nghĩa |
|------|---------|
| `--debug` | Tương đương đặt `PWDEBUG=1` và các tuỳ chọn `--timeout=0`, `--max-failures=1`, `--headed`, `--workers=1` (theo `npx playwright test --help`); trình duyệt hiện lên và dừng ở lệnh đầu tiên |

Kết quả mong đợi: một cửa sổ trình duyệt và cửa sổ **Playwright Inspector** hiện ra. Trong Inspector bạn thấy mã nguồn test với dòng đang dừng được tô sáng. Các nút chính:

| Nút | Tác dụng |
|-----|----------|
| Resume (F8) | Chạy tiếp đến điểm dừng kế hoặc hết test; khi đang chạy, nút này đổi thành Pause (cũng F8) |
| Step over (F10) | Chạy đúng một lệnh rồi dừng |
| Pick locator | Bấm vào một phần tử trên trang để Inspector gợi ý locator chuẩn |
| Tab Locator | Gõ locator ("Type locator to inspect") và xem phần tử nào được tô sáng trên trang; có nút Copy |
| Tab Log | Nhật ký các lệnh Playwright đã chạy |
| Tab Aria | Gõ mẫu aria snapshot để so khớp |

Tên nút và tab lấy từ mã nguồn giao diện Inspector của Playwright 1.64; bố cục có thể khác nhẹ ở phiên bản khác.

Thử bấm Step over liên tục: mỗi lần bấm, bạn thấy một thao tác thật xảy ra trên trang lab (điền "Mua sữa", bấm Thêm...). Đến dòng `expect` bạn thấy chính xác trang đang hiện "Còn 1 việc". Đóng cửa sổ Inspector để dừng.

Nếu gặp lỗi: không thấy cửa sổ nào hiện lên nghĩa là bạn đang chạy trên môi trường không có màn hình (SSH, container); dùng trace ở bước 6.

### Bước 4. Dừng đúng một điểm bằng `page.pause()`

Mục đích: bỏ qua phần đầu test, dừng đúng chỗ nghi ngờ.

```ts
await page.getByRole("button", { name: "Thêm", exact: true }).click();
await page.pause(); // dừng ở đây, mở Inspector
await expect(page.getByTestId("todo-count")).toHaveText("Còn 5 việc", { timeout: 2_000 });
```

Chạy bằng lệnh `npx playwright test debug-demo --headed`. Test chạy bình thường đến dòng `page.pause()` rồi dừng, Inspector mở ra. Bạn có thể tự bấm trên trang, thử locator, rồi Resume.

| Lưu ý | Giải thích |
|-------|-----------|
| `--headed` | Hiện cửa sổ trình duyệt. Khi chạy headless (mặc định), `page.pause()` bị bỏ qua |
| Xoá `page.pause()` trước khi commit | Nếu để lại, test treo trên CI |

Kết quả mong đợi: trình duyệt dừng, Inspector hiện. Nhớ xoá dòng `page.pause()` sau khi xong.

### Bước 5. UI Mode

Mục đích: giao diện đầy đủ để chạy, xem và lặp lại.

```bash
npx playwright test --ui
```

Kết quả mong đợi: một cửa sổ riêng mở ra. Bố cục thường gặp (giao diện có thể thay đổi nhẹ giữa các phiên bản):

| Khu vực | Dùng để |
|---------|---------|
| Mục "Tests" (cột trái) | Chạy một test (nút tam giác khi rê chuột), ô lọc "Filter (e.g. text, @tag)", lọc theo Status và Projects; nút Run all (F5), Stop (Shift + F5) |
| Nút "Watch" (hình mắt) | Tự chạy lại khi bạn lưu file test; có nút "Watch all" ở đầu danh sách |
| Nút "Toggle output" (Ctrl + `) | Xem output terminal của lần chạy |
| Dòng thời gian phía trên | Rê chuột để xem trang ở từng thời điểm, kéo để chọn một khoảng |
| Tab "Actions" | Danh sách các hành động; bấm một dòng để xem DOM tại hành động đó (có các chế độ Before, Action, After) |
| Tab "Errors", "Console", "Network" (cùng "Locator", "Source", "Call", "Log", "Metadata", "Attachments") | Thông báo lỗi, log trình duyệt, các request, v.v. |
| Pick locator | Bấm vào ảnh DOM để lấy locator |

Thử: bấm chạy test ở bước 1, chọn bước `expect.toHaveText` ở tab Actions, bạn thấy DOM tại thời điểm đó với "Còn 1 việc". Sửa chuỗi kỳ vọng thành "Còn 1 việc" và lưu: nếu bật Watch, test tự chạy lại và xanh.

### Bước 6. Tạo và mở Trace

Mục đích: ghi lại toàn bộ test để xem lại sau, kể cả trên máy khác.

Cấu hình sẵn của repo là `trace: "on-first-retry"`: chỉ ghi trace khi test **được chạy lại** sau khi đỏ. Nhưng retry mặc định bằng 0 ở local (starter repo chỉ bật retry trên CI), nên chạy local sẽ **không** có trace. Muốn ghi tạm, ép bằng cờ:

```bash
npx playwright test debug-demo --trace on
```

| Phần | Ý nghĩa |
|------|---------|
| `--trace on` | Ghi trace cho mọi test của lần chạy này, ghi đè giá trị trong config |

Khi test đỏ, terminal cũng in sẵn đường dẫn và lệnh mở (đã thấy ở bản chạy thật): `attachment #2: trace (application/zip)` kèm `npx playwright show-trace test-results\...	race.zip`. Kết quả mong đợi: thư mục `test-results/` có thư mục con tên theo test, được ghép từ tên file, tên test và tên project (ví dụ `debug-demo-ten-test-chromium/`), bên trong có `trace.zip`. Mở bằng:

```bash
npx playwright show-trace test-results/<tên-thư-mục>/trace.zip
```

| Phần | Ý nghĩa |
|------|---------|
| `show-trace` | Mở Trace Viewer (một cửa sổ riêng) |
| Đối số cuối | Đường dẫn tới `trace.zip`; thay `<tên-thư-mục>` bằng tên thật (dùng Tab để hoàn thành đường dẫn) |

Trong Trace Viewer, hãy tập thói quen đi theo thứ tự:

1. Cột trái **Actions**: tìm bước màu đỏ (thất bại).
2. Bấm vào bước đó; khung giữa hiện ảnh DOM, có thể chuyển giữa các chế độ **Before**, **Action** (làm nổi phần tử và điểm bấm) và **After**.
3. Panel dưới: **Locator**, **Source** (dòng code tương ứng), **Call** (thông số lệnh, thời gian), **Log** (từng lần thử), **Errors** (thông báo lỗi), **Console** (log trình duyệt), **Network** (request và phản hồi), **Metadata** (trình duyệt, viewport, thời lượng), **Attachments** (ảnh đính kèm).
4. Dùng nút **Pick locator** trong viewer để thử locator trực tiếp trên ảnh DOM, nút **Copy locator** để chép.

Tên tab đối chiếu với tài liệu playwright.dev/docs/trace-viewer và mã nguồn Trace Viewer Playwright 1.64; vị trí các panel có thể khác theo kích thước cửa sổ (có nút "Dock to bottom"/"Dock to right").

Cách khác: `npx playwright show-report`, mở test đỏ và bấm biểu tượng/liên kết trace trong báo cáo HTML. Trace là một tệp zip, bạn có thể gửi cho đồng nghiệp hoặc tải từ artifact của CI về mở. Cũng có thể kéo thả tệp zip vào trang `trace.playwright.dev` (xử lý hoàn toàn trên trình duyệt của bạn, không tải lên máy chủ).

Nếu gặp lỗi: `Error: ENOENT ... trace.zip` do sai đường dẫn; mở thư mục `test-results` bằng trình quản lý tệp để sao chép đường dẫn chính xác.

### Bước 7. Cấu hình trace cho dự án

Mục đích: quyết định lúc nào ghi trace.

```ts
// playwright.config.ts
use: {
  trace: "on-first-retry",   // mặc định của repo: ghi khi chạy lại sau lần đỏ đầu
},
retries: process.env.CI ? 2 : 0,
```

| Giá trị `trace` | Khi nào ghi | Gợi ý |
|-----------------|------------|-------|
| `"off"` | Không | Hiếm khi dùng |
| `"on"` | Mọi test | Chậm, nặng; chỉ khi điều tra |
| `"retain-on-failure"` | Ghi mọi test, giữ lại nếu đỏ | Tiện khi chạy local và CI không có retry |
| `"on-first-retry"` | Chỉ ở lần chạy lại đầu tiên | Nhẹ nhất, cần có `retries` > 0 |

Kết quả mong đợi: với `retries: 2` trên CI, test đỏ ở lần đầu sẽ được chạy lại có kèm trace; trace nằm trong artifact. Bài 2.14 và bài CI/CD (5.1) nói thêm về cách giữ và tải artifact.

### Bước 8. Sinh code nháp bằng `codegen`

Mục đích: lấy bộ khung test nhanh rồi chỉnh sửa.

```bash
npx playwright codegen http://localhost:3000/lab/todo
```

| Phần | Ý nghĩa |
|------|---------|
| `codegen` | Mở trình duyệt và Inspector ở chế độ ghi |
| URL | Trang bắt đầu |

Kết quả mong đợi: bạn thao tác trên trang (điền việc, bấm Thêm...) và cửa sổ Inspector sinh ra code TypeScript tương ứng theo thời gian thực. Có thể thêm `-o tests/todo.spec.ts` để ghi ra tệp.

Codegen cho kết quả nhanh nhưng chỉ là **bản nháp**. Quan trọng nhất: đọc lại và sửa locator cho dễ đọc, đưa vào `beforeEach`, thêm assertion có ý nghĩa nghiệp vụ (codegen thường chỉ sinh vài assertion cơ bản).

## Demo code

Một test đỏ có chủ đích kèm hướng dẫn điều tra, nằm trọn trong một file:

```ts
import { test, expect } from "@playwright/test";

test.describe("Điều tra test đỏ trên LAB-04", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/todo");
    await page.getByTestId("reset-data").click();
  });

  test("thêm một việc thì bộ đếm là Còn 1 việc", async ({ page }) => {
    await page.getByLabel("Công việc mới").fill("Mua sữa");
    await page.getByRole("button", { name: "Thêm", exact: true }).click();

    // await page.pause();  // bỏ comment khi cần dừng để xem bằng Inspector
    await expect(page.getByTestId("todo-count")).toHaveText("Còn 1 việc");
  });

  test("BUG-02 làm bộ đếm sai (điều tra bằng trace)", async ({ page }) => {
    await page.goto("/lab/todo?bugs=BUG-02");
    await page.getByLabel("Công việc mới").fill("Mua sữa");
    await page.getByRole("button", { name: "Thêm", exact: true }).click();
    await page.getByRole("checkbox", { name: "Hoàn thành: Mua sữa" }).check();

    // Đúng phải là "Còn 0 việc". Test này ĐỎ khi bug bật: đó là mục đích.
    await expect(page.getByTestId("todo-count")).toHaveText("Còn 0 việc");
  });
});
```

Test thứ hai đỏ có chủ đích (BUG-02 của LAB-04 làm bộ đếm không giảm khi hoàn thành việc). Chạy `npx playwright test debug-demo --trace on`, mở trace và quan sát: bước `check` đã thành công, DOM sau đó vẫn hiện "Còn 1 việc". Chứng cứ cho thấy lỗi ở **ứng dụng**, không phải ở test.

## Quy trình điều tra test đỏ
1. Đọc thông báo lỗi và dòng code bị dừng; đọc `Call log`.
2. Mở trace hoặc ảnh chụp: phần tử có thật sự xuất hiện không, giá trị là gì?
3. Kiểm tra locator có khớp nhiều hơn một phần tử không (lỗi "strict mode violation").
4. Xem tab Network và Console trong trace: có request thất bại hoặc lỗi JavaScript không?
5. Phân loại: lỗi của test (locator, kỳ vọng sai, thiếu chờ) hay lỗi của ứng dụng (bug thật)? Chỉ sau đó mới sửa; không tăng timeout bừa.

## Thử ngay trong lab
- `/lab/todo` (LAB-04): chạy `npx playwright test debug-demo --ui`, cố tình đổi một locator sai (ví dụ `getByLabel("Công việc cũ")`) và dùng tab Actions để thấy chính xác lỗi `waiting for getByLabel('Công việc cũ')`.
- `/lab/todo?bugs=BUG-02`: bật bug rồi dùng trace để chứng minh bộ đếm sai mà không cần đoán.

## Lỗi thường gặp
- Triệu chứng: chạy `npx playwright test` local, test đỏ nhưng không thấy `trace.zip` trong `test-results/`. Nguyên nhân: `trace: "on-first-retry"` và `retries` bằng 0. Sửa: thêm `--trace on` khi điều tra, hoặc đặt `trace: "retain-on-failure"`.
- Triệu chứng: `page.pause()` không làm gì. Nguyên nhân: chạy headless. Sửa: thêm `--headed` hoặc dùng `--debug`.
- Triệu chứng: test treo mãi trên CI. Nguyên nhân: quên xoá `page.pause()`. Sửa: xoá, và bật `forbidOnly`/quy tắc lint để bắt lỗi tương tự.
- Triệu chứng: `Error: strict mode violation: getByRole('button', { name: 'Xoá' }) resolved to 2 elements`. Nguyên nhân: locator khớp nhiều phần tử. Sửa: thu hẹp bằng tên đầy đủ (`name: "Xoá Mua sữa"`) hoặc `exact: true`; dùng Pick locator của Inspector để lấy locator chuẩn.
- Triệu chứng: dùng nguyên locator dài do codegen sinh ra (ví dụ chuỗi CSS dài) rồi vỡ khi giao diện đổi. Nguyên nhân: không chỉnh sửa bản nháp. Sửa: chuyển về `getByRole`, `getByLabel`, `getByTestId`.
- Triệu chứng: sửa test cho xanh mà không rõ nguyên nhân. Nguyên nhân: không phân biệt lỗi của test hay của ứng dụng. Sửa: dùng bước 4 và 5 của quy trình điều tra, ghi lại bằng chứng (ảnh, trace) trước khi sửa.

## Tóm tắt
- `--debug` để đi chậm từng bước, `--ui` để xem và lặp lại, `page.pause()` để dừng đúng chỗ, `codegen` để lấy bản nháp.
- Trace ghi lại toàn bộ test; mở bằng `npx playwright show-trace <đường dẫn>/trace.zip`.
- Repo dùng `trace: "on-first-retry"`; local không retry nên dùng `--trace on` khi điều tra.
- Đọc `Call log` và `Locator ... resolved to` để biết lỗi do locator hay do giá trị.
- Luôn phân loại lỗi của test hay lỗi của ứng dụng trước khi sửa.

## Bài tập
1. (Dễ) Chạy test đỏ ở bước 1 và chép lại hai dòng `Expected` và `Received`. Xong khi bạn nói được vì sao lỗi nằm ở kỳ vọng chứ không phải ở locator.
2. (Dễ) Chạy `npx playwright test debug-demo --debug` và bấm Step over qua toàn bộ các lệnh. Xong khi bạn thấy từng thao tác thực hiện trên trang.
3. (Vừa) Chạy `--trace on`, mở `show-trace`, và tìm trong tab Network ít nhất một request mà trang gửi khi load `/lab/todo`. Xong khi bạn chụp màn hình tab Network.
4. (Vừa) Cố tình đổi một locator sai, chạy với `--ui`, và tìm ra lý do test đỏ từ tab Actions và Errors. Xong khi bạn sửa lại và test xanh.
5. (Khó) Bật `?bugs=BUG-02` ở LAB-04, dùng trace chứng minh bộ đếm sai và viết ba dòng mô tả bug (bước tái hiện, kết quả thực tế, kết quả mong đợi). Xong khi mô tả đủ để người khác tái hiện lỗi.
