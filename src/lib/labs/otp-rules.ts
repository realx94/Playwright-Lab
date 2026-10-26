export const OTP_KEY = "lab:otp";
export const INBOX_KEY = "lab:inbox";
export const SMS_KEY = "lab:sms";

export const OTP_TTL_MS = 5 * 60_000;
export const OTP_TTL_BUG_MS = 10 * 60_000;
export const MAX_FAILS = 3;
export const RESEND_COOLDOWN_MS = 60_000;
export const RESEND_PER_HOUR = 5;

export const REGISTERED = ["user@lab.dev", "vip@lab.dev"];
/** Số điện thoại đã đăng ký của từng tài khoản (nhận OTP khi chọn kênh SMS). */
export const PHONES: Record<string, string> = { "user@lab.dev": "0901234567", "vip@lab.dev": "0907654321" };
export type Channel = "email" | "sms";

/** 090****567: giữ 3 số đầu và 3 số cuối. */
export const maskPhone = (p: string) => `${p.slice(0, 3)}****${p.slice(-3)}`;

export const BUGS = [
  { id: "BUG-01", hint: "Số lần nhập sai cho phép" },
  { id: "BUG-02", hint: "Thời hạn của mã" },
  { id: "BUG-03", hint: "Hiệu lực của mã cũ khi xin mã mới" },
];

export interface OtpState {
  email: string;
  otp: string | null;
  prevOtp: string | null;
  issuedAt: number;
  fails: number;
  sentAt: number[];
  session: string | null;
  channel?: Channel;
}

export const emptyOtpState: OtpState = {
  email: "",
  otp: null,
  prevOtp: null,
  issuedAt: 0,
  fails: 0,
  sentAt: [],
  session: null,
  channel: "email",
};

export interface InboxMail {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: number;
}

export function generateOtp(seed: number | null): string {
  if (seed !== null) return String(100000 + ((seed * 7919) % 900000));
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(100000 + (buf[0] % 900000));
}

export const isEmail = (v: string) => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(v);

export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export function loadInbox(): InboxMail[] {
  try {
    return JSON.parse(localStorage.getItem(INBOX_KEY) ?? "[]") as InboxMail[];
  } catch {
    return [];
  }
}

export function pushMail(mail: Omit<InboxMail, "id">) {
  const list = loadInbox();
  list.unshift({ ...mail, id: `m-${list.length + 1}-${mail.sentAt}` });
  try {
    localStorage.setItem(INBOX_KEY, JSON.stringify(list.slice(0, 20)));
  } catch {}
}

export interface SmsMessage {
  id: string;
  to: string;
  body: string;
  sentAt: number;
}

export function loadSms(): SmsMessage[] {
  try {
    return JSON.parse(localStorage.getItem(SMS_KEY) ?? "[]") as SmsMessage[];
  } catch {
    return [];
  }
}

export function pushSms(msg: Omit<SmsMessage, "id">) {
  const list = loadSms();
  list.unshift({ ...msg, id: `s-${list.length + 1}-${msg.sentAt}` });
  try {
    localStorage.setItem(SMS_KEY, JSON.stringify(list.slice(0, 20)));
  } catch {}
}
