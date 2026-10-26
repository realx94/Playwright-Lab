import { test, expect, type Page } from "@playwright/test";

const CARD = { ok: "4242 4242 4242 4242", declined: "4000 0000 0000 0002", funds: "4000 0000 0000 9995", threeDs: "4000 0025 0000 3155" };

async function start(page: Page, query = "") {
  await page.goto("/lab/pay" + query);
  await page.getByTestId("reset-data").click();
}

/** Nhập thẻ trong iframe rồi bấm Thanh toán ở trang cha. */
async function pay(page: Page, number: string, expiry = "12/35", cvc = "123") {
  const frame = page.frameLocator('iframe[title="Khung nhập thẻ"]');
  await frame.getByLabel("Số thẻ").fill(number);
  await frame.getByLabel("Hết hạn (MM/YY)").fill(expiry);
  await frame.getByLabel("CVC").fill(cvc);
  await page.getByRole("button", { name: "Thanh toán" }).click();
}

const status = (page: Page) => page.getByTestId("order-status");

async function paidOrder(page: Page, query = "") {
  await start(page, query);
  await pay(page, CARD.ok);
  await expect(status(page)).toHaveText("Đã thanh toán");
}

const refund = async (page: Page, amount: string) => {
  await page.getByLabel("Số tiền hoàn").fill(amount);
  await page.getByRole("button", { name: "Hoàn tiền" }).click();
};

test("thẻ thành công: đơn chờ webhook rồi chuyển sang Đã thanh toán", async ({ page }) => {
  await start(page);
  await expect(status(page)).toHaveText("Chưa thanh toán");
  await pay(page, CARD.ok);
  await expect(status(page)).toHaveText("Đang chờ webhook");
  await expect(status(page)).toHaveText("Đã thanh toán");
  await expect(page.getByTestId("revenue")).toHaveText("Doanh thu ghi nhận: 500.000 ₫");
  await expect(page.getByTestId("webhook-event")).toHaveText(["payment.succeeded · evt_1"]);
});

test("thẻ bị từ chối và thẻ không đủ số dư", async ({ page }) => {
  await start(page);
  await pay(page, CARD.declined);
  await expect(page.getByTestId("pay-message")).toHaveText("Thẻ bị từ chối");
  await expect(status(page)).toHaveText("Chưa thanh toán");

  await pay(page, CARD.funds);
  await expect(page.getByTestId("pay-message")).toHaveText("Số dư thẻ không đủ");
  await expect(status(page)).toHaveText("Chưa thanh toán");
});

test("kiểm tra dữ liệu thẻ ngay trong iframe", async ({ page }) => {
  await start(page);
  const frame = page.frameLocator('iframe[title="Khung nhập thẻ"]');

  await pay(page, "4242 4242 4242 4241");
  await expect(frame.getByTestId("card-error")).toHaveText("Số thẻ không hợp lệ");
  await expect(page.getByTestId("pay-message")).toHaveText("Vui lòng kiểm tra thông tin thẻ");

  await pay(page, CARD.ok, "01/20");
  await expect(frame.getByTestId("card-error")).toHaveText("Thẻ đã hết hạn");

  await pay(page, CARD.ok, "13/35");
  await expect(frame.getByTestId("card-error")).toHaveText("Ngày hết hạn không hợp lệ");

  await pay(page, CARD.ok, "12/35", "12");
  await expect(frame.getByTestId("card-error")).toHaveText("CVC gồm 3 chữ số");
  await expect(status(page)).toHaveText("Chưa thanh toán");
});

test("thẻ cần 3D Secure: xác thực thành công hoặc thất bại", async ({ page }) => {
  await start(page);
  await pay(page, CARD.threeDs);
  const dialog = page.getByRole("dialog", { name: "Xác thực 3D Secure" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Thất bại" }).click();
  await expect(page.getByTestId("pay-message")).toHaveText("Xác thực 3D Secure thất bại");
  await expect(status(page)).toHaveText("Chưa thanh toán");

  await pay(page, CARD.threeDs);
  await page.getByRole("dialog", { name: "Xác thực 3D Secure" }).getByRole("button", { name: "Xác thực" }).click();
  await expect(status(page)).toHaveText("Đã thanh toán");
});

test("webhook chỉ cập nhật đơn sau 2 giây (điều khiển bằng đồng hồ giả)", async ({ page, context }) => {
  const T0 = new Date("2026-03-01T10:00:00Z");
  await context.clock.setFixedTime(T0);
  await start(page);
  await pay(page, CARD.ok);
  await expect(status(page)).toHaveText("Đang chờ webhook");

  await page.reload();
  await expect(status(page)).toHaveText("Đang chờ webhook"); // trạng thái chờ được giữ qua tải lại
  await expect(page.getByTestId("webhook-event")).toHaveCount(0);

  await context.clock.setFixedTime(new Date(T0.getTime() + 2000));
  await expect(status(page)).toHaveText("Đã thanh toán");
});

test("hoàn tiền một phần rồi toàn phần; hoàn vượt mức bị từ chối", async ({ page }) => {
  await paidOrder(page);

  await refund(page, "0");
  await expect(page.getByTestId("refund-error")).toHaveText("Số tiền hoàn phải lớn hơn 0");

  await refund(page, "200000");
  await expect(status(page)).toHaveText("Hoàn một phần");
  await expect(page.getByTestId("order-refunded")).toHaveText("Đã hoàn: 200.000 ₫");
  await expect(page.getByTestId("revenue")).toHaveText("Doanh thu ghi nhận: 300.000 ₫");

  await refund(page, "300001");
  await expect(page.getByTestId("refund-error")).toHaveText("Số tiền hoàn vượt quá số tiền còn lại");
  await expect(page.getByTestId("order-refunded")).toHaveText("Đã hoàn: 200.000 ₫");

  await refund(page, "300000");
  await expect(status(page)).toHaveText("Đã hoàn tiền");
  await expect(page.getByTestId("revenue")).toHaveText("Doanh thu ghi nhận: 0 ₫");
  await expect(page.getByRole("button", { name: "Hoàn tiền" })).toHaveCount(0);
});

test("webhook gửi lại được xử lý idempotent", async ({ page }) => {
  await paidOrder(page);
  await page.getByRole("button", { name: "Gửi lại webhook" }).click();
  await expect(page.getByTestId("webhook-event").last()).toContainText("trùng, bỏ qua");
  await expect(page.getByTestId("revenue")).toHaveText("Doanh thu ghi nhận: 500.000 ₫");
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ page }) => {
  await start(page, "?bugs=BUG-01,BUG-02,BUG-03");
  await pay(page, CARD.threeDs);
  // BUG-01: thẻ 3D Secure không bị yêu cầu xác thực
  await expect(page.getByRole("dialog", { name: "Xác thực 3D Secure" })).toHaveCount(0);
  await expect(status(page)).toHaveText("Đã thanh toán");

  // BUG-03: webhook gửi lại cộng doanh thu lần nữa
  await page.getByRole("button", { name: "Gửi lại webhook" }).click();
  await expect(page.getByTestId("revenue")).toHaveText("Doanh thu ghi nhận: 1.000.000 ₫");

  // BUG-02: hoàn nhiều hơn số tiền còn lại
  await refund(page, "700000");
  await expect(page.getByTestId("refund-error")).toHaveCount(0);
  await expect(status(page)).toHaveText("Đã hoàn tiền");
});
