import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/playground");
});

test("confirm: đồng ý và huỷ", async ({ page }) => {
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Hiện confirm" }).click();
  await expect(page.getByTestId("confirm-result")).toHaveText("Đồng ý");

  page.once("dialog", (d) => d.dismiss());
  await page.getByRole("button", { name: "Hiện confirm" }).click();
  await expect(page.getByTestId("confirm-result")).toHaveText("Huỷ");
});

test("prompt nhận giá trị nhập", async ({ page }) => {
  page.once("dialog", (d) => d.accept("Lan"));
  await page.getByRole("button", { name: "Hiện prompt" }).click();
  await expect(page.getByTestId("prompt-result")).toHaveText("Lan");
});

test("liên kết trợ giúp mở ở tab mới", async ({ page, context }) => {
  const [popup] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("link", { name: "Mở trang trợ giúp" }).click(),
  ]);
  await expect(popup.getByRole("heading", { name: "Trang trợ giúp" })).toBeVisible();
});

test("iframe thanh toán: biên 11 và 12 chữ số", async ({ page }) => {
  const frame = page.frameLocator('[data-testid="payment-frame"]');
  for (const [card, msg] of [
    ["12345678901", "Số thẻ không hợp lệ"],
    ["123456789012", "Thanh toán thành công"],
  ]) {
    await frame.getByLabel("Số thẻ").fill(card);
    await frame.getByRole("button", { name: "Thanh toán" }).click();
    await expect(frame.getByRole("status")).toHaveText(msg);
  }
});

test("shadow DOM, kéo thả, tải xuống", async ({ page }) => {
  await page.getByRole("button", { name: "Bấm trong shadow" }).click();
  await expect(page.getByText("Đã bấm trong shadow DOM")).toBeVisible();

  await page.getByTestId("drag-item").dragTo(page.getByTestId("drop-zone"));
  await expect(page.getByTestId("drop-result")).toHaveText("Thẻ A");

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Tải tệp ghi chú" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("ghi-chu.txt");
});

test("nội dung tải trễ theo tham số delay", async ({ page }) => {
  await page.goto("/lab/playground?delay=1200");
  await page.getByRole("button", { name: "Tải dữ liệu" }).click();
  await expect(page.getByTestId("delay-result")).toHaveCount(0);
  await expect(page.getByTestId("delay-result")).toBeVisible({ timeout: 5000 });
});

test("cuộn vô hạn dừng ở 60 mục", async ({ page }) => {
  const list = page.getByTestId("scroll-list");
  const count = page.getByTestId("scroll-count");
  await expect(count).toHaveText("20");
  await list.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await expect(count).toHaveText("40");
  await list.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await expect(count).toHaveText("60");
  await list.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await expect(count).toHaveText("60");
});
