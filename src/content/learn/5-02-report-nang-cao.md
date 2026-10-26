---
title: Báo cáo nâng cao và thông báo kết quả
level: 5
order: 2
minutes: 25
summary: Allure, JUnit, gửi kết quả vào kênh chat và đọc số liệu để cải thiện bộ test.
keywords: [allure report playwright, junit report, test metrics]
---

## Mục tiêu bài học
- Chọn reporter phù hợp cho từng đối tượng đọc.
- Đọc số liệu để cải thiện bộ test.

## Kiến thức cần nắm
- Reporter có sẵn: `html`, `json`, `junit`, `list`, `github`
- **Allure**: báo cáo giàu tính năng, có lịch sử và xu hướng (cài thêm gói)
- **JUnit XML**: định dạng chung để công cụ CI hiển thị kết quả
- Gửi tóm tắt vào kênh chat (Slack/Teams) bằng webhook ở bước cuối của CI
- Số liệu nên theo dõi: tỉ lệ đạt, test chậm, test flaky (đỏ rồi xanh khi retry)

## Giải thích dễ hiểu
Mỗi người đọc cần một loại báo cáo khác nhau: **dev** cần trace và ảnh để sửa lỗi, **QA lead** cần xu hướng theo tuần, **quản lý** cần một dòng “93% đạt, 2 lỗi nghiêm trọng”. Reporter giống **các bộ lọc** biến cùng một dữ liệu thành đúng thứ mỗi người cần.

## Demo code
```ts
// playwright.config.ts
reporter: [
  ["list"],
  ["html", { open: "never" }],
  ["junit", { outputFile: "results/junit.xml" }],
  ["json", { outputFile: "results/results.json" }],
],
```

Gửi tóm tắt (ý tưởng) từ file JSON:

```ts
const report = JSON.parse(fs.readFileSync("results/results.json", "utf8"));
const { expected, unexpected, flaky } = report.stats;
await fetch(process.env.CHAT_WEBHOOK!, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ text: `E2E: ${expected} đạt, ${unexpected} lỗi, ${flaky} flaky` }),
});
```

## Cách đọc số liệu
| Số liệu | Ý nghĩa | Hành động |
|---------|---------|-----------|
| Tỉ lệ flaky tăng | Test thiếu ổn định | Tìm nguyên nhân, đừng chỉ tăng retry |
| Test chậm nhất | Nút cổ chai | Chuyển bớt xuống API, chia nhỏ |
| Lỗi lặp lại ở một chức năng | Chức năng rủi ro | Thêm test, báo dev |

## Lỗi thường gặp
- Chỉ có báo cáo cho dev, quản lý không hiểu kết quả.
- Gửi quá nhiều thông báo nên mọi người bỏ qua.
- Không giữ lịch sử nên không thấy xu hướng.

## Bài tập
1. Cấu hình reporter `junit` và `json`, chạy rồi mở các file kết quả.
2. Viết script đọc `results.json` và in ra số test đạt, lỗi và flaky.
