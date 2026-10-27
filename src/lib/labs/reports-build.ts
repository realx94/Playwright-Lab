import ExcelJS from "exceljs";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, HeadingLevel, WidthType } from "docx";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  GENERATED_AT,
  asciiFold,
  csvCell,
  isoDate,
  money,
  plainAmount,
  sumCents,
  summaryByStatus,
  viDate,
  xmlEscape,
  type Filter,
  type Order,
} from "./reports-rules";

const filterText = (f: Filter) => `Tháng: ${f.month || "tất cả"} · Trạng thái: ${f.status || "tất cả"}`;

export function buildCsv(list: Order[]): Buffer {
  const head = ["Mã đơn", "Ngày", "Khách hàng", "Trạng thái", "Số tiền"].map(csvCell).join(",");
  const rows = list.map((o) => [o.id, isoDate(o.at), o.customer, o.status, plainAmount(o.cents)].map(csvCell).join(","));
  return Buffer.from("﻿" + [head, ...rows].join("\r\n") + "\r\n", "utf8");
}

export function buildXml(list: Order[], f: Filter, bugs: Set<string>): Buffer {
  const esc = (s: string) => xmlEscape(s, bugs.has("BUG-02")); // BUG-02: không escape &
  const orders = list
    .map(
      (o) =>
        `  <order id="${esc(o.id)}" status="${esc(o.status)}">\n` +
        `    <date>${isoDate(o.at)}</date>\n` +
        `    <customer>${esc(o.customer)}</customer>\n` +
        `    <amount currency="VND">${plainAmount(o.cents)}</amount>\n` +
        `  </order>`,
    )
    .join("\n");
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<report generated="${GENERATED_AT}" month="${f.month || "all"}" status="${esc(f.status || "all")}" count="${list.length}" total="${plainAmount(sumCents(list))}">\n` +
    `${orders}\n</report>\n`;
  return Buffer.from(xml, "utf8");
}

export async function buildXlsx(list: Order[], bugs: Set<string>): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Playwright Lab";
  wb.created = new Date(GENERATED_AT);
  wb.modified = new Date(GENERATED_AT);

  const ws = wb.addWorksheet("Đơn hàng");
  ws.columns = [
    { header: "Mã đơn", key: "id", width: 12 },
    { header: "Ngày", key: "at", width: 18, style: { numFmt: "dd/mm/yyyy hh:mm" } },
    { header: "Khách hàng", key: "customer", width: 34 },
    { header: "Trạng thái", key: "status", width: 12 },
    { header: "Số tiền", key: "amount", width: 18, style: { numFmt: "#,##0.00" } },
  ];
  ws.getRow(1).font = { bold: true };
  for (const o of list) {
    const m = o.at.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)!;
    // Giờ địa phương được lưu như giờ "trôi" (không múi giờ), đúng cách Excel hiểu ngày giờ.
    const at = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
    ws.addRow({ id: o.id, at, customer: o.customer, status: o.status, amount: o.cents / 100 });
  }
  const n = list.length;
  const counted = bugs.has("BUG-01") ? list.slice(0, -1) : list; // BUG-01: thiếu dòng cuối
  const last = bugs.has("BUG-01") ? n : n + 1;
  const total = ws.addRow({ id: "Tổng cộng" });
  total.getCell(5).value = { formula: `SUM(E2:E${last})`, result: sumCents(counted) / 100 };
  total.getCell(5).numFmt = "#,##0.00";
  total.font = { bold: true };

  const sum = wb.addWorksheet("Tổng hợp");
  sum.columns = [
    { header: "Trạng thái", key: "status", width: 14 },
    { header: "Số đơn", key: "count", width: 10 },
    { header: "Tổng tiền", key: "amount", width: 18, style: { numFmt: "#,##0.00" } },
  ];
  sum.getRow(1).font = { bold: true };
  for (const r of summaryByStatus(list)) sum.addRow({ status: r.status, count: r.count, amount: r.cents / 100 });

  return Buffer.from(await wb.xlsx.writeBuffer());
}

export async function buildDocx(list: Order[], f: Filter): Promise<Buffer> {
  const cell = (t: string, bold = false) =>
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold })] })] });
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: ["Mã đơn", "Ngày", "Khách hàng", "Trạng thái", "Số tiền"].map((h) => cell(h, true)) }),
      ...list.map((o) => new TableRow({ children: [o.id, viDate(o.at), o.customer, o.status, money(o.cents)].map((t) => cell(t)) })),
    ],
  });
  const doc = new Document({
    creator: "Playwright Lab",
    title: "Báo cáo đơn hàng",
    sections: [
      {
        children: [
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Báo cáo đơn hàng")] }),
          new Paragraph({ children: [new TextRun(filterText(f))] }),
          new Paragraph({ children: [new TextRun(`Tổng cộng ${list.length} đơn, tổng tiền ${money(sumCents(list))} ₫.`)] }),
          table,
        ],
      },
    ],
  });
  return Buffer.from(await Packer.toBuffer(doc));
}

/** PDF dùng font chuẩn Helvetica (WinAnsi, không có dấu tiếng Việt) nên văn bản được bỏ dấu. */
export async function buildPdf(list: Order[], f: Filter): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.setTitle("Bao cao don hang");
  pdf.setCreationDate(new Date(GENERATED_AT));
  pdf.setModificationDate(new Date(GENERATED_AT));
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const lines: { t: string; b?: boolean; size?: number }[] = [
    { t: "Bao cao don hang", b: true, size: 18 },
    { t: asciiFold(filterText(f)) },
    { t: asciiFold(`Tong cong ${list.length} don, tong tien ${money(sumCents(list))} VND`) },
    { t: "" },
    { t: "Ma don | Ngay | Khach hang | Trang thai | So tien", b: true },
    ...list.map((o) => ({ t: asciiFold(`${o.id} | ${viDate(o.at)} | ${o.customer} | ${o.status} | ${money(o.cents)}`) })),
  ];
  let page = pdf.addPage([595, 842]);
  let y = 800;
  for (const l of lines) {
    if (y < 50) {
      page = pdf.addPage([595, 842]);
      y = 800;
    }
    page.drawText(l.t, { x: 40, y, size: l.size ?? 10, font: l.b ? bold : font });
    y -= (l.size ?? 10) + 8;
  }
  return Buffer.from(await pdf.save());
}
