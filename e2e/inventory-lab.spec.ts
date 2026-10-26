import { test, expect, type Page } from "@playwright/test";

async function open(page: Page, query = "") {
  await page.goto("/lab/inventory" + query);
  await page.getByTestId("reset-data").click();
}

const row = (page: Page, sku: string) => page.locator(`[data-sku="${sku}"]`);
const qty = (page: Page, sku: string) => row(page, sku).getByTestId("stock-qty");
const label = (page: Page, sku: string) => row(page, sku).getByTestId("stock-label");

async function move(page: Page, f: { sku?: string; type: string; qty: string; note?: string }) {
  await page.getByLabel("Sản phẩm").selectOption(f.sku ?? "SKU-A");
  await page.getByLabel("Loại biến động").selectOption(f.type);
  await page.getByLabel("Số lượng").fill(f.qty);
  await page.getByLabel("Ghi chú").fill(f.note ?? "");
  await page.getByRole("button", { name: "Ghi nhận" }).click();
}

test("dữ liệu ban đầu và nhãn trạng thái tồn kho (đúng mức đặt lại là Sắp hết)", async ({ page }) => {
  await open(page);
  await expect(page.getByTestId("stock-row")).toHaveCount(3);
  await expect(qty(page, "SKU-A")).toHaveText("120");
  await expect(label(page, "SKU-A")).toHaveText("Đủ hàng");
  await expect(label(page, "SKU-B")).toHaveText("Sắp hết"); // tồn 40 = mức đặt lại 40
  await expect(label(page, "SKU-C")).toHaveText("Sắp hết");
});

test("nhập kho và xuất kho cập nhật tồn kho và lịch sử", async ({ page }) => {
  await open(page);
  await move(page, { type: "Nhập kho", qty: "30" });
  await expect(page.getByTestId("inv-message")).toHaveText("Nhập kho SKU-A: tồn kho mới 150");
  await expect(qty(page, "SKU-A")).toHaveText("150");

  await move(page, { type: "Xuất kho", qty: "50" });
  await expect(qty(page, "SKU-A")).toHaveText("100");
  await expect(page.getByTestId("movement-row")).toHaveText(["SKU-A · Xuất kho 50 · 150 → 100", "SKU-A · Nhập kho 30 · 120 → 150"]);
});

test("xuất vượt tồn bị chặn; xuất đúng bằng tồn thì Hết hàng", async ({ page }) => {
  await open(page);
  await move(page, { type: "Xuất kho", qty: "121" });
  await expect(page.getByTestId("inv-message")).toHaveText("Không đủ hàng, tồn hiện tại 120");
  await expect(qty(page, "SKU-A")).toHaveText("120");
  await expect(page.getByTestId("movement-row")).toHaveCount(0);

  await move(page, { type: "Xuất kho", qty: "120" });
  await expect(qty(page, "SKU-A")).toHaveText("0");
  await expect(label(page, "SKU-A")).toHaveText("Hết hàng");
});

test("chuyển nhãn theo mức đặt lại: 51 đủ hàng, 50 và 49 sắp hết", async ({ page }) => {
  await open(page);
  await move(page, { type: "Xuất kho", qty: "69" }); // 51
  await expect(label(page, "SKU-A")).toHaveText("Đủ hàng");
  await move(page, { type: "Xuất kho", qty: "1" }); // 50
  await expect(label(page, "SKU-A")).toHaveText("Sắp hết");
  await move(page, { type: "Xuất kho", qty: "1" }); // 49
  await expect(label(page, "SKU-A")).toHaveText("Sắp hết");
  await move(page, { type: "Nhập kho", qty: "2" }); // 51
  await expect(label(page, "SKU-A")).toHaveText("Đủ hàng");
});

const invalid: [string, string, string, string][] = [
  ["Nhập kho", "abc", "", "Số lượng phải là số nguyên không âm"],
  ["Nhập kho", "-5", "", "Số lượng phải là số nguyên không âm"],
  ["Nhập kho", "0", "", "Số lượng phải từ 1 đến 9999"],
  ["Nhập kho", "10000", "", "Số lượng tối đa 9999"],
  ["Điều chỉnh", "10", "", "Điều chỉnh tồn kho cần ghi chú lý do"],
];
for (const [type, q, note, message] of invalid) {
  test(`từ chối: ${type} với số lượng "${q}"`, async ({ page }) => {
    await open(page);
    await move(page, { type, qty: q, note });
    await expect(page.getByTestId("inv-message")).toHaveText(message);
    await expect(qty(page, "SKU-A")).toHaveText("120");
  });
}

test("điều chỉnh đặt lại tồn theo số đếm thực tế, kể cả về 0 và biên 9999", async ({ page }) => {
  await open(page);
  await move(page, { type: "Điều chỉnh", qty: "25", note: "Kiểm kê tháng 3" });
  await expect(qty(page, "SKU-A")).toHaveText("25");
  await expect(page.getByTestId("movement-row").first()).toHaveText("SKU-A · Điều chỉnh 25 · 120 → 25 · Kiểm kê tháng 3");
  await move(page, { type: "Điều chỉnh", qty: "0", note: "Mất hàng" });
  await expect(label(page, "SKU-A")).toHaveText("Hết hàng");
  await move(page, { type: "Điều chỉnh", qty: "9999", note: "Biên" });
  await expect(qty(page, "SKU-A")).toHaveText("9999");
});

async function createPo(page: Page, sku: string, quantity: string, supplier = "Công ty A") {
  await page.getByLabel("Sản phẩm").selectOption(sku);
  await page.getByLabel("Số lượng đặt").fill(quantity);
  await page.getByLabel("Nhà cung cấp").selectOption(supplier);
  await page.getByRole("button", { name: "Tạo đơn" }).click();
}

test("đơn nhập hàng: Nháp → Đã gửi → Đã nhận cộng tồn kho, sang trang tồn kho thấy ngay", async ({ page }) => {
  await open(page);
  await page.getByRole("link", { name: "Đơn nhập hàng" }).click();
  await createPo(page, "SKU-C", "100", "Công ty B");
  await expect(page.getByTestId("po-message")).toHaveText("Đã tạo PO001");
  await expect(page.getByTestId("po-row")).toContainText("PO001 · SKU-C × 100 · Công ty B · 150.000 ₫ · Nháp");
  await expect(page.getByRole("button", { name: /^Nhận hàng/ })).toHaveCount(0); // chưa gửi thì chưa nhận được

  await page.getByRole("button", { name: "Gửi đơn PO001" }).click();
  await expect(page.getByTestId("po-status")).toHaveText("Đã gửi");
  await page.getByRole("button", { name: "Nhận hàng PO001" }).click();
  await expect(page.getByTestId("po-status")).toHaveText("Đã nhận");
  await expect(page.getByRole("button", { name: /PO001$/ })).toHaveCount(0); // hết thao tác

  await page.getByRole("link", { name: "Tồn kho" }).click();
  await expect(qty(page, "SKU-C")).toHaveText("110");
  await expect(label(page, "SKU-C")).toHaveText("Đủ hàng");
  await expect(page.getByTestId("movement-row").first()).toHaveText("SKU-C · Nhập kho 100 · 10 → 110 · Nhận hàng PO001");
});

test("huỷ đơn nhập: huỷ được khi Nháp hoặc Đã gửi, không cộng tồn kho", async ({ page }) => {
  await page.goto("/lab/inventory/po");
  await page.getByTestId("reset-data").click();
  await createPo(page, "SKU-A", "10");
  await page.getByRole("button", { name: "Huỷ đơn PO001" }).click();
  await expect(page.getByTestId("po-status")).toHaveText("Đã huỷ");
  await expect(page.getByRole("button", { name: /PO001$/ })).toHaveCount(0);

  await createPo(page, "SKU-A", "10");
  await page.getByRole("button", { name: "Gửi đơn PO002" }).click();
  await expect(page.getByRole("button", { name: "Huỷ đơn PO002" })).toBeVisible();

  await page.getByRole("link", { name: "Tồn kho" }).click();
  await expect(qty(page, "SKU-A")).toHaveText("120");
});

test("số lượng đặt: biên 1 và 5000 hợp lệ, 0 và 5001 bị từ chối", async ({ page }) => {
  await page.goto("/lab/inventory/po");
  await page.getByTestId("reset-data").click();
  for (const bad of ["0", "5001", "abc"]) {
    await createPo(page, "SKU-A", bad);
    await expect(page.getByTestId("po-message")).toHaveText("Số lượng đặt từ 1 đến 5000");
  }
  await createPo(page, "SKU-A", "1");
  await expect(page.getByTestId("po-message")).toHaveText("Đã tạo PO001");
  await createPo(page, "SKU-A", "5000");
  await expect(page.getByTestId("po-message")).toHaveText("Đã tạo PO002");
  await expect(page.getByTestId("po-row").last()).toContainText("15.000.000 ₫");
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ page }) => {
  await open(page, "?bugs=BUG-01,BUG-02,BUG-03");
  await expect(label(page, "SKU-B")).toHaveText("Đủ hàng"); // BUG-03: đúng mức đặt lại không báo sắp hết
  await move(page, { sku: "SKU-C", type: "Xuất kho", qty: "11" });
  await expect(qty(page, "SKU-C")).toHaveText("-1"); // BUG-01: tồn âm

  await page.getByRole("link", { name: "Đơn nhập hàng" }).click();
  await createPo(page, "SKU-A", "100");
  await page.getByRole("button", { name: "Gửi đơn PO001" }).click();
  await page.getByRole("button", { name: "Nhận hàng PO001" }).click();
  await page.getByRole("link", { name: "Tồn kho" }).click();
  await expect(qty(page, "SKU-A")).toHaveText("320"); // BUG-02: cộng gấp đôi (120 + 200)
});
