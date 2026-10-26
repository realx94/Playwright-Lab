---
title: Assertion
level: 2
order: 8
minutes: 30
summary: Web-first assertion tự thử lại, các matcher thường dùng, soft assertion và expect.poll.
keywords: [expect auto-retrying, soft assertion, expect.poll]
---

## Mục tiêu bài học
- Dùng assertion tự thử lại thay vì kiểm tra tức thời.
- Chọn matcher phù hợp và viết assertion có ý nghĩa.

## Kiến thức cần nắm
- **Web-first assertion**: `await expect(locator).toBeVisible()` tự thử lại tới hết timeout
- Matcher thường dùng: `toBeVisible`, `toBeHidden`, `toHaveText`, `toContainText`, `toHaveValue`, `toBeEnabled`, `toBeChecked`, `toHaveCount`, `toHaveURL`, `toHaveAttribute`
- **Generic assertion** (`expect(value).toBe(...)`) không tự thử lại
- `expect.soft` ghi nhận lỗi nhưng không dừng test
- `expect.poll` và `expect(...).toPass()` cho điều kiện không liên quan tới locator

## Giải thích dễ hiểu
Assertion kiểu cũ giống **chụp ảnh một lần rồi so**: nếu trang chưa kịp cập nhật thì sai. Web-first assertion giống **chờ ở cửa cho tới khi thấy điều mong đợi** hoặc hết giờ. Nhờ vậy bạn không cần `sleep` mà vẫn ổn định.

## Demo code
```ts
// Tự thử lại: đúng
await expect(page.getByTestId("password-error")).toContainText("tối thiểu 8");

// KHÔNG tự thử lại: dễ flaky
const text = await page.getByTestId("password-error").innerText();
expect(text).toContain("tối thiểu 8");

// Phủ định
await expect(page.getByTestId("dashboard")).toBeHidden();
await expect(page.getByRole("button", { name: "Huỷ đơn" })).toHaveCount(0);

// Điều kiện ngoài locator
await expect.poll(async () => await getOrderStatus()).toBe("Đang giao");
```

## Viết assertion tốt
- Kiểm tra **kết quả có ý nghĩa nghiệp vụ**, không chỉ “phần tử tồn tại”.
- Một test nên trả lời được: “nếu hỏng thì hỏng ở đâu?”.
- Dùng giá trị kỳ vọng **tính từ quy tắc nghiệp vụ**, không sao chép giá trị đang hiển thị.

## Lỗi thường gặp
- Lấy text bằng `innerText()` rồi `expect(...).toBe(...)`: mất khả năng thử lại.
- Thiếu `await` trước `expect`.
- Assertion quá yếu (chỉ kiểm tra không có lỗi) nên bug lọt qua.

## Bài tập
1. Viết test LAB-03 kiểm tra phí ship, VAT và tổng, với giá trị kỳ vọng tính từ quy tắc.
2. Chuyển một assertion dạng `innerText()` + `toBe` sang web-first assertion.
