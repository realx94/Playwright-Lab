import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const WEBHOOK_COOKIE = "lab_webhook";
export const WEBHOOK_SECRET = "whsec_lab_secret";
export const MAX_SKEW_SECONDS = 300;

export const INVOICES = [
  { id: "inv-1", amount: 100_000 },
  { id: "inv-2", amount: 250_000 },
  { id: "inv-3", amount: 50_000 },
];

export const BUGS = [
  { id: "BUG-01", hint: "Kiểm tra chữ ký" },
  { id: "BUG-02", hint: "Xử lý sự kiện trùng" },
  { id: "BUG-03", hint: "Kiểm tra timestamp" },
];

export interface WebhookState {
  paid: string[]; // id hóa đơn đã thanh toán
  seen: string[]; // event id đã xử lý
  rev: number; // doanh thu ghi nhận
  att: Record<string, number>; // số lần nhận của sự kiện flaky
  log: string[]; // nhật ký ngắn
}

export const emptyWebhookState = (): WebhookState => ({ paid: [], seen: [], rev: 0, att: {}, log: [] });

export function readWebhookState(raw: string | undefined): WebhookState {
  if (!raw) return emptyWebhookState();
  try {
    return { ...emptyWebhookState(), ...(JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as WebhookState) };
  } catch {
    return emptyWebhookState();
  }
}

export function withWebhookState(res: NextResponse, s: WebhookState): NextResponse {
  res.cookies.set(WEBHOOK_COOKIE, Buffer.from(JSON.stringify(s), "utf8").toString("base64url"), {
    path: "/api/lab",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60,
  });
  return res;
}

export function resetWebhookState(res: NextResponse): NextResponse {
  res.cookies.set(WEBHOOK_COOKIE, "", { path: "/api/lab", maxAge: 0 });
  return res;
}

/** Chữ ký: sha256= + HMAC-SHA256(secret, `${timestamp}.${rawBody}`) dạng hex. */
export function sign(timestamp: string, rawBody: string, secret = WEBHOOK_SECRET): string {
  return "sha256=" + createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
}

export function signatureValid(header: string | null, timestamp: string, rawBody: string): boolean {
  if (!header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(sign(timestamp, rawBody));
  return a.length === b.length && timingSafeEqual(a, b);
}
