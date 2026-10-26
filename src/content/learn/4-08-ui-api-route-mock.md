---
title: Kết hợp UI và API, mock mạng với page.route
level: 4
order: 8
minutes: 50
summary: Tạo dữ liệu bằng API, kiểm tra trên UI; giả lập phản hồi mạng để test tình huống lỗi.
keywords: [playwright route mock, page.route, api setup ui verify]
---

## Mục tiêu bài học
- Dùng API để **chuẩn bị dữ liệu** rồi kiểm tra kết quả trên giao diện, thay vì thao tác giao diện chậm.
- Hiểu vì sao phải dùng `page.request` (chứ không phải fixture `request`) khi dữ liệu phụ thuộc cookie của trình duyệt.
- Dùng `page.route` để chặn request và **trả phản hồi giả** (500, danh sách rỗng), **chặn hẳn** (`abort`) hoặc **sửa phản hồi thật**.
- Dùng `waitForRequest`/`waitForResponse` để kiểm tra nội dung gửi đi và nhận về khi bấm nút.
- Biết khi nào nên mock và khi nào không nên.

## Bạn cần chuẩn bị
- Đã học bài 4.1 đến 4.7, đặc biệt fixture `request` và API testing.
- Lab `/lab/orders` mở được. Trang này vừa có giao diện tạo/xoá đơn hàng, vừa gọi API `/api/lab/orders` (nên rất hợp để minh hoạ UI + API + mock).
- Biết locator `getByLabel`, `getByRole`, `getByTestId` và `expect(...).toHaveCount()`.

## Kiến thức cần nắm
- **Chuẩn bị bằng API, kiểm tra bằng UI**: nhanh và ổn định hơn dựng dữ liệu bằng thao tác giao diện.
- `page.route(url, handler)`: chặn request khớp mẫu URL để **trả phản hồi giả**, sửa hoặc chặn.
- Các hành động trong handler: `route.fulfill({ status, json })`, `route.abort()`, `route.continue()`, `route.fallback()`, `route.fetch()`.
- `page.waitForRequest` / `page.waitForResponse` để chờ một lời gọi cụ thể và kiểm tra nội dung.
- Khi nào mock: dịch vụ bên thứ ba, lỗi 500, thời gian chậm, dữ liệu khó tạo. Khi nào **không** mock: khi mục tiêu là kiểm tra tích hợp thật.
- `page.request` dùng **chung cookie** với trang; fixture `request` thì **không**.

## Giải thích dễ hiểu
Muốn xem **khách sạn xử lý thế nào khi hết phòng**, bạn không cần đặt kín mọi phòng thật. Chỉ cần nhờ lễ tân "giả vờ" báo hết phòng. `page.route` chính là nhờ lễ tân (lớp mạng) trả lời thay: giao diện nhận đúng phản hồi đó và bạn xem nó xử lý ra sao.

Hai kỹ thuật bài này giải quyết hai vấn đề khác nhau:
1. **Tạo dữ liệu nhanh (API seed).** Muốn kiểm tra "bảng đơn hàng hiển thị đúng đơn có sẵn", bạn không cần bấm form 20 lần. Gọi API tạo đơn trong vài mili giây rồi mở trang và kiểm tra. Test nhanh hơn, và nếu form tạo đơn hỏng, test "hiển thị" vẫn không đỏ oan.
2. **Tạo tình huống khó (mock).** Khó để server thật trả lỗi 500 đúng lúc bạn muốn. Với `page.route`, bạn quyết định server "trả" gì, nên kiểm tra được giao diện báo lỗi thế nào.

Điểm tinh tế cần nhớ: trình duyệt và `request` là **hai "người" khác nhau**. Trình duyệt giữ cookie của bạn; fixture `request` có hộp cookie riêng. Với lab này, trạng thái dữ liệu nằm trong cookie, nên nếu bạn tạo đơn bằng fixture `request` thì trang (dùng cookie của trình duyệt) **không thấy** đơn đó. Bạn sẽ thử và thấy điều này ở bước 3.

## Thực hành từng bước
Mọi lệnh chạy trong thư mục gốc của starter repo. Ta tạo file `tests/ui-api.spec.ts`. Trước hết nhớ giao diện `/lab/orders`: form "Tạo đơn hàng" có ô **Khách hàng**, ô **SKU dòng 1**, ô **Số lượng dòng 1**, nút **Tạo đơn**; bảng đơn hàng có dòng `order-row`; thông báo `order-message`; nút `reset-data` để về ban đầu.

### Bước 1. Test giao diện làm điểm tham chiếu
Mục đích: thấy luồng thật khi không có mock.

```ts
import { test, expect } from "@playwright/test";

test("tạo đơn bằng form", async ({ page }) => {
  await page.goto("/lab/orders");
  await page.getByTestId("reset-data").click();

  await page.getByLabel("Khách hàng").fill("Hà");
  await page.getByRole("button", { name: "Tạo đơn" }).click();

  await expect(page.getByTestId("order-message")).toContainText("Đã tạo đơn");
  await expect(page.getByTestId("order-row")).toHaveCount(1);
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `getByTestId("reset-data").click()` | Đưa dữ liệu lab về ban đầu (xoá đơn cũ) để test độc lập. |
| `getByLabel("Khách hàng").fill("Hà")` | Nhập tên khách; SKU và số lượng giữ mặc định (`SKU-A`, 1). |
| `toContainText("Đã tạo đơn")` | Thông báo thành công có dạng `Đã tạo đơn o-1001`. |

Chạy `npx playwright test tests/ui-api.spec.ts` và kết quả mong đợi: 1 test xanh.

### Bước 2. Tạo dữ liệu bằng API, kiểm tra bằng UI
Mục đích: bỏ bước bấm form; tập trung kiểm tra phần hiển thị.

```ts
const admin = { Authorization: "Bearer admin-token" };

test("đơn tạo bằng API hiện trên giao diện", async ({ page }) => {
  // 1) Chuẩn bị bằng API (dùng page.request để chung cookie với trình duyệt)
  await page.request.post("/api/lab/reset");
  const res = await page.request.post("/api/lab/orders", {
    headers: admin,
    data: { customer: "Lê Chi", items: [{ sku: "SKU-A", qty: 2 }] },
  });
  expect(res.status()).toBe(201);
  const { id } = await res.json();

  // 2) Kiểm tra bằng UI
  await page.goto("/lab/orders");
  const row = page.getByTestId("order-row").filter({ hasText: id });
  await expect(row).toContainText("Lê Chi");
  await expect(row).toContainText("200.000");
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `page.request.post(...)` | Client HTTP **gắn với context của trang**: cookie do API đặt (trạng thái đơn hàng) sẽ được trình duyệt dùng sau đó. |
| `/api/lab/reset` | Đưa dữ liệu về ban đầu qua API trước khi tạo. |
| `const { id } = await res.json()` | Lấy mã đơn do server sinh (`o-1001`) để tìm đúng dòng. |
| `filter({ hasText: id })` | Chọn dòng chứa mã đơn: không phụ thuộc vị trí hàng. |
| `"200.000"` | Giá `SKU-A` là 100.000, số lượng 2 nên tổng 200.000 (giao diện hiển thị `200.000 ₫`). |

Kết quả mong đợi: test xanh và nhanh hơn cách bấm form. Đây là mẫu cho mọi test "hiển thị": **seed bằng API, assert bằng UI**.

### Bước 3. Thấy tận mắt: fixture `request` không chia sẻ cookie với trang
Mục đích: tránh một lỗi khó hiểu.

```ts
test("fixture request không chia sẻ cookie với trang", async ({ page, request }) => {
  await request.post("/api/lab/reset");
  await request.post("/api/lab/orders", {
    headers: admin,
    data: { customer: "X", items: [{ sku: "SKU-A", qty: 1 }] },
  });

  await page.goto("/lab/orders");

  await expect(page.getByText("Chưa có đơn hàng.")).toBeVisible();
});
```

Kết quả mong đợi: test **xanh**, nghĩa là trang vẫn "chưa có đơn nào" dù API đã tạo đơn. Lý do: đơn nằm trong cookie của client `request`, còn trình duyệt có cookie riêng. Quy tắc: khi cần **trình duyệt thấy** dữ liệu bạn chuẩn bị, dùng `page.request` (hoặc `context.request`); khi chỉ test API thuần, dùng `request`. Với hệ thống thật dùng cơ sở dữ liệu chung (không dựa vào cookie), cả hai cách đều thấy cùng dữ liệu, nhưng thói quen dùng `page.request` cho dữ liệu của trang vẫn an toàn hơn vì còn dùng chung cookie đăng nhập.

### Bước 4. Mock phản hồi lỗi 500 cho lời gọi tạo đơn
Mục đích: kiểm tra giao diện báo lỗi khi máy chủ gặp sự cố.

```ts
test("hiện thông báo khi máy chủ lỗi 500", async ({ page }) => {
  await page.route("**/api/lab/orders", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({ status: 500, json: { message: "Máy chủ gặp sự cố" } });
    } else {
      await route.fallback();
    }
  });

  await page.goto("/lab/orders");
  await page.getByLabel("Khách hàng").fill("Mai");
  await page.getByRole("button", { name: "Tạo đơn" }).click();

  await expect(page.getByTestId("order-message")).toHaveText("Máy chủ gặp sự cố");
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `page.route("**/api/lab/orders", handler)` | Mọi request tới URL khớp mẫu này đi qua `handler` thay vì ra mạng. `**` khớp mọi tiền tố (host, cổng). |
| `route.request().method()` | Phương thức của request bị chặn. Trang này gọi `GET` (tải danh sách) và `POST` (tạo đơn) **cùng một URL**, nên phải phân biệt. |
| `route.fulfill({ status: 500, json: {...} })` | Trả luôn phản hồi giả: status 500 và body JSON. Playwright tự đặt `Content-Type: application/json`. |
| `route.fallback()` | "Không phải việc của tôi": chuyển request cho handler khác hoặc ra mạng thật. Ở đây `GET` đi thẳng tới server thật. |
| `toHaveText("Máy chủ gặp sự cố")` | Giao diện hiển thị `body.message` nên chuỗi khớp chính xác. |

Thứ tự **rất quan trọng**: đặt `page.route` **trước** `page.goto` (hoặc trước hành động gây gọi API). Nếu trang đã gọi API xong rồi mới đăng ký route thì không chặn được.

Kết quả mong đợi: test xanh. Nếu đỏ vì chuỗi nhận được khác chuỗi mong đợi, nghĩa là giao diện không hiện đúng `message` bạn trả; kiểm tra lại cấu trúc JSON mà trang đọc (trang này đọc `body.message`).

### Bước 5. Mock danh sách để tạo dữ liệu "khó tạo"
Mục đích: tạo một đơn hàng có tổng tiền rất lớn mà không cần dữ liệu thật.

```ts
test("giao diện hiển thị đúng đơn do mock trả về", async ({ page }) => {
  await page.route("**/api/lab/orders", (route) =>
    route.fulfill({
      json: {
        data: [{ id: "o-9", customer: "Giả lập", total: 1234000, status: "pending", items: [] }],
        total: 1,
      },
    }),
  );

  await page.goto("/lab/orders");

  await expect(page.getByTestId("order-row")).toHaveCount(1);
  await expect(page.getByTestId("order-row")).toContainText("1.234.000 ₫");
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `route.fulfill({ json })` | Không ghi `status` thì mặc định là 200. |
| Cấu trúc `{ data: [...], total }` | Đúng cấu trúc API thật trả, vì giao diện đọc `data`. Mock sai cấu trúc là nguyên nhân hay gặp khiến giao diện lỗi khác ý đồ. |
| `1234000` hiển thị `1.234.000 ₫` | Giao diện định dạng số kiểu Việt Nam. |

Chú ý: ở đây **mọi** request tới URL đó (cả `POST`) bị trả danh sách giả, vì handler không kiểm tra method. Nếu test chỉ cần thay `GET`, hãy kiểm tra `route.request().method() === "GET"` rồi `fallback()` cho phần còn lại như bước 4.

### Bước 6. Chặn hẳn request và mô phỏng mạng chập chờn
Mục đích: kiểm tra giao diện khi mạng đứt.

```ts
test("danh sách rỗng khi mạng đứt", async ({ page }) => {
  await page.route("**/api/lab/orders", (route) =>
    route.request().method() === "GET" ? route.abort("failed") : route.fallback(),
  );

  await page.goto("/lab/orders");

  await expect(page.getByTestId("order-row")).toHaveCount(0);
});
```

`route.abort("failed")` làm request thất bại như khi mất mạng (có thể thay bằng `"timedout"`, `"connectionrefused"`...). Với trang lab này, tải danh sách thất bại nên bảng không có dòng nào. Trong ứng dụng thật, đây là cách kiểm tra thông báo "Không có kết nối" và nút thử lại.

Mô phỏng **chậm** (để kiểm tra trạng thái loading), chờ trước khi chuyển tiếp:

```ts
await page.route("**/api/lab/orders", async (route) => {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // chờ 2 giây
  await route.fallback();
});
```

Dùng độ trễ cố ý như thế này **trong handler của mock** là chấp nhận được, vì bạn đang **tạo** tình huống chậm, khác với `waitForTimeout` trong test (bài Auto-wait đã khuyên tránh).

### Bước 7. Sửa phản hồi thật bằng `route.fetch`
Mục đích: giữ phần lớn dữ liệu thật nhưng đổi một phần.

```ts
test("sửa phản hồi thật: đổi tên khách", async ({ page }) => {
  await page.route("**/api/lab/orders", async (route) => {
    const response = await route.fetch();
    const json = await response.json();
    json.data = [{ id: "o-1", customer: "Sửa", total: 5000, status: "pending", items: [] }];
    await route.fulfill({ response, json });
  });

  await page.goto("/lab/orders");

  await expect(page.getByTestId("order-row")).toContainText("Sửa");
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `route.fetch()` | Gửi **request thật** tới server và nhận về `APIResponse`. |
| `await response.json()` | Đọc nội dung thật để sửa. |
| `route.fulfill({ response, json })` | Trả phản hồi dựa trên response thật (giữ status/header) nhưng thay body bằng `json` đã sửa. |

Cách này giúp mock "ít xâm lấn": ví dụ chỉ đổi một trường, còn lại là dữ liệu thật.

### Bước 8. Theo dõi request/response thật khi bấm nút
Mục đích: kiểm tra nội dung **gửi đi** và **nhận về**, không mock gì.

```ts
test("bấm Tạo đơn gửi đúng body và nhận 201", async ({ page }) => {
  await page.goto("/lab/orders");
  await page.getByTestId("reset-data").click();
  await page.getByLabel("Khách hàng").fill("Hà");

  const requestPromise = page.waitForRequest(
    (req) => req.url().endsWith("/api/lab/orders") && req.method() === "POST",
  );
  const responsePromise = page.waitForResponse(
    (res) => res.url().endsWith("/api/lab/orders") && res.request().method() === "POST",
  );

  await page.getByRole("button", { name: "Tạo đơn" }).click();

  const request = await requestPromise;
  const response = await responsePromise;

  expect(request.postDataJSON()).toEqual({ customer: "Hà", items: [{ sku: "SKU-A", qty: 1 }] });
  expect(response.status()).toBe(201);
  expect((await response.json()).total).toBe(100000);
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `waitForRequest(predicate)` | Trả về `Promise` hoàn thành khi có request thoả điều kiện. |
| Tạo `Promise` **trước** `click()` | Phải bắt đầu "nghe" trước khi bấm; nếu bấm trước rồi mới nghe, có thể bỏ lỡ request. Không `await` ngay, mà `await` sau khi bấm. |
| `req.postDataJSON()` | Đọc body request đã gửi và parse JSON: kiểm tra giao diện gửi **đúng dữ liệu**. |
| `res.request().method()` | Từ response lấy lại request để biết method. |
| `response.json()` | Body response: tổng đơn 100.000 (SKU-A giá 100.000 và số lượng 1). |

Đây là kỹ thuật kiểm tra "UI và API nói cùng một chuyện": giao diện gửi đúng, server trả đúng, và (kết hợp bước 2) bảng hiển thị đúng.

### Bước 9. Phạm vi và dọn handler
Mục đích: kiểm soát mock ảnh hưởng tới đâu.

| Công cụ | Phạm vi |
|---------|---------|
| `page.route(...)` | Chỉ trang đó. |
| `context.route(...)` | Mọi trang (tab) trong context đó, kể cả tab mới mở sau. |
| `page.unroute(url)` | Gỡ handler đã đăng ký cho URL đó. |

Nếu mẫu URL của bạn có thể khớp cả URL kèm chuỗi truy vấn (`...?bugs=BUG-01`) nhưng bạn không chắc, dùng **biểu thức chính quy** để chính xác, ví dụ `/\/api\/lab\/orders(\?.*)?$/` (khớp có hoặc không có `?...`). Khi đang gỡ lỗi, thêm một biến đếm trong handler để biết nó chạy bao nhiêu lần.

## Demo code
Một file hoàn chỉnh có hai nhóm: dùng API chuẩn bị dữ liệu, và dùng mock để kiểm tra lỗi.

```ts
import { test, expect } from "@playwright/test";

const admin = { Authorization: "Bearer admin-token" };

test.describe("UI + API", () => {
  test("đơn tạo bằng API hiện trên giao diện", async ({ page }) => {
    await page.request.post("/api/lab/reset");
    const res = await page.request.post("/api/lab/orders", {
      headers: admin,
      data: { customer: "Lê Chi", items: [{ sku: "SKU-A", qty: 2 }] },
    });
    const { id } = await res.json();

    await page.goto("/lab/orders");

    const row = page.getByTestId("order-row").filter({ hasText: id });
    await expect(row).toContainText("Lê Chi");
    await expect(row).toContainText("200.000");
  });
});

test.describe("Mock mạng", () => {
  test("lỗi 500 khi tạo đơn hiện thông báo", async ({ page }) => {
    await page.route("**/api/lab/orders", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({ status: 500, json: { message: "Máy chủ gặp sự cố" } });
      } else {
        await route.fallback();
      }
    });

    await page.goto("/lab/orders");
    await page.getByLabel("Khách hàng").fill("Mai");
    await page.getByRole("button", { name: "Tạo đơn" }).click();

    await expect(page.getByTestId("order-message")).toHaveText("Máy chủ gặp sự cố");
  });
});
```

Giải thích: nhóm 1 chứng minh dữ liệu từ API hiện đúng trên UI; nhóm 2 chứng minh UI xử lý lỗi 500. Cả hai không bấm form tạo đơn (nhóm 1) hoặc không cần server lỗi thật (nhóm 2), nên nhanh và ổn định.

## Khi không nên mock
- Khi mục tiêu chính là kiểm tra **tích hợp thật** (cần ít test, chạy ở môi trường thử): mock sẽ che mất lỗi thật giữa giao diện và máy chủ.
- Khi mock làm test không còn phản ánh hành vi thật của hệ thống (mock trả cấu trúc khác API thật). Dùng bước 8 (theo dõi request thật) hoặc kiểm tra API riêng (bài 4.7) để "chốt" cấu trúc thật.
- Khi mock quá nhiều đến mức test chỉ kiểm tra... chính cái mock.

Một cách cân bằng: mỗi luồng có **một** test thật đi qua tích hợp, các biến thể lỗi và biên kiểm tra bằng mock.

## Thử ngay trong lab
Mở `/lab/orders`, tạo một đơn bằng tay, bấm "Xem dữ liệu" ở phần "Xem DB (chỉ đọc)" để thấy cùng dữ liệu ở UI, API và DB. Sau đó thử viết test theo bước 2, rồi bật lỗi có chủ đích của lab: gọi `POST /api/lab/orders?bugs=BUG-02` để làm tổng tiền trong DB lệch so với phản hồi, và nghĩ xem bạn bắt lỗi đó ở tầng nào (UI, API hay DB).

## Lỗi thường gặp
- **Triệu chứng:** mock không có tác dụng, giao diện vẫn nhận dữ liệu thật. **Nguyên nhân:** đăng ký `page.route` **sau** khi trang đã gọi API. **Cách sửa:** đăng ký trước `goto` hoặc trước hành động gọi API.
- **Triệu chứng:** mock chặn nhầm lời gọi khác, trang vỡ. **Nguyên nhân:** mẫu URL quá rộng (ví dụ `**/api/**`) hoặc không phân biệt method. **Cách sửa:** thu hẹp mẫu URL và kiểm tra `route.request().method()`, `fallback()` cho phần còn lại.
- **Triệu chứng:** API đã tạo đơn nhưng giao diện không thấy, test đỏ mơ hồ. **Nguyên nhân:** dùng fixture `request` thay vì `page.request` cho dữ liệu phụ thuộc cookie. **Cách sửa:** dùng `page.request` hoặc `context.request`.
- **Triệu chứng:** `Error: route.fulfill: ... Route is already handled!`. **Nguyên nhân:** gọi hai hành động liên tiếp trên cùng route (ví dụ `fulfill` rồi `continue`). **Cách sửa:** mỗi route chỉ xử lý **một** lần; dùng `if/else`.
- **Triệu chứng:** `waitForResponse` hết giờ dù đã bấm nút. **Nguyên nhân:** bắt đầu nghe **sau** khi bấm, hoặc điều kiện lọc sai URL/method. **Cách sửa:** tạo promise trước `click()` và in `res.url()` để kiểm tra điều kiện.
- **Triệu chứng:** mock xong quên kiểm tra trường hợp thành công thật, nên lỗi tích hợp lọt qua. **Cách sửa:** luôn giữ ít nhất một test không mock cho mỗi luồng.

## Tóm tắt
- Seed dữ liệu bằng API rồi assert bằng UI: nhanh và ổn định hơn dựng bằng thao tác giao diện.
- `page.request` dùng chung cookie với trang; fixture `request` thì không.
- `page.route` đăng ký **trước** khi trang gọi API; trong handler dùng `fulfill`, `abort`, `fetch`, `fallback`, `continue` và phân biệt bằng `route.request().method()`.
- `waitForRequest`/`waitForResponse` phải tạo promise **trước** hành động, rồi `await` sau.
- Mock để tạo tình huống lỗi/biên; giữ vài test thật để kiểm tra tích hợp.

## Bài tập
1. Mock một phản hồi 500 cho lời gọi tạo đơn và quan sát cách giao diện xử lý. Xong khi test kiểm tra đúng thông báo hiển thị và chạy xanh 3 lần liên tiếp.
2. Dùng `waitForResponse` để kiểm tra nội dung trả về (`total`) khi bấm "Tạo đơn" với `SKU-B` số lượng 2. Xong khi bạn so khớp được tổng 500.000 và status 201.
3. Viết test: tạo hai đơn bằng `page.request`, mở `/lab/orders` và kiểm tra tiêu đề danh sách là `Đơn hàng (2)`. Xong khi test không có thao tác bấm form nào.
4. Viết test mock `GET` danh sách trả về 3 đơn giả với tổng tiền 0, 999.999, 1.000.000.000 và kiểm tra giao diện định dạng đúng. Xong khi test dùng `fallback()` cho `POST`.
5. Thử thách: dùng `route.fetch()` giữ dữ liệu thật nhưng đổi `status` của đơn đầu tiên thành `cancelled`, rồi kiểm tra giao diện hiển thị trạng thái đó. Xong khi bạn giải thích được khác biệt giữa mock hoàn toàn và sửa phản hồi thật.
