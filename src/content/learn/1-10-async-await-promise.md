---
title: Async/await và Promise
level: 1
order: 10
minutes: 75
summary: Hiểu bất đồng bộ, Promise và vì sao mọi thao tác Playwright đều cần await.
keywords: [javascript promise là gì, async await, event loop]
---

## Mục tiêu bài học
- Giải thích được vì sao có code bất đồng bộ và thứ tự chạy khác với thứ tự viết.
- Tạo và dùng `Promise`; đọc được ba trạng thái pending, fulfilled, rejected.
- Viết hàm `async` dùng `await`, bắt lỗi bằng `try/catch`.
- Chạy song song bằng `Promise.all` và biết vì sao `forEach` không hợp với `await`.
- Nhận ra triệu chứng của lỗi quên `await` trong test Playwright.

## Bạn cần chuẩn bị
- Đã làm bài 1.5 đến 1.9: thư mục `thuc-hanh-js` có `tsx` và `tsconfig.json`. Mỗi bước tạo một file mới và chạy bằng `npx tsx <tên file>`.
- Để chạy ví dụ Playwright ở phần Demo, bạn cần dự án đã tạo ở bài 0.3 (`npx playwright test`) và lab đang chạy; chạy phần này là tuỳ chọn.

## Kiến thức cần nắm
- Thao tác mất thời gian (mạng, trình duyệt, hẹn giờ) trả về **Promise**.
- Promise có ba trạng thái: đang chờ (pending), thành công (fulfilled), thất bại (rejected).
- `await` tạm dừng hàm `async` cho tới khi Promise có kết quả; hàm có `await` phải khai báo `async`.
- Bắt lỗi bằng `try/catch`; chạy song song bằng `Promise.all`.
- Event loop: code đồng bộ chạy trước, callback hẹn giờ chạy sau.

## Giải thích dễ hiểu
Bạn gọi món ở quán: nhân viên đưa bạn một **phiếu hẹn** (Promise) chứ chưa có món ngay. Phiếu này có ba tình huống: đang nấu (pending), món xong (fulfilled, bạn nhận món), hoặc hết nguyên liệu (rejected, bạn nhận lời xin lỗi). `await` là **đứng chờ tại quầy cho tới khi phiếu có kết quả** rồi mới đi tiếp. Quên `await` giống việc cầm phiếu đi luôn rồi tưởng đã có món.

Vì sao JavaScript cần cơ chế này? JavaScript chỉ có **một luồng** (một "nhân viên"). Nếu nó đứng chờ mạng phản hồi mà không làm gì khác thì cả chương trình đơ. Nên với các việc chậm (gọi mạng, đọc file, điều khiển trình duyệt), JS giao việc đi và nhận Promise, trong lúc chờ nó làm tiếp việc khác. Khi có kết quả, **event loop** (vòng lặp sự kiện, như người phục vụ liên tục nhìn xem phiếu nào đã xong) mới đưa phần code đang chờ quay lại chạy.

Với Playwright: mỗi lệnh như `page.goto`, `locator.click`, `expect(...).toBeVisible()` đều **gửi yêu cầu cho trình duyệt** (một tiến trình khác) và mất thời gian, nên đều trả về Promise. Test của bạn phải `await` để chờ từng bước xong. Hiểu bài này là điều kiện để viết test không chập chờn.

## Thực hành từng bước

### Bước 1. Thứ tự chạy: đồng bộ và bất đồng bộ
Mục đích: tận mắt thấy code không luôn chạy từ trên xuống dưới.

Tạo `b1-thu-tu.ts`:

```ts
// file: b1-thu-tu.ts
console.log("1. mở trang");

setTimeout(() => {
  console.log("3. trang đã tải xong (sau 100 ms)");
}, 100);

console.log("2. bấm nút đăng nhập");
```

`setTimeout(f, 100)` hẹn giờ: sau 100 mili giây thì gọi hàm `f`. Nhưng nó **không chờ**: chạy tiếp dòng sau ngay. Chạy `npx tsx b1-thu-tu.ts`. Kết quả mong đợi:

```text
1. mở trang
2. bấm nút đăng nhập
3. trang đã tải xong (sau 100 ms)
```

Dù dòng `setTimeout` viết trước dòng "2", kết quả "3" in sau cùng. Giống test: nếu bạn bấm nút khi trang chưa tải xong, test hỏng. Đó là lý do ta cần `await`.

### Bước 2. Tạo và dùng Promise
Mục đích: hiểu Promise là gì bằng cách tự tạo một cái.

Tạo `b2-promise.ts`:

```ts
// file: b2-promise.ts
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const p = delay(50);
console.log(p);

p.then(() => {
  console.log("delay xong");
});

console.log("dòng cuối của file");
```

| Phần | Ý nghĩa |
|------|---------|
| `new Promise((resolve) => { ... })` | Tạo Promise. Hàm bên trong chạy ngay; khi xong việc ta gọi `resolve()` để báo "thành công" |
| `setTimeout(resolve, ms)` | Hẹn giờ gọi `resolve` sau `ms` mili giây |
| `Promise<void>` | Promise sẽ hoàn thành mà không mang giá trị |
| `p.then(f)` | Đăng ký: "khi Promise thành công thì chạy `f`" |
| `console.log(p)` | In ra bản thân Promise (chưa xong) |

Kết quả mong đợi:

```text
Promise { <pending> }
dòng cuối của file
delay xong
```

Dòng đầu `Promise { <pending> }` là trạng thái **đang chờ**. Dòng "dòng cuối của file" in trước "delay xong" vì `then` chỉ đăng ký, không chặn.

### Bước 3. `async` / `await`
Mục đích: viết code bất đồng bộ nhìn như code tuần tự.

Tạo `b3-await.ts`:

```ts
// file: b3-await.ts
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function openPage(): Promise<string> {
  console.log("đang mở trang...");
  await delay(100);
  return "Trang đăng nhập";
}

async function main(): Promise<void> {
  console.log("bắt đầu");
  const title = await openPage();
  console.log("tiêu đề:", title);
  console.log("kết thúc");
}

main();
```

| Phần | Ý nghĩa |
|------|---------|
| `async function openPage()` | Hàm bất đồng bộ: **luôn trả về Promise**, kể cả khi bạn `return` một chuỗi |
| `await delay(100)` | Tạm dừng hàm này cho đến khi `delay` xong, rồi chạy tiếp |
| `const title = await openPage()` | Chờ Promise và lấy giá trị bên trong ra (ở đây là chuỗi) |
| `main()` | Gọi hàm async ở cấp cao nhất |

`await` chỉ dùng được trong hàm `async` (hoặc ở cấp cao nhất của module). Kết quả mong đợi:

```text
bắt đầu
đang mở trang...
tiêu đề: Trang đăng nhập
kết thúc
```

So sánh với bước 2: giờ thứ tự đọc từ trên xuống dưới đúng như bạn nghĩ. Đó là sức mạnh của `await`.

### Bước 4. Quên `await` thì chuyện gì xảy ra
Mục đích: nhận diện lỗi phổ biến nhất khi viết test.

Tạo `b4-quen-await.ts`:

```ts
// file: b4-quen-await.ts
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getTotal(): Promise<number> {
  await delay(50);
  return 450000;
}

async function main(): Promise<void> {
  const khongAwait = getTotal();
  console.log("Không await:", khongAwait);
  console.log("So sánh với 450000:", khongAwait === (450000 as unknown));

  const coAwait = await getTotal();
  console.log("Có await:", coAwait);
  console.log("So sánh với 450000:", coAwait === 450000);
}

main();
```

Dòng `(450000 as unknown)` chỉ để TypeScript không báo lỗi so sánh hai kiểu khác nhau. Kết quả mong đợi:

```text
Không await: Promise { <pending> }
So sánh với 450000: false
Có await: 450000
So sánh với 450000: true
```

Khi quên `await`, biến chứa **Promise** chứ không phải giá trị. Trong Playwright, hậu quả thường là: test xanh nhầm (vì kiểm tra chạy sau khi test đã kết thúc), hoặc lỗi lạ "`expect(...)` received Promise". Ở Playwright, editor hay bật cảnh báo nếu bạn dùng ESLint với rule `no-floating-promises`, rất đáng bật cho dự án thật.

### Bước 5. Promise thất bại và `try/catch`
Mục đích: xử lý lỗi của thao tác bất đồng bộ.

Tạo `b5-loi.ts`:

```ts
// file: b5-loi.ts
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findElement(selector: string): Promise<string> {
  await delay(20);
  if (selector === "#khong-co") {
    throw new Error(`Không tìm thấy phần tử ${selector}`);
  }
  return `<phần tử ${selector}>`;
}

async function main(): Promise<void> {
  try {
    console.log(await findElement("#email"));
    console.log(await findElement("#khong-co"));
    console.log("dòng này không bao giờ chạy");
  } catch (err) {
    console.log("Lỗi bắt được:", (err as Error).message);
  } finally {
    console.log("Dọn dẹp xong");
  }
}

main();
```

| Phần | Ý nghĩa |
|------|---------|
| `throw new Error(...)` trong hàm `async` | Làm Promise rơi vào trạng thái **rejected** (thất bại) |
| `try { ... }` | Thử chạy; nếu có lỗi (kể cả Promise bị rejected tại một `await`), nhảy sang `catch` |
| `catch (err)` | Xử lý lỗi. `err` có thể là bất kỳ giá trị nào, nên TS coi là `unknown`; ở đây ép sang `Error` để lấy `message` |
| `finally` | Luôn chạy dù thành công hay lỗi, hợp để dọn dẹp |

Kết quả mong đợi:

```text
<phần tử #email>
Lỗi bắt được: Không tìm thấy phần tử #khong-co
Dọn dẹp xong
```

Playwright thường **tự** ném lỗi khi hết thời gian chờ (timeout); bạn không cần `try/catch` ở mọi chỗ. Chỉ dùng khi muốn xử lý lỗi có chủ đích. Đừng viết `catch {}` rỗng: nó nuốt lỗi và test sẽ xanh dù đã hỏng.

### Bước 6. Chạy tuần tự và song song bằng `Promise.all`
Mục đích: hai việc độc lập thì chạy cùng lúc để nhanh hơn.

Tạo `b6-song-song.ts`:

```ts
// file: b6-song-song.ts
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchA(): Promise<string> {
  await delay(200);
  return "kết quả A";
}

async function fetchB(): Promise<string> {
  await delay(200);
  return "kết quả B";
}

async function main(): Promise<void> {
  const t1 = Date.now();
  const a1 = await fetchA();
  const b1 = await fetchB();
  const tuanTu = Date.now() - t1;

  const t2 = Date.now();
  const [a2, b2] = await Promise.all([fetchA(), fetchB()]);
  const songSong = Date.now() - t2;

  console.log(a1, b1, a2, b2);
  console.log("Song song nhanh hơn tuần tự:", songSong < tuanTu);
}

main();
```

`Promise.all([p1, p2])` nhận một mảng Promise, bắt đầu cả hai ngay, và trả về Promise hoàn thành khi **tất cả** xong, với mảng kết quả cùng thứ tự. Nếu một Promise thất bại, `Promise.all` thất bại ngay. Tuần tự mất khoảng 400 ms, song song khoảng 200 ms. Kết quả mong đợi (ta in `true` thay vì số mili giây vì thời gian thực mỗi máy một khác):

```text
kết quả A kết quả B kết quả A kết quả B
Song song nhanh hơn tuần tự: true
```

Trong Playwright, song song hợp cho việc chờ sự kiện và thao tác kích hoạt nó cùng lúc, ví dụ chờ tab mới mở khi bấm một liên kết:

```ts
const [popup] = await Promise.all([
  page.waitForEvent("popup"),
  page.getByRole("link", { name: "Mở tab mới" }).click(),
]);
```

Điểm quan trọng là hứa chờ sự kiện **trước** khi hành động xảy ra, nếu không có thể lỡ mất sự kiện. Với các thao tác bình thường (điền, bấm), cứ dùng `await` tuần tự.

### Bước 7. `forEach` không chờ, `for...of` chờ
Mục đích: biết vì sao `await` trong `forEach` là cái bẫy.

Tạo `b7-foreach.ts`:

```ts
// file: b7-foreach.ts
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCase(name: string): Promise<void> {
  await delay(20);
  console.log("xong", name);
}

async function main(): Promise<void> {
  console.log("--- forEach ---");
  ["A", "B"].forEach(async (name) => {
    await runCase(name);
  });
  console.log("forEach kết thúc (nhưng các case chưa xong)");

  await delay(100);

  console.log("--- for...of ---");
  for (const name of ["A", "B"]) {
    await runCase(name);
  }
  console.log("for...of kết thúc (các case đã xong)");
}

main();
```

`forEach` gọi hàm cho từng phần tử và **bỏ qua** Promise mà hàm trả về, nên nó không chờ. Dòng `forEach kết thúc` in ra trước khi các case chạy xong. Còn `for...of` với `await` bên trong chờ xong từng lượt rồi mới sang lượt kế. Kết quả mong đợi:

```text
--- forEach ---
forEach kết thúc (nhưng các case chưa xong)
xong A
xong B
--- for...of ---
xong A
xong B
for...of kết thúc (các case đã xong)
```

Quy tắc: cần chờ từng phần tử thì dùng `for...of`; muốn chạy mọi phần tử cùng lúc thì `await Promise.all(list.map(async (x) => ...))`.

### Bước 8. Thứ tự đặc biệt: callback hẹn giờ và Promise
Mục đích: hiểu event loop đủ để đọc được các log "kỳ lạ".

Tạo `b8-event-loop.ts`:

```ts
// file: b8-event-loop.ts
console.log("A: đồng bộ");

setTimeout(() => console.log("D: setTimeout 0 ms"), 0);

Promise.resolve().then(() => console.log("C: Promise.then"));

console.log("B: đồng bộ");
```

Kết quả mong đợi:

```text
A: đồng bộ
B: đồng bộ
C: Promise.then
D: setTimeout 0 ms
```

Quy tắc ngắn gọn: (1) toàn bộ code đồng bộ chạy trước; (2) rồi đến các việc của Promise (`then`, phần sau `await`) gọi là **microtask**; (3) cuối cùng mới đến callback của `setTimeout`. Bạn không cần thuộc lòng, chỉ cần nhớ: "những gì sau `await` luôn chạy muộn hơn dòng đồng bộ kế tiếp".

## Demo code
Mô phỏng một "test" đăng nhập bằng đối tượng `page` giả, mỗi thao tác mất thời gian và trả về Promise, giống Playwright thật. Tạo `demo-test-gia.ts`:

```ts
// file: demo-test-gia.ts
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// "page" giả: mỗi thao tác là hàm async
const page = {
  url: "",
  title: "",
  async goto(url: string): Promise<void> {
    await delay(30);
    page.url = url;
    page.title = url === "/lab/login" ? "Đăng nhập" : "Không rõ";
  },
  async fill(field: string, value: string): Promise<void> {
    await delay(10);
    console.log(`  điền ${field} = ${value}`);
  },
  async click(name: string): Promise<void> {
    await delay(10);
    console.log(`  bấm "${name}"`);
  },
};

async function testDangNhap(): Promise<void> {
  console.log("Test: đăng nhập hợp lệ");
  await page.goto("/lab/login");
  console.log("  tiêu đề:", page.title);
  await page.fill("Email", "user@lab.dev");
  await page.fill("Mật khẩu", "Passw0rd!");
  await page.click("Đăng nhập");
  console.log("  PASS");
}

testDangNhap().catch((e) => {
  console.log("FAIL:", e);
});
```

Giải thích: mỗi phương thức của `page` là `async` và dùng `await delay(...)` để giả lập thời gian trình duyệt xử lý. `testDangNhap` gọi từng bước với `await`, nên thứ tự đúng. Cuối cùng `.catch(...)` bắt lỗi chưa xử lý của cả test. Thử bỏ `await` ở dòng `page.goto(...)`: `page.title` sẽ vẫn rỗng khi in. Kết quả mong đợi:

```text
Test: đăng nhập hợp lệ
  tiêu đề: Đăng nhập
  điền Email = user@lab.dev
  điền Mật khẩu = Passw0rd!
  bấm "Đăng nhập"
  PASS
```

Cũng đoạn này viết bằng Playwright thật trên lab Login (`/lab/login`), bạn lưu thành `tests/dang-nhap.spec.ts` trong dự án Playwright (bài 0.3) rồi chạy `npx playwright test`. Nhãn dùng đúng theo ứng dụng lab:

```ts
import { test, expect } from "@playwright/test";

test("đăng nhập hợp lệ", async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Passw0rd!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByTestId("dashboard")).toBeVisible();
});
```

Mỗi dòng đều có `await`, và hàm test là `async`. Bài 2.4 sẽ giải thích cấu trúc `test(...)` này kỹ hơn.

## Thử ngay trong lab
Mở `/lab/login` và quan sát: bấm "Đăng nhập" với dữ liệu hợp lệ thì trang chuyển ngay, nhưng trong test thật mọi thao tác (điền, bấm, chờ hiển thị) đều là thao tác bất đồng bộ qua trình duyệt. Hãy nhớ mô hình này khi bước sang bài 2.4: mỗi lệnh `await page...` tương ứng một thao tác bạn vừa làm tay.

## Lỗi thường gặp
- **Triệu chứng:** biến in ra `Promise { <pending> }` thay vì giá trị. Nguyên nhân: quên `await`. Cách sửa: thêm `await` trước lời gọi hàm async.
- **Triệu chứng:** test xanh nhưng giao diện thật có lỗi, hoặc test chạy lỏng lẻo, lúc đỏ lúc xanh. Nguyên nhân: thiếu `await` trước `expect(...)` hoặc trước `click()`, nên test kết thúc trước khi kiểm tra chạy. Cách sửa: `await` mọi thao tác và assertion; bật rule ESLint `no-floating-promises` để máy nhắc.
- **Triệu chứng:** `SyntaxError: await is only valid in async functions and the top level bodies of modules`. Nguyên nhân: dùng `await` trong hàm thường. Cách sửa: thêm `async` vào khai báo hàm đó.
- **Triệu chứng:** vòng lặp `forEach` với `await` không chờ, log lộn xộn. Nguyên nhân: `forEach` bỏ qua Promise. Cách sửa: dùng `for...of` (tuần tự) hoặc `await Promise.all(list.map(...))` (song song).
- **Triệu chứng:** lỗi bị "nuốt", test xanh khi thực tế hỏng. Nguyên nhân: `catch` rỗng hoặc chỉ `console.log` rồi không ném lại. Cách sửa: chỉ bắt lỗi khi xử lý được; nếu chỉ ghi log thì `throw err` lại.
- **Triệu chứng:** `UnhandledPromiseRejection` hoặc cảnh báo `unhandled rejection`. Nguyên nhân: một Promise thất bại mà không ai `await` hay `catch`. Cách sửa: `await` Promise đó, hoặc nối `.catch(...)`.
- **Triệu chứng:** `Promise.all` thất bại ngay khi một việc lỗi. Nguyên nhân: đây là hành vi mặc định (fail-fast). Cách sửa: dùng `Promise.allSettled` nếu muốn chờ mọi việc xong rồi xem từng kết quả.

## Tóm tắt
- Việc chậm trả về Promise; Promise là "phiếu hẹn" với ba trạng thái pending, fulfilled, rejected.
- `await` chờ Promise và lấy giá trị ra; chỉ dùng được trong hàm `async` (hoặc cấp cao nhất của module).
- Mọi lệnh Playwright (`goto`, `click`, `expect`...) đều trả về Promise nên đều cần `await`.
- Quên `await` làm biến thành Promise và test chạy không đúng thứ tự, thường gây xanh nhầm hoặc chập chờn.
- Dùng `try/catch` có chủ đích, đừng nuốt lỗi; dùng `Promise.all` cho việc độc lập; `for...of` thay cho `forEach` khi có `await`.
- Code đồng bộ chạy trước, phần sau `await` và `then` chạy sau, `setTimeout` chạy sau cùng.

## Bài tập
1. Viết hàm `delay(ms)` trả về Promise, dùng `await` để in hai dòng cách nhau 1 giây. Xong khi dòng thứ hai hiện sau dòng đầu khoảng 1 giây.
2. Viết hàm async `getPrice()` trả `450000` sau 100 ms. In giá trị với và không có `await`, giải thích sự khác nhau của hai dòng in. Xong khi bạn mô tả được vì sao một dòng ra `Promise { <pending> }`.
3. Viết hàm async ném lỗi khi tham số là chuỗi rỗng, và gọi nó trong `try/catch` có `finally`. Xong khi cả hai nhánh (có lỗi và không lỗi) đều in đúng và `finally` luôn chạy.
4. Cho 3 hàm async mỗi hàm chờ 200 ms. Đo thời gian chạy tuần tự và bằng `Promise.all`, rồi in cả hai bằng `Date.now()`. Xong khi thời gian song song nhỏ hơn rõ rệt (khoảng 200 ms so với 600 ms).
5. Trong file spec tạm của dự án Playwright, cố ý bỏ một `await` trước `expect(page.getByTestId("dashboard")).toBeVisible()` ở bài test đăng nhập rồi chạy. Ghi lại điều xảy ra. Xong khi bạn giải thích được vì sao test có thể vẫn xanh hoặc báo lỗi lạ, và đặt `await` lại để test chạy ổn định.
