---
title: "Thao tác chuột và bàn phím: hover, double click, chuột phải, kéo thả, phím tắt"
level: 2
order: 16
minutes: 75
summary: Làm chủ hover, dblclick, click chuột phải và phím bổ trợ, dragTo và mouse từng bước, keyboard.press, focus, phím tắt toàn trang, mouse.wheel; thực hành trên bảng Kanban LAB-30.
keywords: [playwright hover, playwright dragTo, playwright dblclick, playwright right click, keyboard.press, page.mouse.wheel, playwright drag and drop]
---

## Mục tiêu bài học
- Dùng đúng `hover`, `dblclick`, `click({ button: 'right' })` và `click({ modifiers })` cho các giao diện có tooltip, sửa tại chỗ, menu chuột phải.
- Viết được test kéo thả bằng `dragTo` (có `targetPosition`) và biết khi nào phải chuyển sang `page.mouse.move/down/up` từng bước.
- Gõ phím đơn, tổ hợp phím (`Control+A`, `Alt+ArrowRight`) bằng `keyboard.press`, phân biệt `keyboard.type` với `pressSequentially`, và biết vì sao phải `focus` đúng chỗ trước khi bấm phím tắt.
- Cuộn một vùng bằng `page.mouse.wheel` và kiểm tra nội dung xuất hiện khi hover (tooltip, nút ẩn).
- Chẩn đoán được hai lỗi hay gặp: thả sai chỗ do phần tử khác nằm đè, và phím tắt không có tác dụng vì focus nằm sai nơi.

## Bạn cần chuẩn bị
- Đã học bài 2.5 (locator hướng người dùng), 2.7 (actions) và 2.9 (auto-wait): bài này giả định bạn đã biết `click`, `fill` và khái niệm actionability.
- Chạy được site học tập (`npm run dev`) và mở lab Kanban ở `/lab/kanban`. Trang mô tả quy tắc nghiệp vụ của lab nằm ở `/labs/kanban`.
- Đọc nhanh `/labs/kanban` để biết lab có gì: ba cột Cần làm, Đang làm, Xong; cột Đang làm tối đa 3 thẻ (WIP); sửa tiêu đề bằng double click; menu chuột phải; phím tắt N, Alt+mũi tên, Delete, Ctrl+Z.

## Kiến thức cần nắm
- `hover()` đưa con trỏ vào giữa phần tử (sau khi cuộn tới và chờ ổn định) để kích hoạt `mouseenter`, `:hover`, tooltip.
- `dblclick()` gửi hai lần nhấn liên tiếp mà trình duyệt nhận là một double click.
- `click({ button: 'right' })` gửi sự kiện `contextmenu`; `click({ modifiers: [...] })` giữ phím bổ trợ trong lúc nhấn.
- `dragTo(target)` là lối tắt cho chuỗi: di chuột tới nguồn, nhấn giữ, di tới đích, thả.
- `page.mouse` (`move`, `down`, `up`, `wheel`) và `page.keyboard` (`press`, `down`, `up`, `type`, `insertText`) là tầng thấp, không chờ actionability.
- `locator.press` và `locator.pressSequentially` gửi phím vào một phần tử cụ thể (tự focus trước).

## Giải thích dễ hiểu

Hãy hình dung bạn dạy một người chưa từng dùng máy tính cách sắp xếp thẻ trên bảng công việc. Bạn không nói "đổi giá trị thuộc tính cột của thẻ", mà nói: "đưa tay chuột vào thẻ, nhấn giữ, kéo sang cột bên cạnh rồi nhả ra". Playwright làm đúng như vậy: các lệnh `hover`, `dblclick`, `dragTo` mô phỏng **hành vi vật lý** của người dùng, từ đó kích hoạt đúng chuỗi sự kiện mà ứng dụng đang lắng nghe (`mouseenter`, `dblclick`, `contextmenu`, `dragstart`, `dragover`, `drop`, `keydown`...).

Điều này giải thích hai điều tưởng khó hiểu.

Thứ nhất, **vị trí con trỏ rất quan trọng**. Mặc định Playwright nhấn vào điểm giữa của phần tử. Với kéo thả, "điểm giữa của cột" có thể đang nằm trên một thẻ khác, nên thẻ được chèn vào trước thẻ đó thay vì xuống cuối cột. Người dùng thật cũng sẽ thả nhầm chỗ như vậy; bạn phải nói rõ điểm thả bằng `targetPosition`.

Thứ hai, **bàn phím luôn đi vào phần tử đang focus**. Phím tắt kiểu "Alt+mũi tên phải để chuyển thẻ sang cột kế" chỉ có nghĩa khi thẻ đang được focus; `keyboard.press` không chọn phần tử cho bạn, nó chỉ bấm phím vào bất cứ chỗ nào đang giữ focus. Trước khi bấm phím tắt, test phải đưa focus tới đúng nơi (bằng `focus()` hoặc một cú click).

Về thuật ngữ: **modifier** (phím bổ trợ) là các phím `Shift`, `Control`, `Alt`, `Meta` giữ cùng lúc với thao tác chính; **context menu** (menu ngữ cảnh) là menu hiện ra khi bấm chuột phải; **WIP limit** (giới hạn công việc dở dang) là số thẻ tối đa được phép nằm trong cột Đang làm; **HTML5 drag and drop** là bộ sự kiện chuẩn của trình duyệt (`dragstart`, `dragover`, `drop`) áp dụng cho phần tử có thuộc tính `draggable`.

### Khi nào dùng lệnh cấp cao, khi nào dùng cấp thấp
Lệnh cấp cao (`locator.hover`, `locator.dragTo`, `locator.press`) kiểm tra actionability, tự cuộn, tự chờ và báo lỗi dễ hiểu. Lệnh cấp thấp (`page.mouse`, `page.keyboard`) thực thi ngay, không chờ gì cả và không biết "phần tử" là gì: chỉ biết toạ độ và phím. Quy tắc: bắt đầu bằng cấp cao; chỉ xuống cấp thấp khi cấp cao không đủ (ví dụ thư viện kéo thả cần nhiều bước di chuột, hoặc cần cuộn bằng bánh xe chuột).

## Thực hành từng bước

Mọi ví dụ dưới đây chạy trên `/lab/kanban` với `baseURL` của dự án. Dữ liệu ban đầu: Cần làm có Thiết kế trang đăng nhập, Viết tài liệu API, Sửa lỗi giỏ hàng; Đang làm có Tối ưu truy vấn, Review PR số 42; Xong có Cấu hình CI. Mỗi test nên bắt đầu bằng việc bấm nút **Reset dữ liệu lab** để dữ liệu (lưu trong `localStorage`) không rò rỉ giữa các lần chạy.

### Bước 1. Dựng hàm hỗ trợ dùng chung
Mục đích: tránh lặp lại việc mở trang, reset và tìm thẻ theo tiêu đề.

```ts
import { test, expect, type Page } from "@playwright/test";

async function openBoard(page: Page) {
  await page.goto("/lab/kanban");
  await page.getByTestId("reset-data").click();
}

// Thẻ theo tiêu đề: lọc các thẻ có chứa chữ cần tìm
const card = (page: Page, title: string) =>
  page.getByTestId("card").filter({ hasText: title });

// Danh sách tiêu đề của một cột: col là "todo", "doing" hoặc "done"
const titles = (page: Page, col: string) =>
  page.getByTestId(`col-${col}`).getByTestId("card-title");
```

| Dòng | Ý nghĩa |
|------|---------|
| `page.goto("/lab/kanban")` | Mở ứng dụng lab (không có header của site). |
| `getByTestId("reset-data").click()` | Xoá dữ liệu cũ và nạp dữ liệu mẫu. |
| `getByTestId("card").filter({ hasText })` | Mỗi thẻ là một phần tử `li` có `data-testid="card"`; `filter` thu hẹp theo chữ bên trong. |
| `getByTestId("col-done")` | Mỗi cột là một `section` có `data-testid="col-<mã cột>"`. |

Kết quả mong đợi: chưa có test nào chạy; hàm chỉ là công cụ. Nếu `getByTestId` không khớp, kiểm tra bạn đang ở `/lab/kanban`, không phải `/labs/kanban` (trang mô tả không chứa ứng dụng).

### Bước 2. hover: làm hiện nút "Xoá nhanh"
Mục đích: kiểm tra phần tử chỉ xuất hiện khi di chuột vào thẻ.

```ts
test("hover hiện nút Xoá nhanh", async ({ page }) => {
  await openBoard(page);
  const c = card(page, "Cấu hình CI");
  const quick = c.getByRole("button", { name: "Xoá nhanh" });

  await expect(quick).toHaveCount(0);   // chưa hover thì nút chưa có trong DOM
  await c.hover();                       // đưa con trỏ vào giữa thẻ
  await expect(quick).toBeVisible();     // nút hiện ra

  // di chuột ra chỗ khác: nút biến mất
  await page.getByRole("heading", { name: "LAB-30 · Bảng công việc Kanban" }).hover();
  await expect(quick).toBeHidden();
});
```

- `c.hover()` cuộn thẻ vào vùng nhìn thấy, chờ nó ổn định, rồi đặt con trỏ vào giữa. Ứng dụng nhận `mouseenter` và vẽ thêm nút.
- `toHaveCount(0)` được chọn thay cho `toBeHidden` ở đầu test vì nút lúc đó chưa tồn tại trong DOM; cả hai đều đúng, nhưng `toHaveCount(0)` nói rõ ý "chưa được tạo".
- Hover vào tiêu đề trang để rời khỏi thẻ: `mouseleave` được kích hoạt và nút bị gỡ.

Kết quả mong đợi: test xanh. Nếu `toBeVisible` đỏ, nguyên nhân thường gặp là hover vào phần tử khác với phần tử mà ứng dụng gắn `mouseenter` (trong lab này là chính thẻ `li`).

Hover cũng là cách kiểm tra **tooltip**. Với tooltip thuần HTML bằng thuộc tính `title` (như nút khoá Admin ở lab `/lab/table`), bạn không thấy bong bóng trong DOM; hãy kiểm tra thuộc tính: `await expect(nut).toHaveAttribute("title", "Không thể khoá Admin")`. Với tooltip tự vẽ (một `div role="tooltip"`), quy trình là `hover()` rồi `expect(page.getByRole("tooltip")).toBeVisible()`.

### Bước 3. dblclick: sửa tiêu đề tại chỗ
Mục đích: kích hoạt chế độ sửa bằng double click, sau đó gõ và lưu bằng Enter.

```ts
test("dblclick để sửa tiêu đề", async ({ page }) => {
  await openBoard(page);
  await card(page, "Cấu hình CI").getByTestId("card-title").dblclick();

  const input = page.getByRole("textbox", { name: "Sửa tiêu đề thẻ" });
  await expect(input).toBeFocused();   // ô sửa tự nhận focus
  await input.fill("Cấu hình CI/CD");
  await input.press("Enter");

  await expect(titles(page, "done")).toHaveText(["Cấu hình CI/CD"]);
});
```

- `dblclick()` phát hai lần nhấn nhanh liên tiếp; sự kiện `dblclick` của ứng dụng chạy và thẻ chuyển sang chế độ sửa.
- `getByRole("textbox", { name: "Sửa tiêu đề thẻ" })` khớp `aria-label` của ô nhập.
- `fill` thay toàn bộ nội dung (ô nhập tự chọn hết chữ cũ khi focus); `press("Enter")` lưu.
- `toHaveText([...])` với mảng so sánh theo thứ tự cả danh sách, nên vừa kiểm tra giá trị mới vừa kiểm tra không còn thẻ thừa.

Kết quả mong đợi: tiêu đề đổi thành "Cấu hình CI/CD". Nếu thay `dblclick()` bằng `click()` hai lần cách nhau bởi một thao tác khác, ứng dụng không nhận double click và ô sửa không hiện: hãy dùng đúng lệnh `dblclick`.

### Bước 4. Chuột phải và phím bổ trợ
Mục đích: mở menu ngữ cảnh và chọn mục trong đó.

```ts
test("menu chuột phải: nhân bản thẻ", async ({ page }) => {
  await openBoard(page);
  await card(page, "Viết tài liệu API").click({ button: "right" });

  const menu = page.getByRole("menu", { name: "Menu thẻ" });
  await expect(menu.getByRole("menuitem")).toHaveText([
    "Mở chi tiết", "Đổi màu", "Nhân bản", "Xoá",
  ]);

  await page.getByRole("menuitem", { name: "Nhân bản" }).click();
  await expect(titles(page, "todo")).toHaveText([
    "Thiết kế trang đăng nhập",
    "Viết tài liệu API",
    "Viết tài liệu API (bản sao)",
    "Sửa lỗi giỏ hàng",
  ]);
});
```

- `click({ button: 'right' })` gửi sự kiện `contextmenu`; ứng dụng chặn menu mặc định của trình duyệt và vẽ menu riêng tại vị trí con trỏ.
- Menu có `role="menu"` và `aria-label="Menu thẻ"`, các mục là `menuitem`, nên locator theo role chạy ổn định.
- Giá trị `button` hợp lệ: `'left'` (mặc định), `'right'`, `'middle'`.

Phím bổ trợ đi kèm click dùng tuỳ chọn `modifiers`:

```ts
// Shift + click, Ctrl (macOS: Command) + click
await card(page, "Cấu hình CI").click({ modifiers: ["Shift"] });
await card(page, "Cấu hình CI").click({ modifiers: ["ControlOrMeta"] });

// Click vào một điểm cụ thể bên trong phần tử (toạ độ so với góc trên trái)
await card(page, "Cấu hình CI").click({ position: { x: 10, y: 10 } });
```

`ControlOrMeta` tự chọn Control trên Windows/Linux và Command trên macOS, nên test chạy được trên mọi máy. Kanban không có hành vi riêng cho Shift hay Ctrl + click, nên hai dòng đầu chỉ minh hoạ cú pháp (chúng chạy không lỗi); hãy dùng chúng ở những ứng dụng có chọn nhiều dòng như bảng hoặc danh sách tệp.

Kết quả mong đợi: bản sao xuất hiện ngay sau thẻ gốc, tên có hậu tố "(bản sao)". Nếu menu không hiện, kiểm tra bạn truyền `button: "right"` chứ không phải `"left"`.

### Bước 5. dragTo: chuyển thẻ giữa các cột
Mục đích: kéo thẻ sang cột khác bằng lệnh một dòng.

```ts
test("kéo thẻ sang cột Xong", async ({ page }) => {
  await openBoard(page);
  await card(page, "Sửa lỗi giỏ hàng").dragTo(page.getByTestId("drop-done"));

  await expect(titles(page, "done")).toHaveText(["Cấu hình CI", "Sửa lỗi giỏ hàng"]);
  await expect(page.getByTestId("kb-message"))
    .toHaveText("Đã chuyển “Sửa lỗi giỏ hàng” sang Xong");
});
```

- `dragTo(target)` thực hiện: di chuột tới nguồn, nhấn, di chuột tới đích, thả. Mặc định nhắm vào điểm giữa của cả nguồn lẫn đích.
- `drop-done` là vùng thả của cột Xong (`data-testid="drop-done"`). Cột này mới có một thẻ nên điểm giữa của vùng thả là chỗ trống, thẻ được xếp xuống cuối.
- Thông báo trạng thái đặt trong phần tử có `data-testid="kb-message"`, vai trò `status`.

Kết quả mong đợi: thẻ nằm cuối cột Xong. Lưu ý về dấu nháy trong thông báo: ứng dụng dùng nháy cong “ ”, hãy sao chép đúng ký tự khi viết `toHaveText`.

### Bước 6. targetPosition: thả đúng chỗ
Mục đích: hiểu vì sao "điểm giữa" đôi khi sai, và điều khiển điểm thả.

```ts
test("kéo vào cột Đang làm: thả xuống phần trống ở đáy", async ({ page }) => {
  await openBoard(page);

  // Điểm giữa của vùng thả cột Đang làm đang nằm trên thẻ "Review PR số 42",
  // nên thả mặc định sẽ chèn TRƯỚC thẻ đó.
  await card(page, "Sửa lỗi giỏ hàng").dragTo(page.getByTestId("drop-doing"));
  await expect(titles(page, "doing")).toHaveText([
    "Tối ưu truy vấn", "Sửa lỗi giỏ hàng", "Review PR số 42",
  ]);
  await expect(page.getByTestId("count-doing")).toHaveText("3/3");
});

test("thả xuống cuối cột bằng targetPosition", async ({ page }) => {
  await openBoard(page);
  const zone = page.getByTestId("drop-todo");
  const box = (await zone.boundingBox())!;   // hình chữ nhật của vùng thả

  await card(page, "Thiết kế trang đăng nhập").dragTo(zone, {
    targetPosition: { x: box.width / 2, y: box.height - 6 }, // sát đáy, vùng trống
  });
  await expect(titles(page, "todo")).toHaveText([
    "Viết tài liệu API", "Sửa lỗi giỏ hàng", "Thiết kế trang đăng nhập",
  ]);
});
```

- `boundingBox()` trả về `{ x, y, width, height }` theo toạ độ trang; `targetPosition` lại tính từ góc trên trái của **chính phần tử đích**, nên ta dùng `width` và `height` chứ không dùng `x`, `y`.
- Thả lên một thẻ khác thì ứng dụng chèn trước thẻ đó (sắp xếp lại); thả vào chỗ trống thì thẻ về cuối cột. Cùng một lệnh `dragTo`, hai điểm thả khác nhau cho hai kết quả khác nhau.
- Có thể thả thẳng lên thẻ: `card(page, "A").dragTo(card(page, "B"), { targetPosition: { x: 20, y: 10 } })`. Tương tự, `sourcePosition` chọn điểm bắt đầu nhấn trên nguồn (hữu ích khi nguồn có nút bên trong mà bạn không muốn nhấn trúng).

Kết quả mong đợi: hai test xanh. Đây cũng là chỗ để kiểm tra quy tắc nghiệp vụ: thử kéo thẻ thứ tư vào cột Đang làm (đã đủ 3 thẻ) sẽ nhận thông báo "Cột Đang làm đã đủ 3 thẻ, không thể thêm thẻ nữa" và số đếm vẫn là 3/3. Bật `?bugs=BUG-01` để thấy lab bỏ qua giới hạn này khi kéo thả (còn phím tắt vẫn chặn): một bug mà bạn chỉ phát hiện nếu kiểm cả hai đường thao tác.

### Bước 7. page.mouse từng bước: khi dragTo chưa đủ
Mục đích: tự điều khiển chuỗi sự kiện chuột.

```ts
test("kéo thẻ bằng page.mouse từng bước", async ({ page }) => {
  await openBoard(page);
  const from = (await card(page, "Sửa lỗi giỏ hàng").boundingBox())!;
  const to = (await page.getByTestId("drop-done").boundingBox())!;

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();                                    // nhấn giữ
  await page.mouse.move(from.x + from.width / 2 + 10, from.y + from.height / 2 + 10, { steps: 3 });
  await page.mouse.move(to.x + to.width / 2, to.y + to.height - 6, { steps: 10 });
  await page.mouse.up();                                      // thả

  await expect(titles(page, "done")).toHaveText(["Cấu hình CI", "Sửa lỗi giỏ hàng"]);
});
```

| Lệnh | Ý nghĩa |
|------|---------|
| `mouse.move(x, y)` | Di con trỏ tới toạ độ (px, tính từ góc trên trái của viewport). |
| `{ steps: n }` | Chia quãng đường thành n lần di nhỏ, sinh ra n sự kiện `mousemove` trung gian. |
| `mouse.down()` / `mouse.up()` | Nhấn giữ / nhả nút chuột (mặc định nút trái). |

Vì sao có lúc phải làm vậy: `dragTo` đủ cho kéo thả HTML5 như lab này và `/lab/playground`. Nhưng nhiều thư viện kéo thả (sắp xếp danh sách, thanh trượt, vẽ trên canvas) không dùng sự kiện `drag*` chuẩn mà tự theo dõi `mousemove`/`pointermove`, và thường chỉ coi là "đang kéo" sau khi con trỏ rời nguồn một khoảng nhất định. Khi đó cần: di nhẹ ra khỏi nguồn để vượt ngưỡng, di nhiều bước tới đích (để thư viện kịp tính vị trí chèn), rồi mới thả. Trên lab này, một bước di duy nhất cũng chạy được, nhưng cách nhiều bước an toàn hơn ở các thư viện khác.

Lưu ý: `page.mouse` không chờ phần tử và không tự cuộn. Toạ độ từ `boundingBox()` có thể nằm ngoài viewport nếu trang đang cuộn; hãy `scrollIntoViewIfNeeded()` trước khi lấy toạ độ.

### Bước 8. keyboard.press và focus: phím tắt trên thẻ
Mục đích: dùng phím tắt Alt+mũi tên để đổi cột và Ctrl+Z để hoàn tác.

```ts
test("phím tắt trên thẻ đang focus", async ({ page }) => {
  await openBoard(page);

  await card(page, "Sửa lỗi giỏ hàng").focus();          // thẻ có tabIndex=0 nên focus được
  await expect(card(page, "Sửa lỗi giỏ hàng")).toBeFocused();

  await page.keyboard.press("Alt+ArrowRight");           // Cần làm -> Đang làm
  await expect(titles(page, "doing")).toHaveText([
    "Tối ưu truy vấn", "Review PR số 42", "Sửa lỗi giỏ hàng",
  ]);

  await page.keyboard.press("Alt+ArrowLeft");            // quay lại Cần làm
  await expect(titles(page, "todo")).toHaveCount(3);

  await page.keyboard.press("Control+z");                // hoàn tác lần di chuyển gần nhất
  await expect(page.getByTestId("kb-message")).toContainText("Đã hoàn tác");
});
```

- `focus()` đặt focus bàn phím vào thẻ. Nếu bỏ dòng này, phím `Alt+ArrowRight` đi vào `body` và không thẻ nào phản ứng.
- Tên phím theo chuẩn của Playwright: `ArrowRight`, `ArrowLeft`, `Enter`, `Escape`, `Delete`, `Backspace`, `Tab`... Tổ hợp nối bằng dấu cộng: `Alt+ArrowRight`, `Control+A`, `Shift+Tab`.
- Sau khi thẻ chuyển cột, ứng dụng tự đặt lại focus lên thẻ (nó bị dựng lại ở cột mới), nên nhấn `Alt+ArrowLeft` tiếp được ngay. Nếu ứng dụng của bạn không làm vậy, phải `focus()` lại trước mỗi lần bấm.
- `toBeFocused()` là assertion chuyên dùng để xác nhận focus đã đúng chỗ trước khi bấm phím.

Kết quả mong đợi: thẻ qua lại giữa hai cột và có thông báo hoàn tác. Với Delete: `keyboard.press("Delete")` mở hộp thoại xác nhận (`role="alertdialog"`, tên "Xác nhận xoá thẻ"); `Escape` đóng hộp thoại mà không xoá.

### Bước 9. Phím tắt toàn trang, gõ chữ: type và pressSequentially
Mục đích: dùng phím tắt không cần focus phần tử cụ thể (N thêm thẻ, / mở ô tìm) và gõ chữ vào ô nhập.

```ts
test("phím tắt toàn trang: N và /", async ({ page }) => {
  await openBoard(page);

  await page.keyboard.press("n");                       // thêm thẻ mới vào Cần làm
  const input = page.getByRole("textbox", { name: "Sửa tiêu đề thẻ" });
  await expect(input).toBeFocused();                    // ô sửa mở sẵn, tự focus
  await page.keyboard.press("Control+A");               // chọn hết chữ "Thẻ mới"
  await page.keyboard.type("Thẻ gõ phím", { delay: 20 });
  await input.press("Enter");
  await expect(titles(page, "todo").last()).toHaveText("Thẻ gõ phím");

  await page.keyboard.press("/");                       // nhảy tới ô Tìm thẻ
  const search = page.getByLabel("Tìm thẻ");
  await expect(search).toBeFocused();
  await search.pressSequentially("api");                // gõ từng ký tự vào ô này
  await expect(page.getByTestId("card")).toHaveCount(1);

  await search.press("Control+A");
  await search.press("Backspace");                      // xoá sạch ô tìm
  await expect(search).toHaveValue("");
});
```

| Lệnh | Khác biệt |
|------|-----------|
| `page.keyboard.press("n")` | Bấm một phím vào phần tử đang focus (ở đây là `body`, nên trình nghe `keydown` ở cấp `document` nhận được). |
| `page.keyboard.type("...")` | Gõ chuỗi vào phần tử đang focus, từng ký tự; không tự focus. |
| `locator.pressSequentially("...")` | Tự focus phần tử của locator rồi gõ từng ký tự. Bản thay thế cho `type` đã bị bỏ trên locator. |
| `locator.press("Enter")` | Tự focus phần tử rồi bấm một phím/tổ hợp. |
| `locator.fill("...")` | Gán thẳng giá trị, phát sự kiện `input`; nhanh nhất, nhưng không phát từng `keydown`. |

Chọn thế nào? Muốn nhập dữ liệu: `fill`. Ứng dụng phản ứng theo từng phím (gợi ý khi gõ, ô tìm có debounce, bộ định dạng số điện thoại): `pressSequentially`, có thể thêm `{ delay: 50 }`. Muốn kích hoạt phím tắt: `keyboard.press` hoặc `locator.press`.

Hai chi tiết đáng chú ý ở lab: phím tắt N và `/` bị ứng dụng bỏ qua khi bạn đang gõ trong ô nhập (nó kiểm tra phần tử đích là `input`, `textarea`...), vì vậy khi đang ở ô tìm, bấm N chỉ gõ chữ "n". Thứ hai, ô sửa tiêu đề bị `onBlur` huỷ: nếu test bấm vào chỗ khác trước khi `Enter`, bản nháp biến mất, và bạn sẽ thấy tiêu đề giữ nguyên.

Kết quả mong đợi: thẻ "Thẻ gõ phím" ở cuối cột Cần làm; ô tìm lọc còn đúng một thẻ "Viết tài liệu API". Nếu `keyboard.press("n")` không làm gì: thường vì focus đang nằm trong một ô nhập (ví dụ bạn vừa `fill` rồi chưa rời đi).

### Bước 10. mouse.wheel: cuộn một vùng
Mục đích: cuộn vùng có thanh cuộn riêng (danh sách cuộn vô hạn ở `/lab/playground`).

```ts
test("cuộn bằng bánh xe chuột", async ({ page }) => {
  await page.goto("/lab/playground");
  const list = page.getByRole("region", { name: "Danh sách cuộn vô hạn" });
  const count = page.getByTestId("scroll-count");

  await expect(count).toHaveText("20");   // ban đầu tải 20 mục
  await list.hover();                     // đặt con trỏ lên vùng cần cuộn (hover tự cuộn tới vùng đó)
  await page.mouse.wheel(0, 2000);        // cuộn xuống 2000 px
  await expect(count).toHaveText("40");   // cuộn tới cuối: tải thêm 20 mục
});
```

- `mouse.wheel(deltaX, deltaY)` xoay bánh xe tại **vị trí hiện tại của con trỏ**. Vì thế phải đưa con trỏ vào đúng vùng cuộn trước; nếu con trỏ đang ở ngoài, trang chính cuộn thay vì vùng.
- Cách khác không dùng chuột: `list.evaluate((el) => el.scrollTo(0, el.scrollHeight))`, hoặc `locator.scrollIntoViewIfNeeded()` để cuộn phần tử vào tầm nhìn.
- Sau khi cuộn, đừng đợi cố định: dùng assertion có retry như `toHaveText("40")` để chờ nội dung tải thêm.

Kết quả mong đợi: bộ đếm tăng từ 20 lên 40. Nếu vẫn là 20, kiểm tra con trỏ có nằm trong vùng cuộn không (một lần ta thử toạ độ lấy từ `boundingBox()` khi vùng nằm ngoài khung nhìn, bánh xe không tác dụng; `hover()` tránh được việc này vì nó cuộn tới vùng trước).

## Demo code

Bản gộp, dùng được làm khung cho bài tập. Lưu thành `e2e/kanban-mouse.spec.ts`:

```ts
import { test, expect, type Page } from "@playwright/test";

async function openBoard(page: Page) {
  await page.goto("/lab/kanban");
  await page.getByTestId("reset-data").click();
}
const card = (page: Page, title: string) =>
  page.getByTestId("card").filter({ hasText: title });
const titles = (page: Page, col: string) =>
  page.getByTestId(`col-${col}`).getByTestId("card-title");

test("luồng làm việc: sửa, kéo, hoàn tác bằng phím", async ({ page }) => {
  await openBoard(page);

  // 1. Double click sửa tiêu đề, Enter để lưu
  await card(page, "Sửa lỗi giỏ hàng").getByTestId("card-title").dblclick();
  const input = page.getByRole("textbox", { name: "Sửa tiêu đề thẻ" });
  await input.fill("Sửa lỗi thanh toán");
  await input.press("Enter");

  // 2. Kéo thẻ vừa sửa sang Đang làm, thả xuống chỗ trống ở đáy cột
  const zone = page.getByTestId("drop-doing");
  const box = (await zone.boundingBox())!;
  await card(page, "Sửa lỗi thanh toán").dragTo(zone, {
    targetPosition: { x: box.width / 2, y: box.height - 6 },
  });
  await expect(titles(page, "doing")).toHaveText([
    "Tối ưu truy vấn", "Review PR số 42", "Sửa lỗi thanh toán",
  ]);
  await expect(page.getByTestId("count-doing")).toHaveText("3/3");

  // 3. Hoàn tác bằng Ctrl+Z (phím tắt toàn trang)
  await page.keyboard.press("Control+z");
  await expect(titles(page, "todo")).toContainText(["Sửa lỗi thanh toán"]);
  await expect(page.getByTestId("count-doing")).toHaveText("2/3");
});
```

Giải thích: bước 1 dùng `dblclick` và `fill`/`press` trên một locator theo role; bước 2 chỉ định điểm thả để kết quả không phụ thuộc vào việc có thẻ nằm giữa vùng thả; bước 3 dùng phím tắt toàn trang nên không cần `focus()`. Mỗi bước kết thúc bằng một assertion có retry, nên test không cần `waitForTimeout`. Chạy: `npx playwright test e2e/kanban-mouse.spec.ts` và thêm `--headed` nếu muốn xem con trỏ di chuyển.

## Thử ngay trong lab
- Mở `/lab/kanban` và tự làm bằng tay trước khi viết test: rê chuột lên thẻ (nút Xoá nhanh), double click tiêu đề, bấm chuột phải, kéo thẻ vào cột Đang làm tới khi đủ 3 thẻ, nhấn N, nhấn Ctrl+Z, nhấn Tab để focus thẻ rồi Alt+mũi tên.
- Đọc quy tắc ở `/labs/kanban` (WIP tối đa 3 thẻ ở Đang làm, tiêu đề 1 đến 80 ký tự, Ctrl+Z hoàn tác lần di chuyển gần nhất).
- Bật từng bug và viết test làm nó đỏ: `/lab/kanban?bugs=BUG-01` (kéo thả bỏ qua WIP), `?bugs=BUG-02` (Escape lưu thay vì huỷ khi sửa), `?bugs=BUG-03` (hoàn tác về sai cột).
- Mở `/lab/playground` để thử kéo thả đơn giản (Thẻ A sang Vùng thả) và vùng cuộn vô hạn.

## Lỗi thường gặp

1. **Thẻ chèn sai vị trí sau khi kéo.** Triệu chứng: `toHaveText([...])` báo thứ tự khác dự kiến, ví dụ thẻ nằm giữa cột thay vì cuối cột. Nguyên nhân: `dragTo` thả vào điểm giữa của vùng thả, và điểm này đang nằm trên một thẻ khác. Cách sửa: dùng `targetPosition` hướng vào chỗ trống ở đáy vùng, hoặc chủ động thả lên thẻ muốn chèn trước.
2. **Thả không có tác dụng với thư viện kéo thả khác.** Triệu chứng: thẻ vẫn ở chỗ cũ dù `dragTo` không báo lỗi. Nguyên nhân: thư viện lắng nghe `mousemove`/`pointermove`, cần vượt ngưỡng kéo và nhận đủ sự kiện trung gian. Cách sửa: dùng `page.mouse.move` với `steps`, di nhẹ ra khỏi nguồn trước, di nhiều bước tới đích rồi mới `up()`.
3. **Phần tử bị che nên thao tác chờ mãi.** Triệu chứng: `locator.click: Timeout 30000ms exceeded` kèm dòng `<div ...> intercepts pointer events`. Nguyên nhân: lớp phủ (hộp thoại, menu đang mở, lớp nền mờ) nằm đè lên. Cách sửa: đóng lớp phủ trước (ở Kanban, menu chuột phải đóng bằng Escape hoặc click ra ngoài); đừng dùng `force: true` vì nó che mất lỗi thật mà người dùng sẽ gặp.
4. **Phím tắt không phản ứng.** Triệu chứng: `keyboard.press("Alt+ArrowRight")` không làm thẻ đổi cột. Nguyên nhân: focus không nằm trên thẻ (hoặc đang ở trong ô nhập nên phím tắt toàn trang bị bỏ qua). Cách sửa: `locator.focus()` rồi `expect(locator).toBeFocused()` trước khi bấm; dùng `locator.press` nếu muốn tự focus.
5. **Hover xong nút ẩn lại biến mất trước khi click.** Triệu chứng: `quick-delete` hiện ở `hover()` nhưng click báo "element was detached" hoặc không tìm thấy. Nguyên nhân: con trỏ rời vùng hover giữa hai lệnh, hoặc bạn đã gọi hover ở một phần tử khác. Cách sửa: hover vào thẻ hoặc phần tử cha mà ứng dụng gắn sự kiện, rồi click ngay nút vừa hiện (con trỏ đi thẳng từ chỗ hover tới nút và nút vẫn nằm trong thẻ).
6. **Bánh xe chuột không cuộn vùng mong muốn.** Triệu chứng: `mouse.wheel` chạy xong mà nội dung không đổi. Nguyên nhân: con trỏ ở ngoài vùng cuộn hoặc ngoài viewport. Cách sửa: `locator.hover()` (hoặc `scrollIntoViewIfNeeded` rồi `mouse.move`) trước khi `wheel`.
7. **Dùng cùng một test cho "Ctrl" trên mọi hệ điều hành.** Triệu chứng: phím tắt chạy trên Windows nhưng đỏ trên macOS vì ứng dụng nghe `Meta`. Cách sửa: dùng `ControlOrMeta` trong `modifiers` hoặc trong chuỗi phím (`ControlOrMeta+z`) khi ứng dụng chấp nhận cả hai.

## Tóm tắt
- Lệnh cấp cao (`hover`, `dblclick`, `dragTo`, `press`) có actionability và là lựa chọn đầu tiên; `page.mouse` và `page.keyboard` là cấp thấp, chỉ dùng khi cần điều khiển từng bước.
- `dragTo` mặc định thả vào điểm giữa đích; hãy dùng `targetPosition` khi kết quả phụ thuộc vào vị trí thả, và kiểm tra bằng thứ tự các phần tử trong cột.
- Chuột phải là `click({ button: 'right' })`, phím bổ trợ là `click({ modifiers: [...] })` (ưu tiên `ControlOrMeta`).
- Bàn phím luôn đi vào phần tử đang focus: dùng `focus()` kèm `toBeFocused()` trước khi bấm phím tắt; `fill` để nhập dữ liệu, `pressSequentially` khi cần mô phỏng từng phím.
- `mouse.wheel` cuộn tại vị trí con trỏ; chờ kết quả bằng assertion có retry, không dùng sleep.
- Luôn kiểm cả đường chuột và đường phím tắt cho cùng một chức năng: lab Kanban giấu bug ở chỗ hai đường này không dùng chung một đoạn kiểm tra.

## Bài tập
1. **Hover và xoá nhanh.** Viết test hover vào thẻ "Review PR số 42", bấm "Xoá nhanh", chọn "Giữ lại" ở hộp thoại, và chứng minh thẻ vẫn còn. Xong khi: test xanh và có assertion `toBeFocused` cho thẻ sau khi hộp thoại đóng.
2. **Sửa tại chỗ có kiểm lỗi.** Dùng `dblclick` để sửa tiêu đề thành một chuỗi rỗng, kiểm tra thông báo lỗi; rồi nhập chuỗi 81 ký tự và kiểm tra thông báo thứ hai. Xong khi: có hai assertion về thông báo và một assertion cuối cho giá trị hợp lệ 80 ký tự.
3. **Kéo thả và WIP.** Kéo lần lượt hai thẻ từ Cần làm sang Đang làm; xác nhận thẻ thứ hai bị từ chối với đúng thông báo và số đếm vẫn 3/3. Xong khi: có `targetPosition` ở ít nhất một lần kéo và test sắp xếp lại ngay trong cột đã đủ thẻ vẫn được phép.
4. **Menu chuột phải và phím tắt.** Mở menu bằng chuột phải, đóng bằng Escape, mở lại và đóng bằng click ra ngoài; sau đó dùng `Alt+ArrowRight` hai lần để chuyển một thẻ sang cột Xong và `Delete` để xoá (huỷ rồi xác nhận). Xong khi: có assertion `toHaveCount(0)` cho menu ở cả hai cách đóng.
5. **Bắt bug bằng đúng đường thao tác.** Bật `?bugs=BUG-01` rồi viết test đỏ trên đường kéo thả nhưng xanh trên đường Alt+mũi tên; sau đó viết test thứ hai làm đỏ BUG-03 bằng Ctrl+Z. Xong khi: không bug thì cả hai test xanh, có bug thì đúng test tương ứng đỏ.
