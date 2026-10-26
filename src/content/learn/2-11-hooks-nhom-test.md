---
title: Hooks, nhóm test và test.step
level: 2
order: 11
minutes: 25
summary: beforeEach/afterEach, beforeAll/afterAll, describe, serial/parallel và test.step.
keywords: [playwright hooks, test.step, parallel vs serial]
---

## Mục tiêu bài học
- Gom bước chuẩn bị/dọn dẹp vào hooks.
- Tổ chức test thành nhóm và chạy song song an toàn.

## Kiến thức cần nắm
- `test.beforeEach` / `afterEach`: chạy quanh **mỗi** test
- `test.beforeAll` / `afterAll`: chạy một lần cho cả nhóm
- `test.describe`: nhóm test, có thể gắn cấu hình riêng (`test.describe.configure`)
- Mặc định các file chạy **song song**, test trong một file chạy tuần tự
- `test.step("tên", async () => {...})` chia test thành bước dễ đọc trong báo cáo

## Giải thích dễ hiểu
Hooks giống **dọn bàn ăn**: trước mỗi khách (beforeEach) trải khăn sạch, sau mỗi khách (afterEach) dọn bát đĩa. Bạn không viết lại việc đó trong từng bữa. `test.step` giống **chia bữa tiệc thành các món** để khi “hỏng” biết đang ở món nào.

## Demo code
```ts
import { test, expect } from "@playwright/test";

test.describe("LAB-01 Khoá tài khoản", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/login");
    await page.getByTestId("reset-data").click();   // luôn bắt đầu từ trạng thái sạch
  });

  test("khoá ở lần sai thứ 5", async ({ page }) => {
    await test.step("4 lần sai chưa khoá", async () => {
      for (let i = 0; i < 4; i++) await login(page, "Wrong123!");
      await expect(page.getByTestId("form-error")).not.toContainText("khoá");
    });
    await test.step("lần 5 bị khoá", async () => {
      await login(page, "Wrong123!");
      await expect(page.getByTestId("form-error")).toContainText("bị khoá");
    });
  });
});
```

## Nguyên tắc
- Mỗi test phải **độc lập**: không dựa vào kết quả test khác.
- Dùng hooks để reset dữ liệu, không để test này “dọn” cho test kia.
- Chỉ dùng `serial` khi các bước thật sự phụ thuộc nhau và không tách được.

## Lỗi thường gặp
- Dữ liệu dùng chung giữa test chạy song song nên lúc xanh lúc đỏ.
- Đặt quá nhiều logic trong `beforeAll`, khó biết test nào hỏng vì sao.
- Quên rằng `beforeAll` không nhận được fixture `page` (dùng `browser` để tự tạo).

## Bài tập
1. Viết `beforeEach` mở LAB-03 và reset dữ liệu, sau đó viết hai test dùng chung nó.
2. Chia một test dài thành các `test.step` và mở báo cáo HTML để xem các bước.
