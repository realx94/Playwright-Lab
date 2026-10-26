import { NextResponse, type NextRequest } from "next/server";
import { authorizeWrite, bugsOf } from "@/lib/labs/books-api";
import { createOrder, orderBody, readDb, withDb } from "@/lib/labs/orders-db";

export async function GET(req: NextRequest) {
  const db = readDb(req);
  const data = db.orders.filter((o) => !o.deleted_at).map((o) => orderBody(db, o));
  return NextResponse.json({ data, total: data.length });
}

export async function POST(req: NextRequest) {
  const auth = authorizeWrite(req);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Body không phải JSON hợp lệ" }, { status: 400 });
  }

  const result = createOrder(readDb(req), body, req.headers.get("idempotency-key"), bugsOf(req));
  const res = NextResponse.json(result.body, {
    status: result.status,
    headers: "location" in result && result.location ? { Location: result.location } : undefined,
  });
  return withDb(res, result.db);
}
