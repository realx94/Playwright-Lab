import { NextResponse, type NextRequest } from "next/server";
import { bugsOf } from "@/lib/labs/books-api";
import { buildCsv, buildDocx, buildPdf, buildXlsx, buildXml } from "@/lib/labs/reports-build";
import { FORMATS, GENERATED_AT, MIME, filterOrders, isValidFilter, reportFilename, type Format } from "@/lib/labs/reports-rules";

/** GET /api/lab/report/<xlsx|xml|docx|pdf|csv>?month=2026-03&status=Hoàn tất */
export async function GET(req: NextRequest, ctx: { params: Promise<{ format: string }> }) {
  const { format } = await ctx.params;
  if (!(FORMATS as readonly string[]).includes(format)) {
    return NextResponse.json({ message: `Định dạng không được hỗ trợ: ${format}` }, { status: 404 });
  }
  const fmt = format as Format;
  const f = { month: req.nextUrl.searchParams.get("month") ?? "", status: req.nextUrl.searchParams.get("status") ?? "" };
  if (!isValidFilter(f)) return NextResponse.json({ message: "Bộ lọc không hợp lệ" }, { status: 400 });

  const bugs = bugsOf(req);
  const list = filterOrders(f);
  // BUG-03: PDF/Word bỏ qua bộ lọc trạng thái (vẫn gồm đơn đã huỷ)
  const docList = fmt === "pdf" || fmt === "docx" ? (bugs.has("BUG-03") ? filterOrders({ ...f, status: "" }) : list) : list;

  let body: Buffer;
  if (fmt === "xlsx") body = await buildXlsx(list, bugs);
  else if (fmt === "xml") body = buildXml(list, f, bugs);
  else if (fmt === "docx") body = await buildDocx(docList, f);
  else if (fmt === "pdf") body = await buildPdf(docList, f);
  else body = buildCsv(list);

  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": MIME[fmt],
      "Content-Disposition": `attachment; filename="${reportFilename(f, fmt)}"`,
      "Content-Length": String(body.length),
      "Cache-Control": "no-store",
      "X-Report-Generated": GENERATED_AT,
      "X-Report-Rows": String(docList.length),
    },
  });
}
