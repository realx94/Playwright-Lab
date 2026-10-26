---
title: Flaky test và độ ổn định
level: 5
order: 6
minutes: 30
summary: Nguyên nhân phổ biến của test chập chờn, cách chẩn đoán có hệ thống và cách phòng ngừa.
keywords: [cách giảm flaky test, race condition là gì, test isolation]
---

## Mục tiêu bài học
- Phân loại nguyên nhân flaky.
- Có quy trình chẩn đoán thay vì đoán mò.

## Kiến thức cần nắm
- **Flaky test**: cùng code, cùng test nhưng lúc xanh lúc đỏ
- Nhóm nguyên nhân: **thời gian** (chờ cố định, race condition), **dữ liệu** (dùng chung, phụ thuộc thứ tự), **môi trường** (mạng, tài nguyên, múi giờ), **locator** (khớp nhiều, thay đổi theo trạng thái), **ứng dụng** (bug thật ngẫu nhiên)
- Công cụ: trace, `--repeat-each`, `--retries`, `--workers=1`
- Flaky luôn tốn kém: mất niềm tin vào bộ test, bị bỏ qua khi đỏ thật

## Giải thích dễ hiểu
Flaky test giống **cân bị lệch**: lúc cân đúng lúc sai. Nếu cân không đáng tin thì không ai còn tin cân nữa. Vì vậy bạn không chỉ “thử lại cho xanh” mà cần tìm **vì sao cân lệch**.

## Quy trình chẩn đoán
1. **Tái lập**: chạy lặp nhiều lần để thấy tỉ lệ lỗi.

```bash
npx playwright test login --repeat-each=30 --workers=1
```

2. **Cô lập**: chạy một mình, rồi chạy cùng nhóm, rồi song song; xem lỗi xuất hiện khi nào.
3. **Xem trace** của lần đỏ: phần tử có xuất hiện chưa, API có trả chậm không?
4. **Phân loại** theo bảng dưới rồi sửa gốc rễ.

| Triệu chứng | Nguyên nhân thường gặp | Cách sửa |
|-------------|------------------------|----------|
| Đỏ khi chạy song song, xanh khi chạy một mình | Dữ liệu dùng chung | Dữ liệu độc lập cho từng test |
| Đỏ ngẫu nhiên “element not found” | Chờ cố định / race | Chờ điều kiện, web-first assertion |
| Đỏ trên CI, xanh ở máy | Khác môi trường (font, tốc độ, múi giờ) | Cố định môi trường, tăng timeout cục bộ có lý do |
| Đỏ sau test khác | Phụ thuộc thứ tự, trạng thái còn sót | Reset trong `beforeEach` |

## Phòng ngừa
- Không dùng `waitForTimeout`; dùng assertion tự thử lại.
- Locator hướng người dùng, tránh `nth()` và CSS mong manh.
- Mỗi test độc lập, tự chuẩn bị và dọn dữ liệu.
- Mock những phụ thuộc không ổn định (dịch vụ bên thứ ba).
- Theo dõi tỉ lệ flaky theo thời gian và đặt ngân sách chấp nhận được.

## Lỗi thường gặp
- Dùng retry như thuốc giảm đau, che lỗi mà không điều trị.
- Tắt test flaky mà không ghi lại để quay lại sửa.
- Đổ lỗi cho “Playwright không ổn định” khi gốc rễ ở dữ liệu hoặc chờ.

## Bài tập
1. Chạy một test với `--repeat-each=30` rồi giải thích kết quả.
2. Cố ý thêm `waitForTimeout(100)` vào test dùng chung dữ liệu, chạy song song và quan sát tỉ lệ lỗi.
