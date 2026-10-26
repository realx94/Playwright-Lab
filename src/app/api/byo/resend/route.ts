import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_FROM,
  TEST_KEY_PREFIX,
  explain,
  fakeResend,
  isResendKey,
  validatePayload,
  type MailPayload,
} from "@/lib/byo/resend";

/**
 * Proxy gửi email qua Resend bằng API key của người học.
 * - Khoá đi kèm từng request (header x-resend-key), không lưu, không ghi log.
 * - Chỉ gọi đúng host api.resend.com (không nhận URL từ client nên không có SSRF).
 * - Khoá bắt đầu bằng re_test_ dùng Resend giả trong site (không gọi mạng).
 */
const HOST = "https://api.resend.com/emails";
const MAX_BODY = 20_000;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

/** Giới hạn tần suất theo IP. Bộ nhớ theo từng instance nên chỉ là lớp chặn cơ bản trên môi trường serverless. */
function limited(ip: string, now: number): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const reply = (status: number, body: Record<string, unknown>, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-resend-key")?.trim() ?? "";
  if (!isResendKey(key)) return reply(401, { ok: false, message: "Thiếu hoặc sai định dạng API key (bắt đầu bằng re_)" });

  const raw = await req.text();
  if (raw.length > MAX_BODY) return reply(413, { ok: false, message: "Nội dung quá lớn" });
  let payload: Partial<MailPayload>;
  try {
    payload = JSON.parse(raw);
  } catch {
    return reply(400, { ok: false, message: "Body phải là JSON hợp lệ" });
  }
  const invalid = validatePayload(payload);
  if (invalid) return reply(422, { ok: false, message: invalid });
  const mail = payload as MailPayload;

  if (key.startsWith(TEST_KEY_PREFIX)) {
    const r = fakeResend(key, mail);
    return r.status === 200
      ? reply(200, { ok: true, id: r.body.id, mode: "test" })
      : reply(r.status, { ok: false, message: explain(r.status, r.body.message), mode: "test" });
  }

  // Chỉ giới hạn tần suất với khoá thật (chế độ thử không tốn tài nguyên bên ngoài).
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip, Date.now())) return reply(429, { ok: false, message: "Gửi quá nhanh, hãy đợi một phút" }, { "Retry-After": "60" });

  try {
    const res = await fetch(HOST, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: mail.from || DEFAULT_FROM, to: [mail.to], subject: mail.subject, text: mail.text }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) return reply(res.status === 401 || res.status === 403 || res.status === 429 || res.status >= 500 ? res.status : 422, { ok: false, message: explain(res.status, data.message), mode: "real" });
    return reply(200, { ok: true, id: data.id, mode: "real" });
  } catch {
    return reply(504, { ok: false, message: "Không kết nối được tới Resend (hết thời gian chờ hoặc mất mạng)" });
  }
}
