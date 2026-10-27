import { test, expect, type Page } from "@playwright/test";

// "Hôm nay" cố định = 10/03/2026 để lịch luôn giống nhau.
const NOW = "2026-03-10T09:00:00";

async function open(page: Page, query = "") {
  await page.clock.setFixedTime(new Date(NOW));
  await page.goto("/lab/hotel" + query);
  await page.getByTestId("reset-data").click();
}

async function pickCity(page: Page, city: string) {
  await page.getByRole("combobox", { name: "Điểm đến" }).fill(city);
  await page.getByRole("option", { name: city, exact: true }).click();
}

const day = (page: Page, iso: string) => page.getByTestId(`day-${iso}`);

/** Chọn khoảng ngày; `monthsAhead` là số lần bấm Tháng sau để tới tháng của ngày trả phòng. */
async function pickRange(page: Page, from: string, to: string, monthsAhead = 0) {
  await page.getByLabel("Nhận phòng").click();
  await day(page, from).click();
  for (let i = 0; i < monthsAhead; i++) await page.getByRole("button", { name: "Tháng sau" }).click();
  await day(page, to).click();
}

async function search(page: Page, city = "Hà Nội", from = "2026-03-12", to = "2026-03-15") {
  await pickCity(page, city);
  await pickRange(page, from, to);
  await page.getByRole("button", { name: "Tìm khách sạn" }).click();
}

const cards = (page: Page) => page.getByTestId("hotel-card");
const ids = async (page: Page) => Promise.all((await cards(page).all()).map((c) => c.getAttribute("data-id")));

test("combobox thành phố: lọc không phân biệt dấu, ArrowDown/Enter chọn", async ({ page }) => {
  await open(page);
  const box = page.getByRole("combobox", { name: "Điểm đến" });
  await box.fill("da");
  await expect(page.getByRole("listbox").getByRole("option")).toHaveText(["Đà Nẵng", "Đà Lạt"]);
  await box.press("ArrowDown");
  await expect(page.getByRole("option", { name: "Đà Lạt" })).toHaveAttribute("aria-selected", "true");
  await box.press("Enter");
  await expect(box).toHaveValue("Đà Lạt");
  await expect(page.getByRole("listbox")).toBeHidden();

  await box.fill("");
  await expect(page.getByRole("listbox").getByRole("option")).toHaveCount(8);
  await box.fill("xyz");
  await expect(page.getByTestId("city-empty")).toHaveText("Không có thành phố phù hợp");
  await box.press("Escape");
  await expect(page.getByRole("listbox")).toBeHidden();
});

test("gõ chữ không chọn gợi ý thì báo lỗi khi tìm", async ({ page }) => {
  await open(page);
  await page.getByRole("combobox", { name: "Điểm đến" }).fill("Hà Nội");
  await pickRange(page, "2026-03-12", "2026-03-15");
  await page.getByRole("button", { name: "Tìm khách sạn" }).click();
  await expect(page.getByTestId("search-error")).toHaveText("Vui lòng chọn một thành phố trong danh sách");
  await expect(page.getByTestId("results")).toHaveCount(0);
});

test("thiếu ngày thì báo lỗi", async ({ page }) => {
  await open(page);
  await pickCity(page, "Huế");
  await page.getByRole("button", { name: "Tìm khách sạn" }).click();
  await expect(page.getByTestId("search-error")).toHaveText("Vui lòng chọn ngày nhận phòng và trả phòng");
});

test("lịch: ngày quá khứ bị vô hiệu, điều hướng tháng và không lùi quá tháng hiện tại", async ({ page }) => {
  await open(page);
  await page.getByLabel("Nhận phòng").click();
  await expect(page.getByTestId("cal-title")).toHaveText("Tháng 3 2026");
  await expect(day(page, "2026-03-09")).toBeDisabled();
  await expect(day(page, "2026-03-10")).toBeEnabled();
  await expect(page.getByRole("button", { name: "Tháng trước" })).toBeDisabled();
  await page.getByRole("button", { name: "Tháng sau" }).click();
  await expect(page.getByTestId("cal-title")).toHaveText("Tháng 4 2026");
  await expect(day(page, "2026-04-01")).toBeEnabled();
  await page.getByRole("button", { name: "Tháng trước" }).click();
  await expect(page.getByTestId("cal-title")).toHaveText("Tháng 3 2026");
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("calendar")).toBeHidden();
});

test("chọn khoảng ngày: tô nổi bật, hiển thị số đêm, lịch tự đóng", async ({ page }) => {
  await open(page);
  await expect(page.getByTestId("nights")).toHaveText("Chưa chọn ngày");
  await pickRange(page, "2026-03-12", "2026-03-15");
  await expect(page.getByTestId("calendar")).toBeHidden();
  await expect(page.getByTestId("checkin-btn")).toHaveText("12/03/2026");
  await expect(page.getByTestId("checkout-btn")).toHaveText("15/03/2026");
  await expect(page.getByTestId("nights")).toHaveText("3 đêm");
  await page.getByLabel("Trả phòng").click();
  await expect(day(page, "2026-03-12")).toHaveAttribute("data-state", "checkin");
  await expect(day(page, "2026-03-13")).toHaveAttribute("data-state", "in-range");
  await expect(day(page, "2026-03-14")).toHaveAttribute("data-state", "in-range");
  await expect(day(page, "2026-03-15")).toHaveAttribute("data-state", "checkout");
  await expect(day(page, "2026-03-16")).toHaveAttribute("data-state", "none");
});

test("biên số đêm: tối thiểu 1 đêm, tối đa 30 đêm", async ({ page }) => {
  await open(page);
  await pickRange(page, "2026-03-10", "2026-03-11");
  await expect(page.getByTestId("nights")).toHaveText("1 đêm");

  await page.getByLabel("Nhận phòng").click();
  await day(page, "2026-03-10").click();
  await page.getByRole("button", { name: "Tháng sau" }).click();
  await expect(day(page, "2026-04-10")).toBeDisabled(); // 31 đêm
  await expect(day(page, "2026-04-09")).toBeEnabled(); // 30 đêm
  await day(page, "2026-04-09").click();
  await expect(page.getByTestId("nights")).toHaveText("30 đêm");
});

test("chọn ngày trả không sau ngày nhận thì bắt đầu lại từ ngày nhận mới", async ({ page }) => {
  await open(page);
  await page.getByLabel("Nhận phòng").click();
  await day(page, "2026-03-12").click();
  await day(page, "2026-03-12").click();
  await expect(page.getByTestId("checkin-btn")).toHaveText("12/03/2026");
  await expect(page.getByTestId("checkout-btn")).toHaveText("Chọn ngày");
  await day(page, "2026-03-11").click();
  await expect(page.getByTestId("checkin-btn")).toHaveText("11/03/2026");
  await expect(page.getByTestId("checkout-btn")).toHaveText("Chọn ngày");
  await day(page, "2026-03-13").click();
  await expect(page.getByTestId("nights")).toHaveText("2 đêm");
});

test("số đêm qua cuối tháng tính đúng", async ({ page }) => {
  await open(page);
  await pickRange(page, "2026-03-28", "2026-04-02", 1);
  await expect(page.getByTestId("nights")).toHaveText("5 đêm");
});

test("khách: bộ đếm trẻ em 0-4 và kiểm tra sức chứa phòng", async ({ page }) => {
  await open(page);
  const count = page.getByTestId("children-count");
  await expect(count).toHaveText("0");
  await expect(page.getByRole("button", { name: "Bớt 1 trẻ" })).toBeDisabled();
  for (let i = 0; i < 4; i++) await page.getByRole("button", { name: "Thêm 1 trẻ" }).click();
  await expect(count).toHaveText("4");
  await expect(page.getByRole("button", { name: "Thêm 1 trẻ" })).toBeDisabled();

  await pickCity(page, "Hà Nội");
  await pickRange(page, "2026-03-12", "2026-03-15");
  await page.getByRole("button", { name: "Tìm khách sạn" }).click(); // 2 người lớn + 4 trẻ, 1 phòng
  await expect(page.getByTestId("search-error")).toHaveText("Mỗi phòng tối đa 4 khách, hãy thêm phòng");
  await page.getByLabel("Số phòng").selectOption("2");
  await page.getByRole("button", { name: "Tìm khách sạn" }).click();
  await expect(page.getByTestId("search-error")).toHaveCount(0);
  await expect(page.getByTestId("result-count")).toBeVisible();

  await page.getByLabel("Người lớn").selectOption("1");
  await page.getByRole("button", { name: "Tìm khách sạn" }).click();
  await expect(page.getByTestId("search-error")).toHaveText("Mỗi phòng cần ít nhất 1 người lớn");
});

test("kết quả: số lượng, phân trang 5 khách sạn mỗi trang", async ({ page }) => {
  await open(page);
  await search(page);
  await expect(page.getByTestId("result-count")).toHaveText("12 khách sạn tại Hà Nội");
  await expect(cards(page)).toHaveCount(5);
  await expect(page.getByTestId("page-info")).toHaveText("Trang 1/3");
  await page.getByRole("button", { name: "Trang sau" }).click();
  await expect(cards(page)).toHaveCount(5);
  await page.getByTestId("page-3").click();
  await expect(cards(page)).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Trang sau" })).toBeDisabled();
  await page.getByRole("button", { name: "Trang trước" }).click();
  await expect(page.getByTestId("page-info")).toHaveText("Trang 2/3");
});

test("thẻ khách sạn: data-price, data-rating, ảnh có alt, sao có aria-label, link chi tiết", async ({ page }) => {
  await open(page);
  await search(page, "Hà Nội");
  const card = page.locator('[data-id="h02"]');
  await page.getByRole("radio", { name: "5 sao" }).check();
  await expect(card).toHaveAttribute("data-price", "3200000");
  await expect(card).toHaveAttribute("data-rating", "9.4");
  await expect(card.getByRole("img", { name: "Ảnh khách sạn Hồ Gươm Palace" })).toBeVisible();
  await expect(card.getByRole("img", { name: "5 trên 5 sao" })).toBeVisible();
  await expect(card.getByTestId("hotel-price")).toHaveText("3.200.000 ₫");
  await expect(card.getByRole("link", { name: "Xem chi tiết" })).toHaveAttribute("href", "/lab/hotel/h02");
  await card.getByRole("link", { name: "Xem chi tiết" }).click();
  await expect(page).toHaveURL(/\/lab\/hotel\/h02$/);
  await expect(page.getByTestId("detail-name")).toHaveText("Hồ Gươm Palace");
});

test("lọc tiện nghi: mọi thẻ phải có đủ các tiện nghi đã chọn (AND)", async ({ page }) => {
  await open(page);
  await search(page);
  await page.getByRole("checkbox", { name: "Wifi miễn phí" }).check();
  await page.getByRole("checkbox", { name: "Hồ bơi" }).check();
  await expect(page.getByTestId("result-count")).toHaveText("5 khách sạn tại Hà Nội");
  const list = await cards(page).all();
  expect(list).toHaveLength(5);
  for (const c of list) {
    const a = (await c.getAttribute("data-amenities"))!.split(",");
    expect(a).toContain("wifi");
    expect(a).toContain("pool");
  }
  await page.getByRole("checkbox", { name: "Bữa sáng" }).check();
  await expect(page.getByTestId("result-count")).toHaveText("3 khách sạn tại Hà Nội");
  await page.getByRole("checkbox", { name: "Bãi đỗ xe" }).check();
  await expect(cards(page)).toHaveCount(2);
  expect(await ids(page)).toEqual(["h02", "h10"]);
});

test("lọc hạng sao và khoảng giá; không có kết quả thì báo Không tìm thấy", async ({ page }) => {
  await open(page);
  await search(page);
  await page.getByRole("radio", { name: "4 sao trở lên" }).check();
  await expect(page.getByTestId("result-count")).toHaveText("7 khách sạn tại Hà Nội");
  await page.getByLabel("Giá tối thiểu").fill("1000000");
  await page.getByLabel("Giá tối đa").fill("1400000");
  await expect(page.getByTestId("result-count")).toHaveText("3 khách sạn tại Hà Nội");
  const prices = await Promise.all((await cards(page).all()).map(async (c) => Number(await c.getAttribute("data-price"))));
  for (const p of prices) {
    expect(p).toBeGreaterThanOrEqual(1000000);
    expect(p).toBeLessThanOrEqual(1400000);
  }
  await page.getByLabel("Giá tối thiểu").fill("2000000");
  await expect(page.getByTestId("filter-error")).toHaveText("Giá tối thiểu không được lớn hơn giá tối đa");
  await page.getByLabel("Giá tối đa").fill("");
  await page.getByRole("radio", { name: "5 sao" }).check();
  await page.getByLabel("Giá tối thiểu").fill("3300000");
  await expect(page.getByTestId("no-results")).toContainText("Không tìm thấy");
  await expect(cards(page)).toHaveCount(0);
});

test("sắp xếp: giá tăng/giảm và đánh giá (đọc data-price, data-rating)", async ({ page }) => {
  await open(page);
  await search(page);
  const read = async (attr: string) => Promise.all((await cards(page).all()).map(async (c) => Number(await c.getAttribute(attr))));

  await page.getByLabel("Sắp xếp").selectOption("price-asc");
  let prices = await read("data-price");
  expect(prices).toHaveLength(5);
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
  expect(prices[0]).toBe(480000);

  await page.getByLabel("Sắp xếp").selectOption("price-desc");
  prices = await read("data-price");
  expect(prices).toEqual([...prices].sort((a, b) => b - a));
  expect(prices[0]).toBe(3200000);

  await page.getByLabel("Sắp xếp").selectOption("rating");
  const ratings = await read("data-rating");
  expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
  expect(ratings[0]).toBe(9.4);
});

test("đổi bộ lọc quay về trang 1; thành phố ít kết quả không có phân trang", async ({ page }) => {
  await open(page);
  await search(page);
  await page.getByTestId("page-2").click();
  await page.getByLabel("Sắp xếp").selectOption("price-asc");
  await expect(page.getByTestId("page-info")).toHaveText("Trang 1/3");

  await pickCity(page, "Hải Phòng");
  await page.getByRole("button", { name: "Tìm khách sạn" }).click();
  await expect(page.getByTestId("result-count")).toHaveText("1 khách sạn tại Hải Phòng");
  await expect(page.getByTestId("pagination")).toHaveCount(0);
});

test("luồng đặt phòng: tóm tắt (đêm × giá + 10% thuế + bữa sáng) → thông tin → mã xác nhận", async ({ page }) => {
  await open(page);
  await search(page); // 12-15/03: 3 đêm
  await page.getByLabel("Sắp xếp").selectOption("price-asc");
  await page.getByRole("button", { name: "Đặt phòng Old Quarter Inn" }).click();
  await expect(page.getByTestId("sum-hotel")).toHaveText("Old Quarter Inn");
  await expect(page.getByTestId("sum-dates")).toHaveText("12/03/2026 → 15/03/2026");
  await expect(page.getByTestId("sum-nights")).toHaveText("3");
  await expect(page.getByTestId("sum-subtotal")).toHaveText("1.440.000 ₫");
  await expect(page.getByTestId("sum-breakfast")).toHaveText("0 ₫");
  await expect(page.getByTestId("sum-tax")).toHaveText("144.000 ₫");
  await expect(page.getByTestId("sum-total")).toHaveText("1.584.000 ₫");

  await page.getByRole("checkbox", { name: /Thêm bữa sáng/ }).check();
  await expect(page.getByTestId("sum-breakfast")).toHaveText("450.000 ₫");
  await expect(page.getByTestId("sum-tax")).toHaveText("189.000 ₫");
  await expect(page.getByTestId("sum-total")).toHaveText("2.079.000 ₫");

  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByRole("button", { name: "Xác nhận đặt phòng" }).click();
  await expect(page.getByTestId("error-name")).toBeVisible();
  await expect(page.getByTestId("error-email")).toHaveText("Email không hợp lệ");
  await expect(page.getByTestId("error-phone")).toBeVisible();
  await page.getByLabel("Họ tên").fill("Nguyễn Văn An");
  await page.getByLabel("Email").fill("an@example.com");
  await page.getByLabel("Số điện thoại").fill("0912345678");
  await page.getByRole("button", { name: "Xác nhận đặt phòng" }).click();
  await expect(page.getByTestId("booking-code")).toHaveText("HT-20260312-H04");
});

test("khách sạn đã gồm bữa sáng không có tuỳ chọn thêm; nhiều phòng nhân giá", async ({ page }) => {
  await open(page);
  await pickCity(page, "Hà Nội");
  await pickRange(page, "2026-03-12", "2026-03-14");
  await page.getByLabel("Số phòng").selectOption("2");
  await page.getByRole("button", { name: "Tìm khách sạn" }).click();
  await page.getByRole("button", { name: "Đặt phòng Phố Cổ Boutique" }).click();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await expect(page.getByTestId("sum-subtotal")).toHaveText("2.600.000 ₫"); // 650.000 × 2 đêm × 2 phòng
  await expect(page.getByTestId("sum-tax")).toHaveText("260.000 ₫");
  await expect(page.getByTestId("sum-total")).toHaveText("2.860.000 ₫");
});

test("BUG-01: cho chọn ngày trả trùng hoặc trước ngày nhận (0 đêm)", async ({ page }) => {
  await open(page, "?bugs=BUG-01");
  await pickCity(page, "Hà Nội");
  await page.getByLabel("Nhận phòng").click();
  await day(page, "2026-03-12").click();
  await day(page, "2026-03-12").click();
  await expect(page.getByTestId("checkout-btn")).toHaveText("12/03/2026");
  await expect(page.getByTestId("nights")).toHaveText("0 đêm");
  await page.getByRole("button", { name: "Tìm khách sạn" }).click();
  await expect(page.getByTestId("search-error")).toHaveCount(0);
  await expect(page.getByTestId("result-count")).toBeVisible();
});

test("BUG-02: số đêm lệch 1 khi qua cuối tháng", async ({ page }) => {
  await open(page, "?bugs=BUG-02");
  await pickRange(page, "2026-03-28", "2026-04-02", 1);
  await expect(page.getByTestId("nights")).toHaveText("6 đêm"); // đúng phải là 5
  await pickRange(page, "2026-03-12", "2026-03-15");
  await expect(page.getByTestId("nights")).toHaveText("3 đêm"); // cùng tháng vẫn đúng
});

test("BUG-03: lọc tiện nghi dùng OR nên hiện cả khách sạn thiếu tiện nghi", async ({ page }) => {
  await open(page, "?bugs=BUG-03");
  await search(page);
  await page.getByRole("checkbox", { name: "Wifi miễn phí" }).check();
  await page.getByRole("checkbox", { name: "Hồ bơi" }).check();
  await expect(page.getByTestId("result-count")).not.toHaveText("5 khách sạn tại Hà Nội");
  const attrs = await Promise.all((await cards(page).all()).map((c) => c.getAttribute("data-amenities")));
  expect(attrs.some((a) => !a!.includes("pool") || !a!.includes("wifi"))).toBe(true);
});
