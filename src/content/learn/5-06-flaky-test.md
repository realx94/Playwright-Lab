---
title: Flaky test và độ ổn định
level: 5
order: 6
minutes: 50
summary: Phân loại nguyên nhân gốc của test chập chờn, tái lập có chủ đích bằng độ trễ giả, điều tra từng bước với --repeat-each, --retries và trace, rồi sửa và phòng ngừa.
keywords: [cách giảm flaky test, race condition là gì, test isolation]
---

## Mục tiêu bài học
- Định nghĩa flaky test và giải thích vì sao "thử lại cho xanh" là che lỗi chứ không sửa lỗi.
- Phân loại nguyên nhân gốc thành năm nhóm: thời gian, dữ liệu, môi trường, locator, ứng dụng.
- Tái lập một test flaky ổn định bằng `--repeat-each` và cố ý tạo độ trễ để lộ race condition.
- Điều tra từng bước với `--repeat-each`, `--retries`, `--workers=1` và trace; đọc trace để tìm nguyên nhân.
- Sửa gốc rễ (web-first assertion, cô lập dữ liệu, điều khiển đồng hồ) và đặt cơ chế cách ly test flaky có kiểm soát.

## Bạn cần chuẩn bị
- Đã học auto-wait và web-first assertion (bài 2.8, 2.9), debug và trace (bài 2.13), hooks (bài 2.11).
- Biết chạy test bằng `npx playwright test` và đọc báo cáo (bài 0.3, 2.14).
- Ví dụ trong bài chạy trên lab `/lab/orders`. Nếu bạn chạy site lab ở máy, dùng `http://localhost:3000`; nếu dùng starter repo, đặt `BASE_URL` trong file `.env`.

## Kiến thức cần nắm
- **Flaky test**: cùng code, cùng test nhưng lúc xanh lúc đỏ.
- **Race condition** (tình huống đua): kết quả phụ thuộc vào việc việc nào xong trước, ví dụ test đọc dữ liệu trước khi trang kịp cập nhật.
- Năm nhóm nguyên nhân: **thời gian**, **dữ liệu**, **môi trường**, **locator**, **ứng dụng** (bug thật ngẫu nhiên).
- **Test isolation**: mỗi test tự chuẩn bị và dọn dữ liệu, không phụ thuộc test khác.
- Công cụ: `--repeat-each`, `--retries`, `--workers=1`, `--trace on`, `npx playwright show-trace`, `testInfo.retry`.
- Playwright báo test là **flaky** khi đỏ ở lần đầu nhưng xanh khi retry; đây là tín hiệu cần điều tra, không phải kết quả "xanh".

## Giải thích dễ hiểu
Flaky test giống **cân bị lệch**: lúc cân đúng, lúc cân sai. Nếu cân không đáng tin thì không ai còn tin cân nữa. Hậu quả cụ thể: nhóm bắt đầu nói "đỏ thì chạy lại", khi đó một lỗi thật cũng bị coi là "chắc lại flaky" và lọt lên production. Vì vậy bạn không chỉ "thử lại cho xanh" mà cần tìm **vì sao cân lệch**.

Hãy hình dung ví dụ đời thường: bạn nhắn tin cho bạn và kiểm tra ngay xem bạn đã đọc chưa. Nếu bạn kiểm tra đúng một mili giây sau khi gửi thì lúc thấy "chưa đọc", lúc thấy "đã đọc" tuỳ mạng nhanh hay chậm. Cách đúng là chờ đến khi thấy "đã đọc" (có giới hạn thời gian). Test cũng vậy: đọc kết quả **ngay lập tức** khi ứng dụng cần thêm thời gian là nguyên nhân flaky phổ biến nhất.

Điều đáng nhớ là hầu hết flaky không phải lỗi ngẫu nhiên thật sự. Máy tính xác định; nếu kết quả khác nhau thì phải có một biến số bạn chưa kiểm soát: thứ tự các sự kiện, dữ liệu dùng chung, đồng hồ, tốc độ máy. Công việc của bạn là **biến cái ngẫu nhiên thành tái lập được**, rồi mới sửa. Một lỗi tái lập được là lỗi đã gần như sửa xong.

Năm nhóm nguyên nhân:

| Nhóm | Ví dụ | Dấu hiệu thường gặp |
|------|-------|---------------------|
| Thời gian | Chờ cố định `waitForTimeout`, đọc giá trị ngay không chờ, animation, tải bất đồng bộ | Đỏ ngẫu nhiên "element not found", `Expected 1 Received 0` |
| Dữ liệu | Nhiều test dùng chung một bản ghi, thứ tự chạy ảnh hưởng, dữ liệu còn sót | Đỏ khi chạy song song, xanh khi chạy một mình |
| Môi trường | CI chậm hơn máy bạn, khác múi giờ, font, mạng, tài nguyên | Đỏ trên CI, xanh ở máy |
| Locator | Khớp nhiều phần tử, phụ thuộc vị trí `nth`, text đổi theo trạng thái | `strict mode violation`, click nhầm |
| Ứng dụng | Bug thật xuất hiện không đều (race trong code ứng dụng) | Trace cho thấy ứng dụng ở trạng thái sai |

## Thực hành từng bước
Ví dụ xuyên suốt: lab `/lab/orders` (LAB-21). Khi bạn bấm **Tạo đơn**, trang gửi yêu cầu POST, hiện thông báo thành công rồi mới tải lại danh sách bằng GET. Nghĩa là có một khoảng thời gian giữa lúc thông báo hiện ra và lúc dòng đơn hàng xuất hiện trong bảng. Test đọc bảng ngay khi thấy thông báo sẽ rơi vào khoảng đó.

### Bước 1. Viết test "dễ vỡ" và quan sát
Mục đích: có một test mà ta biết có nguy cơ flaky. Tạo `tests/flaky-demo.spec.ts` (trong starter repo) hoặc `e2e/flaky-demo.spec.ts` (nếu bạn làm trong repo site):

```ts
import { test, expect, type Page } from "@playwright/test";

async function createOrder(page: Page) {
  await page.goto("/lab/orders");
  await page.getByTestId("reset-data").click();
  await page.getByLabel("Khách hàng").fill("Trần Bình");
  await page.getByRole("button", { name: "Tạo đơn" }).click();
  await expect(page.getByTestId("order-message")).toContainText("Đã tạo đơn");
}

test("dễ vỡ: đếm số dòng ngay sau thông báo", async ({ page }) => {
  await createOrder(page);
  const rows = await page.getByTestId("order-row").count(); // ảnh chụp tức thời
  expect(rows).toBe(1);
});
```

| Dòng | Ý nghĩa |
|------|---------|
| `getByTestId("reset-data").click()` | Đưa lab về dữ liệu sạch trước khi test (cách các lab dùng để bảo đảm trạng thái ban đầu). |
| `expect(order-message).toContainText(...)` | Web-first assertion: tự chờ đến khi thông báo hiện. Dòng này đúng. |
| `await page.getByTestId("order-row").count()` | `count()` **không chờ**: trả ngay số phần tử tại thời điểm gọi. Đây là điểm yếu. |
| `expect(rows).toBe(1)` | Assertion thường trên một số đã lấy, không thử lại được. |

Chạy một lần:

```bash
npx playwright test flaky-demo
```

Kết quả mong đợi: nhiều khả năng xanh vì máy nhanh. Đó chính là cái bẫy: test "đúng" ở máy bạn, nhưng chỉ do may mắn về thời gian.

### Bước 2. Tái lập bằng --repeat-each
Mục đích: biến "thỉnh thoảng đỏ" thành một con số (tỉ lệ lỗi).

```bash
npx playwright test flaky-demo --repeat-each=20 --workers=1
```

| Phần | Ý nghĩa |
|------|---------|
| `flaky-demo` | Chỉ chạy file có tên chứa chuỗi này. |
| `--repeat-each=20` | Chạy mỗi test 20 lần. Với 1 test nghĩa là 20 lần chạy độc lập. |
| `--workers=1` | Chạy lần lượt, loại trừ nguyên nhân do chạy song song, để biết lỗi nằm ở bản thân test. |

Kết quả mong đợi: dòng cuối dạng `1 failed, 19 passed` (số lần đỏ là minh hoạ; trong lần thử tác giả với 5 lần lặp có 1 lần đỏ) và ở lần đỏ có thông báo `Expected: 1 Received: 0`. Từ lúc này bạn có con số: tỉ lệ lỗi khoảng 5 phần trăm trên máy này. Nếu cả 20 lần xanh, tăng lên `--repeat-each=50`, hoặc dùng Bước 3 để làm lộ lỗi rõ hơn.

Nếu gặp lỗi `Error: No tests found`: tên lọc không khớp tên file; kiểm tra lại chuỗi hoặc đứng đúng thư mục.

### Bước 3. Khuếch đại lỗi: tạo độ trễ có chủ đích
Mục đích: máy CI chậm hơn máy bạn, nên ta mô phỏng "ứng dụng chậm" để lỗi hiện đủ rõ. Dùng `page.route` làm chậm đúng yêu cầu GET danh sách:

```ts
async function slowList(page: Page, ms: number) {
  await page.route("**/api/lab/orders", async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    const response = await route.fetch();            // server trả lời ngay
    await new Promise((r) => setTimeout(r, ms));     // nhưng trình duyệt nhận chậm
    await route.fulfill({ response });               // rồi mới giao kết quả cho trang
  });
}

test("dễ vỡ khi danh sách tải chậm", async ({ page }) => {
  await slowList(page, 800);
  await createOrder(page);
  expect(await page.getByTestId("order-row").count()).toBe(1);
});
```

| Phần | Ý nghĩa |
|------|---------|
| `page.route(pattern, handler)` | Chặn các yêu cầu mạng khớp mẫu (`**` khớp mọi tiền tố). |
| `route.request().method()` | Lấy phương thức để chỉ làm chậm GET, POST đi bình thường. |
| `route.fetch()` | Gửi yêu cầu thật tới server và lấy phản hồi. |
| `setTimeout` | Trì hoãn 800 ms **sau khi** server đã xử lý xong. Nếu chờ trước `fetch`, yêu cầu sẽ tới server muộn và có thể thấy cả đơn mới tạo, làm lỗi không hiện. |
| `route.fulfill({ response })` | Trả phản hồi (đã chờ) cho trang. |

Chạy:

```bash
npx playwright test flaky-demo --repeat-each=5 --workers=1
```

Kết quả mong đợi: test này đỏ cả 5 lần với `Expected: 1 Received: 0`, vì khi thông báo hiện ra thì danh sách mới chưa kịp tải. Bạn đã chuyển từ "5 phần trăm đỏ" sang "100 phần trăm đỏ": race condition lộ rõ ràng. Kỹ thuật này (thêm độ trễ vào phụ thuộc) là cách nhanh nhất để chứng minh nguyên nhân thời gian.

### Bước 4. Xem trace của lần đỏ
Mục đích: nhìn thấy điều gì đã xảy ra, thay vì đoán. Cấu hình `trace: "on-first-retry"` (starter repo đã có) chỉ ghi trace khi có retry, vì ghi trace ở mọi lần chạy chậm hơn. Để điều tra, chạy với retry:

```bash
npx playwright test flaky-demo --retries=1 --trace on
```

| Phần | Ý nghĩa |
|------|---------|
| `--retries=1` | Thử lại tối đa 1 lần nếu đỏ; lần chạy lại và kết quả hiển thị trong báo cáo. |
| `--trace on` | Ghi trace cho mọi lần chạy, ghi đè cấu hình. Dùng khi điều tra, không để mặc định ở CI vì tốn dung lượng. |

Mở báo cáo và trace:

```bash
npx playwright show-report
```

Kết quả mong đợi: trong báo cáo, test đỏ có thể có mục **Trace**. Bấm vào: giao diện Trace Viewer có thanh thời gian ở trên, danh sách action bên trái, ảnh chụp trang ở giữa, và các tab Network, Console, Source. Cách đọc từng bước:

1. Chọn action lỗi (dòng đỏ) ở cột trái, đọc thông báo `Expected / Received`.
2. Nhìn ảnh chụp "Before" và "After": thấy thông báo thành công nhưng bảng đơn hàng còn trống.
3. Mở tab **Network**: thấy yêu cầu `GET /api/lab/orders` còn đang chạy (hoặc hoàn thành sau thời điểm assertion).
4. Kết luận: kết quả đến sau lúc test đọc, tức là nguyên nhân thuộc nhóm thời gian.

Nếu lần đỏ không có trace: bạn chạy không có `--retries` và cấu hình là `on-first-retry`, hãy thêm `--trace on`. Có thể mở trace trực tiếp bằng `npx playwright show-trace duong-dan/trace.zip`.

### Bước 5. Sửa gốc rễ bằng web-first assertion
Mục đích: thay "ảnh chụp tức thời" bằng điều kiện tự thử lại.

```ts
test("ổn định: chờ danh sách đủ dòng", async ({ page }) => {
  await slowList(page, 800);
  await createOrder(page);
  await expect(page.getByTestId("order-row")).toHaveCount(1);
});
```

| Phần | Ý nghĩa |
|------|---------|
| `expect(locator).toHaveCount(1)` | Web-first assertion: kiểm tra lại liên tục đến khi đúng hoặc hết thời gian `expect timeout` (mặc định 5 giây). |
| Không còn `count()` rồi `toBe` | Tránh lấy giá trị một lần rồi so sánh. |

Chạy lại:

```bash
npx playwright test flaky-demo --repeat-each=20 --workers=1
```

Kết quả mong đợi: bản sửa xanh cả 20 lần, kể cả khi danh sách chậm 800 ms. Quy tắc: nếu cần chờ, hãy **chờ điều kiện** (một phần tử xuất hiện, số lượng đúng, text đúng), không chờ **thời gian**. Đừng sửa bằng `await page.waitForTimeout(1000)`: nó chỉ dời cái bẫy sang nơi khác (máy chậm hơn một giây vẫn đỏ, máy nhanh vẫn tốn một giây).

Với giá trị không phải phần tử giao diện (ví dụ gọi API rồi chờ trạng thái thay đổi), dùng `expect.poll` hoặc `toPass`:

```ts
await expect
  .poll(async () => (await request.get("/api/lab/orders")).status(), { timeout: 10_000, intervals: [500] })
  .toBe(200);
```

| Phần | Ý nghĩa |
|------|---------|
| `expect.poll(fn, opts)` | Gọi `fn` lặp lại đến khi giá trị thoả assertion hoặc hết thời gian. |
| `intervals: [500]` | Khoảng cách giữa các lần thử (ms). |
| `timeout` | Tổng thời gian tối đa. |

Repo này dùng đúng cách đó trong `e2e/guard-lab.spec.ts` để chờ hết thời gian khoá thay vì chờ cố định.

### Bước 6. Phân biệt flaky do dữ liệu bằng cách cô lập
Mục đích: khi nguyên nhân không phải thời gian, đổi cách chạy để thu hẹp nghi phạm.

```bash
# Chạy đúng một test, nhiều lần
npx playwright test -g "tên test" --repeat-each=20 --workers=1

# Chạy cả file nhưng tuần tự
npx playwright test login.spec.ts --workers=1

# Chạy song song tối đa
npx playwright test --repeat-each=10 --workers=4
```

| Phần | Ý nghĩa |
|------|---------|
| `-g "chuỗi"` (`--grep`) | Chỉ chạy test có tên khớp biểu thức. |
| `--workers=N` | Số tiến trình chạy song song. |

Cách đọc kết quả:

| Kết quả | Kết luận |
|---------|----------|
| Đỏ khi chạy một mình lặp lại | Lỗi nằm trong bản thân test (thời gian, locator). |
| Xanh một mình, đỏ khi cả file với `--workers=1` | Test phụ thuộc thứ tự hoặc trạng thái test trước để lại. |
| Xanh với `--workers=1`, đỏ khi song song | Dữ liệu hoặc tài nguyên dùng chung. |
| Chỉ đỏ trên CI | Môi trường khác (tốc độ, múi giờ, dữ liệu). |

Cách sửa nhóm dữ liệu: mỗi test dùng dữ liệu riêng (tên duy nhất như `"khach-" + Date.now()` hoặc id sinh theo `testInfo.workerIndex`), tự tạo và dọn trong `beforeEach` hoặc fixture; các lab của site có nút **Reset** (`reset-data`) và spec đáp án gọi nó ở đầu mỗi test để luôn bắt đầu từ trạng thái sạch. Nếu bắt buộc dùng tài nguyên chung, đặt nhóm test đó chạy tuần tự bằng `test.describe.configure({ mode: "serial" })`, rồi tìm cách bỏ ràng buộc đó sau.

### Bước 7. Nhóm thời gian thực: điều khiển đồng hồ thay vì chờ
Mục đích: test có nghiệp vụ theo thời gian (hết hạn OTP, đếm ngược giữ chỗ) rất dễ flaky nếu dùng giờ thật. Playwright cho phép điều khiển đồng hồ của trình duyệt. Repo dùng cách này trong `e2e/booking-lab.spec.ts` và `e2e/otp-lab.spec.ts`. Ví dụ rút gọn theo mẫu ở lab đặt vé (`/lab/booking`):

```ts
const T0 = new Date("2026-03-01T10:00:00Z");

test("giữ chỗ hiện đếm ngược 05:00", async ({ page, context }) => {
  await context.clock.setFixedTime(T0);            // cố định thời điểm hiện tại
  await page.goto("/lab/booking");
  await page.getByTestId("reset-data").click();

  await page.getByTestId("seat-B1").click();
  await page.getByRole("button", { name: "Giữ chỗ" }).click();
  await expect(page.getByTestId("hold-countdown")).toHaveText("Giữ chỗ còn 05:00");
});
```

| Phần | Ý nghĩa |
|------|---------|
| `context.clock.setFixedTime(date)` | Đặt giờ hiện tại của trang cố định tại `date`, nên kết quả không phụ thuộc giờ thật của máy. |
| Có thể dùng thêm `clock.install()` và `clock.fastForward("05:01")` | Tua nhanh thời gian để kiểm tra hết hạn mà không phải chờ 5 phút thật. |

Kết quả mong đợi: đếm ngược luôn đúng `05:00` bất kể bạn chạy lúc nào. Nguyên tắc: **điều khiển** những gì bạn có thể (giờ, dữ liệu, mạng) thay vì **chờ** chúng.

### Bước 8. Cách ly và theo dõi test flaky có kiểm soát
Mục đích: trong lúc chưa sửa xong, đừng để test flaky làm hỏng niềm tin vào cả bộ test, nhưng cũng đừng giấu nó.

```ts
test("báo cáo doanh thu đúng giờ cao điểm", { tag: "@flaky" }, async ({ page }) => {
  test.info().annotations.push({ type: "issue", description: "BUG-1234: đỏ 3 phần trăm trên CI" });
  // ...
});
```

Chạy bộ test chính loại các test này, và chạy riêng chúng:

```bash
npx playwright test --grep-invert @flaky
npx playwright test --grep @flaky --repeat-each=10
```

| Phần | Ý nghĩa |
|------|---------|
| `{ tag: "@flaky" }` | Gắn thẻ cho test. |
| `annotations.push` | Ghi chú vào báo cáo để người sau biết lý do và nơi theo dõi. |
| `--grep-invert` | Loại test khớp thẻ. |

Ngoài ra, trong config có thể đặt `retries: process.env.CI ? 2 : 0` (starter repo đã có) và `failOnFlakyTests: !!process.env.CI` nếu nhóm muốn CI coi test flaky là đỏ để buộc sửa; cờ dòng lệnh tương ứng là `--fail-on-flaky-tests`. Hãy đặt **hạn sửa** cho từng test bị cách ly (ví dụ hai tuần), nếu không nó sẽ nằm đó mãi.

Retry nên được hiểu là **công cụ phát hiện**: nhờ retry mà Playwright đánh dấu `flaky` thay vì `failed`, và bạn đếm được chúng (xem báo cáo ở bài 5.2). Nó không phải biện pháp chữa.

## Demo code
File hoàn chỉnh gom các kiểu test trong bài để bạn chạy và so sánh:

```ts
import { test, expect, type Page } from "@playwright/test";

/** Làm chậm phản hồi GET danh sách đơn hàng để lộ race condition. */
async function slowList(page: Page, ms: number) {
  await page.route("**/api/lab/orders", async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    const response = await route.fetch();
    await new Promise((r) => setTimeout(r, ms));
    await route.fulfill({ response });
  });
}

async function createOrder(page: Page) {
  await page.goto("/lab/orders");
  await page.getByTestId("reset-data").click();
  await page.getByLabel("Khách hàng").fill("Trần Bình");
  await page.getByRole("button", { name: "Tạo đơn" }).click();
  await expect(page.getByTestId("order-message")).toContainText("Đã tạo đơn");
}

// Phiên bản dễ vỡ: chỉ để minh hoạ, dự kiến đỏ khi mạng chậm.
test("DỄ VỠ: count() không chờ", async ({ page }) => {
  await slowList(page, 800);
  await createOrder(page);
  expect(await page.getByTestId("order-row").count()).toBe(1);
});

// Phiên bản ổn định: web-first assertion tự chờ.
test("ỔN ĐỊNH: toHaveCount tự chờ", async ({ page }) => {
  await slowList(page, 800);
  await createOrder(page);
  await expect(page.getByTestId("order-row")).toHaveCount(1);
});
```

Phần chú thích đi kèm: `slowList` là công cụ **tái lập**; `createOrder` là phần chuẩn bị dùng chung; hai test cùng thao tác và chỉ khác một dòng đọc kết quả. Khi chạy `npx playwright test flaky-demo --repeat-each=10 --workers=1`, test DỄ VỠ đỏ, test ỔN ĐỊNH xanh; đây là bằng chứng nguyên nhân là việc chờ, không phải "Playwright không ổn định". Sau khi hiểu, hãy xoá test DỄ VỠ khỏi bộ test chính.

## Thử ngay trong lab
Trên `/lab/orders` làm lại Bước 1 đến 5. Sau đó thử với các lab khác có thao tác bất đồng bộ: `/lab/chat` (tin nhắn đến tab khác), `/lab/webhooks` và `/lab/guard` (dùng `expect.poll` thay vì chờ cố định), `/lab/booking` và `/lab/otp` (điều khiển đồng hồ bằng `context.clock`). Mở spec đáp án tương ứng trong `e2e/` để thấy cách các test của site tránh chờ cố định.

## Quy trình điều tra tóm tắt
1. **Tái lập**: `--repeat-each=20 --workers=1` để có tỉ lệ lỗi.
2. **Khuếch đại**: thêm độ trễ bằng `page.route`, hoặc giảm tài nguyên, để lỗi hiện rõ.
3. **Cô lập**: một mình, cả file tuần tự, song song; xem lỗi xuất hiện khi nào.
4. **Xem trace** của lần đỏ: ảnh chụp, Network, Console.
5. **Phân loại** theo năm nhóm nguyên nhân rồi sửa gốc.
6. **Chứng minh**: chạy lại `--repeat-each` lớn (ít nhất 20 đến 50) xanh trước khi đóng.

## Phòng ngừa
- Không dùng `waitForTimeout`; dùng assertion tự thử lại, `expect.poll`, `toPass`.
- Không lấy giá trị bằng `count()`, `innerText()`, `isVisible()` rồi so sánh ngay khi nội dung còn thay đổi; dùng `expect(locator)...`.
- Locator hướng người dùng, tránh `nth()` và CSS mong manh (bài 2.5, 2.6).
- Mỗi test độc lập, tự chuẩn bị và dọn dữ liệu; không phụ thuộc thứ tự.
- Điều khiển giờ bằng `context.clock`; điều khiển mạng bằng `page.route` cho phụ thuộc không ổn định.
- Theo dõi tỉ lệ flaky theo thời gian và đặt ngân sách chấp nhận được (ví dụ dưới 1 phần trăm).

## Lỗi thường gặp
- Triệu chứng: `Expected: 1 Received: 0` lúc có lúc không. Nguyên nhân: đọc giá trị bằng `count()` hoặc `innerText()` ngay khi ứng dụng còn đang cập nhật. Cách sửa: dùng `await expect(locator).toHaveCount(1)` hoặc `toHaveText(...)`.
- Triệu chứng: `Error: locator.click: Test timeout of 30000ms exceeded` chỉ trên CI. Nguyên nhân: CI chậm, phần tử chưa sẵn sàng, hoặc bị che bởi lớp phủ. Cách sửa: xem trace để biết phần tử bị che bởi gì, chờ lớp phủ biến mất bằng assertion, không tăng timeout bừa.
- Triệu chứng: `strict mode violation: locator resolved to 2 elements` thỉnh thoảng. Nguyên nhân: locator mơ hồ, số phần tử thay đổi theo dữ liệu. Cách sửa: thu hẹp locator theo vùng chứa hoặc role và tên.
- Triệu chứng: đỏ khi chạy song song, xanh khi chạy riêng. Nguyên nhân: dữ liệu hoặc tài nguyên dùng chung. Cách sửa: dữ liệu riêng cho từng test, hoặc `mode: "serial"` tạm thời và có kế hoạch gỡ bỏ.
- Triệu chứng: nhóm tăng `retries` lên 5 để CI xanh. Nguyên nhân: dùng retry như thuốc giảm đau. Cách sửa: giữ `retries` nhỏ (1 đến 2), theo dõi số test flaky và sửa gốc.
- Triệu chứng: tắt test flaky bằng `test.skip` mà không ghi lại. Nguyên nhân: không có người sở hữu. Cách sửa: gắn thẻ `@flaky`, ghi issue, đặt hạn sửa.
- Triệu chứng: đổ lỗi "Playwright không ổn định". Nguyên nhân: gốc rễ thường ở dữ liệu hoặc việc chờ. Cách sửa: làm lại Bước 2 và 3 để chứng minh bằng số liệu.

## Tóm tắt
- Flaky thường có nguyên nhân xác định: thời gian, dữ liệu, môi trường, locator, ứng dụng.
- Điều tra có quy trình: tái lập (`--repeat-each`), khuếch đại (độ trễ giả), cô lập (`--workers`), xem trace, sửa, rồi chứng minh bằng lần lặp lớn.
- Chờ điều kiện (web-first assertion, `expect.poll`), đừng chờ thời gian; điều khiển giờ và mạng thay vì phụ thuộc chúng.
- Mỗi test độc lập về dữ liệu; chạy song song là phép thử tốt cho điều đó.
- Retry giúp phát hiện flaky chứ không chữa flaky; cách ly test flaky phải có chủ và hạn.
- Số liệu flaky theo thời gian là chỉ số sức khoẻ của bộ test.

## Bài tập
1. Dễ: Chạy một test của bạn với `--repeat-each=30 --workers=1` và ghi lại số lần đỏ. Xong khi bạn giải thích được kết quả (không đỏ lần nào cũng là một kết luận hợp lệ).
2. Làm Bước 1 đến 3 trên `/lab/orders`: viết test dễ vỡ, thêm `slowList`, và chứng minh nó đỏ ổn định. Xong khi test đỏ 100 phần trăm với độ trễ 800 ms.
3. Sửa test ở bài 2 bằng web-first assertion rồi chạy `--repeat-each=30`. Xong khi cả 30 lần xanh và bạn giải thích được vì sao `count()` khác `toHaveCount()`.
4. Mở trace của một lần đỏ và viết 3 câu mô tả: action nào lỗi, trạng thái trang lúc đó, yêu cầu mạng nào liên quan. Xong khi bạn chỉ đúng nguyên nhân trên tab Network.
5. Cố ý tạo flaky do dữ liệu: hai test dùng chung một tên khách hàng cố định trên một tài nguyên dùng chung ở API của bạn, chạy với `--workers=4 --repeat-each=10`, rồi sửa bằng dữ liệu riêng cho từng test. Xong khi kết quả xanh ổn định ở cả `--workers=1` và `--workers=4`.
6. Nâng cao: thêm thẻ `@flaky` cho một test chưa sửa được, tách nó khỏi bộ chính bằng `--grep-invert`, và tạo một lệnh chạy riêng cho nó. Xong khi CI chính xanh và vẫn còn một job riêng theo dõi test đó.
