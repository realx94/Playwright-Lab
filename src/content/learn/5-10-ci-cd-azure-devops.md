---
title: CI/CD với Azure DevOps Pipelines
level: 5
order: 10
minutes: 65
summary: Tạo tổ chức và dự án Azure DevOps, viết azure-pipelines.yml chạy Playwright, publish kết quả JUnit và artifact, dùng biến, Variable Group, lịch chạy và so sánh với GitHub Actions.
keywords: [azure devops pipelines playwright, azure-pipelines.yml, PublishTestResults, variable group, azure devops test plans, ci cd azure]
---

## Mục tiêu bài học
- Tạo được tổ chức (organization) và dự án (project) trên Azure DevOps và hiểu các thành phần chính: Repos, Pipelines, Test Plans.
- Viết file `azure-pipelines.yml` chạy Playwright: `trigger`, `pool`, cài Node, `npm ci`, cài trình duyệt, chạy test.
- Đưa kết quả lên tab **Tests** bằng `PublishTestResults@2` (JUnit) và lưu báo cáo bằng `PublishPipelineArtifact@1`.
- Dùng biến pipeline, **Variable Group** và secret đúng cách, đặt lịch chạy bằng `schedules`.
- So sánh được Azure DevOps Pipelines với GitHub Actions (bài 5.1) và biết Test Plans dùng để làm gì.

## Bạn cần chuẩn bị
- Đã học **bài 5.1** (GitHub Actions): khái niệm workflow, runner, artifact, secrets, cron được giả định đã biết. Bài này tập trung vào chỗ khác biệt.
- Một tài khoản Microsoft (cá nhân hoặc công việc) để đăng nhập `https://dev.azure.com`.
- Một project Playwright có `package.json` và `package-lock.json`, ví dụ `starter-repo/` của site.
- Playwright `^1.64`, Node 22 LTS (xem `.nvmrc` của project).

> **Trung thực về phạm vi kiểm chứng.** Tên task, phiên bản (`UseNode@1`, `PublishTestResults@2`, `PublishPipelineArtifact@1`), tên input và cú pháp `schedules`, Variable Group đã được đối chiếu với tài liệu chính thức tại learn.microsoft.com và tài liệu CI của Playwright. Tác giả **chưa chạy pipeline thật** trên một tổ chức Azure DevOps. Phần chạy thật duy nhất là reporter JUnit của Playwright (sinh file XML hợp lệ trên site lab) và việc kiểm tra file YAML có cú pháp hợp lệ bằng bộ phân tích YAML. Tên menu trên giao diện Azure DevOps hay đổi, nên hãy coi các bước giao diện là hướng dẫn gần đúng.

## Kiến thức cần nắm
- **Organization** (tổ chức) chứa nhiều **Project** (dự án); mỗi project có Boards (công việc), Repos (git), Pipelines (CI/CD), Test Plans (kiểm thử thủ công), Artifacts (gói).
- **Pipeline YAML**: file `azure-pipelines.yml` trong repo. Cấu trúc: `trigger`, `pool`, `variables`, `steps` (hoặc `stages` và `jobs` khi phức tạp).
- **Task** là bước dựng sẵn, viết dạng `task: Tên@phiênbản`; **script** là bước chạy lệnh shell.
- **Agent pool và `vmImage`**: `ubuntu-latest` là máy ảo do Microsoft cung cấp (Microsoft-hosted agent).
- **Biến**: `$(tên)` đọc biến lúc chạy; biến **secret** không tự truyền vào lệnh mà phải được ánh xạ vào `env`.
- **Variable Group**: nhóm biến dùng chung cho nhiều pipeline, quản lý ở **Pipelines**, **Library**.
- **Test run** và **Artifact**: kết quả test hiện ở tab **Tests**, tệp lưu lại hiện ở mục **Artifacts** của lần chạy.

## Giải thích dễ hiểu
Azure DevOps giống **một toà nhà văn phòng cho cả nhóm phần mềm**: tầng Boards để ghi việc, tầng Repos để cất code, tầng Pipelines là xưởng tự động kiểm tra, tầng Test Plans là phòng của tester thủ công. Điểm lợi là mọi thứ nằm chung một chỗ, nên bạn có thể đi từ một lỗi (bug) tới lần chạy pipeline phát hiện ra nó. Vì vậy các công ty dùng hệ sinh thái Microsoft rất hay chọn Azure DevOps.

Pipeline làm đúng việc mà workflow GitHub Actions làm: mỗi lần có commit, một máy ảo sạch được cấp, tải code, cài Node, cài thư viện, chạy test, rồi trả kết quả. Khác biệt đáng chú ý nằm ở **cách trả kết quả**. Azure DevOps có tab **Tests** biết đọc file JUnit và hiện số test đạt, hỏng, xu hướng theo thời gian. Muốn có tab này, bạn phải **chủ động publish** file kết quả bằng task `PublishTestResults@2`. Còn báo cáo HTML của Playwright, bạn lưu thành artifact để tải về xem.

Một điều dễ vấp: nếu một bước chạy test thất bại, các bước phía sau mặc định **bị bỏ qua**, nên bước publish kết quả sẽ không chạy đúng lúc ta cần nhất (khi test đỏ). Cách xử lý là gắn điều kiện `succeededOrFailed()` cho bước publish, tương tự `if: ${{ !cancelled() }}` ở GitHub Actions.

## Thực hành từng bước

### Bước 1. Tạo tổ chức và dự án
Mục đích: có nơi chứa pipeline.

1. Mở `https://dev.azure.com`, đăng nhập bằng tài khoản Microsoft.
2. Nếu chưa có tổ chức, giao diện sẽ đề nghị **Create new organization**; làm theo, đặt tên tổ chức (duy nhất toàn cầu), chọn khu vực lưu trữ gần bạn.
3. Trong tổ chức, bấm **New project**, nhập tên (ví dụ `playwright-e2e`), chọn **Private**, bấm **Create**.
4. Cột trái của project có các mục **Boards**, **Repos**, **Pipelines**, **Test Plans**, **Artifacts**.

Kết quả mong đợi: bạn đứng trong trang **Summary** của project. Giao diện có thể thay đổi nhẹ theo thời gian.

### Bước 2. Đưa code lên Azure Repos (hoặc dùng GitHub)
Mục đích: pipeline cần một repo để đọc code.

Có hai cách. Cách A: dùng **Repos** của Azure DevOps: vào **Repos**, **Files**, lấy URL ở nút **Clone**, thêm remote và đẩy code:

```bash
git remote add azure https://dev.azure.com/<tổ-chức>/<dự-án>/_git/<repo>
git push azure main
```

| Phần lệnh | Ý nghĩa |
|-----------|---------|
| `git remote add azure <url>` | Khai báo một "điểm đến" tên `azure` (bạn có thể giữ cả `origin` của GitHub). |
| `git push azure main` | Đẩy nhánh `main` lên remote `azure`. Lần đầu có thể phải tạo **Personal Access Token** hoặc đăng nhập qua trình duyệt. |

Cách B: giữ code ở GitHub và để Azure Pipelines kết nối tới (bước 4 sẽ chọn **GitHub**, giao diện hướng dẫn cài ứng dụng Azure Pipelines vào repo). Với bài học, cách nào cũng được; phần YAML giống hệt.

### Bước 3. Cấu hình Playwright xuất JUnit
Mục đích: tạo file mà tab **Tests** đọc được.

Trong `playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }], ["junit", { outputFile: "results/junit.xml" }]]
    : [["list"], ["html", { open: "never" }]],
  use: { baseURL: process.env.BASE_URL },
});
```

Reporter `junit` với `outputFile` là cấu hình trong tài liệu CI của Playwright (ví dụ của họ ghi vào `test-results/e2e-junit-results.xml`; ta dùng thư mục riêng `results/` cho rõ ràng). Tác giả đã chạy thử reporter này và thu được XML bắt đầu bằng `<testsuites ... tests="9" failures="0" ...>` với từng `<testcase>`.

Thử cục bộ:

```bash
CI=true npx playwright test
```

Trên PowerShell: `$env:CI="true"; npx playwright test`. Kết quả mong đợi: có file `results/junit.xml`. Thêm `results/` và `playwright-report/` vào `.gitignore`.

### Bước 4. Viết `azure-pipelines.yml`
Mục đích: định nghĩa pipeline. Tạo file `azure-pipelines.yml` ở gốc repo:

```yaml
trigger:
  branches:
    include:
      - main

pr:
  branches:
    include:
      - main

pool:
  vmImage: ubuntu-latest

steps:
  - task: UseNode@1
    displayName: Cài Node.js 22
    inputs:
      version: "22.x"

  - script: npm ci
    displayName: Cài thư viện

  - script: npx playwright install --with-deps chromium
    displayName: Cài trình duyệt

  - script: npx playwright test
    displayName: Chạy test
    env:
      CI: "true"
      BASE_URL: $(BASE_URL)

  - task: PublishTestResults@2
    displayName: Đưa kết quả lên tab Tests
    condition: succeededOrFailed()
    inputs:
      testResultsFormat: JUnit
      testResultsFiles: results/junit.xml
      searchFolder: $(System.DefaultWorkingDirectory)
      mergeTestResults: true
      testRunTitle: Playwright E2E

  - task: PublishPipelineArtifact@1
    displayName: Lưu báo cáo HTML
    condition: succeededOrFailed()
    inputs:
      targetPath: playwright-report
      artifact: playwright-report
```

| Phần | Ý nghĩa |
|------|---------|
| `trigger` | Khi có **push** vào `main` thì chạy (CI trigger). Danh sách nhánh nằm trong `branches.include`. |
| `pr` | Khi có Pull Request vào `main` thì chạy (áp dụng cho GitHub và Azure Repos tuỳ cấu hình). |
| `pool: vmImage: ubuntu-latest` | Máy ảo Ubuntu mới nhất do Microsoft cung cấp; mỗi lần chạy là một máy sạch. |
| `steps` | Danh sách bước chạy tuần tự. Dạng ngắn này đủ cho một job. |
| `task: UseNode@1` với `version: "22.x"` | Cài và đưa Node vào `PATH`. Tác vụ cũ `NodeTool@0` (với `versionSpec`) đã bị tài liệu Microsoft đánh dấu **deprecated**, nên dùng `UseNode@1`. Nếu gặp pipeline cũ dùng `NodeTool@0`, ý nghĩa tương đương. |
| `script:` | Chạy lệnh shell (bash trên Ubuntu). `displayName` là tên hiện trên giao diện. |
| `npx playwright install --with-deps chromium` | Cài trình duyệt và thư viện hệ điều hành (máy ảo sạch chưa có). |
| `env:` | Biến môi trường **chỉ cho bước này**. `CI` bật chế độ CI của Playwright. |
| `$(BASE_URL)` | Cú pháp macro của Azure: lấy biến pipeline `BASE_URL` (định nghĩa ở bước 5). |
| `condition: succeededOrFailed()` | Chạy bước này dù các bước trước thành công hay thất bại (nhưng không chạy khi bị huỷ). Đây là chìa khoá để publish kết quả khi test đỏ. |
| `PublishTestResults@2` | Task đọc file kết quả và đưa lên tab **Tests**. `testResultsFormat: JUnit` là giá trị mặc định; `testResultsFiles` có thể dùng ký tự đại diện; `searchFolder` là thư mục tìm file; `mergeTestResults: true` gộp mọi file vào một lần chạy kiểm thử; `testRunTitle` là tên hiển thị. |
| `PublishPipelineArtifact@1` | Lưu thư mục thành **pipeline artifact**: `targetPath` là thư mục cần lưu, `artifact` là tên artifact (tài liệu Microsoft cũng dùng tên input `artifactName`, cùng ý nghĩa). |

Về artifact: task `PublishBuildArtifacts@1` là cách cũ; tài liệu Microsoft khuyến nghị **pipeline artifacts** (`PublishPipelineArtifact@1`, hoặc dạng rút gọn `- publish: playwright-report` và `artifact: ...`) là thế hệ mới. Nếu công ty bạn còn dùng `PublishBuildArtifacts@1`, dạng cũ vẫn tải được bằng **Download Build Artifacts**, nhưng bài viết mới nên dùng pipeline artifact.

Kết quả mong đợi: file đã lưu, chưa chạy. Commit và push lên nhánh `main`.

### Bước 5. Tạo pipeline và biến `BASE_URL`
Mục đích: nối pipeline với file YAML.

1. Vào **Pipelines**, bấm **Create Pipeline** (hoặc **New pipeline**).
2. Chọn nơi chứa code: **Azure Repos Git** hoặc **GitHub**, rồi chọn repo.
3. Ở bước **Configure**, chọn **Existing Azure Pipelines YAML file**, nhánh `main`, đường dẫn `/azure-pipelines.yml`. (Nếu chọn mẫu khác như Node.js, bạn sẽ phải thay nội dung bằng file của mình.)
4. Ở màn hình **Review**, bấm **Variables**, **New variable**, tên `BASE_URL`, giá trị là địa chỉ site cần test, bấm **OK**, **Save**.
5. Bấm **Run** (hoặc **Save and run**).

Kết quả mong đợi: một lần chạy bắt đầu; bạn thấy job và từng bước đang chạy theo thời gian thực.

Nếu gặp lỗi `No hosted parallelism has been purchased or granted`: tổ chức mới thường chưa được cấp quyền chạy agent do Microsoft cung cấp. Bạn cần gửi yêu cầu miễn phí cho Microsoft (có biểu mẫu trong tài liệu Azure DevOps) hoặc dùng **self-hosted agent**. Đây là rào cản hay gặp ở tổ chức vừa tạo; tác giả không thể kiểm chứng trạng thái hiện tại của chính sách này, hãy đọc tài liệu mới nhất.

### Bước 6. Xem kết quả: Logs, Tests và Artifacts
Mục đích: biết lấy thông tin ở đâu.

Bấm vào lần chạy trong **Pipelines**:

| Vị trí | Thấy gì |
|--------|---------|
| **Summary** | Trạng thái chung, commit nào kích hoạt, thời gian, liên kết sang Tests và Artifacts. |
| Bấm vào **job** | Log từng bước; mở bước **Chạy test** để xem danh sách test của `list` reporter. |
| Tab **Tests** | Do `PublishTestResults@2`: tổng số đạt, hỏng, bỏ qua; mở từng test hỏng xem thông báo lỗi và stack trace; có biểu đồ so sánh với các lần chạy trước. |
| Mục **Artifacts** (ở Summary, phần *Related* hoặc nhãn "published") | Artifact `playwright-report`; bấm vào, mở rộng thư mục và tải về. |

Để xem báo cáo HTML: tải artifact, giải nén, rồi chạy `npx playwright show-report <thư-mục>` hoặc mở `index.html` (một số tính năng như trace cần server nên nên dùng `show-report`).

Cố ý làm một test hỏng rồi push: bạn sẽ thấy pipeline đỏ nhưng tab **Tests** vẫn có dữ liệu nhờ `succeededOrFailed()`. Nếu bỏ điều kiện đó đi, tab **Tests** sẽ trống đúng lúc cần nhất.

Nếu `PublishTestResults@2` không tìm thấy file, bước đó chỉ cảnh báo chứ không báo lỗi theo mặc định. Muốn báo lỗi khi thiếu file, đặt `failTaskOnMissingResultsFile: true`; muốn đánh dấu bước là hỏng khi có test hỏng, đặt `failTaskOnFailedTests: true` (tài liệu Playwright dùng tuỳ chọn này).

### Bước 7. Biến, Variable Group và secret
Mục đích: quản lý cấu hình và bí mật cho nhiều pipeline.

Biến pipeline (bước 5) thuận tiện cho một pipeline. Khi nhiều pipeline dùng chung cấu hình, tạo **Variable Group**:

1. **Pipelines**, **Library**, **+ Variable group**.
2. Đặt tên (ví dụ `playwright-e2e`), mục **Variables** bấm **+ Add**, nhập `BASE_URL` và `API_TOKEN`.
3. Bấm biểu tượng **ổ khoá** cạnh `API_TOKEN` để đánh dấu **secret** (giá trị được mã hoá và ẩn).
4. Bấm **Save**.

Tham chiếu trong YAML và **ánh xạ secret vào `env`**:

```yaml
variables:
  - group: playwright-e2e

steps:
  - script: npx playwright test
    displayName: Chạy test
    env:
      CI: "true"
      BASE_URL: $(BASE_URL)
      API_TOKEN: $(API_TOKEN)
```

| Phần | Ý nghĩa |
|------|---------|
| `variables: - group: playwright-e2e` | Nạp mọi biến của nhóm vào pipeline. |
| `API_TOKEN: $(API_TOKEN)` | Biến **secret không tự có** trong môi trường của `script`; bạn phải ánh xạ tường minh vào `env`. Tài liệu Microsoft nêu rõ không đọc được secret trực tiếp trong script. |

Với pipeline YAML, lần đầu dùng Variable Group bạn phải **cấp quyền** cho pipeline: vào **Library**, mở nhóm, tab **Pipeline permissions**, thêm pipeline của bạn (hoặc để pipeline chạy một lần, gặp lỗi xin quyền rồi bấm cho phép). Không có bước này, lần chạy báo lỗi cần cấp quyền truy cập tài nguyên.

Kết quả mong đợi: log in `API_TOKEN` thành `***` nếu bạn cố `echo`. Không nên in biến bí mật; chỉ truyền vào thứ thật sự cần.

### Bước 8. Đặt lịch chạy
Mục đích: chạy hằng đêm dù không có commit.

Thêm khối `schedules` vào file YAML (cùng cấp với `trigger`):

```yaml
schedules:
  - cron: "0 23 * * Mon-Fri"
    displayName: Chạy hằng đêm
    branches:
      include:
        - main
    always: true
```

| Phần | Ý nghĩa |
|------|---------|
| `cron` | Năm trường: phút, giờ, ngày, tháng, thứ. `0 23 * * Mon-Fri` là 23:00 từ thứ Hai đến thứ Sáu. |
| **Múi giờ UTC** | Giờ của cron luôn là UTC và không điều chỉnh theo giờ mùa hè. 23:00 UTC là 6:00 sáng hôm sau ở Việt Nam (UTC+7), nên cần chuyển đổi từ giờ địa phương sang UTC khi viết. |
| `branches.include` | Chỉ lập lịch cho nhánh liệt kê. Lịch được đọc từ file YAML **ở chính nhánh đó**. |
| `always: true` | Chạy theo lịch dù không có thay đổi code. Mặc định là `false`: nếu code không đổi từ lần chạy theo lịch thành công trước, pipeline **bỏ qua**. |

Kiểm tra: ở trang của pipeline, mở menu ba chấm, chọn **Scheduled runs** để xem các lần chạy sắp tới (trong bảy ngày). Nếu lịch không chạy, nguyên nhân thường gặp: có lịch cấu hình trong giao diện (UI) đè lên lịch YAML, hoặc quên `always: true` khi code không đổi. Nếu chỉ muốn chạy theo lịch, thêm `trigger: none` và `pr: none`.

### Bước 9. Test Plans ở mức tổng quan
Mục đích: biết nó là gì, không cần dùng ngay.

**Test Plans** là phần quản lý kiểm thử **thủ công** và theo dõi chất lượng: bạn tạo **test plan** cho một đợt phát hành, bên trong là **test suite** (nhóm) và **test case** (từng kịch bản có các bước, kết quả mong đợi). Tester chạy từng case và ghi đạt hoặc hỏng; case hỏng có thể tạo bug liên kết với Boards. Phần này thường cần giấy phép riêng của Azure DevOps.

Quan hệ với Playwright: pipeline của bạn đẩy kết quả tự động lên tab **Tests** của từng lần chạy. Việc **liên kết test tự động với test case** trong Test Plans có cơ chế riêng (gắn tự động hoá cho test case) và phụ thuộc loại test; với Playwright, cách làm thông dụng là giữ kết quả tự động ở tab **Tests** và dùng Test Plans cho kiểm thử thủ công hoặc ghi lại ánh xạ bằng quy ước đặt tên (ví dụ tiêu đề test chứa mã case). Hãy đọc tài liệu Test Plans nếu công ty yêu cầu liên kết hai chiều; tác giả không kiểm chứng phần này.

### Bước 10. So sánh với GitHub Actions
Mục đích: chuyển đổi dễ dàng giữa hai hệ.

| Khái niệm | GitHub Actions (bài 5.1) | Azure DevOps Pipelines |
|-----------|--------------------------|------------------------|
| File cấu hình | `.github/workflows/*.yml` (nhiều file) | `azure-pipelines.yml` (thường một file; tên và đường dẫn tuỳ chọn khi tạo pipeline) |
| Kích hoạt | `on: push`, `pull_request` | `trigger`, `pr` |
| Máy chạy | `runs-on: ubuntu-latest` | `pool: vmImage: ubuntu-latest` |
| Cài Node | `actions/setup-node` | `UseNode@1` |
| Chạy lệnh | `run:` | `script:` |
| Biến cấu hình / bí mật | Variables / Secrets trong Settings | Biến pipeline, Variable Group, secret (ánh xạ vào `env`) |
| Hẹn giờ | `schedule: - cron:` (UTC) | `schedules: - cron:` (UTC) |
| Lưu tệp | `actions/upload-artifact` | `PublishPipelineArtifact@1` |
| Kết quả test | Tự làm báo cáo hoặc dùng action bên ngoài | Tab **Tests** từ `PublishTestResults@2` |
| Chạy khi bước trước hỏng | `if: ${{ !cancelled() }}` | `condition: succeededOrFailed()` |
| Gắn với quản lý công việc | Issues, Projects | Boards, Test Plans tích hợp sẵn |

Nhận xét: logic giống nhau, tên gọi khác. Điểm mạnh riêng của Azure DevOps là tab **Tests** và liên kết với Boards và Test Plans. Điểm mạnh của GitHub Actions là kho action của cộng đồng và tích hợp chặt với GitHub.

## Demo code
File `azure-pipelines.yml` hoàn chỉnh gộp mọi thứ trong bài:

```yaml
trigger:
  branches:
    include:
      - main

pr:
  branches:
    include:
      - main

schedules:
  - cron: "0 23 * * Mon-Fri"
    displayName: Chạy hằng đêm
    branches:
      include:
        - main
    always: true

pool:
  vmImage: ubuntu-latest

variables:
  - group: playwright-e2e

steps:
  - task: UseNode@1
    displayName: Cài Node.js 22
    inputs:
      version: "22.x"

  - script: npm ci
    displayName: Cài thư viện

  - script: npx playwright install --with-deps chromium
    displayName: Cài trình duyệt

  - script: npx playwright test
    displayName: Chạy test
    env:
      CI: "true"
      BASE_URL: $(BASE_URL)
      API_TOKEN: $(API_TOKEN)

  - task: PublishTestResults@2
    displayName: Đưa kết quả lên tab Tests
    condition: succeededOrFailed()
    inputs:
      testResultsFormat: JUnit
      testResultsFiles: results/junit.xml
      searchFolder: $(System.DefaultWorkingDirectory)
      mergeTestResults: true
      testRunTitle: Playwright E2E

  - task: PublishPipelineArtifact@1
    displayName: Lưu báo cáo HTML
    condition: succeededOrFailed()
    inputs:
      targetPath: playwright-report
      artifact: playwright-report
```

Trạng thái kiểm chứng: cú pháp YAML hợp lệ (đã phân tích bằng bộ phân tích YAML); tên task, input và giá trị đối chiếu với tài liệu Microsoft và Playwright; **chưa chạy** trên một tổ chức Azure DevOps thật. Cách tự kiểm tra: trong trình soạn thảo pipeline của Azure DevOps có nút **Validate** hoặc tab **Preview** (hoặc menu **Validate**) để kiểm tra YAML trước khi chạy. Nếu bạn không muốn dùng Variable Group, xoá khối `variables`, định nghĩa `BASE_URL` ở bước 5 và bỏ dòng `API_TOKEN`.

## Thử ngay trong lab
Đặt biến `BASE_URL` là địa chỉ site lab công khai (hoặc site chạy trong chính pipeline) và chạy các test của starter repo ở `/lab/login` hoặc `/lab/cart`. Sau khi pipeline chạy, đối chiếu tab **Tests** với danh sách test trong log: số lượng phải khớp. Thử thêm `?bugs=BUG-01` vào một test (hoặc dùng biến `LAB_BUGS` của starter repo) để tạo test đỏ có chủ đích và quan sát cách Azure DevOps hiển thị.

## Lỗi thường gặp
- **Tab Tests trống dù test đã chạy**: thiếu `condition: succeededOrFailed()` hoặc `testResultsFiles` sai đường dẫn. Kiểm tra log của bước `PublishTestResults@2` xem nó tìm file ở đâu.
- **`No hosted parallelism has been purchased or granted`**: tổ chức chưa có agent miễn phí; xin cấp quyền theo hướng dẫn Microsoft hoặc dùng self-hosted agent.
- **`##[error]Bash exited with code '1'` ở bước chạy test**: có test hỏng; đây là hành vi đúng. Xem tab Tests và artifact để biết test nào.
- **`API_TOKEN` rỗng trong test**: biến secret chưa được ánh xạ vào `env`. Thêm `API_TOKEN: $(API_TOKEN)` như bước 7.
- **`Could not find a variable group` / cần cấp quyền**: pipeline chưa được phép dùng Variable Group; mở **Library**, tab **Pipeline permissions** để cho phép.
- **`browserType.launch: Executable doesn't exist`**: quên bước `npx playwright install --with-deps chromium` hoặc phiên bản trình duyệt không khớp phiên bản Playwright trong `package-lock.json`.
- **Lịch không chạy**: lịch UI đè lịch YAML, nhánh không có khối `schedules`, hoặc code không đổi mà `always` là `false`.
- **Giờ chạy lệch**: quên rằng cron là UTC; 23:00 UTC mới là 6:00 sáng giờ Việt Nam.
- **`The task 'NodeTool' is deprecated`**: dùng `UseNode@1` thay cho `NodeTool@0`.

## Tóm tắt
- Azure DevOps gom Boards, Repos, Pipelines, Test Plans; pipeline YAML nằm trong `azure-pipelines.yml` với `trigger`, `pool`, `steps`.
- Khung chạy Playwright: `UseNode@1`, `npm ci`, `npx playwright install --with-deps`, `npx playwright test`, kèm `env` cho `CI` và `BASE_URL`.
- Kết quả: reporter JUnit của Playwright cộng `PublishTestResults@2` cho tab **Tests**; báo cáo HTML lưu bằng `PublishPipelineArtifact@1`; cả hai cần `condition: succeededOrFailed()`.
- Secret trong Variable Group phải được ánh xạ vào `env`, và pipeline phải được cấp quyền dùng nhóm.
- `schedules` dùng cron theo UTC; `always: true` để chạy cả khi không có thay đổi.
- So với GitHub Actions: logic giống, tên gọi khác; thế mạnh riêng là tab Tests và liên kết với Boards, Test Plans.

## Bài tập
1. Tạo tổ chức và dự án Azure DevOps (hoặc dùng cái có sẵn của công ty), đưa starter repo lên và tạo pipeline từ file `azure-pipelines.yml`; xong khi lần chạy đầu tiên kết thúc với trạng thái xanh.
2. Thêm reporter JUnit và task `PublishTestResults@2`; xong khi tab **Tests** hiển thị đúng số test bằng với log.
3. Cố ý làm một test đỏ; xong khi pipeline đỏ nhưng tab **Tests** vẫn có dữ liệu và bạn tải được artifact `playwright-report`, mở bằng `npx playwright show-report`.
4. Tạo Variable Group `playwright-e2e` với một biến thường và một biến secret, dùng trong pipeline; xong khi test đọc được cả hai qua `process.env` và log không in giá trị secret.
5. Thêm `schedules` chạy 6:00 sáng giờ Việt Nam các ngày trong tuần (tự đổi sang UTC) và kiểm tra bằng **Scheduled runs**; xong khi bạn giải thích được vì sao cần `always: true` và chuyển đổi múi giờ.
6. Nâng cao: viết bảng so sánh một-một giữa `.github/workflows/playwright.yml` của bài 5.1 và `azure-pipelines.yml` của bạn; xong khi mỗi bước của hai file đều có bước tương ứng ở file kia.
