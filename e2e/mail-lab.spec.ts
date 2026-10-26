import { test, expect, type BrowserContext, type Page } from "@playwright/test";

async function open(page: Page, query = "") {
  await page.goto("/lab/mail" + query);
  await page.getByTestId("reset-data").click();
}

/** Mở hộp thư giả ở tab mới (cùng context nên dùng chung localStorage). */
async function inbox(context: BrowserContext) {
  const p = await context.newPage();
  await p.goto("/lab/inbox");
  return p;
}

async function order(page: Page, o: { name?: string; email?: string; product?: string; qty?: string; lang?: string } = {}) {
  await page.getByLabel("Tên khách hàng").fill(o.name ?? "Nguyễn An");
  await page.getByLabel("Email đặt hàng").fill(o.email ?? "an@lab.dev");
  await page.getByLabel("Sản phẩm").selectOption({ label: o.product ?? "Giày" });
  await page.getByLabel("Số lượng").fill(o.qty ?? "3");
  await page.getByLabel("Ngôn ngữ email").selectOption(o.lang ?? "vi");
  await page.getByRole("button", { name: "Đặt hàng" }).click();
}

test("email xác nhận đơn hàng tiếng Việt: người nhận, tiêu đề, nội dung và tiền", async ({ page, context }) => {
  await open(page);
  await order(page);
  await expect(page.getByTestId("order-message")).toHaveText("Đã đặt đơn #A1001. Email xác nhận đã được gửi tới an@lab.dev");

  const box = await inbox(context);
  await expect(box.getByTestId("email-item")).toHaveCount(1);
  await expect(box.getByTestId("email-to")).toHaveText("an@lab.dev");
  await expect(box.getByTestId("email-subject")).toHaveText("Xác nhận đơn hàng #A1001");
  const body = box.getByTestId("email-body");
  await expect(body).toContainText("Xin chào Nguyễn An");
  await expect(body).toContainText("3 × Giày = 750.000 ₫");
  await expect(body).toContainText("Tổng cộng: 750.000 ₫");
});

test("email tiếng Anh dùng định dạng tiền và từ ngữ tiếng Anh", async ({ page, context }) => {
  await open(page);
  await order(page, { lang: "en" });
  const box = await inbox(context);
  await expect(box.getByTestId("email-subject")).toHaveText("Order confirmation #A1001");
  await expect(box.getByTestId("email-body")).toContainText("Total: 750,000 VND");
  await expect(box.getByTestId("email-body")).toContainText("3 × Shoes = 750,000 VND");
});

test("mở liên kết trong email dẫn tới đúng đơn hàng", async ({ page, context }) => {
  await open(page);
  await order(page);
  const box = await inbox(context);
  await box.getByRole("link", { name: /\/lab\/mail\/order\/A1001/ }).click();
  await expect(box.getByTestId("order-title")).toHaveText("Đơn hàng #A1001");
  await expect(box.getByTestId("order-total")).toHaveText("Tổng cộng: 750.000 ₫");

  await box.goto("/lab/mail/order/A9999");
  await expect(box.getByTestId("order-missing")).toBeVisible();
});

test("kiểm tra dữ liệu đặt hàng và không gửi email khi lỗi", async ({ page, context }) => {
  await open(page);
  await order(page, { name: " ", email: "an@lab.dev" });
  await expect(page.getByTestId("order-message")).toHaveText("Tên khách hàng bắt buộc, tối đa 50 ký tự");
  await order(page, { email: "sai" });
  await expect(page.getByTestId("order-message")).toHaveText("Email không hợp lệ");
  await order(page, { qty: "11" });
  await expect(page.getByTestId("order-message")).toHaveText("Số lượng là số nguyên từ 1 đến 10");

  const box = await inbox(context);
  await expect(box.getByTestId("inbox-count")).toHaveText("0 thư");
});

async function requestReset(page: Page, email: string) {
  await page.getByLabel("Email tài khoản").fill(email);
  await page.getByRole("button", { name: "Gửi liên kết đặt lại" }).click();
}

test("quên mật khẩu: email lạ nhận thông báo trung tính và không có thư nào", async ({ page, context }) => {
  await open(page);
  await requestReset(page, "la@lab.dev");
  await expect(page.getByTestId("reset-message")).toHaveText("Nếu email đã đăng ký, chúng tôi đã gửi liên kết đặt lại mật khẩu");
  const box = await inbox(context);
  await expect(box.getByTestId("inbox-count")).toHaveText("0 thư");
});

test("đặt lại mật khẩu bằng liên kết trong email, liên kết chỉ dùng một lần", async ({ page, context }) => {
  await open(page);
  await requestReset(page, "user@lab.dev");
  await expect(page.getByTestId("reset-message")).toHaveText("Nếu email đã đăng ký, chúng tôi đã gửi liên kết đặt lại mật khẩu");

  const box = await inbox(context);
  await expect(box.getByTestId("email-subject")).toHaveText("Đặt lại mật khẩu");
  await expect(box.getByTestId("email-to")).toHaveText("user@lab.dev");
  const href = (await box.getByRole("link", { name: /\/lab\/mail\/reset\?token=/ }).getAttribute("href"))!;
  expect(href).toMatch(/\/lab\/mail\/reset\?token=t-[a-z0-9]+$/);

  await box.goto(href);
  await box.getByLabel("Mật khẩu mới").fill("yeu");
  await box.getByLabel("Nhập lại mật khẩu").fill("yeu");
  await box.getByRole("button", { name: "Đổi mật khẩu" }).click();
  await expect(box.getByTestId("reset-error")).toHaveText("Mật khẩu tối thiểu 8 ký tự và có ít nhất một chữ số");

  await box.getByLabel("Mật khẩu mới").fill("MatKhau123");
  await box.getByLabel("Nhập lại mật khẩu").fill("MatKhau124");
  await box.getByRole("button", { name: "Đổi mật khẩu" }).click();
  await expect(box.getByTestId("reset-error")).toHaveText("Mật khẩu xác nhận không khớp");

  await box.getByLabel("Nhập lại mật khẩu").fill("MatKhau123");
  await box.getByRole("button", { name: "Đổi mật khẩu" }).click();
  await expect(box.getByTestId("reset-done")).toHaveText("Đã đổi mật khẩu thành công");

  await box.goto(href);
  await expect(box.getByTestId("reset-invalid")).toBeVisible();
});

for (const [seconds, ok] of [
  [15 * 60, true],
  [15 * 60 + 1, false],
] as const) {
  test(`liên kết đặt lại ở giây thứ ${seconds} ${ok ? "còn hiệu lực" : "đã hết hạn"}`, async ({ page, context }) => {
    const T0 = new Date("2026-03-01T10:00:00Z");
    await context.clock.setFixedTime(T0);
    await open(page);
    await requestReset(page, "user@lab.dev");

    const box = await inbox(context);
    const href = (await box.getByRole("link", { name: /reset\?token=/ }).getAttribute("href"))!;
    await context.clock.setFixedTime(new Date(T0.getTime() + seconds * 1000));
    await box.goto(href);
    if (ok) await expect(box.getByLabel("Mật khẩu mới")).toBeVisible();
    else await expect(box.getByTestId("reset-invalid")).toBeVisible();
  });
}

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ page, context }) => {
  await open(page, "?bugs=BUG-01,BUG-02,BUG-03");
  await order(page, { qty: "3" });
  await requestReset(page, "la@lab.dev");

  const box = await inbox(context);
  await expect(box.getByTestId("email-item")).toHaveCount(2); // BUG-01: email lạ vẫn nhận thư
  await expect(box.getByTestId("email-body").nth(1)).toContainText("Tổng cộng: 250.000 ₫"); // BUG-02: bỏ qua số lượng

  const href = (await box.getByRole("link", { name: /reset\?token=/ }).getAttribute("href"))!;
  for (let i = 0; i < 2; i++) {
    await box.goto(href + "&bugs=BUG-03");
    await box.getByLabel("Mật khẩu mới").fill("MatKhau123");
    await box.getByLabel("Nhập lại mật khẩu").fill("MatKhau123");
    await box.getByRole("button", { name: "Đổi mật khẩu" }).click();
    await expect(box.getByTestId("reset-done")).toBeVisible(); // BUG-03: dùng lại được
  }
});
