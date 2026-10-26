import { NextResponse } from "next/server";
import { resetState } from "@/lib/labs/books-api";

/** Xoá toàn bộ thay đổi của phiên hiện tại, đưa dữ liệu về trạng thái ban đầu. */
export async function POST() {
  return resetState(new NextResponse(null, { status: 204 }));
}
