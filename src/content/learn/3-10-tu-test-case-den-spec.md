---
title: Từ test case đến Playwright spec
level: 3
order: 10
minutes: 50
summary: Chuyển test case thủ công thành test tự động, giữ truy vết BR → TC → spec.
keywords: [data driven testing playwright, test case to automation, traceability]
---

## Mục tiêu bài học
- Ánh xạ từng cột của test case sang từng phần của một spec Playwright (tiền điều kiện, bước, dữ liệu, kết quả, BR, ưu tiên).
- Gom nhiều test case cùng dạng thành một bảng dữ liệu và sinh test bằng vòng lặp (data-driven).
- Đặt tên test, gắn `tag` và `annotation` để truy vết BR, TC và spec; chạy lọc theo BR.
- Viết script nhỏ in báo cáo "BR nào có bao nhiêu test, BR nào chưa phủ" từ danh sách test thật.
- Chứng minh test của bạn **bắt được bug**: xanh trên lab sạch, đỏ khi bật `?bugs=BUG-xx`.

## Bạn cần chuẩn bị
- Đã học bài 3.4 (bảng quyết định LAB-03), 3.7 (test case chuẩn) và 3.9 (tag). Mở `/labs/cart` để xem 11 test case TC-C-001 đến TC-C-011.
- Biết chạy `npx playwright test` (Level 2). Nếu dùng starter repo: đã tạo `.env` với `BASE_URL` trỏ vào site đang chạy (mặc định `http://localhost:3000`).
- Node.js (cho script báo cáo truy vết).

## Kiến thức cần nắm
- Mỗi test case thành **một** hoặc **một nhóm** test Playwright; ID test case nằm trong tên test.
- **Data-driven**: một mảng dữ liệu sinh nhiều test; thêm ca mới là thêm một dòng.
- **Truy vết** BR, TC, spec: ba tầng nối với nhau bằng ID.
- `test.step` chia test thành các bước có tên trong báo cáo; `expect.soft` ghi nhận nhiều lỗi trong một test.
- `tag` (chọn test để chạy) và `annotation` (thông tin hiển thị trong báo cáo).
- Giữ test **độc lập**: tự reset dữ liệu trong `beforeEach`.

## Giải thích dễ hiểu
Test case là **bản nhạc**, spec là **buổi biểu diễn**. Cùng một bản nhạc có thể biểu diễn nhiều lần với nhiều nhạc cụ. Truy vết giúp bạn trả lời được: "Quy tắc BR-02 đã được biểu diễn bằng những test nào, hôm nay chúng đỏ hay xanh?"

Vì sao phải dịch có chủ đích chứ không chép nguyên văn từng bước thủ công? Bước thủ công thường dài ("mở trang, nhìn xem, kéo xuống"), còn code chỉ cần hành động có ảnh hưởng đến kết quả. Chép máy móc cho ra test dài, dễ vỡ. Dịch tốt giữ **ý đồ** của test case (kiểm BR nào, với dữ liệu nào, kết quả gì) và bỏ chi tiết thủ công.

## Thực hành từng bước
Ví dụ xuyên suốt: bộ test case mẫu của LAB-03 giỏ hàng. Ta sẽ biến 7 test case thành một file spec `cart-design.spec.ts`, có truy vết đầy đủ.

### Bước 1. Chọn test case và xác định kiểu test
Mục đích: biết test case nào dịch kiểu nào.

| TC | BR | Kiểu | Cách dịch |
|----|----|------|-----------|
| TC-C-004 ship đơn dưới 1 triệu | BR-03, BR-04 | Decision | data-driven (kiểm số tiền) |
| TC-C-005 miễn ship đúng 1.000.000 | BR-03 | BVA | data-driven |
| TC-C-006 SALE10 ở biên 500.000 | BR-02 | BVA | data-driven |
| TC-C-007 SALE10 dưới ngưỡng | BR-02 | Negative | data-driven (kiểm thông báo) |
| TC-C-008 giảm giá bị chặn trần | BR-02, BR-03 | Decision | data-driven |
| TC-C-002 hết hàng | BR-05 | Negative | test riêng |
| TC-C-011 không huỷ đơn đang giao | BR-06 | State | test riêng |

Năm test case đầu có cùng khuôn: giỏ, mã (hoặc không), kiểm các ô tiền; nên gom thành một mảng dữ liệu. Hai test case cuối khác khuôn nên viết riêng.

### Bước 2. Lập bảng ánh xạ cột test case sang code
Mục đích: biết mỗi cột của test case đi đâu.

| Cột test case | Trở thành trong spec |
|---------------|----------------------|
| ID | Phần đầu tên test: `[TC-C-004]` |
| BR | Phần thứ hai tên test: `[BR-03,BR-04]` và `annotation` loại `BR` |
| Ưu tiên, loại | `tag`: `@regression`, `@smoke` |
| Tiền điều kiện | `test.beforeEach` (mở trang, reset dữ liệu) và các hàm dựng dữ liệu (`addProduct`) |
| Bước | `test.step(...)` và các lệnh hành động |
| Dữ liệu | Một dòng của mảng `cases` (giỏ, mã) |
| Kết quả mong đợi | `expect(...)` hoặc `expect.soft(...)` |

### Bước 3. Dựng khung: hàm tiện ích và reset
Mục đích: loại bỏ lặp, đảm bảo độc lập.

Hai hàm tiện ích: `num` đọc số từ ô hiển thị, `addProduct` thêm sản phẩm theo số lượng (bấm "Thêm vào giỏ" rồi bấm "Tăng ..." đủ số lần). Hook `beforeEach` mở `/lab/cart` và bấm nút `reset-data` (testid cố định của lab) để mỗi test bắt đầu từ giỏ trống.

### Bước 4. Dịch một test case thủ công cụ thể
Mục đích: thấy từng cột trở thành code.

Test case:

| ID | Tiền điều kiện | Bước | Dữ liệu | Kết quả mong đợi |
|----|----------------|------|---------|------------------|
| TC-C-006 | Giỏ trống | Thêm 2 chuột; nhập SALE10; bấm Áp dụng | p2 x 2 (500.000đ), SALE10 | Giảm 50.000 |

Dịch thành code (một phần của spec hoàn chỉnh ở phần Demo):

```ts
test("[TC-C-006][BR-02] SALE10 ở biên 500.000", async ({ page }) => {
  await addProduct(page, "p2", 2);                       // dữ liệu: 2 chuột
  await page.getByLabel("Mã giảm giá").fill("SALE10");   // bước: nhập mã
  await page.getByRole("button", { name: "Áp dụng" }).click();
  expect(Math.abs(await num(page, "discount"))).toBe(50_000);  // kết quả mong đợi
});
```

Điểm đáng chú ý: không có dòng "mở trang" hay "reset" trong test vì đã nằm trong `beforeEach` (tiền điều kiện). Kết quả dùng `Math.abs` vì ô giảm giá hiển thị số âm khi có giảm (ví dụ `-50.000đ`).

### Bước 5. Gom các test case cùng khuôn thành dữ liệu
Mục đích: một vòng lặp, nhiều test.

Mỗi test case thành một đối tượng trong mảng `cases` với các trường `tc`, `br`, `title`, `lines` (sản phẩm và số lượng), `coupon` (mã, nếu có), `money` (kết quả bằng số) và `message` (đoạn thông báo, nếu có). Giá trị mong đợi tính tay theo bài 3.4:

| TC | Giỏ | Mã | Kết quả mong đợi (tính tay) |
|----|-----|----|-----------------------------|
| TC-C-004 | 1 chuột (250.000) | không | ship 30.000, VAT 20.000, tổng 300.000 |
| TC-C-005 | 4 chuột (1.000.000) | không | ship 0, VAT 80.000, tổng 1.080.000 |
| TC-C-006 | 2 chuột (500.000) | SALE10 | giảm 50.000 |
| TC-C-007 | 1 chuột (250.000) | SALE10 | giảm 0, báo "tối thiểu" |
| TC-C-008 | 1 màn hình (3.200.000) | SALE10 | giảm 100.000 (không phải 320.000), ship 0 |

Tính tay TC-C-005: tạm tính 1.000.000, không giảm; VAT là 8 phần trăm bằng 80.000; ship 0 vì đạt ngưỡng 1.000.000; tổng 1.000.000 cộng 80.000 bằng 1.080.000.

### Bước 6. Đặt tên, gắn tag và annotation
Mục đích: truy vết và lọc được.

Tên test dạng `[TC-C-006][BR-02] mô tả` cho phép chạy `npx playwright test -g "BR-02"` hoặc `-g "TC-C-006"`. `tag: ["@regression"]` cho phép chọn theo nhóm. `annotation: { type: "BR", description: "BR-02" }` hiển thị trong báo cáo HTML, nên người đọc báo cáo biết test này bảo vệ BR nào mà không phải đọc code.

Khi một test kiểm nhiều ô, dùng `expect.soft` để một lần chạy báo **mọi** ô sai thay vì dừng ở ô đầu tiên; thêm mô tả thứ hai như `expect.soft(value, "ô discount")` để lỗi đọc là hiểu.

### Bước 7. Chạy theo BR và theo TC
Mục đích: kiểm chứng truy vết bằng lệnh.

Lệnh `--list` chỉ liệt kê, không chạy; `-g` lọc test theo tên bằng biểu thức chính quy (regular expression).

```bash
npx playwright test e2e/cart-design.spec.ts --list
npx playwright test e2e/cart-design.spec.ts -g "BR-02"
npx playwright test e2e/cart-design.spec.ts -g "TC-C-008"
```

Kết quả mong đợi của lệnh thứ hai: 3 test (TC-C-006, TC-C-007, TC-C-008) vì cả ba có BR-02 trong tên. Nếu số test khác với ma trận BR → TC bạn lập ở bài 3.7, hoặc tên test thiếu BR, hoặc test case thiếu.

### Bước 8. Tạo báo cáo truy vết bằng script
Mục đích: không cần đếm tay độ phủ BR.

Lưu script này thành `trace.mjs` (ngoài thư mục test). Nó đọc JSON mà Playwright in ra khi `--list --reporter=json`, rồi đếm số test của mỗi BR trong danh sách BR của lab (BR của LAB-03 lấy từ `/labs/cart`).

```js
import { readFileSync } from "node:fs";

// Danh sách BR của lab cần phủ (lấy từ trang /labs/cart).
const ALL = ["BR-01", "BR-02", "BR-03", "BR-04", "BR-05", "BR-06"];

// Đọc JSON do `playwright test --list --reporter=json` in ra, qua stdin.
const report = JSON.parse(readFileSync(0, "utf-8"));
const titles = [];

// Duyệt đệ quy các suite để lấy tên mọi test.
function walk(suite) {
  for (const spec of suite.specs ?? []) titles.push(spec.title);
  for (const child of suite.suites ?? []) walk(child);
}
report.suites.forEach(walk);

for (const br of ALL) {
  const hit = titles.filter((t) => t.includes(br));
  console.log(`${br}: ${hit.length} test${hit.length === 0 ? "  <-- CHƯA PHỦ" : ""}`);
}
```

Chạy (một lệnh, dùng ống dẫn `|`; chạy được ở PowerShell, Git Bash và Terminal macOS):

```bash
npx playwright test e2e/cart-design.spec.ts --list --reporter=json | node trace.mjs
```

Kết quả mong đợi với file spec ở phần Demo:

```text
BR-01: 0 test  <-- CHƯA PHỦ
BR-02: 3 test
BR-03: 3 test
BR-04: 1 test
BR-05: 1 test
BR-06: 1 test
```

Báo cáo cho thấy ngay: BR-01 (tối đa 10 sản phẩm và không vượt tồn kho) chưa có test nào trong file này. Đó là việc cần làm tiếp (bài tập 3).

### Bước 9. Chứng minh test bắt được bug
Mục đích: test chỉ có giá trị khi nó đỏ lúc phải đỏ.

Lab cho phép bật lỗi có chủ đích qua `?bugs=BUG-xx`. Với LAB-03: BUG-02 bỏ trần giảm giá, BUG-03 cho huỷ đơn đang giao. Đổi `page.goto("/lab/cart")` trong `beforeEach` thành `page.goto("/lab/cart?bugs=BUG-02")` rồi chạy lại:

| Bug bật | Test đỏ mong đợi | Lý do |
|---------|------------------|-------|
| BUG-02 | TC-C-008 | Giảm giá thành 320.000 thay vì 100.000 (`Expected: 100000 Received: 320000`, kèm mô tả "ô discount") |
| BUG-03 | TC-C-011 | Đơn "Đang giao" lại có nút "Huỷ đơn" (`Expected: 0 Received: 1`) |

Các test còn lại vẫn xanh. Nếu bật bug mà không test nào đỏ, tức bộ test của bạn có lỗ hổng. Nếu dùng starter repo, cấu hình của nó cũng cho phép bật bug qua biến môi trường mà không sửa code: `LAB_BUGS=BUG-02` (bash) hoặc `$env:LAB_BUGS="BUG-02"` (PowerShell) trước lệnh `npx playwright test`.

Lưu ý: BUG-01 của LAB-03 (làm tròn VAT xuống) **cũng bắt được qua giao diện** nhờ Cáp sạc USB-C 99.999đ (bài 3.7), nhưng spec trên chưa có dòng nào dùng dữ liệu đó nên nó vẫn xanh khi bật BUG-01. Đó là một lỗ hổng của bộ test (xem bài tập 3 ở phần Thử ngay trong lab). Để bắt được, thêm vào mảng `cases` một dòng cho TC-C-009 (tính tay: 99.999 nhân 0,08 bằng 7.999,92, làm tròn gần nhất là 8.000; ship 30.000; tổng 99.999 cộng 8.000 cộng 30.000 bằng 137.999):

```ts
  { tc: "TC-C-009", br: ["BR-04"], title: "VAT làm tròn gần nhất",
    lines: [["p5", 1]], money: { shipping: 30_000, vat: 8_000, total: 137_999 } },
```

Dòng này xanh trên lab sạch và đỏ khi bật `?bugs=BUG-01` (VAT thành 7.999, `Expected: 8000 Received: 7999`). Khi đó spec có 8 test thay vì 7.

### Bước 10. Đặt file vào đúng chỗ và chạy
Mục đích: chạy được ở môi trường của bạn.

Trong repo site: lưu file là `e2e/cart-design.spec.ts` (cấu hình mặc định tự build và chạy site ở cổng 3100). Trong starter repo: lưu vào `tests/`, đảm bảo `BASE_URL` đang trỏ đến site (mặc định `http://localhost:3000`) và chạy `npx playwright test tests/cart-design.spec.ts`.

## Demo code
File spec đầy đủ, chạy được trên `/lab/cart`.

```ts
import { test, expect, type Page } from "@playwright/test";

// Đọc số nguyên từ ô hiển thị: "-100.000đ" thành -100000.
const num = async (page: Page, id: string) =>
  Number((await page.getByTestId(id).innerText()).replace(/[^\d-]/g, ""));

// Thêm sản phẩm với số lượng mong muốn: bấm "Thêm vào giỏ" rồi "Tăng ..." cho đủ.
async function addProduct(page: Page, id: string, qty: number) {
  const card = page.getByTestId(`product-${id}`);
  await card.getByRole("button", { name: "Thêm vào giỏ" }).click();
  for (let i = 1; i < qty; i++) await card.getByRole("button", { name: /^Tăng/ }).click();
}

type Money = { discount?: number; shipping?: number; vat?: number; total?: number };

// Một dòng dữ liệu = một test case.
interface CartCase {
  tc: string;                  // ID test case
  br: string[];                // BR liên quan
  title: string;
  lines: [string, number][];   // [mã sản phẩm, số lượng]
  coupon?: string;
  money?: Money;               // kết quả mong đợi bằng số
  message?: string;            // đoạn thông báo mong đợi
}

const cases: CartCase[] = [
  { tc: "TC-C-004", br: ["BR-03", "BR-04"], title: "ship đơn dưới 1 triệu",
    lines: [["p2", 1]], money: { shipping: 30_000, vat: 20_000, total: 300_000 } },
  { tc: "TC-C-005", br: ["BR-03"], title: "miễn ship đúng ngưỡng 1.000.000",
    lines: [["p2", 4]], money: { shipping: 0, vat: 80_000, total: 1_080_000 } },
  { tc: "TC-C-006", br: ["BR-02"], title: "SALE10 ở biên 500.000",
    lines: [["p2", 2]], coupon: "SALE10", money: { discount: 50_000 } },
  { tc: "TC-C-007", br: ["BR-02"], title: "SALE10 dưới ngưỡng",
    lines: [["p2", 1]], coupon: "SALE10", money: { discount: 0 }, message: "tối thiểu" },
  { tc: "TC-C-008", br: ["BR-02", "BR-03"], title: "giảm giá bị chặn trần",
    lines: [["p3", 1]], coupon: "SALE10", money: { discount: 100_000, shipping: 0 } },
];

// Tiền điều kiện chung: mở lab và reset dữ liệu.
test.beforeEach(async ({ page }) => {
  await page.goto("/lab/cart");
  await page.getByTestId("reset-data").click();
});

// Sinh một test cho mỗi dòng dữ liệu.
for (const c of cases) {
  test(`[${c.tc}][${c.br.join(",")}] ${c.title}`, {
    tag: ["@regression"],
    annotation: { type: "BR", description: c.br.join(", ") },
  }, async ({ page }) => {
    await test.step("Thêm sản phẩm vào giỏ", async () => {
      for (const [id, qty] of c.lines) await addProduct(page, id, qty);
    });

    if (c.coupon) {
      await test.step(`Áp mã ${c.coupon}`, async () => {
        await page.getByLabel("Mã giảm giá").fill(c.coupon!);
        await page.getByRole("button", { name: "Áp dụng" }).click();
      });
    }

    await test.step("Kiểm tra kết quả", async () => {
      // Ô nào có giá trị mong đợi thì so; Math.abs vì giảm giá hiển thị số âm khi có giảm (ví dụ "-50.000đ").
      for (const f of ["discount", "shipping", "vat", "total"] as const) {
        const want = c.money?.[f];
        if (want !== undefined) expect.soft(Math.abs(await num(page, f)), `ô ${f}`).toBe(want);
      }
      if (c.message) await expect(page.getByTestId("cart-message")).toContainText(c.message);
    });
  });
}

// Hai test case khác khuôn nên viết riêng.
test("[TC-C-002][BR-05] sản phẩm hết hàng bị vô hiệu hoá", { tag: "@regression" }, async ({ page }) => {
  await expect(page.getByTestId("product-p4").getByRole("button", { name: "Thêm vào giỏ" })).toBeDisabled();
});

test("[TC-C-011][BR-06] không huỷ được đơn đang giao", { tag: "@regression" }, async ({ page }) => {
  await addProduct(page, "p2", 1);
  await page.getByRole("button", { name: "Đặt hàng" }).click();
  await page.getByRole("button", { name: "Chuyển: Đã thanh toán" }).click();
  await page.getByRole("button", { name: "Chuyển: Đang giao" }).click();
  await expect(page.getByTestId("order-status")).toHaveText("Đang giao");   // khẳng định trạng thái trước
  await expect(page.getByRole("button", { name: "Huỷ đơn" })).toHaveCount(0);
});
```

Giải thích từng phần: `CartCase` là cấu trúc test case dạng dữ liệu, cùng ý với kiểu `TestCase` của site (bài 3.7). Mảng `cases` là bảng ở Bước 5. Vòng `for` biến mỗi dòng thành một test độc lập có tên chứa TC và BR. `test.step` làm báo cáo HTML hiển thị từng bước có tên. `expect.soft` cho phép một test báo nhiều ô sai; test vẫn đỏ nếu có lỗi mềm. `c.coupon!` có dấu `!` vì TypeScript không biết `coupon` đã được kiểm tra trong khối `if` của hàm lồng nhau. Test cuối khẳng định trạng thái "Đang giao" trước rồi mới kiểm nút vắng mặt, nhờ đó `toHaveCount(0)` không xanh giả.

Kết quả mong đợi khi chạy toàn bộ file trên lab sạch:

```text
Running 7 tests using ... workers
  7 passed
```

## Thử ngay trong lab
1. Chạy file trên lab sạch (7 test xanh). Chạy `--list --reporter=json | node trace.mjs` và xem BR-01 chưa phủ.
2. Làm Bước 9: bật `?bugs=BUG-02`, rồi `?bugs=BUG-03`. Ghi lại test nào đỏ và thông báo lỗi.
3. Mở `/labs/cart`, đối chiếu từng dòng trong bảng workshop với từng test: test nào chưa có test case ứng với nó? (TC-C-001, TC-C-003, TC-C-009 và TC-C-010 chưa dịch; với TC-C-009 hãy dùng dòng dữ liệu cáp sạc ở Bước 9 rồi kiểm chứng bằng `?bugs=BUG-01`.)
4. Mở báo cáo HTML (`npx playwright show-report`) và xem `annotation` BR hiển thị ở mỗi test.

## Lỗi thường gặp
- **Triệu chứng**: `-g "BR-02"` chọn thiếu hoặc thừa test so với ma trận. **Nguyên nhân**: tên test không đồng nhất (viết `BR 02`, quên BR). **Cách sửa**: dùng một định dạng duy nhất `[TC-x-nnn][BR-nn,BR-mm]`, sinh tên từ dữ liệu như trong Demo.
- **Triệu chứng**: test data-driven đỏ ở một dòng, các dòng khác xanh nhưng bạn không biết dòng nào. **Nguyên nhân**: tên test giống nhau giữa các dòng. **Cách sửa**: đưa ID test case vào tên test (mỗi dòng một tên riêng).
- **Triệu chứng**: thêm 6 màn hình mà tổng tiền vẫn như 5 màn hình, kèm thông báo `Tối đa 5 sản phẩm`. **Nguyên nhân**: số lượng bị chặn ở tồn kho (BR-01: tối đa 10 và không vượt tồn kho; màn hình chỉ còn 5). **Cách sửa**: chọn số lượng hợp lệ trong dữ liệu test, hoặc dùng đúng tình huống đó làm test case BR-01.
- **Triệu chứng**: `Expected: 0 Received: -0` ở ô giảm giá (gặp ở lab bản cũ; lab hiện hiển thị `0đ`). **Nguyên nhân**: giao diện từng hiển thị `-0đ`, và `Number("-0")` là âm không. **Cách sửa**: so sánh `Math.abs(...)` như trong Demo, cách này an toàn ở cả hai phiên bản.
- **Triệu chứng**: test xanh khi bật `?bugs=BUG-02`. **Nguyên nhân**: không test nào dùng dữ liệu làm lộ lỗi (giảm giá vượt trần cần tạm tính trên 1.000.000). **Cách sửa**: thêm test case dùng 1 màn hình (3.200.000), như TC-C-008.
- **Triệu chứng**: `trace.mjs` báo `SyntaxError: Unexpected token` khi parse. **Nguyên nhân**: có dòng chữ khác lẫn vào JSON (cảnh báo của npx hoặc reporter). **Cách sửa**: chạy lại với đúng `--reporter=json` và không in thêm gì ra stdout, hoặc lưu JSON ra file rồi đọc file.

## Tóm tắt
- Mỗi cột của test case có chỗ đi cố định trong spec: ID và BR vào tên test, ưu tiên vào tag, tiền điều kiện vào `beforeEach`, dữ liệu vào bảng, kết quả vào `expect`.
- Test case cùng khuôn gom thành mảng dữ liệu và sinh test bằng vòng lặp; test khác khuôn viết riêng.
- Tên test dạng `[TC-x-nnn][BR-nn]` cho phép lọc bằng `-g`; tag và annotation giúp chọn nhóm và đọc báo cáo.
- Script nhỏ đọc `--list --reporter=json` cho ra báo cáo độ phủ BR và chỉ ra BR chưa có test.
- Test chỉ có giá trị khi bắt được bug: xanh trên lab sạch, đỏ khi bật `?bugs=BUG-xx`.
- Giữ test độc lập bằng reset dữ liệu, và luôn khẳng định trạng thái trước khi khẳng định "không có" thứ gì.

## Bài tập
1. Dịch thêm test case TC-C-001, TC-C-003 và TC-C-010 của LAB-03 vào file spec, theo đúng định dạng tên test. Xong khi: `--list` có 10 test và `trace.mjs` cho BR-01 có 1 test, BR-05 có 2 test, BR-06 có 2 test.
2. Viết 3 test case mới cho BR-01 (tối đa 10, không vượt tồn kho 5 của màn hình) bằng bảng test case, rồi dịch sang spec data-driven. Xong khi: `trace.mjs` không còn báo BR-01 chưa phủ và test xanh trên lab sạch.
3. Thêm bảng quyết định R2 của bài 3.4 (4 chuột, mã SALE10, ship 30.000, tổng 1.002.000) vào mảng `cases` với ID mới `TC-C-012`, cập nhật workshop trên giấy. Xong khi: test xanh và bạn giải thích được vì sao nó có thể bắt lỗi mà TC-C-005 không bắt được.
4. Chọn lab khác (gợi ý LAB-07 `/lab/leave`) và dịch 5 test case biên của bài 3.3 sang spec có tên `[TC-H-nnn][BR-nn]` và đồng hồ giả. Xong khi: `-g "BR-03"` chỉ chạy các test về số ngày phép và chạy trên bug `?bugs=BUG-01` (đếm thiếu ngày cuối) thì ít nhất một test đỏ.
5. (Nâng cao) Bật BUG-02 và BUG-03 cùng lúc (`?bugs=BUG-02,BUG-03`) và dự đoán rồi kiểm chứng đúng test nào đỏ. Xong khi: dự đoán khớp kết quả, và bạn viết được một câu giải thích mỗi test đỏ bảo vệ BR nào.
