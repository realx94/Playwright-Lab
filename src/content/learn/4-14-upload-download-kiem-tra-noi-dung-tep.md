---
title: "Upload, download và kiểm tra nội dung tệp: Excel, XML, Word, PDF"
level: 4
order: 14
minutes: 75
summary: Tải tệp lên bằng setInputFiles, bắt sự kiện download, rồi mở tệp tải về để kiểm tra nội dung Excel, XML, Word, PDF, CSV và đối chiếu với dữ liệu trên giao diện.
keywords: [setInputFiles, filechooser, download, saveAs, exceljs, fast-xml-parser, mammoth, pdf-parse, jszip, Content-Disposition, kiểm tra nội dung tệp]
---

## Mục tiêu bài học
- Tải tệp lên bằng `setInputFiles` theo bốn cách: đường dẫn, buffer, nhiều tệp, xoá lựa chọn; biết khi nào dùng sự kiện `filechooser`.
- Bắt tệp tải về bằng `waitForEvent("download")`, kiểm tra tên tệp, kích thước và lưu tệp bằng `saveAs` vào thư mục tự dọn.
- Kiểm tra header `Content-Type`, `Content-Disposition` ở tầng HTTP bằng `page.request`.
- Đọc và kiểm tra nội dung Excel (`exceljs`), XML (`fast-xml-parser`), Word (`mammoth`, `jszip`), PDF (`pdf-parse`) và CSV.
- Đối chiếu một báo cáo giữa giao diện và bốn định dạng tệp, và nhận ra ba lỗi có chủ đích của lab báo cáo.

## Bạn cần chuẩn bị
- Đã học bài 2.7 (actions), 2.8 (assertions), 4.3 (fixture) và 4.7 (API testing, `request`). Biết async/await (bài 1.10).
- Site lab đang chạy và `baseURL` đúng. Ba lab dùng trong bài: `/lab/reports` (mô tả ở `/labs/reports`, LAB-31), `/lab/upload` (LAB-25), `/lab/csv` (LAB-27).
- Cài thư viện đọc tệp vào dự án test (chạy ở thư mục gốc của repo test, Node 22 trở lên):

```bash
npm i -D exceljs fast-xml-parser mammoth pdf-parse jszip
```

Lệnh `npm i -D` cài gói và ghi vào `devDependencies`. Phiên bản đã kiểm chứng với bài này: `exceljs` 4.4, `fast-xml-parser` 5.x, `mammoth` 1.x, `pdf-parse` 2.x, `jszip` 3.x. Riêng `pdf-parse` có API khác hẳn bản 1.x, nên hãy kiểm tra bản đang cài:

```bash
npm ls pdf-parse
```

Kết quả mong đợi là một dòng dạng `pdf-parse@2.4.5`. Nếu thấy bản 1.x thì cú pháp `new PDFParse(...)` trong bài sẽ báo lỗi; nâng bằng `npm i -D pdf-parse@latest`.

## Kiến thức cần nắm
- **Upload**: trong trình duyệt chọn tệp qua `<input type="file">`; Playwright không mở hộp thoại hệ điều hành mà gán thẳng tệp vào input bằng `setInputFiles`.
- **Download**: tệp tải về là sự kiện `download` của trang; Playwright lưu tạm tệp, bạn lấy đường dẫn bằng `download.path()` hoặc lưu sang nơi khác bằng `download.saveAs()`.
- **Content-Disposition** và **MIME type** (Content-Type): header cho trình duyệt biết "tải về với tên gì" và "đây là loại tệp nào".
- Mỗi định dạng có kiểu dữ liệu riêng: `.xlsx` và `.docx` thật ra là tệp **zip** chứa XML; `.pdf` là định dạng nhị phân; `.xml` và `.csv` là văn bản.
- **Công thức và giá trị** trong Excel là hai thứ khác nhau: ô chứa công thức `SUM(...)` kèm một giá trị đã tính sẵn.
- **Đối chiếu xuyên định dạng** (cross-format reconciliation): cùng một dữ liệu, mọi định dạng phải ra cùng con số.

## Giải thích dễ hiểu
Hãy hình dung bạn gọi đồ ăn qua ứng dụng. Có hai việc cần kiểm tra: (1) ứng dụng nhận đúng thứ bạn đưa vào (upload) và (2) hộp cơm giao tới có đúng món, đúng số lượng (download). Nhiều QA mới chỉ kiểm tra "có hộp cơm giao tới" tức là nút tải bấm được, tệp có tên đúng. Nhưng điều khách quan tâm là **bên trong hộp có gì**. Một báo cáo Excel có đủ file nhưng tổng tiền thiếu một dòng vẫn là sản phẩm lỗi.

Kiểm tra tệp gồm ba tầng, từ nông đến sâu:

| Tầng | Câu hỏi | Công cụ |
|------|---------|---------|
| Vỏ ngoài | Tên tệp, kích thước, loại tệp đúng chưa | `suggestedFilename()`, `stat`, header qua `page.request` |
| Cấu trúc | Mở được không, có đúng sheet, đúng thẻ, đúng bảng | `exceljs`, `fast-xml-parser`, `jszip` |
| Nội dung | Số liệu và văn bản đúng không, khớp với giao diện không | So sánh với bảng trên trang, tự tính lại tổng |

Vì sao cần thư viện đọc tệp? Playwright chỉ mang tệp về cho bạn. Việc hiểu `.xlsx` hay `.pdf` là việc của thư viện khác, chạy ngay trong Node (nơi spec của bạn chạy), nên không cần mở Excel hay Word.

## Thực hành từng bước
Các bước dùng chung một thư mục `e2e/helpers/file-readers.ts` (Bước 2) và một spec `e2e/files.spec.ts` được ghép từ các đoạn code trong bài. Với từng tệp ta hỏi lần lượt: có tải được không, vỏ ngoài đúng không, cấu trúc đúng không, nội dung đúng không.

### Bước 1. Upload bằng `setInputFiles`
Mục đích: đưa tệp vào ô chọn tệp mà không cần thao tác hộp thoại hệ điều hành. Lab `/lab/upload` nhận PNG, JPG, PDF tối đa 2 MB, tối đa 5 tệp, nhãn ô là "Chọn tệp". Có bốn cách đưa tệp vào:

```ts
const input = page.getByLabel("Chọn tệp");

// Cách 1: từ đường dẫn tệp thật
await input.setInputFiles(pdfPath);
```

Giải thích: `getByLabel("Chọn tệp")` tìm `<input type="file">` nhờ nhãn. `setInputFiles(đường dẫn)` đọc tệp từ đĩa; MIME type được đoán theo đuôi tệp (`.pdf` thành `application/pdf`). Đường dẫn tương đối tính từ thư mục chạy lệnh `npx playwright test`.

```ts
// Cách 2: từ buffer trong bộ nhớ, không cần tạo tệp thật
await input.setInputFiles({ name: "hop-dong.pdf", mimeType: "application/pdf", buffer: Buffer.from("noi dung") });
```

Giải thích: đối tượng có ba trường `name`, `mimeType`, `buffer`. Cách này tiện nhất để tạo tệp theo kích thước mong muốn, ví dụ `Buffer.alloc(2 * 1024 * 1024 + 1)` để thử biên vượt 2 MB (BVA, bài 3.3).

```ts
// Cách 3: nhiều tệp trong một lần chọn
await input.setInputFiles([
  { name: "a.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(10, 1) },
  { name: "b.gif", mimeType: "image/gif", buffer: Buffer.alloc(10, 1) },
]);
```

Giải thích: truyền một mảng. Input phải có thuộc tính `multiple` (lab này có), nếu không Playwright báo lỗi khi bạn gán nhiều hơn một tệp.

```ts
// Cách 4: bỏ lựa chọn hiện tại của input
await input.setInputFiles([]);
await expect(input).toHaveValue("");
```

Giải thích: mảng rỗng xoá lựa chọn của chính `<input>`. Đừng nhầm với danh sách tệp đã tải lên của ứng dụng; muốn xoá tệp trong danh sách bạn phải bấm nút của ứng dụng (`getByRole("button", { name: "Xoá a.pdf" })`).

Khi ô `<input type="file">` bị ẩn và chỉ có một nút mở hộp thoại, hãy dùng sự kiện `filechooser`:

```ts
const [chooser] = await Promise.all([page.waitForEvent("filechooser"), input.click()]);
await chooser.setFiles({ name: "qua-hop-thoai.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(5, 1) });
```

Giải thích: ta đăng ký chờ sự kiện **trước** (nằm trong `Promise.all`) rồi mới bấm; nếu bấm trước, sự kiện có thể đã xảy ra mà chưa ai nghe. `chooser.isMultiple()` cho biết hộp thoại có cho chọn nhiều tệp không.

Kết quả mong đợi: danh sách hiện tên tệp (`file-name`), kích thước (`file-size`), tệp sai định dạng được báo riêng ở `upload-error` ("b.gif: Định dạng không được hỗ trợ (chỉ PNG, JPG, PDF)").

Nếu gặp lỗi: `Non-multiple file input can only accept single file` nghĩa là input không có `multiple`. `locator.setInputFiles: Error: Not an input element` nghĩa là locator trỏ nhầm vào nút bấm, hãy trỏ vào `<input>`.

### Bước 2. Tạo thư viện đọc tệp
Mục đích: gom code đọc từng định dạng vào một nơi để spec ngắn gọn. Tạo `e2e/helpers/file-readers.ts` với nội dung trong phần Demo code (đoạn đầu tiên). Hàm trong tệp này làm gì:

| Hàm | Việc làm |
|-----|----------|
| `saveDownload` | Lưu tệp tải về vào thư mục bạn chọn, trả về đường dẫn |
| `readXlsx` | Mở `.xlsx` bằng `exceljs`, trả về workbook |
| `readXml` | Đọc văn bản, kiểm tra hợp lệ bằng `XMLValidator`, parse bằng `XMLParser` |
| `readDocxText` | Lấy văn bản thô của Word bằng `mammoth.extractRawText` |
| `readDocxXml` | Giải nén `.docx` bằng `jszip`, lấy `word/document.xml` để đếm bảng, dòng |
| `readPdf` | Trích văn bản và số trang bằng `pdf-parse` |
| `parseCsv` | Đọc CSV theo RFC 4180 (ngoặc kép, dấu nháy kép, CRLF, bỏ BOM) |

Kết quả mong đợi: tệp biên dịch được (VS Code không gạch đỏ). Nếu `import mammoth from "mammoth"` báo thiếu `esModuleInterop`, hãy bật `"esModuleInterop": true` trong `tsconfig.json` (các dự án tạo bởi `npm init playwright` thường đã bật).

### Bước 3. Bắt sự kiện download và lưu tệp
Mục đích: lấy tệp tải về một cách ổn định. Mẫu chuẩn gồm ba dòng:

```ts
const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Xuất Excel" }).click()]);
```

Giải thích: tương tự `filechooser`, ta chờ sự kiện `download` song song với cú click gây ra nó. `download` là đối tượng `Download`.

| Phương thức | Tác dụng |
|-------------|----------|
| `suggestedFilename()` | Tên tệp do server gợi ý (lấy từ `Content-Disposition`) |
| `path()` | Đường dẫn tệp tạm; chờ tải xong mới trả về |
| `saveAs(đường dẫn)` | Sao chép tệp tới nơi bạn chọn |
| `failure()` | `null` nếu thành công, chuỗi lỗi nếu hỏng |
| `url()` | URL đã dùng để tải |
| `delete()` | Xoá tệp tạm |

Quy trình nên dùng: tạo thư mục tạm bằng fixture (Demo code), `saveAs` vào đó rồi đọc từ đó. Vì sao không dùng thẳng `path()`? `path()` trỏ tới thư mục của Playwright và bị xoá khi context đóng; tệp bạn tự lưu thì bạn kiểm soát được vòng đời, còn có thể mở bằng Excel khi debug.

Kết quả mong đợi: `download.suggestedFilename()` bằng `bao-cao-2026-03-hoan-tat.xlsx` khi bạn chọn Tháng "2026-03" và Trạng thái "Hoàn tất".

### Bước 4. Kiểm tra header ở tầng HTTP
Mục đích: tên tệp và MIME do server quyết định; kiểm tra chúng bằng một request độc lập. `page.request` gửi request kèm cookie của trang:

```ts
const res = await page.request.get("/api/lab/report/xlsx?month=2026-03&status=Hoàn tất");
expect(res.status()).toBe(200);
expect(res.headers()["content-type"]).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
expect(res.headers()["content-disposition"]).toBe('attachment; filename="bao-cao-2026-03-hoan-tat.xlsx"');
```

Giải thích: `headers()` trả về tên header đã viết thường. Phần `attachment` bảo trình duyệt tải về thay vì mở. Các MIME cần nhớ của LAB-31:

| Đuôi | MIME |
|------|------|
| `.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| `.pdf` | `application/pdf` |
| `.xml` | `application/xml; charset=utf-8` |
| `.csv` | `text/csv; charset=utf-8` |

Cũng nên thử đầu vào sai: định dạng lạ như `/api/lab/report/zip` trả 404, tháng `2026-13` trả 400 (BR-03).

### Bước 5. Đọc Excel bằng `exceljs`
Mục đích: kiểm tra sheet, ô, công thức và định dạng ô. Tệp của lab có hai sheet: "Đơn hàng" (dòng 1 là tiêu đề, dòng dữ liệu, dòng cuối "Tổng cộng" có công thức) và "Tổng hợp". Các điểm cần biết:

- `wb.worksheets.map((w) => w.name)` liệt kê tên sheet. `ws.rowCount` là số dòng tới dòng cuối có dữ liệu.
- `ws.getCell("A2").value` trả về chuỗi, số hoặc `Date`. Số tiền được lưu dạng số, nên `toBe(1999999.99)`.
- `ws.getCell("E2").numFmt` là định dạng hiển thị (`#,##0.00`); giá trị thật vẫn là số.
- Ô công thức trả về đối tượng `{ formula, result }`. `formula` là chuỗi không có dấu `=` (ví dụ `SUM(E2:E6)`); `result` là giá trị **đã lưu sẵn** trong tệp.
- Ngày giờ: lab lưu giờ địa phương như giờ "trôi" (không múi giờ), nên `Date` đọc ra có `toISOString()` là `2026-03-02T09:15:00.000Z`. Nếu bạn dùng `getHours()` sẽ lệch theo múi giờ máy; dùng `getUTC*` hoặc `toISOString()`.

Điều quan trọng nhất: **đừng tin `result`**. Nó là con số do phần mềm xuất ghi vào, có thể không khớp công thức. Hãy cộng lại các ô dữ liệu bằng code rồi so với `result` và với tổng trên giao diện, đúng như spec trong phần Demo code. Đây chính là cách bắt BUG-01 (công thức bỏ sót dòng cuối).

### Bước 6. Đọc và kiểm tra XML bằng `fast-xml-parser`
Mục đích: xác nhận XML hợp lệ, ký tự đặc biệt được escape, cấu trúc đúng. Có hai việc tách biệt:

1. `XMLValidator.validate(text)` trả về `true` nếu đúng cú pháp, ngược lại trả về một đối tượng mô tả lỗi. Dùng `expect(valid).toBe(true)`.
2. `new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", parseTagValue: false }).parse(text)` chuyển thành đối tượng. `ignoreAttributes: false` giữ thuộc tính (`id`, `status`) với tiền tố `@_`. `parseTagValue: false` giữ nội dung thẻ là chuỗi, tránh biến `"1999999.99"` thành số hoặc mã đơn thành số mất số 0 đầu.

Hai chi tiết hay bị bỏ sót:

- Kiểm tra cả văn bản **thô** lẫn văn bản **đã parse**. Văn bản thô phải chứa `Cửa hàng Hoa &amp; Quà`, `Phạm &lt;Minh&gt; Đức`, `Lê &quot;Bobby&quot; Hoàng`, `O&apos;Neil &amp; Sons`. Sau khi parse, tên khách trở lại ký tự thật (`O'Neil & Sons`).
- Khi chỉ có một phần tử con, parser trả về một đối tượng, không phải mảng. Viết `[doc.report.order].flat()` để luôn có mảng.

Với thẻ có cả thuộc tính và nội dung như `<amount currency="VND">1999999.99</amount>`, parser cho `{ "#text": "1999999.99", "@_currency": "VND" }`.

### Bước 7. Đọc Word `.docx`
Mục đích: lấy văn bản và cấu trúc bảng từ Word. Hai cách bổ trợ nhau:

- `mammoth.extractRawText({ path })` trả về `{ value }` là toàn bộ văn bản thô (tiêu đề, đoạn tóm tắt, nội dung các ô bảng, mỗi đoạn một dòng). Phù hợp để kiểm tra "có tiêu đề không, có mã đơn này không, không có mã đơn kia".
- `jszip` mở `.docx` như tệp zip, đọc `word/document.xml`. Đếm `<w:tbl>` để biết số bảng, `<w:tr ` hoặc `<w:tr>` để đếm dòng. Dùng khi cần kiểm tra **cấu trúc** mà văn bản thô không cho thấy.

Với báo cáo tháng 03, Hoàn tất: 5 đơn nên có 1 bảng và 6 dòng (gồm tiêu đề). Tên khách chứa `&` nằm trong XML dưới dạng `&amp;`, nhớ khi tìm chuỗi trong `document.xml`.

### Bước 8. Đọc PDF bằng `pdf-parse`
Mục đích: trích văn bản từ PDF. API của bản 2.x:

```ts
const parser = new PDFParse({ data: await readFile(file) });
try {
  const result = await parser.getText();
  // result.text là văn bản, result.total là số trang
} finally {
  await parser.destroy();
}
```

Giải thích: `new PDFParse({ data })` nhận `Buffer` của tệp. `getText()` trả về `{ text, total, pages }`. `destroy()` giải phóng tài nguyên; đặt trong `finally` để chạy cả khi assertion trước đó đã ném lỗi. Nếu quên `destroy()`, tiến trình test có thể treo lâu khi kết thúc.

Lưu ý quan trọng với lab này: PDF dùng font chuẩn Helvetica **không có dấu tiếng Việt** nên văn bản trong PDF được bỏ dấu (`Bao cao don hang`, `Hoan tat`). Trang ghi chú điều này ngay dưới các nút xuất. Test phải mong đợi chữ không dấu; viết hàm bỏ dấu `s.normalize("NFD").replace(/[̀-ͯ]/g, "")` (và đổi `đ` thành `d`) để đối chiếu tên khách trên giao diện với PDF. Với PDF thật của sản phẩm dùng font nhúng Unicode, văn bản tiếng Việt thường trích ra được nhưng đôi khi thứ tự ký tự bị đảo hoặc mất dấu tuỳ font; khi đó hãy kiểm tra bằng phần chữ không dấu và các con số.

### Bước 9. Đọc CSV và hàm `parseCsv`
Mục đích: kiểm tra CSV theo RFC 4180 mà không bị đánh lừa bởi dấu phẩy trong dữ liệu. CSV của LAB-31 bắt đầu bằng **BOM** (ký tự `﻿`, giúp Excel nhận UTF-8), kết thúc dòng bằng CRLF, và trường chứa dấu nháy kép được bọc: `"Lê ""Bobby"" Hoàng"`. Cắt chuỗi bằng `split(",")` sẽ sai ở các dòng như vậy, và BOM sẽ dính vào tên cột đầu tiên (`﻿Mã đơn` khác `Mã đơn`). Hàm `parseCsv` trong Demo code xử lý đủ các điều này.

Kiểm tra: dòng 0 là tiêu đề `["Mã đơn", "Ngày", "Khách hàng", "Trạng thái", "Số tiền"]`, mỗi đơn đúng một dòng, không có dòng tổng (BR-08), số tiền ở dạng số thập phân `1999999.99`. Lab `/lab/csv` cũng xuất tệp `customers.csv` bằng nút "Xuất CSV"; làm tương tự rồi nhập lại tệp để thử vòng đi-về (round trip).

### Bước 10. Đối chiếu xuyên định dạng
Mục đích: cùng bộ lọc thì mọi nơi phải ra cùng dữ liệu. Nguồn sự thật là bảng trên trang (`data-testid="report-row"`). Lấy các ô bằng `evaluateAll`, rồi với từng dòng `i` so sánh với dòng thứ `i` của CSV, hàng `i + 2` của Excel và phần tử thứ `i` của XML: mã đơn, tên khách, trạng thái, số tiền; cuối cùng so tổng trên trang với `total` của `<report>`. Số tiền trên trang có dạng `1.999.999,99` (dấu chấm nghìn, dấu phẩy thập phân) nên cần hàm `toNumber` chuyển về số trước khi so, và so số thực bằng `toBeCloseTo(giá trị, 2)`.

Dòng thứ `i` ở đây dựa vào việc mọi định dạng giữ cùng thứ tự đơn. Nếu sản phẩm của bạn không bảo đảm thứ tự, hãy lập chỉ mục theo mã đơn (`Map`) rồi so sánh theo khoá.

### Bước 11. Dọn tệp tải về
Mục đích: không để rác tích tụ trên máy và CI. Dùng fixture `saveDir` (Demo code): `mkdtemp` tạo thư mục tạm duy nhất cho mỗi test, `rm(..., { recursive: true, force: true })` xoá sau khi test xong, kể cả khi test đỏ vì code sau `await use(dir)` vẫn chạy. Nếu thích để Playwright quản lý, lưu vào `testInfo.outputPath(download.suggestedFilename())`; thư mục này nằm trong `test-results` và còn lại sau test lỗi để bạn mở xem. Chọn một trong hai và nhất quán.

## Demo code
Tệp 1, `e2e/helpers/file-readers.ts`:

```ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Download } from "@playwright/test";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import mammoth from "mammoth";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { PDFParse } from "pdf-parse";

/** Lưu tệp tải về vào thư mục do mình quản lý, trả về đường dẫn tệp. */
export async function saveDownload(download: Download, dir: string): Promise<string> {
  const target = join(dir, download.suggestedFilename());
  await download.saveAs(target);
  return target;
}

export async function readXlsx(file: string): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  return wb;
}

export async function readXml(file: string) {
  const text = await readFile(file, "utf8");
  const valid = XMLValidator.validate(text); // true hoặc object { err: ... }
  const doc = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", parseTagValue: false }).parse(text);
  return { text, valid, doc };
}

export async function readDocxText(file: string): Promise<string> {
  return (await mammoth.extractRawText({ path: file })).value;
}

/** Đọc word/document.xml bên trong .docx (một tệp zip) để đếm bảng, dòng bảng. */
export async function readDocxXml(file: string): Promise<string> {
  const zip = await JSZip.loadAsync(await readFile(file));
  return zip.file("word/document.xml")!.async("string");
}

export async function readPdf(file: string): Promise<{ text: string; pages: number }> {
  const parser = new PDFParse({ data: await readFile(file) });
  try {
    const result = await parser.getText();
    return { text: result.text, pages: result.total };
  } finally {
    await parser.destroy();
  }
}

/** Parser CSV tối giản theo RFC 4180: có ngoặc kép, "" là dấu nháy, CRLF, bỏ BOM đầu tệp. */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\r" || ch === "\n") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}
```

Giải thích `parseCsv`: biến `quoted` cho biết đang ở trong cặp ngoặc kép; trong đó dấu phẩy và xuống dòng là dữ liệu, còn `""` là một dấu nháy kép. Ngoài ngoặc, dấu phẩy kết thúc ô, CR/LF kết thúc dòng (CRLF tính là một). Dòng đầu tiên của hàm bỏ BOM.

Tệp 2, `e2e/files.spec.ts`, phần đầu gồm fixture và các hàm trợ giúp:

```ts
import { test as base, expect, type Download, type Page } from "@playwright/test";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseCsv, readDocxText, readDocxXml, readPdf, readXlsx, readXml, saveDownload } from "./helpers/file-readers";

// Fixture: thư mục tạm riêng cho mỗi test, tự xoá khi test kết thúc (dù xanh hay đỏ).
const test = base.extend<{ saveDir: string }>({
  saveDir: async ({}, use) => {
    const dir = await mkdtemp(join(tmpdir(), "pw-files-"));
    await use(dir);
    await rm(dir, { recursive: true, force: true });
  },
});

async function openReports(page: Page, query = "") {
  await page.goto("/lab/reports" + query);
  await page.getByTestId("reset-data").click();
}
async function pickFilter(page: Page, month: string, status: string) {
  await page.getByLabel("Tháng").selectOption(month);
  await page.getByLabel("Trạng thái đơn").selectOption(status);
}
async function exportAs(page: Page, name: string): Promise<Download> {
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name }).click()]);
  return download;
}
// "13.715.501,14" -> 13715501.14
const toNumber = (vi: string) => Number(vi.replace(/\./g, "").replace(",", "."));
```

Giải thích: `base.extend` tạo bản `test` có thêm fixture `saveDir` (bài 4.3). `selectOption("2026-03")` chọn theo `value` của thẻ `<option>`; "Tất cả" có value rỗng nên `selectOption("")` đưa bộ lọc về tất cả. `exportAs` gom mẫu `Promise.all` để các test dùng lại.

Test upload (LAB-25):

```ts
test("upload: đường dẫn, buffer, nhiều tệp và hộp thoại chọn tệp", async ({ page, saveDir }) => {
  await page.goto("/lab/upload");
  await page.getByTestId("reset-data").click();
  const input = page.getByLabel("Chọn tệp");

  const pdfPath = join(saveDir, "bien-ban.pdf");
  await writeFile(pdfPath, "%PDF-1.4 giả lập");
  await input.setInputFiles(pdfPath);
  await expect(page.getByTestId("file-name")).toHaveText(["bien-ban.pdf"], { timeout: 10_000 });
  await expect(page.getByTestId("file-size")).toHaveText(`${(await stat(pdfPath)).size} byte`);

  await input.setInputFiles({ name: "hop-dong.pdf", mimeType: "application/pdf", buffer: Buffer.from("noi dung") });
  await expect(page.getByTestId("file-name")).toHaveText(["bien-ban.pdf", "hop-dong.pdf"], { timeout: 10_000 });

  await input.setInputFiles([
    { name: "a.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(10, 1) },
    { name: "b.gif", mimeType: "image/gif", buffer: Buffer.alloc(10, 1) },
  ]);
  await expect(page.getByTestId("upload-error")).toHaveText("b.gif: Định dạng không được hỗ trợ (chỉ PNG, JPG, PDF)");
  await expect(page.getByTestId("file-item")).toHaveCount(3, { timeout: 10_000 });

  await page.getByRole("button", { name: "Xoá a.pdf" }).click();
  await expect(page.getByTestId("file-item")).toHaveCount(2);
  await input.setInputFiles([]);
  await expect(input).toHaveValue("");

  const [chooser] = await Promise.all([page.waitForEvent("filechooser"), input.click()]);
  expect(chooser.isMultiple()).toBe(true);
  await chooser.setFiles({ name: "qua-hop-thoai.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(5, 1) });
  await expect(page.getByTestId("file-name")).toContainText(["qua-hop-thoai.pdf"], { timeout: 10_000 });
});
```

Giải thích: ứng dụng mô phỏng tiến trình tải nên `file-name` xuất hiện sau một lúc; ta cho `timeout: 10_000` thay vì `waitForTimeout`. `toHaveText([...])` với mảng so sánh theo thứ tự từng phần tử của nhiều locator. Kích thước `file-size` hiển thị "N byte", ta lấy N từ `stat` của tệp thật.

Test tải về và header:

```ts
test("download: tên tệp, tệp lưu được, header HTTP", async ({ page, saveDir }) => {
  await openReports(page);
  await pickFilter(page, "2026-03", "Hoàn tất");
  const download = await exportAs(page, "Xuất Excel");

  expect(download.suggestedFilename()).toBe("bao-cao-2026-03-hoan-tat.xlsx");
  expect(await download.failure()).toBeNull();
  const file = await saveDownload(download, saveDir);
  expect((await stat(file)).size).toBeGreaterThan(1000);

  const res = await page.request.get("/api/lab/report/xlsx?month=2026-03&status=Hoàn tất");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  expect(res.headers()["content-disposition"]).toBe('attachment; filename="bao-cao-2026-03-hoan-tat.xlsx"');
  expect(Number(res.headers()["content-length"])).toBe((await stat(file)).size);
  expect(res.headers()["x-report-rows"]).toBe("5");
  expect((await page.request.get("/api/lab/report/zip")).status()).toBe(404);
  expect((await page.request.get("/api/lab/report/xlsx?month=2026-13")).status()).toBe(400);
});
```

Giải thích: `Content-Length` của response phải bằng kích thước tệp đã lưu, một cách kiểm tra "tải trọn vẹn". `x-report-rows` là header riêng của lab cho biết số dòng, dùng để biết lọc đúng chưa mà không cần mở tệp.

Test Excel:

```ts
test("Excel: sheet, ô, công thức và giá trị", async ({ page, saveDir }) => {
  await openReports(page);
  await pickFilter(page, "2026-03", "Hoàn tất");
  const wb = await readXlsx(await saveDownload(await exportAs(page, "Xuất Excel"), saveDir));

  expect(wb.worksheets.map((w) => w.name)).toEqual(["Đơn hàng", "Tổng hợp"]);
  const ws = wb.getWorksheet("Đơn hàng")!;
  expect(ws.rowCount).toBe(7); // 1 tiêu đề + 5 đơn + 1 tổng
  expect((ws.getRow(1).values as unknown[]).slice(1)).toEqual(["Mã đơn", "Ngày", "Khách hàng", "Trạng thái", "Số tiền"]);

  expect(ws.getCell("A2").value).toBe("DH-004");
  expect(ws.getCell("C2").value).toBe('Lê "Bobby" Hoàng');
  expect(ws.getCell("E2").value).toBe(1999999.99);
  expect(ws.getCell("E2").numFmt).toBe("#,##0.00");
  expect((ws.getCell("B2").value as Date).toISOString()).toBe("2026-03-02T09:15:00.000Z");

  const total = ws.getCell("E7").value as { formula: string; result: number };
  expect(total.formula).toBe("SUM(E2:E6)");
  let sum = 0;
  for (let r = 2; r <= 6; r++) sum += ws.getCell(`E${r}`).value as number;
  expect(total.result).toBeCloseTo(sum, 2);
  expect(sum).toBeCloseTo(toNumber(await page.getByTestId("report-total").innerText()), 2);

  const summary = wb.getWorksheet("Tổng hợp")!;
  expect([summary.getCell("A2").value, summary.getCell("B2").value]).toEqual(["Hoàn tất", 5]);
});
```

Giải thích: `getRow(1).values` là mảng bắt đầu từ chỉ số 1 (phần tử 0 để trống) nên `slice(1)`. Hai assertion về `total` kiểm tra hai thứ khác nhau: công thức đúng phạm vi (`E2:E6`, đủ 5 dòng) và giá trị lưu khớp với tổng các ô; dòng cuối so với tổng trên trang, đóng vòng đối chiếu.

Test XML:

```ts
test("XML: parse được, escape đúng, thuộc tính và phần tử", async ({ page, saveDir }) => {
  await openReports(page);
  await pickFilter(page, "2026-03", "");
  const { text, valid, doc } = await readXml(await saveDownload(await exportAs(page, "Xuất XML"), saveDir));

  expect(valid).toBe(true);
  expect(text).toContain("Cửa hàng Hoa &amp; Quà");
  expect(text).toContain("Phạm &lt;Minh&gt; Đức");
  expect(text).toContain("Lê &quot;Bobby&quot; Hoàng");
  expect(text).toContain("O&apos;Neil &amp; Sons");

  const orders = [doc.report.order].flat();
  expect(orders).toHaveLength(6);
  expect(doc.report["@_count"]).toBe("6");
  expect(orders.map((o: { "@_id": string }) => o["@_id"])).toEqual(["DH-004", "DH-005", "DH-006", "DH-007", "DH-008", "DH-009"]);
  expect(orders[0].customer).toBe('Lê "Bobby" Hoàng');
  expect(orders[5].customer).toBe("O'Neil & Sons");
  expect(orders[0].amount["#text"]).toBe("1999999.99");
  expect(orders[0].amount["@_currency"]).toBe("VND");
});
```

Giải thích: `doc` có kiểu `any` vì parser không biết cấu trúc tệp; nếu muốn chặt chẽ hãy khai báo interface rồi ép kiểu. Bộ lọc tháng 03, mọi trạng thái cho 6 đơn (`DH-004` đến `DH-009`).

Test Word và PDF:

```ts
test("Word: tách văn bản bằng mammoth, đếm bảng bằng jszip", async ({ page, saveDir }) => {
  await openReports(page);
  await pickFilter(page, "2026-03", "Hoàn tất");
  const file = await saveDownload(await exportAs(page, "Xuất Word"), saveDir);

  const text = await readDocxText(file);
  expect(text).toContain("Báo cáo đơn hàng");
  expect(text).toContain("Tổng cộng 5 đơn, tổng tiền 13.715.501,14 ₫.");
  expect(text).toContain("DH-009");
  expect(text).not.toContain("DH-006"); // đơn đã huỷ không có trong báo cáo Hoàn tất

  const xml = await readDocxXml(file);
  expect(xml.match(/<w:tbl>/g)).toHaveLength(1);
  expect(xml.match(/<w:tr[ >]/g)).toHaveLength(6); // 1 dòng tiêu đề + 5 đơn
});

test("PDF: trích văn bản, chữ không dấu, số trang", async ({ page, saveDir }) => {
  await openReports(page);
  await pickFilter(page, "2026-03", "Hoàn tất");
  const { text, pages } = await readPdf(await saveDownload(await exportAs(page, "Xuất PDF"), saveDir));

  expect(pages).toBe(1);
  expect(text).toContain("Bao cao don hang");
  expect(text).toContain("Tong cong 5 don, tong tien 13.715.501,14 VND");
  expect(text).toContain("DH-009");
  expect(text).not.toContain("DH-006");
  expect(text).not.toContain("Hoàn tất"); // font chuẩn không có dấu nên chữ có dấu không xuất hiện
  expect(text).toContain("Hoan tat");
});
```

Giải thích: `not.toContain("DH-006")` kiểm tra điều **không được có**, rất quan trọng với bộ lọc: thiếu kiểm tra phủ định thì báo cáo thừa dữ liệu vẫn xanh. `match(...)` trả về `null` nếu không có kết quả nên `toHaveLength` sẽ báo lỗi rõ ràng.

Test CSV và đối chiếu xuyên định dạng:

```ts
test("CSV: BOM, CRLF, ngoặc kép, một dòng cho mỗi đơn", async ({ page, saveDir }) => {
  await openReports(page);
  await pickFilter(page, "2026-03", "");
  const file = await saveDownload(await exportAs(page, "Xuất CSV"), saveDir);
  const raw = await readFile(file, "utf8");

  expect(raw.charCodeAt(0)).toBe(0xfeff); // BOM
  expect(raw).toContain("\r\n");
  expect(raw).toContain('"Lê ""Bobby"" Hoàng"');
  const rows = parseCsv(raw);
  expect(rows[0]).toEqual(["Mã đơn", "Ngày", "Khách hàng", "Trạng thái", "Số tiền"]);
  expect(rows).toHaveLength(1 + 6);
  expect(rows[1]).toEqual(["DH-004", "2026-03-02 09:15", 'Lê "Bobby" Hoàng', "Hoàn tất", "1999999.99"]);
});

test("đối chiếu xuyên định dạng: trang = CSV = Excel = XML", async ({ page, saveDir }) => {
  test.setTimeout(60_000);
  await openReports(page);
  await pickFilter(page, "2026-04", "");

  const ui = await page.getByTestId("report-row").evaluateAll((trs) =>
    trs.map((tr) => {
      const td = [...tr.querySelectorAll("td")].map((x) => x.textContent ?? "");
      return { id: td[0], customer: td[2], status: td[3], amount: td[4] };
    }),
  );
  expect(ui.length).toBe(5);

  const csv = parseCsv(await readFile(await saveDownload(await exportAs(page, "Xuất CSV"), saveDir), "utf8")).slice(1);
  const ws = (await readXlsx(await saveDownload(await exportAs(page, "Xuất Excel"), saveDir))).getWorksheet("Đơn hàng")!;
  const { doc } = await readXml(await saveDownload(await exportAs(page, "Xuất XML"), saveDir));
  const xml = [doc.report.order].flat();

  ui.forEach((u, i) => {
    const amount = toNumber(u.amount);
    expect(csv[i].slice(0, 4)).toEqual([u.id, expect.any(String), u.customer, u.status]);
    expect(Number(csv[i][4])).toBeCloseTo(amount, 2);
    expect(ws.getCell(`A${i + 2}`).value).toBe(u.id);
    expect(ws.getCell(`C${i + 2}`).value).toBe(u.customer);
    expect(ws.getCell(`E${i + 2}`).value as number).toBeCloseTo(amount, 2);
    expect(xml[i]["@_id"]).toBe(u.id);
    expect(xml[i].customer).toBe(u.customer);
    expect(Number(xml[i].amount["#text"])).toBeCloseTo(amount, 2);
  });
  expect(Number(doc.report["@_total"])).toBeCloseTo(toNumber(await page.getByTestId("report-total").innerText()), 2);
});
```

Giải thích: `evaluateAll` chạy trong trình duyệt và trả về dữ liệu thường để dùng trong Node. `expect.any(String)` bỏ qua cột Ngày vì định dạng ngày khác nhau giữa trang (`dd/mm/yyyy`) và CSV (`yyyy-mm-dd`); nếu muốn đối chiếu ngày, hãy chuyển cùng một định dạng. `test.setTimeout(60_000)` nâng giới hạn vì test này tải ba tệp.

Test bắt ba lỗi có chủ đích (bật bằng `?bugs=`):

```ts
test("BUG-01: tổng trong Excel lệch với các dòng dữ liệu", async ({ page, saveDir }) => {
  await openReports(page, "?bugs=BUG-01");
  await pickFilter(page, "2026-03", "Hoàn tất");
  const ws = (await readXlsx(await saveDownload(await exportAs(page, "Xuất Excel"), saveDir))).getWorksheet("Đơn hàng")!;
  const total = ws.getCell("E7").value as { formula: string; result: number };
  let sum = 0;
  for (let r = 2; r <= 6; r++) sum += ws.getCell(`E${r}`).value as number;
  expect(total.formula).toBe("SUM(E2:E5)"); // đúng ra phải là E2:E6
  expect(Math.abs(total.result - sum)).toBeGreaterThan(0.01);
});

test("BUG-02: XML không escape & nên không hợp lệ", async ({ page, saveDir }) => {
  await openReports(page, "?bugs=BUG-02");
  await pickFilter(page, "2026-03", "");
  const { text, valid } = await readXml(await saveDownload(await exportAs(page, "Xuất XML"), saveDir));
  expect(text).toContain("Hoa & Quà");
  expect(valid).not.toBe(true);
});

test("BUG-03: PDF vẫn có đơn đã huỷ khi lọc Hoàn tất", async ({ page, saveDir }) => {
  await openReports(page, "?bugs=BUG-03");
  await pickFilter(page, "2026-03", "Hoàn tất");
  const { text } = await readPdf(await saveDownload(await exportAs(page, "Xuất PDF"), saveDir));
  expect(text).toContain("DH-006");
});
```

Giải thích: các test này khẳng định **lỗi có mặt** khi bật bug (dạng "kiểm chứng test của mình đủ nhạy"); trong đồ án thật bạn đảo lại thành assertion bình thường (`SUM(E2:E6)`, `valid` bằng `true`, `not.toContain("DH-006")`) và chúng sẽ đỏ trên bản có lỗi. Mệnh đề đáng nhớ: một test đọc tệp tốt phải đỏ khi bật đúng bug.

Test CSV của lab `/lab/csv` (nhập rồi xuất):

```ts
test("lab csv: xuất tệp rồi đọc lại bằng parseCsv", async ({ page, saveDir }) => {
  await page.goto("/lab/csv");
  await page.getByTestId("reset-data").click();
  await page.getByLabel("Chọn tệp CSV").setInputFiles({
    name: "khach-hang.csv",
    mimeType: "text/csv",
    buffer: Buffer.from('name,email,phone\n"Nguyễn, Văn ""A""",a@lab.dev,0901234567\n', "utf8"),
  });
  await expect(page.getByTestId("csv-summary")).toHaveText("Đã nhập 1 dòng, bỏ qua 0 dòng lỗi");

  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Xuất CSV" }).click()]);
  expect(download.suggestedFilename()).toBe("customers.csv");
  const file = await saveDownload(download, saveDir);
  expect(parseCsv(await readFile(file, "utf8"))).toEqual([
    ["name", "email", "phone"],
    ['Nguyễn, Văn "A"', "a@lab.dev", "0901234567"],
  ]);
});
```

Chạy: `npx playwright test e2e/files.spec.ts` (bộ ba lab `reports`, `upload`, `csv` phải đang chạy ở `baseURL`). Kết quả mong đợi là các test xanh.

## Thử ngay trong lab
- Mở `/lab/reports` (BR và bug ở `/labs/reports`): chọn Tháng và Trạng thái, bấm lần lượt Xuất Excel, Xuất XML, Xuất Word, Xuất PDF, Xuất CSV. Mở từng tệp bằng chương trình trên máy, so với bảng xem trước (số đơn, tổng tiền, tên khách có `&`, `<`, dấu nháy).
- Thêm `?bugs=BUG-01` vào đường dẫn `/lab/reports`, xuất Excel, mở sheet "Đơn hàng": ô tổng thiếu đơn cuối. Thử `?bugs=BUG-02` với XML (mở bằng trình duyệt sẽ báo lỗi cú pháp) và `?bugs=BUG-03` với Word, PDF khi lọc "Hoàn tất".
- Mở `/lab/upload` (LAB-25): thử tệp đúng 2 MB, 2 MB cộng 1 byte, đuôi viết hoa `ANH.PNG`, hai tệp trùng tên (ứng dụng đổi thành `a (1).pdf`), tệp thứ 6.
- Mở `/lab/csv` (LAB-27): nhập một tệp, bấm "Xuất CSV", rồi nhập chính tệp vừa xuất để thử vòng đi-về.

## Lỗi thường gặp
- **Triệu chứng**: `Error: ENOENT: no such file or directory, open '...\\playwright-artifacts-...\\<uuid>'` khi đọc tệp tải về. **Nguyên nhân**: đọc `download.path()` sau khi context đã đóng (hoặc test đã kết thúc), tệp tạm bị xoá. **Cách sửa**: đọc ngay trong test, hoặc `saveAs` vào thư mục của bạn như fixture `saveDir`.
- **Triệu chứng**: test treo rồi `Test timeout of 30000ms exceeded` ở `waitForEvent("download")`. **Nguyên nhân**: bấm nút trước khi đăng ký chờ sự kiện, hoặc nút không thực sự tải (form submit điều hướng trang). **Cách sửa**: dùng `Promise.all([page.waitForEvent("download"), click])`, kiểm tra thủ công rằng bấm nút tải về tệp.
- **Triệu chứng**: `Expected: "Mã đơn"  Received: "﻿Mã đơn"` khi so tiêu đề CSV. **Nguyên nhân**: tệp có BOM. **Cách sửa**: bỏ BOM trước khi parse (`replace(/^﻿/, "")`) và, ở bài test, kiểm tra riêng BOM nếu BR yêu cầu.
- **Triệu chứng**: tìm tên tiếng Việt trong PDF thất bại (`Expected substring: "Nguyễn Văn An"`; thực nhận có `Nguyen Van An`), hoặc ký tự lạ. **Nguyên nhân**: PDF dùng font không nhúng Unicode nên chữ bị bỏ dấu hoặc mã hoá thành ký tự khác. **Cách sửa**: so sánh bản không dấu của cả hai bên và các con số; phản ánh với dev nếu BR yêu cầu tiếng Việt có dấu.
- **Triệu chứng**: `TypeError: PDFParse is not a constructor` hoặc `pdf is not a function`. **Nguyên nhân**: cài nhầm `pdf-parse` 1.x (API là hàm `pdf(buffer)`) hoặc import sai. **Cách sửa**: `npm ls pdf-parse` để kiểm tra, dùng `import { PDFParse } from "pdf-parse"` với bản 2.x.
- **Triệu chứng**: tổng trong Excel đúng trên màn hình xem trước nhưng test vẫn xanh dù tệp sai. **Nguyên nhân**: chỉ so `result` của ô công thức với tổng trên trang; `result` là giá trị đã ghi sẵn nên bản xuất lỗi vẫn ghi `result` "đẹp". **Cách sửa**: cộng lại các ô dữ liệu, kiểm tra chuỗi công thức và phạm vi ô.
- **Triệu chứng**: `toBe("DH-004")` thất bại vì ô trả về `{ richText: [...] }` hoặc `{ formula, result }` thay vì chuỗi. **Nguyên nhân**: ô có định dạng chữ hoặc công thức. **Cách sửa**: dùng `cell.text` để lấy chuỗi hiển thị, hoặc kiểm tra kiểu `value` trước.

## Tóm tắt
- `setInputFiles` nhận đường dẫn, buffer, mảng nhiều tệp hoặc mảng rỗng để xoá; dùng `filechooser` khi chỉ có nút mở hộp thoại, và luôn đăng ký chờ sự kiện trước khi bấm.
- Download đi qua sự kiện `download`: kiểm `suggestedFilename()`, `failure()`, `saveAs` vào thư mục tự dọn; kiểm MIME và `Content-Disposition` bằng `page.request`.
- Mỗi định dạng có thư viện riêng: `exceljs` (Excel), `fast-xml-parser` (XML), `mammoth` và `jszip` (Word), `pdf-parse` 2.x (PDF, nhớ `destroy()`), và một parser CSV tôn trọng ngoặc kép, BOM, CRLF.
- Đừng tin giá trị đã lưu sẵn: tự cộng lại ô dữ liệu, kiểm tra cả công thức lẫn kết quả; kiểm tra cả điều không được xuất hiện (`not.toContain`).
- Đối chiếu một nguồn dữ liệu với mọi định dạng (trang, CSV, Excel, XML) là cách mạnh nhất để bắt lỗi xuất báo cáo; chữ có dấu trong PDF phụ thuộc font nên cần chiến lược so sánh riêng.

## Bài tập
1. **Dễ**: Viết test tải Excel với bộ lọc "Tất cả" cho cả hai ô, kiểm `suggestedFilename()` bằng `bao-cao-tat-ca.xlsx` và kiểm `Content-Type` qua `page.request`. Xong khi test xanh trên lab sạch.
2. **Dễ**: Viết test upload tệp PDF đúng 2 MB (xanh) và 2 MB cộng 1 byte (thông báo lỗi "Tệp vượt quá 2 MB") bằng `Buffer.alloc`. Xong khi cả hai cho kết quả đúng biên.
3. **Vừa**: Với bộ lọc tháng "2026-02" và trạng thái "Đã huỷ", viết test đối chiếu số đơn và tổng tiền giữa trang, Word (tóm tắt "Tổng cộng ... đơn") và PDF (chữ không dấu "Tong cong"). Xong khi ba nơi cùng ra một con số.
4. **Vừa**: Viết test cho sheet "Tổng hợp": mỗi trạng thái đúng số đơn và tổng tiền, và tổng các dòng bằng tổng của sheet "Đơn hàng". Xong khi test đỏ nếu bạn sửa tay một ô số đơn.
5. **Khó**: Bật `?bugs=BUG-01,BUG-02,BUG-03`, viết ba test (không sửa code ứng dụng) mỗi test đỏ đúng ở một bug và xanh trên lab sạch. Xong khi bạn chứng minh được hai điều: test đỏ khi bật bug, xanh khi tắt bug.
6. **Khó**: Viết hàm `readCsvAsObjects(file)` trả về mảng đối tượng theo tiêu đề cột và dùng nó để đối chiếu CSV với Excel theo **mã đơn** (dùng `Map`) thay vì theo thứ tự dòng. Xong khi so khớp đúng cả khi bạn đảo thứ tự dòng trong dữ liệu giả.
