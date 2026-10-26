---
title: Custom fixture
level: 4
order: 3
minutes: 35
summary: Dùng test.extend để tự tạo fixture, tự động chuẩn bị và dọn dẹp cho test.
keywords: [playwright fixtures, test.extend, fixture scope]
---

## Mục tiêu bài học
- Hiểu fixture khác hook ở đâu.
- Viết fixture riêng để đưa Page Object vào test.

## Kiến thức cần nắm
- Fixture là thứ được **đưa vào test theo tên** trong tham số (`{ page, request }`)
- Tự viết bằng `test.extend<T>({ ... })`
- Cú pháp: `async ({ page }, use) => { /* chuẩn bị */ await use(giá_trị); /* dọn dẹp */ }`
- Chỉ được tạo khi test **thực sự dùng** (lazy), khác với hook chạy cho mọi test
- Phạm vi (`scope`): `test` (mặc định) hoặc `worker`; `auto: true` để luôn chạy

## Giải thích dễ hiểu
Hook giống **lịch dọn phòng cứng**: mỗi sáng dọn mọi phòng dù chẳng ai ở. Fixture giống **dịch vụ gọi theo nhu cầu**: phòng nào có khách mới được dọn đúng loại khách cần. Bạn chỉ “gọi tên” fixture trong tham số, Playwright lo phần còn lại.

## Demo code
```ts
// fixtures/index.ts
import { test as base, expect } from "@playwright/test";
import { CartPage } from "../pages/CartPage";

type Fixtures = { cartPage: CartPage };

export const test = base.extend<Fixtures>({
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await cartPage.goto();          // chuẩn bị: mở trang
    await cartPage.reset();         // chuẩn bị: dữ liệu sạch
    await use(cartPage);            // trao cho test
    // dọn dẹp (nếu cần) viết ở đây
  },
});

export { expect };
```

```ts
// tests/cart.spec.ts
import { test, expect } from "../fixtures";

test("hết hàng không thêm được", async ({ cartPage }) => {
  await expect(cartPage.addButton("p4")).toBeDisabled();
});
```

## Khi nào dùng fixture, khi nào dùng hook
| Cần | Chọn |
|-----|------|
| Đưa đối tượng (Page Object, dữ liệu) vào test | Fixture |
| Việc dọn dẹp luôn đi kèm với việc chuẩn bị | Fixture (đặt sau `use`) |
| Chuẩn bị chung đơn giản cho một nhóm test | `beforeEach` |

## Lỗi thường gặp
- Quên gọi `await use(...)` nên test treo.
- Đặt dọn dẹp trước `use` thay vì sau nên dữ liệu bị xoá khi test còn chạy.
- Fixture quá lớn, ôm quá nhiều việc.

## Bài tập
1. Viết fixture `loginPage` mở LAB-01 và reset dữ liệu.
2. Viết fixture `loggedInPage` đã đăng nhập sẵn rồi dùng nó cho hai test.
