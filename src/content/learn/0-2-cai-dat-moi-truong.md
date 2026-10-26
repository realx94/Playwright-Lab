---
title: Cài đặt môi trường
level: 0
order: 2
minutes: 25
summary: Cài Node.js bằng NVM, Git, VS Code và hiểu vai trò của từng công cụ.
keywords: [nvm là gì, npm vs npx, node.js lts]
---

## Mục tiêu bài học
- Cài được Node.js (qua NVM), Git và VS Code trên máy của bạn.
- Hiểu mỗi công cụ dùng để làm gì trong một dự án automation.

## Kiến thức cần nắm
- Node.js là môi trường chạy JavaScript ngoài trình duyệt; Playwright chạy trên Node.js
- NVM cho phép cài nhiều phiên bản Node và chuyển qua lại
- npm là trình quản lý gói đi kèm Node; `npx` chạy một gói mà không cần cài toàn cục
- Git lưu lịch sử thay đổi mã nguồn
- VS Code là trình soạn thảo, có extension riêng cho Playwright

## Giải thích dễ hiểu
Hãy coi máy bạn là một **căn bếp**. Node.js là cái bếp, npm là siêu thị cung cấp nguyên liệu (thư viện), VS Code là mặt bàn bạn nấu, Git là cuốn sổ ghi lại mỗi lần bạn đổi công thức. NVM giống như một bộ bếp có thể thay đầu đốt: hôm nay dùng bếp ga, mai dùng bếp từ mà không phải dọn lại cả căn bếp.

## Các bước
1. Cài **Git** (git-scm.com). Kiểm tra bằng `git --version`.
2. Cài **NVM** (Windows: nvm-windows; macOS: Homebrew). Mở terminal mới rồi kiểm tra `nvm --version`.
3. Cài **Node.js LTS**: `nvm install --lts` (Windows: `nvm install lts`) rồi `nvm use`. Kiểm tra `node -v`.
4. Cài **VS Code** và extension *Playwright Test for VS Code*.

Hướng dẫn chi tiết theo hệ điều hành và checklist có ở trang [Starter](/starter).

## Lỗi thường gặp
- Mở terminal cũ sau khi cài nên lệnh `nvm`/`node` không nhận. Hãy đóng và mở lại terminal.
- Cài Node trực tiếp rồi cài thêm NVM, hai bản xung đột. Hãy gỡ bản cũ trước.
- Dùng phiên bản Node quá cũ so với yêu cầu của Playwright. Luôn dùng bản LTS.

## Bài tập
1. Chạy `node -v`, `npm -v`, `git --version` và chụp kết quả để đối chiếu.
2. Dùng NVM cài thêm một phiên bản Node khác rồi quay lại bản LTS bằng `nvm use`.
