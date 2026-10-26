---
title: Auto-wait và timeout
level: 2
order: 9
minutes: 40
summary: Hiểu cơ chế chờ tự động (actionability), các loại timeout và vì sao tránh waitForTimeout; thực hành với trang tải trễ của LAB-13.
keywords: [playwright auto waiting, waitForTimeout, actionability checks]
---

## Mục tiêu bài học
- Kể được những điều kiện Playwright chờ trước khi click hoặc fill (actionability).
- Phân biệt bốn loại timeout: test, expect, action, navigation và biết chỉnh ở đâu.
- Xử lý trang chậm bằng chờ theo điều kiện thay vì `waitForTimeout`.
- Đọc được thông báo `Timeout 30000ms exceeded` và xác định đang hết giờ ở loại nào.

## Bạn cần chuẩn bị
- Đã học bài 2.7 (actions) và 2.8 (assertion).
- Site lab đang chạy (`npm run dev` ở repo site, hoặc dùng site đã deploy qua `BASE_URL`). Bài dùng LAB-13 `/lab/playground` với tham số `?delay=` để làm nội dung tải chậm có kiểm soát, và LAB-01 `/lab/login`.

## Kiến thức cần nắm
- **Actionability checks** (kiểm tra sẵn sàng): trước khi thao tác, Playwright chờ phần tử đáp ứng các điều kiện như hiển thị, ổn định, nhận được sự kiện chuột, được bật.
- Assertion web-first tự thử lại tới `expect.timeout` (mặc định 5 giây).
- Timeout của cả test (`timeout`, mặc định 30 giây) và timeout một thao tác (`actionTimeout`, mặc định không giới hạn nhưng vẫn bị chặn bởi timeout của test).
- Chờ có điều kiện: `locator.waitFor()`, `page.waitForURL()`, `page.waitForResponse()`.
- `page.waitForTimeout()` (ngủ cố định) chỉ nên dùng khi debug tạm thời.

## Giải thích dễ hiểu
Chờ cố định như `sleep 3 giây` giống **đứng đợi xe buýt đúng 3 phút rồi bỏ đi**: hôm xe đến sớm bạn phí thời gian, hôm xe trễ bạn bỏ lỡ. Chờ theo điều kiện giống **nhìn bảng điện tử rồi lên xe ngay khi xe tới**: nhanh khi đường thông, vẫn đúng khi đường tắc.

Playwright đã làm việc đó giúp bạn ở mức từng thao tác. Khi bạn gọi `click()`, Playwright không bấm ngay. Nó lặp lại: tìm phần tử, kiểm tra các điều kiện bên dưới, và chỉ bấm khi tất cả đều đạt. Nếu quá thời gian cho phép mà chưa đạt, test mới báo lỗi. Các điều kiện chính cho `click()`:

| Điều kiện | Ý nghĩa dễ hiểu |
|-----------|-----------------|
| Visible | Phần tử có kích thước, không ẩn |
| Stable | Phần tử đứng yên (không đang chạy hiệu ứng di chuyển) trong hai khung hình liên tiếp |
| Receives Events | Tại điểm sắp bấm, phần tử không bị lớp khác (modal, banner) che |
| Enabled | Không bị `disabled` |

`fill()` chờ visible và enabled và editable; `check()` cũng tương tự. Vì vậy phần lớn "bấm xong phải chờ" là không cần viết thủ công. Điều Playwright **không thể đoán** là điều kiện nghiệp vụ của bạn, ví dụ "dữ liệu đã tải xong". Với việc đó bạn dùng assertion web-first hoặc `waitFor`.

Bốn loại timeout cần phân biệt:

| Loại | Mặc định | Chỉnh ở đâu | Áp dụng cho |
|------|----------|-------------|-------------|
| Test timeout | 30 giây | `timeout` trong config, hoặc `test.setTimeout()` | Toàn bộ một test, gồm cả hooks `beforeEach` |
| Expect timeout | 5 giây | `expect: { timeout }` trong config | Mỗi assertion web-first |
| Action timeout | không giới hạn | `use: { actionTimeout }` | Mỗi `click`, `fill`... |
| Navigation timeout | không giới hạn | `use: { navigationTimeout }` | `goto`, `waitForURL`... |

"Không giới hạn" nghĩa là một thao tác có thể chờ đến khi hết timeout của cả test. Nên đặt `actionTimeout` vừa phải (10 giây) để lỗi hiện sớm và đúng chỗ.

## Thực hành từng bước

### Bước 1. Xem cấu hình timeout hiện có

Mục đích: biết repo của bạn đang dùng giá trị nào.

Mở `playwright.config.ts` (ở starter repo hoặc repo của bạn). Cấu hình mẫu của starter chưa đặt timeout riêng, tức là dùng mặc định (test 30 giây, expect 5 giây). Thêm khối dưới đây vào `defineConfig`:

```ts
export default defineConfig({
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL,
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
});
```

| Dòng | Ý nghĩa |
|------|---------|
| `timeout: 30_000` | Tối đa 30 giây cho mỗi test (dấu gạch dưới chỉ để dễ đọc số) |
| `expect: { timeout: 5_000 }` | Mỗi assertion web-first chờ tối đa 5 giây |
| `actionTimeout: 10_000` | Mỗi thao tác click/fill chờ tối đa 10 giây |
| `navigationTimeout: 15_000` | `page.goto` chờ trang tối đa 15 giây |

Kết quả mong đợi: không có gì in ra; giá trị có hiệu lực ở lần chạy sau. Nếu gặp lỗi cú pháp, đảm bảo các thuộc tính `actionTimeout` và `navigationTimeout` nằm **trong** `use`, còn `timeout` và `expect` nằm ngoài `use`.

### Bước 2. Quan sát trang tải trễ

Mục đích: thấy "dữ liệu chưa sẵn sàng" bằng mắt trước khi viết code.

Mở `/lab/playground?delay=3000` trong trình duyệt. Mục "Nội dung tải trễ (3000 ms)": bấm nút "Tải dữ liệu". Nút bị vô hiệu, dòng "Đang tải…" hiện ra; sau 3 giây hiện "Đã tải xong". Tham số `delay` tính bằng mili giây và bị chặn tối đa 10 000.

Kết quả mong đợi: bạn thấy hai trạng thái nối tiếp, "Đang tải…" rồi "Đã tải xong".

### Bước 3. Viết test cố tình sai: chờ cố định

Mục đích: hiểu vì sao `waitForTimeout` là xấu bằng cách tự gây lỗi.

```ts
import { test, expect } from "@playwright/test";

test("tải dữ liệu bằng chờ cố định (cách tệ)", async ({ page }) => {
  await page.goto("/lab/playground?delay=3000");
  await page.getByRole("button", { name: "Tải dữ liệu" }).click();

  await page.waitForTimeout(1000); // đoán mò: chờ 1 giây
  await expect(page.getByTestId("delay-result")).toBeVisible({ timeout: 100 });
});
```

Dòng `toBeVisible({ timeout: 100 })` chỉ cho 100 ms, nên test sẽ hỏng. Chạy:

```bash
npx playwright test auto-wait
```

Kết quả mong đợi (rút gọn):

```text
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('delay-result')
Expected: visible
Timeout: 100ms
Error: element(s) not found
```

Giải thích thông báo: `Locator` là phần tử đang tìm; `Timeout: 100ms` cho biết assertion hết giờ ở mức 100 ms (không phải 30 giây của test); `element(s) not found` nghĩa là phần tử chưa có trong DOM. Đây là lỗi hết giờ loại **expect timeout**. Nếu bạn nâng chờ cố định lên 4000 ms thì test xanh nhưng luôn tốn 4 giây dù trang nhanh, và vẫn đỏ khi `delay=6000`.

### Bước 4. Sửa thành chờ theo điều kiện

Mục đích: viết cách đúng, không cần biết trang chậm bao lâu.

```ts
test("tải dữ liệu bằng chờ theo điều kiện (cách tốt)", async ({ page }) => {
  await page.goto("/lab/playground?delay=3000");
  await page.getByRole("button", { name: "Tải dữ liệu" }).click();

  await expect(page.getByText("Đang tải…")).toBeVisible();
  await expect(page.getByTestId("delay-result")).toBeVisible({ timeout: 6_000 });
  await expect(page.getByTestId("delay-result")).toHaveText("Đã tải xong");
});
```

| Dòng | Giải thích |
|------|-----------|
| `toBeVisible()` cho "Đang tải…" | Khẳng định trạng thái trung gian có xuất hiện |
| `{ timeout: 6_000 }` | Nâng giới hạn **chỉ cho assertion này** vì ta biết nó cần 3 giây; 6 giây là mức dự phòng rộng rãi |
| `toHaveText("Đã tải xong")` | Khẳng định nội dung cuối |

Kết quả mong đợi: test xanh sau khoảng 3 giây. Đổi `delay=1000` thì xanh sau khoảng 1 giây mà không cần sửa test: đó chính là lợi ích của chờ theo điều kiện.

### Bước 5. `locator.waitFor()` khi chỉ cần chờ, không cần khẳng định

Mục đích: chờ một phần tử xuất hiện hoặc biến mất như một bước chuẩn bị.

```ts
const loading = page.getByText("Đang tải…");
await page.getByRole("button", { name: "Tải dữ liệu" }).click();
await loading.waitFor({ state: "visible" });
await loading.waitFor({ state: "hidden" });
```

`state` có thể là `"attached"`, `"detached"`, `"visible"`, `"hidden"`. Dùng `waitFor` khi bước kế tiếp cần phần tử vắng mặt, còn nếu mục đích là kiểm tra thì dùng `expect(...)` vì assertion nói rõ ý định hơn.

Kết quả mong đợi: lệnh thứ ba trả về ngay khi chữ "Đang tải…" hiện, lệnh thứ tư trả về khi chữ biến mất (khoảng 3 giây sau).

### Bước 6. Chờ URL và chờ phản hồi mạng

Mục đích: chờ những sự kiện không nằm trên một phần tử cụ thể.

```ts
// Chờ chuyển trang sau khi bấm một liên kết điều hướng (ví dụ trong test của ứng dụng bạn)
await page.waitForURL("**/dashboard");

// Chờ một request cụ thể xong: đăng ký chờ TRƯỚC khi gây ra request
const [res] = await Promise.all([
  page.waitForResponse((r) => r.url().includes("/api/") && r.ok()),
  page.getByRole("button", { name: "Tải dữ liệu" }).click(),
]);
```

| Phần | Giải thích |
|------|-----------|
| `waitForURL("**/dashboard")` | Chờ URL khớp mẫu glob; `**` khớp mọi tiền tố (đặt dòng này sau lệnh bấm gây chuyển trang) |
| `Promise.all([...])` | Bắt đầu chờ phản hồi **và** bấm cùng lúc, để không bỏ lỡ phản hồi đến quá nhanh |
| `r.ok()` | Trạng thái HTTP 2xx |

Lưu ý: ví dụ `/api/` chỉ minh hoạ cách viết; nút "Tải dữ liệu" của LAB-13 chỉ dùng `setTimeout` trên trình duyệt chứ không gọi mạng. Ở LAB-14 (`/lab/api`) bạn sẽ thực hành `waitForResponse` với API thật.

Kết quả mong đợi: khi chờ đúng, `res` là đối tượng `Response` và bạn có thể gọi `res.status()`. Nếu đăng ký chờ **sau** khi bấm, đôi khi bạn bị treo đến hết timeout.

### Bước 7. Chỉnh timeout cho từng test hoặc từng thao tác

Mục đích: xử lý trường hợp riêng mà không nâng timeout toàn cục.

```ts
test("báo cáo nặng", async ({ page }) => {
  test.slow(); // nhân ba timeout của test này
  // hoặc: test.setTimeout(90_000);
  await page.goto("/lab/playground?delay=8000");
  await page.getByRole("button", { name: "Tải dữ liệu" }).click();
  await expect(page.getByTestId("delay-result")).toBeVisible({ timeout: 12_000 });
});

await page.getByRole("button", { name: "Tải dữ liệu" }).click({ timeout: 2_000 });
```

`test.slow()` nhân ba timeout cho riêng test đó; `test.setTimeout(ms)` đặt giá trị cụ thể; tuỳ chọn `timeout` trên từng lệnh chỉ ảnh hưởng lệnh đó. Cách này tốt hơn tăng `timeout` trong config vì không làm các test khác chậm lỗi đi.

Kết quả mong đợi: test xanh sau khoảng 8 giây.

### Bước 8. Đọc thông báo timeout của một thao tác

Mục đích: nhận biết lỗi ở loại action, vốn hay làm bạn bối rối.

Thử cố tình click nút bị vô hiệu: sau khi bấm "Tải dữ liệu" (delay 3000), nút bị `disabled`; bấm tiếp ngay:

```ts
await page.goto("/lab/playground?delay=3000");
const load = page.getByRole("button", { name: "Tải dữ liệu" });
await load.click();
await load.click({ timeout: 1_000 });
```

Kết quả mong đợi: lỗi dạng

```text
TimeoutError: locator.click: Timeout 1000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Tải dữ liệu' })
    - locator resolved to <button disabled ...>Tải dữ liệu</button>
  - attempting click action
    2 x waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
      - waiting 20ms
```

Phần `Call log` là kho báu: nó liệt kê từng lần Playwright thử và lý do chưa bấm được ("element is not enabled", "element intercepts pointer events", "element is not stable"...). Hãy đọc nó trước khi đoán.

## Demo code

File hoàn chỉnh, chạy được trên LAB-13 và LAB-01:

```ts
import { test, expect } from "@playwright/test";

test.describe("Chờ đúng cách", () => {
  test("trang tải trễ 2 giây vẫn xanh nhờ chờ theo điều kiện", async ({ page }) => {
    await page.goto("/lab/playground?delay=2000");
    await page.getByRole("button", { name: "Tải dữ liệu" }).click();

    // Trạng thái trung gian
    await expect(page.getByText("Đang tải…")).toBeVisible();
    // Trạng thái cuối, nâng timeout riêng cho assertion này
    await expect(page.getByTestId("delay-result")).toHaveText("Đã tải xong", { timeout: 5_000 });
  });

  test("nút bị vô hiệu trong lúc tải, bật lại sau khi xong", async ({ page }) => {
    await page.goto("/lab/playground?delay=1500");
    const load = page.getByRole("button", { name: "Tải dữ liệu" });
    await load.click();
    await expect(load).toBeDisabled();
    await expect(page.getByTestId("delay-result")).toBeVisible();
    await expect(load).toBeEnabled();
  });

  test("đăng nhập: chờ dashboard thay vì ngủ", async ({ page }) => {
    await page.goto("/lab/login");
    await page.getByTestId("reset-data").click();
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByLabel("Mật khẩu").fill("Passw0rd!");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.getByTestId("dashboard")).toBeVisible({ timeout: 10_000 });
  });
});
```

Giải thích: test đầu minh hoạ nâng timeout cục bộ; test thứ hai dùng `toBeDisabled`/`toBeEnabled` để kiểm tra vòng đời nút; test cuối là mẫu chuẩn "bấm rồi chờ kết quả bằng assertion", không có `waitForTimeout`.

## Thử ngay trong lab
- Mở `/lab/playground?delay=5000` rồi bấm "Tải dữ liệu". Chạy test của bạn với `delay=500`, `delay=3000`, `delay=9000` (không đổi code test) và quan sát: test nào đỏ, ở loại timeout nào, thông báo nói gì.
- Giảm `expect.timeout` xuống 1000 trong config, chạy lại test `delay=3000` để xem lỗi `Timeout: 1000ms`, rồi sửa bằng timeout cục bộ thay vì đổi config.

## Lỗi thường gặp
- Triệu chứng: `Test timeout of 30000ms exceeded.` Nguyên nhân: tổng thời gian cả test vượt 30 giây, thường vì một bước chờ vô hạn (đăng ký `waitForResponse` quá muộn, vòng lặp dài). Sửa: tìm dòng đang chờ trong thông báo, kiểm tra điều kiện chờ có thật sự xảy ra không; chỉ dùng `test.slow()` khi test thật sự dài.
- Triệu chứng: `expect(locator).toBeVisible() failed ... Timeout: 5000ms`. Nguyên nhân: hết 5 giây của expect timeout vì dữ liệu chậm hoặc locator sai. Sửa: kiểm tra locator trước; nếu đúng và chậm thật thì nâng `{ timeout }` cho riêng assertion.
- Triệu chứng: `locator.click: Timeout ... exceeded` kèm `element intercepts pointer events`. Nguyên nhân: một banner hoặc modal che nút. Sửa: đóng lớp che trước, đừng dùng `{ force: true }` để lách trừ khi có chủ ý.
- Triệu chứng: rắc `page.waitForTimeout(2000)` khắp nơi nên bộ test chậm nhưng vẫn flaky. Nguyên nhân: đoán thời gian. Sửa: thay bằng assertion hoặc `waitFor` cho điều kiện bạn thật sự đợi.
- Triệu chứng: `page.waitForLoadState("networkidle")` không bao giờ xong. Nguyên nhân: trang có kết nối kéo dài (websocket, polling). Sửa: chờ phần tử hoặc phản hồi cụ thể; Playwright cũng khuyên không dùng `networkidle` để quyết định sẵn sàng.
- Triệu chứng: tăng `timeout` toàn cục lên 120 giây cho "chắc". Nguyên nhân: che một vấn đề cục bộ. Sửa: tăng cục bộ bằng `test.slow()` hoặc `{ timeout }`.

## Tóm tắt
- Mỗi thao tác tự chờ visible, stable, nhận được sự kiện, enabled; bạn hiếm khi cần chờ thủ công.
- Có bốn timeout: test (30 giây), expect (5 giây), action và navigation (mặc định không giới hạn); đọc dòng `Timeout` để biết loại nào.
- Chờ điều kiện bằng assertion web-first, `locator.waitFor`, `waitForURL`, `waitForResponse`.
- Đăng ký chờ sự kiện trước khi gây ra sự kiện (`Promise.all`).
- Tăng timeout cục bộ thay vì toàn cục; tránh `waitForTimeout` và `networkidle`.

## Bài tập
1. (Dễ) Thêm `expect: { timeout: 5_000 }` và `actionTimeout: 10_000` vào config; chạy test bất kỳ để chắc không lỗi cấu hình. Xong khi test vẫn xanh.
2. (Dễ) Viết test cho `/lab/playground?delay=2000` dùng assertion chờ "Đã tải xong". Xong khi test xanh với `delay` bằng 500, 2000 và 4000 (chỉ đổi URL, nâng timeout cục bộ khi cần).
3. (Vừa) Cố tình viết cách tệ bằng `waitForTimeout(1000)` với `delay=3000`, ghi lại thông báo lỗi, rồi sửa. Xong khi bạn giải thích được từng dòng của `Call log` hoặc `Timeout`.
4. (Vừa) Tìm mọi `waitForTimeout` trong test cũ của bạn và thay bằng chờ theo điều kiện. Xong khi không còn lệnh nào trong thư mục tests.
5. (Khó) Dùng `test.slow()` và timeout cục bộ cho trường hợp `delay=8000`; đo thời gian chạy bằng reporter `list`. Xong khi test xanh và các test khác không bị đổi timeout.
