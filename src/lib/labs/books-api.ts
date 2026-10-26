import { NextResponse, type NextRequest } from "next/server";

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  price: number;
  stock: number;
}

export const SEED_BOOKS: Book[] = [
  { id: "b-1", title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", price: 450000, stock: 12 },
  { id: "b-2", title: "The Pragmatic Programmer", author: "Andrew Hunt", isbn: "978-0135957059", price: 520000, stock: 8 },
  { id: "b-3", title: "Refactoring", author: "Martin Fowler", isbn: "978-0134757599", price: 580000, stock: 5 },
  { id: "b-4", title: "Clean Architecture", author: "Robert C. Martin", isbn: "978-0134494166", price: 490000, stock: 7 },
  { id: "b-5", title: "Domain-Driven Design", author: "Eric Evans", isbn: "978-0321125217", price: 650000, stock: 3 },
  { id: "b-6", title: "Test Driven Development", author: "Kent Beck", isbn: "978-0321146533", price: 380000, stock: 10 },
  { id: "b-7", title: "Working Effectively with Legacy Code", author: "Michael Feathers", isbn: "978-0131177055", price: 540000, stock: 4 },
  { id: "b-8", title: "Design Patterns", author: "Erich Gamma", isbn: "978-0201633610", price: 600000, stock: 6 },
  { id: "b-9", title: "The Mythical Man-Month", author: "Frederick Brooks", isbn: "978-0201835953", price: 350000, stock: 9 },
  { id: "b-10", title: "Code Complete", author: "Steve McConnell", isbn: "978-0735619678", price: 620000, stock: 2 },
  { id: "b-11", title: "Continuous Delivery", author: "Jez Humble", isbn: "978-0321601919", price: 560000, stock: 11 },
  { id: "b-12", title: "Accelerate", author: "Nicole Forsgren", isbn: "978-1942788331", price: 420000, stock: 15 },
];

export const COOKIE = "lab_books";
export const DEFAULT_PAGE_SIZE = 5;
export const MAX_PAGE_SIZE = 50;
const MAX_CREATED = 10;

/** Thay đổi của người học so với dữ liệu gốc; lưu trong cookie để server không giữ trạng thái. */
interface Overlay {
  n: number;
  c: Book[];
  u: Record<string, Partial<Book>>;
  d: string[];
}

const emptyOverlay = (): Overlay => ({ n: 0, c: [], u: {}, d: [] });

function decode(raw: string | undefined): Overlay {
  if (!raw) return emptyOverlay();
  try {
    const o = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Overlay;
    return { n: o.n ?? 0, c: o.c ?? [], u: o.u ?? {}, d: o.d ?? [] };
  } catch {
    return emptyOverlay();
  }
}

const encode = (o: Overlay) => Buffer.from(JSON.stringify(o), "utf8").toString("base64url");

export function readOverlay(req: NextRequest): Overlay {
  return decode(req.cookies.get(COOKIE)?.value);
}

export function listBooks(o: Overlay): Book[] {
  const base = SEED_BOOKS.filter((b) => !o.d.includes(b.id)).map((b) => ({ ...b, ...(o.u[b.id] ?? {}) }));
  const created = o.c.filter((b) => !o.d.includes(b.id)).map((b) => ({ ...b, ...(o.u[b.id] ?? {}) }));
  return [...base, ...created];
}

export function withState(res: NextResponse, o: Overlay): NextResponse {
  res.cookies.set(COOKIE, encode(o), { path: "/api/lab", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 });
  return res;
}

export function resetState(res: NextResponse): NextResponse {
  res.cookies.set(COOKIE, "", { path: "/api/lab", maxAge: 0 });
  return res;
}

export const bugsOf = (req: NextRequest) =>
  new Set(
    [req.nextUrl.searchParams.get("bugs"), req.headers.get("x-lab-bugs"), req.cookies.get("lab_bugs")?.value]
      .filter(Boolean)
      .flatMap((v) => (v as string).split(",")),
  );

export type Role = "admin" | "reader";

/** Trả về vai trò, hoặc phản hồi lỗi 401/403 nếu không đủ quyền ghi. */
export function authorizeWrite(req: NextRequest, needAdmin = false): { role: Role } | NextResponse {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const role: Role | null = token === "admin-token" ? "admin" : token === "reader-token" ? "reader" : null;
  if (!role) return NextResponse.json({ message: "Thiếu hoặc sai token xác thực" }, { status: 401 });
  if (role === "reader" || (needAdmin && role !== "admin"))
    return NextResponse.json({ message: "Không đủ quyền thực hiện thao tác này" }, { status: 403 });
  return { role };
}

export interface FieldError {
  field: string;
  message: string;
}

const ISBN_RE = /^978-\d{10}$/;

export function validateBook(input: unknown, partial: boolean): { data: Partial<Book>; errors: FieldError[] } {
  const errors: FieldError[] = [];
  const data: Partial<Book> = {};
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const need = (k: string) => !partial || k in src;

  if (need("title")) {
    if (typeof src.title !== "string" || src.title.trim().length < 1 || src.title.length > 100)
      errors.push({ field: "title", message: "Tiêu đề bắt buộc, 1–100 ký tự" });
    else data.title = src.title.trim();
  }
  if (need("author")) {
    if (typeof src.author !== "string" || src.author.trim().length < 1)
      errors.push({ field: "author", message: "Tác giả là bắt buộc" });
    else data.author = src.author.trim();
  }
  if (need("isbn")) {
    if (typeof src.isbn !== "string" || !ISBN_RE.test(src.isbn))
      errors.push({ field: "isbn", message: "ISBN phải có dạng 978-xxxxxxxxxx" });
    else data.isbn = src.isbn;
  }
  if (need("price")) {
    if (!Number.isInteger(src.price) || (src.price as number) < 0 || (src.price as number) > 10_000_000)
      errors.push({ field: "price", message: "Giá là số nguyên từ 0 đến 10.000.000" });
    else data.price = src.price as number;
  }
  if ("stock" in src) {
    if (!Number.isInteger(src.stock) || (src.stock as number) < 0)
      errors.push({ field: "stock", message: "Tồn kho là số nguyên không âm" });
    else data.stock = src.stock as number;
  }
  return { data, errors };
}

export function createBook(o: Overlay, data: Partial<Book>): { overlay: Overlay; book: Book } {
  const n = o.n + 1;
  const book: Book = {
    id: `b-${100 + n}`,
    title: data.title!,
    author: data.author!,
    isbn: data.isbn!,
    price: data.price!,
    stock: data.stock ?? 0,
  };
  return { overlay: { ...o, n, c: [...o.c, book] }, book };
}

export function canCreateMore(o: Overlay) {
  return o.c.length < MAX_CREATED;
}

export function updateBook(o: Overlay, id: string, data: Partial<Book>): Overlay {
  return { ...o, u: { ...o.u, [id]: { ...(o.u[id] ?? {}), ...data } } };
}

export function deleteBook(o: Overlay, id: string): Overlay {
  return { ...o, d: [...o.d, id] };
}
