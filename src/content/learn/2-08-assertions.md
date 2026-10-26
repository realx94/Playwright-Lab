---
title: Assertion
level: 2
order: 8
minutes: 45
summary: Web-first assertion tự thử lại, các matcher thường dùng, soft assertion, expect.poll và cách viết assertion có ý nghĩa nghiệp vụ.
keywords: [expect auto-retrying, soft assertion, expect.poll]
---

## Mục tiêu bài học
- Giải thích được vì sao `await expect(locator).toHaveText(...)` ổn định hơn `expect(await locator.innerText()).toBe(...)`.
- Chọn đúng matcher cho từng tình huống: hiển thị, văn bản, giá trị ô nhập, số lượng, URL, trạng thái bật/tắt.
- Dùng `expect.soft`, `expect.poll` và `toPass` khi một assertion thông thường không đủ.
- Viết assertion cho kết quả nghiệp vụ (số tiền, trạng thái đơn) với giá trị kỳ vọng tính từ quy tắc, không chép từ màn hình.

## Bạn cần chuẩn bị
- Đã học bài 2.4 (cấu trúc một file test), 2.5 và 2.6 (locator), 2.7 (actions).
- Dự án Playwright chạy được (bài 0.2, 0.3). Trong bài này ví dụ chạy trên site lab: `/lab/todo` (LAB-04), `/lab/login` (LAB-01), `/lab/cart` (LAB-03). Cấu hình `baseURL` của repo trỏ tới site lab nên `page.goto("/lab/todo")` là đủ.

## Kiến thức cần nắm
- **Assertion** (khẳng định): một câu "tôi kỳ vọng X đúng". Nếu sai, test đỏ.
- **Web-first assertion**: assertion gọi trên `locator` hoặc `page`, tự thử lại đến khi đúng hoặc hết timeout (mặc định 5 giây).
- **Generic assertion** (`expect(value).toBe(...)`): so sánh một giá trị đã lấy sẵn, chạy một lần, không thử lại.
- Matcher thường dùng: `toBeVisible`, `toBeHidden`, `toHaveText`, `toContainText`, `toHaveValue`, `toBeEnabled`, `toBeDisabled`, `toBeChecked`, `toHaveCount`, `toHaveURL`, `toHaveAttribute`.
- `.not` để phủ định; `expect.soft` để không dừng test ngay; `expect.poll` và `toPass` cho điều kiện ngoài locator.

## Giải thích dễ hiểu
Hãy tưởng tượng bạn đứng chờ thang máy và muốn biết "thang đã đến tầng 5 chưa". Cách thứ nhất: nhìn bảng số đúng một lần rồi kết luận. Nếu thang đang ở tầng 4, bạn kết luận "chưa đến" dù chỉ một giây sau nó đến. Cách thứ hai: nhìn bảng liên tục cho đến khi hiện số 5 hoặc bạn chán chờ (hết timeout). Cách thứ hai chính là **web-first assertion**.

Trang web hiện đại cập nhật giao diện bất đồng bộ: bấm nút xong, thông báo lỗi hiện ra sau vài chục mili giây. Assertion kiểu "nhìn một lần" sẽ lúc đúng lúc sai tuỳ tốc độ máy. Đó là nguồn gốc phổ biến nhất của **flaky test** (test lúc xanh lúc đỏ dù code không đổi). Vì vậy quy tắc số một: khi muốn kiểm tra nội dung trên giao diện, hãy truyền **locator** vào `expect`, đừng lấy chữ ra rồi mới so sánh.

Có một cách nhớ: nếu trong ngoặc của `expect(...)` là một `locator` hoặc `page`, assertion tự thử lại. Nếu là chuỗi, số hay object bình thường, assertion chỉ chạy một lần.

## Thực hành từng bước

Các bước dưới đây dùng LAB-04 (danh sách công việc). Tạo file `tests/assertions.spec.ts` (trong repo gốc của site thì đặt ở `e2e/`) và dán dần từng đoạn.

### Bước 1. Dựng khung test và mở lab ở trạng thái sạch

Mục đích: mỗi test bắt đầu từ danh sách rỗng để kết quả không phụ thuộc lần chạy trước.

```ts
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/todo");
  await page.getByTestId("reset-data").click();
});
```

| Phần | Ý nghĩa |
|------|---------|
| `import { test, expect }` | Lấy hàm khai báo test và hàm khẳng định từ Playwright |
| `test.beforeEach(...)` | Hook chạy trước mỗi test trong file (xem bài 2.11) |
| `page.goto("/lab/todo")` | Mở trang; đường dẫn tương đối được ghép với `baseURL` trong config |
| `getByTestId("reset-data").click()` | Bấm nút "Reset dữ liệu lab", xoá dữ liệu lưu trong trình duyệt |

Kết quả mong đợi: chưa có test nào để chạy nên chưa thấy gì. Từ bước sau bạn sẽ chạy bằng `npx playwright test assertions`.

### Bước 2. Assertion hiển thị và văn bản

Mục đích: kiểm tra trạng thái rỗng, rồi nội dung sau khi thêm việc.

```ts
test("danh sách rỗng lúc đầu, có một việc sau khi thêm", async ({ page }) => {
  await expect(page.getByTestId("todo-empty")).toBeVisible();
  await expect(page.getByTestId("todo-count")).toHaveText("Còn 0 việc");

  await page.getByLabel("Công việc mới").fill("Mua sữa");
  await page.getByRole("button", { name: "Thêm", exact: true }).click();

  await expect(page.getByTestId("todo-empty")).toBeHidden();
  await expect(page.getByTestId("todo-title")).toHaveText("Mua sữa");
  await expect(page.getByTestId("todo-count")).toHaveText("Còn 1 việc");
});
```

| Dòng | Giải thích |
|------|-----------|
| `toBeVisible()` | Phần tử có trong DOM và nhìn thấy được (có kích thước, không bị `visibility: hidden`) |
| `toHaveText("Còn 0 việc")` | Văn bản của phần tử khớp **toàn bộ** chuỗi (bỏ qua khoảng trắng thừa ở hai đầu) |
| `toBeHidden()` | Phần tử không hiển thị **hoặc không tồn tại trong DOM**; tương đương `not.toBeVisible()` |
| `exact: true` ở nút Thêm | Tránh khớp nhầm với các nút khác có chữ "Thêm" trong tên |

Kết quả mong đợi khi chạy `npx playwright test assertions`:

```text
Running 1 test using 1 worker
  1 passed (2.1s)
```

Nếu gặp lỗi: thông báo `Error: expect(locator).toHaveText(expected)` kèm `Expected string: "Còn 1 việc"` và `Received string: "Còn 0 việc"` nghĩa là sau 5 giây giao diện vẫn không đổi; kiểm tra lại bước thêm việc có chạy thật không (nhãn "Công việc mới" có đúng chính tả không).

### Bước 3. `toHaveText` khác `toContainText`

Mục đích: biết chọn khớp toàn bộ hay khớp một phần.

```ts
test("thông báo lỗi khi nhập tên rỗng", async ({ page }) => {
  await page.getByRole("button", { name: "Thêm", exact: true }).click();

  await expect(page.getByTestId("todo-error")).toContainText("Vui lòng nhập");
  await expect(page.getByTestId("todo-error")).toHaveText(/Vui lòng nhập/);
});
```

| Matcher | Khi nào dùng |
|---------|--------------|
| `toHaveText("...")` | Cần khớp đúng toàn bộ chữ (nhãn ngắn, trạng thái) |
| `toContainText("...")` | Chỉ cần chứa một cụm từ cốt lõi (thông báo lỗi dài, có số thay đổi) |
| `toHaveText(/regex/)` | Cần khớp mẫu, ví dụ `/Còn \d+ việc/` |

Kết quả mong đợi: test xanh. Dùng `toContainText` cho thông báo lỗi giúp test không vỡ khi câu chữ được chỉnh nhẹ.

### Bước 4. Số lượng phần tử và danh sách nhiều phần tử

Mục đích: kiểm tra số dòng và nội dung từng dòng bằng một assertion.

```ts
test("thêm ba việc và kiểm tra cả danh sách", async ({ page }) => {
  for (const title of ["A", "B", "C"]) {
    await page.getByLabel("Công việc mới").fill(title);
    await page.getByRole("button", { name: "Thêm", exact: true }).click();
  }

  await expect(page.getByTestId("todo-item")).toHaveCount(3);
  await expect(page.getByTestId("todo-title")).toHaveText(["A", "B", "C"]);
});
```

| Dòng | Giải thích |
|------|-----------|
| `toHaveCount(3)` | Locator khớp đúng 3 phần tử. Có thể dùng `toHaveCount(0)` để khẳng định "không còn phần tử nào" |
| `toHaveText(["A", "B", "C"])` | Khi locator khớp nhiều phần tử, truyền **mảng**: phải đúng số lượng và đúng thứ tự từng phần tử |

Kết quả mong đợi: test xanh. Nếu đổi thứ tự mảng thành `["B", "A", "C"]`, lỗi sẽ in ra hai danh sách để bạn so sánh.

### Bước 5. Trạng thái bật/tắt và ô nhập

Mục đích: kiểm tra checkbox, nút bị vô hiệu và giá trị ô nhập.

```ts
test("hoàn thành một việc làm nút dọn dẹp được bật", async ({ page }) => {
  await page.getByLabel("Công việc mới").fill("Mua sữa");
  await page.getByRole("button", { name: "Thêm", exact: true }).click();

  const clearDone = page.getByRole("button", { name: "Xoá các việc đã xong" });
  await expect(clearDone).toBeDisabled();

  await page.getByRole("checkbox", { name: "Hoàn thành: Mua sữa" }).check();
  await expect(page.getByRole("checkbox", { name: "Hoàn thành: Mua sữa" })).toBeChecked();
  await expect(clearDone).toBeEnabled();

  await expect(page.getByLabel("Công việc mới")).toHaveValue("");
});
```

| Matcher | Ý nghĩa |
|---------|---------|
| `toBeDisabled()` / `toBeEnabled()` | Nút hoặc ô nhập đang bị vô hiệu / đang dùng được |
| `toBeChecked()` | Checkbox hoặc radio đang được chọn |
| `toHaveValue("")` | Giá trị của ô nhập đúng bằng chuỗi (ở đây ô đã được xoá sau khi thêm) |

Kết quả mong đợi: test xanh. Lưu ý trong repo này checkbox là `Checkbox` của shadcn nên khi tìm phải dùng `getByRole("checkbox", ...)`, không dùng `getByLabel` (xem lưu ý cuối bài).

### Bước 6. Phủ định bằng `.not` và URL, thuộc tính

Mục đích: khẳng định một điều không xảy ra, và kiểm tra địa chỉ trang.

```ts
test("đổi bộ lọc không đổi URL, nút lọc đang chọn có aria-pressed", async ({ page }) => {
  await page.getByRole("button", { name: "Đang làm" }).click();

  await expect(page).toHaveURL(/\/lab\/todo/);
  await expect(page.getByRole("button", { name: "Đang làm" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Tất cả" })).not.toHaveAttribute("aria-pressed", "true");
});
```

| Dòng | Giải thích |
|------|-----------|
| `expect(page).toHaveURL(/.../)` | Assertion trên `page`; chấp nhận chuỗi, regex hoặc hàm. Dùng regex để không phụ thuộc domain |
| `toHaveAttribute("aria-pressed", "true")` | Thuộc tính HTML có đúng giá trị |
| `.not` | Đảo nghĩa. Assertion phủ định cũng tự thử lại: nó chờ cho đến khi điều kiện "không còn đúng" |

Kết quả mong đợi: test xanh.

### Bước 7. Soft assertion: thu thập nhiều lỗi trong một lần chạy

Mục đích: khi một màn hình có nhiều giá trị độc lập, muốn biết tất cả cái nào sai thay vì dừng ở cái đầu tiên.

```ts
test("giỏ hàng: phí ship, VAT và tổng", async ({ page }) => {
  await page.goto("/lab/cart");
  await page.getByTestId("reset-data").click();

  const card = page.getByTestId("product-p2");
  await card.getByRole("button", { name: "Thêm vào giỏ" }).click();

  await expect.soft(page.getByTestId("shipping")).toContainText("30.000");
  await expect.soft(page.getByTestId("vat")).toContainText("20.000");
  await expect.soft(page.getByTestId("total")).toContainText("300.000");
});
```

`expect.soft` ghi nhận lỗi nhưng test vẫn chạy tiếp đến hết; cuối cùng test được đánh dấu đỏ và báo cáo liệt kê mọi assertion sai. Dùng cho nhóm kiểm tra độc lập (ba dòng tiền ở trên). Không dùng soft khi các bước sau phụ thuộc vào bước trước (ví dụ đăng nhập thất bại thì kiểm tra dashboard vô nghĩa).

Kết quả mong đợi: xanh khi phí ship, VAT và tổng đúng theo quy tắc của LAB-03. Nếu bật `?bugs=BUG-xx` liên quan tới tiền, bạn sẽ thấy nhiều dòng lỗi cùng lúc.

### Bước 8. `expect.poll` và `toPass` cho điều kiện ngoài locator

Mục đích: chờ một giá trị không nằm trên giao diện, ví dụ trạng thái lấy qua API hoặc lưu trong localStorage.

```ts
test("dữ liệu todo được lưu vào localStorage", async ({ page }) => {
  await page.getByLabel("Công việc mới").fill("Mua sữa");
  await page.getByRole("button", { name: "Thêm", exact: true }).click();

  // Poll: chạy lại hàm bên trong mỗi vài trăm ms cho đến khi khớp hoặc hết timeout
  await expect
    .poll(async () => {
      const raw = await page.evaluate(() => Object.values(localStorage).join(""));
      return raw.includes("Mua sữa");
    })
    .toBe(true);

  // toPass: thử lại cả một khối lệnh gồm nhiều assertion
  await expect(async () => {
    const count = await page.getByTestId("todo-item").count();
    expect(count).toBe(1);
  }).toPass({ timeout: 5_000 });
});
```

| Phần | Giải thích |
|------|-----------|
| `expect.poll(fn)` | Gọi `fn` nhiều lần, mỗi lần lấy giá trị mới rồi so với matcher phía sau |
| `page.evaluate(() => ...)` | Chạy JavaScript trong trang và trả kết quả về test |
| `expect(async () => {...}).toPass()` | Chạy lại cả khối nếu bất kỳ assertion bên trong ném lỗi |

Kết quả mong đợi: xanh. `poll` và `toPass` là giải pháp cuối cùng; nếu có thể đưa điều kiện về locator (`toHaveText`...) thì luôn ưu tiên.

### Bước 9. Chỉnh timeout của một assertion

Mục đích: cho phép một assertion chờ lâu hơn khi thao tác thật sự chậm.

```ts
await expect(page.getByTestId("dashboard")).toBeVisible({ timeout: 10_000 });
```

Tuỳ chọn `timeout` chỉ áp dụng cho assertion đó. Chi tiết các loại timeout xem bài 2.9.

## Demo code

File hoàn chỉnh gom các ý chính, chạy được trên LAB-04 và LAB-01:

```ts
import { test, expect } from "@playwright/test";

test.describe("Assertion trên LAB-04", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/todo");
    await page.getByTestId("reset-data").click();
  });

  test("thêm việc: kiểm tra số lượng, nội dung và bộ đếm", async ({ page }) => {
    for (const title of ["A", "B"]) {
      await page.getByLabel("Công việc mới").fill(title);
      await page.getByRole("button", { name: "Thêm", exact: true }).click();
    }
    await expect(page.getByTestId("todo-item")).toHaveCount(2);
    await expect(page.getByTestId("todo-title")).toHaveText(["A", "B"]);
    await expect(page.getByTestId("todo-count")).toHaveText("Còn 2 việc");
  });

  test("xoá có xác nhận: dialog hiện rồi đóng", async ({ page }) => {
    await page.getByLabel("Công việc mới").fill("A");
    await page.getByRole("button", { name: "Thêm", exact: true }).click();

    await page.getByRole("button", { name: "Xoá A" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Xoá hẳn" }).click();

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByTestId("todo-empty")).toBeVisible();
  });
});

test("LAB-01: mật khẩu ngắn bị từ chối", async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByTestId("reset-data").click();
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Pass0r!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  // Sai: lấy chữ ra rồi so, không tự thử lại
  // expect(await page.getByTestId("password-error").innerText()).toContain("tối thiểu 8");

  // Đúng: web-first
  await expect(page.getByTestId("password-error")).toContainText("tối thiểu 8");
  await expect(page.getByTestId("dashboard")).toHaveCount(0);
});
```

Giải thích: nhóm `describe` có hook `beforeEach` đưa mọi test về trạng thái sạch. Test thứ hai dùng `getByRole("dialog")` vì hộp xác nhận của LAB-04 là modal trong trang (HTML), không phải `window.confirm` của trình duyệt. Test cuối minh hoạ hai cách viết, chỉ cách thứ hai là an toàn.

## Viết assertion tốt

Assertion yếu là assertion luôn xanh dù ứng dụng hỏng. Kiểm tra "phần tử tồn tại" thường quá yếu. Hãy hỏi: "nếu nghiệp vụ bị sai thì dòng này có đỏ không?".

Ví dụ ở LAB-03, quy tắc: đơn dưới 1.000.000 đồng thì ship 30.000, VAT 8%. Với sản phẩm 250.000 đồng:

| Khoản | Cách tính từ quy tắc | Giá trị kỳ vọng |
|-------|----------------------|-----------------|
| Tạm tính | 250.000 | 250.000 |
| VAT 8% | 250.000 x 0,08 | 20.000 |
| Ship | đơn dưới 1.000.000 | 30.000 |
| Tổng | 250.000 + 20.000 + 30.000 | 300.000 |

Bạn **tự tính** các con số này từ quy tắc rồi mới viết vào test. Đừng mở trang, thấy "300.000" rồi chép vào: nếu app tính sai, bạn sẽ chép luôn con số sai và test vô dụng. Mỗi test nên trả lời được "nếu đỏ thì hỏng ở đâu", nên tên test và thông điệp phải cụ thể.

## Thử ngay trong lab
- `/lab/todo` (LAB-04): thêm việc, tick hoàn thành, quan sát các giá trị `todo-count`, `todo-title`, `todo-error`; viết assertion cho từng cái. Thử `/lab/todo?bugs=BUG-02` để thấy bộ đếm "Còn N việc" sai, và xem assertion `toHaveText("Còn 1 việc")` của bạn bắt được lỗi.
- `/lab/cart` (LAB-03): viết assertion cho ship, VAT, tổng với giá trị tự tính theo bảng ở trên.

## Lỗi thường gặp
- Triệu chứng: test lúc xanh lúc đỏ. Nguyên nhân: dùng `const text = await locator.innerText(); expect(text).toBe(...)` nên mất khả năng thử lại. Sửa: `await expect(locator).toHaveText(...)`.
- Triệu chứng: assertion không bao giờ đỏ dù giao diện sai, hoặc cảnh báo Promise không được xử lý. Nguyên nhân: thiếu `await` trước `expect(locator)...`, test kết thúc trước khi assertion chạy. Sửa: luôn viết `await expect(...)`. Bật quy tắc ESLint `@typescript-eslint/no-floating-promises` để được nhắc.
- Triệu chứng: `Error: strict mode violation: getByTestId('todo-title') resolved to 2 elements`. Nguyên nhân: locator khớp nhiều phần tử mà matcher chỉ chấp nhận một. Sửa: thu hẹp locator (`getByRole("checkbox", { name: "Hoàn thành: A" })`) hoặc dùng mảng với `toHaveText([...])`, hoặc `toHaveCount`.
- Triệu chứng: `Expected string: "Còn 1 việc"` nhưng `Received string: "Còn 1 việc (đang lọc)"` hoặc có thêm chữ. Nguyên nhân: `toHaveText` với chuỗi yêu cầu khớp toàn bộ nội dung. Sửa: dùng `toContainText` hoặc regex như `/Còn 1 việc/` khi chỉ cần một phần.
- Triệu chứng: test xanh nhưng bug vẫn lọt. Nguyên nhân: assertion quá yếu (chỉ `toBeVisible` của một khung kết quả). Sửa: kiểm tra giá trị cụ thể tính từ quy tắc nghiệp vụ.
- Triệu chứng: toàn bộ test sau khi một bước sai đều đỏ theo. Nguyên nhân: lạm dụng `expect.soft` cho bước phụ thuộc nhau. Sửa: chỉ soft cho kiểm tra độc lập.

## Tóm tắt
- Truyền locator vào `expect` để được assertion tự thử lại; tránh lấy chữ ra rồi so.
- Chọn matcher đúng mục đích: `toHaveText` (đủ), `toContainText` (một phần), `toHaveCount`, `toHaveValue`, `toBeChecked`, `toHaveURL`.
- `.not` và `toBeHidden` cũng tự thử lại; mảng trong `toHaveText([...])` kiểm tra danh sách theo thứ tự.
- `expect.soft` gom nhiều lỗi độc lập; `expect.poll` và `toPass` dành cho điều kiện ngoài locator.
- Giá trị kỳ vọng phải được tính từ quy tắc nghiệp vụ, và luôn có `await`.

## Lưu ý với shadcn/Base UI
Checkbox, radio, switch của site có `<input>` ẩn nên khi viết test hãy dùng `getByRole("checkbox", { name: ... })` thay vì `getByLabel`. Với `Button` của shadcn bản này không có `asChild`; điều này không ảnh hưởng assertion nhưng ảnh hưởng cách bạn tìm phần tử.

## Bài tập
1. (Dễ) Viết test LAB-04: thêm một việc "Học Playwright", khẳng định `todo-title` có đúng chữ và `todo-count` là "Còn 1 việc". Xong khi test xanh khi chạy với `--repeat-each=5`.
2. (Dễ) Chuyển một assertion dạng `innerText()` rồi `toBe` trong test cũ của bạn sang web-first. Xong khi không còn dòng `expect(await ...)` nào trên locator.
3. (Vừa) Viết test LAB-04 cho biên 80/81 ký tự: tên 80 ký tự thêm được, 81 ký tự bị `todo-error` chứa "tối đa 80". Xong khi có assertion cả hai phía biên.
4. (Vừa) Viết test LAB-03 kiểm tra phí ship, VAT và tổng bằng `expect.soft`, với giá trị tự tính từ quy tắc. Xong khi bật bug liên quan tới tiền thì báo cáo liệt kê đúng các dòng sai.
5. (Khó) Dùng `expect.poll` kiểm tra dữ liệu LAB-04 đã nằm trong localStorage sau khi thêm việc. Xong khi test xanh và bạn giải thích được vì sao ở đây `poll` hợp lý hơn `innerText`.
