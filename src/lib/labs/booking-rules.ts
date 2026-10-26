export const BOOKING_KEY = "lab:booking";
export const SESSION_KEY = "lab:booking-session";
export const HOLD_MS = 5 * 60_000;
export const MAX_SEATS = 6;
export const ROWS = ["A", "B", "C", "D", "E"];
export const COLS = [1, 2, 3, 4, 5, 6];
export const PRICE = { standard: 80_000, vip: 120_000 };

export const SHOWTIMES = [
  { id: "s1", label: "Suất 10:00", booked: ["A1", "A2", "C3"] },
  { id: "s2", label: "Suất 14:00", booked: ["B1", "B2", "B3", "B4", "B5", "B6"] },
  { id: "s3", label: "Suất 20:00", booked: ROWS.flatMap((r) => COLS.map((c) => `${r}${c}`)).filter((s) => s !== "E5" && s !== "E6") },
];

export const BUGS = [
  { id: "BUG-01", hint: "Giá ghế VIP trong tổng tiền" },
  { id: "BUG-02", hint: "Thanh toán sau khi hết thời gian giữ chỗ" },
  { id: "BUG-03", hint: "Số ghế tối đa mỗi lần đặt" },
];

export interface Hold {
  by: string;
  until: number;
}

export interface BookingState {
  booked: Record<string, string[]>; // suất → ghế đã thanh toán (ngoài dữ liệu gốc)
  holds: Record<string, Record<string, Hold>>; // suất → ghế → giữ chỗ
  tickets: number;
}

export const emptyBooking = (): BookingState => ({ booked: {}, holds: {}, tickets: 0 });

export const isVip = (seat: string) => seat.startsWith("D") || seat.startsWith("E");
export const money = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`;

export function load(): BookingState {
  try {
    const raw = localStorage.getItem(BOOKING_KEY);
    return raw ? { ...emptyBooking(), ...JSON.parse(raw) } : emptyBooking();
  } catch {
    return emptyBooking();
  }
}

export function write(s: BookingState) {
  try {
    localStorage.setItem(BOOKING_KEY, JSON.stringify(s));
  } catch {}
}

/** Xoá các giữ chỗ đã hết hạn. */
export function purge(s: BookingState, now: number): BookingState {
  const holds: BookingState["holds"] = {};
  for (const [show, seats] of Object.entries(s.holds))
    holds[show] = Object.fromEntries(Object.entries(seats).filter(([, h]) => h.until > now));
  return { ...s, holds };
}

export const clock = () => Date.now();

export const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
