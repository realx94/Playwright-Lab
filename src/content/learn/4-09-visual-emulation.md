---
title: So sánh ảnh và giả lập thiết bị
level: 4
order: 9
minutes: 50
summary: Visual comparison với toHaveScreenshot, giả lập thiết bị, ngôn ngữ, múi giờ và vị trí.
keywords: [visual regression testing, playwright emulation, toHaveScreenshot]
---

## Mục tiêu bài học
- Hiểu so sánh ảnh (visual regression) bắt được loại lỗi nào mà assertion chữ không bắt được, và khi nào **không** nên dùng.
- Tạo ảnh chuẩn (baseline) bằng `toHaveScreenshot`, đọc kết quả khi lệch (ảnh expected, actual, diff) và cập nhật ảnh có chủ đích.
- Làm ảnh chụp ổn định: cố định viewport, tắt animation, che phần động bằng `mask`, đặt ngưỡng sai khác.
- Giả lập môi trường người dùng: `viewport`, thiết bị (`devices`), `locale`, `timezoneId`, `geolocation` + `permissions`, `colorScheme`.
- Dùng giả lập để kiểm tra lab đa ngôn ngữ/responsive (`/lab/i18n`) và lab múi giờ (`/lab/timezone`).

## Bạn cần chuẩn bị
- Đã học bài 4.4 (config, `projects`, `devices`) và bài 4.1 đến 4.3 (Page Object, fixture).
- Starter repo chạy được; Chromium đã cài (`npx playwright install chromium` nếu cần).
- Biết cơ bản `test.use(...)`, `test.describe` và cách chạy `npx playwright test`.

## Kiến thức cần nắm
- `expect(page).toHaveScreenshot("ten.png")` hoặc `expect(locator).toHaveScreenshot(...)` so ảnh hiện tại với ảnh chuẩn (baseline).
- Lần đầu chưa có ảnh chuẩn: Playwright **ghi ảnh ra** và báo test thất bại một lần; lần sau mới so sánh.
- Ngưỡng sai khác: `maxDiffPixelRatio` (tỉ lệ điểm ảnh khác), `maxDiffPixels`, `threshold`.
- Cố định yếu tố thay đổi: viewport, font, animation (`animations: "disabled"`), dữ liệu động (ngày giờ) bằng `mask`.
- Giả lập: `devices["Pixel 7"]`, `viewport`, `locale`, `timezoneId`, `geolocation`, `permissions`, `colorScheme`, `page.emulateMedia(...)`.
- Ảnh chuẩn **phụ thuộc hệ điều hành, trình duyệt và font**: tên file có hậu tố như `-chromium-win32.png`, `-chromium-linux.png`.

## Giải thích dễ hiểu
So sánh ảnh giống **trò chơi tìm điểm khác nhau** giữa hai bức tranh: bản chuẩn và bản mới. Máy tìm giúp bạn mọi pixel khác nhau. Vì vậy nếu tranh có phần luôn thay đổi (đồng hồ), bạn phải **che nó đi**, nếu không máy sẽ luôn báo "khác".

Vì sao cần? Assertion kiểu `toHaveText` chỉ biết chữ đúng hay sai. Nó **không** thấy nút bị đè lên nhau, màu chữ trắng trên nền trắng, hình bị lệch 200 pixel, hay cột bị xuống dòng sai. Đó là những lỗi giao diện rất thật mà người dùng thấy ngay. So sánh ảnh bắt được chúng, nhưng đổi lại có chi phí: dễ "đỏ oan" khi có thay đổi vô hại (đổi font, đổi hệ điều hành, hiệu ứng chuyển động), và phải bảo trì ảnh chuẩn. Quy tắc thực tế: dùng cho **vài màn hình ổn định, quan trọng** (trang chủ, bảng giá, hoá đơn); đừng áp dụng cho mọi trang.

Phần giả lập (emulation) trả lời câu hỏi khác: "ứng dụng chạy thế nào với người dùng ở nơi khác, thiết bị khác?". Thay vì mua điện thoại hay đổi múi giờ máy tính, bạn nói với Playwright: "hãy giả vờ trình duyệt này là Pixel 7, ngôn ngữ vi-VN, múi giờ New York". Trang web đọc `navigator.language`, `Intl`, kích thước màn hình... sẽ nhận đúng những giá trị đó.

## Thực hành từng bước
Ta dùng hai lab có sẵn: `/lab/i18n` (cửa hàng mẫu đa ngôn ngữ, có `store-title`, bảng sản phẩm `product-table`, thẻ sản phẩm `product-card` trên màn hình hẹp) và `/lab/timezone` (đặt lịch theo múi giờ, có `tz-current`). Tạo file `tests/visual.spec.ts`.

### Bước 1. Chụp ảnh chuẩn đầu tiên cho một phần tử
Mục đích: tạo baseline và hiểu cách đặt tên.

```ts
import { test, expect } from "@playwright/test";

test.use({ locale: "vi-VN", viewport: { width: 1024, height: 768 } });

test("bảng sản phẩm không đổi ngoài ý muốn", async ({ page }) => {
  await page.goto("/lab/i18n");
  await expect(page.getByTestId("store-title")).toBeVisible();

  await expect(page.getByTestId("product-table")).toHaveScreenshot("product-table.png");
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `test.use({ locale, viewport })` | Cố định ngôn ngữ và kích thước cửa sổ cho cả file, để ảnh chụp **giống nhau mọi lần**. Kích thước khác nhau cho ảnh khác nhau. |
| `await expect(...store-title).toBeVisible()` | Chờ trang vẽ xong **trước** khi chụp; chụp khi trang đang tải sẽ ra ảnh dở dang. |
| `expect(locator).toHaveScreenshot("...")` | Chụp **chỉ phần tử đó** (nhỏ hơn, ổn định hơn chụp cả trang). Tên file do bạn đặt. |

Chạy lần đầu:

```bash
npx playwright test tests/visual.spec.ts
```

Kết quả mong đợi: test **đỏ** với thông báo kiểu:

```text
Error: A snapshot doesn't exist at ...\tests\visual.spec.ts-snapshots\product-table-chromium-win32.png, writing actual.
```

Đây là hành vi bình thường: chưa có ảnh chuẩn nên Playwright tạo ra ảnh và báo lỗi một lần để bạn biết. Chạy lại lần nữa, test xanh. Thư mục `tests/visual.spec.ts-snapshots/` giờ chứa ảnh chuẩn; tên có `chromium-win32` (Windows), `chromium-darwin` (macOS) hoặc `chromium-linux`. **Hãy mở ảnh xem** để chắc đây đúng là giao diện mong muốn trước khi tin nó là "chuẩn".

Nếu gặp lỗi: `Screenshot comparison failed ... pixels (ratio 0.01 of all image pixels) are different` ngay lần chạy thứ hai nghĩa là trang chưa ổn định (còn animation, đang tải font); xem bước 3.

### Bước 2. Chụp cả trang và đặt ngưỡng sai khác
Mục đích: bắt lỗi bố cục toàn trang, chấp nhận sai khác rất nhỏ.

```ts
test("toàn trang cửa hàng giữ nguyên bố cục", async ({ page }) => {
  await page.goto("/lab/i18n");
  await expect(page.getByTestId("store-title")).toBeVisible();

  await expect(page).toHaveScreenshot("store-full.png", {
    fullPage: true,
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });
});
```

| Tuỳ chọn | Ý nghĩa |
|----------|---------|
| `fullPage: true` | Chụp toàn bộ chiều cao trang (kể cả phần cuộn), không chỉ phần nhìn thấy. |
| `animations: "disabled"` | Dừng mọi hiệu ứng CSS (đưa về trạng thái cuối) để ảnh không phụ thuộc thời điểm chụp. |
| `maxDiffPixelRatio: 0.01` | Cho phép tối đa 1% điểm ảnh khác. Đặt **nhỏ nhất có thể**; đặt lớn sẽ che mất lỗi thật. |

Các ngưỡng thay thế: `maxDiffPixels: 100` (số điểm ảnh tuyệt đối), `threshold: 0.2` (độ khác biệt màu của từng điểm ảnh, từ 0 đến 1). Có thể đặt mặc định cho cả dự án trong `playwright.config.ts`:

```ts
expect: {
  toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" },
},
```

### Bước 3. Che phần động bằng `mask`
Mục đích: ảnh có ngày giờ, số ngẫu nhiên, quảng cáo thì phải che chúng.

```ts
test("che phần ngày cập nhật khi so ảnh", async ({ page }) => {
  await page.goto("/lab/i18n");
  await expect(page.getByTestId("store-title")).toBeVisible();

  await expect(page).toHaveScreenshot("store-masked.png", {
    mask: [page.getByTestId("date-short")],
  });
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `mask: [locator, ...]` | Vẽ một hình chữ nhật màu đè lên các phần tử này **trước khi** chụp, cả ảnh chuẩn lẫn ảnh mới. Nội dung bên dưới bị bỏ qua khi so sánh. |
| `date-short` | Dòng ngày cập nhật của cửa hàng mẫu; trong ứng dụng thật, đây là loại phần tử thay đổi mỗi lần. |

Mẹo ổn định thêm: (1) chờ ảnh/phông chữ tải xong; (2) dùng dữ liệu cố định (reset lab, dữ liệu seed); (3) dùng `page.clock` để cố định thời gian nếu trang hiển thị giờ hiện tại (bài thao tác thời gian).

### Bước 4. Đọc kết quả khi test đỏ và cập nhật ảnh chuẩn
Mục đích: biết cách đọc lỗi và quyết định ảnh chuẩn mới đúng hay sai.

Cố ý làm lệch ảnh: mở `/lab/i18n` bằng ngôn ngữ khác (ví dụ đổi `locale` thành `en-US` ở `test.use`) rồi chạy lại. Test đỏ, kèm đường dẫn ba ảnh trong `test-results/`:

```text
tests\visual.spec.ts-snapshots\product-table-chromium-win32.png   ảnh chuẩn (expected)
test-results\...\product-table-actual.png                          ảnh vừa chụp (actual)
test-results\...\product-table-diff.png                            ảnh khác biệt (điểm khác tô đỏ)
```

Mở báo cáo HTML để xem cạnh nhau:

```bash
npx playwright show-report
```

Trong báo cáo, test lỗi có các tab so sánh (**Diff**, **Actual**, **Expected**, **Side by side**, **Slider**) giúp thấy ngay chỗ khác. Có hai khả năng:
1. **Thay đổi ngoài ý muốn** (lỗi thật): sửa ứng dụng; **không** cập nhật ảnh.
2. **Thay đổi có chủ đích** (giao diện mới): cập nhật ảnh chuẩn.

Cập nhật ảnh chuẩn sau khi thay đổi giao diện **có chủ đích**:

```bash
npx playwright test tests/visual.spec.ts --update-snapshots
```

| Cờ | Ý nghĩa |
|----|---------|
| `--update-snapshots` | Ghi đè mọi ảnh chuẩn của các test đang chạy bằng ảnh hiện tại. Nên giới hạn bằng đường dẫn file hoặc `-g "tên test"` để khỏi cập nhật ngoài ý muốn. |

Ảnh chuẩn là **mã nguồn**: commit vào Git và **review** như code (xem ảnh trong Pull Request). Chạy `--update-snapshots` bừa bãi sẽ chấp nhận cả lỗi thật làm "chuẩn mới".

### Bước 5. Giả lập thiết bị bằng `devices`
Mục đích: kiểm tra giao diện trên điện thoại.

```ts
import { test, expect, devices } from "@playwright/test";

test.use({ ...devices["Pixel 7"], locale: "vi-VN" });

test("điện thoại: menu thu gọn và sản phẩm dạng thẻ", async ({ page }) => {
  await page.goto("/lab/i18n");

  await expect(page.getByTestId("menu-button")).toBeVisible();
  await expect(page.getByTestId("product-card")).toHaveCount(3);
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `devices["Pixel 7"]` | Bộ thông số của điện thoại: kích thước viewport, `userAgent`, `deviceScaleFactor`, `isMobile`, `hasTouch`. |
| `...devices[...]` rồi `locale` | Trải thông số thiết bị rồi thêm/ghi đè `locale`. |
| `menu-button` hiện, `product-card` có 3 | Ở màn hẹp (dưới 640 px), lab hiện nút menu và danh sách sản phẩm dạng thẻ thay vì bảng. |

**Lưu ý quan trọng**: `test.use({ ...devices[...] })` phải đặt ở **đầu file** (ngoài mọi `describe`). Đặt bên trong `describe` báo lỗi:

```text
Cannot use({ defaultBrowserType }) in a describe group, because it forces a new worker.
Make it top-level in the test file or put in the configuration file.
```

Cách tốt hơn khi dùng thường xuyên: khai báo `projects` trong config (bài 4.4) như `{ name: "mobile", use: { ...devices["Pixel 7"] } }`, rồi chạy `npx playwright test --project=mobile`.

Nếu chỉ cần đổi kích thước: `test.use({ viewport: { width: 390, height: 844 } })`, hoặc trong một test `await page.setViewportSize({ width: 639, height: 800 })`. Với lab i18n, 639 px là màn hẹp (menu thu gọn) và 640 px là màn rộng (thanh điều hướng đầy đủ).

### Bước 6. Giả lập ngôn ngữ và múi giờ
Mục đích: kiểm tra định dạng số, tiền, ngày và giờ theo vùng.

```ts
test.describe("trình duyệt tiếng Việt", () => {
  test.use({ locale: "vi-VN", viewport: { width: 1024, height: 768 } });

  test("tiền và ngày theo kiểu Việt Nam", async ({ page }) => {
    await page.goto("/lab/i18n");

    await expect(page.getByTestId("store-title")).toHaveText("Cửa hàng mẫu");
    await expect(page.getByTestId("product-row").nth(1)).toContainText("1.250.000 ₫");
  });
});

test.describe("trình duyệt múi giờ New York", () => {
  test.use({ timezoneId: "America/New_York" });

  test("lab múi giờ nhận ra múi giờ của trình duyệt", async ({ page }) => {
    await page.goto("/lab/timezone");
    await page.getByTestId("reset-data").click();

    await expect(page.getByTestId("tz-current")).toContainText("America/New_York");
  });
});
```

| Tuỳ chọn | Ý nghĩa |
|----------|---------|
| `locale: "vi-VN"` | Đặt `navigator.language` và định dạng `Intl` (số dùng dấu chấm ngăn hàng nghìn, tiền kèm `₫`). Nhiều site đọc nó để chọn ngôn ngữ giao diện. |
| `timezoneId: "America/New_York"` | Đặt múi giờ của trình duyệt (tên IANA). Giờ hiển thị và `new Date()` đổi theo. |
| `getByTestId("product-row").nth(1)` | Dòng thứ hai (đếm từ 0) trong bảng sản phẩm; chứa giá `1.250.000 ₫`. |

Đổi `locale` thành `"en-US"` thì cùng trang hiện `Sample store` và giá `₫1,250,000`. Đó chính là loại lỗi mà test đa ngôn ngữ cần bắt.

### Bước 7. Giả lập vị trí (geolocation) và quyền
Mục đích: kiểm tra tính năng dùng vị trí mà không cần đi đâu.

```ts
test.describe("vị trí TP.HCM", () => {
  test.use({
    geolocation: { latitude: 10.7769, longitude: 106.7009 },
    permissions: ["geolocation"],
  });

  test("trang đọc được vị trí giả lập", async ({ page, context }) => {
    await page.goto("/lab/i18n");

    const position = await page.evaluate(
      () =>
        new Promise<{ lat: number; lng: number }>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            reject,
          ),
        ),
    );
    expect(position).toEqual({ lat: 10.7769, lng: 106.7009 });

    // Đổi vị trí giữa chừng (ví dụ "người dùng di chuyển ra Hà Nội")
    await context.setGeolocation({ latitude: 21.0278, longitude: 105.8342 });
  });
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `geolocation: { latitude, longitude }` | Toạ độ giả; **không** có `permissions` thì trình duyệt vẫn hỏi/từ chối. |
| `permissions: ["geolocation"]` | Cấp sẵn quyền dùng vị trí, tránh hộp thoại hỏi quyền. |
| `page.evaluate(() => ...)` | Chạy JavaScript **trong trang** và trả giá trị về test. `getCurrentPosition` dùng callback nên bọc trong `Promise`. |
| `context.setGeolocation(...)` | Đổi vị trí khi test đang chạy. |

Lưu ý: vị trí chỉ hoạt động trên trang "an toàn" (HTTPS hoặc `localhost`). Với site thử nghiệm dùng HTTP thường, trình duyệt có thể chặn.

### Bước 8. Chế độ tối và các tuỳ chọn hiển thị
Mục đích: kiểm tra ứng dụng theo thiết lập hệ thống của người dùng.

```ts
test("giả lập chế độ tối và giảm chuyển động", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/lab/i18n");

  const dark = await page.evaluate(() => matchMedia("(prefers-color-scheme: dark)").matches);
  expect(dark).toBe(true);
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `page.emulateMedia({ colorScheme, reducedMotion })` | Đổi giá trị mà CSS media query nhìn thấy (`prefers-color-scheme`, `prefers-reduced-motion`). |
| `colorScheme: "dark"` | Giả lập hệ thống đang dùng chế độ tối. Cũng đặt được ở `test.use({ colorScheme: "dark" })`. |

Kết hợp với so sánh ảnh: tạo hai ảnh chuẩn `store-light.png` và `store-dark.png` bằng hai test dùng `colorScheme` khác nhau.

## Demo code
Gộp lại thành một file `tests/visual.spec.ts` tham khảo (ảnh chuẩn sinh ra ở lần chạy đầu):

```ts
import { test, expect } from "@playwright/test";

test.describe("Visual và giả lập trên lab i18n", () => {
  test.use({ locale: "vi-VN", viewport: { width: 1024, height: 768 } });

  test("bảng sản phẩm không đổi ngoài ý muốn", async ({ page }) => {
    await page.goto("/lab/i18n");
    await expect(page.getByTestId("store-title")).toBeVisible();

    await expect(page.getByTestId("product-table")).toHaveScreenshot("product-table.png");
  });

  test("toàn trang, che ngày cập nhật", async ({ page }) => {
    await page.goto("/lab/i18n");
    await expect(page.getByTestId("store-title")).toBeVisible();

    await expect(page).toHaveScreenshot("store-full.png", {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.01,
      mask: [page.getByTestId("date-short")],
    });
  });

  test("tiền theo định dạng Việt Nam", async ({ page }) => {
    await page.goto("/lab/i18n");

    await expect(page.getByTestId("product-row").nth(1)).toContainText("1.250.000 ₫");
  });
});
```

Giải thích: nhóm này gom cả ba kiểu kiểm tra: ảnh phần tử, ảnh toàn trang có che phần động, và assertion chữ theo `locale`. Hai test đầu cần ảnh chuẩn nên lần chạy đầu sẽ ghi ảnh; test thứ ba chạy ngay.

## Thử ngay trong lab
1. `/lab/i18n`: chọn ngôn ngữ "English" bằng ô **Ngôn ngữ**, quan sát chuỗi, giá, ngày và số nhiều (`1 mục`/`2 mục` so với `1 item`/`2 items`). Thử bật `?bugs=BUG-01` (bỏ qua ngôn ngữ trình duyệt) và `?bugs=BUG-03` (cuộn ngang ở màn 320 px), rồi viết test ảnh hoặc test kích thước để bắt chúng.
2. `/lab/timezone`: chạy cùng một test với `timezoneId` là `Asia/Ho_Chi_Minh` và `America/New_York`, so sánh giờ các khung hiển thị (cùng một thời điểm UTC nhưng giờ địa phương khác).
3. Đổi viewport giữa 639 và 640 px trên `/lab/i18n` để thấy điểm gãy giao diện.

## Lưu ý quan trọng
- Ảnh chuẩn **phụ thuộc hệ điều hành và font**; nên tạo và so sánh trên **cùng môi trường** (ví dụ cùng một Docker image hoặc cùng runner CI Linux). Ảnh tạo trên Windows sẽ lệch so với ảnh chạy trên Linux CI.
- Một cách làm phổ biến: chạy bước tạo ảnh chuẩn **trong chính CI** (hoặc Docker của Playwright, ví dụ `mcr.microsoft.com/playwright`) rồi commit; developer chỉ chạy test thị giác trên CI.
- Chỉ dùng cho những màn hình **ổn định**; đừng áp dụng cho mọi trang.
- Ảnh baseline cũng là mã nguồn: review khi cập nhật, và dọn ảnh không dùng nữa.

## Lỗi thường gặp
- **Triệu chứng:** test đỏ chập chờn, `pixels ... are different` ở những lần chạy khác nhau. **Nguyên nhân:** so sánh trang có dữ liệu thay đổi mỗi lần (ngày giờ, số ngẫu nhiên) hoặc còn animation. **Cách sửa:** `mask`, `animations: "disabled"`, dữ liệu cố định, chờ trang ổn định.
- **Triệu chứng:** ảnh chuẩn tạo trên Windows nhưng CI Linux luôn đỏ, hoặc thấy `A snapshot doesn't exist at ...-linux.png`. **Nguyên nhân:** ảnh chuẩn theo hệ điều hành. **Cách sửa:** tạo ảnh chuẩn trong cùng môi trường với nơi chạy.
- **Triệu chứng:** `Cannot use({ defaultBrowserType }) in a describe group`. **Nguyên nhân:** đặt `test.use({ ...devices[...] })` trong `describe`. **Cách sửa:** đặt ở đầu file hoặc dùng `projects`.
- **Triệu chứng:** vị trí giả lập không có hiệu lực, `getCurrentPosition` bị từ chối. **Nguyên nhân:** thiếu `permissions: ["geolocation"]` hoặc trang HTTP không an toàn. **Cách sửa:** thêm quyền và dùng HTTPS/`localhost`.
- **Triệu chứng:** chạy `--update-snapshots` rồi test xanh nhưng giao diện thật đã vỡ. **Nguyên nhân:** cập nhật ảnh chuẩn mà không xem lại. **Cách sửa:** luôn xem ảnh `diff`/`actual` trước, review ảnh trong Pull Request.
- **Triệu chứng:** ảnh chuẩn đổi mỗi khi người khác chạy máy khác. **Nguyên nhân:** khác độ phân giải hoặc font. **Cách sửa:** đặt `viewport` cố định trong test, dùng chung môi trường chạy.

## Tóm tắt
- `toHaveScreenshot` bắt lỗi giao diện mà assertion chữ không thấy, nhưng đắt: chỉ dùng cho vài màn hình ổn định.
- Làm ảnh ổn định bằng viewport cố định, `animations: "disabled"`, `mask` phần động, ngưỡng `maxDiffPixelRatio` nhỏ.
- Lần đầu chưa có ảnh chuẩn nên test đỏ một lần; cập nhật có chủ đích bằng `--update-snapshots` và review như code.
- Ảnh chuẩn phụ thuộc hệ điều hành và font: tạo và so sánh trên cùng môi trường.
- Giả lập `devices`, `viewport`, `locale`, `timezoneId`, `geolocation` + `permissions`, `colorScheme`; `devices` phải đặt ở đầu file hoặc trong `projects`.

## Bài tập
1. Chụp baseline cho bảng sản phẩm của `/lab/i18n`, rồi đổi `locale` thành `en-US` để thấy test đỏ và mở báo cáo xem ảnh diff. Xong khi bạn chỉ ra được vùng khác trong ảnh diff và khôi phục lại cho xanh.
2. Viết test chạy trên project `mobile` (Pixel 7) kiểm tra `menu-button` hiện và có 3 `product-card`. Xong khi `npx playwright test --project=mobile` xanh.
3. Viết hai test `/lab/timezone` với `Asia/Ho_Chi_Minh` và `America/New_York`, kiểm tra `tz-current` hiện đúng tên múi giờ. Xong khi cả hai xanh và bạn giải thích được vì sao giờ khung đầu khác nhau (cùng một thời điểm UTC).
4. Viết test geolocation: cấp quyền, đặt toạ độ TP.HCM, đọc lại bằng `getCurrentPosition`, rồi đổi sang Hà Nội bằng `context.setGeolocation`. Xong khi cả hai lần đọc đúng toạ độ.
5. Thử thách: tạo hai ảnh chuẩn sáng/tối của một trang (dùng `colorScheme`), che phần ngày giờ bằng `mask`, và chạy 3 lần liên tiếp đều xanh. Xong khi bạn viết được 3 dòng giải thích vì sao phải tạo ảnh trên cùng môi trường với CI.
