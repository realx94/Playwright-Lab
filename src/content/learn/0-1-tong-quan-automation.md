---
title: Tổng quan Automation Testing
level: 0
order: 1
minutes: 30
summary: Hiểu automation là gì, khi nào nên và không nên automate, test pyramid, ROI và flaky test, rồi thực hành chấm điểm một danh sách test case.
keywords: [test automation pyramid, flaky test, regression testing]
---

## Mục tiêu bài học
- Phân biệt được manual testing và automation testing, nêu được ưu và nhược của từng cách.
- Giải thích được test pyramid (unit, API, UI) và vì sao không nên dồn hết test lên tầng UI.
- Tự chấm điểm một test case để quyết định "nên automate" hay "để manual" theo bảng tiêu chí.
- Tính được một ước lượng ROI đơn giản của automation bằng số liệu cụ thể.
- Nhận ra flaky test và biết nguyên nhân phổ biến nhất (chờ cố định bằng `sleep`).

## Bạn cần chuẩn bị
Bài này chưa cần cài gì. Bạn chỉ cần một tờ giấy hoặc một file ghi chú để làm các bài thực hành, và có thể mở sẵn trang `/lab/login` của site để xem một chức năng đăng nhập thật. Nếu bạn đã từng test thủ công một trang web, bài này sẽ rất quen thuộc; nếu chưa, đừng lo, mọi khái niệm đều được giải thích từ đầu.

## Kiến thức cần nắm
- Manual testing và automation testing khác nhau ở **ai thực hiện** các bước kiểm tra (người hay chương trình).
- Regression test: chạy lại các test cũ để chắc chắn tính năng đã chạy tốt không bị hỏng bởi thay đổi mới.
- Test pyramid: nhiều test nhỏ và nhanh ở dưới (unit), vừa phải ở giữa (API), ít test chậm ở trên cùng (UI end-to-end).
- ROI (Return On Investment, lợi tức đầu tư): automation tốn công viết lúc đầu, có lãi khi chạy lại nhiều lần.
- Flaky test: test lúc xanh lúc đỏ dù code không đổi.

## Giải thích dễ hiểu

### Ví dụ đời thường: kiểm tra cửa sổ toà nhà
Hãy tưởng tượng bạn quản lý một toà nhà có 100 cửa sổ và mỗi tối phải chắc chắn tất cả đã đóng. Đi từng cửa kiểm tra bằng tay là **manual testing** (kiểm thử thủ công). Lắp cảm biến trên mỗi cửa để chúng tự báo cửa nào còn mở là **automation testing** (kiểm thử tự động). Cảm biến tốn công và tiền lắp ban đầu, nhưng sau đó chạy mỗi ngày gần như miễn phí và không bao giờ "quên" cửa số 73. Ngược lại, nếu toà nhà chỉ có 2 cửa và bạn chỉ kiểm tra một lần, lắp cảm biến là lãng phí.

Phần mềm cũng vậy. Mỗi lần developer sửa code, mọi chức năng cũ đều có thể bị hỏng ngầm. Việc chạy lại toàn bộ kịch bản cũ gọi là **regression testing** (kiểm thử hồi quy). Nếu có 300 kịch bản và mỗi tuần phát hành hai lần, tester thủ công sẽ kiệt sức; còn một bộ test tự động chạy xong trong vài phút.

### Manual và automation: không phải đối thủ
| Tiêu chí | Manual | Automation |
|----------|--------|------------|
| Chi phí ban đầu | Thấp (chỉ cần người test) | Cao (viết, bảo trì script) |
| Chi phí mỗi lần chạy lại | Cao (mất thời gian của người) | Rất thấp |
| Phù hợp | Khám phá lỗi mới, đánh giá giao diện đẹp hay xấu, trải nghiệm người dùng | Regression, smoke, nhiều tổ hợp dữ liệu, nhiều trình duyệt |
| Điểm yếu | Dễ bỏ sót khi lặp lại nhàm chán | Chỉ phát hiện điều đã được viết vào script, mong manh nếu giao diện đổi liên tục |

Kết luận quan trọng: automation **không thay thế** tester, nó giải phóng tester khỏi việc lặp lại để dành thời gian cho việc cần tư duy, như thiết kế test case và khám phá lỗi.

### Test pyramid
**Test pyramid** (kim tự tháp kiểm thử) mô tả tỉ lệ test nên có ở mỗi tầng:

```text
        /\          UI end-to-end   (ít, chậm, dễ flaky)
       /--\
      /    \        API / tích hợp  (vừa phải)
     /------\
    /        \      Unit test       (nhiều, rất nhanh, ổn định)
   /----------\
```

- **Unit test**: kiểm tra một hàm nhỏ riêng lẻ, chạy trong mili giây, thường do developer viết.
- **API test**: gọi thẳng vào máy chủ qua HTTP, không cần mở trình duyệt, nhanh và ổn định hơn UI.
- **UI end-to-end (E2E)**: điều khiển trình duyệt như người dùng thật. Đây là nơi Playwright toả sáng, nhưng cũng là tầng chậm và dễ hỏng nhất vì phụ thuộc giao diện, mạng, thời gian tải.

Nếu bạn automate mọi thứ ở tầng UI, bộ test sẽ chạy hàng giờ và hay đỏ vì lý do không liên quan đến lỗi thật. Quy tắc thực dụng: kiểm tra logic nghiệp vụ ở tầng thấp nhất có thể, chỉ dùng UI cho các luồng quan trọng đi xuyên suốt (đăng nhập, đặt hàng, thanh toán).

### ROI của automation
Công thức ước lượng đơn giản:

```text
Tổng chi phí manual     = số lần chạy x thời gian chạy tay
Tổng chi phí automation = thời gian viết + thời gian bảo trì + số lần chạy x thời gian chạy máy (gần 0)
```

Ví dụ: một kịch bản đăng nhập mất 3 phút để test tay. Viết script tự động mất 45 phút. Bạn chạy lại 2 lần mỗi ngày trong 60 ngày làm việc, tức 120 lần. Manual tốn 120 x 3 = 360 phút. Automation tốn khoảng 45 phút viết cộng 30 phút bảo trì, tức 75 phút. Lợi ích rõ ràng. Nhưng nếu chức năng chỉ chạy 5 lần rồi bị bỏ, manual tốn 15 phút, automation vẫn tốn 75 phút: không đáng.

### Flaky test là gì
**Flaky test** là test có kết quả không ổn định: chạy 10 lần thì 8 lần xanh, 2 lần đỏ, trong khi code không đổi. Flaky test nguy hiểm vì đội dần mất niềm tin vào test ("lại đỏ à, chạy lại đi") và bỏ qua cả những lần đỏ vì lỗi thật. Nguyên nhân hay gặp nhất là **chờ cố định**: bấm nút rồi `sleep(2000)` hy vọng trang đã tải xong. Máy chậm thì 2 giây không đủ, máy nhanh thì lãng phí. Playwright giải quyết bằng cơ chế auto-waiting (tự chờ phần tử sẵn sàng), bạn sẽ học ở các bài sau.

> Mẹo: **bôi đen** bất kỳ thuật ngữ nào trong bài để hỏi Google AI giải thích.

```diagram
pyramid
```

## Thực hành từng bước
Bài này không có lệnh để gõ. Thay vào đó bạn sẽ làm một bài phân tích có số liệu cụ thể, rất giống việc bạn sẽ làm ở công ty khi được hỏi "test nào nên automate?".

### Bước 1. Liệt kê test case của một chức năng
Mục đích: có nguyên liệu để phân tích. Chọn chức năng **Đăng nhập** (bạn có thể xem thật ở `/lab/login`) và ghi ra 8 test case:

| Mã | Test case | Chạy bao nhiêu lần mỗi tháng (ước lượng) |
|----|-----------|-------------------------------------------|
| TC1 | Đăng nhập đúng email và mật khẩu, vào được trang chính | 40 |
| TC2 | Mật khẩu sai, báo lỗi | 40 |
| TC3 | Mật khẩu 7 ký tự, báo "tối thiểu 8 ký tự" | 40 |
| TC4 | Mật khẩu 8 ký tự, được chấp nhận | 40 |
| TC5 | Sai 5 lần liên tiếp, tài khoản bị khoá | 40 |
| TC6 | Nút Đăng nhập có màu và khoảng cách đẹp mắt | 2 |
| TC7 | Chữ trên form có dễ đọc với người lớn tuổi | 1 |
| TC8 | Thử nhập email có ký tự lạ để tìm lỗi chưa ai nghĩ tới (exploratory) | 4 |

Kết quả mong đợi: bạn có bảng 8 dòng. Cột "chạy bao nhiêu lần" cho biết test nào lặp lại nhiều.

### Bước 2. Chấm điểm theo bốn tiêu chí
Mục đích: biến cảm tính thành con số. Với mỗi test case, chấm 0 hoặc 1 điểm cho từng tiêu chí:

| Tiêu chí | Cho 1 điểm khi |
|----------|----------------|
| Lặp lại | Chạy từ 10 lần mỗi tháng trở lên |
| Ổn định | Kết quả mong đợi rõ ràng, ít thay đổi theo giao diện |
| Khách quan | Máy có thể xác định đúng sai bằng điều kiện cụ thể (chữ hiện ra, trang chuyển hướng) |
| Quan trọng | Hỏng thì ảnh hưởng lớn tới người dùng hoặc doanh thu |

Chấm mẫu cho TC1 (đăng nhập đúng): lặp lại 1, ổn định 1, khách quan 1, quan trọng 1, tổng 4. TC6 (màu nút đẹp): lặp lại 0, ổn định 0, khách quan 0, quan trọng 0, tổng 0. Hãy tự chấm các dòng còn lại.

Kết quả mong đợi: TC1 đến TC5 đều gần 3 đến 4 điểm, TC6 và TC7 thấp, TC8 thấp ở tiêu chí khách quan vì cần trí tưởng tượng của người.

### Bước 3. Quyết định và đặt vào đúng tầng
Mục đích: ra quyết định có lý do. Quy ước: từ 3 điểm trở lên thì nên automate, dưới 3 thì để manual hoặc exploratory. Sau đó hỏi thêm: test này có thể kiểm tra ở tầng thấp hơn không? Ví dụ TC3 và TC4 là kiểm tra biên 7 và 8 ký tự, thực chất là kiểm tra một hàm validate mật khẩu, có thể là unit test; nhưng trong dự án chưa có unit test, bạn vẫn có thể giữ ở UI với dữ liệu khác nhau.

Kết quả mong đợi: bạn có danh sách như "TC1, TC2, TC3, TC4, TC5: automate; TC6, TC7: manual; TC8: manual exploratory", kèm một câu lý do cho mỗi dòng.

### Bước 4. Ước lượng ROI cho TC1
Mục đích: biết khi nào việc đầu tư có lãi. Giả sử test tay TC1 mất 2 phút, viết script mất 30 phút, bảo trì 20 phút mỗi quý. Số lần chạy trong 6 tháng là 40 x 6 = 240.

```text
Manual     = 240 x 2 phút        = 480 phút
Automation = 30 + 2 x 20 phút    = 70 phút (chạy máy coi như 0)
Tiết kiệm  = 480 - 70            = 410 phút, khoảng 6,8 giờ
```

Kết quả mong đợi: bạn thấy rõ automation có lãi sau khoảng 15 lần chạy (30 chia 2). Con số này gọi là điểm hoà vốn (break-even).

## Khi nào nên automate
| Nên | Không nên |
|-----|-----------|
| Test lặp lại nhiều lần (regression) | Chức năng đang thay đổi liên tục |
| Test ổn định, quan trọng (smoke) | Test chỉ chạy một lần |
| Cần chạy nhiều dữ liệu hoặc nhiều trình duyệt | Cần đánh giá cảm quan (đẹp hay xấu) |
| Các bước dài, dễ nhầm khi làm tay | Môi trường chưa ổn định, thường xuyên lỗi hạ tầng |

**Smoke test** là bộ test nhỏ, chạy nhanh để chắc chắn bản build "còn sống" (mở được trang, đăng nhập được) trước khi test sâu hơn.

## Thử ngay trong lab
Mở `/lab/login` và tự test tay các test case TC1 đến TC5 ở Bước 1. Quan sát: bạn mất bao lâu cho cả năm case? Bây giờ nhân thời gian đó với số lần phải chạy lại mỗi tuần để cảm nhận vì sao automation đáng giá. Sau đó thử thêm `?bugs=BUG-01` vào cuối đường dẫn để bật một lỗi cài sẵn (mật khẩu 7 ký tự vẫn được chấp nhận) và xem bạn có phát hiện bằng mắt không. Đây là mục đích của lab: bạn viết test tự động để bắt đúng lỗi này.

## Lỗi thường gặp
- **Automate tất cả mọi thứ ở tầng UI.** Triệu chứng: bộ test chạy 2 giờ, hay đỏ ngẫu nhiên. Nguyên nhân: UI chậm và nhiều yếu tố ngoài tầm kiểm soát. Cách sửa: đẩy kiểm tra logic xuống tầng API hoặc unit, UI chỉ giữ luồng quan trọng.
- **Dùng `sleep` cố định thay vì chờ điều kiện.** Triệu chứng: test xanh trên máy bạn nhưng đỏ trên máy chủ CI chậm hơn. Nguyên nhân: thời gian chờ cứng không phản ánh tình trạng thật. Cách sửa: chờ một điều kiện cụ thể (phần tử hiện ra, trang chuyển hướng), Playwright hỗ trợ sẵn.
- **Automate chức năng còn đang thiết kế.** Triệu chứng: mỗi sprint phải sửa lại cả loạt script. Nguyên nhân: giao diện chưa ổn định. Cách sửa: chờ chức năng ổn định, trước đó test tay.
- **Không bảo trì test.** Triệu chứng: test đỏ kéo dài, ai cũng bỏ qua. Nguyên nhân: coi script như viết một lần là xong. Cách sửa: coi test là code, có review, sửa ngay khi đỏ, xoá test không còn giá trị.
- **Kỳ vọng automation tìm được mọi lỗi.** Triệu chứng: ra bản mới vẫn dính lỗi bố cục. Nguyên nhân: script chỉ kiểm tra điều bạn viết ra. Cách sửa: kết hợp exploratory testing.

## Tóm tắt
- Manual mạnh ở khám phá và cảm quan; automation mạnh ở lặp lại và quy mô.
- Test pyramid: nhiều test thấp tầng, ít test UI.
- Quyết định automate dựa trên bốn tiêu chí: lặp lại, ổn định, khách quan, quan trọng.
- ROI có điểm hoà vốn: tính trước khi đầu tư.
- Flaky test phá niềm tin; tránh chờ cố định, hãy chờ điều kiện.

## Bài tập
1. Liệt kê 5 test case của chức năng đăng nhập, chọn 3 test nên automate và giải thích vì sao bằng bốn tiêu chí. Xong khi: mỗi lựa chọn có điểm số cụ thể cho từng tiêu chí.
2. Với test case bạn chọn ở bài 1, ước lượng ROI: giả định thời gian test tay, thời gian viết, số lần chạy mỗi tháng. Xong khi: bạn tìm được điểm hoà vốn (số lần chạy để automation bắt đầu có lãi).
3. Lấy một chức năng khác (giỏ hàng ở `/lab/cart`), liệt kê 6 test case và phân vào ba nhóm: unit, API, UI. Xong khi: mỗi test có một câu giải thích vì sao đặt ở tầng đó.
4. Nêu một ví dụ flaky test do `sleep` cố định và mô tả cách bạn sẽ chuyển sang chờ theo điều kiện. Xong khi: bạn nói rõ điều kiện chờ cụ thể (ví dụ "chờ dòng chữ Đăng nhập thành công xuất hiện").
