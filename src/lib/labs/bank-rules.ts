export const BANK_KEY = "lab:bank";
export const START_BALANCE = 10_000_000;
export const MIN_AMOUNT = 10_000;
export const MAX_PER_TX = 5_000_000;
export const MAX_PER_DAY = 8_000_000;
export const OTP_TTL_MS = 60_000;
export const MAX_OTP_FAILS = 3;
export const OWN_ACCOUNT = "1122334455";

export const RECIPIENTS: Record<string, string> = {
  "0123456789": "Nguyễn Văn A",
  "9876543210": "Trần Thị B",
};

export const BUGS = [
  { id: "BUG-01", hint: "Phí giao dịch ở đúng mốc 500.000 ₫" },
  { id: "BUG-02", hint: "Hạn mức chuyển trong ngày" },
  { id: "BUG-03", hint: "Số lần nhập sai OTP" },
];

export interface BankState {
  balance: number;
  dayKey: string;
  dayTotal: number;
  counter: number;
  history: { id: string; to: string; amount: number; fee: number }[];
}

export const emptyBank = (): BankState => ({ balance: START_BALANCE, dayKey: "", dayTotal: 0, counter: 0, history: [] });

/** Biểu phí: ≤ 500.000 miễn phí; đến 2.000.000 là 3.300; trên đó là 11.000. BUG-01: đúng 500.000 bị tính phí. */
export function feeOf(amount: number, bugs: Set<string>): number {
  if (amount < 500_000 || (amount === 500_000 && !bugs.has("BUG-01"))) return 0;
  return amount <= 2_000_000 ? 3_300 : 11_000;
}

export const money = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`;
export const dayOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Kiểm tra bước 1; trả về thông báo lỗi hoặc null. */
export function validateTransfer(account: string, amountRaw: string, state: BankState, now: number, bugs: Set<string>): string | null {
  if (!/^\d{10}$/.test(account)) return "Số tài khoản gồm đúng 10 chữ số";
  if (account === OWN_ACCOUNT) return "Không thể chuyển cho chính mình";
  if (!RECIPIENTS[account]) return "Không tìm thấy tài khoản nhận";
  if (!/^\d+$/.test(amountRaw)) return "Số tiền phải là số nguyên dương";
  const amount = Number(amountRaw);
  if (amount < MIN_AMOUNT) return `Số tiền tối thiểu ${money(MIN_AMOUNT)}`;
  if (amount > MAX_PER_TX) return `Số tiền tối đa mỗi giao dịch ${money(MAX_PER_TX)}`;
  const fee = feeOf(amount, bugs);
  if (amount + fee > state.balance) return "Số dư không đủ";
  // BR-02: hạn mức ngày cộng dồn. BUG-02: không cộng dồn.
  const used = state.dayKey === dayOf(now) ? state.dayTotal : 0;
  if (!bugs.has("BUG-02") && used + amount > MAX_PER_DAY) return `Vượt hạn mức chuyển trong ngày ${money(MAX_PER_DAY)}`;
  return null;
}

export function newOtp(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(100000 + (buf[0] % 900000));
}

export function loadBank(): BankState {
  try {
    const raw = localStorage.getItem(BANK_KEY);
    return raw ? { ...emptyBank(), ...JSON.parse(raw) } : emptyBank();
  } catch {
    return emptyBank();
  }
}
export const clock = () => Date.now();
