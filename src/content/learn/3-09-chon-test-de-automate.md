---
title: Chọn test nào để automate
level: 3
order: 9
minutes: 40
summary: Tiêu chí chọn test đáng automate, phân loại smoke, sanity, regression và tính ROI.
keywords: [regression vs smoke vs sanity, automation roi, test automation strategy]
---

## Mục tiêu bài học
- Giải thích vì sao không nên (và không thể) tự động hoá mọi test case.
- Chấm điểm một danh sách test case theo bốn tiêu chí có trọng số và chọn ra những test đáng automate trước.
- Tính **điểm hoà vốn** (break-even) của một test tự động bằng số liệu cụ thể.
- Phân biệt **smoke**, **sanity** và **regression**, chọn bộ smoke nhỏ và gắn nhãn (tag) để chạy riêng bằng Playwright.

## Bạn cần chuẩn bị
- Đã học bài 3.7 (test case có ưu tiên và BR) và biết chạy `npx playwright test` (Level 2).
- Mở `/labs/login` và `/labs/cart` để xem bộ test case mẫu dùng làm ứng viên.

## Kiến thức cần nắm
- **Automation không phải mục tiêu**: mục tiêu là phát hiện lỗi sớm với chi phí thấp.
- Tiêu chí chọn: rủi ro, tần suất chạy, độ ổn định, độ dễ tự động hoá.
- **ROI** (return on investment) và **điểm hoà vốn**: số lần chạy để chi phí viết test được bù lại.
- **Smoke test**: bộ test nhỏ kiểm các luồng sống còn, chạy ở mọi bản build.
- **Sanity test**: kiểm nhanh một vùng cụ thể sau khi sửa lỗi hoặc thay đổi nhỏ.
- **Regression test**: bộ test rộng, đảm bảo thay đổi mới không làm hỏng chức năng cũ.
- **Flaky test**: test lúc xanh lúc đỏ không vì lỗi thật, làm giảm giá trị bộ test.

## Giải thích dễ hiểu
Hãy nghĩ đến việc rửa bát. Nếu bạn rửa bát mỗi ngày ba lần, mua máy rửa bát rất đáng tiền. Nhưng bạn sẽ không mua một cỗ máy đắt tiền để rửa cái ly thuỷ tinh quý hiếm vài tháng mới dùng một lần, vì rửa tay mất 20 giây. Automation giống máy rửa bát: giá trị nằm ở **việc lặp lại nhiều** và **kết quả ổn định**, chứ không phải bản thân việc có máy.

Một test tự động có hai loại chi phí: chi phí **viết** (một lần, ví dụ 45 phút) và chi phí **bảo trì** (liên tục, mỗi khi giao diện đổi hoặc test bị flaky). Lợi ích là mỗi lần chạy tiết kiệm thời gian của người chạy tay và phát hiện lỗi sớm. Tính toán đơn giản cho thấy một số test hoà vốn sau vài lần chạy, số khác phải chạy hàng chục lần hoặc không bao giờ. Việc của tester là chọn đúng thứ tự: **làm trước những test hoà vốn nhanh và bảo vệ nhiều rủi ro nhất**.

## Thực hành từng bước
Ví dụ xuyên suốt: các test case mẫu của LAB-01 (đăng nhập), LAB-03 (giỏ hàng) và LAB-07 (nghỉ phép), dùng làm danh sách ứng viên.

### Bước 1. Lập danh sách ứng viên
Mục đích: có cái để chấm điểm.

| # | Test case | Mô tả ngắn |
|---|-----------|------------|
| 1 | TC-L-001 | Đăng nhập hợp lệ |
| 2 | TC-L-003, TC-L-004 | Mật khẩu 7 và 8 ký tự (biên) |
| 3 | TC-L-006 | Khoá tài khoản sau 5 lần sai (có 15 phút khoá) |
| 4 | TC-L-009 | Ghi nhớ đăng nhập hiển thị phiên 7 ngày |
| 5 | TC-C-004 | Đơn 250.000đ tính ship 30.000, VAT 20.000 |
| 6 | TC-C-009 | VAT làm tròn (1 Cáp sạc USB-C 99.999đ, VAT 8.000) |
| 7 | TC-C-011 | Không huỷ được đơn đang giao |
| 8 | TC-H-001 | Gửi đơn nghỉ phép hợp lệ |
| 9 | (mới) | Giao diện "trông đẹp, cân đối" |

### Bước 2. Chấm điểm theo bốn tiêu chí có trọng số
Mục đích: biến cảm giác thành con số so sánh được.

Mỗi tiêu chí chấm 1 đến 5 và nhân với trọng số. Tổng tối đa là 5 nhân (3 cộng 2 cộng 2 cộng 1) bằng 40.

| Tiêu chí | Hỏi | Trọng số |
|----------|-----|----------|
| Rủi ro | Nếu hỏng thì thiệt hại thế nào (tiền, an ninh, luồng chính)? | 3 |
| Tần suất | Chạy lại bao nhiêu lần (mỗi build, mỗi tuần)? | 2 |
| Ổn định | Kết quả có ổn định, dễ xác định đúng sai? | 2 |
| Dễ tự động | Có dữ liệu, locator và cách kiểm rõ ràng? | 1 |

Kết quả chấm (rủi ro, tần suất, ổn định, dễ tự động; điểm tổng bằng 3R cộng 2T cộng 2Ô cộng 1D):

| Test case | R | T | Ô | D | Điểm tổng | Gợi ý |
|-----------|---|---|---|---|-----------|-------|
| TC-L-001 đăng nhập hợp lệ | 5 | 5 | 5 | 5 | 15 + 10 + 10 + 5 = 40 | Automate ngay, vào smoke |
| TC-C-004 ship và VAT | 5 | 5 | 5 | 5 | 15 + 10 + 10 + 5 = 40 | Automate ngay, vào smoke |
| TC-H-001 gửi đơn hợp lệ | 4 | 5 | 5 | 4 | 12 + 10 + 10 + 4 = 36 | Automate ngay, vào smoke |
| TC-L-003, TC-L-004 biên mật khẩu | 4 | 4 | 5 | 5 | 12 + 8 + 10 + 5 = 35 | Automate (data-driven) |
| TC-C-011 không huỷ đơn đang giao | 5 | 3 | 5 | 4 | 15 + 6 + 10 + 4 = 35 | Automate, vào regression |
| TC-L-006 khoá sau 5 lần sai | 5 | 3 | 3 | 3 | 15 + 6 + 6 + 3 = 30 | Automate khi có `page.clock` |
| TC-C-009 VAT làm tròn | 3 | 2 | 4 | 4 | 9 + 4 + 8 + 4 = 25 | Automate khi ổn định hoặc có thời gian (có thể gộp vào bộ data-driven của TC-C-004) |
| TC-L-009 ghi nhớ 7 ngày | 2 | 2 | 4 | 3 | 6 + 4 + 8 + 3 = 21 | Hoãn, kiểm tay |
| Giao diện trông đẹp | 2 | 1 | 1 | 1 | 6 + 2 + 2 + 1 = 11 | Kiểm tay, khám phá |

Ngưỡng gợi ý (đội bạn có thể đặt khác): từ 32 điểm trở lên thì automate ngay; từ 24 đến 31 thì automate khi ổn định hoặc có thời gian; dưới 24 thì kiểm tay hoặc khám phá (exploratory).

Giải thích vài điểm: TC-L-006 có ổn định thấp (3) vì phải xử lý thời gian khoá 15 phút, chỉ ổn định khi dùng đồng hồ giả. TC-C-009 từng bị chấm "dễ tự động" bằng 1 (tổng 18, chưa automate) vì lab chưa có sản phẩm nào cho VAT lẻ. Từ khi lab thêm Cáp sạc USB-C 99.999đ, dữ liệu khả đạt (1 cáp có VAT 7.999,92 hiển thị 8.000) nên "dễ tự động" lên 4 và "ổn định" lên 4 (kết quả xác định, không phụ thuộc thời gian); tổng 9 + 4 + 8 + 4 = 25, rơi vào nhóm 24 đến 31. Đây là ví dụ điểm số thay đổi khi điều kiện thay đổi: chấm lại sau mỗi lần dữ liệu hoặc ứng dụng đổi.

### Bước 3. Tính ROI và điểm hoà vốn
Mục đích: biết khi nào việc viết test "có lãi".

Gọi m là thời gian chạy tay mỗi lần (phút), a là chi phí mỗi lần chạy tự động (xem kết quả và bảo trì chia đều, phút), B là thời gian viết test (phút). Chạy N lần thì tiết kiệm được N nhân (m trừ a) trừ B. **Điểm hoà vốn** là số lần N để tiết kiệm bằng 0, tức N bằng B chia (m trừ a), làm tròn lên.

| Test | m | a | B | m trừ a | Hoà vốn sau (lần chạy) | Tiết kiệm sau 20 lần chạy |
|------|---|---|---|---------|------------------------|---------------------------|
| TC-L-001 đăng nhập | 2 | 0,2 | 20 | 1,8 | 12 | 20 nhân 1,8 trừ 20 bằng 16 phút |
| Mật khẩu 8 dữ liệu | 12 | 0,5 | 45 | 11,5 | 4 | 20 nhân 11,5 trừ 45 bằng 185 phút |
| TC-L-006 khoá tài khoản | 3 | 0,3 | 40 | 2,7 | 15 | 20 nhân 2,7 trừ 40 bằng 14 phút |
| TC-L-009 ghi nhớ 7 ngày | 1 | 0,3 | 30 | 0,7 | 43 | 20 nhân 0,7 trừ 30 bằng trừ 16 phút |

Cách tính hoà vốn: TC-L-001 là 20 chia 1,8 bằng 11,1 nên làm tròn lên 12; mật khẩu 8 dữ liệu là 45 chia 11,5 bằng 3,9 nên 4; TC-L-006 là 40 chia 2,7 bằng 14,8 nên 15; TC-L-009 là 30 chia 0,7 bằng 42,9 nên 43. Các số m, a, B ở đây là **ví dụ giả định** để bạn tập tính; ở đội bạn hãy dùng số đo thật (thời gian chạy tay đo bằng đồng hồ, thời gian viết ghi lại khi làm).

Đọc kết quả: bộ test data-driven cho 8 mật khẩu có lãi sau 4 lần chạy, vì tay làm 8 lần mất rất lâu mà máy làm cùng lúc. TC-L-009 cần 43 lần chạy mới hoà vốn, nên nếu bạn chỉ chạy 20 lần mỗi tháng thì sau một tháng còn lỗ 16 phút, kiểm tay rẻ hơn. Bảo trì mỗi lần giao diện đổi cũng là chi phí; test càng nhiều bước giao diện, chi phí a càng lớn.

### Bước 4. Phân loại smoke, sanity, regression
Mục đích: chạy đúng bộ test vào đúng lúc.

| Loại | Khi nào chạy | Quy mô | Mục tiêu | Ví dụ trên site |
|------|--------------|--------|----------|-----------------|
| Smoke | Mọi build, mọi commit | 3 đến 5 test, dưới 2 phút | Bản build có "sống" không | Đăng nhập hợp lệ, tính tiền đơn nhỏ, gửi đơn nghỉ phép |
| Sanity | Sau khi sửa một lỗi cụ thể | Vài test của một vùng | Lỗi vừa sửa đã hết chưa, vùng quanh đó còn ổn không | Sau khi sửa bug giảm giá vượt trần: các test SALE10 |
| Regression | Trước khi phát hành, chạy đêm | Toàn bộ test điểm cao | Thay đổi mới không phá cái cũ | Mọi test có điểm 24 trở lên |

Quy tắc chọn smoke: chỉ gồm luồng mà nếu hỏng thì không ai dùng được gì nữa (đăng nhập, tạo đơn, tính tiền). Smoke phải **ổn định tuyệt đối** vì nó chặn mọi build; test hay flaky không được vào smoke.

### Bước 5. Gắn nhãn để chạy riêng bằng Playwright
Mục đích: biến phân loại thành lệnh chạy.

Playwright cho phép gắn `tag` cho test hoặc nhóm test; tag bắt đầu bằng ký tự `@`. Sau đó dùng `--grep` để chọn và `--grep-invert` để loại. Phần Demo có ba test smoke trên lab và một test regression; các lệnh chạy:

| Lệnh | Ý nghĩa |
|------|---------|
| `npx playwright test --grep @smoke` | Chỉ chạy test có tag @smoke |
| `npx playwright test --grep @money` | Chỉ chạy test có tag @money (tiền) |
| `npx playwright test --grep-invert @smoke` | Chạy mọi test trừ smoke |

Để chọn test có **một trong hai** tag, đưa biểu thức (là regex) vào dấu nháy kép để shell không hiểu `|` là pipe:

```bash
npx playwright test --grep "@smoke|@money"
```

Bạn có thể đặt lệnh vào `package.json` để cả đội cùng dùng:

```json
{
  "scripts": {
    "test:smoke": "playwright test --grep @smoke",
    "test:regression": "playwright test --grep @regression"
  }
}
```

### Bước 6. Quyết định "không automate" và theo dõi flaky
Mục đích: biết điều gì nên để người làm.

Không nên (hoặc chưa nên) automate: kiểm tra cảm quan (đẹp, dễ dùng), ca chạy một lần, tính năng đang thay đổi từng ngày, ca cần dữ liệu hoặc thiết bị mà bạn chưa có (như TC-C-009 từng bị vậy cho đến khi lab thêm Cáp sạc USB-C). Với những ca này hãy ghi rõ lý do để người sau không hiểu nhầm là "bị bỏ quên". Khi một test tự động bị flaky, đừng bỏ qua: sửa nguyên nhân (đợi sai, dữ liệu không reset) hoặc đưa ra khỏi smoke; một smoke đỏ giả khiến cả đội mất lòng tin.

## Demo code
Spec dưới đây gồm ba test smoke (một cho mỗi lab) và một test regression; chạy được trên site.

```ts
import { test, expect, type Page } from "@playwright/test";

// Đọc số nguyên từ ô hiển thị: "-100.000đ" thành -100000.
const num = async (page: Page, id: string) =>
  Number((await page.getByTestId(id).innerText()).replace(/[^\d-]/g, ""));

// Cả nhóm có tag @smoke: ba luồng sống còn.
test.describe("smoke: ba luồng sống còn", { tag: "@smoke" }, () => {
  test("[TC-L-001][BR-01,BR-02] đăng nhập hợp lệ", async ({ page }) => {
    await page.goto("/lab/login");
    await page.getByTestId("reset-data").click();
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByLabel("Mật khẩu").fill("Passw0rd!");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.getByTestId("dashboard")).toBeVisible();
  });

  test("[TC-C-004][BR-03,BR-04] đơn 250.000đ tính ship và VAT", async ({ page }) => {
    await page.goto("/lab/cart");
    await page.getByTestId("reset-data").click();
    await page.getByTestId("product-p2").getByRole("button", { name: "Thêm vào giỏ" }).click();
    expect(await num(page, "shipping")).toBe(30_000);
    expect(await num(page, "vat")).toBe(20_000);
    expect(await num(page, "total")).toBe(300_000);
  });

  test("[TC-H-001][BR-01,BR-03,BR-06] gửi đơn nghỉ phép hợp lệ", async ({ page, context }) => {
    // Cố định "hôm nay" là 02/03/2026 để ngày test luôn hợp lệ.
    await context.clock.setFixedTime(new Date("2026-03-02T09:00:00"));
    await page.goto("/lab/leave");
    await page.getByTestId("reset-data").click();
    await page.getByLabel("Từ ngày").fill("2026-03-09");
    await page.getByLabel("Đến ngày").fill("2026-03-11");
    await page.getByLabel("Lý do").fill("Đi công tác gia đình xa");
    await page.getByRole("button", { name: "Gửi đơn" }).click();
    await expect(page.getByTestId("leave-status-1")).toHaveText("Chờ duyệt");
    await expect(page.getByTestId("leave-days-1")).toHaveText("3");
    await expect(page.getByTestId("leave-balance")).toHaveText("Phép năm còn 12/12 ngày");
  });
});

// Một test có hai tag: thuộc regression và nhóm "tiền".
test("[TC-C-008][BR-02] giảm giá bị chặn trần", { tag: ["@regression", "@money"] }, async ({ page }) => {
  await page.goto("/lab/cart");
  await page.getByTestId("reset-data").click();
  await page.getByTestId("product-p3").getByRole("button", { name: "Thêm vào giỏ" }).click();
  await page.getByLabel("Mã giảm giá").fill("SALE10");
  await page.getByRole("button", { name: "Áp dụng" }).click();
  expect(await num(page, "discount")).toBe(-100_000);
});
```

Giải thích: tham số thứ hai của `test.describe` và `test` là đối tượng chi tiết, trong đó `tag` nhận một chuỗi hoặc mảng chuỗi (mỗi chuỗi bắt đầu bằng `@`). Tag của nhóm áp cho mọi test con. Đưa tên test dạng `[TC-...][BR-...]` để vừa truy vết vừa lọc được bằng `--grep "BR-03"` (xem bài 3.10). Mỗi test tự `reset-data`, nên chạy riêng lẻ hay cả nhóm đều như nhau.

Kết quả mong đợi khi chạy `npx playwright test --grep @smoke`: ba test xanh. Với `--grep @money`: một test xanh.

## Thử ngay trong lab
Đưa đoạn Demo vào thư mục test của bạn (trong repo site là `e2e/`, trong starter repo là `tests/`) và chạy lần lượt `--grep @smoke`, `--grep @money`, `--grep-invert @smoke`. Dùng `--list` để xem danh sách mà không chạy thật. Sau đó bật bug: sửa `goto` của test giảm giá thành `/lab/cart?bugs=BUG-02` và chạy `--grep @money`: test đỏ ngay (giảm giá 320.000 thay vì 100.000). Hãy trả lời: nếu chỉ chạy smoke, bug này có bị phát hiện không? (Không, vì smoke chỉ gồm TC-C-004; đó là lý do cần regression.)

## Lỗi thường gặp
- **Triệu chứng**: `--grep @smoke` báo `Error: No tests found`. **Nguyên nhân**: quên tag, tag sai (không có `@`), hoặc đường dẫn thư mục test sai. **Cách sửa**: chạy `--list` để xem test nào có tag; kiểm tra `testDir`.
- **Triệu chứng**: bộ smoke chạy 15 phút. **Nguyên nhân**: nhét quá nhiều test vào smoke. **Cách sửa**: giữ smoke từ 3 đến 5 test, dưới 2 phút; phần còn lại thuộc regression.
- **Triệu chứng**: team automate TC-L-009 và mất một ngày bảo trì mỗi lần đổi giao diện. **Nguyên nhân**: không tính ROI. **Cách sửa**: dùng bảng điểm và hoà vốn; ghi rõ lý do hoãn.
- **Triệu chứng**: smoke đỏ rồi xanh khi chạy lại không đổi gì. **Nguyên nhân**: flaky (đợi sai, dữ liệu dính từ test trước). **Cách sửa**: reset dữ liệu từng test, dùng assertion web-first; nếu chưa sửa được, đưa test ra khỏi smoke.
- **Triệu chứng**: `--grep "@smoke|@money"` không hoạt động trong shell. **Nguyên nhân**: ký tự `|` bị shell hiểu là pipe nếu thiếu dấu nháy. **Cách sửa**: đặt biểu thức trong dấu nháy kép.

## Tóm tắt
- Automation không phải mục tiêu; hãy chọn test theo rủi ro, tần suất, ổn định và độ dễ tự động.
- Chấm điểm có trọng số biến cảm tính thành số (ví dụ 40, 35, 30, 25, 21, 11) để cả đội cùng quyết định.
- Điểm hoà vốn N bằng B chia (m trừ a): test data-driven hoà vốn nhanh, test hiển thị ít lặp hoà vốn chậm.
- Smoke nhỏ và tuyệt đối ổn định; sanity nhắm vùng vừa sửa; regression rộng để bảo vệ thay đổi.
- Tag (`@smoke`, `@regression`) cộng `--grep` và `--grep-invert` biến phân loại thành lệnh chạy.
- Ghi rõ vì sao không automate một ca (thiếu dữ liệu, cảm quan, hay thay đổi) thay vì để nó bị lãng quên.

## Bài tập
1. Chấm điểm 6 test case khác từ `/labs/table` và `/labs/leave` theo bốn tiêu chí, sắp xếp từ cao xuống thấp. Xong khi: mỗi dòng có đủ R, T, Ô, D và điểm tổng được tính đúng.
2. Tính điểm hoà vốn cho một test do bạn đo thật: tự chạy tay một test case ba lần để lấy m, ghi thời gian viết để lấy B. Xong khi: bạn có N và kết luận nên automate hay không, kèm số liệu.
3. Chọn 4 test case cho bộ smoke của LAB-08 (`/lab/table`) và gắn tag `@smoke`. Xong khi: `npx playwright test --grep @smoke --list` liệt kê đúng 4 test và tổng chạy dưới 2 phút.
4. Viết một lệnh npm `test:money` chạy mọi test có tag `@money`, rồi thêm tag này cho ít nhất 3 test liên quan đến tiền ở LAB-03. Xong khi: lệnh chạy xanh và `--list` cho thấy đúng 3 test.
5. (Nâng cao) Với 12 test điểm cao nhất của bạn, chia ra smoke, sanity và regression, giải thích bằng một câu cho từng nhóm. Xong khi: không test nào thuộc smoke mà flaky hoặc chạy lâu quá 30 giây.
