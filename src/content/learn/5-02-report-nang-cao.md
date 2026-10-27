---
title: Báo cáo nâng cao và thông báo kết quả
level: 5
order: 2
minutes: 45
summary: Cấu hình nhiều reporter (html, json, junit, github, Allure), viết script tóm tắt kết quả, gửi vào Slack/Teams và đọc số liệu để cải thiện bộ test.
keywords: [allure report playwright, junit report, test metrics]
---

## Mục tiêu bài học
- Chọn đúng reporter cho từng đối tượng đọc: dev, QA lead, quản lý, công cụ CI.
- Cấu hình nhiều reporter cùng lúc trong `playwright.config.ts` và biết mỗi reporter ghi file ở đâu.
- Viết một script Node đọc `results.json` để in tóm tắt (đạt, lỗi, flaky, test chậm nhất) và gửi vào kênh chat bằng webhook.
- Đưa tóm tắt lên trang kết quả của GitHub Actions bằng `GITHUB_STEP_SUMMARY`.
- Đọc số liệu để quyết định hành động, thay vì chỉ nhìn số test xanh.

## Bạn cần chuẩn bị
- Đã học bài 2.14 (báo cáo, screenshot, video) và bài 5.1 (workflow GitHub Actions).
- Project Playwright chạy được (có thể dùng `starter-repo/`).
- Node LTS để chạy script `.mjs`.

## Kiến thức cần nắm
- Reporter có sẵn: `list`, `line`, `dot` (in ra terminal), `html`, `json`, `junit`, `github`, `blob`.
- **Allure**: báo cáo giàu tính năng, có lịch sử và xu hướng; cài thêm gói `allure-playwright`.
- **JUnit XML**: định dạng chung mà hầu hết công cụ CI đọc được.
- Gửi tóm tắt vào Slack/Teams bằng **webhook** (một URL nhận POST).
- Số liệu nên theo dõi: tỉ lệ đạt, test chậm, test flaky (đỏ rồi xanh khi retry).

## Giải thích dễ hiểu
Mỗi người đọc cần một loại báo cáo khác nhau. **Dev** cần trace và ảnh để sửa lỗi. **QA lead** cần xu hướng theo tuần. **Quản lý** cần một dòng "93% đạt, 2 lỗi nghiêm trọng". **Công cụ CI** cần định dạng máy đọc được. Reporter giống **các bộ lọc ống kính**: cùng một cảnh nhưng mỗi ống kính cho ra đúng ảnh mà từng người cần.

Điểm mấu chốt là Playwright cho phép dùng nhiều reporter trong cùng một lần chạy: bạn không phải chọn một. Terminal dùng `list` để người chạy thấy tiến độ, `html` để xem chi tiết, `json` để script đọc, `junit` để tab Tests của CI hiển thị.

Một nguyên tắc nữa: báo cáo chỉ có giá trị khi có người đọc. Gửi quá nhiều thông báo thì cả nhóm sẽ tắt tiếng kênh đó. Vì vậy hãy gửi ít, ngắn, và chỉ khi có điều đáng chú ý (ví dụ chỉ gửi khi có test đỏ, hoặc một bản tóm tắt mỗi sáng).

## Thực hành từng bước

### Bước 1. Xem các reporter có sẵn qua dòng lệnh
Mục đích: thấy nhanh sự khác nhau giữa các reporter trước khi sửa cấu hình.

```bash
npx playwright test --reporter=line
```

| Phần | Ý nghĩa |
|------|---------|
| `--reporter=line` | Ghi đè reporter trong config chỉ cho lần chạy này. `line` in một dòng cập nhật liên tục, ít rối hơn `list` khi có nhiều test. |

Kết quả mong đợi: các dòng tiến độ dạng `[1/12] [chromium] › tests\...` (khi chạy không phải terminal tương tác) rồi dòng tổng kết `12 passed (9.0s)`. Thử thay `line` bằng `dot` (mỗi test là một dấu chấm) và `list` (mỗi test một dòng) để so sánh.

Nếu gặp lỗi `Cannot find module` với tên reporter: reporter bên thứ ba chưa được cài, hãy `npm i -D` gói tương ứng.

### Bước 2. Cấu hình nhiều reporter trong playwright.config.ts
Mục đích: mỗi lần chạy sinh ra đủ các loại báo cáo.

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["json", { outputFile: "results/results.json" }],
    ["junit", { outputFile: "results/junit.xml" }],
  ],
});
```

| Phần | Ý nghĩa |
|------|---------|
| `reporter` là mảng | Mỗi phần tử là một cặp `[tên, tuỳ chọn]`. Reporter nào cũng chạy song song. |
| `["list"]` | In kết quả ra terminal. Không có tuỳ chọn nên chỉ có tên. |
| `open: "never"` | Không tự mở trình duyệt sau khi chạy. Giá trị mặc định `on-failure` sẽ mở báo cáo khi có test đỏ; trên CI không có màn hình nên phải đặt `never`. |
| `outputFolder` | Thư mục chứa báo cáo HTML. |
| `["json", { outputFile }]` | Ghi toàn bộ kết quả vào một file JSON để script đọc. |
| `["junit", { outputFile }]` | Ghi XML theo chuẩn JUnit. |

Lưu ý: thư mục `results/` nên được thêm vào `.gitignore` vì là sản phẩm sinh ra.

Chạy và kiểm tra:

```bash
npx playwright test
```

Kết quả mong đợi: sau khi chạy, có thư mục `playwright-report/` và `results/` chứa `results.json` và `junit.xml`. Kiểm tra bằng `ls results` (dùng được trên cả PowerShell, macOS và Linux).

Nếu gặp lỗi file không tồn tại hoặc thư mục rỗng: có thể bạn chạy với `--reporter=...` trên dòng lệnh, lệnh này ghi đè toàn bộ danh sách trong config. Bỏ cờ đó đi.

### Bước 3. Đọc cấu trúc file JUnit và JSON
Mục đích: biết file chứa gì thì mới viết được script.

Mở `results/junit.xml`. Cấu trúc rút gọn:

```xml
<testsuites name="" tests="12" failures="1" skipped="0" errors="0">
  <testsuite name="login.spec.ts" tests="4" failures="1">
    <testcase name="đăng nhập hợp lệ" classname="login.spec.ts" time="1.2" />
    <testcase name="khoá sau 5 lần sai" classname="login.spec.ts" time="2.4">
      <failure message="Error: expect(received).toContainText(expected)" />
    </testcase>
  </testsuite>
</testsuites>
```

| Phần | Ý nghĩa |
|------|---------|
| `testsuite` | Một file spec. |
| `testcase` | Một test; `time` tính bằng giây. |
| `failure` | Có thẻ này nghĩa là test đỏ. |

Công cụ CI như Jenkins, GitLab, Azure DevOps đọc file này để vẽ biểu đồ và danh sách lỗi. GitHub Actions không tự hiển thị JUnit, bạn dùng action của bên thứ ba hoặc tự tóm tắt như Bước 5.

Mở `results/results.json` (các khoá `config`, `suites`, `errors`, `stats`, `specs[].tests[].results[]` và `duration`/`status` đã đối chiếu với file JSON thật do Playwright 1.64 sinh ra). Hai phần quan trọng:

```json
{
  "config": { "...": "..." },
  "suites": [
    { "title": "login.spec.ts", "file": "login.spec.ts", "specs": [
      { "title": "đăng nhập hợp lệ", "ok": true, "tests": [
        { "projectName": "chromium", "status": "expected", "results": [ { "status": "passed", "duration": 1180 } ] }
      ] }
    ] }
  ],
  "stats": { "startTime": "2026-03-01T10:00:00.000Z", "duration": 9040, "expected": 11, "unexpected": 1, "flaky": 0, "skipped": 0 }
}
```

| Phần | Ý nghĩa |
|------|---------|
| `stats.expected` | Số test đạt đúng kỳ vọng. |
| `stats.unexpected` | Số test đỏ (kể cả sau retry). |
| `stats.flaky` | Số test đỏ ở lần đầu nhưng xanh khi retry. |
| `stats.duration` | Tổng thời gian (ms). |
| `suites[].specs[].tests[].status` | Một trong `expected`, `unexpected`, `flaky`, `skipped`. |
| `results[].duration` | Thời gian từng lần chạy (ms); có nhiều phần tử nếu có retry. |
| `suites[].suites` | Nhóm `describe` lồng nhau, cần duyệt đệ quy. |

### Bước 4. Viết script tóm tắt kết quả
Mục đích: biến file JSON thành vài dòng chữ cho người. Tạo `scripts/summary.mjs` (đuôi `.mjs` để dùng `import` mà không cần cấu hình):

```js
import { readFileSync } from "node:fs";

const report = JSON.parse(readFileSync("results/results.json", "utf8"));
const { expected, unexpected, flaky, skipped, duration } = report.stats;
const total = expected + unexpected + flaky + skipped;
const passRate = total === 0 ? 0 : Math.round(((expected + flaky) / total) * 100);

// Duyệt đệ quy mọi suite để gom danh sách test cùng thời gian và trạng thái
function collect(suite, file = suite.title, out = []) {
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests) {
      const ms = t.results.reduce((sum, r) => sum + r.duration, 0);
      out.push({ file, title: spec.title, status: t.status, ms });
    }
  }
  for (const child of suite.suites ?? []) collect(child, file, out);
  return out;
}

const tests = report.suites.flatMap((s) => collect(s));
const slowest = [...tests].sort((a, b) => b.ms - a.ms).slice(0, 3);
const failed = tests.filter((t) => t.status === "unexpected");
const flakyTests = tests.filter((t) => t.status === "flaky");

const lines = [
  `E2E: ${expected} đạt, ${unexpected} lỗi, ${flaky} flaky, ${skipped} bỏ qua (${passRate}% đạt, ${(duration / 1000).toFixed(1)}s)`,
  ...failed.map((t) => `ĐỎ: ${t.file} > ${t.title}`),
  ...flakyTests.map((t) => `FLAKY: ${t.file} > ${t.title}`),
  ...slowest.map((t) => `CHẬM: ${t.title} (${(t.ms / 1000).toFixed(1)}s)`),
];
console.log(lines.join("\n"));
```

| Đoạn code | Ý nghĩa |
|-----------|---------|
| `readFileSync` rồi `JSON.parse` | Đọc file và biến thành đối tượng JS. |
| `passRate` | Test flaky cuối cùng vẫn xanh nên được tính vào nhóm đạt, nhưng ta báo riêng để không che giấu. |
| `collect` đệ quy | Test có thể nằm trong `describe` lồng nhau nên phải đi xuống `suite.suites`. |
| `reduce` cộng `duration` | Tính tổng thời gian mọi lần chạy (kể cả retry). |
| `sort` rồi `slice(0, 3)` | Lấy ba test chậm nhất. |

Chạy thử:

```bash
node scripts/summary.mjs
```

Kết quả mong đợi (số liệu minh hoạ):

```text
E2E: 11 đạt, 1 lỗi, 0 flaky, 0 bỏ qua (92% đạt, 9.0s)
ĐỎ: login.spec.ts > khoá sau 5 lần sai
CHẬM: khoá sau 5 lần sai (2.4s)
CHẬM: đăng nhập hợp lệ (1.2s)
```

Nếu gặp lỗi `ENOENT: no such file or directory, open 'results/results.json'`: chưa chạy test hoặc reporter `json` chưa được cấu hình; nhớ chạy lệnh từ thư mục gốc project.

### Bước 5. Gửi tóm tắt vào Slack hoặc Teams bằng webhook
Mục đích: kết quả tự đến kênh chat của nhóm. Thêm vào cuối `summary.mjs`:

```js
const webhook = process.env.CHAT_WEBHOOK;
if (webhook && (unexpected > 0 || flaky > 0)) {
  const res = await fetch(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: lines.join("\n") }),
  });
  console.log("Đã gửi thông báo, HTTP", res.status);
}
```

| Đoạn code | Ý nghĩa |
|-----------|---------|
| `process.env.CHAT_WEBHOOK` | URL webhook lấy từ biến môi trường; không ghi thẳng vào code vì ai có URL đều đăng tin được. Trên CI nó đến từ Secrets (xem bài 5.1). |
| Điều kiện `if` | Chỉ gửi khi có test lỗi hoặc flaky, tức là khi có điều đáng chú ý để tránh spam. |
| `fetch` | Có sẵn trong Node 18 trở lên, không cần cài thêm. |
| `{ text: ... }` | Slack Incoming Webhook nhận JSON có khoá `text`. Teams dùng định dạng riêng (Workflows hoặc Adaptive Card), hãy xem hướng dẫn webhook của kênh bạn dùng. |

Kết quả mong đợi: Slack trả HTTP 200 và tin nhắn xuất hiện trong kênh. Nếu gặp lỗi HTTP 400 hoặc 404: URL sai hoặc đã bị thu hồi; tạo lại webhook.

### Bước 6. Đưa tóm tắt lên trang kết quả của GitHub Actions
Mục đích: không cần chat, người mở lần chạy là thấy ngay bảng tóm tắt. GitHub cho phép ghi Markdown vào tệp có đường dẫn trong biến `GITHUB_STEP_SUMMARY`.

```yaml
      - name: Chạy test
        run: npx playwright test

      - name: Tóm tắt kết quả
        if: ${{ !cancelled() }}
        run: node scripts/summary.mjs | tee -a "$GITHUB_STEP_SUMMARY"
        env:
          CHAT_WEBHOOK: ${{ secrets.CHAT_WEBHOOK }}
```

| Phần | Ý nghĩa |
|------|---------|
| `if: ${{ !cancelled() }}` | Bước tóm tắt vẫn chạy khi bước test đỏ (xem bài 5.1). Job vẫn đỏ vì bước test đã lỗi. |
| `tee -a` | Vừa in ra log, vừa nối thêm vào tệp tóm tắt. |
| `$GITHUB_STEP_SUMMARY` | Đường dẫn tệp do GitHub cung cấp; nội dung hiện ở trang tóm tắt của lần chạy. |
| `env` kèm `secrets.CHAT_WEBHOOK` | Truyền URL webhook cho script. Nếu secret chưa tạo, biến rỗng và script bỏ qua việc gửi. |

Ngoài ra Playwright có reporter `github` tự gắn chú thích lỗi (annotation) lên dòng code trong PR. Bật trên CI:

```ts
reporter: process.env.CI ? [["github"], ["html", { open: "never" }], ["json", { outputFile: "results/results.json" }]] : [["list"], ["html", { open: "never" }]],
```

### Bước 7. Thử Allure
Mục đích: biết Allure làm được gì khi nhóm cần lịch sử và phân loại lỗi.

```bash
npm i -D allure-playwright
```

Thêm vào config: `["allure-playwright"]` trong mảng `reporter` (hoặc chạy thử một lần: `npx playwright test --reporter=line,allure-playwright`). Chạy test, sẽ có thư mục `allure-results/` chứa các file `*-result.json` và ảnh đính kèm. Để dựng báo cáo cần công cụ Allure. Với Allure Report 3 (gói npm `allure`, không cần Java; đã chạy thử với allure 3.22 và allure-playwright 3.14):

```bash
npm i -D allure
npx allure generate ./allure-results
npx allure open ./allure-report
```

`generate` sinh thư mục `allure-report/` (có `index.html`); `open` mở máy chủ cục bộ và trình duyệt. Có thể thêm `--clean` để xoá báo cáo cũ và `-o <thư mục>` để chọn nơi xuất. Allure 2 (gói `allure-commandline`, cần Java) có lệnh tương tự (`allure generate allure-results --clean -o allure-report`) nhưng là một công cụ khác; xem tài liệu hiện hành tại allurereport.org vì lệnh có thể đổi theo phiên bản.

Kết quả mong đợi: trình duyệt mở báo cáo có biểu đồ, nhóm lỗi theo nguyên nhân, các bước chi tiết. Allure mạnh ở lịch sử nhiều lần chạy (cần lưu thư mục `history`), nhưng đổi lại phải cài và bảo trì thêm. Với nhóm nhỏ, `html` của Playwright thường đủ.

## Demo code
Cấu hình đầy đủ cho CI và local:

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

const onCI = !!process.env.CI;

export default defineConfig({
  forbidOnly: onCI,
  retries: onCI ? 2 : 0,
  reporter: onCI
    ? [
        ["github"],                                              // chú thích lỗi trên PR
        ["html", { open: "never" }],                             // báo cáo chi tiết để tải về
        ["json", { outputFile: "results/results.json" }],        // cho script tóm tắt
        ["junit", { outputFile: "results/junit.xml" }],          // cho công cụ CI
      ]
    : [["list"], ["html", { open: "never" }]],
  use: { trace: "on-first-retry", screenshot: "only-on-failure" },
});
```

Đoạn này khớp với `starter-repo/playwright.config.ts` (`retries: process.env.CI ? 2 : 0`, `trace: "on-first-retry"`). Với `retries` lớn hơn 0, test đỏ lần đầu rồi xanh khi retry sẽ được báo là **flaky**, đúng nhóm số liệu bạn cần theo dõi.

Script `scripts/summary.mjs` hoàn chỉnh chính là phần code ở Bước 4 và Bước 5 ghép lại.

## Cách đọc số liệu
| Số liệu | Ý nghĩa | Hành động |
|---------|---------|-----------|
| Tỉ lệ flaky tăng | Test thiếu ổn định | Tìm nguyên nhân (bài 5.6), đừng chỉ tăng retry |
| Test chậm nhất | Nút cổ chai của cả bộ | Chuyển bớt bước chuẩn bị xuống API, chia nhỏ test |
| Lỗi lặp lại ở một chức năng | Chức năng rủi ro | Thêm test, báo dev |
| Tổng thời gian tăng dần | Bộ test phình ra | Chia shard, bỏ test trùng lặp |
| Tỉ lệ đạt giảm sau một lần merge | Thay đổi gần nhất gây lỗi | Revert hoặc sửa nhanh |

Ví dụ: bộ test có 120 test, 118 đạt, 2 flaky. Nếu chỉ nhìn "118/120 xanh" bạn tưởng mọi thứ ổn; nhưng 2 flaky báo hiệu rủi ro, tuần sau có thể thành 5. Vì vậy phải tách flaky ra khỏi số "đạt".

## Thử ngay trong lab
Chạy bộ test của một lab bất kỳ (ví dụ trang `/lab/cart` với spec `cart.spec.ts` trong starter repo) với cấu hình ở trên rồi chạy `node scripts/summary.mjs`. Sau đó bật bug: cookie `lab_bugs` hoặc biến `LAB_BUGS=BUG-02` trong starter repo (xem `starter-repo/README.md`), chạy lại, và quan sát dòng "ĐỎ" xuất hiện trong bản tóm tắt.

## Lỗi thường gặp
- Triệu chứng: báo cáo chỉ dành cho dev, quản lý không hiểu. Nguyên nhân: chỉ dùng `html`. Cách sửa: thêm bản tóm tắt một dòng gửi vào kênh chung.
- Triệu chứng: kênh chat có 50 thông báo mỗi ngày và không ai đọc. Nguyên nhân: gửi cả khi xanh, gửi từng nhánh. Cách sửa: chỉ gửi khi đỏ hoặc có flaky, và chỉ cho nhánh `main`.
- Triệu chứng: không thấy xu hướng theo tuần. Nguyên nhân: không lưu lịch sử. Cách sửa: lưu `results.json` mỗi lần chạy theo ngày hoặc dùng Allure với thư mục history.
- Triệu chứng: `results/results.json` không được tạo. Nguyên nhân: chạy bằng `--reporter=...` ghi đè config, hoặc thư mục không ghi được. Cách sửa: bỏ cờ, kiểm tra đường dẫn `outputFile`.
- Triệu chứng: URL webhook bị lộ trong repo. Nguyên nhân: ghi thẳng vào code hoặc workflow. Cách sửa: thu hồi webhook, tạo lại và lưu vào Secrets.
- Triệu chứng: `open: "on-failure"` làm CI treo. Nguyên nhân: reporter html cố mở báo cáo trên máy không có màn hình. Cách sửa: đặt `open: "never"`.

## Tóm tắt
- Dùng nhiều reporter cùng lúc: `list` cho người chạy, `html` cho chi tiết, `json` cho script, `junit` cho công cụ CI, `github` cho chú thích trên PR.
- `stats` trong `results.json` cho sẵn `expected`, `unexpected`, `flaky`, `skipped`; tự duyệt `suites` đệ quy để lấy test chậm.
- Webhook gửi tóm tắt vào chat; URL phải nằm trong Secrets và chỉ gửi khi có điều đáng chú ý.
- `GITHUB_STEP_SUMMARY` biến lần chạy CI thành trang tóm tắt có Markdown.
- Allure hợp khi cần lịch sử và phân loại lỗi, đổi lại tốn công bảo trì.
- Flaky là số liệu riêng cần theo dõi, không gộp lẫn vào "đạt".

## Bài tập
1. Dễ: Cấu hình reporter `junit` và `json`, chạy test rồi mở hai file kết quả. Xong khi bạn chỉ ra được test chậm nhất trong `results.json`.
2. Viết `scripts/summary.mjs` in ra số test đạt, lỗi, flaky. Xong khi chạy `node scripts/summary.mjs` in đúng số khớp với dòng tổng kết của Playwright.
3. Bật một bug của lab để một test đỏ, kiểm tra script in ra dòng "ĐỎ" với đúng tên test. Xong khi bạn tắt bug thì dòng đó biến mất.
4. Thêm bước vào workflow ghi tóm tắt vào `GITHUB_STEP_SUMMARY`. Xong khi trang tóm tắt của lần chạy hiện bảng kết quả.
5. Nâng cao: tạo webhook thử (Slack workspace cá nhân hoặc dịch vụ nhận webhook thử), gửi tin chỉ khi có test đỏ hoặc flaky. Xong khi chạy lần xanh không có tin, lần đỏ có tin.
