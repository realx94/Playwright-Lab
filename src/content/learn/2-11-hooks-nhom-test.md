---
title: Hooks, nhóm test và test.step
level: 2
order: 11
minutes: 40
summary: beforeEach/afterEach, beforeAll/afterAll, describe, serial/parallel và test.step, thực hành với LAB-04 Todo.
keywords: [playwright hooks, test.step, parallel vs serial]
---

## Mục tiêu bài học
- Gom bước chuẩn bị và dọn dẹp vào hooks thay vì lặp lại trong từng test.
- Biết khi nào dùng `beforeEach` và khi nào dùng `beforeAll`, và vì sao `beforeAll` không nhận được `page`.
- Tổ chức test thành nhóm bằng `test.describe`, hiểu chạy song song (parallel) và tuần tự (serial).
- Dùng `test.step` để báo cáo hiện từng bước có tên, dễ biết test hỏng ở đâu.

## Bạn cần chuẩn bị
- Đã học bài 2.4 (cấu trúc test) và 2.8 (assertion).
- Site lab chạy được. Bài dùng LAB-04 `/lab/todo`; nút "Reset dữ liệu lab" (`data-testid="reset-data"`) đưa dữ liệu về rỗng.

## Kiến thức cần nắm
- `test.beforeEach` và `test.afterEach`: chạy quanh **mỗi** test.
- `test.beforeAll` và `test.afterAll`: chạy **một lần** cho cả nhóm (trên mỗi worker).
- `test.describe`: nhóm các test, có thể gắn cấu hình riêng bằng `test.describe.configure`.
- Mặc định, các **file** test chạy song song (mỗi file một worker), còn các test trong cùng một file chạy lần lượt trừ khi bật `fullyParallel`.
- `test.step("tên", async () => {...})`: chia test thành các bước có tên trong báo cáo.

## Giải thích dễ hiểu
Hooks giống việc **dọn bàn ăn ở nhà hàng**. Trước mỗi lượt khách (`beforeEach`) nhân viên trải khăn sạch; sau mỗi lượt (`afterEach`) dọn bát đĩa. Bạn không phải viết lại việc đó cho từng bữa. Còn `beforeAll` giống **mở cửa hàng buổi sáng**: làm một lần cho cả ngày, như bật điện hay mở máy tính tiền.

Vì sao không nên đặt mọi thứ vào `beforeAll`? Vì mọi test trong nhóm sau đó dùng chung một trạng thái. Nếu test thứ hai làm hỏng trạng thái, test thứ ba đỏ theo dù không có lỗi gì. `beforeEach` đắt hơn một chút (chạy nhiều lần) nhưng bảo đảm mỗi test độc lập, điều quan trọng nhất của một bộ test đáng tin.

`test.step` giống **chia bữa tiệc thành các món**: khi thông báo lỗi nói "hỏng ở món tráng miệng" bạn biết ngay chỗ cần xem. Trong báo cáo HTML và trong Trace Viewer, mỗi step là một dòng gấp được.

Về song song: Playwright chạy nhiều **worker** (tiến trình) cùng lúc để nhanh hơn. Mỗi worker chạy test của nó trong một trình duyệt và **context** riêng (bài 2.12), nên dữ liệu của trình duyệt như localStorage không lẫn nhau. Vấn đề chỉ xuất hiện khi các test dùng chung dữ liệu **bên ngoài** trình duyệt (cùng một tài khoản trên server, cùng một bản ghi trong cơ sở dữ liệu).

## Thực hành từng bước

Tạo file `tests/todo-hooks.spec.ts`.

### Bước 1. Test không dùng hook (để thấy sự lặp lại)

Mục đích: nhận ra vấn đề trước khi giải quyết.

```ts
import { test, expect } from "@playwright/test";

test("thêm việc", async ({ page }) => {
  await page.goto("/lab/todo");
  await page.getByTestId("reset-data").click();
  await page.getByLabel("Công việc mới").fill("A");
  await page.getByRole("button", { name: "Thêm", exact: true }).click();
  await expect(page.getByTestId("todo-item")).toHaveCount(1);
});

test("danh sách rỗng lúc đầu", async ({ page }) => {
  await page.goto("/lab/todo");
  await page.getByTestId("reset-data").click();
  await expect(page.getByTestId("todo-empty")).toBeVisible();
});
```

Hai dòng `goto` và `reset-data` lặp lại. Càng nhiều test càng khó sửa (ví dụ đổi đường dẫn). Hãy gom chúng.

Kết quả mong đợi khi chạy `npx playwright test todo-hooks`: hai test xanh.

### Bước 2. Gom vào `beforeEach`

Mục đích: mỗi test tự động bắt đầu từ trạng thái sạch.

```ts
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/todo");
  await page.getByTestId("reset-data").click();
});

test("thêm việc", async ({ page }) => {
  await page.getByLabel("Công việc mới").fill("A");
  await page.getByRole("button", { name: "Thêm", exact: true }).click();
  await expect(page.getByTestId("todo-item")).toHaveCount(1);
});

test("danh sách rỗng lúc đầu", async ({ page }) => {
  await expect(page.getByTestId("todo-empty")).toBeVisible();
});
```

| Phần | Giải thích |
|------|-----------|
| `test.beforeEach(async ({ page }) => ...)` | Hook nhận **cùng fixture** như test (`page`, `context`, `browser`...), và dùng **cùng** `page` với test ngay sau nó |
| Đặt ở đầu file | Áp dụng cho mọi test trong file (hoặc trong khối `describe` bao quanh nó) |

Kết quả mong đợi: hai test xanh, ngắn gọn hơn. Hook chạy trước **từng** test, nên test thứ hai không thấy việc "A" của test thứ nhất.

Nếu gặp lỗi: `Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL` nghĩa là `baseURL` chưa được cấu hình hoặc `BASE_URL` trong `.env` sai (xem bài 0.3).

### Bước 3. Nhóm bằng `test.describe` và hook theo nhóm

Mục đích: mỗi nhóm có hook riêng, tên nhóm xuất hiện trong báo cáo.

```ts
test.describe("LAB-04 thêm việc", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/todo");
    await page.getByTestId("reset-data").click();
  });

  test("tên rỗng bị từ chối", async ({ page }) => {
    await page.getByRole("button", { name: "Thêm", exact: true }).click();
    await expect(page.getByTestId("todo-error")).toContainText("Vui lòng nhập");
  });

  test("trùng tên không phân biệt hoa thường bị từ chối", async ({ page }) => {
    for (const title of ["Mua sữa", "mua SỮA"]) {
      await page.getByLabel("Công việc mới").fill(title);
      await page.getByRole("button", { name: "Thêm", exact: true }).click();
    }
    await expect(page.getByTestId("todo-error")).toHaveText("Công việc này đã tồn tại");
  });
});
```

Báo cáo hiện tên đầy đủ "LAB-04 thêm việc › tên rỗng bị từ chối". Hook trong `describe` chỉ chạy cho test trong nhóm đó; hook ở ngoài vẫn chạy trước hook trong (thứ tự: ngoài vào trong).

Kết quả mong đợi: hai test xanh.

### Bước 4. `afterEach` để dọn và thu thập thông tin khi lỗi

Mục đích: làm việc sau mỗi test, ví dụ đính kèm ảnh chụp nếu test đỏ.

```ts
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const shot = await page.screenshot({ fullPage: true });
    await testInfo.attach("ảnh lúc lỗi", { body: shot, contentType: "image/png" });
  }
});
```

| Phần | Giải thích |
|------|-----------|
| tham số thứ hai `testInfo` | Thông tin về test đang chạy: tên, trạng thái, thư mục kết quả |
| `testInfo.status` | Kết quả thực tế: `"passed"`, `"failed"`, `"timedOut"`... |
| `testInfo.expectedStatus` | Kết quả mong đợi (thường `"passed"`) |
| `testInfo.attach(...)` | Đính kèm tệp vào báo cáo HTML (xem bài 2.14) |

Kết quả mong đợi: test xanh thì không có gì thêm; test đỏ thì báo cáo HTML có thêm tệp đính kèm "ảnh lúc lỗi". Với nhu cầu chụp khi lỗi, thực tế cấu hình `screenshot: "only-on-failure"` đơn giản hơn; ví dụ này chỉ để minh hoạ `afterEach`.

### Bước 5. `beforeAll` và `afterAll` với tài nguyên tự tạo

Mục đích: dựng một `page` dùng chung cho nhiều test (hiếm dùng, nhưng cần biết).

```ts
import { test, expect, type Page } from "@playwright/test";

test.describe("Một phiên làm việc liền mạch trên LAB-04", () => {
  test.describe.configure({ mode: "serial" });

  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto("/lab/todo");
    await page.getByTestId("reset-data").click();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("bước 1: thêm việc", async () => {
    await page.getByLabel("Công việc mới").fill("Mua sữa");
    await page.getByRole("button", { name: "Thêm", exact: true }).click();
    await expect(page.getByTestId("todo-item")).toHaveCount(1);
  });

  test("bước 2: hoàn thành việc vừa thêm", async () => {
    await page.getByRole("checkbox", { name: "Hoàn thành: Mua sữa" }).check();
    await expect(page.getByTestId("todo-count")).toHaveText("Còn 0 việc");
  });
});
```

| Phần | Giải thích |
|------|-----------|
| `test.beforeAll(async ({ browser }) => ...)` | `beforeAll` **không nhận** fixture `page` vì `page` sinh ra theo từng test; nó nhận được `browser` (fixture phạm vi worker) |
| `browser.newPage()` | Tự tạo một context và một page |
| `let page: Page` | Biến dùng chung giữa các test trong nhóm |
| `afterAll` đóng page | Bạn tự tạo thì bạn tự đóng, tránh rò rỉ |
| `mode: "serial"` | Các test chạy lần lượt theo thứ tự khai báo; **nếu một test đỏ, các test sau bị bỏ qua** |

Kết quả mong đợi: hai test xanh theo thứ tự. Đây là cách duy nhất ở đây để bước 2 "thấy" việc vừa thêm ở bước 1. Dùng serial chỉ khi các bước thật sự là một quy trình liền mạch không tách được; mặc định hãy làm từng test độc lập.

### Bước 6. Chạy song song và `fullyParallel`

Mục đích: hiểu hành vi mặc định và cách thay đổi.

Trong `playwright.config.ts` của repo có `fullyParallel: true`, nghĩa là cả các test trong cùng một file cũng chạy song song. Thử chạy file với nhiều worker và xem:

```bash
npx playwright test todo-hooks --workers=4
```

| Phần | Ý nghĩa |
|------|---------|
| `todo-hooks` | Bộ lọc theo tên file (khớp một phần đường dẫn) |
| `--workers=4` | Dùng 4 tiến trình chạy cùng lúc; `--workers=1` để chạy lần lượt (hữu ích khi debug) |

Kết quả mong đợi (số có thể khác):

```text
Running 4 tests using 4 workers
  4 passed (3.0s)
```

Dòng "using N workers" cho biết số worker thực tế. Nếu muốn một nhóm cụ thể chạy lần lượt dù `fullyParallel` bật, dùng `test.describe.configure({ mode: "serial" })` như bước 5; ngược lại, nếu `fullyParallel` tắt mà muốn một nhóm chạy song song, dùng `test.describe.configure({ mode: "parallel" })`.

Nếu gặp lỗi: test xanh khi `--workers=1` nhưng đỏ khi nhiều worker thường là dấu hiệu dữ liệu dùng chung giữa các test (xem phần Lỗi thường gặp).

### Bước 7. Chia test dài thành `test.step`

Mục đích: báo cáo và trace hiện tên từng bước.

```ts
test("vòng đời một công việc", async ({ page }) => {
  await page.goto("/lab/todo");
  await page.getByTestId("reset-data").click();

  await test.step("thêm việc", async () => {
    await page.getByLabel("Công việc mới").fill("Mua sữa");
    await page.getByRole("button", { name: "Thêm", exact: true }).click();
    await expect(page.getByTestId("todo-count")).toHaveText("Còn 1 việc");
  });

  await test.step("hoàn thành việc", async () => {
    await page.getByRole("checkbox", { name: "Hoàn thành: Mua sữa" }).check();
    await expect(page.getByTestId("todo-count")).toHaveText("Còn 0 việc");
  });

  await test.step("xoá có xác nhận", async () => {
    await page.getByRole("button", { name: "Xoá Mua sữa" }).click();
    await page.getByRole("button", { name: "Xoá hẳn" }).click();
    await expect(page.getByTestId("todo-empty")).toBeVisible();
  });
});
```

| Phần | Giải thích |
|------|-----------|
| `test.step("tên", fn)` | Chạy `fn` và ghi nó là một bước có tên; phải `await` |
| Lỗi trong step | Báo cáo đánh dấu đúng step bị hỏng, các step trước vẫn hiện xanh |
| Giá trị trả về | `test.step` trả về giá trị mà `fn` trả, tiện cho việc lấy dữ liệu |

Kết quả mong đợi: test xanh. Chạy `npx playwright test todo-hooks --reporter=html` rồi `npx playwright show-report` để mở báo cáo; bấm vào test sẽ thấy ba dòng step gấp được. Xem bài 2.14 để biết cách đọc báo cáo.

## Demo code

File hoàn chỉnh gom các kỹ thuật thường dùng nhất (độc lập, có hook, có step):

```ts
import { test, expect, type Page } from "@playwright/test";

async function addTask(page: Page, title: string) {
  await page.getByLabel("Công việc mới").fill(title);
  await page.getByRole("button", { name: "Thêm", exact: true }).click();
}

test.describe("LAB-04 Todo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/todo");
    await page.getByTestId("reset-data").click(); // luôn bắt đầu từ trạng thái sạch
  });

  test("giới hạn tên 80 ký tự", async ({ page }) => {
    await test.step("81 ký tự bị từ chối", async () => {
      await addTask(page, "a".repeat(81));
      await expect(page.getByTestId("todo-error")).toContainText("tối đa 80");
    });
    await test.step("80 ký tự được chấp nhận", async () => {
      await addTask(page, "a".repeat(80));
      await expect(page.getByTestId("todo-item")).toHaveCount(1);
    });
  });

  test("bộ lọc Đang làm chỉ hiện việc chưa xong", async ({ page }) => {
    await addTask(page, "A");
    await addTask(page, "B");
    await page.getByRole("checkbox", { name: "Hoàn thành: A" }).check();
    await page.getByRole("button", { name: "Đang làm" }).click();
    await expect(page.getByTestId("todo-title")).toHaveText("B");
  });
});
```

Giải thích: hàm phụ `addTask` tránh lặp lại hai dòng thao tác; `beforeEach` bảo đảm hai test độc lập, có thể chạy song song hoặc theo bất kỳ thứ tự nào.

## Thử ngay trong lab
- `/lab/todo` (LAB-04): viết nhóm test có `beforeEach` mở trang và bấm "Reset dữ liệu lab". Chạy với `--workers=4 --repeat-each=5` để chắc chắn chúng độc lập (không test nào đỏ ngẫu nhiên).
- Thử `/lab/todo?bugs=BUG-03` để xem bug "quá 20 việc vẫn thêm được": một test dùng `test.step` cho từng mốc 20 và 21 sẽ chỉ rõ step nào thất bại.

## Lỗi thường gặp
- Triệu chứng: test lúc xanh lúc đỏ khi chạy nhiều worker. Nguyên nhân: các test dùng chung dữ liệu ngoài trình duyệt hoặc phụ thuộc thứ tự chạy. Sửa: tạo dữ liệu riêng cho từng test (tên duy nhất, bản ghi riêng) và reset trong `beforeEach`.
- Triệu chứng: `Error: "context" and "page" fixtures are not supported in "beforeAll" since they are created on a per-test basis.` Nguyên nhân: dùng `page` trong `beforeAll`. Sửa: dùng `browser.newPage()` như bước 5, hoặc chuyển sang `beforeEach`.
- Triệu chứng: một test đỏ, các test sau "did not run". Nguyên nhân: nhóm đang là `serial`, test đỏ làm bỏ qua phần còn lại. Sửa: chỉ dùng serial khi bắt buộc; nếu không, bỏ `mode: "serial"` và làm từng test độc lập.
- Triệu chứng: `beforeAll` chứa quá nhiều logic, test hỏng nhưng không biết vì sao. Nguyên nhân: trạng thái chung bị thay đổi dần. Sửa: chuyển sang `beforeEach` hoặc tách thành các test độc lập.
- Triệu chứng: báo cáo chỉ thấy lỗi "expect ... failed" mà không biết đang ở giai đoạn nào của một test dài. Nguyên nhân: thiếu `test.step`. Sửa: chia các giai đoạn thành step có tên.
- Triệu chứng: Warning hoặc lỗi test không kết thúc vì thiếu `await` trước `test.step(...)`. Nguyên nhân: step là bất đồng bộ. Sửa: luôn `await test.step(...)`.

## Tóm tắt
- `beforeEach` và `afterEach` chạy quanh từng test; `beforeAll` và `afterAll` chạy một lần cho nhóm.
- `beforeAll` không có `page`; dùng `browser` nếu cần tự tạo.
- Mặc định mỗi test độc lập và có thể chạy song song; `serial` chỉ khi các bước thật sự phụ thuộc nhau.
- Dùng hooks để reset dữ liệu; test không được dọn dẹp thay cho test khác.
- `test.step` làm báo cáo và trace dễ đọc.

## Bài tập
1. (Dễ) Viết `beforeEach` mở LAB-04 và reset dữ liệu, rồi viết hai test dùng chung nó. Xong khi cả hai xanh và không có dòng `goto` nào trong thân test.
2. (Dễ) Chạy hai test của bài tập 1 với `--workers=2 --repeat-each=5`. Xong khi cả 10 lần chạy xanh.
3. (Vừa) Chia một test dài của bạn thành ít nhất ba `test.step` có tên rõ nghĩa, mở báo cáo HTML bằng `npx playwright show-report`, chụp lại màn hình thấy các bước. Xong khi bạn thấy từng step trong báo cáo.
4. (Vừa) Viết nhóm `serial` dùng `beforeAll` với `browser.newPage()` cho một quy trình thêm, hoàn thành, xoá việc. Xong khi bạn chứng minh được việc cố tình làm bước 1 đỏ khiến bước 2 và 3 bị bỏ qua.
5. (Khó) Viết `afterEach` đính kèm ảnh chụp trang khi test đỏ; cố tình làm một test đỏ và kiểm tra trong báo cáo có tệp đính kèm. Xong khi tệp đính kèm xuất hiện chỉ ở test đỏ.
