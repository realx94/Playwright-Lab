---
title: BDD và Gherkin
level: 5
order: 3
minutes: 30
summary: Mô tả hành vi bằng Given/When/Then, khi nào dùng BDD và những cái bẫy thường gặp.
keywords: [gherkin là gì, bdd là gì, given when then]
---

## Mục tiêu bài học
- Hiểu BDD và cú pháp Gherkin.
- Biết khi nào BDD có ích và khi nào không.

## Kiến thức cần nắm
- **BDD** (Behaviour Driven Development): cả nhóm cùng mô tả **hành vi mong đợi** bằng ngôn ngữ chung
- **Gherkin**: `Feature`, `Scenario`, `Given` (bối cảnh), `When` (hành động), `Then` (kết quả), `And`, `But`
- `Scenario Outline` + `Examples`: một kịch bản, nhiều bộ dữ liệu
- **Step definition**: code ánh xạ mỗi câu Gherkin thành thao tác thật
- Công cụ phổ biến: Cucumber, `playwright-bdd`

## Giải thích dễ hiểu
Kịch bản BDD giống **bản hợp đồng viết bằng lời thường** giữa người làm nghiệp vụ, dev và QA: ai đọc cũng hiểu. Step definition là **người phiên dịch** biến từng câu thành thao tác thật trên trình duyệt.

## Demo code
```gherkin
Feature: Đăng nhập

  Scenario: Khoá tài khoản sau 5 lần nhập sai
    Given tôi ở trang đăng nhập
    When tôi nhập sai mật khẩu 5 lần liên tiếp
    Then tôi thấy thông báo tài khoản bị khoá

  Scenario Outline: Kiểm tra độ dài mật khẩu
    Given tôi ở trang đăng nhập
    When tôi nhập mật khẩu "<password>"
    Then tôi thấy kết quả "<result>"

    Examples:
      | password | result              |
      | Pass0r!  | lỗi tối thiểu 8     |
      | Pass0rd! | không có lỗi độ dài |
```

Step definition (ý tưởng):

```ts
Given("tôi ở trang đăng nhập", async ({ page }) => {
  await page.goto("/lab/login");
});
```

## Best practice
1. Viết theo **hành vi người dùng**, không viết thao tác giao diện (“bấm nút #btn-3”).
2. Mỗi scenario kiểm tra **một hành vi**.
3. Dùng lại step, tránh tạo hàng trăm câu gần giống nhau.
4. Có người nghiệp vụ tham gia viết; nếu chỉ QA tự viết rồi tự đọc thì BDD chỉ thêm chi phí.

## Khi nào không nên dùng BDD
Nhóm không có người nghiệp vụ cùng tham gia, hoặc chỉ cần test kỹ thuật (API, tích hợp). Khi đó viết test Playwright thuần sẽ gọn hơn.

## Lỗi thường gặp
- Kịch bản dài như hướng dẫn thao tác từng bước.
- Step quá cụ thể nên không dùng lại được.
- Dùng BDD chỉ vì “nghe chuyên nghiệp”.

## Bài tập
1. Viết scenario Gherkin cho luật huỷ đơn hàng ở LAB-03.
2. Viết một `Scenario Outline` cho biên tuổi 17, 18, 65, 66 ở LAB-02.
