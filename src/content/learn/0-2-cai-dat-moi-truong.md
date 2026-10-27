---
title: Cài đặt môi trường
level: 0
order: 2
minutes: 45
summary: Cài Node.js bằng NVM, Git, VS Code trên Windows và macOS, kiểm tra từng phiên bản bằng lệnh và hiểu vai trò của từng công cụ.
keywords: [nvm là gì, npm vs npx, node.js lts]
---

## Mục tiêu bài học
- Mở được terminal đúng cách trên Windows (PowerShell) hoặc macOS (Terminal) và hiểu thông báo cơ bản.
- Cài được Git, NVM, Node.js LTS và VS Code trên máy của bạn.
- Tự kiểm tra thành công bằng `git --version`, `node -v`, `npm -v`, `npx -v` và đối chiếu kết quả mong đợi.
- Phân biệt được vai trò của Node.js, npm, npx, NVM, Git và VS Code.
- Xử lý được các lỗi hay gặp như "command not found" hoặc "is not recognized".

## Bạn cần chuẩn bị
- Một máy tính Windows 10/11 hoặc macOS, có kết nối Internet và quyền cài phần mềm (trên Windows đôi khi cần quyền Administrator).
- Khoảng 2 GB ổ đĩa trống (trình duyệt của Playwright ở bài sau sẽ chiếm thêm).
- Đã đọc bài 0.1 (không bắt buộc).

## Kiến thức cần nắm
- Node.js là môi trường chạy JavaScript ngoài trình duyệt; Playwright chạy trên Node.js.
- NVM (Node Version Manager) cho phép cài nhiều phiên bản Node và chuyển qua lại.
- npm là trình quản lý gói đi kèm Node; `npx` chạy một gói mà không cần cài toàn cục.
- Git lưu lịch sử thay đổi mã nguồn.
- VS Code là trình soạn thảo, có extension riêng cho Playwright.
- LTS (Long Term Support) là phiên bản Node được hỗ trợ lâu dài, ổn định, nên dùng cho công việc.

## Giải thích dễ hiểu
Hãy coi máy bạn là một **căn bếp**. Node.js là cái bếp, npm là siêu thị cung cấp nguyên liệu (thư viện), VS Code là mặt bàn bạn nấu, Git là cuốn sổ ghi lại mỗi lần bạn đổi công thức. NVM giống như một bộ bếp có thể thay đầu đốt: hôm nay dùng bếp ga, mai dùng bếp từ mà không phải dọn lại cả căn bếp.

Vì sao dùng NVM thay vì tải thẳng Node từ trang chủ? Mỗi dự án có thể yêu cầu một phiên bản Node khác nhau. Nếu cài trực tiếp, đổi phiên bản đồng nghĩa gỡ và cài lại. Với NVM, bạn chạy một lệnh để đổi. Đây là thói quen chuyên nghiệp nên tập từ đầu.

### Terminal là gì và cách đọc
**Terminal** (cửa sổ dòng lệnh) là nơi bạn gõ lệnh thay vì bấm chuột. Dòng đầu tiên thường hiện **prompt** (dấu nhắc) cho biết bạn đang đứng ở thư mục nào, ví dụ `PS C:\Users\ban>` trong PowerShell hoặc `ban@may-cua-ban ~ %` trong macOS. Bạn gõ lệnh sau dấu nhắc rồi nhấn Enter. Khi tài liệu viết dòng bắt đầu bằng `#` trong khối lệnh, đó là **chú thích**, không cần gõ.

Cách mở terminal:
- Windows: bấm phím Windows, gõ `PowerShell`, chọn **Windows PowerShell** (hoặc **Terminal**). Cài Git xong, bạn có thêm **Git Bash** (dòng lệnh kiểu Unix).
- macOS: bấm Command + Space, gõ `Terminal`, nhấn Enter.

## Thực hành từng bước

### Bước 1. Cài Git
Mục đích: có công cụ quản lý phiên bản (bài 1.1 đến 1.3 sẽ dạy cách dùng).

**Windows.** Mở PowerShell và chạy:

```powershell
winget install --id Git.Git -e --source winget
```

| Phần của lệnh | Ý nghĩa |
|---------------|---------|
| `winget` | Trình cài đặt phần mềm có sẵn trên Windows 10/11 |
| `install` | Lệnh con: cài một ứng dụng |
| `--id Git.Git` | Mã định danh chính xác của gói Git |
| `-e` | Viết tắt của `--exact`: chỉ khớp đúng tên, tránh cài nhầm gói khác |
| `--source winget` | Lấy gói từ kho chính thức của winget |

Kết quả mong đợi: các dòng "Found Git", "Downloading", "Successfully installed". Nếu không có `winget`, vào trang git-scm.com, tải bản Windows, chạy file cài đặt và bấm Next ở các bước (giữ mặc định). Nếu hỏi, chọn "Git from the command line and also from 3rd-party software".

**macOS.** Mở Terminal và chạy:

```bash
git --version
```

Nếu máy chưa có Git, macOS hiện hộp thoại đề nghị cài **Command Line Tools**: bấm Install, chờ vài phút. Cách khác nếu bạn dùng Homebrew: `brew install git`.

Sau khi cài, **đóng terminal đang mở rồi mở lại** (rất quan trọng, xem phần Lỗi thường gặp), rồi kiểm tra:

```bash
git --version
```

Kết quả mong đợi (số phiên bản có thể khác):

```text
git version 2.47.0.windows.1
```

Trên macOS có thể là `git version 2.39.5 (Apple Git-154)`. Chỉ cần thấy chữ `git version` kèm số.

Nếu gặp lỗi: dòng `git : The term 'git' is not recognized` (Windows) hoặc `git: command not found` (macOS) nghĩa là terminal chưa biết đường dẫn của Git: đóng và mở lại terminal, nếu vẫn lỗi thì khởi động lại máy.

### Bước 2. Cài NVM
Mục đích: quản lý phiên bản Node.js.

**Windows** dùng **nvm-windows** (một dự án riêng, tên lệnh giống nhưng khác nvm trên macOS). Chạy:

```powershell
winget install --id CoreyButler.NVMforWindows -e
```

Kết quả mong đợi: "Successfully installed". Nếu không dùng được winget, vào trang các bản phát hành của dự án nvm-windows trên GitHub (coreybutler/nvm-windows) và tải file `nvm-setup.exe`, chạy và giữ mặc định. **Đóng hết cửa sổ PowerShell và mở lại**, rồi kiểm tra:

```powershell
nvm version
```

Kết quả mong đợi: một số phiên bản như `1.2.2`. (Ở nvm-windows, lệnh là `nvm version`, cũng chấp nhận `nvm -v`.)

**macOS** dùng script chính thức của nvm (dự án nvm-sh). Chạy:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
```

| Phần của lệnh | Ý nghĩa |
|---------------|---------|
| `curl` | Công cụ tải nội dung từ một URL |
| `-o-` | Ghi nội dung tải về ra đầu ra chuẩn thay vì lưu thành file |
| `bash` | Chạy nội dung vừa tải như một script |

Ký hiệu thanh đứng giữa hai lệnh là **pipe** (ống dẫn): nó chuyển đầu ra của `curl` làm đầu vào của `bash`.

Số `v0.40.8` là phiên bản script; bạn có thể xem phiên bản mới nhất ở trang GitHub của nvm-sh/nvm. Sau đó **đóng và mở lại Terminal**, rồi chạy:

```bash
nvm --version
```

Kết quả mong đợi: `0.40.8` (hoặc phiên bản bạn cài). Nếu báo `nvm: command not found`, script chưa ghi vào file cấu hình shell; macOS mặc định dùng zsh nên chạy `source ~/.zshrc` rồi thử lại. Nếu vẫn lỗi, mở `~/.zshrc` kiểm tra có các dòng `export NVM_DIR=...` do script thêm vào không.

### Bước 3. Cài Node.js LTS bằng NVM
Mục đích: có Node.js và npm để chạy Playwright.

**Windows (PowerShell chạy bằng quyền Administrator)**, vì `nvm use` tạo liên kết hệ thống. Bấm phải vào PowerShell, chọn "Run as administrator":

```powershell
nvm install lts
nvm use lts
```

| Lệnh | Ý nghĩa |
|------|---------|
| `nvm install lts` | Tải và cài bản Node LTS mới nhất |
| `nvm use lts` | Chọn bản đó làm bản đang dùng cho mọi terminal |

Kết quả mong đợi: sau `nvm install lts` bạn thấy dòng tải về và "Installation complete". Sau `nvm use lts` thấy dòng dạng `Now using node vXX.x.x (64-bit)` (XX là số bản LTS hiện hành) (số cụ thể phụ thuộc thời điểm).

**macOS:**

```bash
nvm install --lts
nvm use --lts
```

Cờ `--lts` nói với nvm chọn nhánh LTS. Kết quả mong đợi: dòng dạng `Now using node vXX.x.x (npm vY.x.x)` với bản LTS hiện hành.

Kiểm tra phiên bản (cả hai hệ điều hành):

```bash
node -v
npm -v
npx -v
```

| Lệnh | Ý nghĩa | Kết quả mong đợi (ví dụ) |
|------|---------|--------------------------|
| `node -v` | In phiên bản Node.js | `v22.11.0` (bắt đầu bằng chữ v) |
| `npm -v` | In phiên bản npm | `10.9.0` |
| `npx -v` | In phiên bản npx | `10.9.0` (trùng npm) |

Số chính xác của bạn sẽ khác, miễn là Node là phiên bản LTS còn được hỗ trợ (Playwright yêu cầu Node hiện đại, nên không dùng bản quá cũ như 14 hay 16).

Nếu gặp lỗi: `nvm : The term 'nvm' is not recognized` nghĩa là chưa mở lại terminal sau khi cài NVM. `exit status 5` hoặc "Access is denied" trên Windows nghĩa là cần mở PowerShell bằng quyền Administrator. `node: command not found` sau khi cài trên macOS nghĩa là chưa chạy `nvm use --lts`.

### Bước 4. Xem và đổi phiên bản bằng NVM
Mục đích: biết cách quay lại bản cũ khi dự án đòi hỏi.

```bash
nvm ls
```

Lệnh này (`ls` là list) liệt kê các bản Node đã cài; bản đang dùng có dấu `*` (Windows) hoặc mũi tên `->` (macOS). Để thử bản khác, ví dụ cài Node 20:

```bash
nvm install 20
nvm use 20
node -v
```

Kết quả mong đợi: `node -v` in ra `v20.x.x`. Quay lại LTS bằng `nvm use lts` (Windows) hoặc `nvm use --lts` (macOS). Bạn vừa tận mắt thấy NVM đổi phiên bản trong vài giây.

### Bước 5. Cài VS Code và extension Playwright
Mục đích: có nơi viết và chạy test thuận tiện.

**Windows:**

```powershell
winget install --id Microsoft.VisualStudioCode -e
```

**macOS:** tải file từ trang code.visualstudio.com, kéo ứng dụng vào thư mục Applications; hoặc `brew install --cask visual-studio-code`.

Mở VS Code, bấm biểu tượng Extensions ở thanh bên trái (hoặc Ctrl + Shift + X trên Windows, Command + Shift + X trên macOS), tìm **Playwright Test for VSCode** (tác giả Microsoft) rồi bấm Install. Kết quả mong đợi: sau khi cài, thanh bên có biểu tượng bình thí nghiệm (Testing) để chạy test; extension sẽ có ích từ bài 0.3.

Để mở VS Code từ terminal tại thư mục hiện tại, gõ `code .` (dấu chấm nghĩa là "thư mục hiện tại"). Nếu báo `code` không nhận ra, trên macOS mở VS Code, bấm Command + Shift + P và chạy "Shell Command: Install 'code' command in PATH".

### Bước 6. Tổng kiểm tra
Mở terminal mới và chạy lần lượt:

```bash
git --version
node -v
npm -v
```

Kết quả mong đợi: ba dòng, mỗi dòng có số phiên bản, không có chữ "not recognized" hay "not found". Chụp màn hình để đối chiếu khi nhờ người khác hỗ trợ. Hướng dẫn kèm checklist ở trang [Starter](/starter).

## Lỗi thường gặp
- **Triệu chứng:** `'nvm' is not recognized` hoặc `node: command not found` ngay sau khi cài. **Nguyên nhân:** terminal đang mở được khởi tạo trước khi cài, chưa nạp lại biến môi trường PATH. **Cách sửa:** đóng hẳn terminal, mở lại; nếu vẫn lỗi, khởi động lại máy.
- **Triệu chứng:** `node -v` hiện phiên bản lạ, không phải bản bạn cài bằng NVM. **Nguyên nhân:** từng cài Node trực tiếp nên hai bản xung đột. **Cách sửa:** gỡ bản Node cũ (Windows: Settings, Apps; macOS: gỡ bản cài thủ công), rồi cài lại qua NVM.
- **Triệu chứng:** "Access is denied" hoặc `exit status 5` khi `nvm use`. **Nguyên nhân:** thiếu quyền Administrator trên Windows. **Cách sửa:** mở PowerShell bằng "Run as administrator".
- **Triệu chứng:** lệnh `npm` báo lỗi về "running scripts is disabled on this system" trong PowerShell. **Nguyên nhân:** chính sách thực thi script mặc định. **Cách sửa:** chạy `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` một lần, hoặc dùng Git Bash.
- **Triệu chứng:** dùng Node quá cũ nên Playwright báo lỗi cú pháp lạ. **Cách sửa:** luôn dùng bản LTS (`nvm use lts`).

## Tóm tắt
- Terminal là nơi bạn chạy lệnh; sau khi cài phần mềm phải mở terminal mới.
- NVM quản lý nhiều phiên bản Node; luôn dùng bản LTS cho Playwright.
- Kiểm tra thành công bằng `git --version`, `node -v`, `npm -v`.
- npm cài gói, npx chạy gói; cả hai đi kèm Node.
- VS Code cùng extension Playwright Test giúp chạy và gỡ lỗi test.

## Bài tập
1. Chạy `node -v`, `npm -v`, `git --version` và chụp kết quả. Xong khi: cả ba lệnh in ra số phiên bản và Node là bản LTS.
2. Dùng NVM cài thêm một phiên bản Node khác (ví dụ 20), chuyển sang rồi quay lại bản LTS. Xong khi: `node -v` thay đổi theo từng lần chuyển.
3. Cài extension Playwright Test for VSCode và tìm biểu tượng Testing ở thanh bên. Xong khi: bạn thấy được khung Testing (có thể còn trống).
4. Cố ý mở một terminal cũ (đã mở từ trước khi cài) và quan sát lỗi, rồi sửa bằng cách mở terminal mới. Xong khi: bạn giải thích được vì sao lỗi biến mất.
