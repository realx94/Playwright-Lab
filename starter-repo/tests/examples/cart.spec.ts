import { test, expect } from "../../fixtures";

test.describe("LAB-03 Giỏ hàng (ví dụ)", () => {
  test("sản phẩm hết hàng không thêm được", async ({ cartPage }) => {
    await expect(cartPage.addButton("p4")).toBeDisabled();
  });

  test("giảm giá SALE10 bị chặn trần 100.000đ", async ({ cartPage }) => {
    await cartPage.add("p3"); // 3.200.000đ → 10% = 320.000đ nhưng tối đa 100.000đ
    await cartPage.applyCoupon("SALE10");
    expect(await cartPage.amount("discount")).toBe(-100_000);
  });
});
