"use client";

import { useEffect, useState } from "react";
import { useBugs } from "@/lib/labs/use-bugs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  COUPON,
  MAX_QTY,
  PRODUCTS,
  canCancel,
  computeTotals,
  nextStatus,
  vnd,
  type CartLines,
  type OrderStatus,
} from "@/lib/labs/cart-rules";

const KEY = "lab:cart";

interface State {
  lines: CartLines;
  coupon: string | null;
  order: { id: string; status: OrderStatus; total: number } | null;
}

const empty: State = { lines: {}, coupon: null, order: null };

function load(): State {
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return empty;
  }
}

export function CartApp() {
  const bugs = useBugs();
  const [state, setState] = useState<State>(empty);
  const [ready, setReady] = useState(false);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(load());
    setReady(true);
  }, []);

  function save(next: State) {
    setState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  function setQty(id: string, qty: number) {
    const p = PRODUCTS.find((x) => x.id === id)!;
    const max = Math.min(MAX_QTY, p.stock);
    const lines = { ...state.lines };
    if (qty <= 0) delete lines[id];
    else lines[id] = Math.min(qty, max);
    if (qty > max) setMsg(`Tối đa ${max} sản phẩm cho "${p.name}"`);
    else setMsg(null);
    save({ ...state, lines });
  }

  function applyCoupon() {
    if (code.trim().toUpperCase() !== COUPON.code) return setMsg("Mã giảm giá không hợp lệ");
    const t = computeTotals(state.lines, COUPON.code, bugs);
    if (t.subtotal < COUPON.minSubtotal)
      return setMsg(`Đơn tối thiểu ${vnd(COUPON.minSubtotal)} để dùng mã`);
    setMsg(null);
    save({ ...state, coupon: COUPON.code });
  }

  function placeOrder() {
    const t = computeTotals(state.lines, state.coupon, bugs);
    save({
      lines: {},
      coupon: null,
      order: { id: `DH-${Date.now().toString().slice(-6)}`, status: "Mới", total: t.total },
    });
  }

  function reset() {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setState(empty);
    setCode("");
    setMsg(null);
  }

  if (!ready) return null;
  const totals = computeTotals(state.lines, state.coupon, bugs);
  const count = Object.values(state.lines).reduce((a, b) => a + b, 0);
  const { order } = state;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section aria-label="Sản phẩm" className="space-y-3">
        {PRODUCTS.map((p) => {
          const qty = state.lines[p.id] ?? 0;
          return (
            <article
              key={p.id}
              data-testid={`product-${p.id}`}
              className="flex items-center justify-between rounded-xl border p-4"
            >
              <div>
                <h3 className="font-medium">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{vnd(p.price)}</p>
                {p.stock === 0 && <Badge variant="destructive">Hết hàng</Badge>}
              </div>
              {p.stock === 0 ? (
                <Button disabled>Thêm vào giỏ</Button>
              ) : qty === 0 ? (
                <Button onClick={() => setQty(p.id, 1)}>Thêm vào giỏ</Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" aria-label={`Giảm ${p.name}`} onClick={() => setQty(p.id, qty - 1)}>
                    −
                  </Button>
                  <span data-testid={`qty-${p.id}`} className="w-6 text-center">{qty}</span>
                  <Button size="sm" variant="outline" aria-label={`Tăng ${p.name}`} onClick={() => setQty(p.id, qty + 1)}>
                    +
                  </Button>
                </div>
              )}
            </article>
          );
        })}
      </section>

      <aside aria-label="Giỏ hàng" className="space-y-4 rounded-xl border p-4">
        <h2 className="font-semibold">
          Giỏ hàng (<span data-testid="cart-count">{count}</span>)
        </h2>
        {msg && (
          <Alert role="alert" data-testid="cart-message">
            <AlertDescription>{msg}</AlertDescription>
          </Alert>
        )}
        <div className="flex gap-2">
          <Input
            aria-label="Mã giảm giá"
            placeholder="Mã giảm giá"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button variant="outline" onClick={applyCoupon}>Áp dụng</Button>
        </div>
        <dl className="space-y-1 text-sm">
          {[
            ["Tạm tính", totals.subtotal, "subtotal"],
            ["Giảm giá", totals.discount ? -totals.discount : 0, "discount"],
            ["VAT 8%", totals.vat, "vat"],
            ["Phí ship", totals.shipping, "shipping"],
          ].map(([l, v, id]) => (
            <div key={id as string} className="flex justify-between">
              <dt>{l}</dt>
              <dd data-testid={id as string}>{vnd(v as number)}</dd>
            </div>
          ))}
          <div className="flex justify-between border-t pt-2 font-semibold">
            <dt>Tổng cộng</dt>
            <dd data-testid="total">{vnd(totals.total)}</dd>
          </div>
        </dl>
        <Button className="w-full" disabled={count === 0} onClick={placeOrder}>
          Đặt hàng
        </Button>
        <Button variant="ghost" className="w-full" onClick={reset} data-testid="reset-data">
          Reset dữ liệu lab
        </Button>

        {order && (
          <div className="space-y-2 rounded-lg border p-3" data-testid="order">
            <p className="text-sm">
              Đơn <b data-testid="order-id">{order.id}</b> · {vnd(order.total)}
            </p>
            <Badge data-testid="order-status">{order.status}</Badge>
            <div className="flex flex-wrap gap-2">
              {nextStatus(order.status) && (
                <Button
                  size="sm"
                  onClick={() => save({ ...state, order: { ...order, status: nextStatus(order.status)! } })}
                >
                  Chuyển: {nextStatus(order.status)}
                </Button>
              )}
              {canCancel(order.status, bugs) && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => save({ ...state, order: { ...order, status: "Đã huỷ" } })}
                >
                  Huỷ đơn
                </Button>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
