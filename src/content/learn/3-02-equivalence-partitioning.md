---
title: Phân vùng tương đương (Equivalence Partitioning)
level: 3
order: 2
minutes: 45
summary: Chia dữ liệu vào các lớp tương đương để giảm số test mà vẫn phủ đủ.
keywords: [equivalence partitioning ví dụ, valid invalid class, test design technique]
---

## Mục tiêu bài học
- Giải thích được vì sao chỉ cần một giá trị đại diện cho mỗi **lớp tương đương** thay vì thử mọi giá trị.
- Chia đúng các lớp hợp lệ và không hợp lệ cho trường email và mật khẩu của LAB-01.
- Thiết kế bộ test mà mỗi test không hợp lệ chỉ vi phạm **một** lớp (tránh lỗi này che lỗi kia).
- Tính được số test cần có và viết thành bảng test case có đủ cột ID, tiền điều kiện, bước, dữ liệu, kết quả mong đợi.

## Bạn cần chuẩn bị
- Đã đọc bài 3.1 (có BR đánh số). Mở `/labs/login` để xem BR của LAB-01 và `/lab/login` để thao tác.
- Biết viết test Playwright cơ bản: `fill`, `click`, `expect(...).toHaveText` (Level 2).

## Kiến thức cần nắm
- **Lớp tương đương** (equivalence class): tập giá trị mà hệ thống xử lý "giống nhau". Một giá trị đại diện đủ thay cho cả lớp.
- Lớp **hợp lệ** (valid) và **không hợp lệ** (invalid); mỗi lớp không hợp lệ có thông báo lỗi riêng.
- Nguyên tắc **single fault**: mỗi test không hợp lệ chỉ chứa một lỗi.
- **Masking** (che lỗi): hệ thống dừng ở lỗi đầu tiên nên lỗi thứ hai không bao giờ được kiểm.
- Phân vùng cả **đầu vào** lẫn **đầu ra** (ví dụ phí ship 0 hoặc 30.000).

## Giải thích dễ hiểu
Hãy tưởng tượng một cổng soát vé chỉ cho người từ 18 tuổi trở lên vào. Bạn không cần thử từng tuổi 19, 20, 21...: nếu cổng đúng với người 25 tuổi thì gần như chắc chắn đúng với người 26 tuổi. Nhưng "dưới 18" và "từ 18 trở lên" là hai nhóm cư xử **khác nhau**, nên mỗi nhóm cần ít nhất một đại diện. Mỗi nhóm đó là một lớp tương đương.

Lý do kỹ thuật: lập trình viên viết điều kiện (if) chia không gian đầu vào thành những vùng, và mã trong cùng một vùng chạy cùng một đường. Lỗi thường nằm ở việc **sai vùng** chứ ít khi nằm ở một giá trị đơn lẻ trong vùng. EP giúp bạn đi từ "vô số giá trị" xuống "một vài test có chủ đích". Kỹ thuật tiếp theo (bài 3.3, giá trị biên) bổ sung phần "sát đường ranh giữa các vùng" vì đó là nơi lập trình viên hay viết sai dấu `<` và `<=`.

Cần phân biệt: EP trả lời "thử **nhóm** nào", còn BVA trả lời "thử **chỗ nào** trong nhóm". Dùng cả hai.

## Thực hành từng bước
Ví dụ xuyên suốt: màn hình đăng nhập `/lab/login` với BR-01 (email hợp lệ, tối đa 254 ký tự) và BR-02 (mật khẩu 8 đến 32 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt).

### Bước 1. Chọn biến đầu vào và BR liên quan
Mục đích: mỗi lần chỉ phân vùng một biến.

| Biến | BR | Ghi chú |
|------|----|---------|
| Email | BR-01 | Chuỗi nhập vào ô Email |
| Mật khẩu | BR-02 | Chuỗi nhập vào ô Mật khẩu |

Kết quả mong đợi: hai biến, mỗi biến một BR. (Ô "Ghi nhớ đăng nhập" là biến thứ ba, chỉ có hai lớp tick/không tick nên bỏ qua trong bài này.)

### Bước 2. Chia lớp cho Email
Mục đích: liệt kê mọi cách một email có thể "đúng" hoặc "sai", mỗi cách là một lớp.

Hỏi: "Có những lý do khác nhau nào khiến email bị từ chối?" Mỗi lý do khác nhau là một lớp không hợp lệ. Bạn thử bằng tay trên `/lab/login` (mật khẩu để `Passw0rd!` để không bị lỗi mật khẩu che mất):

| Lớp | Mô tả | Giá trị đại diện | Thông báo quan sát được |
|-----|-------|------------------|-------------------------|
| EP-E1 (hợp lệ) | Có dạng phần-tên@tên-miền.đuôi | `user@lab.dev` | Không có lỗi email |
| EP-E2 | Rỗng | (để trống) | "Vui lòng nhập email" |
| EP-E3 | Thiếu ký tự @ | `userlab.dev` | "Email không hợp lệ" |
| EP-E4 | Thiếu phần mở rộng sau dấu chấm | `user@lab` | "Email không hợp lệ" |
| EP-E5 | Chứa khoảng trắng | `us er@lab.dev` | "Email không hợp lệ" |
| EP-E6 | Chứa ký tự < hoặc > (thường là thử XSS) | `<script>alert(1)</script>` | "Email không hợp lệ" |

Lưu ý: lớp quá dài (hơn 254 ký tự) là một lớp nữa, nhưng nó thuộc về **biên** nên ta để cho bài 3.3. Tổng cộng: 1 lớp hợp lệ và 5 lớp không hợp lệ. Ngoài ra lab cũng từ chối email có dấu chấm đặt sai chỗ (hai dấu chấm liên tiếp, bắt đầu bằng dấu chấm, hoặc phần tên kết thúc bằng dấu chấm), ví dụ `user@lab..dev`, `us..er@lab.dev`, `.user@lab.dev`, `user.@lab.dev`, đều báo "Email không hợp lệ"; ta coi chúng là các biến thể của lớp định dạng sai thay vì tách thêm lớp.

### Bước 3. Chia lớp cho Mật khẩu theo từng tiêu chí
Mục đích: BR-02 có nhiều tiêu chí độc lập (độ dài, bốn loại ký tự), phải tách từng tiêu chí.

Tiêu chí **độ dài**: rỗng, dưới 8, từ 8 đến 32, trên 32. Tiêu chí **thành phần**: đủ bốn loại hoặc thiếu một trong bốn loại (thiếu chữ hoa, thiếu chữ thường, thiếu số, thiếu ký tự đặc biệt). Lớp hợp lệ duy nhất là "dài từ 8 đến 32 **và** đủ bốn loại".

| Lớp | Mô tả | Giá trị đại diện | Độ dài | Thông báo |
|-----|-------|------------------|--------|-----------|
| EP-P1 (hợp lệ) | 8 đến 32 ký tự, đủ 4 loại | `Passw0rd!` | 9 | Không có lỗi mật khẩu |
| EP-P2 | Rỗng | (để trống) | 0 | "Vui lòng nhập mật khẩu" |
| EP-P3 | Quá ngắn | `Pa1!` | 4 | "Mật khẩu tối thiểu 8 ký tự" |
| EP-P4 | Quá dài | `Aa1!` cộng 29 chữ x | 33 | "Mật khẩu tối đa 32 ký tự" |
| EP-P5 | Thiếu chữ hoa | `passw0rd!` | 9 | "Mật khẩu cần chữ hoa, chữ thường, số và ký tự đặc biệt" |
| EP-P6 | Thiếu chữ thường | `PASSW0RD!` | 9 | cùng thông báo ở EP-P5 |
| EP-P7 | Thiếu số | `Password!` | 9 | cùng thông báo ở EP-P5 |
| EP-P8 | Thiếu ký tự đặc biệt | `Passw0rdd` | 9 | cùng thông báo ở EP-P5 |

Chú ý cách chọn dữ liệu: các lớp EP-P5 đến EP-P8 đều dài 9 ký tự để **không** vi phạm lớp độ dài. Nếu bạn lấy `Pass0rd` (7 ký tự, thiếu ký tự đặc biệt) cho lớp EP-P8, ứng dụng sẽ báo "tối thiểu 8" và lớp thành phần không bao giờ được kiểm. Đó là hiện tượng **masking**.

Một quan sát: bốn lớp EP-P5 đến EP-P8 dùng cùng một thông báo. Ứng dụng có thể gộp chung một đoạn mã. Dù vậy vẫn nên giữ bốn test, vì nếu lập trình viên sau này sửa regex và quên kiểm tra riêng ký tự đặc biệt, chỉ có test EP-P8 mới đỏ.

Kết quả mong đợi: 8 lớp mật khẩu (1 hợp lệ, 7 không hợp lệ).

### Bước 4. Tính số test cần có
Mục đích: biết quy mô công việc trước khi viết.

Nguyên tắc: **lớp hợp lệ gom lại, lớp không hợp lệ tách riêng**. Một test "happy" dùng cả EP-E1 và EP-P1. Mỗi lớp không hợp lệ là một test riêng, với các biến còn lại để ở giá trị hợp lệ.

| Thành phần | Số test |
|------------|---------|
| Happy path (EP-E1 và EP-P1) | 1 |
| Email không hợp lệ (EP-E2 đến EP-E6) | 5 |
| Mật khẩu không hợp lệ (EP-P2 đến EP-P8) | 7 |
| Tổng | 13 |

So sánh: nếu tổ hợp mọi lớp của hai biến thì có 6 nhân 8 bằng 48 test, mà hầu hết trùng ý nghĩa (email sai và mật khẩu sai cùng lúc chỉ cho thấy một thông báo lỗi nào đó che cái kia). 13 test cũng đã phủ mọi lớp ít nhất một lần.

### Bước 5. Viết bảng test case
Mục đích: biến lớp thành test case có thể chạy.

Cột bắt buộc: ID, tiền điều kiện, bước, dữ liệu, kết quả mong đợi. Đây là các dòng của nhóm Email (viết đầy đủ để bạn có khuôn mẫu):

| ID | Tiền điều kiện | Bước | Dữ liệu | Kết quả mong đợi |
|----|----------------|------|---------|------------------|
| TC-EP-01 | Ở trang `/lab/login`, dữ liệu đã reset | Nhập email và mật khẩu, bấm Đăng nhập | `user@lab.dev` / `Passw0rd!` | Vào trang chào mừng (testid dashboard) |
| TC-EP-02 | Như trên | Để trống email, nhập mật khẩu, bấm Đăng nhập | (rỗng) / `Passw0rd!` | Báo "Vui lòng nhập email" |
| TC-EP-03 | Như trên | Nhập email thiếu @ | `userlab.dev` / `Passw0rd!` | Báo "Email không hợp lệ" |
| TC-EP-04 | Như trên | Nhập email thiếu phần mở rộng | `user@lab` / `Passw0rd!` | Báo "Email không hợp lệ" |
| TC-EP-05 | Như trên | Nhập email có khoảng trắng | `us er@lab.dev` / `Passw0rd!` | Báo "Email không hợp lệ" |
| TC-EP-06 | Như trên | Nhập email chứa dấu < > | `<script>alert(1)</script>` / `Passw0rd!` | Báo "Email không hợp lệ", không có hộp thoại script |

Bạn tự làm tiếp bảng cho 7 lớp mật khẩu theo cùng khuôn (bài tập 1).

### Bước 6. Áp dụng cho một BR có điều kiện: Loại nghỉ và số ngày (LAB-07)
Mục đích: thấy EP không chỉ cho chuỗi ký tự.

BR-03 của LAB-07 nói phép năm còn 12 ngày, nhưng nghỉ ốm không bị giới hạn bởi số dư (xem TC-H-007). Hai biến (loại nghỉ, số ngày) tạo ra các lớp:

| Lớp | Loại nghỉ | Số ngày | Kết quả |
|-----|-----------|---------|---------|
| A | Phép năm | 1 đến 12 | Gửi được |
| B | Phép năm | từ 13 trở lên | Báo vượt phép năm còn lại |
| C | Nghỉ ốm | bất kỳ (ví dụ 20) | Gửi được |
| D | Nghỉ không lương | bất kỳ | Gửi được (cần xác nhận ở bước phân tích) |

Bốn lớp, bốn test. Lớp B là chỗ BVA sẽ bổ sung 12 và 13 ở bài sau.

### Bước 7. Phân vùng đầu ra
Mục đích: đôi khi dễ chia lớp theo kết quả hơn theo đầu vào.

Ở LAB-03, phí ship chỉ có hai giá trị: 0 hoặc 30.000. Hai lớp đầu ra này kéo theo hai lớp đầu vào: "tạm tính sau giảm giá nhỏ hơn 1.000.000" và "từ 1.000.000 trở lên". Với bảng dữ liệu LAB-08, ô tìm kiếm có bốn lớp: khớp theo tên, khớp theo email, khớp không phân biệt hoa thường (nhập `MINH` ra 3 người), và không có kết quả (hiện thông báo trống).

## Demo code
Spec dưới đây chuyển bảng lớp thành test data-driven: một mảng dữ liệu sinh ra nhiều test. Nó chạy được trên `/lab/login`.

```ts
import { test, expect, type Page } from "@playwright/test";

// Hàm thao tác dùng chung: điền email, mật khẩu rồi bấm Đăng nhập.
async function loginWith(page: Page, email: string, password: string) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByTestId("reset-data").click(); // mỗi test bắt đầu từ trạng thái sạch
});

// Mỗi phần tử = một lớp tương đương không hợp lệ của Email (mật khẩu giữ hợp lệ).
const emailClasses = [
  { id: "EP-E2", name: "rỗng", value: "", error: "Vui lòng nhập email" },
  { id: "EP-E3", name: "thiếu @", value: "userlab.dev", error: "Email không hợp lệ" },
  { id: "EP-E4", name: "thiếu phần mở rộng", value: "user@lab", error: "Email không hợp lệ" },
  { id: "EP-E5", name: "có khoảng trắng", value: "us er@lab.dev", error: "Email không hợp lệ" },
  { id: "EP-E6", name: "chứa dấu < >", value: "<script>alert(1)</script>", error: "Email không hợp lệ" },
];

for (const c of emailClasses) {
  test(`[${c.id}][BR-01] email ${c.name} bị từ chối`, async ({ page }) => {
    await loginWith(page, c.value, "Passw0rd!");
    await expect(page.getByTestId("email-error")).toHaveText(c.error);
  });
}

// Mỗi phần tử = một lớp không hợp lệ của Mật khẩu (email giữ hợp lệ).
const passwordClasses = [
  { id: "EP-P2", name: "rỗng", value: "", error: "Vui lòng nhập mật khẩu" },
  { id: "EP-P3", name: "quá ngắn", value: "Pa1!", error: "tối thiểu 8" },
  { id: "EP-P4", name: "quá dài", value: "Aa1!" + "x".repeat(29), error: "tối đa 32" },
  { id: "EP-P5", name: "thiếu chữ hoa", value: "passw0rd!", error: "cần chữ hoa" },
  { id: "EP-P6", name: "thiếu chữ thường", value: "PASSW0RD!", error: "cần chữ hoa" },
  { id: "EP-P7", name: "thiếu số", value: "Password!", error: "cần chữ hoa" },
  { id: "EP-P8", name: "thiếu ký tự đặc biệt", value: "Passw0rdd", error: "cần chữ hoa" },
];

for (const c of passwordClasses) {
  test(`[${c.id}][BR-02] mật khẩu ${c.name} bị từ chối`, async ({ page }) => {
    await loginWith(page, "user@lab.dev", c.value);
    await expect(page.getByTestId("password-error")).toContainText(c.error);
  });
}

// Lớp hợp lệ gộp một test happy path.
test("[EP-E1,EP-P1][BR-01,BR-02] email và mật khẩu hợp lệ đăng nhập được", async ({ page }) => {
  await loginWith(page, "user@lab.dev", "Passw0rd!");
  await expect(page.getByTestId("dashboard")).toBeVisible();
});
```

Giải thích: hai mảng `emailClasses` và `passwordClasses` là **bảng lớp** viết thành dữ liệu; vòng `for` sinh một test cho mỗi dòng nên thêm lớp mới chỉ là thêm một dòng. Tên test chứa ID lớp và BR để truy vết. `toHaveText` dùng cho thông báo ngắn cố định, `toContainText` cho phần cần so một đoạn của thông báo dài. Lỗi mật khẩu dùng chung một thông báo nên bốn dòng EP-P5 đến EP-P8 cùng `error`.

## Thử ngay trong lab
Mở `/lab/login`. Thử từng giá trị đại diện ở Bước 2 và Bước 3, ghi lại thông báo. Hãy thử thêm hai thí nghiệm: (1) nhập mật khẩu `Pass0rd` (7 ký tự, thiếu ký tự đặc biệt) và xem thông báo nào xuất hiện; (2) nhập email rỗng cùng mật khẩu rỗng và xem hai lỗi có hiện cùng lúc không. Sau đó mở `/labs/login` để so sánh với test case mẫu TC-L-002 và TC-L-005. Bật `?bugs=BUG-01` (mật khẩu 7 ký tự được chấp nhận) để thấy test của bạn ở nhóm này chưa đủ: nhóm EP không bắt được BUG-01, chỉ BVA ở bài sau mới bắt được. Đó là bằng chứng cho việc cần dùng cả hai kỹ thuật.

## Lỗi thường gặp
- **Triệu chứng**: test "thiếu ký tự đặc biệt" đỏ với `Expected substring: "cần chữ hoa"` nhưng `Received string: "Mật khẩu tối thiểu 8 ký tự"`. **Nguyên nhân**: dữ liệu `Pass0rd` ngắn 7 ký tự, vi phạm thêm lớp độ dài (masking). **Cách sửa**: chọn đại diện chỉ vi phạm đúng một lớp, ví dụ `Passw0rdd` (9 ký tự).
- **Triệu chứng**: tổ hợp 6 lớp email với 8 lớp mật khẩu tạo 48 test và chạy rất lâu. **Nguyên nhân**: tổ hợp mọi lớp không hợp lệ với nhau. **Cách sửa**: lớp không hợp lệ chỉ ghép với lớp hợp lệ của biến khác (13 test).
- **Triệu chứng**: một lớp đại diện lúc xanh lúc đỏ giữa các lần chạy. **Nguyên nhân**: trạng thái cũ còn lại (ví dụ bộ đếm sai mật khẩu của LAB-01 gần chạm ngưỡng khoá). **Cách sửa**: bấm `reset-data` trong `beforeEach`.
- **Triệu chứng**: bỏ sót lớp, ví dụ chỉ thử email thiếu @ mà quên email rỗng. **Nguyên nhân**: chia lớp theo cảm tính. **Cách sửa**: với mỗi BR hỏi "có bao nhiêu lý do khác nhau khiến nó bị vi phạm?" và hỏi cả "giá trị rỗng, khoảng trắng, quá dài có cư xử khác không".
- **Triệu chứng**: test ký tự `<script>` đỏ vì có hộp thoại alert xuất hiện. **Nguyên nhân**: ứng dụng thật sự thực thi script (lỗ hổng XSS). **Cách sửa**: báo bug bảo mật; cách bắt hộp thoại xem bài 3.8.

## Tóm tắt
- Mỗi lớp tương đương cần ít nhất một đại diện; thêm giá trị trong cùng lớp hiếm khi tìm thêm lỗi.
- Chia lớp theo **lý do khác nhau khiến BR bị vi phạm**, bắt đầu từ thông báo lỗi khác nhau.
- Mỗi test không hợp lệ chỉ vi phạm một lớp để tránh masking; chú ý thứ tự kiểm tra của ứng dụng khi chọn dữ liệu.
- Số test: một test happy cho mọi lớp hợp lệ, cộng một test cho mỗi lớp không hợp lệ (ở LAB-01 là 13).
- EP cho biết "thử nhóm nào", BVA (bài sau) cho biết "thử chỗ nào của nhóm"; hai kỹ thuật bổ sung nhau.
- Có thể phân vùng cả đầu ra (phí ship 0 hay 30.000) khi chia theo đầu vào khó.

## Bài tập
1. Hoàn thành bảng test case cho 7 lớp mật khẩu EP-P2 đến EP-P8 theo khuôn ở Bước 5. Xong khi: mỗi dòng có đủ năm cột và dữ liệu chỉ vi phạm đúng một lớp.
2. Chia lớp tương đương cho trường "Lý do" của LAB-07 (BR-01: 10 đến 200 ký tự, được cắt khoảng trắng hai đầu) và cho "Loại nghỉ". Xong khi: bạn liệt kê được ít nhất 5 lớp, kể cả "toàn khoảng trắng".
3. Viết spec data-driven cho các lớp ở bài tập 1 trên `/lab/login`. Xong khi: `npx playwright test` xanh, tên test chứa ID lớp và BR.
4. Chia lớp cho ô tìm kiếm của LAB-08 (`/lab/table`): tên, email, hoa thường, không kết quả, khoảng trắng đầu cuối. Xong khi: có test cho mỗi lớp và bạn dự đoán đúng số người dùng hiển thị với từ khoá `MINH` (3 người).
