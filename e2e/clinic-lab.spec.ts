import { test, expect, type BrowserContext, type Page } from "@playwright/test";

const slot = (page: Page, t: string) => page.getByTestId(`slot-${t}`);
const at = (iso: string) => new Date(iso);

async function open(page: Page, context: BrowserContext, now = "2026-03-02T06:00:00Z", query = "") {
  await context.clock.setFixedTime(at(now));
  await page.goto("/lab/clinic" + query);
  await page.getByTestId("reset-data").click();
}

async function form(page: Page, f: { date?: string; doctor?: string; time?: string; name?: string; phone?: string; reason?: string } = {}) {
  if (f.doctor) await page.getByLabel("Bác sĩ").selectOption(f.doctor);
  await page.getByLabel("Ngày khám").fill(f.date ?? "2026-03-03");
  if (f.time) await slot(page, f.time).click();
  await page.getByLabel("Họ tên bệnh nhân").fill(f.name ?? "Lê Văn C");
  await page.getByLabel("Số điện thoại").fill(f.phone ?? "0901234567");
  if (f.reason !== undefined) await page.getByLabel("Lý do khám").fill(f.reason);
  await page.getByRole("button", { name: "Đặt lịch" }).click();
}

test("đặt lịch thành công: mã lịch, danh sách, khung giờ chuyển sang đã kín", async ({ page, context }) => {
  await open(page, context);
  await form(page, { time: "10:00", reason: "Đau đầu" });
  await expect(page.getByTestId("clinic-message")).toHaveText("Đặt lịch thành công. Mã lịch hẹn KH0001");
  await expect(page.getByTestId("appointment")).toHaveText(/KH0001 · BS\. Nguyễn An · 2026-03-03 10:00 · Lê Văn C/);
  await expect(slot(page, "10:00")).toHaveAttribute("data-state", "taken");
  await expect(slot(page, "10:00")).toBeDisabled();
});

test("lịch đã có sẵn: bác sĩ An kín 08:00 và 09:00, bác sĩ Bình kín cả ngày", async ({ page, context }) => {
  await open(page, context, "2026-03-02T00:00:00Z");
  await page.getByLabel("Ngày khám").fill("2026-03-02");
  await expect(slot(page, "08:00")).toHaveAttribute("data-state", "taken");
  await expect(slot(page, "09:00")).toHaveAttribute("data-state", "taken");
  await expect(slot(page, "08:30")).toHaveAttribute("data-state", "free");

  await page.getByLabel("Bác sĩ").selectOption("bs-binh");
  await expect(page.locator('[data-state="taken"]')).toHaveCount(12);
});

test("khung giờ phải cách bây giờ ít nhất 2 giờ (biên đúng 2 giờ)", async ({ page, context }) => {
  await open(page, context, "2026-03-03T06:00:00Z");
  await page.getByLabel("Ngày khám").fill("2026-03-03");
  await expect(slot(page, "08:00")).toHaveAttribute("data-state", "free"); // đúng 2 giờ

  await context.clock.setFixedTime(at("2026-03-03T06:00:01Z"));
  await expect(slot(page, "08:00")).toHaveAttribute("data-state", "late");
  await expect(slot(page, "08:30")).toHaveAttribute("data-state", "free");
  await expect(slot(page, "08:00")).toBeDisabled();
});

const dateRules: [string, string, string][] = [
  ["ngày đã qua", "2026-03-01", "Không thể đặt lịch cho ngày đã qua"],
  ["Chủ nhật", "2026-03-08", "Phòng khám nghỉ Chủ nhật"],
  ["quá 30 ngày", "2026-04-02", "Chỉ đặt trước tối đa 30 ngày"],
];
for (const [name, date, message] of dateRules) {
  test(`từ chối ngày: ${name}`, async ({ page, context }) => {
    await open(page, context);
    await form(page, { date });
    await expect(page.getByTestId("error-date")).toHaveText(message);
    await expect(page.getByTestId("appointment")).toHaveCount(0);
  });
}

test("đúng 30 ngày tới vẫn hợp lệ (biên)", async ({ page, context }) => {
  await open(page, context);
  await form(page, { date: "2026-04-01", time: "10:00" }); // 30 ngày sau 2026-03-02, là thứ tư
  await expect(page.getByTestId("clinic-message")).toContainText("Đặt lịch thành công");
});

test("kiểm tra họ tên, số điện thoại, lý do và khung giờ", async ({ page, context }) => {
  await open(page, context);
  await form(page, { name: "A", phone: "090123456", reason: "x".repeat(201) });
  await expect(page.getByTestId("error-name")).toHaveText("Họ tên từ 2 đến 50 ký tự");
  await expect(page.getByTestId("error-phone")).toHaveText("Số điện thoại gồm 10 chữ số, bắt đầu bằng 0");
  await expect(page.getByTestId("error-reason")).toHaveText("Lý do tối đa 200 ký tự");
  await expect(page.getByTestId("reason-count")).toHaveText("201/200");
  await expect(page.getByTestId("error-time")).toHaveText("Hãy chọn khung giờ");

  await form(page, { name: "B".repeat(51), phone: "1901234567", time: "10:00" });
  await expect(page.getByTestId("error-name")).toHaveText("Họ tên từ 2 đến 50 ký tự");
  await expect(page.getByTestId("error-phone")).toHaveText("Số điện thoại gồm 10 chữ số, bắt đầu bằng 0");

  await form(page, { name: "Bé", phone: "0901234567", time: "10:00", reason: "" }); // biên 2 ký tự
  await expect(page.getByTestId("clinic-message")).toContainText("Đặt lịch thành công");
});

test("huỷ lịch: đúng 24 giờ trước giờ khám được huỷ, quá một giây thì không", async ({ page, context }) => {
  await open(page, context, "2026-03-02T10:00:00Z");
  await form(page, { date: "2026-03-03", time: "10:00" });
  await expect(page.getByTestId("appointment")).toHaveCount(1);

  await context.clock.setFixedTime(at("2026-03-02T10:00:01Z"));
  await page.getByRole("button", { name: "Huỷ KH0001" }).click();
  await expect(page.getByTestId("clinic-message")).toHaveText("Không thể huỷ lịch trong vòng 24 giờ trước giờ khám");
  await expect(page.getByTestId("appointment")).toHaveCount(1);

  await context.clock.setFixedTime(at("2026-03-02T10:00:00Z"));
  await page.getByRole("button", { name: "Huỷ KH0001" }).click();
  await expect(page.getByTestId("clinic-message")).toHaveText("Đã huỷ lịch KH0001");
  await expect(page.getByTestId("appointment")).toHaveCount(0);
});

test("mỗi số điện thoại tối đa 3 lịch", async ({ page, context }) => {
  await open(page, context);
  for (const t of ["10:00", "10:30", "11:00"]) {
    await form(page, { time: t });
    await expect(page.getByTestId("clinic-message")).toContainText("Đặt lịch thành công");
  }
  await form(page, { time: "13:30" });
  await expect(page.getByTestId("clinic-message")).toHaveText("Mỗi số điện thoại chỉ có tối đa 3 lịch");
  await expect(page.getByTestId("appointment")).toHaveCount(3);
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ page, context }) => {
  await open(page, context, "2026-03-02T06:00:00Z", "?bugs=BUG-01,BUG-02,BUG-03");
  await form(page, { time: "10:00", name: "A", phone: "123" }); // BUG-03: họ tên và số điện thoại sai vẫn nhận
  await expect(page.getByTestId("clinic-message")).toContainText("Đặt lịch thành công");
  await expect(slot(page, "10:00")).toHaveAttribute("data-state", "free"); // BUG-01: khung vừa đặt vẫn trống
  await form(page, { date: "2026-03-08", time: "10:00", name: "Hai", phone: "0901234567" }); // BUG-02: Chủ nhật vẫn đặt được
  await expect(page.getByTestId("appointment")).toHaveCount(2);
});
