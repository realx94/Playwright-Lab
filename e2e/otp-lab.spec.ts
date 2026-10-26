import { test, expect, type BrowserContext, type Page } from "@playwright/test";

async function readOtp(context: BrowserContext): Promise<string> {
  const inbox = await context.newPage();
  await inbox.goto("/lab/inbox");
  const text = await inbox.getByTestId("email-item").first().innerText();
  await inbox.close();
  const m = text.match(/\b(\d{6})\b/);
  if (!m) throw new Error("Không tìm thấy OTP trong email");
  return m[1];
}

async function requestCode(page: Page, email = "user@lab.dev", url = "/lab/otp") {
  await page.goto(url);
  await page.getByTestId("reset-data").click();
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Gửi mã" }).click();
  await expect(page.getByLabel("Mã OTP")).toBeVisible();
}

async function submit(page: Page, code: string) {
  await page.getByLabel("Mã OTP").fill(code);
  await page.getByRole("button", { name: "Xác nhận" }).click();
}

test("đăng nhập bằng OTP đọc từ hộp thư", async ({ page, context }) => {
  await requestCode(page);
  const otp = await readOtp(context);
  await submit(page, otp);
  await expect(page.getByTestId("dashboard")).toBeVisible();
});

test("email chưa đăng ký vẫn thấy thông báo trung tính nhưng không có thư", async ({ page, context }) => {
  await requestCode(page, "nobody@lab.dev");
  await expect(page.getByTestId("otp-message")).toContainText("Nếu email hợp lệ");
  const inbox = await context.newPage();
  await inbox.goto("/lab/inbox");
  await expect(inbox.getByTestId("email-item")).toHaveCount(0);
});

test("nhập sai 3 lần thì mã bị huỷ, mã đúng cũng không dùng được", async ({ page, context }) => {
  await requestCode(page);
  const otp = await readOtp(context);
  const wrong = otp === "111111" ? "222222" : "111111";
  await submit(page, wrong);
  await expect(page.getByTestId("otp-message")).toContainText("Còn 2 lần");
  await submit(page, wrong);
  await submit(page, wrong);
  await expect(page.getByTestId("otp-message")).toContainText("đã bị huỷ");
  await submit(page, otp);
  await expect(page.getByTestId("otp-message")).toContainText("không hợp lệ hoặc đã hết hạn");
});

test("BUG-01 cho phép nhập lần thứ 4", async ({ page, context }) => {
  await requestCode(page, "user@lab.dev", "/lab/otp?bugs=BUG-01");
  const otp = await readOtp(context);
  const wrong = otp === "111111" ? "222222" : "111111";
  for (let i = 0; i < 3; i++) await submit(page, wrong);
  await submit(page, otp);
  await expect(page.getByTestId("dashboard")).toBeVisible();
});

// setFixedTime đặt đúng giờ giả, nên kiểm tra được chính xác biên 300 giây.
const T0 = new Date("2026-03-01T10:00:00");
for (const [offset, ok] of [
  [299, true],
  [300, true],
  [301, false],
] as const) {
  test(`mã ở giây thứ ${offset} ${ok ? "còn hiệu lực" : "đã hết hạn"}`, async ({ page, context }) => {
    await context.clock.setFixedTime(T0);
    await requestCode(page);
    const otp = await readOtp(context);
    await context.clock.setFixedTime(new Date(T0.getTime() + offset * 1000));
    await submit(page, otp);
    if (ok) await expect(page.getByTestId("dashboard")).toBeVisible();
    else await expect(page.getByTestId("otp-message")).toContainText("hết hạn");
  });
}

test("BUG-02 làm mã sống tới 10 phút", async ({ page, context }) => {
  await context.clock.install();
  await requestCode(page, "user@lab.dev", "/lab/otp?bugs=BUG-02");
  const otp = await readOtp(context);
  await context.clock.fastForward("06:00");
  await submit(page, otp);
  await expect(page.getByTestId("dashboard")).toBeVisible();
});

test("gửi lại bị khoá 60 giây, sau đó mã cũ không còn hiệu lực", async ({ page, context }) => {
  await context.clock.install();
  await requestCode(page);
  const first = await readOtp(context);
  await expect(page.getByRole("button", { name: "Gửi lại mã" })).toBeDisabled();
  await expect(page.getByTestId("cooldown")).toContainText("Gửi lại sau");

  await context.clock.fastForward("01:01");
  await expect(page.getByRole("button", { name: "Gửi lại mã" })).toBeEnabled();
  await page.getByRole("button", { name: "Gửi lại mã" }).click();

  const inbox = await context.newPage();
  await inbox.goto("/lab/inbox");
  await expect(inbox.getByTestId("email-item")).toHaveCount(2);
  const second = (await inbox.getByTestId("email-item").first().innerText()).match(/\b(\d{6})\b/)![1];
  await inbox.close();

  if (first !== second) {
    await submit(page, first);
    await expect(page.getByTestId("otp-message")).toContainText("Mã không đúng");
  }
  await submit(page, second);
  await expect(page.getByTestId("dashboard")).toBeVisible();
});

test("hộp thư có thể xoá và hiển thị người nhận", async ({ page, context }) => {
  await requestCode(page);
  const inbox = await context.newPage();
  await inbox.goto("/lab/inbox");
  await expect(inbox.getByTestId("email-to")).toHaveText("user@lab.dev");
  await inbox.getByTestId("inbox-clear").click();
  await expect(inbox.getByTestId("email-item")).toHaveCount(0);
});
