import { NextResponse, type NextRequest } from "next/server";
import { bugsOf } from "@/lib/labs/books-api";
import { CAN, allDocs, authenticate, forbidden, readOverlay, withOverlay } from "@/lib/labs/rbac-rules";

export async function GET(req: NextRequest) {
  const user = authenticate(req);
  if (user instanceof NextResponse) return user;
  // BR-02: chỉ thấy tài liệu của tổ chức mình. BUG-02: lộ cả tổ chức khác.
  const docs = allDocs(readOverlay(req)).filter((d) => bugsOf(req).has("BUG-02") || d.tenant === user.tenant);
  return NextResponse.json({ data: docs, total: docs.length });
}

export async function POST(req: NextRequest) {
  const user = authenticate(req);
  if (user instanceof NextResponse) return user;
  if (!CAN.create.includes(user.role)) return forbidden();

  let body: { title?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Body không phải JSON hợp lệ" }, { status: 400 });
  }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (title.length < 1 || title.length > 80) return NextResponse.json({ message: "Tiêu đề bắt buộc, 1–80 ký tự" }, { status: 422 });

  const o = readOverlay(req);
  if (o.c.length >= 10) return NextResponse.json({ message: "Đã đạt giới hạn 10 tài liệu tự tạo" }, { status: 422 });
  const doc = { id: `d-${user.tenant.toLowerCase()}${100 + o.n + 1}`, tenant: user.tenant, title, owner: user.id };
  return withOverlay(NextResponse.json(doc, { status: 201 }), { ...o, n: o.n + 1, c: [...o.c, doc] });
}
