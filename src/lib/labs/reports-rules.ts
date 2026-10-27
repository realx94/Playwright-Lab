export const BUGS = [
  { id: "BUG-01", hint: "Tổng tiền trong Excel thiếu dòng cuối cùng" },
  { id: "BUG-02", hint: "XML không escape ký tự &" },
  { id: "BUG-03", hint: "Xuất PDF/Word bỏ qua bộ lọc trạng thái" },
];

export const FORMATS = ["xlsx", "xml", "docx", "pdf", "csv"] as const;
export type Format = (typeof FORMATS)[number];

export const MIME: Record<Format, string> = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xml: "application/xml; charset=utf-8",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
  csv: "text/csv; charset=utf-8",
};

export const STATUSES = ["Hoàn tất", "Đã huỷ"] as const;
export type Status = (typeof STATUSES)[number];

export const MONTHS = ["2026-02", "2026-03", "2026-04"] as const;

/** Thời điểm xuất báo cáo cố định để kết quả xác định. */
export const GENERATED_AT = "2026-04-30T09:00:00+07:00";

export interface Order {
  id: string;
  at: string; // ISO có múi giờ +07:00
  customer: string;
  status: Status;
  cents: number; // số tiền tính bằng xu (2 chữ số thập phân), tránh sai số số thực
}

export const ORDERS: Order[] = [
  { id: "DH-001", at: "2026-02-03T08:30:00+07:00", customer: "Nguyễn Văn An", status: "Hoàn tất", cents: 125000050 },
  { id: "DH-002", at: "2026-02-14T10:05:00+07:00", customer: "Công ty A & B", status: "Hoàn tất", cents: 340000000 },
  { id: "DH-003", at: "2026-02-20T15:45:00+07:00", customer: "Trần Thị Bé", status: "Đã huỷ", cents: 78000025 },
  { id: "DH-004", at: "2026-03-02T09:15:00+07:00", customer: 'Lê "Bobby" Hoàng', status: "Hoàn tất", cents: 199999999 },
  { id: "DH-005", at: "2026-03-05T11:20:00+07:00", customer: "Phạm <Minh> Đức", status: "Hoàn tất", cents: 45000010 },
  { id: "DH-006", at: "2026-03-09T13:00:00+07:00", customer: "Cửa hàng Hoa & Quà", status: "Đã huỷ", cents: 12500000 },
  { id: "DH-007", at: "2026-03-15T16:40:00+07:00", customer: "Đặng Thị Ánh Tuyết", status: "Hoàn tất", cents: 875000075 },
  { id: "DH-008", at: "2026-03-21T09:50:00+07:00", customer: "Võ Quốc Việt", status: "Hoàn tất", cents: 30550030 },
  { id: "DH-009", at: "2026-03-28T14:10:00+07:00", customer: "O'Neil & Sons", status: "Hoàn tất", cents: 221000000 },
  { id: "DH-010", at: "2026-04-01T08:00:00+07:00", customer: "Hoàng Thị Mỹ Hạnh", status: "Hoàn tất", cents: 64000005 },
  { id: "DH-011", at: "2026-04-07T17:25:00+07:00", customer: "Bùi Đình Khôi", status: "Đã huỷ", cents: 99900099 },
  { id: "DH-012", at: "2026-04-12T10:30:00+07:00", customer: "Ngô Thị Thu Thảo", status: "Hoàn tất", cents: 152000040 },
  { id: "DH-013", at: "2026-04-18T12:15:00+07:00", customer: 'Công ty TNHH "Sao Mai" <HN>', status: "Hoàn tất", cents: 430000000 },
  { id: "DH-014", at: "2026-04-25T09:05:00+07:00", customer: "Đỗ Hữu Phước", status: "Hoàn tất", cents: 27500080 },
];

export interface Filter {
  month: string; // "" = tất cả
  status: string; // "" = tất cả
}

export function isValidFilter(f: Filter): boolean {
  return (f.month === "" || (MONTHS as readonly string[]).includes(f.month)) && (f.status === "" || (STATUSES as readonly string[]).includes(f.status));
}

export function filterOrders(f: Filter): Order[] {
  return ORDERS.filter((o) => (!f.month || o.at.startsWith(f.month)) && (!f.status || o.status === f.status));
}

export const sumCents = (list: Order[]) => list.reduce((s, o) => s + o.cents, 0);

/** 1999999.99 (số, dùng cho CSV/XML/Excel). */
export const plainAmount = (cents: number) => (cents / 100).toFixed(2);

/** 1.999.999,99 (định dạng hiển thị tiếng Việt, dùng cho trang, Word, PDF). */
export function money(cents: number): string {
  const [i, d] = plainAmount(cents).split(".");
  return `${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${d}`;
}

/** 02/03/2026 09:15 */
export function viDate(at: string): string {
  const m = at.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)!;
  return `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}`;
}

/** 2026-03-02 09:15 (dùng cho CSV/XML). */
export const isoDate = (at: string) => at.slice(0, 10) + " " + at.slice(11, 16);

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** bao-cao-2026-03.xlsx, bao-cao-2026-03-hoan-tat.xlsx, bao-cao-tat-ca.xlsx */
export function reportFilename(f: Filter, ext: Format): string {
  return `bao-cao-${f.month || "tat-ca"}${f.status ? "-" + slug(f.status) : ""}.${ext}`;
}

export const summaryByStatus = (list: Order[]) =>
  STATUSES.map((s) => {
    const rows = list.filter((o) => o.status === s);
    return { status: s, count: rows.length, cents: sumCents(rows) };
  }).filter((r) => r.count > 0);

/** Bỏ dấu tiếng Việt để PDF dùng font chuẩn (WinAnsi) vẫn trích xuất được văn bản. */
export function asciiFold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function xmlEscape(s: string, skipAmpersand = false): string {
  let out = skipAmpersand ? s : s.replace(/&/g, "&amp;");
  out = out.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  return out;
}

export function csvCell(v: string): string {
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}
