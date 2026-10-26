export const LEAVE_KEY = "lab:leave";
export const ROLE_KEY = "lab:leave-role";
export const ANNUAL_BALANCE = 12;
export const REASON_MIN = 10;
export const REASON_MAX = 200;

export type LeaveType = "annual" | "sick" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";
export type Role = "employee" | "manager";

export const TYPE_LABEL: Record<LeaveType, string> = {
  annual: "Phép năm",
  sick: "Nghỉ ốm",
  unpaid: "Nghỉ không lương",
};

export const STATUS_LABEL: Record<LeaveStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  cancelled: "Đã huỷ",
};

export interface LeaveRequest {
  id: number;
  type: LeaveType;
  from: string; // YYYY-MM-DD
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  rejectReason?: string;
}

export interface LeaveState {
  nextId: number;
  requests: LeaveRequest[];
}

export const emptyLeave: LeaveState = { nextId: 1, requests: [] };

export const BUGS = [
  { id: "BUG-01", hint: "Cách tính số ngày nghỉ" },
  { id: "BUG-02", hint: "Quyền của nhân viên" },
  { id: "BUG-03", hint: "Kiểm tra đơn trùng ngày" },
];

const toUtc = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

/** BR-03: số ngày tính cả ngày đầu và ngày cuối. BUG-01 thiếu ngày cuối. */
export function countDays(from: string, to: string, bugs: Set<string>): number {
  const diff = Math.round((toUtc(to) - toUtc(from)) / 86_400_000);
  return bugs.has("BUG-01") ? diff : diff + 1;
}

export function todayStr(now = Date.now()): string {
  const d = new Date(now);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function usedAnnual(requests: LeaveRequest[]): number {
  return requests.filter((r) => r.type === "annual" && r.status === "approved").reduce((s, r) => s + r.days, 0);
}

export function balance(requests: LeaveRequest[]): number {
  return ANNUAL_BALANCE - usedAnnual(requests);
}

const overlaps = (a: { from: string; to: string }, b: { from: string; to: string }) =>
  toUtc(a.from) <= toUtc(b.to) && toUtc(b.from) <= toUtc(a.to);

export interface Draft {
  type: LeaveType;
  from: string;
  to: string;
  reason: string;
}

/** Trả về thông báo lỗi hoặc null nếu hợp lệ. */
export function validateRequest(d: Draft, state: LeaveState, bugs: Set<string>, now = Date.now()): string | null {
  if (!d.from || !d.to) return "Vui lòng chọn ngày bắt đầu và kết thúc";
  if (d.from < todayStr(now)) return "Ngày bắt đầu không được ở quá khứ";
  if (d.to < d.from) return "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu";

  const reason = d.reason.trim();
  if (reason.length < REASON_MIN) return `Lý do tối thiểu ${REASON_MIN} ký tự`;
  if (reason.length > REASON_MAX) return `Lý do tối đa ${REASON_MAX} ký tự`;

  const days = countDays(d.from, d.to, bugs);
  if (d.type === "annual" && days > balance(state.requests))
    return `Số ngày nghỉ (${days}) vượt quá phép năm còn lại (${balance(state.requests)})`;

  // BUG-03: bỏ qua kiểm tra trùng khoảng ngày
  if (!bugs.has("BUG-03")) {
    const clash = state.requests.some(
      (r) => (r.status === "pending" || r.status === "approved") && overlaps(r, d),
    );
    if (clash) return "Khoảng ngày này trùng với một đơn khác đang chờ duyệt hoặc đã duyệt";
  }
  return null;
}
