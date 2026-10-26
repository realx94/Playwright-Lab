---
title: CI/CD với GitHub Actions
level: 5
order: 1
minutes: 60
summary: Tạo workflow GitHub Actions từng bước để chạy Playwright mỗi lần push, xem log, tải báo cáo, dùng secrets, chạy theo lịch và chia shard.
keywords: [github actions workflow, ci cd là gì, playwright github actions]
---

## Mục tiêu bài học
- Giải thích được CI/CD là gì và vì sao một bộ test chỉ chạy trên máy cá nhân thì chưa đủ.
- Tự tạo file `.github/workflows/playwright.yml`, đẩy lên GitHub và thấy workflow chạy lần đầu trong tab **Actions**.
- Đọc hiểu từng khoá YAML: `on`, `jobs`, `runs-on`, `steps`, `uses`, `run`, `with`, `env`, `if`, `strategy.matrix`.
- Xem log từng bước, tải artifact (báo cáo HTML, trace) về máy và mở bằng `npx playwright show-report`.
- Lưu bí mật bằng **Secrets**, cấu hình bằng **Variables**, chạy theo lịch (cron) và chia nhỏ bộ test bằng `--shard`.

## Bạn cần chuẩn bị
- Đã học bài Git/GitHub (1.1 đến 1.3): biết tạo repo, `git add`, `git commit`, `git push`.
- Một repo trên GitHub chứa project Playwright (có `package.json` và `package-lock.json`). Bạn có thể dùng `starter-repo/` của site này: nó đã có sẵn file `.github/workflows/e2e.yml` để đối chiếu.
- Test của bạn chạy xanh ở máy cá nhân bằng `npx playwright test` (xem bài 0.3).
- Một tài khoản GitHub miễn phí là đủ; repo public hoặc private đều có hạn mức phút chạy miễn phí (hạn mức có thể thay đổi, xem trang Billing của GitHub).

## Kiến thức cần nắm
- **CI** (Continuous Integration, tích hợp liên tục): mỗi lần có thay đổi, hệ thống tự build và chạy test.
- **CD** (Continuous Delivery/Deployment): tự động đưa bản đã qua kiểm tra lên môi trường kế tiếp. Với QA, phần quan trọng nhất là cửa kiểm tra trước đó.
- **Workflow**: một file YAML trong `.github/workflows/` mô tả quy trình tự động.
- **Job**: một nhóm bước chạy trên cùng một máy ảo (**runner**). Các job mặc định chạy song song.
- **Step**: một bước trong job, hoặc là `uses` (dùng action dựng sẵn) hoặc là `run` (chạy lệnh shell).
- **Artifact**: tệp kết quả của lần chạy (báo cáo, trace) được lưu lại để tải về.
- **Secrets / Variables**: nơi lưu giá trị nhạy cảm (mật khẩu, token) và giá trị cấu hình thường (URL).
- **Cron**: cú pháp 5 trường để hẹn giờ chạy; GitHub tính theo giờ UTC.

## Giải thích dễ hiểu
CI giống **nhân viên kiểm tra đứng ở cửa nhà máy**. Mỗi lô hàng (commit) đi qua đều được kiểm tra tự động trước khi vào kho (nhánh `main`). Bạn không phải nhớ chạy test; ai đẩy code hỏng thì cửa báo đỏ ngay, kèm biên bản (báo cáo) để biết hỏng ở đâu.

Vì sao không chạy test ở máy mình là đủ? Có ba lý do. Thứ nhất, máy bạn có thể khác máy đồng nghiệp (phiên bản Node, hệ điều hành, font chữ, múi giờ), nên "chạy được trên máy tôi" không chứng minh gì. Thứ hai, con người hay quên: sẽ có ngày ai đó merge mà chưa chạy test. Thứ ba, CI cho cả nhóm cùng nhìn một kết quả: dấu tích xanh hoặc dấu X đỏ ngay trên Pull Request.

Mô hình hoạt động rất đơn giản: GitHub thuê cho bạn một **máy ảo sạch** (ví dụ Ubuntu) mỗi lần chạy. Máy này hoàn toàn trống: chưa có code, chưa có Node, chưa có trình duyệt. Vì vậy workflow phải làm lần lượt như bạn làm trên máy mới: tải code về, cài Node, cài thư viện, cài trình duyệt, chạy test, rồi lưu báo cáo trước khi máy bị huỷ.

## Thực hành từng bước

### Bước 1. Kiểm tra project chạy được ở máy mình trước
Mục đích: không đổ lỗi cho CI những lỗi vốn có ở project. Mở terminal tại thư mục gốc của project.

```bash
npm ci
```

| Phần | Ý nghĩa |
|------|---------|
| `npm ci` | Cài thư viện đúng theo `package-lock.json`, xoá `node_modules` cũ rồi cài lại. Khác `npm install` ở chỗ không sửa lockfile, nên kết quả giống nhau trên mọi máy. |

Kết quả mong đợi: vài giây đến vài chục giây, kết thúc bằng dòng dạng `added 120 packages` và không có chữ `ERR!`.

Nếu gặp lỗi `npm ci can only install packages when your package.json and package-lock.json are in sync`: bạn đã sửa `package.json` mà chưa chạy `npm install` để cập nhật lockfile. Chạy `npm install` một lần, rồi commit cả hai file.

```bash
npx playwright test
```

Kết quả mong đợi: dòng cuối dạng `12 passed (8.4s)`. Nếu máy bạn đỏ thì sửa trước khi lên CI.

### Bước 2. Tạo thư mục và file workflow
Mục đích: GitHub chỉ nhận workflow nằm đúng ở `.github/workflows/` (có dấu chấm ở đầu `.github`).

macOS, Linux hoặc Git Bash trên Windows:

```bash
mkdir -p .github/workflows
```

PowerShell trên Windows:

```powershell
New-Item -ItemType Directory -Force .github/workflows
```

| Phần | Ý nghĩa |
|------|---------|
| `mkdir -p` | Tạo thư mục, tạo luôn thư mục cha nếu thiếu, không báo lỗi nếu đã tồn tại. |
| `New-Item -ItemType Directory -Force` | Bản tương đương của PowerShell. |

Kết quả mong đợi: không in gì (bash) hoặc in một bảng thư mục (PowerShell). Sau đó tạo file `.github/workflows/playwright.yml` bằng VS Code (File, New File). Tên file tuỳ ý nhưng đuôi phải là `.yml` hoặc `.yaml`.

### Bước 3. Viết khung workflow: tên và điều kiện kích hoạt
Mục đích: nói cho GitHub biết workflow tên gì và khi nào chạy. Dán đoạn đầu vào file:

```yaml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:
```

| Khoá | Ý nghĩa |
|------|---------|
| `name` | Tên hiển thị ở tab Actions. Không bắt buộc nhưng nên đặt cho dễ tìm. |
| `on` | Danh sách **sự kiện** làm workflow chạy. |
| `push` kèm `branches: [main]` | Chạy khi có người đẩy commit lên nhánh `main`. Bỏ `branches` thì chạy với mọi nhánh. |
| `pull_request` kèm `branches: [main]` | Chạy khi mở hoặc cập nhật PR nhắm vào `main`. Đây là nơi CI phát huy tác dụng nhất vì chặn lỗi trước khi merge. |
| `workflow_dispatch` | Cho phép bấm nút **Run workflow** thủ công trên giao diện GitHub, rất tiện khi thử nghiệm. |

Lưu ý YAML: thụt lề bằng dấu cách (không dùng Tab), mỗi cấp 2 dấu cách. Sai một cấp thụt lề là cả file không hợp lệ.

### Bước 4. Khai báo job và máy chạy
Mục đích: định nghĩa một job tên `test` chạy trên Ubuntu. Dán tiếp:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
```

| Khoá | Ý nghĩa |
|------|---------|
| `jobs` | Gom mọi job của workflow. |
| `test` | Id của job do bạn tự đặt (chữ thường, không dấu cách). |
| `runs-on` | Loại runner. `ubuntu-latest` là máy Linux, nhanh và rẻ nhất; cũng có `windows-latest`, `macos-latest`. |
| `timeout-minutes` | Quá thời gian này GitHub huỷ job. Mặc định là 360 phút, nên hãy đặt thấp hơn để một test treo không đốt hết hạn mức. |

### Bước 5. Thêm các bước chuẩn bị: lấy code, cài Node, cài thư viện
Mục đích: dựng lại môi trường trên máy ảo trống. Dán tiếp (thụt lề nằm dưới `test:`):

```yaml
    steps:
      - name: Lấy mã nguồn
        uses: actions/checkout@v4

      - name: Cài Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Cài thư viện
        run: npm ci
```

| Khoá | Ý nghĩa |
|------|---------|
| `steps` | Danh sách bước chạy tuần tự; bước nào lỗi thì các bước sau bị bỏ qua (trừ khi có `if`). Mỗi bước bắt đầu bằng dấu `-`. |
| `name` | Tên hiển thị của bước trong log (tuỳ chọn). |
| `uses` | Dùng một **action** dựng sẵn, viết dạng `chủ-sở-hữu/tên@phiên-bản`. |
| `actions/checkout@v4` | Tải mã nguồn của repo về runner. Thiếu bước này, máy ảo không có file nào. |
| `actions/setup-node@v4` | Cài Node. |
| `with` | Truyền **tham số đầu vào** cho action. |
| `node-version: 22` | Dùng Node 22. Starter repo dùng `node-version-file: .nvmrc` để đọc phiên bản từ file `.nvmrc`, cách này giữ máy bạn và CI luôn cùng phiên bản. |
| `cache: npm` | Lưu thư mục cache của npm giữa các lần chạy, cài nhanh hơn. |
| `run` | Chạy một lệnh shell trên runner. |

Phiên bản của action (`@v4`) có thể được GitHub nâng lên. Khi bạn thấy cảnh báo "Node.js 20 actions are deprecated" trong log, hãy đổi sang `@v5` hoặc bản mới theo trang của action.

### Bước 6. Cài trình duyệt và chạy test
Mục đích: runner chưa có trình duyệt mà Playwright cần.

```yaml
      - name: Cài trình duyệt
        run: npx playwright install --with-deps chromium

      - name: Chạy test
        run: npx playwright test
        env:
          CI: true
          BASE_URL: ${{ vars.BASE_URL }}
```

| Phần | Ý nghĩa |
|------|---------|
| `playwright install` | Tải trình duyệt do Playwright quản lý. |
| `--with-deps` | Cài luôn thư viện hệ thống mà trình duyệt cần trên Linux (font, `libnss`...). Thiếu cờ này trình duyệt thường không khởi động được trên runner. |
| `chromium` | Chỉ cài Chromium. Bỏ đi để cài cả Firefox và WebKit (lâu hơn nhiều). |
| `env` | Đặt **biến môi trường** cho riêng bước này. Có thể đặt `env` ở mức job hoặc mức workflow để dùng chung. |
| `CI: true` | Thực tế GitHub đã tự đặt `CI=true`; ghi ra cho rõ. Cấu hình của starter repo dùng nó để bật `forbidOnly` và `retries: 2`. |
| `${{ vars.BASE_URL }}` | Cú pháp **expression** của GitHub: lấy giá trị biến `BASE_URL` bạn khai báo ở Settings (xem Bước 11). |

### Bước 7. Lưu báo cáo bằng upload-artifact
Mục đích: máy ảo bị huỷ sau khi chạy, nên phải tải báo cáo ra trước khi nó biến mất.

```yaml
      - name: Lưu báo cáo
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

| Khoá | Ý nghĩa |
|------|---------|
| `if: ${{ !cancelled() }}` | Điều kiện chạy bước. Mặc định bước sau một bước lỗi sẽ bị bỏ qua, nghĩa là khi test đỏ thì báo cáo không được lưu, đúng lúc bạn cần nhất. `!cancelled()` nghĩa là "chạy cả khi trước đó lỗi, chỉ bỏ qua nếu người dùng huỷ". |
| `name` | Tên artifact hiện trong giao diện. |
| `path` | Thư mục hoặc tệp cần lưu. Reporter `html` mặc định ghi vào `playwright-report/`. Kết quả chi tiết (trace, ảnh) nằm ở `test-results/`. |
| `retention-days` | Giữ artifact bao nhiêu ngày rồi tự xoá để tiết kiệm dung lượng. |

Nếu muốn lưu cả trace và ảnh chụp, thêm một bước nữa với `path: test-results/` và `name: test-results`.

### Bước 8. Hoàn chỉnh file và đẩy lên GitHub
Ghép các đoạn trên lại (bản đầy đủ ở phần Demo code). Rồi commit và push:

```bash
git checkout -b ci/add-playwright-workflow
git add .github/workflows/playwright.yml
git commit -m "ci: thêm workflow chạy Playwright"
git push -u origin ci/add-playwright-workflow
```

| Lệnh | Ý nghĩa |
|------|---------|
| `git checkout -b <tên>` | Tạo nhánh mới và chuyển sang nhánh đó. |
| `git add <đường dẫn>` | Đưa đúng file workflow vào vùng chuẩn bị commit. |
| `git commit -m` | Tạo commit với thông điệp. |
| `git push -u origin <nhánh>` | Đẩy nhánh lên GitHub; `-u` ghi nhớ để lần sau chỉ cần `git push`. |

Kết quả mong đợi: Git in ra đường dẫn gợi ý "Create a pull request for ...". Mở PR từ nhánh này vào `main`: vì workflow có sự kiện `pull_request`, nó sẽ tự chạy ngay trên PR.

### Bước 9. Xem lần chạy đầu tiên trên GitHub
Giao diện GitHub có thể thay đổi nhẹ theo thời gian, nhưng đường đi chung như sau.

1. Vào trang repo, bấm tab **Actions** (hàng tab trên cùng, cạnh Pull requests).
2. Cột trái liệt kê các workflow, bạn sẽ thấy **Playwright Tests**. Cột phải là danh sách lần chạy, mỗi lần có biểu tượng: vòng vàng (đang chạy), dấu tích xanh (thành công), X đỏ (thất bại).
3. Bấm vào một lần chạy để vào trang tóm tắt. Bên trái là danh sách job (`test`), phía dưới là mục **Artifacts**.
4. Bấm vào job `test`. Màn hình chia theo từng bước; bấm mũi tên cạnh bước để mở log của bước đó.

Trên chính trang PR, ở cuối có khung "Checks": tên workflow kèm dấu tích xanh hoặc X đỏ. Nếu repo bật bảo vệ nhánh (Settings, Branches, Branch protection rules), bạn có thể bắt buộc check này xanh mới được merge.

### Bước 10. Đọc log khi test đỏ và tải artifact
Mục đích: biết vì sao đỏ mà không cần chạy lại ở máy.

1. Vào lần chạy đỏ, bấm job `test`, bước "Chạy test" sẽ tự mở và hiển thị lỗi y như terminal: tên test, dòng code lỗi, `Expected` và `Received`.
2. Ở góc phải khung log có biểu tượng bánh răng, chọn **View raw logs** để xem log thô, hoặc **Download log archive** ở menu của trang chạy để tải toàn bộ log.
3. Quay lại trang tóm tắt, cuộn xuống mục **Artifacts**, bấm `playwright-report` để tải file zip về.
4. Giải nén vào một thư mục, rồi mở báo cáo:

```bash
npx playwright show-report ./playwright-report
```

| Phần | Ý nghĩa |
|------|---------|
| `show-report` | Mở báo cáo HTML bằng một web server cục bộ (cần server vì báo cáo nạp tệp trace). |
| `./playwright-report` | Thư mục báo cáo bạn vừa giải nén. |

Kết quả mong đợi: trình duyệt mở danh sách test; bấm test đỏ để thấy các bước, ảnh chụp và (nếu có) trace. Với trace, bấm vào ảnh trace trong báo cáo hoặc chạy `npx playwright show-trace duong-dan/trace.zip` để tua lại từng thao tác (xem bài 2.13).

Trong giao diện cũng có nút **Re-run all jobs** hoặc **Re-run failed jobs** ở góc phải trang chạy; dùng khi nghi lỗi do hạ tầng. Tuy vậy, nếu một test cứ đỏ rồi xanh khi chạy lại thì đó là test flaky (xem bài 5.6), đừng chỉ bấm chạy lại cho qua.

### Bước 11. Dùng Variables và Secrets
Mục đích: tách cấu hình ra khỏi code. Quy tắc: giá trị ai thấy cũng được (URL của môi trường test) dùng **Variables**; giá trị bí mật (mật khẩu, token, API key) dùng **Secrets**.

Tạo một Variable:
1. Vào repo, bấm **Settings**, ở thanh bên trái chọn **Secrets and variables**, rồi **Actions**.
2. Chọn tab **Variables**, bấm **New repository variable**.
3. Name: `BASE_URL`; Value: địa chỉ site cần test (ví dụ địa chỉ site lab bạn đã triển khai). Bấm **Add variable**.

Tạo một Secret:
1. Cũng ở trang đó, chọn tab **Secrets**, bấm **New repository secret**.
2. Name: `LAB_ADMIN_PASSWORD`; Secret: giá trị mật khẩu (ví dụ của tài khoản test riêng cho CI). Bấm **Add secret**.

Sau khi lưu, bạn không xem lại được nội dung secret, chỉ có thể sửa hoặc xoá. Dùng trong workflow:

```yaml
      - name: Chạy test
        run: npx playwright test
        env:
          BASE_URL: ${{ vars.BASE_URL }}
          ADMIN_PASSWORD: ${{ secrets.LAB_ADMIN_PASSWORD }}
```

Trong test đọc bằng `process.env.ADMIN_PASSWORD`. GitHub tự che giá trị secret trong log bằng `***`, nhưng đừng cố in nó ra, và đừng bao giờ ghi bí mật thẳng vào file YAML hay code. Lưu ý: workflow chạy từ PR của người ngoài (fork) mặc định không được đọc secrets, đó là cơ chế bảo vệ chứ không phải lỗi.

Nếu `BASE_URL` rỗng: bạn quên tạo Variable hoặc tạo nhầm trong tab Secrets. Khi đó biến môi trường `BASE_URL` có mặt nhưng rỗng, `baseURL` của Playwright rỗng theo, và các test dùng `page.goto("/lab/login")` báo lỗi dạng `Cannot navigate to invalid URL`. Nếu thay vào đó biến không được đặt hẳn, cấu hình starter repo rơi về `http://localhost:3000` và test báo `ECONNREFUSED` vì CI không có server nào ở cổng đó.

### Bước 12. Chạy theo lịch với cron
Mục đích: chạy bộ regression mỗi sáng dù không ai push.

```yaml
on:
  schedule:
    - cron: "0 23 * * *"
```

| Trường cron | Ý nghĩa |
|-------------|---------|
| 5 trường theo thứ tự | phút, giờ, ngày trong tháng, tháng, thứ trong tuần. |
| `0 23 * * *` | Phút 0, giờ 23, mọi ngày, mọi tháng, mọi thứ, tức 23:00 UTC mỗi ngày. |
| Đổi sang giờ Việt Nam | Việt Nam là UTC+7 nên 23:00 UTC là 6:00 sáng hôm sau giờ VN. |
| `0 1 * * 1-5` | 8:00 giờ VN các ngày từ thứ Hai đến thứ Sáu. |

Cần biết: lịch chỉ chạy trên nhánh mặc định của repo; thời điểm chạy thực tế có thể trễ vài phút đến vài chục phút khi hệ thống GitHub đông; repo public không có hoạt động trong 60 ngày thì lịch bị tạm dừng.

### Bước 13. Chia nhỏ bộ test với matrix và shard
Mục đích: bộ test 40 phút chia ba máy chạy song song còn khoảng 14 phút. Khác với `workers` (nhiều tiến trình trên một máy), **shard** chia bộ test ra nhiều máy.

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
      # ... checkout, setup-node, npm ci, playwright install như trên ...
      - run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
```

| Khoá | Ý nghĩa |
|------|---------|
| `strategy.matrix` | Tạo nhiều bản sao của job, mỗi bản nhận một tổ hợp giá trị. Ở đây có 3 job với `shardIndex` là 1, 2, 3. |
| `fail-fast: false` | Một shard đỏ không làm GitHub huỷ các shard còn lại, nên bạn thấy đủ lỗi trong một lần. |
| `${{ matrix.shardIndex }}` | Lấy giá trị của job hiện tại. |
| `--shard=1/3` | Chạy phần thứ 1 trong 3 phần của bộ test. |

Vì mỗi shard có báo cáo riêng, muốn một báo cáo hợp nhất thì mỗi shard xuất báo cáo dạng `blob` rồi một job cuối gộp lại. Trong `playwright.config.ts`:

```ts
reporter: process.env.CI ? "blob" : "html",
```

Mỗi shard upload thư mục `blob-report/` với tên khác nhau (ví dụ `blob-report-${{ matrix.shardIndex }}`). Job gộp tải về và chạy:

```bash
npx playwright merge-reports --reporter html ./all-blob-reports
```

Kết quả mong đợi: sinh ra một thư mục `playwright-report` chứa báo cáo của toàn bộ ba shard. Chi tiết cú pháp job gộp xem phần Sharding trong tài liệu Playwright; dùng `actions/download-artifact@v4` với `pattern` và `merge-multiple`.

## Demo code
Đây là file hoàn chỉnh, gần với `starter-repo/.github/workflows/e2e.yml` nhưng có thêm `workflow_dispatch`, cron, timeout và lưu cả `test-results/`. Có thể dùng làm `.github/workflows/playwright.yml`.

```yaml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 23 * * *"      # 23:00 UTC = 6:00 sáng giờ Việt Nam
  workflow_dispatch:           # cho phép bấm nút chạy tay

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    env:
      CI: true
      BASE_URL: ${{ vars.BASE_URL }}   # lấy từ Settings > Secrets and variables > Actions > Variables
    steps:
      - name: Lấy mã nguồn
        uses: actions/checkout@v4

      - name: Cài Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc     # cùng phiên bản Node với máy bạn
          cache: npm

      - name: Cài thư viện
        run: npm ci

      - name: Cài trình duyệt
        run: npx playwright install --with-deps chromium

      - name: Kiểm tra kiểu TypeScript
        run: npm run typecheck           # starter repo có script này

      - name: Chạy test
        run: npx playwright test

      - name: Lưu báo cáo HTML
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

      - name: Lưu trace và ảnh chụp
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: test-results
          path: test-results/
          retention-days: 7
```

Đọc nhanh: cấp cao nhất có `name`, `on`, `jobs`. `env` đặt ở mức job nên mọi bước đều thấy `BASE_URL`. Hai bước `upload-artifact` đều có `if: ${{ !cancelled() }}` để chạy cả khi test đỏ. Nếu project không có script `typecheck`, hãy xoá bước đó. Lưu ý `if: ${{ !cancelled() }}` cũng chạy khi test xanh, nên thư mục `test-results/` có thể rỗng; khi không có tệp, action chỉ cảnh báo chứ không làm hỏng workflow.

Nếu bạn muốn kiểm tra file YAML trước khi push, cài tiện ích YAML trong VS Code hoặc đọc kỹ thông báo lỗi trong tab Actions, nơi GitHub chỉ rõ dòng sai.

## Thử ngay trong lab
Site lab chạy trên CI giống hệt dự án thật: bộ e2e của chính repo này chạy bằng workflow `.github/workflows/ci.yml`. Hãy mở file đó trong repo, đối chiếu từng khoá với bài này (chú ý `timeout-minutes`, `working-directory` ở bước typecheck starter repo, và bước `verify:solutions`). Sau đó thử với starter repo: đặt `BASE_URL` là địa chỉ site lab, đẩy lên GitHub và quan sát test chạy trên các lab như `/lab/login` và `/lab/cart`.

## Lỗi thường gặp
- Triệu chứng: workflow không xuất hiện trong tab Actions. Nguyên nhân: file không nằm đúng `.github/workflows/` hoặc sai đuôi, hoặc YAML sai thụt lề. Cách sửa: kiểm tra đường dẫn; GitHub hiện cảnh báo "Invalid workflow file" kèm số dòng.
- Triệu chứng: `browserType.launch: Executable doesn't exist` hoặc `Host system is missing dependencies`. Nguyên nhân: chưa cài trình duyệt hoặc thiếu `--with-deps`. Cách sửa: thêm bước `npx playwright install --with-deps chromium` trước bước chạy test.
- Triệu chứng: test xanh ở máy nhưng đỏ ở CI. Nguyên nhân: khác hệ điều hành, font, múi giờ (runner dùng UTC), tốc độ chậm hơn hoặc dữ liệu. Cách sửa: tải trace về xem, cố định `timezoneId` và `locale` khi cần, dùng assertion tự chờ thay vì chờ cố định.
- Triệu chứng: không thấy artifact khi test đỏ. Nguyên nhân: bước upload thiếu `if: ${{ !cancelled() }}`. Cách sửa: thêm điều kiện đó.
- Triệu chứng: `Error: Process completed with exit code 1` rồi dừng ở bước npm. Nguyên nhân: `npm ci` lỗi do lockfile lệch hoặc thiếu `package-lock.json` trong repo. Cách sửa: chạy `npm install` ở máy, commit lockfile.
- Triệu chứng: test treo rất lâu rồi bị huỷ. Nguyên nhân: thiếu `timeout-minutes`, hoặc `BASE_URL` trỏ vào server không phản hồi. Cách sửa: đặt timeout cho job và kiểm tra URL.
- Triệu chứng: `test.only` lọt vào code mà CI vẫn xanh. Nguyên nhân: chưa bật `forbidOnly`. Cách sửa: trong config, `forbidOnly: !!process.env.CI`.

## Tóm tắt
- CI là cửa kiểm tra tự động: máy ảo sạch chạy lại toàn bộ quy trình mỗi lần có thay đổi.
- Khung workflow: `on` (khi nào), `jobs` (việc gì), `runs-on` (máy nào), `steps` (từng bước, `uses` hoặc `run`).
- Bộ bước tối thiểu cho Playwright: checkout, setup-node, `npm ci`, `playwright install --with-deps`, `playwright test`, upload-artifact.
- Luôn upload báo cáo bằng `if: ${{ !cancelled() }}`; xem log trong tab Actions và tải artifact để mở bằng `show-report`.
- Giá trị thường để trong Variables, bí mật để trong Secrets, không ghi vào code hay in ra log.
- Cron tính theo UTC; dùng `--shard` kết hợp `matrix` để rút ngắn thời gian chạy.

## Bài tập
1. Dễ: Tạo repo trên GitHub từ starter repo, chép file workflow ở trên thành `.github/workflows/playwright.yml`. Xong khi tab Actions hiện một lần chạy với dấu tích xanh.
2. Làm cho workflow đỏ có chủ đích (sửa một assertion sai), rồi tải artifact `playwright-report` về và mở bằng `npx playwright show-report`. Xong khi bạn chỉ ra được test nào đỏ và giá trị Expected và Received.
3. Thêm Variable `BASE_URL` và một Secret tuỳ ý; in ra log biến `BASE_URL` và quan sát secret bị che thành `***`. Xong khi bạn giải thích được vì sao hai thứ này khác nhau.
4. Thêm lịch chạy 6 giờ sáng giờ Việt Nam các ngày trong tuần (viết cron cho đúng) và nút chạy thủ công `workflow_dispatch`. Xong khi bạn chạy thủ công thành công từ giao diện GitHub.
5. Nâng cao: chia bộ test thành 3 shard bằng `matrix`, dùng reporter `blob` và một job gộp báo cáo. Xong khi tab Actions có 3 job song song và một artifact báo cáo hợp nhất.
