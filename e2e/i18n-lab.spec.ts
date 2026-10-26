import { test, expect, type Page } from "@playwright/test";

async function open(page: Page, query = "") {
  await page.goto("/lab/i18n" + query);
  await expect(page.getByTestId("store-title")).toBeVisible();
}

test.describe("trình duyệt tiếng Việt", () => {
  test.use({ locale: "vi-VN", viewport: { width: 1024, height: 768 } });

  test("mặc định tiếng Việt: chuỗi, thẻ html lang và định dạng số, tiền, ngày", async ({ page }) => {
    await open(page);
    await expect(page.getByTestId("store-title")).toHaveText("Cửa hàng mẫu");
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await expect(page.getByTestId("product-row").nth(1)).toContainText("1.250.000 ₫");
    await expect(page.getByTestId("big-number")).toHaveText("Số liệu thống kê: 1.234.567,891");
    await expect(page.getByTestId("date-short")).toHaveText("Cập nhật lần cuối: 8/3/26");
    await expect(page.getByTestId("date-long")).toHaveText("Chủ Nhật, 8 tháng 3, 2026");
    await expect(page.getByTestId("cart-count")).toHaveText("1 mục");
  });

  test("chọn English: đổi chuỗi và định dạng, ghi nhớ sau khi tải lại", async ({ page }) => {
    await open(page);
    await page.getByLabel("Ngôn ngữ").selectOption("en");
    await expect(page.getByTestId("store-title")).toHaveText("Sample store");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByTestId("product-row").nth(1)).toContainText("₫1,250,000");
    await expect(page.getByTestId("big-number")).toHaveText("Statistics: 1,234,567.891");
    await expect(page.getByTestId("date-long")).toHaveText("Sunday, March 8, 2026");

    await page.reload();
    await expect(page.getByTestId("store-title")).toHaveText("Sample store"); // lựa chọn thủ công thắng ngôn ngữ trình duyệt
  });

  test("số nhiều theo ngôn ngữ", async ({ page }) => {
    await open(page);
    await page.getByRole("button", { name: "Tăng số lượng" }).click();
    await expect(page.getByTestId("cart-count")).toHaveText("2 mục");
    await expect(page.getByTestId("cart-total")).toContainText("398.000 ₫");

    await page.getByLabel("Ngôn ngữ").selectOption("en");
    await expect(page.getByTestId("cart-count")).toHaveText("2 items");
    await page.getByRole("button", { name: "Decrease quantity" }).click();
    await expect(page.getByTestId("cart-count")).toHaveText("1 item");
  });
});

test.describe("trình duyệt tiếng Anh", () => {
  test.use({ locale: "en-US", viewport: { width: 1024, height: 768 } });

  test("mặc định tiếng Anh theo navigator.language", async ({ page }) => {
    await open(page);
    await expect(page.getByTestId("store-title")).toHaveText("Sample store");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByTestId("date-short")).toHaveText("Last updated: 3/8/26");
  });

  test("ngôn ngữ khác tiếng Việt đều rơi về English", async ({ browser }) => {
    const ctx = await browser.newContext({ locale: "fr-FR" });
    const page = await ctx.newPage();
    await open(page);
    await expect(page.getByTestId("store-title")).toHaveText("Sample store");
    await ctx.close();
  });
});

test.describe("responsive", () => {
  test.use({ locale: "vi-VN" });

  test("màn hình rộng (640 px): thanh điều hướng hiện đủ, bảng, không có nút menu", async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 800 });
    await open(page);
    await expect(page.getByTestId("menu-button")).toBeHidden();
    await expect(page.getByTestId("store-nav")).toBeVisible();
    await expect(page.getByTestId("product-table")).toBeVisible();
    await expect(page.getByTestId("product-cards")).toBeHidden();
  });

  test("màn hình hẹp (639 px): menu thu gọn, mở được; sản phẩm dạng thẻ", async ({ page }) => {
    await page.setViewportSize({ width: 639, height: 800 });
    await open(page);
    const button = page.getByTestId("menu-button");
    await expect(button).toBeVisible();
    await expect(page.getByTestId("store-nav")).toBeHidden();
    await expect(button).toHaveAttribute("aria-expanded", "false");

    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(button).toHaveText("Đóng menu");
    await expect(page.getByRole("link", { name: "Liên hệ" })).toBeVisible();

    await expect(page.getByTestId("product-table")).toBeHidden();
    await expect(page.getByTestId("product-card")).toHaveCount(3);
    await expect(page.getByTestId("product-card").first()).toContainText("199.000 ₫");
  });

  test("điện thoại 320 px: không cuộn ngang", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await open(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("bug", () => {
  test.use({ locale: "en-US", viewport: { width: 1024, height: 768 } });

  test("BUG-01: ngôn ngữ trình duyệt bị bỏ qua", async ({ page }) => {
    await open(page, "?bugs=BUG-01");
    await expect(page.getByTestId("store-title")).toHaveText("Cửa hàng mẫu");
  });

  test("BUG-02: ngày không theo định dạng của ngôn ngữ đang chọn", async ({ page }) => {
    await open(page, "?bugs=BUG-02");
    await expect(page.getByTestId("store-title")).toHaveText("Sample store");
    await expect(page.getByTestId("date-long")).toHaveText("Chủ Nhật, 8 tháng 3, 2026");
  });

  test("BUG-03: màn hình hẹp bị cuộn ngang", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await open(page, "?bugs=BUG-03");
    // bảng ẩn ở màn hình hẹp nên bug hiển thị ở điểm gãy 640 px
    await page.setViewportSize({ width: 640, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeGreaterThan(0);
  });
});
