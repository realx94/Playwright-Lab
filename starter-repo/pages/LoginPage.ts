import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/** Page Object cho LAB-01 Login. Locator khai báo một chỗ, test chỉ gọi hành động nghiệp vụ. */
export class LoginPage extends BasePage {
  readonly path = "/lab/login";

  private readonly email = this.page.getByLabel("Email");
  private readonly password = this.page.getByLabel("Mật khẩu");
  private readonly submitButton = this.page.getByRole("button", { name: "Đăng nhập" });
  readonly dashboard = this.page.getByTestId("dashboard");
  readonly emailError = this.page.getByTestId("email-error");
  readonly passwordError = this.page.getByTestId("password-error");
  readonly formError = this.page.getByTestId("form-error");

  async reset() {
    await this.page.getByTestId("reset-data").click();
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submitButton.click();
  }

  async expectLoggedIn() {
    await expect(this.dashboard).toBeVisible();
  }
}
