---
title: Bảng quyết định (Decision Table)
level: 3
order: 4
minutes: 30
summary: Dùng bảng điều kiện – hành động để kiểm tra các quy tắc có nhiều điều kiện kết hợp.
keywords: [decision table testing, rule combination, condition action table]
---

## Mục tiêu bài học
- Lập bảng quyết định cho quy tắc nghiệp vụ nhiều điều kiện.
- Rút gọn bảng và suy ra test case.

## Kiến thức cần nắm
- Cột = các **luật** (rule); hàng trên = **điều kiện**; hàng dưới = **hành động/kết quả**
- Với n điều kiện đúng/sai có tối đa 2ⁿ luật
- **Rút gọn**: gộp các luật cho cùng kết quả khi một điều kiện không ảnh hưởng (ký hiệu “–”)
- Mỗi luật là một test case

## Giải thích dễ hiểu
Quyết định “có mang ô không” phụ thuộc: trời mưa? có gió lớn? có xe? Thay vì nghĩ rời rạc, bạn **vẽ bảng mọi tổ hợp** và ghi quyết định cho từng cột. Bảng giúp bạn không bỏ sót tổ hợp lạ, ví dụ “mưa + gió lớn + có xe”.

## Ví dụ: phí ship và giảm giá ở LAB-03
Điều kiện:
- C1: Có áp mã SALE10 hợp lệ (đơn ≥ 500.000đ)
- C2: Tạm tính sau giảm ≥ 1.000.000đ

| | R1 | R2 | R3 | R4 |
|---|----|----|----|----|
| C1: Có mã hợp lệ | Có | Có | Không | Không |
| C2: Sau giảm ≥ 1.000.000đ | Có | Không | Có | Không |
| **Giảm giá** | 10% (≤ 100k) | 10% (≤ 100k) | 0 | 0 |
| **Phí ship** | 0 | 30.000đ | 0 | 30.000đ |

Từ 4 luật này ta suy ra 4 test case. Chú ý các luật gần ngưỡng: giỏ 1.050.000đ + mã SALE10 giảm 100.000 còn 950.000 → vẫn **tính phí ship** (R2), đây là chỗ dễ nhầm.

## Cách làm
1. Liệt kê điều kiện và hành động từ business rule.
2. Lập đầy đủ các tổ hợp.
3. Điền kết quả từ tài liệu (không phải từ ứng dụng).
4. Rút gọn luật trùng kết quả.
5. Mỗi luật còn lại thành một test case, tính thêm biên nếu cần.

## Lỗi thường gặp
- Điền kết quả bằng cách quan sát ứng dụng nên bug bị coi là đúng.
- Thiếu tổ hợp vì chỉ liệt kê những trường hợp “nghĩ ra”.
- Không rút gọn nên số test quá lớn.

## Bài tập
1. Lập bảng quyết định cho quy tắc huỷ đơn (trạng thái đơn × vai trò) của LAB-03.
2. Viết test data-driven kiểm tra bốn luật ship/giảm giá ở trên.
