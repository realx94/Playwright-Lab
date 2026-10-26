import { test, expect } from "@playwright/test";

const auth = { Authorization: "Bearer admin-token" };
const book = (over: Record<string, unknown> = {}) => ({
  title: "Sách thử",
  author: "QA Team",
  isbn: "978-3333333333",
  price: 100000,
  ...over,
});

test("danh sách, phân trang và tìm kiếm", async ({ request }) => {
  const body = await (await request.get("/api/lab/books")).json();
  expect(body).toMatchObject({ page: 1, pageSize: 5, total: 12 });
  expect(body.data).toHaveLength(5);

  expect((await (await request.get("/api/lab/books?page=3")).json()).data).toHaveLength(2);
  expect((await (await request.get("/api/lab/books?pageSize=999")).json()).pageSize).toBe(50);
  expect((await (await request.get("/api/lab/books?q=clean")).json()).total).toBe(2);
});

test("401, 403 và 404", async ({ request }) => {
  expect((await request.post("/api/lab/books", { data: book() })).status()).toBe(401);
  const reader = { Authorization: "Bearer reader-token" };
  expect((await request.post("/api/lab/books", { headers: reader, data: book() })).status()).toBe(403);
  expect((await request.delete("/api/lab/books/b-1", { headers: reader })).status()).toBe(403);
  expect((await request.get("/api/lab/books/b-999")).status()).toBe(404);
});

test("422 kèm trường lỗi và 409 khi trùng isbn", async ({ request }) => {
  const bad = await request.post("/api/lab/books", { headers: auth, data: book({ price: -1, isbn: "x" }) });
  expect(bad.status()).toBe(422);
  const fields = (await bad.json()).errors.map((e: { field: string }) => e.field);
  expect(fields).toEqual(expect.arrayContaining(["price", "isbn"]));

  const dup = await request.post("/api/lab/books", { headers: auth, data: book({ isbn: "978-0132350884" }) });
  expect(dup.status()).toBe(409);

  const invalidJson = await request.post("/api/lab/books", {
    headers: { ...auth, "content-type": "application/json" },
    data: Buffer.from("{not json"),
  });
  expect(invalidJson.status()).toBe(400);
});

test("vòng đời CRUD giữ trạng thái bằng cookie và reset được", async ({ request }) => {
  const created = await request.post("/api/lab/books", { headers: auth, data: book() });
  expect(created.status()).toBe(201);
  const b = await created.json();
  expect(created.headers()["location"]).toBe("/api/lab/books/" + b.id);

  expect((await (await request.get("/api/lab/books")).json()).total).toBe(13);

  const put = await request.put("/api/lab/books/" + b.id, { headers: auth, data: { price: 350000 } });
  expect((await put.json()).price).toBe(350000);
  expect((await (await request.get("/api/lab/books/" + b.id)).json()).price).toBe(350000);

  expect((await request.delete("/api/lab/books/" + b.id, { headers: auth })).status()).toBe(204);
  expect((await request.get("/api/lab/books/" + b.id)).status()).toBe(404);

  await request.post("/api/lab/books", { headers: auth, data: book() });
  expect((await request.post("/api/lab/reset")).status()).toBe(204);
  expect((await (await request.get("/api/lab/books")).json()).total).toBe(12);
});

test("hai phiên độc lập không thấy dữ liệu của nhau", async ({ playwright, baseURL }) => {
  const a = await playwright.request.newContext({ baseURL });
  const b = await playwright.request.newContext({ baseURL });
  await a.post("/api/lab/books", { headers: auth, data: book() });
  expect((await (await a.get("/api/lab/books")).json()).total).toBe(13);
  expect((await (await b.get("/api/lab/books")).json()).total).toBe(12);
  await a.dispose();
  await b.dispose();
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ request }) => {
  const p1 = await (await request.get("/api/lab/books?bugs=BUG-01&pageSize=5")).json();
  expect(p1.data[0].id).toBe("b-2"); // đáng lẽ phải là b-1

  const created = await request.post("/api/lab/books?bugs=BUG-02", { headers: auth, data: book() });
  expect(created.status()).toBe(200); // đáng lẽ 201

  const del = await request.delete("/api/lab/books/b-999?bugs=BUG-03", { headers: auth });
  expect(del.status()).toBe(204); // đáng lẽ 404
});

test("trang tài liệu liệt kê endpoint", async ({ page }) => {
  await page.goto("/lab/api");
  await expect(page.getByRole("heading", { name: /Mock REST API/ })).toBeVisible();
  await expect(page.getByRole("cell", { name: "/api/lab/books/{id}" }).first()).toBeVisible();
});
