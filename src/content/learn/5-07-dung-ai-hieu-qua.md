---
title: Dùng AI hiệu quả trong automation
level: 5
order: 7
minutes: 45
summary: Viết prompt đủ ngữ cảnh, review code do AI sinh ra bằng checklist, kiểm chứng bằng cách bật bug, dùng Playwright MCP và agents, và giữ an toàn dữ liệu.
keywords: [playwright mcp, ai viết test automation, prompt cho tester]
---

## Mục tiêu bài học
- Phân biệt việc AI làm tốt và việc AI làm kém trong automation, để giao đúng việc.
- Viết prompt gồm năm thành phần (vai trò, ngữ cảnh, đầu vào, ràng buộc, định dạng đầu ra) và tạo file quy tắc dùng lại cho cả dự án.
- Review code do AI sinh ra bằng checklist cụ thể và sửa các lỗi AI hay mắc (chờ cố định, locator mong manh, assertion lấy theo hành vi hiện tại).
- Kiểm chứng test do AI viết có thật sự bắt được lỗi bằng cách bật bug của lab.
- Biết Playwright MCP và Playwright agents là gì, cài thế nào, và dùng an toàn.

## Bạn cần chuẩn bị
- Đã học locator hướng người dùng (bài 2.5), assertion (bài 2.8), thiết kế test case (bài 3.7) và chọn test để automate (bài 3.9).
- Quyền truy cập một công cụ AI bất kỳ (trợ lý trong IDE, chat, hoặc dòng lệnh). Bài viết không phụ thuộc một sản phẩm cụ thể.
- Project Playwright chạy được; lab `/lab/cart` và `/lab/login` của site để thực hành.

## Kiến thức cần nắm
- AI mạnh ở: **giải thích** code lạ, **gợi ý** test case và dữ liệu biên, **chuyển đổi** (Selenium sang Playwright), **viết nháp** Page Object và test.
- AI yếu ở: hiểu **nghiệp vụ riêng** của bạn, biết **bug thật** nằm ở đâu, giữ nhất quán trên cả dự án.
- **Prompt**: câu lệnh bạn đưa cho AI; chất lượng đầu ra phụ thuộc mạnh vào chất lượng ngữ cảnh trong prompt.
- **Playwright MCP**: máy chủ MCP (Model Context Protocol, giao thức để AI gọi công cụ) cho AI điều khiển trình duyệt thật qua Playwright.
- **Playwright agents**: bộ agent (planner, generator, healer) sinh ra bằng lệnh `npx playwright init-agents` để AI lập kế hoạch, sinh và sửa test.
- Mọi đầu ra của AI **phải được người đọc, chạy và hiểu** trước khi commit.
- Bảo mật: không dán khoá, dữ liệu khách hàng hay mã nguồn nhạy cảm vào dịch vụ bên ngoài.

## Giải thích dễ hiểu
AI giống **một thực tập sinh rất nhanh và rất tự tin**: viết nháp nhanh, đôi khi nói sai mà vẫn rất chắc chắn. Bạn là **người hướng dẫn**: đưa ngữ cảnh rõ ràng, kiểm tra từng sản phẩm, và chịu trách nhiệm cuối cùng. Một thực tập sinh chưa biết luật của công ty bạn sẽ đoán; AI cũng vậy. Phần "đoán" đó chính là chỗ lỗi nảy sinh.

Vì sao có chuyện AI viết test "xanh nhưng vô nghĩa"? Vì AI thường lấy **hành vi hiện tại của ứng dụng** làm kỳ vọng. Nếu ứng dụng có bug (giảm giá vượt trần), AI nhìn thấy giảm 320.000 và viết assertion "giảm 320.000". Test xanh, bug được "đóng dấu" là đúng. Người kiểm thử giỏi đặt kỳ vọng từ **yêu cầu** (tối đa 100.000), không từ hành vi hiện tại.

Một cách nghĩ hữu ích: AI là **máy khuếch đại**. Nếu bạn có phân tích tốt (BR rõ ràng, bảng quyết định, biên), AI khuếch đại thành code nhanh gấp nhiều lần. Nếu bạn không có phân tích, AI khuếch đại sự mơ hồ thành nhiều code sai. Vì vậy thứ tự đúng là: bạn nghĩ (bài 3.x), AI giúp viết, bạn kiểm tra.

## Thực hành từng bước
Ví dụ xuyên suốt: lab giỏ hàng `/lab/cart` (LAB-03) với luật giảm giá `SALE10`: giảm 10 phần trăm cho đơn từ 500.000 đồng trở lên, giảm tối đa 100.000 đồng.

### Bước 1. Chuẩn bị ngữ cảnh: yêu cầu thật và quy tắc của dự án
Mục đích: AI chỉ giỏi khi nó biết luật. Tạo một file quy tắc ngắn và dán vào đầu mỗi cuộc trò chuyện (nhiều công cụ có chỗ cho file hướng dẫn chung của dự án, ví dụ `CLAUDE.md` hoặc file tương đương; hãy xem công cụ của bạn).

```text
Quy tắc test của dự án này:
- Playwright + TypeScript, chạy bằng npx playwright test.
- Locator ưu tiên getByRole, getByLabel, getByTestId; không dùng CSS dài, XPath hay nth().
- Không dùng page.waitForTimeout; chờ bằng web-first assertion (expect(locator)...).
- Mỗi test độc lập, bắt đầu bằng click nút Reset (data-testid="reset-data").
- Kỳ vọng lấy từ Business Rules, không lấy từ hành vi hiện tại của ứng dụng.
- Tên test bằng tiếng Việt mô tả hành vi.
```

| Dòng | Vì sao cần |
|------|-----------|
| Công cụ và lệnh chạy | AI không viết nhầm sang Cypress hoặc Python. |
| Locator ưu tiên | Giữ test bền (bài 2.5, 2.6). |
| Cấm `waitForTimeout` | Ngăn nguyên nhân flaky phổ biến nhất (bài 5.6). |
| Reset đầu mỗi test | Test độc lập. |
| Kỳ vọng từ BR | Ngăn "đóng dấu" bug hiện tại. |

Kết quả mong đợi: bạn có một file bạn dùng lại cho mọi prompt, nên không phải gõ lại và đầu ra nhất quán hơn.

### Bước 2. Viết prompt đủ năm thành phần để sinh test case
Mục đích: bắt đầu từ thiết kế test, chưa phải code. Một prompt tốt gồm **vai trò, ngữ cảnh, đầu vào, ràng buộc, định dạng đầu ra**:

```text
Vai trò: bạn là QA automation dùng Playwright + TypeScript.

Ngữ cảnh: trang giỏ hàng /lab/cart. Business Rules:
- BR-02: mã SALE10 giảm 10%, đơn tối thiểu 500.000đ, giảm tối đa 100.000đ.
- BR-03: miễn phí ship khi tạm tính sau giảm giá từ 1.000.000đ trở lên, ngược lại 30.000đ.

Đầu vào: chỉ dùng các BR ở trên, không suy đoán thêm luật.

Ràng buộc: áp dụng giá trị biên (BVA) quanh 500.000đ và trần giảm giá; nêu rõ giả định nếu BR chưa đủ rõ.

Đầu ra: bảng gồm ID, mô tả, dữ liệu vào, kết quả mong đợi, BR liên quan. Chưa viết code.
```

| Thành phần | Trong ví dụ |
|-----------|-------------|
| Vai trò | QA automation Playwright + TypeScript |
| Ngữ cảnh | Trang và các BR thật |
| Đầu vào | Giới hạn nguồn thông tin, tránh AI bịa thêm luật |
| Ràng buộc | Kỹ thuật cần dùng (BVA) và yêu cầu nêu giả định |
| Định dạng đầu ra | Bảng, chưa viết code |

Kết quả mong đợi: một bảng test case. Việc của bạn: đối chiếu với BR gốc từng dòng. Ví dụ, AI có thể đề xuất đơn 499.999 đồng không được giảm giá, đúng; nhưng nếu nó viết "giảm 100.000 tại đơn 1.000.000" thì đó là phép tính sai (10 phần trăm của 1.000.000 là 100.000, đúng bằng trần, còn ở 1.500.000 mới thật sự chạm trần). Chính bạn phải kiểm tra phép tính.

Nếu đầu ra chung chung hoặc sai lệch: bổ sung dữ liệu cụ thể (giá sản phẩm có sẵn trên lab, ví dụ sản phẩm 250.000 và 3.200.000 trong spec), hoặc yêu cầu "liệt kê các giả định trước khi viết".

### Bước 3. Cho AI viết nháp code từ test case đã duyệt
Mục đích: chỉ chuyển sang code khi test case đã được bạn duyệt.

```text
Dựa trên bảng test case đã duyệt dưới đây, viết spec Playwright TypeScript cho /lab/cart.
Tuân thủ quy tắc dự án ở trên. Dùng test.describe và vòng lặp for để làm data-driven cho các dòng BVA.
Mỗi test bắt đầu bằng page.goto("/lab/cart") và click getByTestId("reset-data").
Nếu cần giả định về locator, ghi chú ngay trên code thay vì tự bịa.
[dán bảng test case đã duyệt]
```

Kết quả mong đợi: một file spec nháp. Chưa tin nó. Chuyển sang Bước 4.

### Bước 4. Review đầu ra của AI bằng checklist
Mục đích: bắt các lỗi quen thuộc. Dưới đây là đoạn AI hay sinh ra, kèm lỗi:

```ts
// AI SINH RA (có vấn đề)
test("áp mã giảm giá", async ({ page }) => {
  await page.goto("/lab/cart");
  await page.click("div.grid > div:nth-child(2) button");          // (1)
  await page.fill("#coupon", "SALE10");                            // (2)
  await page.click("text=Áp dụng");
  await page.waitForTimeout(2000);                                 // (3)
  const discount = await page.locator("[data-testid=discount]").innerText();
  expect(discount).toBe("-50.000");                                // (4)
});
```

| Điểm | Vấn đề | Cách sửa |
|------|--------|----------|
| (1) | Chọn theo vị trí và CSS dài: vỡ khi đổi giao diện; còn thiếu reset dữ liệu. | `page.getByTestId("product-p2").getByRole("button", { name: "Thêm vào giỏ" })` và click `reset-data` đầu test. |
| (2) | `#coupon` là id AI tự đoán, có thể không tồn tại. | `page.getByLabel("Mã giảm giá")`, nhãn có thật trên lab. |
| (3) | `waitForTimeout` là chờ cố định, nguyên nhân flaky. | Bỏ, dùng assertion tự chờ. |
| (4) | `innerText` lấy một lần, so sánh chuỗi có định dạng; số 50.000 lấy từ đâu? Không rõ kỳ vọng đến từ BR hay từ hành vi hiện tại. | Dùng `expect(locator).toHaveText(...)` hoặc đọc số rồi so với giá trị **tính từ BR**: 10 phần trăm của 500.000 là 50.000. |

Bản đã sửa, khớp với spec đáp án `e2e/cart-lab.spec.ts` của site:

```ts
import { test, expect, type Page } from "@playwright/test";

const num = async (page: Page, id: string) =>
  Number((await page.getByTestId(id).innerText()).replace(/[^\d-]/g, ""));

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/cart");
  await page.getByTestId("reset-data").click();
});

test("SALE10 giảm 10 phần trăm khi đơn đúng 500.000", async ({ page }) => {
  const card = page.getByTestId("product-p2");               // sản phẩm giá 250.000
  await card.getByRole("button", { name: "Thêm vào giỏ" }).click();
  await card.getByRole("button", { name: /^Tăng/ }).click(); // số lượng 2: tổng 500.000

  await page.getByLabel("Mã giảm giá").fill("SALE10");
  await page.getByRole("button", { name: "Áp dụng" }).click();

  expect(await num(page, "discount")).toBe(-(500_000 * 0.1)); // kỳ vọng tính từ BR-02
});
```

Checklist review bạn có thể in ra:
1. Locator hướng người dùng, không phụ thuộc vị trí hay CSS dài; nhãn và `data-testid` có thật.
2. Không có `waitForTimeout`; mọi chờ đều là điều kiện.
3. Mỗi test độc lập và có bước reset.
4. Assertion có ý nghĩa nghiệp vụ; **kỳ vọng truy được về một BR**.
5. Không có dữ liệu nhạy cảm, khoá, mật khẩu thật.
6. Code chạy được: bạn **đã chạy** nó và thấy xanh.

Kết quả mong đợi: sau khi sửa, `npx playwright test` xanh. Nếu thấy lỗi `strict mode violation` hoặc `locator resolved to 2 elements`: AI chọn locator quá rộng, thu hẹp trong vùng chứa như `product-p2`.

### Bước 5. Kiểm chứng test có bắt được lỗi bằng cách bật bug
Mục đích: test xanh trên bản đúng chưa chứng minh nó có giá trị; phải đỏ khi hệ thống sai. Lab có sẵn bug toggle: LAB-03 `BUG-02` làm giảm giá vượt trần. Viết test cho trần 100.000 rồi chạy hai lần:

```ts
test("giảm giá bị chặn ở 100.000", async ({ page }) => {
  const card = page.getByTestId("product-p3");               // sản phẩm giá 3.200.000
  await card.getByRole("button", { name: "Thêm vào giỏ" }).click();
  await page.getByLabel("Mã giảm giá").fill("SALE10");
  await page.getByRole("button", { name: "Áp dụng" }).click();
  expect(await num(page, "discount")).toBe(-100_000);
});
```

Chạy trên bản sạch rồi trên bản có bug (dùng URL `?bugs=BUG-02` trong test, hoặc biến `LAB_BUGS` của starter repo):

```bash
npx playwright test cart
LAB_BUGS=BUG-02 npx playwright test cart
```

| Phần | Ý nghĩa |
|------|---------|
| `LAB_BUGS=BUG-02` | Biến môi trường để cấu hình tiêm bug qua cookie `lab_bugs` (cú pháp dành cho macOS, Linux và Git Bash; PowerShell dùng `$env:LAB_BUGS="BUG-02"; npx playwright test cart`). |

Kết quả mong đợi: lần đầu xanh, lần hai đỏ với `Expected: -100000, Received: -320000`. Test đã "bắt" được bug. Nếu test vẫn xanh khi bật bug thì AI đã viết assertion theo hành vi hiện tại hoặc không kiểm tra điều bạn nghĩ.

### Bước 6. Cài Playwright MCP để AI điều khiển trình duyệt thật
Mục đích: cho AI tự khám phá trang thay vì đoán locator. **Playwright MCP** là máy chủ MCP của Microsoft; AI gọi các công cụ như điều hướng, bấm, chụp "ảnh chụp cây truy cập" (accessibility snapshot: mô tả trang bằng role và tên, không phải ảnh). Cách cài phụ thuộc công cụ AI của bạn; cấu hình phổ biến nhất là thêm vào file cấu hình MCP:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

| Phần | Ý nghĩa |
|------|---------|
| `mcpServers` | Danh sách máy chủ MCP mà công cụ AI sẽ khởi chạy. |
| `command` và `args` | Lệnh khởi chạy máy chủ: chạy gói `@playwright/mcp` bằng `npx`. |
| `@latest` | Lấy bản mới nhất; có thể ghim phiên bản cụ thể để ổn định. |

Một số công cụ cho thêm bằng lệnh; ví dụ với Claude Code: `claude mcp add playwright npx @playwright/mcp@latest` (cú pháp theo tài liệu playwright.dev/docs/getting-started-mcp). Cần Node.js 20 trở lên. Mặc định trình duyệt chạy có giao diện; thêm `"--headless"` vào `args` để chạy ngầm, `"--browser=firefox"` để đổi trình duyệt (`chrome`, `firefox`, `webkit`, `msedge`). Tên file và lệnh cấu hình khác nhau giữa các công cụ, nên hãy đối chiếu tài liệu của công cụ bạn dùng.

Dùng thử, đưa cho AI yêu cầu: "Mở `/lab/cart` của site, thêm một sản phẩm, áp mã SALE10 và mô tả các phần tử bạn tương tác cùng locator Playwright phù hợp". Kết quả mong đợi: AI mở trình duyệt, thao tác và đề xuất locator dựa trên cây truy cập (thường là `getByRole` và `getByLabel`). Bạn vẫn phải kiểm tra, vì AI có thể chọn locator đúng với trang lúc đó nhưng chưa có `data-testid` ổn định.

Nếu gặp lỗi không khởi chạy được: kiểm tra đã có Node và `npx`; chạy `npx @playwright/mcp@latest` trực tiếp trong terminal xem lỗi gì; trình duyệt chưa cài thì chạy `npx playwright install`.

### Bước 7. Thử Playwright agents (planner, generator, healer)
Mục đích: biết quy trình có cấu trúc do Playwright cung cấp. Lệnh khởi tạo trong project:

```bash
npx playwright init-agents --loop=claude
```

| Phần | Ý nghĩa |
|------|---------|
| `init-agents` | Sinh ra các file định nghĩa agent trong repo. |
| `--loop=<công cụ>` | Chọn nền tảng AI. Với Playwright 1.64, `npx playwright init-agents --help` liệt kê: `claude`, `codex`, `copilot`, `opencode`, `vscode`, `vscode-legacy` (danh sách có thể khác ở phiên bản bạn dùng). |
| `--prompts` (tuỳ chọn) | Có sinh thêm các file prompt hay không. |

Kết quả mong đợi: với `--loop=claude`, lệnh in ra (đã chạy thật trên Playwright 1.64):

```text
 Using project "chromium" as a primary project
 specs\README.md - directory for test plans
 tests\seed.spec.ts - default environment seed file
 .claude\agents\playwright-test-generator.md - agent definition
 .claude\agents\playwright-test-healer.md - agent definition
 .claude\agents\playwright-test-planner.md - agent definition
 .mcp.json - mcp configuration
 Done.
```

(Mỗi dòng có thêm biểu tượng emoji ở đầu.) Nghĩa là: thư mục `specs/` chứa kế hoạch test, `tests/seed.spec.ts` là test "hạt giống" mô tả môi trường khởi đầu, ba file agent trong `.claude/agents/`, và `.mcp.json` khai báo máy chủ MCP tên `playwright-test` (khởi chạy bằng `npx playwright run-test-mcp-server`; trên Windows là `cmd /c npx playwright run-test-mcp-server`). Với `--loop=vscode`, các file nằm ở `.github/agents/*.agent.md` và `.vscode/mcp.json`. Ba file agent mô tả ba vai trò: **planner** (khám phá ứng dụng và lập kế hoạch test), **generator** (biến kế hoạch thành test), **healer** (chạy và sửa test đỏ). Đây là chế độ nâng cao; quy tắc vẫn như trên: bạn duyệt kế hoạch, đọc code sinh ra, và đặc biệt cảnh giác với healer vì nó có xu hướng sửa test cho xanh bằng cách nới assertion.

### Bước 8. Giữ an toàn: cái gì được và không được đưa cho AI
Mục đích: tránh rò rỉ dữ liệu. Trước khi dán vào bất kỳ dịch vụ bên ngoài, tự hỏi:

| Có thể đưa | Không đưa |
|-----------|-----------|
| Code test, Page Object, BR đã được phép chia sẻ | Khoá API, token, mật khẩu, chuỗi kết nối |
| Dữ liệu giả (`ban@example.com`, `user@lab.dev`) | Dữ liệu khách hàng thật, thông tin cá nhân |
| Thông báo lỗi đã xoá thông tin nhạy cảm | Log chứa token, cookie, header xác thực |
| Mã nguồn mở hoặc mã được công ty cho phép | Mã nguồn độc quyền khi chưa có chính sách cho phép |

Hỏi người phụ trách bảo mật của công ty về chính sách dùng AI trước khi đưa mã nguồn công ty vào. Với Playwright MCP, trình duyệt của AI có thể đăng nhập vào hệ thống thật: chỉ dùng tài khoản test ở môi trường test, không cho AI thao tác trên môi trường production.

## Demo code
Một prompt hoàn chỉnh và cách kiểm chứng nối với nhau. Prompt cuối cùng bạn gửi:

```text
Vai trò: QA automation dùng Playwright + TypeScript.
Ngữ cảnh: trang /lab/cart. BR-02: SALE10 giảm 10%, đơn tối thiểu 500.000đ, tối đa 100.000đ.
Quy tắc: getByRole/getByLabel/getByTestId; không waitForTimeout; mỗi test bắt đầu bằng reset-data.
Nhiệm vụ: viết spec data-driven cho giá trị biên quanh 500.000đ (499.999, 500.000, 500.001 nếu giá sản phẩm cho phép) và trần 100.000đ.
Ràng buộc: kỳ vọng tính từ BR, không từ hành vi hiện tại; nêu giả định nếu thiếu thông tin.
Đầu ra: bảng test case, rồi code, rồi danh sách giả định.
```

Cách kiểm chứng tiếp theo:

```bash
npx playwright test cart                      # phải xanh trên lab sạch
LAB_BUGS=BUG-02 npx playwright test cart      # phải đỏ khi bật bug giảm giá vượt trần
```

Đọc nhanh: prompt có đủ năm thành phần (vai trò, ngữ cảnh, quy tắc/ràng buộc, nhiệm vụ/đầu vào, định dạng đầu ra); hai lệnh sau chứng minh test có giá trị: xanh khi đúng, đỏ khi sai. Nếu AI không thể giải thích giả định, đó là dấu hiệu nó đang đoán.

## Thử ngay trong lab
Dùng AI sinh test cho `/lab/cart`, rồi bật `?bugs=BUG-02` (giảm giá vượt trần) hoặc `?bugs=BUG-03` (huỷ được đơn đang giao) để xem test của AI có phát hiện không. Sau đó với `/lab/login`: nhờ AI viết test khoá tài khoản sau 5 lần sai, bật `?bugs=BUG-02` (khoá sau 6 lần) và xem test có đỏ không. Ghi lại những lần AI viết test xanh nhưng không bắt được bug và lý do.

## Lỗi thường gặp
- Triệu chứng: dán nguyên mã AI sinh ra, chạy thì `locator.click: Test timeout` hoặc `strict mode violation`. Nguyên nhân: AI đoán locator không tồn tại. Cách sửa: yêu cầu AI dùng nhãn và `data-testid` thật, hoặc dùng Playwright MCP để nó xem trang thật; luôn chạy trước khi commit.
- Triệu chứng: test xanh nhưng bật bug vẫn xanh. Nguyên nhân: kỳ vọng lấy từ hành vi hiện tại. Cách sửa: đặt kỳ vọng từ BR, kiểm chứng bằng `?bugs=`.
- Triệu chứng: AI "sửa cho test xanh" bằng cách thêm `waitForTimeout` hoặc nới assertion (ví dụ `toBeTruthy()`). Nguyên nhân: mục tiêu của AI là test xanh, không phải đúng. Cách sửa: cấm rõ trong quy tắc, và đọc diff của mọi lần "sửa".
- Triệu chứng: code mỗi lần một kiểu (có chỗ POM, có chỗ viết thẳng). Nguyên nhân: không có quy tắc chung. Cách sửa: dùng file quy tắc dự án ở Bước 1 và cho AI xem một file mẫu chuẩn.
- Triệu chứng: bí mật bị dán vào chat. Nguyên nhân: sao chép nguyên log hoặc file `.env`. Cách sửa: xoá thông tin nhạy cảm trước khi dán, thu hồi và đổi khoá nếu đã lộ.
- Triệu chứng: không hiểu code AI viết nhưng vẫn commit. Nguyên nhân: tin vào AI hơn vào bản thân. Cách sửa: nếu bạn không giải thích được từng dòng, hãy nhờ AI giải thích hoặc đơn giản hoá cho đến khi hiểu; không hiểu thì không commit.

## Tóm tắt
- AI là thực tập sinh nhanh và tự tin: giao việc có ngữ cảnh, kiểm tra và chịu trách nhiệm cuối cùng.
- Prompt tốt có vai trò, ngữ cảnh, đầu vào, ràng buộc, định dạng đầu ra; file quy tắc dự án giúp nhất quán.
- Làm theo thứ tự: bạn phân tích, AI viết nháp, bạn review bằng checklist rồi chạy.
- Kỳ vọng phải truy được về yêu cầu; kiểm chứng bằng cách bật bug để thấy test đỏ.
- Playwright MCP và agents giúp AI khám phá và sinh test, nhưng không thay phần duyệt của bạn.
- Giữ an toàn dữ liệu: không đưa khoá, dữ liệu thật hay mã nhạy cảm; dùng môi trường test.

## Bài tập
1. Dễ: Viết một prompt đủ 5 thành phần để AI đề xuất test case cho trang đăng nhập `/lab/login` (BR: mật khẩu 8 đến 32 ký tự, khoá sau 5 lần sai). Xong khi bảng test case AI trả về có đủ biên 7, 8, 32, 33 và bạn đã đối chiếu với BR.
2. Cho AI viết spec cho `/lab/cart`, rồi review theo checklist ở Bước 4 và liệt kê mọi lỗi tìm được. Xong khi bạn có danh sách lỗi và bản đã sửa chạy xanh.
3. Bật `?bugs=BUG-02` của LAB-03 để kiểm tra test do AI viết có phát hiện không. Xong khi bạn có bằng chứng test xanh ở bản sạch và đỏ ở bản có bug (hoặc bạn đã sửa test cho đến khi đạt điều này).
4. Viết file quy tắc dự án (Bước 1) cho dự án của bạn gồm ít nhất 6 quy tắc và thử với cùng một yêu cầu có và không có file đó. Xong khi bạn mô tả được sự khác nhau của hai đầu ra.
5. Nâng cao: cài Playwright MCP, nhờ AI khám phá `/lab/forms` và đề xuất locator cho 5 phần tử; kiểm tra từng locator bằng cách chạy thật. Xong khi bạn xác nhận hoặc sửa cả 5 locator và ghi lại những chỗ AI sai.
