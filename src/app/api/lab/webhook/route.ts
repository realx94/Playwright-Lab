import { NextResponse, type NextRequest } from "next/server";
import { bugsOf } from "@/lib/labs/books-api";
import {
  INVOICES,
  MAX_SKEW_SECONDS,
  WEBHOOK_COOKIE,
  readWebhookState,
  signatureValid,
  withWebhookState,
} from "@/lib/labs/webhook-rules";

/** Nhận webhook của đối tác: kiểm tra chữ ký HMAC, timestamp, trùng lặp (idempotency) và nghiệp vụ. */
export async function POST(req: NextRequest) {
  const bugs = bugsOf(req);
  const raw = await req.text();
  const timestamp = req.headers.get("x-timestamp") ?? "";

  // BR-01: chữ ký sai hoặc thiếu → 401. BUG-01: không kiểm tra.
  if (!bugs.has("BUG-01") && !signatureValid(req.headers.get("x-signature"), timestamp, raw))
    return NextResponse.json({ message: "Chữ ký không hợp lệ" }, { status: 401 });

  // BR-02: timestamp lệch quá 300 giây → 400 (chống replay). BUG-03: không kiểm tra.
  const skew = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!bugs.has("BUG-03") && !(skew <= MAX_SKEW_SECONDS))
    return NextResponse.json({ message: "Timestamp quá cũ hoặc không hợp lệ" }, { status: 400 });

  let event: { id?: string; type?: string; data?: { invoice_id?: string; amount?: number } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ message: "Body không phải JSON hợp lệ" }, { status: 400 });
  }
  if (!event.id || !event.type) return NextResponse.json({ message: "Thiếu id hoặc type của sự kiện" }, { status: 422 });

  const state = readWebhookState(req.cookies.get(WEBHOOK_COOKIE)?.value);

  // BR-05: sự kiện flaky lỗi 503 hai lần đầu để đối tác retry.
  if (event.id.startsWith("evt_flaky")) {
    const n = (state.att[event.id] ?? 0) + 1;
    const next = { ...state, att: { ...state.att, [event.id]: n } };
    if (n <= 2) return withWebhookState(NextResponse.json({ message: "Tạm thời lỗi, hãy thử lại" }, { status: 503, headers: { "Retry-After": "1" } }), next);
    state.att = next.att;
  }

  // BR-03: sự kiện trùng id chỉ xử lý một lần. BUG-02: xử lý lại.
  const duplicate = state.seen.includes(event.id);
  if (duplicate && !bugs.has("BUG-02")) return NextResponse.json({ received: true, duplicate: true });

  if (event.type !== "invoice.paid") return NextResponse.json({ message: "Loại sự kiện không được hỗ trợ" }, { status: 422 });

  const invoice = INVOICES.find((i) => i.id === event.data?.invoice_id);
  if (!invoice) return NextResponse.json({ message: "Không tìm thấy hóa đơn" }, { status: 404 });
  if (event.data?.amount !== invoice.amount)
    return NextResponse.json({ message: "Số tiền không khớp hóa đơn" }, { status: 422 });

  const next = {
    ...state,
    paid: state.paid.includes(invoice.id) ? state.paid : [...state.paid, invoice.id],
    seen: duplicate ? state.seen : [...state.seen, event.id],
    rev: state.rev + invoice.amount,
    log: [...state.log, `${event.id}: ${invoice.id} đã thanh toán`].slice(-8),
  };
  return withWebhookState(NextResponse.json({ received: true, duplicate: false }), next);
}
