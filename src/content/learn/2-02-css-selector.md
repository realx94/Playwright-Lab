---
title: CSS Selector
level: 2
order: 2
minutes: 45
summary: Chọn phần tử bằng tag, class, id, thuộc tính, tổ hợp và pseudo-class; kiểm tra selector bằng DevTools trước khi dùng trong Playwright.
keywords: [css selector cheatsheet, nth-child, attribute selector]
---

## Mục tiêu bài học
- Viết được CSS selector theo tag, class, id, thuộc tính và tổ hợp cha con.
- Kiểm tra một selector bằng DevTools (Ctrl+F trong tab Elements và `document.querySelectorAll`) và đếm đúng số phần tử khớp.
- Phân biệt selector bền (gắn với ý nghĩa) và selector mong manh (gắn với vị trí hoặc class sinh tự động).
- Dùng selector trong Playwright bằng `page.locator(...)` và biết khi nào nên nhường chỗ cho `getByRole`.

## Bạn cần chuẩn bị
- Đã đọc bài 2.1 (HTML và DOM) và biết mở DevTools tab Elements.
- Site lab chạy được; bài này dùng **LAB-01 Login** (`/lab/login`) và **LAB-02 Form đa dạng** (`/lab/forms`).

## Kiến thức cần nắm
- Theo tag, class, id: `button`, `.card`, `#email`.
- Theo thuộc tính: `[type="email"]`, `[data-testid="email"]`, `[href^="/lab"]`.
- Tổ hợp: con cháu `a b`, con trực tiếp `a > b`, anh em kế `a + b`, anh em sau `a ~ b`.
- Pseudo-class: `:nth-child(2)`, `:first-child`, `:not(...)`, `:has(...)`.
- Độ đặc hiệu và độ mong manh: selector càng dài, càng gắn vị trí, càng dễ vỡ.

## Giải thích dễ hiểu

### Selector là địa chỉ nhà
CSS selector là **địa chỉ nhà**. "Số 5, đường Lê Lợi" (`#email`) rất chính xác nếu số nhà không đổi. "Ngôi nhà thứ ba bên trái ngã tư thứ hai" (`div > div:nth-child(3)`) đúng hôm nay nhưng sai khi người ta xây thêm một căn mới. Một địa chỉ tốt là địa chỉ **gắn với ý nghĩa** chứ không gắn với vị trí.

CSS selector ban đầu sinh ra để thiết kế kiểu dáng ("mọi nút có class `primary` thì tô xanh"). Playwright mượn cú pháp đó để tìm phần tử. Vì vậy bất kỳ selector nào bạn viết ở bài này cũng có thể dùng trong CSS lẫn trong `page.locator(...)`.

### Vì sao vẫn cần học CSS khi đã có getByRole
Playwright khuyến nghị chọn theo cách người dùng nhìn thấy (`getByRole`, `getByLabel`, bài 2.5). Nhưng CSS vẫn cần vì:

- Một số phần tử không có role hay nhãn rõ ràng (ví dụ vùng chứa để lọc, hoặc `data-testid`).
- Bạn sẽ đọc code của người khác, đọc báo cáo lỗi, và dùng `locator(...)` làm lối thoát khi không còn cách nào khác.
- Bạn cần kỹ năng đọc "selector ra sao thì sẽ vỡ" để đánh giá rủi ro.

### Bảng cú pháp cơ bản

| Cú pháp | Nghĩa | Ví dụ | Khớp gì ở trang Login |
|---------|-------|-------|-----------------------|
| `tag` | Mọi phần tử thẻ đó | `input` | 2 ô nhập và `input` ẩn của checkbox |
| `#id` | Phần tử có id | `#email` | Ô Email |
| `.class` | Phần tử có class | `.space-y-4` | Thẻ `form` (class do Tailwind sinh ra) |
| `[attr]` | Có thuộc tính | `[aria-invalid]` | Hai ô nhập |
| `[attr="v"]` | Thuộc tính bằng giá trị | `[type="password"]` | Ô Mật khẩu |
| `[attr^="v"]` | Bắt đầu bằng | `[id^="rem"]` | Phần tử có id bắt đầu bằng `rem` |
| `[attr$="v"]` | Kết thúc bằng | `[id$="word"]` | Ô `#password` |
| `[attr*="v"]` | Chứa | `[id*="ass"]` | Ô `#password` |
| `a b` | `b` là hậu duệ của `a` | `form input` | Mọi `input` trong form |
| `a > b` | `b` là con trực tiếp của `a` | `form > h2` | Tiêu đề Đăng nhập |
| `a + b` | `b` ngay sau `a` (anh em kế) | `label + input` | Input nằm ngay sau label |
| `a ~ b` | `b` là anh em đứng sau `a` | `label ~ p` | Thông báo lỗi sau label |
| `a, b` | Hoặc `a` hoặc `b` | `h2, h3` | Cả hai loại tiêu đề |
| `:first-child` | Là con đầu tiên của cha | `div:first-child` | |
| `:nth-child(n)` | Là con thứ n | `li:nth-child(2)` | |
| `:not(x)` | Loại trừ | `input:not([type="password"])` | |
| `:has(x)` | Chứa bên trong | `div:has(> #email)` | Khối chứa ô Email |

Lưu ý quan trọng về nháy: trong CSS bạn có thể viết `[type=email]` hay `[type="email"]`. Hãy luôn viết có nháy kép cho giá trị có ký tự đặc biệt (`-`, khoảng trắng, dấu `.`).

### Độ mong manh
Hãy xếp độ bền từ cao xuống thấp (với cùng một phần tử):

1. `[data-testid="email"]`: thuộc tính dành riêng cho test, nhóm dev cam kết giữ.
2. `#email`: id do con người đặt, ổn định nếu không ai đổi.
3. `form[aria-label="Đăng nhập"] input[type="email"]`: gắn với ý nghĩa nhưng dài.
4. `form > div:nth-child(2) > input`: gắn với vị trí; thêm một dòng vào form là vỡ.
5. `.h-8.w-full.min-w-0.rounded-lg`: gắn với class kiểu dáng; đổi giao diện là vỡ.

## Thực hành từng bước

Tất cả các bước dùng trang `http://localhost:3000/lab/login` (thay cổng nếu site của bạn khác).

### Bước 1. Mở DevTools và ô tìm kiếm selector

Mục đích: có một "sân thử" để kiểm tra selector trước khi viết code.

1. Mở trang Login, nhấn F12, chọn tab **Elements**.
2. Bấm vào bất kỳ dòng nào trong cây Elements (để focus vào panel này).
3. Nhấn **Ctrl+F** (macOS: Cmd+F). Một thanh tìm kiếm nhỏ hiện ở đáy panel Elements.

Kết quả mong đợi: thanh tìm có chỗ gõ và bên phải hiện dạng `0 of 0` (số kết quả). Thanh tìm này hiểu cả chữ thường, CSS selector và XPath, nên bạn dùng nó để thử selector.

### Bước 2. Thử selector theo id

Mục đích: chọn đúng một phần tử bằng id.

Gõ vào thanh tìm:

```text
#email
```

Giải thích: dấu `#` nghĩa là "phần tử có `id` bằng", theo sau là giá trị id.

Kết quả mong đợi: bên phải thanh tìm hiện `1 of 1` và dòng `<input id="email" ...>` được tô vàng trong cây. Số "1 of 1" cho biết bạn khớp đúng một phần tử, một selector tốt phải cho đúng số lượng bạn muốn.

### Bước 3. Thử selector theo thuộc tính

Mục đích: chọn bằng thuộc tính cụ thể, cách phổ biến nhất khi làm automation.

Gõ lần lượt từng dòng (xoá dòng cũ trước khi gõ dòng mới):

```text
[data-testid="email"]
```

```text
input[type="password"]
```

```text
[aria-invalid="false"]
```

Giải thích: ngoặc vuông chọn theo thuộc tính. `input[type="password"]` đọc là "thẻ `input` có `type` bằng `password`". Bạn có thể ghép thẻ với điều kiện thuộc tính, không để khoảng trắng giữa chúng.

Kết quả mong đợi: dòng đầu cho `1 of 1`, dòng hai cho `1 of 1`, dòng ba cho `2 of 2` (cả hai ô Email và Mật khẩu khi chưa có lỗi). Nếu bạn gửi form trống rồi tìm lại `[aria-invalid="false"]` kết quả sẽ khác: lúc đó cả hai ô đều có `aria-invalid="true"`.

### Bước 4. Thử tổ hợp cha con

Mục đích: thu hẹp phạm vi bằng quan hệ trong cây.

Gõ lần lượt:

```text
form input
```

```text
form > input
```

```text
label + input
```

Giải thích: khoảng trắng nghĩa là "hậu duệ ở bất kỳ độ sâu nào". Dấu `>` nghĩa là "con trực tiếp". Dấu `+` nghĩa là "ngay sau, cùng cha".

Kết quả mong đợi: `form input` khớp 3 phần tử (hai ô nhập và `input` ẩn của checkbox). `form > input` khớp `0 of 0`, vì các `input` nằm trong các `div` trung gian chứ không là con trực tiếp của `form`; đây là lỗi hay gặp khi người mới dùng `>` mà quên các tầng trung gian. `label + input` khớp 2 phần tử: ô Email và ô Mật khẩu, vì ở hai ô này `input` đứng ngay sau `label`. Ở dòng "Ghi nhớ đăng nhập" thứ tự lại là `input` rồi mới đến `label`, nên `input` ẩn đó không khớp. Đây là ví dụ cho thấy `+` phụ thuộc thứ tự các phần tử trong DOM.

Nếu số bạn thấy khác mô tả, đó là điều bình thường vì giao diện có thể được cập nhật. Quan trọng là bạn biết đọc con số `X of Y` và giải thích được vì sao.

### Bước 5. Thử pseudo-class

Mục đích: lọc bằng điều kiện nâng cao.

Gõ lần lượt:

```text
input:not([type="password"])
```

```text
form button:first-of-type
```

```text
div:has(> #email)
```

Giải thích: `:not(...)` loại trừ các phần tử khớp điều kiện bên trong; `:first-of-type` lấy phần tử đầu tiên của cùng loại thẻ trong cha; `:has(...)` chọn phần tử **chứa** một phần tử khác (dấu `>` bên trong chỉ con trực tiếp).

Kết quả mong đợi: dòng đầu khớp ô Email và `input` ẩn của checkbox; dòng hai khớp nút **Đăng nhập** (nút đầu tiên trong form); dòng ba khớp đúng `div` bọc ô Email, tức là bạn đã đi ngược lên cha, điều mà CSS truyền thống không làm được.

### Bước 6. Kiểm tra bằng Console

Mục đích: lấy con số khớp và nội dung trực tiếp, độc lập với thanh tìm.

Mở tab **Console** và gõ:

```js
document.querySelectorAll('[data-testid="email"]').length
```

Giải thích: `querySelectorAll` nhận chuỗi CSS selector và trả về danh sách mọi phần tử khớp; `.length` là số lượng. Dùng nháy đơn ngoài, nháy kép trong để chuỗi không bị cắt.

Kết quả mong đợi: `1`. Tiếp theo thử:

```js
document.querySelector('[data-testid="email"]').outerHTML
```

Giải thích: `querySelector` (không có `All`) trả về phần tử đầu tiên khớp; `outerHTML` là chuỗi HTML của phần tử. Kết quả mong đợi: một chuỗi bắt đầu bằng `<input id="email" ...`. Nếu selector sai, Console báo `TypeError: Cannot read properties of null`, nghĩa là không có phần tử nào khớp.

### Bước 7. Dùng selector trong Playwright

Mục đích: chuyển selector đã thử trong DevTools thành code test.

Tạo file `tests/css-selector.spec.ts` (hoặc trong thư mục `e2e` nếu bạn đang làm trong repo của site) với nội dung:

```ts
import { test, expect } from "@playwright/test";

test("chọn phần tử bằng CSS selector", async ({ page }) => {
  await page.goto("/lab/login");

  // Theo thuộc tính data-testid: ổn định nhất trong các cách dùng CSS
  await page.locator('[data-testid="email"]').fill("user@lab.dev");

  // Theo id
  await page.locator("#password").fill("Passw0rd!");

  // Tag + thuộc tính
  await page.locator('button[type="submit"]').click();

  // Sau khi đăng nhập hợp lệ, vùng dashboard xuất hiện
  await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
});
```

Giải thích từng dòng: `page.locator(...)` nhận chuỗi selector; Playwright hiểu chuỗi đó là CSS (nếu không bắt đầu bằng `xpath=` hay `//`). `fill` điền chữ vào ô. `button[type="submit"]` chỉ khớp nút Đăng nhập (nút Reset có `type="button"`). `toBeVisible` chờ cho tới khi phần tử hiện.

Chạy test:

```bash
npx playwright test css-selector
```

Giải thích: `npx playwright test` chạy test; đối số `css-selector` là bộ lọc theo tên file (bài 2.4 giải thích chi tiết).

Kết quả mong đợi:

```text
Running 1 test using 1 worker
  1 passed (3s)
```

Nếu gặp lỗi `strict mode violation: locator('input') resolved to 3 elements`: selector của bạn khớp nhiều hơn một phần tử, hãy thêm điều kiện (ví dụ `[type="password"]`) để chỉ còn một.

### Bước 8. Đánh giá độ bền của nhiều selector cho cùng một nút

Mục đích: tự rút kinh nghiệm chọn selector.

Với nút **Đăng nhập** trên trang Login, viết 4 selector rồi thử từng cái bằng thanh tìm, ghi lại "khớp bao nhiêu phần tử":

```text
button[type="submit"]
form button:first-of-type
form > button:nth-of-type(1)
.w-full.bg-primary
```

Kết quả mong đợi: 3 cái đầu khớp đúng 1 nút; `.w-full.bg-primary` thì cũng khớp 1 nút nhưng dựa trên class Tailwind (kiểu dáng), nên gần như chắc chắn vỡ khi nhóm dev đổi màu hay kích thước. Xếp hạng độ bền gợi ý: `button[type="submit"]` tốt hơn `form button:first-of-type`, rồi tới `form > button:nth-of-type(1)`, cuối cùng là selector theo class. Selector tốt nhất cho nút này trong Playwright vẫn là `getByRole("button", { name: "Đăng nhập" })`, vì nó gắn với điều người dùng nhìn thấy.

## Demo code

Một file hoàn chỉnh trình bày các nhóm selector trên LAB-01 và LAB-02, kèm so sánh với `getByRole`:

```ts
import { test, expect } from "@playwright/test";

test.describe("CSS selector trên các lab", () => {
  test("Login: tag, id, thuộc tính, tổ hợp", async ({ page }) => {
    await page.goto("/lab/login");

    // id
    await expect(page.locator("#email")).toHaveCount(1);
    // tag + thuộc tính
    await expect(page.locator('input[type="password"]')).toHaveCount(1);
    // con cháu: mọi input trong form (2 ô nhập + 1 input ẩn của checkbox)
    await expect(page.locator("form input")).toHaveCount(3);
    // loại trừ: chỉ ô không phải mật khẩu
    await expect(page.locator('input:not([type="password"])')).toHaveCount(2);
    // chứa: khối bọc ô Email
    await expect(page.locator("div:has(> #email)")).toHaveCount(1);
  });

  test("Forms: select native và thuộc tính", async ({ page }) => {
    await page.goto("/lab/forms");

    // select native có id country và 4 option (kể cả option rỗng)
    await expect(page.locator("#country > option")).toHaveCount(4);
    // chọn theo value của option
    await page.locator("#country").selectOption("vn");
    await expect(page.locator("#country")).toHaveValue("vn");
    // thuộc tính chứa chuỗi
    await expect(page.locator('input[id^="hobby-"]')).toHaveCount(4);
  });

  test("so sánh với cách hướng người dùng", async ({ page }) => {
    await page.goto("/lab/login");
    // Hai dòng sau cùng chọn một nút
    const byCss = page.locator('button[type="submit"]');
    const byRole = page.getByRole("button", { name: "Đăng nhập" });
    await expect(byCss).toHaveCount(1);
    await expect(byRole).toHaveCount(1);
  });
});
```

Giải thích: `toHaveCount(n)` kiểm tra số phần tử khớp và tự thử lại tới khi đúng (hoặc hết thời gian). Selector `#country > option` dùng `>` vì `option` là con trực tiếp của `select`. `input[id^="hobby-"]` khớp bốn `input` ẩn của bốn checkbox sở thích (id `hobby-0` đến `hobby-3`). Playwright còn hỗ trợ một số mở rộng ngoài CSS chuẩn như `:has-text("...")` và `:visible`; chúng tiện nhưng dễ lạm dụng, ưu tiên `filter` ở bài 2.6.

## Thử ngay trong lab
- [LAB-01 Login](/labs/login), ứng dụng tại `/lab/login`: làm Bước 2 đến Bước 6 trong DevTools. Gửi form trống một lần rồi tìm lại `[data-testid$="-error"]` để thấy các thông báo lỗi xuất hiện.
- [LAB-02 Form đa dạng](/labs/forms), ứng dụng tại `/lab/forms`: tìm `input[type="file"]`, `#country` và `[data-testid="city"]`, ghi số phần tử khớp.

## Lỗi thường gặp
- **Triệu chứng**: `strict mode violation: locator('input') resolved to 3 elements`. **Nguyên nhân**: selector quá rộng. **Cách sửa**: thêm thuộc tính hoặc dùng bộ lọc để còn đúng một phần tử.
- **Triệu chứng**: `Timeout 30000ms exceeded` với `waiting for locator('.css-1a2b3c')`. **Nguyên nhân**: dùng class sinh tự động, đã đổi sau lần build. **Cách sửa**: chuyển sang `data-testid`, id do người đặt, hoặc `getByRole`.
- **Triệu chứng**: selector `form > input` khớp 0 phần tử dù trang có input. **Nguyên nhân**: giữa `form` và `input` còn thẻ trung gian (`div`). **Cách sửa**: dùng khoảng trắng (hậu duệ) hoặc nhắm trực tiếp bằng thuộc tính.
- **Triệu chứng**: test đúng hôm nay, sai sau khi thêm một trường vào form. **Nguyên nhân**: phụ thuộc vị trí (`:nth-child`). **Cách sửa**: gắn selector với ý nghĩa (nhãn, role, testid).
- **Triệu chứng**: `SyntaxError` hoặc `Unexpected token` khi selector có ký tự đặc biệt. **Nguyên nhân**: id có dấu hai chấm hoặc số đứng đầu (ví dụ `#1abc`). **Cách sửa**: dùng dạng thuộc tính `[id="1abc"]`.

## Tóm tắt
- CSS selector là địa chỉ chọn phần tử; gắn với ý nghĩa thì bền, gắn với vị trí hoặc class kiểu dáng thì dễ vỡ.
- Thanh tìm (Ctrl+F) trong tab Elements và `document.querySelectorAll` giúp kiểm tra selector và đếm số phần tử khớp.
- `[data-testid="..."]` và id do người đặt là hai lựa chọn CSS bền nhất.
- Dùng `page.locator(selector)` trong Playwright; selector khớp nhiều phần tử sẽ gây strict mode violation khi thao tác.
- Luôn ưu tiên `getByRole` và `getByLabel` (bài 2.5), CSS là phương án sau.

## Bài tập
1. **Dễ**: Viết 3 selector khác nhau cho nút **Đăng nhập** ở LAB-01 và kiểm tra từng cái bằng Ctrl+F. Xong khi cả ba đều cho `1 of 1`.
2. **Dễ**: Xếp hạng độ ổn định 3 selector đó và giải thích bằng một câu cho mỗi cái. Xong khi bạn chỉ ra được cái nào phụ thuộc vị trí, cái nào phụ thuộc class.
3. **Vừa**: Trên LAB-02 viết selector cho từng loại phần tử: ô Họ tên, select native, ô tải tệp, bốn checkbox sở thích (bằng một selector duy nhất). Xong khi mỗi selector đếm đúng số phần tử mong muốn trong Console.
4. **Vừa**: Viết một test Playwright dùng `page.locator` với CSS để đăng nhập thành công ở LAB-01 và kiểm tra khối `dashboard`. Xong khi `npx playwright test` báo `1 passed`.
5. **Khó**: Viết selector chọn "khối bọc ô Mật khẩu" bằng `:has(...)`, và selector chọn thông báo lỗi của ô Email sau khi gửi form trống. Xong khi bạn đếm đúng 1 phần tử cho mỗi selector và giải thích vì sao thông báo lỗi chỉ xuất hiện sau khi bấm Đăng nhập.
