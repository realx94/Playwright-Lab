export const DATA_START = "2026-02-01";
export const DATA_END = "2026-03-31";
export const MAX_DAYS = 31;

export const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "dien-tu", label: "Điện tử", base: 500_000 },
  { id: "thoi-trang", label: "Thời trang", base: 200_000 },
  { id: "gia-dung", label: "Gia dụng", base: 300_000 },
] as const;

export const BUGS = [
  { id: "BUG-01", hint: "Giá trị trung bình mỗi đơn" },
  { id: "BUG-02", hint: "Tăng trưởng so với kỳ trước" },
  { id: "BUG-03", hint: "Ngày cuối của khoảng thời gian" },
];

const DAY = 86_400_000;
export const toMs = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
export const toIso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
export const dayIndex = (iso: string) => Math.round((toMs(iso) - toMs(DATA_START)) / DAY);

/** Dữ liệu mô phỏng xác định: số đơn và doanh thu theo ngày và danh mục (công thức công khai để kiểm thử đối chiếu). */
export function cell(iso: string, catIndex: number) {
  const d = dayIndex(iso);
  const base = [500_000, 200_000, 300_000][catIndex];
  const orders = 10 + ((d * 7 + catIndex * 3) % 13);
  return { orders, revenue: orders * (base + (d % 5) * 10_000) };
}

export function dayData(iso: string, category: string) {
  const idx = category === "all" ? [0, 1, 2] : [CATEGORIES.findIndex((c) => c.id === category) - 1];
  return idx.reduce((s, i) => ({ orders: s.orders + cell(iso, i).orders, revenue: s.revenue + cell(iso, i).revenue }), { orders: 0, revenue: 0 });
}

export function rangeDays(from: string, to: string, bugs: Set<string>): string[] {
  const days: string[] = [];
  // BUG-03: ngày cuối bị loại khỏi dữ liệu dù nhãn vẫn hiển thị đủ khoảng
  const end = toMs(to) - (bugs.has("BUG-03") ? DAY : 0);
  for (let t = toMs(from); t <= end; t += DAY) days.push(toIso(t));
  return days;
}

export function validateRange(from: string, to: string): string | null {
  if (!from || !to) return "Hãy chọn đủ ngày bắt đầu và ngày kết thúc";
  if (toMs(from) > toMs(to)) return "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc";
  if (from < DATA_START || to > DATA_END) return `Dữ liệu chỉ có từ ${DATA_START} đến ${DATA_END}`;
  if ((toMs(to) - toMs(from)) / DAY + 1 > MAX_DAYS) return `Chọn tối đa ${MAX_DAYS} ngày`;
  return null;
}

export interface Summary {
  revenue: number;
  orders: number;
  average: number;
  growth: string;
}

export function summarize(from: string, to: string, category: string, bugs: Set<string>): { days: { date: string; orders: number; revenue: number }[]; summary: Summary } {
  const days = rangeDays(from, to, bugs).map((date) => ({ date, ...dayData(date, category) }));
  const revenue = days.reduce((s, d) => s + d.revenue, 0);
  const orders = days.reduce((s, d) => s + d.orders, 0);
  // BUG-01: chia cho số ngày thay vì số đơn
  const average = days.length === 0 ? 0 : Math.round(revenue / (bugs.has("BUG-01") ? days.length : orders));

  const len = (toMs(to) - toMs(from)) / DAY + 1;
  const prevFrom = toIso(toMs(from) - len * DAY);
  const prevTo = toIso(toMs(from) - DAY);
  let growth = "Không có dữ liệu kỳ trước";
  if (prevFrom >= DATA_START) {
    const prev = rangeDays(prevFrom, prevTo, new Set()).reduce((s, d) => s + dayData(d, category).revenue, 0);
    // BUG-02: mẫu số là doanh thu kỳ hiện tại thay vì kỳ trước
    const denom = bugs.has("BUG-02") ? revenue : prev;
    const pct = ((revenue - prev) / denom) * 100;
    growth = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
  }
  return { days, summary: { revenue, orders, average, growth } };
}

export const money = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`;
