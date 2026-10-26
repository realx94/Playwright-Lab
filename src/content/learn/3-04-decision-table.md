---
title: Bảng quyết định (Decision Table)
level: 3
order: 4
minutes: 45
summary: Dùng bảng điều kiện – hành động để kiểm tra các quy tắc có nhiều điều kiện kết hợp.
keywords: [decision table testing, rule combination, condition action table]
---

## Mục tiêu bài học
- Nhận ra khi nào một BR cần bảng quyết định (nhiều điều kiện cùng quyết định một kết quả).
- Lập bảng đầy đủ 2^n cột cho n điều kiện, loại cột bất khả thi, gộp cột bằng dấu gạch (don't care) về dạng rút gọn.
- Tính đúng giá trị mong đợi (giảm giá, VAT, ship, tổng) cho từng luật và chọn dữ liệu khả đạt cho nó.
- Chuyển mỗi luật của bảng thành một test case, rồi thành một dòng dữ liệu của spec Playwright.

## Bạn cần chuẩn bị
- Đã học bài 3.3 (biên khả đạt của LAB-03). Mở `/labs/cart` (BR-02, BR-03, BR-04) và `/lab/cart`.
- Máy tính cầm tay hoặc bảng tính để tự tính tiền; không dùng kết quả của chính ứng dụng làm đáp án.

## Kiến thức cần nắm
- **Điều kiện** (condition): câu hỏi trả lời đúng hoặc sai (ví dụ "đã nhập mã SALE10 hợp lệ").
- **Hành động** (action) hoặc kết quả: điều hệ thống làm (giảm giá bao nhiêu, ship bao nhiêu).
- **Luật** (rule): một cột của bảng, tức một tổ hợp giá trị điều kiện và hành động tương ứng.
- Với n điều kiện kiểu đúng/sai có tối đa **2^n** luật.
- **Gộp luật** bằng dấu "-" (don't care) khi một điều kiện không ảnh hưởng kết quả.
- Cột **bất khả thi** (infeasible): tổ hợp điều kiện không thể xảy ra.

## Giải thích dễ hiểu
Hãy tưởng tượng quy định ở một phòng gym: hội viên được vào cửa miễn phí nếu (thẻ còn hạn) và (không đến sau 22:00). Có hai điều kiện, mỗi cái đúng hoặc sai, nên có bốn tổ hợp. Nếu chỉ thử "thẻ còn hạn, đến sớm" và "thẻ hết hạn", bạn bỏ qua hai tình huống như "thẻ còn hạn nhưng đến muộn". Bảng quyết định buộc bạn liệt kê **mọi** tổ hợp, rồi mới quyết định tổ hợp nào có hành động giống nhau để gộp lại.

Vì sao không dùng EP và BVA là đủ? Vì EP/BVA tập trung vào **một biến** mỗi lần. Khi kết quả phụ thuộc vào **sự kết hợp** nhiều biến (mã giảm giá, ngưỡng đơn tối thiểu, ngưỡng miễn ship), lỗi thường nằm ở sự tương tác: ví dụ miễn ship tính trên số tiền **sau** giảm giá chứ không phải trước. Chỉ có bảng quyết định mới làm lộ tương tác đó.

## Thực hành từng bước
Ví dụ xuyên suốt: giỏ hàng LAB-03 với ba điều kiện về mã SALE10 và phí ship. Dữ liệu sản phẩm: bàn phím cơ 450.000đ, chuột không dây 250.000đ, màn hình 24 inch 3.200.000đ (tồn kho 5), tai nghe hết hàng.

### Bước 1. Chọn điều kiện và hành động
Mục đích: chuyển văn bản BR thành điều kiện đúng/sai độc lập.

BR liên quan: BR-02 (SALE10 giảm 10%, tối thiểu 500.000đ, tối đa giảm 100.000đ), BR-03 (miễn ship khi tạm tính **sau giảm giá** từ 1.000.000đ, còn lại 30.000đ), BR-04 (VAT 8% sau giảm giá, làm tròn đến đồng).

| Ký hiệu | Điều kiện | Cách hiểu |
|---------|-----------|-----------|
| A | Đã nhập mã SALE10 hợp lệ | Có ô mã giảm giá và bấm Áp dụng với `SALE10` |
| B | Tạm tính từ 500.000đ trở lên | Đủ điều kiện dùng mã |
| C | Tạm tính **sau giảm giá** từ 1.000.000đ trở lên | Đủ điều kiện miễn ship |

| Hành động | Giá trị có thể |
|-----------|----------------|
| H1 Giảm giá | 10% của tạm tính, tối đa 100.000đ; hoặc 0 |
| H2 Ship | 0 hoặc 30.000đ |
| H3 Thông báo | Có hoặc không có thông báo "Đơn tối thiểu 500.000đ để dùng mã" |

Kết quả mong đợi: ba điều kiện, ba hành động; bạn sẽ tính được tổng tiền từ chúng.

### Bước 2. Lập bảng đầy đủ 2^n cột
Mục đích: không bỏ sót tổ hợp.

Có 3 điều kiện nên 2 mũ 3 bằng 8 cột. Ta chưa biết cột nào có thật, cứ liệt kê hết, T là đúng, F là sai:

| Cột | A mã | B ≥ 500k | C sau giảm ≥ 1tr |
|-----|------|----------|------------------|
| 1 | T | T | T |
| 2 | T | T | F |
| 3 | T | F | T |
| 4 | T | F | F |
| 5 | F | T | T |
| 6 | F | T | F |
| 7 | F | F | T |
| 8 | F | F | F |

Mẹo liệt kê không sót: cột đầu giữ T, T, T; điều kiện cuối đổi T, F luân phiên, điều kiện giữa đổi mỗi 2 cột, điều kiện đầu đổi mỗi 4 cột (như đếm nhị phân).

Kết quả mong đợi: bảng 8 hàng (mỗi hàng là một luật) và chưa có hành động.

### Bước 3. Loại các cột bất khả thi
Mục đích: không viết test cho tình huống không thể xảy ra.

Điều kiện C (sau giảm giá từ 1.000.000đ) kéo theo B (tạm tính từ 500.000đ), vì tạm tính sau giảm luôn nhỏ hơn hoặc bằng tạm tính ban đầu. Do đó tổ hợp "B sai mà C đúng" không thể xảy ra. Đó là cột 3 (T, F, T) và cột 7 (F, F, T). Loại hai cột này còn 6 cột.

Với A đúng và B sai, mã bị từ chối (không giảm giá), tạm tính sau giảm bằng tạm tính ban đầu nên C buộc phải sai. Cột 4 là tổ hợp thật duy nhất của nhánh này.

Kết quả mong đợi: 6 cột còn lại là 1, 2, 4, 5, 6, 8.

### Bước 4. Điền hành động cho từng cột và gộp
Mục đích: xem cột nào có hành động giống nhau.

| Cột | A | B | C | Giảm giá (H1) | Ship (H2) | Thông báo (H3) |
|-----|---|---|---|---------------|-----------|----------------|
| 1 | T | T | T | 10%, tối đa 100.000 | 0 | không |
| 2 | T | T | F | 10%, tối đa 100.000 | 30.000 | không |
| 4 | T | F | F | 0 | 30.000 | có (đơn tối thiểu) |
| 5 | F | T | T | 0 | 0 | không |
| 6 | F | T | F | 0 | 30.000 | không |
| 8 | F | F | F | 0 | 30.000 | không |

Quan sát: cột 6 và cột 8 có cùng hành động và cùng A sai, C sai; điều kiện B không làm đổi kết quả (không có mã nên 500.000đ không quan trọng). Gộp chúng với B là dấu gạch "-" (don't care).

Bảng rút gọn **5 luật**:

| Luật | A | B | C | Giảm giá | Ship | Thông báo |
|------|---|---|---|----------|------|-----------|
| R1 | T | T | T | 10%, tối đa 100.000 | 0 | không |
| R2 | T | T | F | 10%, tối đa 100.000 | 30.000 | không |
| R3 | T | F | F | 0 | 30.000 | "Đơn tối thiểu 500.000đ" |
| R4 | F | T | T | 0 | 0 | không |
| R5 | F | - | F | 0 | 30.000 | không |

Đối chiếu: 8 cột ban đầu, bỏ 2 cột bất khả thi còn 6, gộp 2 cột thành 1 còn **5 luật**. Số test là 5 thay vì 8.

### Bước 5. Tính giá trị mong đợi cho từng luật
Mục đích: đáp án phải đến từ phép tính tay độc lập.

Công thức theo BR: giảm giá = min(10% của tạm tính, 100.000) nếu có mã và tạm tính ≥ 500.000; sau giảm = tạm tính trừ giảm; VAT = 8% của sau giảm; ship = 0 nếu sau giảm ≥ 1.000.000, ngược lại 30.000; tổng = sau giảm + VAT + ship. VAT chỉ tính trên phần sau giảm, ship không chịu VAT.

Tìm dữ liệu khả đạt cho từng luật (tham khảo các tạm tính khả đạt ở bài 3.3):

| Luật | Giỏ hàng | Tạm tính | Giảm | Sau giảm | VAT 8% | Ship | Tổng |
|------|----------|----------|------|----------|--------|------|------|
| R1 | 1 màn hình + mã | 3.200.000 | 100.000 (10% là 320.000, bị chặn trần) | 3.100.000 | 248.000 | 0 | 3.348.000 |
| R2 | 4 chuột + mã | 1.000.000 | 100.000 | 900.000 | 72.000 | 30.000 | 1.002.000 |
| R3 | 1 chuột + mã (bị từ chối) | 250.000 | 0 | 250.000 | 20.000 | 30.000 | 300.000 |
| R4 | 1 màn hình, không mã | 3.200.000 | 0 | 3.200.000 | 256.000 | 0 | 3.456.000 |
| R5 | 2 chuột, không mã | 500.000 | 0 | 500.000 | 40.000 | 30.000 | 570.000 |

Chú ý luật R2: tạm tính đúng 1.000.000đ nhưng **sau giảm** chỉ còn 900.000đ nên vẫn bị tính ship 30.000đ. Đây là điểm tương tác quan trọng nhất của bảng: một lập trình viên viết nhầm "miễn ship khi tạm tính trước giảm giá từ 1.000.000" sẽ làm R2 ra ship 0. Test case mẫu TC-C-005 (miễn ship ở 1.000.000 mà không có mã) **không** phát hiện được lỗi này; chỉ R2 phát hiện. Đó là khoảng trống trong bộ test case mẫu mà bảng quyết định giúp lấp.

Chọn dữ liệu cho R5: dùng 2 chuột để tạm tính đúng 500.000 mà không dùng mã, nhằm cho thấy B không ảnh hưởng khi thiếu mã.

Kết quả mong đợi: một bảng số hoàn chỉnh; nếu một hàng không khớp với giao diện, kiểm tra lại phép tính trước khi kết luận bug.

### Bước 6. Viết test case từ luật
Mục đích: mỗi luật là một test case có đủ cột chuẩn.

| ID | Tiền điều kiện | Bước | Dữ liệu | Kết quả mong đợi |
|----|----------------|------|---------|------------------|
| TC-DT-R1 | Giỏ trống | Thêm 1 màn hình; nhập SALE10; bấm Áp dụng | Tạm tính 3.200.000 | Giảm 100.000, ship 0, VAT 248.000, tổng 3.348.000 |
| TC-DT-R2 | Giỏ trống | Thêm 1 chuột rồi bấm + 3 lần; áp SALE10 | Tạm tính 1.000.000 | Giảm 100.000, ship 30.000, VAT 72.000, tổng 1.002.000 |
| TC-DT-R3 | Giỏ trống | Thêm 1 chuột; áp SALE10 | Tạm tính 250.000 | Báo "Đơn tối thiểu 500.000đ để dùng mã"; giảm 0, ship 30.000, tổng 300.000 |
| TC-DT-R4 | Giỏ trống | Thêm 1 màn hình (không mã) | Tạm tính 3.200.000 | Giảm 0, ship 0, VAT 256.000, tổng 3.456.000 |
| TC-DT-R5 | Giỏ trống | Thêm 1 chuột rồi bấm + 1 lần (không mã) | Tạm tính 500.000 | Giảm 0, ship 30.000, VAT 40.000, tổng 570.000 |

### Bước 7. Một ví dụ nhỏ khác: duyệt hoặc từ chối đơn nghỉ phép (LAB-07)
Mục đích: luyện cách gộp luật với bảng nhỏ hơn.

Điều kiện cho thao tác **Từ chối đơn**: A là người dùng có vai trò Quản lý; B là đơn đang Chờ duyệt; C là đã nhập lý do từ chối. Ba điều kiện cho 8 cột. Quan sát nghiệp vụ (BR-04, BR-05): nếu không phải Quản lý thì không có nút; nếu đơn không còn chờ duyệt thì không có nút; chỉ khi có nút mới đến lượt lý do. Gộp:

| Luật | A Quản lý | B Chờ duyệt | C Có lý do | Kết quả |
|------|-----------|-------------|------------|---------|
| R1 | T | T | T | Đơn thành "Từ chối", lý do hiển thị |
| R2 | T | T | F | Báo "Vui lòng nhập lý do từ chối", đơn vẫn Chờ duyệt |
| R3 | T | F | - | Không có nút Từ chối |
| R4 | F | - | - | Không có nút Từ chối |

Kiểm đếm: R1 gồm 1 cột, R2 gồm 1 cột, R3 gồm 2 cột (C tuỳ ý), R4 gồm 4 cột (B, C tuỳ ý), tổng 1 cộng 1 cộng 2 cộng 4 bằng 8 cột ban đầu. Luôn kiểm đếm sau khi gộp: nếu tổng khác 2^n tức bạn gộp sai.

Khi nào dừng bảng đầy đủ? Với n điều kiện, 2^n tăng nhanh (n bằng 4 là 16, n bằng 6 là 64). Nếu có quá nhiều điều kiện, hãy tách thành nhiều bảng nhỏ (mỗi hành động một bảng) hoặc dùng pairwise ở bài 3.6.

## Demo code
Mỗi luật là một dòng dữ liệu; hàm đọc số chuẩn hoá chuỗi tiền (bỏ ký tự không phải số) và dùng giá trị tuyệt đối cho giảm giá vì giao diện hiển thị khoản giảm dạng số âm (kể cả "-0đ").

```ts
import { test, expect, type Page } from "@playwright/test";

// Đọc số nguyên từ ô hiển thị, ví dụ "-100.000đ" thành -100000.
const num = async (page: Page, id: string) =>
  Number((await page.getByTestId(id).innerText()).replace(/[^\d-]/g, ""));

// Thêm sản phẩm: bấm "Thêm vào giỏ" rồi bấm "Tăng ..." cho đủ số lượng.
async function addProduct(page: Page, id: string, times = 1) {
  const card = page.getByTestId(`product-${id}`);
  await card.getByRole("button", { name: "Thêm vào giỏ" }).click();
  for (let i = 1; i < times; i++) await card.getByRole("button", { name: /^Tăng/ }).click();
}

// 5 luật của bảng quyết định đã rút gọn.
const rules = [
  { id: "R1", product: "p3", qty: 1, coupon: true,  discount: 100_000, shipping: 0,      total: 3_348_000 },
  { id: "R2", product: "p2", qty: 4, coupon: true,  discount: 100_000, shipping: 30_000, total: 1_002_000 },
  { id: "R3", product: "p2", qty: 1, coupon: true,  discount: 0,       shipping: 30_000, total: 300_000 },
  { id: "R4", product: "p3", qty: 1, coupon: false, discount: 0,       shipping: 0,      total: 3_456_000 },
  { id: "R5", product: "p2", qty: 2, coupon: false, discount: 0,       shipping: 30_000, total: 570_000 },
];

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/cart");
  await page.getByTestId("reset-data").click();
});

for (const r of rules) {
  test(`[DT-${r.id}][BR-02,BR-03,BR-04] ${r.qty} x ${r.product}, ${r.coupon ? "có" : "không"} mã`, async ({ page }) => {
    await addProduct(page, r.product, r.qty);
    if (r.coupon) {
      await page.getByLabel("Mã giảm giá").fill("SALE10");
      await page.getByRole("button", { name: "Áp dụng" }).click();
    }
    expect(Math.abs(await num(page, "discount"))).toBe(r.discount);
    expect(await num(page, "shipping")).toBe(r.shipping);
    expect(await num(page, "total")).toBe(r.total);
  });
}

// R3 còn phải kiểm thông báo từ chối.
test("[DT-R3][BR-02] báo đơn tối thiểu khi dưới ngưỡng", async ({ page }) => {
  await addProduct(page, "p2");
  await page.getByLabel("Mã giảm giá").fill("SALE10");
  await page.getByRole("button", { name: "Áp dụng" }).click();
  await expect(page.getByTestId("cart-message")).toContainText("tối thiểu");
});
```

Giải thích: `product-p3` là màn hình 24 inch, `product-p2` là chuột. `Math.abs` vì ô "Giảm giá" hiển thị số âm; ở luật R3 và R4 giao diện hiển thị `-0đ` và `Number("-0")` là `-0`, mà `toBe(0)` phân biệt `-0` với `0`, nên dùng `Math.abs` tránh sai lệch. Hai dòng `expect` còn lại so ship và tổng; nếu muốn chi tiết hơn bạn thêm VAT.

## Thử ngay trong lab
1. Chạy spec trên lab sạch: cả 5 test xanh.
2. Mở `/lab/cart?bugs=BUG-02` (đổi `page.goto` thành `/lab/cart?bugs=BUG-02`): R1 đỏ vì giảm giá thành 320.000 thay vì 100.000 (bỏ trần). R2 vẫn xanh vì 10% của 1.000.000 đúng bằng 100.000, cho thấy mỗi luật bắt một loại lỗi khác nhau.
3. Thử bằng tay trường hợp "áp mã rồi bớt hàng": thêm 2 chuột, áp SALE10 (giảm 50.000), rồi bấm nút giảm một chuột. Quan sát khoản giảm về 0. Bảng quyết định không nói đến thứ tự thao tác này; hãy ghi thành câu hỏi cho yêu cầu (bài 3.1).
4. Thử tính tay VAT cho các tạm tính khác: với 3 sản phẩm còn hàng của lab, mọi tổ hợp số lượng hợp lệ đều cho VAT là số nguyên (đã kiểm toàn bộ 726 tổ hợp số lượng, mỗi tổ hợp có và không mã). Vì vậy BR-04 (làm tròn VAT) **không thể** kiểm bằng dữ liệu hiện tại qua giao diện; xem lại bài 3.3 về giới hạn dữ liệu.

## Lỗi thường gặp
- **Triệu chứng**: bảng có 6 luật nhưng test chỉ bao 4. **Nguyên nhân**: bỏ qua cột có hành động giống cột trước mà không gộp đúng. **Cách sửa**: sau khi gộp, kiểm đếm lại tổng số cột bằng 2^n.
- **Triệu chứng**: test R2 đỏ với `Expected: 30000 Received: 0` ở ship. **Nguyên nhân**: kết quả mong đợi tính ship theo tạm tính trước giảm (1.000.000) thay vì sau giảm (900.000). **Cách sửa**: đọc lại BR-03: "miễn ship khi tạm tính **sau giảm giá**".
- **Triệu chứng**: test báo `Expected: 0 Received: -0` ở khoản giảm giá. **Nguyên nhân**: giao diện hiển thị `-0đ` và `Number("-0")` là âm không. **Cách sửa**: so sánh `Math.abs(...)` hoặc so sánh chuỗi hiển thị.
- **Triệu chứng**: tính tổng tiền theo VAT trên cả phí ship làm chênh lệch 2.400 đồng ở R2. **Nguyên nhân**: hiểu sai VAT (BR-04: VAT chỉ trên phần sau giảm giá). **Cách sửa**: ghi công thức vào bảng trước khi tính.
- **Triệu chứng**: không tạo được giỏ hàng đúng tạm tính mong muốn. **Nguyên nhân**: chọn dữ liệu bất khả đạt (ví dụ 999.999). **Cách sửa**: chọn tổ hợp sản phẩm theo bảng khả đạt ở bài 3.3.

## Tóm tắt
- Bảng quyết định dùng cho BR có nhiều điều kiện kết hợp; n điều kiện đúng/sai cho tối đa 2^n luật.
- Quy trình: chọn điều kiện và hành động, lập đủ 2^n cột, loại cột bất khả thi, gộp cột cùng hành động bằng dấu gạch, kiểm đếm.
- Ở LAB-03: 3 điều kiện cho 8 cột, bỏ 2 cột bất khả thi, gộp 2 cột, còn 5 luật.
- Giá trị mong đợi phải tính tay bằng công thức BR trước khi so với giao diện.
- Tương tác giữa các điều kiện (miễn ship tính sau giảm giá) là nơi bảng quyết định tìm ra lỗi mà EP và BVA bỏ sót.
- Mỗi luật thành một test case và một dòng dữ liệu trong spec data-driven.

## Bài tập
1. Lập bảng quyết định cho hai điều kiện "có mã SALE10" và "tạm tính từ 500.000đ" với hành động "khoản giảm giá". Xong khi: bạn có đủ 4 cột, nhận ra không cột nào bất khả thi và còn 3 luật sau khi gộp.
2. Mở rộng bảng của bài bằng điều kiện "sản phẩm trong giỏ có hết hàng" (BR-05). Xong khi: bạn viết đủ 16 cột, xác định cột bất khả thi (giỏ không thể chứa sản phẩm hết hàng vì nút bị vô hiệu), và nêu số luật sau khi gộp (đối chiếu với `/labs/cart` mục BR-05).
3. Chạy spec ở phần Demo trên lab sạch, rồi đổi `page.goto` thành `?bugs=BUG-02`. Xong khi: bạn chỉ ra đúng luật nào đỏ và giải thích vì sao các luật khác vẫn xanh.
4. Lập bảng quyết định cho BR-07 của LAB-07 (đơn trùng ngày): điều kiện gồm "đơn cũ đang Chờ duyệt", "đơn cũ Đã duyệt", "đơn cũ Đã huỷ hoặc Từ chối" kết hợp với "khoảng ngày giao nhau". Xong khi: bạn dự đoán đúng đơn nào chặn, kiểm chứng trên `/lab/leave` và viết một test.
