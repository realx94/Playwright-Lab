"use client";

import { useCallback, useEffect, useState } from "react";
import { useBugs } from "@/lib/labs/use-bugs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Order {
  id: string;
  customer: string;
  total: number;
  status: string;
  items: { sku: string; qty: number; price: number }[];
}

const SKUS = ["SKU-A", "SKU-B", "SKU-C"];
const TABLES = ["products", "orders", "order_items", "audit_log"];
const money = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`;

/** Giao diện đơn hàng: dùng chung API với bài tập, dùng để so sánh UI ↔ API ↔ DB. */
export function OrdersApp() {
  const bugs = useBugs();
  const bugQuery = [...bugs].length ? `?bugs=${[...bugs].join(",")}` : "";
  const [orders, setOrders] = useState<Order[]>([]);
  const [customer, setCustomer] = useState("");
  const [lines, setLines] = useState([{ sku: "SKU-A", qty: "1" }]);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [table, setTable] = useState("orders");
  const [dbView, setDbView] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/lab/orders");
    setOrders(((await res.json()) as { data: Order[] }).data);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/lab/orders" + bugQuery, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer admin-token" },
      body: JSON.stringify({ customer, items: lines.map((l) => ({ sku: l.sku, qty: Number(l.qty) })) }),
    });
    const body = await res.json();
    if (res.ok) {
      setMessage({ kind: "success", text: `Đã tạo đơn ${body.id}` });
      setCustomer("");
      setLines([{ sku: "SKU-A", qty: "1" }]);
    } else {
      const detail = body.errors?.map((x: { message: string }) => x.message).join("; ");
      setMessage({ kind: "error", text: detail ? `${body.message}: ${detail}` : body.message });
    }
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/lab/orders/${id}`, { method: "DELETE", headers: { authorization: "Bearer admin-token" } });
    setMessage({ kind: "success", text: `Đã xoá đơn ${id}` });
    await load();
  }

  async function viewDb() {
    const res = await fetch(`/api/lab/db/${table}`, { headers: { "x-db-token": "readonly" } });
    setDbView(JSON.stringify(await res.json(), null, 2));
  }

  async function reset() {
    await fetch("/api/lab/reset", { method: "POST" });
    setMessage(null);
    setDbView("");
    await load();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <form onSubmit={submit} noValidate aria-label="Tạo đơn hàng" className="space-y-3 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Tạo đơn hàng</h2>
        <div className="space-y-1.5">
          <Label htmlFor="order-customer">Khách hàng</Label>
          <Input id="order-customer" value={customer} onChange={(e) => setCustomer(e.target.value)} />
        </div>
        {lines.map((l, i) => (
          <div key={i} className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`line-sku-${i}`}>{`SKU dòng ${i + 1}`}</Label>
              <select
                id={`line-sku-${i}`}
                className="h-8 w-full rounded-lg border bg-background px-2 text-sm"
                value={l.sku}
                onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, sku: e.target.value } : x)))}
              >
                {SKUS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`line-qty-${i}`}>{`Số lượng dòng ${i + 1}`}</Label>
              <Input id={`line-qty-${i}`} inputMode="numeric" value={l.qty} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, qty: e.target.value } : x)))} />
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={lines.length >= 3} onClick={() => setLines([...lines, { sku: "SKU-B", qty: "1" }])}>
            Thêm dòng
          </Button>
          <Button type="submit">Tạo đơn</Button>
        </div>
        {message && (
          <p role="alert" className={message.kind === "error" ? "text-sm text-destructive" : "text-sm text-green-700 dark:text-green-400"} data-testid="order-message">
            {message.text}
          </p>
        )}
      </form>

      <section aria-label="Danh sách đơn hàng" className="rounded-xl border p-5">
        <h2 className="mb-3 text-lg font-semibold">Đơn hàng ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có đơn hàng.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-1">Mã</th>
                <th>Khách hàng</th>
                <th>Tổng</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} data-testid="order-row">
                  <td className="py-1">{o.id}</td>
                  <td>{o.customer}</td>
                  <td>{money(o.total)}</td>
                  <td>{o.status}</td>
                  <td>
                    <Button size="sm" variant="ghost" aria-label={`Xoá ${o.id}`} onClick={() => remove(o.id)}>
                      Xoá
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section aria-label="Xem dữ liệu DB" className="space-y-3 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Xem DB (chỉ đọc)</h2>
        <div className="flex items-end gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="db-table">Bảng</Label>
            <select id="db-table" className="h-8 rounded-lg border bg-background px-2 text-sm" value={table} onChange={(e) => setTable(e.target.value)}>
              {TABLES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={viewDb}>
            Xem dữ liệu
          </Button>
        </div>
        {dbView && (
          <pre tabIndex={0} className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs" data-testid="db-view">
            {dbView}
          </pre>
        )}
      </section>

      <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
        Reset dữ liệu lab
      </Button>
    </div>
  );
}
