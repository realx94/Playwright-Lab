export const LANG_KEY = "lab:lang";

export type Lang = "vi" | "en";

export const BUGS = [
  { id: "BUG-01", hint: "Ngôn ngữ mặc định theo trình duyệt" },
  { id: "BUG-02", hint: "Định dạng ngày theo ngôn ngữ" },
  { id: "BUG-03", hint: "Bố cục ở màn hình hẹp" },
];

export const STRINGS: Record<Lang, Record<string, string>> = {
  vi: {
    title: "Cửa hàng mẫu",
    home: "Trang chủ",
    products: "Sản phẩm",
    contact: "Liên hệ",
    menu: "Mở menu",
    closeMenu: "Đóng menu",
    language: "Ngôn ngữ",
    price: "Giá",
    name: "Tên",
    stock: "Tồn kho",
    cart: "Giỏ hàng",
    inc: "Tăng số lượng",
    dec: "Giảm số lượng",
    updated: "Cập nhật lần cuối",
    total: "Tổng tiền",
    big: "Số liệu thống kê",
  },
  en: {
    title: "Sample store",
    home: "Home",
    products: "Products",
    contact: "Contact",
    menu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
    price: "Price",
    name: "Name",
    stock: "In stock",
    cart: "Cart",
    inc: "Increase quantity",
    dec: "Decrease quantity",
    updated: "Last updated",
    total: "Total",
    big: "Statistics",
  },
};

export const PRODUCTS = [
  { id: "p1", vi: "Áo thun", en: "T-shirt", price: 199_000, stock: 12 },
  { id: "p2", vi: "Giày chạy bộ", en: "Running shoes", price: 1_250_000, stock: 5 },
  { id: "p3", vi: "Mũ lưỡi trai", en: "Baseball cap", price: 89_500, stock: 0 },
];

export const UPDATED_AT = Date.UTC(2026, 2, 8, 12, 0, 0); // Chủ nhật 2026-03-08
export const BIG_NUMBER = 1234567.891;

export const localeOf = (lang: Lang) => (lang === "vi" ? "vi-VN" : "en-US");

/** Ngôn ngữ mặc định theo trình duyệt: vi* → vi, còn lại → en. BUG-01: luôn là vi. */
export function detectLang(navLang: string, bugs: Set<string>): Lang {
  if (bugs.has("BUG-01")) return "vi";
  return navLang.toLowerCase().startsWith("vi") ? "vi" : "en";
}

export function plural(lang: Lang, n: number): string {
  return lang === "vi" ? `${n} mục` : `${n} ${n === 1 ? "item" : "items"}`;
}
