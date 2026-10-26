import { test, expect, type Page } from "@playwright/test";

async function open(page: Page, query = "") {
  await page.goto("/lab/table" + query);
  await page.getByTestId("reset-data").click();
  await expect(page.getByTestId("user-row")).toHaveCount(10);
}

const rows = (page: Page) => page.getByTestId("user-row");

test("mặc định 10 dòng/trang, sắp theo tên A→Z, tổng 37", async ({ page }) => {
  await open(page);
  await expect(page.getByTestId("total-count")).toHaveText("37 người dùng");
  await expect(page.getByTestId("page-info")).toHaveText("Trang 1/4");
  await expect(rows(page).first()).toContainText("Bùi Chi");
  await expect(page.getByRole("columnheader", { name: "Tên" })).toHaveAttribute("aria-sort", "ascending");
});

test("phân trang: trang cuối còn 7 dòng, nút Trang sau bị khoá", async ({ page }) => {
  await open(page);
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Trang sau" }).click();
  await expect(page.getByTestId("page-info")).toHaveText("Trang 4/4");
  await expect(rows(page)).toHaveCount(7);
  await expect(page.getByRole("button", { name: "Trang sau" })).toBeDisabled();
  await page.getByLabel("Số dòng mỗi trang").selectOption("20");
  await expect(page.getByTestId("page-info")).toHaveText("Trang 1/2");
});

test("tìm kiếm không phân biệt hoa thường và quay về trang 1", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Trang sau" }).click();
  await page.getByLabel("Tìm kiếm").fill("MINH");
  await expect(page.getByTestId("total-count")).toHaveText("3 người dùng");
  await expect(page.getByTestId("page-info")).toHaveText("Trang 1/1");
  await expect(rows(page)).toHaveCount(3);
  await page.getByLabel("Tìm kiếm").fill("khong-ton-tai");
  await expect(page.getByTestId("table-empty")).toBeVisible();
});

test("lọc vai trò và trạng thái kết hợp (AND)", async ({ page }) => {
  await open(page);
  await page.getByLabel("Vai trò").selectOption("editor");
  await expect(page.getByTestId("total-count")).toHaveText("11 người dùng");
  await page.getByLabel("Trạng thái").selectOption("locked");
  await expect(page.getByTestId("total-count")).toHaveText("3 người dùng");
  await expect(rows(page)).toHaveCount(3);
});

test("sắp xếp theo ngày tạo đúng thứ tự thời gian", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Ngày tạo" }).click();
  await expect(page.getByRole("columnheader", { name: "Ngày tạo" })).toHaveAttribute("aria-sort", "ascending");
  await expect(rows(page).first()).toContainText("Nguyễn An");
  await expect(rows(page).first()).toContainText("01/01/2025");
  await page.getByRole("button", { name: "Ngày tạo" }).click();
  await expect(page.getByRole("columnheader", { name: "Ngày tạo" })).toHaveAttribute("aria-sort", "descending");
});

test("chọn tất cả chỉ chọn trang hiện tại; khoá hàng loạt bỏ qua Admin", async ({ page }) => {
  await open(page);
  await expect(page.getByTestId("bulk-bar")).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Chọn tất cả trang này" }).check();
  await expect(page.getByTestId("selected-count")).toHaveText("Đã chọn 10");
  await page.getByRole("button", { name: "Khoá đã chọn" }).click();

  // Ban đầu có 9 người bị khoá; trang 1 có 4 người đang hoạt động không phải Admin → 13.
  await page.getByLabel("Trạng thái").selectOption("locked");
  await expect(page.getByTestId("total-count")).toHaveText("13 người dùng");
});

test("Admin không thể bị khoá", async ({ page }) => {
  await open(page);
  await page.getByLabel("Vai trò").selectOption("admin");
  await expect(page.getByTestId("total-count")).toHaveText("6 người dùng");
  for (const btn of await page.getByRole("button", { name: /^(Khoá|Mở khoá) / }).all())
    await expect(btn).toBeDisabled();
});

test("khoá và mở khoá một người dùng", async ({ page }) => {
  await open(page);
  await page.getByLabel("Tìm kiếm").fill("Lê Minh");
  await expect(rows(page)).toHaveCount(1);
  await page.getByRole("button", { name: "Khoá Lê Minh", exact: true }).click();
  await expect(rows(page).first()).toContainText("Đã khoá");
  await page.getByRole("button", { name: "Mở khoá Lê Minh", exact: true }).click();
  await expect(rows(page).first()).toContainText("Hoạt động");
});

test("xuất CSV theo bộ lọc hiện tại", async ({ page }) => {
  await open(page);
  await page.getByLabel("Tìm kiếm").fill("minh");
  await expect(page.getByTestId("total-count")).toHaveText("3 người dùng");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Xuất CSV" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("nguoi-dung.csv");
  const fs = await import("node:fs");
  const content = fs.readFileSync((await download.path())!, "utf8");
  expect(content.trim().split(/\r?\n/)).toHaveLength(4); // tiêu đề + 3 dòng
});

test("hiển thị trạng thái tải khi dữ liệu chậm (?delay)", async ({ page }) => {
  await open(page, "?delay=1500");
  await page.getByLabel("Tìm kiếm").fill("minh");
  await expect(page.getByTestId("table-loading")).toBeVisible();
  await expect(page.getByTestId("table-loading")).toBeHidden({ timeout: 5000 });
  await expect(rows(page)).toHaveCount(3);
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ page }) => {
  await open(page, "?bugs=BUG-01,BUG-02,BUG-03&delay=0");

  await page.getByLabel("Tìm kiếm").fill("MINH");
  await expect(page.getByTestId("total-count")).toHaveText("0 người dùng"); // BUG-01: đáng lẽ 3
  await page.getByLabel("Tìm kiếm").fill("");

  await page.getByRole("button", { name: "Trang sau" }).click();
  await page.getByLabel("Vai trò").selectOption("editor");
  await expect(page.getByTestId("page-info")).toHaveText("Trang 2/2"); // BUG-02: đáng lẽ quay về trang 1

  await page.getByLabel("Vai trò").selectOption("all");
  await page.getByRole("button", { name: "Ngày tạo" }).click();
  await expect(rows(page).nth(1)).not.toContainText("08/01/2025"); // BUG-03: sắp theo chuỗi nên sai thứ tự
});

