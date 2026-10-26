import { NextResponse, type NextRequest } from "next/server";
import { INVOICES, WEBHOOK_COOKIE, readWebhookState } from "@/lib/labs/webhook-rules";

export async function GET(req: NextRequest) {
  const s = readWebhookState(req.cookies.get(WEBHOOK_COOKIE)?.value);
  return NextResponse.json({
    invoices: INVOICES.map((i) => ({ ...i, status: s.paid.includes(i.id) ? "paid" : "unpaid" })),
    revenue: s.rev,
    processedEvents: s.seen,
    log: s.log,
  });
}
