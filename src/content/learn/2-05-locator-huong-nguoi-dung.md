---
title: Locator hướng người dùng
level: 2
order: 5
minutes: 60
summary: getByRole, getByLabel, getByText, getByPlaceholder, getByAltText, getByTitle, getByTestId và thứ tự ưu tiên; dùng codegen và Pick locator để tìm locator tốt.
keywords: [getByRole aria role, playwright locator best practices, accessible name]
---

## Mục tiêu bài học
- Giải thích **locator** là gì và vì sao Playwright khuyến nghị chọn phần tử theo cách người dùng nhận biết.
- Dùng đúng sáu họ locator: `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`, `getByAltText`/`getByTitle`, `getByTestId`.
- Dùng `npx playwright codegen` và nút **Pick locator** để lấy locator gợi ý, rồi tự đánh giá và chỉnh lại.
- Hiểu **strict mode** và sửa lỗi "resolved to N elements" bằng `name`, `exact`, `level` hoặc phạm vi hẹp hơn.
- Xử lý đúng radio, checkbox, switch của shadcn/Base UI trên lab.

## Bạn cần chuẩn bị
- Đã học bài 2.1 (DOM, role, accessible name) và bài 2.4 (cấu trúc test, chạy `npx playwright test`).
- Site lab chạy ở `http://localhost:3000` và `baseURL` đã cấu hình trong `playwright.config.ts`.
- Ví dụ xuyên suốt dùng **LAB-01 Login** (`/lab/login`), **LAB-02 Form đa dạng** (`/lab/forms`) và **LAB-03 Giỏ hàng** (`/lab/cart`).

## Kiến thức cần nắm
- `getByRole("button", { name: "Đăng nhập" })`: theo vai trò và tên truy cập được.
- `getByLabel("Email")`: theo nhãn của ô nhập.
- `getByPlaceholder`, `getByText`, `getByAltText`, `getByTitle`.
- `getByTestId("dashboard")`: theo `data-testid` khi không có cách tốt hơn.
- Thứ tự ưu tiên: Role, Label, Placeholder, Text, Alt/Title, TestId, rồi mới tới CSS hoặc XPath.
- Locator là **công thức tìm kiếm** (lười đánh giá), không phải phần tử đã tìm được.

## Giải thích dễ hiểu

### Người dùng không biết id hay class
Người dùng không biết `id` hay `class`; họ nói "bấm nút **Đăng nhập**", "điền ô **Email**". Locator hướng người dùng làm đúng như vậy. Có hai lợi ích lớn:

1. **Bền hơn**. Khi nhóm dev đổi cách viết code (đổi `div` thành `section`, đổi class Tailwind) mà giao diện nhìn như cũ, test vẫn chạy.
2. **Kiểm tra luôn khả năng truy cập** (accessibility, viết tắt a11y). Nếu nút không có tên truy cập được, `getByRole("button", { name })` sẽ không tìm thấy nó; test đỏ chính là tín hiệu giao diện chưa tốt cho người dùng trình đọc màn hình.

### Locator là công thức, không phải phần tử
Dòng `const email = page.getByLabel("Email");` **chưa tìm gì cả**. Nó chỉ ghi lại công thức "ô có nhãn Email". Mỗi lần bạn gọi `.fill(...)`, `.click()` hay `expect(email)...`, Playwright mới áp dụng công thức lên DOM tại thời điểm đó, chờ phần tử xuất hiện rồi mới thao tác. Nhờ vậy locator vẫn đúng ngay cả khi trang vẽ lại giữa chừng. Điều này cũng giải thích vì sao bạn có thể khai báo locator một lần rồi dùng nhiều lần.

### Strict mode
Khi bạn **thao tác** (click, fill...) hoặc **kiểm tra** bằng locator mà công thức khớp nhiều hơn một phần tử, Playwright dừng và báo lỗi. Chế độ này gọi là **strict mode** (chế độ nghiêm ngặt), có để chặn bạn thao tác nhầm vào phần tử đầu tiên một cách âm thầm. Thông báo có dạng:

```text
Error: strict mode violation: getByText('Đăng nhập') resolved to 4 elements:
    1) <li>BR-04 “Ghi nhớ đăng nhập” giữ phiên 7 ngày.</li> aka getByText('BR-04 “Ghi nhớ đăng nhập” gi')
    2) <h2 class="text-xl font-semibold">Đăng nhập</h2> aka getByRole('heading', { name: 'Đăng nhập' })
    3) <label for="remember" ...>Ghi nhớ đăng nhập</label> aka getByText('Ghi nhớ đăng nhập', { exact: true })
    4) <button ...>Đăng nhập</button> aka getByRole('button', { name: 'Đăng nhập' })
```

Thông báo rất hữu ích: nó liệt kê từng phần tử khớp và gợi ý cách viết locator hướng người dùng cho từng cái (`aka ...`). Bạn chỉ việc chọn gợi ý đúng.

### Thứ tự ưu tiên
Playwright khuyến nghị thử các cách theo thứ tự sau, dừng ở cách đầu tiên đủ dùng:

| Thứ | Locator | Dùng khi | Ví dụ |
|-----|---------|----------|-------|
| 1 | `getByRole` | Nút, liên kết, ô nhập, tiêu đề, checkbox... | `getByRole("button", { name: "Gửi" })` |
| 2 | `getByLabel` | Ô nhập có nhãn | `getByLabel("Họ tên")` |
| 3 | `getByPlaceholder` | Ô nhập chỉ có chữ gợi ý | `getByPlaceholder("Mã giảm giá")` |
| 4 | `getByText` | Chữ thường không có role (đoạn văn, thông báo) | `getByText("Đã tải xong")` |
| 5 | `getByAltText`, `getByTitle` | Ảnh có `alt`; phần tử có `title` | `getByTitle("Khung thanh toán")` |
| 6 | `getByTestId` | Không có cách nào hướng người dùng, hoặc cần mốc cố định | `getByTestId("dashboard")` |
| 7 | `locator("css hoặc xpath")` | Phương án cuối | `locator("#email")` |

```diagram
locator-priority
```

## Thực hành từng bước

### Bước 1. Mở codegen để Playwright gợi ý locator

Mục đích: dùng công cụ ghi (**codegen**) để thấy Playwright sẽ chọn locator nào cho từng thao tác của bạn.

```bash
npx playwright codegen http://localhost:3000/lab/login
```

Giải thích: `codegen` mở một trình duyệt và một cửa sổ **Playwright Inspector** (thanh công cụ + khung code). Mọi thao tác trên trang được dịch thành code TypeScript, và địa chỉ là trang bắt đầu.

Kết quả mong đợi: hai cửa sổ hiện ra. Cửa sổ trình duyệt có trang Login. Cửa sổ Inspector có thanh công cụ ở trên cùng gồm nút **Record** (đang bật, tức đang ghi), nút **Pick locator**, bốn nút Assert (**Assert visibility**, **Assert text**, **Assert value**, **Assert snapshot**), nút **Copy**, các nút Resume (F8) và Step over (F10) dùng khi chạy lại, danh sách **Target** (chọn ngôn ngữ sinh code, mặc định Test Runner/TypeScript, có thể đổi sang Python, Java, C#...) và nút **Clear** để xoá code đã ghi. Khung code ở giữa; bên dưới (hoặc bên cạnh) là các tab **Locator**, **Log**, **Aria**. Tên nút đối chiếu với mã nguồn Playwright 1.64 và tài liệu codegen; giao diện có thể thay đổi nhẹ giữa các phiên bản.

Các cờ hữu ích của `codegen` (xem bằng `npx playwright codegen --help`): `-o file.spec.ts` lưu code ra file, `--target`, `--viewport-size="800,600"`, `--device="iPhone 13"`, `--color-scheme=dark`, `--save-storage=auth.json` và `--load-storage=auth.json` (lưu và nạp lại phiên đăng nhập), `--test-id-attribute=data-qa`.

Nếu gặp lỗi: `Executable doesn't exist` nghĩa là chưa tải trình duyệt; chạy `npx playwright install` (bài 0.2).

### Bước 2. Thực hiện vài thao tác và đọc locator được sinh

Mục đích: quan sát codegen ưu tiên `getByRole` và `getByLabel`.

Trong cửa sổ trình duyệt, lần lượt:

1. Bấm vào ô **Email** rồi gõ `user@lab.dev`.
2. Bấm ô **Mật khẩu** rồi gõ `Passw0rd!`.
3. Bấm checkbox **Ghi nhớ đăng nhập**.
4. Bấm nút **Đăng nhập**.

Kết quả mong đợi: khung code của Inspector hiện gần như sau (chi tiết có thể khác đôi chút; mẫu này do tác giả dựng theo cách codegen thường sinh, chưa ghi lại từ một phiên chạy codegen thật trên lab):

```ts
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/lab/login');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('user@lab.dev');
  await page.getByRole('textbox', { name: 'Mật khẩu' }).fill('Passw0rd!');
  await page.getByRole('checkbox', { name: 'Ghi nhớ đăng nhập' }).click();
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
});
```

Cách đọc: mọi locator đều là `getByRole` kèm `name`. Codegen có thể chọn `getByRole` hoặc `getByLabel` tuỳ phiên bản. Đừng chép nguyên: hãy rút gọn (bỏ `.click()` thừa trước `fill`, dùng `check()` cho checkbox) và đặt vào test theo cấu trúc bài 2.4.

### Bước 3. Dùng Pick locator để thử một phần tử cụ thể

Mục đích: xem Playwright gợi ý gì cho phần tử bạn chỉ định mà không cần thao tác lên trang.

1. Trong Inspector, bấm nút **Pick locator** (biểu tượng kính ngắm/con trỏ; bấm lại để tắt). Có thể bấm cả khi đang Record.
2. Di chuột lên trang: phần tử dưới con trỏ được tô viền; một chú thích hiện locator đề xuất.
3. Bấm vào ô **Email**.

Kết quả mong đợi: tab **Locator** của Inspector hiện `getByRole('textbox', { name: 'Email' })` (ô này có gợi ý "Type locator to inspect"). Bạn có thể sửa chuỗi trong ô rồi quan sát: những phần tử khớp được tô sáng trên trang, kèm số lượng khớp (ví dụ `1 element`). Đây là nơi tốt nhất để thử một locator trước khi viết vào code. Hãy thử bấm Pick locator vào nút Reset: gợi ý sẽ là `getByTestId('reset-data')` hoặc `getByRole('button', { name: 'Reset dữ liệu lab' })`.

Đóng cả hai cửa sổ khi xong (không cần lưu).

### Bước 4. getByRole: vai trò và tên truy cập được

Mục đích: dùng locator quan trọng nhất đúng cách.

```ts
page.getByRole("button", { name: "Đăng nhập" })
```

Giải thích: tham số đầu là **role** (vai trò). Tham số `name` là tên truy cập được: chữ trên nút, nội dung `label` của ô nhập, nội dung `aria-label`. Mặc định `name` khớp **chứa chuỗi, không phân biệt hoa thường**.

Các tuỳ chọn thường dùng:

| Tuỳ chọn | Tác dụng | Ví dụ |
|----------|----------|-------|
| `name` | Lọc theo tên truy cập được (chuỗi hoặc regex) | `{ name: "Gửi" }`, `{ name: /^Tăng/ }` |
| `exact: true` | Khớp đúng nguyên chuỗi, phân biệt hoa thường | `{ name: "Reset", exact: true }` |
| `checked` | Lọc theo trạng thái chọn của checkbox, radio, switch | `{ name: "Nhận bản tin", checked: false }` |
| `disabled` | Lọc nút bị vô hiệu | `{ name: "Thêm vào giỏ", disabled: true }` |
| `level` | Cấp của tiêu đề `h1` đến `h6` | `getByRole("heading", { level: 2 })` |
| `expanded`, `pressed`, `selected` | Trạng thái mở, nhấn, chọn | `{ expanded: true }` |
| `includeHidden` | Tính cả phần tử bị ẩn | hiếm dùng |

Một số role hay gặp trên lab:

| Role | Phần tử | Ví dụ trên lab |
|------|---------|----------------|
| `button` | Nút | Nút Đăng nhập |
| `textbox` | Ô nhập văn bản, email, textarea | Ô Email, Họ tên |
| `spinbutton` | Ô nhập số | Ô Tuổi ở LAB-02 |
| `checkbox`, `radio`, `switch` | Chọn nhiều, chọn một, công tắc | Sở thích, Giới tính, Nhận bản tin |
| `combobox` | Ô chọn (select native và select tuỳ biến) | Quốc gia, Thành phố |
| `heading` | Tiêu đề | `Kết quả` ở LAB-02 |
| `link` | Liên kết | `Mở trang trợ giúp` ở LAB-13 |
| `region`, `group`, `form` | Vùng, nhóm, biểu mẫu có tên | `form` tên Đăng nhập, `group` tên Giới tính |
| `article`, `complementary` | Thẻ bài, vùng phụ (`aside`) | Thẻ sản phẩm, khối Giỏ hàng |

Kết quả mong đợi khi thử từng locator trong Pick locator: mỗi locator ở bảng trên tô sáng đúng phần tử và hiện `1 element` (hoặc số lượng bạn đoán).

### Bước 5. getByLabel và getByPlaceholder

Mục đích: chọn ô nhập theo nhãn hoặc chữ gợi ý.

```ts
await page.getByLabel("Email").fill("user@lab.dev");
```

Giải thích: tìm phần tử form được gắn với `label` có chữ chứa "Email" (qua `for`/`id`, `aria-labelledby` hoặc `aria-label`). Hợp với `input`, `textarea`, `select`.

```ts
await page.goto("/lab/cart");
await page.getByPlaceholder("Mã giảm giá").fill("SALE10");
```

Giải thích: `getByPlaceholder` tìm theo thuộc tính `placeholder` (chữ mờ trong ô khi còn trống). Chỉ dùng khi ô **không có nhãn**: placeholder biến mất khi người dùng gõ nên không phải là nhãn tốt về truy cập. Trên LAB-03 ô mã giảm giá có cả `aria-label="Mã giảm giá"` lẫn placeholder cùng chữ, nên `getByLabel("Mã giảm giá")` cũng dùng được và tốt hơn.

Kết quả mong đợi: ô điền đúng chữ. Nếu `getByLabel` báo `Error: strict mode violation ... resolved to 2 elements` (thường với checkbox, radio, switch) hãy xem mục "Lưu ý với shadcn/Base UI" bên dưới.

### Bước 6. getByText: tìm chữ không có role

Mục đích: kiểm tra thông báo hoặc chữ trong đoạn văn.

```ts
await expect(page.getByText("Chưa có dữ liệu gửi.")).toBeVisible();   // LAB-02 trước khi gửi form
```

Giải thích: `getByText` khớp phần tử chứa chữ đó. Mặc định khớp **một phần, không phân biệt hoa thường**, nên chuỗi ngắn rất dễ khớp nhiều chỗ. Trên trang Login, `getByText("Đăng nhập")` khớp 4 phần tử (dòng mô tả BR-04, tiêu đề, nhãn "Ghi nhớ đăng nhập" và nút). Dùng `exact: true` để khớp nguyên chuỗi:

```ts
page.getByText("Đăng nhập", { exact: true })
```

Kết quả mong đợi: vẫn còn 2 phần tử khớp (tiêu đề `h2` và nút), nghĩa là `getByText` không phù hợp ở đây; cách đúng là `getByRole("button", { name: "Đăng nhập" })` hoặc `getByRole("heading", { name: "Đăng nhập" })`. Bài học: **với phần tử có role rõ ràng, dùng `getByRole`; `getByText` dành cho chữ thuần**.

### Bước 7. getByAltText, getByTitle

Mục đích: chọn ảnh hoặc phần tử có thuộc tính mô tả.

```ts
await page.goto("/lab/playground");
await expect(page.getByTitle("Khung thanh toán")).toBeVisible();
```

Giải thích: `getByTitle` tìm theo thuộc tính `title`; trên LAB-13 thẻ `iframe` có `title="Khung thanh toán"`. `getByAltText` tương tự nhưng theo thuộc tính `alt` của ảnh, ví dụ ảnh xem trước ở LAB-25 có `alt` dạng `Xem trước <tên tệp>`:

```ts
// Ví dụ cú pháp (cần có ảnh trên trang): chọn ảnh theo chữ mô tả
page.getByAltText("Xem trước a.png")
```

Kết quả mong đợi (với `getByTitle`): test chạy xanh vì iframe hiển thị trên trang. Nếu iframe chưa tải xong, `toBeVisible` tự chờ.

### Bước 8. getByTestId

Mục đích: dùng mốc kiểm thử khi chữ hay vai trò không đủ ổn định.

```ts
await page.getByTestId("reset-data").click();
await expect(page.getByTestId("dashboard")).toBeVisible();
```

Giải thích: `getByTestId("x")` tìm phần tử có `data-testid="x"`. Dùng cho phần tử cố định mà người dùng không "gọi tên", như vùng kết quả, nút Reset của lab, một thông báo lỗi. Nếu site của bạn dùng thuộc tính khác (ví dụ `data-qa`), cấu hình một lần trong `playwright.config.ts`:

```ts
export default defineConfig({
  use: { testIdAttribute: "data-qa" },
});
```

Lưu ý: đừng dùng `getByTestId` cho mọi thứ; làm vậy bạn bỏ lỡ lợi ích kiểm tra accessibility ở trên.

### Bước 9. Gỡ strict mode

Mục đích: tự gây lỗi và sửa, để nhận ra mẫu lỗi.

Tạo test tạm:

```ts
import { test, expect } from "@playwright/test";

test("gây và sửa strict mode", async ({ page }) => {
  await page.goto("/lab/login");
  // Dòng này sẽ lỗi: getByText("Đăng nhập") khớp nhiều phần tử
  await page.getByText("Đăng nhập").click();
});
```

Chạy `npx playwright test strict`. Kết quả mong đợi: test đỏ với `strict mode violation: getByText('Đăng nhập') resolved to 4 elements`, kèm danh sách và gợi ý `aka getByRole(...)`. Sửa từng bước:

1. Thêm `exact: true`: còn 2 phần tử (h2 và button), vẫn lỗi.
2. Đổi sang `getByRole("button", { name: "Đăng nhập" })`: khớp đúng 1 phần tử, test xanh.

Quy trình chung khi gặp lỗi này: đọc danh sách trong thông báo, chọn phần tử bạn muốn, dùng gợi ý `aka` của nó, hoặc thu hẹp phạm vi (bài 2.6). Đừng thêm `.first()` chỉ để im lỗi.

### Bước 10. Điền form LAB-02 chỉ bằng locator hướng người dùng

Mục đích: tổng hợp, áp dụng đúng loại locator cho từng loại phần tử.

```ts
import { test, expect } from "@playwright/test";

test("điền form LAB-02 bằng getByRole và getByLabel", async ({ page }) => {
  await page.goto("/lab/forms");

  await page.getByLabel("Họ tên").fill("Nguyễn Văn A");
  await page.getByLabel("Email").fill("a@lab.dev");
  await page.getByRole("spinbutton", { name: "Tuổi" }).fill("30");

  await page.getByRole("radio", { name: "Nam" }).click();
  await page.getByRole("checkbox", { name: "Đọc sách" }).check();

  await page.getByLabel("Quốc gia (select native)").selectOption("vn");

  await page.getByRole("combobox", { name: "Thành phố (select tuỳ biến)" }).click();
  await page.getByRole("option", { name: "Đà Nẵng" }).click();

  await page.getByRole("switch", { name: "Nhận bản tin" }).click();
  await page.getByRole("checkbox", { name: "Tôi đồng ý điều khoản" }).check();

  await page.getByRole("button", { name: "Gửi" }).click();

  await expect(page.getByTestId("result")).toContainText('"city": "Đà Nẵng"');
});
```

Giải thích từng nhóm: ô văn bản dùng `getByLabel`; ô số có role `spinbutton` nên dùng `getByRole` cho rõ; radio, checkbox, switch dùng `getByRole` (xem lưu ý bên dưới); select native dùng `getByLabel` rồi `selectOption`; select tuỳ biến là `combobox` bấm mở, rồi chọn `option` trong danh sách; nút `Gửi` dùng `getByRole("button")`; vùng kết quả dùng `getByTestId` vì nó là chỗ hiển thị dữ liệu thô.

Chạy `npx playwright test locator`. Kết quả mong đợi: `1 passed`.

## Lưu ý với shadcn/Base UI
Radio, checkbox và switch của site lab có thẻ `input` ẩn đi kèm, nên `getByLabel` có thể khớp 2 phần tử. Dùng `getByRole("radio" | "checkbox" | "switch", { name })` để chọn đúng phần tử người dùng nhìn thấy.

Cụ thể: ở LAB-01, `getByLabel("Ghi nhớ đăng nhập")` khớp hai phần tử (`span role="checkbox"` và `input` ẩn), còn `getByRole("checkbox", { name: "Ghi nhớ đăng nhập" })` chỉ khớp một. Quy tắc đi kèm:

- Trong test, dùng `getByRole(...)` và **không** dùng `getByLabel(...)` cho radio, checkbox, switch.
- `Select` tuỳ biến có `role="combobox"`; danh sách mở ra có `role="option"`. Không có thẻ `select` để dùng `selectOption`.
- Slider có `role="slider"`; muốn đặt giá trị hãy dùng bàn phím (bài 2.7).
- Select native (`LAB-02`, "Quốc gia (select native)") vẫn là thẻ `select` thật nên `getByLabel(...).selectOption(...)` dùng bình thường.

## Demo code

File hoàn chỉnh dùng đủ các họ locator trên ba lab:

```ts
import { test, expect } from "@playwright/test";

test.describe("Locator hướng người dùng", () => {
  test("LAB-01: role, label, testid", async ({ page }) => {
    await page.goto("/lab/login");
    await page.getByTestId("reset-data").click();

    // getByLabel cho ô nhập thông thường
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByLabel("Mật khẩu").fill("Passw0rd!");

    // getByRole cho checkbox tuỳ biến (không dùng getByLabel)
    const remember = page.getByRole("checkbox", { name: "Ghi nhớ đăng nhập" });
    await remember.check();
    await expect(remember).toBeChecked();

    // getByRole cho nút; heading có level
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.getByRole("heading", { name: /Chào mừng/, level: 2 })).toBeVisible();
    await expect(page.getByTestId("dashboard")).toBeVisible();
  });

  test("LAB-03: placeholder, role có regex, vùng đặt tên", async ({ page }) => {
    await page.goto("/lab/cart");
    await page.getByTestId("reset-data").click();

    // Có nhiều nút "Thêm vào giỏ": thu hẹp vào thẻ sản phẩm bằng testid (bài 2.6)
    const card = page.getByTestId("product-p2");
    await card.getByRole("button", { name: "Thêm vào giỏ" }).click();
    await card.getByRole("button", { name: /^Tăng/ }).click();

    // Placeholder cho ô mã giảm giá
    await page.getByPlaceholder("Mã giảm giá").fill("SALE10");
    await page.getByRole("button", { name: "Áp dụng" }).click();

    // Vùng có tên truy cập được: aside "Giỏ hàng" có role complementary
    await expect(page.getByRole("complementary", { name: "Giỏ hàng" })).toBeVisible();
  });

  test("LAB-13: title và link", async ({ page }) => {
    await page.goto("/lab/playground");
    await expect(page.getByTitle("Khung thanh toán")).toBeVisible();
    await expect(page.getByRole("link", { name: "Mở trang trợ giúp" })).toBeVisible();
  });
});
```

Giải thích: trong test thứ hai, `{ name: /^Tăng/ }` là regex "bắt đầu bằng Tăng", vì nút có `aria-label` dạng `Tăng Chuột không dây`. `toBeChecked()` kiểm tra trạng thái đã chọn của checkbox. `level: 2` lọc tiêu đề `h2`.

## Thử ngay trong lab
- [LAB-01 Login](/labs/login) (`/lab/login`): chạy codegen, thực hiện đăng nhập, ghi lại locator mà Playwright gợi ý cho từng phần tử.
- [LAB-02 Form đa dạng](/labs/forms) (`/lab/forms`): điền toàn bộ form như Bước 10. Thử đổi `getByRole("checkbox", ...)` thành `getByLabel(...)` ở checkbox "Tôi đồng ý điều khoản" và quan sát lỗi strict mode.
- [LAB-03 Giỏ hàng](/labs/cart) (`/lab/cart`): thử `page.getByRole("button", { name: "Thêm vào giỏ" })` rồi quan sát lỗi, vì có nhiều nút (bài 2.6 sẽ giải quyết bằng chaining).

## Lỗi thường gặp
- **Triệu chứng**: `strict mode violation: getByText('Đăng nhập') resolved to 4 elements`. **Nguyên nhân**: `getByText` khớp một phần chữ, không phân biệt hoa thường, nên khớp tiêu đề, nút, nhãn và cả dòng mô tả. **Cách sửa**: dùng `getByRole` kèm `name`, hoặc thêm `exact: true`, hoặc thu hẹp phạm vi.
- **Triệu chứng**: `getByLabel("Ghi nhớ đăng nhập")` khớp 2 phần tử. **Nguyên nhân**: checkbox tuỳ biến có `input` ẩn đi kèm. **Cách sửa**: `getByRole("checkbox", { name: "Ghi nhớ đăng nhập" })`.
- **Triệu chứng**: sau khi dịch giao diện sang tiếng Anh, `getByText("Đăng nhập")` hỏng. **Nguyên nhân**: locator theo chữ phụ thuộc ngôn ngữ. **Cách sửa**: với phần tử cố định dùng `getByTestId`, hoặc đọc chữ từ file bản dịch.
- **Triệu chứng**: `Timeout ... waiting for getByRole('button', { name: 'Gui' })`. **Nguyên nhân**: sai chính tả hoặc thiếu dấu so với giao diện. **Cách sửa**: sao chép chữ từ DevTools hoặc dùng Pick locator.
- **Triệu chứng**: lạm dụng `getByTestId` cho mọi thứ nên không phát hiện nút thiếu tên truy cập. **Nguyên nhân**: bỏ qua lợi ích kiểm tra accessibility. **Cách sửa**: thử `getByRole` trước, chỉ hạ xuống `getByTestId` khi không còn cách nào khác.

## Tóm tắt
- Ưu tiên locator theo cách người dùng nhận biết: Role, Label, Placeholder, Text, Alt/Title, TestId; CSS và XPath là phương án cuối.
- Locator là công thức tìm kiếm, được đánh giá lại và tự chờ mỗi lần thao tác hoặc kiểm tra.
- `getByRole` kèm `name` là locator mạnh nhất; thêm `exact`, `level`, `checked` để thu hẹp.
- Strict mode báo lỗi khi locator khớp nhiều phần tử; đọc danh sách trong thông báo và chọn gợi ý `aka`.
- `npx playwright codegen` và nút Pick locator giúp lấy gợi ý nhanh, nhưng luôn đọc lại và chỉnh cho ngắn, bền.
- Radio, checkbox, switch của lab có `input` ẩn: dùng `getByRole`, không dùng `getByLabel`.

## Bài tập
1. **Dễ**: Dùng codegen trên LAB-01, đăng nhập, sao chép code sinh ra vào một file spec và chạy xanh. Xong khi `npx playwright test` báo `1 passed`.
2. **Dễ**: Cố ý gây lỗi strict mode bằng `getByText("Đăng nhập")` rồi sửa bằng `getByRole`. Xong khi bạn chụp lại được thông báo lỗi và dòng đã sửa.
3. **Vừa**: Điền toàn bộ form LAB-02 chỉ bằng `getByRole` và `getByLabel` và kiểm tra vùng kết quả. Xong khi test xanh và không dùng CSS hay XPath.
4. **Vừa**: Liệt kê locator tốt nhất cho 6 phần tử của LAB-03 (nút Thêm vào giỏ của Chuột không dây, nút Tăng, ô mã giảm giá, nút Áp dụng, tổng cộng, nút Đặt hàng) và nêu lý do chọn từng cái. Xong khi mỗi dòng có locator và một câu giải thích.
5. **Khó**: Thử `getByLabel` thay cho `getByRole` ở ba loại phần tử radio, checkbox, switch trong LAB-02, ghi số phần tử khớp của từng cái, rồi giải thích bằng DOM (DevTools) vì sao khác nhau. Xong khi bạn mô tả được vai trò của `span role` và `input` ẩn.
