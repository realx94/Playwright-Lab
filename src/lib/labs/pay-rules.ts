export const PAY_KEY = "lab:pay";
export const ORDER_AMOUNT = 500_000;
export const WEBHOOK_DELAY_MS = 2000;

export const BUGS = [
  { id: "BUG-01", hint: "Thẻ yêu cầu xác thực 3D Secure" },
  { id: "BUG-02", hint: "Giới hạn số tiền hoàn" },
  { id: "BUG-03", hint: "Xử lý webhook được gửi lại" },
];

export const CARDS = {
  success: "4242424242424242",
  successVisa: "4111111111111111",
  declined: "4000000000000002",
  insufficient: "4000000000009995",
  threeDs: "4000002500003155",
};

export type OrderStatus = "unpaid" | "pending" | "paid" | "partial" | "refunded";

export interface WebhookEvent {
  id: string;
  type: string;
  note?: string;
}

export interface PayState {
  status: OrderStatus;
  webhookAt: number | null;
  paid: number;
  refunded: number;
  revenue: number;
  events: WebhookEvent[];
}

export const emptyPayState: PayState = {
  status: "unpaid",
  webhookAt: null,
  paid: 0,
  refunded: 0,
  revenue: 0,
  events: [],
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  unpaid: "Chưa thanh toán",
  pending: "Đang chờ webhook",
  paid: "Đã thanh toán",
  partial: "Hoàn một phần",
  refunded: "Đã hoàn tiền",
};

export const fmtMoney = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`;

export function luhn(digits: string): boolean {
  if (!/^\d{12,19}$/.test(digits)) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function loadPay(): PayState {
  try {
    const raw = localStorage.getItem(PAY_KEY);
    return raw ? { ...emptyPayState, ...JSON.parse(raw) } : emptyPayState;
  } catch {
    return emptyPayState;
  }
}
