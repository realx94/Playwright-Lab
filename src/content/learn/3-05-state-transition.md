---
title: Chuyển trạng thái (State Transition)
level: 3
order: 5
minutes: 30
summary: Mô hình hoá vòng đời đối tượng bằng trạng thái và sự kiện, test cả chuyển đổi không hợp lệ.
keywords: [state transition testing, state diagram, invalid transition]
---

## Mục tiêu bài học
- Vẽ sơ đồ trạng thái cho một đối tượng nghiệp vụ.
- Suy ra test cho chuyển đổi hợp lệ và không hợp lệ.

## Kiến thức cần nắm
- **Trạng thái** (state), **sự kiện** (event), **chuyển đổi** (transition), **điều kiện bảo vệ** (guard)
- **Bảng chuyển trạng thái** liệt kê (trạng thái, sự kiện) → trạng thái mới hoặc “không cho phép”
- Độ phủ: mọi trạng thái, mọi chuyển đổi hợp lệ, **chuyển đổi không hợp lệ**
- Phù hợp: đơn hàng, tài khoản, phiếu hỗ trợ, đơn nghỉ phép, khoá tài khoản

## Giải thích dễ hiểu
Một **bóng đèn có công tắc**: tắt → bật → tắt. Nhưng đèn quạt trần có nhiều mức: tắt → nhỏ → vừa → lớn → tắt. Bạn muốn biết: bấm nút lúc đang “lớn” thì chuyển về đâu? Có thể bấm nút “vừa” khi đang “tắt” không? Test chuyển trạng thái là hỏi mọi câu như thế.

## Ví dụ: vòng đời đơn hàng LAB-03
```text
Mới ──thanh toán──▶ Đã thanh toán ──giao hàng──▶ Đang giao ──hoàn tất──▶ Hoàn tất
 │                        │
 └────huỷ────▶ Đã huỷ ◀───┘         (không huỷ được khi đã giao)
```

Bảng chuyển trạng thái (✔ hợp lệ, ✘ không cho phép):

| Trạng thái hiện tại | Thanh toán | Giao hàng | Hoàn tất | Huỷ |
|--------------------|-----------|-----------|----------|-----|
| Mới | ✔ → Đã thanh toán | ✘ | ✘ | ✔ → Đã huỷ |
| Đã thanh toán | ✘ | ✔ → Đang giao | ✘ | ✔ → Đã huỷ |
| Đang giao | ✘ | ✘ | ✔ → Hoàn tất | **✘** |
| Hoàn tất | ✘ | ✘ | ✘ | ✘ |
| Đã huỷ | ✘ | ✘ | ✘ | ✘ |

Các ô ✘ là những test **dễ bị bỏ sót nhất** và cũng hay chứa bug (xem BUG-03 ở LAB-03: cho huỷ khi đang giao).

## Cách làm
1. Liệt kê trạng thái và sự kiện từ business rule.
2. Điền bảng, đặc biệt các ô “không cho phép”.
3. Viết test cho từng chuyển đổi hợp lệ và một số chuyển đổi không hợp lệ quan trọng.
4. Thêm test chuỗi chuyển đổi dài (đi hết vòng đời).

## Lỗi thường gặp
- Chỉ test đường đi thuận (happy path).
- Quên trạng thái cuối (không thể thay đổi nữa).
- Không kiểm tra trạng thái được lưu lại sau khi tải lại trang.

## Bài tập
1. Lập bảng chuyển trạng thái cho khoá tài khoản ở LAB-01 (bình thường, bị khoá, mở khoá sau 15 phút).
2. Viết test Playwright khẳng định nút Huỷ đơn biến mất khi đơn đang giao.
