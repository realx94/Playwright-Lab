---
title: Kết hợp UI và API, mock mạng với page.route
level: 4
order: 8
minutes: 30
summary: Tạo dữ liệu bằng API, kiểm tra trên UI; giả lập phản hồi mạng để test tình huống lỗi.
keywords: [playwright route mock, page.route, api setup ui verify]
---

## Mục tiêu bài học
- Dùng API để chuẩn bị dữ liệu thay vì thao tác UI chậm.
- Giả lập phản hồi mạng để kiểm tra các tình huống khó tái hiện.

## Kiến thức cần nắm
- **Chuẩn bị bằng API, kiểm tra bằng UI**: nhanh và ổn định hơn
- `page.route(url, handler)`: chặn request để **trả phản hồi giả**, sửa hoặc chặn
- `route.fulfill({ status, json })`, `route.abort()`, `route.continue()`
- `page.waitForResponse` để chờ một lời gọi cụ thể và kiểm tra nội dung
- Khi nào mock: dịch vụ bên thứ ba, lỗi 500, thời gian chậm, dữ liệu khó tạo

## Giải thích dễ hiểu
Muốn xem **khách sạn xử lý thế nào khi hết phòng**, bạn không cần đặt kín mọi phòng thật. Chỉ cần nhờ lễ tân “giả vờ” báo hết phòng. `page.route` chính là nhờ lễ tân (lớp mạng) trả lời thay: giao diện nhận đúng phản hồi đó và bạn xem nó xử lý ra sao.

## Demo code
Mock lỗi 500:

```ts
import { test, expect } from "@playwright/test";

test("hiện thông báo khi máy chủ lỗi", async ({ page }) => {
  await page.route("**/api/orders", (route) =>
    route.fulfill({ status: 500, json: { message: "Internal error" } }),
  );
  await page.goto("/orders");
  await page.getByRole("button", { name: "Đặt hàng" }).click();
  await expect(page.getByRole("alert")).toContainText("Có lỗi xảy ra");
});
```

Chuẩn bị bằng API, kiểm tra bằng UI:

```ts
test("đơn tạo bằng API hiện trên giao diện", async ({ page, request }) => {
  const res = await request.post("/api/orders", { data: { productId: "p2", quantity: 1 } });
  const { id } = await res.json();

  await page.goto("/orders");
  await expect(page.getByTestId(`order-${id}`)).toBeVisible();
});
```

## Khi không nên mock
- Khi mục tiêu chính là kiểm tra **tích hợp thật** (cần ít test, chạy ở môi trường thử).
- Khi mock làm test không còn phản ánh hành vi thật của hệ thống.

## Lỗi thường gặp
- Đăng ký `page.route` sau khi trang đã gọi API nên không chặn được.
- Pattern URL quá rộng nên chặn nhầm request khác.
- Mock xong quên kiểm tra cả trường hợp thành công thật.

## Bài tập
1. Mock một phản hồi 500 cho lời gọi bất kỳ và quan sát cách giao diện xử lý.
2. Dùng `waitForResponse` để kiểm tra nội dung trả về khi bấm nút.
