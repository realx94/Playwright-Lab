---
title: HTML và DOM
level: 2
order: 1
minutes: 45
summary: Hiểu cây DOM, thẻ và thuộc tính, các phần tử form thường gặp; dùng DevTools (F12) để xem DOM thật của lab.
keywords: [DOM là gì, shadow DOM, iframe là gì]
---

## Mục tiêu bài học
- Giải thích được sự khác nhau giữa **HTML nguồn** (file văn bản) và **DOM** (cây đối tượng trình duyệt đang giữ).
- Mở DevTools (F12), tìm một phần tử trên trang và đọc được thẻ, thuộc tính, quan hệ cha con của nó.
- Nhận diện các phần tử form (`input`, `select`, `textarea`, `button`, `label`) và các cấu trúc đặc biệt (`iframe`, shadow DOM, `dialog`, `table`).
- Chỉ ra phần tử nào của lab được vẽ bằng thẻ chuẩn và phần tử nào là thành phần tuỳ biến (shadcn/Base UI), vì sao điều đó ảnh hưởng đến cách chọn locator.

## Bạn cần chuẩn bị
- Đã chạy được site lab ở máy (bài 0.2 và 0.3), ví dụ `http://localhost:3000`, hoặc dùng bản site đã deploy.
- Trình duyệt Chrome hoặc Edge (các bước DevTools bên dưới viết theo Chrome; Edge gần như giống hệt, Firefox có tên tab hơi khác).
- Không cần biết lập trình web. Bài này chỉ yêu cầu bạn đọc được HTML.

## Kiến thức cần nắm
- HTML là **văn bản** mô tả trang; DOM là **cây đối tượng** trình duyệt dựng ra từ HTML.
- Thẻ (tag), thuộc tính (`id`, `class`, `name`, `type`, `aria-*`, `data-*`), nội dung văn bản.
- Quan hệ cha, con, anh em, tổ tiên, hậu duệ trong cây.
- Phần tử form: `input`, `select`, `textarea`, `button`, `label`; radio, checkbox, upload.
- Cấu trúc đặc biệt: `iframe`, shadow DOM, `dialog`, `table`.
- Vai trò (role) và tên truy cập được (accessible name): phần tử "mang ý nghĩa" gì với người dùng và công nghệ hỗ trợ.

## Giải thích dễ hiểu

### HTML là bản vẽ, DOM là ngôi nhà
Hãy hình dung HTML như **bản vẽ ngôi nhà**: một file văn bản ghi "có một cái form, trong form có một nhãn Email, một ô nhập...". Khi bạn mở trang, trình duyệt đọc bản vẽ và **xây ngôi nhà** trong bộ nhớ. Ngôi nhà đó gọi là **DOM** (Document Object Model, mô hình đối tượng của tài liệu). Điểm quan trọng nhất:

- Bản vẽ (HTML nguồn) không đổi. Bạn xem bằng cách bấm chuột phải rồi chọn **View page source** (hoặc Ctrl+U).
- Ngôi nhà (DOM) thì **thay đổi liên tục**: JavaScript thêm một thông báo lỗi, xoá một dòng bảng, mở một hộp thoại. Bạn xem DOM hiện tại bằng DevTools, tab **Elements**.

Với các trang hiện đại như lab này (viết bằng React), HTML nguồn gần như trống; gần hết giao diện do JavaScript vẽ vào DOM sau khi trang tải. Đó là lý do khi tìm phần tử bạn luôn nhìn DOM chứ không nhìn View Source.

### Vì sao automation cần hiểu DOM
Playwright không "nhìn" màn hình như con người. Nó **đi tìm phần tử trong cây DOM** (theo một mô tả gọi là locator), rồi gửi tác động: bấm, điền chữ, đọc chữ. Nếu bạn không đọc được DOM, bạn sẽ không biết:

- Vì sao locator của mình khớp nhầm hai phần tử hoặc không khớp phần tử nào.
- Phần tử đang nằm trong `iframe` hay shadow DOM nên cần cách tìm khác.
- Phần tử bạn thấy là "checkbox" thật ra là `span` giả dạng, kèm một `input` ẩn.

### Cấu trúc cây
Xét đoạn HTML nhỏ sau:

```html
<form aria-label="Đăng nhập">
  <label for="email">Email</label>
  <input id="email" type="email" data-testid="email" />
  <button type="submit">Đăng nhập</button>
</form>
```

Cây DOM của nó:

```text
form  (aria-label="Đăng nhập")
 |-- label  (for="email")  -> chữ "Email"
 |-- input  (id="email", type="email", data-testid="email")
 `-- button (type="submit") -> chữ "Đăng nhập"
```

Các từ vựng quan hệ (dùng suốt các bài sau):

| Thuật ngữ | Nghĩa | Ví dụ trong cây trên |
|-----------|-------|----------------------|
| **Cha** (parent) | Phần tử chứa trực tiếp | `form` là cha của `input` |
| **Con** (child) | Phần tử nằm trực tiếp bên trong | `label`, `input`, `button` là con của `form` |
| **Anh em** (sibling) | Cùng cha | `label` và `input` là anh em |
| **Tổ tiên** (ancestor) | Cha, ông, cụ... | `form` là tổ tiên của mọi phần tử bên trong |
| **Hậu duệ** (descendant) | Con, cháu, chắt... | mọi thứ bên trong `form` |

### Thẻ, thuộc tính, nội dung
Một phần tử gồm ba phần: **thẻ** (`input`), **thuộc tính** dạng `tên="giá trị"` (`type="email"`), và **nội dung** giữa thẻ mở và thẻ đóng (chữ "Đăng nhập" trong nút). Một số thuộc tính đáng nhớ với người test:

| Thuộc tính | Dùng để làm gì | Độ ổn định khi chọn locator |
|-----------|----------------|-----------------------------|
| `id` | Định danh duy nhất trong trang, cũng để nối `label for` với `input` | Tốt nếu do con người đặt; kém nếu sinh tự động (ví dụ `base-ui-_r_2_`) |
| `class` | Gán kiểu dáng | Kém: đổi khi thay giao diện |
| `name`, `type`, `value` | Bản chất của ô nhập | Khá ổn định |
| `aria-label`, `aria-labelledby`, `role` | Mô tả cho công nghệ hỗ trợ | Tốt, và là nền của `getByRole` |
| `data-testid` | Dành riêng cho kiểm thử | Rất ổn định nếu nhóm dev cam kết giữ |

### Vai trò và tên truy cập được
Trình duyệt tự suy ra cho mỗi phần tử một **role** (vai trò: `button`, `textbox`, `checkbox`, `heading`...) và một **accessible name** (tên truy cập được: chữ trên nút, nội dung `label` của ô nhập...). Trình đọc màn hình dùng cặp role và name để mô tả trang cho người khiếm thị. Playwright dùng đúng cặp này cho `getByRole` (bài 2.5). Bạn sẽ xem cặp đó ngay bằng DevTools ở phần thực hành.

```diagram
dom-tree
```

## Thực hành từng bước

Tất cả các bước dưới đây dùng **LAB-01 Login** tại `/lab/login` và **LAB-02 Form đa dạng** tại `/lab/forms`. Giả sử site chạy ở `http://localhost:3000`.

### Bước 1. Mở trang lab và mở DevTools

Mục đích: xem "ngôi nhà" thật của trang Login.

1. Mở Chrome, truy cập `http://localhost:3000/lab/login`.
2. Nhấn **F12** (hoặc Ctrl+Shift+I trên Windows; Cmd+Option+I trên macOS). Bạn cũng có thể bấm chuột phải lên trang rồi chọn **Inspect** (Kiểm tra).
3. Ở thanh tab phía trên của DevTools, chọn tab **Elements** (Phần tử).

Kết quả mong đợi: nửa dưới hoặc bên phải cửa sổ hiện một cây HTML có thể mở rộng. Bạn thấy các dòng như `<form novalidate class="..." aria-label="Đăng nhập">`. Mũi tên nhỏ bên trái dòng dùng để thu gọn hoặc mở rộng phần tử. Panel nhỏ phía dưới hoặc bên phải (tab **Styles**) là CSS, hiện chưa cần quan tâm.

Nếu gặp lỗi: DevTools không mở khi bấm F12 có thể do máy chặn phím chức năng (laptop cần bấm Fn+F12). Dùng chuột phải rồi chọn **Inspect** thay thế.

### Bước 2. Chọn một phần tử bằng công cụ "Inspect"

Mục đích: từ thứ nhìn thấy trên trang, nhảy thẳng tới dòng HTML tương ứng.

1. Trong DevTools bấm biểu tượng hình mũi tên trong ô vuông ở góc trên trái (hoặc nhấn Ctrl+Shift+C, macOS Cmd+Shift+C).
2. Di chuột lên ô nhập **Email** trên trang. Ô được tô xanh kèm một nhãn nhỏ cho biết thẻ và kích thước, ví dụ `input#email`.
3. Bấm chuột vào ô đó.

Kết quả mong đợi: tab Elements nhảy tới và tô sáng dòng sau (phần class rất dài, được rút gọn):

```html
<input id="email" data-slot="input" aria-invalid="false" data-testid="email" class="..." type="email" value="">
```

Đọc dòng này: thẻ `input`; `id="email"`; `type="email"` (trình duyệt biết đây là ô email); `data-testid="email"` là mốc kiểm thử mà nhóm dev gắn sẵn; `aria-invalid="false"` cho biết ô đang không lỗi (sau khi bạn gửi dữ liệu sai nó sẽ thành `true`); `data-slot` do thư viện shadcn thêm và bạn không nên dựa vào nó.

### Bước 3. Đọc quan hệ cha con và tìm thẻ label

Mục đích: thấy tận mắt cách `label` nối với `input`.

1. Với dòng `input` đang chọn, nhìn dòng ngay trên nó trong cây: bạn thấy `<label data-slot="label" ... for="email">Email</label>`.
2. Nhìn thụt lề: `label` và `input` cùng thụt vào ở một mức, nghĩa là chúng là **anh em**, cùng nằm trong một thẻ `div`.
3. Bấm mũi tên ở `div` cha để thu gọn: cả cặp label và input cùng biến mất. Bấm lại để mở.

Kết quả mong đợi: bạn xác nhận được `label` có `for="email"` và `input` có `id="email"`. Hai giá trị khớp nhau, đó chính là cách trình duyệt biết "chữ Email" là nhãn của ô nhập. Đây là lý do `page.getByLabel("Email")` tìm được ô này. Thử bấm lên chữ **Email** trên trang: con trỏ nhảy vào ô nhập, một dấu hiệu khác của sự liên kết.

### Bước 4. Xem role và accessible name trong tab Accessibility

Mục đích: biết trình duyệt "hiểu" phần tử thế nào, vì Playwright sẽ chọn theo cách hiểu đó.

1. Chọn lại phần tử `input` Email trong tab Elements.
2. Ở khung bên phải của tab Elements, tìm tab con **Accessibility** (nếu bị ẩn, bấm dấu `>>` để mở rộng danh sách tab con).
3. Mở mục **Computed Properties** nếu có.

Kết quả mong đợi: bạn thấy `Role: textbox` và `Name: Email`. Điều này có nghĩa người dùng và Playwright có thể gọi phần tử này là "ô văn bản tên Email". Câu lệnh tương ứng sẽ là `page.getByRole("textbox", { name: "Email" })`.

Giao diện DevTools có thể thay đổi nhẹ giữa các phiên bản Chrome; nếu không thấy tab con Accessibility, tìm trong menu `>>` hoặc bật tab **Accessibility** trong Settings của DevTools.

### Bước 5. Xem checkbox "Ghi nhớ đăng nhập" (phần tử tuỳ biến)

Mục đích: nhận ra thành phần giao diện không phải thẻ chuẩn.

1. Dùng công cụ Inspect (Ctrl+Shift+C) bấm vào ô vuông của **Ghi nhớ đăng nhập**.
2. Đọc vùng được tô sáng. Bạn sẽ thấy cấu trúc tương tự như sau (đã rút gọn class):

```html
<div class="flex items-center gap-2">
  <span role="checkbox" tabindex="0" aria-checked="false" aria-labelledby="remember-label" data-slot="checkbox"></span>
  <input id="remember" type="checkbox" tabindex="-1" aria-hidden="true" style="...width:1px;height:1px...">
  <label for="remember" id="remember-label">Ghi nhớ đăng nhập</label>
</div>
```

Giải thích: thứ bạn nhìn và bấm là thẻ `span` có `role="checkbox"` (một "checkbox giả" do thư viện Base UI vẽ bằng `span` để dễ tạo kiểu). Ngay cạnh có một `input type="checkbox"` thật nhưng bị thu nhỏ còn 1 pixel và đánh dấu `aria-hidden="true"` (ẩn với công nghệ hỗ trợ), phục vụ gửi form. Hai phần tử cùng gắn với một nhãn. Hệ quả cho locator: tìm theo nhãn có thể gặp cả hai phần tử, còn tìm theo role chỉ gặp `span` đúng (xem mục "Lưu ý với shadcn/Base UI" ở bài 2.5).

Thử bấm vào ô vuông và quan sát: thuộc tính `aria-checked` đổi từ `false` sang `true` và xuất hiện `data-checked` ngay trên dòng HTML. Phần tử đổi màu ngay trong cây, đó chính là "DOM thay đổi theo thời gian thật" như đã nói ở phần giải thích.

### Bước 6. Phân biệt HTML nguồn và DOM hiện tại

Mục đích: tự kiểm chứng sự khác nhau, tránh lỗi phổ biến nhất của người mới.

1. Chuột phải lên trang `/lab/login` rồi chọn **View page source** (Ctrl+U). Tab mới mở ra mã nguồn.
2. Dùng Ctrl+F trong tab đó và tìm `Ghi nhớ đăng nhập`.
3. Quay lại trang Login, trong DevTools mở tab **Elements**, bấm Ctrl+F và tìm cùng chữ đó.

Kết quả mong đợi: Với trang dựng bằng JavaScript, có thể View Source cho ít hoặc không cho kết quả đúng như phần tử bạn thấy, còn tab Elements luôn thấy chính xác dòng `<label ...>Ghi nhớ đăng nhập</label>`. Quy tắc rút ra: **đọc DOM trong tab Elements, đừng đọc View Source**.

### Bước 7. Thử bấm đăng nhập sai để xem DOM thay đổi

Mục đích: quan sát phần tử mới "mọc" ra trong DOM sau một hành động.

1. Trong DevTools, trong tab Elements, giữ cây mở và quan sát khu vực quanh form.
2. Trên trang, để trống Email và Mật khẩu rồi bấm nút **Đăng nhập**.
3. Chú ý dòng HTML của ô Email: `aria-invalid` đổi thành `true` và một đoạn `<p ... data-testid="email-error">` xuất hiện bên dưới nó.

Kết quả mong đợi: DevTools nháy sáng ngắn (màu tím) ở dòng vừa thay đổi. Đoạn thông báo lỗi chưa hề tồn tại lúc trang mới tải; JavaScript đã thêm nó. Đây chính là lý do trong test bạn dùng `await expect(...).toBeVisible()` (chờ phần tử xuất hiện) chứ không kiểm tra ngay.

### Bước 8. Đếm nhanh số phần tử bằng Console

Mục đích: dùng Console để "hỏi" DOM, một kỹ năng sẽ dùng nhiều ở bài CSS và XPath.

1. Bấm tab **Console** trong DevTools (hoặc nhấn phím Esc khi đang ở Elements để mở Console phía dưới).
2. Gõ lệnh sau rồi nhấn Enter:

```js
document.querySelectorAll("input").length
```

Giải thích: `document` là gốc của cây DOM; `querySelectorAll("input")` trả về mọi phần tử thẻ `input`; `.length` là số lượng.

Kết quả mong đợi: một con số, ví dụ `3` (email, mật khẩu và input ẩn của checkbox). Bạn thử thêm hai lệnh nữa:

```js
document.querySelector("#email").getAttribute("type")
```

Kết quả mong đợi: chuỗi `"email"`. Lệnh này lấy phần tử có `id` là `email` rồi đọc thuộc tính `type`. Đây là cách người làm automation kiểm nhanh một selector trước khi đưa vào code.

### Bước 9. Khảo sát form đa dạng của LAB-02

Mục đích: nhận diện phần tử form chuẩn và phần tử tuỳ biến trên cùng một trang.

1. Truy cập `http://localhost:3000/lab/forms`.
2. Dùng Inspect lần lượt lên: ô **Họ tên**, nhóm radio **Giới tính**, **Quốc gia (select native)**, **Thành phố (select tuỳ biến)**, công tắc **Nhận bản tin**, ô **Tệp đính kèm**.
3. Ghi vào bảng sau (bạn tự điền, đáp án mẫu ở cột cuối để đối chiếu).

| Phần tử | Bạn thấy thẻ gì | Đối chiếu |
|---------|-----------------|-----------|
| Họ tên | `input` (không có `type` hoặc `type="text"`) | Ô nhập chuẩn, có `id="name"` |
| Giới tính (Nam) | `span role="radio"` kèm `input type="radio"` ẩn | Tuỳ biến, cha là `div role="radiogroup"` nằm trong `fieldset` có `legend` Giới tính |
| Sở thích | `span role="checkbox"` kèm `input type="checkbox"` ẩn | Tuỳ biến, id `hobby-0`... `hobby-3` |
| Quốc gia | `select` với các `option` | Native, có `value` `vn`, `us`, `jp` |
| Thành phố | `button role="combobox"` (danh sách mở ra mới có `option`) | Tuỳ biến, có `data-testid="city"` |
| Nhận bản tin | `span role="switch"` kèm `input` ẩn | Tuỳ biến |
| Tệp đính kèm | `input type="file"` | Native, dùng `setInputFiles` (bài 2.7) |

Kết quả mong đợi: bạn rút ra được một quy tắc thực tế: **select native** dùng `selectOption`, **select tuỳ biến** phải bấm mở rồi chọn `option`, và **radio, checkbox, switch** nên chọn theo role vì có `input` ẩn đi kèm.

### Bước 10. Nhận diện iframe và shadow DOM ở LAB-13

Mục đích: biết hai "vùng riêng" của DOM mà locator thông thường không tự đi vào được (trường hợp iframe) hoặc đi vào được nhờ cơ chế đặc biệt (shadow DOM).

1. Mở `http://localhost:3000/lab/playground`.
2. Dùng Inspect bấm vào khung **Khung thanh toán** (iframe). Trong Elements bạn thấy `<iframe title="Khung thanh toán" data-testid="payment-frame" srcdoc="...">`. Bấm mũi tên mở nó, bên trong có `#document` rồi `html`, `body`, `form`: đó là **một trang HTML hoàn chỉnh nằm trong trang cha**.
3. Cuộn xuống phần **Shadow DOM**, Inspect nút **Bấm trong shadow**. Bạn thấy `div data-testid="shadow-host"` chứa một dòng `#shadow-root (open)` và nút nằm bên trong dòng đó.

Kết quả mong đợi: bạn thấy rằng iframe và shadow root đều là "đảo" riêng trong cây. Playwright xử lý như sau: locator thường (`getByRole`, `locator`) **xuyên qua shadow DOM mở** tự động; còn với iframe bạn phải dùng `page.frameLocator(...)` để "bước vào" khung (bài 2.10).

## Demo code

Bảng ánh xạ nhanh từ DOM sang locator cho trang Login (chạy được với `baseURL` trỏ vào site lab). Mỗi dòng ghi chú cho biết bạn đã đọc thông tin đó ở đâu trong DevTools.

```ts
import { test, expect } from "@playwright/test";

test("đọc DOM rồi chọn phần tử đúng", async ({ page }) => {
  await page.goto("/lab/login");

  // Role textbox + Name "Email" (xem tab Accessibility, Bước 4)
  const email = page.getByRole("textbox", { name: "Email" });

  // Cùng phần tử, đi qua label for="email" (Bước 3)
  const emailByLabel = page.getByLabel("Email");

  // Cùng phần tử, đi qua data-testid (Bước 2)
  const emailByTestId = page.getByTestId("email");

  // Cả ba trỏ vào đúng một phần tử
  await expect(email).toHaveAttribute("type", "email");
  await expect(emailByLabel).toHaveAttribute("id", "email");
  await expect(emailByTestId).toHaveCount(1);

  // Checkbox tuỳ biến: chọn theo role (Bước 5)
  const remember = page.getByRole("checkbox", { name: "Ghi nhớ đăng nhập" });
  await expect(remember).not.toBeChecked();
  await remember.check();
  await expect(remember).toBeChecked();

  // Phần tử mới "mọc" sau hành động (Bước 7)
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByTestId("email-error")).toBeVisible();
});
```

Giải thích: `toHaveAttribute("type", "email")` kiểm tra thuộc tính trên phần tử trong DOM; `toHaveCount(1)` đảm bảo locator khớp đúng một phần tử; `remember.check()` bấm vào `span` đúng role chứ không phải `input` ẩn.

## Thử ngay trong lab
- Mở [LAB-01 Login](/labs/login) (ứng dụng ở `/lab/login`): làm lại Bước 1 đến Bước 8, ghi ít nhất 3 thuộc tính của ô Email và của nút Đăng nhập.
- Mở [LAB-02 Form đa dạng](/labs/forms) (ứng dụng ở `/lab/forms`): điền bảng ở Bước 9.
- Mở [LAB-13 Playground](/labs/playground) (ứng dụng ở `/lab/playground`): làm Bước 10 để thấy iframe và shadow DOM.

## Lỗi thường gặp
- **Triệu chứng**: Ctrl+F trong View Source không thấy chữ trên màn hình. **Nguyên nhân**: nhầm HTML nguồn với DOM hiện tại; trang do JavaScript vẽ. **Cách sửa**: dùng tab Elements của DevTools.
- **Triệu chứng**: locator không tìm thấy phần tử nằm trong khung thanh toán. **Nguyên nhân**: phần tử nằm trong `iframe`, một tài liệu riêng. **Cách sửa**: dùng `page.frameLocator(...)` (bài 2.10).
- **Triệu chứng**: test chạy hôm nay xanh, sau khi dev build lại thì đỏ vì `#base-ui-_r_2_` không còn. **Nguyên nhân**: dùng `id` hoặc `class` sinh tự động. **Cách sửa**: chọn theo role, label, hoặc `data-testid`.
- **Triệu chứng**: `getByLabel` ra hai phần tử với radio hoặc checkbox. **Nguyên nhân**: thành phần tuỳ biến vừa có `span role=...` vừa có `input` ẩn cùng gắn nhãn. **Cách sửa**: dùng `getByRole("checkbox", { name })`.
- **Triệu chứng**: bạn kiểm tra thông báo lỗi ngay sau khi bấm nhưng test báo không thấy. **Nguyên nhân**: phần tử mới thêm vào DOM sau đó một chút. **Cách sửa**: dùng `await expect(locator).toBeVisible()` vì nó tự thử lại, thay cho đọc trực tiếp một lần.

## Tóm tắt
- HTML là văn bản nguồn; DOM là cây sống trong trình duyệt và thay đổi theo hành động; automation làm việc với DOM.
- Mỗi phần tử có thẻ, thuộc tính, nội dung, và quan hệ cha, con, anh em với phần tử khác.
- DevTools (F12) tab Elements là công cụ số 1 để đọc DOM; Ctrl+Shift+C để chọn phần tử từ trang.
- Role và accessible name (tab Accessibility) là thứ `getByRole` dựa vào.
- Thành phần shadcn/Base UI (radio, checkbox, switch, select tuỳ biến) không phải thẻ chuẩn, nên cần chọn theo role.
- iframe và shadow DOM là "vùng riêng" trong cây, cần cách xử lý riêng.

## Bài tập
1. **Dễ**: Ở trang Login, dùng DevTools tìm ô Email và ghi lại ít nhất 3 thuộc tính của nó cùng ý nghĩa từng thuộc tính. Xong khi bạn ghi được ít nhất `id`, `type`, `data-testid` và giải thích mỗi cái dùng để làm gì.
2. **Dễ**: Tìm một phần tử có `data-testid` trong trang Login (gợi ý: nút Reset) và giải thích vì sao nhóm dev thêm thuộc tính này. Xong khi câu trả lời nêu được lý do "ổn định hơn class và không bị đổi khi chỉnh giao diện".
3. **Vừa**: Điền bảng ở Bước 9 cho đủ 7 dòng bằng quan sát thật, thêm cột "phải dùng cách thao tác nào trong Playwright" (gợi ý: `fill`, `check`, `selectOption`...). Xong khi mọi dòng có thẻ thực tế và cách thao tác.
4. **Vừa**: Dùng Console, viết biểu thức đếm số `label` trên trang LAB-02 và số `input` ẩn (`aria-hidden="true"`). Xong khi bạn nêu được con số và giải thích vì sao số `input` lớn hơn số ô bạn nhìn thấy.
5. **Khó**: Trên LAB-13, chứng minh bằng DevTools rằng nút **Bấm trong shadow** nằm trong shadow root và nút **Thanh toán** nằm trong iframe, rồi mô tả bằng lời cách bạn nghĩ Playwright sẽ tiếp cận từng nút. Xong khi bạn mô tả đúng "iframe cần `frameLocator`, shadow DOM mở thì locator thường vẫn tìm được".
