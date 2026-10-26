---
title: Dialog, popup, tab mới và iframe
level: 2
order: 10
minutes: 45
summary: Xử lý alert/confirm/prompt, tab mới, iframe và tải xuống tệp bằng LAB-13 Playground.
keywords: [playwright handle dialog, frameLocator, new tab playwright]
---

## Mục tiêu bài học
- Phân biệt dialog của trình duyệt (`alert`, `confirm`, `prompt`) với modal trong trang và biết cách xử lý từng loại.
- Bắt được tab mới (popup) và thao tác trên đó bằng đối tượng `Page` thứ hai.
- Thao tác với phần tử nằm trong `iframe` bằng `frameLocator`.
- Bắt sự kiện tải xuống và kiểm tra tên tệp, nội dung.

## Bạn cần chuẩn bị
- Đã học bài 2.5 (locator), 2.7 (actions), 2.8 (assertion) và 2.9 (auto-wait).
- Site lab chạy được. Bài dùng `/lab/playground` (LAB-13) cho dialog, tab mới, iframe, tải xuống; `/lab/todo` (LAB-04) cho modal trong trang; trang `/stats` của site cho `confirm` thật.

## Kiến thức cần nắm
- **Dialog của trình duyệt** (`alert`, `confirm`, `prompt`, và `beforeunload`): do trình duyệt vẽ, nằm ngoài DOM, bắt bằng sự kiện `page.on("dialog")` hoặc `page.once("dialog")`.
- **Modal trong trang**: do HTML/CSS vẽ, có trong DOM, dùng locator bình thường (`getByRole("dialog")`).
- **Popup / tab mới**: là một `Page` mới; bắt bằng `page.waitForEvent("popup")` hoặc `context.waitForEvent("page")`.
- **iframe**: trang con nhúng bên trong trang; dùng `page.frameLocator(...)` để tìm phần tử bên trong.
- **Tải xuống**: `page.waitForEvent("download")`, kiểm tra bằng `download.suggestedFilename()`.

## Giải thích dễ hiểu
Dialog của trình duyệt là **người lạ gõ cửa giữa buổi họp**: mọi thứ phải dừng cho đến khi bạn trả lời (đồng ý hay từ chối). Playwright cho bạn một "lễ tân" là hàm xử lý sự kiện `dialog`. Điểm cần nhớ: nếu **không có lễ tân nào đăng ký**, Playwright tự động bấm "Cancel/Dismiss" thay bạn để test không bị treo. Nhưng nếu bạn đăng ký lễ tân mà hàm đó **không** gọi `accept()` hay `dismiss()`, trang sẽ đứng chờ mãi và test hết giờ.

Tab mới là **một căn phòng khác**: khi bấm liên kết `target="_blank"`, trình duyệt mở tab mới, nhưng biến `page` trong test của bạn vẫn trỏ vào phòng cũ. Bạn phải lấy được `Page` mới rồi thao tác trên đó. Vì tab mở ra bất đồng bộ, bạn phải **đăng ký chờ trước, bấm sau** (hoặc bấm và chờ trong cùng một `Promise.all`).

iframe là **cửa sổ nhìn vào căn nhà khác**: tài liệu bên trong tách biệt với tài liệu ngoài, nên `page.getByLabel(...)` không thấy phần tử bên trong. Bạn phải nói rõ "tìm bên trong khung này" bằng `frameLocator`.

## Thực hành từng bước

Tất cả các bước dùng `/lab/playground` trừ khi nói khác. Tạo file `tests/dialog-popup-iframe.spec.ts`.

### Bước 1. Khung test và mở Playground

```ts
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/playground");
});
```

| Phần | Ý nghĩa |
|------|---------|
| `test.beforeEach` | Mỗi test đều mở lại Playground, trang mới nguyên trạng thái |
| `"/lab/playground"` | Ghép với `baseURL` trong config |

Kết quả mong đợi: chưa có gì chạy; các bước sau thêm test vào file này.

### Bước 2. Xử lý `confirm` (đồng ý và từ chối)

Mục đích: bấm "Hiện confirm", trả lời đồng ý, rồi trả lời từ chối, và kiểm tra kết quả hiển thị.

```ts
test("confirm: đồng ý rồi huỷ", async ({ page }) => {
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Hiện confirm" }).click();
  await expect(page.getByTestId("confirm-result")).toHaveText("Đồng ý");

  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Hiện confirm" }).click();
  await expect(page.getByTestId("confirm-result")).toHaveText("Huỷ");
});
```

| Dòng | Giải thích |
|------|-----------|
| `page.once("dialog", handler)` | Đăng ký hàm xử lý chạy **đúng một lần** khi có dialog tiếp theo, rồi tự gỡ |
| `dialog.accept()` | Bấm OK |
| `dialog.dismiss()` | Bấm Cancel (hoặc đóng) |
| Thứ tự | Đăng ký **trước** lệnh `click()` gây ra dialog; đăng ký sau thì dialog đã bị tự động từ chối |

Kết quả mong đợi: test xanh; `confirm-result` đổi từ "Chưa chọn" sang "Đồng ý" rồi "Huỷ".

Nếu gặp lỗi: kết quả luôn là "Huỷ" dù bạn gọi `accept()` nghĩa là bạn đăng ký sau khi bấm; chuyển dòng `page.once` lên trước `click()`.

### Bước 3. Đọc nội dung dialog và trả lời `prompt`

Mục đích: kiểm tra câu hỏi hiển thị và nhập giá trị cho `prompt`.

```ts
test("prompt: kiểm tra câu hỏi và nhập tên", async ({ page }) => {
  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("prompt");
    expect(dialog.message()).toBe("Nhập tên của bạn");
    expect(dialog.defaultValue()).toBe("Khách");
    await dialog.accept("Lan");
  });
  await page.getByRole("button", { name: "Hiện prompt" }).click();
  await expect(page.getByTestId("prompt-result")).toHaveText("Lan");
});
```

| Hàm | Trả về |
|-----|--------|
| `dialog.type()` | `"alert"`, `"confirm"`, `"prompt"` hoặc `"beforeunload"` |
| `dialog.message()` | Nội dung câu hỏi |
| `dialog.defaultValue()` | Giá trị gợi ý của prompt (ở đây "Khách") |
| `dialog.accept("Lan")` | Bấm OK và nhập chữ "Lan" vào ô |

Kết quả mong đợi: `prompt-result` hiển thị "Lan". Hàm xử lý là `async` vì `accept` trả về Promise; hãy `await` nó.

### Bước 4. `alert` và cách chờ thông điệp

Mục đích: xử lý `alert` (chỉ có nút OK) và ghi lại nội dung.

```ts
test("alert: ghi lại nội dung rồi đóng", async ({ page }) => {
  const messages: string[] = [];
  page.on("dialog", async (dialog) => {
    messages.push(dialog.message());
    await dialog.accept();
  });

  await page.getByRole("button", { name: "Hiện alert" }).click();
  await expect.poll(() => messages).toEqual(["Xin chào từ alert"]);
});
```

| Dòng | Giải thích |
|------|-----------|
| `page.on("dialog", ...)` | Đăng ký **lâu dài** (khác `once`): chạy cho mọi dialog về sau trong test này |
| `messages.push(...)` | Gom nội dung để kiểm tra sau |
| `expect.poll(() => messages)` | Chờ mảng có giá trị mong đợi (xem bài 2.8) |

Kết quả mong đợi: test xanh. Nếu bạn bỏ cả `page.on` thì Playwright tự dismiss alert, test vẫn chạy nhưng bạn không kiểm tra được nội dung.

### Bước 5. Modal trong trang khác dialog trình duyệt

Mục đích: tránh nhầm. Ở LAB-04, "Xoá" mở hộp xác nhận **trong trang**.

```ts
test("LAB-04: hộp xác nhận xoá là modal trong trang", async ({ page }) => {
  await page.goto("/lab/todo");
  await page.getByTestId("reset-data").click();
  await page.getByLabel("Công việc mới").fill("Mua sữa");
  await page.getByRole("button", { name: "Thêm", exact: true }).click();

  // Không cần page.on("dialog"): đây là HTML thường
  await page.getByRole("button", { name: "Xoá Mua sữa" }).click();
  await expect(page.getByRole("dialog")).toContainText("Bạn sắp xoá");
  await page.getByRole("button", { name: "Xoá hẳn" }).click();
  await expect(page.getByTestId("todo-empty")).toBeVisible();
});
```

Cách phân biệt nhanh: nếu bạn có thể bấm chuột phải "Inspect" vào hộp thoại và thấy nó trong cây DOM, đó là modal HTML (dùng locator). Nếu không inspect được, đó là dialog của trình duyệt (dùng sự kiện `dialog`).

Kết quả mong đợi: test xanh mà không có `page.on("dialog")`.

### Bước 6. `confirm` thật trên trang `/stats`

Mục đích: áp dụng vào trang thật của site (nút "Xoá dữ liệu" dùng `window.confirm`).

```ts
test("trang thống kê: xoá dữ liệu cần xác nhận", async ({ page }) => {
  await page.goto("/stats");
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("Xoá toàn bộ lịch sử học");
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Xoá dữ liệu" }).click();
});
```

Kết quả mong đợi: test xanh. Nếu muốn kiểm tra thêm sau khi xoá, hãy dùng assertion trên nội dung trang.

### Bước 7. Tab mới (popup)

Mục đích: bấm liên kết mở tab mới và thao tác trên tab đó.

```ts
test("liên kết trợ giúp mở ở tab mới", async ({ page }) => {
  const [popup] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByRole("link", { name: "Mở trang trợ giúp" }).click(),
  ]);

  await expect(popup).toHaveURL(/\/lab\/playground\/help/);
  await expect(popup.getByRole("heading", { name: "Trang trợ giúp" })).toBeVisible();

  await popup.close();
  await expect(page.getByRole("link", { name: "Mở trang trợ giúp" })).toBeVisible();
});
```

| Dòng | Giải thích |
|------|-----------|
| `Promise.all([...])` | Chạy hai việc đồng thời: bắt đầu chờ sự kiện, rồi bấm |
| `page.waitForEvent("popup")` | Chờ trang con do `page` này mở ra |
| `const [popup] = ...` | Lấy phần tử đầu của mảng kết quả: chính là `Page` mới |
| `popup.getByRole(...)` | Mọi thao tác trên tab mới đi qua `popup`, không phải `page` |
| `popup.close()` | Đóng tab mới; `page` cũ vẫn dùng được |

Kết quả mong đợi: test xanh. Thay `page.waitForEvent("popup")` bằng `page.context().waitForEvent("page")` cũng được; cách sau bắt **mọi** trang mới trong context, kể cả không do `page` này mở.

Nếu gặp lỗi: `Test timeout ... waiting for event "popup"` nghĩa là liên kết không mở tab mới (thiếu `target="_blank"`) hoặc bạn bấm trước khi đăng ký chờ.

### Bước 8. Thao tác trong iframe

Mục đích: điền số thẻ và bấm thanh toán trong khung "iframe thanh toán".

```ts
test("iframe thanh toán: biên 11 và 12 chữ số", async ({ page }) => {
  const frame = page.frameLocator('[data-testid="payment-frame"]');

  await frame.getByLabel("Số thẻ").fill("12345678901");
  await frame.getByRole("button", { name: "Thanh toán" }).click();
  await expect(frame.getByRole("status")).toHaveText("Số thẻ không hợp lệ");

  await frame.getByLabel("Số thẻ").fill("123456789012");
  await frame.getByRole("button", { name: "Thanh toán" }).click();
  await expect(frame.getByRole("status")).toHaveText("Thanh toán thành công");
});
```

| Dòng | Giải thích |
|------|-----------|
| `page.frameLocator(selector)` | Trỏ vào iframe khớp selector; từ đó gọi `getByLabel`, `getByRole`... như bình thường |
| `'[data-testid="payment-frame"]'` | Selector CSS chọn iframe theo `data-testid` |
| `frame.getByRole("status")` | Phần tử có `role="status"` bên trong khung |

Kết quả mong đợi: test xanh; 11 chữ số bị từ chối, 12 chữ số thành công. Đây là biên (BVA) của quy tắc số thẻ.

Nếu gặp lỗi: `locator.fill: Timeout` kèm "waiting for getByLabel('Số thẻ')" thường do gọi `page.getByLabel` thay vì `frame.getByLabel`.

### Bước 9. Tải xuống tệp

Mục đích: bấm nút tải về và kiểm tra tên tệp và nội dung.

```ts
import { readFile } from "node:fs/promises";

test("tải tệp ghi chú", async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Tải tệp ghi chú" }).click(),
  ]);

  expect(download.suggestedFilename()).toBe("ghi-chu.txt");

  const path = await download.path();
  const content = await readFile(path, "utf-8");
  expect(content).toContain("Ghi chú từ Playwright Lab");
});
```

| Dòng | Giải thích |
|------|-----------|
| `waitForEvent("download")` | Chờ trình duyệt bắt đầu tải |
| `download.suggestedFilename()` | Tên tệp do trang đề xuất (`a.download`) |
| `download.path()` | Đường dẫn tệp tạm Playwright lưu; có thể dùng `download.saveAs("out/ghi-chu.txt")` để lưu chỗ cố định |
| `readFile(...)` | Đọc nội dung tệp bằng Node (không phải trong trang) |

Kết quả mong đợi: test xanh. Dòng `import` đặt ở đầu file cùng các import khác.

## Demo code

Tổng hợp thành một file chạy được:

```ts
import { test, expect } from "@playwright/test";

test.describe("LAB-13 Playground", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/playground");
  });

  test("confirm đồng ý", async ({ page }) => {
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Hiện confirm" }).click();
    await expect(page.getByTestId("confirm-result")).toHaveText("Đồng ý");
  });

  test("prompt nhập tên", async ({ page }) => {
    page.once("dialog", (d) => d.accept("Lan"));
    await page.getByRole("button", { name: "Hiện prompt" }).click();
    await expect(page.getByTestId("prompt-result")).toHaveText("Lan");
  });

  test("tab mới", async ({ page }) => {
    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("link", { name: "Mở trang trợ giúp" }).click(),
    ]);
    await expect(popup.getByRole("heading", { name: "Trang trợ giúp" })).toBeVisible();
  });

  test("iframe", async ({ page }) => {
    const frame = page.frameLocator('[data-testid="payment-frame"]');
    await frame.getByLabel("Số thẻ").fill("123456789012");
    await frame.getByRole("button", { name: "Thanh toán" }).click();
    await expect(frame.getByRole("status")).toHaveText("Thanh toán thành công");
  });

  test("tải xuống", async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Tải tệp ghi chú" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("ghi-chu.txt");
  });
});
```

Mẫu chung của hai loại sự kiện: **đăng ký trước, kích hoạt sau** (dialog dùng `once`, popup và download dùng `Promise.all`).

## Thử ngay trong lab
- `/lab/playground` (LAB-13): làm lần lượt các mục "Hộp thoại của trình duyệt", "Mở tab mới", "iframe thanh toán", "Tải xuống tệp". Thử bấm thủ công trước để thấy dialog thật, rồi mới viết test.
- `/lab/todo` (LAB-04): so sánh hộp xác nhận "Xoá công việc?" (modal trong trang) với `confirm` của Playground để thấy hai cơ chế khác nhau.
- `/lab/pay` (LAB-20): iframe thanh toán kiểu Stripe, bài tập nâng cao sau khi nắm `frameLocator`.

## Lỗi thường gặp
- Triệu chứng: kết quả luôn là "Huỷ" hoặc giá trị mặc định dù bạn gọi `accept()`. Nguyên nhân: đăng ký `page.once("dialog")` sau lệnh `click()`; Playwright đã tự dismiss dialog. Sửa: đăng ký trước khi bấm.
- Triệu chứng: `Test timeout of 30000ms exceeded` khi bấm nút gây dialog. Nguyên nhân: có handler `dialog` nhưng không gọi `accept()` hay `dismiss()` nên trang đứng chờ. Sửa: mọi nhánh trong handler phải gọi một trong hai.
- Triệu chứng: `waiting for event "popup"` rồi hết giờ. Nguyên nhân: không có tab mới thật sự, hoặc bấm trước khi chờ. Sửa: dùng `Promise.all` như bước 7 và kiểm tra liên kết có `target="_blank"`.
- Triệu chứng: sau khi bấm, `page.getByRole(...)` vẫn trả về phần tử của trang cũ trong khi bạn muốn thao tác tab mới. Nguyên nhân: quên rằng popup là `Page` khác. Sửa: dùng biến `popup`.
- Triệu chứng: `locator.fill: Timeout` trong khi phần tử rõ ràng hiện trên màn hình. Nguyên nhân: phần tử nằm trong iframe mà bạn tìm bằng `page.getBy...`. Sửa: dùng `frameLocator`.
- Triệu chứng: `download.path()` trả về lỗi hoặc tệp biến mất sau test. Nguyên nhân: tệp tạm bị xoá khi context đóng. Sửa: đọc ngay trong test hoặc `download.saveAs(...)`.

## Tóm tắt
- Dialog của trình duyệt dùng `page.once("dialog", ...)` đăng ký trước khi bấm; modal trong trang dùng locator.
- Không có handler thì Playwright tự dismiss; có handler thì bạn phải `accept()` hoặc `dismiss()`.
- Tab mới là `Page` khác: `const [popup] = await Promise.all([page.waitForEvent("popup"), click])`.
- iframe cần `frameLocator`, tìm bên trong như locator thông thường.
- Tải xuống dùng `waitForEvent("download")` rồi kiểm tra `suggestedFilename()` và nội dung.

## Bài tập
1. (Dễ) Ở `/stats`, bấm "Xoá dữ liệu" và chấp nhận dialog xác nhận bằng code. Xong khi test xanh và bạn kiểm tra được nội dung câu hỏi bằng `dialog.message()`.
2. (Dễ) Ở LAB-13, viết test `prompt` nhập tên "Lan" rồi nhập rỗng (nhấn huỷ bằng `dismiss()`) và kiểm tra `prompt-result` hiển thị "(bỏ qua)". Xong khi cả hai nhánh có assertion.
3. (Vừa) Viết test mở tab trợ giúp, kiểm tra tiêu đề rồi đóng tab, quay lại `page` cũ và bấm tiếp một nút. Xong khi test xanh.
4. (Vừa) Viết test iframe với hai giá trị biên 11 và 12 chữ số, dùng vòng lặp `for...of` với mảng `[số thẻ, thông báo]`. Xong khi cả hai trường hợp được kiểm tra trong một test.
5. (Khó) Viết test tải tệp, lưu bằng `download.saveAs`, đọc lại nội dung và so sánh. Xong khi tệp được lưu vào thư mục cố định và thư mục đó nằm trong `.gitignore`.
