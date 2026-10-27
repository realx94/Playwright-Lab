---
title: Page Object Model
level: 4
order: 1
minutes: 50
summary: Gom locator và hành động của từng trang vào class, giúp test gọn và dễ bảo trì.
keywords: [page object model, pom playwright, page object vs fixture]
---

## Mục tiêu bài học
- Giải thích được vì sao test viết "thẳng" (locator rải khắp nơi) trở nên đắt đỏ khi giao diện đổi, và POM giải quyết điều đó thế nào.
- Tự tạo thư mục `pages/`, viết `BasePage`, `LoginPage`, `CartPage` từng file một và hiểu ý nghĩa từng dòng.
- Viết lại một test cũ theo kiểu POM, chạy xanh bằng `npx playwright test`.
- Phân biệt được cái gì thuộc về Page Object (locator, hành động) và cái gì thuộc về test (assertion, dữ liệu, ý đồ kiểm thử).

## Bạn cần chuẩn bị
- Đã có starter repo của Playwright Lab chạy được (bài 0.2 và 0.3), có thể chạy `npx playwright test` thành công.
- Biết viết test cơ bản với `page.goto`, locator `getByRole`/`getByLabel`/`getByTestId`, `expect` (Level 2).
- Biết cú pháp `class`, `constructor`, `async/await` của TypeScript (Level 1).
- Site lab đang chạy (local `http://localhost:3000` hoặc địa chỉ site của bạn) và biến `BASE_URL` trong file `.env` trỏ đúng vào đó.

## Kiến thức cần nắm
- **Page Object Model (POM)**: mỗi trang (hoặc vùng giao diện) được mô tả bằng một **class**.
- Class chứa **locator** (khai báo một lần) và **hành động nghiệp vụ** (`login`, `add`, `applyCoupon`).
- Test chỉ **gọi hành động** và **assert**; không biết gì về cách tìm phần tử.
- Assertion nên nằm trong test (hoặc một hàm `expectXxx` rõ nghĩa), không rải rác trong hành động của POM.
- `BasePage` giữ phần dùng chung (đường dẫn, `goto`).
- Locator của Playwright là **lười** (lazy): khai báo `page.getByLabel("Email")` chưa chạm vào trang, chỉ khi `.fill()` hay `expect` mới tìm phần tử. Vì vậy khai báo locator trong class là an toàn.

## Giải thích dễ hiểu
Hãy tưởng tượng một **điều khiển TV**: bạn bấm nút "Tăng âm lượng" mà không cần biết bên trong mạch điện thế nào. Nếu nhà sản xuất đổi mạch, bạn vẫn bấm nút cũ. POM là điều khiển cho trang web: khi giao diện đổi, bạn chỉ sửa **một nơi** (class), mọi test vẫn chạy.

Thử tính một ví dụ thật. Giả sử bạn có 30 test cần đăng nhập, mỗi test chứa dòng `page.getByLabel("Mật khẩu")`. Hôm nay dev đổi nhãn thành "Mật khẩu của bạn". Kết quả: 30 test đỏ, bạn phải mở 30 chỗ để sửa, và sót một chỗ là cả pipeline CI đỏ. Với POM, nhãn đó chỉ xuất hiện **đúng một lần** trong `LoginPage.ts`; sửa một dòng, 30 test xanh lại.

Có hai lợi ích khác ít người để ý:
1. **Test đọc như văn bản nghiệp vụ.** `await loginPage.login("user@lab.dev", "Passw0rd!")` dễ hiểu hơn ba dòng `fill/fill/click`. Người không rành code (BA, QA lead) vẫn đọc được test.
2. **Đặt tên đúng chỗ.** Khi bạn buộc phải đặt tên cho hành động (`applyCoupon`, `placeOrder`), bạn nghĩ rõ hơn test đang kiểm tra nghiệp vụ gì.

POM không phải phép màu. Nếu bạn nhồi assertion và logic nghiệp vụ vào POM, nó biến thành một "cục" khó dùng lại. Quy tắc nhớ nhanh: **POM trả lời "làm thế nào để thao tác trên trang"; test trả lời "kết quả đúng là gì"**.

```diagram
pom
```

## Thực hành từng bước
Chúng ta xây dần từng file trong thư mục `pages/` của starter repo. Mọi lệnh chạy trong thư mục gốc của starter repo (nơi có `package.json` và `playwright.config.ts`). Cấu trúc đích:

```text
starter-repo/
  pages/
    BasePage.ts      lớp cha: giữ page và hàm goto
    LoginPage.ts     Page Object cho /lab/login
    CartPage.ts      Page Object cho /lab/cart
  utils/
    money.ts         hàm đọc số tiền "1.234.000đ" thành number
  tests/
    examples/
      login.spec.ts  test dùng Page Object
```

### Bước 1. Viết một test "không có POM" để thấy vấn đề
Mục đích: có điểm xuất phát để so sánh trước và sau khi refactor.

Tạo file `tests/login-raw.spec.ts` (file này chỉ để học, sau bài có thể xoá):

```ts
import { test, expect } from "@playwright/test";

test("đăng nhập hợp lệ (viết thẳng)", async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Passw0rd!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByTestId("dashboard")).toBeVisible();
});

test("mật khẩu 7 ký tự bị từ chối (viết thẳng)", async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Pass0r!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByTestId("password-error")).toContainText("tối thiểu 8");
});
```

Giải thích từng dòng quan trọng:

| Dòng | Ý nghĩa |
|------|---------|
| `import { test, expect } from "@playwright/test"` | Lấy hàm `test` (khai báo test) và `expect` (kiểm tra) từ Playwright. |
| `async ({ page }) => {...}` | Playwright "đưa" cho test một tab trình duyệt mới tên `page` (đây chính là **fixture**, bài 4.3 sẽ nói kỹ). |
| `page.goto("/lab/login")` | Mở trang đăng nhập. Đường dẫn bắt đầu bằng `/` được ghép với `baseURL` trong `playwright.config.ts`. |
| `getByLabel("Email").fill(...)` | Tìm ô nhập gắn với nhãn "Email" rồi gõ chữ vào. |
| `getByRole("button", { name: "Đăng nhập" }).click()` | Tìm nút có vai trò button và tên "Đăng nhập", bấm vào. |
| `getByTestId("dashboard")` | Tìm phần tử có `data-testid="dashboard"` (khối chào mừng sau khi đăng nhập). |

Chạy thử:

```bash
npx playwright test tests/login-raw.spec.ts
```

Kết quả mong đợi:

```text
Running 2 tests using 2 workers
  2 passed (4.1s)
```

Nhìn lại: ba dòng `fill/fill/click` bị lặp ở cả hai test; địa chỉ `/lab/login` cũng lặp. Nếu có 30 test thì 30 lần.

Nếu gặp lỗi: thông báo `Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/lab/login` nghĩa là site lab chưa chạy hoặc `BASE_URL` sai. Mở `.env` kiểm tra, rồi mở địa chỉ đó trên trình duyệt để chắc chắn site lên.

### Bước 2. Tạo thư mục `pages/` và viết `BasePage`
Mục đích: tạo lớp cha giữ phần mọi trang đều cần (cầm `page` và biết cách mở trang).

Tạo file `pages/BasePage.ts`:

```ts
import type { Page } from "@playwright/test";

/** Lớp cha cho mọi Page Object: giữ `page` và hàm điều hướng dùng chung. */
export abstract class BasePage {
  /** Đường dẫn của trang (ghép với baseURL trong playwright.config.ts). */
  abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  /** Mở trang; `bugs` bật bug có chủ đích của lab, ví dụ ["BUG-01"]. */
  async goto(bugs: string[] = []) {
    const query = bugs.length ? `?bugs=${bugs.join(",")}` : "";
    await this.page.goto(this.path + query);
  }
}
```

Giải thích từng dòng:

| Phần code | Ý nghĩa |
|-----------|---------|
| `import type { Page }` | Chỉ nhập **kiểu** `Page` (không nhập giá trị), giúp TypeScript kiểm tra mà không tạo mã thừa lúc chạy. |
| `export abstract class BasePage` | Class **trừu tượng**: không tạo trực tiếp bằng `new BasePage(...)`, chỉ dùng làm cha cho class khác. |
| `abstract readonly path: string` | Ép mọi class con **phải** khai báo `path` (ví dụ `"/lab/login"`). Quên khai báo thì TypeScript báo lỗi ngay. |
| `constructor(protected readonly page: Page) {}` | Cú pháp rút gọn của TypeScript: vừa nhận tham số `page`, vừa tạo thuộc tính `this.page`. `protected` nghĩa là class con dùng được, code bên ngoài thì không. `readonly` nghĩa là không gán lại được. |
| `bugs: string[] = []` | Tham số có giá trị mặc định là mảng rỗng. Lab của site cho bật bug bằng `?bugs=BUG-01`. |
| `bugs.length ? ... : ""` | Nếu có bug thì ghép chuỗi truy vấn `?bugs=BUG-01,BUG-02`, không thì để trống. |
| `this.page.goto(this.path + query)` | Mở `đường dẫn + truy vấn`; Playwright tự ghép với `baseURL`. |

Kết quả mong đợi: chưa có gì chạy; kiểm tra bằng `npm run typecheck`. Không có lỗi là đạt.

Nếu gặp lỗi: `Cannot find module '@playwright/test'` nghĩa là chưa chạy `npm install` trong thư mục starter repo.

### Bước 3. Viết `LoginPage`: khai báo locator
Mục đích: gom mọi locator của trang đăng nhập vào một nơi.

Tạo file `pages/LoginPage.ts` với phần đầu:

```ts
import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/** Page Object cho LAB-01 Login. Locator khai báo một chỗ, test chỉ gọi hành động nghiệp vụ. */
export class LoginPage extends BasePage {
  readonly path = "/lab/login";

  private readonly email = this.page.getByLabel("Email");
  private readonly password = this.page.getByLabel("Mật khẩu");
  private readonly submitButton = this.page.getByRole("button", { name: "Đăng nhập" });
  readonly dashboard = this.page.getByTestId("dashboard");
  readonly emailError = this.page.getByTestId("email-error");
  readonly passwordError = this.page.getByTestId("password-error");
  readonly formError = this.page.getByTestId("form-error");
```

Giải thích từng dòng:

| Phần code | Ý nghĩa |
|-----------|---------|
| `extends BasePage` | Kế thừa: có sẵn `this.page` và hàm `goto`. |
| `readonly path = "/lab/login"` | Thực hiện yêu cầu `abstract path` của lớp cha. |
| `private readonly email = this.page.getByLabel("Email")` | Khai báo locator ô Email. `private`: chỉ bên trong class dùng; test không cần biết ô này tồn tại, chỉ cần gọi `login(...)`. |
| `readonly dashboard`, `emailError`... | Không `private`: đây là các phần tử mà **test cần assert** (ví dụ "khối dashboard hiện ra", "báo lỗi mật khẩu"). |
| `this.page` trong khởi tạo thuộc tính | Chạy được vì constructor của `BasePage` đã gán `this.page` trước khi các thuộc tính của class con được khởi tạo. |

Một điểm quan trọng: **POM không giữ giá trị của phần tử**, chỉ giữ cách tìm. Trang đổi thế nào thì mỗi lần dùng locator vẫn tìm lại, nên không bị "phần tử cũ" (stale).

### Bước 4. Viết hành động nghiệp vụ và hàm kiểm tra gọn
Mục đích: bọc chuỗi thao tác thành hành động có tên nghiệp vụ.

Tiếp tục file `LoginPage.ts` (thêm vào trong class, trước dấu `}` cuối):

```ts
  async reset() {
    await this.page.getByTestId("reset-data").click();
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submitButton.click();
  }

  async expectLoggedIn() {
    await expect(this.dashboard).toBeVisible();
  }
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `reset()` | Bấm nút "Reset dữ liệu lab" (`data-testid="reset-data"`) để xoá trạng thái cũ, vì lab lưu phiên trong localStorage. Gọi ở đầu test để mỗi test bắt đầu sạch. |
| `login(email, password)` | Hành động nghiệp vụ gồm 3 thao tác. Tên và tham số nói rõ test cần truyền gì. |
| `await` ở mỗi dòng | Mỗi thao tác của Playwright là bất đồng bộ; thiếu `await` thì dòng sau chạy khi dòng trước chưa xong. |
| `expectLoggedIn()` | Một hàm assertion có tên nghiệp vụ. Hàm này **chỉ kiểm tra một kết quả**, không thao tác gì. |

Lưu ý về `reset()`: nút `reset-data` có ở cả hai trạng thái của trang lab (đã đăng nhập và chưa đăng nhập), nên gọi được ở mọi lúc.

### Bước 5. Dùng `LoginPage` trong test
Mục đích: thấy test ngắn đi và đọc như văn bản nghiệp vụ.

Tạo file `tests/login-pom.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test("đăng nhập hợp lệ (POM)", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.reset();

  await loginPage.login("user@lab.dev", "Passw0rd!");

  await loginPage.expectLoggedIn();
});

test("mật khẩu 7 ký tự bị từ chối (POM)", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.reset();

  await loginPage.login("user@lab.dev", "Pass0r!");

  await expect(loginPage.passwordError).toContainText("tối thiểu 8");
});
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `new LoginPage(page)` | Tạo Page Object, đưa `page` của test vào. Mỗi test có `page` riêng nên mỗi test cần một Page Object riêng. |
| `loginPage.goto()` | Dùng hàm kế thừa từ `BasePage`; không cần gõ địa chỉ trong test. |
| `await expect(loginPage.passwordError).toContainText(...)` | Assertion nằm **trong test** vì đây là "ý đồ kiểm thử": mật khẩu 7 ký tự phải bị từ chối với thông điệp cụ thể. |
| Cách chia đoạn Sắp xếp - Hành động - Kiểm tra | Dòng trống ngăn ba phần giúp người đọc nhìn ra cấu trúc test. |

Chạy:

```bash
npx playwright test tests/login-pom.spec.ts
```

Kết quả mong đợi:

```text
Running 2 tests using 2 workers
  2 passed (4.0s)
```

Bây giờ thử "đổi giao diện" để thấy lợi ích: mở `pages/LoginPage.ts`, cố ý đổi `getByLabel("Mật khẩu")` thành `getByLabel("Mật khẩu của bạn")` và chạy lại. Cả hai test đỏ **cùng một nguyên nhân**, bạn sửa **một dòng** là xanh lại. Nhớ trả lại như cũ sau khi thử.

Nếu gặp lỗi: thông báo `locator.fill: Test timeout of 30000ms exceeded ... waiting for getByLabel('Mật khẩu của bạn')` cho biết đúng locator nào sai; đó là một ưu điểm khác của POM, vì chỉ cần nhìn tên locator là biết sửa ở đâu.

### Bước 6. Viết `CartPage` cho giỏ hàng và hàm tiện ích tiền tệ
Mục đích: thấy POM cho trang phức tạp hơn, có locator **động** (theo id sản phẩm) và dữ liệu đọc ra.

Trước hết `utils/money.ts` (đã có sẵn trong starter):

```ts
/** "1.234.000đ" → 1234000, "-100.000đ" → -100000. Giữ dấu trừ, bỏ mọi ký tự không phải số. */
export function parseMoney(text: string): number {
  return Number(text.replace(/[^\d-]/g, ""));
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `text.replace(/[^\d-]/g, "")` | Xoá mọi ký tự **không** phải chữ số hoặc dấu `-`. Dấu chấm ngăn cách hàng nghìn và chữ `đ` biến mất. |
| `Number(...)` | Đổi chuỗi còn lại ("-100000") thành số. |

Tiếp theo `pages/CartPage.ts` (phần đầu):

```ts
import type { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import { parseMoney } from "../utils/money";

export type AmountId = "subtotal" | "discount" | "vat" | "shipping" | "total";

/** Page Object cho LAB-03 Giỏ hàng & Checkout. */
export class CartPage extends BasePage {
  readonly path = "/lab/cart";

  readonly message = this.page.getByTestId("cart-message");
  readonly orderStatus = this.page.getByTestId("order-status");
  readonly cancelButton = this.page.getByRole("button", { name: "Huỷ đơn" });

  private product(id: string): Locator {
    return this.page.getByTestId(`product-${id}`);
  }
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `type AmountId = ...` (năm chuỗi) | Kiểu liệt kê các chuỗi hợp lệ: `"subtotal"`, `"discount"`, `"vat"`, `"shipping"`, `"total"`. Gõ sai `"totl"` sẽ báo lỗi ngay khi biên dịch. |
| `product(id)` | Hàm trả về **locator của thẻ sản phẩm** theo id (`product-p2`). Dùng hàm vì có nhiều sản phẩm, không thể khai báo một thuộc tính cho từng cái. |
| Kiểu trả về `Locator` | Khẳng định hàm này trả về locator, không thao tác gì. |

Phần hành động (tiếp tục trong class):

```ts
  async reset() {
    await this.page.getByTestId("reset-data").click();
  }

  /** Thêm sản phẩm vào giỏ `times` lần (lần đầu bấm Thêm, các lần sau bấm Tăng). */
  async add(productId: string, times = 1) {
    const card = this.product(productId);
    await card.getByRole("button", { name: "Thêm vào giỏ" }).click();
    for (let i = 1; i < times; i++) await card.getByRole("button", { name: /^Tăng/ }).click();
  }

  addButton(productId: string): Locator {
    return this.product(productId).getByRole("button", { name: "Thêm vào giỏ" });
  }

  async applyCoupon(code: string) {
    await this.page.getByLabel("Mã giảm giá").fill(code);
    await this.page.getByRole("button", { name: "Áp dụng" }).click();
  }

  /** Đọc số tiền hiển thị (ví dụ "-100.000đ") thành number. */
  async amount(id: AmountId): Promise<number> {
    return parseMoney(await this.page.getByTestId(id).innerText());
  }

  async placeOrder() {
    await this.page.getByRole("button", { name: "Đặt hàng" }).click();
  }

  /** Chuyển đơn sang trạng thái kế tiếp, ví dụ advanceTo("Đã thanh toán"). */
  async advanceTo(status: string) {
    await this.page.getByRole("button", { name: `Chuyển: ${status}` }).click();
  }
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `add(productId, times = 1)` | Lần bấm đầu là nút "Thêm vào giỏ"; sau khi vào giỏ, nút đổi thành bộ đếm nên các lần sau bấm nút có tên bắt đầu bằng "Tăng" (`/^Tăng/` là biểu thức chính quy: bắt đầu bằng chữ Tăng). |
| `addButton(productId)` | Trả về locator để **test** tự assert (ví dụ `toBeDisabled()` cho sản phẩm hết hàng). POM không tự quyết điều đó. |
| `amount(id)` | Đọc chữ hiển thị rồi đổi sang số. Test so sánh số với số, không phải chuỗi có dấu chấm. |
| Kiểu `Promise<number>` | Hàm `async` luôn trả `Promise`; ghi rõ để người gọi biết phải `await` và nhận số. |

Dùng trong test:

```ts
import { test, expect } from "@playwright/test";
import { CartPage } from "../pages/CartPage";

test("đơn dưới 1 triệu tính ship 30.000 và VAT 8%", async ({ page }) => {
  const cart = new CartPage(page);
  await cart.goto();
  await cart.reset();

  await cart.add("p2"); // Chuột không dây: 250.000

  expect(await cart.amount("shipping")).toBe(30_000);
  expect(await cart.amount("vat")).toBe(20_000);
  expect(await cart.amount("total")).toBe(300_000);
});
```

Giải thích số liệu: sản phẩm `p2` giá 250.000; VAT 8% là 20.000; đơn nhỏ hơn 1 triệu tính phí ship 30.000; tổng 250.000 + 20.000 + 30.000 = 300.000. `30_000` là cách viết số của JavaScript dùng dấu gạch dưới cho dễ đọc.

Kết quả mong đợi: test xanh. Nếu `amount("vat")` trả `NaN`, kiểm tra `data-testid` có đúng (`vat`) và `parseMoney` có nhận chuỗi rỗng không (nghĩa là phần tử có nhưng chưa có chữ).

### Bước 7. Chạy toàn bộ ví dụ có sẵn của starter
Mục đích: so khớp những gì bạn viết với ví dụ chuẩn.

```bash
npx playwright test tests/examples
```

Kết quả mong đợi: 4 test đạt (2 test login, 2 test cart). Mở `tests/examples/login.spec.ts` và `tests/examples/cart.spec.ts` đối chiếu cách gọi Page Object. Ở bài 4.3 bạn sẽ thấy hai ví dụ này dùng **fixture** để không phải tự `new LoginPage(page)` và `reset()` ở mỗi test.

## Demo code
Phần tổng kết: `LoginPage.ts` hoàn chỉnh và test dùng nó. Đây đúng là file có trong `starter-repo/pages/`.

```ts
import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  readonly path = "/lab/login";

  private readonly email = this.page.getByLabel("Email");
  private readonly password = this.page.getByLabel("Mật khẩu");
  private readonly submitButton = this.page.getByRole("button", { name: "Đăng nhập" });
  readonly dashboard = this.page.getByTestId("dashboard");
  readonly emailError = this.page.getByTestId("email-error");
  readonly passwordError = this.page.getByTestId("password-error");
  readonly formError = this.page.getByTestId("form-error");

  async reset() {
    await this.page.getByTestId("reset-data").click();
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submitButton.click();
  }

  async expectLoggedIn() {
    await expect(this.dashboard).toBeVisible();
  }
}
```

Một test kiểm tra thông báo lỗi đăng nhập sai bằng POM:

```ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test("sai mật khẩu hiện lỗi chung", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.reset();

  // Mật khẩu hợp lệ về định dạng nhưng không đúng với tài khoản
  await loginPage.login("user@lab.dev", "Sai0Mat!khau");

  await expect(loginPage.formError).toHaveText("Email hoặc mật khẩu không đúng");
});
```

Chú ý: mật khẩu `Sai0Mat!khau` có hoa, thường, số, ký tự đặc biệt và dài đủ, nên qua được bước kiểm tra định dạng; sau đó mới bị từ chối vì không khớp tài khoản. Nếu bạn dùng chuỗi quá đơn giản (ví dụ `abc`) bạn sẽ nhận lỗi định dạng ở ô mật khẩu chứ không phải lỗi chung.

## Thử ngay trong lab
Mở `/lab/login` và `/lab/cart` trong trình duyệt. Thử bật bug bằng đường dẫn `/lab/login?bugs=BUG-01` rồi dùng `loginPage.goto(["BUG-01"])` trong test: đây là lý do `BasePage.goto` nhận tham số `bugs`. Viết test "mật khẩu 7 ký tự bị từ chối", chạy lúc không bật bug (xanh) và lúc bật `BUG-01` (đỏ) để thấy test của bạn bắt được lỗi.

## Lỗi thường gặp
- **Triệu chứng:** `TypeError: Cannot read properties of undefined (reading 'getByLabel')`. **Nguyên nhân:** khai báo locator trong class bằng `page` thay vì `this.page`, hoặc quên `super(page)` khi tự viết constructor ở class con. **Cách sửa:** dùng `this.page`; nếu class con cần constructor riêng thì gọi `super(page)` trước.
- **Triệu chứng:** test đọc `expect(...)` rải khắp POM, khi test đỏ không biết test đang kiểm tra gì. **Nguyên nhân:** nhồi assertion vào hành động như `login()` kiểm tra luôn "đã đăng nhập". **Cách sửa:** để hành động chỉ làm việc; tạo hàm riêng `expectLoggedIn()` hoặc để test tự `expect`.
- **Triệu chứng:** method tên `loginAndOpenCartAndAddItem`. **Nguyên nhân:** gộp quá nhiều bước nên không dùng lại được. **Cách sửa:** tách nhỏ theo nghiệp vụ và để test ghép chuỗi.
- **Triệu chứng:** `Error: ... strict mode violation: getByRole('button', { name: 'Đăng nhập' }) resolved to 2 elements`. **Nguyên nhân:** locator trong POM khớp nhiều phần tử vì tiêu đề form cũng có chữ "Đăng nhập" hoặc bạn dùng locator quá chung. **Cách sửa:** thu hẹp locator (thêm `exact: true`, giới hạn trong form) ngay **trong POM**, chỉ sửa một nơi.
- **Triệu chứng:** thiếu `await` trước `loginPage.login(...)` nên bước kiểm tra chạy quá sớm và test chập chờn. **Cách sửa:** luôn `await` hành động bất đồng bộ; bật quy tắc ESLint `@typescript-eslint/no-floating-promises` nếu có.
- **Triệu chứng:** hai test dùng chung một đối tượng `LoginPage` khai báo ở cấp file. **Nguyên nhân:** `page` của mỗi test khác nhau nên Page Object cũ trỏ vào tab đã đóng. **Cách sửa:** tạo Page Object **trong từng test** (hoặc qua fixture, bài 4.3).

## Tóm tắt
- POM gom locator và hành động của một trang vào một class; khi giao diện đổi chỉ sửa một nơi.
- `BasePage` giữ `page`, `path` và `goto`; class con khai báo locator và hành động nghiệp vụ.
- Locator của Playwright là lười, nên khai báo trong class là an toàn và không bị "stale".
- Assertion thể hiện ý đồ kiểm thử nên để trong test; POM chỉ mở cửa các locator cần assert (`readonly`) và giữ locator khác ở `private`.
- Test viết theo POM đọc như văn bản nghiệp vụ và ngắn hơn nhiều.

## Bài tập
1. Viết lại hai test trong `tests/login-raw.spec.ts` bằng `LoginPage` rồi xoá file cũ. Xong khi `npx playwright test tests/login-pom.spec.ts` xanh và không còn chuỗi `getByLabel` nào trong file test.
2. Viết test `CartPage` cho "sản phẩm hết hàng không thêm được" (dùng `cart.addButton("p4")` với `toBeDisabled()`). Xong khi test xanh và file test không chứa `getByTestId`.
3. Thêm vào `CartPage` hành động `decrease(productId)` bấm nút "Giảm ..." của thẻ sản phẩm (tên nút có dạng `Giảm <tên sản phẩm>`, dùng regex `/^Giảm/`). Viết test thêm `p2` hai lần rồi giảm một lần. Xong khi `amount("subtotal")` bằng 250.000.
4. Cố ý đổi nhãn "Mật khẩu" trong `LoginPage` thành nhãn sai, đếm số test đỏ, rồi sửa một dòng cho xanh lại. Xong khi bạn giải thích được vì sao sửa một dòng là đủ.
5. Thử thách: viết hai test cho biên mật khẩu bằng `login()` và `toContainText`: 7 ký tự phải báo "tối thiểu 8", 33 ký tự phải báo "tối đa 32". Xong khi cả hai xanh trên lab sạch, rồi đỏ khi bạn bật `?bugs=BUG-01` ở test 7 ký tự.
