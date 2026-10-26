---
title: Kiểm thử tổ hợp cặp (Pairwise)
level: 3
order: 6
minutes: 40
summary: Giảm số tổ hợp tham số cần test mà vẫn phủ mọi cặp giá trị.
keywords: [pairwise testing, combinatorial testing, PICT tool]
---

## Mục tiêu bài học
- Giải thích vì sao phần lớn lỗi do tương tác giữa **hai** tham số và pairwise phủ mọi cặp giá trị với rất ít test.
- Tính tổng số tổ hợp đầy đủ, tổng số cặp cần phủ và cận dưới số test của một bộ tham số thật.
- Dựng bảng pairwise 16 dòng cho bộ lọc, trang và sắp xếp của bảng LAB-08 mà không cần công cụ, và kiểm chứng phủ đủ 73 cặp bằng một script nhỏ.
- Viết spec data-driven chạy 16 tổ hợp, mỗi tổ hợp có kết quả mong đợi tính độc lập.

## Bạn cần chuẩn bị
- Đã học bài 3.2 đến 3.5. Mở `/labs/table` (BR-01 đến BR-08) và ứng dụng `/lab/table`.
- Node.js đã cài (để chạy script kiểm tra phủ cặp). Không cần cài thêm thư viện.

## Kiến thức cần nắm
- **Tham số** (parameter) và **giá trị** (value) của nó.
- **Tổ hợp đầy đủ** (exhaustive): tích số giá trị của mọi tham số.
- **Cặp** (pair): hai giá trị thuộc hai tham số khác nhau xuất hiện cùng nhau trong một dòng test.
- **Pairwise** (2-wise): bộ test sao cho mọi cặp giá trị của mọi cặp tham số xuất hiện ít nhất một lần.
- **Cận dưới**: số dòng ít nhất cần có, bằng tích hai tham số có nhiều giá trị nhất.
- Công cụ sinh tổ hợp như PICT; ràng buộc (constraint) giữa các giá trị.

## Giải thích dễ hiểu
Bạn mở một quán ăn có 4 loại mì, 3 loại nước dùng, 3 cỡ tô và 4 loại topping. Thử mọi kết hợp là 144 tô. Nhưng nếu lỗi thường là "nước dùng cay không hợp với cỡ tô lớn" (hai yếu tố tương tác) thì ta chỉ cần đảm bảo **mỗi cặp hai yếu tố từng được nếm ít nhất một lần**. Số tô cần nấu giảm từ 144 xuống 16.

Cơ sở của kỹ thuật: nghiên cứu về lỗi phần mềm trong thực tế cho thấy phần lớn lỗi do một tham số hoặc tương tác giữa hai tham số gây ra; lỗi cần ba tham số trở lên cùng lúc hiếm hơn nhiều. Do đó phủ mọi cặp bắt được phần lớn lỗi với chi phí thấp. Nó **không** đảm bảo phủ tương tác ba chiều, nên các tổ hợp rủi ro cao vẫn phải thêm tay (xem Bước 6).

## Thực hành từng bước
Ví dụ xuyên suốt: bảng dữ liệu động LAB-08 (`/lab/table`). Người dùng có thể chọn bộ lọc Vai trò, bộ lọc Trạng thái, Số dòng mỗi trang và cột sắp xếp. BR-01 đến BR-05 nói mặc định 10 dòng mỗi trang, tìm kiếm, đổi bộ lọc quay về trang 1, lọc kết hợp AND, sắp xếp.

### Bước 1. Liệt kê tham số và giá trị
Mục đích: xác định không gian cần kiểm.

| Tham số | Giá trị | Số giá trị |
|---------|---------|-----------|
| Vai trò (bộ lọc) | Tất cả, Admin, Editor, Viewer | 4 |
| Trạng thái (bộ lọc) | Tất cả, Hoạt động, Đã khoá | 3 |
| Số dòng mỗi trang | 5, 10, 20 | 3 |
| Cột sắp xếp | Tên, Email, Vai trò, Ngày tạo | 4 |

Kết quả mong đợi: 4 tham số, mỗi tham số 3 hoặc 4 giá trị. Bạn có thể đối chiếu bằng cách mở `/lab/table` và đếm các lựa chọn trong từng ô chọn.

### Bước 2. Tính tổ hợp đầy đủ
Tổ hợp đầy đủ là 4 nhân 3 nhân 3 nhân 4 bằng **144**. Nếu mỗi test mất 3 giây chạy thì 144 test mất 7 phút 12 giây; với 8 tham số, mỗi tham số 5 giá trị thì 390.625 tổ hợp. Đó là lý do cần pairwise.

### Bước 3. Tính số cặp cần phủ và cận dưới
Mục đích: biết "xong" nghĩa là gì.

Với 4 tham số, có 6 cặp tham số. Số cặp giá trị của mỗi cặp tham số là tích số giá trị của chúng:

| Cặp tham số | Tính | Số cặp giá trị |
|-------------|------|----------------|
| Vai trò và Trạng thái | 4 nhân 3 | 12 |
| Vai trò và Số dòng | 4 nhân 3 | 12 |
| Vai trò và Cột sắp xếp | 4 nhân 4 | 16 |
| Trạng thái và Số dòng | 3 nhân 3 | 9 |
| Trạng thái và Cột sắp xếp | 3 nhân 4 | 12 |
| Số dòng và Cột sắp xếp | 3 nhân 4 | 12 |
| **Tổng** | | **73** |

Một dòng test phủ đúng 6 cặp (mỗi cặp tham số một cặp giá trị). Cận dưới trên số dòng: hai tham số lớn nhất là Vai trò và Cột sắp xếp, 4 nhân 4 bằng 16 cặp mà mỗi dòng chỉ phủ được 1 cặp loại này, vậy **cần ít nhất 16 dòng**. Cận dưới khác từ 73 chia 6 chỉ là 13 dòng, thấp hơn nên cận dưới 16 là cái ràng buộc. Nếu tìm được bộ đúng 16 dòng thì đó là bộ **tối ưu**.

Kết quả mong đợi: 144 tổ hợp, 73 cặp, cận dưới 16 dòng.

### Bước 4. Dựng bảng 16 dòng không cần công cụ
Mục đích: hiểu cách làm, sau đó mới dùng công cụ.

Ý tưởng: dành mỗi dòng cho một cặp (Vai trò, Cột sắp xếp), được 4 nhân 4 bằng 16 dòng, hai tham số này đã được phủ trọn vẹn. Hai tham số còn lại (Trạng thái, Số dòng) có 3 giá trị; ta "xoay vòng" chúng theo chỉ số để phủ đều. Đánh số chỉ số từ 0: i là chỉ số Vai trò (0 đến 3), j là chỉ số Cột sắp xếp (0 đến 3). Dùng công thức:

```text
Trạng thái    = giá trị số ((i + j) mod 3)   của danh sách [Tất cả, Hoạt động, Đã khoá]
Số dòng/trang = giá trị số ((i + 2j) mod 3)  của danh sách [5, 10, 20]
```

Vì sao đúng? Với mỗi vai trò cố định, khi j chạy 0 đến 3 thì `(i + j) mod 3` đi qua đủ ba giá trị, nên cặp (Vai trò, Trạng thái) phủ đủ. Tương tự, `2j mod 3` lần lượt 0, 2, 1, 0 phủ đủ ba giá trị, nên cặp (Vai trò, Số dòng) phủ đủ. Cùng lập luận với cột sắp xếp cố định và i chạy 0 đến 3. Cuối cùng cặp (Trạng thái, Số dòng): hai giá trị này là hàm tuyến tính độc lập của (i, j) theo modulo 3 nên mọi cặp 9 tổ hợp xuất hiện.

Kết quả là bảng 16 dòng (cột "Số người" và "Trang" là kết quả mong đợi tính ở Bước 5):

| # | Vai trò | Trạng thái | Số dòng | Cột sắp xếp |
|---|---------|------------|---------|-------------|
| 1 | Tất cả | Tất cả | 5 | Tên |
| 2 | Tất cả | Hoạt động | 20 | Email |
| 3 | Tất cả | Đã khoá | 10 | Vai trò |
| 4 | Tất cả | Tất cả | 5 | Ngày tạo |
| 5 | Admin | Hoạt động | 10 | Tên |
| 6 | Admin | Đã khoá | 5 | Email |
| 7 | Admin | Tất cả | 20 | Vai trò |
| 8 | Admin | Hoạt động | 10 | Ngày tạo |
| 9 | Editor | Đã khoá | 20 | Tên |
| 10 | Editor | Tất cả | 10 | Email |
| 11 | Editor | Hoạt động | 5 | Vai trò |
| 12 | Editor | Đã khoá | 20 | Ngày tạo |
| 13 | Viewer | Tất cả | 5 | Tên |
| 14 | Viewer | Hoạt động | 20 | Email |
| 15 | Viewer | Đã khoá | 10 | Vai trò |
| 16 | Viewer | Tất cả | 5 | Ngày tạo |

### Bước 5. Kiểm chứng phủ đủ 73 cặp bằng script
Mục đích: không tin vào lập luận bằng mắt.

Lưu script sau vào file `pairs.mjs` (ngoài thư mục test) rồi chạy `node pairs.mjs`. Script dựng 16 dòng bằng đúng công thức ở Bước 4, liệt kê 73 cặp cần phủ và đếm cặp bị thiếu.

```js
const names = ["role", "status", "size", "sort"];
const values = [
  ["all", "admin", "editor", "viewer"],
  ["all", "active", "locked"],
  [5, 10, 20],
  ["name", "email", "role", "createdAt"],
];

// Dựng 16 dòng: i là chỉ số vai trò, j là chỉ số cột sắp xếp.
const rows = [];
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    rows.push([values[0][i], values[1][(i + j) % 3], values[2][(i + 2 * j) % 3], values[3][j]]);
  }
}

// Mọi cặp cần phủ: với mỗi cặp tham số (a, b), mỗi cặp giá trị.
const required = new Set();
for (let a = 0; a < 4; a++)
  for (let b = a + 1; b < 4; b++)
    for (const x of values[a])
      for (const y of values[b]) required.add(`${names[a]}=${x}|${names[b]}=${y}`);

// Cặp đã phủ bởi các dòng.
const covered = new Set();
for (const r of rows)
  for (let a = 0; a < 4; a++)
    for (let b = a + 1; b < 4; b++) covered.add(`${names[a]}=${r[a]}|${names[b]}=${r[b]}`);

const missing = [...required].filter((p) => !covered.has(p));
console.log(`dòng: ${rows.length}, cặp cần: ${required.size}, cặp thiếu: ${missing.length}`);
```

Kết quả mong đợi khi chạy:

```text
dòng: 16, cặp cần: 73, cặp thiếu: 0
```

Nếu bạn thêm hoặc đổi giá trị, script cho biết ngay còn thiếu cặp nào (in `missing`).

Công cụ có sẵn: **PICT** của Microsoft nhận file mô hình mỗi dòng một tham số, ví dụ `Vai trò: Tất cả, Admin, Editor, Viewer`, rồi chạy `pict model.txt` để in bảng tổ hợp. Nếu cài được PICT, hãy so sánh số dòng của nó với 16; thường khác nhau, miễn là phủ đủ cặp. Công cụ cũng cho phép khai báo ràng buộc để loại tổ hợp bất khả thi.

### Bước 6. Tính kết quả mong đợi bằng oracle độc lập
Mục đích: mỗi dòng phải có đáp án không lấy từ ứng dụng.

Dữ liệu seed của LAB-08 có 37 người dùng (BR-01). Bạn tự đếm bằng cách lọc từng vai trò và trạng thái trên `/lab/table`: 6 Admin, 11 Editor, 20 Viewer; 28 đang hoạt động và 9 bị khoá (khớp TC-U-006 với 11 Editor và TC-U-007 với 3 Editor bị khoá). Phân bố chi tiết:

| | Hoạt động | Đã khoá | Tổng |
|--|-----------|---------|------|
| Admin | 4 | 2 | 6 |
| Editor | 8 | 3 | 11 |
| Viewer | 16 | 4 | 20 |
| Tổng | 28 | 9 | 37 |

Với mỗi dòng: Số người lọc được là ô tương ứng ở bảng trên; số hàng trên trang 1 bằng nhỏ hơn giữa số dòng mỗi trang và số người; số trang bằng làm tròn lên của số người chia số dòng mỗi trang (ít nhất 1).

| # | Số người | Hàng trên trang 1 | Số trang |
|---|----------|--------------------|----------|
| 1 | 37 | 5 | 8 |
| 2 | 28 | 20 | 2 |
| 3 | 9 | 9 | 1 |
| 4 | 37 | 5 | 8 |
| 5 | 4 | 4 | 1 |
| 6 | 2 | 2 | 1 |
| 7 | 6 | 6 | 1 |
| 8 | 4 | 4 | 1 |
| 9 | 3 | 3 | 1 |
| 10 | 11 | 10 | 2 |
| 11 | 8 | 5 | 2 |
| 12 | 3 | 3 | 1 |
| 13 | 20 | 5 | 4 |
| 14 | 16 | 16 | 1 |
| 15 | 4 | 4 | 1 |
| 16 | 20 | 5 | 4 |

Cách sắp xếp được kiểm bằng `aria-sort` trên tiêu đề cột: cột "Tên" là mặc định tăng dần; các cột khác bấm một lần thì thành tăng dần (BR-05).

### Bước 7. Bổ sung ca rủi ro cao và ghi nhận giới hạn
Mục đích: pairwise không phải toàn bộ chiến lược.

Pairwise phủ cặp nhưng không phủ mọi **bộ ba**. Hai bổ sung bắt buộc cho bảng này: (1) các ca đã có test case mẫu mà bảng chưa chạm như TC-U-006 (đổi bộ lọc khi đang ở trang 2 phải về trang 1, đây là BR-03, liên quan trạng thái trang chứ không phải tổ hợp) và TC-U-007 (Editor và Đã khoá cho 3 người); dòng 9 và 12 ở bảng 16 dòng đã gần với TC-U-007 (Editor, Đã khoá) nhưng vẫn nên giữ TC-U-007 vì đó là ca đã từng có bug; (2) các ca biên của dữ liệu như trang cuối còn 7 dòng (TC-U-002), không do tổ hợp sinh ra.

Quy tắc ngón tay cái: pairwise cho "đủ rộng", BVA và bảng quyết định cho "đủ sâu" ở chỗ rủi ro; ghi trong tài liệu test rằng pairwise không phủ bộ ba.

## Demo code
Spec sinh 16 test từ công thức (cùng một công thức với script). Ô chọn Vai trò và Trạng thái dùng `value` của `<option>` (`all`, `admin`, `editor`, `viewer`, `active`, `locked`). Phần oracle tính lại số người từ công thức sinh dữ liệu seed.

```ts
import { test, expect } from "@playwright/test";

// Oracle: tái tạo công thức sinh 37 người dùng (vai trò theo i chia 7 và chia 3, khoá theo i chia 4).
const users = Array.from({ length: 37 }, (_, i) => ({
  role: i % 7 === 0 ? "admin" : i % 3 === 0 ? "editor" : "viewer",
  status: i % 4 === 3 ? "locked" : "active",
}));

// Nhãn tiêu đề cột để bấm sắp xếp.
const COLS = { name: "Tên", email: "Email", role: "Vai trò", createdAt: "Ngày tạo" } as const;

// Dựng 16 dòng pairwise bằng công thức xoay vòng.
const R = ["all", "admin", "editor", "viewer"];
const S = ["all", "active", "locked"];
const Z = [5, 10, 20];
const K = ["name", "email", "role", "createdAt"] as const;
const rows: { role: string; status: string; size: number; sort: keyof typeof COLS }[] = [];
for (let i = 0; i < 4; i++)
  for (let j = 0; j < 4; j++)
    rows.push({ role: R[i], status: S[(i + j) % 3], size: Z[(i + 2 * j) % 3], sort: K[j] });

rows.forEach((p, idx) => {
  const id = `PW-${String(idx + 1).padStart(2, "0")}`;
  test(`[${id}] ${p.role} / ${p.status} / ${p.size} dòng / sắp theo ${p.sort}`, async ({ page }) => {
    await page.goto("/lab/table");
    await page.getByTestId("reset-data").click();

    // Thiết lập bốn tham số.
    await page.getByLabel("Vai trò").selectOption(p.role);
    await page.getByLabel("Trạng thái").selectOption(p.status);
    await page.getByLabel("Số dòng mỗi trang").selectOption(String(p.size));
    if (p.sort !== "name") await page.getByRole("button", { name: COLS[p.sort] }).click();

    // Kết quả mong đợi từ oracle.
    const total = users.filter(
      (u) => (p.role === "all" || u.role === p.role) && (p.status === "all" || u.status === p.status),
    ).length;
    const pages = Math.max(1, Math.ceil(total / p.size));

    await expect(page.getByTestId("total-count")).toHaveText(`${total} người dùng`);
    await expect(page.getByTestId("user-row")).toHaveCount(Math.min(p.size, total));
    await expect(page.getByTestId("page-info")).toHaveText(`Trang 1/${pages}`);
    await expect(page.getByRole("columnheader", { name: COLS[p.sort] })).toHaveAttribute("aria-sort", "ascending");
  });
});
```

Giải thích: `getByLabel("Vai trò")` khớp ô chọn có nhãn "Vai trò" (tiêu đề cột cùng tên là `columnheader` nên không trùng với `getByLabel`). `selectOption` nhận `value` của option. Cột "Tên" đang là sắp xếp mặc định nên không bấm; với cột khác một lần bấm cho `aria-sort="ascending"`. Oracle trong spec lặp lại công thức dữ liệu seed là nhược điểm: nếu lab đổi dữ liệu, bạn phải cập nhật; đổi lại, đáp án không lấy từ chính ứng dụng.

## Thử ngay trong lab
Mở `/lab/table`, thực hiện tay 3 dòng bất kỳ của bảng 16 dòng (ví dụ #6, #11, #14) và đối chiếu số người, số hàng, số trang. Sau đó chạy spec trên lab sạch (cả 16 xanh). Thử bật `?bugs=BUG-03` (sắp xếp theo ngày tạo bị sai) trong `goto`: kiểm tra kết quả khi cột sắp xếp là Ngày tạo ở dòng #4, #8, #12, #16. Spec trên chỉ kiểm `aria-sort`, nên có thể vẫn xanh; hãy thêm kiểm tra thứ tự các dòng cho dòng #4 (Tất cả, Tất cả, sắp theo Ngày tạo tăng dần): dòng đầu là 01/01/2025 và dòng thứ hai phải chứa 08/01/2025. BUG-03 sắp theo chuỗi `dd/mm/yyyy` nên dòng thứ hai sai, còn dòng đầu thì vẫn đúng.

## Lỗi thường gặp
- **Triệu chứng**: script báo `cặp thiếu` lớn hơn 0 sau khi bạn sửa tay bảng. **Nguyên nhân**: xoá hoặc đổi dòng làm mất cặp. **Cách sửa**: in `missing`, thêm dòng chứa cặp còn thiếu.
- **Triệu chứng**: test đỏ với `Expected: "Trang 1/8" Received: "Trang 1/2"`. **Nguyên nhân**: chưa đổi Số dòng mỗi trang trước khi đọc, hoặc đọc trước khi bảng cập nhật. **Cách sửa**: thiết lập đủ bốn tham số rồi mới `expect` (web-first tự chờ).
- **Triệu chứng**: dòng #1 đỏ với `Expected: "ascending" Received: "descending"` ở `aria-sort`. **Nguyên nhân**: bấm vào cột Tên vốn đang sắp tăng dần nên đảo thành giảm dần. **Cách sửa**: không bấm cột mặc định (đoạn `if (p.sort !== "name")` trong spec).
- **Triệu chứng**: pairwise cho cảm giác phủ đủ nhưng bug ở tổ hợp ba tham số vẫn lọt (ví dụ Editor, Đã khoá, 5 dòng/trang, sắp theo Email). **Nguyên nhân**: pairwise chỉ bảo đảm cặp. **Cách sửa**: thêm tay các tổ hợp rủi ro cao; ghi rõ trong tài liệu giới hạn của kỹ thuật.
- **Triệu chứng**: coi tổ hợp không thể xảy ra là một dòng test. **Nguyên nhân**: không khai báo ràng buộc. **Cách sửa**: ví dụ nếu một giá trị phụ thuộc giá trị khác, loại khỏi mô hình hoặc dùng ràng buộc của công cụ.

## Tóm tắt
- Pairwise bảo đảm mọi cặp giá trị của mọi cặp tham số xuất hiện ít nhất một lần, với rất ít test.
- Cần tính ba con số: tổ hợp đầy đủ (144), số cặp cần phủ (73) và cận dưới số dòng (16, tích hai tham số lớn nhất).
- Có thể dựng bảng tối ưu bằng công thức xoay vòng và kiểm chứng bằng script đếm cặp thiếu.
- Mỗi dòng cần kết quả mong đợi tính độc lập (oracle), không lấy từ ứng dụng.
- Pairwise không phủ bộ ba: phải bổ sung ca rủi ro cao từ BVA và bảng quyết định.
- Công cụ như PICT giúp sinh bảng khi nhiều tham số và có ràng buộc.

## Bài tập
1. Tính tay số tổ hợp đầy đủ, số cặp và cận dưới cho 3 tham số: Vai trò (4), Trạng thái (3), Số dòng (3). Xong khi: bạn ra 36 tổ hợp, 33 cặp và cận dưới 12 dòng, và dựng được bảng 12 dòng bằng công thức `(i + j) mod 3`.
2. Chạy script `pairs.mjs`, sau đó xoá tuỳ ý một dòng và xem script báo những cặp nào thiếu. Xong khi: bạn giải thích được vì sao thiếu đúng các cặp đó.
3. Chạy spec ở phần Demo và đối chiếu với bảng ở Bước 6. Xong khi: 16 test xanh và bạn tự kiểm tay ít nhất 3 dòng.
4. Lập mô hình pairwise cho form đăng ký của `/lab/forms` (LAB-02): chọn ít nhất 4 tham số (ví dụ loại tệp, tuổi, nhóm sở thích, đồng ý điều khoản). Xong khi: bạn tính được số tổ hợp, số cặp, cận dưới và dựng bảng phủ đủ cặp.
5. Thêm 2 test rủi ro cao ngoài bảng 16 dòng (ví dụ TC-U-006 và TC-U-007) vào spec. Xong khi: bạn giải thích được vì sao hai ca đó không nên chỉ trông vào pairwise.
