---
title: Chọn test nào để automate
level: 3
order: 9
minutes: 25
summary: Tiêu chí chọn test đáng automate, phân loại smoke, sanity, regression và tính ROI.
keywords: [regression vs smoke vs sanity, automation roi, test automation strategy]
---

## Mục tiêu bài học
- Quyết định test nào nên automate và ở tầng nào.
- Phân biệt smoke, sanity, regression.

## Kiến thức cần nắm
- Tiêu chí nên automate: **lặp lại nhiều**, **ổn định**, **rủi ro cao**, **nhiều dữ liệu**, **kết quả rõ ràng**
- Không nên: thay đổi liên tục, chạy một lần, cần đánh giá cảm quan, rất tốn công để ổn định
- **Smoke**: kiểm tra nhanh chức năng sống còn sau mỗi bản build
- **Sanity**: kiểm tra tập trung sau một thay đổi nhỏ
- **Regression**: rà soát rộng để chắc thay đổi không phá chức năng cũ
- Chọn tầng: unit / API / UI (xem test pyramid)

## Giải thích dễ hiểu
Bạn có 100 việc nhà. Việc **lặp đi lặp lại** (rửa chén mỗi ngày) rất đáng mua máy rửa chén. Việc **làm một lần** (dọn nhà mới chuyển) thì tự làm cho nhanh. Automation là cái máy: tốn tiền mua nhưng lời khi dùng nhiều.

## Bảng chấm điểm đơn giản
Cho mỗi test case, chấm 1–3 điểm:

| Tiêu chí | 1 | 3 |
|----------|---|---|
| Tần suất chạy | Hiếm | Mỗi bản build |
| Độ ổn định của chức năng | Đổi liên tục | Ổn định |
| Rủi ro nếu hỏng | Thấp | Cao (tiền, dữ liệu, đăng nhập) |
| Chi phí viết/bảo trì | Cao | Thấp |

Tổng ≥ 9: nên automate; 6–8: cân nhắc; < 6: để thủ công.

## Áp dụng cho lab
- **Smoke** (P0): đăng nhập hợp lệ, thêm giỏ + tính tổng, gửi form hợp lệ.
- **Regression**: toàn bộ biên tuổi, các luật ship/giảm giá, vòng đời đơn.
- **Không nên automate** (giai đoạn này): đánh giá bố cục có đẹp hay không.

## Chọn đúng tầng
Công thức tính tiền nên test ở unit/API (nhanh, ít vỡ), UI chỉ giữ vài luồng quan trọng đi từ đầu đến cuối.

## Lỗi thường gặp
- Cố automate 100% nên bảo trì nhiều hơn lợi ích.
- Automate khi chức năng chưa ổn định.
- Giữ mọi kiểm tra ở tầng UI.

## Bài tập
1. Chấm điểm 10 test case của LAB-03 bằng bảng trên và chọn tập smoke.
2. Với mỗi test trong tập smoke, đề xuất tầng phù hợp (unit/API/UI).
