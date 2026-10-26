import { test, expect } from "../../fixtures";

// Ví dụ hoàn chỉnh: dùng fixture + Page Object. Đọc kỹ rồi tự viết lại theo cách của bạn.
test.describe("LAB-01 Login (ví dụ)", () => {
  test("đăng nhập hợp lệ", async ({ loginPage }) => {
    await loginPage.login("user@lab.dev", "Passw0rd!");
    await loginPage.expectLoggedIn();
  });

  test("mật khẩu 7 ký tự bị từ chối (biên)", async ({ loginPage }) => {
    await loginPage.login("user@lab.dev", "Pass0r!");
    await expect(loginPage.passwordError).toContainText("tối thiểu 8");
  });
});
