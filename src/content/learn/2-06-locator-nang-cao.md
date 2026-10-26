---
title: Locator nâng cao
level: 2
order: 6
minutes: 55
summary: locator(), chaining, filter, nth, and/or, frameLocator, shadow DOM, strictness và làm việc với danh sách, thẻ sản phẩm.
keywords: [playwright filter locator, strict mode violation, locator chaining]
---

## Mục tiêu bài học
- Thu hẹp phạm vi tìm kiếm bằng **chaining** (nối locator) và `filter`.
- Làm việc với danh sách và nhiều phần tử: `count`, `first`, `last`, `nth`, `all`, `allInnerTexts`.
- Kết hợp điều kiện bằng `and` và `or`.
- Tìm phần tử trong `iframe` bằng `frameLocator` và hiểu vì sao shadow DOM mở không cần xử lý riêng.
- Sửa lỗi strict mode một cách có suy nghĩ thay vì thêm `.first()`.

## Bạn cần chuẩn bị
- Đã học bài 2.5 (locator hướng người dùng, strict mode) và bài 2.4 (chạy test).
- Site lab chạy ở `http://localhost:3000`. Bài này dùng **LAB-03 Giỏ hàng** (`/lab/cart`) để học danh sách thẻ sản phẩm và **LAB-13 Playground** (`/lab/playground`) cho iframe, shadow DOM, danh sách cuộn.

## Kiến thức cần nắm
- `locator("css hoặc xpath")` là lối thoát khi `getBy*` không đủ.
- **Chaining**: `card.getByRole("button")` chỉ tìm bên trong `card`.
- `filter({ hasText })`, `filter({ hasNotText })`, `filter({ has: locator })`, `filter({ hasNot: locator })`.
- `first()`, `last()`, `nth(i)`, `count()`, `all()`.
- `locator.and(...)` (cả hai điều kiện) và `locator.or(...)` (một trong hai).
- **Strict mode**: locator khớp nhiều hơn một phần tử sẽ báo lỗi khi thao tác.
- `frameLocator` để đi vào `iframe`.

## Giải thích dễ hiểu

### Thu hẹp phạm vi
Trang có nhiều nút "Thêm vào giỏ". Nói "bấm nút Thêm vào giỏ" thì mơ hồ, vì có 4 nút. Cách thông minh là **thu hẹp phạm vi**: "trong thẻ sản phẩm *Chuột không dây*, bấm nút Thêm vào giỏ". Chaining và filter chính là cách nói đó bằng code.

Hãy hình dung locator như một **bộ lọc nối tiếp**: bước một chọn tất cả thẻ sản phẩm, bước hai giữ lại thẻ có chữ "Chuột không dây", bước ba tìm nút bên trong thẻ đó. Mỗi bước thu hẹp tập hợp, và kết quả cuối vẫn tự chờ như mọi locator khác.

### Hai kiểu kết hợp
| Kiểu | Cú pháp | Ý nghĩa |
|------|---------|---------|
| Nối (chaining) | `a.getByRole("button")` | Tìm `b` **bên trong** `a` |
| Lọc (filter) | `a.filter({ hasText: "x" })` | Giữ lại những `a` **thoả điều kiện** |
| Và (and) | `a.and(b)` | Phần tử khớp **cả** `a` lẫn `b` (cùng một phần tử) |
| Hoặc (or) | `a.or(b)` | Phần tử khớp `a` **hoặc** `b` |

Lưu ý khác biệt `and` với chaining: `a.and(b)` là một phần tử thoả cả hai điều kiện, trong khi `a.locator(b)` là `b` nằm bên trong `a`.

### Locator không phải mảng
Một locator đại diện cho **mọi phần tử khớp**, không phải phần tử đầu tiên. `await products.count()` đếm; `products.nth(2)` trả về locator thứ ba; `await products.all()` trả về mảng các locator. Vì danh sách có thể thay đổi, hãy ưu tiên `expect(products).toHaveCount(4)` thay cho `count()` rồi so sánh, vì `toHaveCount` tự thử lại.

## Thực hành từng bước

Mọi bước dùng LAB-03 Giỏ hàng, trừ khi ghi chú khác. Tạo file `tests/advanced-locator.spec.ts` và thêm dần từng đoạn. Đoạn khung ở đầu file:

```ts
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/cart");
  await page.getByTestId("reset-data").click();
});
```

Giải thích: `beforeEach` mở trang giỏ hàng và bấm Reset để trạng thái luôn sạch (LAB-03 lưu giỏ vào localStorage).

### Bước 1. Quan sát vấn đề: một locator, nhiều nút

Mục đích: tự thấy lỗi mà bài này giải quyết.

Thêm test:

```ts
test("vấn đề: nhiều nút Thêm vào giỏ", async ({ page }) => {
  await page.getByRole("button", { name: "Thêm vào giỏ" }).click();
});
```

Chạy:

```bash
npx playwright test advanced-locator
```

Kết quả mong đợi: test đỏ với thông báo như sau (rút gọn):

```text
Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Thêm vào giỏ' }) resolved to 4 elements:
    1) <button ...>Thêm vào giỏ</button> aka getByTestId('product-p1').getByRole('button', { name: 'Thêm vào giỏ' })
    2) <button ...>Thêm vào giỏ</button> aka getByTestId('product-p2').getByRole('button', { name: 'Thêm vào giỏ' })
    ...
```

Cách đọc: trang có 4 nút khớp (3 nút bấm được và 1 nút bị vô hiệu của sản phẩm "Tai nghe" hết hàng). Playwright gợi ý luôn cách thu hẹp qua `data-testid` của thẻ. Xoá test này, ta sẽ làm đúng ở các bước sau.

### Bước 2. Chaining theo testid của thẻ

Mục đích: thu hẹp bằng một mốc ổn định.

```ts
test("chaining theo testid", async ({ page }) => {
  const card = page.getByTestId("product-p2");
  await card.getByRole("button", { name: "Thêm vào giỏ" }).click();
  await expect(page.getByTestId("qty-p2")).toHaveText("1");
});
```

Giải thích từng dòng: `card` là locator thẻ sản phẩm p2 (Chuột không dây). `card.getByRole(...)` chỉ tìm bên trong thẻ nên khớp đúng 1 nút. `qty-p2` là số lượng hiện bên cạnh nút sau khi thêm.

Kết quả mong đợi: test xanh. Ưu điểm: ổn định. Nhược điểm: `product-p2` là mã nội bộ khó đọc, người đọc test không biết p2 là gì.

### Bước 3. Chaining bằng filter theo chữ

Mục đích: thu hẹp theo thứ người dùng nhìn thấy (tên sản phẩm).

```ts
test("filter theo chữ", async ({ page }) => {
  const products = page.getByRole("region", { name: "Sản phẩm" }).getByRole("article");
  const mouse = products.filter({ hasText: "Chuột không dây" });

  await expect(products).toHaveCount(4);
  await expect(mouse).toHaveCount(1);

  await mouse.getByRole("button", { name: "Thêm vào giỏ" }).click();
  await mouse.getByRole("button", { name: /^Tăng/ }).click();
  await expect(mouse.getByTestId("qty-p2")).toHaveText("2");
});
```

Giải thích:

| Dòng | Ý nghĩa |
|------|---------|
| `getByRole("region", { name: "Sản phẩm" })` | Vùng có tên "Sản phẩm" (thẻ `section` có `aria-label`) |
| `.getByRole("article")` | Mỗi sản phẩm là một thẻ `article` bên trong vùng đó: chaining |
| `.filter({ hasText: "Chuột không dây" })` | Giữ lại những thẻ có chữ này ở **bất kỳ chỗ nào bên trong** (không phân biệt hoa thường, khớp một phần) |
| `toHaveCount(1)` | Khẳng định filter chọn đúng một thẻ |
| `{ name: /^Tăng/ }` | Regex: tên truy cập được bắt đầu bằng "Tăng"; nút có `aria-label="Tăng Chuột không dây"` |

Kết quả mong đợi: test xanh. `mouse` đọc như tiếng người: "sản phẩm có chữ Chuột không dây". Đây là cách chaining được ưu tiên nhất.

### Bước 4. filter với has, hasNot, hasNotText

Mục đích: lọc theo **phần tử con** chứ không chỉ theo chữ.

```ts
test("filter has, hasNot, hasNotText", async ({ page }) => {
  const products = page.getByRole("article");

  // Chỉ những thẻ KHÔNG chứa chữ "Hết hàng"
  await expect(products.filter({ hasNotText: "Hết hàng" })).toHaveCount(3);

  // Chỉ những thẻ CÓ chứa phần tử con khớp locator này
  await expect(products.filter({ has: page.getByText("Hết hàng") })).toHaveCount(1);

  // Những thẻ KHÔNG chứa phần tử con đó
  await expect(products.filter({ hasNot: page.getByText("Hết hàng") })).toHaveCount(3);
});
```

Giải thích: `has` và `hasNot` nhận một **locator** (không phải chuỗi) và kiểm tra thẻ có chứa hay không chứa phần tử khớp locator đó. Locator truyền vào được tính **tương đối với thẻ**, vì vậy ta viết `page.getByText("Hết hàng")` ngắn gọn, Playwright tự hiểu là tìm bên trong từng thẻ.

Kết quả mong đợi: test xanh; 3 sản phẩm còn hàng và 1 sản phẩm hết hàng ("Tai nghe"). Một số dạng khác của `filter`:

| Tuỳ chọn | Nhận | Ý nghĩa |
|----------|------|---------|
| `hasText` | chuỗi hoặc regex | Thẻ có chứa chữ này |
| `hasNotText` | chuỗi hoặc regex | Thẻ không chứa chữ này |
| `has` | locator | Thẻ có chứa phần tử con này |
| `hasNot` | locator | Thẻ không chứa phần tử con này |
| `visible` | `true` hoặc `false` | Chỉ giữ phần tử đang hiện (hoặc đang ẩn) |

### Bước 5. first, last, nth, count, all

Mục đích: làm việc với danh sách theo thứ tự và theo số lượng.

```ts
test("first, last, nth, count, all", async ({ page }) => {
  const products = page.getByRole("article");

  await expect(products.first()).toContainText("Bàn phím cơ");
  await expect(products.nth(2)).toContainText("Màn hình 24 inch");
  await expect(products.last()).toContainText("Tai nghe");

  // Đọc tên của mọi sản phẩm thành một mảng
  const names = await products.getByRole("heading", { level: 3 }).allInnerTexts();
  expect(names).toEqual(["Bàn phím cơ", "Chuột không dây", "Màn hình 24 inch", "Tai nghe"]);

  // count() chạy ngay tại thời điểm gọi, không tự chờ
  expect(await products.count()).toBe(4);

  // all() trả về mảng locator, dùng để lặp
  for (const product of await products.all()) {
    await expect(product.getByRole("heading", { level: 3 })).toBeVisible();
  }
});
```

Giải thích: `nth(i)` đếm từ **0** (khác XPath đếm từ 1). `allInnerTexts()` lấy chữ của mọi phần tử khớp thành một mảng chuỗi (đã áp dụng `level: 3` để chỉ lấy tiêu đề tên sản phẩm). `count()` và `all()` **không tự chờ**: chúng chụp tình trạng DOM tại thời điểm gọi.

Kết quả mong đợi: test xanh. Quy tắc dùng: kiểm tra số lượng bằng `toHaveCount` (có chờ); dùng `count()` hoặc `all()` chỉ khi bạn chắc danh sách đã ổn định (ví dụ sau khi `expect(...).toHaveCount(4)`).

### Bước 6. Khi nào dùng nth

`nth()` phụ thuộc thứ tự nên mong manh: thêm một sản phẩm đầu danh sách là kết quả đổi. Chỉ dùng khi thứ tự **chính là điều cần kiểm tra**. Thử trên danh sách cuộn của LAB-13:

```ts
test("nth khi thứ tự là điều cần kiểm tra", async ({ page }) => {
  await page.goto("/lab/playground");
  const items = page.getByTestId("scroll-list").getByRole("listitem");

  await expect(items).toHaveCount(20);          // lúc đầu có 20 mục
  await expect(items.nth(4)).toHaveText("Mục 5"); // phần tử thứ 5 (chỉ số 4)

  // Cách tốt hơn khi muốn "mục có chữ chính xác Mục 5"
  await expect(items.filter({ hasText: /^Mục 5$/ })).toHaveCount(1);
});
```

Kết quả mong đợi: test xanh. Chú ý `hasText: "Mục 1"` khớp 11 mục ("Mục 1", "Mục 10" đến "Mục 19"), vì khớp một phần. Regex `/^Mục 1$/` neo đầu và cuối để khớp nguyên chuỗi.

### Bước 7. Kết hợp điều kiện: and, or

Mục đích: chọn phần tử thoả hai điều kiện, hoặc một trong hai trạng thái có thể xảy ra.

```ts
test("and và or", async ({ page }) => {
  // and: nút "Thêm vào giỏ" VÀ đang bị vô hiệu: chỉ sản phẩm hết hàng
  const disabledAdd = page
    .getByRole("button", { name: "Thêm vào giỏ" })
    .and(page.locator(":disabled"));
  await expect(disabledAdd).toHaveCount(1);

  // or: thấy nút Đặt hàng HOẶC khối đơn hàng (tuỳ trạng thái giỏ)
  await expect(
    page.getByRole("button", { name: "Đặt hàng" }).or(page.getByTestId("order")),
  ).toBeVisible();
});
```

Giải thích: `and` dùng khi bạn cần một phần tử đồng thời thoả hai locator độc lập (ở đây: là nút Thêm vào giỏ, đồng thời khớp `:disabled`). `or` hữu ích khi giao diện có hai kết quả hợp lệ và bạn chấp nhận cái nào xuất hiện trước, ví dụ "thông báo thành công hoặc thông báo lỗi". Lưu ý: nếu cả hai vế khớp cùng lúc thì locator khớp 2 phần tử và gây strict mode violation.

Kết quả mong đợi: test xanh.

### Bước 8. locator() làm lối thoát và đi lên cha

Mục đích: biết khi cần CSS hoặc XPath trong chuỗi chaining.

```ts
test("locator() trong chaining", async ({ page }) => {
  const mouse = page.getByRole("article").filter({ hasText: "Chuột không dây" });

  // CSS trong phạm vi một thẻ
  await expect(mouse.locator("h3")).toHaveText("Chuột không dây");

  // Đi lên cha trực tiếp bằng XPath ".."
  const titleBox = mouse.getByRole("heading", { level: 3 }).locator("xpath=..");
  await expect(titleBox).toContainText("250.000");
});
```

Giải thích: `mouse.locator("h3")` là CSS bên trong `mouse`. `locator("xpath=..")` đi lên một cấp, tới thẻ `div` bọc cả tên và giá (bài 2.3). Đây là việc `getBy*` không làm được nên XPath hoặc CSS là lối thoát hợp lý.

Kết quả mong đợi: test xanh. Nếu `toContainText("250.000")` báo lỗi, kiểm tra định dạng tiền: giao diện hiển thị `250.000` kèm đơn vị tiền tệ; dùng một phần chuỗi như vậy là đủ.

### Bước 9. frameLocator: đi vào iframe

Mục đích: tìm phần tử trong `iframe` (bài 2.10 sẽ học sâu thêm).

Mở LAB-13 Playground. Form thanh toán nằm trong một `iframe` có `title="Khung thanh toán"` và `data-testid="payment-frame"`:

```ts
test("iframe thanh toán", async ({ page }) => {
  await page.goto("/lab/playground");

  const frame = page.frameLocator('[data-testid="payment-frame"]');
  await frame.getByLabel("Số thẻ").fill("123456789012");
  await frame.getByRole("button", { name: "Thanh toán" }).click();

  await expect(frame.getByRole("status")).toHaveText("Thanh toán thành công");
});
```

Giải thích: `page.frameLocator(selector)` chọn iframe, rồi từ `frame` bạn dùng `getByLabel`, `getByRole`... như bình thường, nhưng chúng tìm **bên trong iframe**. Nếu không dùng `frameLocator`, `page.getByLabel("Số thẻ")` sẽ không thấy gì vì iframe là tài liệu riêng.

Kết quả mong đợi: test xanh. Số thẻ 12 chữ số hợp lệ; 11 chữ số sẽ ra "Số thẻ không hợp lệ" (biên của lab).

### Bước 10. Shadow DOM mở: không cần xử lý riêng

Mục đích: biết Playwright xuyên được shadow DOM mở.

```ts
test("shadow DOM", async ({ page }) => {
  await page.goto("/lab/playground");
  await page.getByRole("button", { name: "Bấm trong shadow" }).click();
  await expect(page.getByText("Đã bấm trong shadow DOM")).toBeVisible();

  // CSS cũng xuyên qua shadow root mở
  await expect(page.locator('[data-testid="shadow-host"] button')).toHaveText("Bấm trong shadow");
});
```

Giải thích: nút nằm trong một shadow root (xem bài 2.1) nhưng locator của Playwright (`getByRole`, `getByText`, CSS) **tự đi xuyên shadow root loại mở**. Vì vậy bạn không cần mã đặc biệt. XPath thì không xuyên shadow DOM.

Kết quả mong đợi: test xanh.

### Bước 11. Gom thành hàm tái sử dụng

Mục đích: tránh lặp chaining ở nhiều test.

```ts
import { type Page } from "@playwright/test";

async function addProduct(page: Page, id: string, times = 1) {
  const card = page.getByTestId(`product-${id}`);
  await card.getByRole("button", { name: "Thêm vào giỏ" }).click();
  for (let i = 1; i < times; i++) {
    await card.getByRole("button", { name: /^Tăng/ }).click();
  }
}

test("addProduct dùng lại", async ({ page }) => {
  await addProduct(page, "p1", 3);
  await expect(page.getByTestId("qty-p1")).toHaveText("3");
});
```

Giải thích: hàm nhận `page`, mã sản phẩm và số lần; lần đầu bấm "Thêm vào giỏ", các lần sau bấm "Tăng". Bài 4.1 sẽ nâng cấp ý tưởng này thành Page Object.

Kết quả mong đợi: test xanh; số lượng sản phẩm 1 hiển thị `3`.

## Demo code

Toàn bộ file `tests/advanced-locator.spec.ts` hoàn chỉnh, gom các kỹ thuật chính trên LAB-03:

```ts
import { test, expect, type Page } from "@playwright/test";

async function addProduct(page: Page, id: string, times = 1) {
  const card = page.getByTestId(`product-${id}`);
  await card.getByRole("button", { name: "Thêm vào giỏ" }).click();
  for (let i = 1; i < times; i++) {
    await card.getByRole("button", { name: /^Tăng/ }).click();
  }
}

test.describe("Locator nâng cao trên LAB-03", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/cart");
    await page.getByTestId("reset-data").click();
  });

  test("thêm sản phẩm bằng chaining và filter", async ({ page }) => {
    const products = page.getByRole("region", { name: "Sản phẩm" }).getByRole("article");
    await expect(products).toHaveCount(4);

    const mouse = products.filter({ hasText: "Chuột không dây" });
    await mouse.getByRole("button", { name: "Thêm vào giỏ" }).click();
    await mouse.getByRole("button", { name: /^Tăng/ }).click();
    await expect(mouse.getByTestId("qty-p2")).toHaveText("2");
  });

  test("lọc còn hàng và hết hàng", async ({ page }) => {
    const products = page.getByRole("article");
    await expect(products.filter({ hasNotText: "Hết hàng" })).toHaveCount(3);
    await expect(products.filter({ has: page.getByText("Hết hàng") })).toHaveCount(1);

    const soldOut = page.locator("article", { hasText: "Tai nghe" });
    await expect(soldOut.getByRole("button", { name: "Thêm vào giỏ" })).toBeDisabled();
  });

  test("đọc cả danh sách", async ({ page }) => {
    const names = await page
      .getByRole("article")
      .getByRole("heading", { level: 3 })
      .allInnerTexts();
    expect(names).toEqual(["Bàn phím cơ", "Chuột không dây", "Màn hình 24 inch", "Tai nghe"]);
  });

  test("dùng hàm addProduct hai lần", async ({ page }) => {
    await addProduct(page, "p1", 3);
    await addProduct(page, "p2");
    await expect(page.getByTestId("qty-p1")).toHaveText("3");
    await expect(page.getByTestId("qty-p2")).toHaveText("1");
  });
});
```

Giải thích: bốn test cho thấy ba kỹ thuật chính (chaining với filter, lọc theo phần tử con, đọc danh sách) cộng với một hàm tái sử dụng. Mỗi test độc lập nhờ `beforeEach` Reset.

## Thử ngay trong lab
- [LAB-03 Giỏ hàng](/labs/cart) (`/lab/cart`): làm các Bước 1 đến 8 và chạy từng test bằng `npx playwright test advanced-locator --headed` để thấy từng nút được bấm.
- [LAB-13 Playground](/labs/playground) (`/lab/playground`): làm Bước 6, 9 và 10 (danh sách cuộn, iframe, shadow DOM). Thử đổi `toHaveCount(20)` thành số khác để quan sát thông báo lỗi và hiểu cách Playwright báo `Expected: 21` và `Received: 20`.

## Lỗi thường gặp
- **Triệu chứng**: `strict mode violation: ... resolved to 4 elements`. **Nguyên nhân**: locator quá rộng. **Cách sửa**: thu hẹp bằng chaining hoặc `filter`; chỉ dùng `.first()` khi thật sự có nghĩa "lấy cái đầu tiên".
- **Triệu chứng**: đếm sai vì `count()` chạy trước khi danh sách cập nhật. **Nguyên nhân**: `count()` không tự chờ. **Cách sửa**: dùng `await expect(locator).toHaveCount(n)`.
- **Triệu chứng**: `filter({ hasText: "Mục 1" })` ra 11 phần tử thay vì 1. **Nguyên nhân**: `hasText` khớp một phần. **Cách sửa**: dùng regex neo `/^Mục 1$/`.
- **Triệu chứng**: `Timeout ... waiting for getByLabel('Số thẻ')` dù chữ đúng. **Nguyên nhân**: phần tử nằm trong `iframe`. **Cách sửa**: đi qua `page.frameLocator(...)`.
- **Triệu chứng**: test hỏng sau khi nhóm dev thêm một sản phẩm đầu danh sách. **Nguyên nhân**: dùng `nth(0)` hoặc `first()` thay cho nội dung. **Cách sửa**: lọc theo chữ hoặc `testid` của sản phẩm.
- **Triệu chứng**: XPath dài đi xuống nhiều tầng. **Nguyên nhân**: không dùng chaining. **Cách sửa**: tách thành `card.getByRole(...)` từng bước.

## Tóm tắt
- Chaining (`a.getByRole(...)`) thu hẹp phạm vi tìm; `filter` giữ lại những phần tử thoả điều kiện chữ hoặc phần tử con.
- `has` và `hasNot` nhận locator; `hasText` và `hasNotText` nhận chuỗi hoặc regex, khớp một phần.
- `toHaveCount` có chờ, `count()` và `all()` không chờ.
- `and` là cùng một phần tử thoả hai điều kiện; `or` là một trong hai.
- `frameLocator` để vào iframe; shadow DOM mở được locator xuyên qua tự động.
- Mỗi lần muốn thêm `.first()` hay `.nth()`, hãy tự hỏi có cách lọc theo nội dung bền hơn không.

## Bài tập
1. **Dễ**: Ở LAB-03, thêm lần lượt hai sản phẩm bằng chaining theo từng thẻ (một bằng `getByTestId`, một bằng `filter({ hasText })`). Xong khi cả hai nút đều được bấm đúng và `qty` hiển thị `1`.
2. **Dễ**: Gây lỗi strict mode bằng `page.getByRole("button", { name: "Thêm vào giỏ" }).click()` rồi sửa bằng chaining. Xong khi bạn chụp lại thông báo lỗi và đoạn code sau sửa.
3. **Vừa**: Viết hàm `addProduct(page, id, times)` dùng chaining rồi tái sử dụng trong hai test khác nhau. Xong khi cả hai test xanh và không còn lặp nội dung hàm.
4. **Vừa**: Dùng `filter({ has: ... })` để chọn những thẻ sản phẩm có nút "Thêm vào giỏ" **bấm được**, và đếm kết quả. Xong khi kết quả bằng số sản phẩm còn hàng (gợi ý: dùng `getByRole("button", { name: "Thêm vào giỏ", disabled: false })`).
5. **Khó**: Trên LAB-13, viết test kiểm tra cuộn vô hạn: đếm mục ban đầu bằng `toHaveCount`, cuộn danh sách tới cuối bằng `evaluate`, và khẳng định số mục tăng lên. Xong khi test xanh và không dùng `waitForTimeout`.
