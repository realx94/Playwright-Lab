---
title: Hiệu năng web cơ bản
level: 5
order: 5
minutes: 45
summary: Hiểu Core Web Vitals, đo thời gian tải, LCP và CLS bằng Performance API trong Playwright, giả lập mạng chậm và dùng Lighthouse đúng cách.
keywords: [core web vitals, lighthouse là gì, web performance testing]
---

## Mục tiêu bài học
- Giải thích được LCP, INP, CLS là gì, ngưỡng "tốt" của từng chỉ số và người dùng cảm nhận chúng thế nào.
- Phân biệt hiệu năng **giao diện** (trình duyệt vẽ nhanh hay chậm) với hiệu năng **tải** (server chịu được bao nhiêu người).
- Viết test Playwright đo thời gian tải, LCP và CLS bằng `performance` API, với ngưỡng đủ rộng để không flaky.
- Giả lập mạng chậm và CPU yếu trên Chromium để thấy trang tải thế nào trên thiết bị kém.
- Chạy Lighthouse từ dòng lệnh và đọc báo cáo ở mức cơ bản.

## Bạn cần chuẩn bị
- Đã học `page.evaluate` và assertion (bài 2.8), cấu hình `playwright.config.ts` (bài 4.4).
- Chromium đã cài (`npx playwright install chromium`).
- Một site đang chạy để đo: site lab chạy tại `http://localhost:3000` hoặc địa chỉ đã triển khai.
- Để chạy Lighthouse cần Node và trình duyệt Chrome cài trên máy.

## Kiến thức cần nắm
- **LCP** (Largest Contentful Paint): thời điểm phần nội dung lớn nhất trong màn hình đầu hiện ra. Mục tiêu tốt: không quá 2,5 giây.
- **INP** (Interaction to Next Paint): độ trễ từ lúc người dùng thao tác (bấm, gõ) đến khi giao diện cập nhật. Mục tiêu tốt: không quá 200 ms.
- **CLS** (Cumulative Layout Shift): tổng mức bố cục bị xê dịch ngoài ý muốn. Mục tiêu tốt: không quá 0,1.
- **TTFB** (Time To First Byte): thời gian đến khi nhận byte đầu tiên từ server.
- Công cụ: Lighthouse, tab Performance của DevTools, `performance.getEntriesByType`, `PerformanceObserver`.
- Hiệu năng **tải** (load test: nhiều người dùng đồng thời) là chuyên ngành khác, dùng công cụ riêng như k6 hay JMeter.

## Giải thích dễ hiểu
Hiệu năng giống **tốc độ phục vụ của một nhà hàng**. Bao lâu thì món đầu tiên ra (LCP)? Khi bạn gọi thêm món, nhân viên phản hồi nhanh cỡ nào (INP)? Trong lúc ăn, bàn ghế có bị xê dịch làm đổ nước không (CLS)? Khách không quan tâm bếp có bao nhiêu đầu bếp, họ cảm nhận bằng thời gian chờ và sự khó chịu.

Vì sao QA cần quan tâm? Trang chậm làm người dùng bỏ đi, dẫn đến mất đơn hàng. Core Web Vitals còn ảnh hưởng thứ hạng tìm kiếm của nhiều website. Hơn nữa, một thay đổi nhỏ (thêm ảnh lớn, thêm script quảng cáo) có thể làm trang chậm gấp đôi mà không bug chức năng nào báo đỏ, nên cần có "chốt chặn" tự động.

Cần phân biệt rõ hai loại. **Hiệu năng giao diện** đo từ phía một người dùng: tải một trang mất mấy trăm mili giây, vẽ có mượt không. Playwright làm tốt việc này vì nó điều khiển trình duyệt thật. **Hiệu năng tải** đo phía server: 1000 người cùng truy cập thì thời gian phản hồi và tỉ lệ lỗi ra sao. Playwright mở một trình duyệt đầy đủ cho mỗi người dùng nên quá nặng để mô phỏng đám đông; hãy dùng công cụ chuyên dụng cho việc đó.

Điều quan trọng nhất khi đo trong test: số đo **dao động**. Cùng một trang, lần chạy này 600 ms lần sau 900 ms vì máy bận, mạng, cache. Vì thế ta đặt **ngưỡng rộng**, đo nhiều lần, và quan tâm tới xu hướng nhiều hơn là một con số.

## Thực hành từng bước
Ví dụ xuyên suốt: đo trang danh sách lab `/labs` và thao tác thêm việc ở `/lab/todo` của site.

### Bước 1. Đo thời gian tải bằng Navigation Timing
Mục đích: lấy số liệu tải trang mà trình duyệt đã ghi sẵn. Tạo `tests/perf.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("trang /labs tải đủ nhanh", async ({ page }) => {
  await page.goto("/labs", { waitUntil: "load" });

  const nav = await page.evaluate(() => {
    const [e] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    return {
      ttfb: e.responseStart - e.startTime,
      domContentLoaded: e.domContentLoadedEventEnd - e.startTime,
      load: e.loadEventEnd - e.startTime,
    };
  });

  console.log(nav);
  expect(nav.load).toBeLessThan(3000);
});
```

| Dòng | Ý nghĩa |
|------|---------|
| `page.goto(url, { waitUntil: "load" })` | Chờ sự kiện `load` (trang và tài nguyên chính tải xong), để `loadEventEnd` đã có giá trị. |
| `page.evaluate(fn)` | Chạy hàm bên trong trình duyệt và trả kết quả về test. Kết quả phải là dữ liệu thuần (số, chuỗi, đối tượng đơn giản). |
| `performance.getEntriesByType("navigation")` | Lấy mục đo của lần điều hướng hiện tại; phần tử đầu tiên chứa mọi mốc thời gian. |
| `responseStart - startTime` | TTFB: từ lúc bắt đầu điều hướng đến byte đầu tiên về. |
| `domContentLoadedEventEnd` | Mốc HTML đã phân tích xong. |
| `loadEventEnd` | Mốc sự kiện `load` kết thúc. |
| `toBeLessThan(3000)` | Ngưỡng 3 giây, đủ rộng để không flaky trên máy thường. |

Kết quả mong đợi: ví dụ khi chạy với dev server của lab, `{ ttfb: 297, domContentLoaded: 346, load: 678 }` (mili giây; số của bạn sẽ khác) và test xanh.

Nếu gặp lỗi `TypeError: Cannot read properties of undefined (reading 'responseStart')`: trang chưa điều hướng xong hoặc bạn chạy trên `about:blank`. Gọi `goto` trước rồi mới `evaluate`.

### Bước 2. Đo LCP và CLS bằng PerformanceObserver
Mục đích: lấy các chỉ số Web Vitals thật. Hai chỉ số này được trình duyệt phát qua `PerformanceObserver`. Ta cài bộ quan sát **trước khi** trang tải bằng `addInitScript` để không bỏ lỡ sự kiện:

```ts
test("LCP và CLS của /labs nằm trong ngưỡng tốt", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __cls: number; __lcp: number };
    w.__cls = 0;
    w.__lcp = 0;

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
        if (!entry.hadRecentInput) w.__cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });

    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      w.__lcp = entries[entries.length - 1].startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });

  await page.goto("/labs");
  await page.waitForLoadState("networkidle");

  const { lcp, cls } = await page.evaluate(() => {
    const w = window as unknown as { __cls: number; __lcp: number };
    return { lcp: w.__lcp, cls: w.__cls };
  });

  expect(lcp, "LCP (ms)").toBeLessThan(2500);
  expect(cls, "CLS").toBeLessThan(0.1);
});
```

| Phần | Ý nghĩa |
|------|---------|
| `addInitScript(fn)` | Chạy `fn` trong mỗi trang trước mọi script của trang, nên không lỡ sự kiện đầu. |
| `observe({ type, buffered: true })` | Đăng ký nhận loại sự kiện; `buffered: true` cho cả các sự kiện đã xảy ra trước khi đăng ký. |
| `layout-shift` | Mỗi lần bố cục dịch chuyển; ta cộng `value`. |
| `hadRecentInput` | Dịch chuyển do người dùng vừa thao tác (hợp lệ) không tính vào CLS, nên bỏ qua. |
| `largest-contentful-paint` | Có thể phát nhiều lần khi nội dung lớn hơn xuất hiện; lấy phần tử cuối cùng. |
| `expect(value, "mô tả")` | Tham số thứ hai là thông điệp hiện khi lỗi, giúp đọc báo cáo dễ hơn. |

Kết quả mong đợi: trên dev server của lab đo được `lcp` khoảng 650 ms và `cls` bằng 0 (số tham khảo). Test xanh.

Lưu ý: INP cần tương tác thật của người dùng và nhiều lần đo, khó có một con số ổn định trong test tự động. Cách thực dụng hơn là đo thời gian phản hồi của một thao tác cụ thể (Bước 4).

### Bước 3. Giả lập mạng chậm và CPU yếu
Mục đích: người dùng thật không có mạng của văn phòng. Chromium cho phép giới hạn mạng và CPU qua giao thức DevTools (CDP). Chỉ chạy được trên Chromium.

```ts
test("trang vẫn dùng được trên mạng chậm", async ({ page, context }) => {
  const cdp = await context.newCDPSession(page);

  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,                                 // độ trễ mỗi yêu cầu (ms)
    downloadThroughput: (1.6 * 1024 * 1024) / 8,  // 1,6 Mbps tính ra byte/giây
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 }); // CPU chậm 4 lần

  const start = Date.now();
  await page.goto("/labs");
  const elapsed = Date.now() - start;

  console.log(`Tải trên mạng chậm: ${elapsed} ms`);
  expect(elapsed).toBeLessThan(20_000);
});
```

| Phần | Ý nghĩa |
|------|---------|
| `context.newCDPSession(page)` | Mở kênh nói chuyện trực tiếp với DevTools Protocol của Chromium. |
| `Network.emulateNetworkConditions` | Giới hạn băng thông và độ trễ, mô phỏng mạng 3G/4G chậm. |
| `Emulation.setCPUThrottlingRate` | `rate: 4` làm CPU chậm đi 4 lần, mô phỏng điện thoại yếu. |
| Ngưỡng 20 giây | Rất rộng vì mục đích là phát hiện hỏng nặng, không đo chính xác. |

Kết quả mong đợi: thời gian tăng rõ rệt so với Bước 1 (trong thử nghiệm với dev server, từ dưới 1 giây lên khoảng 7 giây). Nếu gặp lỗi `CDPSession ... is only supported in Chromium`: bạn đang chạy Firefox hoặc WebKit; đặt test này cho project Chromium.

### Bước 4. Đo thời gian phản hồi của một thao tác
Mục đích: xấp xỉ INP bằng một thao tác thực tế, ví dụ thêm một việc ở `/lab/todo`.

```ts
test("thêm công việc phản hồi trong 1 giây", async ({ page }) => {
  await page.goto("/lab/todo");
  await page.getByTestId("reset-data").click();

  const t0 = await page.evaluate(() => performance.now());
  await page.getByLabel("Công việc mới").fill("Mua sữa");
  await page.getByRole("button", { name: "Thêm", exact: true }).click();
  await expect(page.getByTestId("todo-item")).toHaveCount(1);
  const t1 = await page.evaluate(() => performance.now());

  expect(t1 - t0).toBeLessThan(1000);
});
```

| Phần | Ý nghĩa |
|------|---------|
| `performance.now()` | Đồng hồ có độ chính xác cao trong trình duyệt. |
| Khoảng giữa `t0` và `t1` | Bao gồm điền ô, bấm nút và chờ phần tử xuất hiện. Số này gồm cả độ trễ của Playwright nên chỉ dùng như ngưỡng thô. |

Kết quả mong đợi: vài trăm mili giây (đo thử trên dev server khoảng 450 ms). Vì số đo gồm cả thao tác của Playwright, hãy đặt ngưỡng rộng (1 giây) và xem như chốt chặn "không chậm bất thường".

### Bước 5. Làm cho kiểm tra hiệu năng đỡ flaky
Mục đích: số đo dao động, vậy lấy trung vị của vài lần đo thay vì một lần.

```ts
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

test("thời gian tải trung vị của /labs dưới 2 giây", async ({ page }) => {
  const samples: number[] = [];
  for (let i = 0; i < 5; i++) {
    await page.goto("/labs", { waitUntil: "load" });
    samples.push(
      await page.evaluate(() => {
        const [e] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
        return e.loadEventEnd - e.startTime;
      }),
    );
  }
  console.log("Các lần đo (ms):", samples);
  expect(median(samples)).toBeLessThan(2000);
});
```

| Phần | Ý nghĩa |
|------|---------|
| `median` | Trung vị: sắp xếp rồi lấy giá trị giữa; ít bị ảnh hưởng bởi một lần chạy quá chậm. |
| 5 lần đo | Số lẻ để có giá trị giữa rõ ràng; đủ nhanh để chạy trong CI. |

Kết quả mong đợi: năm số cùng bậc độ lớn và test xanh. Ghi các số vào log để theo dõi xu hướng theo thời gian.

### Bước 6. Chạy Lighthouse từ dòng lệnh
Mục đích: có báo cáo tổng hợp điểm và gợi ý cải thiện. **Lighthouse** là công cụ của Google, chạy một lượt tải trang và chấm điểm Performance, Accessibility, SEO.

```bash
npx lighthouse http://localhost:3000/labs --only-categories=performance --output=html --output-path=./lighthouse-labs.html --chrome-flags="--headless"
```

| Phần | Ý nghĩa |
|------|---------|
| `npx lighthouse <url>` | Chạy Lighthouse (tự tải gói lần đầu) cho URL. Cần Chrome cài trên máy. |
| `--only-categories=performance` | Chỉ chấm hiệu năng, chạy nhanh hơn. |
| `--output=html` và `--output-path` | Xuất báo cáo HTML ra file. |
| `--chrome-flags="--headless"` | Chạy Chrome không giao diện. |

Kết quả mong đợi: tạo file `lighthouse-labs.html`; mở bằng trình duyệt thấy điểm 0 đến 100 và các chỉ số LCP, CLS, Total Blocking Time (TBT: tổng thời gian luồng chính bị chặn, gần với INP khi đo trong phòng lab). Hãy đo trang đã **build production** (`npm run build` rồi `npm start`), vì dev server chậm hơn rõ rệt và cho điểm không phản ánh người dùng thật.

Nếu gặp lỗi `Unable to connect to Chrome` hoặc `ECONNREFUSED`: Chrome chưa cài hoặc server chưa chạy; kiểm tra cả hai. Cũng có thể chạy Lighthouse trong DevTools của Chrome, tab Lighthouse, nếu chưa quen dòng lệnh.

## Demo code
File gộp các kiểm tra ngưỡng để chạy trong CI:

```ts
import { test, expect } from "@playwright/test";

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

async function loadTime(page: import("@playwright/test").Page, url: string) {
  await page.goto(url, { waitUntil: "load" });
  return page.evaluate(() => {
    const [e] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    return e.loadEventEnd - e.startTime;
  });
}

// Ngưỡng rộng vì CI chậm và dao động; mục tiêu là bắt hỏng nặng, không chấm điểm chính xác.
const PAGES = [
  { url: "/labs", maxMs: 3000 },
  { url: "/lab/login", maxMs: 3000 },
  { url: "/lab/cart", maxMs: 3000 },
];

for (const { url, maxMs } of PAGES) {
  test(`tải ${url} dưới ${maxMs} ms (trung vị 3 lần)`, async ({ page }) => {
    const samples: number[] = [];
    for (let i = 0; i < 3; i++) samples.push(await loadTime(page, url));
    expect(median(samples), `các lần đo: ${samples.join(", ")}`).toBeLessThan(maxMs);
  });
}
```

Đọc nhanh: hàm `loadTime` đo một lần; vòng lặp đo ba lần và lấy trung vị; mảng `PAGES` giúp thêm trang mới chỉ bằng một dòng; thông điệp trong `expect` in cả ba mẫu khi đỏ để bạn biết đó là sự cố thật hay dao động.

## Lưu ý quan trọng
- Số đo phụ thuộc máy và mạng; dùng **ngưỡng rộng** và đo nhiều lần, không dựa vào một lần chạy.
- Đặt kiểm tra hiệu năng ở môi trường ổn định (cùng cấu hình), không so sánh giữa máy cá nhân và CI.
- Theo dõi **xu hướng** quan trọng hơn một con số tuyệt đối: lưu các số đo mỗi lần chạy (xem bài 5.2) và cảnh báo khi tăng đột ngột.
- Không chạy kiểm tra hiệu năng song song với nhiều test nặng khác trên cùng máy; tải của máy làm sai số đo. Có thể tách ra project riêng với `workers: 1`.
- Đo trên bản build production, không đo trên dev server.

## Thử ngay trong lab
Chạy Bước 1 và Bước 2 trên `/labs`, `/lab/table` và `/lab/dashboard` rồi so sánh LCP của ba trang: trang nào có nhiều dữ liệu hoặc biểu đồ thường chậm hơn. Dùng Bước 4 để đo thời gian một thao tác ở `/lab/todo`. Thử bật giả lập mạng chậm (Bước 3) và xem trang nào chịu ảnh hưởng nhiều nhất.

## Lỗi thường gặp
- Triệu chứng: test hiệu năng lúc xanh lúc đỏ. Nguyên nhân: ngưỡng quá sát, chỉ đo một lần. Cách sửa: nới ngưỡng, lấy trung vị nhiều lần, chạy ở môi trường ổn định.
- Triệu chứng: `lcp` luôn bằng 0 hoặc `undefined`. Nguyên nhân: đăng ký `PerformanceObserver` sau khi trang đã tải mà không dùng `buffered: true`, hoặc quan sát sai `type`. Cách sửa: dùng `addInitScript` và `buffered: true`.
- Triệu chứng: lệnh `Network.emulateNetworkConditions` báo lỗi hoặc bị bỏ qua. Nguyên nhân: không phải Chromium, hoặc quên `Network.enable`. Cách sửa: chỉ chạy trên Chromium và gọi `Network.enable` trước.
- Triệu chứng: điểm Lighthouse rất thấp trên máy bạn nhưng người dùng thật không phàn nàn. Nguyên nhân: đo dev server, hoặc máy bận, hoặc extension trình duyệt can thiệp. Cách sửa: đo bản production, chạy ở chế độ ẩn danh hoặc headless.
- Triệu chứng: dùng Playwright mở 500 trình duyệt để "load test", máy đứng hình. Nguyên nhân: sai công cụ. Cách sửa: dùng k6, JMeter hoặc công cụ load test chuyên dụng cho phía server.
- Triệu chứng: so sánh số đo giữa máy cá nhân và CI rồi kết luận "CI chậm hơn là bug". Nguyên nhân: cấu hình phần cứng khác nhau. Cách sửa: chỉ so sánh trong cùng một môi trường.

## Tóm tắt
- LCP, INP, CLS đo ba trải nghiệm: nội dung hiện ra, phản hồi thao tác, độ ổn định bố cục.
- Trong Playwright, đo bằng `performance.getEntriesByType("navigation")` và `PerformanceObserver` (cài bằng `addInitScript`).
- Ngưỡng rộng, nhiều lần đo, trung vị và môi trường ổn định giúp bài test hiệu năng không flaky.
- Chromium cho phép giả lập mạng chậm và CPU yếu qua CDP.
- Lighthouse cho báo cáo tổng hợp; đo trên bản production.
- Load test (nhiều người dùng) cần công cụ chuyên dụng, không dùng Playwright.

## Bài tập
1. Dễ: Chạy Lighthouse (dòng lệnh hoặc tab DevTools) trên trang chủ site và ghi lại LCP, CLS. Xong khi bạn có hai con số và biết chúng nằm trong hay ngoài ngưỡng tốt.
2. Viết test đo thời gian tải trang `/labs` với ngưỡng 3 giây theo Bước 1. Xong khi test xanh và log in được `ttfb`, `domContentLoaded`, `load`.
3. Viết test đo LCP và CLS của `/lab/dashboard` theo Bước 2. Xong khi test dùng `addInitScript` và có thông điệp rõ ràng khi đỏ.
4. Giả lập mạng chậm (Bước 3) cho `/lab/table` và so sánh thời gian tải với khi mạng thường. Xong khi bạn ghi lại hai con số và rút ra nhận xét ngắn.
5. Nâng cao: viết test lấy trung vị của 5 lần đo cho 3 trang và ghi kết quả vào file JSON mỗi lần chạy để vẽ xu hướng. Xong khi có file JSON với ngày giờ, URL và các mẫu đo.
