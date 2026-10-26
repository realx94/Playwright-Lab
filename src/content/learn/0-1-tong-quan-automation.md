---
title: Tổng quan Automation Testing
level: 0
order: 1
minutes: 15
summary: Hiểu automation là gì, khi nào nên và không nên automate.
keywords: [test automation pyramid, flaky test, regression testing]
---

## Mục tiêu bài học
- Phân biệt manual và automation testing.
- Biết khi nào nên automate.

## Kiến thức cần nắm
- Manual vs Automation
- Test pyramid (unit → API → UI)
- Regression test và ROI của automation
- Flaky test là gì

## Giải thích dễ hiểu
Hãy tưởng tượng bạn kiểm tra 100 cửa sổ trong toà nhà mỗi tuần. Đi từng cửa là **manual**. Gắn cảm biến tự báo cửa nào mở là **automation**. Cảm biến tốn công lắp ban đầu, nhưng chạy lại hàng ngày gần như miễn phí.

> Mẹo: **bôi đen** bất kỳ thuật ngữ nào trong bài để hỏi Google AI giải thích.

## Khi nào nên automate
| Nên | Không nên |
|-----|-----------|
| Test lặp lại nhiều lần (regression) | Chức năng đang thay đổi liên tục |
| Test ổn định, quan trọng (smoke) | Test chỉ chạy một lần |
| Cần chạy nhiều dữ liệu / trình duyệt | Cần đánh giá cảm quan (đẹp/xấu) |

## Lỗi thường gặp
- Automate tất cả mọi thứ ở tầng UI → chậm và dễ flaky.
- Dùng `sleep` cố định thay vì chờ điều kiện.

## Bài tập
1. Liệt kê 5 test case của chức năng đăng nhập; chọn 3 test nên automate và giải thích vì sao.
