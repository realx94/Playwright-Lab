---
title: Xử lý conflict, amend và review code
level: 1
order: 3
minutes: 75
summary: Tạo conflict thật rồi giải quyết từng bước với marker, sửa commit gần nhất bằng --amend, và quy trình review Pull Request trên GitHub.
keywords: [git conflict markers, git commit --amend, code review checklist]
---

## Mục tiêu bài học
- Tự tạo một conflict, đọc đúng các dấu `<<<<<<<`, `=======`, `>>>>>>>` và giải quyết hoàn chỉnh.
- Biết huỷ merge bằng `git merge --abort` khi cần làm lại.
- Sửa commit gần nhất (thêm file quên, sửa thông điệp) bằng `git commit --amend` và biết khi nào không được dùng.
- Review một Pull Request trên GitHub: bình luận theo dòng, Approve hoặc Request changes, dựa trên checklist.

## Bạn cần chuẩn bị
- Đã học bài 1.1 và 1.2 (commit, branch, push, Pull Request).
- Terminal và VS Code đã cài (VS Code có giao diện giải quyết conflict thân thiện).
- Một thư mục trống để thực hành, ví dụ `conflict-practice`.

## Kiến thức cần nắm
- Conflict xảy ra khi hai nhánh cùng sửa một vị trí của một file (hoặc một nhánh sửa, nhánh kia xoá).
- Dấu hiệu conflict: `<<<<<<<`, `=======`, `>>>>>>>`.
- Giải quyết: chọn nội dung đúng, xoá các dấu, `git add`, rồi `git commit`.
- `git commit --amend` sửa commit gần nhất (chưa push).
- Review code: đọc thay đổi, kiểm tra logic, đặt tên, test, phản hồi lịch sự.

## Giải thích dễ hiểu
Hai người cùng chỉnh **một câu** trong một tài liệu chung rồi gộp lại: máy không biết nên giữ câu của ai nên đánh dấu cả hai và nhờ bạn quyết định. **Conflict** (xung đột) không phải lỗi, chỉ là Git hỏi ý kiến con người. Nếu hai người sửa hai chỗ khác nhau của một file, Git tự gộp được; chỉ khi chạm đúng cùng dòng mới cần bạn quyết.

Về **amend**: tưởng tượng bạn vừa bỏ thư vào thùng nhưng quên kẹp tờ giấy thứ hai. Nếu thư chưa rời khỏi thùng (chưa push), bạn mở ra kẹp thêm. Nhưng nếu thư đã được người khác nhận (đã push), việc mở lại sẽ khiến mọi người có hai bản khác nhau, nên đừng làm.

## Thực hành từng bước

### Bước 1. Chuẩn bị repo thực hành
Mục đích: có một repo nhỏ với một file cấu hình. Mở terminal:

```bash
mkdir conflict-practice
cd conflict-practice
git init
```

Dùng VS Code (`code .`) để tạo file `config.ts` với nội dung dưới đây. (Nên tạo bằng editor, không dùng `echo` trong PowerShell, vì một số bản PowerShell ghi file bằng bảng mã không phù hợp với Git.)

```ts
export const config = {
  baseURL: "http://localhost:3000",
  timeout: 5000,
  retries: 0,
};
```

Lưu file rồi commit:

```bash
git add config.ts
git commit -m "chore: thêm file cấu hình"
git branch -M main
```

Lệnh `git branch -M main` đổi tên nhánh hiện tại thành `main` (cờ `-M` ép đổi tên, bỏ qua nếu tên đã đúng). Kết quả mong đợi: `git status` báo `On branch main` và `nothing to commit, working tree clean`.

### Bước 2. Tạo nhánh và sửa cùng một dòng (phía nhánh)
Mục đích: dàn dựng tình huống hai người cùng sửa dòng `timeout`.

```bash
git switch -c feat/longer-timeout
```

Mở `config.ts`, đổi `timeout: 5000,` thành `timeout: 10000,`, lưu, rồi:

```bash
git add config.ts
git commit -m "feat: tăng timeout lên 10 giây"
```

Kết quả mong đợi: `1 file changed, 1 insertion(+), 1 deletion(-)`.

### Bước 3. Quay về main và sửa cùng dòng đó khác đi
Mục đích: tạo sự khác biệt thật sự giữa hai nhánh.

```bash
git switch main
```

Mở `config.ts` (lúc này vẫn là bản `timeout: 5000`), đổi thành `timeout: 8000,`, lưu, rồi:

```bash
git add config.ts
git commit -m "feat: tăng timeout lên 8 giây"
```

Bây giờ hai nhánh đều sửa dòng `timeout` theo hai cách khác nhau. Xem lịch sử phân nhánh:

```bash
git log --oneline --graph --all
```

| Cờ | Ý nghĩa |
|----|---------|
| `--oneline` | Mỗi commit một dòng |
| `--graph` | Vẽ cây nhánh bằng ký tự |
| `--all` | Hiện mọi nhánh, không chỉ nhánh hiện tại |

Kết quả mong đợi (mã commit của bạn sẽ khác):

```text
* 7d1e9a2 (HEAD -> main) feat: tăng timeout lên 8 giây
| * c40b3f8 (feat/longer-timeout) feat: tăng timeout lên 10 giây
|/
* 2a9f6e1 chore: thêm file cấu hình
```

### Bước 4. Merge và gặp conflict
Mục đích: để Git phát hiện xung đột. Đang ở `main`, hợp nhất nhánh kia vào:

```bash
git merge feat/longer-timeout
```

`git merge <nhánh>` đưa thay đổi của `<nhánh>` vào nhánh hiện tại. Kết quả mong đợi:

```text
Auto-merging config.ts
CONFLICT (content): Merge conflict in config.ts
Automatic merge failed; fix conflicts and then commit the result.
```

Đừng hoảng. Repo bây giờ ở trạng thái "đang merge dở". Xem trạng thái:

```bash
git status
```

Kết quả mong đợi (rút gọn):

```text
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
        both modified:   config.ts
```

`both modified` nghĩa là hai bên cùng sửa file này. Git cũng nhắc sẵn hai đường ra: sửa tay rồi commit, hoặc `git merge --abort` để quay lại trạng thái trước khi merge.

### Bước 5. Đọc marker trong file
Mục đích: hiểu Git đã ghi gì vào file. Mở `config.ts`:

```text
export const config = {
  baseURL: "http://localhost:3000",
<<<<<<< HEAD
  timeout: 8000,
=======
  timeout: 10000,
>>>>>>> feat/longer-timeout
  retries: 0,
};
```

| Dòng | Ý nghĩa |
|------|---------|
| `<<<<<<< HEAD` | Bắt đầu phần của nhánh **hiện tại** (`HEAD`, ở đây là `main`) |
| `=======` | Vạch ngăn giữa hai phiên bản |
| `>>>>>>> feat/longer-timeout` | Kết thúc phần của nhánh **được merge vào** (tên nhánh hiện ở cuối) |

Phần giữa `<<<<<<<` và `=======` là phiên bản của `main` (8000). Phần giữa `=======` và `>>>>>>>` là phiên bản của nhánh kia (10000). Các dòng ngoài marker (như `baseURL`, `retries`) không xung đột nên Git đã tự giữ.

### Bước 6. Quyết định và sửa file
Mục đích: tạo nội dung cuối cùng. Có ba lựa chọn: giữ bản `main` (8000), giữ bản nhánh (10000), hoặc viết giá trị mới. Giả sử nhóm thống nhất 10000. Sửa file thành:

```ts
export const config = {
  baseURL: "http://localhost:3000",
  timeout: 10000,
  retries: 0,
};
```

Bạn phải xoá **cả ba dòng marker** và dòng của phiên bản bị bỏ. Trong VS Code, bạn sẽ thấy các nút nhỏ phía trên đoạn xung đột: **Accept Current Change** (giữ HEAD), **Accept Incoming Change** (giữ nhánh kia), **Accept Both Changes** (giữ cả hai), **Compare Changes**. Bấm một nút sẽ tự xoá marker. Đây là cách nhanh và ít lỗi, nhưng hãy đọc lại file sau khi bấm.

Kiểm tra nhanh còn sót marker không:

```bash
git diff --check
```

`--check` báo các lỗi như marker conflict còn sót hoặc khoảng trắng thừa. Kết quả mong đợi khi sạch: không in gì. Nếu còn marker, nó in `config.ts:3: leftover conflict marker`.

### Bước 7. Đánh dấu đã giải quyết và hoàn tất merge
Mục đích: báo cho Git biết file đã ổn.

```bash
git add config.ts
git status
```

Kết quả mong đợi: `All conflicts fixed but you are still merging.` và file nằm ở `Changes to be committed`. Hoàn tất bằng commit:

```bash
git commit --no-edit
```

`--no-edit` dùng luôn thông điệp có sẵn của Git (`Merge branch 'feat/longer-timeout'`) mà không mở trình soạn thảo. Kết quả mong đợi: `[main 9be22c4] Merge branch 'feat/longer-timeout'`. Xem lại lịch sử:

```bash
git log --oneline --graph --all
```

Kết quả mong đợi: hai nhánh hợp lại ở commit merge:

```text
*   9be22c4 (HEAD -> main) Merge branch 'feat/longer-timeout'
|\
| * c40b3f8 (feat/longer-timeout) feat: tăng timeout lên 10 giây
* | 7d1e9a2 feat: tăng timeout lên 8 giây
|/
* 2a9f6e1 chore: thêm file cấu hình
```

### Bước 8. Huỷ merge để thử lại (tuỳ chọn)
Mục đích: biết lối thoát khi giải quyết sai. Nếu bạn đang giữa chừng merge dở (đã gặp conflict nhưng chưa commit) và muốn làm lại từ đầu:

```bash
git merge --abort
```

Lệnh này đưa repo về đúng trạng thái trước khi bạn gõ `git merge`, bỏ mọi chỉnh sửa dở. Kết quả mong đợi: `git status` sạch. Hãy thử: đặt lại bằng `git reset --hard HEAD~1` để quay lại trước commit merge (cẩn thận: `--hard` bỏ thay đổi chưa commit), rồi merge lại và thử `--abort`.

### Bước 9. Sửa commit gần nhất bằng `--amend`
Mục đích: gộp thêm một file bị quên vào commit vừa tạo, khi chưa push. Trước tiên tạo một commit mới để thực hành: sửa `retries: 0` thành `retries: 1` trong `config.ts`, rồi `git add config.ts` và `git commit -m "feat: bật retry một lần"`. Giả sử bạn quên đưa file `login.spec.ts` vào commit đó. Tạo file `login.spec.ts` (nội dung tuỳ ý) rồi:

```bash
git add login.spec.ts
git commit --amend --no-edit
```

| Phần của lệnh | Ý nghĩa |
|---------------|---------|
| `git commit --amend` | Thay commit gần nhất bằng một commit mới có thêm nội dung đang ở staging |
| `--no-edit` | Giữ nguyên thông điệp cũ |

Kết quả mong đợi: `git log --oneline` vẫn có cùng số commit, nhưng mã commit trên cùng **đã đổi** (vì nó là một commit mới thay thế). Và `git show --stat` cho thấy commit chứa cả hai file.

Chỉ sửa thông điệp:

```bash
git commit --amend -m "feat: tăng timeout và thêm test đăng nhập"
```

Quy tắc vàng: **chỉ `--amend` commit chưa push**. Nếu đã push, mã commit cũ tồn tại trên GitHub; amend tạo mã mới nên lần push sau sẽ bị từ chối (`rejected, non-fast-forward`) và buộc bạn dùng `--force`, gây rắc rối cho đồng đội. Với commit đã push, hãy tạo commit mới.

### Bước 10. Giải quyết conflict của Pull Request trên GitHub
Mục đích: biết xử lý khi PR báo "This branch has conflicts that must be resolved". Cách an toàn nhất là làm trên máy, dùng cùng kỹ thuật ở trên:

```bash
git switch feat/ten-nhanh-cua-ban
git fetch origin
git merge origin/main
```

Gặp conflict thì làm Bước 5 đến 7, rồi `git push`. PR trên GitHub sẽ tự cập nhật và biết hết xung đột. GitHub cũng có nút **Resolve conflicts** trong trang PR để sửa trên web cho các xung đột đơn giản, nhưng làm trên máy giúp bạn chạy lại test trước khi đẩy.

### Bước 11. Review Pull Request trên GitHub
Mục đích: cho phản hồi hữu ích. Giao diện GitHub có thể thay đổi nhẹ. Khi được giao review một PR:

1. Mở PR, đọc phần mô tả để hiểu mục tiêu.
2. Bấm tab **Files changed**. Mỗi file hiện các dòng thêm (nền xanh) và xoá (nền đỏ).
3. Rê chuột vào số dòng, bấm dấu **+** xanh, viết bình luận gắn vào đúng dòng đó, chọn **Start a review** (gom nhiều bình luận rồi gửi một lần), hoặc **Add single comment**.
4. Khi đọc xong, bấm nút **Review changes** (góc trên bên phải), viết nhận xét tổng, và chọn một trong ba:
   - **Comment**: chỉ góp ý, không chặn.
   - **Approve**: đồng ý cho merge.
   - **Request changes**: yêu cầu sửa trước khi merge.
5. Bấm **Submit review**.

Người viết PR sửa theo góp ý, đẩy commit mới lên cùng nhánh (PR tự cập nhật), rồi bấm **Resolve conversation** ở các bình luận đã xử lý.

Phong cách phản hồi tốt: nói về code chứ không về con người; nêu lý do ("`waitForTimeout` dễ làm test flaky vì..."); đề xuất cách sửa; khen khi có điểm tốt.

## Checklist review code
- Test có kiểm tra đúng điều cần kiểm tra không (có `expect` có ý nghĩa)?
- Có `waitForTimeout` hoặc locator mong manh (dựa vào CSS sâu, thứ tự) không?
- Tên test và biến có rõ nghĩa không?
- Có lộ khoá bí mật, mật khẩu thật, file `.env` không?
- Test có độc lập (không phụ thuộc test khác chạy trước) không?
- Thay đổi có nhỏ và tập trung vào một việc không?

## Demo code
Tóm tắt luồng giải quyết conflict:

```bash
git switch main
git merge feat/longer-timeout     # gặp CONFLICT
git status                        # xem file nào xung đột
# mở file, chọn nội dung đúng, xoá ba loại marker
git diff --check                  # kiểm tra còn sót marker không
git add config.ts                 # báo đã giải quyết
git commit --no-edit              # hoàn tất merge
```

Sửa commit gần nhất khi quên một file:

```bash
git add tests/forgotten.spec.ts
git commit --amend --no-edit
```

## Lỗi thường gặp
- **Triệu chứng:** test báo lỗi cú pháp kỳ lạ, trong file thấy `<<<<<<< HEAD`. **Nguyên nhân:** quên xoá marker sau khi giải quyết. **Cách sửa:** chạy `git diff --check` hoặc tìm `<<<<<<<` trong VS Code (Ctrl + Shift + F) rồi xoá.
- **Triệu chứng:** `error: Committing is not possible because you have unmerged files`. **Nguyên nhân:** chưa `git add` file đã giải quyết. **Cách sửa:** `git add <file>` rồi `git commit`.
- **Triệu chứng:** sau `git commit --amend` rồi push, báo `! [rejected] (non-fast-forward)`. **Nguyên nhân:** amend commit đã push làm lịch sử local lệch với remote. **Cách sửa:** nếu nhánh chỉ mình bạn dùng, `git push --force-with-lease`; nếu nhiều người dùng, đừng amend, tạo commit mới.
- **Triệu chứng:** giải quyết conflict xong nhưng giữ sai phiên bản, tính năng của đồng đội biến mất. **Nguyên nhân:** chọn "Accept Current" mà không đọc. **Cách sửa:** đọc cả hai phiên bản, hỏi tác giả nếu cần, rồi chạy test trước khi commit.
- **Triệu chứng:** review chỉ nhận xét phong cách mà bỏ sót lỗi logic. **Cách sửa:** chạy PR, đọc test, dùng checklist ở trên.

## Tóm tắt
- Conflict là Git nhờ bạn chọn nội dung; đọc marker: HEAD ở trên, nhánh kia ở dưới.
- Quy trình: `git merge`, mở file, sửa và xoá marker, `git add`, `git commit`.
- `git merge --abort` đưa mọi thứ về trước lúc merge.
- `git commit --amend` chỉ cho commit chưa push.
- Review hiệu quả cần checklist và phản hồi lịch sự, có lý do.

## Bài tập
1. Tạo hai nhánh cùng sửa một dòng, merge và giải quyết conflict. Xong khi: `git log --graph --all` có commit merge và file không còn marker nào.
2. Làm lại conflict đó nhưng chọn cách `git merge --abort`, rồi merge lại và giải quyết bằng cách giữ cả hai giá trị theo cách bạn đề xuất. Xong khi: bạn giải thích được lựa chọn.
3. Tạo một commit, quên một file, sửa bằng `git commit --amend --no-edit`. Xong khi: lịch sử không có thêm commit và `git show --stat` có đủ hai file.
4. Tạo PR có conflict trên GitHub (hai nhánh cùng sửa một dòng, merge nhánh thứ nhất trước), rồi giải quyết trên máy và đẩy lại. Xong khi: PR hết cảnh báo conflict.
5. Review một PR của bạn (hoặc của bạn học) bằng checklist ở trên và gửi review với ít nhất hai bình luận theo dòng. Xong khi: có một review đã Submit.
