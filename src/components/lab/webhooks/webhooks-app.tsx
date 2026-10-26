"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useBugs } from "@/lib/labs/use-bugs";

interface State {
  invoices: { id: string; amount: number; status: "paid" | "unpaid" }[];
  revenue: number;
  processedEvents: string[];
  log: string[];
}

const SECRET = "whsec_lab_secret";
const money = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`;

async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
  return Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Đối tác ký và gửi webhook invoice.paid. */
async function sendSigned(invoiceId: string, amount: number, query: string) {
  const body = JSON.stringify({ id: `evt_ui_${invoiceId}`, type: "invoice.paid", data: { invoice_id: invoiceId, amount } });
  const ts = String(Math.floor(Date.now() / 1000));
  const signature = "sha256=" + (await hmacHex(SECRET, `${ts}.${body}`));
  await fetch("/api/lab/webhook" + query, { method: "POST", headers: { "content-type": "application/json", "x-timestamp": ts, "x-signature": signature }, body });
}

/** Bảng hóa đơn tự làm mới; nút giả lập đối tác gửi webhook đã ký sau một khoảng trễ. */
export function WebhooksApp() {
  const bugs = useBugs();
  const [state, setState] = useState<State | null>(null);
  const [sending, setSending] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/lab/webhook/state", { cache: "no-store" });
    setState(await res.json());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const t = setInterval(load, 1000);
    return () => clearInterval(t);
  }, [load]);

  async function partnerSend(invoiceId: string, amount: number) {
    setSending(invoiceId);
    await new Promise((r) => setTimeout(r, 1500));
    await sendSigned(invoiceId, amount, [...bugs].length ? `?bugs=${[...bugs].join(",")}` : "");
    setSending(null);
    await load();
  }

  async function reset() {
    await fetch("/api/lab/reset", { method: "POST" });
    await load();
  }

  if (!state) return null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <section aria-label="Hóa đơn" className="rounded-xl border p-5">
        <h2 className="mb-3 text-lg font-semibold">Hóa đơn</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-1">Mã</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {state.invoices.map((i) => (
              <tr key={i.id} data-testid="invoice-row">
                <td className="py-1">{i.id}</td>
                <td>{money(i.amount)}</td>
                <td data-testid={`invoice-status-${i.id}`}>{i.status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}</td>
                <td>
                  {i.status === "unpaid" && (
                    <Button size="sm" variant="outline" disabled={sending !== null} onClick={() => partnerSend(i.id, i.amount)}>
                      {sending === i.id ? "Đối tác đang gửi…" : `Giả lập đối tác trả ${i.id}`}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-sm" data-testid="revenue">
          Doanh thu ghi nhận: {money(state.revenue)}
        </p>
      </section>

      <section aria-label="Nhật ký webhook" className="rounded-xl border p-5">
        <h2 className="mb-2 text-lg font-semibold">Nhật ký xử lý</h2>
        <ul className="space-y-1 font-mono text-xs" data-testid="webhook-log">
          {state.log.length === 0 && <li className="text-muted-foreground">Chưa có sự kiện.</li>}
          {state.log.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </section>

      <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
        Reset dữ liệu lab
      </Button>
    </div>
  );
}
