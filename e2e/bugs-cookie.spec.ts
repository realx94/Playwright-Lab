import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3100";

test.describe("bug bật bằng cookie lab_bugs", () => {
  test.use({
    storageState: {
      cookies: [
        { name: "lab_bugs", value: "BUG-01", domain: "localhost", path: "/", expires: -1, httpOnly: false, secure: false, sameSite: "Lax" },
      ],
      origins: [],
    },
  });

  test("giao diện: BUG-01 của LAB-01 cho phép mật khẩu 7 ký tự dù URL không có ?bugs", async ({ page }) => {
    await page.goto("/lab/login");
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByLabel("Mật khẩu").fill("Pass0r!");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.getByTestId("password-error")).toHaveCount(0);
  });

  test("API: cookie cũng được server đọc (BUG-01 lệch phân trang)", async ({ request }) => {
    const body = await (await request.get(BASE + "/api/lab/books?pageSize=5")).json();
    // BUG-01 của LAB-14 bỏ qua phần tử đầu tiên của mỗi trang
    expect(body.data[0].id).toBe("b-2");
  });
});

test("không có cookie thì lab chạy bình thường", async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Pass0r!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByTestId("password-error")).toContainText("tối thiểu 8");
});
