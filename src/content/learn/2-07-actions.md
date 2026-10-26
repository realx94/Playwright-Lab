---
title: Thao tác (Actions)
level: 2
order: 7
minutes: 60
summary: click, fill, check, selectOption, hover, upload, drag and drop và press; hiểu kiểm tra actionability trước mỗi thao tác.
keywords: [playwright fill vs type, setInputFiles, dragTo]
---

## Mục tiêu bài học
- Chọn đúng thao tác cho từng loại phần tử: ô nhập, radio, checkbox, switch, `select`, ô ngày, tệp, kéo thả, bàn phím.
- Phân biệt `fill`, `pressSequentially` và `press`; `check` và `click`; `selectOption` và select tuỳ biến.
- Giải thích 5 điều kiện **actionability** mà Playwright chờ trước mỗi thao tác và đọc được "Call log" khi thao tác thất bại.
- Điền trọn vẹn form LAB-02 bằng code, kể cả upload tệp và slider.
- Biết khi nào dùng `force` và `trial`, và vì sao hạn chế chúng.

## Bạn cần chuẩn bị
- Đã học bài 2.5 (locator hướng người dùng, đặc biệt mục lưu ý shadcn/Base UI) và bài 2.6 (chaining).
- Site lab chạy ở `http://localhost:3000`. Bài này dùng **LAB-02 Form đa dạng** (`/lab/forms`) và **LAB-13 Playground** (`/lab/playground`).

## Kiến thức cần nắm
- `click()`, `dblclick()`, `hover()`, `press("Enter")`.
- `fill(value)`: đặt giá trị cho ô nhập (xoá cũ); `pressSequentially()` gõ từng phím; `clear()`.
- `check()`, `uncheck()`, `setChecked()` cho checkbox, radio, switch.
- `selectOption()` cho `<select>` native; select tuỳ biến cần click mở danh sách rồi chọn `option`.
- `setInputFiles()` cho upload; `dragTo()` cho kéo thả.
- Phần tử phải: hiển thị, ổn định, nhận được sự kiện, được bật (và có thể sửa với thao tác nhập).

## Giải thích dễ hiểu

### Thao tác như người thật, nhưng có bảo hiểm
Mỗi thao tác của Playwright giống một **hành vi của người thật** nhưng có "bảo hiểm": trước khi bấm, Playwright chờ nút hiện ra, ngừng chuyển động và không bị che. Nhờ vậy bạn hiếm khi cần chờ thủ công. Các kiểm tra tự động này gọi là **actionability checks**. Với `click`, Playwright chờ cho tới khi phần tử:

| Điều kiện | Nghĩa |
|-----------|-------|
| **Visible** (hiển thị) | Có kích thước, không bị `visibility: hidden` |
| **Stable** (ổn định) | Không còn chuyển động (animation đã xong), vị trí giữ nguyên qua hai khung hình liên tiếp |
| **Receives Events** (nhận được sự kiện) | Điểm sắp bấm không bị phần tử khác che (ví dụ một lớp phủ) |
| **Enabled** (được bật) | Không có `disabled` |
| **Editable** (có thể sửa) | Chỉ với thao tác nhập như `fill`: ô không `readonly` và không `disabled` |

Nếu một điều kiện chưa thoả, Playwright **chờ và thử lại** cho tới khi hết thời gian (mặc định 30 giây cho một thao tác trong test). Quá thời gian thì báo lỗi kèm **Call log** liệt kê điều gì đang chặn.

### Thao tác theo loại phần tử

| Phần tử | Thao tác nên dùng | Vì sao |
|---------|-------------------|--------|
| Ô văn bản, email, số, ngày, textarea | `fill(giá trị)` | Đặt thẳng giá trị, nhanh và ổn định |
| Cần gõ từng phím (ô tự gợi ý, kiểm tra sự kiện phím) | `pressSequentially(chuỗi)` | Phát sự kiện bàn phím từng ký tự |
| Phím đặc biệt, tổ hợp phím | `press("Enter")`, `press("Control+A")` | Mô phỏng bàn phím |
| Nút, liên kết | `click()` | Bấm chuột trái |
| Checkbox, radio, switch | `check()`, `uncheck()`, `setChecked(bool)` | Đảm bảo trạng thái đích, không bật rồi tắt nhầm |
| `<select>` native | `selectOption(...)` | Chọn theo `value`, nhãn hoặc chỉ số |
| Select tuỳ biến (shadcn) | `click()` mở rồi `click()` vào `option` | Không phải thẻ `select` |
| Upload | `setInputFiles(...)` | Gán tệp cho `input type="file"` |
| Kéo thả | `dragTo(đích)` | Mô phỏng chuỗi chuột nhấn, di chuyển, thả |

## Thực hành từng bước

Các bước dưới đây xây dần một file `tests/actions.spec.ts` trên LAB-02. Đoạn khung chung:

```ts
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/forms");
  await page.getByTestId("reset-data").click();
});
```

Giải thích: mỗi test bắt đầu từ trang form sạch. Nút Reset (`data-testid="reset-data"`) xoá dữ liệu đã nhập.

### Bước 1. fill, clear, pressSequentially, press trên ô văn bản

Mục đích: nắm sự khác nhau giữa ba cách nhập.

```ts
test("ô văn bản", async ({ page }) => {
  const name = page.getByLabel("Họ tên");

  await name.fill("Nguyễn Văn A");
  await expect(name).toHaveValue("Nguyễn Văn A");

  await name.clear();
  await expect(name).toHaveValue("");

  await name.pressSequentially("Lan", { delay: 50 });
  await expect(name).toHaveValue("Lan");

  await name.press("Control+A");
  await name.press("Backspace");
  await expect(name).toHaveValue("");

  await name.fill("Nguyễn Văn A");
  await name.press("Tab");
  await expect(page.getByLabel("Email")).toBeFocused();
});
```

Giải thích từng dòng:

| Dòng | Ý nghĩa |
|------|---------|
| `name.fill("Nguyễn Văn A")` | Xoá nội dung cũ rồi đặt giá trị mới trong một bước. Dùng cho 95% trường hợp |
| `name.clear()` | Xoá trống ô |
| `name.pressSequentially("Lan", { delay: 50 })` | Gõ lần lượt từng ký tự, mỗi ký tự cách nhau 50 ms; phát đủ sự kiện phím. Thay cho `type()` đã lỗi thời |
| `name.press("Control+A")` | Nhấn tổ hợp phím chọn tất cả (macOS dùng `Meta+A`) |
| `name.press("Backspace")` | Nhấn phím xoá |
| `name.press("Tab")` | Chuyển focus sang phần tử kế tiếp |
| `toHaveValue(...)` | Khẳng định giá trị ô nhập |
| `toBeFocused()` | Khẳng định phần tử đang giữ focus |

Kết quả mong đợi: test xanh. Nếu muốn xem, chạy `npx playwright test actions --headed`: bạn sẽ thấy chữ "Lan" hiện chậm từng ký tự do `delay`.

Khi nào dùng `pressSequentially` thay `fill`? Khi ô có xử lý theo từng phím (gợi ý khi gõ, định dạng số thẻ tự thêm khoảng trắng). Còn lại hãy dùng `fill`.

### Bước 2. Ô số, ô ngày và textarea

Mục đích: biết cách điền các kiểu ô đặc biệt.

```ts
test("ô số, ngày, textarea", async ({ page }) => {
  await page.getByLabel("Tuổi").fill("30");
  await expect(page.getByLabel("Tuổi")).toHaveValue("30");

  // Ô date chỉ nhận định dạng yyyy-mm-dd
  await page.getByLabel("Ngày sinh").fill("2000-01-31");
  await expect(page.getByLabel("Ngày sinh")).toHaveValue("2000-01-31");

  // Textarea: nhãn có số ký tự động nên dùng regex
  await page.getByLabel(/Giới thiệu/).fill("Xin chào");
  await expect(page.getByText("Giới thiệu (8/200)")).toBeVisible();
});
```

Giải thích: `input type="date"` yêu cầu chuỗi `yyyy-mm-dd` bất kể cách trình duyệt hiển thị (dd/mm/yyyy). Nhãn textarea là `Giới thiệu (N/200)` thay đổi theo số ký tự, nên dùng regex `/Giới thiệu/` để không phụ thuộc N. Sau khi nhập "Xin chào" (8 ký tự) nhãn đổi thành `Giới thiệu (8/200)`.

Kết quả mong đợi: test xanh. Nếu `fill` ô ngày báo `Malformed value`, bạn đã dùng sai định dạng ngày.

### Bước 3. Radio, checkbox, switch với check, uncheck, setChecked

Mục đích: chọn đúng phần tử và đảm bảo trạng thái đích.

```ts
test("radio, checkbox, switch", async ({ page }) => {
  const male = page.getByRole("radio", { name: "Nam" });
  await male.check();
  await expect(male).toBeChecked();

  const hobby = page.getByRole("checkbox", { name: "Đọc sách" });
  await hobby.check();
  await hobby.uncheck();
  await expect(hobby).not.toBeChecked();
  await hobby.setChecked(true);
  await expect(hobby).toBeChecked();

  const newsletter = page.getByRole("switch", { name: "Nhận bản tin" });
  await newsletter.check();
  await expect(newsletter).toBeChecked();
  await newsletter.uncheck();
  await expect(newsletter).not.toBeChecked();
});
```

Giải thích: dùng `getByRole(...)` cho cả ba loại (xem lưu ý Base UI ở bài 2.5). `check()` **xác nhận trạng thái sau khi thao tác**: nếu đã chọn rồi thì không bấm thêm, nên không bật rồi tắt nhầm như `click()`. `setChecked(true | false)` đặt trực tiếp trạng thái theo biến bool. Radio chỉ có `check()`; không thể `uncheck()` một radio.

Kết quả mong đợi: test xanh. Nếu bạn dùng `getByLabel("Nam")` mà gặp lỗi mơ hồ giữa hai phần tử (span và input ẩn), quay lại `getByRole`.

### Bước 4. Select native: selectOption

Mục đích: chọn một mục của thẻ `<select>`.

```ts
test("select native", async ({ page }) => {
  const country = page.getByLabel("Quốc gia (select native)");

  await country.selectOption("vn");                // theo value
  await expect(country).toHaveValue("vn");

  await country.selectOption({ label: "Nhật Bản" }); // theo chữ hiển thị
  await expect(country).toHaveValue("jp");

  await country.selectOption({ index: 2 });        // theo chỉ số (0 là mục "-- Chọn --")
  await expect(country).toHaveValue("us");
});
```

Giải thích: chuỗi thuần là `value` của `<option>`; `{ label }` là chữ hiển thị; `{ index }` là vị trí (đếm từ 0). Hạn chế dùng `index` vì mong manh. Chọn nhiều mục (cho `select multiple`) bằng một mảng: `selectOption(["vn", "jp"])`.

Kết quả mong đợi: test xanh. Nếu báo `did not find some options`, giá trị hoặc nhãn không có trong danh sách.

### Bước 5. Select tuỳ biến: click mở, click chọn

Mục đích: điều khiển combobox tuỳ biến của shadcn.

```ts
test("select tuỳ biến", async ({ page }) => {
  const city = page.getByRole("combobox", { name: "Thành phố (select tuỳ biến)" });
  await city.click();                                    // mở danh sách
  await page.getByRole("option", { name: "Hà Nội" }).click(); // chọn mục
  await expect(city).toContainText("Hà Nội");
});
```

Giải thích: thành phần này không phải thẻ `select` nên `selectOption` không dùng được. Nó là `button` có `role="combobox"`; khi bấm, danh sách `option` hiện ra (thường trong một lớp nổi ngoài form). Ta bấm vào `option` mong muốn rồi kiểm tra chữ hiển thị trên chính combobox.

Kết quả mong đợi: test xanh. Nếu `getByRole("option")` không tìm thấy, có thể bạn chưa chờ danh sách mở: `click()` ở dòng trước đã đủ, vì Playwright tự chờ `option` xuất hiện khi bạn gọi `.click()` ở dòng sau.

### Bước 6. Slider bằng bàn phím

Mục đích: thao tác thành phần không có `fill` hay `check`.

```ts
test("slider bằng bàn phím", async ({ page }) => {
  const rating = page.getByTestId("rating-value");
  await expect(rating).toHaveText("5");               // giá trị mặc định

  const slider = page.getByRole("slider");
  await slider.focus();
  await slider.press("ArrowRight");                   // tăng 1
  await expect(rating).toHaveText("6");

  await slider.press("End");                          // về cuối
  await expect(rating).toHaveText("10");

  await slider.press("Home");                         // về đầu
  await expect(rating).toHaveText("0");
});
```

Giải thích: `focus()` đưa focus vào núm kéo; `ArrowRight` tăng một bước (step = 1 theo thiết kế của lab), `End` và `Home` nhảy tới cực đại và cực tiểu. Cách này ổn định hơn mô phỏng kéo chuột.

Kết quả mong đợi: test xanh; số hiển thị trong nhãn "Mức hài lòng" đổi theo.

### Bước 7. Upload tệp: setInputFiles

Mục đích: gán tệp cho `input type="file"` mà không cần mở hộp thoại hệ điều hành.

```ts
import path from "node:path";

test("upload tệp", async ({ page }) => {
  const file = page.getByLabel(/Tệp đính kèm/);

  // 1) Tệp ảo tạo ngay trong bộ nhớ
  await file.setInputFiles({
    name: "a.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("x"),
  });
  await page.getByRole("button", { name: "Gửi" }).click();
  await expect(page.getByTestId("file-error")).toContainText("png, jpg, pdf");

  // 2) Tệp thật trên đĩa (đường dẫn tương đối so với thư mục chạy lệnh)
  await file.setInputFiles(path.join("fixtures", "avatar.png"));

  // 3) Bỏ chọn tệp
  await file.setInputFiles([]);
});
```

Giải thích: đối tượng `{ name, mimeType, buffer }` tạo tệp tạm không cần có sẵn trên ổ đĩa; `Buffer.from("x")` là nội dung 1 byte. Dùng đường dẫn khi bạn có sẵn tệp mẫu (ví dụ thư mục `fixtures`). Truyền mảng rỗng để xoá lựa chọn. Với `input` nhận nhiều tệp, truyền mảng nhiều tệp.

Kết quả mong đợi: sau khi gán `a.exe` và bấm Gửi, thông báo `Chỉ chấp nhận png, jpg, pdf` hiện ra. Lưu ý dòng 2) cần tệp `fixtures/avatar.png` có thật; nếu không có, Playwright báo `ENOENT: no such file or directory`. Bạn có thể bỏ dòng này nếu chưa chuẩn bị tệp.

### Bước 8. click, dblclick, hover và các tuỳ chọn

Mục đích: dùng các thao tác chuột ngoài click đơn.

```ts
test("chuột", async ({ page }) => {
  await page.getByLabel("Họ tên").fill("Nguyễn Văn A");
  await page.getByLabel("Email").fill("a@lab.dev");
  await page.getByLabel("Tuổi").fill("30");
  await page.getByRole("radio", { name: "Nam" }).check();
  await page.getByRole("checkbox", { name: "Đọc sách" }).check();
  await page.getByLabel("Quốc gia (select native)").selectOption("vn");
  await page.getByRole("combobox", { name: "Thành phố (select tuỳ biến)" }).click();
  await page.getByRole("option", { name: "Đà Nẵng" }).click();
  await page.getByRole("checkbox", { name: "Tôi đồng ý điều khoản" }).check();

  const submit = page.getByRole("button", { name: "Gửi" });
  await submit.hover();                       // rê chuột lên, không bấm
  await submit.click({ trial: true });        // chạy kiểm tra actionability nhưng KHÔNG bấm
  await submit.click();                       // bấm thật
  await expect(page.getByTestId("result")).toContainText('"city": "Đà Nẵng"');
});
```

Giải thích:

| Lệnh | Ý nghĩa |
|------|---------|
| `hover()` | Rê chuột lên phần tử (kích hoạt trạng thái `:hover`, tooltip, menu thả xuống) |
| `click({ trial: true })` | Thử bấm: chờ đủ điều kiện nhưng **không** thực sự bấm; hữu ích để kiểm tra "nút có bấm được không" |
| `click()` | Bấm chuột trái |
| `dblclick()` | Bấm đúp |
| `click({ button: "right" })` | Bấm chuột phải |
| `click({ modifiers: ["Shift"] })` | Giữ phím Shift khi bấm |
| `click({ position: { x: 5, y: 5 } })` | Bấm tại một toạ độ trong phần tử |

Kết quả mong đợi: test xanh; vùng **Kết quả** hiện JSON có `"city": "Đà Nẵng"`.

### Bước 9. Kéo thả: dragTo

Mục đích: thao tác kéo một phần tử và thả vào phần tử khác. Dùng LAB-13.

```ts
test("kéo thả", async ({ page }) => {
  await page.goto("/lab/playground");
  await page.getByTestId("drag-item").dragTo(page.getByTestId("drop-zone"));
  await expect(page.getByTestId("drop-result")).toHaveText("Thẻ A");
});
```

Giải thích: `dragTo(đích)` lấy phần tử nguồn (`drag-item`, thẻ "Thẻ A") và kéo tới phần tử đích (`drop-zone`, "Vùng thả"). Nó mô phỏng chuột nhấn, di chuyển rồi thả, đủ cho kéo thả dùng HTML5 drag-and-drop như lab này. Một số thư viện kéo thả tự viết cần tự điều khiển chuột bằng `page.mouse.move(...)` và `page.mouse.down()`/`up()`.

Kết quả mong đợi: test xanh; dòng `Đã thả:` hiện `Thẻ A`.

### Bước 10. Bàn phím toàn trang và cuộn

Mục đích: dùng `page.keyboard` và cuộn phần tử.

```ts
test("bàn phím và cuộn", async ({ page }) => {
  await page.goto("/lab/playground");

  const list = page.getByTestId("scroll-list");
  await list.focus();                       // đưa focus vào danh sách cuộn
  await page.keyboard.press("PageDown");    // phím gửi tới phần tử đang focus

  // Cuộn tới nút ở xa rồi thao tác
  const download = page.getByRole("button", { name: "Tải tệp ghi chú" });
  await download.scrollIntoViewIfNeeded();
  await expect(download).toBeVisible();
});
```

Giải thích: `page.keyboard.press` gửi phím tới phần tử đang có focus (khác `locator.press` luôn gửi tới đúng phần tử đó). `scrollIntoViewIfNeeded()` cuộn phần tử vào vùng nhìn. Thực ra `click()` đã tự cuộn nên bạn hiếm khi gọi hàm này.

Kết quả mong đợi: test xanh.

### Bước 11. Đọc Call log khi thao tác chưa thực hiện được

Mục đích: hiểu thông báo của actionability khi nút bị vô hiệu.

Trên LAB-13, nút **Tải dữ liệu** bị vô hiệu trong lúc đang tải (mặc định 1500 ms). Thử:

```ts
test("nút đang vô hiệu: click phải chờ", async ({ page }) => {
  await page.goto("/lab/playground?delay=3000");
  const load = page.getByRole("button", { name: "Tải dữ liệu" });

  await load.click();                                  // lần 1: bấm được
  await expect(load).toBeDisabled();                   // đang tải nên bị vô hiệu

  // Lần 2 phải chờ tới khi nút bật lại (khoảng 3 giây), rồi mới bấm
  await load.click();
  await expect(page.getByTestId("delay-result")).toBeVisible();
});
```

Giải thích: `?delay=3000` làm lab trì hoãn 3 giây. Lần bấm thứ hai Playwright **không báo lỗi ngay** mà chờ nút `enabled`. Nếu bạn đặt `{ timeout: 800 }` cho lần bấm thứ hai, bạn sẽ thấy thông báo:

```text
TimeoutError: locator.click: Timeout 800ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Tải dữ liệu' })
    - locator resolved to <button disabled tabindex="0" type="button" ...>Tải dữ liệu</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
    ...
```

Cách đọc Call log (đã rút gọn, thực tế còn lặp lại nhiều lần): dòng `locator resolved to` cho biết phần tử đã tìm thấy (kèm `disabled`); `attempting click action` là đang thử bấm; `element is not enabled` là **lý do chặn**; `retrying click action` và `waiting 20ms` cho thấy Playwright đang chờ rồi thử lại. Hai lý do thường gặp khác: `element is not visible` và `<div ...> intercepts pointer events` (một phần tử khác che nút).

Kết quả mong đợi: test xanh ở phiên bản không có `timeout`.

### Bước 12. force và các lối thoát (dùng hạn chế)

Mục đích: biết công cụ nhưng không lạm dụng.

```ts
await page.getByRole("button", { name: "Gửi" }).click({ force: true });
```

Giải thích: `force: true` **bỏ qua** các kiểm tra actionability (trừ việc phần tử phải tồn tại) và bấm luôn. Nó che giấu những vấn đề thật như nút bị lớp phủ che hoặc bị vô hiệu, có thể khiến test "xanh" trong khi người dùng thật không bấm được. Chỉ dùng khi bạn biết chắc nguyên nhân và có lý do hợp lệ (ví dụ phần tử được che bởi lớp trang trí cố ý). Nếu chỉ vì "nó không bấm được", hãy đọc Call log trước.

## Demo code

File hoàn chỉnh điền toàn bộ form LAB-02 (các thao tác kể trên gom lại), chạy được với site lab:

```ts
import { test, expect } from "@playwright/test";

test("điền đầy đủ form LAB-02 bằng đủ loại thao tác", async ({ page }) => {
  await page.goto("/lab/forms");
  await page.getByTestId("reset-data").click();

  // Ô văn bản, số, ngày, textarea
  await page.getByLabel("Họ tên").fill("Nguyễn Văn A");
  await page.getByLabel("Email").fill("a@lab.dev");
  await page.getByLabel("Tuổi").fill("30");
  await page.getByLabel("Ngày sinh").fill("2000-01-31");
  await page.getByLabel(/Giới thiệu/).fill("QA mới vào nghề");

  // Radio, checkbox: dùng getByRole
  await page.getByRole("radio", { name: "Nam" }).check();
  await page.getByRole("checkbox", { name: "Đọc sách" }).check();
  await page.getByRole("checkbox", { name: "Du lịch" }).check();

  // Select native và select tuỳ biến
  await page.getByLabel("Quốc gia (select native)").selectOption("vn");
  await page.getByRole("combobox", { name: "Thành phố (select tuỳ biến)" }).click();
  await page.getByRole("option", { name: "Đà Nẵng" }).click();

  // Switch và slider
  await page.getByRole("switch", { name: "Nhận bản tin" }).check();
  const slider = page.getByRole("slider");
  await slider.focus();
  await slider.press("ArrowRight");

  // Upload tệp hợp lệ (tạo ngay trong bộ nhớ)
  await page.getByLabel(/Tệp đính kèm/).setInputFiles({
    name: "a.png",
    mimeType: "image/png",
    buffer: Buffer.from("x"),
  });

  // Điều khoản rồi gửi
  await page.getByRole("checkbox", { name: "Tôi đồng ý điều khoản" }).check();
  await page.getByRole("button", { name: "Gửi" }).click();

  // Kiểm tra kết quả JSON hiển thị
  const result = page.getByTestId("result");
  await expect(result).toContainText('"name": "Nguyễn Văn A"');
  await expect(result).toContainText('"country": "vn"');
  await expect(result).toContainText('"city": "Đà Nẵng"');
  await expect(result).toContainText('"newsletter": true');
  await expect(result).toContainText('"rating": 6');
  await expect(result).toContainText('"file": "a.png"');
});
```

Giải thích: thứ tự các nhóm đi từ trên xuống dưới như bố cục form. Cuối cùng kiểm tra từng trường trong JSON kết quả; `rating` là 6 vì mặc định 5 và ta bấm `ArrowRight` một lần. Nếu muốn, tách từng nhóm thành test nhỏ như các bước ở trên để dễ chẩn đoán.

## Thử ngay trong lab
- [LAB-02 Form đa dạng](/labs/forms) (`/lab/forms`): điền form bằng tay một lần để nắm các trường, rồi chạy bản test của bạn với `--headed`. Thử upload tệp `.exe` và quan sát thông báo `Chỉ chấp nhận png, jpg, pdf`.
- [LAB-13 Playground](/labs/playground) (`/lab/playground`): làm kéo thả (Bước 9) và nút "Tải dữ liệu" với `?delay=3000` (Bước 11) để thấy Playwright chờ nút bật lại.

## Lỗi thường gặp
- **Triệu chứng**: dùng `click()` trên `<select>` rồi tự chọn `<option>` nhưng không chọn được. **Nguyên nhân**: danh sách `option` của select native do hệ điều hành vẽ. **Cách sửa**: dùng `selectOption()` với select native.
- **Triệu chứng**: trình soạn code gạch ngang tên hàm `type()` hoặc cảnh báo đã lỗi thời. **Nguyên nhân**: `type()` đã bị thay thế. **Cách sửa**: dùng `fill()` cho trường hợp thông thường, `pressSequentially()` khi cần gõ từng phím.
- **Triệu chứng**: không tìm thấy `option` của select tuỳ biến. **Nguyên nhân**: chưa mở danh sách, hoặc dùng `selectOption` cho thành phần không phải thẻ `select`. **Cách sửa**: click combobox trước, rồi `getByRole("option", { name })`.
- **Triệu chứng**: `Timeout ... element is not enabled` hoặc `intercepts pointer events`. **Nguyên nhân**: nút bị vô hiệu hoặc bị che. **Cách sửa**: chờ điều kiện đúng (kiểm tra bằng `toBeEnabled`), đóng lớp phủ; chỉ dùng `force` khi chắc chắn.
- **Triệu chứng**: ô ngày hoặc ô số báo `Malformed value` hay không nhận giá trị. **Nguyên nhân**: sai định dạng. **Cách sửa**: ngày dùng `yyyy-mm-dd`, số dùng chuỗi số thuần.
- **Triệu chứng**: dùng `click()` cho checkbox, chạy hai lần thì tắt mất. **Nguyên nhân**: `click()` đảo trạng thái. **Cách sửa**: dùng `check()` hoặc `setChecked(true)`.
- **Triệu chứng**: `setInputFiles` báo `ENOENT`. **Nguyên nhân**: đường dẫn tệp sai. **Cách sửa**: kiểm tra đường dẫn so với thư mục chạy lệnh, hoặc dùng tệp ảo `{ name, mimeType, buffer }`.

## Tóm tắt
- Mỗi thao tác tự chờ phần tử visible, stable, nhận được sự kiện, enabled (và editable với nhập liệu).
- `fill` cho ô nhập, `pressSequentially` khi cần gõ từng phím, `press` cho phím đặc biệt.
- `check`, `uncheck`, `setChecked` cho checkbox, radio, switch; chọn theo `getByRole`.
- `selectOption` chỉ dùng cho `<select>` native; select tuỳ biến cần click mở rồi click `option`.
- `setInputFiles` gán tệp cho upload (tệp thật hoặc tệp ảo trong bộ nhớ); `dragTo` cho kéo thả.
- Khi thao tác thất bại, đọc Call log để biết điều kiện nào chưa thoả; hạn chế `force`.

## Bài tập
1. **Dễ**: Điền ba ô văn bản (Họ tên, Email, Tuổi) của LAB-02 bằng `fill`, rồi dùng `toHaveValue` kiểm tra từng ô. Xong khi test xanh.
2. **Dễ**: Thử upload tệp `.exe` và quan sát thông báo lỗi, rồi upload tệp `a.png` hợp lệ để thông báo biến mất. Xong khi hai kết quả được kiểm tra bằng `expect`.
3. **Vừa**: Điền form LAB-02 đủ các loại: input, radio, checkbox, select native, select tuỳ biến, switch, slider, ngày, upload, rồi kiểm tra JSON kết quả. Xong khi test xanh.
4. **Vừa**: Viết test cho kéo thả ở LAB-13 và test cho nút "Tải dữ liệu" với `?delay=2000` (chờ `delay-result` hiện ra). Xong khi cả hai test xanh mà không dùng `waitForTimeout`.
5. **Khó**: Cố ý làm một thao tác thất bại (ví dụ bấm nút "Tải dữ liệu" với `{ timeout: 500 }` trong lúc nó đang tải), đọc Call log, và viết 3 dòng giải thích từng dòng của Call log. Xong khi bạn nêu đúng lý do chặn và đề xuất cách sửa không dùng `force`.
