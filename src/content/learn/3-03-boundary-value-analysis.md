---
title: Phân tích giá trị biên (BVA)
level: 3
order: 3
minutes: 45
summary: Kiểm tra tại và sát ranh giới của các lớp tương đương, nơi lỗi hay xuất hiện nhất.
keywords: [boundary value analysis, off-by-one error, 3-value boundary]
---

## Mục tiêu bài học
- Giải thích vì sao lỗi tập trung ở ranh giới và nhận ra lỗi **off-by-one** (lệch một đơn vị).
- Tính đúng bộ giá trị biên n-1, n, n+1 cho các BR thật (mật khẩu, email, lý do, ngày phép, ngày bắt đầu).
- Phân biệt biên 2 giá trị và biên 3 giá trị, và tính đúng số test của mỗi cách.
- Nhận ra **biên không tới được** từ giao diện (ví dụ 499.999đ ở giỏ hàng) và chọn giá trị khả đạt gần nhất.
- Viết test data-driven cho biên và thấy nó bắt được BUG-01 của LAB-01.

## Bạn cần chuẩn bị
- Đã học bài 3.2 (lớp tương đương). Mở `/lab/login`, `/lab/leave`, `/lab/cart` và các trang BR tương ứng ở `/labs/<slug>`.
- Hiểu `context.clock.setFixedTime` ở bài Level 2 (LAB-07 dùng để cố định "hôm nay").

## Kiến thức cần nắm
- **Biên** (boundary): giá trị nằm đúng ranh giới giữa hai lớp (ví dụ 8 là giá trị nhỏ nhất hợp lệ của mật khẩu).
- **Off-by-one**: lỗi dùng `<` thay vì `<=` hoặc ngược lại, làm sai đúng một đơn vị tại biên.
- **Biên 2 giá trị** (n và giá trị sát ngoài) và **biên 3 giá trị** (n-1, n, n+1).
- Biên của số, độ dài chuỗi, ngày giờ, số đếm lần thử, kích thước tệp.
- **Biên khả đạt**: giá trị biên mà giao diện thật sự tạo ra được.

## Giải thích dễ hiểu
Hãy nghĩ đến cây cầu có biển "xe dưới 5 tấn". Xe 3 tấn qua và xe 8 tấn bị chặn thì chẳng ai ngạc nhiên. Chuyện thú vị xảy ra với xe đúng 5 tấn: nó qua hay không? Lập trình viên viết `if (weight < 5)` hay `if (weight <= 5)` quyết định điều đó, và đây là chỗ nhầm lẫn rất phổ biến. Vì thế phân tích giá trị biên (BVA) chọn đúng các giá trị sát ranh giới: 4,999 / 5 / 5,001 tấn.

Vì sao BVA ăn khách? Thống kê kinh nghiệm cho thấy nhiều lỗi nghiệp vụ nằm ở điều kiện so sánh. Phép so sánh `<` hay `<=` chỉ sai khi đúng giá trị biên, mà các giá trị "bình thường" ở giữa lớp không phơi bày được lỗi. Bài 3.2 đã cho thấy điều đó: các test EP của LAB-01 không bắt được BUG-01 (mật khẩu 7 ký tự được phép) vì đại diện của lớp "quá ngắn" là 4 ký tự. Chỉ giá trị 7 mới phơi bày lỗi.

## Thực hành từng bước
Ví dụ xuyên suốt: ba chức năng có biên rõ ràng ở các lab của site: mật khẩu và email (LAB-01), lý do và số ngày phép (LAB-07), giảm giá và miễn ship (LAB-03).

### Bước 1. Liệt kê mọi biên trong các BR
Mục đích: mỗi con số trong BR là một ứng viên biên.

| Lab | BR | Biên (con số) | Dạng biên |
|-----|----|---------------|-----------|
| LAB-01 | BR-02 | 8 và 32 ký tự | độ dài chuỗi, hai biên |
| LAB-01 | BR-01 | 254 ký tự | độ dài, biên trên |
| LAB-01 | BR-03 | lần sai thứ 5 | số đếm |
| LAB-07 | BR-01 | lý do 10 và 200 ký tự | độ dài, hai biên |
| LAB-07 | BR-02 | ngày bắt đầu bằng hôm nay | ngày |
| LAB-07 | BR-03 | số ngày 12 so với phép năm 12 | số đếm |
| LAB-03 | BR-02 | tạm tính 500.000đ, trần giảm 100.000đ | tiền |
| LAB-03 | BR-03 | tạm tính sau giảm 1.000.000đ | tiền |
| LAB-03 | BR-01 | số lượng 10, và tồn kho 5 của màn hình | số đếm |

Kết quả mong đợi: bảng các biên, mỗi dòng sẽ được mở rộng thành n-1, n, n+1 ở bước sau.

### Bước 2. Chọn kiểu biên và tính số test
Mục đích: quyết định quy mô.

Biên 2 giá trị lấy biên và giá trị sát ngoài phía sai. Biên 3 giá trị lấy thêm giá trị sát trong. Với khoảng hợp lệ [a, b] có hai biên:

| Kiểu | Giá trị cho mật khẩu 8 đến 32 | Số test |
|------|------------------------------|---------|
| 2 giá trị | 7, 8, 32, 33 | 4 |
| 3 giá trị | 7, 8, 9, 31, 32, 33 | 6 |

Quy tắc chọn: dùng biên 3 giá trị khi chi phí mỗi test nhỏ và hậu quả sai lớn (mật khẩu, tiền). Dùng biên 2 giá trị khi mỗi test tốn kém (ví dụ phải chờ 15 phút). Bài này dùng 3 giá trị.

### Bước 3. Tính biên cho độ dài chuỗi (LAB-01)
Mục đích: chuẩn bị dữ liệu chính xác, không đếm tay.

Dùng hàm sinh chuỗi theo độ dài để tránh đếm nhầm. Mật khẩu có đủ bốn loại ký tự: `"Aa1!" + "x".repeat(n - 4)`.

| Biến | n | Giá trị test | Độ dài | Kết quả mong đợi |
|------|---|--------------|--------|------------------|
| Mật khẩu | 8 | 7 ký tự | 7 | Báo "tối thiểu 8" |
| Mật khẩu | 8 | 8 ký tự | 8 | Qua kiểm tra định dạng |
| Mật khẩu | 8 | 9 ký tự | 9 | Qua kiểm tra định dạng |
| Mật khẩu | 32 | 31 ký tự | 31 | Qua kiểm tra định dạng |
| Mật khẩu | 32 | 32 ký tự | 32 | Qua kiểm tra định dạng |
| Mật khẩu | 32 | 33 ký tự | 33 | Báo "tối đa 32" |
| Email | 254 | 253 ký tự | 253 | Không có lỗi định dạng email |
| Email | 254 | 254 ký tự | 254 | Không có lỗi định dạng email |
| Email | 254 | 255 ký tự | 255 | Báo "Email không hợp lệ" |

Cách dựng email 254 ký tự: phần tên miền `@lab.dev` có 8 ký tự, nên phần tên cần 254 trừ 8 bằng 246 ký tự `a`. Công thức: `"a".repeat(n - "@lab.dev".length) + "@lab.dev"`.

"Qua kiểm tra định dạng" nghĩa là không có lỗi ở dưới ô nhập; sau đó ứng dụng vẫn từ chối vì sai tài khoản (thông báo form "Email hoặc mật khẩu không đúng"). Đó là kết quả đúng, vì ta chỉ kiểm tầng validate.

### Bước 4. Tính biên cho ngày giờ và số đếm (LAB-07)
Mục đích: biên của ngày cần đồng hồ cố định.

Đặt "hôm nay" là 02/03/2026 bằng `context.clock.setFixedTime`.

| BR | Biên n | n-1 | n | n+1 | Kết quả |
|----|--------|-----|---|-----|---------|
| BR-02 | ngày bắt đầu = hôm nay (02/03) | 01/03 | 02/03 | 03/03 | n-1 bị báo "không được ở quá khứ"; n và n+1 hợp lệ |
| BR-03 | số ngày phép năm = 12 | 11 ngày (01/04 đến 11/04) | 12 ngày (đến 12/04) | 13 ngày (đến 13/04) | n+1 bị báo "vượt quá phép năm còn lại (12)" |
| BR-01 | lý do tối thiểu 10 | 9 ký tự | 10 ký tự | 11 ký tự | chỉ 9 bị báo "tối thiểu 10" |
| BR-01 | lý do tối đa 200 | 199 ký tự | 200 ký tự | 201 ký tự | chỉ 201 bị báo "tối đa 200" |

Cách đếm số ngày: BR-03 tính cả ngày đầu và ngày cuối, nên từ 01/04 đến 12/04 là 12 ngày (hiệu 11 cộng 1). Nếu bạn tính "ngày cuối trừ ngày đầu" bạn sẽ ra 11 và đoán sai kết quả mong đợi.

Gợi ý: lab này tính lý do **sau khi cắt khoảng trắng hai đầu**, nên chuỗi test phải dùng ký tự thường (`"x".repeat(n)`), không dùng khoảng trắng.

### Bước 5. Biên khả đạt: khi giao diện không tạo được n-1 và n+1
Mục đích: tránh viết test không thể chạy.

LAB-03 có BR-02: SALE10 yêu cầu tạm tính từ 500.000đ. Biên 3 giá trị theo lý thuyết là 499.999 / 500.000 / 500.001. Nhưng giá sản phẩm trong lab là 450.000 (bàn phím), 250.000 (chuột), 3.200.000 (màn hình), 99.999 (cáp sạc USB-C); tai nghe giá 799.999 đã hết hàng. Ba sản phẩm đầu đều có giá là bội của 50.000, nên nếu không mua cáp sạc thì mọi tổng tạm tính đều là bội của 50.000. Cáp sạc 99.999 là giá lẻ nhưng vẫn không tạo được biên 499.999: 5 cáp ra 499.995 (dưới ngưỡng 5 đồng), còn cộng cáp với sản phẩm khác không khớp 499.999 hay 500.001 ở bất kỳ số lượng nào. Danh sách các tạm tính khả đạt nhỏ hơn 1.300.000 **không dùng cáp sạc**: 250.000, 450.000, 500.000, 700.000, 750.000, 900.000, 950.000, 1.000.000, 1.150.000, 1.200.000, 1.250.000. Vì vậy:

| Biên | Lý thuyết n-1, n, n+1 | Khả đạt gần nhất (dưới, đúng, trên) | Cách có được |
|------|-----------------------|-------------------------------------|--------------|
| Tối thiểu SALE10: 500.000 | 499.999 / 500.000 / 500.001 | 450.000 / 500.000 / 700.000 | 1 bàn phím; 2 chuột; 1 bàn phím và 1 chuột |
| Miễn ship (không mã): 1.000.000 | 999.999 / 1.000.000 / 1.000.001 | 950.000 / 1.000.000 / 1.150.000 | 1 bàn phím và 2 chuột; 4 chuột; 2 bàn phím và 1 chuột |
| Trần giảm 100.000 (10% bằng đúng 100.000 khi tạm tính bằng 1.000.000) | 999.999 / 1.000.000 / 1.000.001 | 950.000 / 1.000.000 / 1.150.000 | như dòng trên |

Giá trị kỳ vọng tại các điểm khả đạt (tính tay trước khi chạy):

| Tạm tính | Có mã SALE10? | Giảm giá | Sau giảm | VAT 8% | Ship | Tổng |
|----------|---------------|----------|----------|--------|------|------|
| 450.000 | có | 0, báo "Đơn tối thiểu 500.000đ" | 450.000 | 36.000 | 30.000 | 516.000 |
| 500.000 | có | 50.000 | 450.000 | 36.000 | 30.000 | 516.000 |
| 700.000 | có | 70.000 | 630.000 | 50.400 | 30.000 | 710.400 |
| 950.000 | có | 95.000 | 855.000 | 68.400 | 30.000 | 953.400 |
| 1.000.000 | có | 100.000 | 900.000 | 72.000 | 30.000 | 1.002.000 |
| 1.150.000 | có | 100.000 (không phải 115.000) | 1.050.000 | 84.000 | 0 | 1.134.000 |

Trong bảng, dòng 500.000 và 450.000 cho tổng bằng nhau (516.000) nhưng vì lý do khác nhau: ở 450.000 không giảm nhưng ship 30.000; ở 500.000 có giảm 50.000. Một test chỉ so **tổng** sẽ không phân biệt được hai trường hợp, nên hãy assert từng dòng (giảm giá, ship).

Với biên thật 499.999 và 500.001 bạn cần cách khác: test ở tầng đơn vị cho hàm tính tiền, tạo dữ liệu qua API, hoặc đề nghị đội thêm sản phẩm giá lẻ phù hợp vào dữ liệu seed (lab đã làm điều này một lần: cáp sạc 99.999đ được thêm để kiểm VAT làm tròn, xem bài 3.7, nhưng giá của nó không tạo ra biên 499.999). Ghi nhận giới hạn này vào báo cáo thay vì bỏ qua.

### Bước 6. Biên theo số lần và trạng thái
Mục đích: biên không chỉ là con số nhập vào.

BR-03 của LAB-01: sai 5 lần thì khoá. Biên là lần thứ 5, nên n-1 bằng 4 lần sai (chưa khoá, vẫn thấy "Email hoặc mật khẩu không đúng"), n bằng 5 lần (bị khoá, thấy thông báo chứa "bị khoá"). Nếu BUG-02 bật thì khoá ở lần thứ 6: test "lần 5 bị khoá" sẽ đỏ.

Tương tự, số lượng sản phẩm ở LAB-03: BR-01 tối đa 10 mỗi sản phẩm và không vượt tồn kho. Màn hình 24 inch (p3) chỉ còn 5 cái, nên biên của nó là 5 (không phải 10): 4, 5, và thử tăng lần thứ 6 sẽ giữ 5 và báo "Tối đa 5 sản phẩm". Chuột (p2) tồn 20 nên biên là 10: giữ 10 và báo "Tối đa 10 sản phẩm".

## Demo code
Hai đoạn: (1) biên độ dài của LAB-01 và (2) biên của đơn nghỉ phép LAB-07 (dùng đồng hồ giả). Cả hai chạy được.

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

// Sinh mật khẩu đủ 4 loại ký tự với độ dài n (n >= 4).
const pwOfLength = (n: number) => "Aa1!" + "x".repeat(n - 4);

const lengthCases = [
  { n: 7, error: "tối thiểu 8" },   // n-1 của biên dưới
  { n: 8, error: null },            // biên dưới
  { n: 9, error: null },            // n+1 của biên dưới
  { n: 31, error: null },           // n-1 của biên trên
  { n: 32, error: null },           // biên trên
  { n: 33, error: "tối đa 32" },    // n+1 của biên trên
];

for (const c of lengthCases) {
  test(`[BVA][BR-02] mật khẩu dài ${c.n} ký tự`, async ({ page }) => {
    await loginWith(page, "user@lab.dev", pwOfLength(c.n));
    if (c.error) await expect(page.getByTestId("password-error")).toContainText(c.error);
    else await expect(page.getByTestId("password-error")).toHaveCount(0);
  });
}

// Email 254 ký tự gồm cả phần "@lab.dev" (8 ký tự).
const emailOfLength = (n: number) => "a".repeat(n - "@lab.dev".length) + "@lab.dev";

for (const c of [
  { n: 253, bad: false },
  { n: 254, bad: false },
  { n: 255, bad: true },
]) {
  test(`[BVA][BR-01] email dài ${c.n} ký tự`, async ({ page }) => {
    await loginWith(page, emailOfLength(c.n), "Passw0rd!");
    await expect(page.getByTestId("email-error")).toHaveCount(c.bad ? 1 : 0);
  });
}

test("[BVA][BR-03] sai lần 4 chưa khoá, lần 5 bị khoá", async ({ page }) => {
  for (let i = 1; i <= 4; i++) await loginWith(page, "user@lab.dev", "Wrong123!");
  await expect(page.getByTestId("form-error")).toHaveText("Email hoặc mật khẩu không đúng");
  await loginWith(page, "user@lab.dev", "Wrong123!");
  await expect(page.getByTestId("form-error")).toContainText("bị khoá");
});
```

Phần LAB-07: mỗi test tự đặt giờ giả để "hôm nay" là 02/03/2026.

```ts
import { test, expect, type BrowserContext, type Page } from "@playwright/test";

const NOW = new Date("2026-03-02T09:00:00");

async function openLeave(page: Page, context: BrowserContext) {
  await context.clock.setFixedTime(NOW);
  await page.goto("/lab/leave");
  await page.getByTestId("reset-data").click();
}

async function send(page: Page, o: { from: string; to: string; reason?: string }) {
  await page.getByLabel("Từ ngày").fill(o.from);
  await page.getByLabel("Đến ngày").fill(o.to);
  await page.getByLabel("Lý do").fill(o.reason ?? "Đi công tác gia đình xa");
  await page.getByRole("button", { name: "Gửi đơn" }).click();
}

// BR-01: lý do 10 đến 200 ký tự (đếm sau khi cắt khoảng trắng).
for (const c of [
  { n: 9, ok: false }, { n: 10, ok: true }, { n: 11, ok: true },
  { n: 199, ok: true }, { n: 200, ok: true }, { n: 201, ok: false },
]) {
  test(`[BVA][BR-01] lý do ${c.n} ký tự`, async ({ page, context }) => {
    await openLeave(page, context);
    await send(page, { from: "2026-03-09", to: "2026-03-09", reason: "x".repeat(c.n) });
    if (c.ok) await expect(page.getByTestId("leave-row")).toHaveCount(1);
    else await expect(page.getByTestId("leave-error")).toContainText(c.n < 10 ? "tối thiểu 10" : "tối đa 200");
  });
}

// BR-02: ngày bắt đầu 01/03 (n-1), 02/03 (n), 03/03 (n+1).
for (const c of [
  { from: "2026-03-01", ok: false },
  { from: "2026-03-02", ok: true },
  { from: "2026-03-03", ok: true },
]) {
  test(`[BVA][BR-02] bắt đầu ${c.from}`, async ({ page, context }) => {
    await openLeave(page, context);
    await send(page, { from: c.from, to: "2026-03-05" });
    if (c.ok) await expect(page.getByTestId("leave-row")).toHaveCount(1);
    else await expect(page.getByTestId("leave-error")).toContainText("không được ở quá khứ");
  });
}

// BR-03: 11, 12, 13 ngày phép năm (tính cả ngày đầu và cuối).
for (const c of [
  { to: "2026-04-11", days: 11, ok: true },
  { to: "2026-04-12", days: 12, ok: true },
  { to: "2026-04-13", days: 13, ok: false },
]) {
  test(`[BVA][BR-03] ${c.days} ngày phép năm`, async ({ page, context }) => {
    await openLeave(page, context);
    await send(page, { from: "2026-04-01", to: c.to });
    if (c.ok) await expect(page.getByTestId("leave-days-1")).toHaveText(String(c.days));
    else await expect(page.getByTestId("leave-error")).toContainText("vượt quá phép năm còn lại (12)");
  });
}
```

Giải thích: mỗi mảng là một **bảng biên** dạng dữ liệu; thêm biên mới là thêm một dòng. `pwOfLength` và `emailOfLength` loại bỏ việc đếm tay. Với `[BVA][BR-02]` ngày bắt đầu, `to` cố định là 05/03 để ngày kết thúc luôn không sớm hơn ngày bắt đầu. `toHaveCount(0)` kiểm tra "không có thông báo lỗi" một cách chờ-được (web-first).

## Thử ngay trong lab
1. Sửa `page.goto("/lab/login")` trong `beforeEach` thành `page.goto("/lab/login?bugs=BUG-01")` rồi chạy test độ dài: dòng "7 ký tự" sẽ **đỏ** (mật khẩu 7 ký tự được chấp nhận), trong khi các test EP của bài 3.2 vẫn xanh. Đó là bằng chứng BVA bắt lỗi mà EP bỏ sót.
2. Đổi tương tự thành `?bugs=BUG-02` và chạy test khoá tài khoản: test "lần 5 bị khoá" đỏ vì lab chỉ khoá ở lần thứ 6.
3. Mở `/lab/cart`, thêm 4 chuột (tạm tính 1.000.000), áp SALE10, đối chiếu bảng Bước 5 từng dòng: giảm 100.000, ship 30.000, tổng 1.002.000. Bấm Reset rồi thêm 2 bàn phím và 1 chuột (1.150.000), áp mã và xem giảm giá vẫn là 100.000, ship bằng 0.

## Lỗi thường gặp
- **Triệu chứng**: test biên 254 ký tự đỏ với `Expected: 0 Received: 1` ở lỗi email. **Nguyên nhân**: đếm sai độ dài, quên rằng 254 gồm cả `@lab.dev`. **Cách sửa**: dùng hàm `emailOfLength` và kiểm `.length` bằng `expect(value).toHaveLength(254)` ngay trong test.
- **Triệu chứng**: test BR-03 "12 ngày" đỏ vì kết quả là 11 ngày. **Nguyên nhân**: tính số ngày là hiệu hai ngày thay vì cộng thêm 1 (đếm cả ngày đầu và cuối). **Cách sửa**: đọc BR kỹ và viết kết quả mong đợi theo BR, không theo trực giác.
- **Triệu chứng**: test đúng biên "ngày bắt đầu bằng hôm nay" lúc xanh lúc đỏ, đặc biệt gần nửa đêm. **Nguyên nhân**: "hôm nay" lấy từ giờ thật. **Cách sửa**: cố định giờ bằng `context.clock.setFixedTime`.
- **Triệu chứng**: không thể nhập 499.999 vào giỏ hàng. **Nguyên nhân**: các tổng tạm tính khả đạt chủ yếu là bội của 50.000 (cáp sạc 99.999 cũng không ghép ra được 499.999), biên thật không khả đạt từ UI. **Cách sửa**: chọn giá trị khả đạt gần nhất (450.000, 500.000, 700.000), ghi nhận giới hạn, kiểm biên thật ở tầng thấp hơn.
- **Triệu chứng**: chạy 6 test biên mà bộ đếm khoá tài khoản làm các test sau bị khoá. **Nguyên nhân**: không reset dữ liệu giữa các test. **Cách sửa**: bấm `reset-data` trong `beforeEach`.

## Tóm tắt
- Lỗi nghiệp vụ tập trung ở ranh giới: `<` và `<=` chỉ khác nhau đúng tại biên.
- Mỗi biên lấy n-1, n, n+1 (3 giá trị) hoặc n và giá trị sát ngoài (2 giá trị); khoảng hợp lệ có hai biên nên mật khẩu 8 đến 32 cần 6 test.
- Dùng hàm sinh dữ liệu theo độ dài thay vì đếm tay; cố định thời gian khi biên là ngày giờ.
- Biên có thể là số đếm lần thử (khoá ở lần 5), số lượng và tồn kho, không chỉ độ dài.
- Phải kiểm tra biên **khả đạt**: ở LAB-03 các tạm tính chủ yếu là bội của 50.000 và không ghép được 499.999 nên dùng 450.000, 500.000, 700.000.
- EP và BVA bổ sung nhau: EP không bắt BUG-01 của LAB-01, BVA bắt được.

## Bài tập
1. Tính bộ biên 3 giá trị cho trường "Họ tên" tối đa 50 ký tự của LAB-02 (`/lab/forms`) và "Tuổi" từ 18 đến 65. Xong khi: bạn có bảng n-1, n, n+1 và kết quả mong đợi cho từng giá trị (tuổi: 17, 18, 19, 64, 65, 66).
2. Viết spec data-driven cho độ dài mật khẩu trên `/lab/login`; chạy với `?bugs=BUG-01` để chứng minh test đỏ đúng dòng 7 ký tự. Xong khi: xanh trên lab sạch, đỏ trên BUG-01.
3. Viết test biên số ngày phép năm (11, 12, 13) cho LAB-07 và kiểm thêm biên "nghỉ ốm 13 ngày vẫn gửi được". Xong khi: cả hai test xanh, tên test có BR.
4. Lập bảng tổng, tạm tính, giảm, VAT, ship cho tạm tính 450.000, 500.000, 700.000 trên LAB-03, rồi viết test kiểm từng dòng. Xong khi: số bạn tính tay trùng với giao diện, và bạn giải thích được vì sao không tạo được 499.999.
5. (Nâng cao) Mở `/lab/clinic` đọc BR-03 và BR-05 (biên 2 giờ và 24 giờ). Liệt kê bộ biên với "bây giờ" cố định bằng `page.clock`. Xong khi: bảng có n-1, n, n+1 tính theo phút.
