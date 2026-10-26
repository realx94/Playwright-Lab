import { test, expect, type Page } from "@playwright/test";

// Đối chiếu độc lập: cùng công thức công khai trên trang lab.
const DAY = 86_400_000;
const ms = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const cell = (date: string, c: number) => {
  const d = Math.round((ms(date) - ms("2026-02-01")) / DAY);
  const orders = 10 + ((d * 7 + c * 3) % 13);
  return { orders, revenue: orders * ([500_000, 200_000, 300_000][c] + (d % 5) * 10_000) };
};
function expected(from: string, to: string, cats = [0, 1, 2]) {
  const days: { date: string; orders: number; revenue: number }[] = [];
  for (let t = ms(from); t <= ms(to); t += DAY) {
    const date = iso(t);
    days.push({ date, orders: cats.reduce((s, c) => s + cell(date, c).orders, 0), revenue: cats.reduce((s, c) => s + cell(date, c).revenue, 0) });
  }
  return days;
}
const money = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`;

async function open(page: Page, query = "") {
  await page.goto("/lab/dashboard" + query);
  await expect(page.getByTestId("kpi-revenue")).toBeVisible();
}

async function setRange(page: Page, from: string, to: string) {
  await page.getByLabel("Từ ngày").fill(from);
  await page.getByLabel("Đến ngày").fill(to);
}

test("KPI mặc định (7 ngày cuối) khớp công thức, kể cả tăng trưởng so với kỳ trước", async ({ page }) => {
  await open(page);
  const cur = expected("2026-03-25", "2026-03-31");
  const prev = expected("2026-03-18", "2026-03-24");
  const revenue = cur.reduce((s, d) => s + d.revenue, 0);
  const orders = cur.reduce((s, d) => s + d.orders, 0);
  const prevRevenue = prev.reduce((s, d) => s + d.revenue, 0);
  const growth = ((revenue - prevRevenue) / prevRevenue) * 100;

  await expect(page.getByTestId("kpi-revenue")).toHaveText(money(revenue));
  await expect(page.getByTestId("kpi-orders")).toHaveText(String(orders));
  await expect(page.getByTestId("kpi-average")).toHaveText(money(Math.round(revenue / orders)));
  await expect(page.getByTestId("kpi-growth")).toHaveText(`${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`);
});

test("lọc theo danh mục đổi số liệu và tiêu đề biểu đồ", async ({ page }) => {
  await open(page);
  await page.getByLabel("Danh mục").selectOption("dien-tu");
  const cur = expected("2026-03-25", "2026-03-31", [0]);
  await expect(page.getByTestId("kpi-revenue")).toHaveText(money(cur.reduce((s, d) => s + d.revenue, 0)));
  await expect(page.getByTestId("chart-title")).toHaveText("Doanh thu theo ngày · Điện tử · 2026-03-25 đến 2026-03-31");
  await expect(page.getByRole("img", { name: "Biểu đồ cột doanh thu Điện tử" })).toBeVisible();
});

test("biểu đồ nhất quán với số liệu: số cột, tổng giá trị, tỷ lệ chiều cao và bảng", async ({ page }) => {
  await open(page);
  const days = expected("2026-03-25", "2026-03-31");
  const bars = page.getByTestId("bar");
  await expect(bars).toHaveCount(7);

  const values = await bars.evaluateAll((els) => els.map((e) => Number(e.getAttribute("data-value"))));
  expect(values).toEqual(days.map((d) => d.revenue));
  await expect(page.getByTestId("kpi-revenue")).toHaveText(money(values.reduce((a, b) => a + b, 0)));

  const heights = await bars.evaluateAll((els) => els.map((e) => Number(e.getAttribute("height"))));
  const max = Math.max(...values);
  heights.forEach((h, i) => expect(Math.abs(h - (values[i] / max) * 160)).toBeLessThanOrEqual(1));
  expect(Math.max(...heights)).toBe(160);

  await page.getByRole("button", { name: "Xem dạng bảng" }).click();
  await expect(page.getByTestId("chart-row")).toHaveCount(7);
  await expect(page.getByTestId("chart-row").first().locator("td")).toHaveText(["2026-03-25", String(days[0].orders), money(days[0].revenue)]);
});

test("nút đặt nhanh: 30 ngày có 30 cột, tháng 2 có 28 cột và không có kỳ trước", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "30 ngày cuối dữ liệu" }).click();
  await expect(page.getByLabel("Từ ngày")).toHaveValue("2026-03-02");
  await expect(page.getByTestId("bar")).toHaveCount(30);

  await page.getByRole("button", { name: "Tháng 2" }).click();
  await expect(page.getByTestId("bar")).toHaveCount(28);
  await expect(page.getByTestId("kpi-growth")).toHaveText("Không có dữ liệu kỳ trước");
});

test("kiểm tra khoảng ngày: đảo ngược, ngoài dữ liệu, biên 31 và 32 ngày", async ({ page }) => {
  await open(page);
  await setRange(page, "2026-03-10", "2026-03-01");
  await expect(page.getByTestId("range-error")).toHaveText("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc");
  await setRange(page, "2026-01-31", "2026-02-05");
  await expect(page.getByTestId("range-error")).toHaveText("Dữ liệu chỉ có từ 2026-02-01 đến 2026-03-31");
  await setRange(page, "2026-03-25", "2026-04-01");
  await expect(page.getByTestId("range-error")).toHaveText("Dữ liệu chỉ có từ 2026-02-01 đến 2026-03-31");

  await setRange(page, "2026-02-01", "2026-03-04"); // 32 ngày
  await expect(page.getByTestId("range-error")).toHaveText("Chọn tối đa 31 ngày");
  await expect(page.getByTestId("bar")).toHaveCount(0);

  await setRange(page, "2026-02-01", "2026-03-03"); // đúng 31 ngày
  await expect(page.getByTestId("range-error")).toHaveCount(0);
  await expect(page.getByTestId("bar")).toHaveCount(31);

  await setRange(page, "2026-03-15", "2026-03-15"); // một ngày
  await expect(page.getByTestId("bar")).toHaveCount(1);
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ page }) => {
  await open(page, "?bugs=BUG-01,BUG-02,BUG-03");
  await expect(page.getByTestId("bar")).toHaveCount(6); // BUG-03: mất ngày cuối
  const cur = expected("2026-03-25", "2026-03-30");
  const revenue = cur.reduce((s, d) => s + d.revenue, 0);
  await expect(page.getByTestId("kpi-average")).toHaveText(money(Math.round(revenue / 6))); // BUG-01: chia cho số ngày
  const full = expected("2026-03-25", "2026-03-31").reduce((s, d) => s + d.revenue, 0);
  await expect(page.getByTestId("kpi-revenue")).not.toHaveText(money(full));
  const prev = expected("2026-03-18", "2026-03-24").reduce((s, d) => s + d.revenue, 0);
  const wrong = ((revenue - prev) / revenue) * 100; // BUG-02: mẫu số sai
  await expect(page.getByTestId("kpi-growth")).toHaveText(`${wrong >= 0 ? "+" : ""}${wrong.toFixed(1)}%`);
});
