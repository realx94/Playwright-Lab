import { NextResponse, type NextRequest } from "next/server";
import { authorizeWrite } from "@/lib/labs/books-api";
import { orderBody, readDb, softDelete, withDb } from "@/lib/labs/orders-db";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = readDb(req);
  const o = db.orders.find((x) => x.id === id && !x.deleted_at);
  if (!o) return NextResponse.json({ message: "Không tìm thấy đơn hàng" }, { status: 404 });
  return NextResponse.json(orderBody(db, o));
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = authorizeWrite(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await ctx.params;
  const next = softDelete(readDb(req), id);
  if (!next) return NextResponse.json({ message: "Không tìm thấy đơn hàng" }, { status: 404 });
  return withDb(new NextResponse(null, { status: 204 }), next);
}
