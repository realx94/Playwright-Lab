---
title: Báo cáo, screenshot và video
level: 2
order: 14
minutes: 25
summary: Reporter, ảnh chụp, quay video và đính kèm bằng chứng cho bug report.
keywords: [playwright reporters, playwright screenshot, playwright video recording]
---

## Mục tiêu bài học
- Cấu hình báo cáo và bằng chứng phù hợp cho local và CI.
- Dùng screenshot/video làm bằng chứng trong bug report.

## Kiến thức cần nắm
- Reporter: `list`, `line`, `dot`, `html`, `json`, `junit`; có thể dùng nhiều reporter cùng lúc
- `screenshot`: `off`, `on`, `only-on-failure`
- `video`: `off`, `on`, `retain-on-failure`, `on-first-retry`
- Chụp thủ công: `page.screenshot({ path, fullPage })`, `locator.screenshot()`
- Đính kèm vào báo cáo: `testInfo.attach(...)`

## Giải thích dễ hiểu
Báo cáo là **biên bản sau buổi kiểm tra**; screenshot và video là **ảnh/video hiện trường**. Một bug report có ảnh chụp đúng thời điểm lỗi rút ngắn rất nhiều thời gian trao đổi giữa QA và dev.

## Demo code
```ts
// playwright.config.ts
export default defineConfig({
  reporter: [["list"], ["html", { open: "never" }], ["junit", { outputFile: "results.xml" }]],
  use: {
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },
});
```

Chụp và đính kèm trong test:

```ts
test("giỏ hàng", async ({ page }, testInfo) => {
  await page.goto("/lab/cart");
  const shot = await page.screenshot({ fullPage: true });
  await testInfo.attach("toàn trang giỏ hàng", { body: shot, contentType: "image/png" });
});
```

## Bằng chứng cho bug report
Ảnh/video nên cho thấy rõ: bước đang làm, dữ liệu nhập, kết quả thực tế. Che dữ liệu nhạy cảm trước khi chia sẻ ra ngoài.

## Lỗi thường gặp
- Bật `video: "on"` cho mọi test khiến CI chậm và tốn dung lượng; dùng `retain-on-failure`.
- Dùng so sánh ảnh (visual) mà không cố định font/viewport nên flaky giữa các máy.
- Commit thư mục `playwright-report/` lên Git.

## Bài tập
1. Cấu hình reporter `html` và `junit`, chạy test rồi mở cả hai.
2. Làm cho một test fail, lấy ảnh và video từ thư mục kết quả để viết bug report theo mẫu ở bài Markdown.
