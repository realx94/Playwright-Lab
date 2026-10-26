import { NextResponse, type NextRequest } from "next/server";
import { DB_TOKEN, readDb, tableRows } from "@/lib/labs/orders-db";

/**
 * Kết nối chỉ-đọc tới "DB" của lab (tương đương SELECT … WHERE cột = giá trị).
 * Cần header x-db-token: readonly. Mọi tham số query được dùng làm điều kiện lọc bằng nhau.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ table: string }> }) {
  if (req.headers.get("x-db-token") !== DB_TOKEN)
    return NextResponse.json({ message: "Thiếu hoặc sai x-db-token" }, { status: 401 });
  const { table } = await ctx.params;
  const rows = tableRows(readDb(req), table);
  if (!rows) return NextResponse.json({ message: `Bảng ${table} không tồn tại` }, { status: 404 });

  const filters = [...req.nextUrl.searchParams.entries()].filter(([k]) => k !== "bugs");
  const filtered = rows.filter((r) => filters.every(([k, v]) => String(r[k] ?? "") === v));
  return NextResponse.json({ table, count: filtered.length, rows: filtered });
}
