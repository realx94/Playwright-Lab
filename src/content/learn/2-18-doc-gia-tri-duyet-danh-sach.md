---
title: Đọc giá trị và duyệt danh sách phần tử
level: 2
order: 18
minutes: 70
summary: Đọc text, thuộc tính, giá trị ô nhập; duyệt danh sách bằng count, nth, all, filter, evaluateAll; kiểm tra thứ tự sắp xếp và điều kiện cho mọi phần tử mà không dính race condition. Thực hành trên LAB-29 và LAB-08.
keywords: [playwright textContent innerText, locator.all, allTextContents, evaluateAll, expect.poll, playwright kiểm tra sắp xếp, getAttribute]
---

## Mục tiêu bài học
- Chọn đúng giữa `textContent`, `innerText`, `allTextContents`, `allInnerTexts`, `getAttribute`, `inputValue` cho từng loại dữ liệu cần đọc.
- Duyệt danh sách bằng `count()`, `nth()`, `first()`, `last()`, `locator.all()` kèm `for...of`, và thu hẹp danh sách bằng `filter({ hasText, has, hasNot })`.
- Kiểm tra được "danh sách đã sắp xếp đúng" bằng cách đọc ra mảng rồi so với bản sắp xếp, và kiểm tra "mọi phần tử đều thoả điều kiện".
- Đổi chuỗi tiền như `1.250.000 ₫` thành số để so sánh và cộng tổng.
- Tránh race condition: biết vì sao `all()` và `count()` không chờ, và cách chờ danh sách ổn định trước khi đọc.

## Bạn cần chuẩn bị
- Đã học bài 2.5 (locator), 2.8 (assertions) và 2.9 (auto-wait). Bài này dựa vào khái niệm "assertion có retry" và "locator là công thức, không phải kết quả".
- Chạy được site học tập (`npm run dev`), mở `/lab/hotel` (ứng dụng) và `/labs/hotel` (trang mô tả). Lab phụ: `/lab/table` (LAB-08).
- Biết dùng `page.clock.setFixedTime` ở mức đọc hiểu: lab Hotel dùng "hôm nay" theo đồng hồ trình duyệt nên test cố định ngày hôm nay để lịch luôn giống nhau.

## Kiến thức cần nắm
- Assertion có retry (`toHaveText`, `toHaveCount`) **chờ** tới khi đúng; các hàm đọc giá trị (`textContent`, `getAttribute`, `all`, `count`...) **chỉ đọc một lần, ngay lập tức**.
- `textContent` đọc nội dung DOM thô (kể cả phần bị ẩn bằng CSS); `innerText` đọc đúng cái người dùng nhìn thấy.
- `getAttribute(name)` đọc thuộc tính HTML; `inputValue()` đọc giá trị hiện tại của ô nhập; hai thứ này không giống nhau.
- `locator.all()` trả về mảng locator tại thời điểm gọi; `allTextContents()` và `allInnerTexts()` trả về mảng chuỗi.
- `evaluateAll` chạy hàm JavaScript ngay trong trang trên cả danh sách phần tử.
- `expect.poll` thử lại một hàm bất đồng bộ cho tới khi giá trị khớp.

## Giải thích dễ hiểu

Có hai kiểu "nhìn" một trang web. Kiểu thứ nhất là **khẳng định**: "ô này phải ghi 3 đêm". Đây là việc của assertion web-first như `expect(locator).toHaveText("3 đêm")`: nó tự thử lại, nên chịu được việc trang còn đang vẽ. Kiểu thứ hai là **đọc để tính toán**: "lấy mọi giá khách sạn trên trang, đổi thành số, rồi kiểm tra chúng tăng dần". Ở kiểu này bạn phải kéo dữ liệu ra khỏi trang để xử lý bằng code TypeScript, và các hàm đọc **không** tự chờ.

Ví dụ đời thường: assertion giống như bạn đứng ở quầy và nói với nhân viên "tôi đợi tới khi bảng giá ghi 3 đêm". Hàm đọc giống như bạn chụp một tấm ảnh bảng giá ngay lúc này rồi mang về nhà tính toán. Nếu bảng giá đang thay đổi lúc bạn bấm máy, bạn mang về tấm ảnh cũ, và phép tính của bạn đúng nhưng vô nghĩa. Vì vậy quy tắc vàng của bài là: **chờ cho trang ổn định bằng một assertion có retry, rồi mới đọc**.

Quy tắc chọn công cụ:
1. Chỉ cần so sánh với giá trị mong đợi: dùng assertion (`toHaveText`, `toHaveAttribute`, `toHaveValue`, `toHaveCount`). Đừng đọc ra rồi `expect(x).toBe(...)` khi có sẵn assertion tương ứng, vì mất khả năng tự thử lại.
2. Cần tính toán (cộng, so sánh nhiều phần tử, sắp xếp): đọc ra mảng, nhưng bọc bằng `expect.poll` hoặc chờ trước bằng assertion.
3. Cần chạy phép tính ngay trong trình duyệt (đọc style, đọc dataset của cả danh sách): `evaluateAll`.

Thuật ngữ: **race condition** là tình huống kết quả phụ thuộc vào ai nhanh hơn ai, ở đây là test đọc nhanh hơn trang cập nhật; **dataset** là các thuộc tính `data-*` của phần tử; **web-first assertion** là assertion tự thử lại tới khi đúng hoặc hết thời gian.

## Thực hành từng bước

Ví dụ chính chạy trên `/lab/hotel`. Mỗi thẻ khách sạn là một `li` có `data-testid="hotel-card"`, mang sẵn các thuộc tính `data-id`, `data-price`, `data-rating`, `data-stars`, `data-amenities`. Bên trong có tên (`hotel-name`), số sao (ảnh có `aria-label` dạng "3 trên 5 sao"), điểm đánh giá (`hotel-rating`, ví dụ `8.1/10`), giá (`hotel-price`, ví dụ `650.000 ₫`), ảnh có `alt` "Ảnh khách sạn ...", và liên kết "Xem chi tiết". Tìm Hà Nội cho 12 khách sạn, mỗi trang 5 khách sạn, tổng 3 trang.

### Bước 1. Dựng hàm tìm kiếm dùng chung
Mục đích: đưa trang về trạng thái "đã có danh sách kết quả" để các bước sau chỉ tập trung vào việc đọc.

```ts
import { test, expect, type Page } from "@playwright/test";

const NOW = new Date("2026-03-10T09:00:00");

// "1.250.000 ₫" -> 1250000 : bỏ mọi ký tự không phải chữ số
const parseVnd = (s: string) => Number(s.replace(/\D/g, ""));

async function searchHanoi(page: Page) {
  await page.clock.setFixedTime(NOW);   // cố định "hôm nay" = 10/03/2026
  await page.goto("/lab/hotel");
  await page.getByTestId("reset-data").click();

  await page.getByRole("combobox", { name: "Điểm đến" }).fill("Hà Nội");
  await page.getByRole("option", { name: "Hà Nội", exact: true }).click();

  await page.getByLabel("Nhận phòng").click();
  await page.getByTestId("day-2026-03-12").click();
  await page.getByTestId("day-2026-03-15").click();
  await page.getByRole("button", { name: "Tìm khách sạn" }).click();

  // Chờ danh sách ổn định trước khi bất kỳ test nào đọc dữ liệu
  await expect(page.getByTestId("hotel-card")).toHaveCount(5);
}
```

| Phần | Ý nghĩa |
|------|---------|
| `page.clock.setFixedTime(NOW)` | Đóng băng đồng hồ của trang; lịch luôn mở ở tháng 3 năm 2026 và các ngày trước 10/03 bị vô hiệu. |
| `parseVnd` | Biểu thức chính quy `\D` khớp mọi ký tự không phải chữ số; xoá hết dấu chấm và ký hiệu đồng, chỉ còn các chữ số. |
| `getByRole("option", { name, exact: true })` | Chọn đúng gợi ý trong combobox (đã gõ "Hà Nội" thì chỉ còn một gợi ý). |
| `toHaveCount(5)` cuối hàm | Điểm chờ: chỉ trả về khi trang đã vẽ đủ 5 thẻ của trang đầu. |

Kết quả mong đợi: hàm chạy xong, trang hiện "12 khách sạn tại Hà Nội" và 5 thẻ. Nếu `getByTestId("day-2026-03-12")` không tìm thấy, bạn đã quên `setFixedTime` nên lịch mở ở tháng của ngày thật.

### Bước 2. Đọc một giá trị: text, thuộc tính, ô nhập
Mục đích: lấy từng loại dữ liệu từ một thẻ khách sạn.

```ts
test("đọc từng giá trị trên một thẻ", async ({ page }) => {
  await searchHanoi(page);
  const first = page.getByTestId("hotel-card").first();

  expect(await first.getByTestId("hotel-name").textContent()).toBe("Phố Cổ Boutique");
  expect(await first.getByTestId("hotel-price").innerText()).toBe("650.000 ₫");

  expect(await first.getAttribute("data-price")).toBe("650000");
  expect(await first.getByRole("img", { name: /sao/ }).getAttribute("aria-label")).toBe("3 trên 5 sao");
  expect(await first.getByRole("img", { name: /Ảnh khách sạn/ }).getAttribute("alt"))
    .toBe("Ảnh khách sạn Phố Cổ Boutique");
  expect(await first.getByRole("link", { name: "Xem chi tiết" }).getAttribute("href"))
    .toBe("/lab/hotel/h01");

  await page.getByLabel("Giá tối thiểu").fill("500000");
  expect(await page.getByLabel("Giá tối thiểu").inputValue()).toBe("500000");
});
```

| Lệnh | Đọc gì | Ghi chú |
|------|--------|---------|
| `textContent()` | Toàn bộ chữ trong DOM của phần tử và con cháu | Có thể trả về `null` nếu phần tử là document; còn lại là chuỗi (có thể chứa khoảng trắng thừa). |
| `innerText()` | Chữ như người dùng thấy | Bỏ phần ẩn bằng CSS, xuống dòng theo bố cục. |
| `getAttribute("data-price")` | Giá trị thuộc tính HTML | Luôn là chuỗi, hoặc `null` nếu không có thuộc tính; đổi sang số bằng `Number(...)`. |
| `inputValue()` | Giá trị hiện tại của `input`, `textarea`, `select` | Chỉ dùng được với các phần tử nhập liệu; trả về chuỗi. |

Kết quả mong đợi: mọi `expect` xanh. Lưu ý quan trọng: `first.getByRole("img", { name: /sao/ })` khớp ảnh số sao nhờ `aria-label` của nó; còn ảnh khách sạn có tên khởi từ `alt`. Vì vậy một thuộc tính `alt` hoặc `aria-label` vừa là dữ liệu để đọc, vừa là tên truy cập mà `getByRole` dùng để tìm.

Với những giá trị chỉ cần khẳng định, nên dùng assertion thay cho đọc rồi so sánh, ví dụ `await expect(first).toHaveAttribute("data-price", "650000")` hoặc `await expect(link).toHaveAttribute("href", /^\/lab\/hotel\/h\d+$/)`; chúng tự thử lại. Chỉ dùng cách đọc ở trên khi bạn thực sự cần giá trị để tính toán tiếp.

### Bước 3. textContent khác innerText như thế nào
Mục đích: nhìn tận mắt sự khác biệt để chọn đúng.

```ts
test("textContent và innerText", async ({ page }) => {
  await page.setContent(`
    <p id="p">  Giá:   <span style="display:none">ẩn</span>
    <b>1.250.000 ₫</b>   </p>
    <ul id="l"><li>A</li><li>B</li></ul>`);

  expect(await page.locator("#p").textContent()).toBe("  Giá:   ẩn\n  1.250.000 ₫   ");
  expect(await page.locator("#p").innerText()).toBe("Giá: 1.250.000 ₫");

  expect(await page.locator("#l").textContent()).toBe("AB");     // dính liền, không xuống dòng
  expect(await page.locator("#l").innerText()).toBe("A\nB");     // mỗi li một dòng

  // assertion mặc định dùng textContent (đã chuẩn hoá khoảng trắng): vẫn thấy chữ "ẩn"
  await expect(page.locator("#p")).toContainText("1.250.000 ₫");
  // muốn so với phần nhìn thấy: useInnerText
  await expect(page.locator("#p")).toHaveText("Giá: 1.250.000 ₫", { useInnerText: true });
});
```

Giải thích:
- `page.setContent(html)` nạp HTML trực tiếp vào trang trống, không cần server; tiện để thí nghiệm nhanh.
- `textContent` giữ lại chữ "ẩn" của `span` có `display:none` và giữ nguyên khoảng trắng, xuống dòng của mã nguồn HTML.
- `innerText` bỏ phần ẩn, gộp khoảng trắng và chèn xuống dòng giữa các phần tử khối (`li`).
- `toHaveText` mặc định so sánh theo `textContent` (đã gộp khoảng trắng), nên nếu ứng dụng có chữ ẩn dành cho trình đọc màn hình hoặc chữ bị CSS giấu, assertion sẽ thấy cả chúng. Thêm `{ useInnerText: true }` để chỉ so phần người dùng nhìn thấy.

Chọn thế nào: muốn đúng thứ người dùng đọc (giá, nhãn) thì `innerText`; muốn đọc dữ liệu thô gồm cả phần ẩn thì `textContent`. Với danh sách `ul`, `innerText` cho kết quả dễ tách theo dòng hơn.

Kết quả mong đợi: test xanh. Nếu bạn đoán sai một chuỗi, thông báo lỗi của Playwright in ra chuỗi thật; dùng `JSON.stringify(chuỗi)` khi `console.log` để nhìn thấy cả khoảng trắng và `\n`.

### Bước 4. Đếm và chọn phần tử: count, nth, first, last
Mục đích: lấy kích thước danh sách và chạm tới một phần tử theo vị trí.

```ts
test("đếm và chọn theo vị trí", async ({ page }) => {
  await searchHanoi(page);
  const cards = page.getByTestId("hotel-card");

  expect(await cards.count()).toBe(5);                       // đọc một lần, không chờ
  await expect(cards).toHaveCount(5);                        // chờ tới khi đúng (ưu tiên)

  expect(await cards.nth(1).getAttribute("data-id")).toBe("h02");   // vị trí tính từ 0
  await expect(cards.first()).toContainText("Phố Cổ Boutique");
  await expect(cards.last()).toContainText("Hà Nội Central");
});
```

- `nth(i)` đếm từ 0; `first()` bằng `nth(0)`; `last()` là phần tử cuối tại thời điểm Playwright tìm kiếm.
- Locator **lười**: `cards.nth(1)` chưa tìm gì cả; mỗi lần dùng nó mới tra cứu DOM lại. Điều này tốt vì thứ tự đổi theo thời gian thì locator vẫn trỏ tới "phần tử thứ hai hiện tại".
- `count()` trả ngay con số hiện tại, kể cả khi bằng 0. Muốn khẳng định số lượng thì dùng `toHaveCount`.

Kết quả mong đợi: các dòng xanh. Nếu `nth(1)` ném lỗi "strict mode violation" thì bạn đang gọi hành động trên locator còn khớp nhiều phần tử; `nth/first/last` chính là cách thu về một phần tử.

### Bước 5. Đọc cả cột: allTextContents, allInnerTexts và đổi chuỗi tiền
Mục đích: lấy mảng giá trị của cả danh sách và biến chúng thành số.

```ts
test("đọc cả danh sách giá và tính tổng", async ({ page }) => {
  await searchHanoi(page);

  const names = await page.getByTestId("hotel-name").allTextContents();
  expect(names).toHaveLength(5);
  expect(names[1]).toBe("Hồ Gươm Palace");

  const prices = (await page.getByTestId("hotel-price").allInnerTexts()).map(parseVnd);
  expect(prices).toEqual([650000, 3200000, 1450000, 480000, 1250000]);

  const total = prices.reduce((sum, p) => sum + p, 0);
  expect(total).toBe(7030000);

  const ratings = (await page.getByTestId("hotel-rating").allInnerTexts()).map(parseFloat);
  expect(ratings.every((r) => r >= 0 && r <= 10)).toBe(true);    // "8.1/10" -> 8.1
});
```

- `allTextContents()` và `allInnerTexts()` trả `Promise<string[]>`; chúng đọc mọi phần tử đang khớp, **không** chờ và **không** lỗi nếu danh sách rỗng (trả `[]`).
- `parseVnd` loại cả dấu chấm phân cách hàng nghìn, nên `"3.200.000 ₫"` thành `3200000`. Cẩn thận: cách này chỉ đúng với số nguyên. Nếu giá có phần thập phân (`1,250.50`) bạn phải xử lý dấu thập phân riêng.
- `parseFloat("8.1/10")` đọc phần số đứng đầu rồi dừng ở ký tự `/`, kết quả `8.1`.

Kết quả mong đợi: các mảng đúng thứ tự hiển thị trên trang. Nếu `names` có độ dài 0, nghĩa là bạn đọc trước khi danh sách vẽ xong: hàm `searchHanoi` đã chờ `toHaveCount(5)` để tránh điều đó.

### Bước 6. Duyệt từng phần tử bằng locator.all() và for...of
Mục đích: kiểm tra một điều kiện phụ thuộc vào nhiều trường của từng phần tử.

```ts
test("khách sạn 5 sao phải có giá từ 2 triệu", async ({ page }) => {
  await searchHanoi(page);
  const cards = page.getByTestId("hotel-card");

  for (const card of await cards.all()) {
    const price = Number(await card.getAttribute("data-price"));
    const stars = Number(await card.getAttribute("data-stars"));
    if (stars === 5) {
      expect(price).toBeGreaterThanOrEqual(2000000);
    }
  }
});
```

- `await cards.all()` trả về mảng locator, mỗi locator trỏ tới một thẻ cụ thể. Dùng `for...of` (có `await` bên trong) thay vì `forEach`, vì `forEach` không chờ các lời hứa bên trong.
- `all()` **không chờ**: nó chụp danh sách ở đúng thời điểm gọi. Nếu gọi khi trang chưa vẽ xong, bạn nhận mảng thiếu hoặc rỗng và vòng lặp chạy qua... không phần tử nào, test vẫn xanh một cách giả tạo. Đây là lý do `searchHanoi` luôn kết thúc bằng `toHaveCount`.
- Mỗi lần `getAttribute` là một lần trao đổi với trình duyệt. Với danh sách vài chục phần tử thì ổn; với hàng trăm, hãy chuyển sang `evaluateAll` (Bước 8).
- Mẹo an toàn: ngay trước vòng lặp, khẳng định số phần tử kỳ vọng (`await expect(cards).toHaveCount(5)`), để vòng lặp rỗng không thể lọt qua.

Kết quả mong đợi: xanh. Trang đầu có đúng một khách sạn 5 sao (Hồ Gươm Palace, 3.200.000 ₫) nên nhánh `if` chạy một lần. Nếu muốn chắc chắn nhánh `if` có chạy, đếm số lần vào nhánh và khẳng định lớn hơn 0.

### Bước 7. Thu hẹp danh sách bằng filter: hasText, has, hasNot
Mục đích: tìm phần tử theo nội dung bên trong mà không phải duyệt tay.

```ts
test("lọc các thẻ theo nội dung", async ({ page }) => {
  await searchHanoi(page);
  const cards = page.getByTestId("hotel-card");

  // theo chữ có trong thẻ
  await expect(cards.filter({ hasText: "Hồ Gươm" })).toHaveCount(1);

  // theo phần tử con có trong thẻ: thẻ chứa ảnh sao có tên "5 trên 5 sao"
  await expect(cards.filter({ has: page.getByRole("img", { name: "5 trên 5 sao" }) })).toHaveCount(1);

  // thẻ KHÔNG chứa chữ "Hồ bơi" (khách sạn không có hồ bơi)
  await expect(cards.filter({ hasNot: page.getByText("Hồ bơi") })).toHaveCount(3);
});
```

- `hasText` nhận chuỗi (không phân biệt hoa thường, khớp một phần) hoặc biểu thức chính quy.
- `has` nhận một locator và giữ lại các phần tử **chứa** locator đó. Locator truyền vào được tính **từ bên trong** phần tử, nên viết `page.getByRole(...)` là đủ, Playwright tự hiểu là tìm trong từng thẻ.
- `hasNot` là phép phủ định của `has`; `hasNotText` là phủ định của `hasText`.
- Kết quả của `filter` vẫn là locator: bạn có thể nối tiếp (`.filter(...).getByRole("button", ...)`), đếm, hoặc `all()`.

Quy tắc chọn giữa duyệt vòng lặp và `filter`: nếu chỉ cần chọn rồi thao tác hoặc đếm, dùng `filter` (nhanh, tự chờ). Nếu cần tính toán trên nhiều trường (so sánh giá với số sao), dùng vòng lặp hoặc `evaluateAll`.

Kết quả mong đợi: ba dòng xanh (trang đầu có 5 thẻ, 3 trong số đó không có hồ bơi). Nếu `has` báo 0 trong khi bạn thấy phần tử, kiểm tra tên trong `getByRole` có khớp chính xác `aria-label` ("5 trên 5 sao") hay không.

### Bước 8. evaluateAll: tính ngay trong trình duyệt
Mục đích: gom dữ liệu của cả danh sách bằng một lần gọi.

```ts
test("evaluateAll: tổng giá và đếm khách sạn dưới 1 triệu", async ({ page }) => {
  await searchHanoi(page);
  const cards = page.getByTestId("hotel-card");

  const sum = await cards.evaluateAll((els) =>
    els.reduce((s, el) => s + Number((el as HTMLElement).dataset.price), 0),
  );
  expect(sum).toBe(7030000);

  const cheap = await cards.evaluateAll(
    (els) => els.filter((el) => Number((el as HTMLElement).dataset.price) < 1000000).length,
  );
  expect(cheap).toBe(2);

  // mọi ảnh phải có alt không rỗng
  const alts = await cards
    .getByRole("img", { name: /Ảnh khách sạn/ })
    .evaluateAll((imgs) => imgs.map((img) => img.getAttribute("alt")));
  expect(alts.every((a) => a && a.length > 0)).toBe(true);
});
```

- Hàm truyền vào `evaluateAll` **chạy trong trình duyệt**, nhận mảng phần tử DOM thật. Không dùng được biến ở phía Node (hãy truyền qua tham số thứ hai nếu cần), và `el as HTMLElement` chỉ để TypeScript chịu cho phép `.dataset`.
- `el.dataset.price` đọc thuộc tính `data-price`; `dataset` luôn trả chuỗi nên phải `Number(...)`.
- Ưu điểm: một lần trao đổi với trình duyệt cho cả danh sách, nhanh và có tính nguyên tử (mọi phần tử được đọc trong cùng một khoảnh khắc, không bị trộn dữ liệu cũ và mới).
- Nhược điểm: không có actionability, không chờ, và nếu hàm lỗi thì thông báo là lỗi JavaScript trong trình duyệt khó đọc hơn. Dùng khi cần tính toán; còn việc đọc text đơn giản thì `allInnerTexts` rõ ràng hơn.

Kết quả mong đợi: ba phép đo đều đúng. Nếu `sum` là `NaN`, một phần tử không có `data-price` (`Number(undefined)` là `NaN`).

### Bước 9. Kiểm tra thứ tự sắp xếp
Mục đích: chứng minh danh sách đã đúng thứ tự mà không cần biết trước từng giá trị.

```ts
test("sắp xếp theo giá tăng dần", async ({ page }) => {
  await searchHanoi(page);
  const cards = page.getByTestId("hotel-card");
  const readPrices = async () =>
    (await page.getByTestId("hotel-price").allInnerTexts()).map(parseVnd);

  await page.getByLabel("Sắp xếp").selectOption("price-asc");
  await expect(cards.first()).toHaveAttribute("data-price", "480000");   // chờ danh sách đã đổi

  const asc = await readPrices();
  expect(asc).toEqual([...asc].sort((a, b) => a - b));

  await page.getByLabel("Sắp xếp").selectOption("price-desc");
  await expect.poll(readPrices).toEqual([3200000, 2800000, 1450000, 1350000, 1250000]);
});
```

Ý tưởng là "đọc ra mảng, tạo bản sao đã sắp xếp, so hai mảng":
- `[...asc].sort(...)` tạo bản sao rồi sắp xếp; **không** viết `asc.sort(...)` vì `sort` sắp xếp tại chỗ, mảng gốc bị đổi và phép so sánh luôn đúng.
- `(a, b) => a - b` là hàm so sánh số. Nếu quên và gọi `.sort()` trần thì JavaScript sắp xếp theo chuỗi (`"1000000"` đứng trước `"480000"`), cho kết quả sai với số.
- Dòng `toHaveAttribute("data-price", "480000")` là **điểm chờ**: khi phần tử đầu có đúng giá nhỏ nhất, ta biết danh sách đã vẽ lại. Sau đó mới đọc cả mảng.
- `expect.poll(readPrices)` thay cho điểm chờ: nó gọi lại hàm cho tới khi kết quả bằng giá trị mong đợi (hoặc hết thời gian), dùng khi bạn đã biết rõ mảng cần đạt.
- Ngoài kiểm thứ tự, vẫn nên có ít nhất một phép kiểm giá trị cụ thể (như `480000` ở đầu) để bắt trường hợp danh sách rỗng hay chỉ có một phần tử, vì mảng rỗng luôn "đã sắp xếp".

Với chữ, so sánh có dấu tiếng Việt phải dùng `localeCompare(b, "vi")` thay cho phép so sánh mặc định. Ví dụ ở `/lab/table` (LAB-08) cột tên sắp xếp theo tiếng Việt:

```ts
test("bảng người dùng: tên sắp A đến Z theo tiếng Việt", async ({ page }) => {
  await page.goto("/lab/table");
  await page.getByTestId("reset-data").click();
  const rows = page.getByTestId("user-row");
  await expect(rows).toHaveCount(10);

  // cột "Tên" là ô thứ 2 trong mỗi hàng (ô thứ nhất là checkbox)
  const names = await rows.locator("td:nth-child(2)").allInnerTexts();
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "vi")));
});
```

Kết quả mong đợi: xanh; trang đầu bắt đầu bằng "Bùi Chi" rồi tới các "Đặng ...", "Hoàng ...". Nếu dùng `.sort()` mặc định, chữ "Đ" bị đẩy xuống cuối bảng chữ cái và test đỏ oan.

### Bước 10. Kiểm tra mọi phần tử đều thoả điều kiện
Mục đích: khẳng định một quy tắc áp dụng cho cả danh sách, đúng cả khi danh sách vừa thay đổi.

```ts
test("lọc giá tối đa 1 triệu: mọi khách sạn đều không vượt quá", async ({ page }) => {
  await searchHanoi(page);
  await page.getByLabel("Giá tối đa").fill("1000000");
  await expect(page.getByTestId("result-count")).toHaveText("6 khách sạn tại Hà Nội");

  // Cách 1: vòng lặp, báo lỗi rõ phần tử vi phạm
  for (const price of (await page.getByTestId("hotel-price").allInnerTexts()).map(parseVnd)) {
    expect(price).toBeLessThanOrEqual(1000000);
  }

  // Cách 2: expect.poll tự thử lại cho tới khi mọi phần tử thoả điều kiện
  await expect
    .poll(async () => (await page.getByTestId("hotel-price").allInnerTexts()).map(parseVnd).every((p) => p <= 1000000))
    .toBe(true);
});
```

- Trước khi duyệt, ta chờ dòng "6 khách sạn tại Hà Nội" (`toHaveText`), một dấu hiệu rõ ràng rằng bộ lọc đã áp dụng: có đúng 6 khách sạn Hà Nội giá không quá 1.000.000 ₫.
- Cách 1 báo lỗi chi tiết ("expected 1450000 to be <= 1000000") nên dễ biết phần tử nào sai, nhưng chỉ chạy một lần: nếu đọc đúng lúc dữ liệu cũ vẫn còn, test đỏ dù ứng dụng đúng.
- Cách 2 trả về `boolean` nên thông báo lỗi nghèo ("expected true received false"), đổi lại có retry. Kết hợp: chờ bằng cách 2, rồi in chi tiết bằng cách 1 khi cần chẩn đoán.
- Lưu ý một lỗi lệch: `.every()` trên mảng rỗng trả `true`. Luôn kèm một khẳng định số lượng (như `toHaveText("6 khách sạn ...")` ở trên) để không "đúng vì rỗng".

Kết quả mong đợi: cả hai cách xanh. Thử bật `?bugs=BUG-03` ở `/lab/hotel` và lọc nhiều tiện nghi để thấy bug "OR thay vì AND": một vòng lặp kiểm tra "mọi thẻ đều có đủ các tiện nghi đã chọn" (đọc `data-amenities`) sẽ bắt được nó.

### Bước 11. Chờ danh sách ổn định: race condition có thật
Mục đích: thấy tận mắt vì sao `all()` không chờ.

```ts
test("bảng có trạng thái đang tải: all() đọc quá sớm", async ({ page }) => {
  await page.goto("/lab/table");
  await page.getByTestId("reset-data").click();
  const rows = page.getByTestId("user-row");
  await expect(rows).toHaveCount(10);

  await page.getByRole("button", { name: "Ngày tạo" }).click();

  // Ngay sau khi bấm, bảng chuyển sang "Đang tải…" và KHÔNG còn hàng dữ liệu nào
  expect((await rows.all()).length).toBe(0);

  // Cách đúng: chờ hết trạng thái tải, rồi chờ đủ số hàng, rồi mới đọc
  await expect(page.getByTestId("table-loading")).toBeHidden();
  await expect(rows).toHaveCount(10);

  const times = (await rows.locator("td:nth-child(5)").allInnerTexts()).map((s) => {
    const [d, m, y] = s.split("/").map(Number);      // "05/06/2025" -> ngày, tháng, năm
    return Date.UTC(y, m - 1, d);
  });
  expect(times).toEqual([...times].sort((a, b) => a - b));
});
```

Giải thích từng chặng:
- Sau khi bấm tiêu đề cột, lab mô phỏng gọi máy chủ: mặc định 300 ms hiện dòng "Đang tải…" (`data-testid="table-loading"`) thay cho các hàng. Tức là có một khoảng thời gian bảng **không có** hàng nào. `rows.all()` đọc đúng khoảng đó và trả mảng rỗng.
- Hậu quả nếu bạn viết vòng lặp "với mỗi hàng, kiểm ..." ngay lúc đó: vòng lặp chạy 0 lần và test xanh giả. Nếu bạn đọc đúng lúc dữ liệu cũ, test sẽ so sánh dữ liệu chưa sắp xếp và đỏ oan; hai kết quả đều sai.
- Cách đúng gồm hai lớp chờ: `table-loading` biến mất (hoặc `aria-busy` về `false` trên bảng) rồi `toHaveCount(10)` để biết hàng đã đủ. Sau đó đọc.
- Ngày hiển thị dạng `dd/mm/yyyy` nên không thể so sánh chuỗi trực tiếp (`"05/06/2025"` so với `"14/12/2024"` theo chuỗi sẽ sai). Tách ra rồi đổi sang mốc thời gian `Date.UTC(...)` mới so sánh được.
- Có thể thử kéo dài tình huống bằng `/lab/table?delay=1000` (1 giây): nếu test của bạn không chờ đúng cách, lỗi sẽ lộ ra ngay.

Kết quả mong đợi: dòng đầu có `length` bằng 0 (đó chính là lỗi mà ta muốn thấy), phần còn lại xanh. Nếu dòng `toBe(0)` đỏ trên máy bạn, nghĩa là trang vẽ nhanh hơn test chạy; điều đó không làm cách "chờ đúng" sai. Trong test thật hãy bỏ dòng minh hoạ đó đi.

### Bước 12. Gom dữ liệu qua nhiều trang
Mục đích: đọc toàn bộ kết quả khi có phân trang.

```ts
test("gom tên 12 khách sạn qua 3 trang", async ({ page }) => {
  await searchHanoi(page);
  const info = page.getByTestId("page-info");
  const totalPages = Number((await info.innerText()).match(/\/(\d+)$/)![1]);   // "Trang 1/3" -> 3
  expect(totalPages).toBe(3);

  const all: string[] = [];
  for (let p = 1; p <= totalPages; p++) {
    await page.getByTestId(`page-${p}`).click();
    await expect(info).toHaveText(`Trang ${p}/${totalPages}`);   // chờ trang p thật sự hiện ra
    all.push(...(await page.getByTestId("hotel-name").allInnerTexts()));
  }

  expect(all).toHaveLength(12);
  expect(new Set(all).size).toBe(12);   // không trùng, không sót
});
```

- Mỗi vòng có hai việc theo thứ tự: bấm trang, **chờ chỉ báo trang** (`page-info` đúng "Trang p/3"), rồi mới đọc. Bỏ dòng chờ thì bạn có thể đọc lại trang trước.
- Trong ví dụ ta lấy tổng số trang từ chuỗi bằng biểu thức chính quy `\/(\d+)$`: dấu `/`, rồi nhóm các chữ số, ở cuối chuỗi. Dấu `!` sau `match(...)` báo cho TypeScript rằng kết quả không phải `null` (nếu chuỗi sai định dạng, test sẽ lỗi rõ ràng ngay tại đó).
- `new Set(all).size` đếm số phần tử khác nhau: nếu bằng độ dài của mảng nghĩa là không có khách sạn nào bị lặp giữa các trang.

Kết quả mong đợi: 12 tên, không trùng. Đây là cách kiểm tra phân trang không làm mất hoặc nhân đôi dữ liệu.

## Demo code

Khung hoàn chỉnh để chép vào `e2e/hotel-read.spec.ts`. Nó gồm các hàm ở Bước 1 (`NOW`, `parseVnd`, `searchHanoi`) và một test tổng hợp ba kỹ thuật:

```ts
test("tổng hợp: sắp xếp, điều kiện mọi phần tử, đọc dữ liệu", async ({ page }) => {
  await searchHanoi(page);
  const cards = page.getByTestId("hotel-card");
  const readPrices = async () =>
    (await page.getByTestId("hotel-price").allInnerTexts()).map(parseVnd);

  // 1. sắp xếp tăng dần: chờ phần tử đầu đổi, rồi so với bản sắp xếp
  await page.getByLabel("Sắp xếp").selectOption("price-asc");
  await expect(cards.first()).toHaveAttribute("data-price", "480000");
  const asc = await readPrices();
  expect(asc).toEqual([...asc].sort((a, b) => a - b));

  // 2. tổng giá và số khách sạn dưới 1 triệu, tính ngay trong trình duyệt
  const stats = await cards.evaluateAll((els) => {
    const prices = els.map((el) => Number((el as HTMLElement).dataset.price));
    return {
      total: prices.reduce((s, p) => s + p, 0),
      cheap: prices.filter((p) => p < 1000000).length,
    };
  });
  expect(stats).toEqual({ total: 2990000, cheap: 5 });   // 5 khách sạn rẻ nhất: 480k, 550k, 590k, 650k, 720k

  // 3. lọc theo tiện nghi rồi kiểm mọi thẻ đều có Hồ bơi
  await page.getByRole("checkbox", { name: "Hồ bơi" }).check();
  await expect(page.getByTestId("result-count")).toHaveText("5 khách sạn tại Hà Nội");
  for (const card of await cards.all()) {
    expect((await card.getAttribute("data-amenities"))?.split(",")).toContain("pool");
  }
});
```

Giải thích: phần 1 chờ bằng thuộc tính của phần tử đầu rồi mới đọc cả mảng; phần 2 trả về một đối tượng từ `evaluateAll` để tránh hai lần gọi riêng (sau khi sắp xếp tăng dần, trang đầu là 5 khách sạn rẻ nhất nên tổng là 2.990.000 ₫ và cả 5 đều dưới 1 triệu); phần 3 chờ dòng "5 khách sạn tại Hà Nội" (có đúng 5 khách sạn Hà Nội có hồ bơi, vừa đủ một trang) rồi duyệt từng thẻ, dùng `data-amenities` (chuỗi các mã cách nhau bởi dấu phẩy) để kiểm tra quy tắc AND của bộ lọc.

Chạy: `npx playwright test e2e/hotel-read.spec.ts`.

## Thử ngay trong lab
- Mở `/lab/hotel`, tìm Hà Nội cho ngày 12 đến 15/03, rồi bấm F12 và xem một thẻ trong tab Elements: nhận ra `data-price`, `data-rating`, `aria-label` của ảnh sao, `alt` của ảnh, `href` của liên kết. Đây chính là những thứ bạn đọc bằng `getAttribute`.
- Đọc quy tắc nghiệp vụ ở `/labs/hotel` (5 khách sạn mỗi trang, bộ lọc tiện nghi là AND, giá tối thiểu không lớn hơn giá tối đa) và tự viết thêm một vòng lặp kiểm tra cho mỗi quy tắc.
- Bật `/lab/hotel?bugs=BUG-03` rồi chọn hai tiện nghi cùng lúc: viết test "mọi thẻ đều có đủ tiện nghi đã chọn" và xem nó đỏ.
- Mở `/lab/table?delay=2000` và quan sát dòng "Đang tải…" kéo dài 2 giây sau mỗi lần sắp xếp, rồi chạy lại test ở Bước 11.

## Lỗi thường gặp

1. **Đọc ngay khi trang chưa vẽ xong.** Triệu chứng: `expect(names).toHaveLength(5)` báo `Expected length: 5, Received length: 0`, hoặc test chỉ đôi lúc đỏ. Nguyên nhân: `allTextContents`, `count`, `all` đọc một lần, không chờ. Cách sửa: chờ trước bằng `await expect(cards).toHaveCount(n)` (hoặc chỉ báo khác như dòng đếm kết quả), rồi mới đọc; hoặc bọc bằng `expect.poll`.
2. **Vòng lặp xanh giả vì danh sách rỗng.** Triệu chứng: test qua nhưng khi bật bug vẫn qua. Nguyên nhân: `for (const x of await list.all())` với mảng rỗng chạy 0 lần; `[].every(...)` trả `true`. Cách sửa: luôn khẳng định số phần tử (`toHaveCount`) trước khi duyệt.
3. **Sắp xếp sai chỉ vì dùng `.sort()` mặc định.** Triệu chứng: `Expected: [480000, 650000, ...] Received: [1250000, 1450000, ...]` dù ứng dụng đúng. Nguyên nhân: `sort()` không có hàm so sánh coi phần tử là chuỗi. Cách sửa: `.sort((a, b) => a - b)` cho số, `localeCompare(b, "vi")` cho chữ tiếng Việt, và nhớ sao chép mảng (`[...arr]`) trước khi sắp xếp.
4. **Chuỗi tiền cho ra `NaN` hoặc số sai.** Triệu chứng: `Number("650.000 ₫")` là `NaN`; `parseFloat("1.250.000")` ra `1.25`. Nguyên nhân: `Number` và `parseFloat` không hiểu dấu chấm phân cách nghìn và ký hiệu đồng. Cách sửa: `s.replace(/\D/g, "")` trước khi `Number`; với số thập phân phải xử lý dấu thập phân riêng.
5. **`textContent` cho chuỗi thừa khoảng trắng hoặc chữ ẩn.** Triệu chứng: `toBe("650.000 ₫")` đỏ với chuỗi có khoảng trắng và xuống dòng ở hai đầu. Nguyên nhân: `textContent` trả DOM thô. Cách sửa: dùng `innerText` cho thứ người dùng thấy, hoặc `.trim()`; với assertion dùng `toHaveText` (đã chuẩn hoá khoảng trắng).
6. **`strict mode violation` khi đọc một phần tử.** Triệu chứng: `locator.getAttribute: Error: strict mode violation: getByTestId('hotel-card') resolved to 5 elements`. Nguyên nhân: các hàm đọc một giá trị yêu cầu locator khớp đúng một phần tử. Cách sửa: thu hẹp bằng `first()`, `nth()`, `filter()`, hoặc dùng bản số nhiều (`allInnerTexts`, `evaluateAll`) khi muốn cả danh sách.
7. **Đọc thuộc tính khi cần giá trị đang nhập.** Triệu chứng: `getAttribute("value")` trả giá trị cũ dù ô đã được `fill`. Nguyên nhân: thuộc tính HTML là giá trị khởi tạo, còn giá trị hiện tại nằm ở thuộc tính DOM. Cách sửa: dùng `inputValue()` hoặc `toHaveValue`.

## Tóm tắt
- Assertion web-first (`toHaveText`, `toHaveCount`, `toHaveAttribute`) tự thử lại; các hàm đọc (`textContent`, `getAttribute`, `all`, `count`, `allInnerTexts`) chỉ đọc một lần, không chờ.
- `innerText` là thứ người dùng nhìn thấy, `textContent` là DOM thô; chuỗi tiền phải được làm sạch (`replace(/\D/g, "")`) trước khi thành số.
- Duyệt danh sách: `filter` khi chỉ cần chọn hoặc đếm, `for...of` với `all()` khi cần tính theo nhiều trường, `evaluateAll` khi danh sách lớn hoặc cần đọc nguyên tử.
- Kiểm tra sắp xếp bằng cách so mảng đã đọc với `[...mảng].sort(hàmSoSánh)`; kiểm tra "mọi phần tử" bằng vòng lặp hoặc `expect.poll`, luôn kèm khẳng định số lượng để tránh xanh giả với danh sách rỗng.
- Tránh race: chờ chỉ báo ổn định (trạng thái đang tải biến mất, `toHaveCount`, chỉ báo trang hiện tại) rồi mới đọc.

## Bài tập
1. **Đọc một thẻ.** Ở `/lab/hotel` (Hà Nội, 12 đến 15/03), viết test đọc tên, giá (thành số), điểm đánh giá (thành số), `alt` ảnh và `href` của thẻ thứ ba. Xong khi: có 5 `expect` đúng với thẻ "Tây Hồ Lakeview" và dùng `parseVnd` cho giá.
2. **Tổng và trung bình.** Đọc giá của 5 thẻ trang đầu bằng `allInnerTexts`, tính tổng và giá trung bình, so với kết quả của `evaluateAll` cho cùng phép tính. Xong khi: hai cách ra cùng số và test không có `waitForTimeout`.
3. **Kiểm sắp xếp ba kiểu.** Viết một test chạy lần lượt các lựa chọn "Giá tăng dần", "Giá giảm dần", "Đánh giá cao nhất" và với mỗi kiểu so mảng đọc được với bản sắp xếp tương ứng (đọc `data-price`, `data-rating`). Xong khi: có điểm chờ đúng trước mỗi lần đọc và không dùng `.sort()` trần.
4. **Mọi thẻ đều đủ tiện nghi.** Chọn hai tiện nghi, rồi duyệt mọi thẻ qua `data-amenities` để khẳng định thẻ có đủ cả hai; chạy lại với `?bugs=BUG-03` để thấy test đỏ. Xong khi: test có khẳng định số lượng kết quả trước vòng lặp và chạy xanh khi không bật bug.
5. **Bảng người dùng.** Ở `/lab/table`, sắp xếp theo "Ngày tạo", chờ hết "Đang tải…", đọc cột ngày và cột trạng thái của 10 hàng, rồi kiểm tra (a) ngày tăng dần và (b) số hàng "Đã khoá" bằng cả `filter({ hasText })` lẫn đọc mảng. Xong khi: hai cách đếm cho cùng một số, và test vẫn xanh khi mở `?delay=1500`.
