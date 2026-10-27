---
title: Annotation, nhóm test, chạy song song và retry
level: 2
order: 19
minutes: 60
summary: test.skip, fixme, fail, slow và only; điều kiện theo trình duyệt hoặc project; describe lồng nhau và mode serial hoặc parallel; workers, tag với --grep, annotation tuỳ chỉnh; retries, --last-failed, --repeat-each và cách đọc test flaky.
keywords: [playwright test.skip fixme, playwright serial parallel, playwright retries flaky, playwright tag grep]
---

## Mục tiêu bài học
- Chọn đúng annotation cho từng tình huống: `skip`, `fixme`, `fail`, `slow`, `only`, và đọc được cách mỗi loại hiện trong kết quả chạy.
- Viết điều kiện bỏ qua theo trình duyệt hoặc project (ví dụ chỉ chạy trên desktop) và hiểu vì sao điều kiện nên đi kèm lý do.
- Tổ chức `test.describe` lồng nhau, biết thứ tự chạy hook, và chọn `mode` là `default`, `parallel` hay `serial` cho từng nhóm; nêu được hậu quả của `serial`.
- Điều khiển mức song song bằng `fullyParallel` và `workers`, gắn tag rồi lọc bằng `--grep`, ghi chú tuỳ chỉnh bằng `annotation` và `test.info()`.
- Cấu hình `retries` (toàn cục và theo nhóm), dùng `--last-failed` và `--repeat-each`, và hiểu test **flaky** được báo cáo khác test đỏ thế nào.

## Bạn cần chuẩn bị
- Đã học bài 2.4 (cấu trúc test, `skip`, `fixme`, `only`, tag cơ bản), bài 2.11 (hooks, `describe`, `serial`) và bài 5.6 (flaky test). Bài này **không dạy lại** những phần đó mà ghép chúng thành bộ công cụ quản lý cả bộ test.
- Site lab chạy ở `http://localhost:3000`, `baseURL` đã cấu hình. Bài dùng LAB-04 Todo (`/lab/todo`) và LAB-01 Login (`/lab/login`).
- Để thử điều kiện theo project, thêm một project mobile trong `playwright.config.ts` (xem Bước 2).

## Kiến thức cần nắm
- Annotation dựng sẵn: `test.skip`, `test.fixme`, `test.fail`, `test.slow`, `test.only`.
- Điều kiện: truyền một biểu thức boolean (hoặc hàm nhận fixture) vào annotation, kèm lý do.
- `test.describe` lồng nhau; hook của nhóm ngoài chạy trước hook của nhóm trong.
- `test.describe.configure({ mode, retries, timeout })`: cấu hình riêng cho một nhóm.
- `fullyParallel`, `workers`, `forbidOnly`, `retries` trong `playwright.config.ts` và cờ dòng lệnh tương ứng.
- Tag (`{ tag: "@smoke" }`) và `--grep`, `--grep-invert`.
- `test.info()` và `annotation: { type, description }` để ghi thông tin vào kết quả.
- `--last-failed`, `--repeat-each`, `--retries`; test **flaky** là test đỏ ở lần đầu nhưng xanh ở lần chạy lại.

## Giải thích dễ hiểu

### Bảng phân công của một lớp học
Hãy hình dung cả bộ test là một lớp học 40 học sinh và bạn là giáo viên. Có em ốm nên **vắng mặt có lý do** (`skip`: không áp dụng trong hoàn cảnh này). Có bài chưa chấm xong, **ghi chú "sẽ làm"** (`fixme`: biết là hỏng, cần sửa). Có em mà bạn **biết chắc sẽ trả lời sai** vì chủ đề chưa dạy, và bạn muốn được báo nếu em bất ngờ trả lời đúng (`fail`: dự kiến đỏ). Có em cần **thêm thời gian làm bài** (`slow`). Cuối cùng, nhóm trưởng cho từng tổ làm việc cùng lúc (`parallel`) hoặc xếp hàng làm tuần tự vì tổ sau phải dùng kết quả của tổ trước (`serial`).

Điểm mấu chốt: mọi annotation đều là **cách nói với người đọc kết quả chạy rằng bạn biết chuyện gì đang xảy ra**. Một test bị tắt không lý do là nợ kỹ thuật vô hình; một test bị tắt có điều kiện, có lý do, có người theo dõi là một quyết định có kiểm soát.

### Bốn annotation, bốn ý nghĩa khác nhau

| Annotation | Playwright làm gì | Dùng khi |
|------------|-------------------|----------|
| `test.skip` | Không chạy test | Test không áp dụng với cấu hình này (ví dụ tính năng chỉ có trên desktop) |
| `test.fixme` | Không chạy test | Test hoặc tính năng đang hỏng, cần sửa; mang nghĩa "việc cần làm" |
| `test.fail` | **Vẫn chạy** test và mong nó đỏ; đỏ thì coi là đạt, xanh thì báo lỗi | Bug đã biết, muốn được nhắc khi bug được sửa |
| `test.slow` | Nhân ba timeout của test | Test thật sự dài (nhiều bước, dữ liệu lớn), không phải để che test chậm do lỗi |

`test.fail` hay bị hiểu sai. Nó không "bỏ qua": nó **đảo kỳ vọng**. Test vẫn chạy; nếu nó thất bại như dự kiến thì được tính là đạt, còn nếu nó bất ngờ xanh (bug đã được sửa) thì Playwright báo đỏ để bạn gỡ annotation. Vì vậy `fail` hợp với việc "ghi lại bug đã biết mà không làm đỏ cả CI".

### Vì sao `only` nguy hiểm và `serial` đắt giá
`test.only` ép runner chỉ chạy test được đánh dấu. Đặt nó lúc đang viết thì tiện, commit nhầm lên thì CI chỉ chạy một test và báo xanh giả. Cấu hình `forbidOnly` biến sự cố đó thành lỗi rõ ràng.

`serial` tạo ra quan hệ phụ thuộc giữa các test: test sau chạy trên trạng thái test trước để lại. Nếu một test đỏ, các test sau bị bỏ qua. Bạn mua được sự liền mạch, nhưng trả giá bằng ba thứ: test đỏ khiến cả nhóm mù (không biết các test sau có thật sự đỏ không), không chạy riêng lẻ được, và nếu bật retry thì **cả nhóm** chạy lại từ đầu. Vì vậy mặc định hãy viết test độc lập.

## Thực hành từng bước

Tạo file `tests/annotations.spec.ts` (hoặc `e2e/...` nếu bạn làm trong repo của site). Khung chung dùng cho mọi bước:

```ts
import { test, expect, type Page } from "@playwright/test";

async function open(page: Page, query = "") {
  await page.goto("/lab/todo" + query);
  await page.getByTestId("reset-data").click();
}

async function add(page: Page, title: string) {
  await page.getByLabel("Công việc mới").fill(title);
  await page.getByRole("button", { name: "Thêm", exact: true }).click();
}
```

Hàm `open` mở LAB-04 và bấm Reset để bắt đầu từ trạng thái sạch; `add` thêm một việc. Các bước dưới đây thêm test vào cùng file.

### Bước 1. `skip` có điều kiện và `fixme`

Mục đích: bỏ qua test đúng chỗ, có lý do hiển thị.

```ts
test("danh sách rỗng lúc đầu", async ({ page, isMobile }) => {
  test.skip(isMobile, "Bố cục mobile chưa có test riêng");
  await open(page);
  await expect(page.getByTestId("todo-empty")).toBeVisible();
});

test.fixme("xuất danh sách ra CSV", async ({ page }) => {
  await open(page);
});
```

| Phần | Ý nghĩa |
|------|---------|
| `isMobile` | Fixture có sẵn: `true` khi project dùng thiết bị giả lập di động |
| `test.skip(điều kiện, lý do)` | Gọi **bên trong** test: nếu điều kiện đúng, test dừng và được tính là skipped. Tham số thứ hai là lý do, hiện trong báo cáo |
| `test.fixme("tên", fn)` | Dạng khai báo: test không chạy, và mang nghĩa "việc cần sửa", dễ tìm lại bằng tìm kiếm `fixme` |

Kết quả mong đợi: chạy với project desktop, test đầu xanh, test `fixme` hiện dòng skipped ở danh sách (dấu gạch ngang) và phần tổng kết có `1 skipped`.

Nếu gặp lỗi: gọi `test.skip(...)` ở **ngoài** mọi test và hook thì Playwright báo lỗi vì cần ngữ cảnh. Chỉ gọi nó trong thân test, trong hook, hoặc trong `test.describe` theo Bước 3.

### Bước 2. Điều kiện theo trình duyệt và project

Mục đích: cùng một file chạy trên nhiều project nhưng có test chỉ dành cho một loại.

Trước hết thêm project mobile vào `playwright.config.ts` (xem thêm phần cấu hình project ở bài 4.9):

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
```

Giữ nguyên các thiết lập khác của bạn (`baseURL`, `reporter`...). Rồi viết hai kiểu điều kiện:

```ts
test("chỉ kiểm tra trên Chromium", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Chỉ kiểm tra trên Chromium");
  await open(page);
  await expect(page.getByTestId("todo-empty")).toBeVisible();
});

test("bỏ qua theo tên project", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Bỏ qua trên project mobile");
  await open(page);
});
```

| Phần | Ý nghĩa |
|------|---------|
| `browserName` | Fixture có giá trị `"chromium"`, `"firefox"` hoặc `"webkit"` |
| `testInfo.project.name` | Tên project đang chạy, lấy từ `projects[].name` trong config |
| Tham số thứ hai của test | `testInfo`, thông tin về test hiện tại (xem Bước 8) |

Chạy cả hai project:

```bash
npx playwright test annotations
```

Kết quả mong đợi (rút gọn, trên bản tác giả thử với hai project): với project `mobile`, dòng của hai test này có dấu gạch ngang (skipped), còn ở `chromium` cả hai xanh; phần tổng kết liệt kê số `skipped` và số `passed` chung của cả hai project. Dùng `--project=mobile` hoặc `--project=chromium` để chạy riêng một project.

Lưu ý: điều kiện theo project nên dựa trên **đặc tính** (`isMobile`, `browserName`) khi có thể, và chỉ dùng tên project khi không có đặc tính phù hợp; tên project do bạn đặt nên dễ lệch nếu ai đó đổi tên.

### Bước 3. `skip` cho cả nhóm bằng `describe`

Mục đích: tắt nhiều test cùng lúc mà không lặp điều kiện.

```ts
test.describe("chỉ desktop", () => {
  test.skip(({ isMobile }) => isMobile, "Chưa hỗ trợ mobile");

  test("bộ lọc Đang làm", async ({ page }) => {
    await open(page);
    await add(page, "A");
    await add(page, "B");
    await page.getByRole("checkbox", { name: "Hoàn thành: A" }).check();
    await page.getByRole("button", { name: "Đang làm" }).click();
    await expect(page.getByTestId("todo-title")).toHaveText("B");
  });
});
```

Giải thích: ở cấp nhóm, `test.skip` nhận một **hàm** nhận fixture (ở đây `isMobile`) thay vì giá trị, vì fixture chưa có lúc khai báo nhóm. Mọi test trong nhóm bị bỏ qua khi hàm trả `true`.

Kết quả mong đợi: ở project `mobile`, test trong nhóm hiện skipped; ở `chromium` test xanh.

### Bước 4. `fail` cho bug đã biết, `slow` cho test dài

Mục đích: ghi lại bug mà không làm đỏ CI, và cấp thêm thời gian khi thật sự cần.

```ts
test("trùng tên không phân biệt hoa thường bị chặn", async ({ page }) => {
  test.fail(true, "BUG-01: lab cho phép trùng tên khi bật bug này");
  await open(page, "?bugs=BUG-01");
  await add(page, "Mua sữa");
  await add(page, "mua SỮA");
  await expect(page.getByTestId("todo-error")).toHaveText("Công việc này đã tồn tại", { timeout: 1000 });
});

test("thêm 20 việc rồi đếm", async ({ page }) => {
  test.slow();
  await open(page);
  for (let i = 1; i <= 20; i++) await add(page, "Việc " + i);
  await expect(page.getByTestId("todo-item")).toHaveCount(20);
});
```

| Phần | Ý nghĩa |
|------|---------|
| `test.fail(true, lý do)` | Đánh dấu test **dự kiến đỏ**. Tham số đầu là điều kiện (ở đây luôn đúng) |
| `?bugs=BUG-01` | Bật bug "cho phép trùng tên" của lab (trang `/labs/todo` mô tả các bug của lab) |
| `{ timeout: 1000 }` | Rút ngắn chờ của assertion để test dự kiến đỏ không phải chờ 5 giây |
| `test.slow()` | Nhân ba timeout của test: mặc định 30 giây thành 90 giây |

Kết quả mong đợi: ở danh sách chạy, test `fail` hiện dấu thất bại (`x`) nhưng phần tổng kết vẫn tính nó trong số `passed` vì thất bại là dự kiến (tác giả đã chạy: kết quả JSON cho thấy `expectedStatus` là `failed` và `status` là `expected`). Nếu một ngày bug được sửa và test bất ngờ xanh, Playwright sẽ báo đỏ để bạn gỡ `test.fail`. Test `slow` xanh; bạn có thể xác nhận bằng `expect(test.info().timeout).toBe(90_000)` trong thân test.

Đừng lạm dụng `slow`: nếu test chậm do ứng dụng chậm hay do chờ cố định, hãy tìm nguyên nhân (bài 2.9 và 5.5) thay vì cấp thêm thời gian.

### Bước 5. `test.only` và `forbidOnly`

Mục đích: dùng `only` khi viết mà không để nó lọt lên CI. Xem bài 2.4 cho cú pháp; phần mới là chốt chặn:

```ts
// playwright.config.ts
export default defineConfig({
  forbidOnly: !!process.env.CI,
});
```

Cờ dòng lệnh tương đương là `--forbid-only`. Thử bằng cách thêm `test.only("A", ...)` vào file rồi chạy:

```bash
npx playwright test annotations --forbid-only
```

Kết quả mong đợi (đã chạy thật, Playwright 1.64):

```text
Error: item focused with '.only' is not allowed due to the '--forbid-only' CLI flag: "annotations.spec.ts A"
```

Giải thích: khi còn `only` mà chạy với `forbidOnly`, Playwright dừng ngay với lỗi, không chạy test nào. Ở máy bạn (`CI` không có), `only` vẫn hoạt động bình thường nên bạn dùng được lúc viết. Xoá `test.only` trước khi tiếp tục.

### Bước 6. `describe` lồng nhau và thứ tự hook

Mục đích: tổ chức theo cây và hiểu hook nào chạy trước.

```ts
test.describe("LAB-04 Todo", () => {
  test.beforeEach(async ({ page }) => {
    await open(page);                      // (1) hook của nhóm ngoài
  });

  test.describe("khi đã có hai việc", () => {
    test.beforeEach(async ({ page }) => {
      await add(page, "A");                // (2) hook của nhóm trong
      await add(page, "B");
    });

    test("đếm đúng", async ({ page }) => {
      await expect(page.getByTestId("todo-count")).toHaveText("Còn 2 việc");
    });
  });
});
```

Quy tắc: hook của nhóm **ngoài chạy trước**, rồi tới hook của nhóm trong, rồi mới tới thân test. `afterEach` thì ngược lại (trong rồi ngoài). Tên trong báo cáo ghép từ ngoài vào trong: `LAB-04 Todo › khi đã có hai việc › đếm đúng`. Nhóm lồng nhau cũng thừa hưởng điều kiện `test.skip` và cấu hình `describe.configure` của nhóm ngoài. Đừng lồng quá ba tầng: người đọc khó theo dõi.

Kết quả mong đợi: test xanh. Tác giả kiểm tra thứ tự bằng cách ghi `test.info().annotations.push({ type: "order", description: "outer" })` rồi `"inner"` trong từng hook và đọc kết quả: mảng có `outer` trước `inner`.

### Bước 7. `mode`: `default`, `parallel`, `serial`, và hậu quả của `serial`

Mục đích: chọn cách chạy cho một nhóm.

```ts
test.describe("chạy độc lập", () => {
  test.describe.configure({ mode: "parallel" });
  test("M1", async () => {});
  test("M2", async () => {});
});

test.describe("quy trình liền mạch", () => {
  test.describe.configure({ mode: "serial" });

  test("S1 xanh", async ({ page }) => {
    await open(page);
  });
  test("S2 đỏ có chủ đích", async ({ page }) => {
    await open(page);
    await expect(page.getByTestId("todo-item")).toHaveCount(3, { timeout: 500 });
  });
  test("S3 phụ thuộc S2", async ({ page }) => {
    await open(page);
  });
});
```

| `mode` | Hành vi |
|--------|---------|
| `"default"` | Theo cấu hình chung: nếu `fullyParallel` bật thì song song, nếu không thì test trong cùng file chạy lần lượt |
| `"parallel"` | Các test của nhóm có thể chạy song song, bất kể `fullyParallel` |
| `"serial"` | Chạy theo thứ tự khai báo trong cùng một worker; test đỏ thì các test sau bị bỏ qua |

Kết quả mong đợi khi chạy (đã chạy thật):

```text
  ok  [chromium] › ... › S serial › S1 xanh
  x   [chromium] › ... › S serial › S2 đỏ có chủ đích
  -   [chromium] › ... › S serial › S3 phụ thuộc S2

  1 failed
  1 did not run
```

Cách đọc: `S3` **không được chạy** nên nó không xanh cũng không đỏ, nó "did not run". Đây chính là hậu quả: bạn không biết S3 có còn đúng không cho tới khi sửa S2. Với `--retries=1`, khi S2 đỏ thì Playwright chạy lại **cả nhóm từ S1** (S1 hiện hai lần chạy `passed, passed`); chi phí retry của nhóm serial tăng tương ứng.

Dùng `serial` khi quy trình thật sự không tách được (dựng một phiên làm việc dài, mỗi test là một bước). Nếu chỉ vì "dễ viết", hãy dùng `beforeEach` để mỗi test tự dựng dữ liệu (bài 2.11 và 4.3).

### Bước 8. Song song: `fullyParallel` và `workers`

Mục đích: kiểm soát việc chạy cùng lúc.

```ts
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,                       // test trong cùng file cũng chạy song song
  workers: process.env.CI ? 2 : undefined,   // CI chạy 2 worker, máy bạn dùng mặc định
});
```

| Thiết lập | Ý nghĩa |
|-----------|---------|
| `fullyParallel: true` | Mỗi test là một đơn vị song song; không đặt thì chỉ các **file** song song với nhau |
| `workers` | Số tiến trình chạy cùng lúc; để trống thì mặc định bằng một nửa số nhân CPU |
| `--workers=1` | Chạy lần lượt: loại trừ chạy song song khi cần tìm nguyên nhân (bài 5.6) |

Chạy `npx playwright test annotations --workers=4` và đọc dòng đầu: `Running N tests using M workers` (M không vượt quá N). Khi một test đỏ, worker chứa nó bị bỏ và Playwright khởi động worker mới để các test sau sạch trạng thái. Chạy song song là phép thử tốt: test chỉ xanh khi `--workers=1` cho thấy test phụ thuộc dữ liệu chung.

### Bước 9. Tag, `--grep` và annotation tuỳ chỉnh

Mục đích: lọc và ghi chú. Xem bài 2.4 và 3.9 cho cú pháp tag; ở đây là phần kết hợp:

```ts
test.describe("LAB-01 Login", { tag: "@auth" }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/login");
    await page.getByTestId("reset-data").click();
  });

  test("đăng nhập hợp lệ", { tag: "@smoke" }, async ({ page }) => {
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByLabel("Mật khẩu").fill("Passw0rd!");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.getByTestId("dashboard")).toBeVisible();
  });

  test(
    "khoá tài khoản sau 5 lần sai",
    { tag: ["@smoke", "@security"], annotation: { type: "rule", description: "Khoá sau 5 lần sai" } },
    async ({ page }) => {
      for (let i = 0; i < 5; i++) {
        await page.getByLabel("Email").fill("user@lab.dev");
        await page.getByLabel("Mật khẩu").fill("Wrong123!");
        await page.getByRole("button", { name: "Đăng nhập" }).click();
      }
      await expect(page.getByTestId("form-error")).toContainText("bị khoá");
    },
  );
});
```

Chạy lọc (đã chạy thật trên bản thử gồm hai nhóm Login và Todo):

```bash
npx playwright test --grep @smoke
npx playwright test --grep @smoke --grep-invert @security
npx playwright test --grep "(?=.*@smoke)(?=.*@security)"
```

| Lệnh | Kết quả trên bản thử |
|------|----------------------|
| `--grep @smoke` | `Running 2 tests` (hai test có tag `@smoke`) |
| `--grep @smoke --grep-invert @security` | `Running 1 test` (chỉ test đăng nhập) |
| `--grep "(?=.*@smoke)(?=.*@security)"` | `Running 1 test` (phải có **cả hai** tag: AND) |

Tag của nhóm (`@auth`) áp dụng cho mọi test con và xuất hiện trong tên đầy đủ: `LAB-01 Login › đăng nhập hợp lệ @auth @smoke`. Bạn cũng có thể đặt tag mặc định cho cả project bằng `grep` trong config (xem tài liệu `testProject.grep`).

Với `annotation`, mỗi mục có `type` và `description`; báo cáo HTML liệt kê chúng cho từng test (theo tài liệu Playwright, các `type` bắt đầu bằng dấu gạch dưới bị ẩn). Dùng để ghi mã yêu cầu, mã bug, ghi chú cho người sau.

### Bước 10. `test.info()` và annotation chèn lúc chạy

Mục đích: ghi thông tin chỉ biết được khi test đang chạy.

```ts
test("ghi thông tin lúc chạy", async ({ page, browserName }) => {
  test.info().annotations.push({ type: "trình duyệt", description: browserName });
  await open(page);
  await expect(page.getByTestId("todo-empty")).toBeVisible();
});
```

| Phần | Ý nghĩa |
|------|---------|
| `test.info()` | Trả về thông tin test hiện tại (cũng nhận được qua tham số `testInfo` của hàm test) |
| `.annotations.push({ type, description })` | Thêm một annotation vào test này; có hiệu lực trong báo cáo |
| Các thuộc tính hữu ích khác | `testInfo.retry` (số lần đã chạy lại), `testInfo.project.name`, `testInfo.titlePath`, `testInfo.timeout` |

Kết quả mong đợi: test xanh. Với reporter `json`, mục annotation xuất hiện đúng như bạn thêm. Tránh nhét dữ liệu nhạy cảm vào annotation vì nó nằm trong báo cáo.

### Bước 11. `retries`: cấu hình toàn cục và theo nhóm

Mục đích: cho phép chạy lại test đỏ có kiểm soát (khái niệm flaky: xem bài 5.6).

```ts
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
});
```

Và cho riêng một nhóm:

```ts
test.describe("nhóm hay chập chờn", () => {
  test.describe.configure({ retries: 2 });

  test("flaky có chủ đích", { tag: "@flaky" }, async ({ page }, testInfo) => {
    await open(page);
    expect(testInfo.retry, "đỏ ở lần chạy đầu").toBeGreaterThanOrEqual(1);
  });
});
```

Giải thích: test cố tình đỏ khi `testInfo.retry` là 0 (lần chạy đầu) và xanh ở lần chạy lại (`retry` là 1). Cờ dòng lệnh `--retries=2` ghi đè cấu hình.

Kết quả mong đợi (đã chạy thật):

```text
  x  10 [chromium] › ... › nhóm hay chập chờn › flaky có chủ đích @flaky (1.8s)
  ok 11 [chromium] › ... › nhóm hay chập chờn › flaky có chủ đích @flaky (retry #1) (669ms)

  1 flaky
    [chromium] › ... › nhóm hay chập chờn › flaky có chủ đích @flaky
  7 passed
```

Cách đọc: dòng `x` là lần chạy đầu thất bại; dòng `ok ... (retry #1)` là lần chạy lại xanh. Phần tổng kết **không** tính nó là `failed` mà liệt kê riêng ở mục `flaky`. Trong báo cáo HTML nó cũng được nhóm riêng là Flaky. Hậu quả quan trọng: tiến trình lệnh thoát mã 0 nếu chỉ có test flaky, nên CI xanh dù có test chập chờn. Nếu nhóm muốn buộc sửa, đặt `failOnFlakyTests: true` trong config (hoặc `--fail-on-flaky-tests`).

### Bước 12. `--last-failed` và `--repeat-each`

Mục đích: lặp lại việc điều tra nhanh.

Giả sử một lần chạy có test đỏ. Chạy lại **chỉ những test đã đỏ**:

```bash
npx playwright test --last-failed
```

Kết quả mong đợi: Playwright đọc tệp `test-results/.last-run.json` của lần chạy trước và chỉ chạy các test ghi trong đó. Ví dụ (đã chạy thật trên bản thử): chạy lại chỉ test `S2 đỏ` và test cùng nhóm `serial` sau nó hiện `1 failed` và `1 did not run`. Lưu ý: tệp này **bị ghi đè sau mỗi lần chạy**, nên chạy `--last-failed` ngay sau lần đỏ, và nếu lần chạy lại xanh thì danh sách đỏ trống, lần `--last-failed` tiếp theo sẽ báo `Error: No tests found.`.

Kiểm tra độ ổn định bằng cách lặp:

```bash
npx playwright test --grep @smoke --repeat-each=3
```

| Phần | Ý nghĩa |
|------|---------|
| `--repeat-each=3` | Chạy **mỗi test** 3 lần như ba test độc lập (đã chạy thật: `Running 3 tests using 3 workers`) |
| Kết hợp `--workers=1` | Loại trừ ảnh hưởng của chạy song song |

Khác với `retries` (chỉ chạy lại khi đỏ), `--repeat-each` chạy lại cả khi xanh: nó dùng để đo độ ổn định, còn retry để chịu lỗi tạm thời.

## Demo code

File hoàn chỉnh gom các kỹ thuật chính, chạy được trên site lab (đã chạy thật: `1 skipped`, `8 passed`, trong đó có một test `fail` dự kiến đỏ):

```ts
import { test, expect, type Page } from "@playwright/test";

async function addTask(page: Page, title: string) {
  await page.getByLabel("Công việc mới").fill(title);
  await page.getByRole("button", { name: "Thêm", exact: true }).click();
}

test.describe("LAB-01 Login", { tag: "@auth" }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/login");
    await page.getByTestId("reset-data").click();
  });

  test("đăng nhập hợp lệ", { tag: "@smoke" }, async ({ page }) => {
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByLabel("Mật khẩu").fill("Passw0rd!");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.getByTestId("dashboard")).toBeVisible();
  });

  test.fixme("đăng nhập bằng mã OTP qua email", async ({ page }) => {
    await page.goto("/lab/login");
  });
});

test.describe("LAB-04 Todo", { tag: "@todo" }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/todo");
    await page.getByTestId("reset-data").click();
  });

  test.describe("thêm việc", () => {
    test("tên rỗng bị từ chối", async ({ page }) => {
      await page.getByRole("button", { name: "Thêm", exact: true }).click();
      await expect(page.getByTestId("todo-error")).toContainText("Vui lòng nhập");
    });

    test("trùng tên bị chặn", async ({ page }) => {
      test.fail(true, "BUG-01 đang bật");
      await page.goto("/lab/todo?bugs=BUG-01");
      await addTask(page, "Mua sữa");
      await addTask(page, "mua SỮA");
      await expect(page.getByTestId("todo-error")).toHaveText("Công việc này đã tồn tại", { timeout: 1000 });
    });
  });

  test.describe("xem danh sách", () => {
    test.beforeEach(async ({ page }) => {
      await addTask(page, "A");
      await addTask(page, "B");
    });

    test("bộ lọc Đang làm", async ({ page, isMobile }) => {
      test.skip(isMobile, "Chưa kiểm tra bố cục mobile");
      await page.getByRole("checkbox", { name: "Hoàn thành: A" }).check();
      await page.getByRole("button", { name: "Đang làm" }).click();
      await expect(page.getByTestId("todo-title")).toHaveText("B");
    });

    test("thêm 20 việc rồi đếm", async ({ page }) => {
      test.slow();
      for (let i = 3; i <= 20; i++) await addTask(page, "Việc " + i);
      await expect(page.getByTestId("todo-item")).toHaveCount(20);
    });
  });
});
```

Đọc nhanh: hai nhóm cấp trên có tag riêng; nhóm `xem danh sách` lồng trong `LAB-04 Todo` nên chạy hook của cả hai tầng (reset rồi thêm hai việc `A` và `B`); `fixme` ghi nhớ việc chưa làm, `fail` ghi nhận bug, `skip` theo `isMobile` và `slow` cho test dài. Chạy `npx playwright test --grep @todo` để chỉ chạy nhóm Todo.

## Thử ngay trong lab
- `/lab/todo` (LAB-04): thêm `?bugs=BUG-01` rồi viết test "trùng tên bị chặn" **không** có `test.fail`: nó đỏ. Thêm `test.fail(...)` và thấy nó trở thành kết quả dự kiến. Sau đó bỏ `?bugs=` ra: test `fail` bất ngờ xanh và Playwright báo lỗi, đúng ý nghĩa "nhắc gỡ annotation khi bug đã sửa".
- `/lab/login` (LAB-01): gắn `@smoke` cho hai test và thử các tổ hợp `--grep` và `--grep-invert`; chạy `--repeat-each=5 --workers=4` cho bộ `@smoke` để xem có test nào đỏ ngẫu nhiên.
- Thử `?bugs=BUG-02` ở `/lab/login` (khoá sau 6 lần thay vì 5) để một test smoke đỏ, rồi dùng `--last-failed` để chạy lại đúng test đó trong lúc bạn sửa.

## Lỗi thường gặp
- Triệu chứng: CI xanh nhưng chỉ chạy một test. Nguyên nhân: còn `test.only` trong code. Cách sửa: đặt `forbidOnly: !!process.env.CI`, xoá `only`.
- Triệu chứng: một test đỏ, các test sau ghi `did not run`. Nguyên nhân: nhóm đang là `mode: "serial"`. Cách sửa: sửa test đỏ trước; lâu dài, bỏ `serial` và để mỗi test tự dựng dữ liệu bằng `beforeEach`.
- Triệu chứng: `Error: No tests found.` khi chạy `--last-failed`. Nguyên nhân: lần chạy trước đã xanh (hoặc bị ghi đè bởi lần chạy khác) nên không còn test đỏ nào trong `.last-run.json`. Cách sửa: chạy `--last-failed` ngay sau lần đỏ, trước khi chạy gì khác.
- Triệu chứng: kết quả báo `flaky` nhưng nhóm coi như "xanh" và bỏ qua. Nguyên nhân: retry làm test xanh ở lần hai. Cách sửa: theo dõi mục `flaky`, đặt `failOnFlakyTests` ở CI, điều tra theo bài 5.6.
- Triệu chứng: test dự kiến đỏ (`test.fail`) bỗng làm CI đỏ. Nguyên nhân: bug đã được sửa nên test xanh, trái với kỳ vọng. Cách sửa: gỡ `test.fail` và giữ lại test như test thường.
- Triệu chứng: `test.skip` ở ngoài test báo lỗi hoặc không có hiệu lực mong muốn. Nguyên nhân: gọi sai ngữ cảnh (ngoài test, ngoài `describe`) hoặc truyền biểu thức dùng fixture ở cấp nhóm. Cách sửa: trong test dùng `test.skip(cond, lý do)`; ở cấp nhóm truyền hàm `({ isMobile }) => isMobile`.
- Triệu chứng: `--grep @smoke` chạy nhiều hơn mong đợi. Nguyên nhân: `--grep` là biểu thức chính quy khớp cả tag của nhóm cha và tên test. Cách sửa: đặt tag cẩn thận và kiểm tra bằng `--list`.

## Tóm tắt
- `skip` là "không áp dụng", `fixme` là "cần sửa", `fail` là "dự kiến đỏ, nhắc khi xanh", `slow` là "cấp thêm thời gian"; luôn kèm lý do.
- `forbidOnly` biến `test.only` bị commit nhầm thành lỗi rõ ràng.
- Hook của nhóm ngoài chạy trước nhóm trong; dùng `mode: "serial"` chỉ khi các bước thật sự phụ thuộc, vì một test đỏ làm các test sau "did not run" và retry chạy lại cả nhóm.
- `fullyParallel` và `workers` kiểm soát mức song song; test chỉ xanh khi `--workers=1` thường là test dùng dữ liệu chung.
- Tag cộng với `--grep` và `--grep-invert` để chọn bộ chạy; `annotation` và `test.info()` ghi chú vào kết quả.
- `retries` làm test flaky hiện riêng thay vì đỏ; `--last-failed` và `--repeat-each` giúp điều tra nhanh.

## Bài tập
1. **Dễ**: Thêm `test.skip(isMobile, "...")` vào một test của LAB-04, thêm project `mobile` rồi chạy cả hai project. Xong khi chỉ có project mobile hiện skipped kèm lý do.
2. **Dễ**: Gắn tag `@smoke` cho hai test của LAB-01 và `@regression` cho một test khác; chạy lần lượt từng tag và chạy loại trừ. Xong khi mỗi lệnh in đúng số test mong đợi ở dòng `Running N tests`.
3. **Vừa**: Viết test "trùng tên bị chặn" với `?bugs=BUG-01` và `test.fail`, kiểm tra nó được tính là đạt; rồi bỏ `?bugs=` và quan sát lỗi. Xong khi bạn giải thích được vì sao CI đỏ ở lần hai.
4. **Vừa**: Dựng nhóm `serial` ba test trên LAB-04 với test thứ hai cố ý đỏ. Xong khi bạn chỉ ra được test thứ ba ghi `did not run`, rồi viết lại ba test độc lập bằng `beforeEach` để cả ba đều chạy.
5. **Khó**: Cấu hình `retries: 2` cho một nhóm, viết test flaky dựa trên `testInfo.retry`, chạy với reporter `json` hoặc `html`, và viết 3 câu mô tả test hiện ở mục nào, vì sao tiến trình vẫn thoát mã 0, và cấu hình nào làm CI đỏ. Xong khi bạn bật `failOnFlakyTests` và thấy lệnh thoát mã khác 0.
