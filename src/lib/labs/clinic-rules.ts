export const CLINIC_KEY = "lab:clinic";
export const SLOT_STARTS = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "13:30", "14:00", "14:30", "15:00", "15:30"];
export const MIN_LEAD_HOURS = 2;
export const MAX_ADVANCE_DAYS = 30;

export const DOCTORS = [
  { id: "bs-an", name: "BS. Nguyễn An", dept: "Nội tổng quát", booked: { "2026-03-02": ["08:00", "09:00"] } as Record<string, string[]> },
  { id: "bs-binh", name: "BS. Trần Bình", dept: "Nhi khoa", booked: { "2026-03-02": SLOT_STARTS } as Record<string, string[]> },
];

export const BUGS = [
  { id: "BUG-01", hint: "Đặt lịch cho cùng một khung giờ" },
  { id: "BUG-02", hint: "Ngày không làm việc" },
  { id: "BUG-03", hint: "Kiểm tra họ tên và số điện thoại" },
];

export interface Appointment {
  id: string;
  doctor: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  reason: string;
}

export const clock = () => Date.now();
export const dayOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);
export const isSunday = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay() === 0;

export function validateAppointment(
  f: { name: string; phone: string; reason: string; date: string; time: string },
  now: number,
  bugs: Set<string>,
): Record<string, string> {
  const e: Record<string, string> = {};
  // BR-04: họ tên 2–50 ký tự, điện thoại 10 số bắt đầu bằng 0 (BUG-03: bỏ kiểm tra)
  if (!bugs.has("BUG-03")) {
    if (f.name.trim().length < 2 || f.name.trim().length > 50) e.name = "Họ tên từ 2 đến 50 ký tự";
    if (!/^0\d{9}$/.test(f.phone)) e.phone = "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0";
  }
  if (f.reason.length > 200) e.reason = "Lý do tối đa 200 ký tự";
  if (!f.date) e.date = "Hãy chọn ngày khám";
  else {
    const today = dayOf(now);
    // BR-02: không chọn ngày quá khứ, tối đa 30 ngày tới; chủ nhật nghỉ (BUG-02: vẫn nhận)
    if (f.date < today) e.date = "Không thể đặt lịch cho ngày đã qua";
    else if ((Date.parse(`${f.date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000 > MAX_ADVANCE_DAYS) e.date = `Chỉ đặt trước tối đa ${MAX_ADVANCE_DAYS} ngày`;
    else if (isSunday(f.date) && !bugs.has("BUG-02")) e.date = "Phòng khám nghỉ Chủ nhật";
  }
  if (!f.time) e.time = "Hãy chọn khung giờ";
  return e;
}

/** Khung giờ phải bắt đầu sau bây giờ ít nhất 2 tiếng (theo giờ UTC của lab). */
export function slotState(date: string, time: string, now: number, taken: string[]): "free" | "taken" | "late" {
  if (taken.includes(time)) return "taken";
  const start = Date.parse(`${date}T${time}:00Z`);
  return start - now < MIN_LEAD_HOURS * 3_600_000 ? "late" : "free";
}

export function loadClinic(): Appointment[] {
  try {
    return JSON.parse(localStorage.getItem(CLINIC_KEY) ?? "[]") as Appointment[];
  } catch {
    return [];
  }
}
