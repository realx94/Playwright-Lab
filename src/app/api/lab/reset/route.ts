import { NextResponse } from "next/server";
import { resetState } from "@/lib/labs/books-api";
import { resetGuard } from "@/lib/labs/guard-rules";
import { resetDb } from "@/lib/labs/orders-db";
import { resetOverlay } from "@/lib/labs/rbac-rules";
import { resetWebhookState } from "@/lib/labs/webhook-rules";

/** Xoá toàn bộ thay đổi của phiên hiện tại (mọi lab dùng API), đưa dữ liệu về trạng thái ban đầu. */
export async function POST() {
  return resetOverlay(resetWebhookState(resetGuard(resetDb(resetState(new NextResponse(null, { status: 204 }))))));
}
