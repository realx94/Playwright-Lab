---
title: "Mock API nâng cao: sửa request/response và HAR"
level: 4
order: 15
minutes: 70
summary: Chặn và sửa request, sửa response thật bằng route.fetch, trả JSON từ file, mô phỏng lỗi 500/422/timeout/chậm, ghi và phát lại HAR bằng routeFromHAR, và quyết định khi nào mock.
keywords: [playwright mock api, route.fetch, route.fulfill path, routeFromHAR, har file, mock timeout, network mocking]
---

## Mục tiêu bài học
- Chọn đúng công cụ trong bộ `route`: `fulfill` (trả giả), `fetch` rồi `fulfill` (sửa phản hồi thật), `continue` (sửa request), `abort` (chặn), `fallback` (chuyển tiếp).
- Trả dữ liệu mock **từ file JSON** thay vì viết dài trong code test.
- Mô phỏng các tình huống khó tạo ở server thật: lỗi `422` có `errors`, lỗi `500`, mất mạng/timeout, phản hồi chậm, lỗi chỉ xảy ra **một lần**.
- Ghi lại lưu lượng mạng thành file **HAR** (`update: true`) và phát lại ổn định bằng `page.routeFromHAR`, hiểu `notFound`.
- Quyết định có cơ sở khi nào dùng mock, khi nào gọi API thật.

## Bạn cần chuẩn bị
- Đã học **bài 4.8** (`page.route`, `fulfill`, `abort`, `route.fetch` cơ bản, `waitForRequest`/`waitForResponse`). Bài này đào sâu và không dạy lại các ví dụ cơ bản đó; thiếu nền thì xem lại bài 4.8 trước.
- Lab `/lab/orders` mở được. Trang này gọi `GET /api/lab/orders` khi tải và `POST /api/lab/orders` khi bấm **Tạo đơn**, nên rất hợp để thực hành. (Các lab `table` và `dashboard` xử lý dữ liệu ngay trong trình duyệt, không gọi API nên không có gì để mock; lab `api` chỉ có trang tài liệu. Vì vậy bài dùng `orders`.)
- Biết `expect(locator)`, `getByLabel`, `getByRole`, `getByTestId`.

## Kiến thức cần nắm
- `page.route(url, handler, { times })`: handler chạy mỗi khi một request khớp URL; `times` giới hạn số lần handler được gọi.
- Trong handler chỉ chọn **một** kết cục cho request: `fulfill`, `continue`, `abort` hoặc `fallback`.
- `route.fetch(options?)` gửi request thật (có thể đổi `url`, `headers`, `method`, `postData`) và trả `APIResponse` để bạn sửa.
- `route.fulfill({ path })` đọc nội dung từ file; kiểu nội dung suy ra từ đuôi file.
- HAR (HTTP Archive) là file JSON ghi lại các request và response. `page.routeFromHAR` phát lại; `update: true` ghi mới.
- Handler đăng ký **sau** được thử **trước**; `fallback()` chuyển sang handler đăng ký trước đó.
- Mock càng nhiều, test càng xa thực tế: phải có lý do rõ ràng.

## Giải thích dễ hiểu
Hãy tưởng tượng bạn là **nhân viên kiểm soát** đứng giữa một khách hàng (giao diện) và nhà kho (server), mọi phiếu đều đi qua tay bạn. Với mỗi phiếu bạn có năm lựa chọn: tự soạn một phản hồi giả (`fulfill`), chuyển phiếu cho nhà kho rồi đọc và **chỉnh lại** hàng trả ra (`fetch` rồi `fulfill`), sửa phiếu trước khi chuyển đi (`continue` với nội dung mới), xé phiếu như thể đường dây đứt (`abort`), hoặc để cấp khác xử lý (`fallback`).

Vì sao cần những kỹ thuật này? Vì có những tình huống rất khó tạo bằng server thật: server trả `500` đúng lúc bạn muốn, mạng chập chờn, phản hồi mất 8 giây, danh sách có 10.000 dòng, dịch vụ bên thứ ba bị lỗi. Với `route`, bạn **quyết định** server "nói" gì và xem giao diện phản ứng ra sao.

**HAR** giải quyết một vấn đề khác: ổn định và tốc độ. Bạn chạy một lần với server thật, "quay phim" toàn bộ lưu lượng vào một file; những lần sau test phát lại băng, không phụ thuộc server hay mạng. Giống như quay lại một buổi biểu diễn rồi chiếu lại để kiểm tra hậu kỳ, nhưng nếu buổi diễn thật đổi kịch bản, băng cũ sẽ **lạc hậu** (mock lỗi thời): đây là rủi ro lớn nhất, ta sẽ nói kỹ ở phần "Khi nào mock".

## Thực hành từng bước
Mọi ví dụ nằm trong `tests/mock-nang-cao.spec.ts`, chạy bằng `npx playwright test tests/mock-nang-cao.spec.ts`. Giao diện `/lab/orders`: ô **Khách hàng**, nút **Tạo đơn**, thông báo `order-message`, dòng `order-row`, bảng đơn hàng. Mỗi test cần dữ liệu sạch nên có `beforeEach` gọi reset, và một hàm mở trang chờ danh sách tải xong (bước 0).

### Bước 0. Khung chung của file test
Mục đích: có chỗ chung để dọn dữ liệu và mở trang đúng cách.

```ts
import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

const ORDERS = "**/api/lab/orders";

async function openOrders(page: Page) {
  const loaded = page.waitForResponse(
    (res) => res.url().endsWith("/api/lab/orders") && res.request().method() === "GET",
  );
  await page.goto("/lab/orders");
  await loaded;
}

test.beforeEach(async ({ page }) => {
  await page.request.post("/api/lab/reset");
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `ORDERS = "**/api/lab/orders"` | Mẫu **glob**: `**` khớp mọi host và tiền tố. Dùng chung cho các test. |
| `openOrders` | Bắt đầu chờ phản hồi `GET` **trước** `goto`, rồi chờ nó xong. Khi danh sách đã tải xong thì React đã chạy xong và form sẵn sàng nhận `fill`. Nếu `fill` quá sớm, ô có thể bị đặt lại khi trang hydrate, gây lỗi chập chờn rất khó hiểu. |
| `page.request.post("/api/lab/reset")` | Đưa dữ liệu lab về ban đầu; dùng `page.request` để cùng cookie với trình duyệt (xem bài 4.8). |

Kết quả mong đợi: chưa có test nên chưa chạy; file biên dịch được.

### Bước 1. Sửa request đi ra bằng `route.continue`
Mục đích: để giao diện gửi đi như bình thường, nhưng đổi nội dung gửi tới server (ví dụ kiểm tra server xử lý số lượng khác).

```ts
test("sửa body gửi đi: số lượng 1 thành 3", async ({ page }) => {
  await page.route(ORDERS, async (route) => {
    const request = route.request();
    if (request.method() !== "POST") return route.fallback();

    const body = request.postDataJSON();
    body.items[0].qty = 3;
    await route.continue({ postData: JSON.stringify(body) });
  });

  await openOrders(page);
  await page.getByLabel("Khách hàng").fill("Hà");
  await page.getByRole("button", { name: "Tạo đơn" }).click();

  await expect(page.getByTestId("order-message")).toContainText("Đã tạo đơn");
  await expect(page.getByTestId("order-row")).toContainText("300.000");
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `route.request()` | Đối tượng request đang bị chặn (method, URL, header, body). |
| `if (method !== "POST") return route.fallback()` | Trang gọi cả `GET` và `POST` cùng URL; chỉ xử lý `POST`, phần còn lại đi tiếp. |
| `request.postDataJSON()` | Đọc body gửi đi và parse JSON. |
| `route.continue({ postData })` | Gửi request ra mạng **thật** nhưng thay body. Cũng có thể đổi `headers`, `method`, `url`. |
| `"300.000"` | `SKU-A` giá 100.000, số lượng bị đổi thành 3. |

Kết quả mong đợi: test xanh; giao diện gửi 1 nhưng server nhận 3. Dùng khi muốn kiểm tra phản ứng của server với dữ liệu mà giao diện không cho nhập (ví dụ vượt giới hạn) mà không cần gọi API riêng.

### Bước 2. Sửa response thật: thêm dữ liệu vào kết quả của server
Mục đích: giữ dữ liệu thật, chèn thêm hoặc đổi vài phần, kèm header riêng.

```ts
test("lấy dữ liệu thật rồi thêm một đơn giả", async ({ page }) => {
  await page.request.post("/api/lab/orders", {
    headers: { Authorization: "Bearer admin-token" },
    data: { customer: "Thật", items: [{ sku: "SKU-A", qty: 1 }] },
  });

  await page.route(ORDERS, async (route) => {
    if (route.request().method() !== "GET") return route.fallback();

    const response = await route.fetch();
    const json = await response.json();
    json.data.push({ id: "o-giả", customer: "Giả lập", total: 5000, status: "pending", items: [] });
    json.total = json.data.length;

    await route.fulfill({ response, json, headers: { ...response.headers(), "x-mocked": "1" } });
  });

  const responsePromise = page.waitForResponse(
    (res) => res.url().endsWith("/api/lab/orders") && res.request().method() === "GET",
  );
  await page.goto("/lab/orders");
  const response = await responsePromise;

  expect(response.headers()["x-mocked"]).toBe("1");
  await expect(page.getByTestId("order-row")).toHaveCount(2);
  await expect(page.getByTestId("order-row").nth(1)).toContainText("Giả lập");
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `page.request.post(...)` | Tạo một đơn **thật** trước để chứng minh dữ liệu thật vẫn còn trong kết quả. |
| `await route.fetch()` | Gọi server thật và nhận `APIResponse`. Handler phải là `async`. |
| `json.data.push(...)` | Sửa dữ liệu thật trong bộ nhớ: thêm một đơn. Nhớ cập nhật cả `total` vì giao diện và API cùng mô tả số lượng. |
| `route.fulfill({ response, json, headers })` | Trả về dựa trên response thật (giữ status), thay body bằng `json`, thêm header `x-mocked`. Khi truyền `headers` mới thì **thay** toàn bộ header, nên phải trải `...response.headers()` để không mất header cũ. |
| `waitForResponse` | Bắt response mà **trang** nhận (đã gồm bản sửa), nên đọc được `x-mocked`. |

Kết quả mong đợi: bảng có 2 dòng, dòng thứ hai là "Giả lập". Kỹ thuật này giữ mock **nhỏ và dễ hiểu**: chỉ nêu phần khác biệt, phần còn lại là thật.

### Bước 3. Trả JSON từ file bằng `fulfill({ path })`
Mục đích: tách dữ liệu mock dài khỏi code, dùng chung giữa nhiều test.

Tạo `mocks/orders.json`:

```json
{
  "data": [
    { "id": "o-9001", "customer": "Từ file JSON", "total": 777000, "status": "pending", "items": [] }
  ],
  "total": 1
}
```

Viết test:

```ts
test("trả danh sách từ file JSON", async ({ page }) => {
  await page.route(ORDERS, (route) =>
    route.request().method() === "GET"
      ? route.fulfill({ path: "mocks/orders.json" })
      : route.fallback(),
  );

  await openOrders(page);

  await expect(page.getByTestId("order-row")).toContainText("Từ file JSON");
  await expect(page.getByTestId("order-row")).toContainText("777.000");
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `fulfill({ path })` | Đọc file làm body; `Content-Type` suy ra từ đuôi `.json`. Đường dẫn tương đối tính từ **thư mục chạy lệnh** (thường là gốc project). |
| Cách khác | `route.fulfill({ json: JSON.parse(fs.readFileSync("mocks/orders.json", "utf8")) })`. Cách này cho phép sửa dữ liệu trong code (ví dụ đổi một trường theo từng test) trước khi trả. |

Kết quả mong đợi: bảng chỉ có một dòng "Từ file JSON". Nếu đường dẫn sai bạn thấy lỗi `ENOENT: no such file or directory`; kiểm tra thư mục hiện hành khi chạy lệnh.

Nên đặt file mock gần test hoặc trong `tests/mocks/`, đặt tên rõ ý nghĩa (`orders-empty.json`, `orders-large.json`) và giữ cấu trúc **giống hệt API thật** để mock không đánh lừa test.

### Bước 4. Mô phỏng lỗi nghiệp vụ `422` kèm danh sách `errors`
Mục đích: kiểm tra giao diện hiển thị lỗi theo trường mà server rất khó "đúng ý" tạo ra.

```ts
test("giao diện hiện lỗi 422 do server trả", async ({ page }) => {
  await page.route(ORDERS, (route) =>
    route.request().method() === "POST"
      ? route.fulfill({
          status: 422,
          json: {
            message: "Dữ liệu không hợp lệ",
            errors: [{ field: "customer", message: "Khách hàng bắt buộc" }],
          },
        })
      : route.fallback(),
  );

  await openOrders(page);
  await page.getByRole("button", { name: "Tạo đơn" }).click();

  await expect(page.getByTestId("order-message")).toHaveText("Dữ liệu không hợp lệ: Khách hàng bắt buộc");
});
```

Giải thích: giao diện ghép `message` và các `errors[].message` bằng dấu hai chấm. Bạn mô phỏng đúng cấu trúc lỗi của API (`message` và `errors`) nên kiểm tra được cách trình bày mà không phụ thuộc quy tắc kiểm tra của server. Kết quả mong đợi: test xanh.

### Bước 5. Mô phỏng phản hồi chậm và lỗi `500`
Mục đích: kiểm tra giao diện khi máy chủ chậm rồi báo lỗi.

```ts
test("máy chủ chậm 1,5 giây rồi báo 500", async ({ page }) => {
  await page.route(ORDERS, async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.fulfill({ status: 500, json: { message: "Máy chủ gặp sự cố" } });
  });

  await openOrders(page);
  await page.getByLabel("Khách hàng").fill("Mai");
  const startedAt = Date.now();
  await page.getByRole("button", { name: "Tạo đơn" }).click();

  await expect(page.getByTestId("order-message")).toBeHidden();
  await expect(page.getByTestId("order-message")).toHaveText("Máy chủ gặp sự cố");
  expect(Date.now() - startedAt).toBeGreaterThanOrEqual(1400);
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `await new Promise(... setTimeout ...)` | Làm chậm **trong handler của mock**: chấp nhận được vì bạn đang **tạo** tình huống chậm. Khác với `waitForTimeout` trong thân test (nên tránh). |
| `toBeHidden()` ngay sau click | Chứng minh trong lúc chờ chưa có thông báo (nơi bạn sẽ kiểm tra trạng thái loading nếu giao diện có). |
| `toBeGreaterThanOrEqual(1400)` | Kiểm tra thông báo xuất hiện **sau** khi chờ, chừa sai số nhỏ vì đồng hồ. |

Kết quả mong đợi: test xanh, chạy khoảng 2 giây. Với giao diện thật có nút đang tải hoặc vòng quay, đây là nơi kiểm tra chúng hiển thị rồi biến mất.

### Bước 6. Mô phỏng mất mạng và timeout bằng `abort`
Mục đích: biết giao diện làm gì khi request **không có phản hồi**.

```ts
test("mất mạng khi tạo đơn: giao diện không báo gì", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.route(ORDERS, (route) =>
    route.request().method() === "POST" ? route.abort("timedout") : route.fallback(),
  );

  await openOrders(page);
  await page.getByLabel("Khách hàng").fill("Mai");
  await page.getByRole("button", { name: "Tạo đơn" }).click();

  await expect.poll(() => pageErrors.length).toBeGreaterThan(0);
  expect(pageErrors[0]).toContain("Failed to fetch");
  await expect(page.getByTestId("order-message")).toHaveCount(0);
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `route.abort("timedout")` | Làm request thất bại kiểu hết thời gian chờ. Các mã khác: `"failed"`, `"connectionrefused"`, `"connectionreset"`, `"internetdisconnected"`... |
| `page.on("pageerror", ...)` | Bắt lỗi JavaScript chưa được xử lý trong trang. |
| `expect.poll(...)` | Chờ tới khi có lỗi; không `sleep`. |

Kết quả mong đợi: test xanh. **Phát hiện thú vị**: lab này không bắt lỗi mạng, nên khi `fetch` thất bại trang ném lỗi `Failed to fetch` chưa xử lý và người dùng không thấy thông báo nào. Đây chính là loại lỗi mà test mô phỏng mạng đứt tìm ra: một ứng dụng tử tế phải hiện "Không có kết nối, thử lại". Khi gặp, bạn ghi nhận thành bug thay vì sửa test cho xanh.

Lưu ý: `abort("timedout")` mô phỏng **hậu quả** (request thất bại), không thật sự chờ lâu. Muốn kiểm tra giao diện trong lúc **đang chờ** hãy dùng cách làm chậm ở bước 5.

### Bước 7. Lỗi chỉ xảy ra một lần: `times`
Mục đích: kiểm tra cơ chế thử lại hoặc việc người dùng bấm lại sau lỗi tạm thời.

```ts
test("lần đầu lỗi, lần sau thành công", async ({ page }) => {
  await openOrders(page);

  await page.route(
    ORDERS,
    (route) => route.fulfill({ status: 500, json: { message: "Lỗi tạm thời" } }),
    { times: 1 },
  );

  await page.getByLabel("Khách hàng").fill("Mai");
  await page.getByRole("button", { name: "Tạo đơn" }).click();
  await expect(page.getByTestId("order-message")).toHaveText("Lỗi tạm thời");

  await page.getByLabel("Khách hàng").fill("Mai");
  await page.getByRole("button", { name: "Tạo đơn" }).click();
  await expect(page.getByTestId("order-message")).toContainText("Đã tạo đơn");
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `{ times: 1 }` | Handler chỉ được dùng **một lần**; sau đó route tự gỡ và request đi thẳng ra mạng thật. |
| Đăng ký route **sau** `openOrders` | `times` đếm **mọi** request khớp, kể cả `GET` tải danh sách. Nếu đăng ký trước `goto`, lần dùng duy nhất bị `GET` đầu tiên "ăn" mất và `POST` không bị lỗi. Đây là lỗi rất hay gặp. |

Kết quả mong đợi: lần bấm đầu hiện "Lỗi tạm thời", lần sau tạo đơn thành công.

### Bước 8. Ghi lưu lượng thành file HAR
Mục đích: chụp lại phản hồi thật một lần để dùng cho các lần sau.

```ts
test("ghi HAR từ server thật", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  await page.request.post("/api/lab/reset");
  await context.request.post("/api/lab/orders", {
    headers: { Authorization: "Bearer admin-token" },
    data: { customer: "Từ HAR", items: [{ sku: "SKU-A", qty: 2 }] },
  });

  await page.routeFromHAR("hars/orders.har", { url: "**/api/lab/orders", update: true });
  await page.goto("/lab/orders");
  await expect(page.getByTestId("order-row")).toContainText("Từ HAR");

  await context.close();
  expect(fs.existsSync("hars/orders.har")).toBe(true);
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `browser.newContext({ baseURL })` | Ta tự tạo context vì cần **tự đóng** nó. Context do fixture `page` cấp được đóng sau test nên khó chắc chắn file đã ghi khi bạn kiểm tra. `baseURL` phải truyền lại vì context tự tạo không kế thừa cấu hình. |
| `routeFromHAR(path, { update: true })` | Chế độ **ghi**: request đi ra mạng thật, và response được lưu vào file. |
| `url: "**/api/lab/orders"` | Chỉ ghi các request khớp mẫu này (nếu không, mọi tệp tĩnh của trang cũng bị ghi). |
| `context.close()` | **Bắt buộc**: file HAR chỉ được ghi xuống đĩa khi context đóng. |

Các tuỳ chọn ghi khác: `updateContent` (`"embed"` nhúng nội dung vào HAR; `"attach"` lưu thành tệp riêng) và `updateMode` (`"minimal"` mặc định chỉ ghi thông tin cần để phát lại; `"full"` ghi đủ thời gian, kích thước...).

Kết quả mong đợi: sau khi chạy xong có file `hars/orders.har`, là JSON có mảng `log.entries`.

**Cảnh báo an toàn**: HAR lưu cả header (gồm `Cookie`, `Authorization`) và body. Trước khi commit, mở file kiểm tra: không để token, mật khẩu hay dữ liệu cá nhân thật. Tốt nhất ghi từ môi trường test với dữ liệu giả, hoặc thêm `hars/` vào `.gitignore` nếu chứa nội dung nhạy cảm.

### Bước 9. Phát lại HAR và hiểu `notFound`
Mục đích: chạy test mà không cần server trả đúng dữ liệu.

```ts
test("phát lại HAR", async ({ page }) => {
  await page.routeFromHAR("hars/orders.har", {
    url: "**/api/lab/orders",
    notFound: "fallback",
  });

  await openOrders(page);

  await expect(page.getByTestId("order-row")).toContainText("Từ HAR");
  await expect(page.getByTestId("order-row")).toContainText("200.000");
});
```

Test này chạy trên context **mới, không có đơn nào**, nhưng bảng vẫn hiện đơn "Từ HAR" vì danh sách được lấy từ file chứ không phải server. Đó là sức mạnh (và cái bẫy) của HAR.

| Tuỳ chọn `notFound` | Hành vi khi request không có trong HAR |
|---------------------|----------------------------------------|
| `"abort"` (mặc định) | Request bị chặn như mất mạng. An toàn nhất: test lộ ngay chỗ thiếu bản ghi. |
| `"fallback"` | Request đi ra mạng thật. Tiện khi chỉ mock một phần, nhưng dễ gọi nhầm server thật mà không biết. |

Ví dụ `notFound: "abort"`: bấm **Tạo đơn** (một `POST` không được ghi trong HAR) sẽ bị chặn, trang ném `Failed to fetch` như ở bước 6.

Khi cần cập nhật HAR (API đổi hình dạng), chạy lại bước 8 để ghi đè; nhiều đội thêm một biến môi trường ví dụ `UPDATE_HAR=1` để bật `update` có chủ đích:

```ts
await page.routeFromHAR("hars/orders.har", {
  url: "**/api/lab/orders",
  update: process.env.UPDATE_HAR === "1",
});
```

Kết quả mong đợi: bình thường phát lại; đặt `UPDATE_HAR=1` thì ghi mới (nhớ đóng context như bước 8).

### Bước 10. Thứ tự handler và cách chọn mẫu URL
Mục đích: tránh mock "không ăn" hoặc ăn nhầm.

- Handler đăng ký **sau** được gọi **trước**. Handler đó gọi `route.fallback()` thì request chuyển sang handler đăng ký **trước** đó (và cuối cùng ra mạng). Gọi `route.continue()` thì request **đi thẳng ra mạng**, bỏ qua các handler còn lại.
- Mẫu URL có ba dạng: glob (`"**/api/lab/orders"`), biểu thức chính quy (`/\/api\/lab\/orders(\?.*)?$/` khớp có hoặc không có chuỗi truy vấn) và hàm (`(url) => url.pathname === "/api/lab/orders"`).
- Glob không khớp chuỗi truy vấn nếu bạn không nhắc tới nó: `"**/api/lab/orders"` sẽ **không** khớp `/api/lab/orders?bugs=BUG-01`. Khi mock không chạy, in `request.url()` ra xem.
- `page.route` chỉ áp dụng cho trang đó; `context.route` áp dụng cho mọi tab; `page.unroute(url)` gỡ một route; `page.unrouteAll()` gỡ tất cả.
- Với kết nối WebSocket có `page.routeWebSocket(url, handler)` (nằm ngoài phạm vi bài này).

### Bước 11. Khi nào mock, khi nào gọi thật
Mục đích: quyết định có chủ đích.

| Tình huống | Nên | Lý do |
|------------|-----|-------|
| Kiểm tra giao diện khi `500`, `422`, mất mạng, chậm | Mock | Server thật rất khó tạo đúng lỗi, đúng lúc |
| Dịch vụ bên thứ ba tốn tiền hoặc không ổn định (SMS, thanh toán) | Mock | Tránh chi phí, tránh phụ thuộc bên ngoài |
| Dữ liệu cực lớn hoặc hiếm (10.000 dòng, tài khoản bị khoá) | Mock | Dựng thật quá tốn công |
| Kiểm tra giao diện hiển thị dữ liệu nhanh, ổn định | HAR hoặc mock từ file | Không phụ thuộc server |
| Luồng chính đầu cuối (đặt hàng, thanh toán) | Gọi thật | Mục tiêu là kiểm chứng sự tích hợp |
| Kiểm tra hợp đồng của chính API | Gọi thật (bài 4.7, 4.13) | Mock không chứng minh được gì về server |

Quy tắc kinh nghiệm: mỗi dự án nên có **ít** test dùng mock cho tình huống lỗi, và **một số** test đầu cuối gọi thật để biết mock vẫn đúng với thực tế. Mock hay HAR cũ là lý do phổ biến khiến "test xanh nhưng ứng dụng hỏng".

## Demo code
Bộ test hoàn chỉnh nhỏ gọn, dùng `orders`:

```ts
import { test, expect, type Page } from "@playwright/test";

const ORDERS = "**/api/lab/orders";

async function openOrders(page: Page) {
  const loaded = page.waitForResponse(
    (res) => res.url().endsWith("/api/lab/orders") && res.request().method() === "GET",
  );
  await page.goto("/lab/orders");
  await loaded;
}

test.beforeEach(async ({ page }) => {
  await page.request.post("/api/lab/reset");
});

test.describe("Mock nâng cao trên /lab/orders", () => {
  test("danh sách từ file JSON", async ({ page }) => {
    await page.route(ORDERS, (route) =>
      route.request().method() === "GET" ? route.fulfill({ path: "mocks/orders.json" }) : route.fallback(),
    );
    await openOrders(page);
    await expect(page.getByTestId("order-row")).toHaveCount(1);
  });

  test("lỗi 422 hiện đúng thông điệp", async ({ page }) => {
    await page.route(ORDERS, (route) =>
      route.request().method() === "POST"
        ? route.fulfill({
            status: 422,
            json: { message: "Dữ liệu không hợp lệ", errors: [{ field: "customer", message: "Khách hàng bắt buộc" }] },
          })
        : route.fallback(),
    );
    await openOrders(page);
    await page.getByRole("button", { name: "Tạo đơn" }).click();
    await expect(page.getByTestId("order-message")).toHaveText("Dữ liệu không hợp lệ: Khách hàng bắt buộc");
  });

  test("sửa response thật: thêm một đơn giả", async ({ page }) => {
    await page.route(ORDERS, async (route) => {
      if (route.request().method() !== "GET") return route.fallback();
      const response = await route.fetch();
      const json = await response.json();
      json.data.push({ id: "o-giả", customer: "Giả lập", total: 5000, status: "pending", items: [] });
      json.total = json.data.length;
      await route.fulfill({ response, json });
    });
    await openOrders(page);
    await expect(page.getByTestId("order-row")).toHaveCount(1);
    await expect(page.getByTestId("order-row")).toContainText("Giả lập");
  });
});
```

Cả các ví dụ ở bước 0 đến bước 9 đã được chạy thử trên site lab (dev server) và đều xanh; phần `UPDATE_HAR` là mẫu cấu hình, bạn tự thử bằng cách đặt biến môi trường.

## Thử ngay trong lab
- Mở `/lab/orders` bằng tay, bấm **Tạo đơn** rồi xem tab Network trong DevTools để thấy hai request `GET` và `POST` cùng URL. Điều này giải thích vì sao handler luôn phải kiểm tra `method()`.
- Ghi một HAR theo bước 8, mở file `hars/orders.har` bằng trình soạn thảo và tìm `"customer":"Từ HAR"` để thấy dữ liệu đã được lưu.
- Thử bật `?bugs=BUG-01` ở URL trang rồi bấm tạo đơn: URL của request thêm chuỗi truy vấn, mẫu glob ở bước 10 sẽ không khớp; sửa mẫu thành biểu thức chính quy để khớp cả hai trường hợp.

## Lỗi thường gặp
- **Mock không có tác dụng** (trang vẫn hiện dữ liệu thật): đăng ký `page.route` sau khi request đã bay đi, hoặc mẫu URL không khớp (có chuỗi truy vấn, sai host). Đăng ký trước `goto` và in `route.request().url()` để đối chiếu.
- **`Error: Route is already handled!`**: handler gọi hai kết cục (ví dụ `fulfill` rồi `continue`), hoặc quên `return` sau `fallback()`. Mỗi request chỉ được xử lý một lần; dùng `return route.fallback()`.
- **Giao diện hiện lỗi lạ sau khi mock**: mock sai cấu trúc (thiếu `data`, sai tên trường). Sao chép đúng hình dạng từ phản hồi thật; cách tốt nhất là lấy bằng `route.fetch()` rồi sửa.
- **`times: 1` không gây lỗi như mong đợi**: request `GET` tải trang đã dùng hết lượt. Đăng ký route sau khi trang tải xong hoặc lọc theo method trong handler (lưu ý `times` đếm số lần handler được gọi).
- **File HAR rỗng hoặc không tạo ra**: quên `context.close()`, mẫu `url` không khớp request nào, hoặc chạy ở chế độ phát lại thay vì `update: true`.
- **Test HAR xanh nhưng ứng dụng thật đã đổi**: HAR lỗi thời. Thêm một test đầu cuối gọi thật, và ghi lại HAR theo lịch hoặc khi API đổi.
- **`ENOENT` khi `fulfill({ path })`**: đường dẫn tương đối tính từ thư mục chạy lệnh; dùng `path.join(__dirname, "mocks", "orders.json")` nếu chạy từ nhiều nơi.
- **Test chập chờn ở ô nhập**: `fill` xảy ra trước khi trang hydrate. Chờ phản hồi `GET` đầu tiên như hàm `openOrders`.

## Tóm tắt
- Năm kết cục của `route`: `fulfill`, `fetch` rồi `fulfill`, `continue`, `abort`, `fallback`; chọn theo việc cần làm và luôn lọc theo `method()` khi nhiều request cùng URL.
- Sửa response thật bằng `route.fetch` giữ mock nhỏ; trả từ file `path` giúp tách dữ liệu dài.
- Mô phỏng tình huống khó: `422` có `errors`, `500`, chậm (chờ trong handler), mất mạng (`abort`), lỗi một lần (`times`).
- HAR ghi bằng `update: true` (đóng context mới ghi file), phát lại bằng `routeFromHAR`; `notFound: "abort"` an toàn hơn `"fallback"`. Kiểm tra HAR không chứa bí mật.
- Mock có giá: nó có thể lỗi thời và che mất lỗi thật; dùng cho tình huống lỗi và phụ thuộc bên ngoài, giữ test đầu cuối gọi thật cho luồng chính.

## Bài tập
1. Tạo `mocks/orders-empty.json` với `{ "data": [], "total": 0 }` và viết test mong thấy dòng "Chưa có đơn hàng."; xong khi test xanh và không có request thật nào tới `GET`.
2. Viết test dùng `route.fetch` đổi **trạng thái** của mọi đơn thành `cancelled` trong response rồi kiểm tra cột trạng thái trên giao diện; xong khi bạn tạo trước 2 đơn bằng API và cả 2 dòng hiện `cancelled`.
3. Mô phỏng lỗi `503` kèm header `Retry-After: 2` cho `POST`, kiểm tra thông báo hiển thị; xong khi bạn đọc được header đó bằng `waitForResponse` trong test.
4. Ghi HAR cho trang `/lab/orders` với 3 đơn khác nhau rồi viết test phát lại, kiểm tra đúng 3 dòng; xong khi test vẫn xanh sau khi bạn reset dữ liệu lab (lab trống) trước khi chạy.
5. Thêm biến `UPDATE_HAR` để bật ghi, viết hướng dẫn 3 dòng trong README cho đồng đội về khi nào cần ghi lại HAR và kiểm tra gì trước khi commit file `.har`.
