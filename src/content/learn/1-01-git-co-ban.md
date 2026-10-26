---
title: Git cơ bản
level: 1
order: 1
minutes: 30
summary: Hiểu repository, ba vùng làm việc của Git và các lệnh init, add, commit, status, log.
keywords: [git staging area, git commit là gì, .gitignore]
---

## Mục tiêu bài học
- Tạo repository và lưu lịch sử thay đổi bằng commit.
- Hiểu ba vùng: working directory, staging area, repository.

## Kiến thức cần nắm
- Repository (repo) là thư mục được Git theo dõi
- Ba vùng: working directory → staging area → repository
- Lệnh: `git init`, `git status`, `git add`, `git commit -m`, `git log`
- `.gitignore` loại bỏ file không nên theo dõi (như `node_modules`)
- Commit là một ảnh chụp toàn bộ trạng thái dự án tại một thời điểm

## Giải thích dễ hiểu
Hãy tưởng tượng bạn **chụp ảnh gia đình**. Bàn làm việc (working directory) là nơi mọi người đang đi lại. Bạn xếp những người muốn chụp vào khung hình (staging area). Bấm máy là commit: một tấm ảnh được cất vào album (repository) kèm ghi chú. Sau này muốn xem lại bất kỳ tấm nào cũng được.

## Demo code
```bash
git init
git status                 # xem file nào đã đổi
git add tests/login.spec.ts
git commit -m "feat: thêm test đăng nhập"
git log --oneline          # xem lịch sử gọn
```

Một `.gitignore` tối thiểu cho dự án Playwright:

```text
node_modules/
test-results/
playwright-report/
.env
```

## Lỗi thường gặp
- Commit cả `node_modules` hoặc `.env` chứa khoá bí mật. Hãy thêm vào `.gitignore` trước khi commit đầu tiên.
- Thông điệp commit chung chung như "update". Hãy mô tả điều đã đổi và vì sao.
- Quên `git add` nên commit không chứa thay đổi mong muốn.

## Bài tập
1. Tạo thư mục mới, `git init`, thêm một file `README.md` và commit.
2. Sửa file, dùng `git status` và `git diff` để xem thay đổi trước khi commit.
