import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/labs");
});

test("xếp theo độ khó rồi theo mã lab, chia nhóm Dễ / Vừa / Khó", async ({ page }) => {
  await expect(page.getByTestId("lab-count")).toHaveText("Hiển thị 28/28 lab");
  await expect(page.getByRole("heading", { level: 2, name: /^Dễ/ })).toBeVisible();
  const headings = await page.getByRole("region", { name: /^Lab mức/ }).getByRole("heading", { level: 2 }).allInnerTexts();
  expect(headings.map((h) => h.split(" ")[0])).toEqual(["Dễ", "Vừa", "Khó"]);

  const cards = page.getByTestId("lab-card");
  await expect(cards).toHaveCount(28);
  const info = await cards.evaluateAll((els) =>
    els.map((el) => ({
      id: /LAB-(\d+)/.exec(el.textContent ?? "")![1],
      stars: (/Độ khó: (★*)/.exec(el.textContent ?? "")![1] ?? "").length,
    })),
  );
  for (let i = 1; i < info.length; i++) {
    const a = info[i - 1];
    const b = info[i];
    expect(a.stars < b.stars || (a.stars === b.stars && Number(a.id) < Number(b.id)), `${a.id} rồi ${b.id}`).toBe(true);
  }
  expect(info[0].id).toBe("01"); // lab đầu tiên là Login
});

test("lọc theo độ khó, chọn nhiều mức", async ({ page }) => {
  await page.getByRole("button", { name: /^Dễ/ }).click();
  await expect(page.getByRole("button", { name: /^Dễ/ })).toHaveAttribute("aria-pressed", "true");
  const easy = await page.getByTestId("lab-card").count();
  await expect(page.getByTestId("lab-count")).toHaveText(`Hiển thị ${easy}/28 lab`);
  await expect(page.getByRole("heading", { level: 2, name: /^Khó/ })).toHaveCount(0);

  await page.getByRole("button", { name: /^Khó/ }).click();
  expect(await page.getByTestId("lab-card").count()).toBeGreaterThan(easy);
  await expect(page.getByRole("heading", { level: 2, name: /^Vừa/ })).toHaveCount(0);
});

test("lọc theo domain", async ({ page }) => {
  await page.getByRole("button", { name: "Payment" }).click();
  await expect(page.getByTestId("lab-card")).toHaveCount(1);
  await expect(page.getByTestId("lab-card")).toContainText("Thanh toán thẻ");
});

test("tìm theo kỹ năng, không phân biệt hoa thường và dấu", async ({ page }) => {
  await page.getByLabel("Tìm theo tên hoặc kỹ năng").fill("IFRAME");
  await expect(page.getByTestId("lab-card").first()).toContainText("Tình huống khó");
  await page.getByLabel("Tìm theo tên hoặc kỹ năng").fill("dang ky");
  await expect(page.getByTestId("lab-card").first()).toContainText("Login");
});

test("kết hợp bộ lọc, không có kết quả và xoá bộ lọc", async ({ page }) => {
  await page.getByRole("button", { name: /^Dễ/ }).click();
  await page.getByLabel("Tìm theo tên hoặc kỹ năng").fill("webhook");
  await expect(page.getByTestId("lab-empty")).toBeVisible();
  await expect(page.getByTestId("lab-count")).toHaveText("Hiển thị 0/28 lab");

  await page.getByRole("button", { name: "Xoá bộ lọc" }).click();
  await expect(page.getByTestId("lab-count")).toHaveText("Hiển thị 28/28 lab");
  await expect(page.getByRole("button", { name: "Xoá bộ lọc" })).toBeDisabled();
});

test("bấm một thẻ mở trang mô tả lab", async ({ page }) => {
  await page.getByTestId("lab-card").first().click();
  await expect(page).toHaveURL(/\/labs\/login$/);
});
