import { test, expect, type Page } from "@playwright/test";

const num = async (page: Page, id: string) =>
  Number((await page.getByTestId(id).innerText()).replace(/[^\d-]/g, ""));

async function addProduct(page: Page, id: string, times = 1) {
  const card = page.getByTestId(`product-${id}`);
  await card.getByRole("button", { name: "Thêm vào giỏ" }).click();
  for (let i = 1; i < times; i++) await card.getByRole("button", { name: /^Tăng/ }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/cart");
  await page.getByTestId("reset-data").click();
});

test("sản phẩm hết hàng không thêm được", async ({ page }) => {
  await expect(page.getByTestId("product-p4").getByRole("button", { name: "Thêm vào giỏ" })).toBeDisabled();
});

test("đơn < 1tr tính ship 30.000 và VAT 8%", async ({ page }) => {
  await addProduct(page, "p2"); // 250.000
  expect(await num(page, "shipping")).toBe(30_000);
  expect(await num(page, "vat")).toBe(20_000);
  expect(await num(page, "total")).toBe(300_000);
});

test("SALE10 BVA quanh ngưỡng 500.000", async ({ page }) => {
  await addProduct(page, "p2", 2); // đúng 500.000
  await page.getByLabel("Mã giảm giá").fill("SALE10");
  await page.getByRole("button", { name: "Áp dụng" }).click();
  expect(await num(page, "discount")).toBe(-50_000);
});

test("SALE10 bị từ chối khi dưới tối thiểu", async ({ page }) => {
  await addProduct(page, "p2"); // 250.000
  await page.getByLabel("Mã giảm giá").fill("SALE10");
  await page.getByRole("button", { name: "Áp dụng" }).click();
  await expect(page.getByTestId("cart-message")).toContainText("tối thiểu");
});

test("giảm giá bị chặn ở 100.000", async ({ page }) => {
  await addProduct(page, "p3"); // 3.200.000 → 10% = 320.000 → trần 100.000
  await page.getByLabel("Mã giảm giá").fill("SALE10");
  await page.getByRole("button", { name: "Áp dụng" }).click();
  expect(await num(page, "discount")).toBe(-100_000);
  expect(await num(page, "shipping")).toBe(0);
});

test("BUG-02 làm lộ giảm giá vượt trần", async ({ page }) => {
  await page.goto("/lab/cart?bugs=BUG-02");
  await addProduct(page, "p3");
  await page.getByLabel("Mã giảm giá").fill("SALE10");
  await page.getByRole("button", { name: "Áp dụng" }).click();
  expect(await num(page, "discount")).toBe(-320_000);
});

test("vòng đời đơn và huỷ khi đang giao bị chặn", async ({ page }) => {
  await addProduct(page, "p2");
  await page.getByRole("button", { name: "Đặt hàng" }).click();
  const status = page.getByTestId("order-status");
  await expect(status).toHaveText("Mới");
  await page.getByRole("button", { name: /Chuyển: Đã thanh toán/ }).click();
  await page.getByRole("button", { name: /Chuyển: Đang giao/ }).click();
  await expect(status).toHaveText("Đang giao");
  await expect(page.getByRole("button", { name: "Huỷ đơn" })).toHaveCount(0);
});

test("BUG-03 cho phép huỷ đơn đang giao", async ({ page }) => {
  await page.goto("/lab/cart?bugs=BUG-03");
  await addProduct(page, "p2");
  await page.getByRole("button", { name: "Đặt hàng" }).click();
  await page.getByRole("button", { name: /Chuyển: Đã thanh toán/ }).click();
  await page.getByRole("button", { name: /Chuyển: Đang giao/ }).click();
  await expect(page.getByRole("button", { name: "Huỷ đơn" })).toBeVisible();
});
