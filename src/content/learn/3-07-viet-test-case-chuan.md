---
title: Viết test case chuẩn
level: 3
order: 7
minutes: 30
summary: Cấu trúc một test case tốt, đặt tên, ưu tiên, truy vết với business rule.
keywords: [test case template, traceability matrix, test case priority]
---

## Mục tiêu bài học
- Viết test case rõ ràng, ai đọc cũng chạy được.
- Gắn test case với business rule để biết độ phủ.

## Kiến thức cần nắm
- Thành phần: ID, tiêu đề, tiền điều kiện, các bước, dữ liệu, kết quả mong đợi, loại, ưu tiên, BR liên quan
- Một test case kiểm tra **một ý** và có kết quả **đúng/sai** rõ ràng
- Loại: Happy, Negative, BVA, EP, State, Decision, Security
- Ưu tiên: P0 (bắt buộc), P1 (quan trọng), P2 (nên có)
- **Ma trận truy vết** (traceability): BR × TC để thấy quy tắc nào chưa được phủ

## Giải thích dễ hiểu
Test case giống **công thức nấu ăn**: người khác đọc xong phải nấu ra đúng món, kể cả khi họ chưa từng thấy món đó. Công thức tồi ghi “nấu thịt cho ngon”; công thức tốt ghi rõ nguyên liệu, lửa mấy phút và món thành công trông thế nào.

## Ví dụ tốt và dở
| | Dở | Tốt |
|---|----|-----|
| Tiêu đề | Test mật khẩu | Mật khẩu 7 ký tự bị từ chối (biên dưới) |
| Bước | Nhập mật khẩu sai | 1. Mở /lab/login 2. Nhập email hợp lệ 3. Nhập `Pass0r!` 4. Bấm Đăng nhập |
| Mong đợi | Báo lỗi | Hiện “Mật khẩu tối thiểu 8 ký tự” dưới ô mật khẩu; không vào dashboard |
| BR | — | BR-02 |

## Mẫu test case
| ID | Tiêu đề | Tiền điều kiện | Bước | Dữ liệu | Kết quả mong đợi | Loại | Ưu tiên | BR |
|----|---------|----------------|------|---------|-------------------|------|---------|----|
| TC-L-003 | Mật khẩu 7 ký tự | Ở trang login | Nhập mật khẩu, bấm Đăng nhập | Pass0r! | Báo tối thiểu 8 ký tự | BVA | P0 | BR-02 |

Mỗi lab trong site đều có bảng test case mẫu (ẩn đáp án trước) và ma trận BR × TC. Hãy tự viết trước rồi mới so sánh.

## Quy tắc đặt tên và viết
- Tiêu đề nêu **điều kiện + kết quả**.
- Dữ liệu cụ thể, không viết “dữ liệu hợp lệ”.
- Kết quả mong đợi **quan sát được** (thông báo, trạng thái, số tiền), không viết “hệ thống hoạt động đúng”.
- Không phụ thuộc test case khác.

## Lỗi thường gặp
- Một test case kiểm tra nhiều ý nên khi fail không biết do đâu.
- Kết quả mong đợi mơ hồ.
- Không gắn BR nên không đo được độ phủ.

## Bài tập
1. Viết 8 test case cho LAB-01 theo mẫu, rồi mở bảng mẫu của site để đối chiếu.
2. Lập ma trận BR × TC và chỉ ra BR nào còn thiếu test.
