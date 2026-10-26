import { NextResponse, type NextRequest } from "next/server";
import { bugsOf } from "@/lib/labs/books-api";
import { CAN, allDocs, authenticate, forbidden, notFound, readOverlay, withOverlay } from "@/lib/labs/rbac-rules";

type Ctx = { params: Promise<{ id: string }> };

/** Tài liệu của tổ chức khác coi như không tồn tại (404) để không lộ thông tin (chống IDOR). */
async function find(req: NextRequest, ctx: Ctx, tenantOnly: boolean) {
  const user = authenticate(req);
  if (user instanceof NextResponse) return { res: user } as const;
  const { id } = await ctx.params;
  const o = readOverlay(req);
  const doc = allDocs(o).find((d) => d.id === id);
  if (!doc || (tenantOnly && doc.tenant !== user.tenant)) return { res: notFound() } as const;
  return { user, doc, o } as const;
}

export async function GET(req: NextRequest, ctx: Ctx) {
  // BUG-01: không kiểm tra tổ chức khi đọc theo id (IDOR)
  const r = await find(req, ctx, !bugsOf(req).has("BUG-01"));
  if ("res" in r) return r.res;
  return NextResponse.json(r.doc);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const r = await find(req, ctx, true);
  if ("res" in r) return r.res;
  const { user, doc, o } = r;
  const allowed = CAN.edit.includes(user.role) || (user.role === "staff" && doc.owner === user.id);
  if (!allowed) return forbidden();
  let body: { title?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Body không phải JSON hợp lệ" }, { status: 400 });
  }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (title.length < 1 || title.length > 80) return NextResponse.json({ message: "Tiêu đề bắt buộc, 1–80 ký tự" }, { status: 422 });
  return withOverlay(NextResponse.json({ ...doc, title }), { ...o, u: { ...o.u, [doc.id]: title } });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const r = await find(req, ctx, true);
  if ("res" in r) return r.res;
  const { user, doc, o } = r;
  // BR-05: chỉ admin xoá được. BUG-03: quản lý cũng xoá được.
  const allowed = CAN.delete.includes(user.role) || (bugsOf(req).has("BUG-03") && user.role === "manager");
  if (!allowed) return forbidden();
  return withOverlay(new NextResponse(null, { status: 204 }), { ...o, d: [...o.d, doc.id] });
}
