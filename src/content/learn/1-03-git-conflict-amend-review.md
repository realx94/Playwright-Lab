---
title: Xử lý conflict, amend và review code
level: 1
order: 3
minutes: 30
summary: Giải quyết xung đột khi merge, sửa commit gần nhất và quy trình review code.
keywords: [git conflict markers, git commit --amend, code review checklist]
---

## Mục tiêu bài học
- Đọc và giải quyết conflict khi merge.
- Sửa commit gần nhất bằng `--amend`.
- Biết quy trình review code cơ bản.

## Kiến thức cần nắm
- Conflict xảy ra khi hai nhánh cùng sửa một vị trí của một file
- Dấu hiệu conflict: `<<<<<<<`, `=======`, `>>>>>>>`
- Giải quyết: chọn nội dung đúng, xoá các dấu, `git add`, rồi `git commit`
- `git commit --amend` sửa commit gần nhất (chưa push)
- Review code: đọc thay đổi, kiểm tra logic, đặt tên, test, phản hồi lịch sự

## Giải thích dễ hiểu
Hai người cùng chỉnh **một câu** trong một tài liệu chung rồi gộp lại: máy không biết nên giữ câu của ai nên đánh dấu cả hai và nhờ bạn quyết định. Conflict không phải lỗi, chỉ là Git hỏi ý kiến con người.

## Demo code
Tình huống conflict trong file:

```text
<<<<<<< HEAD
const timeout = 5000;
=======
const timeout = 10000;
>>>>>>> feat/longer-timeout
```

Chọn một giá trị (hoặc kết hợp), xoá ba dòng đánh dấu, rồi:

```bash
git add src/config.ts
git commit            # hoàn tất merge
```

Sửa commit gần nhất khi quên một file:

```bash
git add tests/forgotten.spec.ts
git commit --amend --no-edit
```

## Checklist review code
- Test có kiểm tra đúng điều cần kiểm tra không?
- Có `waitForTimeout` hoặc locator mong manh không?
- Tên test và biến có rõ nghĩa không?
- Có lộ khoá bí mật không?

## Lỗi thường gặp
- Còn sót dấu `<<<<<<<` trong file sau khi giải quyết.
- `--amend` trên commit đã push làm lịch sử lệch với remote.
- Review chỉ nhận xét phong cách mà bỏ sót lỗi logic.

## Bài tập
1. Tạo hai nhánh cùng sửa một dòng, merge và giải quyết conflict.
2. Review một PR của bạn bằng checklist ở trên.
