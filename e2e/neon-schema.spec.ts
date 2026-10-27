import { test, expect } from "@playwright/test";
import { PGlite } from "@electric-sql/pglite";
import { DROP_SQL, SCHEMA_SQL, STATUS_SQL, TABLES, maskConnection, parseConnection, scrub, explainDbError } from "../src/lib/byo/neon";

/** Chạy schema mẫu trên Postgres thật (PGlite, trong bộ nhớ) để chắc SQL đúng, chạy lại được và ràng buộc hoạt động. */
async function fresh() {
  const db = new PGlite();
  await db.exec("BEGIN");
  for (const s of SCHEMA_SQL) await db.query(s);
  await db.exec("COMMIT");
  return db;
}
const count = async (db: PGlite, t: string) => Number(((await db.query(`SELECT count(*)::int AS n FROM lab.${t}`)).rows[0] as { n: number }).n);

test.describe("SQL schema mẫu trên Postgres thật", () => {
  test("tạo đủ 8 bảng trong schema lab và có dữ liệu mẫu", async () => {
    const db = await fresh();
    const names = ((await db.query(STATUS_SQL)).rows as { table_name: string }[]).map((r) => r.table_name);
    expect(names).toEqual([...TABLES]);
    expect(await count(db, "users")).toBe(2);
    expect(await count(db, "orders")).toBe(1);
    expect(await count(db, "order_items")).toBe(1);
    await db.close();
  });

  test("chạy lại nhiều lần không lỗi và không nhân đôi dữ liệu mẫu", async () => {
    const db = await fresh();
    for (let i = 0; i < 2; i++) for (const s of SCHEMA_SQL) await db.query(s);
    expect(await count(db, "users")).toBe(2);
    expect(await count(db, "orders")).toBe(1);
    expect(await count(db, "order_items")).toBe(1);
    await db.close();
  });

  test("ràng buộc hoạt động: trạng thái đơn, số lượng, tiền âm, email trùng, khoá ngoại", async () => {
    const db = await fresh();
    const bad = async (sql: string, re: RegExp) => await expect(db.query(sql)).rejects.toThrow(re);
    await bad(`INSERT INTO lab.orders (user_id, status, total_vnd) VALUES (1, 'Lạ', 1)`, /check constraint/);
    await bad(`INSERT INTO lab.orders (user_id, status, total_vnd) VALUES (1, 'Mới', -1)`, /check constraint/);
    await bad(`INSERT INTO lab.order_items (order_id, sku, qty, unit_price_vnd) VALUES (1, 'p1', 11, 1)`, /check constraint/);
    await bad(`INSERT INTO lab.order_items (order_id, sku, qty, unit_price_vnd) VALUES (1, 'p1', 0, 1)`, /check constraint/);
    await bad(`INSERT INTO lab.users (email, name) VALUES ('user@lab.dev', 'Trùng')`, /unique/);
    await bad(`INSERT INTO lab.orders (user_id, status, total_vnd) VALUES (999, 'Mới', 1)`, /foreign key/);
    await bad(`INSERT INTO lab.payments (order_id, amount_vnd, status) VALUES (1, 1, 'khac')`, /check constraint/);
    await db.close();
  });

  test("xoá đơn thì xoá luôn dòng hàng (cascade); xoá schema dọn sạch", async () => {
    const db = await fresh();
    await db.query(`DELETE FROM lab.orders WHERE id = 1`);
    expect(await count(db, "order_items")).toBe(0);
    await db.query(DROP_SQL);
    expect((await db.query(STATUS_SQL)).rows).toEqual([]);
    await db.close();
  });

  test("câu hỏi đối chiếu kiểu QA: tổng đơn = tạm tính + VAT 8% + ship 30.000 (dưới 1 triệu)", async () => {
    const db = await fresh();
    const r = (await db.query(`SELECT o.total_vnd AS total, SUM(i.qty * i.unit_price_vnd) AS subtotal FROM lab.orders o JOIN lab.order_items i ON i.order_id = o.id GROUP BY o.id, o.total_vnd`)).rows as { total: string | number; subtotal: string | number }[];
    const subtotal = Number(r[0].subtotal);
    expect(subtotal).toBe(450000);
    expect(Number(r[0].total)).toBe(Math.round(subtotal * 1.08) + 30000);
    await db.close();
  });
});

test.describe("Kiểm tra chuỗi kết nối", () => {
  test("chỉ nhận postgres tới host *.neon.tech có đủ user, mật khẩu, database", () => {
    const ok = parseConnection("postgresql://alice:s3cret@ep-cool-123.ap-southeast-1.aws.neon.tech/neondb?sslmode=require");
    expect(ok).toMatchObject({ ok: true, host: "ep-cool-123.ap-southeast-1.aws.neon.tech", user: "alice", database: "neondb" });
    for (const bad of [
      "",
      "mysql://a:b@x.neon.tech/db",
      "postgres://a:b@localhost/db",
      "postgres://a:b@127.0.0.1/db",
      "postgres://a:b@10.0.0.5/db",
      "postgres://a:b@evil.example.com/db",
      "postgres://a:b@neon.tech.evil.com/db",
      "postgres://a:b@x.neon.tech",
      "postgres://a@x.neon.tech/db",
      "postgres://:b@x.neon.tech/db",
      "khong phai url",
    ]) expect(parseConnection(bad).ok, bad).toBe(false);
  });

  test("che mật khẩu khi hiển thị và xoá khỏi thông báo lỗi", () => {
    const url = "postgres://alice:s3cret@ep-x.neon.tech/neondb";
    expect(maskConnection(url)).toBe("postgres://alice:****@ep-x.neon.tech/neondb");
    expect(scrub(`connect to ${url} failed, password s3cret`, url)).not.toMatch(/s3cret|alice:/);
    expect(explainDbError(new Error(`password authentication failed for user "alice" ${url}`), url)).toMatchObject({ status: 401 });
    expect(explainDbError(new Error("permission denied for database neondb"), url).status).toBe(403);
    expect(explainDbError(new Error("fetch failed"), url).status).toBe(504);
    expect(explainDbError(new Error(`boom ${url}`), url).message).not.toContain("s3cret");
  });
});
