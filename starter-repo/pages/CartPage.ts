import type { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import { parseMoney } from "../utils/money";

export type AmountId = "subtotal" | "discount" | "vat" | "shipping" | "total";

/** Page Object cho LAB-03 Giỏ hàng & Checkout. */
export class CartPage extends BasePage {
  readonly path = "/lab/cart";

  readonly message = this.page.getByTestId("cart-message");
  readonly orderStatus = this.page.getByTestId("order-status");
  readonly cancelButton = this.page.getByRole("button", { name: "Huỷ đơn" });

  private product(id: string): Locator {
    return this.page.getByTestId(`product-${id}`);
  }

  async reset() {
    await this.page.getByTestId("reset-data").click();
  }

  /** Thêm sản phẩm vào giỏ `times` lần (lần đầu bấm Thêm, các lần sau bấm Tăng). */
  async add(productId: string, times = 1) {
    const card = this.product(productId);
    await card.getByRole("button", { name: "Thêm vào giỏ" }).click();
    for (let i = 1; i < times; i++) await card.getByRole("button", { name: /^Tăng/ }).click();
  }

  addButton(productId: string): Locator {
    return this.product(productId).getByRole("button", { name: "Thêm vào giỏ" });
  }

  async applyCoupon(code: string) {
    await this.page.getByLabel("Mã giảm giá").fill(code);
    await this.page.getByRole("button", { name: "Áp dụng" }).click();
  }

  /** Đọc số tiền hiển thị (ví dụ "-100.000đ") thành number. */
  async amount(id: AmountId): Promise<number> {
    return parseMoney(await this.page.getByTestId(id).innerText());
  }

  async placeOrder() {
    await this.page.getByRole("button", { name: "Đặt hàng" }).click();
  }

  /** Chuyển đơn sang trạng thái kế tiếp, ví dụ advanceTo("Đã thanh toán"). */
  async advanceTo(status: string) {
    await this.page.getByRole("button", { name: `Chuyển: ${status}` }).click();
  }
}
