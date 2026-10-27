import { test, expect, type Page } from "@playwright/test";

// "Hôm nay" cố định là 15/06/2026 trong mọi test.
async function open(page: Page, query = "") {
  await page.clock.setFixedTime(new Date("2026-06-15T10:00:00"));
  await page.goto("/lab/insurance" + query);
  await page.getByTestId("reset-data").click();
}

const next = (page: Page) => page.getByRole("button", { name: "Tiếp tục" }).click();
const back = (page: Page) => page.getByRole("button", { name: "Quay lại" }).click();

async function fillOwner(page: Page, o: { dob?: string; phone?: string; email?: string; name?: string } = {}) {
  await page.getByLabel("Họ và tên").fill(o.name ?? "Nguyễn Văn An");
  await page.getByLabel("Ngày sinh").fill(o.dob ?? "1990-05-15");
  await page.getByLabel("Số điện thoại").fill(o.phone ?? "0912345678");
  await page.getByLabel("Email").fill(o.email ?? "an@example.com");
}

async function fillVehicle(page: Page, v: { type?: string; payload?: string; year?: string; value?: string; plate?: string } = {}) {
  await page.getByLabel("Loại xe").selectOption(v.type ?? "car");
  if (v.payload !== undefined) await page.getByLabel("Tải trọng (tấn)").fill(v.payload);
  await page.getByLabel("Năm sản xuất").fill(v.year ?? "2022");
  await page.getByLabel("Giá trị xe (VNĐ)").fill(v.value ?? "500000000");
  await page.getByLabel("Biển số xe").fill(v.plate ?? "30A-123.45");
}

async function toStep2(page: Page, dob?: string) {
  await fillOwner(page, { dob });
  await next(page);
  await expect(page.getByTestId("step-label")).toHaveText("Bước 2/4 · Thông tin xe");
}

async function toStep3(page: Page, v: Parameters<typeof fillVehicle>[1] = {}, dob?: string) {
  await toStep2(page, dob);
  await fillVehicle(page, v);
  await next(page);
  await expect(page.getByTestId("step-label")).toHaveText("Bước 3/4 · Gói bảo hiểm");
}

test("bước 1 trống báo lỗi dưới từng ô và không chuyển bước", async ({ page }) => {
  await open(page);
  await expect(page.getByTestId("step-label")).toHaveText("Bước 1/4 · Chủ xe");
  await next(page);
  await expect(page.getByTestId("err-fullName")).toHaveText("Vui lòng nhập họ và tên");
  await expect(page.getByTestId("err-dob")).toHaveText("Vui lòng nhập ngày sinh");
  await expect(page.getByTestId("err-phone")).toHaveText("Vui lòng nhập số điện thoại");
  await expect(page.getByTestId("err-email")).toHaveText("Vui lòng nhập email");
  await expect(page.getByTestId("step-label")).toHaveText("Bước 1/4 · Chủ xe");
});

const ageCases: { dob: string; ok: boolean; note: string }[] = [
  { dob: "2008-06-16", ok: false, note: "17 tuổi 364 ngày" },
  { dob: "2008-06-15", ok: true, note: "đúng 18 tuổi" },
  { dob: "2007-06-15", ok: true, note: "19 tuổi" },
  { dob: "1956-06-16", ok: true, note: "69 tuổi" },
  { dob: "1956-06-15", ok: true, note: "đúng 70 tuổi" },
  { dob: "1955-06-16", ok: true, note: "70 tuổi 364 ngày" },
  { dob: "1955-06-15", ok: false, note: "đúng 71 tuổi" },
  { dob: "2027-01-01", ok: false, note: "ngày sinh ở tương lai" },
];

for (const c of ageCases) {
  test(`biên tuổi chủ xe: ${c.dob} (${c.note}) ${c.ok ? "hợp lệ" : "bị từ chối"}`, async ({ page }) => {
    await open(page);
    await fillOwner(page, { dob: c.dob });
    await next(page);
    if (c.ok) await expect(page.getByTestId("step-label")).toHaveText("Bước 2/4 · Thông tin xe");
    else {
      await expect(page.getByTestId("err-dob")).toBeVisible();
      await expect(page.getByTestId("step-label")).toHaveText("Bước 1/4 · Chủ xe");
    }
  });
}

test("số điện thoại: đầu số hợp lệ và không hợp lệ", async ({ page }) => {
  await open(page);
  await fillOwner(page);
  for (const bad of ["091234567", "09123456789", "0412345678", "0212345678", "09123a5678", "+84912345678"]) {
    await page.getByLabel("Số điện thoại").fill(bad);
    await next(page);
    await expect(page.getByTestId("err-phone")).toContainText("10 số");
  }
  for (const good of ["0312345678", "0512345678", "0712345678", "0812345678", "0912345678"]) {
    await page.getByLabel("Số điện thoại").fill(good);
    await next(page);
    await expect(page.getByTestId("step-label")).toHaveText("Bước 2/4 · Thông tin xe");
    await back(page);
    await expect(page.getByTestId("step-label")).toHaveText("Bước 1/4 · Chủ xe");
  }
});

test("email sai định dạng bị từ chối", async ({ page }) => {
  await open(page);
  await fillOwner(page, { email: "an@" });
  await next(page);
  await expect(page.getByTestId("err-email")).toHaveText("Email không hợp lệ");
});

test("năm sản xuất: từ năm hiện tại trừ 15 đến năm hiện tại (2011–2026)", async ({ page }) => {
  await open(page);
  await toStep2(page);
  await expect(page.getByTestId("year-hint")).toHaveText("Từ 2011 đến 2026");
  await fillVehicle(page, { year: "2010" });
  await next(page);
  await expect(page.getByTestId("err-year")).toHaveText("Năm sản xuất từ 2011 đến 2026");
  await page.getByLabel("Năm sản xuất").fill("2027");
  await next(page);
  await expect(page.getByTestId("err-year")).toBeVisible();
  await page.getByLabel("Năm sản xuất").fill("2011");
  await next(page);
  await expect(page.getByTestId("step-label")).toHaveText("Bước 3/4 · Gói bảo hiểm");
  await back(page);
  await page.getByLabel("Năm sản xuất").fill("2026");
  await next(page);
  await expect(page.getByTestId("step-label")).toHaveText("Bước 3/4 · Gói bảo hiểm");
});

test("giá trị xe: biên 50 triệu và 5 tỷ", async ({ page }) => {
  await open(page);
  await toStep2(page);
  for (const bad of ["49999999", "5000000001", "abc"]) {
    await fillVehicle(page, { value: bad });
    await next(page);
    await expect(page.getByTestId("err-value")).toBeVisible();
  }
  await fillVehicle(page, { value: "50000000" });
  await next(page);
  await expect(page.getByTestId("step-label")).toHaveText("Bước 3/4 · Gói bảo hiểm");
  await back(page);
  await page.getByLabel("Giá trị xe (VNĐ)").fill("5.000.000.000");
  await next(page);
  await expect(page.getByTestId("step-label")).toHaveText("Bước 3/4 · Gói bảo hiểm");
});

test("biển số đúng định dạng mới qua được", async ({ page }) => {
  await open(page);
  await toStep2(page);
  for (const bad of ["30a-123.45", "30A12345", "A30-123.45", "30A-12.345"]) {
    await fillVehicle(page, { plate: bad });
    await next(page);
    await expect(page.getByTestId("err-plate")).toBeVisible();
  }
  await fillVehicle(page, { plate: "51AB-123.45" });
  await next(page);
  await expect(page.getByTestId("step-label")).toHaveText("Bước 3/4 · Gói bảo hiểm");
});

test("trường điều kiện: tải trọng chỉ hiện với ô tô tải nhẹ và có biên 0,5–3,5", async ({ page }) => {
  await open(page);
  await toStep2(page);
  await expect(page.getByLabel("Tải trọng (tấn)")).toHaveCount(0);
  await page.getByLabel("Loại xe").selectOption("truck");
  await expect(page.getByLabel("Tải trọng (tấn)")).toBeVisible();
  await page.getByLabel("Loại xe").selectOption("moto");
  await expect(page.getByLabel("Tải trọng (tấn)")).toHaveCount(0);
  await page.getByLabel("Loại xe").selectOption("truck");

  await fillVehicle(page, { type: "truck", payload: "" });
  await next(page);
  await expect(page.getByTestId("err-payload")).toHaveText("Vui lòng nhập tải trọng");
  for (const bad of ["0,4", "3,6", "abc"]) {
    await page.getByLabel("Tải trọng (tấn)").fill(bad);
    await next(page);
    await expect(page.getByTestId("err-payload")).toBeVisible();
  }
  await page.getByLabel("Tải trọng (tấn)").fill("0,5");
  await next(page);
  await expect(page.getByTestId("step-label")).toHaveText("Bước 3/4 · Gói bảo hiểm");
  await back(page);
  await page.getByLabel("Tải trọng (tấn)").fill("3.5");
  await next(page);
  await expect(page.getByTestId("step-label")).toHaveText("Bước 3/4 · Gói bảo hiểm");
});

test("trường điều kiện: xe máy không có gói Toàn diện, ô tô có", async ({ page }) => {
  await open(page);
  await toStep3(page, { type: "moto", value: "60000000" });
  await expect(page.getByTestId("pkg-basic")).toBeVisible();
  await expect(page.getByTestId("pkg-plus")).toBeVisible();
  await expect(page.getByTestId("pkg-full")).toHaveCount(0);
  await back(page);
  await page.getByLabel("Loại xe").selectOption("car");
  await next(page);
  await expect(page.getByTestId("pkg-full")).toBeVisible();
});

test("đổi sang xe máy sau khi chọn Toàn diện thì phải chọn lại gói", async ({ page }) => {
  await open(page);
  await toStep3(page);
  await page.getByRole("radio", { name: "Toàn diện" }).check();
  await back(page);
  await page.getByLabel("Loại xe").selectOption("moto");
  await next(page);
  await next(page);
  await expect(page.getByTestId("err-pkg")).toHaveText("Vui lòng chọn gói bảo hiểm");
});

test("bước 3: bắt buộc chọn gói; tạm tính chưa có khi chưa chọn gói", async ({ page }) => {
  await open(page);
  await toStep3(page);
  await expect(page.getByTestId("premium-box")).toHaveCount(0);
  await next(page);
  await expect(page.getByTestId("err-pkg")).toBeVisible();
  await expect(page.getByTestId("step-label")).toHaveText("Bước 3/4 · Gói bảo hiểm");
});

// Bảng quyết định / pairwise: loại xe × gói × tuổi × quyền lợi × số năm không bồi thường × kỳ thanh toán.
interface PremiumCase {
  name: string;
  dob: string;
  type: string;
  payload?: string;
  value: string;
  pkg: string;
  extras: string[];
  ncb: string;
  billing: "year" | "month";
  annual: string;
  payable: string;
}

const premiumCases: PremiumCase[] = [
  { name: "ô tô con, Cơ bản, năm", dob: "1990-05-15", type: "car", value: "500000000", pkg: "Cơ bản", extras: [], ncb: "0", billing: "year", annual: "5.000.000 ₫", payable: "5.000.000 ₫" },
  { name: "ô tô con, Nâng cao", dob: "1990-05-15", type: "car", value: "500000000", pkg: "Nâng cao", extras: [], ncb: "0", billing: "year", annual: "7.500.000 ₫", payable: "7.500.000 ₫" },
  { name: "ô tô con, Toàn diện", dob: "1990-05-15", type: "car", value: "500000000", pkg: "Toàn diện", extras: [], ncb: "0", billing: "year", annual: "10.000.000 ₫", payable: "10.000.000 ₫" },
  { name: "ô tô con, Cơ bản, kỳ tháng", dob: "1990-05-15", type: "car", value: "500000000", pkg: "Cơ bản", extras: [], ncb: "0", billing: "month", annual: "5.000.000 ₫", payable: "450.000 ₫" },
  { name: "tải nhẹ hệ số 1,2, Nâng cao", dob: "1990-05-15", type: "truck", payload: "2", value: "800000000", pkg: "Nâng cao", extras: [], ncb: "0", billing: "year", annual: "14.400.000 ₫", payable: "14.400.000 ₫" },
  { name: "xe máy hệ số 0,6, Cơ bản", dob: "1990-05-15", type: "moto", value: "60000000", pkg: "Cơ bản", extras: [], ncb: "0", billing: "year", annual: "360.000 ₫", payable: "360.000 ₫" },
  { name: "dưới 25 tuổi phụ phí 20% (24 tuổi)", dob: "2001-06-16", type: "car", value: "500000000", pkg: "Cơ bản", extras: [], ncb: "0", billing: "year", annual: "6.000.000 ₫", payable: "6.000.000 ₫" },
  { name: "đúng 25 tuổi không phụ phí", dob: "2001-06-15", type: "car", value: "500000000", pkg: "Cơ bản", extras: [], ncb: "0", billing: "year", annual: "5.000.000 ₫", payable: "5.000.000 ₫" },
  { name: "0 năm không bồi thường giảm 0%", dob: "1990-05-15", type: "car", value: "1000000000", pkg: "Cơ bản", extras: [], ncb: "0", billing: "year", annual: "10.000.000 ₫", payable: "10.000.000 ₫" },
  { name: "1 năm giảm 5%", dob: "1990-05-15", type: "car", value: "1000000000", pkg: "Cơ bản", extras: [], ncb: "1", billing: "year", annual: "9.500.000 ₫", payable: "9.500.000 ₫" },
  { name: "2 năm giảm 10%", dob: "1990-05-15", type: "car", value: "1000000000", pkg: "Cơ bản", extras: [], ncb: "2", billing: "year", annual: "9.000.000 ₫", payable: "9.000.000 ₫" },
  { name: "3 năm trở lên giảm 15%", dob: "1990-05-15", type: "car", value: "1000000000", pkg: "Cơ bản", extras: [], ncb: "3", billing: "year", annual: "8.500.000 ₫", payable: "8.500.000 ₫" },
  { name: "một quyền lợi thêm (Thuỷ kích)", dob: "1990-05-15", type: "car", value: "500000000", pkg: "Cơ bản", extras: ["Thuỷ kích"], ncb: "0", billing: "year", annual: "5.300.000 ₫", payable: "5.300.000 ₫" },
  { name: "cả ba quyền lợi thêm", dob: "1990-05-15", type: "car", value: "500000000", pkg: "Cơ bản", extras: ["Thuỷ kích", "Mất cắp bộ phận", "Cứu hộ 24/7"], ncb: "0", billing: "year", annual: "6.000.000 ₫", payable: "6.000.000 ₫" },
  { name: "phụ phí tuổi, giảm giá rồi mới cộng quyền lợi: 24 tuổi, tải nhẹ, Nâng cao, 3 năm, Thuỷ kích + Cứu hộ", dob: "2001-06-16", type: "truck", payload: "1", value: "800000000", pkg: "Nâng cao", extras: ["Thuỷ kích", "Cứu hộ 24/7"], ncb: "3", billing: "year", annual: "15.188.000 ₫", payable: "15.188.000 ₫" },
  { name: "làm tròn xuống nghìn đồng", dob: "1990-05-15", type: "truck", payload: "1", value: "833333333", pkg: "Nâng cao", extras: [], ncb: "0", billing: "year", annual: "14.999.000 ₫", payable: "14.999.000 ₫" },
  { name: "kỳ tháng: phí năm × 1,08 / 12", dob: "1990-05-15", type: "car", value: "1000000000", pkg: "Toàn diện", extras: ["Cứu hộ 24/7"], ncb: "1", billing: "month", annual: "19.200.000 ₫", payable: "1.728.000 ₫" },
];

for (const c of premiumCases) {
  test(`tính phí: ${c.name}`, async ({ page }) => {
    await open(page);
    await toStep3(page, { type: c.type, payload: c.payload, value: c.value }, c.dob);
    await page.getByRole("radio", { name: c.pkg, exact: true }).check();
    for (const x of c.extras) await page.getByRole("checkbox", { name: x }).check();
    await page.getByLabel("Số năm không bồi thường").selectOption(c.ncb);
    if (c.billing === "month") await page.getByRole("radio", { name: /theo tháng/ }).check();
    await expect(page.getByTestId("premium-annual")).toHaveText(c.annual);
    await expect(page.getByTestId("premium-payable")).toHaveText(c.payable);
  });
}

test("tạm tính hiển thị ở bước 3 và bước 4, đổi theo lựa chọn", async ({ page }) => {
  await open(page);
  await toStep3(page);
  await page.getByRole("radio", { name: "Cơ bản", exact: true }).check();
  await expect(page.getByTestId("premium-annual")).toHaveText("5.000.000 ₫");
  await page.getByRole("radio", { name: "Nâng cao", exact: true }).check();
  await expect(page.getByTestId("premium-annual")).toHaveText("7.500.000 ₫");
  await next(page);
  await expect(page.getByTestId("step-label")).toHaveText("Bước 4/4 · Xem lại & xác nhận");
  await expect(page.getByTestId("premium-annual")).toHaveText("7.500.000 ₫");
});

test("luồng đầy đủ: xem lại, bắt buộc đồng ý điều khoản, nhận số hợp đồng", async ({ page }) => {
  await open(page);
  await toStep3(page, { type: "truck", payload: "1,5", value: "800000000", plate: "29C-456.78" });
  await page.getByRole("radio", { name: "Nâng cao", exact: true }).check();
  await page.getByRole("checkbox", { name: "Thuỷ kích" }).check();
  await page.getByLabel("Số năm không bồi thường").selectOption("1");
  await next(page);

  await expect(page.getByTestId("rv-owner")).toHaveText("Nguyễn Văn An");
  await expect(page.getByTestId("rv-vehicle")).toHaveText("Ô tô tải nhẹ, tải trọng 1,5 tấn, đời 2022, 29C-456.78");
  await expect(page.getByTestId("rv-package")).toHaveText("Nâng cao");
  await expect(page.getByTestId("rv-extras")).toHaveText("Thuỷ kích");
  await expect(page.getByTestId("rv-ncb")).toHaveText("1 năm");

  await page.getByRole("button", { name: "Xác nhận mua bảo hiểm" }).click();
  await expect(page.getByTestId("err-agree")).toHaveText("Bạn phải đồng ý với điều khoản bảo hiểm để tiếp tục");
  await expect(page.getByTestId("contract-no")).toHaveCount(0);

  await page.getByLabel("Tôi đồng ý với điều khoản bảo hiểm").check();
  await page.getByRole("button", { name: "Xác nhận mua bảo hiểm" }).click();
  await expect(page.getByTestId("contract-no")).toHaveText("BH-2026-0001");
  // 800tr × 1,5% × 1,2 = 14.400.000; giảm 5% = 13.680.000; + 300.000 = 13.980.000
  await expect(page.getByTestId("contract-premium")).toHaveText("Phí năm: 13.980.000 ₫");

  await page.getByRole("button", { name: "Báo giá mới" }).click();
  await expect(page.getByTestId("step-label")).toHaveText("Bước 1/4 · Chủ xe");
  await expect(page.getByLabel("Họ và tên")).toHaveValue("");
});

test("thanh tiến trình và nút Quay lại giữ nguyên dữ liệu đã nhập", async ({ page }) => {
  await open(page);
  await expect(page.getByTestId("step-1")).toHaveAttribute("aria-current", "step");
  await expect(page.getByRole("button", { name: "Quay lại" })).toHaveCount(0);
  await toStep3(page, { type: "truck", payload: "2", value: "700000000", plate: "30A-999.99" });
  await expect(page.getByTestId("step-3")).toHaveAttribute("aria-current", "step");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");

  await back(page);
  await expect(page.getByLabel("Loại xe")).toHaveValue("truck");
  await expect(page.getByLabel("Tải trọng (tấn)")).toHaveValue("2");
  await expect(page.getByLabel("Năm sản xuất")).toHaveValue("2022");
  await expect(page.getByLabel("Giá trị xe (VNĐ)")).toHaveValue("700000000");
  await expect(page.getByLabel("Biển số xe")).toHaveValue("30A-999.99");

  await back(page);
  await expect(page.getByLabel("Họ và tên")).toHaveValue("Nguyễn Văn An");
  await expect(page.getByLabel("Ngày sinh")).toHaveValue("1990-05-15");
  await expect(page.getByLabel("Số điện thoại")).toHaveValue("0912345678");
  await expect(page.getByLabel("Email")).toHaveValue("an@example.com");
});

test("Reset dữ liệu lab đưa form về bước 1 và đặt lại số hợp đồng", async ({ page }) => {
  await open(page);
  await toStep2(page);
  await page.getByTestId("reset-data").click();
  await expect(page.getByTestId("step-label")).toHaveText("Bước 1/4 · Chủ xe");
  await expect(page.getByLabel("Họ và tên")).toHaveValue("");
});

// ---- Bug ----

test("BUG-01: đúng 18 và đúng 70 tuổi bị từ chối sai", async ({ page }) => {
  await open(page, "?bugs=BUG-01");
  await fillOwner(page, { dob: "2008-06-15" });
  await next(page);
  await expect(page.getByTestId("err-dob")).toHaveText("Chủ xe phải từ 18 đến 70 tuổi");
  await page.getByLabel("Ngày sinh").fill("1956-06-15");
  await next(page);
  await expect(page.getByTestId("err-dob")).toBeVisible();
  await page.getByLabel("Ngày sinh").fill("1990-05-15");
  await next(page);
  await expect(page.getByTestId("step-label")).toHaveText("Bước 2/4 · Thông tin xe");
});

test("BUG-02: 2 năm không bồi thường bị giảm 15% thay vì 10%", async ({ page }) => {
  await open(page, "?bugs=BUG-02");
  await toStep3(page, { value: "1000000000" });
  await page.getByRole("radio", { name: "Cơ bản", exact: true }).check();
  await page.getByLabel("Số năm không bồi thường").selectOption("2");
  await expect(page.getByTestId("premium-annual")).toHaveText("8.500.000 ₫"); // đúng phải là 9.000.000 ₫
  await page.getByLabel("Số năm không bồi thường").selectOption("1");
  await expect(page.getByTestId("premium-annual")).toHaveText("9.500.000 ₫");
});

test("BUG-03: Quay lại từ bước 3 làm mất dữ liệu bước 2", async ({ page }) => {
  await open(page, "?bugs=BUG-03");
  await toStep3(page);
  await back(page);
  await expect(page.getByLabel("Năm sản xuất")).toHaveValue("");
  await expect(page.getByLabel("Giá trị xe (VNĐ)")).toHaveValue("");
  await expect(page.getByLabel("Biển số xe")).toHaveValue("");
});
