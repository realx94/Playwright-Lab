import { NextResponse } from "next/server";
import { resetState } from "@/lib/labs/books-api";
import { resetGuard } from "@/lib/labs/guard-rules";
import { resetDb } from "@/lib/labs/orders-db";
import { resetWebhookState } from "@/lib/labs/webhook-rules";

/** Xoá toàn bộ thay đổi của phiên hiện tại (sách, đơn hàng, bộ đếm đăng nhập, webhook), đưa dữ liệu về ban đầu. */
export async function POST() {
  return resetWebhookState(resetGuard(resetDb(resetState(new NextResponse(null, { status: 204 })))));
}
