---
title: "Thiết kế test cho form nhiều bước: báo giá bảo hiểm"
level: 3
order: 11
minutes: 60
summary: Kết hợp EP, BVA, bảng quyết định, pairwise và chuyển trạng thái để test một form 4 bước có trường điều kiện và công thức tính phí, rồi viết spec data-driven.
keywords: [multi-step form, form nhiều bước, tính phí bảo hiểm, pairwise, boundary value, decision table, state transition, page.clock]
---

## Mục tiêu bài học
- Phân tích Business Rule của một form nhiều bước thành danh sách điều kiện, rồi gán mỗi điều kiện cho đúng kỹ thuật thiết kế (EP, BVA, bảng quyết định, pairwise, chuyển trạng thái).
- Viết test case cho từng bước của form, gồm cả biên tuổi và biên năm sản xuất phụ thuộc "ngày hôm nay".
- Dựng bảng quyết định cho công thức phí và tính tay được từng con số mong đợi.
- Sinh bộ pairwise 15 dòng cho 6 tham số (có ràng buộc xe máy không có gói Toàn diện), kiểm chứng phủ đủ 118 cặp bằng script.
- Viết spec data-driven, cố định ngày bằng `page.clock`, kèm một "oracle" tính phí độc lập để không chép lại kết quả của ứng dụng.

## Bạn cần chuẩn bị
- Đã học bài 3.2 đến 3.6 (EP, BVA, Decision Table, State Transition, Pairwise). Bài này **không** giảng lại các kỹ thuật đó mà chỉ cho thấy cách phối hợp; cần chi tiết hãy xem lại từng bài.
- Đọc phần Business Rule ở trang `/labs/insurance` (BR-01 đến BR-08) và mở ứng dụng `/lab/insurance` ở tab bên cạnh.
- Playwright đã chạy được (bài 0.3), biết `getByLabel`, `selectOption`, `expect` (bài 2.5 đến 2.8) và vòng lặp tạo test từ mảng dữ liệu (bài 4.5 nếu muốn xem thêm).

## Kiến thức cần nắm
- **Form nhiều bước** (multi-step form, wizard): mỗi bước kiểm tra riêng, qua được mới sang bước sau, có nút Quay lại.
- **Trường điều kiện** (conditional field): ô chỉ xuất hiện hoặc lựa chọn chỉ có hiệu lực khi một ô khác mang giá trị nhất định.
- **Công thức tính phí** gồm nhiều lớp: phí gốc, phụ phí, giảm giá, cộng quyền lợi, làm tròn. Thứ tự áp dụng quyết định kết quả.
- **Oracle**: nguồn cho kết quả mong đợi, độc lập với ứng dụng đang test.
- **Ràng buộc** (constraint) trong pairwise: tổ hợp không hợp lệ phải bị loại khỏi bảng.
- `page.clock.setFixedTime`: cố định thời gian của trình duyệt để các test phụ thuộc "hôm nay" cho kết quả ổn định.

## Giải thích dễ hiểu
Hãy hình dung bạn làm thẻ thành viên ở một phòng khám. Quầy 1 hỏi tên và ngày sinh, quầy 2 hỏi bệnh sử, quầy 3 chọn gói khám, quầy 4 ký giấy xác nhận. Nếu bạn nói sai ở quầy 1, nhân viên không cho sang quầy 2. Quay lại quầy 1 sửa thì giấy tờ quầy 2 vẫn phải còn nguyên. Giá gói khám là một phép tính: giá gốc, trẻ em cộng phụ phí, khách cũ được giảm, thêm dịch vụ thì cộng tiền. Tester phải kiểm tra **hai thứ khác nhau**: (1) từng quầy hỏi và chặn đúng, (2) phép tính ra đúng tiền.

Vì sao không dùng một kỹ thuật cho tất cả? Mỗi loại điều kiện hợp với một kỹ thuật:

| Thành phần của form | Kỹ thuật hợp nhất | Lý do |
|---------------------|-------------------|-------|
| Tuổi 18 đến 70, năm sản xuất, giá trị xe, tải trọng | BVA | Lỗi hay nằm ở dấu `<` và `<=` |
| Điện thoại, email, biển số | EP | Nhiều lớp dữ liệu hợp lệ và không hợp lệ, cùng cách xử lý |
| Loại xe quyết định có ô Tải trọng, có gói Toàn diện | Bảng quyết định | Nhiều điều kiện cùng quyết định một kết quả |
| Phí = giá trị x tỉ lệ x hệ số, phụ phí, giảm giá | Bảng quyết định cộng với tính tay | Mỗi lớp công thức là một điều kiện |
| Gói x quyền lợi x năm không bồi thường x kỳ thanh toán | Pairwise | Tích số lớn, lỗi thường do tương tác hai tham số |
| Tiếp tục, Quay lại, lỗi thì ở lại, Báo giá mới | Chuyển trạng thái | Hành vi phụ thuộc "đang ở bước nào" |

Quy tắc kinh nghiệm: **chia bài toán trước, chọn kỹ thuật sau**. Một form nhiều bước nên được xử lý bằng nhiều lớp test nhỏ, không phải một test dài đi hết 4 bước rồi kiểm tra tất cả.

## Thực hành từng bước
Ví dụ xuyên suốt là LAB-32. "Hôm nay" của ứng dụng đọc qua một hàm riêng nên test cố định là **15/06/2026** bằng `page.clock`. Mọi phép tính tuổi, năm hợp lệ bên dưới đều theo ngày này.

### Bước 1. Liệt kê điều kiện từ Business Rule
Mục đích: biến câu chữ của BR thành danh sách các điều kiện đo được. Đọc từng BR và tự hỏi: có con số nào không, có ngoại lệ nào không, kết quả phụ thuộc điều gì.

| BR | Điều kiện rút ra | Kỹ thuật |
|----|------------------|----------|
| BR-01 | Họ tên 2 đến 60 ký tự | BVA (1, 2, 60, 61 ký tự) |
| BR-01 | Tuổi tròn 18 đến 70, tính đến hôm nay | BVA theo ngày |
| BR-01 | Điện thoại 10 số, đầu 03/05/07/08/09 | EP |
| BR-01 | Email đúng định dạng | EP |
| BR-02 | Năm sản xuất từ (năm nay - 15) đến năm nay | BVA theo năm |
| BR-02 | Giá trị xe 50 triệu đến 5 tỷ | BVA |
| BR-02 | Biển số dạng `30A-123.45` | EP |
| BR-03 | Ô tô tải nhẹ: hiện ô Tải trọng 0,5 đến 3,5 tấn | Bảng quyết định, BVA |
| BR-03 | Xe máy không có gói Toàn diện; đổi sang xe máy thì chọn lại gói | Bảng quyết định, chuyển trạng thái |
| BR-04 | Lỗi dưới từng ô, chặn sang bước sau; Quay lại giữ dữ liệu | Chuyển trạng thái |
| BR-05 đến BR-07 | Phí gốc, phụ phí dưới 25 tuổi, giảm giá, quyền lợi, làm tròn, kỳ tháng | Bảng quyết định, pairwise |
| BR-08 | Bắt buộc đồng ý điều khoản, số hợp đồng tăng dần | EP, chuyển trạng thái |

Kết quả mong đợi: một bảng khoảng 12 dòng điều kiện. Mỗi dòng sau này sinh ra một nhóm test case. Nếu một BR không rút ra được điều kiện đo được thì BR đó mơ hồ, hãy hỏi lại người viết yêu cầu (bài 3.1).

### Bước 2. Tính biên phụ thuộc "hôm nay"
Mục đích: biên của tuổi và năm sản xuất **dịch chuyển theo ngày**, nên phải tính lại từ ngày giả lập. Với hôm nay là 15/06/2026:

| Giá trị đang test | Ngày sinh | Tuổi tính đến 15/06/2026 | Mong đợi |
|-------------------|-----------|--------------------------|----------|
| Ngay dưới biên 18 | 16/06/2008 | 17 tuổi 364 ngày | Báo lỗi |
| Đúng biên 18 | 15/06/2008 | 18 tuổi | Hợp lệ |
| Đúng biên 70 | 15/06/1956 | 70 tuổi | Hợp lệ |
| Ngay trước sinh nhật 71 | 16/06/1955 | 70 tuổi 364 ngày | Hợp lệ |
| Đúng 71 | 15/06/1955 | 71 tuổi | Báo lỗi |
| Ngày sinh ở tương lai | 01/01/2027 | không tính được | Báo lỗi |

Điểm hay bị bỏ sót: **ngày sinh nhật ngay trong ngày hôm nay**. Đúng 70 tuổi (sinh 15/06/1956) hợp lệ, còn đúng 71 tuổi (15/06/1955) thì không; chỉ khác nhau một ngày nhưng nằm ở hai phía của biên trên.

Năm sản xuất: từ 2026 - 15 = 2011 đến 2026. Test các giá trị 2010 (lỗi), 2011 (hợp lệ), 2026 (hợp lệ), 2027 (lỗi). Giao diện có dòng gợi ý "Từ 2011 đến 2026", dùng nó làm một assertion để chắc rằng ngày giả lập đã có hiệu lực.

Tải trọng của ô tô tải nhẹ: 0,4 lỗi; 0,5 và 3,5 hợp lệ; 3,6 lỗi. Giá trị xe: 49.999.999 lỗi, 50.000.000 và 5.000.000.000 hợp lệ.

### Bước 3. Viết test case cho từng bước của form
Mục đích: mỗi bước một nhóm test độc lập, **đến thẳng bước đó bằng helper**, không đi lại từ đầu bằng click thủ công trong từng test. Bảng test case cho bước 1 (rút gọn):

| ID | Dữ liệu | Mong đợi |
|----|---------|----------|
| S1-01 | Để trống cả 4 ô, bấm Tiếp tục | 4 lỗi dưới từng ô, vẫn ở "Bước 1/4 · Chủ xe" |
| S1-02 | Tuổi đúng 18 | Sang "Bước 2/4 · Thông tin xe" |
| S1-03 | Tuổi 17 tuổi 364 ngày | `err-dob`: "Chủ xe phải từ 18 đến 70 tuổi" |
| S1-04 | Điện thoại `0412345678` (đầu số 04) | `err-phone` nhắc "10 số" |
| S1-05 | Điện thoại 9 số, 11 số, có chữ | `err-phone` |
| S1-06 | Email `an@` | `err-email`: "Email không hợp lệ" |

Tương tự cho bước 2 (biên năm, giá trị, biển số, tải trọng), bước 3 (bắt buộc chọn gói) và bước 4 (bắt buộc đồng ý điều khoản). Với EP của điện thoại: một lớp hợp lệ cho mỗi đầu số (03, 05, 07, 08, 09), các lớp không hợp lệ gồm sai độ dài, sai đầu số, có ký tự chữ, có mã quốc gia `+84`. Hãy lấy một đại diện cho mỗi lớp, đừng thử 100 số.

### Bước 4. Bảng quyết định cho trường điều kiện
Mục đích: chốt hành vi khi loại xe thay đổi, vì đây là chỗ hay sinh lỗi "trạng thái cũ còn sót".

| Điều kiện / Kết quả | R1 | R2 | R3 | R4 |
|---------------------|----|----|----|----|
| Loại xe | Ô tô con | Ô tô tải nhẹ | Xe máy | Xe máy |
| Đã chọn gói Toàn diện trước đó | Không | Không | Không | Có |
| Ô Tải trọng hiện | Không | Có | Không | Không |
| Có gói Toàn diện để chọn | Có | Có | Không | Không |
| Gói đã chọn bị xoá, phải chọn lại | Không | Không | Không | Có |

R4 là luật khó thấy nhất (BR-03) và cần một test riêng: chọn ô tô, chọn Toàn diện, Quay lại, đổi sang Xe máy, Tiếp tục, rồi bấm Tiếp tục ở bước 3 mà chưa chọn gì thì phải thấy lỗi "Vui lòng chọn gói bảo hiểm".

### Bước 5. Bảng quyết định cho công thức phí
Mục đích: tách công thức thành từng lớp, mỗi lớp có bảng riêng nhỏ, rồi **tính tay** để có kết quả mong đợi. Công thức (BR-05 đến BR-07):

```text
phí gốc      = giá trị x tỉ lệ gói x hệ số loại xe
sau phụ phí  = phí gốc x 1,2 nếu dưới 25 tuổi, ngược lại x 1
sau giảm giá = sau phụ phí x (1 - mức giảm theo số năm không bồi thường)
phí năm      = làm tròn XUỐNG nghìn đồng của (sau giảm giá + quyền lợi thêm)
phí tháng    = làm tròn (phí năm x 1,08 / 12)
```

Lớp 1, loại xe x gói (giá trị 500 triệu, chủ xe 36 tuổi, không giảm giá, không quyền lợi). Xe máy không có ô Toàn diện:

| Loại xe | Cơ bản (1,0%) | Nâng cao (1,5%) | Toàn diện (2,0%) |
|---------|---------------|-----------------|------------------|
| Ô tô con (x1,0) | 5.000.000 | 7.500.000 | 10.000.000 |
| Ô tô tải nhẹ (x1,2) | 6.000.000 | 9.000.000 | 12.000.000 |
| Xe máy (x0,6) | 3.000.000 | 4.500.000 | không có |

Lớp 2, tuổi x số năm không bồi thường (ô tô con, Cơ bản, giá trị 1 tỷ, gốc là 10.000.000):

| Nhóm tuổi | 0 năm (0%) | 1 năm (5%) | 2 năm (10%) | 3 năm trở lên (15%) |
|-----------|-----------|-----------|-------------|---------------------|
| Từ 25 tuổi (sinh 15/06/2001) | 10.000.000 | 9.500.000 | 9.000.000 | 8.500.000 |
| Dưới 25 tuổi (sinh 16/06/2001), phụ phí 20% | 12.000.000 | 11.400.000 | 10.800.000 | 10.200.000 |

Chú ý hai điều: (1) 15/06/2001 là đúng 25 tuổi nên **không** bị phụ phí, còn 16/06/2001 là 24 tuổi 364 ngày nên bị; đây là một biên BVA nữa. (2) Ô "2 năm = 9.000.000" là nơi BUG-02 làm lộ lỗi: ứng dụng hỏng cho 8.500.000.

Lớp 3, thứ tự áp dụng. Ví dụ chủ xe 24 tuổi, ô tô tải nhẹ, Nâng cao, giá trị 800 triệu, 3 năm không bồi thường, thêm Thuỷ kích và Cứu hộ 24/7:

```text
phí gốc      = 800.000.000 x 1,5% x 1,2 = 14.400.000
sau phụ phí  = 14.400.000 x 1,2         = 17.280.000
sau giảm giá = 17.280.000 x 0,85        = 14.688.000
cộng quyền lợi (300.000 + 200.000)      = 15.188.000
phí năm      = 15.188.000 (đã tròn nghìn)
```

Nếu cộng quyền lợi **trước** khi giảm giá thì được (17.280.000 + 500.000) x 0,85 = 15.113.000, lệch 75.000 so với đáp án đúng. Một test với dữ liệu như thế này bắt được lỗi sai thứ tự mà các test lẻ từng lớp bỏ qua. Cuối cùng là làm tròn: giá trị 833.333.333, tải nhẹ, Nâng cao, không giảm giá cho gốc 14.999.999,994 nên phí năm phải là **14.999.000**, không phải 15.000.000.

Kỳ tháng (BR-07): phí năm 19.200.000 thì phí tháng là 19.200.000 x 1,08 / 12 = 1.728.000.

### Bước 6. Chọn bộ tham số cho pairwise
Mục đích: lớp công thức có quá nhiều tổ hợp, ta không thể chạy hết. Sáu tham số:

| Tham số | Giá trị |
|---------|---------|
| Loại xe | Ô tô con, Ô tô tải nhẹ, Xe máy |
| Gói | Cơ bản, Nâng cao, Toàn diện |
| Nhóm tuổi | Dưới 25, Từ 25 |
| Quyền lợi thêm | Không, Một (Thuỷ kích), Cả ba |
| Số năm không bồi thường | 0, 1, 2, 3 |
| Kỳ thanh toán | Năm, Tháng |

Tích đầy đủ là 3 x 3 x 2 x 3 x 4 x 2 = 432 tổ hợp. Bỏ các tổ hợp Xe máy + Toàn diện (48 dòng) còn **384**. Tổng số cặp cần phủ là **118**; cận dưới số dòng là 4 x 3 = 12 (hai tham số nhiều giá trị nhất). Bộ pairwise sinh được có **15 dòng**, giảm hơn 96% so với 384 mà vẫn phủ mọi cặp, trong đó có cặp (Toàn diện, Tải nhẹ) và (Xe máy, Cơ bản). Cách tạo bảng bằng tay hoặc công cụ: xem bài 3.6. Ở đây ta chỉ dùng bảng kết quả và kiểm chứng nó.

Giá trị tham số "Một quyền lợi" chỉ chọn Thuỷ kích; mọi quyền lợi cộng cố định nên một đại diện cho "một" và một đại diện cho "ba" là đủ. Test riêng từng quyền lợi (300.000, 500.000, 200.000) đã nằm trong lớp 1 của bảng quyết định.

### Bước 7. Tính phí mong đợi cho 15 dòng
Mục đích: mỗi dòng có phí năm và số tiền phải trả, tính bằng oracle độc lập. Cả 15 dòng dùng giá trị xe 800 triệu; "dưới 25" là sinh 16/06/2001 (24 tuổi), "từ 25" là sinh 15/05/1990; tải nhẹ nhập tải trọng 2 tấn.

| # | Xe | Gói | Tuổi | Quyền lợi | NCB | Kỳ | Phí năm | Phải trả |
|---|-----|-----|------|-----------|-----|-----|---------|----------|
| 1 | Ô tô con | Cơ bản | Dưới 25 | Không | 0 | Năm | 9.600.000 | 9.600.000 |
| 2 | Ô tô con | Nâng cao | Từ 25 | Một | 1 | Tháng | 11.700.000 | 1.053.000 |
| 3 | Tải nhẹ | Toàn diện | Dưới 25 | Ba | 2 | Tháng | 21.736.000 | 1.956.240 |
| 4 | Xe máy | Cơ bản | Từ 25 | Ba | 3 | Năm | 5.080.000 | 5.080.000 |
| 5 | Tải nhẹ | Nâng cao | Dưới 25 | Một | 3 | Năm | 14.988.000 | 14.988.000 |
| 6 | Tải nhẹ | Toàn diện | Từ 25 | Không | 0 | Tháng | 19.200.000 | 1.728.000 |
| 7 | Xe máy | Cơ bản | Dưới 25 | Không | 1 | Tháng | 5.472.000 | 492.480 |
| 8 | Ô tô con | Toàn diện | Từ 25 | Một | 2 | Năm | 14.700.000 | 14.700.000 |
| 9 | Xe máy | Nâng cao | Dưới 25 | Không | 2 | Năm | 7.776.000 | 7.776.000 |
| 10 | Ô tô con | Nâng cao | Dưới 25 | Ba | 0 | Năm | 15.400.000 | 15.400.000 |
| 11 | Ô tô con | Toàn diện | Dưới 25 | Không | 3 | Tháng | 16.320.000 | 1.468.800 |
| 12 | Tải nhẹ | Cơ bản | Dưới 25 | Một | 1 | Năm | 11.244.000 | 11.244.000 |
| 13 | Xe máy | Cơ bản | Dưới 25 | Một | 0 | Năm | 6.060.000 | 6.060.000 |
| 14 | Ô tô con | Toàn diện | Dưới 25 | Ba | 1 | Năm | 19.240.000 | 19.240.000 |
| 15 | Ô tô con | Cơ bản | Dưới 25 | Không | 2 | Năm | 8.640.000 | 8.640.000 |

Kiểm tra tay hai dòng. Dòng 8: 800.000.000 x 2,0% x 1,0 = 16.000.000; không phụ phí; giảm 10% còn 14.400.000; cộng 300.000 là 14.700.000. Dòng 3: 800.000.000 x 2,0% x 1,2 = 19.200.000; phụ phí x 1,2 là 23.040.000; giảm 10% còn 20.736.000; cộng 1.000.000 là 21.736.000; kỳ tháng 21.736.000 x 1,08 / 12 = 1.956.240.

Cách làm việc đúng với bảng: các con số này được tính **bằng công thức ở Bước 5 và đối chiếu với hàm tính phí của ứng dụng**; nếu hai bên lệch nhau thì dừng lại hỏi BA, đừng sửa số cho khớp.

### Bước 8. Kiểm chứng bộ pairwise phủ đủ cặp
Mục đích: không tin "mắt thấy đủ", chạy script. Lưu thành `check-pairs.ts` (đặt ngoài thư mục test cũng được) rồi chạy bằng Node 22 trở lên: `node --experimental-strip-types check-pairs.ts`. Từng đoạn được giải thích ngay dưới code trong phần Demo code. Kết quả mong đợi:

```text
Số dòng: 15, cặp còn thiếu: 0
```

Nếu in ra danh sách cặp thiếu thì bạn đã gõ nhầm giá trị hoặc thiếu dòng. Nếu script ném lỗi "Dòng vi phạm ràng buộc" thì có dòng Xe máy + Toàn diện.

### Bước 9. Test chuyển trạng thái của form
Mục đích: kiểm tra luồng đi lại giữa các bước, nơi lỗi dữ liệu mất hay gặp nhất. Các trạng thái: B1, B2, B3, B4, Hoàn tất. Chuyển dịch cần phủ:

| Từ | Sự kiện | Đến | Ghi chú |
|----|---------|-----|---------|
| B1 | Tiếp tục, dữ liệu sai | B1 | Hiện lỗi dưới từng ô |
| B1 | Tiếp tục, dữ liệu đúng | B2 | |
| B1 | Quay lại | không có | Nút không tồn tại ở B1 |
| B2 | Quay lại | B1 | Họ tên, ngày sinh, điện thoại, email còn nguyên |
| B3 | Quay lại | B2 | Loại xe, năm, giá trị, biển số còn nguyên (BUG-03 làm mất) |
| B4 | Xác nhận khi chưa tick điều khoản | B4 | Lỗi "Bạn phải đồng ý với điều khoản bảo hiểm để tiếp tục" |
| B4 | Xác nhận khi đã tick | Hoàn tất | Số hợp đồng `BH-2026-0001` |
| Hoàn tất | Báo giá mới | B1 | Form rỗng |

Mỗi hàng là một test hoặc một đoạn trong test. Kiểm tra cả **thanh tiến trình** (`role="progressbar"`, `aria-valuenow` bằng số bước) và nhãn bước, vì nhãn có thể sai dù trang đúng.

## Demo code
Đây là spec hoàn chỉnh (đã chạy xanh trên lab, 26 test). Lưu vào `e2e/insurance-design.spec.ts` hoặc tên tuỳ ý. Phần đầu: ngày giả lập và helper.

```ts
import { test, expect, type Page } from "@playwright/test";

// "Hôm nay" cố định là 15/06/2026; phải đặt TRƯỚC page.goto.
async function open(page: Page, query = "") {
  await page.clock.setFixedTime(new Date("2026-06-15T10:00:00"));
  await page.goto("/lab/insurance" + query);
  await page.getByTestId("reset-data").click();
}

const next = (page: Page) => page.getByRole("button", { name: "Tiếp tục" }).click();
const back = (page: Page) => page.getByRole("button", { name: "Quay lại" }).click();
const stepLabel = (page: Page) => page.getByTestId("step-label");

interface Owner { name: string; dob: string; phone: string; email: string }
const OWNER: Owner = { name: "Nguyễn Văn An", dob: "1990-05-15", phone: "0912345678", email: "ban@example.com" };

async function fillOwner(page: Page, o: Partial<Owner> = {}) {
  const v = { ...OWNER, ...o };
  await page.getByLabel("Họ và tên").fill(v.name);
  await page.getByLabel("Ngày sinh").fill(v.dob);
  await page.getByLabel("Số điện thoại").fill(v.phone);
  await page.getByLabel("Email").fill(v.email);
}

interface Vehicle { type: string; payload?: string; year: string; value: string; plate: string }
const VEHICLE: Vehicle = { type: "car", year: "2022", value: "500000000", plate: "30A-123.45" };

async function fillVehicle(page: Page, v: Partial<Vehicle> = {}) {
  const x = { ...VEHICLE, ...v };
  await page.getByLabel("Loại xe").selectOption(x.type);
  if (x.payload !== undefined) await page.getByLabel("Tải trọng (tấn)").fill(x.payload);
  await page.getByLabel("Năm sản xuất").fill(x.year);
  await page.getByLabel("Giá trị xe (VNĐ)").fill(x.value);
  await page.getByLabel("Biển số xe").fill(x.plate);
}

// Đến thẳng bước 3 với dữ liệu hợp lệ; các test chỉ ghi đè trường mình quan tâm.
async function toStep3(page: Page, o: Partial<Owner> = {}, v: Partial<Vehicle> = {}) {
  await fillOwner(page, o);
  await next(page);
  await expect(stepLabel(page)).toHaveText("Bước 2/4 · Thông tin xe");
  await fillVehicle(page, v);
  await next(page);
  await expect(stepLabel(page)).toHaveText("Bước 3/4 · Gói bảo hiểm");
}
```

Giải thích: `page.clock.setFixedTime` làm `new Date()` trong trang luôn trả về thời điểm đã cho; ứng dụng đọc "hôm nay" qua một hàm module nên cách này đủ. Giá trị `type` của ô Loại xe là `car`, `truck`, `moto` (dùng cho `selectOption`). `Partial<Owner>` cho phép test chỉ ghi đè trường cần thử, còn lại dùng dữ liệu mặc định hợp lệ. Ô tải trọng chỉ được điền khi `payload` có giá trị vì ô này không tồn tại với xe khác.

Phần BVA tuổi, data-driven:

```ts
const ages = [
  { dob: "2008-06-16", ok: false, why: "17 tuổi 364 ngày" },
  { dob: "2008-06-15", ok: true, why: "đúng 18 tuổi" },
  { dob: "1956-06-15", ok: true, why: "đúng 70 tuổi" },
  { dob: "1955-06-16", ok: true, why: "70 tuổi 364 ngày" },
  { dob: "1955-06-15", ok: false, why: "đúng 71 tuổi" },
];

for (const c of ages) {
  test(`tuổi: ${c.dob} (${c.why}) -> ${c.ok ? "sang bước 2" : "báo lỗi"}`, async ({ page }) => {
    await open(page);
    await fillOwner(page, { dob: c.dob });
    await next(page);
    if (c.ok) await expect(stepLabel(page)).toHaveText("Bước 2/4 · Thông tin xe");
    else {
      await expect(page.getByTestId("err-dob")).toHaveText("Chủ xe phải từ 18 đến 70 tuổi");
      await expect(stepLabel(page)).toHaveText("Bước 1/4 · Chủ xe");
    }
  });
}
```

Tên test chứa dữ liệu và lý do nên báo cáo đọc được ngay. Với mỗi dòng bảng có một `test(...)` riêng: một dòng lỗi không làm các dòng sau bị bỏ qua.

Phần bước 2, trường điều kiện và chuyển trạng thái:

```ts
test("bước 2: năm sản xuất 2010 bị từ chối, 2011 và 2026 hợp lệ", async ({ page }) => {
  await open(page);
  await fillOwner(page);
  await next(page);
  await expect(page.getByTestId("year-hint")).toHaveText("Từ 2011 đến 2026");
  await fillVehicle(page, { year: "2010" });
  await next(page);
  await expect(page.getByTestId("err-year")).toHaveText("Năm sản xuất từ 2011 đến 2026");
  for (const year of ["2011", "2026"]) {
    await page.getByLabel("Năm sản xuất").fill(year);
    await next(page);
    await expect(stepLabel(page)).toHaveText("Bước 3/4 · Gói bảo hiểm");
    await back(page);
  }
});

test("trường điều kiện: ô Tải trọng chỉ có với ô tô tải nhẹ, biên 0,5 và 3,5", async ({ page }) => {
  await open(page);
  await fillOwner(page);
  await next(page);
  const payload = page.getByLabel("Tải trọng (tấn)");
  await expect(payload).toHaveCount(0);
  await page.getByLabel("Loại xe").selectOption("truck");
  await expect(payload).toBeVisible();
  await fillVehicle(page, { type: "truck", payload: "0,4" });
  await next(page);
  await expect(page.getByTestId("err-payload")).toHaveText("Tải trọng từ 0,5 đến 3,5 tấn");
  for (const ok of ["0,5", "3,5"]) {
    await payload.fill(ok);
    await next(page);
    await expect(stepLabel(page)).toHaveText("Bước 3/4 · Gói bảo hiểm");
    await back(page);
  }
});

test("xe máy không có gói Toàn diện", async ({ page }) => {
  await open(page);
  await toStep3(page, {}, { type: "moto", value: "60000000" });
  await expect(page.getByRole("radio", { name: "Toàn diện" })).toHaveCount(0);
  await expect(page.getByRole("radio", { name: "Nâng cao" })).toBeVisible();
});

test("chuyển trạng thái: lỗi thì ở lại, Quay lại giữ dữ liệu, bước 1 không có Quay lại", async ({ page }) => {
  await open(page);
  await expect(page.getByRole("button", { name: "Quay lại" })).toHaveCount(0);
  await next(page); // bước 1 trống: ở lại
  await expect(stepLabel(page)).toHaveText("Bước 1/4 · Chủ xe");

  await toStep3(page, {}, { year: "2020", plate: "51AB-123.45" });
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
  await back(page);
  await expect(page.getByLabel("Năm sản xuất")).toHaveValue("2020");
  await expect(page.getByLabel("Biển số xe")).toHaveValue("51AB-123.45");
  await back(page);
  await expect(page.getByLabel("Họ và tên")).toHaveValue("Nguyễn Văn An");
  await expect(page.getByLabel("Ngày sinh")).toHaveValue("1990-05-15");
});
```

Chú ý: ô điền số thập phân dùng dấu phẩy ("0,4"), đúng quy ước tiếng Việt mà ứng dụng chấp nhận; `getByRole("radio", { name: "Toàn diện" })` được dùng thay cho `getByLabel` vì radio của lab có `<input>` ẩn trong thành phần UI.

Phần pairwise: dữ liệu, oracle độc lập và vòng tạo test.

```ts
interface Row {
  id: number;
  type: "car" | "truck" | "moto";
  pkg: "Cơ bản" | "Nâng cao" | "Toàn diện";
  dob: string; // 2001-06-16 = 24 tuổi, 1990-05-15 = 36 tuổi
  extras: string[];
  ncb: "0" | "1" | "2" | "3";
  billing: "year" | "month";
  annual: string;
  payable: string;
}
const YOUNG = "2001-06-16";
const ADULT = "1990-05-15";
const FLOOD = ["Thuỷ kích"];
const ALL = ["Thuỷ kích", "Mất cắp bộ phận", "Cứu hộ 24/7"];

const rows: Row[] = [
  { id: 1, type: "car", pkg: "Cơ bản", dob: YOUNG, extras: [], ncb: "0", billing: "year", annual: "9.600.000 ₫", payable: "9.600.000 ₫" },
  { id: 2, type: "car", pkg: "Nâng cao", dob: ADULT, extras: FLOOD, ncb: "1", billing: "month", annual: "11.700.000 ₫", payable: "1.053.000 ₫" },
  { id: 3, type: "truck", pkg: "Toàn diện", dob: YOUNG, extras: ALL, ncb: "2", billing: "month", annual: "21.736.000 ₫", payable: "1.956.240 ₫" },
  { id: 4, type: "moto", pkg: "Cơ bản", dob: ADULT, extras: ALL, ncb: "3", billing: "year", annual: "5.080.000 ₫", payable: "5.080.000 ₫" },
  { id: 5, type: "truck", pkg: "Nâng cao", dob: YOUNG, extras: FLOOD, ncb: "3", billing: "year", annual: "14.988.000 ₫", payable: "14.988.000 ₫" },
  { id: 6, type: "truck", pkg: "Toàn diện", dob: ADULT, extras: [], ncb: "0", billing: "month", annual: "19.200.000 ₫", payable: "1.728.000 ₫" },
  { id: 7, type: "moto", pkg: "Cơ bản", dob: YOUNG, extras: [], ncb: "1", billing: "month", annual: "5.472.000 ₫", payable: "492.480 ₫" },
  { id: 8, type: "car", pkg: "Toàn diện", dob: ADULT, extras: FLOOD, ncb: "2", billing: "year", annual: "14.700.000 ₫", payable: "14.700.000 ₫" },
  { id: 9, type: "moto", pkg: "Nâng cao", dob: YOUNG, extras: [], ncb: "2", billing: "year", annual: "7.776.000 ₫", payable: "7.776.000 ₫" },
  { id: 10, type: "car", pkg: "Nâng cao", dob: YOUNG, extras: ALL, ncb: "0", billing: "year", annual: "15.400.000 ₫", payable: "15.400.000 ₫" },
  { id: 11, type: "car", pkg: "Toàn diện", dob: YOUNG, extras: [], ncb: "3", billing: "month", annual: "16.320.000 ₫", payable: "1.468.800 ₫" },
  { id: 12, type: "truck", pkg: "Cơ bản", dob: YOUNG, extras: FLOOD, ncb: "1", billing: "year", annual: "11.244.000 ₫", payable: "11.244.000 ₫" },
  { id: 13, type: "moto", pkg: "Cơ bản", dob: YOUNG, extras: FLOOD, ncb: "0", billing: "year", annual: "6.060.000 ₫", payable: "6.060.000 ₫" },
  { id: 14, type: "car", pkg: "Toàn diện", dob: YOUNG, extras: ALL, ncb: "1", billing: "year", annual: "19.240.000 ₫", payable: "19.240.000 ₫" },
  { id: 15, type: "car", pkg: "Cơ bản", dob: YOUNG, extras: [], ncb: "2", billing: "year", annual: "8.640.000 ₫", payable: "8.640.000 ₫" },
];

// Oracle độc lập: tính lại từ BR bằng số nguyên (đồng), không đọc từ ứng dụng.
const PERMILLE = { "Cơ bản": 10, "Nâng cao": 15, "Toàn diện": 20 } as const;
const FACTOR10 = { car: 10, truck: 12, moto: 6 } as const;
const EXTRA_PRICE: Record<string, number> = { "Thuỷ kích": 300_000, "Mất cắp bộ phận": 500_000, "Cứu hộ 24/7": 200_000 };
const DISCOUNT = { "0": 0, "1": 5, "2": 10, "3": 15 } as const;

function expectedAnnual(r: Row, value: number): number {
  const base = (value * PERMILLE[r.pkg] * FACTOR10[r.type]) / 10_000;
  const surcharged = r.dob === YOUNG ? (base * 120) / 100 : base;
  const discounted = (surcharged * (100 - DISCOUNT[r.ncb])) / 100;
  const extras = r.extras.reduce((s, x) => s + EXTRA_PRICE[x], 0);
  return Math.floor((discounted + extras) / 1000) * 1000;
}
const vnd = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`;

test("oracle độc lập khớp bảng pairwise", () => {
  for (const r of rows) expect(vnd(expectedAnnual(r, 800_000_000)), `dòng ${r.id}`).toBe(r.annual);
});

for (const r of rows) {
  test(`pairwise #${r.id}: ${r.type} / ${r.pkg} / ${r.dob === YOUNG ? "dưới 25" : "từ 25"} / ${r.extras.length} quyền lợi / NCB ${r.ncb} / ${r.billing}`, async ({ page }) => {
    await open(page);
    await toStep3(page, { dob: r.dob }, { type: r.type, payload: r.type === "truck" ? "2" : undefined, value: "800000000" });
    await page.getByRole("radio", { name: r.pkg, exact: true }).check();
    for (const x of r.extras) await page.getByRole("checkbox", { name: x }).check();
    await page.getByLabel("Số năm không bồi thường").selectOption(r.ncb);
    if (r.billing === "month") await page.getByRole("radio", { name: /theo tháng/ }).check();
    await expect(page.getByTestId("premium-annual")).toHaveText(r.annual);
    await expect(page.getByTestId("premium-payable")).toHaveText(r.payable);
  });
}
```

Giải thích: hàm `expectedAnnual` viết lại công thức bằng các bước giống BR chứ không gọi hàm của ứng dụng; test "oracle" không cần trình duyệt và chạy tức thì, nếu bảng gõ sai một số thì nó đỏ ngay. `Math.floor((... ) / 1000) * 1000` thể hiện "làm tròn xuống nghìn đồng". `exact: true` cần cho `getByRole("radio", { name: "Cơ bản" })` vì chữ "Cơ bản" cũng có thể nằm trong tên của radio khác. Cả 15 dòng dùng cùng `toStep3`, chỉ ghi đè loại xe, tuổi, giá trị.

Script kiểm chứng phủ cặp (`check-pairs.ts`):

```ts
type Row = Record<string, string>;
const params: Record<string, string[]> = {
  loaiXe: ["car", "truck", "moto"],
  goi: ["basic", "plus", "full"],
  tuoi: ["duoi25", "tu25"],
  quyenLoi: ["khong", "mot", "ba"],
  ncb: ["0", "1", "2", "3"],
  ky: ["nam", "thang"],
};
const names = Object.keys(params);
const forbidden = (a: Row) => a.loaiXe === "moto" && a.goi === "full";

const rows: Row[] = [
  ["car", "basic", "duoi25", "khong", "0", "nam"],
  ["car", "plus", "tu25", "mot", "1", "thang"],
  ["truck", "full", "duoi25", "ba", "2", "thang"],
  ["moto", "basic", "tu25", "ba", "3", "nam"],
  ["truck", "plus", "duoi25", "mot", "3", "nam"],
  ["truck", "full", "tu25", "khong", "0", "thang"],
  ["moto", "basic", "duoi25", "khong", "1", "thang"],
  ["car", "full", "tu25", "mot", "2", "nam"],
  ["moto", "plus", "duoi25", "khong", "2", "nam"],
  ["car", "plus", "duoi25", "ba", "0", "nam"],
  ["car", "full", "duoi25", "khong", "3", "thang"],
  ["truck", "basic", "duoi25", "mot", "1", "nam"],
  ["moto", "basic", "duoi25", "mot", "0", "nam"],
  ["car", "full", "duoi25", "ba", "1", "nam"],
  ["car", "basic", "duoi25", "khong", "2", "nam"],
].map((r) => Object.fromEntries(names.map((n, i) => [n, r[i]])));

// Mọi cặp giá trị hợp lệ cần phủ.
const need = new Set<string>();
for (let i = 0; i < names.length; i++)
  for (let j = i + 1; j < names.length; j++)
    for (const a of params[names[i]])
      for (const b of params[names[j]]) {
        const probe: Row = { [names[i]]: a, [names[j]]: b };
        if (!forbidden(probe)) need.add(`${names[i]}=${a} & ${names[j]}=${b}`);
      }

// Gạch bỏ các cặp đã xuất hiện trong từng dòng.
for (const r of rows) {
  if (forbidden(r)) throw new Error("Dòng vi phạm ràng buộc: " + JSON.stringify(r));
  for (let i = 0; i < names.length; i++)
    for (let j = i + 1; j < names.length; j++) need.delete(`${names[i]}=${r[names[i]]} & ${names[j]}=${r[names[j]]}`);
}
console.log(`Số dòng: ${rows.length}, cặp còn thiếu: ${need.size}`);
if (need.size) console.log([...need]);
```

Giải thích: `need` ban đầu chứa đủ 118 cặp hợp lệ; mỗi dòng gạch đi 15 cặp nó chứa (6 tham số có C(6,2) = 15 cặp). Cuối cùng `need` rỗng nghĩa là mọi cặp đều được phủ. Hàm `forbidden` được dùng ở hai nơi: loại cặp không thể xảy ra khỏi tập cần phủ và chặn dòng vi phạm.

## Thử ngay trong lab
Mở `/lab/insurance` (mô tả và Business Rule ở `/labs/insurance`).
- Đi qua 4 bước với dữ liệu hợp lệ, đối chiếu ô "Tạm tính phí bảo hiểm" ở bước 3 với bảng trong Bước 7 (dùng giá trị 800.000.000 và đúng nhóm tuổi).
- Đổi số năm không bồi thường giữa 1 và 2 và xem khoản giảm; khi bật `?bugs=BUG-02` ở đường dẫn, ô 2 năm phải ra 8.500.000 thay vì 9.000.000 với ô tô con, Cơ bản, 1 tỷ.
- Bật `?bugs=BUG-01` và nhập ngày sinh để chủ xe tròn đúng 18 tuổi vào hôm nay (lab thủ công dùng ngày hệ thống của bạn, nên tự tính ngày sinh) rồi quan sát lỗi bị từ chối sai.
- Bật `?bugs=BUG-03`, tới bước 3 rồi Quay lại: dữ liệu bước 2 bị mất.

## Lỗi thường gặp
- **Triệu chứng**: test tuổi đỏ vào ngày hôm sau dù không ai sửa code. **Nguyên nhân**: dùng ngày sinh cố định mà quên cố định "hôm nay". **Cách sửa**: gọi `page.clock.setFixedTime` **trước** `page.goto`, và tính ngày sinh biên theo ngày đã cố định.
- **Triệu chứng**: `Error: strict mode violation: getByRole('radio', { name: 'Cơ bản' }) resolved to 2 elements`. **Nguyên nhân**: tên radio trùng một phần. **Cách sửa**: thêm `exact: true`.
- **Triệu chứng**: pairwise có dòng Xe máy + Toàn diện, test chờ mãi radio "Toàn diện". **Nguyên nhân**: bỏ qua ràng buộc BR-03. **Cách sửa**: loại tổ hợp vô lệ trước khi sinh bảng, và có script kiểm tra như `check-pairs.ts`.
- **Triệu chứng**: phí mong đợi lệch 1.000 đồng so với ứng dụng. **Nguyên nhân**: làm tròn sai chỗ (làm tròn từng bước thay vì chỉ ở cuối, hoặc làm tròn lên thay vì xuống). **Cách sửa**: đọc lại BR-06, đặt một test riêng cho dữ liệu gây số lẻ (giá trị 833.333.333).
- **Triệu chứng**: test phí đỏ nhưng chỉ ở dòng có quyền lợi thêm. **Nguyên nhân**: cộng quyền lợi trước khi giảm giá. **Cách sửa**: xem Bước 5, một test trộn đủ phụ phí, giảm giá và quyền lợi (24 tuổi, 3 năm, hai quyền lợi) bắt lỗi thứ tự.
- **Triệu chứng**: `TimeoutError: locator.click: Timeout 30000ms exceeded` khi gọi helper `next` ở bước 4. **Nguyên nhân**: bước 4 không có nút "Tiếp tục" mà là "Xác nhận mua bảo hiểm". **Cách sửa**: ở bước cuối bấm đúng nút xác nhận, và nhớ tick điều khoản trước.

## Tóm tắt
- Chia form nhiều bước thành lớp: kiểm tra từng bước (EP, BVA), trường điều kiện (bảng quyết định), công thức tính phí (bảng quyết định, tính tay), tổ hợp (pairwise) và luồng điều hướng (chuyển trạng thái).
- Biên phụ thuộc ngày phải tính lại từ "hôm nay" giả lập, và test chỉ ổn định khi cố định thời gian bằng `page.clock`.
- Tính tay kết quả mong đợi theo đúng thứ tự công thức; một oracle độc lập trong spec giúp phát hiện bảng số sai mà không cần mở trình duyệt.
- Pairwise cho 6 tham số giảm 384 tổ hợp hợp lệ xuống 15 dòng phủ đủ 118 cặp; ràng buộc phải được loại ra trước, và kiểm chứng bằng script.
- Mỗi dòng dữ liệu là một test riêng, tên test mô tả dữ liệu; helper "đến thẳng bước N" giữ spec ngắn và ổn định.

## Bài tập
1. **Dễ**: Lập bảng điều kiện (như Bước 1) cho riêng BR-08 của bước 4, gồm ít nhất 4 dòng và kỹ thuật cho từng dòng. Xong khi mỗi dòng có thể viết thành test case có dữ liệu cụ thể.
2. **Dễ**: Tính tay phí năm và phí tháng cho ô tô con, Nâng cao, giá trị 1,2 tỷ, 30 tuổi, Cứu hộ 24/7, 1 năm không bồi thường. Xong khi bạn viết ra từng lớp công thức và đối chiếu được với ô tạm tính của lab.
3. **Vừa**: Thêm test BVA giá trị xe (49.999.999, 50.000.000, 5.000.000.000, 5.000.000.001) và biên họ tên (1, 2, 60, 61 ký tự) vào spec. Xong khi cả hai test data-driven xanh trên lab sạch.
4. **Vừa**: Bật `?bugs=BUG-01` rồi `?bugs=BUG-03` và chạy các test tương ứng. Xong khi test tuổi biên đỏ với BUG-01, test "Quay lại giữ dữ liệu" đỏ với BUG-03, và bạn giải thích được vì sao các test phí không bắt được hai lỗi này.
5. **Khó**: Thêm tham số "Giá trị xe" (60 triệu, 800 triệu, 5 tỷ) vào bộ pairwise và sinh lại bảng (bằng tay hoặc công cụ). Xong khi `check-pairs.ts` báo 0 cặp thiếu và oracle khớp từng dòng.
