import { test, expect, type Page } from "@playwright/test";

const times = (page: Page) => page.getByTestId("slot-time").allInnerTexts();
const slot = (page: Page, utc: string) => page.locator(`[data-utc="${utc}"]`);

async function open(page: Page, query = "") {
  await page.goto("/lab/timezone" + query);
  await page.getByTestId("reset-data").click();
  await expect(page.getByTestId("slot")).toHaveCount(12);
}

test.describe("trình duyệt ở Việt Nam", () => {
  test.use({ timezoneId: "Asia/Ho_Chi_Minh" });

  test("tự động dùng múi giờ trình duyệt (UTC+7)", async ({ page }) => {
    await open(page);
    await expect(page.getByTestId("tz-current")).toContainText("Asia/Ho_Chi_Minh");
    expect(await times(page)).toEqual(["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]);
  });

  test("chọn múi giờ khác thì giờ hiển thị đổi theo, giờ UTC giữ nguyên", async ({ page }) => {
    await open(page);
    await page.getByLabel("Múi giờ hiển thị").selectOption("America/New_York");
    await expect(page.getByTestId("slot-time").first()).toHaveText("20:00"); // 01:00 UTC = 20:00 EST
    await expect(page.getByTestId("slot").first()).toHaveAttribute("data-utc", "2026-03-01T01:00:00.000Z");
  });

  test("xác nhận đặt lịch hiển thị cả giờ địa phương và UTC", async ({ page, context }) => {
    await context.clock.setFixedTime(new Date("2026-03-01T04:00:00Z"));
    await open(page);
    await page.getByRole("button", { name: "Đặt 14:00" }).click();
    await expect(page.getByTestId("booking-confirm")).toHaveText("Đã đặt lịch: 14:00 (Asia/Ho_Chi_Minh) · UTC 07:00");
  });
});

test.describe("trình duyệt ở New York", () => {
  test.use({ timezoneId: "America/New_York" });

  test("ngày thường: giờ liên tục", async ({ page }) => {
    await open(page);
    const t = await times(page);
    expect(t[0]).toBe("20:00");
    expect(t).toContain("02:00");
  });

  test("ngày chuyển giờ mùa hè 2026-03-08: không có khung 02:00", async ({ page }) => {
    await open(page);
    await page.getByLabel("Ngày (UTC)").selectOption("2026-03-08");
    expect(await times(page)).toEqual(["20:00", "21:00", "22:00", "23:00", "00:00", "01:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00"]);
  });
});

test.describe("đồng hồ giả", () => {
  test.use({ timezoneId: "UTC" });

  test("khung giờ đã qua và đóng đặt trước 2 giờ (biên đúng 2 giờ)", async ({ page, context }) => {
    await context.clock.setFixedTime(new Date("2026-03-01T04:00:00Z"));
    await open(page);
    for (const h of ["01", "02", "03", "04"]) await expect(slot(page, `2026-03-01T${h}:00:00.000Z`).getByTestId("slot-state")).toHaveText("Đã qua");
    await expect(slot(page, "2026-03-01T05:00:00.000Z").getByTestId("slot-state")).toHaveText("Đã đóng đặt");
    // đúng 2 giờ: vẫn đặt được
    await expect(slot(page, "2026-03-01T06:00:00.000Z").getByRole("button", { name: "Đặt 06:00" })).toBeVisible();

    await context.clock.setFixedTime(new Date("2026-03-01T04:00:01Z"));
    await expect(slot(page, "2026-03-01T06:00:00.000Z").getByTestId("slot-state")).toHaveText("Đã đóng đặt");
  });

  test("đặt lịch, đếm ngược theo đồng hồ, giữ sau khi tải lại và huỷ", async ({ page, context }) => {
    await context.clock.setFixedTime(new Date("2026-03-01T04:00:00Z"));
    await open(page);
    await page.getByRole("button", { name: "Đặt 07:00" }).click();
    await expect(page.getByTestId("booking-countdown")).toHaveText("Còn 3 giờ 0 phút");
    await expect(slot(page, "2026-03-01T08:00:00.000Z").getByTestId("slot-state")).toHaveText("Bạn đã có lịch");

    await context.clock.setFixedTime(new Date("2026-03-01T04:30:00Z"));
    await expect(page.getByTestId("booking-countdown")).toHaveText("Còn 2 giờ 30 phút");

    await page.reload();
    await expect(page.getByTestId("booking-confirm")).toContainText("07:00");
    await page.getByRole("button", { name: "Huỷ lịch hẹn" }).click();
    await expect(page.getByTestId("booking-confirm")).toHaveCount(0);
  });
});

test.describe("bug", () => {
  test.use({ timezoneId: "Asia/Ho_Chi_Minh" });

  test("BUG-01: chọn múi giờ nhưng giờ hiển thị không đổi", async ({ page }) => {
    await open(page, "?bugs=BUG-01");
    await page.getByLabel("Múi giờ hiển thị").selectOption("America/New_York");
    await expect(page.getByTestId("slot-time").first()).toHaveText("08:00");
  });

  test("BUG-02: đặt được khung giờ đã qua", async ({ page, context }) => {
    await context.clock.setFixedTime(new Date("2026-03-01T10:00:00Z"));
    await open(page, "?bugs=BUG-02");
    await expect(page.getByRole("button", { name: "Đặt 08:00" })).toBeVisible();
  });

  test("BUG-03: giờ sai sau thời điểm chuyển giờ mùa hè", async ({ page }) => {
    await open(page, "?bugs=BUG-03");
    await page.getByLabel("Múi giờ hiển thị").selectOption("America/New_York");
    await page.getByLabel("Ngày (UTC)").selectOption("2026-03-08");
    expect(await times(page)).toContain("02:00"); // đúng ra ngày này không có 02:00
  });
});
