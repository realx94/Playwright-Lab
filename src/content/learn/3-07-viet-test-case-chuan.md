---
title: Viết test case chuẩn
level: 3
order: 7
minutes: 45
summary: Cấu trúc một test case tốt, đặt tên, ưu tiên, truy vết với business rule.
keywords: [test case template, traceability matrix, test case priority]
---

## Mục tiêu bài học
- Viết một test case đủ các cột: ID, tiêu đề, tiền điều kiện, bước, dữ liệu, kết quả mong đợi, ưu tiên, BR liên quan.
- Phân biệt test case tốt và test case mơ hồ; sửa được một test case yếu thành test case kiểm chứng được.
- Gán ưu tiên P0, P1, P2 theo tiêu chí rõ ràng, không theo cảm tính.
- Lập **ma trận truy vết** BR và test case, chỉ ra BR chưa được phủ hoặc chỉ có một test.

## Bạn cần chuẩn bị
- Đã học bài 3.1 đến 3.6. Mở `/labs/cart` và `/labs/leave` để xem bộ test case mẫu thật (11 và 14 test case).
- Node.js 22.18 trở lên nếu muốn chạy script ở phần Demo (`node cov.ts`); nếu dùng bản cũ hơn, chạy `npx tsx cov.ts`.

## Kiến thức cần nắm
- Các trường của test case và **ý nghĩa từng trường**.
- **Tiền điều kiện** (precondition) so với **bước**: cái nào là trạng thái cần có sẵn, cái nào là hành động cần làm.
- **Kết quả mong đợi** phải quan sát được và cụ thể (một chữ, một con số).
- **Ưu tiên**: P0 (chặn luồng chính, sai tiền, an ninh), P1 (quy tắc quan trọng), P2 (hiếm gặp, hiển thị).
- **Truy vết** (traceability): mỗi test case trỏ về BR; mỗi BR có ít nhất một test case.
- Loại test case: Happy, Negative, BVA, EP, State, Decision, Security (cột "Loại" của site).

## Giải thích dễ hiểu
Test case giống **công thức nấu ăn** mà người khác (hoặc bạn của sáu tháng sau) có thể làm theo và ra đúng món. Một công thức viết "nêm nếm vừa ăn, nấu đến khi chín" thì mỗi người nấu một kiểu. Một test case viết "kiểm tra giỏ hàng tính tiền đúng" cũng vậy: người này thêm 1 sản phẩm, người kia thêm 5, người thứ ba không dùng mã giảm giá, và không ai biết thế nào là "đúng".

Vì sao phải chuẩn hoá? Ba lý do. Thứ nhất, **tái lập được**: lỗi xuất hiện ở lần chạy thứ hai nghĩa là bạn cần chạy lại y hệt. Thứ hai, **chuyển được thành code**: mỗi cột của bảng chính là một phần của spec (tiền điều kiện thành `beforeEach`, bước thành thao tác, kết quả thành `expect`; xem bài 3.10). Thứ ba, **truy vết được**: khi BR đổi, bạn tìm ra ngay những test cần sửa nhờ cột BR.

## Thực hành từng bước
Ví dụ xuyên suốt: LAB-03 giỏ hàng (BR-03 về phí ship và BR-04 về VAT) và bộ test case mẫu ở `/labs/cart`.

### Bước 1. Xác định BR và loại test cần viết
Mục đích: mỗi test case phục vụ một ý đồ rõ ràng.

BR-03 (miễn ship khi tạm tính sau giảm giá từ 1.000.000đ, còn lại 30.000đ) và BR-04 (VAT 8% sau giảm giá, làm tròn đến đồng). Ý đồ test: (a) đơn nhỏ trả ship và VAT (kiểu Decision), (b) đúng ngưỡng 1.000.000 (kiểu BVA).

### Bước 2. Đặt tiêu đề và ID
Mục đích: nhìn danh sách là hiểu.

Quy ước ID của site: `TC-<mã lab>-<số 3 chữ số>`, ví dụ `TC-C-004` (C là cart), `TC-L-006` (L là login), `TC-H-009` (H là HR nghỉ phép), `TC-U-007` (U là bảng người dùng). Ký tự đầu là mã lab, số tăng dần, không dùng lại số cũ khi xoá test case.

Công thức tiêu đề: **hành động hoặc tình huống cộng điều kiện đặc biệt**. So sánh:

| Tiêu đề yếu | Tiêu đề tốt |
|-------------|-------------|
| Kiểm tra ship | Ship đơn dưới 1 triệu |
| Test mã giảm giá | SALE10 ở biên 500.000 |
| Kiểm tra huỷ đơn | Không huỷ được đơn đang giao |

### Bước 3. Viết tiền điều kiện
Mục đích: trạng thái cần có **trước** khi làm bước đầu tiên.

Tiền điều kiện trả lời "tôi đứng ở đâu, dữ liệu gì đã có". Ví dụ cho TC-C-004: "Giỏ 250.000đ" (đã có sẵn trong giỏ, không phải bước). Đừng nhét thao tác vào tiền điều kiện cho đến khi nó quá dài; nếu cần 10 bước để dựng tiền điều kiện thì dùng kỹ thuật dựng nhanh (API hoặc dữ liệu seed) và ghi rõ.

Mẹo kiểm tra: nếu tester phải **làm** gì đó thì là bước; nếu chỉ cần **có** thì là tiền điều kiện.

### Bước 4. Viết các bước
Mục đích: mô tả hành động tối thiểu để đạt kết quả.

Mỗi bước là một hành động, bắt đầu bằng động từ, không chứa kết quả. Giữ 2 đến 6 bước. Ví dụ: "1. Bấm Thêm vào giỏ ở Chuột không dây. 2. Quan sát phần tổng kết." Tránh các câu như "kiểm tra mọi thứ hoạt động".

### Bước 5. Ghi dữ liệu cụ thể
Mục đích: người khác chạy ra đúng kết quả.

Dữ liệu là giá trị thật: sản phẩm `p2` (Chuột không dây, 250.000đ), mã `SALE10`, email `user@lab.dev`. Dữ liệu phải **khả đạt** trên ứng dụng (bài 3.3). Không ghi "một số hợp lệ", hãy ghi số.

### Bước 6. Viết kết quả mong đợi quan sát được
Mục đích: biết đúng hay sai ngay khi nhìn.

So sánh hai cách viết cho cùng một test:

| Yếu | Tốt |
|-----|-----|
| "Hệ thống tính ship và VAT đúng" | "Ship 30.000, VAT 20.000, tổng 300.000" |
| "Báo lỗi" | "Báo \"Mật khẩu tối thiểu 8 ký tự\" dưới ô Mật khẩu" |

Con số kết quả phải đến từ BR (phép tính tay), không chép từ ứng dụng. Với TC-C-004: tạm tính 250.000, không giảm giá, sau giảm 250.000; VAT 8% là 20.000; ship 30.000 (dưới 1.000.000); tổng 250.000 cộng 20.000 cộng 30.000 bằng 300.000.

### Bước 7. Gán ưu tiên theo tiêu chí
Mục đích: biết chạy gì trước khi hết thời gian.

| Ưu tiên | Tiêu chí | Ví dụ trong LAB-03 |
|---------|----------|--------------------|
| P0 | Sai ra tiền, sai an ninh, hoặc chặn luồng chính | Giảm giá bị chặn trần (TC-C-008), không huỷ được đơn đang giao (TC-C-011) |
| P1 | Quy tắc nghiệp vụ quan trọng nhưng có đường vòng hoặc hiếm | Vượt số lượng tối đa (TC-C-003) |
| P2 | Hiển thị, ca hiếm, ít hậu quả | Ghi nhớ đăng nhập hiển thị 7 ngày (TC-L-009) |

Dấu hiệu "lạm phát P0": ở bộ test case mẫu LAB-03 có 11 test case thì 8 cái là P0 (khoảng 73 phần trăm). Khi hầu hết là P0 thì ưu tiên mất ý nghĩa. Hãy tự rà lại bằng bảng tiêu chí trên (bài tập 3).

### Bước 8. Gắn BR và truy vết
Mục đích: mỗi test case trỏ về ít nhất một BR; mỗi BR có ít nhất một test case.

Ghi cột BR cho từng test case. TC-C-004 trỏ BR-03 và BR-04 (vì kiểm cả ship lẫn VAT). Ngược lại mỗi BR phải xuất hiện ở ít nhất một test case.

### Bước 9. Soát lại bằng checklist và sửa test case yếu
Mục đích: lọc những test case mơ hồ.

Checklist: (1) tiêu đề đọc là hiểu; (2) tiền điều kiện chỉ là trạng thái; (3) bước chỉ là hành động; (4) dữ liệu là giá trị thật và khả đạt; (5) kết quả quan sát được, có số; (6) gắn BR và ưu tiên; (7) độc lập với test case khác.

Áp dụng cho TC-C-009 (VAT làm tròn). Bảng dưới là **bản viết yếu** từng có trong bộ mẫu, lúc lab chưa có sản phẩm nào cho VAT lẻ; bộ mẫu hiện đã được viết lại theo cách ở cuối bước này:

| Trường | Bản yếu | Vấn đề |
|--------|----------|--------|
| Tiêu đề | VAT làm tròn | Được |
| Tiền điều kiện | Tổng sau giảm có VAT lẻ | Không nói cách tạo; lúc đó lab chưa có sản phẩm nào cho VAT lẻ |
| Bước | So sánh VAT hiển thị với tính tay | Không có hành động cụ thể |
| Dữ liệu | — | Thiếu |
| Kết quả | Làm tròn gần nhất, không cắt xuống | Không có con số |

Cách viết lại: chọn dữ liệu cho VAT lẻ. Lab hiện có sản phẩm p5 "Cáp sạc USB-C" giá 99.999đ (tồn 10) đúng cho mục đích này: 1 cáp có tạm tính 99.999, VAT là 99.999 nhân 0,08 bằng 7.999,92. Làm tròn gần nhất là 8.000, cắt xuống là 7.999. Ship là 30.000 (dưới 1.000.000) và tổng là 99.999 cộng 8.000 cộng 30.000 bằng 137.999. Test case sửa: tiền điều kiện "Giỏ trống, không áp mã"; bước "Thêm Cáp sạc USB-C × 1 rồi so sánh dòng VAT với tính tay"; dữ liệu "99.999đ"; kết quả mong đợi "VAT 8.000đ (làm tròn gần nhất của 7.999,92), không phải 7.999; ship 30.000; tổng 137.999". Dữ liệu này khả đạt từ giao diện, nên test case chạy tay và automate được; nếu bật `?bugs=BUG-01` (VAT làm tròn xuống), dòng VAT hiện 7.999 và test đỏ. Bài học: khi một test case "không thể làm" vì thiếu dữ liệu, ghi nhận vào báo cáo và đề nghị thêm dữ liệu seed (lab đã làm đúng như vậy với cáp sạc, xem bài 3.3).

### Bước 10. Lập ma trận truy vết và tìm lỗ hổng
Mục đích: chứng minh độ phủ BR.

Ma trận BR và test case của LAB-03 từ bộ mẫu (cột: BR, các test case, số test case):

| BR | Test case | Số |
|----|-----------|----|
| BR-01 tối đa 10 và tồn kho | TC-C-003 | 1 |
| BR-02 SALE10 | TC-C-006, TC-C-007, TC-C-008 | 3 |
| BR-03 miễn ship | TC-C-004, TC-C-005 | 2 |
| BR-04 VAT | TC-C-004, TC-C-009 | 2 |
| BR-05 hết hàng | TC-C-001, TC-C-002 | 2 |
| BR-06 trạng thái đơn | TC-C-010, TC-C-011 | 2 |

Cộng: 12 liên kết từ 11 test case (TC-C-004 trỏ 2 BR). Mọi BR có ít nhất một test, nhưng BR-01 chỉ có một: TC-C-003 kiểm giới hạn 10; **không** có test cho "không vượt tồn kho" (màn hình 24 inch chỉ còn 5, bài 3.3 đã nêu). Đó là một lỗ hổng. Với BR-04, TC-C-004 chỉ kiểm VAT chẵn (20.000) còn TC-C-009 (cáp sạc, VAT lẻ) mới kiểm làm tròn; hai test case bổ sung nhau nên BR-04 phủ khá tốt.

Với LAB-07 (14 test case), ma trận cho: BR-01 (2 test: TC-H-001, TC-H-004), BR-02 (2), BR-03 (4), BR-04 (2), BR-05 (2), BR-06 (4, vì TC-H-014 cũng trỏ BR-06), BR-07 (1), BR-08 (1: TC-H-014). Tổng liên kết là 18. Lỗ hổng: BR-08 chỉ có một test (chưa kiểm đơn nghỉ ốm vẫn duyệt được khi phép năm đã hết); BR-01 có biên trên 200 ký tự nhưng test chỉ có biên dưới (lý do 9 ký tự); BR-07 chỉ có một test trùng ngày (TC-H-008, đơn 11/03 trùng đơn 09 đến 11/03) mà chưa kiểm đơn đã huỷ không chặn.

## Demo code
Hai phần: (1) mẫu cấu trúc test case dạng dữ liệu, trùng với kiểu `TestCase` mà site dùng cho workshop; (2) script tính độ phủ BR từ dữ liệu đó. Lưu thành `cov.ts` rồi chạy `node cov.ts`.

```ts
// Cấu trúc test case dạng dữ liệu (rút gọn từ src/lib/labs/testcases.ts của site).
interface TestCase {
  id: string;
  title: string;
  priority: "P0" | "P1" | "P2";
  br: string[];
}

const rules = ["BR-01", "BR-02", "BR-03", "BR-04", "BR-05", "BR-06"];

const cases: TestCase[] = [
  { id: "TC-C-001", title: "Thêm sản phẩm còn hàng", priority: "P0", br: ["BR-05"] },
  { id: "TC-C-002", title: "Sản phẩm hết hàng", priority: "P0", br: ["BR-05"] },
  { id: "TC-C-003", title: "Vượt số lượng tối đa", priority: "P1", br: ["BR-01"] },
  { id: "TC-C-004", title: "Ship đơn dưới 1 triệu", priority: "P0", br: ["BR-03", "BR-04"] },
  { id: "TC-C-005", title: "Miễn ship đúng ngưỡng 1.000.000", priority: "P0", br: ["BR-03"] },
  { id: "TC-C-006", title: "SALE10 ở biên 500.000", priority: "P0", br: ["BR-02"] },
  { id: "TC-C-007", title: "SALE10 dưới ngưỡng", priority: "P1", br: ["BR-02"] },
  { id: "TC-C-008", title: "Giảm giá bị chặn trần", priority: "P0", br: ["BR-02"] },
  { id: "TC-C-009", title: "VAT làm tròn", priority: "P1", br: ["BR-04"] },
  { id: "TC-C-010", title: "Vòng đời đơn hợp lệ", priority: "P0", br: ["BR-06"] },
  { id: "TC-C-011", title: "Không huỷ được đơn đang giao", priority: "P0", br: ["BR-06"] },
];

// Với mỗi BR: có bao nhiêu test, bao nhiêu P0, và cảnh báo nếu thiếu.
for (const br of rules) {
  const hit = cases.filter((c) => c.br.includes(br));
  const p0 = hit.filter((c) => c.priority === "P0").length;
  const flag = hit.length === 0 ? "  <-- CHƯA CÓ TEST" : hit.length === 1 ? "  <-- chỉ 1 test" : "";
  console.log(`${br}: ${hit.length} test (P0: ${p0}) [${hit.map((c) => c.id).join(", ")}]${flag}`);
}
```

Kết quả mong đợi khi chạy:

```text
BR-01: 1 test (P0: 0) [TC-C-003]  <-- chỉ 1 test
BR-02: 3 test (P0: 2) [TC-C-006, TC-C-007, TC-C-008]
BR-03: 2 test (P0: 2) [TC-C-004, TC-C-005]
BR-04: 2 test (P0: 1) [TC-C-004, TC-C-009]
BR-05: 2 test (P0: 2) [TC-C-001, TC-C-002]
BR-06: 2 test (P0: 2) [TC-C-010, TC-C-011]
```

Giải thích: `filter` lấy các test case có chứa BR đang xét, đếm P0 để thấy BR nào chỉ có test ưu tiên thấp. Dòng cảnh báo cho BR có 0 hoặc 1 test. Khi đội thêm test case, chỉ cần thêm một phần tử vào `cases` là ma trận cập nhật. Cùng một mẫu này sẽ được nối sang tên test trong spec ở bài 3.10.

Mẫu test case đầy đủ cho một dòng (bạn dùng khi viết bảng):

| ID | Tiêu đề | Tiền điều kiện | Bước | Dữ liệu | Kết quả mong đợi | Loại | Ưu tiên | BR |
|----|---------|----------------|------|---------|------------------|------|---------|----|
| TC-C-004 | Ship đơn dưới 1 triệu | Giỏ 250.000đ (1 chuột) | Xem phần tổng kết | p2 x 1 | Ship 30.000, VAT 20.000, tổng 300.000 | Decision | P0 | BR-03, BR-04 |

## Thử ngay trong lab
Mở `/labs/cart` và `/labs/leave`, đọc kỹ các bảng test case mẫu. Chọn ba test case, áp checklist ở Bước 9 và ghi lại chỗ chưa chuẩn. Sau đó mở `/lab/cart` và `/lab/leave`, chạy tay đúng theo bước của một test case: nếu bạn không thể chạy tay mà không phải đoán, test case đó chưa đủ rõ.

## Lỗi thường gặp
- **Triệu chứng**: hai người chạy cùng test case ra hai kết quả khác nhau. **Nguyên nhân**: dữ liệu mơ hồ ("một số hợp lệ") hoặc kết quả mơ hồ ("hoạt động đúng"). **Cách sửa**: ghi dữ liệu thật và kết quả có chữ hoặc số quan sát được.
- **Triệu chứng**: test case khi chuyển thành code phải thêm quá nhiều giả định. **Nguyên nhân**: tiền điều kiện lẫn với bước, hoặc thiếu dữ liệu. **Cách sửa**: tách rõ trạng thái cần có và hành động.
- **Triệu chứng**: BR đổi mà không ai biết test nào cần sửa. **Nguyên nhân**: thiếu cột BR. **Cách sửa**: mỗi test case có BR, và có ma trận truy vết như Bước 10.
- **Triệu chứng**: một test case có hơn 10 bước và 6 kết quả mong đợi, fail mà không biết do đâu. **Nguyên nhân**: gộp nhiều ý đồ vào một test case. **Cách sửa**: một test case một ý đồ; chia nhỏ theo BR hoặc theo lớp tương đương.
- **Triệu chứng**: test case phụ thuộc test case khác ("đã chạy TC-C-010 trước"). **Nguyên nhân**: dựng tiền điều kiện bằng cách dựa vào kết quả của test khác. **Cách sửa**: mỗi test case tự dựng tiền điều kiện của nó, và dùng reset dữ liệu.

## Tóm tắt
- Test case chuẩn có đủ ID, tiêu đề, tiền điều kiện, bước, dữ liệu, kết quả mong đợi, loại, ưu tiên và BR.
- Tiền điều kiện là trạng thái cần **có**; bước là hành động cần **làm**; kết quả phải quan sát được và có con số.
- Ưu tiên theo tiêu chí (sai tiền hoặc an ninh hoặc chặn luồng chính là P0), tránh dồn gần hết vào P0.
- Mỗi test case trỏ về ít nhất một BR; mỗi BR cần ít nhất một test case, và thường nhiều hơn một.
- Ma trận truy vết tìm ra lỗ hổng (BR-01 của LAB-03 chỉ có một test, thiếu ca tồn kho).
- Test case viết tốt là test case chuyển thẳng được sang spec Playwright.

## Bài tập
1. Viết lại một test case yếu: "Kiểm tra đăng nhập thành công" cho `/lab/login` thành test case đủ các cột (ID, tiền điều kiện, bước, dữ liệu, kết quả mong đợi, ưu tiên, BR). Xong khi: người khác chạy tay theo bảng mà không phải hỏi lại.
2. Viết 4 test case mới (ID, tiền điều kiện, bước, dữ liệu, kết quả mong đợi) cho BR-01 của LAB-03 còn thiếu: không vượt tồn kho của màn hình 24 inch (tồn 5). Xong khi: ít nhất một test case dùng biên 5/6, và bạn gắn BR-01 cho từng cái.
3. Rà lại ưu tiên của 11 test case LAB-03 theo bảng tiêu chí ở Bước 7 và chỉ ra những test case bạn hạ xuống P1 hoặc P2 cùng lý do. Xong khi: tỉ lệ P0 giảm xuống dưới 50 phần trăm và mỗi thay đổi có lý do bằng một câu.
4. Chạy script `cov.ts` với bộ 14 test case LAB-07 (lấy từ `/labs/leave`) và báo cáo BR nào còn mỏng. Xong khi: bạn ra ma trận 8 BR với tổng 18 liên kết và đề xuất ít nhất 2 test case bổ sung.
