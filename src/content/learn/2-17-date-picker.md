---
title: "Chọn ngày: date picker"
level: 2
order: 17
minutes: 60
summary: Ba kiểu chọn ngày (input type date, ô text có mask, lịch tuỳ biến), tính ngày tương đối nhưng cố định hôm nay bằng page.clock.setFixedTime, xử lý biên tháng, năm nhuận, múi giờ và các lỗi thường gặp.
keywords: [playwright date picker, playwright input type date, playwright calendar, page.clock.setFixedTime, playwright chọn ngày]
---

## Mục tiêu bài học
- Nhận biết ba kiểu chọn ngày thường gặp và chọn đúng cách thao tác cho từng kiểu.
- Điền `<input type="date">` bằng `fill("yyyy-mm-dd")` và hiểu vì sao định dạng hiển thị khác định dạng giá trị.
- Mở lịch tuỳ biến, điều hướng tháng, chọn ngày bằng `aria-label` hoặc `data-testid`, chọn khoảng ngày và kiểm tra ngày bị vô hiệu.
- Tính ngày tương đối ("hôm nay cộng N ngày") trong test mà vẫn ổn định nhờ `page.clock.setFixedTime`.
- Tránh các bẫy: tháng 2 và năm nhuận, cuối tháng, múi giờ, lịch tự đóng, ngày của tháng khác.

## Bạn cần chuẩn bị
- Đã học bài 2.7 (actions), 2.8 (assertions) và bài 2.15 (dropdown, checkbox, radio, combobox).
- Site lab chạy ở `http://localhost:3000`, `baseURL` đã cấu hình trong `playwright.config.ts`.
- Ví dụ xuyên suốt: **LAB-29 Tìm & đặt phòng khách sạn** (`/lab/hotel`, mô tả ở `/labs/hotel`) có lịch nhận/trả phòng tuỳ biến; **LAB-10 Y tế: đặt lịch khám** (`/lab/clinic`) có `input type="date"`; **LAB-28 Đặt lịch theo múi giờ** (`/lab/timezone`) để thấy ảnh hưởng của múi giờ.

## Kiến thức cần nắm
- Ba kiểu: `input type="date"` (của trình duyệt), ô text kèm mask (`dd/mm/yyyy`), lịch tuỳ biến (nút bấm trong một khung lịch).
- `fill("2026-03-03")` cho `type="date"`: **luôn dùng định dạng ISO `yyyy-mm-dd`**, bất kể trình duyệt hiển thị thế nào.
- Lịch tuỳ biến: bấm ô mở lịch, bấm nút tháng trước/sau, bấm nút của ngày (thường là `button` có `aria-label` hoặc `data-testid`).
- `page.clock.setFixedTime(date)`: đóng băng "bây giờ" để mọi phép tính "hôm nay" ra cùng kết quả.
- Ngày vô hiệu: `toBeDisabled()`, `getByRole("button", { disabled: true })`.
- Biên: cuối tháng, tháng 2, năm nhuận, đổi năm; múi giờ (`timezoneId`) và locale.

## Giải thích dễ hiểu

### Vì sao chọn ngày là phần "khó chịu" của kiểm thử
Chọn ngày nhìn có vẻ đơn giản nhưng gây rắc rối cho test vì ba lý do:

1. **Giao diện rất đa dạng.** Cùng một việc "chọn 12/03/2026" nhưng có trang cho gõ, có trang cho bấm lịch, có trang vừa gõ vừa bấm.
2. **Phụ thuộc "hôm nay".** Ngày vô hiệu, ngày được tô sáng, số đêm tối đa... đều tính từ ngày hiện tại. Test viết hôm nay có thể đỏ vào ngày mai nếu ta ghi cứng "ngày 12 tháng này".
3. **Nhiều biên.** Cuối tháng, năm nhuận, đổi múi giờ, nhận phòng và trả phòng cùng ngày đều là chỗ lỗi hay xuất hiện nhất. Đây cũng là chỗ tester giỏi tìm ra bug.

Lời giải gồm hai nguyên tắc: **(1) cố định "hôm nay" cho test, (2) viết test dựa trên ngày tính tương đối từ "hôm nay" cố định đó**, rồi dùng cách thao tác đúng với kiểu giao diện.

### Ba kiểu chọn ngày

| Kiểu | Nhận biết | Cách thao tác |
|------|-----------|---------------|
| `input type="date"` | Thẻ `input` có `type="date"`; trình duyệt tự vẽ ô và lịch | `fill("2026-03-03")` |
| Ô text có mask | `input` thường, tự chèn dấu `/` khi gõ, có `placeholder` như `dd/mm/yyyy` | `fill` hoặc `pressSequentially` tuỳ mask |
| Lịch tuỳ biến | Bấm vào ô thì hiện khung lịch gồm các nút ngày | Mở lịch, điều hướng tháng, bấm nút ngày |

### Giá trị và hiển thị là hai chuyện khác nhau
Ô `type="date"` có thể **hiển thị** `03/03/2026` (ở máy tiếng Anh Mỹ là `03/03/2026`, ở máy khác là `3/3/2026`), nhưng **giá trị** (`value`) luôn là chuỗi ISO `2026-03-03`. Playwright làm việc với giá trị này, nên bạn viết `fill("2026-03-03")` và đọc lại `toHaveValue("2026-03-03")` mà không phải lo trình duyệt đang hiển thị thế nào. Đây là điểm khiến `type="date"` dễ test hơn mọi kiểu khác.

## Thực hành từng bước

### Bước 1. `input type="date"`: `fill` bằng định dạng ISO

Mục đích: điền ô **Ngày khám** của LAB-10 và kiểm tra giá trị.

```ts
import { test, expect } from "@playwright/test";

test("input type=date", async ({ page, context }) => {
  await context.clock.setFixedTime(new Date("2026-03-02T06:00:00Z"));
  await page.goto("/lab/clinic");
  await page.getByTestId("reset-data").click();

  const date = page.getByLabel("Ngày khám");
  await date.fill("2026-03-03");
  await expect(date).toHaveValue("2026-03-03");
  await expect(page.getByTestId("slot-10:00")).toBeEnabled();

  await date.fill("");                     // xoá ngày
  await expect(date).toHaveValue("");
});
```

Giải thích:

| Dòng | Ý nghĩa |
|------|---------|
| `context.clock.setFixedTime(...)` | Cố định "bây giờ" cho mọi trang trong context; ở đây là 02/03/2026 |
| `page.getByLabel("Ngày khám")` | Tìm ô theo nhãn; `type="date"` là một `input` thường nên `getByLabel` dùng tốt |
| `fill("2026-03-03")` | Đặt giá trị, kích hoạt sự kiện `input` và `change` để ứng dụng nhận |
| `toHaveValue("2026-03-03")` | Đọc lại **giá trị** (dạng ISO), không phải chữ hiển thị |
| `fill("")` | Xoá ngày, trả ô về trạng thái trống |

Kết quả mong đợi: khung giờ 10:00 sáng được bật sau khi chọn ngày (lab chỉ cho chọn giờ khi đã có ngày).

Nếu gặp lỗi: `Error: Malformed value` khi bạn viết `fill("03/03/2026")`. Với `type="date"` chỉ nhận `yyyy-mm-dd`. Đổi định dạng là hết lỗi.

### Bước 2. Cố định "hôm nay" bằng `page.clock.setFixedTime`

Mục đích: làm cho kết quả không phụ thuộc ngày chạy test.

```ts
async function openHotel(page: Page) {
  await page.clock.setFixedTime(new Date("2026-03-10T09:00:00"));
  await page.goto("/lab/hotel");
  await page.getByTestId("reset-data").click();
}

test("hôm nay đã cố định", async ({ page }) => {
  await openHotel(page);
  const now = await page.evaluate(() => new Date().toISOString());
  expect(now.startsWith("2026-03-10")).toBe(true);
});
```

(Nhớ thêm `import { type Page } from "@playwright/test"`.)

Giải thích:

- `setFixedTime` làm cho `Date.now()` và `new Date()` **trong trang** luôn trả về thời điểm đã cho. Nó không "đóng băng" bộ đếm giờ (`setTimeout` vẫn chạy bình thường). Muốn điều khiển cả bộ đếm giờ thì dùng `page.clock.install()` và `fastForward` (xem bài về thời gian ở lab `timezone`, `booking`).
- `new Date("2026-03-10T09:00:00")` không có hậu tố `Z`, nên được hiểu theo **múi giờ của máy chạy test**. Điều này ổn trong ví dụ này, nhưng khi quan tâm múi giờ, hãy ghi rõ `Z` hoặc đặt `timezoneId` (Bước 9).
- Gọi trước `page.goto` để trang đã nhìn thấy thời gian cố định ngay từ lúc vẽ.
- Dùng `context.clock` thay vì `page.clock` khi bạn muốn áp dụng cho mọi trang mở trong context (như ở Bước 1).

Kết quả mong đợi: lịch của lab luôn mở ở "Tháng 3 2026" và ngày 09/03/2026 trở về trước bị vô hiệu, bất kể bạn chạy test ngày nào.

### Bước 3. Mở lịch tuỳ biến và đọc trạng thái

Mục đích: làm quen cấu trúc lịch của LAB-29.

```ts
test("mở lịch", async ({ page }) => {
  await openHotel(page);
  await page.getByLabel("Nhận phòng").click();

  const cal = page.getByRole("dialog", { name: "Lịch chọn ngày" });
  await expect(cal).toBeVisible();
  await expect(page.getByTestId("cal-title")).toHaveText("Tháng 3 2026");

  await expect(cal.getByRole("button", { name: "09/03/2026" })).toBeDisabled();  // quá khứ
  await expect(cal.getByRole("button", { name: "10/03/2026" })).toBeEnabled();   // hôm nay
  await expect(cal.getByRole("button", { name: "Tháng trước" })).toBeDisabled(); // không lùi qua tháng hiện tại
});
```

Giải thích:

- Ô **Nhận phòng** là một nút (`button`) có nhãn, nên `getByLabel("Nhận phòng")` bấm vào là mở lịch.
- Lịch là `role="dialog"` có tên "Lịch chọn ngày": cách tốt nhất để thu hẹp phạm vi tìm kiếm vào đúng khung lịch.
- Mỗi ngày là một `button` có `aria-label` dạng `dd/mm/yyyy` (ví dụ `09/03/2026`) và `data-testid` dạng `day-2026-03-09`. **Hai cách đều dùng được**: `aria-label` đọc dễ với người, `data-testid` ổn định với ISO.
- Tháng hiện tại được hiện ở phần tử `cal-title`, dạng "Tháng 3 2026".

Kết quả mong đợi: tất cả assertion qua. Theo thiết kế của lab, từ 01/03 đến 09/03 bị vô hiệu (9 nút), từ 10/03 đến 31/03 dùng được (22 nút).

### Bước 4. Chọn khoảng ngày nhận phòng và trả phòng

Mục đích: chọn ngày 12 rồi 15 và kiểm tra số đêm.

```ts
test("chọn khoảng ngày", async ({ page }) => {
  await openHotel(page);
  await page.getByLabel("Nhận phòng").click();
  await page.getByRole("button", { name: "12/03/2026" }).click();   // ngày nhận
  await page.getByRole("button", { name: "15/03/2026" }).click();   // ngày trả

  await expect(page.getByTestId("calendar")).toBeHidden();          // lịch tự đóng
  await expect(page.getByTestId("checkin-btn")).toHaveText("12/03/2026");
  await expect(page.getByTestId("checkout-btn")).toHaveText("15/03/2026");
  await expect(page.getByTestId("nights")).toHaveText("3 đêm");
});
```

Giải thích:

- Lịch có **hai pha**: bấm ngày đầu là ngày nhận phòng, bấm ngày thứ hai là ngày trả phòng, rồi lịch tự đóng. Sau ngày thứ nhất, lịch vẫn mở (dòng gợi ý đổi thành "Chọn ngày trả phòng (tối đa 30 đêm)").
- Sau khi lịch đóng, hai nút **Nhận phòng** và **Trả phòng** hiển thị ngày dạng `dd/mm/yyyy`. Kiểm tra bằng `toHaveText`.
- `nights` là dòng "3 đêm": đây là kết quả tính toán, và là thứ đáng assert nhất. Thay vì chỉ tin hiển thị, kiểm tra con số có đúng bằng ngày trả trừ ngày nhận không.

Kết quả mong đợi: lịch đóng, hai nút hiện đúng ngày, số đêm là "3 đêm". Mở lại **Trả phòng**, bạn sẽ thấy ngày 12 có `data-state="checkin"`, 13 và 14 có `data-state="in-range"`, 15 có `data-state="checkout"`.

### Bước 5. Tính ngày tương đối: hôm nay cộng N

Mục đích: viết test không ghi cứng ngày, mà tính từ "hôm nay" cố định.

```ts
const TODAY = new Date("2026-03-10T09:00:00");

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);      // setDate tự cuộn sang tháng sau nếu vượt
  return d;
}
function toIso(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
function toVn(d: Date): string {
  return toIso(d).split("-").reverse().join("/");   // 2026-03-12 thành 12/03/2026
}

test("nhận phòng sau 2 ngày, ở 3 đêm", async ({ page }) => {
  await page.clock.setFixedTime(TODAY);
  await page.goto("/lab/hotel");
  await page.getByTestId("reset-data").click();

  await page.getByLabel("Nhận phòng").click();
  await page.getByRole("button", { name: toVn(addDays(TODAY, 2)) }).click();  // 12/03/2026
  await page.getByRole("button", { name: toVn(addDays(TODAY, 5)) }).click();  // 15/03/2026
  await expect(page.getByTestId("nights")).toHaveText("3 đêm");
});
```

Giải thích:

- `TODAY` được dùng **hai lần**: để cố định đồng hồ của trang và để tính ngày trong test. Hai nơi dùng cùng một hằng số nên không bao giờ lệch nhau.
- `addDays` dùng `setDate` nên tự xử lý chuyển tháng, chuyển năm và năm nhuận. Đừng tự cộng số vào chuỗi.
- `toIso` ghép năm-tháng-ngày bằng các getter **theo giờ địa phương**. Không dùng `toISOString().slice(0, 10)` vì nó đổi sang UTC và có thể ra ngày hôm trước ở múi giờ phía Đông (xem Bước 9).
- `toVn` đổi sang định dạng của `aria-label`. Nếu ứng dụng dùng định dạng khác, chỉ cần sửa đúng một hàm này.

Kết quả mong đợi: test chạy xanh vào bất kỳ ngày nào, vì trang luôn nghĩ hôm nay là 10/03/2026.

Nếu gặp lỗi: `locator.click: Timeout` khi tìm nút ngày. Nguyên nhân thường là lịch đang hiện **tháng khác** với tháng chứa ngày bạn cần; xem Bước 6.

### Bước 6. Điều hướng sang tháng khác

Mục đích: chọn ngày ở tháng sau mà không đếm cứng số lần bấm.

```ts
async function gotoMonth(page: Page, title: string) {
  const heading = page.getByTestId("cal-title");
  for (let i = 0; i < 12 && (await heading.innerText()) !== title; i++) {
    await page.getByRole("button", { name: "Tháng sau" }).click();
  }
  await expect(heading).toHaveText(title);   // xác nhận cuối cùng
}

test("chọn ngày ở tháng 6", async ({ page }) => {
  await openHotel(page);
  await page.getByLabel("Nhận phòng").click();
  await gotoMonth(page, "Tháng 6 2026");
  await page.getByTestId("day-2026-06-15").click();
  await expect(page.getByTestId("checkin-btn")).toHaveText("15/06/2026");
});
```

Giải thích:

- Vòng lặp bấm **Tháng sau** cho tới khi tiêu đề khớp, tối đa 12 lần để không lặp vô hạn nếu tiêu đề không bao giờ khớp.
- `innerText()` đọc chữ hiện tại; sau mỗi lần bấm, lịch vẽ lại nên ta đọc lại ở lần lặp kế tiếp.
- Dòng `expect(...).toHaveText` cuối cùng cho thông báo lỗi rõ ràng nếu vòng lặp kết thúc mà vẫn sai tháng.
- Trong LAB-29 bạn cũng có thể lặp cố định `n` lần khi đã biết chắc tháng đích (như spec của lab). Cách dùng tiêu đề bền hơn vì không phụ thuộc "hôm nay".

Kết quả mong đợi: ngày 15/06/2026 được chọn, nút **Nhận phòng** hiển thị `15/06/2026`.

### Bước 7. Ngày bị vô hiệu và biên của lịch

Mục đích: kiểm tra các quy tắc nghiệp vụ của lịch (BR của lab: quá khứ bị vô hiệu, tối đa 30 đêm).

```ts
test("biên 30 đêm", async ({ page }) => {
  await openHotel(page);
  await page.getByLabel("Nhận phòng").click();
  await page.getByTestId("day-2026-03-10").click();             // nhận phòng hôm nay
  await page.getByRole("button", { name: "Tháng sau" }).click();
  await expect(page.getByTestId("day-2026-04-10")).toBeDisabled();  // 31 đêm: vượt giới hạn
  await expect(page.getByTestId("day-2026-04-09")).toBeEnabled();   // 30 đêm: được
  await page.getByTestId("day-2026-04-09").click();
  await expect(page.getByTestId("nights")).toHaveText("30 đêm");
});

test("đếm ngày bị vô hiệu", async ({ page }) => {
  await openHotel(page);
  await page.getByLabel("Nhận phòng").click();
  const grid = page.getByTestId("cal-grid");
  await expect(grid.getByRole("button")).toHaveCount(31);                     // tháng 3 có 31 ngày
  await expect(grid.getByRole("button", { disabled: true })).toHaveCount(9);  // 01 đến 09/03
});
```

Giải thích:

- Kiểm tra **cả hai phía của biên**: ngày cuối cùng được phép (`04-09`, 30 đêm) và ngày đầu tiên bị cấm (`04-10`, 31 đêm). Đây là kỹ thuật phân tích giá trị biên (BVA) ở Level 3.
- `getByRole("button", { disabled: true })` lọc các nút đang bị vô hiệu; kết hợp `toHaveCount` để đếm nhanh.
- Số 31 và 9 dựa vào việc cố định hôm nay là 10/03/2026. Đổi hôm nay, đáp án đổi theo.

Kết quả mong đợi: các assertion qua. Một lỗi hay gặp ở lịch thật là biên lệch một ngày (cho chọn 31 đêm, hoặc cấm luôn ngày hôm nay). Bật thử `?bugs=BUG-01` của lab để thấy lịch cho chọn ngày trả trùng ngày nhận (0 đêm).

### Bước 8. Lịch tự đóng và đóng bằng `Escape`

Mục đích: bảo vệ test khỏi bẫy "lịch biến mất giữa chừng".

```ts
test("đóng lịch bằng Escape", async ({ page }) => {
  await openHotel(page);
  await page.getByLabel("Nhận phòng").click();
  await expect(page.getByTestId("calendar")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("calendar")).toBeHidden();
});
```

Giải thích: lịch đóng khi bạn bấm `Escape`, bấm ra ngoài vùng lịch, hoặc chọn xong ngày trả. Nếu test thao tác tiếp trong lịch sau khi nó đã đóng, ta sẽ thấy lỗi timeout ở nút ngày. Nguyên tắc: **mở lịch ngay trước khi dùng**, và sau khi chọn xong thì assert lịch đã đóng hoặc nút hiển thị đúng ngày rồi mới đi tiếp.

Kết quả mong đợi: `toBeHidden` qua.

### Bước 9. Múi giờ và "hôm nay" ở đầu ngày

Mục đích: tránh lỗi test chỉ xanh trên máy của bạn.

```ts
test.describe("máy ở Việt Nam", () => {
  test.use({ timezoneId: "Asia/Ho_Chi_Minh", locale: "vi-VN" });

  test("01:30 sáng ngày 10/03 giờ Việt Nam", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-03-09T18:30:00Z"));   // 18:30 UTC ngày 09
    await page.goto("/lab/hotel");
    const ymd = await page.evaluate(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });
    expect(ymd).toBe("2026-03-10");   // giờ địa phương đã sang ngày 10
  });
});
```

Giải thích:

- `timezoneId` ép trình duyệt chạy test ở một múi giờ cố định, không phụ thuộc máy bạn hay máy CI. `locale` ép định dạng ngày theo ngôn ngữ.
- Thời điểm `18:30Z` ngày 09 là `01:30` sáng ngày 10 ở Việt Nam (UTC+7). Nếu ứng dụng lấy "hôm nay" bằng UTC, nó sẽ nhầm là ngày 09. Đây là lỗi kinh điển của lịch đặt phòng và đặt lịch khám.
- Bài học: khi test quanh nửa đêm, luôn chọn **giờ UTC cụ thể** (có hậu tố `Z`) và `timezoneId` rõ ràng. LAB-28 (`/lab/timezone`) được viết riêng để luyện chuyện này.

Kết quả mong đợi: test qua trên mọi máy nhờ múi giờ đã được ép.

### Bước 10. Ô text có mask và ngày gõ tay

Mục đích: xử lý ô như `dd/mm/yyyy` tự chèn dấu `/`. Lab không có ô này nên ví dụ dưới tự dựng bằng `page.setContent`.

```ts
test("ô ngày có mask", async ({ page }) => {
  await page.setContent(`<label>Ngày sinh <input id="d" placeholder="dd/mm/yyyy" inputmode="numeric"></label>`);
  await page.evaluate(() => {
    const input = document.getElementById("d") as HTMLInputElement;
    input.addEventListener("input", () => {
      const digits = input.value.split("").filter((c) => c >= "0" && c <= "9").join("").slice(0, 8);
      const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter((x) => x.length > 0);
      input.value = parts.join("/");
    });
  });

  const birth = page.getByLabel("Ngày sinh");
  await birth.pressSequentially("20071995");           // gõ từng phím, mask tự chèn dấu
  await expect(birth).toHaveValue("20/07/1995");
});
```

Giải thích:

- Mask phản ứng **theo từng phím**, nên dùng `pressSequentially` để mô phỏng người gõ. Với nhiều mask, `fill("20/07/1995")` cũng chạy được vì giá trị đã đúng dạng; còn `fill("20071995")` thường cũng chạy vì mask xử lý sự kiện `input`. Hãy thử cả hai và giữ cách nào ổn định với ứng dụng của bạn.
- Luôn kết thúc bằng `toHaveValue` để chắc mask đã đưa chữ về đúng dạng.
- Khi mask của thư viện (ví dụ react-input-mask) chặn `fill`, `pressSequentially` là lựa chọn an toàn.

Kết quả mong đợi: ô hiện `20/07/1995`.

## Demo code

Luồng tìm khách sạn hoàn chỉnh với ngày tương đối, dùng cả hàm tiện ích ở trên:

```ts
import { test, expect, type Page } from "@playwright/test";

const TODAY = new Date("2026-03-10T09:00:00");

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}
function toIso(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

async function openHotel(page: Page) {
  await page.clock.setFixedTime(TODAY);
  await page.goto("/lab/hotel");
  await page.getByTestId("reset-data").click();
}

async function pickRange(page: Page, from: Date, to: Date) {
  await page.getByLabel("Nhận phòng").click();
  await page.getByTestId(`day-${toIso(from)}`).click();
  // Nếu ngày trả sang tháng khác, bấm sang tháng sau trước khi chọn
  if (to.getMonth() !== from.getMonth()) {
    await page.getByRole("button", { name: "Tháng sau" }).click();
  }
  await page.getByTestId(`day-${toIso(to)}`).click();
}

test("ở 5 đêm qua cuối tháng", async ({ page }) => {
  await openHotel(page);
  const from = addDays(TODAY, 18);   // 28/03/2026
  const to = addDays(from, 5);       // 02/04/2026
  await pickRange(page, from, to);

  await expect(page.getByTestId("checkin-btn")).toHaveText("28/03/2026");
  await expect(page.getByTestId("checkout-btn")).toHaveText("02/04/2026");
  await expect(page.getByTestId("nights")).toHaveText("5 đêm");
});
```

Giải thích: `pickRange` tách thành hàm để mọi test dùng lại. Test này vượt qua cuối tháng 3: đây chính là tình huống mà `?bugs=BUG-02` của lab làm lệch số đêm (hiện 6 thay vì 5). Một test như vậy đủ để bắt lỗi đó.

## Thử ngay trong lab
- Mở `/lab/hotel`, bấm **Nhận phòng**: quan sát ngày quá khứ bị mờ và gạch ngang, nút **Tháng trước** bị khoá. Chọn 12/03 rồi 15/03, mở lại **Trả phòng** để xem các ngày được tô nổi bật.
- Chọn nhận phòng 10/03, sang tháng 4: thử bấm ngày 09 và ngày 10 để thấy biên 30 đêm.
- Thử bật `/lab/hotel?bugs=BUG-02`, chọn 28/03 đến 02/04, và so sánh số đêm với đáp án đúng (5 đêm).
- Mở `/lab/clinic`, đổi **Ngày khám** sang các ngày: một ngày đã qua, Chủ nhật 08/03/2026, và 02/04/2026 (quá 30 ngày); đọc thông báo lỗi tương ứng.
- Mở `/lab/timezone` và đổi múi giờ để thấy cùng một thời điểm thành ngày khác nhau.

## Lỗi thường gặp

**1. `Error: Malformed value` khi `fill` ô ngày**
Nguyên nhân: điền chuỗi không phải `yyyy-mm-dd` vào `input type="date"` (ví dụ `03/03/2026`). Cách sửa: dùng đúng định dạng ISO.

**2. `locator.click: Timeout` ở nút ngày, dù ngày đó có trong lịch**
Nguyên nhân: lịch đang ở tháng khác, hoặc lịch đã đóng. Cách sửa: kiểm tra tiêu đề tháng (như `cal-title`), điều hướng tới đúng tháng, và mở lại lịch ngay trước khi chọn.

**3. Chọn nhầm ngày của tháng khác (ngày hiển thị mờ ở đầu hoặc cuối lưới)**
Nhiều lịch (react-datepicker, MUI) vẽ cả ngày của tháng trước hoặc tháng sau ở đầu/cuối lưới, thường có class `outside` hoặc thuộc tính `data-outside`. Một locator như `getByText("1", { exact: true })` có thể khớp cả hai ngày "1". Cách sửa: dùng `aria-label` có đủ ngày tháng năm, hoặc `data-testid` chứa ISO, hoặc loại ngày ngoài tháng ra khỏi locator. (Lịch của lab hotel chỉ vẽ ngày thuộc tháng đang xem nên không dính lỗi này, nhưng lịch thư viện thì có.)

**4. Test xanh hôm nay, đỏ ngày mai**
Nguyên nhân: ghi cứng ngày ("12 tháng này") hoặc dùng `new Date()` thật. Cách sửa: `page.clock.setFixedTime` và tính ngày tương đối từ cùng một hằng số.

**5. Test xanh ở máy bạn, đỏ trên CI**
Nguyên nhân: máy CI ở múi giờ khác (thường là UTC), nên "hôm nay" khác hoặc `toISOString` ra ngày khác. Cách sửa: đặt `timezoneId` trong `test.use` hoặc trong cấu hình, ghi rõ `Z` khi tạo thời điểm, và tránh `toISOString().slice(0, 10)` cho ngày địa phương.

**6. Số đêm hoặc "ngày sau N ngày" sai ở cuối tháng**
Nguyên nhân: tính tay bằng cộng chuỗi hoặc `setMonth(+1)` (ví dụ 31/01 cộng một tháng thành 03/03 vì tháng 2 không có ngày 31). Cách sửa: dùng `setDate` để cộng ngày; với tháng, tính rõ ngày cuối tháng. Luôn thêm một test qua cuối tháng.

**7. Lịch đóng ngay sau khi mở**
Nguyên nhân: có sự kiện bấm ra ngoài (click outside) hoặc `blur` làm lịch đóng khi bạn thao tác. Cách sửa: thao tác trên đúng khung lịch (`dialog`), không bấm vào chỗ khác giữa chừng; dùng `expect(cal).toBeVisible()` để chắc lịch còn mở trước khi bấm ngày.

## Tóm tắt
- Ba kiểu: `input type="date"` dùng `fill("yyyy-mm-dd")`; ô mask dùng `pressSequentially` khi cần; lịch tuỳ biến thì mở, điều hướng tháng, bấm nút ngày.
- Chọn ngày bằng `aria-label` hoặc `data-testid` chứa ngày đầy đủ, thu hẹp vào `dialog` của lịch.
- Cố định "hôm nay" bằng `page.clock.setFixedTime` rồi tính ngày tương đối từ cùng một hằng số bằng `setDate`.
- Kiểm tra biên: ngày cuối được phép và ngày đầu bị cấm, cuối tháng, năm nhuận (29/02/2028), đổi năm.
- Ép `timezoneId` và ghi rõ `Z` khi test gần nửa đêm; đừng dùng `toISOString()` để lấy ngày địa phương.
- Luôn assert kết quả sau khi chọn: nút hiển thị đúng ngày, số đêm đúng, lịch đã đóng.

## Bài tập
1. **Input native.** Trên `/lab/clinic`, cố định hôm nay là 02/03/2026, chọn ngày khám 03/03/2026 và đọc lại giá trị. Xong khi test dùng `toHaveValue("2026-03-03")` và chạy xanh khi đổi ngày hệ thống của máy.
2. **Ngày vô hiệu.** Trên `/lab/hotel`, viết test đếm số nút ngày bị vô hiệu và có thể dùng của tháng 3/2026. Xong khi các con số khớp với hôm nay cố định là 10/03/2026 và bạn giải thích được từng con số.
3. **Hàm `pickRange`.** Viết hàm nhận ngày nhận/trả dạng `Date`, tự điều hướng tháng nếu cần bằng tiêu đề `cal-title`. Xong khi bạn chọn được khoảng 28/03 đến 02/04 và khoảng 10/03 đến 12/03 bằng cùng hàm.
4. **Biên.** Viết bộ test cho biên 1 đêm, 30 đêm, 31 đêm, nhận phòng đúng hôm nay và ngày hôm qua. Xong khi mỗi biên có một assertion về `nights` hoặc về nút bị vô hiệu.
5. **Bắt bug.** Bật `?bugs=BUG-01` và `?bugs=BUG-02` ở `/lab/hotel`, viết test xanh trên lab sạch và đỏ khi bật đúng bug. Xong khi bạn mô tả được bằng một câu mỗi bug vì sao test của mình bắt được nó.
6. **Múi giờ (nâng cao).** Dùng `timezoneId` khác nhau (`Asia/Ho_Chi_Minh`, `America/New_York`) với cùng một thời điểm UTC sát nửa đêm, kiểm tra "hôm nay" mà trang nhìn thấy. Xong khi bạn chỉ ra được hai múi giờ cho hai ngày khác nhau.
