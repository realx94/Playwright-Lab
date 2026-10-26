---
title: Phân tích yêu cầu và Business Rule
level: 3
order: 1
minutes: 30
summary: Đọc yêu cầu, tìm actor, luồng, business rule và điểm mơ hồ trước khi viết test case.
keywords: [acceptance criteria là gì, business rule, requirement ambiguity]
---

## Mục tiêu bài học
- Biến một mô tả nghiệp vụ thành danh sách quy tắc có thể kiểm thử.
- Phát hiện điểm mơ hồ và đặt câu hỏi trước khi test.

## Kiến thức cần nắm
- **Actor**: ai dùng chức năng (khách, quản trị, hệ thống)
- **Luồng chính** (happy path) và **luồng ngoại lệ**
- **Business Rule (BR)**: quy tắc nghiệp vụ, đánh số để truy vết (BR-01, BR-02…)
- **Acceptance Criteria**: điều kiện để chấp nhận một chức năng là xong
- Điểm mơ hồ: thiếu giá trị biên, thiếu thông báo lỗi, không nói rõ làm tròn

## Giải thích dễ hiểu
Phân tích yêu cầu giống **đọc hợp đồng trước khi ký**. Bạn gạch chân từng điều khoản (BR), hỏi lại chỗ khó hiểu (“giảm tối đa 100.000đ tính trước hay sau VAT?”), rồi mới đề xuất cách kiểm tra từng điều khoản. Test case viết trên yêu cầu mơ hồ sẽ kiểm tra… sự hiểu nhầm.

## Ví dụ: lab giỏ hàng
Yêu cầu gốc: “Mã SALE10 giảm 10% cho đơn từ 500.000đ, giảm tối đa 100.000đ.”

Phân tách thành quy tắc rõ ràng:

| BR | Nội dung | Câu hỏi cần làm rõ |
|----|----------|--------------------|
| BR-02a | Điều kiện áp dụng: tạm tính ≥ 500.000đ | “≥” hay “>”? Tính trước hay sau giảm giá khác? |
| BR-02b | Mức giảm: 10% của tạm tính | Làm tròn thế nào? |
| BR-02c | Trần giảm: 100.000đ | Trần áp dụng trước hay sau khi tính 10%? |

Danh sách đầy đủ business rule của từng lab nằm ở trang [Lab](/labs). Hãy đọc chúng trước khi làm bài tập.

## Quy trình 5 bước
1. Đọc toàn bộ yêu cầu, xác định actor và mục tiêu.
2. Gạch ra từng quy tắc và đánh số BR.
3. Liệt kê dữ liệu đầu vào, đầu ra, trạng thái.
4. Ghi lại các điểm mơ hồ và hỏi người đưa yêu cầu.
5. Chốt giả định bằng văn bản.

## Lỗi thường gặp
- Bắt tay viết test ngay khi chưa hiểu quy tắc.
- Tự giả định đáp án cho chỗ mơ hồ mà không xác nhận.
- Bỏ sót quy tắc “ngầm” như làm tròn, múi giờ, phân biệt hoa thường.

## Bài tập
1. Đọc business rule của LAB-03 và liệt kê 3 điểm còn mơ hồ nếu bạn là người test.
2. Viết lại yêu cầu mã giảm giá thành các câu có thể đúng/sai rõ ràng.
