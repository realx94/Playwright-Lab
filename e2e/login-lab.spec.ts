import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByTestId("reset-data").click();
});

test("đăng nhập hợp lệ", async ({ page }) => {
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Passw0rd!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByTestId("dashboard")).toBeVisible();
});

test("mật khẩu 7 ký tự bị từ chối (BVA)", async ({ page }) => {
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Pass0r!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByTestId("password-error")).toContainText("tối thiểu 8");
});

test("khoá tài khoản sau 5 lần sai", async ({ page }) => {
  for (let i = 0; i < 5; i++) {
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByLabel("Mật khẩu").fill("Wrong123!");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
  }
  await expect(page.getByTestId("form-error")).toContainText("bị khoá");
});

test("BUG-01 cho phép mật khẩu 7 ký tự", async ({ page }) => {
  await page.goto("/lab/login?bugs=BUG-01");
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Pass0r!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByTestId("password-error")).toHaveCount(0);
});

for (const email of ["user@lab..dev", "us..er@lab.dev", ".user@lab.dev", "user.@lab.dev"]) {
  test(`email có dấu chấm sai vị trí bị từ chối: ${email}`, async ({ page }) => {
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mật khẩu").fill("Passw0rd!");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.getByTestId("email-error")).toHaveText("Email không hợp lệ");
  });
}
