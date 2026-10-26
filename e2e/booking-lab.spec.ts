import { test, expect, type BrowserContext, type Page } from "@playwright/test";

const T0 = new Date("2026-03-01T10:00:00Z");
const seat = (page: Page, s: string) => page.getByTestId(`seat-${s}`);

async function open(page: Page, query = "") {
  await page.goto("/lab/booking" + query);
  await page.getByTestId("reset-data").click();
}

async function pick(page: Page, ...seats: string[]) {
  for (const s of seats) await seat(page, s).click();
}

const later = (context: BrowserContext, seconds: number) => context.clock.setFixedTime(new Date(T0.getTime() + seconds * 1000));

test("đặt vé: chọn ghế thường và VIP, giữ chỗ, thanh toán, mã vé", async ({ page, context }) => {
  await context.clock.setFixedTime(T0);
  await open(page);
  await expect(seat(page, "A1")).toBeDisabled(); // đã bán
  await expect(seat(page, "A1")).toHaveAttribute("data-state", "booked");

  await pick(page, "B1", "D2");
  await expect(seat(page, "B1")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("chosen")).toHaveText("Ghế đã chọn: B1, D2");
  await expect(page.getByTestId("total")).toHaveText("Tổng: 200.000 ₫"); // 80.000 + 120.000

  await page.getByRole("button", { name: "Giữ chỗ" }).click();
  await expect(page.getByTestId("hold-countdown")).toHaveText("Giữ chỗ còn 05:00");
  await page.getByRole("button", { name: "Thanh toán" }).click();
  await expect(page.getByTestId("booking-message")).toHaveText("Đặt vé thành công");
  await expect(page.getByTestId("ticket-code")).toHaveText("Mã vé: VE0001");
  await expect(seat(page, "B1")).toHaveAttribute("data-state", "booked");

  await page.reload();
  await expect(seat(page, "D2")).toHaveAttribute("data-state", "booked");
});

test("bỏ chọn ghế, giữ chỗ cần ít nhất một ghế, tối đa 6 ghế", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Giữ chỗ" }).click();
  await expect(page.getByTestId("booking-message")).toHaveText("Hãy chọn ít nhất một ghế");

  await pick(page, "B1", "B1");
  await expect(page.getByTestId("chosen")).toHaveText("Ghế đã chọn: chưa có");

  await pick(page, "B1", "B2", "B3", "B4", "B5", "B6");
  await expect(page.getByTestId("total")).toHaveText("Tổng: 480.000 ₫");
  await seat(page, "C1").click();
  await expect(page.getByTestId("booking-message")).toHaveText("Tối đa 6 ghế mỗi lần đặt");
  await expect(seat(page, "C1")).toHaveAttribute("data-state", "free");
});

test("giữ chỗ đếm ngược theo đồng hồ; còn hiệu lực ở giây 300, hết hạn ở giây 301", async ({ page, context }) => {
  await context.clock.setFixedTime(T0);
  await open(page);
  await pick(page, "C1");
  await page.getByRole("button", { name: "Giữ chỗ" }).click();
  await later(context, 120);
  await expect(page.getByTestId("hold-countdown")).toHaveText("Giữ chỗ còn 03:00");

  await later(context, 300);
  await page.getByRole("button", { name: "Thanh toán" }).click();
  await expect(page.getByTestId("booking-message")).toHaveText("Đặt vé thành công");

  await pick(page, "C2");
  await page.getByRole("button", { name: "Giữ chỗ" }).click();
  await later(context, 601); // 301 giây sau lần giữ thứ hai (giữ lúc +300)
  await page.getByRole("button", { name: "Thanh toán" }).click();
  await expect(page.getByTestId("booking-message")).toHaveText("Hết thời gian giữ chỗ, ghế đã được nhả");
  await expect(seat(page, "C2")).toHaveAttribute("data-state", "free");
});

test("hai người tranh một ghế ở hai tab", async ({ page, context }) => {
  await context.clock.setFixedTime(T0);
  await open(page);
  const other = await context.newPage();
  await other.goto("/lab/booking");

  await pick(other, "C1"); // người B đã chọn C1 nhưng chưa giữ
  await pick(page, "C1");
  await page.getByRole("button", { name: "Giữ chỗ" }).click(); // người A giữ trước
  await expect(seat(other, "C1")).toHaveAttribute("data-state", "held");

  await other.getByRole("button", { name: "Giữ chỗ" }).click();
  await expect(other.getByTestId("booking-message")).toHaveText("Ghế C1 vừa được người khác giữ hoặc đặt");

  await expect(seat(other, "C2")).toBeEnabled();
  await page.getByRole("button", { name: "Huỷ giữ chỗ" }).click();
  await expect(seat(other, "C1")).toHaveAttribute("data-state", "free");
});

test("ghế bị giữ tự nhả khi hết 5 phút", async ({ page, context }) => {
  await context.clock.setFixedTime(T0);
  await open(page);
  const other = await context.newPage();
  await other.goto("/lab/booking");
  await pick(page, "C1");
  await page.getByRole("button", { name: "Giữ chỗ" }).click();
  await expect(seat(other, "C1")).toHaveAttribute("data-state", "held");

  await later(context, 301);
  await expect(seat(other, "C1")).toHaveAttribute("data-state", "free");
});

test("suất chiếu gần hết vé: bán hết hai ghế cuối thì báo hết vé; mỗi suất độc lập", async ({ page }) => {
  await open(page);
  await page.getByLabel("Suất chiếu").selectOption("s3");
  await expect(page.getByTestId("sold-out")).toHaveCount(0);
  await pick(page, "E5", "E6");
  await page.getByRole("button", { name: "Giữ chỗ" }).click();
  await page.getByRole("button", { name: "Thanh toán" }).click();
  await expect(page.getByTestId("sold-out")).toHaveText("Suất chiếu đã hết vé");

  await page.getByLabel("Suất chiếu").selectOption("s1");
  await expect(page.getByTestId("sold-out")).toHaveCount(0);
  await expect(seat(page, "E5")).toHaveAttribute("data-state", "free"); // suất 10:00 độc lập
  await page.getByLabel("Suất chiếu").selectOption("s2");
  await expect(seat(page, "B3")).toHaveAttribute("data-state", "booked");
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ page, context }) => {
  await context.clock.setFixedTime(T0);
  await open(page, "?bugs=BUG-01,BUG-02,BUG-03");
  await pick(page, "B1", "D2");
  await expect(page.getByTestId("total")).toHaveText("Tổng: 160.000 ₫"); // BUG-01: ghế VIP tính giá thường

  await page.getByRole("button", { name: "Giữ chỗ" }).click();
  await later(context, 600);
  await page.getByRole("button", { name: "Thanh toán" }).click();
  await expect(page.getByTestId("booking-message")).toHaveText("Đặt vé thành công"); // BUG-02: quá hạn vẫn thanh toán được

  await pick(page, "C1", "C2", "C4", "C5", "C6", "D1", "D3");
  await expect(page.getByTestId("chosen")).toHaveText("Ghế đã chọn: C1, C2, C4, C5, C6, D1, D3"); // BUG-03: được 7 ghế
});
