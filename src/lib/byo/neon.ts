/** Dùng chung cho proxy /api/byo/neon: schema mẫu, kiểm tra chuỗi kết nối, chế độ thử, che thông tin nhạy cảm. */

/** Schema riêng `lab` trong database Neon của người học, tách khỏi bảng khác của họ. */
export const SCHEMA_NAME = "lab";

export const TABLES = ["audit_log", "emails_outbox", "order_items", "orders", "otp_codes", "payments", "users", "webhook_events"] as const;

/** Đơn mẫu: 1 × bàn phím 450.000 + VAT 8% (36.000) + ship 30.000 = 516.000, khớp BR-03/04 của LAB-03.
 * Chạy trong một transaction; viết để chạy lại nhiều lần không lỗi và không nhân đôi dữ liệu mẫu. */
export const SCHEMA_SQL: string[] = [
  `CREATE SCHEMA IF NOT EXISTS ${SCHEMA_NAME}`,
  `CREATE TABLE IF NOT EXISTS ${SCHEMA_NAME}.users (
    id serial PRIMARY KEY,
    email text NOT NULL UNIQUE,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS ${SCHEMA_NAME}.orders (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES ${SCHEMA_NAME}.users(id),
    status text NOT NULL CHECK (status IN ('Mới', 'Đã thanh toán', 'Đang giao', 'Hoàn tất', 'Đã huỷ')),
    total_vnd bigint NOT NULL CHECK (total_vnd >= 0),
    deleted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS ${SCHEMA_NAME}.order_items (
    id serial PRIMARY KEY,
    order_id integer NOT NULL REFERENCES ${SCHEMA_NAME}.orders(id) ON DELETE CASCADE,
    sku text NOT NULL,
    qty integer NOT NULL CHECK (qty BETWEEN 1 AND 10),
    unit_price_vnd bigint NOT NULL CHECK (unit_price_vnd >= 0)
  )`,
  `CREATE TABLE IF NOT EXISTS ${SCHEMA_NAME}.payments (
    id serial PRIMARY KEY,
    order_id integer NOT NULL REFERENCES ${SCHEMA_NAME}.orders(id),
    amount_vnd bigint NOT NULL CHECK (amount_vnd >= 0),
    status text NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    provider_ref text UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS ${SCHEMA_NAME}.audit_log (
    id bigserial PRIMARY KEY,
    actor text NOT NULL,
    action text NOT NULL,
    entity text NOT NULL,
    entity_id text NOT NULL,
    at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS ${SCHEMA_NAME}.webhook_events (
    id text PRIMARY KEY,
    type text NOT NULL,
    payload jsonb NOT NULL,
    processed_at timestamptz
  )`,
  `CREATE TABLE IF NOT EXISTS ${SCHEMA_NAME}.otp_codes (
    id serial PRIMARY KEY,
    email text NOT NULL,
    code text NOT NULL,
    expires_at timestamptz NOT NULL,
    used boolean NOT NULL DEFAULT false,
    attempts integer NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS ${SCHEMA_NAME}.emails_outbox (
    id serial PRIMARY KEY,
    to_email text NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    sent_at timestamptz NOT NULL DEFAULT now()
  )`,
  `INSERT INTO ${SCHEMA_NAME}.users (email, name) VALUES ('user@lab.dev', 'Người dùng mẫu'), ('vip@lab.dev', 'Khách VIP') ON CONFLICT (email) DO NOTHING`,
  `INSERT INTO ${SCHEMA_NAME}.orders (user_id, status, total_vnd)
    SELECT u.id, 'Mới', 516000 FROM ${SCHEMA_NAME}.users u WHERE u.email = 'user@lab.dev' AND NOT EXISTS (SELECT 1 FROM ${SCHEMA_NAME}.orders)`,
  `INSERT INTO ${SCHEMA_NAME}.order_items (order_id, sku, qty, unit_price_vnd)
    SELECT o.id, 'p1', 1, 450000 FROM ${SCHEMA_NAME}.orders o WHERE NOT EXISTS (SELECT 1 FROM ${SCHEMA_NAME}.order_items)`,
];

export const DROP_SQL = `DROP SCHEMA IF EXISTS ${SCHEMA_NAME} CASCADE`;
export const STATUS_SQL = `SELECT table_name FROM information_schema.tables WHERE table_schema = '${SCHEMA_NAME}' ORDER BY table_name`;

/** Người dùng này (ở host *.neon.tech hợp lệ) chạy chế độ thử: không kết nối mạng, không chạm database nào. */
export const TEST_USER = "lab_test";

export interface Parsed {
  ok: true;
  host: string;
  user: string;
  password: string;
  database: string;
}

/**
 * Chỉ nhận chuỗi kết nối postgres tới host *.neon.tech (chống SSRF: không localhost, không IP, không host lạ).
 * Trả về thông báo lỗi tiếng Việt nếu không hợp lệ.
 */
export function parseConnection(raw: string): Parsed | { ok: false; message: string } {
  if (!raw || raw.length > 600) return { ok: false, message: "Thiếu hoặc quá dài chuỗi kết nối" };
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return { ok: false, message: "Chuỗi kết nối không đúng định dạng postgres://user:password@host/database" };
  }
  if (u.protocol !== "postgres:" && u.protocol !== "postgresql:") return { ok: false, message: "Chuỗi kết nối phải bắt đầu bằng postgres:// hoặc postgresql://" };
  const host = u.hostname.toLowerCase();
  if (!host.endsWith(".neon.tech") || host === ".neon.tech" || /^\d+(\.\d+){3}$/.test(host)) {
    return { ok: false, message: "Chỉ hỗ trợ database Neon (host kết thúc bằng .neon.tech)" };
  }
  if (!u.username || !u.password) return { ok: false, message: "Chuỗi kết nối thiếu tên đăng nhập hoặc mật khẩu" };
  const database = u.pathname.replace(/^\//, "");
  if (!database) return { ok: false, message: "Chuỗi kết nối thiếu tên database ở cuối" };
  return { ok: true, host, user: decodeURIComponent(u.username), password: decodeURIComponent(u.password), database };
}

/** postgres://user:****@host/db: dùng khi hiển thị. */
export function maskConnection(raw: string): string {
  const p = parseConnection(raw);
  return p.ok ? `postgres://${p.user}:****@${p.host}/${p.database}` : "(chuỗi kết nối chưa hợp lệ)";
}

/** Xoá mọi dấu vết của mật khẩu hoặc chuỗi kết nối khỏi thông báo lỗi trước khi trả về client. */
export function scrub(text: string, raw: string): string {
  let out = text.split(raw).join("(chuỗi kết nối)");
  const p = parseConnection(raw);
  if (p.ok && p.password.length >= 3) out = out.split(p.password).join("****");
  return out;
}

/** Dịch lỗi của Postgres/driver sang thông báo dễ hiểu. */
export function explainDbError(err: unknown, raw: string): { status: number; message: string } {
  const msg = scrub(err instanceof Error ? err.message : String(err), raw);
  if (/password authentication failed|authentication failed/i.test(msg)) return { status: 401, message: "Sai tên đăng nhập hoặc mật khẩu trong chuỗi kết nối" };
  if (/database .* does not exist/i.test(msg)) return { status: 422, message: "Database trong chuỗi kết nối không tồn tại" };
  if (/permission denied/i.test(msg)) return { status: 403, message: "Tài khoản này không đủ quyền tạo schema. Hãy dùng chuỗi kết nối của role chủ database (mặc định của Neon)" };
  if (/fetch failed|ENOTFOUND|EAI_AGAIN|timeout|ECONNREFUSED|endpoint.*(disabled|not found)/i.test(msg)) return { status: 504, message: "Không kết nối được tới Neon. Kiểm tra host, mạng, hoặc project đang tạm dừng (hãy mở dashboard Neon để đánh thức)" };
  return { status: 500, message: `Lỗi database: ${msg.slice(0, 160)}` };
}

export interface Outcome {
  status: number;
  body: { ok: boolean; message: string; database?: string; tables?: string[]; mode?: "test" | "real" };
}

/** Phản hồi giả cho chế độ thử (user = lab_test): mật khẩu `invalid` luôn bị từ chối. */
export function fakeNeon(action: string, p: Parsed): Outcome {
  if (p.password === "invalid") return { status: 401, body: { ok: false, message: "Sai tên đăng nhập hoặc mật khẩu trong chuỗi kết nối", mode: "test" } };
  const tables = action === "drop" ? [] : [...TABLES];
  const message = { test: "Kết nối thành công (chế độ thử)", schema: "Đã tạo schema mẫu (chế độ thử)", status: "Đã đọc trạng thái schema (chế độ thử)", drop: "Đã xoá schema mẫu (chế độ thử)" }[action] ?? "OK";
  return { status: 200, body: { ok: true, message, database: p.database, tables: action === "test" ? undefined : tables, mode: "test" } };
}
