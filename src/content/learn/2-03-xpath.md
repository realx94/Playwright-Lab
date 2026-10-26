---
title: XPath
level: 2
order: 3
minutes: 25
summary: Hiểu cú pháp XPath, khi nào dùng và khi nào nên tránh so với CSS.
keywords: [xpath vs css, xpath contains, xpath axes]
---

## Mục tiêu bài học
- Đọc và viết được XPath cơ bản.
- Biết ưu nhược điểm so với CSS selector.

## Kiến thức cần nắm
- Đường dẫn tuyệt đối `/html/body/...` và tương đối `//tag`
- Điều kiện: `//input[@type='email']`, `//button[text()='Đăng nhập']`
- Hàm: `contains(@class,'btn')`, `starts-with(...)`, `normalize-space(...)`
- Trục: `parent::`, `following-sibling::`, `ancestor::`
- XPath đi **ngược lên cha** được, còn CSS truyền thống thì khó

## Giải thích dễ hiểu
XPath giống **chỉ đường bằng mô tả**: “từ toà nhà này, đi lên văn phòng chứa chữ ‘Kế toán’ rồi sang phòng bên cạnh”. Nó mạnh hơn CSS vì dựa được vào **nội dung chữ** và đi theo mọi hướng, nhưng đổi lại dài dòng và dễ vỡ khi trang đổi cấu trúc.

## Demo code
```text
//input[@id='email']                           theo thuộc tính
//button[normalize-space()='Đăng nhập']        theo chữ hiển thị
//label[text()='Email']/following-sibling::input   ô nhập ngay sau nhãn
//td[text()='SALE10']/parent::tr                 lấy cả hàng chứa mã
```

Trong Playwright:

```ts
await page.locator("xpath=//td[text()='SALE10']/parent::tr").click();
```

## Khi nào dùng
| Tình huống | Gợi ý |
|-----------|-------|
| Có `getByRole`, `getByLabel`, `getByTestId` | Dùng chúng, đừng dùng XPath |
| Cần đi ngược lên cha hoặc tìm theo chữ trong bảng | XPath hoặc `locator.filter` |
| Selector copy từ DevTools (`/html/body/div[3]/...`) | Tránh, rất mong manh |

## Lỗi thường gặp
- Dùng đường dẫn tuyệt đối do DevTools “Copy XPath” sinh ra.
- Quên khoảng trắng thừa trong chữ nên `text()='...'` không khớp (dùng `normalize-space`).

## Bài tập
1. Viết XPath chọn hàng sản phẩm “Chuột không dây” ở LAB-03.
2. Viết lại cùng phần tử bằng CSS và `getByRole`, so sánh độ dài và độ ổn định.
