import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  authorizeWrite,
  bugsOf,
  canCreateMore,
  createBook,
  listBooks,
  readOverlay,
  validateBook,
  withState,
} from "@/lib/labs/books-api";

export async function GET(req: NextRequest) {
  const bugs = bugsOf(req);
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(sp.get("pageSize")) || DEFAULT_PAGE_SIZE));
  const q = sp.get("q")?.trim().toLowerCase();

  let books = listBooks(readOverlay(req));
  if (q) books = books.filter((b) => `${b.title} ${b.author}`.toLowerCase().includes(q));

  // BUG-01: lệch một đơn vị khi phân trang (bỏ qua phần tử đầu của mỗi trang)
  const start = (page - 1) * pageSize + (bugs.has("BUG-01") ? 1 : 0);
  return NextResponse.json({
    data: books.slice(start, start + pageSize),
    page,
    pageSize,
    total: books.length,
  });
}

export async function POST(req: NextRequest) {
  const bugs = bugsOf(req);
  const auth = authorizeWrite(req);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Body không phải JSON hợp lệ" }, { status: 400 });
  }

  const { data, errors } = validateBook(body, false);
  if (errors.length) return NextResponse.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 422 });

  const overlay = readOverlay(req);
  if (listBooks(overlay).some((b) => b.isbn === data.isbn))
    return NextResponse.json({ message: "ISBN đã tồn tại" }, { status: 409 });
  if (!canCreateMore(overlay))
    return NextResponse.json({ message: "Đã đạt giới hạn 10 sách tự tạo; hãy gọi /api/lab/reset" }, { status: 422 });

  const { overlay: next, book } = createBook(overlay, data);
  const res = NextResponse.json(book, {
    // BUG-02: trả về 200 thay vì 201 khi tạo mới
    status: bugs.has("BUG-02") ? 200 : 201,
    headers: { Location: `/api/lab/books/${book.id}` },
  });
  return withState(res, next);
}
