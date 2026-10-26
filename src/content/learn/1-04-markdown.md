---
title: Viết tài liệu bằng Markdown
level: 1
order: 4
minutes: 15
summary: Dùng Markdown để viết README, bảng test case và báo cáo lỗi rõ ràng.
keywords: [markdown cheatsheet, viết bug report, readme tốt]
---

## Mục tiêu bài học
- Viết README và bug report đẹp, dễ đọc bằng Markdown.

## Kiến thức cần nắm
- Tiêu đề: `#`, `##`, `###`
- Danh sách có thứ tự và không thứ tự
- **In đậm**, *in nghiêng*, `code nội dòng`
- Khối code với ba dấu huyền và tên ngôn ngữ
- Bảng, liên kết, hình ảnh

## Giải thích dễ hiểu
Markdown là cách **ghi chú nhanh nhưng có định dạng**: bạn gõ ký hiệu đơn giản như `#` hay `-`, GitHub và nhiều công cụ tự biến chúng thành tiêu đề, danh sách. Giống soạn tin nhắn có gạch đầu dòng mà không cần chuột.

## Demo code
Mẫu bug report ngắn gọn:

```markdown
## [Login] Mật khẩu 7 ký tự vẫn được chấp nhận

**Các bước**
1. Mở `/lab/login`
2. Nhập email hợp lệ và mật khẩu `Pass0r!` (7 ký tự)
3. Bấm Đăng nhập

**Kết quả mong đợi:** báo "Mật khẩu tối thiểu 8 ký tự"
**Kết quả thực tế:** không có thông báo lỗi

| Môi trường | Trình duyệt |
|------------|-------------|
| Local      | Chromium    |
```

## Lỗi thường gặp
- Quên dòng trống giữa các đoạn nên Markdown gộp chúng làm một.
- Bảng sai số cột hoặc thiếu dòng `---` phân cách tiêu đề.
- Dán ảnh chụp chứa dữ liệu nhạy cảm vào báo cáo công khai.

## Bài tập
1. Viết README cho một project với mục cài đặt, chạy test và cấu trúc thư mục.
2. Viết một bug report theo mẫu trên cho lỗi bạn tìm được ở LAB-01 khi bật `?bugs=BUG-01`.
