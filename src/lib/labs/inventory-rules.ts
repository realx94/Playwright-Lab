export const INV_KEY = "lab:inventory";

export const BUGS = [
  { id: "BUG-01", hint: "Xuất kho vượt quá tồn" },
  { id: "BUG-02", hint: "Cộng tồn kho khi nhận hàng" },
  { id: "BUG-03", hint: "Cảnh báo sắp hết hàng ở đúng mức đặt lại" },
];

export const SUPPLIERS = ["Công ty A", "Công ty B"];

export interface Product {
  sku: string;
  name: string;
  stock: number;
  reorder: number;
  cost: number;
}

export type MoveType = "Nhập kho" | "Xuất kho" | "Điều chỉnh";
export interface Movement {
  id: number;
  sku: string;
  type: MoveType;
  qty: number;
  before: number;
  after: number;
  note: string;
}

export type PoStatus = "Nháp" | "Đã gửi" | "Đã nhận" | "Đã huỷ";
export interface PurchaseOrder {
  id: string;
  sku: string;
  qty: number;
  supplier: string;
  status: PoStatus;
  total: number;
}

export interface InvState {
  products: Product[];
  movements: Movement[];
  pos: PurchaseOrder[];
}

export const seedState = (): InvState => ({
  products: [
    { sku: "SKU-A", name: "Bút bi", stock: 120, reorder: 50, cost: 3_000 },
    { sku: "SKU-B", name: "Vở kẻ ngang", stock: 40, reorder: 40, cost: 8_000 },
    { sku: "SKU-C", name: "Kẹp giấy", stock: 10, reorder: 30, cost: 1_500 },
  ],
  movements: [],
  pos: [],
});

export function load(): InvState {
  try {
    const raw = localStorage.getItem(INV_KEY);
    return raw ? { ...seedState(), ...JSON.parse(raw) } : seedState();
  } catch {
    return seedState();
  }
}

export function write(s: InvState) {
  try {
    localStorage.setItem(INV_KEY, JSON.stringify(s));
  } catch {}
}

/** Cảnh báo: Hết hàng khi tồn = 0; Sắp hết khi tồn ≤ mức đặt lại (BUG-03: chỉ khi nhỏ hơn). */
export function stockLabel(p: Product, bugs: Set<string>): "Hết hàng" | "Sắp hết" | "Đủ hàng" {
  if (p.stock === 0) return "Hết hàng";
  const low = bugs.has("BUG-03") ? p.stock < p.reorder : p.stock <= p.reorder;
  return low ? "Sắp hết" : "Đủ hàng";
}

/** Áp dụng một biến động tồn kho; trả về trạng thái mới hoặc thông báo lỗi. */
export function applyMovement(
  s: InvState,
  m: { sku: string; type: MoveType; qty: string; note: string },
  bugs: Set<string>,
): InvState | { error: string } {
  const p = s.products.find((x) => x.sku === m.sku)!;
  if (!/^\d+$/.test(m.qty)) return { error: "Số lượng phải là số nguyên không âm" };
  const qty = Number(m.qty);
  if (m.type !== "Điều chỉnh" && qty < 1) return { error: "Số lượng phải từ 1 đến 9999" };
  if (qty > 9999) return { error: "Số lượng tối đa 9999" };
  if (m.type === "Điều chỉnh" && !m.note.trim()) return { error: "Điều chỉnh tồn kho cần ghi chú lý do" };
  // BR-02: không xuất quá tồn. BUG-01: cho phép tồn âm.
  if (m.type === "Xuất kho" && qty > p.stock && !bugs.has("BUG-01")) return { error: `Không đủ hàng, tồn hiện tại ${p.stock}` };
  const after = m.type === "Nhập kho" ? p.stock + qty : m.type === "Xuất kho" ? p.stock - qty : qty;
  return {
    ...s,
    products: s.products.map((x) => (x.sku === p.sku ? { ...x, stock: after } : x)),
    movements: [{ id: s.movements.length + 1, sku: p.sku, type: m.type, qty, before: p.stock, after, note: m.note.trim() }, ...s.movements],
  };
}
