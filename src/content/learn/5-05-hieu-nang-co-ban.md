---
title: Hiệu năng web cơ bản
level: 5
order: 5
minutes: 25
summary: Core Web Vitals, đo thời gian phản hồi và cách đưa kiểm tra hiệu năng đơn giản vào test.
keywords: [core web vitals, lighthouse là gì, web performance testing]
---

## Mục tiêu bài học
- Hiểu các chỉ số hiệu năng chính của trang web.
- Đưa kiểm tra hiệu năng đơn giản vào bộ test.

## Kiến thức cần nắm
- **LCP** (Largest Contentful Paint): thời điểm nội dung lớn nhất hiện ra (mục tiêu ≤ 2,5 giây)
- **INP** (Interaction to Next Paint): độ trễ phản hồi khi người dùng tương tác (mục tiêu ≤ 200 ms)
- **CLS** (Cumulative Layout Shift): mức nhảy bố cục ngoài ý muốn (mục tiêu ≤ 0,1)
- Công cụ: Lighthouse, tab Performance của DevTools, `performance.timing`/PerformanceObserver
- Hiệu năng **tải** (load test) là khái niệm khác với hiệu năng **giao diện**; cần công cụ riêng

## Giải thích dễ hiểu
Hiệu năng giống **tốc độ phục vụ của một nhà hàng**: bao lâu có món đầu tiên (LCP), bao lâu nhân viên phản hồi khi bạn gọi (INP), bàn ghế có bị xê dịch khi bạn đang ăn không (CLS). Khách không quan tâm bếp có bao nhiêu bếp, họ cảm nhận bằng thời gian chờ.

## Demo code
Đo thời gian bằng Performance API trong test:

```ts
import { test, expect } from "@playwright/test";

test("trang lab tải đủ nhanh", async ({ page }) => {
  await page.goto("/labs");
  const nav = await page.evaluate(() => {
    const [e] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    return { domContentLoaded: e.domContentLoadedEventEnd, load: e.loadEventEnd };
  });
  expect(nav.load).toBeLessThan(3000);
});
```

Đo LCP:

```ts
const lcp = await page.evaluate(
  () =>
    new Promise<number>((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        resolve(entries[entries.length - 1].startTime);
      }).observe({ type: "largest-contentful-paint", buffered: true });
    }),
);
```

## Lưu ý
- Số đo phụ thuộc máy và mạng; dùng **ngưỡng rộng** và đo nhiều lần, không dựa vào một lần chạy.
- Đặt kiểm tra hiệu năng ở môi trường ổn định (cùng cấu hình), không so giữa máy cá nhân và CI.
- Theo dõi **xu hướng** quan trọng hơn một con số tuyệt đối.

## Lỗi thường gặp
- Đặt ngưỡng quá sát nên test flaky.
- Dùng load test (nhiều người dùng đồng thời) bằng Playwright thay vì công cụ chuyên dụng.
- Bỏ qua hiệu năng trên thiết bị yếu và mạng chậm.

## Bài tập
1. Chạy Lighthouse trên trang chủ của site và ghi lại LCP, CLS.
2. Viết test đo thời gian tải trang `/labs` với ngưỡng 3 giây.
