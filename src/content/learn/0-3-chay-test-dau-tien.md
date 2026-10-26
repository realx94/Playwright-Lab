---
title: Chạy test đầu tiên
level: 0
order: 3
minutes: 20
summary: Tạo project Playwright, hiểu cấu trúc thư mục và chạy bài test đầu tiên.
keywords: [playwright.config.ts, headed vs headless, playwright html report]
---

## Mục tiêu bài học
- Có một project Playwright chạy được.
- Đọc hiểu cấu trúc thư mục và file cấu hình cơ bản.
- Chạy test và mở báo cáo HTML.

## Kiến thức cần nắm
- Lệnh khởi tạo: `npm init playwright@latest`
- File `playwright.config.ts`: `testDir`, `baseURL`, `projects`, `reporter`
- Thư mục `tests/` chứa các file `*.spec.ts`
- Lệnh chạy: `npx playwright test`, thêm `--headed`, `--ui`, `-g "tên test"`
- Chế độ headless (không hiện cửa sổ) và headed (hiện cửa sổ)

## Giải thích dễ hiểu
Một test Playwright giống kịch bản của một **diễn viên robot**: mở trang, bấm nút, đọc chữ, rồi đối chiếu với kỳ vọng. `playwright.config.ts` là bản hướng dẫn cho đạo diễn: diễn ở sân khấu nào (`baseURL`), dùng trình duyệt nào (`projects`), quay lại những gì khi hỏng (`trace`).

## Demo code
Một test hoàn chỉnh nhỏ nhất:

```ts
import { test, expect } from "@playwright/test";

test("trang chủ hiện tiêu đề", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
```

Chạy và xem báo cáo:

```bash
npx playwright test
npx playwright show-report
```

## Thực hành
Dùng [starter repo](/starter): đặt `BASE_URL` trong `.env`, rồi chạy `npx playwright test 00-smoke`. Khi test xanh, bạn đã sẵn sàng cho bài tiếp theo.

## Lỗi thường gặp
- Quên `await` trước các thao tác của `page` nên test xanh ảo hoặc đỏ ngẫu nhiên (xem bài async/await).
- Chưa chạy `npx playwright install` nên thiếu trình duyệt.
- Sai `baseURL` nên `page.goto("/")` mở nhầm trang.

## Bài tập
1. Chạy test với `--headed` rồi với `--ui`; ghi lại điểm khác nhau.
2. Cố ý sửa kỳ vọng để test đỏ, mở báo cáo HTML và tìm dòng lỗi.
