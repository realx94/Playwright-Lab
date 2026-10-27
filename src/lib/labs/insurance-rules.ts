/**
 * LAB-32 Báo giá bảo hiểm xe: luật nghiệp vụ thuần (không phụ thuộc React).
 *
 * Công thức phí (cố định):
 *   phí gốc      = giá trị xe × tỉ lệ gói × hệ số loại xe
 *   sau phụ phí  = phí gốc × 1,2 nếu chủ xe dưới 25 tuổi (ngược lại × 1)
 *   sau giảm giá = sau phụ phí × (1 − mức giảm theo số năm không bồi thường)
 *   phí năm      = làm tròn XUỐNG nghìn đồng của (sau giảm giá + tổng quyền lợi thêm)
 *   phí tháng    = làm tròn (phí năm × 1,08 / 12)
 */
export const BUGS = [
  { id: "BUG-01", hint: "Biên tuổi chủ xe: đúng 18 hoặc đúng 70 tuổi bị từ chối" },
  { id: "BUG-02", hint: "Mức giảm giá nhảy sai ở ngưỡng 2 năm không bồi thường" },
  { id: "BUG-03", hint: "Quay lại từ bước 3 làm mất dữ liệu bước 2" },
];

export type VehicleType = "" | "car" | "truck" | "moto";
export type PackageId = "" | "basic" | "plus" | "full";
export type Billing = "year" | "month";
export type ExtraId = "flood" | "parts" | "rescue";

export const VEHICLE_TYPES: { id: Exclude<VehicleType, "">; label: string; factor10: number }[] = [
  { id: "car", label: "Ô tô con", factor10: 10 },
  { id: "truck", label: "Ô tô tải nhẹ", factor10: 12 },
  { id: "moto", label: "Xe máy", factor10: 6 },
];

/** Tỉ lệ theo gói, tính bằng phần nghìn (10 = 1,0%). */
export const PACKAGES: { id: Exclude<PackageId, "">; label: string; permille: number; note: string }[] = [
  { id: "basic", label: "Cơ bản", permille: 10, note: "Trách nhiệm dân sự, tỉ lệ 1,0%" },
  { id: "plus", label: "Nâng cao", permille: 15, note: "Thêm vật chất xe do tai nạn, tỉ lệ 1,5%" },
  { id: "full", label: "Toàn diện", permille: 20, note: "Mọi rủi ro, tỉ lệ 2,0% (không áp dụng cho xe máy)" },
];

export const EXTRAS: { id: ExtraId; label: string; price: number }[] = [
  { id: "flood", label: "Thuỷ kích", price: 300_000 },
  { id: "parts", label: "Mất cắp bộ phận", price: 500_000 },
  { id: "rescue", label: "Cứu hộ 24/7", price: 200_000 },
];

export const NCB_OPTIONS = [
  { value: "0", label: "0 năm" },
  { value: "1", label: "1 năm" },
  { value: "2", label: "2 năm" },
  { value: "3", label: "3 năm trở lên" },
];

export const MIN_AGE = 18;
export const MAX_AGE = 70;
export const YOUNG_AGE = 25;
export const MIN_VALUE = 50_000_000;
export const MAX_VALUE = 5_000_000_000;
export const MIN_PAYLOAD = 0.5;
export const MAX_PAYLOAD = 3.5;
export const VEHICLE_AGE_LIMIT = 15;
export const MONTHLY_SURCHARGE = 8; // %

export const STEP_TITLES = ["Chủ xe", "Thông tin xe", "Gói bảo hiểm", "Xem lại & xác nhận"];

export interface QuoteForm {
  fullName: string;
  dob: string; // yyyy-mm-dd
  phone: string;
  email: string;
  vehicleType: VehicleType;
  payload: string;
  year: string;
  value: string;
  plate: string;
  pkg: PackageId;
  extras: ExtraId[];
  ncb: string;
  billing: Billing;
}

export const emptyForm = (): QuoteForm => ({
  fullName: "",
  dob: "",
  phone: "",
  email: "",
  vehicleType: "",
  payload: "",
  year: "",
  value: "",
  plate: "",
  pkg: "",
  extras: [],
  ncb: "0",
  billing: "year",
});

export const VEHICLE_FIELDS = ["vehicleType", "payload", "year", "value", "plate"] as const;

/** "Hôm nay" của ứng dụng: gọi qua hàm này để test điều khiển được bằng page.clock. */
export function today(): Date {
  return new Date();
}

export const money = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`;

/** Số nguyên từ chuỗi có thể chứa dấu chấm/phẩy/khoảng trắng phân cách nghìn; null nếu không hợp lệ. */
export function parseMoney(s: string): number | null {
  const t = s.replace(/[.,\s]/g, "");
  return /^\d{1,13}$/.test(t) ? Number(t) : null;
}

export function parsePayload(s: string): number | null {
  const t = s.trim();
  if (!/^\d+([.,]\d+)?$/.test(t)) return null;
  return Number(t.replace(",", "."));
}

/** Tuổi tròn tính đến ngày `now`; null nếu ngày sinh sai định dạng hoặc ở tương lai. */
export function ageAt(dob: string, now: Date): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const check = new Date(y, mo - 1, d);
  if (check.getFullYear() !== y || check.getMonth() !== mo - 1 || check.getDate() !== d) return null;
  const ny = now.getFullYear();
  const nm = now.getMonth() + 1;
  const nd = now.getDate();
  let age = ny - y;
  if (nm < mo || (nm === mo && nd < d)) age -= 1;
  return age < 0 ? null : age;
}

export type Errors = Record<string, string>;

export function validateStep1(f: QuoteForm, now: Date, bugs: Set<string>): Errors {
  const e: Errors = {};
  const name = f.fullName.trim();
  if (!name) e.fullName = "Vui lòng nhập họ và tên";
  else if (name.length < 2 || name.length > 60) e.fullName = "Họ và tên từ 2 đến 60 ký tự";

  if (!f.dob) e.dob = "Vui lòng nhập ngày sinh";
  else {
    const age = ageAt(f.dob, now);
    if (age === null) e.dob = "Ngày sinh không hợp lệ";
    else {
      // BUG-01: so sánh sai biên, loại cả đúng 18 và đúng 70 tuổi.
      const ok = bugs.has("BUG-01") ? age > MIN_AGE && age < MAX_AGE : age >= MIN_AGE && age <= MAX_AGE;
      if (!ok) e.dob = `Chủ xe phải từ ${MIN_AGE} đến ${MAX_AGE} tuổi`;
    }
  }

  const phone = f.phone.trim();
  if (!phone) e.phone = "Vui lòng nhập số điện thoại";
  else if (!/^0[35789]\d{8}$/.test(phone)) e.phone = "Số điện thoại gồm 10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09";

  const email = f.email.trim();
  if (!email) e.email = "Vui lòng nhập email";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = "Email không hợp lệ";
  return e;
}

export function yearRange(now: Date) {
  const max = now.getFullYear();
  return { min: max - VEHICLE_AGE_LIMIT, max };
}

export const PLATE_RE = /^\d{2}[A-Z]{1,2}-\d{3}\.\d{2}$/;

export function validateStep2(f: QuoteForm, now: Date): Errors {
  const e: Errors = {};
  if (!f.vehicleType) e.vehicleType = "Vui lòng chọn loại xe";

  if (f.vehicleType === "truck") {
    const p = parsePayload(f.payload);
    if (f.payload.trim() === "") e.payload = "Vui lòng nhập tải trọng";
    else if (p === null) e.payload = "Tải trọng phải là số";
    else if (p < MIN_PAYLOAD || p > MAX_PAYLOAD) e.payload = "Tải trọng từ 0,5 đến 3,5 tấn";
  }

  const { min, max } = yearRange(now);
  if (!f.year.trim()) e.year = "Vui lòng nhập năm sản xuất";
  else if (!/^\d{4}$/.test(f.year.trim())) e.year = "Năm sản xuất gồm 4 chữ số";
  else if (Number(f.year) < min || Number(f.year) > max) e.year = `Năm sản xuất từ ${min} đến ${max}`;

  const v = parseMoney(f.value);
  if (!f.value.trim()) e.value = "Vui lòng nhập giá trị xe";
  else if (v === null) e.value = "Giá trị xe phải là số";
  else if (v < MIN_VALUE || v > MAX_VALUE) e.value = "Giá trị xe từ 50.000.000 đến 5.000.000.000 ₫";

  const plate = f.plate.trim();
  if (!plate) e.plate = "Vui lòng nhập biển số xe";
  else if (!PLATE_RE.test(plate)) e.plate = "Biển số không hợp lệ (ví dụ 30A-123.45)";
  return e;
}

export function validateStep3(f: QuoteForm): Errors {
  const e: Errors = {};
  if (!f.pkg) e.pkg = "Vui lòng chọn gói bảo hiểm";
  else if (f.pkg === "full" && f.vehicleType === "moto") e.pkg = "Xe máy không áp dụng gói Toàn diện";
  return e;
}

/** Mức giảm (%) theo số năm không bồi thường. */
export function ncbDiscount(ncb: string, bugs: Set<string>): number {
  const n = Number(ncb);
  if (bugs.has("BUG-02")) {
    // BUG-02: ngưỡng nhảy sai, 2 năm đã được 15% (đúng là 10%).
    if (n >= 2) return 15;
    if (n === 1) return 5;
    return 0;
  }
  if (n >= 3) return 15;
  if (n === 2) return 10;
  if (n === 1) return 5;
  return 0;
}

export interface Premium {
  base: number;
  surchargePct: number;
  discountPct: number;
  extras: number;
  annual: number;
  monthly: number;
  payable: number;
}

/** Tính phí; trả về null khi dữ liệu chưa đủ để tính. Tính bằng số nguyên (BigInt) để làm tròn chính xác. */
export function computePremium(f: QuoteForm, now: Date, bugs: Set<string>): Premium | null {
  const pkg = PACKAGES.find((p) => p.id === f.pkg);
  const vt = VEHICLE_TYPES.find((v) => v.id === f.vehicleType);
  const value = parseMoney(f.value);
  const age = ageAt(f.dob, now);
  if (!pkg || !vt || value === null || age === null) return null;

  const surchargePct = age < YOUNG_AGE ? 20 : 0;
  const discountPct = ncbDiscount(f.ncb, bugs);
  const extras = EXTRAS.filter((x) => f.extras.includes(x.id)).reduce((s, x) => s + x.price, 0);

  const B = BigInt;
  const baseNum = B(value) * B(pkg.permille) * B(vt.factor10); // chia cho 1000 × 10
  const baseDen = B(10_000);
  const base = Number(baseNum / baseDen);
  // sau phụ phí và giảm giá: nhân (100 + phụ phí) và (100 − giảm), chia 100 × 100
  const afterNum = baseNum * B(100 + surchargePct) * B(100 - discountPct);
  const afterDen = baseDen * B(10_000);
  // cộng quyền lợi thêm rồi làm tròn xuống nghìn đồng
  const totalNum = afterNum + B(extras) * afterDen;
  const annual = Number((totalNum / (afterDen * B(1000))) * B(1000));
  const monthly = Math.round((annual * (100 + MONTHLY_SURCHARGE)) / 100 / 12);
  return {
    base,
    surchargePct,
    discountPct,
    extras,
    annual,
    monthly,
    payable: f.billing === "month" ? monthly : annual,
  };
}

export const CONTRACT_KEY = "lab:insurance:seq";

export function nextContractNo(now: Date): string {
  let seq = 0;
  try {
    seq = Number(localStorage.getItem(CONTRACT_KEY) ?? "0") || 0;
  } catch {}
  seq += 1;
  try {
    localStorage.setItem(CONTRACT_KEY, String(seq));
  } catch {}
  return `BH-${now.getFullYear()}-${String(seq).padStart(4, "0")}`;
}

export function resetContracts() {
  try {
    localStorage.removeItem(CONTRACT_KEY);
  } catch {}
}
