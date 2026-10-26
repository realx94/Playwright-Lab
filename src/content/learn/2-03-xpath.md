---
title: XPath
level: 2
order: 3
minutes: 40
summary: Hiểu cú pháp XPath, thử bằng DevTools ($x và Ctrl+F), biết khi nào dùng và khi nào nên tránh so với CSS.
keywords: [xpath vs css, xpath contains, xpath axes]
---

## Mục tiêu bài học
- Đọc và viết được XPath tương đối: theo thuộc tính, theo chữ hiển thị, theo trục (cha, anh em).
- Kiểm tra XPath trong DevTools bằng Ctrl+F và bằng lệnh `$x(...)` trong Console.
- Dùng XPath trong Playwright qua `page.locator("xpath=...")`.
- So sánh XPath với CSS và với `getByRole` để chọn đúng công cụ.

## Bạn cần chuẩn bị
- Đã đọc bài 2.1 (DOM) và bài 2.2 (CSS selector). Bài này dùng lại cách thử selector bằng DevTools.
- Site lab chạy được. Ví dụ chính dùng **LAB-01 Login** (`/lab/login`), **LAB-02 Form** (`/lab/forms`) và **LAB-03 Giỏ hàng** (`/lab/cart`).

## Kiến thức cần nắm
- Đường dẫn tuyệt đối `/html/body/...` và tương đối `//tag`.
- Điều kiện: `//input[@type='email']`, `//button[text()='Đăng nhập']`.
- Hàm: `contains(@class,'btn')`, `starts-with(...)`, `normalize-space(...)`.
- Trục: `parent::`, `following-sibling::`, `preceding-sibling::`, `ancestor::`.
- XPath đi **ngược lên cha** được, còn CSS truyền thống thì khó.

## Giải thích dễ hiểu

### Chỉ đường bằng mô tả
XPath giống **chỉ đường bằng mô tả**: "từ toà nhà này, đi lên văn phòng chứa chữ 'Kế toán' rồi sang phòng bên cạnh". Nó mạnh hơn CSS ở hai điểm: dựa được vào **nội dung chữ**, và đi được theo **mọi hướng** (lên cha, sang anh em trước và sau). Đổi lại nó dài dòng và dễ vỡ khi trang đổi cấu trúc.

Tên đầy đủ là XML Path Language, được thiết kế để định vị nút trong tài liệu XML, và HTML cũng là cây nên dùng được.

### Cú pháp từng mảnh
Một XPath là chuỗi các **bước** nối bằng dấu `/` hoặc `//`. Mỗi bước có dạng `trục::loại-nút[điều kiện]` (trục thường được viết tắt).

| Mảnh | Nghĩa | Ví dụ |
|------|-------|-------|
| `/` | Đi vào con trực tiếp | `/html/body` |
| `//` | Đi vào hậu duệ ở bất kỳ độ sâu nào | `//input` (mọi input trong trang) |
| `*` | Mọi thẻ | `//*[@role='checkbox']` |
| `[@attr='v']` | Thuộc tính bằng giá trị | `//input[@type='email']` |
| `[@attr]` | Có thuộc tính | `//input[@aria-invalid]` |
| `[text()='x']` | Chữ trực tiếp bằng `x` | `//button[text()='Đăng nhập']` |
| `[.='x']` | Toàn bộ chữ của phần tử bằng `x` | `//label[.='Email']` |
| `contains(a, b)` | `a` chứa chuỗi `b` | `//label[contains(., 'Giới thiệu')]` |
| `starts-with(a, b)` | `a` bắt đầu bằng `b` | `//input[starts-with(@id,'hobby-')]` |
| `normalize-space(x)` | Bỏ khoảng trắng thừa đầu cuối và gộp khoảng trắng giữa | `//button[normalize-space()='Gửi']` |
| `[n]` | Phần tử thứ n (đếm từ 1) | `(//input)[2]` |
| `and`, `or`, `not()` | Ghép điều kiện | `//input[@type='file' or @type='date']` |

Hai lưu ý: XPath đếm từ **1** (không phải 0 như JavaScript). Và `//label[1]` nghĩa là "mỗi `label` là phần tử đầu của cha nó", khác với `(//label)[1]` là "`label` đầu tiên của cả trang". Hãy bọc ngoặc khi muốn lấy phần tử thứ n của toàn bộ kết quả.

### Trục (axes)
Trục là hướng đi từ phần tử hiện tại:

| Trục | Viết tắt | Nghĩa |
|------|----------|-------|
| `child::` | (mặc định) | Con trực tiếp |
| `descendant::` | `//` | Hậu duệ |
| `parent::` | `..` | Cha |
| `ancestor::` | | Tổ tiên (cha, ông, cụ...) |
| `following-sibling::` | | Anh em đứng sau |
| `preceding-sibling::` | | Anh em đứng trước |

Ví dụ: từ nhãn "Email", đi sang anh em đứng sau là ô nhập: `//label[text()='Email']/following-sibling::input`.

### So với CSS

| Tiêu chí | CSS | XPath |
|----------|-----|-------|
| Chọn theo thuộc tính, id, class | Gọn, dễ đọc | Dài hơn |
| Chọn theo chữ hiển thị | Không có (chuẩn CSS) | Có: `text()`, `contains` |
| Đi lên cha, sang anh em trước | Hạn chế (`:has` mới hỗ trợ một phần) | Có đầy đủ |
| Tốc độ, độ dễ đọc | Thường nhanh và dễ đọc | Chậm hơn chút, khó đọc khi dài |
| Khuyến nghị trong Playwright | Dùng khi cần | Dùng sau cùng |

Vì sao khuyến nghị hạn chế XPath: nó dễ trở thành "bản đồ cấu trúc trang", chỉ cần thêm một thẻ bọc là đường đi sai. Playwright có `getByRole`, `getByLabel`, `filter` (bài 2.5 và 2.6) làm tốt hơn phần lớn việc mà XPath định làm.

## Thực hành từng bước

### Bước 1. Thử XPath bằng Ctrl+F trong DevTools

Mục đích: kiểm tra XPath mà không cần viết code.

1. Mở `http://localhost:3000/lab/login`, nhấn F12, chọn tab **Elements**.
2. Bấm vào một dòng trong cây để focus, rồi nhấn Ctrl+F (macOS: Cmd+F).
3. Gõ:

```text
//input[@id='email']
```

Giải thích: `//input` là mọi thẻ `input` ở bất kỳ đâu; `[@id='email']` giữ lại cái có `id` bằng `email`. Dấu `@` đứng trước tên thuộc tính.

Kết quả mong đợi: bên phải thanh tìm hiện `1 of 1` và dòng `<input id="email" ...>` được tô sáng. Thanh tìm của DevTools nhận ra chuỗi bắt đầu bằng `/` hoặc `//` là XPath.

### Bước 2. Dùng Console với `$x`

Mục đích: lấy danh sách phần tử khớp một XPath, kèm số lượng.

Mở tab **Console** và gõ:

```js
$x("//input[@type='password']")
```

Giải thích: `$x(...)` là hàm có sẵn chỉ trong Console của DevTools (không có trong trang thật hay trong test). Nó nhận chuỗi XPath và trả về một mảng phần tử.

Kết quả mong đợi: `[input#password]`. Bạn có thể bấm mũi tên để mở và rê chuột lên phần tử để nó tô sáng trên trang. Để lấy số lượng:

```js
$x("//input").length
```

Kết quả mong đợi: `3`. Nếu XPath sai cú pháp, Console báo `SyntaxError: Failed to execute 'evaluate' on 'Document'`. Nếu cú pháp đúng nhưng không khớp gì thì trả về `[]`.

### Bước 3. Chọn theo chữ hiển thị

Mục đích: dùng ưu thế của XPath, chọn theo chữ.

Trong Console gõ:

```js
$x("//button[normalize-space()='Đăng nhập']")
```

Giải thích: `normalize-space()` không có đối số nghĩa là áp dụng cho chữ của chính phần tử, bỏ khoảng trắng thừa đầu cuối và gộp khoảng trắng liên tiếp. Vì vậy dù HTML có xuống dòng và thụt lề, `'Đăng nhập'` vẫn khớp. Nếu bạn viết `text()='Đăng nhập'`, một khoảng trắng thừa cũng làm khớp thất bại.

Kết quả mong đợi: `[button]` chứa đúng một nút. Chú ý tiêu đề "Đăng nhập" là `h2` nên không bị lẫn vào vì ta đã chỉ định thẻ `button`.

### Bước 4. Đi theo trục từ nhãn tới ô nhập

Mục đích: chọn ô nhập thông qua nhãn của nó.

```js
$x("//label[normalize-space()='Mật khẩu']/following-sibling::input")
```

Giải thích từng đoạn: `//label[normalize-space()='Mật khẩu']` tìm thẻ `label` có chữ "Mật khẩu"; `/following-sibling::input` đi sang các anh em đứng sau cùng cha và chỉ giữ thẻ `input`.

Kết quả mong đợi: `[input#password]`. Đây là cách XPath thể hiện "ô nhập thuộc nhãn Mật khẩu", nhưng nhớ rằng `getByLabel("Mật khẩu")` của Playwright làm đúng việc này ngắn gọn hơn.

### Bước 5. Đi ngược lên cha và tổ tiên

Mục đích: làm điều mà CSS truyền thống làm khó, tìm "khối chứa" từ một phần tử con.

Mở `http://localhost:3000/lab/cart` (LAB-03 Giỏ hàng) và nhập vào Console:

```js
$x("//h3[normalize-space()='Chuột không dây']/ancestor::article")
```

Giải thích: tìm tiêu đề `h3` có chữ "Chuột không dây" rồi `ancestor::article` đi lên các tổ tiên và chỉ giữ thẻ `article`, tức là cả thẻ sản phẩm.

Kết quả mong đợi: `[article]`, bên trong có `data-testid="product-p2"`. Khi rê chuột lên kết quả, cả thẻ sản phẩm được tô sáng. Dùng thêm `/..` (viết tắt của `parent::*`) để đi lên đúng một cấp:

```js
$x("//h3[normalize-space()='Chuột không dây']/..")
```

Kết quả mong đợi: một `div` bọc tiêu đề và giá (cha trực tiếp của `h3`).

### Bước 6. Điều kiện ghép và hàm contains

Mục đích: chọn khi chữ chỉ cần chứa một phần, hoặc cần ghép điều kiện.

Mở `http://localhost:3000/lab/forms` và thử:

```js
$x("//label[contains(., 'Giới thiệu')]")
```

Giải thích: dấu chấm `.` là "toàn bộ chữ của phần tử, kể cả chữ trong thẻ con". Ta dùng `.` thay vì `text()` vì nhãn này vẽ ra "Giới thiệu (0/200)" từ nhiều mảnh chữ rời nhau; `text()` chỉ chạm một mảnh.

Kết quả mong đợi: `[label]` một phần tử. Tiếp theo:

```js
$x("//*[@role='checkbox' and starts-with(@aria-labelledby, 'hobby-')]")
```

Giải thích: `*` là mọi thẻ; `and` ghép hai điều kiện (có `role="checkbox"` và `aria-labelledby` bắt đầu bằng `hobby-`).

Kết quả mong đợi: 4 phần tử, đó là bốn checkbox sở thích. Bạn vừa tự lọc phần tử "checkbox tuỳ biến" mà không phụ thuộc vào class.

### Bước 7. Dùng XPath trong Playwright

Mục đích: đưa XPath đã thử vào test.

Trong Playwright, `page.locator` hiểu một chuỗi là XPath nếu nó bắt đầu bằng `//`, `..` hoặc có tiền tố `xpath=`. Hãy luôn thêm `xpath=` cho rõ ràng.

```ts
import { test, expect } from "@playwright/test";

test("XPath trên lab", async ({ page }) => {
  await page.goto("/lab/login");

  // Ô nhập đứng sau nhãn "Email" (anh em kế)
  await page.locator("xpath=//label[normalize-space()='Email']/following-sibling::input").fill("user@lab.dev");

  // Nút theo chữ hiển thị
  await page.locator("xpath=//button[normalize-space()='Đăng nhập']").click();

  // Phần tử mới xuất hiện sau khi bấm (mật khẩu trống)
  await expect(page.locator("xpath=//*[@data-testid='password-error']")).toBeVisible();
});
```

Chạy:

```bash
npx playwright test xpath
```

Kết quả mong đợi: `1 passed`. Nếu bạn thấy `Error: locator.fill: Error: strict mode violation: locator(...) resolved to 2 elements`, XPath khớp nhiều hơn một phần tử; thêm điều kiện hoặc dùng `(...)[1]` nếu thực sự cần phần tử đầu tiên.

### Bước 8. Tránh "Copy XPath" và đường dẫn tuyệt đối

Mục đích: nhận ra cái bẫy phổ biến.

1. Trong tab Elements, bấm chuột phải lên dòng `<input id="email" ...>`.
2. Chọn **Copy** rồi chọn **Copy XPath** (cho kết quả có thể là `//*[@id="email"]`) và thử thêm **Copy full XPath**.

Kết quả mong đợi: **Copy XPath** thường cho ra dạng ngắn nếu phần tử có `id` ổn định. **Copy full XPath** cho ra một chuỗi như `/html/body/div[2]/main/div/form/div[1]/input`. Chuỗi thứ hai gắn chặt với vị trí từng tầng: thêm một `div` bọc vào bất cứ đâu là vỡ. Đừng bao giờ đưa XPath tuyệt đối vào test; dùng nó chỉ để bạn thấy cấu trúc rồi tự viết lại theo nhãn, thuộc tính hoặc `getByRole`.

## Demo code

Một cặp ba cách chọn cùng phần tử, từ tệ đến tốt, cho thấy vì sao XPath nên là phương án sau cùng:

```ts
import { test, expect } from "@playwright/test";

test("ba cách chọn thẻ sản phẩm Chuột không dây", async ({ page }) => {
  await page.goto("/lab/cart");
  await page.getByTestId("reset-data").click();

  // 1. XPath theo chữ rồi đi lên tổ tiên: dùng được, nhưng dài
  const byXpath = page.locator(
    "xpath=//h3[normalize-space()='Chuột không dây']/ancestor::article",
  );

  // 2. filter theo chữ (bài 2.6): ngắn hơn và gắn với nội dung
  const byFilter = page.getByRole("article").filter({ hasText: "Chuột không dây" });

  // 3. data-testid: ổn định nhất nếu nhóm dev cam kết giữ
  const byTestId = page.getByTestId("product-p2");

  // Cả ba cùng trỏ vào một thẻ
  await expect(byXpath).toHaveCount(1);
  await expect(byFilter).toHaveCount(1);
  await expect(byTestId).toHaveCount(1);

  // Thao tác bên trong bằng chaining (bài 2.6)
  await byTestId.getByRole("button", { name: "Thêm vào giỏ" }).click();
  await expect(page.getByTestId("cart-count")).toHaveText("1");
});
```

Giải thích: ba biến cùng chọn một thẻ. Nếu một ngày nhóm dev đổi `h3` thành `h2`, cách 1 vỡ; cách 2 vẫn chạy vì chỉ dựa vào role `article` và chữ; cách 3 vẫn chạy nếu `data-testid` không đổi.

## Thử ngay trong lab
- [LAB-01 Login](/labs/login) (`/lab/login`): làm Bước 1 đến Bước 4.
- [LAB-03 Giỏ hàng](/labs/cart) (`/lab/cart`): làm Bước 5, tìm thẻ sản phẩm từ tiêu đề rồi quan sát phần được tô sáng.
- [LAB-02 Form đa dạng](/labs/forms) (`/lab/forms`): làm Bước 6.

## Lỗi thường gặp
- **Triệu chứng**: test hỏng sau khi dev thêm một `div` bọc. **Nguyên nhân**: dùng đường dẫn tuyệt đối do "Copy full XPath" sinh ra. **Cách sửa**: viết XPath tương đối theo thuộc tính hoặc chữ, hoặc chuyển sang `getByRole`.
- **Triệu chứng**: `//button[text()='Đăng nhập']` không khớp dù chữ nhìn đúng. **Nguyên nhân**: chữ có khoảng trắng thừa hoặc chữ nằm trong thẻ con. **Cách sửa**: dùng `normalize-space()` hoặc `contains(., '...')`.
- **Triệu chứng**: `(//input)[0]` không khớp phần tử nào. **Nguyên nhân**: XPath đếm từ 1. **Cách sửa**: dùng `(//input)[1]`.
- **Triệu chứng**: `//label[1]` trả về nhiều phần tử. **Nguyên nhân**: `[1]` áp lên từng cha. **Cách sửa**: bọc ngoặc `(//label)[1]`.
- **Triệu chứng**: `$x is not defined` khi chạy trong test. **Nguyên nhân**: `$x` chỉ có trong Console của DevTools. **Cách sửa**: trong test dùng `page.locator("xpath=...")`.

## Tóm tắt
- XPath chọn bằng đường đi trong cây; mạnh ở việc chọn theo chữ và đi theo mọi hướng (cha, anh em).
- Thử XPath bằng Ctrl+F trong tab Elements hoặc `$x("...")` trong Console; đọc số kết quả để biết có khớp đúng một phần tử không.
- Dùng `normalize-space()` và `contains(., ...)` thay cho `text()` khi chữ có thể chứa khoảng trắng hoặc nằm trong thẻ con.
- Trong Playwright dùng `page.locator("xpath=...")`.
- Tránh đường dẫn tuyệt đối; ưu tiên `getByRole`, `getByLabel`, `filter` trước khi nghĩ tới XPath.

## Bài tập
1. **Dễ**: Viết XPath chọn ô Email ở LAB-01 theo hai cách: theo `@id` và theo `following-sibling` từ nhãn. Xong khi cả hai cho `1 of 1` trong Ctrl+F.
2. **Dễ**: Viết XPath chọn nút **Đăng nhập** bằng `normalize-space()`. Xong khi `$x(...)` trả về đúng một nút.
3. **Vừa**: Ở LAB-03, viết XPath chọn thẻ sản phẩm "Chuột không dây" rồi viết cùng phần tử bằng CSS (`[data-testid="product-p2"]`) và `getByRole`. So sánh độ dài và độ ổn định, xong khi bạn ghi được bảng so sánh ba cách.
4. **Vừa**: Ở LAB-02, viết một XPath duy nhất chọn bốn checkbox sở thích (dùng `@role` và `starts-with`). Xong khi `$x(...).length` bằng 4.
5. **Khó**: Viết test Playwright dùng XPath để thêm sản phẩm "Chuột không dây" vào giỏ ở LAB-03 và kiểm tra số lượng trong giỏ, sau đó viết lại cùng test không dùng XPath và nhận xét cái nào dễ bảo trì hơn. Xong khi cả hai test đều xanh và bạn viết được 2 câu nhận xét.
