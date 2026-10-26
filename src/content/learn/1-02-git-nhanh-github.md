---
title: Git nhánh và GitHub
level: 1
order: 2
minutes: 90
summary: Tạo tài khoản GitHub, tạo repo, SSH key từng bước, clone, branch, push, pull, tạo và merge Pull Request trên giao diện GitHub.
keywords: [git merge vs rebase, ssh key github, pull request là gì]
---

## Mục tiêu bài học
- Tạo được tài khoản GitHub và một repository mới.
- Tạo SSH key, thêm vào GitHub và kiểm tra bằng `ssh -T git@github.com`.
- Clone repo, tạo nhánh, commit, đẩy nhánh lên GitHub bằng `git push -u origin`.
- Tạo Pull Request trên giao diện GitHub, merge, rồi đồng bộ về máy bằng `git pull`.
- Giải thích được branch, remote, `origin`, fast-forward và khác nhau cơ bản giữa merge và rebase.

## Bạn cần chuẩn bị
- Đã học bài 1.1: Git đã cài, `user.name` và `user.email` đã cấu hình, biết `add`, `commit`, `status`, `log`.
- Một địa chỉ email thật bạn truy cập được (GitHub gửi mã xác minh).
- Terminal: PowerShell hoặc Git Bash (Windows), Terminal (macOS).

## Kiến thức cần nắm
- Branch: dòng phát triển song song, mặc định là `main`.
- `git switch -c <tên>` để tạo và chuyển nhánh; `git merge` để hợp nhất.
- Remote: bản sao repo trên máy chủ (thường tên `origin`).
- `git push`, `git pull`, `git clone`, `git fetch`.
- SSH key giúp xác thực với GitHub không cần nhập mật khẩu mỗi lần.
- Pull Request (PR): đề nghị hợp nhất nhánh, là nơi review code.

## Giải thích dễ hiểu
`main` giống **bản gốc của cuốn sách đã xuất bản**. Mỗi lần muốn sửa một chương, bạn photo ra một bản nháp (**branch**, nhánh) rồi sửa thoải mái mà không làm hỏng bản gốc. Sửa xong, bạn gửi bản nháp cho biên tập viên (**Pull Request**); họ duyệt rồi mới ghép vào bản gốc (**merge**).

**GitHub** là dịch vụ lưu repo Git trên mạng để chia sẻ và cộng tác. Git là công cụ trên máy bạn, GitHub là "kho chung" đặt trên Internet. Bản repo trên GitHub gọi là **remote** (từ xa) và theo thông lệ Git đặt tên nó là **origin**. Bạn làm việc trên bản **local** (cục bộ) rồi **push** (đẩy) lên origin, và **pull** (kéo) về khi người khác thay đổi.

### Vì sao cần SSH key
Khi bạn đẩy code, GitHub phải biết bạn là ai. GitHub không còn cho dùng mật khẩu tài khoản trong lệnh Git. Hai cách phổ biến: HTTPS với token hoặc **SSH key**. SSH key là một cặp khoá: **khoá riêng** (private key) nằm trong máy bạn và tuyệt đối không chia sẻ; **khoá công khai** (public key, đuôi `.pub`) bạn đưa cho GitHub. Giống ổ khoá và chìa: bạn lắp ổ khoá (public) lên GitHub, chỉ chìa của bạn (private) mở được.

## Thực hành từng bước

### Bước 1. Tạo tài khoản GitHub
Mục đích: có nơi lưu repo trên mạng. Giao diện GitHub có thể thay đổi nhẹ theo thời gian.

1. Mở trình duyệt, vào `github.com`, bấm **Sign up**.
2. Nhập email, tạo mật khẩu mạnh, chọn **username** (tên này nằm trong địa chỉ repo, ví dụ `github.com/ten-cua-ban`, nên hãy chọn tên nghiêm túc, dễ nhớ).
3. Giải câu đố xác minh người thật và nhập mã GitHub gửi về email.
4. Chọn gói **Free** là đủ cho khoá học.
5. Bật xác thực hai lớp (Settings, Password and authentication) nếu GitHub yêu cầu; nên làm.

Kết quả mong đợi: bạn đăng nhập được và thấy trang chủ GitHub có avatar ở góc trên bên phải. Dùng đúng email này cho `git config --global user.email` (xem bài 1.1) để commit được gắn về tài khoản.

### Bước 2. Tạo repository trên GitHub
Mục đích: có một repo trống để thực hành.

1. Bấm dấu **+** ở góc trên bên phải, chọn **New repository**.
2. **Repository name**: `git-lab-practice`.
3. **Description**: tuỳ chọn, ví dụ "Thực hành Git cho khoá Playwright".
4. Chọn **Public** (ai cũng xem được) hoặc **Private** (chỉ bạn). Với bài tập, chọn Private cũng được.
5. Tích **Add a README file**. Tuỳ chọn **Add .gitignore**: chọn mẫu **Node**.
6. Bấm **Create repository**.

Kết quả mong đợi: trang repo mở ra, có file `README.md` và (nếu chọn) `.gitignore`. Đường dẫn dạng `github.com/<username>/git-lab-practice`.

### Bước 3. Tạo SSH key trên máy
Mục đích: tạo cặp khoá để máy bạn chứng minh danh tính với GitHub. Mở terminal (Git Bash hoặc PowerShell trên Windows; Terminal trên macOS).

```bash
ssh-keygen -t ed25519 -C "ban@example.com"
```

| Phần của lệnh | Ý nghĩa |
|---------------|---------|
| `ssh-keygen` | Công cụ tạo khoá SSH |
| `-t ed25519` | Chọn thuật toán (type) Ed25519: hiện đại, ngắn, an toàn |
| `-C "ban@example.com"` | Chú thích (comment) gắn vào khoá để bạn nhận ra khoá của ai; dùng email của bạn |

Chương trình hỏi lần lượt:

```text
Generating public/private ed25519 key pair.
Enter file in which to save the key (C:\Users\ban/.ssh/id_ed25519):
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
```

- Dòng đầu: nhấn **Enter** để dùng vị trí mặc định.
- Passphrase là mật khẩu bảo vệ khoá riêng: nên đặt; hoặc nhấn Enter để bỏ qua nếu bạn chỉ thực hành (kém an toàn hơn nếu máy bị mất).

Kết quả mong đợi:

```text
Your identification has been saved in C:\Users\ban/.ssh/id_ed25519
Your public key has been saved in C:\Users\ban/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:AbCd... ban@example.com
```

Hai file được tạo trong thư mục `.ssh`: `id_ed25519` (khoá **riêng**, không bao giờ gửi cho ai) và `id_ed25519.pub` (khoá **công khai**, cái bạn đưa cho GitHub). Nếu báo `ssh-keygen: command not found` trên Windows, mở **Git Bash** (đi kèm Git) rồi chạy lại.

### Bước 4. Nạp khoá vào ssh-agent
Mục đích: để bạn không phải nhập passphrase mỗi lần. **ssh-agent** là chương trình nền giữ khoá đã mở khoá.

**macOS:**

```bash
eval "$(ssh-agent -s)"
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

`eval "$(ssh-agent -s)"` khởi động agent và đặt biến môi trường; `ssh-add` thêm khoá vào agent, cờ `--apple-use-keychain` lưu passphrase vào Keychain của macOS. Kết quả: `Identity added: /Users/ban/.ssh/id_ed25519 (ban@example.com)`.

**Windows (PowerShell chạy bằng Administrator, chỉ cần làm một lần):**

```powershell
Get-Service ssh-agent | Set-Service -StartupType Manual
Start-Service ssh-agent
ssh-add $env:USERPROFILE\.ssh\id_ed25519
```

Lệnh đầu cho phép dịch vụ ssh-agent chạy; lệnh thứ hai khởi động nó; lệnh thứ ba nạp khoá. Kết quả: `Identity added: ...`. Nếu trong Git Bash, có thể dùng `eval "$(ssh-agent -s)"` rồi `ssh-add ~/.ssh/id_ed25519` như macOS.

### Bước 5. Sao chép khoá công khai
Mục đích: lấy nội dung `.pub` để dán vào GitHub. Chú ý: chỉ sao chép file có đuôi `.pub`.

**Windows (PowerShell):**

```powershell
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | Set-Clipboard
```

**macOS:**

```bash
pbcopy < ~/.ssh/id_ed25519.pub
```

Cả hai lệnh chép nội dung file vào clipboard. Nếu muốn tự xem và chép tay: `cat ~/.ssh/id_ed25519.pub` (Git Bash, macOS). Nội dung có dạng một dòng:

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... ban@example.com
```

Dòng này bắt đầu bằng `ssh-ed25519` và kết thúc bằng comment email. Nếu thấy dòng chứa `BEGIN OPENSSH PRIVATE KEY` nghĩa là bạn mở nhầm khoá riêng: dừng lại, không dán đi đâu.

### Bước 6. Thêm khoá vào GitHub
Mục đích: GitHub nhận ra máy bạn.

1. Trên GitHub, bấm avatar ở góc trên bên phải, chọn **Settings**.
2. Ở thanh bên trái, chọn **SSH and GPG keys**.
3. Bấm **New SSH key**.
4. **Title**: đặt tên dễ nhớ, ví dụ "Laptop Windows".
5. **Key type**: để **Authentication Key**.
6. **Key**: dán nội dung đã chép (Ctrl + V hoặc Command + V).
7. Bấm **Add SSH key**; GitHub có thể hỏi lại mật khẩu.

Kết quả mong đợi: khoá hiện trong danh sách với dấu vân tay (fingerprint) SHA256.

### Bước 7. Kiểm tra kết nối SSH
Mục đích: chắc chắn mọi thứ thông.

```bash
ssh -T git@github.com
```

| Phần của lệnh | Ý nghĩa |
|---------------|---------|
| `ssh` | Chương trình kết nối an toàn đến máy khác |
| `-T` | Không mở phiên dòng lệnh (không cần terminal ảo); chỉ kiểm tra xác thực |
| `git@github.com` | Người dùng `git` trên máy chủ `github.com` (tất cả tài khoản đều vào bằng user `git`) |

Lần đầu máy hỏi:

```text
The authenticity of host 'github.com (...)' can't be established.
ED25519 key fingerprint is SHA256:...
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

Gõ `yes` rồi Enter. Kết quả mong đợi:

```text
Hi ten-cua-ban! You've successfully authenticated, but GitHub does not provide shell access.
```

Câu "does not provide shell access" là bình thường, không phải lỗi. Nếu thấy `Permission denied (publickey)`: khoá chưa được thêm đúng vào GitHub, hoặc agent chưa nạp khoá (quay lại Bước 4 và 6).

### Bước 8. Clone repo về máy
Mục đích: tạo bản sao local từ GitHub. Trên trang repo, bấm nút xanh **Code**, chọn tab **SSH** và sao chép địa chỉ dạng `git@github.com:<username>/git-lab-practice.git`. Rồi chạy:

```bash
git clone git@github.com:ten-cua-ban/git-lab-practice.git
cd git-lab-practice
```

| Phần của lệnh | Ý nghĩa |
|---------------|---------|
| `git clone` | Tải toàn bộ repo (cả lịch sử) về máy |
| `git@github.com:ten-cua-ban/git-lab-practice.git` | Địa chỉ SSH của repo; thay `ten-cua-ban` bằng username của bạn |
| `cd git-lab-practice` | Vào thư mục vừa tạo |

Kết quả mong đợi:

```text
Cloning into 'git-lab-practice'...
remote: Enumerating objects: 4, done.
Receiving objects: 100% (4/4), done.
```

Kiểm tra remote:

```bash
git remote -v
```

Kết quả mong đợi: hai dòng `origin  git@github.com:...(fetch)` và `(push)`. Clone tự đặt tên remote là `origin`.

### Bước 9. Tạo nhánh mới
Mục đích: làm việc tách khỏi `main`.

```bash
git switch -c feat/login-test
```

| Phần của lệnh | Ý nghĩa |
|---------------|---------|
| `git switch` | Chuyển sang nhánh khác |
| `-c` | Create: tạo nhánh mới rồi chuyển sang luôn |
| `feat/login-test` | Tên nhánh; dấu `/` chỉ là quy ước nhóm tên (feat, fix, docs) |

Kết quả mong đợi: `Switched to a new branch 'feat/login-test'`. Xem danh sách nhánh bằng `git branch`; nhánh hiện tại có dấu `*`:

```text
* feat/login-test
  main
```

### Bước 10. Sửa, commit trên nhánh
Mục đích: tạo thay đổi riêng cho nhánh. Tạo file `login.spec.ts` (nội dung tuỳ ý, ví dụ một dòng comment), rồi:

```bash
git add login.spec.ts
git commit -m "feat: thêm test đăng nhập"
```

Kết quả mong đợi: `1 file changed`. Lúc này `main` vẫn không có file này: bạn có thể chứng minh bằng `git switch main` (file biến mất) và `git switch feat/login-test` (file hiện lại).

### Bước 11. Đẩy nhánh lên GitHub
Mục đích: để người khác (và GitHub) thấy nhánh.

```bash
git push -u origin feat/login-test
```

| Phần của lệnh | Ý nghĩa |
|---------------|---------|
| `git push` | Đẩy commit lên remote |
| `-u` | Viết tắt của `--set-upstream`: ghi nhớ rằng nhánh local này gắn với nhánh remote cùng tên; từ lần sau chỉ cần `git push` |
| `origin` | Tên remote |
| `feat/login-test` | Nhánh cần đẩy |

Kết quả mong đợi (rút gọn):

```text
Enumerating objects: 4, done.
To github.com:ten-cua-ban/git-lab-practice.git
 * [new branch]      feat/login-test -> feat/login-test
branch 'feat/login-test' set up to track 'origin/feat/login-test'.
```

Terminal còn có thể in ra một đường dẫn tạo Pull Request.

### Bước 12. Tạo Pull Request trên GitHub
Mục đích: đề nghị hợp nhất nhánh vào `main` và nhờ review.

1. Mở trang repo trên GitHub. Bạn thấy băng vàng "feat/login-test had recent pushes" kèm nút **Compare & pull request**; bấm nút này. (Hoặc vào tab **Pull requests**, bấm **New pull request**, chọn base là `main`, compare là `feat/login-test`.)
2. Kiểm tra dòng trên cùng: **base: main** và **compare: feat/login-test**. Nghĩa là "đưa thay đổi từ compare vào base".
3. Đặt **tiêu đề** rõ ràng, ví dụ "feat: thêm test đăng nhập". Ở ô mô tả, viết bạn đã làm gì, cách kiểm tra.
4. Bấm **Create pull request**.

Kết quả mong đợi: một trang PR với các tab **Conversation**, **Commits**, **Files changed**. Tab Files changed hiển thị từng dòng thêm (xanh) hoặc xoá (đỏ): đây là nơi người review đọc và bình luận.

### Bước 13. Review và merge Pull Request
Mục đích: hợp nhất nhánh vào `main`.

1. Mở tab **Files changed** và tự đọc lại thay đổi. Rê chuột vào số dòng, bấm dấu **+** để để lại bình luận nếu cần.
2. Quay lại tab **Conversation**. Nếu có kiểm tra tự động (CI), chờ dấu xanh.
3. Bấm **Merge pull request**, rồi **Confirm merge**. Ba kiểu merge có thể chọn ở mũi tên cạnh nút: **Create a merge commit** (giữ toàn bộ lịch sử, mặc định), **Squash and merge** (gộp mọi commit thành một), **Rebase and merge** (xếp commit thẳng lên main).
4. Bấm **Delete branch** để xoá nhánh trên GitHub (nhánh đã hợp nhất, không cần nữa).

Kết quả mong đợi: PR chuyển sang màu tím với nhãn **Merged**; file `login.spec.ts` xuất hiện trên `main` ở GitHub.

### Bước 14. Đồng bộ về máy
Mục đích: bản local của `main` cũng có thay đổi vừa merge.

```bash
git switch main
git pull
git branch -d feat/login-test
```

| Lệnh | Ý nghĩa |
|------|---------|
| `git switch main` | Về nhánh chính |
| `git pull` | Tải thay đổi từ origin và hợp nhất vào nhánh hiện tại (thực chất là `git fetch` rồi `git merge`) |
| `git branch -d feat/login-test` | Xoá nhánh local đã merge (`-d` từ chối xoá nếu chưa merge, an toàn; `-D` ép xoá) |

Kết quả mong đợi: `git pull` in `Updating ...` và `1 file changed`; `git log --oneline` thấy commit của bạn và commit merge. Quy trình "nhánh mới, commit, push, PR, merge, pull" là vòng lặp bạn sẽ dùng mỗi ngày.

### Bước 15. Cập nhật tránh xung đột khi main đã đi trước
Mục đích: làm quen với `git fetch` và push bị từ chối. Nếu đồng đội đã merge PR khác vào `main`, nhánh của bạn đã cũ. Cập nhật:

```bash
git fetch origin
git merge origin/main
```

`git fetch origin` chỉ **tải** thông tin mới về (không đụng vào code của bạn). `git merge origin/main` hợp nhất bản `main` mới nhất vào nhánh hiện tại. Nếu xảy ra conflict, xem bài 1.3.

## Demo code
Vòng lặp công việc mỗi ngày:

```bash
git switch main
git pull                              # lấy bản mới nhất
git switch -c fix/flaky-checkout      # tạo nhánh cho công việc
# ... sửa file ...
git add .
git commit -m "fix: chờ nút Thanh toán hiện thay vì sleep"
git push -u origin fix/flaky-checkout # đẩy lên GitHub
# mở GitHub, tạo Pull Request, review, merge
git switch main
git pull
git branch -d fix/flaky-checkout
```

**Merge và rebase** (khái niệm, chưa cần thực hành): `git merge` giữ nguyên lịch sử và tạo thêm một commit hợp nhất; `git rebase main` "viết lại" các commit của nhánh để chúng nằm sau cùng `main`, lịch sử thẳng hơn nhưng làm đổi mã commit nên **không rebase nhánh đã được người khác dùng**. Khi mới học, hãy dùng merge.

## Lỗi thường gặp
- **Triệu chứng:** `Permission denied (publickey)` khi `git clone` hoặc `git push`. **Nguyên nhân:** khoá chưa thêm vào GitHub hoặc agent chưa nạp khoá. **Cách sửa:** chạy `ssh -T git@github.com` để kiểm tra; làm lại Bước 4 và 6.
- **Triệu chứng:** `! [rejected] main -> main (fetch first)` hoặc `non-fast-forward`. **Nguyên nhân:** nhánh remote có commit mới mà bạn chưa có. **Cách sửa:** `git pull` (hoặc `git fetch` rồi `git merge`) rồi push lại; không dùng `--force` khi chưa hiểu.
- **Triệu chứng:** `fatal: The current branch feat/x has no upstream branch`. **Nguyên nhân:** chưa đặt upstream. **Cách sửa:** `git push -u origin feat/x` (lần đầu).
- **Triệu chứng:** sao chép nhầm khoá riêng thay vì khoá công khai. **Nguyên nhân:** mở file không có đuôi `.pub`. **Cách sửa:** nếu lỡ dán đi, xoá khoá đó trên GitHub, tạo cặp khoá mới; chỉ chia sẻ file `.pub`.
- **Triệu chứng:** làm việc trực tiếp trên `main` nên khó hoàn tác. **Cách sửa:** luôn tạo nhánh cho mỗi công việc.
- **Triệu chứng:** `fatal: repository '...' not found`. **Nguyên nhân:** sai username hoặc tên repo, hoặc repo private mà tài khoản không có quyền. **Cách sửa:** sao chép lại địa chỉ từ nút Code.

## Tóm tắt
- Branch giúp làm việc song song; mỗi công việc một nhánh.
- SSH key là cặp khoá: giữ kín khoá riêng, chỉ đưa GitHub khoá `.pub`.
- `git clone` lấy repo, `git push -u origin <nhánh>` đẩy nhánh, `git pull` kéo thay đổi.
- Pull Request là nơi review và merge; xem tab Files changed trước khi merge.
- Sau khi merge, quay về `main`, `git pull`, rồi xoá nhánh đã xong.

## Bài tập
1. Tạo repo trên GitHub, tạo SSH key, thêm vào GitHub. Xong khi: `ssh -T git@github.com` in ra "successfully authenticated".
2. Clone repo về, tạo nhánh, commit và mở một Pull Request. Xong khi: PR hiện trong tab Pull requests với đúng một commit.
3. Tự review PR của mình: đọc lại tab Files changed, để lại một bình luận trên một dòng, rồi merge. Xong khi: PR có nhãn Merged.
4. Đồng bộ về máy bằng `git pull` và xoá nhánh local. Xong khi: `git branch` chỉ còn `main` và `git log` có commit vừa merge.
5. Tạo hai nhánh từ cùng một điểm, merge nhánh thứ nhất bằng PR, rồi cập nhật nhánh thứ hai bằng `git fetch` và `git merge origin/main`. Xong khi: nhánh thứ hai chứa thay đổi của nhánh thứ nhất.
