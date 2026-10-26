---
title: Viết tài liệu bằng Markdown
level: 1
order: 4
minutes: 40
summary: Học cú pháp Markdown từng phần, viết README, bảng test case và bug report rõ ràng, xem trước trong VS Code và trên GitHub.
keywords: [markdown cheatsheet, viết bug report, readme tốt]
---

## Mục tiêu bài học
- Dùng thành thạo tiêu đề, danh sách, in đậm, in nghiêng, code, liên kết, hình ảnh, bảng và blockquote.
- Viết được README cho một project Playwright gồm giới thiệu, cài đặt, cách chạy test và cấu trúc thư mục.
- Viết được bug report theo mẫu (các bước, kết quả mong đợi, kết quả thực tế, môi trường) và test case dạng bảng.
- Xem trước Markdown trong VS Code và biết file `.md` hiển thị đẹp trên GitHub.

## Bạn cần chuẩn bị
- VS Code đã cài (bài 0.2). Không cần cài thêm extension vì VS Code có sẵn chế độ xem trước Markdown.
- Biết commit file lên GitHub (bài 1.1 và 1.2) để xem README hiển thị thật.
- Tuỳ chọn: mở `/lab/login` để lấy ví dụ cho bài tập bug report.

## Kiến thức cần nắm
- Tiêu đề: `#`, `##`, `###`.
- Danh sách có thứ tự và không thứ tự.
- **In đậm**, *in nghiêng*, `code nội dòng`.
- Khối code với ba dấu huyền và tên ngôn ngữ.
- Bảng, liên kết, hình ảnh, blockquote, danh sách việc (task list).

## Giải thích dễ hiểu
**Markdown** là cách **ghi chú nhanh nhưng có định dạng**: bạn gõ ký hiệu đơn giản như `#` hay `-`, GitHub và nhiều công cụ tự biến chúng thành tiêu đề, danh sách. Giống soạn tin nhắn có gạch đầu dòng mà không cần chuột. File Markdown là file văn bản thường (đuôi `.md`) nên Git theo dõi được từng dòng thay đổi, khác với file Word nhị phân.

Vì sao một QA cần biết Markdown? Ba lý do. Thứ nhất, README là "cửa chính" của project: người mới đọc nó trước tiên. Thứ hai, bug report và mô tả Pull Request trên GitHub, Jira, Azure DevOps đều hỗ trợ Markdown hoặc tương tự. Thứ ba, tài liệu viết bằng Markdown đi cùng code, được review qua Pull Request như code.

Một điểm cần nhớ: Markdown có vài "phương ngữ". Cú pháp trong bài này là **GitHub Flavored Markdown (GFM)**, phổ biến nhất, đủ dùng cho hầu hết công cụ.

## Thực hành từng bước
Hãy tạo một thư mục `md-practice`, mở bằng VS Code và tạo file `practice.md`. Với mỗi bước, gõ phần mã, rồi bấm Ctrl + Shift + V (Windows) hoặc Command + Shift + V (macOS) để mở **Markdown Preview** (xem trước) và đối chiếu kết quả. Bạn cũng có thể bấm biểu tượng "Open Preview to the Side" ở góc trên bên phải editor để xem song song.

### Bước 1. Tiêu đề
Mục đích: chia bài thành các phần có cấp bậc.

```markdown
# Tiêu đề cấp 1: tên project
## Tiêu đề cấp 2: một mục lớn
### Tiêu đề cấp 3: mục con
```

| Phần | Ý nghĩa |
|------|---------|
| `#` | Một dấu thăng là tiêu đề cấp 1 (lớn nhất) |
| `##`, `###` | Càng nhiều dấu thăng, cấp càng nhỏ (tới `######`) |
| Dấu cách sau `#` | Bắt buộc; thiếu dấu cách thì không thành tiêu đề |

Kết quả mong đợi: ba dòng chữ có cỡ chữ giảm dần. Quy ước tốt: mỗi tài liệu chỉ có **một** tiêu đề cấp 1.

### Bước 2. Đoạn văn, xuống dòng, in đậm, in nghiêng
Mục đích: định dạng chữ thường.

```markdown
Đây là đoạn thứ nhất. Playwright là công cụ **kiểm thử tự động** viết bằng *TypeScript*.

Đây là đoạn thứ hai (cách đoạn một bằng một dòng trống).
```

| Cú pháp | Kết quả |
|---------|---------|
| `**chữ**` | **chữ** (in đậm, hai dấu sao mỗi bên) |
| `*chữ*` hoặc `_chữ_` | *chữ* (in nghiêng, một dấu sao hoặc gạch dưới) |
| `~~chữ~~` | gạch ngang chữ (GFM) |

Kết quả mong đợi: hai đoạn riêng biệt. **Quy tắc quan trọng**: muốn tách đoạn, cần **một dòng trống** ở giữa; nếu chỉ xuống dòng một lần, Markdown gộp thành một đoạn.

### Bước 3. Danh sách
Mục đích: liệt kê các bước hoặc ý.

```markdown
Danh sách không thứ tự:
- Cài Node.js
- Cài Git
  - Cấu hình user.name
  - Cấu hình user.email

Danh sách có thứ tự:
1. Mở terminal
2. Chạy `npm install`
3. Chạy `npx playwright test`

Danh sách việc cần làm:
- [x] Cài VS Code
- [ ] Viết README
```

| Cú pháp | Ý nghĩa |
|---------|---------|
| `-` (hoặc `*`) đầu dòng | Mục không thứ tự |
| `1.` đầu dòng | Mục có thứ tự (số sẽ tự đánh lại, nên có thể gõ toàn `1.`) |
| Thụt vào hai dấu cách | Tạo mục con |
| `- [ ]` và `- [x]` | Ô tick chưa xong và đã xong (task list của GFM) |

Kết quả mong đợi: danh sách có chấm tròn, danh sách đánh số, và hai ô tick (một ô đã tick). Đừng quên dòng trống trước khi bắt đầu danh sách nếu nó theo sau một đoạn văn.

### Bước 4. Code nội dòng và khối code
Mục đích: hiển thị lệnh và code giữ nguyên định dạng. Dùng dấu huyền (backtick, phím nằm bên trái số 1) bao quanh: `npm install` là code nội dòng. Với nhiều dòng, dùng khối code. Ví dụ dưới đây dùng ba dấu `~` ở ngoài để có thể hiển thị cả ba dấu huyền bên trong:

~~~markdown
```ts
import { test, expect } from "@playwright/test";

test("ví dụ", async ({ page }) => {
  await page.goto("/");
});
```
~~~

| Phần | Ý nghĩa |
|------|---------|
| Ba dấu huyền mở đầu | Bắt đầu khối code |
| `ts` ngay sau đó | Tên ngôn ngữ để tô màu cú pháp (`bash`, `json`, `text`, `yaml`...) |
| Ba dấu huyền đóng | Kết thúc khối code |

Kết quả mong đợi: khung nền xám, chữ đơn cách (monospace), có tô màu. Dùng `text` cho output của lệnh, `bash` cho lệnh terminal. Nếu muốn viết một ký tự backtick trong code nội dòng, bao bằng hai dấu huyền.

### Bước 5. Liên kết và hình ảnh
Mục đích: dẫn đến tài liệu khác, chèn ảnh chụp màn hình.

```markdown
Xem [tài liệu Playwright](https://playwright.dev) để biết thêm.

![Màn hình đăng nhập](images/login.png)
```

| Phần | Ý nghĩa |
|------|---------|
| `[chữ hiển thị](địa chỉ)` | Liên kết: chữ trong ngoặc vuông, địa chỉ trong ngoặc tròn |
| `!` đứng trước | Biến thành hình ảnh thay vì liên kết |
| `[Màn hình đăng nhập]` | Văn bản thay thế (alt text): hiện khi ảnh lỗi và hỗ trợ người đọc màn hình |
| `images/login.png` | Đường dẫn tương đối đến file ảnh trong repo |

Kết quả mong đợi: chữ "tài liệu Playwright" màu xanh bấm được; ảnh hiện nếu file `images/login.png` tồn tại cạnh file `.md`. Nếu ảnh không hiện, kiểm tra đường dẫn và tên file (phân biệt hoa thường trên GitHub).

### Bước 6. Bảng
Mục đích: trình bày test case hoặc dữ liệu có cột.

```markdown
| Mã | Test case | Kết quả mong đợi |
|----|-----------|------------------|
| TC1 | Mật khẩu 8 ký tự | Đăng nhập thành công |
| TC2 | Mật khẩu 7 ký tự | Báo lỗi tối thiểu 8 ký tự |
```

| Phần | Ý nghĩa |
|------|---------|
| Dòng đầu | Tiêu đề các cột |
| Dòng thứ hai (`---`) | Bắt buộc, ngăn tiêu đề với dữ liệu; số cột phải bằng dòng đầu |
| `:---`, `:---:`, `---:` | Căn trái, giữa, phải |

Kết quả mong đợi: bảng có đường kẻ. Các dấu `|` không cần thẳng hàng khi gõ, miễn số cột đủ. Không đặt ký tự `|` trong nội dung ô, nó sẽ làm vỡ cột.

### Bước 7. Blockquote và đường kẻ ngang
Mục đích: nhấn mạnh ghi chú, trích dẫn.

```markdown
> Lưu ý: luôn chạy test ở môi trường staging, không chạy trên production.

---
```

Dấu `>` đầu dòng tạo khối trích dẫn (thường dùng cho ghi chú, cảnh báo). Ba gạch `---` trên một dòng riêng, có dòng trống phía trên, tạo đường kẻ ngang. Kết quả mong đợi: ghi chú có thanh dọc bên trái; một đường kẻ ngang bên dưới.

### Bước 8. Ghép lại thành README
Mục đích: viết một README hoàn chỉnh. Tạo `README.md` cho project Playwright của bạn:

```markdown
# Playwright Lab Tests

Bộ test tự động cho trang [Playwright Lab](https://playwright.dev) viết bằng TypeScript.

## Cài đặt
1. Cài Node.js LTS
2. Chạy `npm install`
3. Chạy `npx playwright install`

## Chạy test
- Tất cả test: `npx playwright test`
- Một file: `npx playwright test tests/login.spec.ts`
- Xem báo cáo: `npx playwright show-report`

## Cấu trúc thư mục
| Thư mục | Nội dung |
|---------|----------|
| `tests/` | Các file `*.spec.ts` |
| `playwright.config.ts` | Cấu hình Playwright |

> Đặt biến `BASE_URL` trong file `.env` (không commit file này).
```

Kết quả mong đợi: preview có đủ tiêu đề, danh sách đánh số, danh sách chấm, bảng và blockquote. Commit rồi push lên GitHub (bài 1.2): GitHub tự hiển thị `README.md` ở trang chủ repo.

### Bước 9. Viết bug report mẫu
Mục đích: viết lỗi sao cho developer tái hiện được ngay. Một bug report tốt có: tiêu đề cụ thể, các bước tái hiện, kết quả mong đợi, kết quả thực tế, môi trường, bằng chứng. Xem mẫu ở phần Demo code. Nguyên tắc: một bug một report; tiêu đề nêu **chỗ nào** và **hiện tượng gì**, không viết "Login lỗi".

## Demo code
Mẫu bug report ngắn gọn:

```markdown
## [Login] Mật khẩu 7 ký tự vẫn được chấp nhận

**Các bước**
1. Mở `/lab/login?bugs=BUG-01`
2. Nhập email hợp lệ `user@lab.dev` và mật khẩu `Pass0r!` (7 ký tự)
3. Bấm Đăng nhập

**Kết quả mong đợi:** báo "Mật khẩu tối thiểu 8 ký tự"
**Kết quả thực tế:** không có thông báo lỗi

| Môi trường | Trình duyệt |
|------------|-------------|
| Local      | Chromium    |
```

Giải thích: tiêu đề có tag `[Login]` giúp lọc; các bước đánh số để làm lại đúng thứ tự; dữ liệu cụ thể (`Pass0r!`) giúp tái hiện; hai dòng đậm chia rõ mong đợi và thực tế; bảng ghi môi trường.

Mẫu test case dạng bảng:

```markdown
| ID | Điều kiện | Dữ liệu | Kết quả mong đợi |
|----|-----------|---------|------------------|
| TC-01 | Tài khoản hợp lệ | user@lab.dev, Passw0rd! | Vào dashboard |
| TC-02 | Mật khẩu 7 ký tự | user@lab.dev, Pass0r! | Báo lỗi tối thiểu 8 |
```

## Thử ngay trong lab
Mở `/lab/login?bugs=BUG-01`, làm đúng các bước trong bug report mẫu và xác nhận bạn thấy "kết quả thực tế". Sau đó mở `/lab/login` (không bật bug) và so sánh hành vi. Dùng cách ghi này làm khuôn cho mọi bug bạn tìm thấy ở các lab khác.

## Lỗi thường gặp
- **Triệu chứng:** hai đoạn văn bị dính thành một. **Nguyên nhân:** thiếu dòng trống giữa các đoạn. **Cách sửa:** thêm một dòng trống.
- **Triệu chứng:** bảng hiện ra như văn bản thô. **Nguyên nhân:** thiếu dòng `---` phân cách tiêu đề hoặc số cột không khớp. **Cách sửa:** thêm dòng phân cách, đếm lại số cột.
- **Triệu chứng:** tiêu đề không thành tiêu đề, hiện nguyên chữ `#`. **Nguyên nhân:** thiếu dấu cách sau `#`. **Cách sửa:** viết `# Tiêu đề`.
- **Triệu chứng:** khối code không tô màu hoặc nuốt cả văn bản phía dưới. **Nguyên nhân:** thiếu ba dấu huyền đóng hoặc quên tên ngôn ngữ. **Cách sửa:** đóng khối bằng ba dấu huyền và ghi ngôn ngữ.
- **Triệu chứng:** ảnh không hiện trên GitHub. **Nguyên nhân:** sai đường dẫn hoặc quên commit file ảnh. **Cách sửa:** kiểm tra đường dẫn tương đối, `git add` file ảnh.
- **Triệu chứng:** dán ảnh chụp chứa dữ liệu nhạy cảm vào báo cáo công khai. **Cách sửa:** che hoặc cắt phần nhạy cảm (token, email thật) trước khi đưa vào.

## Tóm tắt
- Markdown là văn bản thuần có ký hiệu định dạng, xem trước bằng Ctrl hoặc Command + Shift + V.
- Đoạn văn cần dòng trống ở giữa; tiêu đề cần dấu cách sau `#`.
- Khối code luôn ghi tên ngôn ngữ; bảng luôn có dòng `---`.
- README tốt gồm: mục tiêu, cài đặt, cách chạy, cấu trúc thư mục.
- Bug report tốt: tiêu đề cụ thể, các bước, mong đợi so với thực tế, môi trường.

## Bài tập
1. Viết README cho một project với mục cài đặt, chạy test và cấu trúc thư mục. Xong khi: preview hiển thị đủ tiêu đề, danh sách, bảng và khối code có màu.
2. Viết một bug report theo mẫu trên cho lỗi bạn tìm được ở LAB-01 khi bật `?bugs=BUG-01`. Xong khi: người khác làm theo các bước của bạn và thấy đúng hiện tượng.
3. Viết bảng 5 test case cho trang `/lab/login` với cột ID, điều kiện, dữ liệu, kết quả mong đợi. Xong khi: bảng hiển thị đúng 4 cột, 5 hàng.
4. Commit README và bug report lên một repo GitHub rồi xem chúng hiển thị trên trang repo. Xong khi: bạn chụp màn hình thấy README được render đúng (nhớ che thông tin nhạy cảm).
5. Thêm danh sách việc (task list) vào README liệt kê việc còn lại của project, tick các việc đã xong. Xong khi: GitHub hiển thị ô tick bấm được hoặc ô đã tick.
