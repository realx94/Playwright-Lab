---
title: BDD và Gherkin
level: 5
order: 3
minutes: 45
summary: Viết kịch bản Given/When/Then từ luật nghiệp vụ, nối với Playwright bằng step definition, và biết khi nào BDD đáng dùng.
keywords: [gherkin là gì, bdd là gì, given when then]
---

## Mục tiêu bài học
- Giải thích được BDD và Gherkin giải quyết vấn đề gì (hiểu nhầm yêu cầu giữa người nghiệp vụ, dev và QA).
- Viết đúng cú pháp Gherkin: `Feature`, `Background`, `Scenario`, `Scenario Outline`, `Examples`, `Given/When/Then/And/But`.
- Chuyển một luật nghiệp vụ (BR) của lab thành scenario ngắn, đúng mức trừu tượng, một hành vi mỗi scenario.
- Nối scenario với Playwright bằng step definition (dùng thư viện `playwright-bdd`) và chạy được.
- Quyết định khi nào dùng BDD, khi nào viết test Playwright thuần.

## Bạn cần chuẩn bị
- Đã học bài viết test case chuẩn (3.7) và bài từ test case đến spec (3.10).
- Biết Page Object và fixture (bài 4.1, 4.3) sẽ giúp phần step definition gọn hơn.
- Project Playwright chạy được; để thử phần 3 cần cài thêm gói `playwright-bdd` (thư viện cộng đồng, không phải của Playwright).

## Kiến thức cần nắm
- **BDD** (Behaviour Driven Development, phát triển hướng hành vi): cả nhóm cùng mô tả **hành vi mong đợi** bằng ngôn ngữ chung trước khi code.
- **Gherkin**: ngôn ngữ có cấu trúc để viết kịch bản, lưu trong tệp `.feature`.
- Từ khoá: `Feature` (tính năng), `Scenario` (kịch bản), `Given` (bối cảnh), `When` (hành động), `Then` (kết quả), `And`/`But` (nối tiếp cùng loại), `Background` (bối cảnh chung).
- `Scenario Outline` kèm `Examples`: một kịch bản, nhiều bộ dữ liệu.
- **Step definition**: đoạn code ghép mỗi câu Gherkin với thao tác thật.
- Công cụ phổ biến: Cucumber, `playwright-bdd` (chạy Gherkin trên trình chạy của Playwright).

## Giải thích dễ hiểu
Kịch bản BDD giống **bản hợp đồng viết bằng lời thường** giữa người làm nghiệp vụ, dev và QA: ai đọc cũng hiểu. Thay vì mỗi người hiểu yêu cầu "khoá tài khoản sau nhiều lần sai" một kiểu, cả nhóm cùng viết ra: "Khi tôi nhập sai mật khẩu 5 lần liên tiếp, thì tôi thấy thông báo tài khoản bị khoá". Câu đó vừa là yêu cầu, vừa là test, vừa là tài liệu sống.

Step definition là **người phiên dịch**: nó nghe câu tiếng Việt "tôi ở trang đăng nhập" và biến thành `page.goto("/lab/login")`. Tách như vậy có hai lợi ích. Người nghiệp vụ đọc và góp ý được mà không cần biết code. Một câu có thể dùng ở nhiều kịch bản nên không lặp lại code.

Ba vai trò hay được gọi là "ba người bạn" (three amigos): người nghiệp vụ nói muốn gì, dev nói làm thế nào, QA hỏi "còn trường hợp này thì sao?". Giá trị lớn nhất của BDD nằm ở buổi trao đổi đó, không nằm ở file `.feature`. Nếu cả nhóm không trao đổi, bạn chỉ có một cách viết test cầu kỳ hơn.

Cách đọc một kịch bản: `Given` là trạng thái trước khi bắt đầu (không phải hành động của bài test), `When` là một hành động chính của người dùng, `Then` là kết quả quan sát được. Giữ mỗi phần ngắn: thường 1 `When` và 1 đến 2 `Then`.

## Thực hành từng bước
Ví dụ xuyên suốt: luật của LAB-01 (Login). Mật khẩu 8 đến 32 ký tự (BR-02), sai 5 lần thì khoá (BR-03). Trang thực tế: `/lab/login`, tài khoản mẫu `user@lab.dev` mật khẩu `Passw0rd!`.

### Bước 1. Bắt đầu từ luật nghiệp vụ, tách thành hành vi
Mục đích: không viết kịch bản từ giao diện mà từ luật. Lấy BR-03 và hỏi "người dùng thấy gì, ở điều kiện nào":

| Luật | Hành vi quan sát được |
|------|----------------------|
| BR-03 Sai 5 lần khoá | Sau lần sai thứ 5, báo "bị khoá". |
| BR-02 Mật khẩu tối thiểu 8 | Mật khẩu 7 ký tự bị từ chối với thông báo "tối thiểu 8". |
| Đăng nhập đúng | Vào được dashboard. |

Kết quả mong đợi: ba hành vi, mỗi hành vi sẽ là một `Scenario`.

### Bước 2. Viết file .feature đầu tiên
Mục đích: viết thành Gherkin. Tạo `features/login.feature` (từ khoá tiếng Anh, nội dung câu tiếng Việt):

```gherkin
Feature: Đăng nhập

  Background:
    Given tôi ở trang đăng nhập

  Scenario: Đăng nhập thành công
    When tôi đăng nhập với email "user@lab.dev" và mật khẩu "Passw0rd!"
    Then tôi thấy trang tổng quan

  Scenario: Khoá tài khoản sau 5 lần nhập sai
    When tôi nhập sai mật khẩu 5 lần liên tiếp
    Then tôi thấy thông báo tài khoản bị khoá
```

| Dòng | Ý nghĩa |
|------|---------|
| `Feature` | Tên nhóm kịch bản (một tính năng). |
| `Background` | Các bước chạy trước mỗi kịch bản trong file; ở đây là mở trang đăng nhập. |
| `Scenario` | Một hành vi cần kiểm tra, có tên mô tả hành vi. |
| `Given` | Bối cảnh ban đầu. |
| `When` | Hành động chính của người dùng. |
| `Then` | Kết quả quan sát được, sẽ trở thành assertion. |

Gherkin cũng hỗ trợ từ khoá tiếng Việt: thêm dòng `# language: vi` ở đầu file rồi dùng `Tính năng`, `Bối cảnh`, `Kịch bản`, `Cho`, `Khi`, `Thì`, `Và`, `Nhưng`. Nhiều nhóm vẫn giữ từ khoá tiếng Anh vì công cụ và tài liệu quen thuộc hơn; hãy chọn cách cả nhóm thấy dễ đọc.

Kết quả mong đợi: file lưu xong, chưa chạy gì. Khi chạy ở Bước 6, nếu thiếu step bạn sẽ thấy lỗi `Missing step`. Một lỗi cú pháp thường gặp là dùng sai từ khoá hoặc để `Scenario` không có bước nào.

### Bước 3. Viết Scenario Outline cho dữ liệu biên
Mục đích: một kịch bản cho nhiều giá trị, thay cho việc copy-paste.

```gherkin
  Scenario Outline: Kiểm tra độ dài mật khẩu
    When tôi đăng nhập với email "user@lab.dev" và mật khẩu "<password>"
    Then kết quả độ dài mật khẩu là "<result>"

    Examples:
      | password | result              |
      | Pass0r!  | lỗi tối thiểu 8     |
      | Pass0rd! | không có lỗi độ dài |
```

| Phần | Ý nghĩa |
|------|---------|
| `Scenario Outline` | Kịch bản mẫu có chỗ trống. |
| `<password>`, `<result>` | Chỗ trống, tên trùng với tiêu đề cột trong bảng. |
| `Examples` | Bảng dữ liệu; mỗi hàng sinh ra một kịch bản chạy riêng. |

Dữ liệu ở đây là biên 7 và 8 ký tự theo kỹ thuật BVA (bài 3.3): `Pass0r!` có 7 ký tự, `Pass0rd!` có 8.

### Bước 4. Cài playwright-bdd và cấu hình
Mục đích: chạy được file `.feature` trên Playwright. `playwright-bdd` là thư viện cộng đồng; cú pháp có thể đổi giữa các phiên bản, hãy đối chiếu tài liệu của nó nếu lệnh dưới đây khác.

```bash
npm i -D playwright-bdd
```

| Phần | Ý nghĩa |
|------|---------|
| `npm i -D` | Cài thành devDependency (chỉ dùng khi phát triển/test). |
| `playwright-bdd` | Đọc `.feature`, sinh ra file spec Playwright, rồi để Playwright chạy. |

Sửa `playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const testDir = defineBddConfig({
  features: "features/*.feature",
  steps: "steps/*.ts",
});

export default defineConfig({
  testDir,
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:3000" },
});
```

| Phần | Ý nghĩa |
|------|---------|
| `features` | Mẫu đường dẫn tới file `.feature`. |
| `steps` | Nơi chứa step definition. |
| `testDir = defineBddConfig(...)` | Hàm trả về thư mục chứa spec được sinh ra; Playwright chạy các spec đó. |

### Bước 5. Viết step definition
Mục đích: dạy máy hiểu từng câu. Tạo `steps/login.steps.ts`:

```ts
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("tôi ở trang đăng nhập", async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByTestId("reset-data").click(); // đưa lab về trạng thái sạch
});

When("tôi đăng nhập với email {string} và mật khẩu {string}", async ({ page }, email: string, password: string) => {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
});

When("tôi nhập sai mật khẩu {int} lần liên tiếp", async ({ page }, times: number) => {
  for (let i = 0; i < times; i++) {
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByLabel("Mật khẩu").fill("Wrong123!");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
  }
});

Then("tôi thấy trang tổng quan", async ({ page }) => {
  await expect(page.getByTestId("dashboard")).toBeVisible();
});

Then("tôi thấy thông báo tài khoản bị khoá", async ({ page }) => {
  await expect(page.getByTestId("form-error")).toContainText("bị khoá");
});

Then("kết quả độ dài mật khẩu là {string}", async ({ page }, result: string) => {
  const error = page.getByTestId("password-error");
  if (result.startsWith("lỗi")) await expect(error).toContainText("tối thiểu 8");
  else await expect(error).toHaveCount(0);
});
```

| Phần | Ý nghĩa |
|------|---------|
| `createBdd()` | Tạo các hàm `Given`, `When`, `Then` gắn với runner của Playwright. |
| Chuỗi đầu tiên | **Cucumber expression** khớp với câu trong `.feature`. |
| `{string}` | Khớp chuỗi trong dấu nháy kép; giá trị truyền vào tham số tiếp theo. |
| `{int}` | Khớp số nguyên. |
| `{ page }` | Fixture của Playwright, giống test bình thường. |
| Locator | Lấy từ spec thật của lab: nhãn `Email`, `Mật khẩu`, nút `Đăng nhập`, các `data-testid` `dashboard`, `form-error`, `password-error`, `reset-data`. |

Nhớ rằng một step definition ứng với mọi câu khớp mẫu; bạn viết một lần, dùng cho nhiều kịch bản. Hãy cố giữ số step ít và có ý nghĩa nghiệp vụ.

### Bước 6. Sinh spec và chạy
Mục đích: dịch `.feature` ra spec rồi chạy.

```bash
npx bddgen
npx playwright test
```

| Lệnh | Ý nghĩa |
|------|---------|
| `npx bddgen` | Sinh file spec trong thư mục `.features-gen` (tên mặc định) từ các `.feature` và step. Phải chạy lại mỗi khi đổi `.feature`. |
| `npx playwright test` | Chạy spec đã sinh như test bình thường (có trace, báo cáo, song song). |

Kết quả mong đợi: danh sách có tên kịch bản (ví dụ `Đăng nhập thành công`), cuối cùng `4 passed`. Thư mục sinh ra nên được đưa vào `.gitignore`.

Nếu gặp lỗi `Missing step: ...`: câu trong `.feature` không khớp step nào; so từng chữ, đặc biệt dấu nháy và khoảng trắng. Nếu thấy `Duplicate step`: hai step cùng mẫu, gộp lại.

## Demo code
Ngoài thư viện BDD, hãy luôn biết viết cùng hành vi bằng Playwright thuần để so sánh chi phí. Cùng một kịch bản "khoá sau 5 lần sai":

```ts
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByTestId("reset-data").click();
});

test("khoá tài khoản sau 5 lần nhập sai", async ({ page }) => {
  for (let i = 0; i < 5; i++) {
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByLabel("Mật khẩu").fill("Wrong123!");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
  }
  await expect(page.getByTestId("form-error")).toContainText("bị khoá");
});
```

Test này ngắn hơn, nhưng nhiều người đọc nghiệp vụ không đọc được code TypeScript. BDD đánh đổi thêm một lớp (file `.feature` và step) để lấy khả năng đọc chung. Vì vậy, quyết định dựa trên việc có người nghiệp vụ thực sự đọc và góp ý hay không.

## Best practice
1. Viết theo **hành vi người dùng và ngôn ngữ nghiệp vụ**, không viết thao tác giao diện ("bấm nút #btn-3"). Tốt: "tôi gửi yêu cầu nghỉ phép 2 ngày". Chưa tốt: "tôi nhập 2 vào ô số ngày và bấm nút thứ hai".
2. Mỗi scenario kiểm tra **một hành vi**; khoảng 3 đến 7 bước.
3. Tái sử dụng step; tránh tạo hàng trăm câu gần giống ("tôi nhập mật khẩu sai", "tôi gõ sai mật khẩu").
4. Dữ liệu quan trọng nằm trong câu hoặc bảng `Examples` để người đọc thấy ngay.
5. Có người nghiệp vụ tham gia viết; nếu chỉ QA tự viết rồi tự đọc thì BDD chỉ thêm chi phí.
6. Đừng nhồi chi tiết kỹ thuật vào `.feature`: locator, URL, chờ đợi đều nằm trong step definition hoặc Page Object.

## Khi nào không nên dùng BDD
Nhóm không có người nghiệp vụ cùng tham gia, hoặc chỉ cần test kỹ thuật (API, tích hợp, hiệu năng). Khi đó viết test Playwright thuần với Page Object sẽ gọn và dễ bảo trì hơn. BDD cũng không thay thế phân tích thiết kế test (EP, BVA, bảng quyết định): nó chỉ là cách trình bày.

## Lỗi thường gặp
- Triệu chứng: kịch bản dài 20 bước như hướng dẫn thao tác. Nguyên nhân: viết theo giao diện thay vì hành vi. Cách sửa: gộp bước thành câu nghiệp vụ, đưa chi tiết vào step.
- Triệu chứng: `Undefined step` hoặc `Missing step`. Nguyên nhân: câu không khớp mẫu của step. Cách sửa: so khớp chính xác, dùng `{string}`, `{int}` cho phần thay đổi.
- Triệu chứng: có 300 step gần giống nhau, không ai nhớ step nào đã có. Nguyên nhân: mỗi người tự viết câu riêng. Cách sửa: thống nhất từ vựng, rà soát step định kỳ.
- Triệu chứng: đổi `.feature` mà test không đổi. Nguyên nhân: chưa chạy lại `npx bddgen`. Cách sửa: chạy `bddgen` trước `playwright test` (nên gộp vào một script npm).
- Triệu chứng: `Scenario Outline` không thay giá trị, hiện nguyên `<password>`. Nguyên nhân: tên cột trong `Examples` khác tên trong dấu `<>`. Cách sửa: sửa cho trùng.
- Triệu chứng: dùng BDD chỉ vì "nghe chuyên nghiệp", nhưng không ai đọc `.feature`. Nguyên nhân: không có người nghiệp vụ tham gia. Cách sửa: quay lại test Playwright thuần.

## Tóm tắt
- BDD là cách cả nhóm thống nhất hành vi mong đợi trước khi code; giá trị nằm ở cuộc trao đổi.
- Gherkin: `Feature`, `Scenario`, `Given/When/Then`, `Background`, `Scenario Outline` kèm `Examples`.
- Step definition ghép câu Gherkin với code Playwright; `{string}` và `{int}` nhận tham số.
- Viết theo hành vi nghiệp vụ, một hành vi mỗi scenario, tái sử dụng step.
- Cần có người nghiệp vụ cùng viết, nếu không thì Playwright thuần là lựa chọn tốt hơn.

## Bài tập
1. Dễ: Viết một scenario Gherkin (chưa cần code) cho luật huỷ đơn hàng ở LAB-03: huỷ được khi đơn chưa giao, bị chặn khi đang giao. Xong khi đọc to lên người không biết code vẫn hiểu.
2. Viết một `Scenario Outline` cho biên tuổi 17, 18, 65, 66 ở LAB-02 (hoặc biên mật khẩu ở LAB-01). Xong khi bảng `Examples` có đủ hàng biên kèm kết quả mong đợi.
3. Rà soát scenario của bạn: gạch những bước nói về giao diện thay vì hành vi và viết lại. Xong khi không còn tên locator, ID hay toạ độ trong file `.feature`.
4. Cài `playwright-bdd`, viết step definition cho scenario "Khoá tài khoản" ở trên và chạy xanh. Xong khi `npx bddgen` rồi `npx playwright test` cho kết quả `passed`.
5. Nâng cao: bật `?bugs=BUG-02` của LAB-01 (khoá sau 6 lần thay vì 5) để chứng minh scenario của bạn bắt được lỗi. Xong khi scenario đỏ lúc bật bug và xanh lúc tắt.
