import { neon } from "@neondatabase/serverless";
import { NextResponse, type NextRequest } from "next/server";
import { DROP_SQL, SCHEMA_SQL, STATUS_SQL, TEST_USER, explainDbError, fakeNeon, parseConnection, type Outcome } from "@/lib/byo/neon";
import { clientIp, createLimiter } from "@/lib/byo/rate-limit";

/**
 * Proxy thao tác với database Neon của người học (test / schema / status / drop).
 * - Chuỗi kết nối đi kèm từng request (header x-neon-url), không lưu, không ghi log, không trả lại trong phản hồi.
 * - Chỉ nhận host *.neon.tech (chặn SSRF); user lab_test chạy chế độ thử, không kết nối mạng.
 * - Chỉ chạy các câu SQL cố định của site; client không gửi được SQL tuỳ ý.
 */
const ACTIONS = new Set(["test", "schema", "status", "drop"]);
const limited = createLimiter(15, 60_000);

const reply = (o: Outcome, headers: Record<string, string> = {}) =>
  NextResponse.json(o.body, { status: o.status, headers: { "Cache-Control": "no-store", ...headers } });
const fail = (status: number, message: string, headers?: Record<string, string>) => reply({ status, body: { ok: false, message } }, headers);

async function tables(sql: { query: (text: string) => PromiseLike<unknown> }): Promise<string[]> {
  const rows = (await sql.query(STATUS_SQL)) as { table_name: string }[];
  return rows.map((r) => r.table_name);
}

export async function POST(req: NextRequest) {
  const url = req.headers.get("x-neon-url")?.trim() ?? "";
  const parsed = parseConnection(url);
  if (!parsed.ok) return fail(401, parsed.message);

  let action = "";
  try {
    action = String((await req.json()).action ?? "");
  } catch {
    return fail(400, "Body phải là JSON hợp lệ");
  }
  if (!ACTIONS.has(action)) return fail(422, "Hành động không hợp lệ (test, schema, status hoặc drop)");

  if (parsed.user === TEST_USER) return reply(fakeNeon(action, parsed));

  if (limited(clientIp(req), Date.now())) return fail(429, "Thao tác quá nhanh, hãy đợi một phút", { "Retry-After": "60" });

  try {
    const sql = neon(url);
    const timeout = new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 15_000));
    const run = async (): Promise<Outcome> => {
      if (action === "test") {
        const rows = (await sql.query("SELECT current_database() AS db")) as { db: string }[];
        return { status: 200, body: { ok: true, message: "Kết nối thành công", database: rows[0]?.db, mode: "real" } };
      }
      if (action === "schema") {
        await sql.transaction((txn) => SCHEMA_SQL.map((s) => txn.query(s)));
        return { status: 200, body: { ok: true, message: "Đã tạo schema mẫu", tables: await tables(sql), mode: "real" } };
      }
      if (action === "drop") {
        await sql.query(DROP_SQL);
        return { status: 200, body: { ok: true, message: "Đã xoá schema mẫu", tables: [], mode: "real" } };
      }
      return { status: 200, body: { ok: true, message: "Đã đọc trạng thái schema", tables: await tables(sql), mode: "real" } };
    };
    return reply(await Promise.race([run(), timeout]));
  } catch (err) {
    const e = explainDbError(err, url);
    return fail(e.status, e.message);
  }
}
