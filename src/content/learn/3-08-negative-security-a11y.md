---
title: Negative, bảo mật và truy cập cơ bản
level: 3
order: 8
minutes: 45
summary: Test dữ liệu xấu, kiểm tra bảo mật đầu vào cơ bản và khả năng truy cập bằng bàn phím.
keywords: [OWASP top 10 cho tester, xss là gì, accessibility testing]
---

## Mục tiêu bài học
- Lập danh sách dữ liệu xấu (negative) cho một ô nhập theo từng loại: rỗng, khoảng trắng, quá dài, ký tự đặc biệt, kiểu sai.
- Viết test kiểm tra đầu vào có ký tự nguy hiểm (XSS, chuỗi giống SQL injection) mà không làm hại hệ thống.
- Kiểm tra thông báo lỗi đăng nhập không để lộ tài khoản có tồn tại hay không (chống dò tài khoản) và kiểm tra phân quyền bằng ma trận vai trò nhân hành động.
- Kiểm tra khả năng truy cập cơ bản bằng bàn phím: thứ tự Tab, Enter, Space, nhãn, `aria-invalid`, vai trò `alert`.

## Bạn cần chuẩn bị
- Đã học bài 3.2 đến 3.5. Mở `/lab/login`, `/lab/leave` và `/labs/login`, `/labs/leave`.
- **Quy tắc đạo đức**: chỉ thử dữ liệu tấn công trên ứng dụng của bạn hoặc lab của site. Không thử XSS, SQL injection hay brute force trên hệ thống thật của người khác khi chưa được phép bằng văn bản.

## Kiến thức cần nắm
- **Negative testing**: kiểm tra hệ thống phản ứng đúng với đầu vào sai, thiếu hoặc bất thường.
- **XSS** (cross-site scripting): chèn mã script vào nội dung rồi trang hiển thị lại và chạy nó.
- **SQL injection**: chèn đoạn SQL vào ô nhập để thao túng truy vấn cơ sở dữ liệu.
- **Chống dò tài khoản** (account enumeration): thông báo không được cho biết email có tồn tại.
- **Phân quyền** (authorization) và **ma trận quyền** (permission matrix).
- **Accessibility** (a11y): khả năng sử dụng bằng bàn phím, trình đọc màn hình; nhãn (label) và vai trò ARIA.

## Giải thích dễ hiểu
Hai bài trước dạy bạn kiểm tra "người dùng ngoan". Bài này dạy kiểm tra "người dùng không ngoan, hoặc người dùng bị hạn chế". Hãy hình dung một ngân hàng: nhân viên quầy kiểm tra giấy tờ hợp lệ rất kỹ (happy path và validate), nhưng bộ phận an ninh còn hỏi: nếu ai đó mang giấy tờ giả thì sao? nếu người này không có quyền vào kho thì sao? nếu người khuyết tật không dùng được chuột thì sao?

Vì sao tester phải biết điều này? Vì phần lớn lỗ hổng phổ biến nằm ở **chỗ đầu vào của người dùng đi vào hệ thống** và **chỗ kiểm tra quyền**. Danh sách OWASP Top 10 xếp các nhóm như Injection (XSS, SQL injection), Broken Access Control (phân quyền hỏng) và Authentication Failures (xác thực yếu) vào hàng đầu. Bạn không cần là chuyên gia bảo mật, nhưng một tester nghiêm túc cần các kiểm tra cơ bản để chặn những lỗi dễ nhất, và nhận biết khi nào cần chuyên gia.

## Thực hành từng bước
Ví dụ xuyên suốt: màn hình đăng nhập LAB-01 (`/lab/login`) và đơn nghỉ phép LAB-07 (`/lab/leave`), mỗi nơi có một điểm nhận đầu vào và một điểm hiển thị lại dữ liệu.

### Bước 1. Danh sách dữ liệu xấu cho một ô nhập
Mục đích: không quên loại dữ liệu bất thường nào.

| Nhóm | Ví dụ cho ô Email | Ví dụ cho ô Lý do (LAB-07) | Điều cần quan sát |
|------|-------------------|-----------------------------|-------------------|
| Rỗng | (để trống) | (để trống) | Thông báo bắt buộc |
| Toàn khoảng trắng | 20 dấu cách | 20 dấu cách | Coi như rỗng, không lưu |
| Quá dài | 10.000 ký tự | 10.000 ký tự | Báo lỗi, không treo trang |
| Ký tự đặc biệt | `us er@lab.dev`, `<`, `>` | dấu nháy, `<>` | Không vỡ giao diện |
| Chuỗi tấn công | `<img src=x onerror=alert(1)>` | giống bên trái | Không chạy script (Bước 2) |
| Kiểu sai | số thay vì chuỗi | — | Báo lỗi hoặc bỏ qua an toàn |
| Unicode, emoji | email có chữ có dấu | tiếng Việt, emoji | Hiển thị và đếm ký tự đúng |

Kết quả mong đợi: bảng dữ liệu xấu cho mỗi ô quan trọng; mỗi dòng sẽ trở thành test case "Negative" hoặc "Security".

### Bước 2. Kiểm tra XSS ở nơi nhập và nơi hiển thị lại
Mục đích: dữ liệu người dùng không được trở thành mã chạy được.

Có hai điểm cần kiểm: (a) **nơi nhập**: dữ liệu bị từ chối hoặc được xử lý an toàn; (b) **nơi hiển thị lại**: nếu dữ liệu được lưu và hiện lại ở chỗ khác, nó phải được hiển thị như **chữ**, không phải HTML.

(a) Trên `/lab/login`, nhập email `<img src=x onerror=alert(1)>` và mật khẩu `Passw0rd!`. Kết quả đúng: báo "Email không hợp lệ" (vì có ký tự `<` và `>`), không có hộp thoại alert.

(b) Trên `/lab/leave`: gửi một đơn, chuyển sang vai trò Quản lý, bấm "Từ chối đơn #1" và nhập lý do từ chối là `<img src=x onerror=alert(1)>`. Lý do này được hiển thị trở lại dưới trạng thái đơn ("Lý do: ..."). Kết quả đúng: trang hiển thị đúng chuỗi ký tự đó như chữ, không có hình ảnh nào được tạo, không có hộp thoại.

Cách bắt hộp thoại bằng Playwright: đăng ký `page.on("dialog", ...)` **trước** khi thao tác, đếm số lần xuất hiện, và `dismiss()` để không treo test. Nếu bộ đếm lớn hơn 0 thì đã có script chạy, tức là XSS.

### Bước 3. Chuỗi giống SQL injection và dữ liệu quá lớn
Mục đích: ứng dụng không được lỗi hay lộ thông tin khi gặp chuỗi lạ.

Trên `/lab/login`, nhập email `admin'--@lab.dev` (có dấu nháy đơn và hai gạch, nhưng vẫn qua kiểm tra định dạng) cùng mật khẩu `Passw0rd!`. Kết quả đúng: **không** vào được trang chào mừng, thấy thông báo chung "Email hoặc mật khẩu không đúng". Lab chỉ là giao diện nên không có SQL thật; kiểm tra này luyện thói quen và sẽ có ý nghĩa thật khi ứng dụng của bạn nối cơ sở dữ liệu.

Tiếp theo, dữ liệu quá lớn: email gồm 10.000 ký tự `a` cộng `@lab.dev`, mật khẩu 10.000 ký tự. Kết quả đúng: trang vẫn phản hồi, hiện "Email không hợp lệ" và "Mật khẩu tối đa 32 ký tự".

Lưu ý: nếu ở một ứng dụng thật bạn thấy thông báo lỗi kỹ thuật (chuỗi lỗi SQL, stack trace) thì đó là lỗi bảo mật cần báo ngay, kể cả khi trang vẫn chạy.

### Bước 4. Chống dò tài khoản và khoá tài khoản
Mục đích: kẻ xấu không thể biết email nào có trong hệ thống.

Kiểm tra: đăng nhập với email **có** (user@lab.dev) nhưng sai mật khẩu, rồi email **không có** (nobody@lab.dev). Hai thông báo phải **giống hệt nhau** ("Email hoặc mật khẩu không đúng"). Nếu khác nhau (ví dụ "Email không tồn tại"), kẻ xấu có thể dò danh sách tài khoản. LAB-01 có BUG-03 làm đúng điều này.

Ngoài ra BR-03: sai 5 lần thì khoá 15 phút. Test brute force an toàn là đếm: sai 4 lần chưa khoá, sai lần 5 bị khoá (xem bài 3.3). Bạn không cần lặp hàng nghìn lần.

### Bước 5. Ma trận phân quyền
Mục đích: mỗi vai trò chỉ làm được đúng việc của mình.

Với LAB-07 có hai vai trò: Nhân viên và Quản lý. Các hành động: Gửi đơn, Huỷ đơn, Duyệt đơn, Từ chối đơn. Ma trận mong đợi (BR-05, BR-06):

| Vai trò | Gửi đơn | Huỷ đơn chờ duyệt | Duyệt | Từ chối |
|---------|---------|-------------------|-------|---------|
| Nhân viên | Được | Được | Không | Không |
| Quản lý | Không (không có form) | Không | Được | Được (kèm lý do) |

Có 2 nhân 4 bằng 8 ô: 4 ô "Được" và 4 ô "Không". Test cả ô "Không" mới là kiểm tra bảo mật; BUG-02 của LAB-07 làm nhân viên thấy nút Duyệt chính là lỗi ở ô "Nhân viên, Duyệt". Ở LAB-26 (`/lab/rbac`) bạn sẽ gặp phiên bản API với mã lỗi 401, 403 và 404; kiểm tra phía giao diện (ẩn nút) chưa đủ, ứng dụng thật còn phải chặn ở máy chủ.

### Bước 6. Truy cập cơ bản bằng bàn phím
Mục đích: người không dùng chuột vẫn hoàn thành được tác vụ.

Kiểm tra thủ công (rồi tự động hoá), với màn hình đăng nhập:

| Kiểm tra | Cách làm | Kết quả đúng |
|----------|----------|--------------|
| Thứ tự Tab | Bấm Tab từ ô Email | Email, Mật khẩu, "Ghi nhớ đăng nhập", nút "Đăng nhập" |
| Gửi form bằng Enter | Ở ô Mật khẩu bấm Enter | Form được gửi (lỗi hiện hoặc đăng nhập) |
| Checkbox bằng Space | Focus vào "Ghi nhớ đăng nhập", bấm Space | Checkbox được tick |
| Nhãn gắn đúng ô | `getByLabel("Email")` tìm được ô | Nhãn và ô liên kết (đúng ý nghĩa a11y) |
| Báo lỗi cho trình đọc | Gửi dữ liệu sai | Ô có `aria-invalid="true"`; thông báo lỗi chung có `role="alert"` |
| Vi phạm tự động | Quét bằng axe | Không có vi phạm WCAG 2 A hoặc AA mức nghiêm trọng |

Lưu ý khi tự động hoá `role="alert"`: Next.js thêm một phần tử `role="alert"` ẩn cho việc thông báo chuyển trang, nên `getByRole("alert")` trần sẽ khớp hai phần tử và báo `strict mode violation`. Hãy thu hẹp bằng `filter({ hasText: ... })` hoặc `getByTestId`.

Quan sát thêm (không tự động hoá được dễ): thông báo lỗi dưới ô nhập hiện chưa được liên kết với ô qua `aria-describedby`; đó là gợi ý cải tiến ghi vào báo cáo chứ không phải lỗi chặn. Bài 5.4 sẽ đi sâu vào axe và WCAG.

## Demo code
Mọi test chạy trên `/lab/login` và `/lab/leave`. Đây là phần LAB-01; ghi chú từng đoạn.

```ts
import { test, expect, type Page } from "@playwright/test";

async function loginWith(page: Page, email: string, password: string) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByTestId("reset-data").click();
});

test("[SEC][BR-01] email chứa mã script không làm chạy script", async ({ page }) => {
  let dialogs = 0;
  page.on("dialog", (d) => {   // đăng ký trước khi thao tác
    dialogs++;
    void d.dismiss();
  });
  await loginWith(page, "<img src=x onerror=alert(1)>", "Passw0rd!");
  await expect(page.getByTestId("email-error")).toHaveText("Email không hợp lệ");
  expect(dialogs).toBe(0);
});

test("[SEC][BR-01] chuỗi giống SQL injection không đăng nhập được", async ({ page }) => {
  await loginWith(page, "admin'--@lab.dev", "Passw0rd!");
  await expect(page.getByTestId("dashboard")).toHaveCount(0);
  await expect(page.getByTestId("form-error")).toHaveText("Email hoặc mật khẩu không đúng");
});

test("[NEG][BR-01,BR-02] đầu vào dài 10.000 ký tự vẫn được xử lý", async ({ page }) => {
  await loginWith(page, "a".repeat(10_000) + "@lab.dev", "Aa1!" + "x".repeat(9_996));
  await expect(page.getByTestId("email-error")).toHaveText("Email không hợp lệ");
  await expect(page.getByTestId("password-error")).toContainText("tối đa 32");
});

test("[SEC] thông báo sai mật khẩu giống nhau cho email có và không có", async ({ page }) => {
  await loginWith(page, "user@lab.dev", "Wrong123!");
  const existing = await page.getByTestId("form-error").innerText();
  await loginWith(page, "nobody@lab.dev", "Wrong123!");
  const unknown = await page.getByTestId("form-error").innerText();
  expect(unknown).toBe(existing);   // khác nhau nghĩa là lộ tài khoản (BUG-03)
});

test("[A11Y] thứ tự Tab: Email, Mật khẩu, Ghi nhớ, Đăng nhập", async ({ page }) => {
  await page.getByLabel("Email").focus();
  await expect(page.getByLabel("Email")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Mật khẩu")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("checkbox", { name: "Ghi nhớ đăng nhập" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeFocused();
});

test("[A11Y] Enter gửi form; ô lỗi có aria-invalid", async ({ page }) => {
  await page.getByLabel("Email").fill("userlab.dev");
  await page.getByLabel("Mật khẩu").fill("Passw0rd!");
  await page.getByLabel("Mật khẩu").press("Enter");
  await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("email-error")).toBeVisible();
});

test("[A11Y] Space tick được checkbox Ghi nhớ đăng nhập", async ({ page }) => {
  await page.getByRole("checkbox", { name: "Ghi nhớ đăng nhập" }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("checkbox", { name: "Ghi nhớ đăng nhập" })).toBeChecked();
});

test("[A11Y] thông báo lỗi có role alert", async ({ page }) => {
  await loginWith(page, "user@lab.dev", "Wrong123!");
  // Next.js có thêm một alert ẩn, nên phải lọc theo nội dung.
  await expect(page.getByRole("alert").filter({ hasText: "không đúng" })).toBeVisible();
});
```

Và đoạn kiểm tra tự động bằng axe (cài `npm i -D @axe-core/playwright` trước; repo của site đã có):

```ts
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

test("[A11Y] màn hình đăng nhập không có vi phạm WCAG 2 A/AA", async ({ page }) => {
  await page.goto("/lab/login");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations).toEqual([]);
});
```

Phần phân quyền LAB-07, mỗi dòng là một ô của ma trận:

```ts
import { test, expect } from "@playwright/test";

const NOW = new Date("2026-03-02T09:00:00");

const matrix = [
  { role: "employee", button: "Gửi đơn", allowed: true },
  { role: "employee", button: "Huỷ đơn #1", allowed: true },
  { role: "employee", button: "Duyệt đơn #1", allowed: false },
  { role: "employee", button: "Từ chối đơn #1", allowed: false },
  { role: "manager", button: "Gửi đơn", allowed: false },
  { role: "manager", button: "Huỷ đơn #1", allowed: false },
  { role: "manager", button: "Duyệt đơn #1", allowed: true },
  { role: "manager", button: "Từ chối đơn #1", allowed: true },
] as const;

for (const m of matrix) {
  test(`[PERM][BR-05] ${m.role} ${m.allowed ? "thấy" : "không thấy"} nút "${m.button}"`, async ({ page, context }) => {
    await context.clock.setFixedTime(NOW);
    await page.goto("/lab/leave");
    await page.getByTestId("reset-data").click();

    // Tạo một đơn chờ duyệt với vai trò mặc định (Nhân viên).
    await page.getByLabel("Từ ngày").fill("2026-03-09");
    await page.getByLabel("Đến ngày").fill("2026-03-10");
    await page.getByLabel("Lý do").fill("Đi công tác gia đình xa");
    await page.getByRole("button", { name: "Gửi đơn" }).click();

    await page.getByLabel("Vai trò").selectOption(m.role);
    await expect(page.getByRole("button", { name: m.button })).toHaveCount(m.allowed ? 1 : 0);
  });
}

test("[SEC] lý do từ chối chứa mã script được hiển thị như chữ", async ({ page, context }) => {
  let dialogs = 0;
  page.on("dialog", (d) => {
    dialogs++;
    void d.dismiss();
  });
  await context.clock.setFixedTime(NOW);
  await page.goto("/lab/leave");
  await page.getByTestId("reset-data").click();
  await page.getByLabel("Từ ngày").fill("2026-03-09");
  await page.getByLabel("Đến ngày").fill("2026-03-09");
  await page.getByLabel("Lý do").fill("Đi công tác gia đình xa");
  await page.getByRole("button", { name: "Gửi đơn" }).click();

  const payload = "<img src=x onerror=alert(1)>";
  await page.getByLabel("Vai trò").selectOption("manager");
  await page.getByRole("button", { name: "Từ chối đơn #1" }).click();
  await page.getByLabel("Lý do từ chối").fill(payload);
  await page.getByRole("button", { name: "Xác nhận từ chối" }).click();

  await expect(page.getByText(`Lý do: ${payload}`)).toBeVisible();   // hiện đúng dạng chữ
  await expect(page.locator("img[src='x']")).toHaveCount(0);          // không tạo thẻ img
  expect(dialogs).toBe(0);
});
```

Giải thích: `matrix` mã hoá ma trận quyền thành dữ liệu, `toHaveCount(0)` cho các ô "Không". Bài test cuối kiểm hai điều cùng lúc: chuỗi được hiển thị nguyên văn (như chữ) và không sinh ra thẻ `<img>` hay hộp thoại.

## Thử ngay trong lab
1. Chạy bộ test trên lab sạch (tất cả xanh).
2. Đổi `page.goto` của test "thông báo sai mật khẩu giống nhau" thành `/lab/login?bugs=BUG-03`: test **đỏ** (`Expected: "Email hoặc mật khẩu không đúng" Received: "Email không tồn tại"`). Đó là lỗi chống dò tài khoản.
3. Đổi `/lab/leave` thành `/lab/leave?bugs=BUG-02` và chạy dòng ma trận `employee` + "Duyệt đơn #1": test đỏ vì nhân viên thấy nút Duyệt.
4. Mở `/lab/rbac` (LAB-26) và thử đổi id trong URL tài liệu sang tổ chức khác; so sánh với ma trận 401, 403, 404 ở `/labs/rbac`.

## Lỗi thường gặp
- **Triệu chứng**: `strict mode violation: getByRole('alert') resolved to 2 elements`. **Nguyên nhân**: có một `role="alert"` khác của Next.js (route announcer). **Cách sửa**: lọc theo nội dung `getByRole("alert").filter({ hasText: "..." })` hoặc dùng `getByTestId("form-error")`.
- **Triệu chứng**: test XSS luôn xanh dù ứng dụng có lỗ hổng. **Nguyên nhân**: đăng ký `page.on("dialog")` sau khi script đã chạy, hoặc không có bộ đếm kiểm lại. **Cách sửa**: đăng ký trước thao tác và `expect(dialogs).toBe(0)`.
- **Triệu chứng**: test mật khẩu 10.000 ký tự chạy rất chậm hoặc trình duyệt treo. **Nguyên nhân**: ứng dụng xử lý chuỗi dài không hiệu quả; đây có thể là lỗi thật. **Cách sửa**: ghi nhận thời gian và báo lỗi hiệu năng; dùng độ dài vừa đủ để kiểm.
- **Triệu chứng**: test ma trận phân quyền đỏ ở ô "Quản lý, Gửi đơn" dù bạn nghĩ quản lý được gửi. **Nguyên nhân**: BR chỉ nói nhân viên gửi đơn; hành vi lab ẩn form với Quản lý. **Cách sửa**: xác nhận BR trước (bài 3.1), đừng đoán.
- **Triệu chứng**: `strict mode violation: getByLabel('Ghi nhớ đăng nhập') resolved to 2 elements`. **Nguyên nhân**: checkbox của shadcn gồm một `span role="checkbox"` và một `<input>` ẩn cùng gắn với nhãn. **Cách sửa**: tìm theo role như trong Demo, `getByRole("checkbox", { name: "Ghi nhớ đăng nhập" })`.

## Tóm tắt
- Negative test dùng danh sách dữ liệu xấu theo nhóm: rỗng, khoảng trắng, quá dài, ký tự đặc biệt, chuỗi tấn công, kiểu sai, Unicode.
- Với XSS kiểm ở cả nơi nhập và nơi hiển thị lại; bắt hộp thoại bằng `page.on("dialog")` và đếm.
- Thông báo lỗi đăng nhập phải giống nhau cho tài khoản có và không có (chống dò tài khoản); kiểm biên khoá thay vì brute force thật.
- Phân quyền phải kiểm ở cả ô "Không được" của ma trận vai trò nhân hành động.
- Truy cập cơ bản: thứ tự Tab, Enter, Space, nhãn gắn đúng ô, `aria-invalid`, `role="alert"` và quét axe.
- Chỉ thử dữ liệu tấn công trên hệ thống của bạn hoặc lab; báo ngay khi thấy lỗi kỹ thuật bị lộ.

## Bài tập
1. Lập bảng dữ liệu xấu cho trường "Họ tên" và "Tuổi" của `/lab/forms` theo 7 nhóm ở Bước 1. Xong khi: mỗi nhóm có ít nhất một giá trị cụ thể và kết quả mong đợi.
2. Viết test XSS cho một ô nhập hiển thị lại dữ liệu ở lab khác (gợi ý `/lab/todo` với tên công việc). Xong khi: test xanh, có đếm hộp thoại và kiểm không có thẻ `<img>`.
3. Chạy bộ test Demo trên `?bugs=BUG-03` (LAB-01) và `?bugs=BUG-02` (LAB-07), ghi lại test nào đỏ. Xong khi: bạn giải thích được mỗi test đỏ ứng với ô nào của ma trận hoặc nguyên tắc bảo mật nào.
4. Viết test Tab order cho form tạo đơn của LAB-07 (Loại nghỉ, Từ ngày, Đến ngày, Lý do, Gửi đơn). Xong khi: bạn xác nhận thứ tự thực tế và ghi nhận nếu có chỗ bất thường.
5. (Nâng cao) Quét axe cho `/lab/leave` và `/lab/table`; nếu có vi phạm mức nghiêm trọng, chép mô tả vào báo cáo kèm phần tử (selector). Xong khi: bạn có danh sách vi phạm hoặc kết luận "không có vi phạm nghiêm trọng".
