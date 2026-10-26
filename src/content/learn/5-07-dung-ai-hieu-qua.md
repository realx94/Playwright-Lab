---
title: Dùng AI hiệu quả trong automation
level: 5
order: 7
minutes: 25
summary: Dùng AI để viết, đọc và review test nhanh hơn mà vẫn kiểm soát chất lượng và bảo mật.
keywords: [playwright mcp, ai viết test automation, prompt cho tester]
---

## Mục tiêu bài học
- Biết AI giúp được gì và không giúp được gì trong automation.
- Có quy trình dùng AI an toàn, kiểm soát được chất lượng.

## Kiến thức cần nắm
- AI mạnh ở: **giải thích** code lạ, **gợi ý** test case và dữ liệu biên, **chuyển đổi** (Selenium → Playwright), **viết nháp** Page Object và test
- AI yếu ở: hiểu **nghiệp vụ riêng** của bạn, biết **bug thật** nằm ở đâu, giữ nhất quán trên cả dự án
- Công cụ: trợ lý trong IDE, chat, **Playwright MCP** (cho AI điều khiển trình duyệt thật)
- Mọi đầu ra của AI **phải được người đọc, chạy và hiểu** trước khi commit
- Bảo mật: không dán khoá, dữ liệu khách hàng hay mã nguồn nhạy cảm vào dịch vụ bên ngoài

## Giải thích dễ hiểu
AI giống **một thực tập sinh rất nhanh và rất tự tin**: viết nháp nhanh, đôi khi nói sai mà vẫn rất chắc chắn. Bạn là **người hướng dẫn**: đưa ngữ cảnh rõ ràng, kiểm tra từng sản phẩm, và chịu trách nhiệm cuối cùng.

## Prompt hiệu quả
Một prompt tốt gồm: **vai trò, ngữ cảnh, đầu vào, ràng buộc, định dạng đầu ra**.

```text
Bạn là QA automation dùng Playwright + TypeScript.
Ngữ cảnh: trang /lab/cart, quy tắc: SALE10 giảm 10% cho đơn từ 500.000đ, tối đa 100.000đ.
Nhiệm vụ: đề xuất các test case giá trị biên và viết spec data-driven.
Ràng buộc: dùng getByRole/getByLabel, không dùng waitForTimeout, mỗi test độc lập.
Đầu ra: bảng test case rồi code.
```

## Quy trình kiểm soát chất lượng
1. Yêu cầu AI nêu **giả định** của nó rồi đối chiếu với tài liệu thật.
2. **Chạy** code, không tin vì “trông có vẻ đúng”.
3. Kiểm tra theo checklist review: locator hướng người dùng, không chờ cố định, assertion có ý nghĩa nghiệp vụ.
4. Đặt kỳ vọng từ **yêu cầu**, không từ hành vi hiện tại của ứng dụng (AI hay lấy hành vi hiện tại làm đúng).
5. Cố ý bật bug (`?bugs=…`) để kiểm tra test do AI viết có thật sự bắt được lỗi.

## Playwright MCP
Cho phép AI mở trình duyệt, đọc cây truy cập (accessibility tree) và thao tác để tự khám phá luồng, sinh test nháp. Hữu ích để dựng nhanh, nhưng vẫn cần bạn tinh chỉnh locator và assertion.

## Lỗi thường gặp
- Dán nguyên mã AI sinh ra mà không chạy.
- Để AI “sửa cho test xanh” bằng cách nới assertion hoặc thêm `waitForTimeout`.
- Dán dữ liệu thật hoặc bí mật vào công cụ bên ngoài.

## Bài tập
1. Dùng AI sinh test cho LAB-03, sau đó bật `?bugs=BUG-02` để kiểm tra nó có phát hiện lỗi không.
2. Viết một prompt có đủ 5 thành phần cho bài tập đăng nhập ở LAB-01.
