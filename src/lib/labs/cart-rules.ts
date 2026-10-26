export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export const PRODUCTS: Product[] = [
  { id: "p1", name: "Bàn phím cơ", price: 450_000, stock: 20 },
  { id: "p2", name: "Chuột không dây", price: 250_000, stock: 20 },
  { id: "p3", name: "Màn hình 24 inch", price: 3_200_000, stock: 5 },
  { id: "p4", name: "Tai nghe", price: 799_999, stock: 0 },
];

export const MAX_QTY = 10;
export const COUPON = { code: "SALE10", percent: 10, minSubtotal: 500_000, maxDiscount: 100_000 };
export const FREE_SHIP_FROM = 1_000_000;
export const SHIP_FEE = 30_000;
export const VAT_RATE = 0.08;

export type CartLines = Record<string, number>;

export interface Totals {
  subtotal: number;
  discount: number;
  vat: number;
  shipping: number;
  total: number;
}

export function computeTotals(lines: CartLines, coupon: string | null, bugs: Set<string>): Totals {
  const subtotal = PRODUCTS.reduce((s, p) => s + p.price * (lines[p.id] ?? 0), 0);
  let discount = 0;
  if (coupon === COUPON.code && subtotal >= COUPON.minSubtotal) {
    discount = Math.round((subtotal * COUPON.percent) / 100);
    // BUG-02: bỏ trần giảm giá
    if (!bugs.has("BUG-02")) discount = Math.min(discount, COUPON.maxDiscount);
  }
  const after = subtotal - discount;
  // BUG-01: VAT làm tròn xuống thay vì làm tròn gần nhất
  const vat = bugs.has("BUG-01") ? Math.floor(after * VAT_RATE) : Math.round(after * VAT_RATE);
  const shipping = after === 0 || after >= FREE_SHIP_FROM ? 0 : SHIP_FEE;
  return { subtotal, discount, vat, shipping, total: after + vat + shipping };
}

export type OrderStatus = "Mới" | "Đã thanh toán" | "Đang giao" | "Hoàn tất" | "Đã huỷ";

const NEXT: Record<OrderStatus, OrderStatus | null> = {
  Mới: "Đã thanh toán",
  "Đã thanh toán": "Đang giao",
  "Đang giao": "Hoàn tất",
  "Hoàn tất": null,
  "Đã huỷ": null,
};

export const nextStatus = (s: OrderStatus) => NEXT[s];

/** BR-06: chỉ huỷ khi chưa giao. BUG-03 cho phép huỷ đơn đang giao. */
export function canCancel(s: OrderStatus, bugs: Set<string>): boolean {
  return s === "Mới" || s === "Đã thanh toán" || (bugs.has("BUG-03") && s === "Đang giao");
}

export const vnd = (n: number) => `${n.toLocaleString("vi-VN")}đ`;
