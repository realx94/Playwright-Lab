---
title: Ghi test bằng Codegen và VS Code
level: 2
order: 20
minutes: 60
summary: Dùng extension Playwright cho VS Code (Test Explorer, Record new, Record at cursor, Pick locator, trace) và npx playwright codegen; biến bản ghi thô thành test tốt, và biết khi nào không nên lạm dụng codegen.
keywords: [playwright codegen, playwright vscode extension, record new playwright, pick locator]
---

## Mục tiêu bài học
- Cài và dùng extension Playwright cho VS Code: Test Explorer, chạy và gỡ lỗi từng test, hiển thị trình duyệt và trace.
- Ghi test bằng **Record new**, chèn thêm bước bằng **Record at cursor**, lấy locator bằng **Pick locator**.
- Dùng `npx playwright codegen` với tuỳ chọn thiết bị, ngôn ngữ đích, tệp đầu ra và lưu hoặc nạp trạng thái đăng nhập.
- Biến một bản ghi thô thành test tốt theo năm bước: đổi locator, thêm assertion, gom bước vào hàm hoặc Page Object, bỏ bước thừa, đặt tên có nghĩa.
- Nêu được ba nhược điểm khi lạm dụng codegen và khi nào nên viết tay.

## Bạn cần chuẩn bị
- Đã học bài 2.5 (locator hướng người dùng; có giới thiệu codegen ngắn), bài 2.8 (assertion), bài 2.13 (debug và trace). Bài này **không lặp lại** phần giới thiệu ở đó mà đi vào quy trình làm việc thực tế.
- Đã cài Node.js, Playwright và trình duyệt (bài 0.2); site lab chạy ở `http://localhost:3000` (bài 0.3).
- Đã cài [Visual Studio Code](https://code.visualstudio.com/). Nếu bạn dùng trình soạn thảo khác, hãy đọc phần codegen bằng dòng lệnh, vì phần đó không phụ thuộc VS Code.

## Kiến thức cần nắm
- **Codegen**: công cụ ghi lại thao tác của bạn trên trình duyệt và dịch thành code Playwright.
- **Test Explorer** (khung Testing của VS Code): danh sách test, có nút chạy và gỡ lỗi từng test.
- **Record new**, **Record at cursor**, **Pick locator**: ba nút của extension trong khung Testing.
- Tuỳ chọn CLI: `-o`, `--target`, `--device`, `--viewport-size`, `--color-scheme`, `--lang`, `--timezone`, `--save-storage`, `--load-storage`, `--test-id-attribute`.
- Codegen ưu tiên locator theo role, text và test id, và chỉ sinh ít assertion (**visibility**, **text**, **value**): phần còn lại là việc của bạn.
- Bản ghi là **bản nháp**, không phải test hoàn chỉnh.

## Giải thích dễ hiểu

### Codegen giống một máy ghi âm, không phải một nhà văn
Bạn họp và bật máy ghi âm: nó ghi lại mọi thứ, kể cả tiếng ho và những câu nói thừa. Muốn có biên bản họp, bạn vẫn phải nghe lại, bỏ phần thừa, thêm kết luận, đặt tiêu đề. Codegen cũng vậy: nó ghi lại **từng cú nhấp, từng phím gõ** thành code, nhưng không hiểu **bạn đang kiểm tra điều gì**. Một test tốt cần câu trả lời cho câu hỏi "kết quả đúng là gì?", mà bản ghi chỉ có hành động, thiếu kỳ vọng.

Vì vậy cách dùng đúng là: dùng codegen để **làm nhanh phần việc cơ học** (tìm locator, dựng khung) rồi **tự biên tập**. Cách dùng sai là ghi xong, dán vào, thấy xanh là xong; khi đó bạn có test xanh nhưng không kiểm tra gì cả.

### Vì sao còn cần extension VS Code?
Bạn có thể làm mọi thứ bằng dòng lệnh, nhưng extension gom ghi, chạy, gỡ lỗi và xem trace vào một nơi: bạn nhìn thấy test, bấm chạy một test, đặt breakpoint, xem locator đang trỏ vào đâu, mà không rời trình soạn thảo. Với người mới, vòng lặp "viết, chạy, xem lỗi, sửa" nhanh hơn đáng kể.

## Thực hành từng bước

Các bước dưới đây dựa trên tài liệu chính thức của Playwright (playwright.dev, trang VS Code và Codegen) và mã nguồn Playwright 1.64 trong dự án. Tên nút và vị trí menu **có thể thay đổi nhẹ giữa các phiên bản**; nếu không thấy đúng chữ, hãy tìm nút có ý nghĩa tương đương.

### Bước 1. Cài extension Playwright cho VS Code

Mục đích: có Test Explorer và các nút ghi test trong VS Code.

1. Mở VS Code, bấm `Ctrl+Shift+X` (macOS: `Cmd+Shift+X`) để mở khung Extensions.
2. Gõ `Playwright`, chọn extension **Playwright Test for VS Code** của Microsoft (mã `ms-playwright.playwright`), bấm **Install**.
3. Mở thư mục dự án Playwright của bạn bằng **File, Open Folder**. Nếu dự án chưa có Playwright, bấm `Ctrl+Shift+P` (macOS: `Cmd+Shift+P`), gõ `Test: Install Playwright` và chọn các trình duyệt.

Kết quả mong đợi: ở thanh bên trái xuất hiện biểu tượng **Testing** (hình bình thí nghiệm); mở ra bạn thấy danh sách file test của dự án. Nếu danh sách trống, kiểm tra bạn đã mở đúng thư mục chứa `playwright.config.ts`.

Nếu gặp lỗi: extension không thấy test thường do `testDir` trong config trỏ sai thư mục, hoặc bạn mở thư mục cha (config nằm ở thư mục con). Mở trực tiếp thư mục chứa config. Nếu dự án có nhiều config, bấm biểu tượng bánh răng trong khung Playwright để chọn config.

### Bước 2. Làm quen Test Explorer: chạy từng test, hiển thị trình duyệt và trace

Mục đích: chạy nhanh một test mà không cần gõ lệnh.

Mở khung **Testing**. Bạn thấy cây: thư mục, file, `describe`, test. Cạnh mỗi nút có biểu tượng tam giác chạy. Trong khung **Playwright** (dưới danh sách test) có các ô chọn:

| Mục | Ý nghĩa |
|-----|---------|
| **Projects** | Đánh dấu project (trình duyệt) sẽ chạy; chọn nhiều project thì test chạy trên tất cả |
| **Show browser** | Bật thì thấy trình duyệt thật khi chạy; tắt thì chạy ngầm (headless) |
| **Show trace viewer** | Sau khi chạy, tự mở Trace Viewer cho test vừa chạy (bài 2.13) |
| **Pick locator**, **Record new**, **Record at cursor** | Ba công cụ ghi và chọn locator, dùng ở các bước sau |

Thực hành: bật **Show browser**, bấm tam giác cạnh một test. Bạn thấy trình duyệt mở, thao tác, đóng. Kết quả mong đợi: cạnh test xuất hiện dấu tích xanh hoặc dấu chéo đỏ kèm thời gian; khung **Test Results** liệt kê kết quả và lỗi.

Với test đỏ, lỗi hiện ngay trong editor ở đúng dòng: thông điệp `Expected` và `Received` cùng **Call log** (cùng nội dung bạn thấy ở terminal, bài 2.7). Bấm vào một locator trong code khi **Show browser** đang bật: phần tử khớp được tô sáng trong trình duyệt, giúp bạn thấy locator trỏ đúng chưa.

### Bước 3. Gỡ lỗi bằng breakpoint

Mục đích: dừng test tại một dòng để xem trạng thái.

1. Bấm vào lề bên trái số dòng để đặt **breakpoint** (chấm đỏ) tại dòng bạn muốn dừng.
2. Nhấp chuột phải vào tên test trong Test Explorer, chọn **Debug Test**.

Kết quả mong đợi: test chạy rồi dừng ở breakpoint; thanh gỡ lỗi của VS Code cho bạn chạy tiếp, bước qua từng dòng và xem biến. Trình duyệt dừng cùng lúc nên bạn thấy trạng thái trang tại thời điểm đó. Đây là cách tìm hiểu "vì sao test này đỏ" khi chỉ nhìn log chưa đủ. Phần dùng Inspector bằng dòng lệnh ở bài 2.13.

### Bước 4. Pick locator: lấy locator của một phần tử

Mục đích: tìm locator tốt mà không phải đoán.

1. Bấm **Pick locator** trong khung Playwright. Một trình duyệt mở ra.
2. Di chuột trên trang: phần tử được tô sáng kèm locator gợi ý. Bấm vào phần tử bạn muốn.
3. Locator được sao chép vào clipboard (theo tài liệu, có thể bấm Enter để sao chép hoặc Escape để huỷ). Dán vào code.

Ví dụ trên LAB-01 Login: mở `http://localhost:3000/lab/login` (nếu extension hỏi, bạn có thể dùng trình duyệt vừa mở và nhập địa chỉ), chọn ô **Email**. Kết quả mong đợi: bạn nhận một locator dạng `getByRole('textbox', { name: 'Email' })` hoặc `getByLabel('Email')`; cả hai đều tốt. Nếu nhận locator dạng CSS dài (`locator('div > div:nth-child(2) input')`), đó là dấu hiệu phần tử thiếu nhãn hoặc role; xem bài 2.5 để chọn cách thay thế.

Lưu ý quan trọng: ô **Mật khẩu** (`type="password"`) **không có role textbox** theo chuẩn ARIA, nên locator gợi ý cho nó thường là `getByLabel('Mật khẩu')`, không phải `getByRole('textbox', ...)`. Tác giả đã chạy thử `getByLabel("Mật khẩu")` trên lab và nó đúng.

### Bước 5. Record new: ghi một test mới trong VS Code

Mục đích: tạo bản ghi thô từ thao tác thật.

1. Trong khung Playwright bấm **Record new**. VS Code tạo một file test mới (tên thường dạng `test-1.spec.ts`, có thể khác tuỳ phiên bản) và mở một trình duyệt.
2. Trong trình duyệt, nhập địa chỉ `http://localhost:3000/lab/login`.
3. Thực hiện: bấm ô **Email** và gõ `user@lab.dev`; bấm ô **Mật khẩu** và gõ `Passw0rd!`; bấm checkbox **Ghi nhớ đăng nhập**; bấm nút **Đăng nhập**.
4. Trên thanh công cụ ghi có ba biểu tượng assertion: **assert visibility**, **assert text**, **assert value**. Bấm **assert text**, rồi bấm vào dòng "Chào mừng, user@lab.dev"; Playwright thêm một dòng `expect`.
5. Bấm **cancel** hoặc đóng cửa sổ trình duyệt để dừng ghi.

Kết quả mong đợi: file test có nội dung tương tự bản sau. **Lưu ý**: mẫu này do tác giả dựng theo cách codegen thường sinh, rồi chạy thử trên lab để chắc chắn nó chạy xanh; chi tiết thực tế (tên test, dấu nháy, thứ tự `click` thừa, locator) có thể khác theo phiên bản.

```ts
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/lab/login');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('user@lab.dev');
  await page.getByLabel('Mật khẩu').click();
  await page.getByLabel('Mật khẩu').fill('Passw0rd!');
  await page.getByRole('checkbox', { name: 'Ghi nhớ đăng nhập' }).click();
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page.getByRole('heading', { name: 'Chào mừng, user@lab.dev' })).toBeVisible();
});
```

Nếu gặp lỗi: trình duyệt không mở được trang vì site lab chưa chạy; hãy chạy `npm run dev` ở thư mục site và thử lại. Nếu nút **Record new** không có, kiểm tra extension đã bật và đã mở đúng dự án.

### Bước 6. Record at cursor: thêm bước vào test sẵn có

Mục đích: bổ sung hành động giữa chừng mà không ghi lại từ đầu.

1. Mở test của bạn, đặt con trỏ ở dòng nơi bạn muốn chèn code (ví dụ ngay sau dòng bấm **Đăng nhập**).
2. Bấm **Record at cursor**. Một trình duyệt mở ra để ghi; bạn có thể cần đưa trang tới trạng thái mong muốn trước khi thao tác tiếp.
3. Thực hiện thao tác tiếp theo trong trình duyệt (ví dụ đăng xuất), rồi dừng ghi.

Kết quả mong đợi: các dòng mới xuất hiện đúng tại vị trí con trỏ, không phá phần code đã có. Dùng cách này để mở rộng test dần dần thay vì ghi lại nguyên một kịch bản dài.

### Bước 7. Codegen bằng dòng lệnh và các tuỳ chọn

Mục đích: ghi khi không dùng VS Code, hoặc cần ghi với cấu hình đặc biệt.

```bash
npx playwright codegen http://localhost:3000/lab/todo
```

| Phần | Ý nghĩa |
|------|---------|
| `codegen` | Mở trình duyệt ở chế độ ghi cùng cửa sổ **Playwright Inspector** |
| URL | Trang bắt đầu (có thể bỏ, nhập sau trong trình duyệt) |

Kết quả mong đợi: hai cửa sổ hiện ra: trình duyệt và Inspector. Trên Inspector có nút **Record** (bấm để dừng hoặc tiếp tục ghi), ba nút assertion, **Copy**, **Clear**, và danh sách chọn ngôn ngữ đích. Mọi thao tác được dịch thành code theo thời gian thực. Các tuỳ chọn hữu ích (liệt kê trong `npx playwright codegen --help` của Playwright 1.64):

| Tuỳ chọn | Tác dụng | Ví dụ |
|----------|----------|-------|
| `-o, --output <file>` | Lưu code ra file khi đóng | `-o tests/todo.spec.ts` |
| `--target <ngôn ngữ>` | Ngôn ngữ sinh code: `playwright-test` (mặc định), `javascript`, `python`, `python-pytest`, `csharp`, `java`... | `--target=python-pytest` |
| `--device <tên>` | Giả lập thiết bị (viewport, user agent) | `--device="Pixel 7"` |
| `--viewport-size <w,h>` | Kích thước khung nhìn | `--viewport-size="800,600"` |
| `--color-scheme` | Chủ đề sáng hoặc tối | `--color-scheme=dark` |
| `--lang`, `--timezone`, `--geolocation` | Ngôn ngữ, múi giờ, vị trí | `--timezone="Asia/Ho_Chi_Minh"` |
| `-b, --browser` | Trình duyệt: `chromium`, `firefox`, `webkit` | `-b webkit` |
| `--test-id-attribute` | Thuộc tính dùng cho `getByTestId` | `--test-id-attribute=data-qa` |
| `--save-storage`, `--load-storage` | Lưu và nạp trạng thái đăng nhập | xem Bước 8 |

Ví dụ kết hợp để ghi giao diện di động ở chế độ tối và lưu ra file:

```bash
npx playwright codegen --device="Pixel 7" --color-scheme=dark -o tests/todo-mobile.spec.ts http://localhost:3000/lab/todo
```

Kết quả mong đợi: trình duyệt hiện với khung nhìn điện thoại và giao diện tối; khi đóng, file `tests/todo-mobile.spec.ts` được tạo. Nếu thư mục `tests` chưa có, tạo trước. Muốn ra Python thay vì TypeScript, chọn ngôn ngữ trong Inspector hoặc đặt `--target`.

### Bước 8. Lưu và nạp trạng thái đăng nhập

Mục đích: không phải đăng nhập lại mỗi lần ghi. LAB-01 lưu phiên đăng nhập trong `localStorage`, và `--save-storage` lưu đúng thứ đó.

```bash
npx playwright codegen --save-storage=auth.json http://localhost:3000/lab/login
```

Trong trình duyệt, đăng nhập bằng `user@lab.dev` và `Passw0rd!`, rồi đóng cửa sổ. Kết quả mong đợi: file `auth.json` xuất hiện. Tác giả đã dựng cùng nội dung bằng API (`context.storageState`) trên lab: file có dạng:

```json
{
  "cookies": [],
  "origins": [
    {
      "origin": "http://localhost:3000",
      "localStorage": [
        { "name": "lab:login", "value": "{\"fails\":0,\"lockedUntil\":null,\"session\":{\"email\":\"user@lab.dev\",\"remember\":false}}" }
      ]
    }
  ]
}
```

Lần sau, mở thẳng trang đã đăng nhập:

```bash
npx playwright codegen --load-storage=auth.json http://localhost:3000/lab/login
```

Kết quả mong đợi: trang Login hiện ngay **Chào mừng, user@lab.dev** thay vì biểu mẫu. Đã chạy thật bằng API: tạo context mới với `storageState: "auth.json"` rồi mở `/lab/login` thấy `dashboard`. Trong test, dùng `test.use({ storageState: "auth.json" })` hoặc cấu hình `use.storageState` (chi tiết bài 4.6). **Không commit `auth.json`** nếu nó chứa phiên đăng nhập thật; thêm vào `.gitignore`.

### Bước 9. Biên tập bản ghi: đổi locator sang getByRole và getByLabel

Mục đích: rút gọn và chọn locator tốt nhất. Quy tắc: ưu tiên `getByRole`, rồi `getByLabel`, `getByTestId` (bài 2.5).

Với bản ghi ở Bước 5, các sửa đổi:

| Dòng thô | Sửa | Vì sao |
|----------|-----|--------|
| `getByRole('textbox', { name: 'Email' }).click()` rồi `.fill(...)` | Bỏ `click`, đổi thành `getByLabel('Email').fill(...)` | `fill` đã tự focus; `getByLabel` ngắn hơn và đúng cách người dùng nhìn |
| `getByLabel('Mật khẩu').click()` rồi `.fill(...)` | Bỏ `click` | Như trên |
| `getByRole('checkbox', ...).click()` | `.check()` | `check` đảm bảo trạng thái đích, không bật rồi tắt nhầm (bài 2.7) |
| `page.goto('http://localhost:3000/lab/login')` | `page.goto('/lab/login')` | Dùng `baseURL` trong config để đổi môi trường mà không sửa code |
| Locator CSS dài (nếu có) | `getByRole`, `getByLabel`, hoặc `getByTestId` | Chịu được thay đổi giao diện |

Kết quả mong đợi: mỗi dòng ngắn hơn và cùng làm một việc. Nhiều khi codegen đã chọn đúng locator tốt, bạn chỉ bỏ phần thừa; nhưng khi nó trả CSS dài, đó là tín hiệu giao diện thiếu nhãn.

### Bước 10. Thêm assertion có ý nghĩa nghiệp vụ

Mục đích: bản ghi chỉ có hành động; kiểm tra mới làm nên test.

Codegen cho phép thêm **assert visibility**, **assert text**, **assert value**, nhưng chúng không biết quy tắc nghiệp vụ. Hãy tự hỏi: "Nếu chức năng này hỏng, dòng nào sẽ đỏ?" Với đăng nhập hợp lệ, kỳ vọng là: vào được trang chào mừng và hiện đúng email; chọn **Ghi nhớ** thì phiên kéo dài 7 ngày; sai mật khẩu thì có thông báo chung (không lộ email có tồn tại hay không). Thêm:

```ts
await expect(page.getByTestId("dashboard")).toBeVisible();
await expect(page.getByRole("heading", { name: "Chào mừng, user@lab.dev" })).toBeVisible();
await expect(page.getByText("Phiên: 7 ngày")).toBeVisible();
```

Kết quả mong đợi: cả ba xanh với bản ghi ở Bước 5 (có chọn **Ghi nhớ**). Nếu một dòng đỏ, đọc Call log, đừng nới assertion cho xanh.

### Bước 11. Gom bước vào hàm hoặc Page Object, bỏ bước thừa, đặt tên

Mục đích: tránh lặp và đặt tên theo hành vi. Với LAB-01, tạo `pages/login-page.ts`:

```ts
import { expect, type Page } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto("/lab/login");
    await this.page.getByTestId("reset-data").click();
  }

  async login(email: string, password: string, remember = false) {
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByLabel("Mật khẩu").fill(password);
    if (remember) await this.page.getByRole("checkbox", { name: "Ghi nhớ đăng nhập" }).check();
    await this.page.getByRole("button", { name: "Đăng nhập" }).click();
  }

  async expectWelcome(email: string) {
    await expect(this.page.getByTestId("dashboard")).toBeVisible();
    await expect(this.page.getByRole("heading", { name: `Chào mừng, ${email}` })).toBeVisible();
  }
}
```

Rồi viết lại thành ba test có tên nói rõ hành vi (không phải `test`, `test 1`):

```ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page";

test.describe("LAB-01 đăng nhập", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.open();
  });

  test("đăng nhập hợp lệ vào trang chào mừng", async () => {
    await loginPage.login("user@lab.dev", "Passw0rd!");
    await loginPage.expectWelcome("user@lab.dev");
  });

  test("chọn ghi nhớ thì phiên kéo dài 7 ngày", async ({ page }) => {
    await loginPage.login("user@lab.dev", "Passw0rd!", true);
    await expect(page.getByText("Phiên: 7 ngày")).toBeVisible();
  });

  test("mật khẩu sai hiện thông báo chung", async ({ page }) => {
    await loginPage.login("user@lab.dev", "Wrong123!");
    await expect(page.getByTestId("form-error")).toHaveText("Email hoặc mật khẩu không đúng");
  });
});
```

Giải thích: `open` gom `goto` và nút Reset (`reset-data`) để mỗi test bắt đầu từ trạng thái sạch; `login` nhận tham số để dùng lại cho nhiều tình huống; `expectWelcome` gói hai assertion thường đi cùng. Tên test mô tả **hành vi kỳ vọng** nên khi đỏ, báo cáo đã nói gì hỏng. Phần Page Object nâng cao ở bài 4.1 và 4.2.

Kết quả mong đợi: ba test xanh (tác giả đã chạy thật trên lab: 3 passed). Số dòng mỗi test giảm hẳn, và khi giao diện đổi nhãn bạn chỉ sửa một chỗ trong `LoginPage`.

### Bước 12. Làm lại với LAB-04 Todo: ghi rồi biên tập

Mục đích: luyện cả quy trình trên một ví dụ thứ hai. Ghi bằng **Record new** quy trình: mở `/lab/todo`, nhập "Mua sữa", bấm **Thêm**, tick hoàn thành, bấm **Xoá Mua sữa**, rồi **Xoá hẳn**. Bản ghi thô (mẫu minh hoạ, đã chạy thử xanh trên lab):

```ts
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/lab/todo');
  await page.getByRole('textbox', { name: 'Công việc mới' }).click();
  await page.getByRole('textbox', { name: 'Công việc mới' }).fill('Mua sữa');
  await page.getByRole('button', { name: 'Thêm', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Hoàn thành: Mua sữa' }).check();
  await page.getByRole('button', { name: 'Xoá Mua sữa' }).click();
  await page.getByRole('button', { name: 'Xoá hẳn' }).click();
});
```

Bản thô này **xanh nhưng không kiểm tra gì**: nó chạy hết bước mà không có `expect`, nên dù ứng dụng đếm sai hay không xoá, nó vẫn xanh. Biên tập: dựng `TodoPage` có `open`, `add`, `complete`, `remove`, `expectRemaining`, rồi test:

```ts
import { expect, type Page } from "@playwright/test";

export class TodoPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto("/lab/todo");
    await this.page.getByTestId("reset-data").click();
  }

  async add(title: string) {
    await this.page.getByLabel("Công việc mới").fill(title);
    await this.page.getByRole("button", { name: "Thêm", exact: true }).click();
  }

  async complete(title: string) {
    await this.page.getByRole("checkbox", { name: `Hoàn thành: ${title}` }).check();
  }

  async remove(title: string) {
    await this.page.getByRole("button", { name: `Xoá ${title}` }).click();
    await this.page.getByRole("button", { name: "Xoá hẳn" }).click();
  }

  async expectRemaining(n: number) {
    await expect(this.page.getByTestId("todo-count")).toHaveText(`Còn ${n} việc`);
  }
}
```

```ts
import { test, expect } from "@playwright/test";
import { TodoPage } from "../pages/todo-page";

test("thêm, hoàn thành rồi xoá một việc", async ({ page }) => {
  const todo = new TodoPage(page);
  await todo.open();
  await todo.add("Mua sữa");
  await todo.expectRemaining(1);
  await todo.complete("Mua sữa");
  await todo.expectRemaining(0);
  await todo.remove("Mua sữa");
  await expect(page.getByTestId("todo-empty")).toBeVisible();
});
```

Kết quả mong đợi: test xanh (đã chạy thật). Giờ nếu bật `?bugs=BUG-02` ở lab (bug đếm sai số việc còn lại) rồi tạm đổi dòng `goto` trong `open` thành `/lab/todo?bugs=BUG-02`, dòng `expectRemaining(0)` sẽ đỏ với `Expected: "Còn 0 việc"` và `Received: "Còn 1 việc"` (tác giả đã chạy thật: sau khi hoàn thành việc duy nhất, bộ đếm vẫn hiện `Còn 1 việc`). Bản biên tập **bắt được bug**, còn bản thô thì không.

## Demo code

Quy trình rút gọn, từ lệnh tới test hoàn chỉnh:

```bash
# 1) Ghi nháp, lưu ra file
npx playwright codegen -o tests/login-raw.spec.ts http://localhost:3000/lab/login

# 2) Biên tập tay (locator, assertion, Page Object, tên test), rồi chạy
npx playwright test login

# 3) Chạy riêng một test, xem trình duyệt
npx playwright test login -g "ghi nhớ" --headed
```

Ba lệnh tương ứng ba pha: ghi, biên tập, kiểm tra. Cờ `-g` (grep) lọc theo tên test (bài 2.4); `--headed` hiện trình duyệt. Sau pha 2, file `login-raw.spec.ts` nên được đổi tên và nội dung sao cho giống `tests/login.spec.ts` ở Bước 11. Mỗi lần bạn thấy mình "chỉ thêm một click" vào bản ghi, hãy dừng lại: đó là lúc nên viết hàm hoặc Page Object.

## Thử ngay trong lab
- `/lab/login` (LAB-01): ghi lại đăng nhập hợp lệ bằng **Record new**, biên tập theo Bước 9 đến 11, rồi chạy với `?bugs=BUG-01` (cho phép mật khẩu 7 ký tự): thêm test mật khẩu `Pass0r!` mong đợi lỗi `tối thiểu 8` và xem nó đỏ khi bug bật.
- `/lab/todo` (LAB-04): ghi quy trình thêm, hoàn thành, xoá; thêm assertion; rồi bật `?bugs=BUG-02` (bộ đếm việc còn lại không giảm sau khi hoàn thành) để chứng minh bản biên tập phát hiện được lỗi còn bản thô thì không.
- Thử `--save-storage` và `--load-storage` trên `/lab/login` như Bước 8.

## Lỗi thường gặp
- Triệu chứng: test ghi ra xanh nhưng bật bug vẫn xanh. Nguyên nhân: bản ghi không có assertion (chỉ có hành động). Cách sửa: thêm `expect` theo kỳ vọng nghiệp vụ, rồi bật `?bugs=` để thấy nó đỏ.
- Triệu chứng: `strict mode violation: ... resolved to 2 elements` khi chạy lại bản ghi. Nguyên nhân: locator codegen ngắn quá (ví dụ tên nút là đoạn của nhiều nút). Cách sửa: thêm `exact: true` hoặc thu hẹp trong vùng chứa (bài 2.6).
- Triệu chứng: bản ghi chứa `locator('div:nth-child(3) > ... ')` và vỡ khi đổi giao diện. Nguyên nhân: phần tử không có role hoặc nhãn rõ để codegen dùng. Cách sửa: đổi sang `getByRole`, `getByLabel`, hoặc thêm `data-testid` rồi dùng `getByTestId`.
- Triệu chứng: `page.goto: Protocol error ... Cannot navigate to invalid URL` hoặc chạy ở môi trường khác thì sai. Nguyên nhân: URL tuyệt đối `http://localhost:3000/...` do codegen ghi sẵn. Cách sửa: dùng đường dẫn tương đối và đặt `baseURL` trong config.
- Triệu chứng: test dài vài chục dòng lặp đi lặp lại cùng một cụm thao tác. Nguyên nhân: dán nguyên bản ghi cho mọi kịch bản. Cách sửa: tách hàm hoặc Page Object, chỉ ghi phần mới.
- Triệu chứng: `Record at cursor` không chèn được hoặc chạy từ đầu. Nguyên nhân: con trỏ không nằm trong một test, hoặc test hiện không chạy tới điểm đó. Cách sửa: đặt con trỏ trong thân test đang chạy được và thử lại.
- Triệu chứng: `--load-storage` mở ra trang chưa đăng nhập. Nguyên nhân: `auth.json` hết hạn, rỗng, hoặc lưu từ một `origin` khác. Cách sửa: ghi lại bằng `--save-storage` với đúng địa chỉ bạn dùng để kiểm thử.

## Nhược điểm khi lạm dụng codegen
- **Test không có kỳ vọng**: ghi hành động mà quên kiểm tra kết quả; test xanh nhưng vô nghĩa.
- **Mong manh và lặp**: thứ tự `click` thừa, locator phụ thuộc cấu trúc, URL tuyệt đối; mỗi lần giao diện đổi phải sửa nhiều nơi.
- **Không có thiết kế**: không tách dữ liệu, không có Page Object, không tên có nghĩa, không phản ánh yêu cầu; khó bảo trì khi bộ test lớn lên.
- **Thiếu những thứ không ghi được**: kiểm tra giá trị biên, mô phỏng thời gian (`context.clock`), chặn mạng, dữ liệu theo bảng. Chúng cần được thiết kế rồi viết tay.

Dùng codegen cho: khám phá locator, dựng khung nhanh, học cú pháp. Viết tay cho: logic nghiệp vụ, dữ liệu nhiều biến thể, và mọi thứ bạn muốn bảo trì lâu dài.

## Tóm tắt
- Extension Playwright cho VS Code gom Test Explorer, chạy và gỡ lỗi từng test, **Show browser**, **Show trace viewer**, **Pick locator**, **Record new** và **Record at cursor** vào một nơi.
- `npx playwright codegen` ghi bằng dòng lệnh, có tuỳ chọn thiết bị, ngôn ngữ, tệp đầu ra, và `--save-storage` hoặc `--load-storage` để tái dùng phiên đăng nhập.
- Bản ghi là **bản nháp**: chuyển sang `getByRole` hoặc `getByLabel`, bỏ `click` thừa, dùng `check` và `baseURL`.
- Thêm assertion theo nghiệp vụ, gom thao tác vào hàm hoặc Page Object, đặt tên test theo hành vi.
- Chứng minh test có giá trị bằng cách bật bug của lab và thấy nó đỏ.
- Dùng codegen để làm nhanh phần cơ học, không để nó thay phần thiết kế test.

## Bài tập
1. **Dễ**: Cài extension, bật **Show browser** và chạy một test có sẵn từ Test Explorer. Xong khi bạn thấy dấu tích xanh cạnh test và trình duyệt đã mở trong lúc chạy.
2. **Dễ**: Dùng **Pick locator** chọn 4 phần tử trên `/lab/login` (Email, Mật khẩu, Ghi nhớ đăng nhập, Đăng nhập). Xong khi bạn ghi lại 4 locator và giải thích vì sao ô Mật khẩu không dùng role `textbox`.
3. **Vừa**: Ghi đăng nhập hợp lệ bằng **Record new**, rồi biên tập theo Bước 9 đến 11 (đổi locator, thêm hai assertion, tách `LoginPage`). Xong khi test xanh và không còn `click` thừa trước `fill`.
4. **Vừa**: Dùng `--save-storage` và `--load-storage` để mở `/lab/login` ở trạng thái đã đăng nhập, rồi cấu hình `storageState` cho một test dùng trạng thái đó. Xong khi test thấy `dashboard` mà không gõ lại mật khẩu.
5. **Khó**: Ghi quy trình thêm, hoàn thành, xoá việc trên `/lab/todo`, biên tập thành test có `TodoPage`, rồi bật `?bugs=BUG-02` và chứng minh bản biên tập đỏ còn bản thô xanh. Xong khi bạn nộp hai kết quả chạy và một đoạn mô tả ba chỗ bạn đã sửa trong bản thô.
