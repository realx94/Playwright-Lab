---
title: API Testing với Playwright
level: 4
order: 7
minutes: 35
summary: REST, method, status code, header, body; dùng fixture request để kiểm tra API và schema.
keywords: [rest api là gì, playwright api testing, status code]
---

## Mục tiêu bài học
- Hiểu các thành phần của một request/response HTTP.
- Viết test API bằng fixture `request` của Playwright.

## Kiến thức cần nắm
- **REST**: tài nguyên + method (`GET` đọc, `POST` tạo, `PUT/PATCH` sửa, `DELETE` xoá)
- **Status code**: 2xx thành công, 3xx chuyển hướng, 4xx lỗi phía client (400, 401, 403, 404, 409, 422), 5xx lỗi máy chủ
- **Header** (ví dụ `Authorization`, `Content-Type`) và **body** (thường JSON)
- Fixture **`request`**: gửi HTTP không cần mở trình duyệt, rất nhanh
- Kiểm tra: status, header, nội dung body, cấu trúc (schema), thời gian phản hồi

## Giải thích dễ hiểu
Website giống **nhà hàng**; giao diện là thực đơn và phục vụ bàn, còn API là **cửa sổ giao đồ với nhà bếp**. UI test là ngồi bàn gọi món; API test là đứng ở cửa sổ nhà bếp đưa phiếu và kiểm tra món trả ra có đúng không — nhanh hơn nhiều vì không cần trang trí bàn ăn.

## Demo code
```ts
import { test, expect } from "@playwright/test";

test("tạo đơn hàng qua API", async ({ request }) => {
  const res = await request.post("/api/orders", {
    data: { productId: "p2", quantity: 2 },
    headers: { Authorization: "Bearer demo-token" },
  });

  expect(res.status()).toBe(201);
  expect(res.headers()["content-type"]).toContain("application/json");

  const body = await res.json();
  expect(body).toMatchObject({ productId: "p2", quantity: 2, status: "Mới" });
  expect(body.id).toBeTruthy();
});

test("thiếu token trả về 401", async ({ request }) => {
  const res = await request.get("/api/orders");
  expect(res.status()).toBe(401);
});
```

Các trường hợp luôn nên có: thành công, thiếu/sai xác thực (401), không đủ quyền (403), dữ liệu sai (400/422), không tìm thấy (404), trùng (409).

## Checklist một endpoint
1. Đúng method và status cho trường hợp hợp lệ.
2. Body trả về có đủ trường và đúng kiểu.
3. Xác thực và phân quyền.
4. Dữ liệu không hợp lệ cho lỗi rõ ràng, không lộ chi tiết nội bộ.
5. Idempotency: gửi lại cùng một yêu cầu có tạo bản ghi trùng không?

## Lỗi thường gặp
- Chỉ kiểm tra status mà không kiểm tra body.
- Dùng dữ liệu cố định nên test chạy lần hai bị trùng (409).
- Quên dọn dữ liệu sau khi tạo.

## Bài tập
1. Viết 4 test API cho một endpoint: thành công, 401, 400 và 404.
2. Dùng `expect(body).toMatchObject(...)` để kiểm tra cấu trúc trả về.
