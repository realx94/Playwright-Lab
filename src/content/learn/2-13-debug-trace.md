---
title: Debug với Inspector, UI Mode và Trace Viewer
level: 2
order: 13
minutes: 30
summary: Tìm nguyên nhân test hỏng bằng --debug, UI Mode, codegen và Trace Viewer.
keywords: [playwright trace viewer, playwright inspector, playwright codegen]
---

## Mục tiêu bài học
- Biết công cụ nào dùng cho tình huống nào khi test hỏng.
- Đọc trace để tìm nguyên nhân chính xác.

## Kiến thức cần nắm
- `npx playwright test --debug`: mở Inspector, chạy từng bước
- `npx playwright test --ui`: UI Mode có time-travel, lọc, chạy lại
- `npx playwright codegen <url>`: ghi thao tác thành code nháp
- **Trace**: bản ghi toàn bộ (DOM snapshot, mạng, console, ảnh) của test
- Cấu hình: `trace: "on-first-retry"`, `screenshot: "only-on-failure"`

## Giải thích dễ hiểu
Trace giống **camera hành trình của xe**: khi tai nạn xảy ra (test đỏ) bạn tua lại từng giây, xem trang trông thế nào ở mỗi bước và mạng đã trả gì. Không cần đoán, không cần chạy lại cho đến khi lỗi tái hiện.

## Demo code
```bash
npx playwright test login --debug            # dừng ở từng bước
npx playwright test --ui                     # giao diện tương tác
npx playwright codegen http://localhost:3000/lab/login
npx playwright show-trace test-results/<tên>/trace.zip
```

Tạm dừng tại một điểm cụ thể trong test:

```ts
await page.pause();   // mở Inspector tại đây
```

## Quy trình điều tra test đỏ
1. Đọc thông báo lỗi và dòng code bị dừng.
2. Mở trace/ảnh chụp: phần tử có thật sự xuất hiện không?
3. Kiểm tra locator có khớp nhiều hơn 1 phần tử không (strict mode).
4. Kiểm tra tab Network/Console trong trace.
5. Chỉ sau đó mới sửa; không tăng timeout bừa.

## Lỗi thường gặp
- Dùng codegen rồi giữ nguyên locator dài do nó sinh ra; hãy chuyển về `getByRole`/`getByLabel`.
- Sửa test cho xanh mà không tìm ra nguyên nhân thật (bug của ứng dụng hay của test?).
- Quên bật trace nên khi CI đỏ không có gì để xem.

## Bài tập
1. Cố ý đổi một locator sai, chạy với `--ui` và tìm ra lý do test đỏ.
2. Bật `trace: "on"`, chạy test và mở `show-trace` để xem từng bước.
