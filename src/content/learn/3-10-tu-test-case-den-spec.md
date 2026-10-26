---
title: Từ test case đến Playwright spec
level: 3
order: 10
minutes: 30
summary: Chuyển test case thủ công thành test tự động, giữ truy vết BR → TC → spec.
keywords: [data driven testing playwright, test case to automation, traceability]
---

## Mục tiêu bài học
- Chuyển test case sang code mà vẫn giữ được ý nghĩa.
- Dùng data-driven để phủ nhiều dữ liệu với một đoạn code.

## Kiến thức cần nắm
- Mỗi test case → một hoặc một nhóm test Playwright
- Đặt **ID test case và BR** trong tên test để truy vết
- **Data-driven**: một mảng dữ liệu → nhiều test
- Tách **dữ liệu**, **thao tác** (Page Object) và **kiểm tra**
- Giữ test **độc lập**: tự reset dữ liệu bằng hook

## Giải thích dễ hiểu
Test case là **bản nhạc**, spec là **buổi biểu diễn**. Cùng một bản nhạc, bạn có thể biểu diễn nhiều lần với nhiều nhạc cụ. Truy vết giúp bạn trả lời được: “Quy tắc BR-02 đã được biểu diễn bằng những test nào, hôm nay chúng đỏ hay xanh?”

## Ví dụ: từ TC đến spec
Test case:

| ID | Bước | Dữ liệu | Mong đợi | BR |
|----|------|---------|----------|----|
| TC-F-004/005/006 | Nhập tuổi, bấm Gửi | 17, 18, 65, 66 | Chỉ 17 và 66 báo lỗi | BR-02 |

Spec:

```ts
import { test, expect } from "@playwright/test";

const ageCases = [
  { age: "17", valid: false },
  { age: "18", valid: true },
  { age: "65", valid: true },
  { age: "66", valid: false },
];

for (const c of ageCases) {
  test(`[BR-02][TC-F-00x] tuổi ${c.age} ${c.valid ? "hợp lệ" : "bị từ chối"}`, async ({ page }) => {
    await page.goto("/lab/forms");
    await page.getByLabel("Tuổi").fill(c.age);
    await page.getByRole("button", { name: "Gửi" }).click();
    await expect(page.getByTestId("age-error")).toHaveCount(c.valid ? 0 : 1);
  });
}
```

Chạy riêng theo quy tắc: `npx playwright test -g "BR-02"`.

## Checklist trước khi chuyển sang code
1. Test case đã rõ dữ liệu và kết quả mong đợi?
2. Kết quả có thể kiểm chứng bằng assertion web-first?
3. Dữ liệu và trạng thái ban đầu có tái lập được (reset)?
4. Gắn BR và ID vào tên test?

## Lỗi thường gặp
- Chép nguyên văn từng bước thủ công, tạo test dài và dễ vỡ.
- Hard-code dữ liệu trong từng test thay vì mảng dữ liệu.
- Mất truy vết nên không biết BR nào đã phủ.

## Bài tập
1. Chọn 5 test case P0 của LAB-03, viết spec có BR và TC trong tên test.
2. Chạy `-g "BR-02"` và kiểm tra có đúng các test của quy tắc đó.
