---
title: CI/CD với Jenkins
level: 5
order: 9
minutes: 70
summary: Cài Jenkins bằng Docker, tạo Pipeline job từ Jenkinsfile, chạy Playwright trong image chính thức hoặc bằng NodeJS plugin, publish báo cáo HTML và JUnit, tham số hoá build và hẹn giờ bằng cron.
keywords: [jenkins playwright, jenkinsfile, jenkins pipeline, jenkins docker, publishHTML, junit jenkins, ci cd jenkins]
---

## Mục tiêu bài học
- Giải thích được Jenkins khác GitHub Actions ở điểm nào (tự vận hành máy chủ CI, plugin, `Jenkinsfile`).
- Chạy Jenkins bằng Docker trên máy cá nhân, mở khoá và cài các plugin cần cho Playwright.
- Viết một `Jenkinsfile` khai báo (declarative) với `agent`, `options`, `parameters`, `triggers`, `environment`, `stages`, `post`.
- Chạy test trong image `mcr.microsoft.com/playwright` hoặc bằng NodeJS plugin, rồi xem kết quả JUnit và báo cáo HTML ngay trên giao diện Jenkins.
- Dùng credentials để giữ bí mật, tham số hoá build và hẹn giờ chạy bằng cron.

## Bạn cần chuẩn bị
- Đã học **bài 5.1** (CI/CD với GitHub Actions): các khái niệm CI, runner, artifact, secrets, cron được dùng lại ở đây và không giải thích lại từ đầu.
- Docker Desktop (Windows, macOS) hoặc Docker Engine (Linux), đang chạy. Kiểm tra bằng `docker --version`.
- Một repo trên GitHub chứa project Playwright (ví dụ `starter-repo/` của site) có `package.json` và `package-lock.json`.
- Máy có ít nhất 4 GB RAM trống: Jenkins và trình duyệt đều khá nặng.

> **Trung thực về phạm vi kiểm chứng.** Tác giả đã đối chiếu cú pháp `Jenkinsfile`, tên plugin và image với tài liệu chính thức của Jenkins và Playwright, và đã chạy thử reporter JUnit của Playwright trên site lab (sinh file XML hợp lệ). Tuy nhiên **chưa chạy Jenkins thật** trong lúc soạn bài (không có Docker daemon sẵn sàng). Vì vậy các bước giao diện Jenkins và hai `Jenkinsfile` ở dưới có thể cần chỉnh nhẹ (tên menu, phiên bản plugin). Khi gặp khác biệt, hãy tin thông báo lỗi của Jenkins và tài liệu chính thức hơn là bài này.

## Kiến thức cần nắm
- **Jenkins**: máy chủ CI mã nguồn mở, bạn **tự cài và tự vận hành**. Khác với GitHub Actions (dịch vụ có sẵn), Jenkins chạy ở nơi bạn đặt, nên toàn quyền cấu hình nhưng cũng tự lo cập nhật và bảo mật.
- **Controller và agent**: controller là máy chủ điều phối giao diện và lịch; agent (node) là nơi chạy việc. Bài này dùng chính controller làm nơi khởi chạy, test chạy trong container.
- **Pipeline** và **`Jenkinsfile`**: file văn bản (ngôn ngữ Groovy rút gọn) mô tả quy trình, nằm trong repo cùng code.
- **Declarative Pipeline**: cú pháp có cấu trúc cố định `pipeline { agent ... stages { ... } post { ... } }`.
- **Plugin**: Jenkins có chức năng mở rộng qua plugin (Docker Pipeline, NodeJS, HTML Publisher, JUnit...).
- **Credentials**: kho lưu bí mật của Jenkins; trong `Jenkinsfile` lấy ra bằng `credentials('id')`.
- **Workspace**: thư mục làm việc của một lần build.

## Giải thích dễ hiểu
Hãy tưởng tượng GitHub Actions là **thuê nhà máy kiểm định có sẵn**: bạn chỉ đưa bản vẽ (file YAML). Còn Jenkins là **tự xây phân xưởng kiểm định trong công ty**: bạn mua máy, lắp đặt, bảo trì, nhưng muốn bố trí dây chuyền thế nào cũng được và dữ liệu không rời khỏi nhà. Nhiều doanh nghiệp (ngân hàng, bảo hiểm) chọn Jenkins vì lý do này, nên QA hay gặp nó ở công ty.

`Jenkinsfile` giống **công thức nấu ăn có đánh số bước** đặt cùng chỗ với nguyên liệu (code). Khi ai đó push code, Jenkins đọc công thức, mượn một "bếp" (agent), nấu theo từng stage, rồi cuối cùng dọn dẹp và gửi biên bản (`post`).

Với Playwright, có hai hướng chuẩn bị bếp:

1. **Image Docker chính thức của Playwright** (khuyến nghị): bếp đã có sẵn Node, trình duyệt và thư viện hệ điều hành. Bạn chỉ cần `npm ci` rồi chạy test. Ưu điểm: giống nhau ở mọi máy; nhược điểm: Jenkins cần quyền gọi Docker.
2. **NodeJS plugin**: Jenkins tự tải Node theo phiên bản bạn khai báo. Nhưng trình duyệt và thư viện hệ điều hành (`npx playwright install --with-deps`) cần quyền cài gói, không phải môi trường Jenkins nào cũng cho.

Điều quan trọng cần nhớ: phiên bản image phải **khớp** phiên bản `@playwright/test` trong `package.json`. Nếu lệch, Playwright báo không tìm thấy trình duyệt vì mỗi phiên bản dùng một bản trình duyệt riêng.

## Thực hành từng bước

### Bước 1. Chạy Jenkins bằng Docker
Mục đích: có một Jenkins chạy ở `http://localhost:8080`.

Để Jenkins gọi được Docker (cần cho cách dùng image Playwright), ta dựng một image Jenkins có thêm Docker CLI. Tạo thư mục `jenkins-lab` có file `Dockerfile`:

```dockerfile
FROM jenkins/jenkins:lts-jdk21
USER root
RUN apt-get update && apt-get install -y docker.io && rm -rf /var/lib/apt/lists/*
USER jenkins
```

Dựng image rồi chạy:

```bash
docker build -t jenkins-playwright .
docker run -d --name jenkins -p 8080:8080 -p 50000:50000 --restart on-failure -u root -v jenkins_home:/var/jenkins_home -v /var/run/docker.sock:/var/run/docker.sock jenkins-playwright
```

| Phần lệnh | Ý nghĩa |
|-----------|---------|
| `FROM jenkins/jenkins:lts-jdk21` | Image Jenkins bản LTS (hỗ trợ dài hạn), chạy trên Java 21; tên này lấy từ tài liệu cài đặt của Jenkins. |
| `apt-get install -y docker.io` | Cài **Docker CLI** vào image để Jenkins gõ được lệnh `docker`. |
| `-d` | Chạy nền (detached). |
| `--name jenkins` | Đặt tên container để dễ gọi lại. |
| `-p 8080:8080` | Giao diện web: mở `http://localhost:8080`. |
| `-p 50000:50000` | Cổng cho agent kết nối vào; chưa cần dùng nhưng là khuyến nghị chuẩn. |
| `--restart on-failure` | Tự chạy lại nếu container thoát lỗi. |
| `-v jenkins_home:/var/jenkins_home` | Lưu dữ liệu Jenkins (job, plugin, bí mật) vào **volume**; xoá container không mất cấu hình. |
| `-v /var/run/docker.sock:/var/run/docker.sock` | Cho phép Jenkins điều khiển Docker của máy chủ chứa nó (các container test sẽ là "anh em" chứ không lồng nhau). |
| `-u root` | Chạy bằng root để Jenkins dùng được socket Docker. **Chỉ dùng cho máy học tập**; môi trường thật nên cấp quyền nhóm `docker` cho người dùng `jenkins`. |

Kết quả mong đợi: `docker ps` thấy container `jenkins` trạng thái `Up`. Trên Windows dùng PowerShell hoặc Git Bash đều được, nhưng Docker Desktop phải ở chế độ Linux containers.

Nếu gặp lỗi: `port is already allocated` nghĩa là cổng 8080 đã bị chiếm, đổi thành `-p 8081:8080` và mở `localhost:8081`. `Cannot connect to the Docker daemon` nghĩa là Docker Desktop chưa chạy.

### Bước 2. Mở khoá Jenkins lần đầu và cài plugin
Mục đích: hoàn tất trình cài đặt ban đầu.

Lấy mật khẩu quản trị lần đầu:

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Lệnh `docker exec jenkins` chạy lệnh bên trong container `jenkins`; `cat` in nội dung file chứa mật khẩu (chuỗi 32 ký tự). Bạn cũng thấy nó trong log (`docker logs jenkins`).

Mở `http://localhost:8080`, dán mật khẩu vào màn hình **Unlock Jenkins**, chọn **Install suggested plugins**, chờ cài xong, rồi tạo tài khoản quản trị. Giao diện có thể thay đổi nhẹ giữa các phiên bản.

Sau đó cài thêm ba plugin: vào **Manage Jenkins**, **Plugins**, tab **Available plugins**, tìm và tích:

| Plugin | Dùng để |
|--------|---------|
| **Docker Pipeline** | Cho phép `agent { docker { ... } }` trong `Jenkinsfile`. |
| **NodeJS** | Cài Node theo tên cấu hình (cách 2). |
| **HTML Publisher** | Bước `publishHTML` để hiện báo cáo HTML của Playwright. |

Bấm **Install** rồi khởi động lại nếu được hỏi. Plugin **JUnit** thường đã có sẵn trong bộ "suggested". Kết quả mong đợi: ba plugin hiện trong tab **Installed plugins**.

### Bước 3. Chuẩn bị project: báo cáo JUnit và biến môi trường
Mục đích: để Playwright xuất file kết quả mà Jenkins đọc được.

Mở `playwright.config.ts` và đặt reporter:

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

| Phần code | Ý nghĩa |
|-----------|---------|
| `process.env.CI` | Jenkins sẽ đặt biến `CI=true` trong `Jenkinsfile`; dùng để bật cấu hình dành cho CI. |
| `["junit", { outputFile }]` | Reporter ghi XML định dạng **JUnit** (chuẩn mà Jenkins và nhiều công cụ đọc được). Tên và tuỳ chọn `outputFile` theo tài liệu Playwright. |
| `["html", { open: "never" }]` | Tạo báo cáo HTML ở thư mục `playwright-report/` và không tự mở trình duyệt. |
| `forbidOnly`, `retries` | Cấm `test.only` lọt vào, thử lại 2 lần trên CI (xem bài 5.6 về flaky). |

Kiểm thử cục bộ trước khi đẩy lên (tác giả đã chạy thử reporter `junit` bằng cờ `--reporter=junit` và biến `PLAYWRIGHT_JUNIT_OUTPUT_FILE`, kết quả là file XML đúng định dạng):

```bash
CI=true npx playwright test
```

Trên PowerShell dùng `$env:CI="true"; npx playwright test`. Kết quả mong đợi: sinh file `results/junit.xml` bắt đầu bằng `<testsuites ... tests="..." failures="0"`. Commit file cấu hình và nhớ thêm `results/` và `playwright-report/` vào `.gitignore`.

### Bước 4. Viết `Jenkinsfile` (cách 1: image Playwright)
Mục đích: định nghĩa quy trình trong repo.

Tạo file tên đúng là `Jenkinsfile` (không đuôi) ở gốc repo:

```groovy
pipeline {
  agent {
    docker {
      image 'mcr.microsoft.com/playwright:v1.64.1-noble'
      args '--ipc=host --init'
    }
  }

  options {
    timeout(time: 30, unit: 'MINUTES')
    timestamps()
  }

  parameters {
    string(name: 'BASE_URL', defaultValue: 'http://host.docker.internal:3000', description: 'Địa chỉ site cần kiểm thử')
    string(name: 'GREP', defaultValue: '', description: 'Chỉ chạy test có tên chứa chuỗi này (để trống là chạy hết)')
  }

  triggers {
    cron('H 23 * * 1-5')
  }

  environment {
    CI = 'true'
    npm_config_cache = "${WORKSPACE}/.npm"
    API_TOKEN = credentials('playwright-api-token')
  }

  stages {
    stage('Cài thư viện') {
      steps {
        sh 'npm ci'
      }
    }
    stage('Chạy test') {
      steps {
        sh '''
          if [ -n "$GREP" ]; then
            npx playwright test --grep "$GREP"
          else
            npx playwright test
          fi
        '''
      }
    }
  }

  post {
    always {
      junit testResults: 'results/junit.xml', allowEmptyResults: false
      publishHTML(target: [
        reportDir: 'playwright-report',
        reportFiles: 'index.html',
        reportName: 'Playwright Report',
        keepAll: true,
        alwaysLinkToLastBuild: true,
        allowMissing: false
      ])
      archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
    }
    cleanup {
      cleanWs()
    }
  }
}
```

Giải thích từng khối:

| Khối | Ý nghĩa |
|------|---------|
| `agent { docker { image ... } }` | Chạy toàn bộ pipeline **bên trong container** của image Playwright. Tên và tag lấy từ tài liệu Playwright: `mcr.microsoft.com/playwright:v1.64.1-noble` (`noble` là Ubuntu 24.04). Phải khớp phiên bản `@playwright/test` của bạn (kiểm tra bằng `npx playwright --version`). |
| `args '--ipc=host --init'` | Tham số truyền cho `docker run`. Playwright khuyến nghị `--ipc=host` khi dùng Chromium (tránh hết bộ nhớ chia sẻ) và `--init` (xử lý tiến trình PID 1). |
| `options { timeout ... timestamps() }` | Dừng build nếu quá 30 phút; thêm giờ vào mỗi dòng log. |
| `parameters { string(...) }` | Khai báo tham số của build; Jenkins hiện form **Build with Parameters**. Giá trị trở thành biến môi trường (`$BASE_URL`, `$GREP`). |
| `triggers { cron('H 23 * * 1-5') }` | Chạy theo lịch: ký tự `H` (hash) để Jenkins tự chọn phút, rải đều tải. Xem bước 8. |
| `environment { ... }` | Đặt biến môi trường. `CI = 'true'` bật cấu hình CI của Playwright. `npm_config_cache` đưa cache npm vào workspace vì container chạy bằng người dùng không có thư mục home. |
| `credentials('playwright-api-token')` | Lấy **Secret text** có ID `playwright-api-token` từ kho credentials của Jenkins vào biến `API_TOKEN`; giá trị bị che thành `****` trong log. |
| `stages / stage / steps` | Chuỗi các giai đoạn; `steps` là việc cụ thể. `sh` chạy lệnh shell. |
| Khối `sh '''...'''` | Chuỗi nhiều dòng của Groovy dùng ba dấu nháy đơn; Groovy **không** nội suy biến, nên `$GREP` do shell xử lý (an toàn hơn so với ghép chuỗi). |
| `post { always { ... } }` | Chạy **sau** các stage dù thành công hay thất bại. |
| `junit` | Đọc file JUnit; Jenkins hiện số test, danh sách test hỏng và biểu đồ xu hướng. |
| `publishHTML` | Của plugin HTML Publisher: tạo liên kết "Playwright Report" ở trang job. |
| `archiveArtifacts` | Lưu file (trace, ảnh chụp) để tải về từ trang build. |
| `cleanup { cleanWs() }` | Chạy cuối cùng, dọn workspace (plugin Workspace Cleanup, thường có trong bộ suggested). |

Lưu ý quan trọng về `BASE_URL`: test chạy **trong container**, nên `localhost` là chính container đó chứ không phải máy của bạn. Với site chạy trên máy host, dùng `http://host.docker.internal:3000` (Docker Desktop hỗ trợ sẵn trên Windows và macOS; trên Linux cần thêm `--add-host=host.docker.internal:host-gateway` vào `args`). Với site công khai trên Internet thì dùng URL thật.

Kết quả mong đợi: file đã lưu; chưa chạy gì. Commit và push lên GitHub.

### Bước 5. Tạo Pipeline job trên Jenkins
Mục đích: nối Jenkins với repo.

1. Ở trang chủ Jenkins bấm **New Item**, nhập tên (ví dụ `playwright-e2e`), chọn **Pipeline**, bấm **OK**.
2. Cuộn xuống mục **Pipeline**: ở **Definition** chọn **Pipeline script from SCM**.
3. **SCM** chọn **Git**; ô **Repository URL** dán URL repo GitHub (dạng `https://github.com/ban/playwright-e2e.git`). Repo công khai không cần credentials; repo riêng cần thêm credentials (bước 6).
4. **Branch Specifier** để `*/main`.
5. **Script Path** để `Jenkinsfile`.
6. Bấm **Save**.

Kết quả mong đợi: trang của job hiện nút **Build Now**.

### Bước 6. Thêm credentials (bí mật)
Mục đích: để `credentials('playwright-api-token')` có dữ liệu.

Vào **Manage Jenkins**, **Credentials**, chọn domain **(global)**, **Add Credentials**. Ở **Kind** chọn **Secret text**, ô **Secret** nhập giá trị (với bài tập: một chuỗi bất kỳ), ô **ID** nhập `playwright-api-token`, bấm **Create**. ID phải khớp chính xác với trong `Jenkinsfile`. Kết quả mong đợi: credential xuất hiện trong danh sách; nếu thiếu, build báo lỗi dạng `Could not find credentials entry with ID 'playwright-api-token'`.

Không bao giờ ghi token vào `Jenkinsfile` hay in ra log bằng `echo`. Jenkins che giá trị bí mật nhưng không che được nếu bạn biến đổi nó (ví dụ cắt từng ký tự).

### Bước 7. Chạy build lần đầu và đọc kết quả
Mục đích: thấy pipeline chạy.

Bấm **Build Now**. Lần đầu Jenkins chỉ đọc `Jenkinsfile` để biết có tham số nên chạy với giá trị mặc định; từ lần sau nút đổi thành **Build with Parameters**. Bấm vào số build (ví dụ `#1`) ở **Build History**, rồi **Console Output** để xem log.

Những thứ nên thấy:

| Vị trí | Ý nghĩa |
|--------|---------|
| Console Output | Chuỗi `Pulling image`, `npm ci`, danh sách test (`list` reporter), cuối cùng `Finished: SUCCESS` hoặc `FAILURE`. |
| **Test Result** ở trang build | Do bước `junit`: tổng số test, test hỏng, thời gian từng test. |
| **Playwright Report** ở trang job | Do `publishHTML`: báo cáo HTML đầy đủ. |
| **Build Artifacts** | Các tệp `test-results/` đã lưu. |
| Stage View (phần Pipeline) | Mỗi stage một ô xanh hoặc đỏ. |

Cố ý làm hỏng một test rồi push để xem trang **Test Result** liệt kê test đỏ, mở báo cáo HTML để xem lỗi chi tiết.

Nếu báo cáo HTML hiện trắng hoặc mất định dạng: Jenkins mặc định áp **Content-Security-Policy** chặt, chặn script nội tuyến của báo cáo. Giải pháp an toàn là tải artifact về rồi mở bằng `npx playwright show-report`; cách nới chính sách (thuộc tính hệ thống `hudson.model.DirectoryBrowserSupport.CSP`) chỉ nên làm trên máy học tập vì tài liệu Jenkins cảnh báo rủi ro bảo mật, và ưu tiên dùng **Resource Root URL**.

### Bước 8. Tham số hoá và hẹn giờ
Mục đích: chạy theo yêu cầu và theo lịch.

Sau lần build đầu, bấm **Build with Parameters**: bạn thấy hai ô `BASE_URL` và `GREP`. Ví dụ điền `GREP` là `đăng nhập` để chỉ chạy các test có tên chứa chữ đó. Lệnh thực tế trong log là `npx playwright test --grep "đăng nhập"`.

Cú pháp `cron` của Jenkins có năm trường: phút, giờ, ngày trong tháng, tháng, thứ trong tuần (0 hoặc 7 là Chủ nhật):

| Biểu thức | Ý nghĩa |
|-----------|---------|
| `H 23 * * 1-5` | Một lần mỗi ngày từ thứ Hai đến thứ Sáu, vào giờ 23 (phút do Jenkins hash). |
| `H */4 * * *` | Mỗi 4 giờ một lần. |
| `H 2 * * 6` | 2 giờ sáng thứ Bảy. |

Giờ tính theo múi giờ của máy chủ Jenkins (trong container thường là UTC). Jenkins hỗ trợ dòng đầu `TZ=Asia/Ho_Chi_Minh` trong trường lịch; hãy bấm dấu hỏi trợ giúp trong giao diện hoặc đọc tài liệu để chắc cú pháp. Chữ `H` rải tải nên bạn **không** thể chọn đúng phút; nếu cần đúng phút, thay `H` bằng số.

Ngoài cron, Jenkins còn chạy khi có push thông qua **webhook** của GitHub hoặc **Poll SCM**; phần này nằm ngoài phạm vi bài (cần Jenkins truy cập được từ Internet).

### Bước 9. Cách 2: dùng NodeJS plugin thay cho image
Mục đích: biết phương án khi không thể dùng Docker.

Cấu hình Node: **Manage Jenkins**, **Tools**, mục **NodeJS installations**, **Add NodeJS**, đặt **Name** là `node-22`, chọn phiên bản 22 (cùng phiên bản với `.nvmrc`), tích **Install automatically**, **Save**. Tên cấu hình phải khớp `Jenkinsfile`:

```groovy
pipeline {
  agent any

  options {
    timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Chuẩn bị') {
      steps {
        nodejs(nodeJSInstallationName: 'node-22') {
          sh 'node --version'
          sh 'npm ci'
          sh 'npx playwright install --with-deps chromium'
        }
      }
    }
    stage('Chạy test') {
      steps {
        nodejs(nodeJSInstallationName: 'node-22') {
          sh 'npx playwright test'
        }
      }
    }
  }

  post {
    always {
      junit testResults: 'results/junit.xml', allowEmptyResults: true
      archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
    }
  }
}
```

| Phần | Ý nghĩa |
|------|---------|
| `agent any` | Chạy trên bất kỳ node nào còn trống (ở đây là chính controller). |
| `nodejs(nodeJSInstallationName: 'node-22') { ... }` | Cú pháp của NodeJS plugin: trong khối này `PATH` có Node đã chọn. Tên phải trùng cấu hình ở **Tools**. |
| `npx playwright install --with-deps chromium` | Cài trình duyệt **và** thư viện hệ điều hành; bước này dùng `apt` nên cần quyền root. Container Jenkins ở bước 1 chạy `-u root` nên làm được, nhưng trên Jenkins thật thường bị từ chối: đó là lý do cách 1 được khuyến nghị. |

Khi dùng cách này, ảnh hưởng của lần cài trình duyệt lặp lại mỗi build làm chậm; nên cache hoặc dùng cách 1.

### Bước 10. Khi test hỏng nhưng muốn build "không ổn định" thay vì "hỏng"
Mục đích: phân biệt `FAILURE` (pipeline lỗi) và `UNSTABLE` (test hỏng).

Mặc định lệnh `npx playwright test` thoát mã khác 0 khi có test hỏng, nên stage đỏ và build là `FAILURE`. Nếu đội muốn coi test hỏng là `UNSTABLE` (vàng) để phân biệt với lỗi hạ tầng, bao lệnh bằng `catchError`:

```groovy
stage('Chạy test') {
  steps {
    catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
      sh 'npx playwright test'
    }
  }
}
```

`catchError` bắt lỗi của khối bên trong: stage vẫn được đánh dấu `FAILURE` nhưng build chung chỉ `UNSTABLE`, và các bước `post` vẫn chạy. Chỉ nên dùng khi đội thống nhất chính sách này.

## Demo code
`Jenkinsfile` hoàn chỉnh nhỏ gọn cho một project Playwright (cách 1):

```groovy
pipeline {
  agent {
    docker {
      image 'mcr.microsoft.com/playwright:v1.64.1-noble'
      args '--ipc=host --init'
    }
  }
  options { timeout(time: 30, unit: 'MINUTES') }
  parameters {
    string(name: 'BASE_URL', defaultValue: 'https://example.com', description: 'Site cần kiểm thử')
  }
  triggers { cron('H 23 * * 1-5') }
  environment {
    CI = 'true'
    npm_config_cache = "${WORKSPACE}/.npm"
  }
  stages {
    stage('Cài thư viện') { steps { sh 'npm ci' } }
    stage('Chạy test') { steps { sh 'npx playwright test' } }
  }
  post {
    always {
      junit testResults: 'results/junit.xml', allowEmptyResults: true
      publishHTML(target: [
        reportDir: 'playwright-report', reportFiles: 'index.html',
        reportName: 'Playwright Report', keepAll: true,
        alwaysLinkToLastBuild: true, allowMissing: true
      ])
    }
  }
}
```

Đã kiểm chứng: reporter JUnit của Playwright chạy thật và sinh XML đúng. Chưa kiểm chứng: toàn bộ `Jenkinsfile` trên một Jenkins thật; cú pháp được đối chiếu với tài liệu Pipeline Syntax, trang plugin HTML Publisher và NodeJS. Bạn có thể kiểm tra cú pháp khai báo ngay trong Jenkins bằng **Pipeline Syntax** (link ở cuối trang cấu hình job) hoặc công cụ **Replay** để thử sửa mà không commit.

## Thử ngay trong lab
Site lab có sẵn mọi thứ để làm đích kiểm thử cho pipeline: chạy site ở máy bạn (hoặc dùng bản deploy công khai), đặt tham số `BASE_URL` là địa chỉ đó và chạy các test của starter repo trên `/lab/login` hoặc `/lab/cart`. Với site chạy trên máy host, nhớ dùng `host.docker.internal` như đã giải thích ở bước 4.

## Lỗi thường gặp
- **`docker: command not found` trong log của Jenkins**: image Jenkins chưa có Docker CLI hoặc chưa cài plugin Docker Pipeline. Cài `docker.io` như bước 1 và cài plugin.
- **`Got permission denied while trying to connect to the Docker daemon socket`**: người dùng `jenkins` không có quyền trên socket. Trên máy học tập chạy `-u root`; nơi khác thêm người dùng vào nhóm `docker`.
- **`Executable doesn't exist at /ms-playwright/...`**: phiên bản image khác phiên bản `@playwright/test`. Đổi tag image cho khớp `npx playwright --version`.
- **`EACCES: permission denied, mkdir '/.npm'`** hoặc lỗi ghi cache npm: container chạy bằng người dùng không có home. Đặt `npm_config_cache` vào workspace như bước 4.
- **`connect ECONNREFUSED 127.0.0.1:3000`**: `BASE_URL` là `localhost` nhưng test chạy trong container. Dùng `host.docker.internal` hoặc URL công khai.
- **`No such DSL method 'publishHTML' found`**: chưa cài plugin HTML Publisher.
- **Báo cáo HTML trắng trang**: do Content-Security-Policy của Jenkins (xem bước 7); tải artifact về mở cục bộ.
- **Tham số không hiện ở lần build đầu**: bình thường; chạy build một lần để Jenkins đọc khai báo `parameters`.
- **`Could not find credentials entry with ID ...`**: sai ID hoặc tạo credential ở domain khác.

## Tóm tắt
- Jenkins là CI tự vận hành; quy trình mô tả trong `Jenkinsfile` nằm cùng repo, khai báo theo cấu trúc `pipeline { agent, stages, post }`.
- Cách chuẩn cho Playwright là chạy trong image `mcr.microsoft.com/playwright:v<phiên bản>-noble` với `--ipc=host --init`, và phiên bản image phải khớp `@playwright/test`.
- Reporter JUnit của Playwright + bước `junit` cho kết quả test trên Jenkins; `publishHTML` cho báo cáo HTML (cần xử lý CSP).
- Bí mật đi qua `credentials('id')`, tham số qua `parameters`, lịch qua `triggers { cron(...) }` (ký tự `H` rải tải, giờ theo máy chủ).
- NodeJS plugin là phương án thay thế nhưng cần quyền cài trình duyệt và thư viện hệ điều hành.
- Luôn nói rõ với đồng đội phần nào đã chạy thật và phần nào mới đối chiếu tài liệu.

## Bài tập
1. Dựng Jenkins bằng Docker theo bước 1 và 2; xong khi bạn đăng nhập được và thấy ba plugin trong **Installed plugins**.
2. Tạo Pipeline job trỏ vào repo của bạn với `Jenkinsfile` ở cách 1; xong khi **Build Now** cho trạng thái `SUCCESS` và trang build có mục **Test Result**.
3. Cố ý làm một test hỏng, push, rồi mô tả bằng lời test nào đỏ dựa trên trang **Test Result** và báo cáo HTML (hoặc artifact); xong khi bạn chỉ ra được giá trị Expected và Received.
4. Thêm tham số `GREP` và một credential `playwright-api-token`, chạy `Build with Parameters` với `GREP` khác rỗng; xong khi log hiển thị lệnh có `--grep` và token bị che thành `****`.
5. Đổi sang cách 2 bằng NodeJS plugin, ghi lại ít nhất hai khác biệt (thời gian chạy, thao tác cấu hình, quyền cần có) so với cách 1; xong khi bạn đề xuất được cách nào hợp với công ty của mình và vì sao.
