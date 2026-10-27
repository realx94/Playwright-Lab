---
title: Kiểm thử khả năng truy cập (Accessibility)
level: 5
order: 4
minutes: 45
summary: Tự động hoá kiểm tra a11y bằng @axe-core/playwright, đọc kết quả vi phạm, giới hạn phạm vi quét và kết hợp với kiểm tra bàn phím và thủ công.
keywords: [axe core playwright, wcag là gì, accessibility testing]
---

## Mục tiêu bài học
- Giải thích được accessibility (a11y), WCAG và vì sao a11y là một phần của chất lượng chứ không phải việc "làm thêm".
- Cài `@axe-core/playwright`, viết test quét một trang và hiểu cấu trúc kết quả `violations` (id, impact, nodes).
- Giới hạn phạm vi quét (`include`, `exclude`, `withTags`, `disableRules`) và quyết định mức độ lỗi làm test đỏ.
- Viết test bàn phím bằng Playwright và biết những điều axe không kiểm tra được.
- Đọc cấu hình a11y thật của repo này (`e2e/a11y.spec.ts`) và áp dụng cho dự án của bạn.

## Bạn cần chuẩn bị
- Đã học locator hướng người dùng (bài 2.5), assertion (bài 2.8) và HTML/DOM (bài 2.1).
- Project Playwright chạy được; starter repo hoặc project riêng đều dùng được.
- Trình duyệt Chromium đã cài qua `npx playwright install`.

## Kiến thức cần nắm
- **a11y** (accessibility, khả năng truy cập; chữ "a11y" là a, 11 chữ ở giữa, y): ứng dụng dùng được với người khiếm thị, khiếm thính, vận động hạn chế, người chỉ dùng bàn phím hoặc trình đọc màn hình (**screen reader**).
- **WCAG** (Web Content Accessibility Guidelines): bộ hướng dẫn quốc tế; ba mức A, AA, AAA, trong đó AA là mục tiêu phổ biến.
- **axe-core**: thư viện quét DOM theo các luật a11y; `@axe-core/playwright` đưa nó vào Playwright.
- Mức độ ảnh hưởng (`impact`) của lỗi: `minor`, `moderate`, `serious`, `critical`.
- Công cụ tự động chỉ phát hiện một phần các vấn đề (thường nói khoảng một phần ba); phần còn lại cần kiểm tra thủ công.
- Nguyên tắc cốt lõi: ô nhập có nhãn, nút có tên, ảnh có văn bản thay thế, tương phản đủ, dùng được bằng bàn phím, thứ tự focus hợp lý.

## Giải thích dễ hiểu
Một toà nhà tốt có **lối đi cho xe lăn, biển báo chữ lớn, thang máy có chữ nổi**. a11y là phần đó của web. Nó không chỉ phục vụ nhóm người thiệt thòi mà còn giúp người dùng trong tình huống khó: nắng chói làm không đọc được chữ nhạt, tay đang bận chỉ dùng được bàn phím, mạng chậm nên ảnh chưa tải thì chữ mô tả thay thế vẫn hiện.

Vì sao QA cần quan tâm? Thứ nhất, ở nhiều thị trường và hợp đồng, tuân thủ WCAG là yêu cầu pháp lý hoặc điều khoản bắt buộc. Thứ hai, lỗi a11y thường là bug thật: nút icon không có tên thì screen reader chỉ đọc "button", nút không dùng được bằng bàn phím nghĩa là một nhóm người dùng bị chặn hoàn toàn. Thứ ba, chi phí sửa sớm rất rẻ so với sửa khi đã phát hành.

Cách trình duyệt "nhìn" trang cho screen reader là **cây truy cập** (accessibility tree): mỗi phần tử có `role` (vai trò: button, textbox...) và `name` (tên: chữ hiển thị, nhãn, `aria-label`). Axe kiểm tra cây này có đủ và hợp lệ không. Đây cũng chính là cách `getByRole` và `getByLabel` tìm phần tử, nên khi test của bạn dùng locator hướng người dùng, bạn đã vô tình kiểm tra một phần a11y: nếu `getByRole("button", { name: "Đăng nhập" })` tìm được thì nút đó có role và tên đúng.

Axe là **máy quét tự động**: nhanh, lặp lại được, bắt các lỗi "máy hiểu được" như "nút không có tên". Nhưng máy không biết nhãn "Nhấn vào đây" có nghĩa gì, hay thứ tự focus có hợp lý với người dùng không. Vì vậy axe là lưới lọc đầu tiên, không phải chứng nhận đạt chuẩn.

## Thực hành từng bước

### Bước 1. Cài @axe-core/playwright
Mục đích: có thư viện quét a11y trong project.

```bash
npm i -D @axe-core/playwright
```

| Phần | Ý nghĩa |
|------|---------|
| `npm i -D` | Cài thành devDependency. |
| `@axe-core/playwright` | Gói của Deque (hãng làm axe) tích hợp axe-core vào Playwright. Dùng cùng `@playwright/test`. Repo này dùng bản `^4.14.0`. |

Kết quả mong đợi: `package.json` có thêm dòng `"@axe-core/playwright"`. Nếu gặp lỗi `Cannot find module '@axe-core/playwright'` khi chạy test: chưa cài trong đúng thư mục project, kiểm tra bạn đang đứng ở thư mục có `package.json`.

### Bước 2. Viết test quét một trang
Mục đích: quét trang đăng nhập của lab và mong không có vi phạm. Tạo `tests/a11y.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

test("trang đăng nhập không có vi phạm a11y", async ({ page }) => {
  await page.goto("/lab/login");
  await page.waitForLoadState("networkidle");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

| Dòng | Ý nghĩa |
|------|---------|
| `import AxeBuilder from "@axe-core/playwright"` | `AxeBuilder` là export mặc định của gói (cũng có named export cùng tên). |
| `waitForLoadState("networkidle")` | Chờ mạng yên để trang vẽ xong trước khi quét; tránh quét giữa chừng. Với app có kết nối liên tục, thay bằng chờ một phần tử cụ thể. |
| `new AxeBuilder({ page })` | Tạo bộ quét gắn với trang hiện tại. |
| `.withTags(["wcag2a", "wcag2aa"])` | Chỉ chạy các luật thuộc WCAG 2 mức A và AA. Không đặt tag thì axe chạy mọi luật (kể cả luật "best practice"). |
| `.analyze()` | Chạy quét, trả về kết quả bất đồng bộ nên cần `await`. |
| `results.violations` | Mảng các luật bị vi phạm; mảng rỗng là không phát hiện lỗi. |

Kết quả mong đợi với trang đăng nhập của lab: test xanh, `violations` rỗng (đã kiểm tra: không có vi phạm A/AA). Nếu có vi phạm, lỗi so sánh `toEqual([])` in ra rất dài, ta sẽ cải thiện ở Bước 4.

### Bước 3. Tự tạo lỗi để thấy axe phát hiện
Mục đích: hiểu cấu trúc kết quả khi có vi phạm, và kiểm tra chính test a11y của bạn có "bắt" được lỗi thật (nguyên tắc: test phải đỏ khi hệ thống sai). `page.setContent` đưa HTML thẳng vào trang:

```ts
test("axe phát hiện lỗi trong HTML cố ý làm sai", async ({ page }) => {
  await page.setContent(`
    <html lang="vi"><head><title>Demo</title></head>
    <body><main>
      <img src="x.png">
      <button></button>
      <input type="text">
    </main></body></html>
  `);

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const ids = results.violations.map((v) => v.id);

  expect(ids).toEqual(expect.arrayContaining(["image-alt", "button-name", "label"]));
});
```

| Phần | Ý nghĩa |
|------|---------|
| `<img>` không `alt` | Vi phạm luật `image-alt`: ảnh cần mô tả thay thế. |
| `<button>` rỗng | Vi phạm `button-name`: nút không có tên. |
| `<input>` không nhãn | Vi phạm `label`: ô nhập cần nhãn. |
| `expect.arrayContaining` | Kiểm tra danh sách có chứa các id này (không quan tâm thứ tự hay luật khác). |

Kết quả mong đợi: test xanh, tức axe đã báo đúng ba vi phạm, mỗi vi phạm mức `critical`. Nếu một luật không xuất hiện, hãy `console.log(ids)` để xem thực tế.

### Bước 4. Đọc cấu trúc một vi phạm
Mục đích: biết lấy thông tin nào để báo lỗi cho dev. Mỗi phần tử của `violations` có dạng:

```json
{
  "id": "button-name",
  "impact": "critical",
  "help": "Buttons must have discernible text",
  "helpUrl": "https://dequeuniversity.com/rules/axe/...",
  "nodes": [
    { "html": "<button></button>", "target": ["button"], "failureSummary": "Fix any of the following: ..." }
  ]
}
```

| Trường | Ý nghĩa |
|--------|---------|
| `id` | Mã luật; dùng cho `disableRules` hoặc tra cứu. |
| `impact` | Mức độ ảnh hưởng: `minor`, `moderate`, `serious`, `critical`. |
| `help` | Mô tả ngắn lỗi bằng tiếng Anh. |
| `helpUrl` | Trang giải thích và cách sửa. |
| `nodes` | Danh sách phần tử vi phạm. |
| `nodes[].html` | Đoạn HTML của phần tử. |
| `nodes[].target` | Selector tìm phần tử (mảng vì có thể xuyên iframe hoặc shadow DOM). |
| `nodes[].failureSummary` | Gợi ý cách sửa. |

Từ đó ta viết phần so sánh gọn và dễ đọc, để khi đỏ thì thấy ngay chỗ nào:

```ts
const summary = results.violations.map(
  (v) => `${v.id} (${v.impact}): ${v.help} - ${v.nodes.length} phần tử, ví dụ ${v.nodes[0]?.target.join(" ")}`,
);
expect(summary).toEqual([]);
```

Kết quả mong đợi khi có lỗi: Playwright hiển thị mảng chuỗi mô tả như `button-name (critical): Buttons must have discernible text - 1 phần tử, ví dụ button`, dễ báo bug hơn cả một khối JSON.

### Bước 5. Chặn theo mức độ, không chặn mọi thứ
Mục đích: tránh bộ test đỏ vì hàng chục lỗi nhẹ cũ khiến cả nhóm bỏ qua. Repo này làm đúng như vậy. Trích `e2e/a11y.spec.ts`:

```ts
const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
expect(
  blocking.map((v) => `${v.id} (${v.impact}): ${v.help} - ${v.nodes.length} phần tử, ví dụ ${v.nodes[0]?.target.join(" ")}`),
).toEqual([]);
```

| Phần | Ý nghĩa |
|------|---------|
| `filter(... serious hoặc critical)` | Chỉ lỗi nặng làm test đỏ. Lỗi `minor` và `moderate` vẫn tồn tại nhưng được xử lý theo kế hoạch riêng. |
| Vòng lặp mọi trang | Spec trong repo chạy cùng kiểm tra trên danh sách nhiều trang (`/`, `/learn`, `/labs/login`, `/lab/login`, `/lab/cart`...), mỗi trang một test. |

Chiến lược thực tế cho dự án có sẵn nhiều lỗi: bật chặn `critical` trước, ghi lại các lỗi còn lại làm backlog, rồi nâng dần lên `serious`. Đừng đặt "không một vi phạm nào" ngay từ đầu nếu chưa sửa xong, vì test sẽ đỏ vĩnh viễn và bị tắt.

### Bước 6. Giới hạn phạm vi quét
Mục đích: quét đúng phần cần quét, loại phần không thuộc quyền kiểm soát của bạn.

```ts
const results = await new AxeBuilder({ page })
  .include("form")                       // chỉ quét bên trong thẻ form
  .exclude("[data-testid='chat-widget']") // bỏ qua một widget bên thứ ba
  .disableRules(["color-contrast"])      // tắt một luật cụ thể (phải có lý do)
  .analyze();
```

| Hàm | Ý nghĩa |
|-----|---------|
| `include(selector)` | Chỉ quét các phần tử khớp selector. |
| `exclude(selector)` | Bỏ qua các phần tử khớp, ví dụ widget của bên thứ ba bạn không sửa được. |
| `disableRules([...])` | Tắt luật theo `id`. Mỗi lần tắt phải ghi chú vì sao và ai chịu trách nhiệm sửa. |
| `withTags([...])` | Chọn nhóm luật theo tag (`wcag2a`, `wcag2aa`, `wcag21aa`, `best-practice`...). |

Hai tình huống cần nhớ. Một: quét **sau khi** mở hộp thoại, menu, hay thông báo lỗi, vì chỉ quét trang lúc mới tải sẽ bỏ qua những phần này. Hai: quét nhiều trạng thái của cùng trang (rỗng, có lỗi validate, đã đăng nhập) bằng cách đưa trang vào từng trạng thái rồi gọi `analyze()` lại.

### Bước 7. Test bàn phím bằng Playwright
Mục đích: axe không biết thứ tự Tab có hợp lý không, ta tự kiểm tra.

```ts
test("dùng được trang đăng nhập chỉ bằng bàn phím", async ({ page }) => {
  await page.goto("/lab/login");

  await page.getByLabel("Email").focus();
  await page.keyboard.type("user@lab.dev");

  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Mật khẩu")).toBeFocused();
  await page.keyboard.type("Passw0rd!");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("checkbox").first()).toBeFocused(); // ô đánh dấu "Ghi nhớ"

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeFocused();
  await page.keyboard.press("Enter"); // Enter trên nút gửi form
  await expect(page.getByTestId("dashboard")).toBeVisible();
});
```

| Dòng | Ý nghĩa |
|------|---------|
| `focus()` | Đặt focus vào ô Email như khi người dùng bấm vào. |
| `keyboard.type(text)` | Gõ từng ký tự vào phần tử đang focus. |
| `keyboard.press("Tab")` | Chuyển focus sang phần tử kế tiếp theo thứ tự Tab. |
| `toBeFocused()` | Assertion kiểm tra phần tử đang giữ focus, tự chờ như các web-first assertion khác. |

Kết quả mong đợi: sau Tab đầu tiên focus ở ô Mật khẩu; Tab thứ hai tới một ô đánh dấu (checkbox), Tab thứ ba tới nút Đăng nhập, và Enter đăng nhập thành công (đã kiểm tra trên lab). Thứ tự này nên khớp thứ tự đọc trực quan từ trên xuống, trái sang phải. Nếu Tab nhảy lung tung, hoặc không thấy viền focus, đó là lỗi a11y mà axe không báo.

Nếu gặp lỗi `toBeFocused` đỏ: có thể phần tử trung gian chen vào thứ tự Tab (một nút, một liên kết). In ra phần tử đang focus bằng `page.evaluate(() => document.activeElement?.outerHTML)` để biết.

### Bước 8. Đính kèm kết quả vào báo cáo
Mục đích: để người đọc báo cáo xem được chi tiết mà không cần chạy lại.

```ts
test("quét a11y kèm báo cáo", async ({ page }, testInfo) => {
  await page.goto("/lab/cart");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();

  await testInfo.attach("axe-violations", {
    body: JSON.stringify(results.violations, null, 2),
    contentType: "application/json",
  });

  expect(results.violations).toEqual([]);
});
```

| Phần | Ý nghĩa |
|------|---------|
| `testInfo` | Tham số thứ hai của test, chứa thông tin lần chạy hiện tại. |
| `testInfo.attach(name, { body, contentType })` | Đính kèm tệp hoặc dữ liệu; hiện trong báo cáo HTML của test đó. |

Kết quả mong đợi: mở `npx playwright show-report`, vào test, thấy mục đính kèm `axe-violations` chứa JSON đầy đủ.

## Demo code
Một fixture đóng gói việc quét để dùng lại ở nhiều spec (nối với bài 4.3):

```ts
import { test as base, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

type Fixtures = {
  expectNoBlockingA11yIssues: () => Promise<void>;
};

export const test = base.extend<Fixtures>({
  expectNoBlockingA11yIssues: async ({ page }, use) => {
    await use(async () => {
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(
        blocking.map((v) => `${v.id} (${v.impact}): ${v.help} - ${v.nodes.length} phần tử`),
      ).toEqual([]);
    });
  },
});

export { expect };
```

Dùng:

```ts
import { test } from "../fixtures/a11y";

test("giỏ hàng không có lỗi a11y nghiêm trọng", async ({ page, expectNoBlockingA11yIssues }) => {
  await page.goto("/lab/cart");
  await page.waitForLoadState("networkidle");
  await expectNoBlockingA11yIssues();
});
```

Fixture `expectNoBlockingA11yIssues` là một hàm bạn gọi khi muốn quét: có thể gọi nhiều lần trong cùng một test sau mỗi bước thay đổi trạng thái.

## Việc phải kiểm tra thủ công
Axe không thay được những kiểm tra sau, nên hãy đưa vào checklist của mỗi tính năng:
- **Bàn phím**: mọi chức năng dùng được chỉ với Tab, Shift+Tab, Enter, Space, phím mũi tên; không bị "kẹt" trong hộp thoại; Esc đóng được hộp thoại.
- **Focus nhìn thấy được** và thứ tự hợp lý.
- **Screen reader** (NVDA trên Windows, VoiceOver trên macOS): nội dung đọc có nghĩa, thông báo lỗi được đọc ra.
- **Tương phản trong ngữ cảnh**: chữ trên ảnh nền, trạng thái hover và disabled.
- **Phóng to 200 phần trăm** và dùng cỡ chữ lớn: bố cục không vỡ, không mất nội dung.
- **Thông báo động**: vùng `role="alert"` hoặc `aria-live` cho lỗi form, kết quả tải.

## Thử ngay trong lab
Mở `/lab/login` và `/lab/forms`. Chạy test quét ở Bước 2 trên từng trang. Sau đó thao tác để hiện lỗi validate (gửi form trống) rồi quét lại và so kết quả với lần quét trang mới tải. Dùng chỉ bàn phím hoàn thành form ở `/lab/forms` và ghi lại chỗ khó thao tác (ví dụ date picker, select tuỳ biến). Trong repo, `e2e/a11y.spec.ts` quét sẵn danh sách khoảng hai mươi trang gồm cả `/lab/login`, `/lab/forms`, `/lab/cart`, `/lab/todo`, `/lab/table` để bạn đối chiếu.

## Lỗi thường gặp
- Triệu chứng: axe không báo gì và nhóm cho rằng trang "đạt chuẩn a11y". Nguyên nhân: coi công cụ tự động là bằng chứng đầy đủ. Cách sửa: kết hợp checklist thủ công ở trên.
- Triệu chứng: test a11y lúc xanh lúc đỏ. Nguyên nhân: quét khi trang chưa vẽ xong hoặc hiệu ứng chuyển động đang chạy. Cách sửa: chờ phần tử chính hiện, tắt hiệu ứng khi test, chờ `networkidle` hoặc một locator cụ thể.
- Triệu chứng: toàn bộ test đỏ vì lỗi cũ của widget bên thứ ba. Nguyên nhân: quét cả phần không thuộc quyền sửa. Cách sửa: `exclude` đúng phần đó và ghi chú, hoặc tạm chặn theo `impact`.
- Triệu chứng: chỉ quét trang chủ, bỏ qua hộp thoại, trạng thái lỗi. Nguyên nhân: quét một lần ngay khi tải. Cách sửa: quét lại sau khi đưa trang vào từng trạng thái.
- Triệu chứng: `color-contrast` báo lỗi mà bạn thấy "vẫn đọc được". Nguyên nhân: màn hình và mắt bạn không đại diện mọi người dùng. Cách sửa: sửa màu theo tỉ lệ tương phản AA thay vì tắt luật.
- Triệu chứng: `Cannot find module '@axe-core/playwright'` hoặc lỗi kiểu khi import. Nguyên nhân: chưa cài gói, hoặc cấu hình TypeScript/module không khớp. Cách sửa: `npm i -D @axe-core/playwright` và `import AxeBuilder from "@axe-core/playwright"` (bản 4.14 cũng cho phép `import { AxeBuilder } from "@axe-core/playwright"`, hai cách tương đương).

## Tóm tắt
- a11y đảm bảo ứng dụng dùng được với mọi người; WCAG mức AA là mục tiêu phổ biến.
- `new AxeBuilder({ page }).withTags([...]).analyze()` trả về `violations`, mỗi mục có `id`, `impact`, `help`, `nodes`.
- Chặn build theo `impact` (serious và critical) rồi nâng dần chuẩn; dùng `include`, `exclude`, `disableRules` có chủ đích.
- Quét nhiều trạng thái của trang, không chỉ lúc mới tải.
- Axe chỉ tìm được một phần lỗi: kiểm tra bàn phím, focus, screen reader và tương phản thủ công.
- Locator `getByRole`, `getByLabel` cũng là một dạng kiểm tra a11y miễn phí.

## Bài tập
1. Dễ: Chạy test Bước 2 trên ba trang của site lab (ví dụ `/lab/login`, `/lab/forms`, `/lab/cart`) và ghi lại các vi phạm (nếu có). Xong khi bạn có bảng trang, số vi phạm, mức `impact`.
2. Viết test ở Bước 3 với HTML cố ý sai và thêm một lỗi thứ tư (ví dụ `<a href="#"></a>` hoặc thiếu `lang` ở `<html>`). Xong khi test kiểm tra đúng id của luật tương ứng.
3. Viết test bàn phím hoàn thành form đăng nhập ở `/lab/login` chỉ bằng `keyboard`. Xong khi bạn đăng nhập thành công mà không dùng `click`.
4. Đóng gói quét a11y thành fixture `expectNoBlockingA11yIssues` và dùng cho hai trang khác nhau. Xong khi hai spec chỉ cần một dòng gọi fixture.
5. Nâng cao: quét `/lab/forms` sau khi gửi form trống để hiện lỗi validate; so sánh kết quả với lần quét ban đầu và đính kèm JSON vào báo cáo. Xong khi báo cáo HTML có mục đính kèm vi phạm của trạng thái có lỗi.
