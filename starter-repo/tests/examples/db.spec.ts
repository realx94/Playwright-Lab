import { test, expect } from "@playwright/test";
import { Client } from "pg";

// Ví dụ đối chiếu dữ liệu trực tiếp trong database Neon của bạn (cần DATABASE_URL trong .env).
// Lấy chuỗi kết nối và tạo schema mẫu ở trang "Dịch vụ của tôi" trên site, rồi chép khối .env vào file .env của dự án này.
const url = process.env.DATABASE_URL;

test.describe("Đối chiếu dữ liệu trong database", () => {
  test.skip(!url, "Chưa có DATABASE_URL: xem trang Dịch vụ của tôi trên site rồi chép vào .env");

  let db: Client;

  test.beforeAll(async () => {
    db = new Client({ connectionString: url });
    await db.connect();
  });

  test.afterAll(async () => {
    await db?.end();
  });

  test("schema mẫu có đủ 8 bảng", async () => {
    const { rows } = await db.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'lab' ORDER BY table_name",
    );
    expect(rows.map((r) => r.table_name)).toEqual([
      "audit_log", "emails_outbox", "order_items", "orders", "otp_codes", "payments", "users", "webhook_events",
    ]);
  });

  test("mọi đơn chưa huỷ: tổng đơn khớp tạm tính + VAT 8% + ship (BR-03, BR-04 của LAB-03)", async () => {
    const { rows } = await db.query<{ id: number; total: string; subtotal: string }>(
      `SELECT o.id, o.total_vnd AS total, SUM(i.qty * i.unit_price_vnd) AS subtotal
         FROM lab.orders o JOIN lab.order_items i ON i.order_id = o.id
        WHERE o.status <> 'Đã huỷ' GROUP BY o.id, o.total_vnd`,
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      const subtotal = Number(r.subtotal);
      const ship = subtotal >= 1_000_000 ? 0 : 30_000; // chưa tính mã giảm giá
      expect(Number(r.total), `đơn #${r.id}`).toBe(Math.round(subtotal * 1.08) + ship);
    }
  });

  test("ràng buộc của database chặn dữ liệu sai: số lượng 11 bị từ chối", async () => {
    await expect(
      db.query("INSERT INTO lab.order_items (order_id, sku, qty, unit_price_vnd) SELECT id, 'p1', 11, 1 FROM lab.orders LIMIT 1"),
    ).rejects.toThrow(/check constraint/);
  });
});
