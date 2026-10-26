import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { createHmac } from "node:crypto";

function base32Decode(input: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of input.toUpperCase()) {
    value = (value << 5) | alphabet.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** RFC 6238, SHA-1, 6 chữ số, chu kỳ 30 giây. */
function totp(secret: string, atMs: number) {
  const counter = Math.floor(atMs / 1000 / 30);
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", base32Decode(secret)).update(msg).digest();
  const o = h[h.length - 1] & 0xf;
  const n = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1_000_000).padStart(6, "0");
}

// 10:00:00Z chia hết cho 30 giây, nên T0 nằm giữa một chu kỳ (giây thứ 10).
const T0 = new Date("2026-03-01T10:00:10Z").getTime();
const STEP = 30_000;
const at = (ms: number) => new Date(ms);

async function enable(page: Page, context: BrowserContext, query = "") {
  await context.clock.setFixedTime(at(T0));
  await page.goto("/lab/totp" + query);
  await page.getByTestId("reset-data").click();
  await page.getByRole("button", { name: "Bật 2FA" }).click();
  const secret = (await page.getByTestId("totp-secret").textContent())!.trim();
  await page.getByLabel("Mã xác nhận").fill(totp(secret, T0));
  await page.getByRole("button", { name: "Xác nhận" }).click();
  await expect(page.getByTestId("totp-status")).toHaveText("2FA: Đã bật");
  return secret;
}

async function passwordStep(page: Page) {
  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await page.getByLabel("Mật khẩu").fill("Passw0rd!");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
}

const enterCode = async (page: Page, code: string) => {
  await page.getByLabel("Mã xác thực", { exact: true }).fill(code);
  await page.getByRole("button", { name: "Xác nhận" }).click();
};

test("bộ tính TOTP khớp vector kiểm thử của RFC 6238", () => {
  // Khoá ASCII "12345678901234567890" ở thời điểm 59 giây; 6 số cuối của 94287082.
  expect(totp("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", 59_000)).toBe("287082");
});

test("bật 2FA: khoá base32, mã xác nhận và 10 mã khôi phục", async ({ page, context }) => {
  await context.clock.setFixedTime(at(T0));
  await page.goto("/lab/totp");
  await page.getByTestId("reset-data").click();
  await page.getByRole("button", { name: "Bật 2FA" }).click();
  await expect(page.getByTestId("totp-secret")).toHaveText(/^[A-Z2-7]{16}$/);

  await page.getByLabel("Mã xác nhận").fill("12345");
  await page.getByRole("button", { name: "Xác nhận" }).click();
  await expect(page.getByTestId("totp-error")).toHaveText("Mã gồm đúng 6 chữ số");

  const secret = (await page.getByTestId("totp-secret").textContent())!.trim();
  await page.getByLabel("Mã xác nhận").fill(totp(secret, T0));
  await page.getByRole("button", { name: "Xác nhận" }).click();
  await expect(page.getByTestId("totp-status")).toHaveText("2FA: Đã bật");
  await expect(page.getByTestId("recovery-code")).toHaveCount(10);
});

test("đăng nhập hai bước: sai mật khẩu, sai mã, đúng mã", async ({ page, context }) => {
  const secret = await enable(page, context);
  await page.getByRole("button", { name: "Đăng xuất" }).click();

  await page.getByLabel("Mật khẩu").fill("sai-mat-khau");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await expect(page.getByTestId("totp-error")).toHaveText("Sai mật khẩu");

  await page.getByLabel("Mật khẩu").fill("Passw0rd!");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await enterCode(page, "000000");
  await expect(page.getByTestId("totp-error")).toHaveText("Mã không đúng");

  await context.clock.setFixedTime(at(T0 + STEP));
  await enterCode(page, totp(secret, T0 + STEP));
  await expect(page.getByTestId("totp-welcome")).toContainText("user@lab.dev");
});

for (const [name, offsetSteps, ok] of [
  ["mã của chu kỳ trước", -1, true],
  ["mã của chu kỳ kế tiếp", 1, true],
  ["mã cũ hai chu kỳ", -2, false],
  ["mã tương lai hai chu kỳ", 2, false],
] as const) {
  test(`độ lệch thời gian: ${name} ${ok ? "được chấp nhận" : "bị từ chối"}`, async ({ page, context }) => {
    const secret = await enable(page, context);
    await passwordStep(page);
    await enterCode(page, totp(secret, T0 + offsetSteps * STEP));
    if (ok) await expect(page.getByTestId("totp-welcome")).toBeVisible();
    else await expect(page.getByTestId("totp-error")).toHaveText("Mã không đúng");
  });
}

test("mã TOTP đã dùng không dùng lại được trong cùng chu kỳ", async ({ page, context }) => {
  const secret = await enable(page, context);
  await passwordStep(page);
  await enterCode(page, totp(secret, T0));
  await expect(page.getByTestId("totp-welcome")).toBeVisible();

  await passwordStep(page);
  await enterCode(page, totp(secret, T0));
  await expect(page.getByTestId("totp-error")).toHaveText("Mã đã được sử dụng");

  await context.clock.setFixedTime(at(T0 + STEP));
  await enterCode(page, totp(secret, T0 + STEP));
  await expect(page.getByTestId("totp-welcome")).toBeVisible();
});

test("mã khôi phục chỉ dùng được một lần", async ({ page, context }) => {
  await enable(page, context);
  const first = (await page.getByTestId("recovery-code").first().textContent())!.trim();

  await passwordStep(page);
  await page.getByRole("button", { name: "Dùng mã khôi phục" }).click();
  await page.getByLabel("Mã khôi phục", { exact: true }).fill(first);
  await page.getByRole("button", { name: "Dùng mã khôi phục" }).click();
  await expect(page.getByTestId("totp-welcome")).toBeVisible();
  await expect(page.getByTestId("recovery-code").first()).toHaveAttribute("data-used", "true");

  await passwordStep(page);
  await page.getByRole("button", { name: "Dùng mã khôi phục" }).first().click();
  await page.getByLabel("Mã khôi phục", { exact: true }).fill(first);
  await page.getByRole("button", { name: "Dùng mã khôi phục" }).last().click();
  await expect(page.getByTestId("totp-error")).toHaveText("Mã khôi phục đã được sử dụng");
});

test("nhập sai ba lần thì tài khoản bị khóa, kể cả khi nhập đúng", async ({ page, context }) => {
  const secret = await enable(page, context);
  await passwordStep(page);
  for (let i = 0; i < 2; i++) {
    await enterCode(page, "000000");
    await expect(page.getByTestId("totp-error")).toHaveText("Mã không đúng");
  }
  await enterCode(page, "000000");
  await expect(page.getByTestId("totp-error")).toContainText("bị khóa");

  await enterCode(page, totp(secret, T0));
  await expect(page.getByTestId("totp-error")).toContainText("bị khóa");
  await expect(page.getByTestId("totp-welcome")).toHaveCount(0);
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ page, context }) => {
  const secret = await enable(page, context, "?bugs=BUG-01,BUG-02,BUG-03");

  // BUG-01: chấp nhận mã lệch hai chu kỳ
  await passwordStep(page);
  await enterCode(page, totp(secret, T0 - 2 * STEP));
  await expect(page.getByTestId("totp-welcome")).toBeVisible();

  // BUG-03: dùng lại cùng một mã
  await passwordStep(page);
  await enterCode(page, totp(secret, T0 - 2 * STEP));
  await expect(page.getByTestId("totp-welcome")).toBeVisible();

  // BUG-02: mã khôi phục dùng được nhiều lần
  const code = (await page.getByTestId("recovery-code").first().textContent())!.trim();
  for (let i = 0; i < 2; i++) {
    await passwordStep(page);
    await page.getByRole("button", { name: "Dùng mã khôi phục" }).first().click();
    await page.getByLabel("Mã khôi phục", { exact: true }).fill(code);
    await page.getByRole("button", { name: "Dùng mã khôi phục" }).last().click();
    await expect(page.getByTestId("totp-welcome")).toBeVisible();
  }
});
