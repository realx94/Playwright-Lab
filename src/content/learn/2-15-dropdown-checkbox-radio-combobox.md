---
title: Dropdown, checkbox, radio và combobox
level: 2
order: 15
minutes: 60
summary: selectOption cho select native, mở dropdown tuỳ biến rồi chọn option, combobox gõ và chọn bằng bàn phím, check/uncheck/setChecked, nhóm radio theo tên và cách đọc giá trị đang chọn.
keywords: [playwright selectOption, playwright combobox, playwright autocomplete, playwright checkbox, playwright radio, toHaveValues]
---

## Mục tiêu bài học
- Chọn giá trị của `<select>` native theo `value`, theo nhãn (`label`), theo thứ tự (`index`) và chọn nhiều giá trị.
- Phân biệt `<select>` native với dropdown tuỳ biến, và biết cách thao tác với dropdown tuỳ biến bằng role `combobox`, `listbox`, `option`.
- Thao tác với ô autocomplete: gõ chữ, chờ gợi ý, chọn bằng chuột hoặc bằng `ArrowDown` + `Enter`.
- Dùng `check`, `uncheck`, `setChecked`, `toBeChecked` cho checkbox và nhóm radio; đọc lại giá trị đang chọn bằng `inputValue`, `toHaveValue`, `toHaveValues`.
- Nhận ra và sửa các lỗi hay gặp: `option` khớp nhầm, danh sách chưa mở, chọn rồi nhưng ứng dụng chưa ghi nhận.

## Bạn cần chuẩn bị
- Đã học bài 2.5 (locator hướng người dùng, đặc biệt mục "Lưu ý với shadcn/Base UI"), bài 2.7 (actions) và bài 2.8 (assertions).
- Site lab chạy ở `http://localhost:3000` và `baseURL` đã cấu hình trong `playwright.config.ts`.
- Ví dụ xuyên suốt dùng **LAB-29 Tìm & đặt phòng khách sạn** (`/lab/hotel`, mô tả và Business Rules ở `/labs/hotel`) và **LAB-02 Form đa dạng** (`/lab/forms`).

## Kiến thức cần nắm
- `selectOption("3")`, `selectOption({ label: "4" })`, `selectOption({ index: 0 })`, `selectOption(["r", "b"])`.
- `<select>` native chỉ có một cách thao tác; dropdown tuỳ biến là các thẻ `div` và `button` nên phải bấm mở rồi bấm một `option`.
- Combobox là ô nhập có `role="combobox"`, danh sách gợi ý là `role="listbox"`, từng dòng là `role="option"`.
- `check()`, `uncheck()`, `setChecked(true | false)`; `expect(...).toBeChecked()`.
- Nhóm radio: mỗi radio là một `getByRole("radio", { name })`, mỗi lần chỉ một radio được chọn.
- Đọc giá trị: `inputValue()` (lấy giá trị hiện tại một lần), `toHaveValue(...)` (assertion tự thử lại), `toHaveValues([...])` cho select nhiều lựa chọn.

## Giải thích dễ hiểu

### Hai loại "dropdown" trông giống nhau nhưng khác bản chất
Khi bạn bấm vào một ô chọn trên trang web và thấy một danh sách xổ xuống, có hai khả năng:

1. **Select native** (select gốc của trình duyệt): thẻ `<select>` chứa các thẻ `<option>`. Trình duyệt tự vẽ và tự xử lý danh sách. Playwright có lệnh riêng là `selectOption` cho loại này: một dòng lệnh là chọn xong, không cần mở danh sách.
2. **Dropdown tuỳ biến** (custom dropdown): giao diện do lập trình viên tự vẽ bằng `div`, `button`, `ul`, `li`... và gắn thuộc tính ARIA để mô tả. Đây là loại mà các thư viện giao diện như shadcn/ui (Base UI), Material UI hay Ant Design tạo ra. Với loại này **không dùng `selectOption`**, mà làm như người dùng thật: bấm để mở, rồi bấm vào dòng cần chọn.

Cách phân biệt nhanh: mở DevTools và nhìn thẻ. Nếu là `<select>` thì dùng `selectOption`. Nếu là `button role="combobox"` hoặc `input role="combobox"` thì dùng cách tuỳ biến. Một mẹo khác: select native khi mở ra được vẽ bởi hệ điều hành, bạn không inspect được từng dòng; dropdown tuỳ biến thì inspect được từng dòng.

### Combobox, listbox, option
**Combobox** (ô kết hợp) là một ô nhập kèm danh sách gợi ý. Có ba vai trò cùng làm việc:

- `combobox`: ô nhập hoặc nút mở danh sách. Thuộc tính `aria-expanded` cho biết danh sách đang mở hay đóng.
- `listbox`: khung chứa danh sách gợi ý.
- `option`: từng dòng gợi ý. Thuộc tính `aria-selected="true"` đánh dấu dòng đang được tô sáng.

Vì Playwright tìm theo role, bạn thao tác y như mô tả bằng lời: "gõ vào ô **Điểm đến**, rồi bấm dòng **Đà Nẵng**".

### Checkbox và radio: khác nhau ở "nhóm"
Checkbox độc lập với nhau, mỗi cái bật hoặc tắt riêng. Radio thuộc một **nhóm**, chọn cái này thì cái kia tự bỏ chọn. Cả hai có trạng thái `checked`, nên Playwright dùng chung các lệnh `check`, `toBeChecked`. Điểm khác duy nhất bạn cần nhớ: **radio chỉ có thể `check`, không thể `uncheck`** (bỏ chọn radio là việc của việc chọn radio khác).

### Vì sao `check()` tốt hơn `click()`
`click()` chỉ bấm. Nếu checkbox đã bật sẵn, bấm lần nữa sẽ **tắt** nó và test của bạn sai ngay từ đầu. `check()` nghĩa là "đảm bảo ô này được bật": nếu đã bật thì không làm gì, nếu chưa thì bấm, rồi kiểm tra lại trạng thái sau khi bấm. Đây gọi là thao tác **idempotent** (làm một hay nhiều lần cho cùng kết quả), rất hợp với test cần ổn định.

## Thực hành từng bước

Các bước dưới đây chạy trên `/lab/hotel`. Giao diện có ba nhóm điều khiển chính: biểu mẫu tìm kiếm phía trên (ô **Điểm đến**, hai ô chọn ngày, **Người lớn**, **Số phòng**), bộ lọc bên trái sau khi tìm (checkbox **Tiện nghi**, radio **Hạng sao**) và ô **Sắp xếp** phía trên danh sách kết quả. Để lab có cùng dữ liệu mỗi lần chạy, ta cố định "hôm nay" là 10/03/2026 (xem bài 2.17 về chọn ngày).

### Bước 1. Dựng khung test và mở lab

Mục đích: có một hàm mở lab ở trạng thái sạch, dùng lại cho mọi bước sau.

```ts
import { test, expect, type Page } from "@playwright/test";

async function openHotel(page: Page) {
  await page.clock.setFixedTime(new Date("2026-03-10T09:00:00"));
  await page.goto("/lab/hotel");
  await page.getByTestId("reset-data").click();
}
```

Giải thích từng dòng:

| Dòng | Ý nghĩa |
|------|---------|
| `page.clock.setFixedTime(...)` | Đóng băng đồng hồ của trang ở thời điểm đã cho, để các giá trị phụ thuộc "hôm nay" luôn như nhau |
| `page.goto("/lab/hotel")` | Mở ứng dụng; địa chỉ tương đối được ghép với `baseURL` |
| `getByTestId("reset-data").click()` | Bấm nút "Reset dữ liệu lab" để xoá trạng thái còn sót từ lần chạy trước |

Kết quả mong đợi: trang tìm khách sạn hiện ra với các ô trống, dòng số đêm ghi "Chưa chọn ngày".

### Bước 2. `selectOption` trên select native: theo value, label, index

Mục đích: chọn số người lớn bằng ba cách và biết khi nào dùng cách nào.

```ts
test("select native: ba cách chọn", async ({ page }) => {
  await openHotel(page);
  const adults = page.getByLabel("Người lớn");

  await adults.selectOption("3");               // theo value
  await expect(adults).toHaveValue("3");

  await adults.selectOption({ label: "4" });    // theo nhãn hiển thị
  await expect(adults).toHaveValue("4");

  await adults.selectOption({ index: 0 });      // theo thứ tự, bắt đầu từ 0
  await expect(adults).toHaveValue("1");
});
```

Giải thích:

- `getByLabel("Người lớn")` tìm thẻ `<select>` có nhãn "Người lớn". Với `<select>` native, `getByLabel` hoạt động tốt vì chỉ có một phần tử khớp.
- `selectOption("3")` truyền một chuỗi: Playwright hiểu là **giá trị** `value` của `<option>`. Trên lab, `value` và nhãn đều là số nên trông giống nhau.
- `selectOption({ label: "4" })` chọn theo chữ người dùng nhìn thấy. Dùng cách này khi `value` là mã khó đọc (ví dụ `price-asc`).
- `selectOption({ index: 0 })` chọn theo vị trí. Chỉ nên dùng khi thứ tự là một phần của yêu cầu, vì thêm một dòng vào đầu danh sách sẽ làm test chọn sai mà không báo lỗi.
- `toHaveValue("3")` kiểm tra `value` của select sau khi chọn. Luôn có assertion sau thao tác để biết ứng dụng đã nhận.

Kết quả mong đợi: test xanh. Khi chưa có `option` khớp, Playwright chờ và báo timeout kèm danh sách option hiện có, ví dụ `did not find some options`.

Nếu gặp lỗi: `Error: Element is not a <select> element` nghĩa là phần tử bạn trỏ tới không phải select native (có thể là dropdown tuỳ biến); xem Bước 5.

### Bước 3. Đọc giá trị và nội dung các option

Mục đích: kiểm tra danh sách lựa chọn và đọc chữ của dòng đang chọn.

```ts
test("đọc select", async ({ page }) => {
  await openHotel(page);
  const adults = page.getByLabel("Người lớn");

  expect(await adults.inputValue()).toBe("1");                  // đọc một lần
  await expect(adults.locator("option")).toHaveCount(6);        // có 6 lựa chọn
  await expect(adults.locator("option")).toHaveText(["1", "2", "3", "4", "5", "6"]);
  await expect(adults.locator("option:checked")).toHaveText("1"); // chữ của dòng đang chọn
});
```

Giải thích:

- `inputValue()` trả về `value` hiện tại dưới dạng chuỗi ngay tại thời điểm gọi. Nó **không tự thử lại**, nên nếu giá trị đang thay đổi, hãy dùng `toHaveValue`.
- `adults.locator("option")` tìm các `<option>` bên trong select. `toHaveText([...])` với một mảng so sánh từng phần tử theo thứ tự.
- `option:checked` là bộ chọn CSS chỉ `option` đang được chọn. Dùng khi cần so **chữ hiển thị** thay vì `value`.

Kết quả mong đợi: cả bốn dòng đều qua. Quy tắc nhớ: **cần giá trị thì `toHaveValue`; cần chữ người dùng thấy thì `option:checked` kèm `toHaveText`**.

### Bước 4. Select có nhiều lựa chọn (`multiple`)

Mục đích: chọn nhiều giá trị cùng lúc và kiểm tra bằng `toHaveValues`. Lab hotel không có select nhiều lựa chọn, nên ví dụ này tự dựng trang nhỏ bằng `page.setContent`.

```ts
test("select multiple", async ({ page }) => {
  await page.setContent(`
    <label>Màu
      <select multiple>
        <option value="r">Đỏ</option>
        <option value="g">Xanh</option>
        <option value="b">Lam</option>
      </select>
    </label>`);
  const colors = page.getByLabel("Màu");

  await colors.selectOption(["r", "b"]);               // chọn hai giá trị
  await expect(colors).toHaveValues(["r", "b"]);

  await colors.selectOption([{ label: "Xanh" }]);      // thay bằng một giá trị khác theo nhãn
  await expect(colors).toHaveValues(["g"]);

  await colors.selectOption([]);                       // bỏ chọn tất cả
  await expect(colors).toHaveValues([]);
});
```

Giải thích:

- Truyền **mảng** vào `selectOption` để chọn nhiều giá trị. Mỗi lần gọi **thay thế** toàn bộ lựa chọn cũ, không cộng dồn.
- `toHaveValues([...])` (số nhiều) so sánh danh sách giá trị đang được chọn. Với select một lựa chọn dùng `toHaveValue` (số ít).
- `selectOption([])` đưa select về trạng thái không chọn gì.

Kết quả mong đợi: ba assertion đều qua. Nếu bạn gọi `selectOption("g")` trên select `multiple` mà không dùng mảng, vẫn chọn được một giá trị, nhưng hãy dùng mảng để ý định rõ ràng.

### Bước 5. Dropdown tuỳ biến: bấm mở rồi chọn `option`

Mục đích: thao tác với ô **Thành phố (select tuỳ biến)** của LAB-02, dựng bằng shadcn/Base UI.

```ts
test("dropdown tuỳ biến (LAB-02)", async ({ page }) => {
  await page.goto("/lab/forms");
  const city = page.getByTestId("city");

  await city.click();                                   // 1. mở danh sách
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.getByRole("option", { name: "Đà Nẵng" }).click(); // 2. chọn dòng
  await expect(city).toContainText("Đà Nẵng");          // 3. kiểm tra nút đã đổi chữ
  await expect(page.getByRole("listbox")).toBeHidden(); // 4. danh sách đã đóng
});
```

Giải thích:

- `getByTestId("city")` trỏ tới nút mở danh sách (`SelectTrigger`). Nút này là "ô" mà người dùng bấm vào.
- `city.click()` mở danh sách. Khác select native, các dòng chỉ **xuất hiện trong DOM sau khi mở**, thường nằm ở một khung nổi (portal) ở cuối `body`, không nằm bên trong nút.
- `page.getByRole("option", { name: "Đà Nẵng" })` tìm theo `page`, không theo `city`, chính vì danh sách nằm ngoài nút.
- `toContainText("Đà Nẵng")` kiểm tra nút hiển thị giá trị đã chọn. Với dropdown tuỳ biến, **giá trị hiển thị** là thứ bạn kiểm tra, không phải `value` của một thẻ `select`.

Kết quả mong đợi: danh sách mở, bấm "Đà Nẵng" thì đóng lại và nút ghi "Đà Nẵng".

Nếu gặp lỗi: `locator.click: Timeout ... waiting for getByRole('option', { name: 'Đà Nẵng' })` thường do quên bấm mở trước, hoặc tên option khác chữ bạn gõ (khoảng trắng, dấu). Chạy `npx playwright test --ui` hoặc xem trace để thấy danh sách thật sự hiển thị gì.

### Bước 6. Combobox có autocomplete: gõ rồi chọn bằng chuột

Mục đích: dùng ô **Điểm đến** của LAB-29. Đây là `input` có `role="combobox"`, danh sách gợi ý lọc theo chữ gõ và **không phân biệt dấu**.

```ts
test("combobox: gõ rồi bấm gợi ý", async ({ page }) => {
  await openHotel(page);
  const city = page.getByRole("combobox", { name: "Điểm đến" });

  await city.fill("da");
  await expect(page.getByRole("listbox").getByRole("option")).toHaveText(["Đà Nẵng", "Đà Lạt"]);

  await page.getByRole("option", { name: "Đà Nẵng" }).click();
  await expect(city).toHaveValue("Đà Nẵng");
  await expect(city).toHaveAttribute("data-selected", "Đà Nẵng");
  await expect(page.getByRole("listbox")).toBeHidden();
});
```

Giải thích:

- `getByRole("combobox", { name: "Điểm đến" })`: tên truy cập lấy từ nhãn "Điểm đến".
- `fill("da")` điền chữ và kích hoạt sự kiện `input`, đủ để lọc danh sách. Gõ "da" ra "Đà Nẵng" và "Đà Lạt" vì lab bỏ dấu khi so khớp.
- `getByRole("listbox").getByRole("option")` thu hẹp vào khung gợi ý. **Đừng viết `page.getByRole("option")` một mình**: trang còn có hai `<select>` native (Người lớn, Số phòng) và `<option>` của chúng cũng mang role `option`, nên bạn sẽ nhận về cả chục phần tử không liên quan.
- Thuộc tính `data-selected` của lab chỉ có giá trị khi người dùng **thật sự chọn một gợi ý**. Ô chứa chữ "Đà Nẵng" chưa chắc đã là "đã chọn"; điểm này quan trọng ở Bước 8.

Kết quả mong đợi: sau khi bấm gợi ý, ô nhập ghi "Đà Nẵng" và danh sách đóng.

### Bước 7. Combobox: chọn bằng bàn phím `ArrowDown` + `Enter`

Mục đích: mô phỏng người dùng không dùng chuột, đồng thời kiểm tra hành vi bàn phím của combobox.

```ts
test("combobox: bàn phím", async ({ page }) => {
  await openHotel(page);
  const city = page.getByRole("combobox", { name: "Điểm đến" });

  await city.pressSequentially("hue");      // gõ từng phím
  await city.press("ArrowDown");            // di chuyển xuống một dòng
  await expect(page.getByRole("option", { name: "Huế" })).toHaveAttribute("aria-selected", "true");
  await city.press("Enter");                // chọn dòng đang tô sáng
  await expect(city).toHaveValue("Huế");
  await expect(page.getByRole("listbox")).toBeHidden();

  await city.fill("xyz");                   // không có gợi ý nào
  await expect(page.getByTestId("city-empty")).toHaveText("Không có thành phố phù hợp");
  await city.press("Escape");               // đóng danh sách
  await expect(page.getByRole("listbox")).toBeHidden();
});
```

Giải thích:

- `pressSequentially("hue")` gõ từng ký tự (có thể thêm `{ delay: 100 }`), khác `fill` là điền một lần. Dùng khi ứng dụng phản ứng theo từng phím (gợi ý tìm kiếm có debounce, mask).
- `press("ArrowDown")` gửi một phím. Tên phím theo chuẩn: `ArrowDown`, `ArrowUp`, `Enter`, `Escape`, `Tab`.
- `aria-selected="true"` trên option là cách chuẩn để biết dòng nào đang được tô sáng. Kiểm tra nó giúp bạn chắc `Enter` sẽ chọn đúng dòng.
- Trường hợp không có gợi ý, lab hiện dòng `city-empty`. Đây là một test case quan trọng: danh sách rỗng không được làm ứng dụng treo hoặc chọn bừa.

Kết quả mong đợi: "hue" ra duy nhất "Huế"; `ArrowDown` tô sáng; `Enter` chọn; ô nhập ghi "Huế".

### Bước 8. Gõ chữ mà không chọn gợi ý: bẫy của combobox

Mục đích: hiểu vì sao `fill` một mình chưa đủ.

```ts
test("gõ đủ chữ nhưng chưa chọn gợi ý thì báo lỗi", async ({ page }) => {
  await openHotel(page);
  await page.getByRole("combobox", { name: "Điểm đến" }).fill("Hà Nội"); // chưa bấm gợi ý
  await page.getByLabel("Nhận phòng").click();
  await page.getByRole("button", { name: "12/03/2026" }).click();
  await page.getByRole("button", { name: "15/03/2026" }).click();
  await page.getByRole("button", { name: "Tìm khách sạn" }).click();
  await expect(page.getByTestId("search-error")).toHaveText("Vui lòng chọn một thành phố trong danh sách");
});
```

Giải thích: ô nhập chứa đúng chữ "Hà Nội" nhưng ứng dụng yêu cầu người dùng **chọn** một mục trong danh sách. Test này chính là một ca kiểm thử nghiệp vụ. Bài học thực tế: với combobox, bước chuẩn gồm hai thao tác (gõ để lọc, rồi chọn dòng). Khi test chỉ cần chọn thành phố để đi tiếp, hãy gói thành hàm dùng lại:

```ts
async function pickCity(page: Page, city: string) {
  await page.getByRole("combobox", { name: "Điểm đến" }).fill(city);
  await page.getByRole("option", { name: city, exact: true }).click();
}
```

`exact: true` cần thiết vì "Đà" khớp "Đà Nẵng" lẫn "Đà Lạt", còn "Hà Nội" thì khớp một phần với nhiều chữ khác nếu danh sách mở rộng sau này.

### Bước 9. Checkbox: `check`, `uncheck`, `setChecked`, `toBeChecked`

Mục đích: bật các tiện nghi trong bộ lọc sau khi tìm khách sạn.

```ts
test("checkbox tiện nghi", async ({ page }) => {
  await openHotel(page);
  await pickCity(page, "Hà Nội");
  await page.getByLabel("Nhận phòng").click();
  await page.getByRole("button", { name: "12/03/2026" }).click();
  await page.getByRole("button", { name: "15/03/2026" }).click();
  await page.getByRole("button", { name: "Tìm khách sạn" }).click();

  const wifi = page.getByRole("checkbox", { name: "Wifi miễn phí" });
  await expect(wifi).not.toBeChecked();

  await wifi.check();
  await expect(wifi).toBeChecked();

  await wifi.uncheck();
  await expect(wifi).not.toBeChecked();

  await wifi.setChecked(true);   // đưa về trạng thái mong muốn
  await wifi.setChecked(true);   // gọi lại không đổi gì
  await expect(wifi).toBeChecked();

  const group = page.getByRole("group", { name: "Tiện nghi" });
  await group.getByRole("checkbox", { name: "Hồ bơi" }).check();
  await expect(group.getByRole("checkbox", { checked: true })).toHaveCount(2);
});
```

Giải thích:

| Lệnh | Ý nghĩa |
|------|---------|
| `check()` | Đảm bảo checkbox được bật; nếu đã bật thì không làm gì |
| `uncheck()` | Đảm bảo checkbox được tắt |
| `setChecked(boolean)` | Đưa về trạng thái cho trước; hữu ích khi trạng thái mong muốn nằm trong biến hoặc dữ liệu test |
| `toBeChecked()` | Kiểm tra đang bật; có thể truyền `{ checked: false }` hoặc dùng `.not` |
| `getByRole("group", { name: "Tiện nghi" })` | Vùng `fieldset` có `legend` "Tiện nghi"; dùng để thu hẹp phạm vi |
| `getByRole("checkbox", { checked: true })` | Lọc các checkbox đang bật (hữu ích để đếm) |

Kết quả mong đợi: danh sách kết quả tự cập nhật mỗi lần bật/tắt (với Wifi và Hồ bơi, lab hiện "5 khách sạn tại Hà Nội").

Nếu gặp lỗi: `locator.check: Clicking the checkbox did not change its state` nghĩa là ứng dụng đã chặn hoặc đảo trạng thái sau khi bấm. Đó thường là **bug thật của ứng dụng**, không phải lỗi của test.

### Bước 10. Nhóm radio: chọn theo tên và đọc radio đang được chọn

Mục đích: chọn hạng sao tối thiểu và đảm bảo chỉ một radio được chọn.

```ts
test("radio hạng sao", async ({ page }) => {
  // ... dùng lại các bước mở lab và tìm kiếm Hà Nội 12 đến 15/03
  const four = page.getByRole("radio", { name: "4 sao trở lên" });

  await four.check();
  await expect(four).toBeChecked();
  await expect(page.getByRole("radio", { name: "Tất cả" })).not.toBeChecked();

  await expect(page.getByRole("radio", { checked: true })).toHaveCount(1);
  await expect(page.getByRole("radio", { checked: true })).toHaveAccessibleName("4 sao trở lên");
  await expect(page.getByTestId("result-count")).toHaveText("7 khách sạn tại Hà Nội");
});
```

Giải thích:

- Trong nhóm radio, mỗi lựa chọn là một phần tử riêng: chọn bằng `getByRole("radio", { name })`. Tên lấy từ nhãn bao quanh.
- Sau khi chọn radio khác, radio cũ tự hết chọn. Dòng `toHaveCount(1)` trên `{ checked: true }` bảo vệ đúng điều đó: có đúng một radio đang chọn.
- `toHaveAccessibleName(...)` kiểm tra tên của radio đang chọn, nên ta biết **radio nào** đang bật mà không cần đọc thuộc tính.
- `check()` trên radio đã chọn không báo lỗi; còn `uncheck()` trên radio sẽ báo lỗi vì không thể bỏ chọn radio trực tiếp.

Kết quả mong đợi: chỉ radio "4 sao trở lên" được chọn và danh sách còn 7 khách sạn.

Với LAB-02 (shadcn), cú pháp y hệt: `page.getByRole("radio", { name: "Nữ" }).check()`. Xem mục "Lưu ý với shadcn/Base UI" bên dưới để hiểu vì sao phải dùng `getByRole`.

### Bước 11. Sắp xếp bằng select native: chọn theo nhãn, đọc theo `value`

```ts
test("sắp xếp", async ({ page }) => {
  // ... đã ở trang kết quả
  const sort = page.getByLabel("Sắp xếp");
  await sort.selectOption({ label: "Giá tăng dần" });
  await expect(sort).toHaveValue("price-asc");
  await expect(sort.locator("option:checked")).toHaveText("Giá tăng dần");
});
```

Giải thích: ở đây `value` (`price-asc`) khác nhãn ("Giá tăng dần"). Chọn theo nhãn để test đọc như yêu cầu nghiệp vụ, rồi kiểm tra cả `value` lẫn chữ hiển thị. Sau đó nên kiểm tra dữ liệu thật sự được sắp xếp (đọc `data-price` của từng thẻ, xem spec `e2e/hotel-lab.spec.ts`).

## Demo code

Test hoàn chỉnh kết hợp mọi thứ trên thành một luồng tìm khách sạn:

```ts
import { test, expect, type Page } from "@playwright/test";

async function openHotel(page: Page) {
  await page.clock.setFixedTime(new Date("2026-03-10T09:00:00"));
  await page.goto("/lab/hotel");
  await page.getByTestId("reset-data").click();
}

test("tìm khách sạn Hà Nội và lọc", async ({ page }) => {
  await openHotel(page);

  // Combobox: gõ rồi chọn đúng gợi ý
  await page.getByRole("combobox", { name: "Điểm đến" }).fill("Hà Nội");
  await page.getByRole("option", { name: "Hà Nội", exact: true }).click();

  // Hai select native
  await page.getByLabel("Người lớn").selectOption("2");
  await page.getByLabel("Số phòng").selectOption("1");

  // Chọn ngày (xem bài 2.17)
  await page.getByLabel("Nhận phòng").click();
  await page.getByRole("button", { name: "12/03/2026" }).click();
  await page.getByRole("button", { name: "15/03/2026" }).click();
  await page.getByRole("button", { name: "Tìm khách sạn" }).click();
  await expect(page.getByTestId("result-count")).toHaveText("12 khách sạn tại Hà Nội");

  // Checkbox và radio
  await page.getByRole("checkbox", { name: "Wifi miễn phí" }).check();
  await page.getByRole("checkbox", { name: "Hồ bơi" }).check();
  await page.getByRole("radio", { name: "4 sao trở lên" }).check();

  // Sắp xếp rồi đọc kết quả
  await page.getByLabel("Sắp xếp").selectOption({ label: "Giá tăng dần" });
  const prices = await page
    .getByTestId("hotel-card")
    .evaluateAll((cards) => cards.map((c) => Number(c.getAttribute("data-price"))));
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
});
```

Giải thích: bốn phần đầu là thao tác (combobox, select, ngày, tìm); phần giữa là lọc bằng checkbox và radio; phần cuối đọc giá từ thuộc tính `data-price` của từng thẻ để xác nhận thứ tự sắp xếp bằng một "oracle" độc lập (tự sắp xếp mảng rồi so sánh), thay vì chỉ tin vào giao diện.

## Thử ngay trong lab
- Mở `/labs/hotel` đọc Business Rules, rồi mở `/lab/hotel` để thực hành. Gõ "da", bấm `ArrowDown`, quan sát dòng nào có `aria-selected="true"`, rồi nhấn `Enter`.
- Gõ "Hà Nội" nhưng **không** chọn gợi ý, chọn ngày rồi bấm **Tìm khách sạn**: quan sát thông báo lỗi.
- Bật lần lượt các checkbox **Tiện nghi** và theo dõi số khách sạn giảm dần (các tiện nghi kết hợp theo AND).
- Mở `/lab/forms`, so sánh **Quốc gia (select native)** với **Thành phố (select tuỳ biến)**: một cái dùng `selectOption`, cái kia phải mở rồi chọn `option`. Dùng DevTools xem hai cấu trúc DOM khác nhau.

## Lưu ý với shadcn/Base UI
Radio, checkbox và switch của shadcn (dựa trên Base UI) có một phần tử trông như checkbox (`span role="checkbox"`) và một `input` ẩn đi kèm. Vì vậy:

- `getByLabel("Đọc sách")` ở LAB-02 khớp **hai** phần tử và gây lỗi strict mode. Dùng `getByRole("checkbox", { name: "Đọc sách" })`.
- `check()`, `uncheck()`, `toBeChecked()` đều chạy đúng trên phần tử `role="checkbox"` hoặc `role="radio"` của shadcn.
- Với radio của shadcn, `getByRole("radio", { name: "Nam" }).click()` cũng được; `check()` cũng hợp lệ.
- Dropdown `Select` của shadcn không có `<select>` thật để dùng `selectOption`: bấm nút mở (`getByTestId("city")` hoặc `getByRole("combobox")`), rồi chọn `getByRole("option", { name })`.
- Ngược lại, lab hotel dùng input và select **native** nên `getByLabel` vẫn an toàn cho select (một phần tử khớp); checkbox và radio vẫn nên dùng `getByRole` để thống nhất cách viết.

## Lỗi thường gặp

**1. `Error: Element is not a <select> element`**
Nguyên nhân: gọi `selectOption` trên dropdown tuỳ biến (shadcn Select, Material UI...). Cách sửa: bấm phần tử mở danh sách rồi `getByRole("option", { name }).click()`.

**2. `strict mode violation: getByRole('option') resolved to 13 elements`**
Nguyên nhân: `<option>` của các select native trong trang cũng mang role `option`. Cách sửa: thu hẹp vào listbox, `page.getByRole("listbox").getByRole("option", { name })`.

**3. `strict mode violation: getByLabel('Đọc sách') resolved to 2 elements`**
Nguyên nhân: checkbox/radio của shadcn có phần tử hiển thị và `input` ẩn. Cách sửa: `getByRole("checkbox", { name: "Đọc sách" })`.

**4. `locator.click: Timeout ... waiting for getByRole('option', { name: 'Đà Nẵng' })`**
Nguyên nhân: danh sách chưa mở (quên `click()` mở), chưa gõ chữ để gợi ý xuất hiện, hoặc tên option khác chữ bạn nghĩ (khoảng trắng, dấu). Cách sửa: kiểm tra trong trace dòng thật sự hiển thị; mở danh sách trước; dùng `exact: true` khi tên là tiền tố của tên khác.

**5. Điền xong ô autocomplete nhưng "chưa chọn"**
Triệu chứng: bấm **Tìm khách sạn** thì báo "Vui lòng chọn một thành phố trong danh sách". Nguyên nhân: `fill` chỉ điền chữ, ứng dụng yêu cầu chọn một gợi ý. Cách sửa: thêm bước bấm option hoặc `ArrowDown` + `Enter`.

**6. `locator.uncheck: Cannot uncheck radio button`**
Nguyên nhân: radio không thể bỏ chọn trực tiếp. Cách sửa: chọn radio khác trong cùng nhóm (ví dụ "Tất cả").

**7. Danh sách đóng trước khi kịp bấm**
Triệu chứng: thỉnh thoảng `click` vào option báo `element is not stable` hoặc `detached`. Nguyên nhân: ô nhập mất focus (blur) đóng danh sách, hoặc danh sách vẽ lại khi gợi ý đến muộn. Cách sửa: dùng locator tìm lại sau mỗi lần lọc, và chờ một assertion như `toHaveText([...])` trên listbox trước khi bấm.

## Tóm tắt
- `<select>` native dùng `selectOption` (value, label, index, mảng); dropdown tuỳ biến thì bấm mở rồi chọn `getByRole("option")`.
- Combobox gồm role `combobox`, `listbox`, `option`; luôn thu hẹp `option` vào `listbox` để tránh khớp nhầm `<option>` native.
- Autocomplete cần hai thao tác: gõ để lọc, rồi chọn (chuột, hoặc `ArrowDown` + `Enter`); kiểm tra `aria-selected` trước khi nhấn `Enter`.
- `check`, `uncheck`, `setChecked` đảm bảo trạng thái mong muốn; radio chỉ `check` được; kiểm tra bằng `toBeChecked`.
- Đọc giá trị bằng `toHaveValue`, `toHaveValues`, `inputValue`; với dropdown tuỳ biến thì kiểm tra chữ hiển thị.
- Checkbox/radio của shadcn dùng `getByRole`, không dùng `getByLabel`.

## Bài tập
1. **Select native.** Trên `/lab/hotel`, chọn 3 người lớn và 2 phòng bằng ba cách khác nhau (value, label, index). Xong khi `toHaveValue` của hai select đúng và test chạy xanh 3 lần liên tiếp.
2. **Combobox.** Chọn "Phú Quốc" hai lần: một lần bằng chuột, một lần chỉ bằng bàn phím. Xong khi ô **Điểm đến** có giá trị "Phú Quốc", listbox đã đóng, và bạn có test riêng cho trường hợp gõ "xyz" (không có gợi ý).
3. **Checkbox và radio.** Tìm khách sạn Hà Nội 12 đến 15/03, bật Wifi, Hồ bơi, Bữa sáng rồi đếm số thẻ còn lại; sau đó chọn radio "5 sao". Xong khi số thẻ khớp `result-count` và chỉ một radio ở trạng thái `checked`.
4. **Oracle sắp xếp.** Với từng cách sắp xếp (giá tăng, giá giảm, đánh giá), đọc `data-price` hoặc `data-rating` của các thẻ và so với mảng tự sắp xếp. Xong khi ba kiểu sắp xếp đều được kiểm chứng bằng dữ liệu, không chỉ bằng nhãn.
5. **So sánh native và tuỳ biến.** Trên `/lab/forms`, viết hàm `chooseCountry(page, label)` dùng `selectOption` và `chooseCity(page, name)` dùng cách mở rồi chọn. Xong khi cả hai hàm hoạt động và bạn giải thích được vì sao hai hàm khác nhau.
