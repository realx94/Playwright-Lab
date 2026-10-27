---
title: Git cơ bản
level: 1
order: 1
minutes: 60
summary: Cài Git, cấu hình user.name và user.email, hiểu ba vùng làm việc và thực hành init, status, add, commit, log, diff, restore, .gitignore từng lệnh một.
keywords: [git staging area, git commit là gì, .gitignore]
---

## Mục tiêu bài học
- Cài được Git, cấu hình `user.name` và `user.email` và kiểm tra lại bằng `git config`.
- Tạo repository, theo dõi file và lưu lịch sử bằng commit; giải thích được ba vùng: working directory, staging area, repository.
- Đọc được kết quả của `git status`, `git diff`, `git log` và biết mỗi cờ quan trọng làm gì.
- Hoàn tác thay đổi chưa commit bằng `git restore` và bỏ file khỏi staging.
- Viết `.gitignore` đúng cho dự án Playwright và viết thông điệp commit có ý nghĩa.

## Bạn cần chuẩn bị
- Đã làm xong bài 0.2 (Git đã cài; `git --version` hoạt động). Nếu chưa, bước 1 dưới đây nhắc lại cách cài.
- Một terminal: PowerShell hoặc Git Bash (Windows), Terminal (macOS).
- Một thư mục trống để thực hành, ví dụ `git-practice`.

## Kiến thức cần nắm
- Repository (repo) là thư mục được Git theo dõi.
- Ba vùng: working directory, staging area, repository.
- Lệnh: `git init`, `git status`, `git add`, `git commit -m`, `git log`, `git diff`, `git restore`.
- `.gitignore` loại bỏ file không nên theo dõi (như `node_modules`).
- Commit là một ảnh chụp toàn bộ trạng thái dự án tại một thời điểm, kèm tên người, thời gian và ghi chú.

## Giải thích dễ hiểu
Hãy tưởng tượng bạn **chụp ảnh gia đình**. Bàn làm việc (**working directory**, thư mục làm việc) là nơi mọi người đang đi lại. Bạn xếp những người muốn chụp vào khung hình (**staging area**, vùng chờ, còn gọi là index). Bấm máy là **commit**: một tấm ảnh được cất vào album (**repository**) kèm ghi chú. Sau này muốn xem lại bất kỳ tấm nào cũng được, thậm chí quay về đúng thời điểm đó.

Vì sao có vùng chờ? Vì bạn có thể sửa 5 file nhưng chỉ muốn commit 2 file thuộc cùng một ý. Staging area cho phép chọn chính xác điều gì vào mỗi commit, giúp lịch sử gọn và dễ đọc.

```text
working directory  --git add-->  staging area  --git commit-->  repository
 (bạn đang sửa)                  (đã chọn để chụp)              (đã lưu vĩnh viễn)
```

Một điểm cần nhớ: Git theo dõi **thay đổi nội dung của file**, không theo dõi thư mục rỗng. Và Git chạy hoàn toàn trên máy bạn; GitHub (bài 1.2) chỉ là nơi lưu bản sao để chia sẻ.

```diagram
git-areas
```

## Thực hành từng bước

### Bước 1. Cài Git và kiểm tra
Mục đích: chắc chắn Git có mặt. Nếu chưa cài: Windows chạy `winget install --id Git.Git -e --source winget` (hoặc tải ở git-scm.com); macOS chạy `git --version` rồi chấp nhận cài Command Line Tools (hoặc `brew install git`). Sau đó **mở terminal mới** và chạy:

```bash
git --version
```

`--version` yêu cầu Git in phiên bản rồi thoát. Kết quả mong đợi:

```text
git version 2.47.0.windows.1
```

Nếu gặp lỗi `git: command not found` hoặc `'git' is not recognized`: đóng và mở lại terminal; nếu vẫn lỗi, khởi động lại máy hoặc cài lại.

### Bước 2. Khai báo danh tính (user.name và user.email)
Mục đích: mỗi commit ghi lại "ai làm". Git bắt buộc có tên và email trước khi commit.

```bash
git config --global user.name "Nguyen Van A"
```

| Phần của lệnh | Ý nghĩa |
|---------------|---------|
| `git config` | Xem hoặc đặt cấu hình của Git |
| `--global` | Áp dụng cho mọi repo của người dùng này trên máy (lưu ở file `.gitconfig` trong thư mục người dùng). Bỏ cờ này nếu chỉ muốn đặt cho một repo |
| `user.name` | Tên khoá cấu hình: tên hiển thị của tác giả commit |
| `"Nguyen Van A"` | Giá trị; đặt trong ngoặc kép vì có dấu cách |

```bash
git config --global user.email "ban@example.com"
```

Giống lệnh trên, đặt `user.email`. Hãy dùng đúng email của tài khoản GitHub bạn sẽ tạo ở bài 1.2 để GitHub gán commit về bạn. (Nếu muốn giấu email thật, GitHub có địa chỉ email riêng tư dạng `...@users.noreply.github.com`.)

Đặt nhánh mặc định tên `main` cho repo mới (để khớp với GitHub):

```bash
git config --global init.defaultBranch main
```

Kiểm tra lại:

```bash
git config --global --list
```

Cờ `--list` in toàn bộ cấu hình. Kết quả mong đợi (chứa ít nhất):

```text
user.name=Nguyen Van A
user.email=ban@example.com
init.defaultbranch=main
```

Muốn xem một giá trị: `git config user.name`. Muốn sửa: chạy lại lệnh `git config --global user.name "Tên mới"`.

### Bước 3. Tạo thư mục và khởi tạo repository
Mục đích: biến một thư mục thường thành repo.

```bash
mkdir git-practice
cd git-practice
git init
```

| Lệnh | Ý nghĩa |
|------|---------|
| `mkdir git-practice` | Tạo thư mục |
| `cd git-practice` | Đi vào thư mục |
| `git init` | Tạo thư mục ẩn `.git` chứa toàn bộ lịch sử và cấu hình; từ đây thư mục này là một repo |

Kết quả mong đợi:

```text
Initialized empty Git repository in D:/.../git-practice/.git/
```

"Empty" nghĩa là chưa có commit nào. Đừng xoá hay sửa thư mục `.git`: xoá nó là mất toàn bộ lịch sử.

### Bước 4. Xem trạng thái khi chưa có gì
Mục đích: học cách đọc `git status`, lệnh bạn sẽ dùng nhiều nhất.

```bash
git status
```

Kết quả mong đợi:

```text
On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)
```

Dòng `On branch main` cho biết nhánh hiện tại; `No commits yet` nghĩa là chưa có ảnh chụp nào.

### Bước 5. Tạo file và xem trạng thái "untracked"
Mục đích: thấy file mới chưa được theo dõi. Tạo file bằng VS Code hoặc lệnh (macOS và Git Bash):

```bash
echo "# Dự án Playwright của tôi" > README.md
git status
```

`echo "..." > README.md` ghi chuỗi vào file `README.md` (dấu `>` ghi đè nội dung). Lệnh chạy tốt trong macOS và Git Bash; trong Windows PowerShell 5.1 file có thể bị ghi bằng bảng mã UTF-16 khiến `git diff` hiển thị lạ, nên trên Windows hãy tạo file bằng VS Code (`code README.md`, gõ nội dung rồi lưu). Kết quả mong đợi:

```text
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        README.md

nothing added to commit but untracked files present (use "git add" to track)
```

**Untracked** nghĩa là file có trong thư mục nhưng Git chưa theo dõi.

### Bước 6. Đưa file vào staging bằng `git add`
Mục đích: chọn file sẽ vào commit.

```bash
git add README.md
git status
```

| Phần của lệnh | Ý nghĩa |
|---------------|---------|
| `git add` | Đưa thay đổi vào staging area |
| `README.md` | File cụ thể. Có thể dùng `.` để thêm mọi thay đổi trong thư mục hiện tại (cẩn thận, kiểm tra trước) |

Kết quả mong đợi:

```text
Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   README.md
```

Chữ màu xanh `new file` nghĩa là file đã nằm trong vùng chờ.

Nếu thấy cảnh báo `warning: in the working copy of 'README.md', LF will be replaced by CRLF the next time Git touches it` trên Windows: đây chỉ là thông báo về ký tự xuống dòng, không phải lỗi. Mã `index 9d632e5..ea069c3` ở ví dụ `git diff` bên dưới sẽ khác trên máy bạn.

### Bước 7. Tạo commit đầu tiên
Mục đích: lưu ảnh chụp vào repository.

```bash
git commit -m "docs: thêm README đầu tiên"
```

| Phần của lệnh | Ý nghĩa |
|---------------|---------|
| `git commit` | Tạo commit từ nội dung đang ở staging |
| `-m` | Viết thông điệp (message) ngay trên dòng lệnh. Nếu bỏ `-m`, Git mở trình soạn thảo để bạn nhập |
| `"docs: ..."` | Nội dung thông điệp. Tiền tố `docs:`, `feat:`, `fix:` là quy ước giúp lịch sử dễ đọc |

Kết quả mong đợi:

```text
[main (root-commit) 3f2a1bc] docs: thêm README đầu tiên
 1 file changed, 1 insertion(+)
 create mode 100644 README.md
```

`root-commit` là commit đầu tiên của repo; `3f2a1bc` là mã rút gọn (hash) định danh commit; `1 insertion(+)` là số dòng thêm.

Nếu gặp lỗi `Author identity unknown` / `*** Please tell me who you are`: bạn chưa làm Bước 2.

Nếu bị mở một cửa sổ trình soạn thảo lạ (thường là Vim) khi quên `-m`: gõ `:q!` rồi Enter để thoát không lưu, sau đó chạy lại với `-m`.

### Bước 8. Xem lịch sử bằng `git log`
Mục đích: kiểm tra kết quả.

```bash
git log --oneline
```

| Phần của lệnh | Ý nghĩa |
|---------------|---------|
| `git log` | Liệt kê các commit, mới nhất trước |
| `--oneline` | Mỗi commit một dòng: mã rút gọn và thông điệp |

Kết quả mong đợi:

```text
3f2a1bc (HEAD -> main) docs: thêm README đầu tiên
```

`HEAD -> main` nghĩa là bạn đang đứng ở nhánh `main`, tại commit này. Nếu log dài, nhấn phím `q` để thoát.

### Bước 9. Sửa file và xem thay đổi bằng `git diff`
Mục đích: kiểm tra trước khi commit. Thêm dòng vào `README.md` (bằng VS Code; trên macOS và Git Bash có thể dùng `echo "Chạy: npx playwright test" >> README.md`, trong đó `>>` nghĩa là ghi nối thêm). Rồi:

```bash
git status
git diff
```

`git status` cho thấy `modified: README.md` (chữ đỏ, chưa vào staging). `git diff` so sánh working directory với staging và in các dòng khác nhau:

```text
diff --git a/README.md b/README.md
index 9d632e5..ea069c3 100644
--- a/README.md
+++ b/README.md
@@ -1 +1,2 @@
 # Dự án Playwright của tôi
+Chạy: npx playwright test
```

Dòng bắt đầu bằng `+` là dòng thêm (xanh), `-` là dòng xoá (đỏ). Sau khi `git add README.md`, `git diff` sẽ rỗng vì thay đổi đã vào staging; lúc đó dùng `git diff --staged` để xem các thay đổi chuẩn bị commit.

```bash
git add README.md
git diff --staged
git commit -m "docs: thêm hướng dẫn chạy test"
```

### Bước 10. Hoàn tác thay đổi chưa commit
Mục đích: biết cách "đổi ý". Sửa `README.md` thêm dòng `RÁC`, rồi:

```bash
git restore README.md
```

`git restore <file>` đưa file về trạng thái của commit gần nhất, **bỏ hẳn thay đổi chưa commit** (không lấy lại được, nên cẩn thận). Kiểm tra: dòng `RÁC` biến mất.

Nếu đã `git add` nhầm một file và chỉ muốn đưa nó ra khỏi staging (giữ nguyên nội dung):

```bash
git restore --staged README.md
```

Cờ `--staged` làm việc với vùng chờ thay vì thư mục làm việc.

### Bước 11. Thêm `.gitignore`
Mục đích: không theo dõi file sinh ra hoặc bí mật. Tạo file `.gitignore` (tên bắt đầu bằng dấu chấm, không có đuôi) với nội dung:

```text
node_modules/
test-results/
playwright-report/
.env
```

| Dòng | Ý nghĩa |
|------|---------|
| `node_modules/` | Thư mục thư viện, rất nặng và tái tạo được bằng `npm install` |
| `test-results/`, `playwright-report/` | Kết quả chạy test, sinh lại mỗi lần |
| `.env` | Chứa khoá bí mật; tuyệt đối không đưa lên GitHub |

Dấu `/` ở cuối cho biết đó là thư mục. Thử: tạo thư mục `node_modules` có một file bên trong rồi chạy `git status`: nó **không** xuất hiện, chỉ thấy `.gitignore`. Commit:

```bash
git add .gitignore
git commit -m "chore: thêm .gitignore cho dự án Playwright"
```

Lưu ý quan trọng: `.gitignore` chỉ có tác dụng với file **chưa được theo dõi**. Nếu bạn lỡ commit `.env` rồi mới thêm vào `.gitignore`, Git vẫn theo dõi nó; phải chạy `git rm --cached .env` để thôi theo dõi, và vì khoá đã bị lộ trong lịch sử, hãy đổi khoá đó.

## Demo code
Toàn bộ quy trình ngắn gọn, bạn có thể dán từng dòng (đọc chú thích bên phải):

```bash
git init                       # tạo repo
git status                     # xem file nào đã đổi
git add tests/login.spec.ts    # đưa file vào staging
git commit -m "feat: thêm test đăng nhập"   # lưu ảnh chụp
git log --oneline              # xem lịch sử gọn
git diff                       # xem thay đổi chưa staging
git restore tests/login.spec.ts # bỏ thay đổi chưa commit
```

Quy ước thông điệp commit (Conventional Commits rút gọn):

```text
feat: thêm test đăng nhập sai mật khẩu
fix: sửa locator nút Gửi bị đổi nhãn
docs: cập nhật README hướng dẫn chạy
chore: nâng cấp @playwright/test
```

Một thông điệp tốt trả lời "đã đổi gì" và (nếu cần) "vì sao", ngắn dưới khoảng 72 ký tự ở dòng đầu.

## Lỗi thường gặp
- **Triệu chứng:** `*** Please tell me who you are. fatal: unable to auto-detect email address`. **Nguyên nhân:** chưa cấu hình `user.name` và `user.email`. **Cách sửa:** chạy hai lệnh `git config --global` ở Bước 2.
- **Triệu chứng:** `fatal: not a git repository (or any of the parent directories): .git`. **Nguyên nhân:** bạn đang đứng ngoài repo hoặc chưa `git init`. **Cách sửa:** `cd` vào đúng thư mục hoặc chạy `git init`.
- **Triệu chứng:** `git status` báo `nothing to commit` dù bạn nhớ đã sửa file. **Nguyên nhân:** chưa lưu file trong editor, hoặc file nằm trong `.gitignore`. **Cách sửa:** lưu file (Ctrl + S) và kiểm tra `.gitignore`.
- **Triệu chứng:** commit xong nhưng thiếu thay đổi. **Nguyên nhân:** quên `git add` nên file chỉ ở working directory. **Cách sửa:** `git add` rồi dùng `git commit --amend --no-edit` (xem bài 1.3) nếu chưa push.
- **Triệu chứng:** commit cả `node_modules` hoặc `.env` chứa khoá bí mật. **Nguyên nhân:** `.gitignore` thêm sau commit đầu. **Cách sửa:** thêm `.gitignore` trước commit đầu tiên; nếu đã lỡ, `git rm -r --cached node_modules` và đổi mọi khoá bị lộ.
- **Triệu chứng:** thông điệp commit chung chung như "update". **Cách sửa:** mô tả điều đã đổi và vì sao.

## Tóm tắt
- Ba vùng: working directory, staging area, repository; `git add` chuyển vùng 1 sang 2, `git commit` chuyển 2 sang 3.
- Phải cấu hình `user.name` và `user.email` một lần trước commit đầu tiên.
- `git status` là lệnh nên chạy liên tục để biết mình đang ở đâu.
- `git diff` xem thay đổi trước khi commit; `git restore` hoàn tác thay đổi chưa commit.
- `.gitignore` ngăn đưa `node_modules` và `.env` vào lịch sử.

## Bài tập
1. Tạo thư mục mới, `git init`, thêm `README.md` và commit. Xong khi: `git log --oneline` có đúng một commit với thông điệp rõ ràng.
2. Sửa file, dùng `git status` và `git diff` để xem thay đổi trước khi commit. Xong khi: bạn đọc ra được dòng nào thêm, dòng nào xoá.
3. Sửa hai file nhưng chỉ commit một file. Xong khi: `git status` vẫn báo file còn lại là modified.
4. Tạo `.gitignore` cho dự án Playwright, kiểm tra `.env` không xuất hiện trong `git status`. Xong khi: file `.env` tồn tại nhưng Git bỏ qua.
5. Thêm dòng `RÁC` vào file đã commit, rồi hoàn tác bằng `git restore`. Xong khi: dòng đó biến mất mà không cần commit.
