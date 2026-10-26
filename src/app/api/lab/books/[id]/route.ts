import { NextResponse, type NextRequest } from "next/server";
import {
  authorizeWrite,
  bugsOf,
  deleteBook,
  listBooks,
  readOverlay,
  updateBook,
  validateBook,
  withState,
} from "@/lib/labs/books-api";

type Ctx = { params: Promise<{ id: string }> };

const notFound = () => NextResponse.json({ message: "Không tìm thấy sách" }, { status: 404 });

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const book = listBooks(readOverlay(req)).find((b) => b.id === id);
  return book ? NextResponse.json(book) : notFound();
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const auth = authorizeWrite(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const overlay = readOverlay(req);
  if (!listBooks(overlay).some((b) => b.id === id)) return notFound();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Body không phải JSON hợp lệ" }, { status: 400 });
  }
  const { data, errors } = validateBook(body, true);
  if (errors.length) return NextResponse.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 422 });

  if (data.isbn && listBooks(overlay).some((b) => b.isbn === data.isbn && b.id !== id))
    return NextResponse.json({ message: "ISBN đã tồn tại" }, { status: 409 });

  const next = updateBook(overlay, id, data);
  const updated = listBooks(next).find((b) => b.id === id)!;
  return withState(NextResponse.json(updated), next);
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const bugs = bugsOf(req);
  const auth = authorizeWrite(req, true);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const overlay = readOverlay(req);
  if (!listBooks(overlay).some((b) => b.id === id)) {
    // BUG-03: xoá sách không tồn tại vẫn trả 204 thay vì 404
    return bugs.has("BUG-03") ? new NextResponse(null, { status: 204 }) : notFound();
  }
  return withState(new NextResponse(null, { status: 204 }), deleteBook(overlay, id));
}
