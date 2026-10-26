---
title: Browser, Context và Page
level: 2
order: 12
minutes: 25
summary: Phân biệt browser, context, page; cô lập phiên và dùng nhiều người dùng trong một test.
keywords: [browser context isolation, playwright storageState, multiple contexts]
---

## Mục tiêu bài học
- Phân biệt ba lớp: browser → context → page.
- Biết khi nào cần nhiều context và cách tái sử dụng đăng nhập.

## Kiến thức cần nắm
- **Browser**: một tiến trình trình duyệt (Chromium, Firefox, WebKit)
- **Context**: một “hồ sơ” ẩn danh độc lập (cookie, localStorage riêng)
- **Page**: một tab trong context
- Mỗi test mặc định nhận **context mới + page mới** nên các test cô lập nhau
- `storageState`: lưu cookie/localStorage sau khi đăng nhập để tái sử dụng

## Giải thích dễ hiểu
Browser là **toà nhà**, mỗi context là **một căn hộ riêng** có chìa khoá và đồ đạc riêng, mỗi page là **một phòng** trong căn hộ. Hai căn hộ không thấy đồ của nhau, nên bạn có thể mở hai “người dùng” cùng lúc (khách và quản trị viên) trong một test.

## Demo code
```ts
import { test, expect } from "@playwright/test";

test("hai người dùng độc lập", async ({ browser }) => {
  const customer = await browser.newContext();
  const manager = await browser.newContext();
  const customerPage = await customer.newPage();
  const managerPage = await manager.newPage();

  await customerPage.goto("/lab/login");
  await managerPage.goto("/lab/login");
  // Đăng nhập khác nhau; không ảnh hưởng nhau
  await customer.close();
  await manager.close();
});
```

Tái sử dụng đăng nhập (đăng nhập một lần, dùng cho nhiều test):

```ts
// lúc setup: sau khi đăng nhập
await page.context().storageState({ path: ".auth/user.json" });
// trong config: use: { storageState: ".auth/user.json" }
```

## Lỗi thường gặp
- Dùng chung một context cho nhiều “người dùng” nên họ chia sẻ phiên.
- Commit file `.auth/*.json` chứa cookie lên Git (hãy đưa vào `.gitignore`).
- Quên đóng context tự tạo nên rò rỉ tài nguyên.

## Bài tập
1. Mở hai context, đăng nhập LAB-01 ở một context và chứng minh context kia vẫn chưa đăng nhập.
2. Lưu `storageState` sau khi đăng nhập và dùng nó cho một test khác.
