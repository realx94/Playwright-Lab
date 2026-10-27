---
title: Biến môi trường và cấu hình nhiều môi trường
level: 4
order: 4
minutes: 40
summary: Dùng .env, dotenv và projects để chạy cùng bộ test trên nhiều môi trường.
keywords: [dotenv là gì, playwright projects, environment variables]
---

## Mục tiêu bài học
- Giải thích được biến môi trường là gì và vì sao URL, tài khoản, khoá API không được viết cứng trong code.
- Tạo `.env`, `.env.example`, cấu hình `.gitignore`, đọc biến trong `playwright.config.ts` bằng `dotenv` với giá trị mặc định.
- Chạy cùng một bộ test cho nhiều môi trường (local, staging) bằng biến `BASE_URL` và `TEST_ENV` trên Windows lẫn macOS/Linux.
- Dùng `projects` để chạy cùng test trên desktop và điện thoại, chọn bằng `--project`.
- Biết đặt bí mật ở đâu khi chạy trên CI (GitHub `secrets` và `vars`).

## Bạn cần chuẩn bị
- Starter repo đã cài (`npm install`), mở được trong VS Code.
- Biết mở terminal: PowerShell hoặc Git Bash trên Windows, Terminal trên macOS.
- Hiểu `baseURL` ở mức cơ bản: `page.goto("/lab/login")` được ghép với `baseURL` (bài Level 2).
- Biết Git đã có `.gitignore` (bài 1.1).

## Kiến thức cần nắm
- **Biến môi trường** (environment variable): cặp tên–giá trị nằm **ngoài code**, đọc bằng `process.env.TEN_BIEN`.
- File `.env` + thư viện **dotenv**: nạp các cặp tên–giá trị trong file vào `process.env`. **Không commit** `.env`, chỉ commit `.env.example`.
- `playwright.config.ts` đọc biến để đặt `baseURL`, timeout, số worker, reporter.
- **Projects**: định nghĩa nhiều cấu hình (trình duyệt, thiết bị, môi trường) trong một file; chạy riêng bằng `--project=<tên>`.
- Bí mật (mật khẩu, API key) lưu ở **secrets của CI**, không để trong mã và không in ra log.
- Biến môi trường luôn là **chuỗi** hoặc `undefined`; phải tự đổi sang số hay boolean.

## Giải thích dễ hiểu
Địa chỉ nhà không nên khắc cứng vào chìa khoá. Biến môi trường là **tấm thẻ ghi địa chỉ** bạn thay khi chuyển nhà: chìa (code) vẫn vậy, chỉ cần đổi thẻ. Nhờ đó cùng một bộ test chạy ở máy bạn, ở staging và trên CI.

Hãy nghĩ tình huống thật: bạn viết 80 test với `page.goto("http://localhost:3000/lab/login")`. Tuần sau công ty có môi trường staging, địa chỉ khác. Bạn phải tìm và sửa 80 chỗ, rồi lại sửa ngược khi về máy mình. Nếu test chỉ viết `page.goto("/lab/login")` và địa chỉ gốc đến từ **một** biến `BASE_URL`, bạn đổi một giá trị là xong.

Lý do thứ hai là **an toàn**: mật khẩu tài khoản thật, token API không bao giờ được nằm trong kho Git, vì mọi người có quyền đọc repo đều thấy và lịch sử Git giữ mãi. Biến môi trường (và secrets của CI) giúp giá trị bí mật chỉ tồn tại ở máy chạy test.

Ba tầng giá trị, từ ưu tiên thấp tới cao: (1) giá trị **mặc định** trong code (`?? "http://localhost:3000"`), (2) giá trị trong file **`.env`**, (3) giá trị bạn **gõ trực tiếp** trên dòng lệnh hoặc đặt trên CI. dotenv **không ghi đè** biến đã tồn tại sẵn, nên giá trị trên dòng lệnh luôn thắng giá trị trong `.env`.

## Thực hành từng bước
Mọi lệnh chạy trong thư mục gốc của starter repo.

### Bước 1. Xem config hiện tại đọc `BASE_URL` thế nào
Mục đích: biết điểm bắt đầu.

Mở `playwright.config.ts` và đọc đoạn đầu:

```ts
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Đọc BASE_URL từ file .env (xem .env.example). Mặc định chạy với site chạy local.
dotenv.config();

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `import dotenv from "dotenv"` | Nhập thư viện dotenv (đã có trong `devDependencies` của starter). |
| `dotenv.config()` | Đọc file `.env` ở **thư mục đang chạy lệnh** (thư mục gốc dự án) và nạp từng dòng `TEN=giá_trị` vào `process.env`. Không có file `.env` thì không lỗi, chỉ không nạp gì. |
| `process.env.BASE_URL` | Đọc biến `BASE_URL`; nếu chưa đặt thì là `undefined`. |
| `?? "http://localhost:3000"` | Toán tử **nullish coalescing**: nếu bên trái là `undefined` (hoặc `null`) thì lấy giá trị mặc định bên phải. |

### Bước 2. Tạo `.env`, `.env.example` và bảo vệ bằng `.gitignore`
Mục đích: tách giá trị cấu hình khỏi code, mà không rò rỉ lên Git.

Tạo `.env.example` (file này **được commit**, chỉ liệt kê tên biến và giá trị mẫu không bí mật):

```bash
# .env.example
BASE_URL=http://localhost:3000
```

Sao chép thành `.env` để dùng thật:

```bash
# macOS / Linux / Git Bash
cp .env.example .env
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

| Phần lệnh | Ý nghĩa |
|-----------|---------|
| `cp` / `Copy-Item` | Sao chép file. |
| `.env.example` → `.env` | `.env` là file **riêng của máy bạn**: sửa thoải mái, không commit. |

Mở `.gitignore` và kiểm tra có dòng `.env`:

```text
node_modules/
test-results/
playwright-report/
.env
```

Kiểm tra Git thật sự bỏ qua `.env`:

```bash
git status
```

Kết quả mong đợi: `.env` **không** xuất hiện trong danh sách thay đổi; `.env.example` có thể hiện là file mới nếu bạn vừa tạo.

Nếu gặp lỗi: nếu `.env` vẫn hiện trong `git status`, có thể nó đã từng bị commit. Chạy `git rm --cached .env` để Git ngừng theo dõi (file trên đĩa vẫn còn), rồi commit. Nếu `.env` đã từng chứa **mật khẩu thật** thì mật khẩu đó coi như đã lộ: phải đổi mật khẩu.

### Bước 3. Chạy bộ test với địa chỉ khác bằng biến trên dòng lệnh
Mục đích: thấy giá trị trên dòng lệnh thắng `.env`.

Chọn đúng dòng cho hệ điều hành:

```bash
# macOS / Linux / Git Bash
BASE_URL=https://staging.example.com npx playwright test --list
```

```powershell
# Windows PowerShell
$env:BASE_URL = "https://staging.example.com"
npx playwright test --list
Remove-Item Env:BASE_URL
```

```text
:: Windows cmd (không có khoảng trắng trước &&)
set BASE_URL=https://staging.example.com&& npx playwright test --list
```

| Phần lệnh | Ý nghĩa |
|-----------|---------|
| `BASE_URL=... npx ...` (bash) | Đặt biến **chỉ cho lệnh này**. |
| `$env:BASE_URL = "..."` (PowerShell) | Đặt biến cho **cả phiên terminal** đến khi đóng hoặc xoá; vì vậy có dòng `Remove-Item Env:BASE_URL` để dọn. |
| `--list` | Chỉ liệt kê test, **không chạy**; dùng để kiểm tra cấu hình mà không gọi mạng. |

Để thấy giá trị thật sự được dùng, thêm tạm một dòng log vào config rồi xoá sau:

```ts
console.log("Chạy với baseURL =", baseURL);
```

Kết quả mong đợi: dòng log in `https://staging.example.com`, **không** phải địa chỉ trong `.env`. Nếu bạn đang dùng Windows và thấy vẫn là `localhost`, hầu như chắc chắn bạn dùng cú pháp bash trong PowerShell (PowerShell không hiểu `BASE_URL=... npx`).

Gợi ý: nếu cả đội dùng cả Windows lẫn macOS, có thể cài `cross-env` (`npm i -D cross-env`) để viết `npx cross-env BASE_URL=... playwright test` chạy giống nhau ở mọi hệ điều hành.

### Bước 4. Một hàm trung tâm để đọc biến và báo lỗi sớm
Mục đích: không để `process.env.XXX` rải khắp code; thiếu biến thì lỗi rõ ràng ngay lúc khởi động.

Tạo `utils/env.ts`:

```ts
/** Đọc biến bắt buộc; thiếu thì báo lỗi dễ hiểu ngay khi khởi động. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Thiếu biến môi trường ${name}. Hãy khai báo trong file .env (xem .env.example) hoặc secrets của CI.`,
    );
  }
  return value;
}

/** Đọc biến tuỳ chọn có giá trị mặc định. */
export function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `process.env[name]` | Đọc biến theo tên động (tên là tham số). |
| `if (!value)` | Bắt cả `undefined` lẫn chuỗi rỗng (`BASE_URL=` để trống). |
| `throw new Error(...)` | Dừng toàn bộ lần chạy ngay với thông điệp tiếng Việt chỉ rõ cách sửa. |

Lưu ý hàm `optionalEnv` dùng toán tử OR logic (hai dấu gạch đứng) thay vì `??` để chuỗi rỗng cũng rơi về giá trị mặc định; `??` chỉ thay khi giá trị là `undefined` hoặc `null`.

Trong config, dùng khi **bắt buộc có**, ví dụ khi chạy ở staging (không có mặc định an toàn):

```ts
import { requireEnv } from "./utils/env";

const isStaging = process.env.TEST_ENV === "staging";
const baseURL = isStaging ? requireEnv("BASE_URL") : (process.env.BASE_URL ?? "http://localhost:3000");
```

Kết quả mong đợi: chạy `TEST_ENV=staging npx playwright test --list` mà chưa đặt `BASE_URL` thì thấy thông điệp `Thiếu biến môi trường BASE_URL...`, thay vì test chạy nhầm vào localhost.

### Bước 5. Một file `.env` cho mỗi môi trường
Mục đích: `local`, `staging` mỗi nơi một bộ giá trị; chọn bằng một biến `TEST_ENV`.

Tạo hai file (đều trong `.gitignore`; chỉ commit các file `*.example`):

```bash
# .env.local
BASE_URL=http://localhost:3000
```

```bash
# .env.staging
BASE_URL=https://staging.example.com
```

Sửa phần đầu `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";

const targetEnv = process.env.TEST_ENV ?? "local";

// Nạp file theo môi trường trước, rồi tới .env chung (biến nào đã có thì không bị ghi đè)
dotenv.config({ path: path.resolve(__dirname, `.env.${targetEnv}`) });
dotenv.config({ path: path.resolve(__dirname, ".env") });

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `process.env.TEST_ENV ?? "local"` | Chọn môi trường; mặc định `local`. |
| `path.resolve(__dirname, ...)` | Tạo đường dẫn tuyệt đối tính từ thư mục chứa config, để chạy lệnh từ thư mục con vẫn tìm đúng file. |
| Hai lần `dotenv.config` | Lần 1 nạp `.env.<môi trường>`, lần 2 nạp `.env` chung. dotenv **không ghi đè** biến đã có, nên file nạp **trước** thắng. |

Thêm vào `.gitignore` các dòng `.env.*` và bỏ qua ngoại lệ cho file mẫu:

```text
.env
.env.*
!.env.example
```

Chạy thử:

```bash
# macOS / Linux / Git Bash
TEST_ENV=staging npx playwright test --list
```

```powershell
# Windows PowerShell
$env:TEST_ENV = "staging"; npx playwright test --list; Remove-Item Env:TEST_ENV
```

Kết quả mong đợi: dòng log `baseURL` (nếu bạn còn thêm) in địa chỉ trong `.env.staging`. Chạy không đặt `TEST_ENV` thì dùng `.env.local`.

Lưu ý: tuỳ phiên bản, dotenv có thể in một dòng thông tin mỗi lần nạp file; nếu thấy phiền, thêm `quiet: true` vào `dotenv.config({ ..., quiet: true })` (đã kiểm tra với dotenv 17, bản này in dòng `injected env` mặc định).

### Bước 6. Cấu hình nhiều `projects`
Mục đích: chạy cùng test trên desktop và điện thoại mà không viết thêm test.

```ts
export default defineConfig({
  testDir: "./tests",
  use: { baseURL, trace: "on-first-retry", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `use: {...}` ở cấp config | Tuỳ chọn áp dụng cho **mọi** project: `baseURL`, `trace` (ghi vết khi chạy lại), `screenshot`. |
| `projects: [...]` | Mỗi phần tử là một "cấu hình chạy"; mỗi test sẽ chạy **một lần cho mỗi project**. |
| `devices["Pixel 7"]` | Bộ thông số có sẵn: kích thước màn hình, user agent, cảm ứng, scale. |
| `...devices[...]` (spread) | Trải các thuộc tính vào `use`, để bạn có thể ghi đè thêm (ví dụ thêm `locale`) sau đó. |

Chạy:

```bash
npx playwright test --project=mobile
npx playwright test --project=desktop --project=mobile
```

Kết quả mong đợi: dòng đầu chỉ chạy trên điện thoại; dòng sau chạy cả hai, mỗi test xuất hiện hai lần trong danh sách với tiền tố `[desktop]` và `[mobile]`.

Nếu gặp lỗi: thông báo `Cannot use({ defaultBrowserType }) in a describe group` xảy ra khi bạn đặt `test.use({ ...devices[...] })` bên trong `describe`. Đặt thiết bị ở **project** hoặc ở **đầu file** (ngoài mọi `describe`).

### Bước 7. Timeout, retry, worker theo môi trường
Mục đích: cấu hình khác nhau ở máy bạn và trên CI.

```ts
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: { baseURL },
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `process.env.CI` | Hầu hết CI (GitHub Actions, GitLab CI) tự đặt `CI=true`. `!!` đổi sang `true/false`. |
| `timeout: 30_000` | Mỗi test tối đa 30 giây. |
| `expect: { timeout: 5_000 }` | Mỗi `expect` chờ tối đa 5 giây trước khi báo lỗi. |
| `forbidOnly: isCI` | Trên CI, nếu lỡ commit `test.only` thì cả lần chạy **thất bại**, tránh chỉ chạy một test mà tưởng xanh. |
| `retries: isCI ? 2 : 0` | Trên CI thử lại tối đa 2 lần cho test hỏng; ở máy bạn không retry để thấy lỗi ngay. |
| `workers: isCI ? 2 : undefined` | CI thường ít CPU nên giới hạn; `undefined` để Playwright tự chọn theo số lõi. |
| `reporter` | Trên CI dùng `github` (chú thích lỗi ngay trên PR) và báo cáo HTML; ở máy dùng `list`. |

### Bước 8. Truyền biến và bí mật trong GitHub Actions
Mục đích: cùng bộ test chạy trên CI mà không lộ mật khẩu.

Starter có sẵn `.github/workflows/e2e.yml`, trong đó có:

```yaml
    env:
      BASE_URL: ${{ vars.BASE_URL }}
```

| Phần | Ý nghĩa |
|------|---------|
| `${{ vars.BASE_URL }}` | Đọc **biến cấu hình** (Variables) của repo: giá trị không bí mật, hiển thị công khai trong log. |
| `${{ secrets.TEN }}` | Đọc **bí mật** (Secrets): được che trong log. Dùng cho mật khẩu, token. |

Cách đặt trên giao diện GitHub (giao diện có thể thay đổi nhẹ): vào repo, bấm tab **Settings** (nếu không thấy, mở menu **More** rồi chọn **Settings**), ở thanh bên trái mục **Security** mở **Secrets and variables**, chọn **Actions**; tab **Variables** có nút **New repository variable** để thêm `BASE_URL` (ô **Name**, **Value**, rồi **Add variable**), tab **Secrets** có nút **New repository secret** để thêm bí mật (ô **Name**, **Secret**, rồi **Add secret**). Trong workflow thêm `STAGING_PASSWORD: ${{ secrets.STAGING_PASSWORD }}` vào khối `env`, rồi trong code đọc bằng `requireEnv("STAGING_PASSWORD")`.

Kết quả mong đợi: bước chạy test trên GitHub dùng địa chỉ bạn đặt trong Variables; mật khẩu hiện thành `***` nếu lỡ bị in ra log.

## Demo code
`playwright.config.ts` hoàn chỉnh cho bài này:

```ts
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";

// 1) Chọn môi trường (mặc định local) và nạp file .env tương ứng
const targetEnv = process.env.TEST_ENV ?? "local";
dotenv.config({ path: path.resolve(__dirname, `.env.${targetEnv}`) });
dotenv.config({ path: path.resolve(__dirname, ".env") });

// 2) Đọc cấu hình, có giá trị mặc định cho máy cá nhân
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
```

Giải thích: khối (1) chọn môi trường, khối (2) đọc giá trị; phần `defineConfig` chỉ **dùng** các giá trị đó chứ không chứa địa chỉ hay bí mật nào. Config này giữ nguyên tinh thần config của starter (đọc `BASE_URL` bằng dotenv, mặc định `localhost:3000`, trace khi retry); nếu bạn đang dùng `LAB_BUGS` để chấm bài thì giữ nguyên khối `storageState` đã có trong `use`.

## Quy tắc an toàn
1. `.env*` nằm trong `.gitignore` (trừ `.env.example`).
2. Có `.env.example` liệt kê **tên** biến (không có giá trị bí mật) để đồng đội biết cần khai báo gì.
3. Kiểm tra biến bắt buộc ngay khi khởi động để báo lỗi sớm.
4. Bí mật trên CI đặt ở **Secrets**; không `console.log` giá trị bí mật.
5. Không dùng tài khoản thật của người dùng cho test; tạo tài khoản test riêng.

## Thử ngay trong lab
Chạy `npx playwright test tests/00-smoke.spec.ts` với `BASE_URL` đang trỏ vào site lab của bạn. Sau đó thử đặt `BASE_URL` thành một địa chỉ sai (ví dụ `http://localhost:9999`) và quan sát lỗi `net::ERR_CONNECTION_REFUSED`: đây là dấu hiệu quen thuộc khi cấu hình môi trường sai.

## Lỗi thường gặp
- **Triệu chứng:** GitHub cảnh báo hoặc người khác thấy mật khẩu trong repo. **Nguyên nhân:** commit `.env` chứa bí mật. **Cách sửa:** đổi mật khẩu ngay (lịch sử Git vẫn giữ), thêm `.env` vào `.gitignore`, `git rm --cached .env`.
- **Triệu chứng:** chạy trên máy đồng nghiệp lỗi khó hiểu `Cannot navigate to invalid URL`. **Nguyên nhân:** không có giá trị mặc định, đồng nghiệp chưa có `.env`. **Cách sửa:** đặt giá trị mặc định (`?? "http://localhost:3000"`) hoặc dùng `requireEnv` để báo lỗi rõ.
- **Triệu chứng:** sửa `.env` mà test vẫn chạy với địa chỉ cũ. **Nguyên nhân:** biến cùng tên đã được đặt sẵn trong terminal (dotenv không ghi đè). **Cách sửa:** `Remove-Item Env:BASE_URL` (PowerShell) hoặc `unset BASE_URL` (bash), hoặc mở terminal mới.
- **Triệu chứng:** trong PowerShell gõ `BASE_URL=... npx playwright test` báo `BASE_URL is not recognized`. **Nguyên nhân:** đó là cú pháp bash. **Cách sửa:** dùng `$env:BASE_URL = "..."` hoặc `cross-env`.
- **Triệu chứng:** đọc `process.env.RETRIES` rồi so sánh `=== 2` luôn sai. **Nguyên nhân:** biến môi trường luôn là chuỗi. **Cách sửa:** `Number(process.env.RETRIES ?? 0)`.
- **Triệu chứng:** hard-code `http://localhost:3000` trong test thay vì dùng `baseURL`. **Cách sửa:** dùng đường dẫn tương đối `page.goto("/lab/login")`.

## Tóm tắt
- Biến môi trường tách cấu hình khỏi code; `dotenv` nạp file `.env` vào `process.env`.
- Chỉ commit `.env.example`; `.env*` thật nằm trong `.gitignore`, bí mật trên CI nằm ở Secrets.
- Thứ tự ưu tiên: biến gõ trên dòng lệnh hoặc CI > `.env` > giá trị mặc định trong code.
- Dùng `TEST_ENV` để chọn file `.env.<môi trường>`, `projects` để chạy theo thiết bị, và `process.env.CI` để chỉnh retries/workers/reporter.
- Kiểm tra biến bắt buộc ngay lúc khởi động (`requireEnv`) để lỗi cấu hình hiện rõ.

## Bài tập
1. Tạo `.env.example` và đọc `BASE_URL` trong config của starter repo (nếu chưa có). Xong khi `git status` không hiển thị `.env`, và `npx playwright test tests/00-smoke.spec.ts` xanh.
2. Chạy `npx playwright test --list` với `BASE_URL` đặt trên dòng lệnh theo đúng cú pháp của hệ điều hành bạn dùng, in `baseURL` ra console để chứng minh giá trị lệnh thắng `.env`. Xong khi bạn xoá dòng log và biến tạm sau đó.
3. Thêm project `mobile` (Pixel 7) và chạy riêng `--project=mobile`. Xong khi bạn đếm được số test chạy trên từng project.
4. Tạo `.env.local` và `.env.staging` với `TEST_ENV`. Xong khi đổi `TEST_ENV` làm `baseURL` đổi theo mà không sửa code.
5. Thử thách: viết `requireEnv` và dùng nó để chặn lần chạy `TEST_ENV=staging` khi thiếu `BASE_URL`. Xong khi thông báo lỗi nêu rõ tên biến thiếu và cách khắc phục.
