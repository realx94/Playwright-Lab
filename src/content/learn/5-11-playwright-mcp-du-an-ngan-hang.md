---
title: "Playwright MCP: để AI tự khám phá và viết test (dự án ngân hàng)"
level: 5
order: 11
minutes: 70
summary: Hiểu Playwright MCP và accessibility snapshot, cấu hình, chu trình planner, generator, healer; cho AI khám phá lab Ngân hàng, viết prompt tốt, kiểm chứng test do AI sinh bằng cách bật bug, và nắm rủi ro cùng danh sách kiểm.
keywords: [playwright mcp, playwright agents planner generator healer, ai viết test, accessibility snapshot, init-agents]
---

## Mục tiêu bài học
- Giải thích Playwright MCP là gì, vì sao nó dùng **accessibility snapshot** (cây truy cập) thay vì ảnh chụp màn hình, và hệ quả với chất lượng locator.
- Cấu hình Playwright MCP bằng file `.mcp.json` hoặc lệnh của công cụ AI, với các tuỳ chọn an toàn (`--isolated`, `--headless`, `--allowed-origins`, `--secrets`...).
- Mô tả chu trình **planner, generator, healer** do `npx playwright init-agents` dựng và viết file `tests/seed.spec.ts` phù hợp cho lab Ngân hàng.
- Viết prompt để AI khám phá lab `bank` (chuyển tiền nhiều bước, OTP giả, hạn mức ngày) mà vẫn đặt kỳ vọng từ Business Rules chứ không từ hành vi hiện tại.
- **Kiểm chứng** test do AI sinh bằng cách chạy với `?bugs=` để thấy test phải đỏ, và dùng danh sách kiểm trước khi chấp nhận.
- Nêu được các rủi ro: dữ liệu nhạy cảm, quyền, locator mong manh, hallucination, prompt injection.

## Bạn cần chuẩn bị
- Đã học bài 5.7 (dùng AI hiệu quả; bài đó đã giới thiệu prompt năm thành phần, checklist review, cài MCP cơ bản và chạy `init-agents`). Bài này **đi sâu hơn** chứ không nhắc lại chi tiết.
- Đã học assertion (bài 2.8), debug và trace (bài 2.13), annotation và retry (bài 2.19), thiết kế test (bài 3.3 và 3.4 cho giá trị biên và bảng quyết định).
- Một công cụ AI hỗ trợ MCP (trợ lý trong IDE, hoặc dòng lệnh như Claude Code). Bài **không phụ thuộc** một sản phẩm cụ thể.
- Node.js LTS, project Playwright chạy được, site lab ở `http://localhost:3000`. Bài dùng LAB-05 `/lab/bank`.

## Thành thật về phạm vi bài này
Tác giả bài này **không chạy được AI** trong môi trường viết bài. Vì vậy: phần **luồng làm việc và prompt mẫu** là mô tả, không phải bản ghi cuộc trò chuyện thật; còn mọi thứ có thể kiểm chứng bằng máy đã được **chạy thật**: các tuỳ chọn của `@playwright/mcp` (lấy từ `--help`), nội dung các file agent do Playwright 1.64 sinh, phiên MCP thật (khởi động máy chủ với đúng các cờ ở Bước 2, liệt kê 25 công cụ, gọi `browser_navigate` và nhận snapshot của trang Ngân hàng), và kết quả chạy hai bộ test ở Bước 7 với từng bug. Chỗ nào là mô tả sẽ được ghi rõ.

## Kiến thức cần nắm
- **MCP** (Model Context Protocol): giao thức để ứng dụng AI gọi công cụ bên ngoài. **Playwright MCP** là máy chủ MCP cho AI điều khiển trình duyệt thật.
- **Accessibility snapshot**: văn bản mô tả trang theo role và tên (giống cách trình đọc màn hình hiểu trang), kèm mã tham chiếu để AI chỉ định phần tử.
- **Playwright agents**: ba agent **planner** (khám phá và lập kế hoạch), **generator** (sinh test từ kế hoạch), **healer** (chạy và sửa test đỏ).
- **Seed test** (`tests/seed.spec.ts`): test "hạt giống" đưa ứng dụng về trạng thái xuất phát.
- **Oracle**: nguồn cho biết kết quả đúng. Với AI, oracle phải là yêu cầu (BR), không phải hành vi đang thấy.
- Kiểm chứng test: xanh trên bản sạch, **đỏ** khi bật bug tương ứng.

## Giải thích dễ hiểu

### AI khám phá giống người mới đi thử một ứng dụng lạ
Bạn nhờ một đồng nghiệp mới thử app ngân hàng và viết kịch bản kiểm thử. Người này chưa biết quy định phí, hạn mức. Nếu bạn chỉ nói "thử đi", họ sẽ bấm thử, thấy "phí 3.300" rồi ghi "phí phải là 3.300". Nếu ứng dụng có lỗi, họ ghi luôn lỗi thành kỳ vọng. Nếu bạn đưa tài liệu quy định và dặn "kỳ vọng lấy từ đây", họ sẽ phát hiện chỗ không khớp. AI y hệt: **khám phá** giúp nó biết giao diện (có gì, bấm đâu), còn **quy định nghiệp vụ** phải do bạn đưa.

### Vì sao snapshot thay vì ảnh?
Có hai cách để AI "nhìn" trang: ảnh chụp (đắt, mơ hồ, phải đoán vị trí) hoặc **văn bản có cấu trúc** mô tả cây truy cập. Playwright MCP chọn cách thứ hai theo mặc định: AI nhận danh sách phần tử với role và tên, như `button "Tiếp tục"` hoặc `textbox "Số tiền (₫)"`, rồi gọi công cụ kiểu "bấm phần tử có mã tham chiếu này". Ba hệ quả: rẻ và nhanh hơn ảnh; chính xác hơn vì không phải đoán toạ độ; và **locator AI sinh ra có xu hướng là `getByRole` hoặc `getByLabel`**, đúng thứ ta muốn (bài 2.5). Nhưng phần tử thiếu role hoặc tên thì AI cũng không thấy rõ, nên chất lượng khả năng truy cập của app ảnh hưởng trực tiếp tới chất lượng test AI sinh.

Đây là snapshot thật do Playwright MCP (bản 0.0.83) trả về khi tác giả gọi công cụ `browser_navigate` tới `http://localhost:3000/lab/bank` (đã lược bỏ phần đầu trang và thành phần công cụ dev của Next.js; mỗi phần tử có mã tham chiếu `ref=eN` để AI chỉ định khi bấm hay gõ):

```text
- form "Thông tin chuyển tiền" [ref=e18]:
  - heading "Bước 1 · Thông tin chuyển tiền" [level=2] [ref=e19]
  - generic [ref=e20]:
    - generic [ref=e21]: Số tài khoản nhận
    - textbox "Số tài khoản nhận" [ref=e22]
  - generic [ref=e23]:
    - generic [ref=e24]: Số tiền (₫)
    - textbox "Số tiền (₫)" [ref=e25]
  - generic [ref=e26]:
    - generic [ref=e27]: Nội dung chuyển khoản
    - textbox "Nội dung chuyển khoản" [ref=e28]
  - button "Tiếp tục" [ref=e29]
- region "Lịch sử giao dịch" [ref=e30]:
  - heading "Lịch sử giao dịch" [level=2] [ref=e31]
  - paragraph [ref=e32]: Chưa có giao dịch.
- button "Reset dữ liệu lab" [ref=e33]
```

Phản hồi của công cụ gồm vài phần: khối **Ran Playwright code** (đoạn code tương đương, ở đây là `await page.goto('http://localhost:3000/lab/bank');`; chính điều này giúp AI và bạn biết hành động tương ứng với code nào), thông tin trang (URL, tiêu đề, số lỗi console) và **liên kết tới tệp snapshot** (ở bản này tệp nằm trong thư mục `.playwright-mcp/` của nơi chạy; cách trả snapshot có thể khác giữa các bản, nhớ thêm thư mục này vào `.gitignore`). Công cụ khác như `browser_snapshot` trả snapshot mới nhất theo yêu cầu.

Sau khi nhập hợp lệ rồi bấm **Tiếp tục**, bước 2 hiện như sau (mô tả bằng `locator.ariaSnapshot()` của Playwright, cùng cơ chế nhưng không có mã `ref`):

```text
- region "Xác nhận chuyển tiền":
  - heading "Bước 2 · Xác nhận" [level=2]
  - paragraph: "Người nhận: Nguyễn Văn A"
  - paragraph: "Số tiền: 1.000.000 ₫"
  - paragraph: "Phí: 3.300 ₫"
  - paragraph: "Tổng trừ: 1.003.300 ₫"
  - button "Xác nhận"
  - button "Quay lại"
```

Nhận xét: AI đọc được hết luồng chỉ bằng chữ. Cũng thấy ngay một điểm đáng chú ý: các dòng "Phí: ..." là `paragraph` không có nhãn riêng, nên locator AI chọn cho chúng có thể là text mong manh. Lab đặt `data-testid="confirm-fee"` cho các dòng này để test ổn định; nếu AI không dùng test id, hãy bảo nó dùng (Bước 6).

### Planner, generator, healer: ba vai
Chu trình do Playwright cung cấp tách một việc lớn thành ba việc nhỏ, mỗi việc một agent với bộ công cụ riêng:

| Agent | Việc làm | Đầu ra |
|-------|----------|--------|
| **planner** | Mở trang, khám phá, nghĩ kịch bản: happy path, biên, lỗi | Kế hoạch test (Markdown) lưu trong `specs/` |
| **generator** | Với mỗi kịch bản, thật sự thao tác trên trình duyệt rồi viết test | Mỗi kịch bản một file test, mỗi bước có comment |
| **healer** | Chạy test, gỡ lỗi test đỏ, đề xuất sửa | Test được sửa, hoặc đánh dấu `test.fixme()` nếu nghĩ test đúng |

Tách như vậy giúp **bạn duyệt giữa chừng**: đọc kế hoạch (rẻ) trước khi cho sinh code (đắt), rồi đọc code trước khi cho healer sửa. Điểm cần cảnh giác nhất là healer: mục tiêu của nó là "test xanh", và nếu bug là thật thì cách "chữa" nhanh nhất là nới assertion. Phần dưới đây dạy cách chặn điều đó.

## Thực hành từng bước

### Bước 1. Xem lab Ngân hàng bằng mắt người trước khi nhờ AI
Mục đích: bạn phải hiểu hệ thống trước khi giao việc, nếu không bạn không duyệt nổi kết quả.

Mở `http://localhost:3000/lab/bank`. Số dư ban đầu 10.000.000 ₫. Đi hết một vòng bằng tay: nhập số tài khoản nhận `0123456789`, số tiền `1000000`, bấm **Tiếp tục** (bước 2 hiện phí 3.300 ₫ và tổng 1.003.300 ₫), bấm **Xác nhận** (bước 3: mã OTP giả lập hiện ngay trên màn hình), nhập mã, bấm **Xác thực** (bước 4: "Giao dịch thành công", mã `TX0001`, số dư 8.996.700 ₫).

Và nắm Business Rules (đọc ở `docs/04-lab-catalog.md`, mục LAB-05; luật nằm ở `src/lib/labs/bank-rules.ts`):

| Mã | Luật |
|----|------|
| BR-01 | Số tiền nguyên từ 10.000 đến 5.000.000; số tiền cộng phí không vượt số dư |
| BR-02 | Hạn mức ngày 8.000.000 ₫ cộng dồn, đặt lại vào ngày hôm sau |
| BR-03 | Phí: đến 500.000 (kể cả đúng 500.000) là 0; trên đó đến 2.000.000 là 3.300; trên đó 11.000 |
| BR-04 | Tài khoản nhận gồm 10 số, tồn tại, không phải tài khoản của mình |
| BR-05 | OTP hiệu lực 60 giây, sai 3 lần thì huỷ giao dịch |
| BR-06 | Mã giao dịch dạng `TXnnnn`, có lịch sử, giữ khi tải lại |

Kết quả mong đợi: bạn nói được bằng lời "một giao dịch gồm bốn bước và những luật nào chi phối". Nếu chưa nói được, chưa nên giao cho AI.

### Bước 2. Cấu hình Playwright MCP
Mục đích: cho công cụ AI quyền điều khiển trình duyệt, với phạm vi vừa đủ.

Bài 5.7 đã nêu cấu hình tối thiểu. Ở đây thêm các tuỳ chọn thật sự quan trọng với dự án ngân hàng. Tạo hoặc sửa file cấu hình MCP của công cụ bạn dùng (nhiều công cụ đọc `.mcp.json` ở thư mục dự án):

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--isolated",
        "--headless",
        "--allowed-origins",
        "http://localhost:3000",
        "--test-id-attribute",
        "data-testid"
      ]
    }
  }
}
```

Giải thích từng tuỳ chọn (đối chiếu bằng `npx @playwright/mcp@latest --help`, đã chạy với phiên bản 0.0.83 khi viết bài):

| Tuỳ chọn | Ý nghĩa |
|----------|---------|
| `--isolated` | Hồ sơ trình duyệt **giữ trong bộ nhớ**, không lưu cookie hay đăng nhập xuống đĩa; mỗi phiên sạch |
| `--headless` | Chạy ngầm; mặc định là hiện trình duyệt (bỏ cờ này khi muốn xem AI thao tác) |
| `--allowed-origins` | Danh sách **origin tin cậy** (ngăn cách bằng dấu chấm phẩy). Lưu ý: tài liệu của chính tuỳ chọn này ghi rõ nó **không phải ranh giới bảo mật** và không áp cho chuyển hướng, nên chỉ coi là chốt chặn nhẹ |
| `--blocked-origins` | Chặn các origin |
| `--test-id-attribute` | Thuộc tính dùng cho test id; mặc định đã là `data-testid` |
| `--secrets <file>` | Tệp dạng dotenv chứa bí mật; dùng để không dán mật khẩu vào prompt (xem Bước 8) |
| `--storage-state <file>` | Nạp trạng thái đăng nhập cho phiên cô lập |
| `--caps` | Bật khả năng bổ sung: `vision`, `pdf`, `devtools` |
| `--snapshot-mode` | `full` (mặc định) hoặc `none` |
| `--save-session`, `--output-dir` | Lưu phiên và thư mục chứa tệp đầu ra (ảnh, log) |
| `--browser`, `--device`, `--viewport-size` | Chọn trình duyệt, thiết bị giả lập, kích thước |

Với Claude Code có thể thêm bằng lệnh (cú pháp trong bài 5.7): `claude mcp add playwright npx @playwright/mcp@latest`. Tên file, tên lệnh của các công cụ khác nhau, hãy đối chiếu tài liệu công cụ của bạn.

Kết quả mong đợi: khởi động lại công cụ AI, nó liệt kê các công cụ trình duyệt. Tác giả đã khởi động máy chủ với đúng các cờ trên và yêu cầu danh sách công cụ: có 25 công cụ, trong đó `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`, `browser_fill_form`, `browser_select_option`, `browser_press_key`, `browser_wait_for`, `browser_take_screenshot`, `browser_network_requests`, `browser_console_messages`, `browser_evaluate` và `browser_run_code_unsafe` (tên cuối cho thấy có công cụ chạy code tuỳ ý: thêm lý do để giới hạn quyền, xem Bước 8). Danh sách có thể khác ở bản khác. Nếu không thấy, chạy riêng `npx @playwright/mcp@latest --headless` trong terminal để xem lỗi (thiếu Node hoặc trình duyệt: chạy `npx playwright install`). Gói khai báo yêu cầu Node từ bản 18 trở lên; nên dùng bản LTS mới.

### Bước 3. Dựng bộ agent và viết seed test cho lab Ngân hàng
Mục đích: chuẩn bị chu trình planner, generator, healer trong project test.

```bash
npx playwright init-agents --loop=claude
```

Lệnh, cờ `--loop` và kết quả mong đợi (danh sách file sinh ra: `specs/README.md`, `tests/seed.spec.ts`, ba file agent trong `.claude/agents/`, `.mcp.json`) đã được giải thích với output thật ở bài 5.7, Bước 7; không lặp lại. Điều mới ở đây là **ba file agent nói gì**, vì bạn nên đọc chúng trước khi tin chúng. Tác giả đã đọc các tệp mẫu đi kèm Playwright 1.64:

- **planner** có các công cụ trình duyệt (điều hướng, bấm, gõ, snapshot, đọc console và yêu cầu mạng...) cùng `planner_setup_page` (gọi **một lần** để chuẩn bị trang bằng seed) và `planner_save_plan` (lưu kế hoạch). Chỉ dẫn của nó: khám phá bằng snapshot, **không chụp ảnh trừ khi thật cần**, mỗi kịch bản có tiêu đề, các bước, kết quả mong đợi, giả định "luôn xuất phát từ trạng thái trống", và các kịch bản **độc lập, chạy thứ tự nào cũng được**.
- **generator** có `generator_setup_page`, `generator_read_log`, `generator_write_test` và các công cụ `browser_verify_*` (kiểm tra phần tử hiện, văn bản, giá trị). Nó thực hiện **từng bước trên trình duyệt thật**, đọc log, rồi ghi **một test cho mỗi file**, đặt trong một `describe` trùng tên mục của kế hoạch, mỗi bước có comment.
- **healer** có `test_run`, `test_debug`, `test_list`, `browser_snapshot`, `browser_generate_locator` và quyền sửa file. Quy trình: chạy test, gỡ lỗi từng test đỏ, tìm nguyên nhân (locator, thời gian, dữ liệu), sửa, chạy lại. **Điều đáng chú ý**: nếu nó "rất tin test đúng" mà test vẫn đỏ, nó được dặn đánh dấu `test.fixme()` kèm comment giải thích hành vi thực tế. Nghĩa là **bug thật có thể bị healer chuyển thành `fixme` im lặng**; bạn phải đọc diff (xem danh sách kiểm).

Nay viết `tests/seed.spec.ts` để mọi kịch bản xuất phát từ lab sạch. Seed mặc định chỉ có thân rỗng; thay bằng:

```ts
import { test } from "@playwright/test";

test.describe("Bank lab", () => {
  test("seed", async ({ page }) => {
    await page.goto("/lab/bank");
    await page.getByTestId("reset-data").click();
  });
});
```

Giải thích: `goto` mở trang (dùng `baseURL` trong config), nút **Reset dữ liệu lab** (`data-testid="reset-data"`) đưa số dư và lịch sử về ban đầu. Đây là nơi bạn "dặn" mọi agent trạng thái xuất phát.

Kết quả mong đợi: `npx playwright test seed` xanh (tác giả đã chạy thật bản này: `1 passed`). Nếu `page.goto` báo URL không hợp lệ, `baseURL` chưa đặt trong `playwright.config.ts`.

### Bước 4. Cho planner khám phá và lập kế hoạch (mô tả luồng và prompt mẫu)
Mục đích: lấy kế hoạch kịch bản; **chưa sinh code**. Đây là bước dùng AI hiệu quả nhất vì rẻ để sửa.

Prompt mẫu (gửi cho công cụ AI, yêu cầu dùng agent planner; cách gọi agent khác nhau giữa các công cụ, ví dụ nêu tên `playwright-test-planner`):

```text
Dùng planner để lập kế hoạch test cho trang http://localhost:3000/lab/bank (chuyển tiền 4 bước).
Xuất phát từ tests/seed.spec.ts (lab sạch).

Business Rules (đây là NGUỒN SỰ THẬT, không suy ra từ hành vi bạn thấy):
- BR-01: số tiền nguyên 10.000 đến 5.000.000; số tiền cộng phí không vượt số dư.
- BR-02: hạn mức chuyển trong ngày 8.000.000 cộng dồn, đặt lại hôm sau.
- BR-03: phí đến 500.000 (kể cả đúng 500.000) là 0; trên đó đến 2.000.000 là 3.300; trên đó 11.000.
- BR-04: tài khoản nhận 10 số, tồn tại, khác tài khoản của mình (1122334455).
- BR-05: OTP hiệu lực 60 giây, sai 3 lần thì huỷ giao dịch.

Yêu cầu:
1. Khám phá bằng snapshot; không dùng ảnh chụp.
2. Mỗi kịch bản: mã BR liên quan, các bước, kết quả mong đợi tính từ BR (nêu phép tính).
3. Dùng giá trị biên (BVA) quanh 500.000, 2.000.000, 5.000.000 và mốc 8.000.000 trong ngày; OTP sai lần 1, 2, 3.
4. Nếu hành vi bạn thấy KHÁC BR, đừng sửa kế hoạch cho khớp: ghi riêng mục "Nghi vấn".
5. Không dùng tham số ?bugs= trong URL; không đăng nhập bằng dữ liệu thật.
6. Mã OTP ở lab được hiển thị trên màn hình (data-testid="otp-hint") vì là giả lập; ghi rõ giả định này.
```

Lý do từng dòng: BR làm **oracle**; yêu cầu 4 biến sự không khớp thành **thông tin** thay vì bị che; yêu cầu 5 tránh việc AI tự bật bug (trang có ghi chú về `?bugs=`, một AI "thông minh quá mức" có thể đọc nó); dòng 6 nói rõ giả định đặc thù của lab (ngoài đời OTP đi qua SMS hoặc ứng dụng, test phải đọc qua kênh khác như bài LAB-17).

Kết quả mong đợi (mô tả, không phải bản chạy thật): một file Markdown trong `specs/`, ví dụ `specs/bank-plan.md`, nhóm theo mục như "Chuyển tiền thành công", "Phí theo mốc", "Hạn mức ngày", "OTP", "Kiểm tra đầu vào". Việc của bạn: **đọc từng kịch bản, kiểm tra lại phép tính bằng tay** (ví dụ phí cho 500.001 phải là 3.300, không phải 0), xoá kịch bản thừa, thêm kịch bản còn thiếu. Một kế hoạch tốt có số kịch bản vừa phải; nếu nó đề xuất 60 kịch bản trùng nhau, yêu cầu gộp theo phân vùng tương đương (bài 3.2).

### Bước 5. Cho generator sinh test và đọc kỹ đầu ra (mô tả luồng)
Mục đích: biến kịch bản đã duyệt thành test chạy được.

Prompt mẫu:

```text
Dùng generator để sinh test cho các kịch bản đã duyệt trong specs/bank-plan.md, mục "Phí theo mốc" và "OTP".
Quy tắc: locator ưu tiên getByRole, getByLabel, getByTestId; không waitForTimeout; mỗi test độc lập
(xuất phát từ seed); kỳ vọng lấy từ kế hoạch (đã tính từ BR). Với dòng phí và OTP dùng data-testid có sẵn
(confirm-fee, otp-hint, transfer-error). Với hạn mức theo ngày, dùng context.clock.setFixedTime để cố định ngày.
```

Kết quả mong đợi (mô tả): một vài file test, mỗi file một kịch bản, trong `describe` trùng tên mục kế hoạch, mỗi bước có comment. Mẫu bạn nên kỳ vọng là test theo bảng dữ liệu. Dưới đây là **bản đã duyệt** của bộ phí, hạn mức, OTP; tác giả viết tay theo hình mẫu mà một AI tốt được hướng dẫn như trên sẽ cho ra, rồi **chạy thật** để dùng ở Bước 7:

```ts
import { test, expect, type Page } from "@playwright/test";

const BUGS = process.env.LAB_BUGS ? `?bugs=${process.env.LAB_BUGS}` : "";
const ACCOUNT = "0123456789";

async function open(page: Page) {
  await page.goto("/lab/bank" + BUGS);
  await page.getByTestId("reset-data").click();
}

async function fillStep1(page: Page, amount: string, account = ACCOUNT) {
  await page.getByLabel("Số tài khoản nhận").fill(account);
  await page.getByLabel("Số tiền (₫)").fill(amount);
  await page.getByRole("button", { name: "Tiếp tục" }).click();
}

async function payWithOtp(page: Page) {
  await page.getByRole("button", { name: "Xác nhận" }).click();
  const code = (await page.getByTestId("otp-hint").textContent())!;
  await page.getByLabel("Mã OTP").fill(code);
  await page.getByRole("button", { name: "Xác thực" }).click();
}

test.describe("Chuyển tiền (kỳ vọng tính từ BR)", () => {
  test.beforeEach(async ({ page }) => {
    await open(page);
  });

  const fees: [string, string][] = [
    ["499999", "0 ₫"],
    ["500000", "0 ₫"],
    ["500001", "3.300 ₫"],
    ["2000000", "3.300 ₫"],
    ["2000001", "11.000 ₫"],
  ];
  for (const [amount, fee] of fees) {
    test(`BR-03 phí của ${amount} ₫ là ${fee}`, async ({ page }) => {
      await fillStep1(page, amount);
      await expect(page.getByTestId("confirm-fee")).toHaveText(`Phí: ${fee}`);
    });
  }

  test("BR-02 hạn mức ngày cộng dồn", async ({ page, context }) => {
    await context.clock.setFixedTime(new Date("2026-03-01T03:00:00Z"));
    await fillStep1(page, "5000000");
    await payWithOtp(page);
    await expect(page.getByTestId("txn-success")).toBeVisible();
    await page.getByRole("button", { name: "Chuyển tiếp" }).click();
    await fillStep1(page, "3000001");
    await expect(page.getByTestId("transfer-error")).toHaveText("Vượt hạn mức chuyển trong ngày 8.000.000 ₫");
  });

  test("BR-05 sai OTP lần thứ 3 thì huỷ giao dịch", async ({ page }) => {
    await fillStep1(page, "100000");
    await page.getByRole("button", { name: "Xác nhận" }).click();
    for (let i = 1; i <= 3; i++) {
      const code = (await page.getByTestId("otp-hint").textContent())!;
      await page.getByLabel("Mã OTP").fill(code === "111111" ? "222222" : "111111");
      await page.getByRole("button", { name: "Xác thực" }).click();
    }
    await expect(page.getByTestId("transfer-error")).toHaveText("Nhập sai OTP quá 3 lần, giao dịch đã bị huỷ");
    await expect(page.getByRole("heading", { name: /Bước 1/ })).toBeVisible();
  });
});
```

Giải thích: biến `BUGS` đọc từ biến môi trường `LAB_BUGS` để bạn bật bug khi kiểm chứng mà không sửa code; `open` luôn bắt đầu từ trạng thái sạch; bảng `fees` là giá trị biên của BR-03 (mốc 500.000 và 2.000.000); test hạn mức **cố định giờ** để kết quả không phụ thuộc ngày chạy (cùng kỹ thuật như bài 5.6, Bước 7); test OTP cố ý nhập mã **khác** mã đúng (nếu mã đúng là `111111` thì nhập `222222`). Bạn sẽ thấy lab có spec đáp án đầy đủ hơn ở `e2e/bank-lab.spec.ts`, nơi bạn có thể đối chiếu.

Kết quả mong đợi: khi chạy trên lab sạch, cả 7 test của khối này xanh (tác giả đã chạy thật). Nếu test AI sinh ra dùng `page.waitForTimeout`, locator CSS, hoặc chép sẵn kết quả như `"Phí: 3.300 ₫"` cho mọi số tiền, hãy trả lại.

### Bước 6. Prompt tốt: bảy yếu tố cho prompt của dự án ngân hàng
Mục đích: tổng kết kỹ thuật prompt (bài 5.7 đã có năm thành phần), thêm các yếu tố đặc thù cho nghiệp vụ tiền.

| Yếu tố | Ví dụ cho lab Ngân hàng |
|--------|-------------------------|
| Vai trò và công cụ | "QA automation dùng Playwright và TypeScript" |
| Oracle rõ ràng | Dán BR-01 đến BR-05; "kỳ vọng tính từ BR, không từ hành vi hiện tại" |
| Trạng thái xuất phát | "Mỗi test bắt đầu bằng reset-data (seed)" |
| Giới hạn phạm vi | "Chỉ http://localhost:3000; không bật `?bugs=`; không dùng dữ liệu thật" |
| Quy tắc locator | "getByRole, getByLabel, getByTestId có sẵn; không CSS dài, không nth()" |
| Xử lý điều bất định | "Nếu hành vi khác BR, ghi mục Nghi vấn, đừng tự sửa kỳ vọng"; "nêu giả định" |
| Định dạng đầu ra | "Bảng kịch bản trước, code sau; mỗi test có mã BR trong tên" |

Hai thói quen đáng giữ: **yêu cầu AI giải thích phép tính** (phí của 2.000.001 là bao nhiêu và vì sao) để bạn bắt lỗi số học; và **yêu cầu nêu giả định** để bạn thấy chỗ nó đang đoán.

### Bước 7. Kiểm chứng test AI sinh: chạy với bug bật, test phải đỏ
Mục đích: test xanh trên bản đúng chưa chứng minh được gì. Đây là bước quyết định.

Lab Ngân hàng có ba bug: BUG-01 (phí tính cả ở đúng 500.000), BUG-02 (hạn mức ngày không cộng dồn), BUG-03 (sai OTP quá 3 lần không huỷ). Ý tưởng: mỗi bug tương ứng ít nhất một test **phải đỏ**; nếu không, test không bảo vệ gì.

Dùng biến `LAB_BUGS` của bộ test trên (cú pháp Git Bash, macOS và Linux; PowerShell dùng `$env:LAB_BUGS="BUG-01"; npx playwright test ...`):

```bash
npx playwright test bank                    # bản sạch: phải xanh
LAB_BUGS=BUG-01 npx playwright test bank    # phải đỏ ở phí 500000
LAB_BUGS=BUG-02 npx playwright test bank    # phải đỏ ở hạn mức ngày
LAB_BUGS=BUG-03 npx playwright test bank    # phải đỏ ở OTP lần 3
```

Kết quả thật (tác giả chạy bộ ở Bước 5 và so với một **bản nháp yếu** gồm đúng một test "chuyển tiền thành công": nhập 1.000.000, qua OTP, kiểm tra thấy `txn-success`):

| Cấu hình | Bản nháp yếu (1 test) | Bản đã duyệt (7 test) |
|----------|-----------------------|-----------------------|
| Lab sạch | xanh | 7 xanh |
| `BUG-01` | **xanh** (không phát hiện) | 1 đỏ: `Expected: "Phí: 0 ₫"`, `Received: "Phí: 3.300 ₫"` (mốc 500000) |
| `BUG-02` | **xanh** | 1 đỏ: không hiện thông báo `Vượt hạn mức chuyển trong ngày 8.000.000 ₫` |
| `BUG-03` | **xanh** | 1 đỏ: `Expected: "Nhập sai OTP quá 3 lần..."`, `Received: "Mã OTP không đúng (3/3)"` |
| Cả ba bug | **xanh** | 3 đỏ |

Đọc kết quả: bản nháp yếu xanh trong mọi trường hợp, đúng kiểu test "AI hay viết": nó kiểm tra điều dễ (thành công) và bỏ qua điều khó (luật). Bản đã duyệt có đúng ba test đỏ tương ứng ba bug. Nếu bạn nhận một bộ test từ AI, chạy phép thử này trước khi tin nó. Nếu bug bật mà test vẫn xanh, hãy yêu cầu AI thêm test cho luật đó, **dặn rõ BR**, đừng cho nó nhìn trang đang có bug để rút kỳ vọng.

Lưu ý quan trọng khác: **đừng để AI thấy bug rồi viết kỳ vọng theo bug**. Nếu bạn cho planner khám phá `?bugs=BUG-01`, nó sẽ thấy phí 3.300 ở mốc 500.000 và rất có thể ghi đúng điều đó thành kỳ vọng. Hãy cho AI khám phá bản sạch, và chỉ bật bug trong pha kiểm chứng của **bạn**.

### Bước 8. Healer, dữ liệu nhạy cảm và quyền
Mục đích: dùng healer có kiểm soát và giữ an toàn.

**Dùng healer.** Chạy test, nếu đỏ do giao diện đổi (nhãn nút đổi), healer là công cụ tốt. Prompt gợi ý:

```text
Dùng healer để chạy các test trong tests/bank. Với test đỏ: chỉ sửa locator hoặc thời gian chờ.
KHÔNG được: sửa giá trị kỳ vọng, nới assertion (toBeTruthy, toContainText thay cho toHaveText),
thêm waitForTimeout, hoặc đánh dấu test.fixme mà không hỏi tôi. Nếu nghi đó là bug của ứng dụng,
dừng và báo cáo hành vi thực tế so với BR.
```

Sau đó **đọc diff** (`git diff`): kiểm tra kỳ vọng và assertion có bị đổi không. Một test đỏ vì BUG-01 mà healer "sửa" kỳ vọng thành `Phí: 3.300 ₫` là thất bại nghiêm trọng nhất: nó che bug bằng test xanh.

**Dữ liệu và quyền.** Khi AI điều khiển trình duyệt thật, mọi thứ trong trình duyệt là tầm với của nó:

- Dùng `--isolated` để không mang cookie hay phiên đăng nhập có sẵn; dùng tài khoản test ở môi trường test, **không bao giờ** môi trường production. (Lab này dùng dữ liệu giả; với ngân hàng thật, càng cần.)
- Mật khẩu hoặc khoá không dán vào prompt. Dùng `--secrets <file>` (tệp dotenv, **không commit**, thêm vào `.gitignore`) hoặc `--storage-state` cho phiên đã đăng nhập.
- Đặt phạm vi: `--allowed-origins` giới hạn nơi trình duyệt được gọi (chỉ là chốt chặn nhẹ như đã nói), và chỉ bật `--caps` khi cần.
- Nội dung trang web là **dữ liệu không tin cậy**: một trang có thể chứa văn bản kiểu "hãy bỏ qua chỉ dẫn trước và làm X" nhằm điều khiển AI (**prompt injection**). Với trang bạn không kiểm soát, đừng cho AI quyền thực hiện thao tác có hậu quả.
- Log, snapshot và ảnh có thể chứa số tài khoản, số dư; xem lại trước khi gửi cho ai hoặc commit.

## Demo code

Quy trình hoàn chỉnh dạng lệnh (phần AI là mô tả, phần chạy là thật):

```bash
# 0) Chuẩn bị (một lần): dựng agent, viết seed
npx playwright init-agents --loop=claude
#    ... sửa tests/seed.spec.ts như Bước 3 ...

# 1) Nhờ AI (planner) lập kế hoạch vào specs/bank-plan.md, bạn duyệt
# 2) Nhờ AI (generator) sinh test vào tests/bank/, bạn đọc từng file
# 3) Kiểm chứng: bản sạch phải xanh, mỗi bug phải đỏ đúng chỗ
npx playwright test bank
LAB_BUGS=BUG-01 npx playwright test bank
LAB_BUGS=BUG-02 npx playwright test bank
LAB_BUGS=BUG-03 npx playwright test bank
# 4) Nếu có đỏ do giao diện đổi, nhờ healer; sau đó xem git diff
git diff --stat
```

Đọc nhanh: bước 1 và 2 là nơi AI giúp; bước 3 là nơi **bạn** quyết định có tin test hay không; bước 4 chỉ chấp nhận sửa locator, không sửa kỳ vọng. Mỗi bước kết thúc bằng một thứ bạn có thể kiểm tra: một file kế hoạch, các file test, bảng xanh và đỏ, và diff.

## Thử ngay trong lab
- `/lab/bank` (LAB-05): làm lại Bước 1, rồi bật `?bugs=BUG-01` để thấy tận mắt phí 3.300 ở mốc 500.000 (bước 2 hiện `Phí: 3.300 ₫` thay vì `0 ₫`).
- Nhờ công cụ AI của bạn khám phá `/lab/bank` theo prompt ở Bước 4 và so kế hoạch với bảng BR; đánh dấu mọi chỗ AI tính sai hoặc đoán.
- Chạy bộ test ở Bước 5 với từng bug và điền bảng ở Bước 7 cho bộ test do **AI của bạn** sinh ra; kịch bản nào không đỏ khi bug bật cần bổ sung.
- So bộ test của bạn với `e2e/bank-lab.spec.ts` (spec đáp án của site) để xem còn thiếu những mốc nào (biên 10.000 và 5.000.000, OTP hết hạn ở giây 60 và 61, quay lại giữ nguyên dữ liệu).

## Lỗi thường gặp
- Triệu chứng: AI bấm sai nút hoặc báo không tìm thấy phần tử trong lúc khám phá. Nguyên nhân: snapshot cũ (trang đã đổi sau thao tác) hoặc phần tử thiếu tên truy cập. Cách sửa: yêu cầu AI chụp snapshot mới sau mỗi bước; nếu thiếu tên, thêm `aria-label` hoặc `data-testid` cho ứng dụng.
- Triệu chứng: bộ test sinh ra xanh ở mọi cấu hình, kể cả khi bật `?bugs=`. Nguyên nhân: không có oracle (kỳ vọng chép từ giao diện) hoặc chỉ có happy path. Cách sửa: dán BR vào prompt, yêu cầu mã BR trong tên test, và chạy phép thử ở Bước 7.
- Triệu chứng: kế hoạch ghi sai số học (ví dụ phí của 2.000.001 là 3.300). Nguyên nhân: hallucination, AI "nhớ" biểu phí sai. Cách sửa: tự tính lại bằng tay theo BR trước khi duyệt; bắt AI trình bày phép tính.
- Triệu chứng: test dùng locator như `getByText("Phí: 3.300 ₫")` hoặc `locator("p").nth(3)`. Nguyên nhân: AI chọn locator khớp văn bản hiện tại. Cách sửa: yêu cầu dùng `getByTestId("confirm-fee")` và `toHaveText` với giá trị tính từ BR.
- Triệu chứng: healer làm test xanh nhưng assertion yếu đi hoặc có `test.fixme`. Nguyên nhân: mục tiêu của healer là test xanh. Cách sửa: cấm rõ trong prompt, đọc `git diff`, và chạy lại phép thử bật bug.
- Triệu chứng: `page.goto: net::ERR_CONNECTION_REFUSED` khi chạy bộ test. Nguyên nhân: site lab chưa chạy hoặc `baseURL` sai. Cách sửa: chạy `npm run dev` ở thư mục site, kiểm tra cổng.
- Triệu chứng: test OTP xanh trên lab nhưng không áp dụng được ở hệ thật. Nguyên nhân: lab hiển thị OTP trên màn hình (giả lập), hệ thật gửi qua SMS hoặc ứng dụng. Cách sửa: ở hệ thật, đọc OTP qua kênh kiểm thử (email hoặc SMS giả như LAB-17), hoặc dùng cơ chế cấu hình OTP cố định ở môi trường test do nhóm backend cung cấp.

## Danh sách kiểm trước khi chấp nhận test do AI sinh
1. Mỗi test truy được về một BR; kỳ vọng được tính từ BR (có phép tính), không chép từ giao diện.
2. Locator hướng người dùng hoặc test id có thật; không CSS dài, không `nth()`, không `waitForTimeout`.
3. Mỗi test độc lập và xuất phát từ seed (có reset); thứ tự chạy không ảnh hưởng.
4. **Đã chạy**: xanh ở bản sạch.
5. **Đã bật bug**: mỗi bug có ít nhất một test đỏ đúng chỗ (bảng như Bước 7).
6. Đã đọc `git diff` của mọi lần healer sửa: không có assertion bị nới, không có `fixme` mà bạn chưa duyệt.
7. Không có khoá, mật khẩu thật, số tài khoản thật, hoặc log nhạy cảm trong prompt, code, snapshot.
8. Phiên MCP dùng `--isolated`, tài khoản test, môi trường test; phạm vi gọi mạng đã giới hạn.
9. Bạn giải thích được từng dòng; không giải thích được thì chưa commit.

## Tóm tắt
- Playwright MCP cho AI điều khiển trình duyệt thật qua **accessibility snapshot** (văn bản role và tên), nên rẻ, chính xác, và thiên về locator `getByRole`, `getByLabel`.
- `init-agents` dựng planner (khám phá, lập kế hoạch), generator (sinh test, mỗi kịch bản một file), healer (chạy và sửa); `tests/seed.spec.ts` đặt trạng thái xuất phát.
- AI chỉ khám phá được giao diện; **oracle phải do bạn đưa** (BR). Nếu hành vi khác BR, ghi "nghi vấn", không sửa kỳ vọng cho khớp.
- Phép thử quyết định: xanh ở bản sạch và **đỏ** khi bật bug tương ứng. Bản nháp yếu xanh ở mọi cấu hình; bản có BR bắt được cả ba bug của lab Ngân hàng.
- Healer là con dao hai lưỡi: đọc diff, cấm nới assertion và `fixme` im lặng.
- An toàn: `--isolated`, tài khoản và môi trường test, bí mật qua `--secrets`, nội dung trang là dữ liệu không tin cậy.

## Bài tập
1. **Dễ**: Cấu hình Playwright MCP với `--isolated`, `--headless` và `--allowed-origins` cho lab của bạn. Xong khi công cụ AI liệt kê được các công cụ trình duyệt và bạn giải thích được ý nghĩa của từng cờ.
2. **Dễ**: Viết `tests/seed.spec.ts` cho `/lab/bank` như Bước 3 và chạy. Xong khi `npx playwright test seed` xanh và số dư về `10.000.000 ₫` sau mỗi lần chạy.
3. **Vừa**: Viết prompt cho planner theo Bước 4 (có BR, yêu cầu mục Nghi vấn, cấm `?bugs=`), rồi đối chiếu kế hoạch nhận được với bảng BR. Xong khi bạn liệt kê được ít nhất hai chỗ AI tính sai hoặc đoán và bản kế hoạch đã sửa.
4. **Vừa**: Chạy phép thử Bước 7 cho bộ test của bạn (sạch, BUG-01, BUG-02, BUG-03) và điền bảng xanh, đỏ. Xong khi mỗi bug có ít nhất một test đỏ, hoặc bạn đã bổ sung test cho tới khi đạt.
5. **Khó**: Cố tình để healer chữa một test đỏ do BUG-01 (bật `?bugs=BUG-01`) mà **không** cấm nới kỳ vọng, quan sát cách nó "sửa", rồi viết lại prompt để ngăn điều đó. Xong khi bạn có hai bản diff (trước và sau khi thắt prompt) và giải thích được khác biệt.
