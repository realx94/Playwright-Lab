import { test, expect, type Page } from "@playwright/test";

async function start(page: Page, query = "") {
  await page.goto("/lab/oauth" + query);
  await page.getByTestId("reset-data").click();
}

async function login(page: Page, who: "Alice" | "Bob" = "Alice") {
  await page.getByRole("button", { name: "Đăng nhập bằng LabID" }).click();
  await page.waitForURL(/\/lab\/oauth\/idp/);
  await page.getByRole("radio", { name: new RegExp(who) }).check();
  await page.getByRole("button", { name: "Cho phép" }).click();
  await expect(page.getByTestId("oauth-welcome")).toContainText(who);
}

const readCode = (page: Page) =>
  page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("lab:oauth:codes") ?? "{}"))[0]);
const readState = (page: Page) => page.evaluate(() => sessionStorage.getItem("lab:oauth:state"));

test("đăng nhập bằng chuyển hướng: phải chọn tài khoản rồi Cho phép", async ({ page }) => {
  await start(page);
  await page.getByRole("button", { name: "Đăng nhập bằng LabID" }).click();
  await page.waitForURL(/\/lab\/oauth\/idp/);
  await expect(page.getByTestId("idp-scope")).toHaveText("profile email");

  await page.getByRole("button", { name: "Cho phép" }).click();
  await expect(page.getByTestId("idp-message")).toHaveText("Vui lòng chọn một tài khoản");

  await page.getByRole("radio", { name: /Alice/ }).check();
  await page.getByRole("button", { name: "Cho phép" }).click();
  await expect(page).toHaveURL(/\/lab\/oauth$/);
  await expect(page.getByTestId("oauth-welcome")).toContainText("alice@lab.dev");
  await expect(page.getByTestId("oauth-user-count")).toHaveText("Tài khoản trong hệ thống: 1");
});

test("Từ chối thì không đăng nhập", async ({ page }) => {
  await start(page);
  await page.getByRole("button", { name: "Đăng nhập bằng LabID" }).click();
  await page.getByRole("button", { name: "Từ chối" }).click();
  await expect(page.getByTestId("oauth-message")).toHaveText("Bạn đã từ chối cấp quyền");
  await expect(page.getByTestId("oauth-welcome")).toHaveCount(0);
});

test("đăng nhập bằng popup và popup tự đóng", async ({ page }) => {
  await start(page);
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Đăng nhập bằng popup" }).click();
  const popup = await popupPromise;
  await popup.getByRole("radio", { name: /Bob/ }).check();
  await popup.getByRole("button", { name: "Cho phép" }).click();
  await popup.waitForEvent("close");
  await expect(page.getByTestId("oauth-welcome")).toContainText("bob@lab.dev");
});

test("IdP từ chối redirect_uri và client_id không hợp lệ", async ({ page }) => {
  await page.goto("/lab/oauth/idp?client_id=lab-app&redirect_uri=https://evil.example/cb&state=x");
  await expect(page.getByTestId("idp-error")).toContainText("redirect_uri không khớp");
  await expect(page.getByRole("button", { name: "Cho phép" })).toHaveCount(0);

  await page.goto("/lab/oauth/idp?client_id=khac&redirect_uri=/lab/oauth/callback&state=x");
  await expect(page.getByTestId("idp-error")).toContainText("client_id không hợp lệ");
});

test("state không khớp bị từ chối (chống CSRF)", async ({ page }) => {
  await start(page);
  await login(page);
  const code = await readCode(page);
  await page.getByRole("button", { name: "Đăng xuất" }).click();

  await page.goto(`/lab/oauth?code=${code}&state=gia-mao`);
  await expect(page.getByTestId("oauth-message")).toHaveText("State không khớp, yêu cầu bị từ chối");
  await expect(page.getByTestId("oauth-welcome")).toHaveCount(0);
});

test("authorization code chỉ dùng một lần", async ({ page }) => {
  await start(page);
  await login(page);
  const code = await readCode(page);
  const state = await readState(page);
  await page.getByRole("button", { name: "Đăng xuất" }).click();

  await page.goto(`/lab/oauth?code=${code}&state=${state}`);
  await expect(page.getByTestId("oauth-message")).toHaveText("Mã xác thực đã được sử dụng");
});

for (const [seconds, ok] of [
  [60, true],
  [61, false],
] as const) {
  test(`code ở giây thứ ${seconds} ${ok ? "còn hiệu lực" : "đã hết hạn"}`, async ({ page, context }) => {
    const T0 = new Date("2026-03-01T10:00:00Z");
    await context.clock.setFixedTime(T0);
    await start(page);
    // Chặn callback để code được cấp nhưng chưa được đổi.
    await page.route("**/lab/oauth/callback*", (r) => r.fulfill({ contentType: "text/html", body: "<p>blocked</p>" }));
    await page.getByRole("button", { name: "Đăng nhập bằng LabID" }).click();
    await page.getByRole("radio", { name: /Alice/ }).check();
    await page.getByRole("button", { name: "Cho phép" }).click();
    await expect(page.getByText("blocked")).toBeVisible();
    await page.unroute("**/lab/oauth/callback*");

    const code = await readCode(page);
    const state = await readState(page);
    await context.clock.setFixedTime(new Date(T0.getTime() + seconds * 1000));
    await page.goto(`/lab/oauth?code=${code}&state=${state}`);
    if (ok) await expect(page.getByTestId("oauth-welcome")).toBeVisible();
    else await expect(page.getByTestId("oauth-message")).toHaveText("Mã xác thực đã hết hạn");
  });
}

test("phiên hết hạn sau 1 giờ", async ({ page, context }) => {
  const T0 = new Date("2026-03-01T10:00:00Z");
  await context.clock.setFixedTime(T0);
  await start(page);
  await login(page);

  await context.clock.setFixedTime(new Date(T0.getTime() + 59 * 60_000));
  await page.reload();
  await expect(page.getByTestId("oauth-welcome")).toBeVisible();

  await context.clock.setFixedTime(new Date(T0.getTime() + 61 * 60_000));
  await page.reload();
  await expect(page.getByTestId("oauth-message")).toHaveText("Phiên đã hết hạn, vui lòng đăng nhập lại");
  await expect(page.getByTestId("oauth-welcome")).toHaveCount(0);
});

test("đăng nhập lại cùng email không tạo tài khoản trùng", async ({ page }) => {
  await start(page);
  await login(page);
  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await login(page);
  await expect(page.getByTestId("oauth-user-count")).toHaveText("Tài khoản trong hệ thống: 1");

  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await login(page, "Bob");
  await expect(page.getByTestId("oauth-user-count")).toHaveText("Tài khoản trong hệ thống: 2");
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ page }) => {
  await start(page, "?bugs=BUG-01,BUG-02,BUG-03");
  await login(page);
  const code = await readCode(page);
  await page.getByRole("button", { name: "Đăng xuất" }).click();

  // BUG-01 + BUG-02: state sai và code đã dùng vẫn được chấp nhận
  await page.goto(`/lab/oauth?code=${code}&state=gia-mao&bugs=BUG-01,BUG-02,BUG-03`);
  await expect(page.getByTestId("oauth-welcome")).toBeVisible();

  // BUG-03: tài khoản bị nhân đôi
  await expect(page.getByTestId("oauth-user-count")).toHaveText("Tài khoản trong hệ thống: 2");
});
