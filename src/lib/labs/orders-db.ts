import { deflateRawSync, inflateRawSync } from "node:zlib";
import { NextResponse, type NextRequest } from "next/server";

export const DB_COOKIE = "lab_orders_db";
export const MAX_ORDERS = 8;
export const DB_TOKEN = "readonly";

export const CATALOG = [
  { sku: "SKU-A", name: "Áo thun", price: 100_000, stock: 20 },
  { sku: "SKU-B", name: "Giày", price: 250_000, stock: 5 },
  { sku: "SKU-C", name: "Mũ", price: 50_000, stock: 3 },
];

export interface OrderRow {
  id: string;
  customer: string;
  total: number;
  status: "pending" | "cancelled";
  idempotency_key: string | null;
  created_at: string;
  deleted_at: string | null;
}
export interface ItemRow {
  order_id: string;
  sku: string;
  qty: number;
  price: number;
}
export interface AuditRow {
  id: number;
  action: string;
  order_id: string;
  at: string;
}

/** "Cơ sở dữ liệu" của phiên: lưu trong cookie (nén) để server không giữ trạng thái. */
export interface Db {
  n: number;
  a: number;
  stock: Record<string, number>;
  orders: OrderRow[];
  items: ItemRow[];
  audit: AuditRow[];
}

export const emptyDb = (): Db => ({ n: 0, a: 0, stock: {}, orders: [], items: [], audit: [] });

export function decodeDb(raw: string | undefined): Db {
  if (!raw) return emptyDb();
  try {
    const o = JSON.parse(inflateRawSync(Buffer.from(raw, "base64url")).toString("utf8")) as Db;
    return { ...emptyDb(), ...o };
  } catch {
    return emptyDb();
  }
}

const encodeDb = (db: Db) => deflateRawSync(Buffer.from(JSON.stringify(db), "utf8")).toString("base64url");

export const readDb = (req: NextRequest) => decodeDb(req.cookies.get(DB_COOKIE)?.value);

export function withDb(res: NextResponse, db: Db): NextResponse {
  res.cookies.set(DB_COOKIE, encodeDb(db), { path: "/api/lab", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 });
  return res;
}

export function resetDb(res: NextResponse): NextResponse {
  res.cookies.set(DB_COOKIE, "", { path: "/api/lab", maxAge: 0 });
  return res;
}

export const stockOf = (db: Db, sku: string) => db.stock[sku] ?? CATALOG.find((p) => p.sku === sku)?.stock ?? 0;

export const productRows = (db: Db) => CATALOG.map((p) => ({ sku: p.sku, name: p.name, price: p.price, stock: stockOf(db, p.sku) }));

export interface FieldError {
  field: string;
  message: string;
}

export type CreateResult =
  | { status: 201 | 200; body: unknown; db: Db; location?: string }
  | { status: 422 | 409; body: { message: string; errors?: FieldError[] }; db: Db };

/** Tạo đơn trong một "transaction": lỗi thì không được ghi gì (trừ khi bật BUG-04). */
export function createOrder(db: Db, input: unknown, idemKey: string | null, bugs: Set<string>, now = new Date()): CreateResult {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const errors: FieldError[] = [];

  const customer = typeof src.customer === "string" ? src.customer.trim() : "";
  if (customer.length < 1 || customer.length > 50) errors.push({ field: "customer", message: "Tên khách hàng bắt buộc, 1–50 ký tự" });

  const rawItems = Array.isArray(src.items) ? src.items : [];
  if (rawItems.length < 1 || rawItems.length > 3) errors.push({ field: "items", message: "Đơn hàng có từ 1 đến 3 dòng" });
  const lines: { sku: string; qty: number; price: number }[] = [];
  rawItems.forEach((it, i) => {
    const r = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
    const product = CATALOG.find((p) => p.sku === r.sku);
    if (!product) errors.push({ field: `items[${i}].sku`, message: "SKU không tồn tại" });
    if (!Number.isInteger(r.qty) || (r.qty as number) < 1 || (r.qty as number) > 10)
      errors.push({ field: `items[${i}].qty`, message: "Số lượng là số nguyên từ 1 đến 10" });
    if (product && Number.isInteger(r.qty)) lines.push({ sku: product.sku, qty: r.qty as number, price: product.price });
  });
  if (new Set(lines.map((l) => l.sku)).size !== lines.length) errors.push({ field: "items", message: "SKU bị trùng giữa các dòng" });
  if (errors.length) return { status: 422, body: { message: "Dữ liệu không hợp lệ", errors }, db };

  // BR-04: cùng Idempotency-Key thì trả lại đơn cũ, không tạo thêm. BUG-03: bỏ qua khoá.
  if (idemKey && !bugs.has("BUG-03")) {
    const existed = db.orders.find((o) => o.idempotency_key === idemKey);
    if (existed) return { status: 200, body: orderBody(db, existed), db };
  }
  if (db.orders.length >= MAX_ORDERS)
    return { status: 422, body: { message: `Đã đạt giới hạn ${MAX_ORDERS} đơn; hãy gọi /api/lab/reset` }, db };

  const n = db.n + 1;
  const id = `o-${1000 + n}`;
  const at = now.toISOString();
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);

  const short = lines.find((l) => l.qty > stockOf(db, l.sku));
  if (short) {
    // BR-05: hết hàng thì 409 và không ghi gì. BUG-04: đã lỡ ghi dòng đơn hàng trước khi báo lỗi.
    const next: Db = bugs.has("BUG-04")
      ? { ...db, n, orders: [...db.orders, { id, customer, total, status: "pending", idempotency_key: null, created_at: at, deleted_at: null }] }
      : db;
    return { status: 409, body: { message: `Không đủ tồn kho cho ${short.sku}` }, db: next };
  }

  // BR-02: tổng tiền trong DB bằng tổng trả về. BUG-02: DB bỏ qua số lượng.
  const dbTotal = bugs.has("BUG-02") ? lines.reduce((s, l) => s + l.price, 0) : total;
  const order: OrderRow = { id, customer, total: dbTotal, status: "pending", idempotency_key: idemKey, created_at: at, deleted_at: null };
  const stock = { ...db.stock };
  for (const l of lines) stock[l.sku] = stockOf(db, l.sku) - l.qty;
  let a = db.a;
  const audit = [...db.audit];
  // BR-03: ghi audit_log. BUG-01: thiếu bản ghi audit.
  if (!bugs.has("BUG-01")) audit.push({ id: ++a, action: "order.created", order_id: id, at });
  const next: Db = {
    n,
    a,
    stock,
    orders: [...db.orders, order],
    items: [...db.items, ...lines.map((l) => ({ order_id: id, sku: l.sku, qty: l.qty, price: l.price }))],
    audit,
  };
  return { status: 201, body: { id, customer, total, status: "pending", items: lines, created_at: at }, db: next, location: `/api/lab/orders/${id}` };
}

export function orderBody(db: Db, o: OrderRow) {
  return {
    id: o.id,
    customer: o.customer,
    total: o.total,
    status: o.status,
    items: db.items.filter((i) => i.order_id === o.id).map(({ sku, qty, price }) => ({ sku, qty, price })),
    created_at: o.created_at,
  };
}

/** Xoá mềm: giữ dòng trong DB, đặt deleted_at, hoàn tồn kho và ghi audit. */
export function softDelete(db: Db, id: string, now = new Date()): Db | null {
  const o = db.orders.find((x) => x.id === id && !x.deleted_at);
  if (!o) return null;
  const at = now.toISOString();
  const stock = { ...db.stock };
  for (const i of db.items.filter((x) => x.order_id === id)) stock[i.sku] = stockOf(db, i.sku) + i.qty;
  return {
    ...db,
    a: db.a + 1,
    stock,
    orders: db.orders.map((x) => (x.id === id ? { ...x, status: "cancelled", deleted_at: at } : x)),
    audit: [...db.audit, { id: db.a + 1, action: "order.deleted", order_id: id, at }],
  };
}

export function tableRows(db: Db, table: string): Record<string, unknown>[] | null {
  switch (table) {
    case "products":
      return productRows(db);
    case "orders":
      return db.orders as unknown as Record<string, unknown>[];
    case "order_items":
      return db.items as unknown as Record<string, unknown>[];
    case "audit_log":
      return db.audit as unknown as Record<string, unknown>[];
    default:
      return null;
  }
}
