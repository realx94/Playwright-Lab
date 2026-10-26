import { test, expect, type APIRequestContext } from "@playwright/test";
import { createHmac } from "node:crypto";

const SECRET = "whsec_lab_secret";
const URL = "/api/lab/webhook";
const nowSec = () => Math.floor(Date.now() / 1000);

const event = (id: string, invoice = "inv-1", amount = 100_000, type = "invoice.paid") =>
  JSON.stringify({ id, type, data: { invoice_id: invoice, amount } });

/** Gửi webhook đã ký đúng chuẩn: sha256=HMAC(secret, timestamp + "." + body). */
async function send(request: APIRequestContext, body: string, opts: { ts?: number; secret?: string; signature?: string | null; query?: string } = {}) {
  const ts = String(opts.ts ?? nowSec());
  const signature =
    opts.signature !== undefined ? opts.signature : "sha256=" + createHmac("sha256", opts.secret ?? SECRET).update(`${ts}.${body}`).digest("hex");
  const headers: Record<string, string> = { "content-type": "application/json", "x-timestamp": ts };
  if (signature) headers["x-signature"] = signature;
  return request.post(URL + (opts.query ?? ""), { headers, data: Buffer.from(body) }); // Buffer để gửi đúng từng byte đã ký
}

const state = async (request: APIRequestContext) => (await request.get(URL + "/state")).json();

test("sự kiện hợp lệ cập nhật hóa đơn và doanh thu", async ({ request }) => {
  const res = await send(request, event("evt_1"));
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ received: true, duplicate: false });

  const s = await state(request);
  expect(s.invoices.find((i: { id: string }) => i.id === "inv-1").status).toBe("paid");
  expect(s.revenue).toBe(100_000);
});

test("chữ ký sai, thiếu, sai secret hoặc body bị sửa đều trả 401", async ({ request }) => {
  const body = event("evt_2");
  expect((await send(request, body, { signature: "sha256=deadbeef" })).status()).toBe(401);
  expect((await send(request, body, { signature: null })).status()).toBe(401);
  expect((await send(request, body, { secret: "whsec_khac" })).status()).toBe(401);

  // chữ ký của body khác (body bị sửa sau khi ký)
  const ts = String(nowSec());
  const sigOfOther = "sha256=" + createHmac("sha256", SECRET).update(`${ts}.${event("evt_khac")}`).digest("hex");
  expect((await send(request, body, { ts: Number(ts), signature: sigOfOther })).status()).toBe(401);
  expect((await state(request)).revenue).toBe(0);
});

test("timestamp lệch quá 300 giây bị từ chối (chống replay)", async ({ request }) => {
  expect((await send(request, event("evt_3"), { ts: nowSec() - 600 })).status()).toBe(400);
  expect((await send(request, event("evt_3"), { ts: nowSec() + 600 })).status()).toBe(400);
  expect((await send(request, event("evt_3"), { ts: nowSec() - 290 })).status()).toBe(200);
});

test("sự kiện trùng id chỉ xử lý một lần (idempotent)", async ({ request }) => {
  await send(request, event("evt_4"));
  const again = await send(request, event("evt_4"));
  expect(again.status()).toBe(200);
  expect((await again.json()).duplicate).toBe(true);
  expect((await state(request)).revenue).toBe(100_000);
});

test("lỗi nghiệp vụ: số tiền lệch 422, hóa đơn lạ 404, loại sự kiện lạ 422, JSON hỏng 400", async ({ request }) => {
  expect((await send(request, event("evt_5", "inv-1", 99_999))).status()).toBe(422);
  expect((await send(request, event("evt_6", "inv-999"))).status()).toBe(404);
  expect((await send(request, event("evt_7", "inv-1", 100_000, "invoice.refunded"))).status()).toBe(422);
  expect((await send(request, "{khong-phai-json")).status()).toBe(400);
  expect((await state(request)).revenue).toBe(0);
});

test("đối tác retry khi nhận 503 cho tới khi thành công", async ({ request }) => {
  const body = event("evt_flaky_1", "inv-2", 250_000);
  const statuses: number[] = [];
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await send(request, body);
    statuses.push(res.status());
    if (res.ok()) break;
    await new Promise((r) => setTimeout(r, 200 * 2 ** attempt)); // backoff lũy thừa
  }
  expect(statuses).toEqual([503, 503, 200]);
  expect((await state(request)).revenue).toBe(250_000);
});

test("UI: đối tác gửi webhook sau một khoảng trễ và hóa đơn tự cập nhật", async ({ page }) => {
  await page.goto("/lab/webhooks");
  await page.getByTestId("reset-data").click();
  await expect(page.getByTestId("invoice-status-inv-2")).toHaveText("Chưa thanh toán");

  await page.getByRole("button", { name: "Giả lập đối tác trả inv-2" }).click();
  await expect(page.getByRole("button", { name: "Đối tác đang gửi…" })).toBeVisible();
  await expect(page.getByTestId("invoice-status-inv-2")).toHaveText("Đã thanh toán", { timeout: 10_000 });
  await expect(page.getByTestId("revenue")).toHaveText("Doanh thu ghi nhận: 250.000 ₫");
  await expect(page.getByTestId("webhook-log")).toContainText("evt_ui_inv-2");
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ request }) => {
  const q = "?bugs=BUG-01,BUG-02,BUG-03";
  // BUG-01: chữ ký sai vẫn được nhận
  expect((await send(request, event("evt_b1"), { signature: "sha256=sai", query: q })).status()).toBe(200);
  // BUG-02: sự kiện trùng bị cộng doanh thu lần hai
  await send(request, event("evt_b1"), { query: q });
  expect((await state(request)).revenue).toBe(200_000);
  // BUG-03: timestamp cũ vẫn được nhận
  expect((await send(request, event("evt_b3", "inv-3", 50_000), { ts: nowSec() - 3600, query: q })).status()).toBe(200);
});
