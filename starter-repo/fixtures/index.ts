import { test as base, expect } from "@playwright/test";
import { CartPage } from "../pages/CartPage";
import { LoginPage } from "../pages/LoginPage";

type Fixtures = {
  loginPage: LoginPage;
  cartPage: CartPage;
};

/**
 * Custom fixture: mỗi test nhận Page Object đã mở sẵn trang và reset dữ liệu lab,
 * nên test luôn bắt đầu từ trạng thái sạch và không phải lặp lại bước chuẩn bị.
 */
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.reset();
    await use(loginPage);
  },
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.reset();
    await use(cartPage);
  },
});

export { expect };
