---
title: Phân tích yêu cầu và Business Rule
level: 3
order: 1
minutes: 45
summary: Đọc yêu cầu, tìm actor, luồng, business rule và điểm mơ hồ trước khi viết test case.
keywords: [acceptance criteria là gì, business rule, requirement ambiguity]
---

## Mục tiêu bài học
- Tách một đoạn mô tả nghiệp vụ thành danh sách **Business Rule (BR)** có đánh số, mỗi BR chỉ chứa một quy tắc kiểm chứng được.
- Liệt kê được dữ liệu vào, dữ liệu ra và trạng thái của một chức năng trước khi nghĩ đến test case.
- Tìm ít nhất 5 điểm mơ hồ trong một yêu cầu thật, đặt câu hỏi rõ ràng, rồi dùng ứng dụng để quan sát hành vi hiện tại.
- Viết **Acceptance Criteria** dạng Given/When/Then cho một BR và chốt giả định bằng văn bản.

## Bạn cần chuẩn bị
- Đã học xong Level 2 (biết đọc và chạy một file test Playwright).
- Mở sẵn hai trang của site: `/labs/leave` (business rule, test case mẫu của LAB-07) và `/lab/leave` (ứng dụng nghỉ phép thật để thao tác).
- Một file ghi chú (Markdown hoặc bảng tính) để chép lại kết quả từng bước. Bài này không cần cài thêm gì.

## Kiến thức cần nắm
- **Actor**: người hoặc hệ thống tương tác với chức năng (nhân viên, quản lý, hệ thống tự động).
- **Luồng chính** (happy path) và **luồng ngoại lệ** (lỗi, từ chối, hết hạn).
- **Business Rule (BR)**: quy tắc nghiệp vụ, đánh số để truy vết (BR-01, BR-02…).
- **Acceptance Criteria (AC)**: điều kiện để chấp nhận chức năng là xong, viết sao cho đúng/sai rõ ràng.
- **Điểm mơ hồ**: chỗ yêu cầu thiếu giá trị biên, thiếu thông báo lỗi, không nói rõ làm tròn, múi giờ, thứ tự kiểm tra.
- **Giả định** (assumption): điều bạn tạm coi là đúng cho đến khi người ra yêu cầu xác nhận.

## Giải thích dễ hiểu
Phân tích yêu cầu giống **đọc hợp đồng trước khi ký**. Bạn gạch chân từng điều khoản (BR), hỏi lại chỗ khó hiểu ("giảm tối đa 100.000đ tính trước hay sau VAT?"), rồi mới đề xuất cách kiểm tra từng điều khoản. Test case viết trên yêu cầu mơ hồ sẽ kiểm tra... sự hiểu nhầm của chính bạn.

Vì sao phải làm bước này trước mọi kỹ thuật thiết kế test (EP, BVA, bảng quyết định ở các bài sau)? Vì các kỹ thuật đó chỉ là cách **chọn dữ liệu và kịch bản**, còn "đúng" là gì thì do BR quyết định. Hai người cùng dùng kỹ thuật BVA nhưng hiểu "ngày bắt đầu không ở quá khứ" khác nhau (có tính hôm nay hay không) sẽ tạo ra hai bộ test trái ngược nhau. Bước phân tích là nơi bạn khoá lại sự hiểu chung đó.

Một BR tốt có ba đặc điểm:
1. **Nguyên tử**: không có chữ "và" nối hai quy tắc độc lập. "Lý do từ 10 đến 200 ký tự và ngày bắt đầu không ở quá khứ" là hai BR.
2. **Kiểm chứng được**: có thể nói "đúng" hoặc "sai" sau khi quan sát. "Hệ thống phải nhanh" không phải BR kiểm thử được; "Số dư hiển thị đúng sau khi duyệt" thì được.
3. **Có định danh**: BR-03 ở LAB-07 luôn là BR-03, để test case và spec sau này trỏ về nó (xem bài 3.7 và 3.10).

## Thực hành từng bước
Ví dụ xuyên suốt của bài: chức năng **nghỉ phép** của LAB-07 (`/lab/leave`). Bạn sẽ đóng vai tester nhận một đoạn mô tả thô từ Product Owner và biến nó thành thứ đủ rõ để test.

Đoạn mô tả thô (tự biên soạn cho bài học):

```text
Nhân viên gửi đơn nghỉ phép gồm loại nghỉ, từ ngày, đến ngày và lý do. Ngày bắt đầu không
được ở quá khứ. Phép năm còn 12 ngày, số ngày nghỉ tính cả ngày đầu và ngày cuối. Quản lý
duyệt hoặc từ chối đơn; khi từ chối phải ghi lý do. Chỉ khi đơn được duyệt thì phép năm mới
bị trừ. Không được gửi đơn trùng ngày với đơn khác. Nhân viên có thể huỷ đơn chưa được duyệt.
```

### Bước 1. Xác định actor, mục tiêu và luồng
Mục đích: biết ai làm gì để không bỏ sót vai trò.

Đọc đoạn mô tả và điền bảng sau. Cột "Bằng chứng" là câu trong mô tả hỗ trợ nhận định của bạn.

| Actor | Mục tiêu | Hành động có thể làm | Bằng chứng |
|-------|----------|----------------------|-----------|
| Nhân viên | Xin nghỉ | Gửi đơn, huỷ đơn chưa duyệt | "Nhân viên gửi đơn", "huỷ đơn chưa được duyệt" |
| Quản lý | Xử lý đơn | Duyệt, từ chối kèm lý do | "Quản lý duyệt hoặc từ chối" |
| Hệ thống | Giữ dữ liệu nhất quán | Tính số ngày, trừ phép, chặn đơn trùng | "tính cả ngày đầu và cuối", "phép năm mới bị trừ" |

Luồng chính: nhân viên gửi đơn hợp lệ, đơn ở trạng thái chờ, quản lý duyệt, phép năm giảm. Luồng ngoại lệ: dữ liệu sai (ngày, lý do), vượt số dư, trùng ngày, từ chối, huỷ.

Kết quả mong đợi của bước này: bạn có bảng actor và hai danh sách luồng (chính, ngoại lệ). Nếu một actor chỉ xuất hiện ở dạng "ai đó" (ví dụ "người dùng"), hãy ghi nó vào danh sách câu hỏi ở Bước 4.

### Bước 2. Tách và đánh số Business Rule
Mục đích: biến từng câu văn thành quy tắc nguyên tử có ID.

Đi từng câu, gạch chân điều kiện và con số, tách chữ "và" nếu nối hai quy tắc. Bạn sẽ ra bảng dưới đây; nó khớp với danh sách BR trên trang `/labs/leave`.

| BR | Nội dung quy tắc | Câu gốc |
|----|------------------|---------|
| BR-01 | Đơn gồm loại nghỉ, từ ngày, đến ngày; lý do 10 đến 200 ký tự | "gồm loại nghỉ, từ ngày, đến ngày và lý do" |
| BR-02 | Ngày bắt đầu không ở quá khứ; ngày kết thúc từ ngày bắt đầu trở đi | "Ngày bắt đầu không được ở quá khứ" |
| BR-03 | Số ngày nghỉ tính cả ngày đầu và ngày cuối; phép năm còn 12 ngày | "tính cả ngày đầu và ngày cuối", "còn 12 ngày" |
| BR-04 | Trạng thái: Chờ duyệt, rồi Đã duyệt, Từ chối hoặc Đã huỷ | "duyệt hoặc từ chối", "huỷ" |
| BR-05 | Chỉ Quản lý duyệt hoặc từ chối; từ chối bắt buộc có lý do | "Quản lý duyệt hoặc từ chối", "phải ghi lý do" |
| BR-06 | Chỉ khi đơn được duyệt phép năm mới bị trừ; đơn đã duyệt không huỷ được | "Chỉ khi đơn được duyệt..." |
| BR-07 | Không gửi đơn trùng khoảng ngày với đơn đang chờ hoặc đã duyệt | "Không được gửi đơn trùng ngày" |

Hai chỗ cần để ý. Thứ nhất, con số "10 đến 200 ký tự" không có trong đoạn mô tả thô: nó đến từ tài liệu BR của lab. Ngoài đời, một con số bị thiếu cũng là câu hỏi cho Bước 4. Thứ hai, câu "đơn đã duyệt không huỷ được" là quy tắc **ngầm**: đoạn mô tả chỉ nói nhân viên huỷ được đơn *chưa* duyệt, bạn phải tự suy ra điều ngược lại và ghi thành BR để nó có test.

Kết quả mong đợi: một bảng BR có ID, mỗi dòng đọc lên là một câu đúng/sai.

### Bước 3. Liệt kê dữ liệu vào, dữ liệu ra, trạng thái
Mục đích: biết cần kiểm gì và quan sát ở đâu.

| Nhóm | Mục | Ghi chú rút ra |
|------|-----|----------------|
| Vào | Loại nghỉ | 3 giá trị: Phép năm, Nghỉ ốm, Nghỉ không lương |
| Vào | Từ ngày, Đến ngày | Kiểu ngày; so với "hôm nay" nên test phải điều khiển được thời gian (page.clock, bài Level 2) |
| Vào | Lý do | Chuỗi 10 đến 200 ký tự |
| Ra | Số ngày của đơn | Tính theo BR-03 |
| Ra | Trạng thái đơn, số dư phép | Quan sát trên giao diện (số dư dạng "Phép năm còn 12/12 ngày") |
| Trạng thái | Đơn: Chờ duyệt, Đã duyệt, Từ chối, Đã huỷ | Sẽ vẽ bảng chuyển trạng thái ở bài 3.5 |
| Trạng thái | Số dư phép | Đổi khi duyệt, không đổi khi gửi |

Kết quả mong đợi: bạn biết mỗi BR sẽ kiểm bằng cách thay đổi đầu vào nào và đọc đầu ra nào. Ví dụ BR-03 cần: nhập hai ngày, đọc ô "Số ngày" và dòng số dư.

### Bước 4. Săn điểm mơ hồ rồi đặt câu hỏi
Mục đích: tìm chỗ hai người hiểu khác nhau.

Một cách tìm hiệu quả là đi qua danh sách "câu hỏi mồi" cho mỗi BR: giá trị biên có tính không? đếm theo đơn vị nào? thứ tự kiểm tra? điều gì xảy ra ở trạng thái trung gian? Với LAB-07 ta có bảng sau. Cột cuối là điều **quan sát được trên lab** (mở `/lab/leave`, làm theo, ghi lại). Đây là giả định tạm thời, chưa phải xác nhận của Product Owner.

| # | Câu hỏi cần làm rõ | Vì sao quan trọng | Quan sát trên lab |
|---|--------------------|-------------------|-------------------|
| 1 | "Không ở quá khứ": bắt đầu đúng hôm nay có được không? | Biên của BR-02 | Hôm nay hợp lệ, hôm qua bị báo lỗi |
| 2 | Thứ Bảy, Chủ nhật, ngày lễ có tính vào số ngày nghỉ không? | Ảnh hưởng số dư phép | Lab đếm theo ngày lịch: 07/03 đến 08/03 (T7, CN) cho 2 ngày |
| 3 | Nghỉ ốm và không lương có bị giới hạn 12 ngày không? | Phạm vi của BR-03 | Chỉ Phép năm bị giới hạn (đơn nghỉ ốm 20 ngày vẫn gửi được) |
| 4 | Kiểm tra số dư lúc gửi hay lúc duyệt? Đơn đang chờ có "giữ chỗ" phép không? | Có thể thủng số dư | Lab chỉ so với số đã duyệt, nên hai đơn 12 ngày cùng gửi được; duyệt cả hai thì số dư hiển thị "-12/12" |
| 5 | Lý do toàn khoảng trắng tính là bao nhiêu ký tự? | Biên của BR-01 | Cắt khoảng trắng hai đầu rồi mới đếm, 20 dấu cách bị báo "tối thiểu 10" |
| 6 | Đơn đã huỷ hoặc bị từ chối còn chặn gửi đơn trùng ngày không? | Phạm vi của BR-07 | Không chặn: huỷ xong gửi lại đúng khoảng ngày cũ được |
| 7 | Thứ tự kiểm tra khi sai nhiều lỗi cùng lúc, báo lỗi nào trước? | Quyết định dữ liệu test (bài 3.2) | Ngày, rồi lý do, rồi số dư, rồi trùng ngày |

Dòng 4 là phát hiện đáng giá nhất: BR-06 nói "chỉ khi duyệt mới trừ phép", nhưng không nói điều gì ngăn quản lý duyệt vượt số dư. Đó là một **lỗ hổng yêu cầu**, nên ghi vào báo cáo dưới dạng câu hỏi chứ không vội gọi là bug.

Kết quả mong đợi: một bảng câu hỏi có ít nhất 5 dòng, mỗi dòng có cột "quan sát" bạn tự kiểm tra, không chép từ bài này. Hãy thử lại từng dòng trên `/lab/leave` (nhớ bấm "Reset dữ liệu lab" giữa các lần thử).

### Bước 5. Viết Acceptance Criteria dạng Given/When/Then
Mục đích: biến BR thành tiêu chí đúng/sai mà cả đội đọc cùng hiểu.

Mẫu: **Given** (bối cảnh), **When** (hành động), **Then** (kết quả quan sát được). Ví dụ cho BR-03 và BR-06:

```text
AC-03a
  Given hôm nay là 02/03/2026 và phép năm còn 12 ngày
  When nhân viên gửi đơn Phép năm từ 09/03/2026 đến 11/03/2026
  Then đơn xuất hiện với trạng thái "Chờ duyệt" và số ngày là 3
   And dòng số dư vẫn là "Phép năm còn 12/12 ngày"

AC-06a
  Given có một đơn Phép năm 3 ngày đang "Chờ duyệt"
  When quản lý bấm "Duyệt đơn #1"
  Then trạng thái đơn là "Đã duyệt"
   And số dư của nhân viên là "Phép năm còn 9/12 ngày"
   And nhân viên không còn thấy nút "Huỷ đơn #1"
```

Mỗi dòng Then phải quan sát được (một chữ trên màn hình, một giá trị trong bảng). Tránh "hệ thống xử lý đúng" vì không ai biết thế nào là đúng.

Kết quả mong đợi: mỗi BR quan trọng có ít nhất một AC; dùng đúng các con số cụ thể (3 ngày, 9/12) vì sau này chúng chính là dữ liệu và kết quả mong đợi của test case.

### Bước 6. Chốt giả định và chọn kỹ thuật test
Mục đích: ghi thành văn bản điều bạn sẽ test, kèm kỹ thuật dự kiến.

| BR | Giả định đã chốt (chờ xác nhận) | Kỹ thuật dự kiến |
|----|--------------------------------|------------------|
| BR-01 | Lý do được cắt khoảng trắng hai đầu rồi đếm | Phân vùng tương đương và biên (bài 3.2, 3.3) |
| BR-02 | Ngày bắt đầu bằng hôm nay là hợp lệ | Biên 3 giá trị (bài 3.3) |
| BR-03 | Đếm ngày lịch, không loại cuối tuần | Biên số dư 11/12/13 |
| BR-04, BR-06 | Đơn chỉ đổi trạng thái từ "Chờ duyệt" | Chuyển trạng thái (bài 3.5) |
| BR-05 | Chỉ Quản lý thấy nút Duyệt và Từ chối | Ma trận phân quyền (bài 3.8) |
| BR-07 | Chỉ đơn Chờ duyệt và Đã duyệt gây trùng | Bảng quyết định (bài 3.4) |

Gửi bảng này (kèm bảng câu hỏi ở Bước 4) cho người ra yêu cầu. Câu trả lời của họ sẽ biến "giả định" thành "BR chính thức"; nếu hành vi lab khác câu trả lời, đó là bug.

## Demo code
Bước 4 cho thấy một lợi ích của phân tích kỹ: biến câu hỏi thành **test kiểm chứng giả định**. Test dưới đây giữ lại hành vi đã quan sát (câu hỏi số 4) để lần sau có ai đổi hành vi, bạn biết ngay. Nó chạy trên lab và tự dùng đồng hồ giả để "hôm nay" luôn là 02/03/2026.

```ts
import { test, expect } from "@playwright/test";

// Đồng hồ giả: thứ Hai 02/03/2026, để mọi ngày trong test đều hợp lệ.
const NOW = new Date("2026-03-02T09:00:00");

test("[ASSUMP-04][BR-03,BR-06] số dư chỉ trừ khi duyệt, hai đơn 12 ngày cùng gửi được", async ({ page, context }) => {
  await context.clock.setFixedTime(NOW);          // cố định "bây giờ" cho cả context
  await page.goto("/lab/leave");
  await page.getByTestId("reset-data").click();   // dữ liệu sạch cho mỗi test

  // Hàm nhỏ gửi một đơn Phép năm với lý do hợp lệ.
  const send = async (from: string, to: string) => {
    await page.getByLabel("Từ ngày").fill(from);
    await page.getByLabel("Đến ngày").fill(to);
    await page.getByLabel("Lý do").fill("Đi công tác gia đình xa");
    await page.getByRole("button", { name: "Gửi đơn" }).click();
  };

  await send("2026-04-01", "2026-04-12");          // 12 ngày
  await send("2026-05-01", "2026-05-12");          // thêm 12 ngày, không trùng ngày
  await expect(page.getByTestId("leave-row")).toHaveCount(2);

  // Chuyển sang vai trò Quản lý và duyệt cả hai đơn.
  await page.getByLabel("Vai trò").selectOption("manager");
  await page.getByRole("button", { name: "Duyệt đơn #1" }).click();
  await page.getByRole("button", { name: "Duyệt đơn #2" }).click();

  // Hành vi quan sát được; nếu đội xác nhận đây là lỗi thì đổi thành test bắt bug.
  await expect(page.getByTestId("leave-balance")).toHaveText("Phép năm còn -12/12 ngày");
});
```

Giải thích từng đoạn: `context.clock.setFixedTime` cố định giờ của mọi trang trong context nên việc kiểm "không ở quá khứ" ổn định. `send` là hàm tiện ích để không lặp bốn dòng thao tác. Hai lần gửi dùng khoảng ngày khác nhau để không dính BR-07. Dòng `selectOption("manager")` đổi vai trò ngay trên cùng trang. Dòng assert cuối ghi lại hành vi hiện tại; tên test có `ASSUMP-04` để truy vết về câu hỏi số 4.

## Thử ngay trong lab
Mở `/lab/leave` và lần lượt thử bảng ở Bước 4. Nhớ đặt đồng hồ hợp lý: nếu bạn thử bằng tay, "hôm nay" là ngày thật của máy; các ví dụ ở trên dùng ngày giả nên hãy chọn ngày bắt đầu là hôm nay hoặc sau đó. Sau mỗi thử nghiệm hãy bấm "Reset dữ liệu lab". Đối chiếu với trang `/labs/leave` để xem 7 BR chính thức và 13 test case mẫu (TC-H-001 đến TC-H-013).

## Lỗi thường gặp
- **Triệu chứng**: test viết xong mới bị phản hồi "đúng ra phải khác". **Nguyên nhân**: bắt tay viết test khi chưa rõ quy tắc, tự diễn giải. **Cách sửa**: không viết test cho BR còn dòng "chưa rõ" ở bảng câu hỏi; hỏi trước, hoặc ghi giả định rõ ràng.
- **Triệu chứng**: một test case "vừa kiểm ngày vừa kiểm lý do" fail mà không biết do đâu. **Nguyên nhân**: BR gộp, không nguyên tử. **Cách sửa**: tách BR (BR-02 và BR-01), mỗi test case trỏ về ít BR nhất có thể.
- **Triệu chứng**: bug "số dư âm" lọt đến production dù có 13 test case. **Nguyên nhân**: không ai hỏi "kiểm tra số dư lúc gửi hay lúc duyệt". Quy tắc ngầm (làm tròn, múi giờ, thứ tự kiểm tra, trạng thái trung gian) bị bỏ sót. **Cách sửa**: dùng danh sách câu hỏi mồi ở Bước 4 cho mọi BR.
- **Triệu chứng**: bảng BR của bạn khác bảng của đồng nghiệp dù cùng đọc một tài liệu. **Nguyên nhân**: không có định danh ổn định, hoặc đánh số lại sau khi thêm quy tắc. **Cách sửa**: chỉ thêm ID mới ở cuối (BR-08), không đổi số cũ; ghi phiên bản tài liệu.
- **Triệu chứng**: AC kiểu "hệ thống hoạt động đúng". **Nguyên nhân**: Then không quan sát được. **Cách sửa**: viết Then bằng chữ hoặc con số xuất hiện trên màn hình.

## Tóm tắt
- Phân tích yêu cầu là bước đầu tiên: xác định actor, luồng chính và luồng ngoại lệ.
- Mỗi BR phải nguyên tử, kiểm chứng được và có ID ổn định để truy vết.
- Điểm mơ hồ thường nằm ở biên, làm tròn, thứ tự kiểm tra, trạng thái trung gian và quy tắc ngầm.
- Ứng dụng đang chạy là nguồn quan sát hành vi hiện tại, nhưng chỉ người ra yêu cầu mới xác nhận hành vi đó là đúng.
- Acceptance Criteria Given/When/Then dùng con số cụ thể, sau này trở thành dữ liệu của test case.
- Giả định chưa được xác nhận phải ghi thành văn bản, tốt nhất có một test giữ lại hành vi đã quan sát.

## Bài tập
1. Đọc business rule của LAB-03 ở `/labs/cart` và liệt kê ít nhất 5 điểm còn mơ hồ nếu bạn là người test (gợi ý: thứ tự áp mã giảm giá và VAT, phí ship có chịu VAT không, điều gì xảy ra nếu bớt hàng sau khi đã áp mã). Xong khi: mỗi câu hỏi có cột "quan sát trên lab" bạn tự thử.
2. Viết lại yêu cầu mã giảm giá "SALE10 giảm 10% cho đơn từ 500.000đ, giảm tối đa 100.000đ" thành 3 BR nguyên tử, mỗi BR có AC Given/When/Then với con số cụ thể. Xong khi: người khác đọc xong có thể tự tính được số tiền giảm của đơn 3.200.000đ.
3. Với LAB-01 (`/labs/login`), phân tách BR-03 ("sai 5 lần thì khoá 15 phút") thành các câu hỏi: đếm lần sai theo tài khoản hay theo thiết bị? đăng nhập đúng có reset bộ đếm? Xong khi: bạn có ít nhất 4 câu hỏi và kiểm chứng được ít nhất 2 câu trên `/lab/login`.
4. Viết một test kiểm chứng giả định (như phần Demo) cho một điểm mơ hồ bạn tìm được ở bài tập 1. Xong khi: test xanh trên lab sạch, tên test có `ASSUMP-xx` và BR liên quan.
