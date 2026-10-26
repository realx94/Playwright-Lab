"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import {
  INV_KEY,
  SUPPLIERS,
  applyMovement,
  load,
  seedState,
  stockLabel,
  write,
  type InvState,
  type MoveType,
  type PoStatus,
  type PurchaseOrder,
} from "@/lib/labs/inventory-rules";

const money = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`;

/** Liên kết giữa hai phân hệ; giữ tham số bugs để bug còn hiệu lực khi chuyển trang. */
function Nav() {
  const bugs = useBugs();
  const q = [...bugs].length ? `?bugs=${[...bugs].join(",")}` : "";
  return (
    <nav aria-label="Phân hệ kho" className="flex gap-4 text-sm">
      <a className="underline" href={`/lab/inventory${q}`}>
        Tồn kho
      </a>
      <a className="underline" href={`/lab/inventory/po${q}`}>
        Đơn nhập hàng
      </a>
    </nav>
  );
}

function useInventory() {
  const [state, setState] = useState<InvState>(seedState());
  const [ready, setReady] = useState(false);
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setState(load());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  const save = (s: InvState) => {
    setState(s);
    write(s);
  };
  const reset = () => {
    try {
      localStorage.removeItem(INV_KEY);
    } catch {}
    setState(seedState());
  };
  return { state, ready, save, reset };
}

/** Trang tồn kho: danh sách sản phẩm với cảnh báo, biến động nhập/xuất/điều chỉnh và lịch sử. */
export function InventoryApp() {
  const bugs = useBugs();
  const { state, ready, save, reset } = useInventory();
  const [sku, setSku] = useState("SKU-A");
  const [type, setType] = useState<MoveType>("Nhập kho");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = applyMovement(state, { sku, type, qty, note }, bugs);
    if ("error" in r) return setMsg({ kind: "error", text: r.error });
    save(r);
    setMsg({ kind: "success", text: `${type} ${sku}: tồn kho mới ${r.products.find((p) => p.sku === sku)!.stock}` });
    setQty("");
    setNote("");
  }

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Nav />
      <section aria-label="Tồn kho" className="rounded-xl border p-5">
        <h2 className="mb-3 text-lg font-semibold">Tồn kho</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th>SKU</th>
              <th>Tên</th>
              <th>Tồn</th>
              <th>Mức đặt lại</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {state.products.map((p) => (
              <tr key={p.sku} data-testid="stock-row" data-sku={p.sku}>
                <td className="py-1">{p.sku}</td>
                <td>{p.name}</td>
                <td data-testid="stock-qty">{p.stock}</td>
                <td>{p.reorder}</td>
                <td data-testid="stock-label">{stockLabel(p, bugs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <form onSubmit={submit} noValidate aria-label="Ghi nhận biến động" className="space-y-3 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Ghi nhận biến động kho</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="mv-sku">Sản phẩm</Label>
            <select id="mv-sku" className="h-8 w-full rounded-lg border bg-background px-2 text-sm" value={sku} onChange={(e) => setSku(e.target.value)}>
              {state.products.map((p) => (
                <option key={p.sku} value={p.sku}>{`${p.sku} — ${p.name}`}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mv-type">Loại biến động</Label>
            <select id="mv-type" className="h-8 w-full rounded-lg border bg-background px-2 text-sm" value={type} onChange={(e) => setType(e.target.value as MoveType)}>
              <option>Nhập kho</option>
              <option>Xuất kho</option>
              <option>Điều chỉnh</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mv-qty">Số lượng</Label>
            <Input id="mv-qty" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mv-note">Ghi chú</Label>
          <Input id="mv-note" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        {msg && (
          <p role="alert" className={msg.kind === "error" ? "text-sm text-destructive" : "text-sm text-green-700 dark:text-green-400"} data-testid="inv-message">
            {msg.text}
          </p>
        )}
        <Button type="submit">Ghi nhận</Button>
      </form>

      <section aria-label="Lịch sử biến động" className="rounded-xl border p-5">
        <h2 className="mb-2 text-lg font-semibold">Lịch sử biến động</h2>
        {state.movements.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có biến động.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {state.movements.map((m) => (
              <li key={m.id} data-testid="movement-row">
                {m.sku} · {m.type} {m.qty} · {m.before} → {m.after}
                {m.note ? ` · ${m.note}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button type="button" variant="ghost" size="sm" onClick={() => { reset(); setMsg(null); }} data-testid="reset-data">
        Reset dữ liệu lab
      </Button>
    </div>
  );
}

/** Trang đơn nhập hàng: Nháp → Đã gửi → Đã nhận (cộng tồn kho) hoặc Đã huỷ. */
export function PurchaseOrdersApp() {
  const bugs = useBugs();
  const { state, ready, save, reset } = useInventory();
  const [sku, setSku] = useState("SKU-A");
  const [qty, setQty] = useState("");
  const [supplier, setSupplier] = useState(SUPPLIERS[0]);
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  function create(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d+$/.test(qty) || Number(qty) < 1 || Number(qty) > 5000) return setMsg({ kind: "error", text: "Số lượng đặt từ 1 đến 5000" });
    const p = state.products.find((x) => x.sku === sku)!;
    const id = `PO${String(state.pos.length + 1).padStart(3, "0")}`;
    save({ ...state, pos: [...state.pos, { id, sku, qty: Number(qty), supplier, status: "Nháp", total: Number(qty) * p.cost }] });
    setMsg({ kind: "success", text: `Đã tạo ${id}` });
    setQty("");
  }

  function setStatus(po: PurchaseOrder, status: PoStatus) {
    let next: InvState = { ...state, pos: state.pos.map((x) => (x.id === po.id ? { ...x, status } : x)) };
    if (status === "Đã nhận") {
      // BR-05: nhận hàng cộng đúng số lượng đặt vào tồn kho. BUG-02: cộng gấp đôi.
      const add = po.qty * (bugs.has("BUG-02") ? 2 : 1);
      const p = state.products.find((x) => x.sku === po.sku)!;
      next = {
        ...next,
        products: next.products.map((x) => (x.sku === po.sku ? { ...x, stock: x.stock + add } : x)),
        movements: [{ id: state.movements.length + 1, sku: po.sku, type: "Nhập kho", qty: add, before: p.stock, after: p.stock + add, note: `Nhận hàng ${po.id}` }, ...state.movements],
      };
    }
    save(next);
    setMsg({ kind: "success", text: `${po.id} chuyển sang ${status}` });
  }

  if (!ready) return null;

  const actions: Record<PoStatus, PoStatus[]> = { "Nháp": ["Đã gửi", "Đã huỷ"], "Đã gửi": ["Đã nhận", "Đã huỷ"], "Đã nhận": [], "Đã huỷ": [] };
  const verb: Record<PoStatus, string> = { "Nháp": "Nháp", "Đã gửi": "Gửi đơn", "Đã nhận": "Nhận hàng", "Đã huỷ": "Huỷ đơn" };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Nav />
      <form onSubmit={create} noValidate aria-label="Tạo đơn nhập hàng" className="space-y-3 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Tạo đơn nhập hàng</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="po-sku">Sản phẩm</Label>
            <select id="po-sku" className="h-8 w-full rounded-lg border bg-background px-2 text-sm" value={sku} onChange={(e) => setSku(e.target.value)}>
              {state.products.map((p) => (
                <option key={p.sku} value={p.sku}>{`${p.sku} — ${p.name}`}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="po-qty">Số lượng đặt</Label>
            <Input id="po-qty" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="po-supplier">Nhà cung cấp</Label>
            <select id="po-supplier" className="h-8 w-full rounded-lg border bg-background px-2 text-sm" value={supplier} onChange={(e) => setSupplier(e.target.value)}>
              {SUPPLIERS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        {msg && (
          <p role="alert" className={msg.kind === "error" ? "text-sm text-destructive" : "text-sm text-green-700 dark:text-green-400"} data-testid="po-message">
            {msg.text}
          </p>
        )}
        <Button type="submit">Tạo đơn</Button>
      </form>

      <section aria-label="Danh sách đơn nhập" className="space-y-2 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Đơn nhập hàng ({state.pos.length})</h2>
        <ul className="space-y-2">
          {state.pos.map((po) => (
            <li key={po.id} data-testid="po-row" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
              <span>
                <b>{po.id}</b> · {po.sku} × {po.qty} · {po.supplier} · {money(po.total)} · <span data-testid="po-status">{po.status}</span>
              </span>
              <span className="flex gap-2">
                {actions[po.status].map((to) => (
                  <Button key={to} size="sm" variant="outline" aria-label={`${verb[to]} ${po.id}`} onClick={() => setStatus(po, to)}>
                    {verb[to]}
                  </Button>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Button type="button" variant="ghost" size="sm" onClick={() => { reset(); setMsg(null); }} data-testid="reset-data">
        Reset dữ liệu lab
      </Button>
    </div>
  );
}
