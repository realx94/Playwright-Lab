---
title: Negative, bảo mật và truy cập cơ bản
level: 3
order: 8
minutes: 30
summary: Test dữ liệu xấu, kiểm tra bảo mật đầu vào cơ bản và khả năng truy cập bằng bàn phím.
keywords: [OWASP top 10 cho tester, xss là gì, accessibility testing]
---

## Mục tiêu bài học
- Nghĩ như người dùng “làm sai”, và cả người có ý đồ xấu.
- Nắm các kiểm tra bảo mật và accessibility cơ bản mà QA nào cũng làm được.

## Kiến thức cần nắm
- **Negative testing**: dữ liệu sai, thiếu, quá lớn, ký tự đặc biệt, thao tác sai thứ tự
- **Security input**: XSS (chèn script), SQL injection, đường dẫn tệp, quyền truy cập (IDOR)
- **Phân quyền**: người không có quyền không được xem/sửa dữ liệu của người khác
- **Thông báo lỗi không lộ thông tin** (không nói “email không tồn tại”)
- **Accessibility**: dùng bàn phím (Tab, Enter), nhãn cho ô nhập, tương phản, tên cho nút

## Giải thích dễ hiểu
Test happy path giống kiểm tra **ổ khoá mở được bằng chìa đúng**. Negative và security là hỏi: **chìa sai, chìa giả, kẻ phá khoá có vào được không?** Accessibility là hỏi: **người không dùng chuột có vào được không?**

## Bộ kiểm tra nhanh cho một ô nhập
| Loại | Dữ liệu thử |
|------|-------------|
| Rỗng / khoảng trắng | `""`, `"   "` |
| Quá dài | 1000 ký tự |
| Ký tự đặc biệt | `<script>alert(1)</script>`, `' OR '1'='1`, `../../etc/passwd` |
| Unicode | tiếng Việt có dấu, emoji |
| Định dạng sai | email thiếu `@`, số có chữ |

Ví dụ ở LAB-01: nhập `<script>alert(1)</script>` vào ô email phải báo email không hợp lệ và **không** thực thi script. Bật `?bugs=BUG-03` để thấy lỗi lộ thông tin: thông báo “Email không tồn tại” cho phép kẻ xấu dò tài khoản.

## Accessibility cơ bản
1. Dùng **Tab** đi qua toàn bộ form: thứ tự hợp lý, thấy rõ ô đang focus.
2. Mọi ô nhập có **label** (đây cũng là điều khiến `getByLabel` hoạt động).
3. Nút có **tên** dễ hiểu (không chỉ là biểu tượng).
4. Thông báo lỗi gắn với ô nhập và được đọc bởi trình đọc màn hình.

## Lỗi thường gặp
- Chỉ kiểm tra bảo mật ở giao diện mà quên kiểm tra ở API.
- Test XSS nhưng không quan sát xem script có thật sự thực thi.
- Bỏ qua accessibility vì nghĩ đó là việc của dev.

## Bài tập
1. Chạy bộ dữ liệu xấu ở bảng trên với trường Email của LAB-01 và ghi lại kết quả.
2. Dùng chỉ bàn phím để đăng nhập ở LAB-01; ghi lại chỗ nào khó thao tác.
