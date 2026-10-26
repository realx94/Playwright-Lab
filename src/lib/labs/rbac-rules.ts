import { NextResponse, type NextRequest } from "next/server";

export const RBAC_COOKIE = "lab_rbac";

export type Role = "admin" | "manager" | "staff" | "guest";
export interface RbacUser {
  id: string;
  name: string;
  tenant: "A" | "B";
  role: Role;
}

export const USERS: RbacUser[] = [
  { id: "alice", name: "Alice", tenant: "A", role: "admin" },
  { id: "bob", name: "Bob", tenant: "A", role: "manager" },
  { id: "carol", name: "Carol", tenant: "A", role: "staff" },
  { id: "dave", name: "Dave", tenant: "A", role: "guest" },
  { id: "erin", name: "Erin", tenant: "B", role: "admin" },
];

export interface Doc {
  id: string;
  tenant: "A" | "B";
  title: string;
  owner: string;
}

export const SEED_DOCS: Doc[] = [
  { id: "d-a1", tenant: "A", title: "Kế hoạch quý", owner: "alice" },
  { id: "d-a2", tenant: "A", title: "Báo cáo doanh thu", owner: "bob" },
  { id: "d-a3", tenant: "A", title: "Ghi chú của Carol", owner: "carol" },
  { id: "d-b1", tenant: "B", title: "Hợp đồng đối tác B", owner: "erin" },
  { id: "d-b2", tenant: "B", title: "Bảng lương nội bộ B", owner: "erin" },
];

export const BUGS = [
  { id: "BUG-01", hint: "Truy cập tài liệu của tổ chức khác bằng id" },
  { id: "BUG-02", hint: "Danh sách tài liệu" },
  { id: "BUG-03", hint: "Quyền xoá của quản lý" },
];

/** Ma trận quyền hành động theo vai trò. */
export const CAN = {
  create: ["admin", "manager", "staff"] as Role[],
  edit: ["admin", "manager"] as Role[], // staff chỉ sửa tài liệu của chính mình
  delete: ["admin"] as Role[],
};

interface Overlay {
  n: number;
  c: Doc[];
  u: Record<string, string>;
  d: string[];
}
const empty = (): Overlay => ({ n: 0, c: [], u: {}, d: [] });

export function readOverlay(req: NextRequest): Overlay {
  const raw = req.cookies.get(RBAC_COOKIE)?.value;
  if (!raw) return empty();
  try {
    return { ...empty(), ...(JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Overlay) };
  } catch {
    return empty();
  }
}

export function withOverlay(res: NextResponse, o: Overlay): NextResponse {
  res.cookies.set(RBAC_COOKIE, Buffer.from(JSON.stringify(o), "utf8").toString("base64url"), {
    path: "/api/lab",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60,
  });
  return res;
}

export function resetOverlay(res: NextResponse): NextResponse {
  res.cookies.set(RBAC_COOKIE, "", { path: "/api/lab", maxAge: 0 });
  return res;
}

export const allDocs = (o: Overlay): Doc[] =>
  [...SEED_DOCS, ...o.c].filter((d) => !o.d.includes(d.id)).map((d) => ({ ...d, title: o.u[d.id] ?? d.title }));

export function authenticate(req: NextRequest): RbacUser | NextResponse {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const user = USERS.find((u) => u.id === token);
  if (!user) return NextResponse.json({ message: "Thiếu hoặc sai token xác thực" }, { status: 401 });
  return user;
}

export const forbidden = () => NextResponse.json({ message: "Bạn không có quyền thực hiện thao tác này" }, { status: 403 });
export const notFound = () => NextResponse.json({ message: "Không tìm thấy tài liệu" }, { status: 404 });
