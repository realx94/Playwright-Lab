export const TZ_KEY = "lab:tz-booking";
export const CUTOFF_MS = 2 * 60 * 60_000; // đóng đặt trước giờ bắt đầu 2 giờ

export const ZONES = ["auto", "Asia/Ho_Chi_Minh", "America/New_York", "Europe/London", "Australia/Sydney"] as const;
export const DATES = ["2026-03-01", "2026-03-08"] as const; // 2026-03-08: Mỹ chuyển sang giờ mùa hè (DST)

export const BUGS = [
  { id: "BUG-01", hint: "Múi giờ dùng để hiển thị giờ" },
  { id: "BUG-02", hint: "Đặt lịch cho khung giờ đã qua" },
  { id: "BUG-03", hint: "Giờ hiển thị khi múi giờ có chuyển giờ mùa hè" },
];

export interface Booking {
  utc: string;
  zone: string;
}

/** Mười hai khung giờ cố định theo UTC: 01:00 … 12:00 của ngày đã chọn. */
export const slotsOf = (date: string): number[] =>
  Array.from({ length: 12 }, (_, i) => Date.parse(`${date}T${String(i + 1).padStart(2, "0")}:00:00Z`));

// Trình duyệt có thể báo tên IANA cũ (ví dụ Asia/Saigon); chuẩn hoá về tên hiện hành.
const ALIASES: Record<string, string> = { "Asia/Saigon": "Asia/Ho_Chi_Minh", "Asia/Calcutta": "Asia/Kolkata" };
export const browserZone = () => {
  const z = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return ALIASES[z] ?? z;
};

export function formatIn(ms: number, zone: string, opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: false }) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: zone, ...opts }).format(ms);
}

/** Độ lệch (ms) của múi giờ so với UTC tại thời điểm ms. */
export function zoneOffset(ms: number, zone: string): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: zone, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" })
      .formatToParts(ms)
      .map((x) => [x.type, Number(x.value)]),
  );
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000;
}

/** BUG-03: dùng độ lệch của ngày 2026-03-01 cho mọi khung giờ thay vì độ lệch thật (sai khi có chuyển giờ mùa hè). */
export function formatSlot(ms: number, zone: string, dstBug: boolean) {
  if (!dstBug) return formatIn(ms, zone);
  return formatIn(ms + zoneOffset(Date.parse("2026-03-01T12:00:00Z"), zone), "UTC");
}

export const duration = (ms: number) => {
  const mins = Math.max(0, Math.floor(ms / 60_000));
  return `${Math.floor(mins / 60)} giờ ${mins % 60} phút`;
};
