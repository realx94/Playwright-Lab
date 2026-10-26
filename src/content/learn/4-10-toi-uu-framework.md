---
title: Tối ưu framework – song song, retry, tag và cấu trúc
level: 4
order: 10
minutes: 50
summary: Chạy song song, sharding, retry hợp lý, gắn tag và tổ chức thư mục để framework bền vững.
keywords: [playwright sharding, playwright parallel workers, test tags]
---

## Mục tiêu bài học
- Hiểu `workers`, `fullyParallel`, và vì sao test **độc lập** là điều kiện để chạy song song an toàn.
- Cấu hình `retries` đúng chỗ, đọc được khái niệm **flaky** trong báo cáo và không dùng retry để che lỗi.
- Gắn **tag** (`@smoke`, `@regression`, `@slow`) bằng tuỳ chọn `tag` và chạy theo nhóm với `--grep`/`--grep-invert`, hoặc khai báo thành project.
- Chia bộ test ra nhiều máy bằng **sharding** (`--shard=1/3`) và gộp báo cáo bằng `merge-reports`.
- Tổ chức thư mục `pages/`, `fixtures/`, `utils/`, `tests/<tính năng>/` và quy ước đặt tên để nhiều người cùng làm.

## Bạn cần chuẩn bị
- Đã học bài 4.1 đến 4.9; có starter repo với `pages/`, `fixtures/`, `utils/` và vài test chạy xanh.
- Biết `playwright.config.ts` ở mức đọc hiểu (bài 4.4) và cơ bản về GitHub Actions (bài CI/CD ở Level 5 sẽ đào sâu).
- Biết dùng terminal và truyền cờ cho `npx playwright test`.

## Kiến thức cần nắm
- **Workers**: số tiến trình chạy song song (`workers`). **`fullyParallel`**: cho phép chạy song song cả các test trong cùng một file.
- **Sharding**: chia bộ test thành nhiều phần để chạy trên nhiều máy (`--shard=1/4`).
- **Retry**: thử lại test hỏng (`retries`); chỉ là biện pháp tạm, không thay cho sửa test chập chờn (flaky).
- **Tag**: gắn `@smoke`, `@regression` cho test để chạy theo nhóm (`--grep`, `--grep-invert`).
- **Cấu trúc thư mục**: `pages/`, `fixtures/`, `utils/`, `tests/<tính năng>/`.
- Test chậm: `timeout`, `test.slow()`, và đo thời gian trong báo cáo.

## Giải thích dễ hiểu
Bộ test lớn giống **một siêu thị cần tính tiền**: một quầy thì hàng dài. Thêm quầy (workers) giúp nhanh hơn, nhưng nếu mọi khách dùng chung một xe đẩy (dữ liệu dùng chung) thì lại tranh nhau. Chia nhiều siêu thị chi nhánh (sharding) khi một cửa hàng không đủ chỗ.

Hãy làm một phép tính. Bộ test có 300 test, mỗi test trung bình 6 giây. Chạy tuần tự mất 300 × 6 = 1.800 giây, tức 30 phút. Với 4 worker lý tưởng còn khoảng 7,5 phút. Chia thêm 3 máy (sharding) mỗi máy 4 worker còn khoảng 2,5 phút. Nhưng chỉ khi các test **không phụ thuộc nhau**; nếu chúng tranh nhau một tài khoản, càng nhiều worker càng nhiều lỗi ngẫu nhiên, và khi đó bạn mất nhiều thời gian hơn để điều tra so với thời gian tiết kiệm được.

Về retry, hãy nghĩ **đèn báo ở xe hơi**: retry giống việc bạn che đèn báo lỗi bằng băng dính. Xe vẫn chạy nhưng lỗi vẫn còn. Một test chập chờn (lúc xanh lúc đỏ) báo hiệu có vấn đề thật: điều kiện chờ sai, dữ liệu dùng chung, phụ thuộc thứ tự, hoặc chính ứng dụng có lỗi thời điểm. Retry cho phép CI không đỏ vì sự cố mạng ngẫu nhiên, nhưng bạn phải **theo dõi** các test phải retry mới xanh (Playwright gọi là **flaky**) và sửa dần.

Tag là **nhãn dán trên hộp hồ sơ**: bạn dán `@smoke` cho các test quan trọng nhất (chạy mỗi lần commit, 2 phút), còn `@regression` cho bộ đầy đủ (chạy đêm, 40 phút). Nhờ nhãn, cùng một kho test phục vụ nhiều tình huống.

## Thực hành từng bước
Mọi lệnh chạy trong thư mục gốc của starter repo.

### Bước 1. Xem số worker và danh sách test hiện có
Mục đích: biết điểm xuất phát trước khi tối ưu.

```bash
npx playwright test --list
```

| Phần lệnh | Ý nghĩa |
|-----------|---------|
| `--list` | Chỉ liệt kê các test mà Playwright tìm thấy (kèm tên project), **không chạy**. |

Kết quả mong đợi: danh sách dạng `[chromium] › tests\00-smoke.spec.ts:4:5 › kết nối được tới Playwright Lab` và dòng cuối `Total: N tests in M files`. Chạy thật và xem dòng đầu:

```bash
npx playwright test tests/examples
```

Dòng đầu có dạng `Running 4 tests using 4 workers`: đây là số worker Playwright **tự chọn** (khoảng một nửa số lõi CPU) khi bạn không đặt `workers`.

### Bước 2. Cấu hình song song: `fullyParallel` và `workers`
Mục đích: kiểm soát mức độ song song.

```ts
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `fullyParallel: true` | Mặc định Playwright chạy **các file** song song nhưng test **trong cùng một file** chạy lần lượt. Bật tuỳ chọn này để cả test trong một file cũng chạy song song. |
| `workers: process.env.CI ? 4 : undefined` | Trên CI cố định 4 worker; ở máy bạn để `undefined` cho Playwright tự quyết. Có thể đặt phần trăm: `workers: "50%"`. |

Thử nhanh từ dòng lệnh (cờ **ghi đè** config):

```bash
npx playwright test tests/examples --workers=1
npx playwright test tests/examples --workers=4
```

Kết quả mong đợi: với `--workers=1`, tổng thời gian dài hơn; dòng đầu hiện `using 1 worker`. So sánh hai con số thời gian ở dòng cuối để thấy tác dụng. Với bộ test nhỏ chênh lệch nhỏ, nhưng với hàng trăm test thì khác biệt rõ.

Khi một nhóm test **bắt buộc** chạy theo thứ tự (ví dụ chuỗi bước phụ thuộc nhau), khai báo cục bộ:

```ts
test.describe("luồng đặt đơn nhiều bước", () => {
  test.describe.configure({ mode: "serial" });

  test("bước 1", async ({ page }) => { /* ... */ });
  test("bước 2", async ({ page }) => { /* ... */ });
});
```

`mode: "serial"` chạy các test theo thứ tự trong cùng worker và **dừng khi một test đỏ** (các test sau bị bỏ qua). Đây là ngoại lệ: ưu tiên làm test độc lập, vì serial làm mất lợi ích song song và khiến một lỗi kéo theo cả nhóm.

### Bước 3. Làm test độc lập trước khi tăng workers
Mục đích: không để song song làm test chập chờn.

Các thói quen cần có (đều đã học ở các bài trước):
1. **Mỗi test mở trang riêng và tạo dữ liệu riêng**: dùng fixture (bài 4.3) và factory dữ liệu duy nhất (bài 4.5).
2. **Không phụ thuộc thứ tự**: test A không được để lại thứ test B cần.
3. **Dọn dữ liệu sau test** (hoặc dùng dữ liệu độc lập để khỏi cần dọn).
4. **Chuẩn bị bằng API thay vì thao tác giao diện** (bài 4.8) để nhanh và ổn định.
5. **Đăng nhập một lần bằng `storageState`** (bài 4.6) thay vì đăng nhập ở từng test.

Cách kiểm tra độc lập một cách thực tế: chạy cả bộ **nhiều lần** và **song song cao**:

```bash
npx playwright test --repeat-each=5 --workers=4
```

| Cờ | Ý nghĩa |
|----|---------|
| `--repeat-each=5` | Chạy **mỗi test 5 lần**. Test chập chờn sẽ lộ ra ở một trong 5 lần. |
| `--workers=4` | Ép 4 tiến trình để tăng khả năng đụng độ nếu dữ liệu dùng chung. |

Kết quả mong đợi: mọi lần đều xanh. Nếu có lần đỏ, đó là test không độc lập hoặc không chờ đúng; sửa nguyên nhân trước khi tăng số worker.

### Bước 4. Cấu hình retry và đọc kết quả "flaky"
Mục đích: dùng retry như lưới an toàn và biết theo dõi.

```ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  forbidOnly: !!process.env.CI,
  use: { trace: "on-first-retry" },
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `retries: process.env.CI ? 2 : 0` | Trên CI test đỏ được thử lại tối đa 2 lần; ở máy bạn không retry để thấy lỗi ngay. |
| `forbidOnly` | Trên CI, lỡ commit `test.only` thì cả lần chạy báo lỗi. |
| `trace: "on-first-retry"` | Chỉ ghi vết (trace) chi tiết ở **lần retry đầu tiên**, vừa đủ để điều tra mà không làm chậm mọi test. |

Cách Playwright phân loại kết quả khi có retry:

| Phân loại | Ý nghĩa |
|-----------|---------|
| passed | Xanh ngay lần đầu. |
| flaky | Đỏ rồi **xanh sau khi retry**. CI vẫn xanh nhưng đây là nợ cần sửa. |
| failed | Đỏ ở mọi lần thử. |

Ví dụ phần tổng kết có `1 flaky` kèm tên test. Để không bỏ qua chúng, có thể bắt buộc CI đỏ khi có test flaky:

```bash
npx playwright test --fail-on-flaky-tests
```

Quy trình xử lý test flaky: (1) mở trace của lần retry (`npx playwright show-trace <đường dẫn trace.zip>`), (2) tìm nguyên nhân (điều kiện chờ, dữ liệu dùng chung, phụ thuộc thời gian), (3) sửa gốc; trong lúc chờ sửa có thể tạm đánh dấu `test.fixme(...)` hoặc `test.skip(...)` kèm lý do, **không** tăng `retries` lên cao.

Lệnh hữu ích khi gỡ lỗi nhanh:

```bash
npx playwright test --last-failed
```

`--last-failed` chỉ chạy lại **các test đỏ của lần chạy trước** (dựa vào file kết quả cuối trong `test-results`).

### Bước 5. Gắn tag và chạy theo nhóm
Mục đích: có bộ "smoke" nhanh cho mỗi lần commit và bộ "regression" đầy đủ.

Gắn tag bằng tuỳ chọn thứ hai của `test` (cách chính thức, rõ nghĩa hơn nhét vào tên):

```ts
import { test, expect } from "../fixtures";

test("đăng nhập hợp lệ", { tag: "@smoke" }, async ({ loginPage }) => {
  await loginPage.login("user@lab.dev", "Passw0rd!");
  await loginPage.expectLoggedIn();
});

test("tạo đơn dài nhiều bước", { tag: ["@slow", "@regression"] }, async ({ cartPage }) => {
  await cartPage.add("p2", 2);
  expect(await cartPage.amount("subtotal")).toBe(500_000);
});

test.describe("API sách", { tag: "@api" }, () => {
  test("đọc danh sách", async ({ request }) => {
    expect((await request.get("/api/lab/books")).status()).toBe(200);
  });
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `{ tag: "@smoke" }` | Đặt tag cho một test. Tag **bắt đầu bằng `@`**. |
| `{ tag: ["@slow", "@regression"] }` | Nhiều tag dùng mảng. |
| `test.describe(..., { tag: "@api" }, ...)` | Gắn tag cho **cả nhóm**: mọi test bên trong có tag đó. |

Cách cũ vẫn dùng được: viết tag ngay trong tên test (`"đăng nhập hợp lệ @smoke"`) vì `--grep` tìm theo tên. Cách `tag` gọn hơn vì hiển thị tách riêng trong báo cáo.

Chạy theo tag:

```bash
npx playwright test --grep @smoke
npx playwright test --grep-invert @slow
npx playwright test --grep "@smoke|@api"
```

| Lệnh | Ý nghĩa |
|------|---------|
| `--grep @smoke` (hoặc `-g`) | Chỉ chạy test có tag `@smoke`. Tham số là **biểu thức chính quy**. |
| `--grep-invert @slow` (hoặc `-G`) | **Bỏ** test có tag `@slow`. |

Lệnh thứ ba (`--grep "@smoke|@api"`) chạy test có **một trong hai** tag: trong biểu thức chính quy, ký tự gạch đứng `|` nghĩa là "hoặc". Hãy đặt cả biểu thức trong dấu nháy kép để terminal không hiểu `|` là ống dẫn (pipe).

Kiểm tra trước khi chạy thật bằng `--list`:

```bash
npx playwright test --list --grep @smoke
```

Kết quả mong đợi: chỉ liệt kê các test có tag `@smoke`; nếu rỗng nghĩa là bạn quên gắn tag hoặc gõ sai.

Nếu thường xuyên chạy một nhóm, biến nó thành **project** (bài 4.4):

```ts
projects: [
  { name: "smoke", grep: /@smoke/, use: { ...devices["Desktop Chrome"] } },
  { name: "regression", grepInvert: /@smoke/, use: { ...devices["Desktop Chrome"] } },
],
```

Chạy `npx playwright test --project=smoke` sẽ chỉ chạy bộ smoke. Quy ước tag đề xuất: `@smoke` (luồng sống còn, chạy mỗi commit), `@regression` (đầy đủ), `@slow` (chậm, chạy đêm), `@api` (không cần trình duyệt), `@visual` (so sánh ảnh).

### Bước 6. Sharding: chia bộ test cho nhiều máy
Mục đích: rút ngắn thời gian bằng cách chạy các phần trên nhiều máy cùng lúc.

```bash
npx playwright test --shard=1/3
npx playwright test --shard=2/3
npx playwright test --shard=3/3
```

| Phần lệnh | Ý nghĩa |
|-----------|---------|
| `--shard=1/3` | Chia toàn bộ test thành **3 phần** và chỉ chạy phần **thứ 1**. Mỗi máy CI chạy một phần. |

Hãy kiểm tra các phần chia **đủ và không trùng** bằng `--list`:

```bash
npx playwright test --list --shard=1/2
npx playwright test --list --shard=2/2
```

Kết quả mong đợi: dòng `Total:` của hai phần cộng lại bằng số test của toàn bộ bộ test (`npx playwright test --list`). Với `fullyParallel: true`, các test trong cùng một file có thể rơi vào các phần khác nhau; không có `fullyParallel`, một file nằm trọn trong một phần.

Mỗi shard sinh báo cáo riêng, nên để có **một báo cáo chung** dùng reporter `blob` rồi gộp:

```ts
reporter: process.env.CI ? "blob" : "html",
```

```bash
npx playwright merge-reports --reporter html ./all-blob-reports
```

Trên GitHub Actions, cấu hình mẫu (rút gọn) gồm một job chạy shard theo ma trận và một job gộp báo cáo:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [1, 2, 3]
        shardTotal: [3]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: blob-report-${{ matrix.shardIndex }}
          path: blob-report
          retention-days: 1

  merge-reports:
    if: ${{ !cancelled() }}
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - uses: actions/download-artifact@v4
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true
      - run: npx playwright merge-reports --reporter html ./all-blob-reports
      - uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report
          retention-days: 14
```

Giải thích: `matrix` tạo 3 job song song, mỗi job nhận `shardIndex` khác nhau; mỗi job upload thư mục `blob-report` đặt tên riêng; job `merge-reports` chờ (`needs: test`), tải tất cả về và gộp thành một báo cáo HTML. `fail-fast: false` để một shard đỏ không huỷ các shard còn lại. Phần chi tiết CI/CD xem bài 5.1.

### Bước 7. Xử lý test chậm
Mục đích: giữ bộ test nhanh dần theo thời gian.

1. **Tìm test chậm**: nhìn thời gian từng test trong báo cáo HTML hoặc reporter `list`; test vượt xa mức trung bình là ứng viên.
2. **Nguyên nhân phổ biến**: đăng nhập bằng giao diện ở mỗi test (dùng `storageState`), dựng dữ liệu bằng giao diện (dùng API), `waitForTimeout`/sleep cố định (dùng điều kiện chờ), quá nhiều bước trong một test.
3. **Nếu chậm vì bản chất** (luồng dài): đánh dấu `test.slow()` để nhân ba timeout cho test đó, kèm tag `@slow` để có thể loại khỏi bộ chạy nhanh.

```ts
test("luồng thanh toán dài", { tag: "@slow" }, async ({ page }) => {
  test.slow(); // timeout x3 chỉ cho test này
  // ...
});
```

Đặt trần timeout toàn cục hợp lý trong config (`timeout: 30_000`, `expect: { timeout: 5_000 }`) và dùng `maxFailures` khi chỉ cần dừng sớm:

```ts
export default defineConfig({
  timeout: 30_000,
  expect: { timeout: 5_000 },
  maxFailures: process.env.CI ? 10 : 0,
});
```

`maxFailures: 10` dừng cả lần chạy sau 10 test đỏ để CI không tốn thời gian khi hệ thống hỏng hàng loạt; `0` nghĩa là không giới hạn.

### Bước 8. Tổ chức thư mục
Mục đích: để người mới vào vẫn tìm được mọi thứ.

Cấu trúc gợi ý cho dự án đang lớn dần:

```text
starter-repo/
  pages/            Page Object và component
    components/
  fixtures/         custom fixture (index.ts gộp các fixture)
  api/              API object (BooksApi...)
  utils/            hàm tiện ích, data builder, env
  tests/
    00-smoke.spec.ts
    auth/           test theo tính năng
      auth.setup.ts
      login.spec.ts
    cart/
      cart.spec.ts
    api/
      books.spec.ts
    visual/
      store.spec.ts
    data/           dữ liệu tĩnh (JSON, CSV)
  playwright.config.ts
  .env.example
```

Quy ước nên thống nhất trong nhóm:

| Nội dung | Quy ước |
|----------|---------|
| Tên file test | `<tính năng>.spec.ts`, chữ thường, gạch ngang. |
| Tên test | Mô tả **hành vi mong đợi** bằng tiếng Việt ("giảm giá bị chặn trần 100.000đ"), không viết "test 1". |
| Tag | Chỉ dùng danh sách tag đã thống nhất. |
| Page Object/Component | Một class một file, tên trùng tên file. |
| Dữ liệu | Trong `tests/data/` hoặc factory ở `utils/`. |
| Bí mật | Không nằm trong repo; dùng biến môi trường. |

## Demo code
Một `playwright.config.ts` đã tối ưu (giữ khung config của starter, thêm các phần của bài):

```ts
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 4 : undefined,
  maxFailures: isCI ? 10 : 0,
  reporter: isCI ? [["blob"], ["github"]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "smoke", grep: /@smoke/, use: { ...devices["Desktop Chrome"] } },
    { name: "regression", grepInvert: /@smoke/, use: { ...devices["Desktop Chrome"] } },
  ],
});
```

Và các lệnh thường dùng hàng ngày:

```bash
npx playwright test --project=smoke               # bộ nhanh trước khi commit
npx playwright test --grep-invert @slow           # bỏ test chậm khi đang code
npx playwright test --last-failed                 # chạy lại test vừa đỏ
npx playwright test --repeat-each=5 --workers=4   # soi test chập chờn
npx playwright test --shard=1/3                   # phần 1 trong 3 (trên CI)
```

Giải thích: config chọn reporter `blob` + `github` trên CI (để gộp báo cáo shard và chú thích lỗi trên Pull Request), `list` + `html` ở máy bạn; hai project `smoke` và `regression` chia bộ test theo tag. Lưu ý chạy tất cả (`npx playwright test` không kèm `--project`) sẽ chạy **cả hai** project nên test không có tag `@smoke` chỉ chạy ở `regression`, còn test có tag `@smoke` chỉ chạy ở `smoke`.

## Nguyên tắc tối ưu
1. Trước hết **làm test độc lập** rồi mới tăng workers.
2. Dùng API để chuẩn bị dữ liệu thay vì thao tác giao diện; đăng nhập một lần bằng `storageState`.
3. Giữ ít test UI end-to-end, nhiều test ở tầng thấp (API, logic); UI chỉ cho luồng sống còn.
4. Theo dõi test chậm và test flaky trong báo cáo, sửa theo định kỳ.
5. Retry là lưới an toàn trên CI, không phải cách để "giữ xanh".
6. Tag, thư mục và tên test theo quy ước chung của cả nhóm.

## Thử ngay trong lab
Gắn tag `@smoke` cho các test của `/lab/login` và `/lab/cart`, tag `@api` cho các test `/api/lab/books`. Chạy `--grep @smoke`, rồi `--grep-invert @api`, rồi `--list --shard=1/2` và `--list --shard=2/2` để đối chiếu tổng. Cuối cùng chạy `--repeat-each=5 --workers=4` trên các test API của LAB-14: nhờ mỗi test có client `request` riêng nên chúng độc lập và phải xanh cả 5 lần.

## Lỗi thường gặp
- **Triệu chứng:** tăng `workers` thì test đỏ ngẫu nhiên nhiều hơn. **Nguyên nhân:** test dùng chung dữ liệu (một tài khoản, một ISBN cố định). **Cách sửa:** dữ liệu độc lập cho mỗi test (bài 4.5), kiểm tra bằng `--repeat-each` và `--workers`.
- **Triệu chứng:** CI luôn xanh nhưng báo cáo có nhiều mục `flaky`. **Nguyên nhân:** dựa vào `retries` để "giữ xanh" mà không tìm nguyên nhân. **Cách sửa:** theo dõi flaky mỗi tuần, dùng trace, sửa gốc; cân nhắc `--fail-on-flaky-tests`.
- **Triệu chứng:** `--grep @smoke` không chạy test nào (`Error: No tests found`). **Nguyên nhân:** chưa gắn tag, gõ sai tag, hoặc thiếu dấu `@`. **Cách sửa:** `--list --grep @smoke` để kiểm tra; gắn tag đúng cú pháp.
- **Triệu chứng:** các shard cộng lại không bằng tổng số test. **Nguyên nhân:** mỗi máy dùng nhánh/phiên bản mã khác nhau, hoặc dùng `--grep` khác nhau cho từng shard. **Cách sửa:** mọi shard chạy cùng commit và cùng tham số, chỉ khác `--shard`.
- **Triệu chứng:** `merge-reports` báo thiếu báo cáo hoặc rỗng. **Nguyên nhân:** quên đặt reporter `blob` trên CI, hoặc tên artifact trùng nhau nên ghi đè. **Cách sửa:** reporter `blob` và `name: blob-report-${{ matrix.shardIndex }}`.
- **Triệu chứng:** mọi test nằm chung một thư mục `tests/`, không ai tìm được test của tính năng mình. **Cách sửa:** chia `tests/<tính năng>/` và thống nhất quy ước đặt tên.
- **Triệu chứng:** dùng `mode: "serial"` khắp nơi, một test đỏ làm cả nhóm bị bỏ qua. **Cách sửa:** làm test độc lập, chỉ dùng serial cho luồng thật sự phụ thuộc nhau.

## Tóm tắt
- Tăng tốc theo thứ tự: làm test độc lập, bật `fullyParallel`, chỉnh `workers`, rồi mới chia shard nhiều máy.
- Kiểm tra độc lập bằng `--repeat-each` kết hợp `--workers`; ưu tiên chuẩn bị bằng API và `storageState`.
- Retry chỉ là lưới an toàn: theo dõi test `flaky`, điều tra bằng trace và sửa gốc.
- Tag (`{ tag: "@smoke" }`) và `--grep`/`--grep-invert` (hoặc project có `grep`) chạy theo nhóm; kiểm tra bằng `--list`.
- Sharding dùng `--shard=i/n` kèm reporter `blob` và `merge-reports`; thư mục `pages/`, `fixtures/`, `utils/`, `tests/<tính năng>/` giúp cả nhóm cùng làm.

## Bài tập
1. Gắn tag `@smoke` cho 3 test quan trọng và chạy riêng chúng bằng `--grep @smoke`. Xong khi `--list --grep @smoke` liệt kê đúng 3 test.
2. Chạy `--list --shard=1/2` và `--list --shard=2/2` rồi cộng số test của hai phần so với `--list` toàn bộ. Xong khi tổng hai phần bằng tổng toàn bộ và bạn giải thích được vì sao.
3. Chạy `npx playwright test --repeat-each=5 --workers=4` trên các test API của bạn. Xong khi cả 5 lần đều xanh; nếu có test đỏ, ghi lại nguyên nhân và cách sửa.
4. Thêm hai project `smoke` và `regression` vào config và chạy `--project=smoke`. Xong khi bộ smoke chạy dưới 1 phút và bạn viết được quy ước tag của nhóm (ít nhất 3 tag, kèm ý nghĩa).
5. Thử thách: viết workflow GitHub Actions chạy 3 shard bằng ma trận và gộp báo cáo bằng `merge-reports` (tham khảo mẫu trong bài và bài 5.1). Xong khi workflow chạy trên một Pull Request thử và tải về được một báo cáo HTML duy nhất.
