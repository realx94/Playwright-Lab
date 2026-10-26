---
title: Capstone và chuẩn bị phỏng vấn
level: 5
order: 8
minutes: 40
summary: Dự án tổng hợp xây framework từ đầu và bộ câu hỏi phỏng vấn Playwright thường gặp.
keywords: [playwright interview questions, xây dựng test framework, capstone project]
---

## Mục tiêu bài học
- Tổng hợp mọi kiến thức qua một dự án hoàn chỉnh.
- Chuẩn bị trả lời phỏng vấn tự tin.

## Capstone: xây framework hoàn chỉnh trên một lab
Chọn một lab (đề xuất LAB-03 Giỏ hàng) và xây dựng framework từ đầu theo tiêu chí:

| Hạng mục | Tiêu chí hoàn thành |
|----------|---------------------|
| Phân tích | Danh sách BR, điểm mơ hồ và giả định |
| Thiết kế test | ≥ 30 test case có kỹ thuật (EP, BVA, bảng quyết định, trạng thái) và ma trận BR × TC |
| Kiến trúc | Page Object, custom fixture, `.env` và nhiều project |
| Test | UI + API kết hợp; data-driven; có test bắt các bug bật bằng `?bugs=` |
| Ổn định | Chạy xanh 10 lần liên tiếp với `--repeat-each=10` |
| CI | Workflow GitHub Actions chạy mỗi push, upload báo cáo và trace |
| Tài liệu | README: cách cài, chạy, cấu trúc, quy ước |

### Checklist tự đánh giá
- Mỗi test độc lập, chạy được riêng lẻ và song song.
- Không còn `waitForTimeout`, không còn locator dựa vào vị trí.
- Mọi BR đều có ít nhất một test.
- Bắt được cả ba bug của lab khi bật `?bugs=`.

## Câu hỏi phỏng vấn thường gặp
**Tổng quan**
- Playwright là gì? So với Selenium và Cypress có điểm mạnh gì? *(đa trình duyệt, auto-wait, trace, một công cụ cho UI + API)*
- Playwright hỗ trợ những ngôn ngữ nào? *(TypeScript/JavaScript, Python, Java, .NET)*

**Locator**
- Thứ tự ưu tiên chọn locator? Vì sao tránh XPath tuyệt đối?
- Strict mode là gì? Xử lý lỗi “locator resolved to 2 elements” thế nào?

**Kỹ thuật**
- `browser`, `context`, `page` khác nhau thế nào? Khi nào dùng nhiều context?
- Auto-wait hoạt động ra sao? Vì sao không nên dùng `waitForTimeout`?
- Fixture khác `beforeEach` ở đâu?
- Page Object Model giải quyết vấn đề gì? Sai lầm thường gặp?
- Test song song và sharding khác nhau thế nào?

**Thực tế**
- Test chập chờn, bạn điều tra thế nào? *(tái lập, cô lập, trace, phân loại nguyên nhân)*
- Làm sao test đăng nhập một lần cho nhiều test? *(`storageState`, project setup)*
- Test API với Playwright thế nào? Kết hợp UI và API ra sao?
- Chạy test lúc 6 giờ sáng hằng ngày trên GitHub? *(cron trong workflow)*
- Bạn chọn test nào để automate? *(tần suất, ổn định, rủi ro, chi phí)*

**Tư duy**
- Kể một bug bạn tìm được bằng kỹ thuật biên hoặc bảng quyết định.
- Khi nào không nên automate?

## Cách trả lời tốt
1. Trả lời **ngắn trước**, ví dụ sau.
2. Gắn với **trải nghiệm thật**: “Ở lab giỏ hàng, mình dùng bảng quyết định để…”.
3. Nói rõ **đánh đổi**, không nói tuyệt đối.
4. Biết nói “mình chưa gặp, nhưng sẽ tiếp cận bằng cách…”.

## Bài tập
1. Hoàn thành capstone và tự chấm theo checklist.
2. Tự trả lời thành tiếng 10 câu phỏng vấn ở trên, mỗi câu dưới 90 giây.
