---
title: POM nâng cao – component và kế thừa
level: 4
order: 2
minutes: 45
summary: Component object, BasePage, composition và khi nào dùng kế thừa hay kết hợp.
keywords: [component object model, composition vs inheritance, base page]
---

## Mục tiêu bài học
- Tách một vùng giao diện lặp lại (thẻ sản phẩm, dòng đơn hàng, thanh tóm tắt) thành **component object** có `root` riêng.
- Ghép component vào Page Object bằng **composition** và giải thích được vì sao chọn cách đó thay vì kế thừa.
- Viết `OrdersPage` có component `OrderRow` cho lab `/lab/orders` và kiểm tra được dòng đơn hàng cụ thể.
- Quyết được khi nào method của Page Object nên trả về `this`, trả về component, hay không trả về gì.

## Bạn cần chuẩn bị
- Đã học bài 4.1 và có `BasePage`, `LoginPage`, `CartPage` trong `pages/`.
- Hiểu `Locator` có thể **lồng nhau**: `page.getByTestId("product-p2").getByRole("button", ...)` chỉ tìm nút **bên trong** thẻ sản phẩm đó (bài Level 2 về locator).
- Site lab chạy, trang `/lab/cart` và `/lab/orders` mở được.

## Kiến thức cần nắm
- **Component object**: class cho một vùng lặp lại nhiều nơi (header, bảng, modal, form, thẻ sản phẩm).
- Component nhận một **`Locator` gốc** (`root`) và mọi locator bên trong đều bắt đầu từ `root`.
- **BasePage** (kế thừa): phần chung như `goto`, `path`.
- **Composition**: Page chứa component như một thuộc tính hoặc nhận về từ một method (`cart.product("p2")`).
- Nguyên tắc: *ưu tiên composition; dùng kế thừa cho quan hệ "là một" rõ ràng*.
- Method của Page Object có ba kiểu trả về: không gì cả (`Promise<void>`), `Locator` hoặc component (để test tiếp tục dùng), hoặc Page Object kế tiếp (khi hành động chuyển sang trang khác).

## Giải thích dễ hiểu
Trang web giống một **căn nhà lắp ghép**: mỗi trang có thanh điều hướng, bảng, hộp thoại. Thay vì vẽ lại thanh điều hướng cho từng căn nhà, bạn làm **một khối thanh điều hướng** và gắn vào mọi căn. Đó là component object.

Ví dụ trong lab: trang `/lab/cart` có 4 thẻ sản phẩm giống hệt nhau về cấu trúc (nút "Thêm vào giỏ", nút "Tăng ...", nút "Giảm ..."). Nếu bạn viết `addP1()`, `addP2()`, `addP3()` thì code nhân ba. Nếu viết `product("p2").add()` thì chỉ có **một** định nghĩa "thẻ sản phẩm biết cách thêm mình vào giỏ".

Kế thừa và composition khác nhau thế nào? Kế thừa nói "A **là một** B" (`LoginPage` là một `BasePage`). Composition nói "A **có một** B" (`CartPage` có một `ProductCard`). Nếu bạn dùng kế thừa để "mượn" chức năng thay vì thể hiện quan hệ là một, chuỗi kế thừa sẽ dài (Page → BasePage → AuthPage → AdminPage) và sửa một tầng làm vỡ các tầng dưới. Composition linh hoạt hơn: gắn thêm component nào cũng được, không ảnh hưởng nhau.

## Thực hành từng bước
Các bước dưới đây xây thêm thư mục `pages/components/`. Cấu trúc đích:

```text
pages/
  BasePage.ts
  LoginPage.ts
  CartPage.ts            sửa lại để dùng ProductCard
  OrdersPage.ts          mới
  components/
    ProductCard.ts       mới: thẻ sản phẩm của giỏ hàng
    OrderRow.ts          mới: một dòng đơn hàng
```

### Bước 1. Tạo `ProductCard` (component thẻ sản phẩm)
Mục đích: gom mọi thao tác trên một thẻ sản phẩm vào một class nhận `root`.

Tạo file `pages/components/ProductCard.ts`:

```ts
import type { Locator } from "@playwright/test";

/** Một thẻ sản phẩm của LAB-03. Mọi locator đều bắt đầu từ `root`, nên không khớp nhầm thẻ khác. */
export class ProductCard {
  constructor(private readonly root: Locator) {}

  readonly addButtonName = "Thêm vào giỏ";

  /** Locator nút Thêm vào giỏ, để test tự assert (ví dụ toBeDisabled). */
  get addButton(): Locator {
    return this.root.getByRole("button", { name: this.addButtonName });
  }

  /** Thêm vào giỏ `times` lần: lần đầu bấm Thêm, các lần sau bấm Tăng. */
  async add(times = 1) {
    await this.addButton.click();
    for (let i = 1; i < times; i++) {
      await this.root.getByRole("button", { name: /^Tăng/ }).click();
    }
  }

  async decrease() {
    await this.root.getByRole("button", { name: /^Giảm/ }).click();
  }
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `constructor(private readonly root: Locator)` | Component không cần cả `page`, chỉ cần **locator gốc** của vùng nó quản lý. `private` giữ `root` bên trong. |
| `get addButton()` | Getter: truy cập như thuộc tính (`card.addButton`) nhưng mỗi lần đọc tạo locator mới từ `root`. |
| `this.root.getByRole(...)` | Tìm nút **trong** thẻ này. Đây là điểm cốt lõi: `page.getByRole("button", { name: "Thêm vào giỏ" })` sẽ khớp cả 4 thẻ và Playwright báo lỗi strict mode. |
| `name: /^Tăng/` | Tên nút có dạng "Tăng Chuột không dây" nên so khớp theo **tiền tố** bằng biểu thức chính quy. |
| Vòng `for (let i = 1; ...)` | `times = 1` thì không lặp (chỉ bấm Thêm); `times = 2` thì bấm thêm 1 lần Tăng. |

Kết quả mong đợi: chưa chạy gì; chạy `npm run typecheck` không có lỗi.

### Bước 2. Sửa `CartPage` để dùng `ProductCard` bằng composition
Mục đích: `CartPage` không còn tự thao tác trên thẻ sản phẩm mà **trao** cho component.

Trong `pages/CartPage.ts`, thêm import và đổi hàm `product`:

```ts
import { ProductCard } from "./components/ProductCard";

// ... trong class CartPage:
  product(id: string): ProductCard {
    return new ProductCard(this.page.getByTestId(`product-${id}`));
  }
```

Bạn có thể xoá hàm `add` và `addButton` cũ trong `CartPage`, nhưng nếu `tests/examples/cart.spec.ts` đang dùng chúng thì **giữ lại** hoặc sửa test theo cách gọi mới. Đây là điểm cần thận trọng khi refactor: sửa Page Object nghĩa là sửa mọi test dùng nó, nên luôn chạy lại toàn bộ test sau khi đổi.

Test dùng cách gọi mới:

```ts
import { test, expect } from "@playwright/test";
import { CartPage } from "../pages/CartPage";

test("thêm hai chuột vào giỏ, sản phẩm hết hàng bị khoá", async ({ page }) => {
  const cart = new CartPage(page);
  await cart.goto();
  await cart.reset();

  await cart.product("p2").add(2);

  expect(await cart.amount("subtotal")).toBe(500_000);
  await expect(cart.product("p4").addButton).toBeDisabled();
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `cart.product("p2").add(2)` | Đọc như tiếng Việt: "sản phẩm p2, thêm 2 lần". Không có locator nào xuất hiện trong test. |
| `cart.amount("subtotal")` | Gọi hàm đọc số tiền của trang (xem bài 4.1); `p2` giá 250.000 nhân 2 là 500.000. |
| `cart.product("p4").addButton` | Component mở một locator để **test** assert. Sản phẩm `p4` (Tai nghe) tồn kho 0 nên nút bị khoá. |

Chạy:

```bash
npx playwright test tests/examples/cart.spec.ts
```

Kết quả mong đợi: các test xanh. Nếu thấy `TypeError: cart.add is not a function` nghĩa là còn test gọi hàm bạn đã xoá; sửa test đó sang `cart.product(id).add()`.

### Bước 3. Tạo `OrderRow` và `OrdersPage` cho lab đơn hàng
Mục đích: luyện composition với một danh sách có **nhiều dòng** và cần chọn dòng theo nội dung.

Giao diện `/lab/orders` có bảng đơn hàng, mỗi dòng `data-testid="order-row"` gồm mã, khách hàng, tổng, trạng thái và nút "Xoá" có `aria-label` dạng `Xoá o-1001`. Tạo `pages/components/OrderRow.ts`:

```ts
import type { Locator } from "@playwright/test";

/** Một dòng trong bảng đơn hàng của LAB-21. */
export class OrderRow {
  constructor(readonly root: Locator) {}

  async remove() {
    await this.root.getByRole("button", { name: /^Xoá/ }).click();
  }
}
```

Tạo `pages/OrdersPage.ts`:

```ts
import type { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import { OrderRow } from "./components/OrderRow";

/** Page Object cho LAB-21 Đơn hàng. */
export class OrdersPage extends BasePage {
  readonly path = "/lab/orders";

  readonly message = this.page.getByTestId("order-message");
  private readonly customer = this.page.getByLabel("Khách hàng");

  /** Tất cả dòng đơn hàng; test dùng toHaveCount để kiểm tra số lượng. */
  get rows(): Locator {
    return this.page.getByTestId("order-row");
  }

  /** Dòng đơn hàng theo mã, ví dụ row("o-1001"). */
  row(orderId: string): OrderRow {
    return new OrderRow(this.rows.filter({ hasText: orderId }));
  }

  async reset() {
    await this.page.getByTestId("reset-data").click();
  }

  async createOrder(customer: string, sku = "SKU-A", qty = 1) {
    await this.customer.fill(customer);
    await this.page.getByLabel("SKU dòng 1").selectOption(sku);
    await this.page.getByLabel("Số lượng dòng 1").fill(String(qty));
    await this.page.getByRole("button", { name: "Tạo đơn" }).click();
  }
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `constructor(readonly root: Locator)` | Ở đây `root` là `readonly` công khai vì test có thể muốn `expect(row.root).toContainText(...)`. Chọn `private` hay `readonly` tuỳ việc bạn muốn mở gì cho test. |
| `this.rows.filter({ hasText: orderId })` | Từ tất cả dòng, lọc ra dòng **có chứa mã đơn**. Đây là cách chọn dòng theo dữ liệu, không phụ thuộc vị trí (dòng thứ mấy). |
| `selectOption(sku)` | Chọn giá trị trong thẻ `select`. Nhãn của ô là "SKU dòng 1" (đúng như giao diện). |
| `String(qty)` | `fill` nhận chuỗi, nên đổi số sang chuỗi. |

Test dùng:

```ts
import { test, expect } from "@playwright/test";
import { OrdersPage } from "../pages/OrdersPage";

test("tạo đơn rồi xoá đơn", async ({ page }) => {
  const orders = new OrdersPage(page);
  await orders.goto();
  await orders.reset();

  await orders.createOrder("Trần Bình", "SKU-B", 2);
  await expect(orders.message).toContainText("Đã tạo đơn o-1001");
  await expect(orders.row("o-1001").root).toContainText("500.000");

  await orders.row("o-1001").remove();
  await expect(orders.rows).toHaveCount(0);
});
```

Giải thích số: `SKU-B` giá 250.000, số lượng 2 nên tổng 500.000 (giao diện hiển thị `500.000 ₫`). Mã đơn đầu tiên của lab sạch là `o-1001`.

Chạy `npx playwright test tests/orders-pom.spec.ts` (tên file bạn đặt). Kết quả mong đợi: một test xanh. Nếu thấy `strict mode violation ... resolved to 2 elements` ở `row("o-1001")`, có nghĩa bảng có hai dòng chứa chuỗi đó; hãy `reset()` trước khi tạo đơn.

### Bước 4. Phương thức trả về `this` và trả về Page Object kế tiếp
Mục đích: biết khi nào "chaining" (nối chuỗi) có ích.

Kiểu 1, trả về `this` để nối chuỗi (**fluent**):

```ts
async fillCustomer(name: string): Promise<this> {
  await this.customer.fill(name);
  return this;
}

// trong test
await (await orders.fillCustomer("An")).createOrder("An");
```

Cách này thường làm test **khó đọc hơn** vì cú pháp `await (await ...)`. Với Playwright, cách rõ ràng nhất là gọi từng dòng `await`. Chỉ dùng fluent khi cả đội đã quen.

Kiểu 2, trả về Page Object của trang kế tiếp khi hành động **chuyển trang**:

```ts
export class DashboardPanel {
  readonly heading: Locator;

  constructor(page: Page) {
    this.heading = page.getByRole("heading", { name: /Chào mừng/ });
  }
}

// trong LoginPage
async loginAsUser(): Promise<DashboardPanel> {
  await this.login("user@lab.dev", "Passw0rd!");
  return new DashboardPanel(this.page);
}
```

Ý nghĩa: sau khi đăng nhập thành công bạn đang ở "màn hình khác", nên trả về đối tượng của màn hình đó; test gọi `const dashboard = await loginPage.loginAsUser()` rồi dùng `dashboard.heading`. (Nhớ `import type { Locator, Page } from "@playwright/test"` ở đầu file. Lưu ý: ta gán locator **trong constructor** vì nếu viết `readonly heading = this.page...` cùng với tham số thuộc tính `private readonly page`, TypeScript với target ES2022 báo lỗi `Property 'page' is used before its initialization`. Ở `LoginPage` kiểu viết thuộc tính vẫn chạy được vì `page` do lớp cha `BasePage` gán xong trước.) Quy tắc: chỉ trả về Page Object kế tiếp khi hành động **luôn** dẫn tới trang đó; nếu có thể thất bại (sai mật khẩu) thì để hành động trả `void` và để test assert.

### Bước 5. Quyết định giữa kế thừa và composition bằng bảng
Dùng bảng này mỗi khi phân vân:

| Tình huống | Chọn | Lý do |
|-----------|------|-------|
| Mọi trang đều có `goto`, `path` | Kế thừa `BasePage` | Quan hệ "là một trang". |
| Nhiều trang cùng có thanh điều hướng, hộp thoại | Composition (`header` là thuộc tính) | Trang "có" thanh điều hướng, không "là" thanh điều hướng. |
| Một trang có nhiều khối giống nhau (thẻ sản phẩm, dòng đơn) | Component nhận `Locator` gốc | Mỗi khối có `root` riêng. |
| Hai trang chỉ giống nhau 2 locator | Không cần gì cả | Đừng trừu tượng hoá quá sớm. |

## Demo code
Một component dùng chung cho nhiều trang (thanh thông báo). Hiện tại lab có `data-testid="cart-message"` và `order-message`; component nhận **testid** làm tham số để dùng lại:

```ts
import { expect, type Locator, type Page } from "@playwright/test";

/** Thanh thông báo dùng chung: chỉ cần biết data-testid của nó. */
export class Message {
  readonly root: Locator;

  constructor(page: Page, testId: string) {
    this.root = page.getByTestId(testId);
  }

  async expectText(text: string | RegExp) {
    await expect(this.root).toContainText(text);
  }
}
```

Dùng trong Page Object bằng composition:

```ts
export class CartPage extends BasePage {
  readonly path = "/lab/cart";
  readonly message = new Message(this.page, "cart-message");
  // ...
}

// trong test
await cart.applyCoupon("SALE10");
await cart.message.expectText("tối thiểu");
```

Giải thích: `Message` không biết trang nào dùng nó; `CartPage` gắn nó vào bằng một dòng. Nếu thanh thông báo đổi thành `role="alert"`, bạn sửa **trong `Message`** là mọi trang hưởng lợi.

## Thử ngay trong lab
Mở `/lab/cart`, bấm "Thêm vào giỏ" ở nhiều sản phẩm và để ý mỗi thẻ có cùng cấu trúc nút. Viết test thêm hai sản phẩm khác nhau (`p1` và `p2`), kiểm tra `subtotal` bằng tổng hai giá (450.000 + 250.000 = 700.000). Rồi mở `/lab/orders` thử tạo hai đơn và dùng `row(...)` để xoá riêng từng đơn.

## Lỗi thường gặp
- **Triệu chứng:** `Error: strict mode violation: getByRole('button', { name: 'Thêm vào giỏ' }) resolved to 4 elements`. **Nguyên nhân:** component dùng `page` thay vì `root`. **Cách sửa:** mọi locator của component phải bắt đầu từ `this.root`.
- **Triệu chứng:** chuỗi kế thừa dài (Page → BasePage → AuthPage → AdminPage), sửa một tầng làm vỡ nhiều trang. **Cách sửa:** chuyển phần chung thành component và gắn bằng composition.
- **Triệu chứng:** method làm quá nhiều việc (`loginAndOpenCartAndAddItem`). **Cách sửa:** tách thành các hành động nhỏ; test ghép lại.
- **Triệu chứng:** `row(index)` chọn dòng theo vị trí, thêm đơn mới thì test chọn nhầm. **Nguyên nhân:** vị trí thay đổi khi dữ liệu đổi. **Cách sửa:** chọn theo nội dung ổn định bằng `filter({ hasText })` hoặc locator có mã.
- **Triệu chứng:** Page Object đọc `await expect(...)` trong cả chục hàm nên không ai biết test đang kiểm tra gì. **Cách sửa:** chỉ giữ vài hàm `expectXxx` rõ nghĩa; assertion chính để trong test.
- **Triệu chứng:** `TS2729: Property 'page' is used before its initialization` khi component khai báo `readonly x = this.page...` cùng tham số thuộc tính `page`. **Cách sửa:** gán locator trong constructor.

## Tóm tắt
- Component object là class cho một vùng giao diện lặp lại, nhận `Locator` gốc và chỉ tìm bên trong nó.
- Page ghép component bằng composition: `cart.product("p2").add(2)`.
- Kế thừa chỉ dành cho quan hệ "là một" (mọi trang đều là `BasePage`); phần dùng chung khác nên là component.
- Chọn dòng trong danh sách theo nội dung (`filter({ hasText })`), không theo vị trí.
- Method chỉ trả về Page Object kế tiếp khi hành động luôn dẫn tới đó; còn lại trả `void` hoặc `Locator`.

## Bài tập
1. Tách `ProductCard` ở LAB-03 thành component (như bài này) và viết test thêm hai sản phẩm khác nhau. Xong khi test xanh, file test không có `getByRole` hay `getByTestId`.
2. Viết `OrderRow` có thêm hàm `status()` trả về chữ trạng thái của dòng (gợi ý: đọc `innerText` của ô thứ tư hoặc dùng `toContainText`). Xong khi có test kiểm tra đơn mới có trạng thái `pending`.
3. Giải thích bằng 3 câu vì sao `Message` nên là composition thay vì kế thừa. Xong khi bạn nêu được một tình huống kế thừa gây rắc rối.
4. Thử thách: tạo component `Header` (nếu bài lab của bạn có thanh điều hướng) hoặc `FormField(label)` nhận nhãn và có hàm `fill(value)` và `expectError(text)`. Dùng nó trong `LoginPage` cho cả hai ô Email và Mật khẩu. Xong khi `LoginPage` không còn chuỗi `getByLabel` lặp lại.
