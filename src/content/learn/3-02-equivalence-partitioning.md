---
title: Phân vùng tương đương (Equivalence Partitioning)
level: 3
order: 2
minutes: 30
summary: Chia dữ liệu vào các lớp tương đương để giảm số test mà vẫn phủ đủ.
keywords: [equivalence partitioning ví dụ, valid invalid class, test design technique]
---

## Mục tiêu bài học
- Chia miền dữ liệu thành các lớp tương đương hợp lệ và không hợp lệ.
- Chọn giá trị đại diện cho mỗi lớp.

## Kiến thức cần nắm
- Mọi giá trị trong cùng một lớp được hệ thống xử lý **theo cùng một cách**
- Có lớp **hợp lệ** và lớp **không hợp lệ**; cả hai đều phải test
- Mỗi lớp chỉ cần **ít nhất một** giá trị đại diện
- Áp dụng cho số, chuỗi, ngày, lựa chọn, tệp, vai trò…

## Giải thích dễ hiểu
Hãy tưởng tượng một **cổng soát vé theo độ tuổi**: trẻ dưới 18 không vào, từ 18 đến 65 được vào, trên 65 được giảm giá. Bạn không cần thử mọi tuổi từ 0 đến 120; cứ thử một người đại diện trong mỗi nhóm (10, 30, 70). Nếu một tuổi trong nhóm chạy đúng thì các tuổi còn lại trong nhóm gần như chắc chắn cũng đúng.

## Ví dụ: trường Tuổi ở LAB-02 (18–65)
| Lớp | Miền giá trị | Hợp lệ? | Đại diện |
|-----|--------------|---------|----------|
| EC1 | < 18 | Không | 10 |
| EC2 | 18 – 65 | Có | 30 |
| EC3 | > 65 | Không | 80 |
| EC4 | Không phải số nguyên | Không | 20.5, "abc" |
| EC5 | Rỗng | Không | (bỏ trống) |

Chỉ 5 giá trị phủ toàn bộ các nhóm hành vi. Muốn kiểm tra đúng ranh giới giữa các nhóm thì kết hợp với bài tiếp theo (giá trị biên).

## Ví dụ dạng lựa chọn: tệp đính kèm (png/jpg/pdf, ≤ 2MB)
- Lớp hợp lệ: định dạng đúng và dung lượng nhỏ hơn 2MB.
- Lớp không hợp lệ: định dạng sai (exe), dung lượng quá lớn, tệp rỗng.

## Cách làm
1. Liệt kê mọi trường dữ liệu đầu vào.
2. Với mỗi trường, chia thành lớp hợp lệ và không hợp lệ.
3. Chọn một đại diện cho mỗi lớp.
4. Khi kết hợp nhiều trường, mỗi test chỉ để **một** trường không hợp lệ để biết lỗi do đâu.

## Lỗi thường gặp
- Chỉ test lớp hợp lệ.
- Gộp nhiều lỗi vào một test nên không biết trường nào gây lỗi.
- Chia lớp theo cảm tính mà không dựa vào quy tắc nghiệp vụ.

## Bài tập
1. Chia lớp tương đương cho trường mật khẩu của LAB-01 (8–32 ký tự, có hoa/thường/số/ký tự đặc biệt).
2. Viết test Playwright data-driven chạy từng đại diện của trường Tuổi.
