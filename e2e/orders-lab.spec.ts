import { test, expect, type APIRequestContext } from "@playwright/test";

const auth = { Authorization: "Bearer admin-token" };
const DB = { "x-db-token": "readonly" };

const order = (over: Record<string, unknown> = {}) => ({
  customer: "Nguyễn An",
  items: [
    { sku: "SKU-A", qty: 2 },
    { sku: "SKU-B", qty: 1 },
  ],
  ...over,
});

/** Tương đương SELECT * FROM <bảng> WHERE <cột>=<giá trị>. */
async function select(request: APIRequestContext, table: string, where: Record<string, string> = {}) {
  const qs = new URLSearchParams(where).toString();
  const res = await request.get(`/api/lab/db/${table}${qs ? "?" + qs : ""}`, { headers: DB });
  expect(res.status()).toBe(200);
  return (await res.json()) as { count: number; rows: Record<string, unknown>[] };
}

test("401, 403 và quyền đọc DB", async ({ request }) => {
  expect((await request.post("/api/lab/orders", { data: order() })).status()).toBe(401);
  expect((await request.post("/api/lab/orders", { headers: { Authorization: "Bearer reader-token" }, data: order() })).status()).toBe(403);
  expect((await request.get("/api/lab/db/orders")).status()).toBe(401);
  expect((await request.get("/api/lab/db/khong-co", { headers: DB })).status()).toBe(404);
});

test("POST /orders ghi đúng orders, order_items, audit_log và trừ tồn kho", async ({ request }) => {
  const res = await request.post("/api/lab/orders", { headers: auth, data: order() });
  expect(res.status()).toBe(201);
  const created = await res.json();
  expect(res.headers()["location"]).toBe("/api/lab/orders/" + created.id);
  expect(created.total).toBe(450_000);

  const orders = await select(request, "orders", { id: created.id });
  expect(orders.count).toBe(1);
  expect(orders.rows[0]).toMatchObject({ customer: "Nguyễn An", total: 450_000, status: "pending", deleted_at: null });
  expect(Math.abs(Date.now() - Date.parse(orders.rows[0].created_at as string))).toBeLessThan(60_000);

  const items = await select(request, "order_items", { order_id: created.id });
  expect(items.rows.map((r) => [r.sku, r.qty, r.price])).toEqual([
    ["SKU-A", 2, 100_000],
    ["SKU-B", 1, 250_000],
  ]);

  const audit = await select(request, "audit_log", { order_id: created.id });
  expect(audit.rows.map((r) => r.action)).toEqual(["order.created"]);

  const stock = Object.fromEntries((await select(request, "products")).rows.map((r) => [r.sku, r.stock]));
  expect(stock).toEqual({ "SKU-A": 18, "SKU-B": 4, "SKU-C": 3 });
});

test("dữ liệu không hợp lệ trả 422 và không ghi gì vào DB", async ({ request }) => {
  const res = await request.post("/api/lab/orders", { headers: auth, data: order({ customer: " ", items: [{ sku: "SKU-X", qty: 0 }] }) });
  expect(res.status()).toBe(422);
  const fields = (await res.json()).errors.map((e: { field: string }) => e.field);
  expect(fields).toEqual(expect.arrayContaining(["customer", "items[0].sku", "items[0].qty"]));
  expect((await select(request, "orders")).count).toBe(0);
  expect((await select(request, "audit_log")).count).toBe(0);
});

test("hết hàng trả 409 và rollback: không có dòng nào được ghi", async ({ request }) => {
  const res = await request.post("/api/lab/orders", {
    headers: auth,
    data: order({ items: [{ sku: "SKU-A", qty: 1 }, { sku: "SKU-C", qty: 4 }] }),
  });
  expect(res.status()).toBe(409);
  expect((await select(request, "orders")).count).toBe(0);
  expect((await select(request, "order_items")).count).toBe(0);
  const stock = Object.fromEntries((await select(request, "products")).rows.map((r) => [r.sku, r.stock]));
  expect(stock["SKU-A"]).toBe(20);
});

test("Idempotency-Key: gửi lại không tạo đơn thứ hai", async ({ request }) => {
  const headers = { ...auth, "Idempotency-Key": "key-123" };
  const first = await request.post("/api/lab/orders", { headers, data: order() });
  const retry = await request.post("/api/lab/orders", { headers, data: order() });
  expect(first.status()).toBe(201);
  expect(retry.status()).toBe(200);
  expect((await retry.json()).id).toBe((await first.json()).id);

  expect((await select(request, "orders")).count).toBe(1);
  const stockA = (await select(request, "products", { sku: "SKU-A" })).rows[0].stock;
  expect(stockA).toBe(18);
});

test("xoá mềm: API không còn thấy nhưng DB vẫn giữ dòng, hoàn tồn kho và ghi audit", async ({ request }) => {
  const created = await (await request.post("/api/lab/orders", { headers: auth, data: order() })).json();

  expect((await request.delete(`/api/lab/orders/${created.id}`, { headers: auth })).status()).toBe(204);
  expect((await request.get(`/api/lab/orders/${created.id}`)).status()).toBe(404);
  expect((await (await request.get("/api/lab/orders")).json()).total).toBe(0);
  expect((await request.delete(`/api/lab/orders/${created.id}`, { headers: auth })).status()).toBe(404);

  const row = (await select(request, "orders", { id: created.id })).rows[0];
  expect(row.status).toBe("cancelled");
  expect(row.deleted_at).not.toBeNull();
  expect((await select(request, "audit_log", { order_id: created.id })).rows.map((r) => r.action)).toEqual(["order.created", "order.deleted"]);
  expect((await select(request, "products", { sku: "SKU-A" })).rows[0].stock).toBe(20);
});

test("so sánh ba nguồn: UI, API và DB cùng một con số", async ({ page }) => {
  await page.goto("/lab/orders");
  await page.getByTestId("reset-data").click();

  await page.getByLabel("Khách hàng").fill("Trần Bình");
  await page.getByLabel("SKU dòng 1").selectOption("SKU-B");
  await page.getByLabel("Số lượng dòng 1").fill("2");
  await page.getByRole("button", { name: "Tạo đơn" }).click();
  await expect(page.getByTestId("order-message")).toContainText("Đã tạo đơn o-1001");

  const row = page.getByTestId("order-row");
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("500.000 ₫"); // nguồn 1: UI

  const api = await (await page.request.get("/api/lab/orders/o-1001")).json(); // nguồn 2: API
  expect(api.total).toBe(500_000);

  const dbRows = await (await page.request.get("/api/lab/db/orders?id=o-1001", { headers: DB })).json(); // nguồn 3: DB
  expect(dbRows.rows[0].total).toBe(500_000);

  await page.getByLabel("Bảng").selectOption("audit_log");
  await page.getByRole("button", { name: "Xem dữ liệu" }).click();
  await expect(page.getByTestId("db-view")).toContainText("order.created");
});

test("BUG-01/02/03/04 làm lộ bốn lỗi có chủ đích", async ({ request }) => {
  // BUG-01: không có audit_log; BUG-02: tổng trong DB lệch so với response
  const res = await request.post("/api/lab/orders?bugs=BUG-01,BUG-02,BUG-03,BUG-04", { headers: auth, data: order() });
  const created = await res.json();
  expect(created.total).toBe(450_000);
  expect((await select(request, "orders", { id: created.id })).rows[0].total).toBe(350_000);
  expect((await select(request, "audit_log")).count).toBe(0);

  // BUG-03: retry cùng Idempotency-Key tạo đơn trùng
  const headers = { ...auth, "Idempotency-Key": "k" };
  await request.post("/api/lab/orders?bugs=BUG-03", { headers, data: order() });
  expect((await request.post("/api/lab/orders?bugs=BUG-03", { headers, data: order() })).status()).toBe(201);

  // BUG-04: báo 409 nhưng đã ghi nửa chừng
  const before = (await select(request, "orders")).count;
  const fail = await request.post("/api/lab/orders?bugs=BUG-04", { headers: auth, data: order({ items: [{ sku: "SKU-C", qty: 9 }] }) });
  expect(fail.status()).toBe(409);
  expect((await select(request, "orders")).count).toBe(before + 1);
});
