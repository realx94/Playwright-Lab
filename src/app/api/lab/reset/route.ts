import { NextResponse } from "next/server";
import { resetState } from "@/lib/labs/books-api";
import { resetDb } from "@/lib/labs/orders-db";

/** Xoá toàn bộ thay đổi của phiên hiện tại (sách và đơn hàng), đưa dữ liệu về trạng thái ban đầu. */
export async function POST() {
  return resetDb(resetState(new NextResponse(null, { status: 204 })));
}
