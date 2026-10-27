export const BUGS = [
  { id: "BUG-01", hint: "Cho chọn ngày trả phòng trùng hoặc trước ngày nhận phòng (0 đêm)" },
  { id: "BUG-02", hint: "Số đêm lệch 1 khi khoảng ngày vượt qua cuối tháng" },
  { id: "BUG-03", hint: "Lọc nhiều tiện nghi dùng OR thay vì AND" },
];

export const CITIES = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Nha Trang", "Đà Lạt", "Huế", "Phú Quốc"];

export const MAX_NIGHTS = 30;
export const MIN_NIGHTS = 1;
export const PAGE_SIZE = 5;
export const TAX_RATE = 0.1;
export const BREAKFAST_FEE = 150000;
export const ROOM_CAPACITY = 4;

export type Amenity = "wifi" | "pool" | "breakfast" | "parking";
export const AMENITIES: { id: Amenity; label: string }[] = [
  { id: "wifi", label: "Wifi miễn phí" },
  { id: "pool", label: "Hồ bơi" },
  { id: "breakfast", label: "Bữa sáng" },
  { id: "parking", label: "Bãi đỗ xe" },
];

export interface Hotel {
  id: string;
  name: string;
  city: string;
  stars: number;
  rating: number;
  price: number;
  amenities: Amenity[];
}

const ALL: Amenity[] = ["wifi", "pool", "breakfast", "parking"];

export const HOTELS: Hotel[] = [
  { id: "h01", name: "Phố Cổ Boutique", city: "Hà Nội", stars: 3, rating: 8.1, price: 650000, amenities: ["wifi", "breakfast"] },
  { id: "h02", name: "Hồ Gươm Palace", city: "Hà Nội", stars: 5, rating: 9.4, price: 3200000, amenities: ALL },
  { id: "h03", name: "Tây Hồ Lakeview", city: "Hà Nội", stars: 4, rating: 8.8, price: 1450000, amenities: ["wifi", "pool", "parking"] },
  { id: "h04", name: "Old Quarter Inn", city: "Hà Nội", stars: 3, rating: 7.6, price: 480000, amenities: ["wifi"] },
  { id: "h05", name: "Hà Nội Central", city: "Hà Nội", stars: 4, rating: 8.5, price: 1250000, amenities: ["wifi", "breakfast", "parking"] },
  { id: "h06", name: "Sông Hồng Riverside", city: "Hà Nội", stars: 4, rating: 8.2, price: 1100000, amenities: ["wifi", "pool"] },
  { id: "h07", name: "Hoàn Kiếm Suites", city: "Hà Nội", stars: 3, rating: 7.9, price: 550000, amenities: ["wifi", "breakfast"] },
  { id: "h08", name: "Thăng Long Grand", city: "Hà Nội", stars: 5, rating: 9.1, price: 2800000, amenities: ["wifi", "pool", "breakfast"] },
  { id: "h09", name: "Ba Đình Garden", city: "Hà Nội", stars: 3, rating: 8.0, price: 720000, amenities: ["wifi", "parking"] },
  { id: "h10", name: "Kim Mã Residence", city: "Hà Nội", stars: 4, rating: 8.6, price: 1350000, amenities: ALL },
  { id: "h11", name: "Nội Bài Airport Stay", city: "Hà Nội", stars: 3, rating: 7.4, price: 590000, amenities: ["breakfast", "parking"] },
  { id: "h12", name: "Cầu Giấy Modern", city: "Hà Nội", stars: 4, rating: 8.3, price: 980000, amenities: ["wifi", "breakfast"] },
  { id: "d01", name: "Mỹ Khê Beach Resort", city: "Đà Nẵng", stars: 5, rating: 9.2, price: 2600000, amenities: ALL },
  { id: "d02", name: "Hàn River Hotel", city: "Đà Nẵng", stars: 4, rating: 8.4, price: 1150000, amenities: ["wifi", "breakfast"] },
  { id: "d03", name: "Sơn Trà Homestay", city: "Đà Nẵng", stars: 3, rating: 8.0, price: 520000, amenities: ["wifi"] },
  { id: "d04", name: "Bà Nà View", city: "Đà Nẵng", stars: 4, rating: 8.7, price: 1500000, amenities: ["wifi", "pool", "parking"] },
  { id: "d05", name: "Dragon Bridge Inn", city: "Đà Nẵng", stars: 3, rating: 7.7, price: 610000, amenities: ["wifi", "breakfast"] },
  { id: "d06", name: "Non Nước Villa", city: "Đà Nẵng", stars: 5, rating: 9.5, price: 3400000, amenities: ["wifi", "pool", "breakfast"] },
  { id: "s01", name: "Bến Thành Central", city: "TP. Hồ Chí Minh", stars: 4, rating: 8.3, price: 1300000, amenities: ["wifi", "breakfast", "parking"] },
  { id: "s02", name: "Sài Gòn Backpackers", city: "TP. Hồ Chí Minh", stars: 3, rating: 7.5, price: 420000, amenities: ["wifi"] },
  { id: "s03", name: "Landmark Suites", city: "TP. Hồ Chí Minh", stars: 5, rating: 9.0, price: 3000000, amenities: ALL },
  { id: "n01", name: "Biển Xanh Nha Trang", city: "Nha Trang", stars: 4, rating: 8.5, price: 1400000, amenities: ["wifi", "pool", "breakfast"] },
  { id: "n02", name: "Trần Phú Stay", city: "Nha Trang", stars: 3, rating: 7.8, price: 680000, amenities: ["wifi"] },
  { id: "p01", name: "Bãi Sao Resort", city: "Phú Quốc", stars: 5, rating: 9.3, price: 3800000, amenities: ALL },
  { id: "p02", name: "Dương Đông Bungalow", city: "Phú Quốc", stars: 3, rating: 8.1, price: 750000, amenities: ["wifi", "breakfast"] },
  { id: "l01", name: "Đồi Thông Chalet", city: "Đà Lạt", stars: 4, rating: 8.9, price: 1050000, amenities: ["wifi", "breakfast", "parking"] },
  { id: "l02", name: "Hồ Xuân Hương Inn", city: "Đà Lạt", stars: 3, rating: 8.2, price: 490000, amenities: ["wifi", "breakfast"] },
  { id: "e01", name: "Hương Giang Hotel", city: "Huế", stars: 4, rating: 8.4, price: 1020000, amenities: ["wifi", "pool", "breakfast"] },
  { id: "e02", name: "Đại Nội Homestay", city: "Huế", stars: 3, rating: 8.3, price: 450000, amenities: ["wifi"] },
  { id: "r01", name: "Cát Bà View", city: "Hải Phòng", stars: 4, rating: 8.0, price: 900000, amenities: ["wifi", "pool", "parking"] },
];

export function hotelById(id: string): Hotel | undefined {
  return HOTELS.find((h) => h.id === id);
}

// ---------- Ngày (chuỗi ISO yyyy-mm-dd, tính theo UTC để không lệch múi giờ) ----------

const MS_DAY = 86400000;
const pad = (n: number) => String(n).padStart(2, "0");

export function toIso(y: number, m: number, d: number): string {
  return `${y}-${pad(m)}-${pad(d)}`;
}
export function parseIso(s: string): { y: number; m: number; d: number } {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}
const utc = (s: string) => {
  const { y, m, d } = parseIso(s);
  return Date.UTC(y, m - 1, d);
};
export function diffDays(a: string, b: string): number {
  return Math.round((utc(b) - utc(a)) / MS_DAY);
}
export function addDays(s: string, n: number): string {
  const t = new Date(utc(s) + n * MS_DAY);
  return toIso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}
/** "Hôm nay" theo đồng hồ của trình duyệt (page.clock.setFixedTime điều khiển được). */
export function todayIso(): string {
  const d = new Date();
  return toIso(d.getFullYear(), d.getMonth() + 1, d.getDate());
}
export function formatDate(s: string): string {
  const { y, m, d } = parseIso(s);
  return `${pad(d)}/${pad(m)}/${y}`;
}
export function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}
/** Số ô trống đầu tháng khi tuần bắt đầu từ Thứ Hai. */
export function leadingBlanks(y: number, m: number): number {
  return (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
}
export function addMonths(y: number, m: number, n: number): { y: number; m: number } {
  const idx = y * 12 + (m - 1) + n;
  return { y: Math.floor(idx / 12), m: (idx % 12) + 1 };
}

/** Số đêm = ngày trả - ngày nhận. BUG-02: cộng thêm 1 khi hai ngày khác tháng. */
export function nightsBetween(checkIn: string, checkOut: string, bugs: Set<string>): number {
  let n = diffDays(checkIn, checkOut);
  if (bugs.has("BUG-02") && parseIso(checkIn).m !== parseIso(checkOut).m) n += 1;
  return n;
}

/**
 * Chọn một ngày trên lịch. picking="in": đặt ngày nhận; picking="out": đặt ngày trả.
 * Ngày trả phải sau ngày nhận (ít nhất 1 đêm); chọn ngày không sau ngày nhận thì làm lại từ ngày nhận mới.
 * BUG-01: chấp nhận ngày trả trùng hoặc trước ngày nhận.
 */
export function pickDay(
  state: { checkIn: string; checkOut: string; picking: "in" | "out" },
  day: string,
  bugs: Set<string>,
): { checkIn: string; checkOut: string; picking: "in" | "out"; close: boolean } {
  if (state.picking === "in" || !state.checkIn) return { checkIn: day, checkOut: "", picking: "out", close: false };
  if (day <= state.checkIn && !bugs.has("BUG-01")) return { checkIn: day, checkOut: "", picking: "out", close: false };
  return { checkIn: state.checkIn, checkOut: day, picking: "in", close: true };
}

/** Ngày có chọn được không (quá khứ bị vô hiệu; khi chọn ngày trả, tối đa 30 đêm kể từ ngày nhận). */
export function isDayDisabled(day: string, today: string, checkIn: string, picking: "in" | "out"): boolean {
  if (day < today) return true;
  if (picking === "out" && checkIn && day > addDays(checkIn, MAX_NIGHTS)) return true;
  return false;
}

// ---------- Tìm kiếm, lọc, sắp xếp ----------

export function stripAccents(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function suggestCities(text: string): string[] {
  const q = stripAccents(text.trim());
  if (!q) return CITIES;
  return CITIES.filter((c) => stripAccents(c).includes(q));
}

export interface Filters {
  amenities: Amenity[];
  minStars: number;
  minPrice: number | null;
  maxPrice: number | null;
}

/** Tiện nghi: phải có ĐỦ mọi tiện nghi đã chọn (AND). BUG-03: chỉ cần có một trong số đó (OR). */
export function filterHotels(city: string, f: Filters, bugs: Set<string>): Hotel[] {
  return HOTELS.filter((h) => {
    if (h.city !== city) return false;
    if (f.amenities.length) {
      const ok = bugs.has("BUG-03") ? f.amenities.some((a) => h.amenities.includes(a)) : f.amenities.every((a) => h.amenities.includes(a));
      if (!ok) return false;
    }
    if (h.stars < f.minStars) return false;
    if (f.minPrice !== null && h.price < f.minPrice) return false;
    if (f.maxPrice !== null && h.price > f.maxPrice) return false;
    return true;
  });
}

export type SortKey = "relevance" | "price-asc" | "price-desc" | "rating";
export const SORTS: { id: SortKey; label: string }[] = [
  { id: "relevance", label: "Phù hợp nhất" },
  { id: "price-asc", label: "Giá tăng dần" },
  { id: "price-desc", label: "Giá giảm dần" },
  { id: "rating", label: "Đánh giá cao nhất" },
];

export function sortHotels(list: Hotel[], key: SortKey): Hotel[] {
  const copy = [...list];
  if (key === "price-asc") copy.sort((a, b) => a.price - b.price);
  else if (key === "price-desc") copy.sort((a, b) => b.price - a.price);
  else if (key === "rating") copy.sort((a, b) => b.rating - a.rating);
  return copy;
}

export interface GuestInput {
  adults: number;
  children: number;
  rooms: number;
}

/** Trả về thông báo lỗi tìm kiếm hoặc null nếu hợp lệ. */
export function validateSearch(
  v: { city: string | null; checkIn: string; checkOut: string; guests: GuestInput },
  bugs: Set<string>,
): string | null {
  if (!v.city) return "Vui lòng chọn một thành phố trong danh sách";
  if (!v.checkIn || !v.checkOut) return "Vui lòng chọn ngày nhận phòng và trả phòng";
  const n = nightsBetween(v.checkIn, v.checkOut, bugs);
  if (n < MIN_NIGHTS && !bugs.has("BUG-01")) return "Cần ở tối thiểu 1 đêm";
  if (n > MAX_NIGHTS) return "Chỉ đặt tối đa 30 đêm";
  if (v.guests.rooms > v.guests.adults) return "Mỗi phòng cần ít nhất 1 người lớn";
  if (v.guests.adults + v.guests.children > v.guests.rooms * ROOM_CAPACITY) return "Mỗi phòng tối đa 4 khách, hãy thêm phòng";
  return null;
}

export interface Quote {
  subtotal: number;
  breakfast: number;
  tax: number;
  total: number;
}

export function quote(h: Hotel, nights: number, rooms: number, withBreakfast: boolean): Quote {
  const subtotal = h.price * nights * rooms;
  const breakfast = withBreakfast && !h.amenities.includes("breakfast") ? BREAKFAST_FEE * nights * rooms : 0;
  const tax = Math.round((subtotal + breakfast) * TAX_RATE);
  return { subtotal, breakfast, tax, total: subtotal + breakfast + tax };
}

export function bookingCode(h: Hotel, checkIn: string): string {
  return `HT-${checkIn.replace(/-/g, "")}-${h.id.toUpperCase()}`;
}

export const money = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`;

export function validateContact(c: { name: string; email: string; phone: string }): Record<string, string> {
  const e: Record<string, string> = {};
  if (c.name.trim().length < 2) e.name = "Vui lòng nhập họ tên (ít nhất 2 ký tự)";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) e.email = "Email không hợp lệ";
  if (!/^0\d{9}$/.test(c.phone.trim())) e.phone = "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0";
  return e;
}
