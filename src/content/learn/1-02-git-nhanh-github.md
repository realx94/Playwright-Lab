---
title: Git nhánh và GitHub
level: 1
order: 2
minutes: 30
summary: Làm việc với branch, remote, SSH key, push/pull và Pull Request.
keywords: [git merge vs rebase, ssh key github, pull request là gì]
---

## Mục tiêu bài học
- Tạo nhánh để làm việc độc lập, rồi hợp nhất lại.
- Đẩy code lên GitHub và tạo Pull Request.

## Kiến thức cần nắm
- Branch: dòng phát triển song song, mặc định là `main`
- `git switch -c <tên>` để tạo và chuyển nhánh; `git merge` để hợp nhất
- Remote: bản sao repo trên máy chủ (thường tên `origin`)
- `git push`, `git pull`, `git clone`
- SSH key giúp xác thực với GitHub không cần nhập mật khẩu mỗi lần
- Pull Request (PR): đề nghị hợp nhất nhánh, là nơi review code

## Giải thích dễ hiểu
Main giống **bản gốc của cuốn sách đã xuất bản**. Mỗi lần muốn sửa một chương, bạn photo ra một bản nháp (branch) rồi sửa thoải mái mà không làm hỏng bản gốc. Sửa xong, bạn gửi bản nháp cho biên tập viên (Pull Request); họ duyệt rồi mới ghép vào bản gốc (merge).

## Demo code
```bash
git switch -c feat/login-test        # tạo nhánh mới
git add . && git commit -m "feat: test đăng nhập"
git push -u origin feat/login-test   # đẩy nhánh lên GitHub
# mở GitHub và bấm "Compare & pull request"
```

Tạo SSH key và thêm vào GitHub:

```bash
ssh-keygen -t ed25519 -C "email@cua-ban.com"
# copy nội dung file .pub vào GitHub → Settings → SSH keys
ssh -T git@github.com
```

## Lỗi thường gặp
- Làm việc trực tiếp trên `main` nên khó hoàn tác. Luôn tạo nhánh cho mỗi công việc.
- `git push` bị từ chối vì nhánh remote có commit mới. Hãy `git pull` trước.
- Sao chép nhầm khoá riêng (private key) thay vì khoá công khai `.pub`.

## Bài tập
1. Tạo repo trên GitHub, clone về, tạo nhánh, commit và mở một Pull Request.
2. Tự review PR của mình: đọc lại phần "Files changed" trước khi merge.
