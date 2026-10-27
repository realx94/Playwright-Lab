import { test, expect, type Page } from "@playwright/test";

const CFG_KEY = "byo:resend";

async function setConfig(page: Page, cfg: { key: string; from?: string; enabled: boolean }) {
  await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [CFG_KEY, JSON.stringify({ from: "", ...cfg })]);
}

test.describe("Cài đặt → Dịch vụ của tôi (Resend)", () => {
  test("lưu khoá, che khoá khi hiển thị, gửi thử thành công ở chế độ thử", async ({ page }) => {
    await page.goto("/settings/services");
    await expect(page.getByTestId("resend-status")).toHaveText("Chưa cấu hình");

    await page.getByLabel("Resend API key").fill("re_test_demo");
    await expect(page.getByTestId("resend-status")).toHaveText("Đã lưu, chưa kiểm tra");
    await expect(page.getByTestId("resend-masked")).toHaveText("Khoá đang lưu: re_****demo");
    await expect(page.getByLabel("Resend API key")).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Hiện khoá" }).click();
    await expect(page.getByLabel("Resend API key")).toHaveAttribute("type", "text");

    await page.getByLabel("Gửi email thử tới").fill("owner@example.com");
    await page.getByRole("button", { name: "Gửi email thử" }).click();
    await expect(page.getByTestId("resend-status")).toHaveText("Đã kết nối");
    await expect(page.getByTestId("resend-message")).toHaveText("Gửi thử (Resend giả) tới owner@example.com: thành công");

    await page.reload();
    await expect(page.getByTestId("resend-masked")).toHaveText("Khoá đang lưu: re_****demo"); // khoá được nhớ trong trình duyệt
  });

  test("onboarding@resend.dev chỉ gửi được tới email chủ tài khoản", async ({ page }) => {
    await page.goto("/settings/services");
    await page.getByLabel("Resend API key").fill("re_test_demo");
    await page.getByLabel("Gửi email thử tới").fill("nguoi-la@example.com");
    await page.getByRole("button", { name: "Gửi email thử" }).click();
    await expect(page.getByTestId("resend-status")).toHaveText("Lỗi");
    await expect(page.getByTestId("resend-message")).toContainText("chỉ gửi được tới email chủ tài khoản");
  });

  test("khoá không hợp lệ (401), vượt tần suất (429) và sai định dạng", async ({ page }) => {
    await page.goto("/settings/services");
    await page.getByLabel("Gửi email thử tới").fill("owner@example.com");

    await page.getByLabel("Resend API key").fill("re_test_invalid");
    await page.getByRole("button", { name: "Gửi email thử" }).click();
    await expect(page.getByTestId("resend-message")).toHaveText("API key không đúng hoặc đã bị thu hồi");

    await page.getByLabel("Resend API key").fill("re_test_limit");
    await page.getByRole("button", { name: "Gửi email thử" }).click();
    await expect(page.getByTestId("resend-message")).toContainText("Vượt giới hạn tần suất");

    await page.getByLabel("Resend API key").fill("abc123");
    await page.getByRole("button", { name: "Gửi email thử" }).click();
    await expect(page.getByTestId("resend-message")).toContainText("phải bắt đầu bằng re_");
    await expect(page.getByTestId("resend-status")).toHaveText("Lỗi");
  });

  test("xuất .env chứa khoá và nút Xoá khoá dọn sạch cấu hình", async ({ page }) => {
    await page.goto("/settings/services");
    await page.getByLabel("Resend API key").fill("re_test_demo");
    await page.getByLabel("Địa chỉ gửi (From)").fill("lab@example.com");
    await expect(page.getByTestId("env-export")).toContainText("RESEND_API_KEY=re_test_demo");
    await expect(page.getByTestId("env-export")).toContainText("MAIL_FROM=lab@example.com");

    await page.getByTestId("resend-remove").click();
    await expect(page.getByTestId("resend-status")).toHaveText("Chưa cấu hình");
    await expect(page.getByTestId("env-export")).toContainText("RESEND_API_KEY=re_...");
    expect(await page.evaluate((k) => localStorage.getItem(k), CFG_KEY)).toBeNull();
  });
});

test.describe("API proxy /api/byo/resend", () => {
  const ok = { to: "owner@example.com", subject: "Chào", text: "Nội dung" };
  const headers = (key = "re_test_demo") => ({ "x-resend-key": key });

  test("thiếu hoặc sai định dạng khoá trả 401", async ({ request }) => {
    expect((await request.post("/api/byo/resend", { data: ok })).status()).toBe(401);
    expect((await request.post("/api/byo/resend", { data: ok, headers: headers("sk_live_xxx") })).status()).toBe(401);
  });

  test("body không phải JSON trả 400; dữ liệu sai trả 422", async ({ request }) => {
    const bad = await request.post("/api/byo/resend", { data: Buffer.from("{không phải json"), headers: { ...headers(), "Content-Type": "application/json" } });
    expect(bad.status()).toBe(400);
    for (const data of [
      { ...ok, to: "khong-phai-email" },
      { ...ok, subject: "" },
      { ...ok, subject: "x".repeat(201) },
      { ...ok, text: "" },
      { ...ok, from: "a@b.co\r\nBcc: x@y.z" },
    ]) {
      expect((await request.post("/api/byo/resend", { data, headers: headers() })).status(), JSON.stringify(data).slice(0, 60)).toBe(422);
    }
  });

  test("khoá thử: thành công, không lưu cache, không phản hồi lại khoá", async ({ request }) => {
    const res = await request.post("/api/byo/resend", { data: ok, headers: headers("re_test_secret999") });
    expect(res.status()).toBe(200);
    expect(res.headers()["cache-control"]).toBe("no-store");
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, mode: "test" });
    expect(body.id).toMatch(/^fake-/);
    expect(JSON.stringify(body)).not.toContain("secret999");
  });

  test("khoá thử: 401, 429 và 403 như Resend thật", async ({ request }) => {
    expect((await request.post("/api/byo/resend", { data: ok, headers: headers("re_test_invalid") })).status()).toBe(401);
    expect((await request.post("/api/byo/resend", { data: ok, headers: headers("re_test_limit") })).status()).toBe(429);
    expect((await request.post("/api/byo/resend", { data: { ...ok, to: "khac@example.com" }, headers: headers() })).status()).toBe(403);
    // Có domain riêng thì gửi được tới người khác
    expect((await request.post("/api/byo/resend", { data: { ...ok, to: "khac@example.com", from: "lab@mydomain.dev" }, headers: headers() })).status()).toBe(200);
  });
});

test.describe("Lab gửi thêm email thật khi người học bật", () => {
  test("OTP: thư vẫn ở hộp thư giả và có dòng trạng thái gửi thật", async ({ page }) => {
    await setConfig(page, { key: "re_test_demo", from: "lab@mydomain.dev", enabled: true });
    await page.goto("/lab/otp");
    await page.getByTestId("reset-data").click();
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByRole("button", { name: "Gửi mã" }).click();
    await expect(page.getByTestId("real-mail-status")).toHaveText("Gửi thử (Resend giả) tới user@lab.dev: thành công");

    await page.goto("/lab/inbox");
    await expect(page.getByTestId("email-item")).toHaveCount(1);
  });

  test("gửi thật lỗi thì lab vẫn chạy và thông báo rõ", async ({ page }) => {
    await setConfig(page, { key: "re_test_invalid", enabled: true });
    await page.goto("/lab/otp");
    await page.getByTestId("reset-data").click();
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByRole("button", { name: "Gửi mã" }).click();
    await expect(page.getByTestId("real-mail-status")).toContainText("Không gửi được email thật: API key không đúng");
    await expect(page.getByTestId("otp-email-shown")).toHaveText("user@lab.dev");
  });

  test("không bật thì không có dòng trạng thái", async ({ page }) => {
    await setConfig(page, { key: "re_test_demo", enabled: false });
    await page.goto("/lab/otp");
    await page.getByTestId("reset-data").click();
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByRole("button", { name: "Gửi mã" }).click();
    await expect(page.getByTestId("otp-email-shown")).toBeVisible();
    await expect(page.getByTestId("real-mail-status")).toHaveCount(0);
  });

  test("email giao dịch (LAB-23) cũng gửi thêm", async ({ page }) => {
    await setConfig(page, { key: "re_test_demo", from: "lab@mydomain.dev", enabled: true });
    await page.goto("/lab/mail");
    await page.getByTestId("reset-data").click();
    await page.getByLabel("Email đặt hàng").fill("khach@example.com");
    await page.getByLabel("Tên khách hàng").fill("Lan");
    await page.getByRole("button", { name: "Đặt hàng" }).click();
    await expect(page.getByTestId("real-mail-status")).toHaveText("Gửi thử (Resend giả) tới khach@example.com: thành công");
  });
});

test.describe("OTP qua SMS giả", () => {
  async function sendSms(page: Page, email: string) {
    await page.goto("/lab/otp");
    await page.getByTestId("reset-data").click();
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Nhận mã qua").selectOption("sms");
    await page.getByRole("button", { name: "Gửi mã" }).click();
  }

  test("mã đến hộp tin nhắn, số điện thoại bị che, nhập mã thì đăng nhập", async ({ page }) => {
    await sendSms(page, "user@lab.dev");
    await expect(page.getByTestId("otp-phone-shown")).toHaveText("090****567");
    await expect(page.getByTestId("otp-message")).toHaveText("Nếu tài khoản hợp lệ, mã xác thực đã được gửi bằng SMS");

    await page.goto("/lab/sms");
    await expect(page.getByTestId("sms-item")).toHaveCount(1);
    await expect(page.getByTestId("sms-to")).toHaveText("0901234567");
    const body = await page.getByTestId("sms-body").innerText();
    expect(body.length).toBeLessThanOrEqual(160);
    const code = body.match(/la (\d{6})\./)![1];

    await page.goto("/lab/otp");
    await page.getByLabel("Mã OTP").fill(code);
    await page.getByRole("button", { name: "Xác nhận" }).click();
    await expect(page.getByTestId("dashboard")).toBeVisible();
  });

  test("email chưa đăng ký: thông báo trung tính và không có tin nhắn nào", async ({ page }) => {
    await sendSms(page, "la@lab.dev");
    await expect(page.getByTestId("otp-message")).toHaveText("Nếu tài khoản hợp lệ, mã xác thực đã được gửi bằng SMS");
    await page.goto("/lab/sms");
    await expect(page.getByTestId("sms-count")).toHaveText("0 tin nhắn");
  });

  test("kênh Email vẫn là mặc định và không tạo SMS", async ({ page }) => {
    await page.goto("/lab/otp");
    await page.getByTestId("reset-data").click();
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByRole("button", { name: "Gửi mã" }).click();
    await expect(page.getByTestId("otp-email-shown")).toBeVisible();
    await page.goto("/lab/sms");
    await expect(page.getByTestId("sms-count")).toHaveText("0 tin nhắn");
  });
});

test.describe("Neon: database của người học", () => {
  const TEST_URL = "postgresql://lab_test:demo@ep-demo.neon.tech/neondb?sslmode=require";
  const H = (url: string) => ({ "x-neon-url": url });

  test("lưu chuỗi kết nối, che mật khẩu, test và tạo schema ở chế độ thử", async ({ page }) => {
    await page.goto("/settings/services");
    await expect(page.getByTestId("neon-status")).toHaveText("Chưa cấu hình");
    await page.getByLabel("Chuỗi kết nối Neon").fill(TEST_URL);
    await expect(page.getByTestId("neon-status")).toHaveText("Đã lưu, chưa kiểm tra");
    await expect(page.getByTestId("neon-masked")).toHaveText("Đang lưu: postgres://lab_test:****@ep-demo.neon.tech/neondb");
    await expect(page.getByLabel("Chuỗi kết nối Neon")).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: "Test connection" }).click();
    await expect(page.getByTestId("neon-status")).toHaveText("Đã kết nối");
    await expect(page.getByTestId("neon-message")).toHaveText("Kết nối thành công (chế độ thử) (database neondb)");

    await page.getByRole("button", { name: "Tạo schema mẫu" }).click();
    await expect(page.getByTestId("neon-tables")).toContainText("Bảng trong schema lab: 8/8");
    await expect(page.getByTestId("neon-tables").getByRole("listitem")).toHaveCount(8);
    await expect(page.getByTestId("neon-tables")).toContainText("lab.orders");

    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Xoá schema mẫu" }).click();
    await expect(page.getByTestId("neon-tables")).toContainText("Bảng trong schema lab: 0/8");

    await page.reload();
    await expect(page.getByTestId("neon-masked")).toBeVisible(); // nhớ lại sau khi tải lại
  });

  test("mật khẩu sai, chuỗi sai định dạng và host lạ đều báo lỗi rõ ràng", async ({ page }) => {
    await page.goto("/settings/services");
    const input = page.getByLabel("Chuỗi kết nối Neon");
    await input.fill("postgresql://lab_test:invalid@ep-demo.neon.tech/neondb");
    await page.getByRole("button", { name: "Test connection" }).click();
    await expect(page.getByTestId("neon-message")).toHaveText("Sai tên đăng nhập hoặc mật khẩu trong chuỗi kết nối");
    await expect(page.getByTestId("neon-status")).toHaveText("Lỗi");

    await input.fill("postgres://a:b@localhost/db");
    await page.getByRole("button", { name: "Test connection" }).click();
    await expect(page.getByTestId("neon-message")).toHaveText("Chỉ hỗ trợ database Neon (host kết thúc bằng .neon.tech)");

    await input.fill("không phải url");
    await page.getByRole("button", { name: "Tạo schema mẫu" }).click();
    await expect(page.getByTestId("neon-message")).toContainText("không đúng định dạng");
  });

  test("xuất DATABASE_URL và xoá chuỗi kết nối", async ({ page }) => {
    await page.goto("/settings/services");
    await page.getByLabel("Chuỗi kết nối Neon").fill(TEST_URL);
    await expect(page.getByTestId("neon-env")).toContainText(`DATABASE_URL=${TEST_URL}`);
    await page.getByTestId("neon-remove").click();
    await expect(page.getByTestId("neon-status")).toHaveText("Chưa cấu hình");
    expect(await page.evaluate(() => localStorage.getItem("byo:neon"))).toBeNull();
  });

  test("API: từ chối host lạ (SSRF), thiếu chuỗi, hành động lạ, body hỏng", async ({ request }) => {
    for (const bad of ["", "postgres://a:b@127.0.0.1/db", "postgres://a:b@169.254.169.254/db", "postgres://a:b@neon.tech.evil.com/db", "http://x.neon.tech/db"]) {
      expect((await request.post("/api/byo/neon", { data: { action: "test" }, headers: H(bad) })).status(), bad).toBe(401);
    }
    expect((await request.post("/api/byo/neon", { data: { action: "select * from users" }, headers: H(TEST_URL) })).status()).toBe(422);
    const broken = await request.post("/api/byo/neon", { data: Buffer.from("{hỏng"), headers: { ...H(TEST_URL), "Content-Type": "application/json" } });
    expect(broken.status()).toBe(400);
  });

  test("API chế độ thử: đủ hành động, không phản hồi lại mật khẩu, không cache", async ({ request }) => {
    const url = "postgresql://lab_test:matkhau-bi-mat@ep-demo.neon.tech/neondb";
    for (const action of ["test", "schema", "status", "drop"]) {
      const res = await request.post("/api/byo/neon", { data: { action }, headers: H(url) });
      expect(res.status(), action).toBe(200);
      expect(res.headers()["cache-control"]).toBe("no-store");
      const text = await res.text();
      expect(text).not.toContain("matkhau-bi-mat");
      expect(JSON.parse(text)).toMatchObject({ ok: true, mode: "test" });
    }
    const schema = await (await request.post("/api/byo/neon", { data: { action: "schema" }, headers: H(url) })).json();
    expect(schema.tables).toEqual(["audit_log", "emails_outbox", "order_items", "orders", "otp_codes", "payments", "users", "webhook_events"]);
    const bad = await request.post("/api/byo/neon", { data: { action: "test" }, headers: H("postgresql://lab_test:invalid@ep-demo.neon.tech/neondb") });
    expect(bad.status()).toBe(401);
  });
});
