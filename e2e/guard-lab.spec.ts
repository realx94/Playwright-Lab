import { test, expect, type APIRequestContext, type Page } from "@playwright/test";

const URL = "/api/lab/guard/login";
const wrong = { email: "user@lab.dev", password: "sai" };
const right = { email: "user@lab.dev", password: "Passw0rd!" };

async function failTwice(request: APIRequestContext, query = "") {
  for (let i = 0; i < 2; i++) expect((await request.post(URL + query, { data: wrong })).status()).toBe(401);
}

async function attempt(page: Page, password: string) {
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

test("đăng nhập đúng; sai mật khẩu báo số lần còn lại", async ({ request }) => {
  const bad = await request.post(URL, { data: wrong });
  expect(bad.status()).toBe(401);
  expect(await bad.json()).toMatchObject({ attemptsLeft: 3, captchaRequired: false });
  expect((await request.post(URL, { data: right })).status()).toBe(200);
});

test("sau 2 lần sai phải có CAPTCHA, kể cả khi mật khẩu đúng", async ({ request }) => {
  await failTwice(request);
  const noCaptcha = await request.post(URL, { data: right });
  expect(noCaptcha.status()).toBe(403);
  expect((await noCaptcha.json()).code).toBe("captcha_required");

  expect((await request.post(URL, { data: { ...right, captcha: "sai-token" } })).status()).toBe(403);
  expect((await request.post(URL, { data: { ...right, captcha: "captcha-ok" } })).status()).toBe(200);
});

test("sai 4 lần thì khóa: 429 kèm Retry-After, hết hạn thì đăng nhập lại được", async ({ request }) => {
  await failTwice(request);
  const captcha = { captcha: "captcha-ok" };
  expect((await request.post(URL, { data: { ...wrong, ...captcha } })).status()).toBe(401);
  const locked = await request.post(URL, { data: { ...wrong, ...captcha } });
  expect(locked.status()).toBe(429);
  const retryAfter = Number(locked.headers()["retry-after"]);
  expect(retryAfter).toBeGreaterThan(0);
  expect(retryAfter).toBeLessThanOrEqual(5);

  // Đang bị khóa: mật khẩu đúng cũng bị từ chối
  expect((await request.post(URL, { data: { ...right, ...captcha } })).status()).toBe(429);

  // Chờ theo Retry-After rồi thử lại (backoff đúng cách), không dùng chờ cố định
  await expect
    .poll(async () => (await request.post(URL, { data: { ...right, ...captcha } })).status(), { timeout: 10_000, intervals: [500] })
    .toBe(200);
});

test("UI: CAPTCHA chế độ test tự đạt; khóa hiện đếm ngược rồi mở lại", async ({ page }) => {
  await page.goto("/lab/guard?captcha=test");
  await page.getByTestId("reset-data").click();

  await attempt(page, "x1");
  await expect(page.getByTestId("guard-message")).toHaveText("Sai email hoặc mật khẩu. Còn 3 lần thử");
  await attempt(page, "x2");
  await expect(page.getByTestId("captcha-status")).toHaveText("CAPTCHA: chế độ test, tự động đạt");
  await attempt(page, "x3");
  await attempt(page, "x4");
  await expect(page.getByTestId("guard-message")).toContainText("Quá nhiều lần thử");
  await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeDisabled();
  await expect(page.getByTestId("guard-countdown")).toBeVisible();

  await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeEnabled({ timeout: 10_000 });
  await attempt(page, "Passw0rd!");
  await expect(page.getByTestId("guard-welcome")).toBeVisible();
});

test("UI: giải CAPTCHA bằng cách đọc ký tự (chỉ để học, thực tế dùng khoá test)", async ({ page }) => {
  await page.goto("/lab/guard");
  await page.getByTestId("reset-data").click();
  await attempt(page, "x1");
  await attempt(page, "x2");

  await attempt(page, "Passw0rd!");
  await expect(page.getByTestId("guard-message")).toHaveText("Cần xác nhận CAPTCHA");

  await page.getByLabel("Ký tự CAPTCHA").fill("SAI00");
  await page.getByRole("button", { name: "Xác nhận CAPTCHA" }).click();
  await expect(page.getByTestId("captcha-status")).toHaveText("CAPTCHA: sai, thử lại");

  const text = (await page.getByTestId("captcha-challenge").textContent())!;
  await page.getByLabel("Ký tự CAPTCHA").fill(text);
  await page.getByRole("button", { name: "Xác nhận CAPTCHA" }).click();
  await expect(page.getByTestId("captcha-status")).toHaveText("CAPTCHA: đã xác nhận");
  await attempt(page, "Passw0rd!");
  await expect(page.getByTestId("guard-welcome")).toBeVisible();
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ request }) => {
  const q = "?bugs=BUG-01,BUG-02,BUG-03";
  await failTwice(request, q);
  // BUG-01: không đòi CAPTCHA
  expect((await request.post(URL + q, { data: wrong })).status()).toBe(401);
  const locked = await request.post(URL + q, { data: wrong });
  expect(locked.status()).toBe(429);
  // BUG-02: thiếu Retry-After
  expect(locked.headers()["retry-after"]).toBeUndefined();
  // BUG-03: mật khẩu đúng vẫn qua khi đang bị khóa
  expect((await request.post(URL + q, { data: right })).status()).toBe(200);
});
