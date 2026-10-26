---
title: Capstone và chuẩn bị phỏng vấn
level: 5
order: 8
minutes: 120
summary: Kế hoạch từng bước xây framework hoàn chỉnh trên một lab, cách tự chấm bằng checklist, và cách luyện trả lời phỏng vấn (kèm chỉ dẫn tới ngân hàng câu hỏi của site).
keywords: [playwright interview questions, xây dựng test framework, capstone project]
---

## Mục tiêu bài học
- Hoàn thành một dự án tổng hợp: từ phân tích BR, thiết kế test, đến framework Playwright có CI, và tự chấm theo tiêu chí rõ ràng.
- Tạo được sản phẩm để đưa vào hồ sơ: một repo có README, lịch sử commit sạch, báo cáo chạy xanh, và bằng chứng bắt được bug.
- Dùng bộ câu hỏi phỏng vấn của site đúng cách: không học thuộc mà luyện trả lời gắn với dự án của chính bạn.
- Chuẩn bị được ba loại nội dung phỏng vấn: câu hỏi kiến thức, bài tập thực hành trực tiếp (live coding), và câu hỏi tình huống.

## Bạn cần chuẩn bị
- Đã học các bài từ Level 0 đến 5.7, đặc biệt: locator (2.5, 2.6), assertion (2.8), POM và fixture (4.1 đến 4.3), data-driven (4.5), API (4.7), CI (5.1), flaky (5.6).
- Môi trường Node và Playwright chạy được; tài khoản GitHub; một lab của site chạy được (`http://localhost:3000` hoặc địa chỉ đã triển khai).
- Quỹ thời gian: capstone thường mất 10 đến 20 giờ làm thật; chia thành nhiều buổi.

## Kiến thức cần nắm
- Capstone là **dự án nhỏ nhưng đầy đủ vòng đời**: phân tích, thiết kế, tự động hoá, ổn định hoá, CI, tài liệu.
- Tiêu chí hoàn thành phải **kiểm chứng được** bằng lệnh hoặc bằng chứng, không dựa cảm giác.
- Phỏng vấn đánh giá ba thứ: kiến thức nền, cách tư duy, và khả năng làm thật. Capstone là bằng chứng cho cả ba.
- **STAR** (Situation, Task, Action, Result): khung kể một tình huống thật khi bị hỏi "hãy kể về một lần bạn...".

## Giải thích dễ hiểu
Học từng bài giống học từng món ăn riêng lẻ. Capstone giống **nấu cả một bữa tiệc**: bạn phải lên thực đơn (phân tích), mua nguyên liệu (dữ liệu test), chia việc trong bếp (Page Object, fixture), nếm thử (chạy nhiều lần cho ổn định) và dọn ra bàn (CI, báo cáo, README). Chỉ khi nấu cả bữa bạn mới thấy mối liên hệ giữa các kỹ năng, ví dụ: thiết kế test tốt làm bộ test ít mà bắt được nhiều bug; POM tốt làm sửa giao diện không phải sửa trăm test.

Với phỏng vấn, nhà tuyển dụng hiếm khi muốn nghe định nghĩa thuộc lòng. Họ muốn biết bạn **đã làm** gì và **hiểu** vì sao. Một câu trả lời kiểu "Ở dự án giỏ hàng mình dùng bảng quyết định cho mã giảm giá và bắt được lỗi giảm quá trần" mạnh hơn mười câu định nghĩa. Vì vậy capstone vừa là bài luyện tay, vừa là kho chuyện để kể.

Kinh nghiệm: chọn dự án nhỏ hơn nhưng **hoàn chỉnh** thay vì dự án lớn bỏ dở. Một lab làm tới nơi tới chốn có giá trị hơn năm lab làm nửa chừng.

## Thực hành từng bước
Ví dụ xuyên suốt: LAB-03 Giỏ hàng & Checkout (`/lab/cart`, trang đề bài ở `/labs/cart`). Bạn có thể chọn lab khác, nhưng nên chọn lab có luật tính toán và trạng thái (giỏ hàng, ngân hàng, đặt vé) vì chúng cho nhiều chất liệu thiết kế test.

### Bước 1. Tạo repo và chốt phạm vi
Mục đích: có chỗ để làm việc và một ranh giới rõ.

```bash
mkdir cart-test-framework
cd cart-test-framework
git init
npm init -y
npm i -D @playwright/test typescript dotenv @types/node
npx playwright install chromium
```

| Lệnh | Ý nghĩa |
|------|---------|
| `mkdir` rồi `cd` | Tạo và vào thư mục dự án. |
| `git init` | Khởi tạo kho Git để commit từng phần việc nhỏ. |
| `npm init -y` | Tạo `package.json` mặc định. |
| `npm i -D ...` | Cài thư viện cần cho dev: Playwright Test, TypeScript, `dotenv` đọc file `.env`, kiểu cho Node. |
| `npx playwright install chromium` | Tải trình duyệt Chromium. |

Có thể thay các bước này bằng cách sao chép `starter-repo/` của site (đã có sẵn cấu hình, `pages/`, `fixtures/`) nếu bạn thấy nhanh hơn. Viết ngay vào README đoạn "Phạm vi": lab nào, BR nào được kiểm thử, cái gì nằm ngoài phạm vi.

Kết quả mong đợi: thư mục có `package.json`, `node_modules/`, kho Git rỗng. Commit đầu tiên: `git add . && git commit -m "chore: khởi tạo project"` (nhớ tạo `.gitignore` có `node_modules/`, `playwright-report/`, `test-results/`, `.env`).

### Bước 2. Phân tích yêu cầu: liệt kê BR, điểm mơ hồ và giả định
Mục đích: không viết test khi chưa hiểu luật (bài 3.1). Đọc đề ở `/labs/cart` và lập bảng:

| Mã | Luật | Điểm mơ hồ cần làm rõ | Giả định tạm |
|----|------|------------------------|--------------|
| BR-01 | Mỗi sản phẩm tối đa 10 và không vượt tồn kho | Vượt thì chặn hay báo lỗi? | Chặn thêm và báo lỗi |
| BR-02 | SALE10 giảm 10 phần trăm, đơn từ 500.000, tối đa giảm 100.000 | Đúng 500.000 có được giảm không? | Có (từ 500.000) |
| BR-03 | Ship miễn phí khi tạm tính sau giảm từ 1.000.000, ngược lại 30.000 | Tính trước hay sau giảm giá? | Sau giảm giá |
| BR-04 | VAT 8 phần trăm tính sau giảm, làm tròn đến đồng | Làm tròn lên hay xuống? | Làm tròn thường |
| BR-05 | Hết hàng thì không thêm được | - | - |
| BR-06 | Trạng thái đơn: Mới, Đã thanh toán, Đang giao, Hoàn tất; huỷ chỉ khi chưa giao | Huỷ từ trạng thái nào? | Chưa giao |

Kết quả mong đợi: file `docs/analysis.md` có bảng này và danh sách câu hỏi cho "người nghiệp vụ" (ở dự án thật bạn hỏi; ở lab bạn kiểm chứng bằng cách thử và đọc `/labs/cart`).

### Bước 3. Thiết kế tối thiểu 30 test case có kỹ thuật và ma trận BR x TC
Mục đích: bộ test ít mà phủ rộng. Dùng các kỹ thuật: phân vùng tương đương, giá trị biên, bảng quyết định, chuyển trạng thái (bài 3.2 đến 3.5).

Ví dụ phần giảm giá và phí ship. Với sản phẩm giá 250.000 (mã `p2` trên lab), số lượng tăng dần cho các biên quan trọng, đã đo trên lab:

| Số lượng | Tạm tính | Giảm giá SALE10 | Ship | VAT 8 phần trăm | Tổng |
|----------|---------|------------------|------|-----------------|------|
| 1 | 250.000 | 0 (dưới 500.000) | 30.000 | 20.000 | 300.000 |
| 2 | 500.000 | 50.000 (đúng biên) | 30.000 | 36.000 | 516.000 |
| 3 | 750.000 | 75.000 | 30.000 | 54.000 | 759.000 |
| 4 | 1.000.000 | 100.000 (chạm trần) | 30.000 | 72.000 | 1.002.000 |

Quan sát đáng giá cho bảng quyết định: ở 4 sản phẩm, tạm tính đúng 1.000.000 nhưng **sau giảm** chỉ còn 900.000 nên vẫn tính ship 30.000, đúng BR-03 (ship xét sau giảm giá). Đây là loại ca mà người mới dễ viết sai kỳ vọng.

Ma trận phủ BR x TC (rút gọn):

| TC | Mô tả | BR-01 | BR-02 | BR-03 | BR-04 | BR-06 |
|----|-------|:-----:|:-----:|:-----:|:-----:|:-----:|
| TC-01 | 1 sản phẩm, không mã | | | X | X | |
| TC-02 | Đúng biên 500.000 với SALE10 | | X | X | X | |
| TC-03 | Dưới ngưỡng, SALE10 bị từ chối | | X | | | |
| TC-04 | Chạm trần giảm 100.000 | | X | X | X | |
| TC-05 | Huỷ đơn đang giao bị chặn | | | | | X |

Kết quả mong đợi: file `docs/test-cases.md` (hoặc bảng tính) có từ 30 test case, mỗi ca ghi kỹ thuật dùng và BR liên quan; ma trận cho thấy mọi BR có ít nhất một TC. Tìm các hàng BR chưa có dấu X để bổ sung.

### Bước 4. Dựng khung kiến trúc: config, `.env`, nhiều project
Mục đích: cấu hình sạch ngay từ đầu. Tạo `.env`:

```text
BASE_URL=http://localhost:3000
```

Tạo `.env.example` cùng nội dung (để commit; còn `.env` thì không). Tạo `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
});
```

| Khoá | Ý nghĩa |
|------|---------|
| `dotenv.config()` | Nạp biến từ `.env` vào `process.env`. |
| `fullyParallel` | Chạy song song cả các test trong cùng file (đòi hỏi test độc lập). |
| `forbidOnly` | Trên CI, `test.only` bị coi là lỗi. |
| `retries` | Trên CI thử lại tối đa 2 lần (để phát hiện flaky; xem bài 5.6). |
| `trace: "on-first-retry"` | Ghi trace khi test được chạy lại. |
| `projects` | Hai cấu hình chạy: máy tính, và điện thoại chỉ cho test gắn thẻ `@mobile`. |
| `grep: /@mobile/` | Project `mobile` chỉ chạy test có thẻ này. |

Kết quả mong đợi: `npx playwright test --list` liệt kê được test (khi đã có test). Nếu `Cannot find module 'dotenv'`: chạy lại `npm i -D dotenv`.

### Bước 5. Page Object và custom fixture
Mục đích: tập trung locator và hành động nghiệp vụ vào một nơi (bài 4.1 đến 4.3). Tạo `pages/CartPage.ts`:

```ts
import { expect, type Page } from "@playwright/test";

export class CartPage {
  constructor(private readonly page: Page) {}

  async goto(query = "") {
    await this.page.goto("/lab/cart" + query);
    await this.page.getByTestId("reset-data").click();
  }

  async addProduct(id: string, quantity = 1) {
    const card = this.page.getByTestId(`product-${id}`);
    await card.getByRole("button", { name: "Thêm vào giỏ" }).click();
    for (let i = 1; i < quantity; i++) await card.getByRole("button", { name: /^Tăng/ }).click();
  }

  async applyCoupon(code: string) {
    await this.page.getByLabel("Mã giảm giá").fill(code);
    await this.page.getByRole("button", { name: "Áp dụng" }).click();
  }

  /** Đọc một dòng tiền theo data-testid và trả về số nguyên (đồng). */
  async amount(testId: "subtotal" | "discount" | "shipping" | "vat" | "total") {
    const text = await this.page.getByTestId(testId).innerText();
    return Number(text.replace(/[^\d-]/g, "")) || 0; // `|| 0` biến -0 thành 0
  }

  async expectAmount(testId: "subtotal" | "discount" | "shipping" | "vat" | "total", expected: number) {
    await expect.poll(() => this.amount(testId), { message: testId }).toBe(expected);
  }
}
```

| Phần | Ý nghĩa |
|------|---------|
| `constructor(private readonly page)` | Nhận `page` và lưu thành thuộc tính. |
| `goto` | Mở lab và bấm Reset để luôn từ trạng thái sạch. |
| `addProduct` | Thêm sản phẩm, bấm Tăng thêm để đạt số lượng mong muốn. |
| `amount` | Chuyển chuỗi tiền định dạng thành số. Regex `[^\d-]` bỏ mọi ký tự không phải chữ số hay dấu trừ. |
| `expectAmount` | Dùng `expect.poll` để tự chờ đến khi số đúng, tránh đọc quá sớm (bài 5.6). |

Tạo `fixtures/index.ts`:

```ts
import { test as base, expect } from "@playwright/test";
import { CartPage } from "../pages/CartPage";

export const test = base.extend<{ cartPage: CartPage }>({
  cartPage: async ({ page }, use) => {
    const cart = new CartPage(page);
    await cart.goto();
    await use(cart);
  },
});

export { expect };
```

Kết quả mong đợi: một test chỉ cần `import { test } from "../fixtures"` rồi nhận `cartPage` đã mở sẵn trang sạch. Nếu `tsc` báo lỗi đường dẫn: kiểm tra `./` và `../` đúng cấp thư mục.

### Bước 6. Viết test data-driven từ bảng quyết định
Mục đích: biến bảng ở Bước 3 thành test, mỗi dòng một test, dữ liệu tách khỏi logic (bài 4.5). Tạo `tests/pricing.spec.ts`:

```ts
import { test } from "../fixtures";

const cases = [
  { qty: 1, discount: 0, shipping: 30_000, vat: 20_000, total: 300_000 },
  { qty: 2, discount: -50_000, shipping: 30_000, vat: 36_000, total: 516_000 },
  { qty: 3, discount: -75_000, shipping: 30_000, vat: 54_000, total: 759_000 },
  { qty: 4, discount: -100_000, shipping: 30_000, vat: 72_000, total: 1_002_000 },
];

for (const c of cases) {
  test(`giá sản phẩm 250.000 x ${c.qty} với SALE10 (BR-02, BR-03, BR-04)`, async ({ cartPage }) => {
    await cartPage.addProduct("p2", c.qty);
    await cartPage.applyCoupon("SALE10");

    await cartPage.expectAmount("discount", c.discount);
    await cartPage.expectAmount("shipping", c.shipping);
    await cartPage.expectAmount("vat", c.vat);
    await cartPage.expectAmount("total", c.total);
  });
}
```

Lưu ý: ở số lượng 1 lab hiển thị giảm giá là `-0`, và `Number("-0")` cho ra `-0`. Assertion của Playwright so sánh bằng `Object.is`, nên `-0` khác `0` và bạn sẽ thấy `Expected: 0 Received: -0`. Dòng `|| 0` trong hàm `amount` ở Bước 5 xử lý việc đó: `-0` là giá trị "falsy" nên `|| 0` đổi nó thành `0`. Đây là ví dụ thật cho việc dữ liệu đo cần chuẩn hoá ở một chỗ.

Kết quả mong đợi: chạy `npx playwright test pricing` thấy 4 test xanh. Mỗi dòng bảng quyết định là một test có tên nêu BR.

### Bước 7. Thêm test bắt bug bằng ?bugs= và kết hợp UI với API
Mục đích: chứng minh bộ test có giá trị. Với mỗi bug gợi ý của lab (làm tròn VAT sai, giảm giá vượt trần, huỷ được đơn đang giao), viết test **đỏ khi bật bug và xanh khi tắt**:

```ts
import { test, expect } from "../fixtures";

test("giảm giá không vượt trần 100.000 (BR-02)", async ({ cartPage }) => {
  await cartPage.addProduct("p3");           // 3.200.000
  await cartPage.applyCoupon("SALE10");
  await cartPage.expectAmount("discount", -100_000);
});

test("minh hoạ: bật BUG-02 thì giảm giá không còn bị chặn ở 100.000", async ({ page }) => {
  // Chứng minh bug có thật: khi bật, giá trị thực tế khác kỳ vọng của BR-02
  await page.goto("/lab/cart?bugs=BUG-02");
  await page.getByTestId("reset-data").click();
  await page.getByTestId("product-p3").getByRole("button", { name: "Thêm vào giỏ" }).click();
  await page.getByLabel("Mã giảm giá").fill("SALE10");
  await page.getByRole("button", { name: "Áp dụng" }).click();
  await expect(page.getByTestId("discount")).not.toHaveText(/100\.000/);
});
```

Cách chứng minh chính thức nhất: chạy bộ test chính hai lần.

```bash
npx playwright test
LAB_BUGS=BUG-02 npx playwright test pricing
```

Trong PowerShell: `$env:LAB_BUGS="BUG-02"; npx playwright test pricing`. Để biến này có tác dụng, cấu hình cần đọc `LAB_BUGS` và đặt cookie `lab_bugs` như `playwright.config.ts` của starter repo (bạn có thể sao chép đoạn `storageState` trong file đó). Kết quả mong đợi: lần đầu xanh; lần hai đỏ đúng test về trần giảm giá.

Để có "UI + API kết hợp" (bài 4.7, 4.8): dùng API của lab khác để tạo dữ liệu nhanh rồi kiểm tra UI, ví dụ ở `/lab/orders` tạo đơn bằng `request.post("/api/lab/orders", { headers: { Authorization: "Bearer admin-token" }, data: {...} })` rồi mở trang và kiểm tra dòng đơn hiện ra. Nếu lab bạn chọn không có API, dùng `page.route` để mock phản hồi tồn kho và kiểm tra giao diện hết hàng.

### Bước 8. Kiểm tra ổn định: chạy lặp nhiều lần
Mục đích: chắc chắn bộ test không flaky (bài 5.6).

```bash
npx playwright test --repeat-each=10
```

| Phần | Ý nghĩa |
|------|---------|
| `--repeat-each=10` | Chạy mỗi test 10 lần. Cả bộ phải xanh 10 lần liên tiếp. |

Kết quả mong đợi: dòng cuối `N passed` với N bằng số test nhân 10 và không có `flaky`. Nếu có test đỏ lúc có lúc không, áp dụng quy trình điều tra của bài 5.6 và sửa gốc, không tăng retry.

### Bước 9. Thêm CI bằng GitHub Actions
Mục đích: mỗi push chạy test tự động và lưu báo cáo (bài 5.1). Tạo `.github/workflows/playwright.yml` dựa trên file ở `starter-repo/.github/workflows/e2e.yml`. Lưu ý: CI cần một địa chỉ site lab mà runner truy cập được (một site đã triển khai), đặt trong Variables dưới tên `BASE_URL`. Nếu site chỉ chạy ở máy bạn, CI không thể gọi tới nó; khi đó hoặc triển khai site, hoặc cho CI tự khởi chạy site (checkout repo site và chạy server) là việc nâng cao.

Kết quả mong đợi: tab Actions có dấu tích xanh, artifact `playwright-report` tải về mở được bằng `npx playwright show-report`.

### Bước 10. Viết README và tự chấm điểm
Mục đích: người khác (nhà tuyển dụng) clone về chạy được trong 5 phút. README nên có các phần:

1. Giới thiệu: dự án làm gì, test cho lab nào.
2. Cài đặt: các lệnh `npm ci`, `npx playwright install`, cách tạo `.env` từ `.env.example`.
3. Cách chạy: `npx playwright test`, chạy một file, chạy UI mode, xem báo cáo.
4. Cấu trúc thư mục và quy ước (đặt tên test, thẻ, nơi để locator).
5. Tài liệu thiết kế: link tới `docs/analysis.md`, `docs/test-cases.md`, ma trận BR x TC.
6. Kết quả: ảnh chụp báo cáo, danh sách bug bắt được (kèm test tương ứng).
7. CI: huy hiệu trạng thái hoặc đường dẫn tới workflow.

Kết quả mong đợi: một người mới đọc xong có thể chạy được. Thử bằng cách clone sang thư mục khác và làm theo đúng README; mọi chỗ bạn phải đoán là chỗ README còn thiếu.

## Demo code
Bảng tiêu chí hoàn thành (dùng để tự chấm, mỗi mục kiểm chứng được):

| Hạng mục | Tiêu chí hoàn thành | Cách kiểm chứng |
|----------|---------------------|-----------------|
| Phân tích | Danh sách BR, điểm mơ hồ và giả định | File `docs/analysis.md` |
| Thiết kế test | Từ 30 test case có kỹ thuật (EP, BVA, bảng quyết định, trạng thái) và ma trận BR x TC | Mỗi BR có ít nhất một TC |
| Kiến trúc | Page Object, custom fixture, `.env`, nhiều project | Đọc cấu trúc thư mục |
| Test | UI và API kết hợp; data-driven; có test bắt bug bật bằng `?bugs=` | `LAB_BUGS=... npx playwright test` đỏ đúng test |
| Ổn định | Xanh 10 lần liên tiếp | `npx playwright test --repeat-each=10` |
| CI | Workflow chạy mỗi push, upload báo cáo và trace | Tab Actions xanh, có artifact |
| Tài liệu | README: cài, chạy, cấu trúc, quy ước | Người khác chạy được theo README |

Checklist tự đánh giá chất lượng:
- Mỗi test độc lập, chạy được riêng lẻ và song song.
- Không còn `waitForTimeout`; không còn locator dựa vào vị trí (`nth`, CSS dài).
- Mọi BR đều có ít nhất một test; mỗi test ghi rõ BR trong tên hoặc chú thích.
- Bắt được các bug của lab khi bật bằng `?bugs=` (ba bug cho lab giỏ hàng).
- Lịch sử commit gọn, mỗi commit một phần việc, thông điệp rõ ràng (ví dụ `feat(test): thêm test giá và mã giảm`).

Gợi ý kế hoạch theo tuần nếu làm song song với việc khác:

| Tuần | Việc |
|------|------|
| 1 | Bước 1 đến 3: repo, phân tích, thiết kế test và ma trận |
| 2 | Bước 4 đến 6: cấu hình, POM, fixture, test data-driven |
| 3 | Bước 7 đến 8: bắt bug, UI + API, chạy lặp cho ổn định |
| 4 | Bước 9 đến 10: CI, README, tự chấm, luyện phỏng vấn |

## Chuẩn bị phỏng vấn
Site có sẵn ngân hàng câu hỏi tại trang `/interview` (nguồn `src/content/interview.ts`) gồm 24 câu theo chủ đề: Tổng quan, Cài đặt và cấu trúc, Browser/context/page, Locator, Chờ và ổn định, POM và fixture, API, CI/CD, Tư duy kiểm thử. Mỗi câu có **đáp án ngắn** (nói trước, dưới 30 giây) và **phần đào sâu** (ghi điểm). Bài này không chép lại các câu đó; hãy mở trang `/interview` và luyện từng câu.

Cách luyện hiệu quả:
1. Với mỗi câu trên `/interview`, tự trả lời thành tiếng **không nhìn đáp án**, tối đa 90 giây, rồi so với đáp án ngắn và phần đào sâu.
2. **Gắn mỗi câu với một việc bạn đã làm trong capstone**. Ví dụ câu về flaky: "Ở bộ test giỏ hàng mình chạy `--repeat-each=10` và phát hiện một test đọc giá trị quá sớm; mình đổi sang `expect.poll`".
3. Ghi âm hoặc nhờ bạn đóng vai nhà tuyển dụng, hỏi thêm "tại sao" và "nếu... thì sao".

### Ba nhóm câu hỏi ngoài ngân hàng câu hỏi
Nhóm 1: câu hỏi hướng framework (các câu này không có trong `/interview`, hãy chuẩn bị):
- Bạn tổ chức framework cho 500 test thế nào (cấu trúc thư mục, quy ước tên, thẻ để chạy chọn lọc, chia shard)?
- Bạn quản lý dữ liệu test ra sao (dữ liệu riêng cho từng test, seed, dọn dẹp, tránh dùng chung)?
- Test chạy xanh ở máy nhưng đỏ ở CI: bạn xử lý từng bước thế nào? (gợi ý: xem artifact, trace, so sánh môi trường)
- Kim tự tháp test: E2E nên chiếm bao nhiêu và vì sao không nên test mọi thứ qua giao diện?
- Bạn đo hiệu quả của bộ test thế nào (tỉ lệ flaky, thời gian chạy, số bug bắt được, bug lọt)?

Nhóm 2: bài thực hành trực tiếp (live coding). Nhà tuyển dụng đưa một trang và yêu cầu viết test trong 30 đến 45 phút. Luyện bằng cách đặt đồng hồ và làm các việc sau trên lab chưa từng thấy:
1. Điền form và kiểm tra thông báo lỗi (ví dụ `/lab/forms`).
2. Đọc bảng, sắp xếp, lọc và kiểm tra dữ liệu (ví dụ `/lab/table`).
3. Test luồng có hai vai trò hoặc hai tab (ví dụ `/lab/leave`).
4. Gọi API và kiểm tra mã trạng thái (ví dụ `/lab/api`).
Mẹo: nói to suy nghĩ khi làm; bắt đầu bằng test đường vui, sau đó mới thêm biên; dùng `npx playwright codegen` để lấy locator nhanh nhưng luôn rà lại cho hướng người dùng.

Nhóm 3: câu hỏi tình huống và hành vi. Dùng khung STAR:

| Chữ | Nội dung | Ví dụ ngắn |
|-----|----------|-----------|
| Situation | Bối cảnh | Bộ test giỏ hàng có 2 test lúc xanh lúc đỏ |
| Task | Nhiệm vụ | Làm cho CI đáng tin trước đợt phát hành |
| Action | Việc bạn làm | Chạy `--repeat-each`, xem trace, đổi sang web-first assertion |
| Result | Kết quả đo được | 10 lần liên tiếp xanh, thời gian chạy giảm 20 giây |

Câu hỏi thường gặp: kể một bug bạn tìm được bằng kỹ thuật biên hoặc bảng quyết định; kể một lần bạn không đồng ý với dev về một bug; bạn làm gì khi không đủ thời gian test mọi thứ; khi nào bạn quyết định không automate.

### Cách trả lời tốt
1. Trả lời **ngắn trước**, ví dụ sau.
2. Gắn với **trải nghiệm thật**: "Ở lab giỏ hàng, mình dùng bảng quyết định để...".
3. Nói rõ **đánh đổi**, không nói tuyệt đối ("tuỳ ngữ cảnh, vì...").
4. Biết nói "mình chưa gặp, nhưng sẽ tiếp cận bằng cách...".
5. Chuẩn bị 2 đến 3 câu hỏi để hỏi lại nhà tuyển dụng (quy trình QA, tỉ lệ automation, cách xử lý flaky).

## Thử ngay trong lab
Capstone chính là bài thử lớn: chọn một lab, hoàn thành 10 bước. Với luyện live coding, chọn các lab chưa làm như `/lab/forms`, `/lab/table`, `/lab/leave`, `/lab/api` và giới hạn thời gian. Với kiểm chứng bắt bug, dùng `?bugs=BUG-01`, `BUG-02`, `BUG-03` (xem danh sách bug của lab ở `/labs/<slug>`).

## Lỗi thường gặp
- Triệu chứng: capstone dở dang, không có README, không có CI. Nguyên nhân: sa vào làm nhiều test mà quên phần hoàn thiện. Cách sửa: giữ phạm vi nhỏ; làm xong Bước 9, 10 trước khi mở rộng test.
- Triệu chứng: repo có 100 test nhưng không biết chúng phủ BR nào. Nguyên nhân: viết test trước khi phân tích. Cách sửa: lập ma trận BR x TC ở Bước 3 và đồng bộ khi thêm test.
- Triệu chứng: `Expected: 0 Received: -0` hoặc lỗi so sánh số kiểu tiền. Nguyên nhân: chuyển chuỗi định dạng thành số chưa chuẩn hoá. Cách sửa: chuẩn hoá hàm đọc số, ghi rõ định dạng tiền ở một chỗ.
- Triệu chứng: CI đỏ với `Cannot navigate to invalid URL` hoặc `ECONNREFUSED`. Nguyên nhân: `BASE_URL` chưa đặt hoặc trỏ tới `localhost` của runner. Cách sửa: dùng site đã triển khai và đặt Variable `BASE_URL` (xem bài 5.1).
- Triệu chứng: trả lời phỏng vấn đúng định nghĩa nhưng nhà tuyển dụng hỏi tiếp "bạn đã dùng chưa?" thì bí. Nguyên nhân: học thuộc không gắn với việc đã làm. Cách sửa: mỗi câu gắn với một ví dụ trong capstone.
- Triệu chứng: bị hỏi "tại sao" và không trả lời được lý do chọn một cách làm. Nguyên nhân: làm theo mẫu mà không hiểu đánh đổi. Cách sửa: với mỗi quyết định kiến trúc, viết một dòng "vì sao" vào README.

## Tóm tắt
- Capstone gom mọi kỹ năng vào một dự án có đầu có cuối: phân tích, thiết kế, framework, ổn định, CI, tài liệu.
- Mỗi tiêu chí hoàn thành phải kiểm chứng được bằng lệnh hoặc bằng chứng (ma trận BR x TC, `--repeat-each=10`, tab Actions).
- Thiết kế test tốt (bảng quyết định, biên) cho bộ test gọn, bắt được bug thật; test bắt bug phải đỏ khi bật `?bugs=`.
- Dùng `/interview` để luyện kiến thức, gắn từng câu với việc bạn đã làm; luyện thêm live coding và câu hỏi tình huống bằng STAR.
- Nói ngắn trước, ví dụ sau, nêu đánh đổi và dám nói "mình chưa gặp".

## Bài tập
1. Dễ: Hoàn thành Bước 1 đến 3 cho lab bạn chọn: repo, bảng BR cùng điểm mơ hồ, và 30 test case. Xong khi ma trận BR x TC không còn hàng BR nào trống.
2. Hoàn thành Bước 4 đến 6: cấu hình, Page Object, fixture và test data-driven chạy xanh. Xong khi `npx playwright test` xanh và không còn `waitForTimeout`.
3. Hoàn thành Bước 7 và 8: có test bắt được ít nhất hai bug bằng `?bugs=` và bộ test xanh 10 lần liên tiếp. Xong khi bạn có bằng chứng đỏ với bug bật và xanh với bug tắt.
4. Hoàn thành Bước 9 và 10: CI xanh với artifact báo cáo, README để người khác chạy được. Xong khi một người bạn clone repo và chạy theo README thành công.
5. Luyện phỏng vấn: tự trả lời thành tiếng 10 câu từ trang `/interview`, mỗi câu dưới 90 giây, gắn với ví dụ trong capstone. Xong khi bạn ghi âm, nghe lại và đánh dấu được câu nào còn ấp úng.
6. Nâng cao: làm một buổi live coding thử 45 phút trên một lab chưa làm, với người bạn đóng vai nhà tuyển dụng. Xong khi bạn viết được ít nhất 3 test xanh và giải thích được lựa chọn locator của mình.
