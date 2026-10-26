import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/forms");
});

test("submit trống hiện lỗi bắt buộc", async ({ page }) => {
  await page.getByRole("button", { name: "Gửi" }).click();
  await expect(page.getByTestId("name-error")).toBeVisible();
  await expect(page.getByTestId("terms-error")).toBeVisible();
});

test("tuổi ngoài khoảng 18–65 bị từ chối (BVA)", async ({ page }) => {
  for (const [age, ok] of [
    ["17", false],
    ["18", true],
    ["65", true],
    ["66", false],
  ] as const) {
    await page.getByLabel("Tuổi").fill(age);
    await page.getByRole("button", { name: "Gửi" }).click();
    await expect(page.getByTestId("age-error")).toHaveCount(ok ? 0 : 1);
  }
});

test("điền đủ form và gửi thành công", async ({ page }) => {
  await page.getByLabel("Họ tên").fill("Nguyễn Văn A");
  await page.getByLabel("Email").fill("a@lab.dev");
  await page.getByLabel("Tuổi").fill("30");
  await page.getByRole("radio", { name: "Nam" }).click();
  await page.getByRole("checkbox", { name: "Đọc sách" }).check();
  await page.getByLabel("Quốc gia (select native)").selectOption("vn");
  await page.getByTestId("city").click();
  await page.getByRole("option", { name: "Đà Nẵng" }).click();
  await page.getByRole("switch", { name: "Nhận bản tin" }).click();
  await page.getByRole("checkbox", { name: "Tôi đồng ý điều khoản" }).check();
  await page.getByRole("button", { name: "Gửi" }).click();
  const result = page.getByTestId("result");
  await expect(result).toContainText('"country": "vn"');
  await expect(result).toContainText('"city": "Đà Nẵng"');
  await expect(result).toContainText('"newsletter": true');
});

test("upload sai định dạng bị từ chối", async ({ page }) => {
  await page.getByLabel(/Tệp đính kèm/).setInputFiles({
    name: "a.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("x"),
  });
  await page.getByRole("button", { name: "Gửi" }).click();
  await expect(page.getByTestId("file-error")).toContainText("png, jpg, pdf");
});
