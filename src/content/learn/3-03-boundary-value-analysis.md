---
title: Phân tích giá trị biên (BVA)
level: 3
order: 3
minutes: 30
summary: Kiểm tra tại và sát ranh giới của các lớp tương đương, nơi lỗi hay xuất hiện nhất.
keywords: [boundary value analysis, off-by-one error, 3-value boundary]
---

## Mục tiêu bài học
- Xác định đúng giá trị biên và các giá trị cần kiểm tra quanh biên.
- Áp dụng cho số, độ dài chuỗi, thời gian, số tiền.

## Kiến thức cần nắm
- Lỗi lập trình hay nằm ở **ranh giới** (dùng `>` thay vì `>=`)
- **BVA 2 giá trị**: giá trị biên và giá trị ngay sát bên ngoài
- **BVA 3 giá trị**: giá trị ngay trong, đúng tại và ngay ngoài biên
- Biên áp dụng cho: giá trị số, độ dài, số lượng, ngày giờ, dung lượng tệp
- Đi đôi với Equivalence Partitioning (bài trước)

## Giải thích dễ hiểu
Trên con đường có biển “tốc độ tối đa 60 km/h”, cảnh sát không bắt ai chạy 30 km/h. Họ chú ý người chạy **59, 60 và 61**. Chỗ chuyển từ được phép sang bị phạt mới là chỗ dễ sai trong cả code lẫn cách người ta hiểu luật.

## Ví dụ 1: tuổi hợp lệ 18–65
Biên dưới 18, biên trên 65:

| Giá trị | Kỳ vọng | Vai trò |
|---------|---------|---------|
| 17 | Từ chối | Ngay ngoài biên dưới |
| 18 | Chấp nhận | Đúng biên dưới |
| 19 | Chấp nhận | Ngay trong biên dưới |
| 64 | Chấp nhận | Ngay trong biên trên |
| 65 | Chấp nhận | Đúng biên trên |
| 66 | Từ chối | Ngay ngoài biên trên |

## Ví dụ 2: mã SALE10 ở LAB-03
Điều kiện: tạm tính ≥ 500.000đ.
- 499.999đ → từ chối; 500.000đ → áp dụng; 500.001đ → áp dụng.

Trần giảm 100.000đ: tạm tính 1.000.000đ cho giảm đúng 100.000đ; 1.000.001đ vẫn giảm 100.000đ (vì 10% đã vượt trần); 999.999đ giảm 99.999,9 làm tròn theo quy tắc nghiệp vụ.

## Bẫy khi test biên
- Quên **biên của phép làm tròn** (VAT 8% ra số lẻ).
- Biên của độ dài chuỗi tính theo **ký tự**, không phải byte (tiếng Việt có dấu).
- Biên thời gian phụ thuộc múi giờ (xem các lab về thời gian).

## Lỗi thường gặp
- Chỉ test giá trị ở giữa mỗi lớp.
- Chọn biên theo cảm giác thay vì theo quy tắc ghi trong BR.
- Quên biên của **số lượng** (ví dụ giỏ hàng tối đa 10 sản phẩm: test 10 và 11).

## Bài tập
1. Viết bảng giá trị biên cho độ dài mật khẩu 8–32 ký tự ở LAB-01.
2. Viết test Playwright cho biên tuổi ở LAB-02 bằng một mảng dữ liệu.
