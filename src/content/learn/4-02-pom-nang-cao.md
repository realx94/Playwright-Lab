---
title: POM nâng cao – component và kế thừa
level: 4
order: 2
minutes: 30
summary: Component object, BasePage, composition và khi nào dùng kế thừa hay kết hợp.
keywords: [component object model, composition vs inheritance, base page]
---

## Mục tiêu bài học
- Tách các vùng giao diện dùng lại thành component.
- Chọn giữa kế thừa và kết hợp (composition).

## Kiến thức cần nắm
- **Component object**: class cho một vùng lặp lại nhiều nơi (header, bảng, modal, form)
- **BasePage** (kế thừa): phần chung như `goto`, tiêu đề, đường dẫn
- **Composition**: Page chứa component như một thuộc tính (`this.header`)
- Nguyên tắc: *ưu tiên composition, dùng kế thừa cho quan hệ “là một” rõ ràng*
- Method trả về page/component kế tiếp giúp viết **fluent**: `await login.submit()` rồi dùng `dashboard`

## Giải thích dễ hiểu
Trang web giống một **căn nhà lắp ghép**: mỗi trang có thanh điều hướng, bảng, hộp thoại. Thay vì viết lại thanh điều hướng cho từng căn nhà, bạn làm **một khối thanh điều hướng** và gắn vào mọi căn. Đó là component object.

## Demo code
```ts
import type { Locator, Page } from "@playwright/test";

class ProductCard {
  constructor(private readonly root: Locator) {}
  async add(times = 1) {
    await this.root.getByRole("button", { name: "Thêm vào giỏ" }).click();
    for (let i = 1; i < times; i++) await this.root.getByRole("button", { name: /^Tăng/ }).click();
  }
}

export class CartPage {
  constructor(private readonly page: Page) {}
  product(id: string) {
    return new ProductCard(this.page.getByTestId(`product-${id}`));
  }
}

// trong test
await cart.product("p2").add(2);
```

## Kế thừa hay kết hợp?
| Tình huống | Chọn |
|-----------|------|
| Mọi trang đều có `goto`, `path` | Kế thừa `BasePage` |
| Nhiều trang cùng có thanh điều hướng | Composition (`header` là thuộc tính) |
| Một trang có nhiều khối giống nhau (thẻ sản phẩm) | Component nhận `Locator` gốc |

## Lỗi thường gặp
- Chuỗi kế thừa dài (Page → BasePage → AuthPage → AdminPage) khó hiểu.
- Component dùng locator toàn trang thay vì giới hạn trong `root` của nó nên khớp nhầm.
- Method làm quá nhiều việc (`loginAndOpenCartAndAddItem`).

## Bài tập
1. Tách `ProductCard` ở LAB-03 thành component và viết test thêm hai sản phẩm.
2. Giải thích vì sao `header` nên là composition thay vì kế thừa.
