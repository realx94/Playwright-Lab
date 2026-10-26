import { INBOX_KEY } from "./otp-rules";

export const ORDERS_KEY = "lab:mail-orders";
export const TOKENS_KEY = "lab:mail-tokens";
export const TOKEN_TTL_MS = 15 * 60_000;
export const REGISTERED = ["user@lab.dev"];

export const BUGS = [
  { id: "BUG-01", hint: "Email đặt lại mật khẩu cho địa chỉ chưa đăng ký" },
  { id: "BUG-02", hint: "Tổng tiền trong email xác nhận" },
  { id: "BUG-03", hint: "Liên kết đặt lại mật khẩu sau khi dùng" },
];

export type Lang = "vi" | "en";

export const PRODUCTS = [
  { sku: "SKU-A", vi: "Áo thun", en: "T-shirt", price: 100_000 },
  { sku: "SKU-B", vi: "Giày", en: "Shoes", price: 250_000 },
  { sku: "SKU-C", vi: "Mũ", en: "Cap", price: 50_000 },
];

export interface MailOrder {
  id: string;
  name: string;
  email: string;
  sku: string;
  qty: number;
  lang: Lang;
  total: number;
}

export interface MailToken {
  email: string;
  issuedAt: number;
  used: boolean;
}

const group = (n: number, sep: string) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
export const fmtMoney = (n: number, lang: Lang) => (lang === "vi" ? `${group(n, ".")} ₫` : `${group(n, ",")} VND`);

export const isEmail = (v: string) => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(v);

export function orderMail(o: MailOrder, origin: string, bugs: Set<string>) {
  const p = PRODUCTS.find((x) => x.sku === o.sku)!;
  const unit = p.price;
  const line = unit * o.qty;
  // BUG-02: tổng tiền trong email bỏ qua số lượng
  const total = bugs.has("BUG-02") ? unit : line;
  const link = `${origin}/lab/mail/order/${o.id}`;
  if (o.lang === "vi")
    return {
      subject: `Xác nhận đơn hàng #${o.id}`,
      body: `Xin chào ${o.name},\nCảm ơn bạn đã đặt hàng.\nĐơn hàng #${o.id}: ${o.qty} × ${p.vi} = ${fmtMoney(line, "vi")}\nTổng cộng: ${fmtMoney(total, "vi")}\nXem đơn hàng: ${link}`,
    };
  return {
    subject: `Order confirmation #${o.id}`,
    body: `Hello ${o.name},\nThank you for your order.\nOrder #${o.id}: ${o.qty} × ${p.en} = ${fmtMoney(line, "en")}\nTotal: ${fmtMoney(total, "en")}\nView your order: ${link}`,
  };
}

export function resetMail(token: string, origin: string) {
  return {
    subject: "Đặt lại mật khẩu",
    body: `Xin chào,\nNhấn vào liên kết để đặt lại mật khẩu (có hiệu lực 15 phút):\n${origin}/lab/mail/reset?token=${token}`,
  };
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const clearMailLab = () => {
  try {
    for (const k of [ORDERS_KEY, TOKENS_KEY, INBOX_KEY]) localStorage.removeItem(k);
  } catch {}
};
