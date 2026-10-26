export const TICKET_KEY = "lab:tickets";
export const MAX_ATTACH = 1024 * 1024;

export const BUGS = [
  { id: "BUG-01", hint: "Hạn xử lý của mức ưu tiên Cao" },
  { id: "BUG-02", hint: "Thời điểm tính quá hạn" },
  { id: "BUG-03", hint: "Bình luận trên ticket đã đóng" },
];

export const PRIORITIES = [
  { id: "urgent", label: "Khẩn", hours: 1 },
  { id: "high", label: "Cao", hours: 4 },
  { id: "medium", label: "Trung bình", hours: 8 },
  { id: "low", label: "Thấp", hours: 24 },
] as const;

export const STATUSES = ["Mới", "Đang xử lý", "Chờ khách", "Đã giải quyết", "Đóng"] as const;
export type Status = (typeof STATUSES)[number];

/** Ma trận chuyển trạng thái cho phép. */
export const TRANSITIONS: Record<Status, Status[]> = {
  "Mới": ["Đang xử lý"],
  "Đang xử lý": ["Chờ khách", "Đã giải quyết"],
  "Chờ khách": ["Đang xử lý"],
  "Đã giải quyết": ["Đóng", "Đang xử lý"],
  "Đóng": [],
};

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
  attachment: string | null;
  status: Status;
  createdAt: number;
  resolvedAt: number | null;
  comments: { at: number; text: string }[];
}

export const clock = () => Date.now();

export function slaHours(priority: string, bugs: Set<string>): number {
  // BUG-01: ưu tiên Cao bị đặt 8 giờ thay vì 4 giờ
  if (priority === "high" && bugs.has("BUG-01")) return 8;
  return PRIORITIES.find((p) => p.id === priority)!.hours;
}

export const deadlineOf = (t: Ticket, bugs: Set<string>) => t.createdAt + slaHours(t.priority, bugs) * 3_600_000;

/** BR-04: quá hạn khi bây giờ lớn hơn hạn (đúng hạn chưa quá hạn). BUG-02: lớn hơn hoặc bằng. */
export function slaState(t: Ticket, now: number, bugs: Set<string>): { label: string; overdue: boolean } {
  const deadline = deadlineOf(t, bugs);
  const end = t.resolvedAt ?? now;
  const overdue = bugs.has("BUG-02") ? end >= deadline : end > deadline;
  if (t.status === "Đã giải quyết" || t.status === "Đóng") return { label: overdue ? "Giải quyết trễ hạn" : "Giải quyết đúng hạn", overdue };
  if (overdue) return { label: "Quá hạn", overdue: true };
  const mins = Math.floor((deadline - now) / 60_000);
  return { label: `Còn ${Math.floor(mins / 60)} giờ ${mins % 60} phút`, overdue: false };
}

export function validateTicket(f: { title: string; description: string; priority: string; file: { name: string; size: number } | null }): Record<string, string> {
  const e: Record<string, string> = {};
  const t = f.title.trim().length;
  if (t < 5 || t > 100) e.title = "Tiêu đề từ 5 đến 100 ký tự";
  const d = f.description.trim().length;
  if (d < 10 || d > 1000) e.description = "Mô tả từ 10 đến 1000 ký tự";
  if (!f.priority) e.priority = "Hãy chọn mức ưu tiên";
  if (f.file) {
    if (!/\.(png|jpg|jpeg|pdf|txt)$/i.test(f.file.name)) e.file = "Tệp đính kèm chỉ nhận PNG, JPG, PDF, TXT";
    else if (f.file.size > MAX_ATTACH) e.file = "Tệp đính kèm tối đa 1 MB";
  }
  return e;
}

export function loadTickets(): Ticket[] {
  try {
    return JSON.parse(localStorage.getItem(TICKET_KEY) ?? "[]") as Ticket[];
  } catch {
    return [];
  }
}
