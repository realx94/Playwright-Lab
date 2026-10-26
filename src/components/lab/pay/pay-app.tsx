"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import {
  CARDS,
  ORDER_AMOUNT,
  PAY_KEY,
  STATUS_LABEL,
  WEBHOOK_DELAY_MS,
  emptyPayState,
  fmtMoney,
  loadPay,
  type PayState,
} from "@/lib/labs/pay-rules";

type Message = { kind: "error" | "success"; text: string } | null;

/** Thanh toán thẻ giả (kiểu Stripe test mode): iframe nhập thẻ, 3D Secure, webhook trễ và hoàn tiền. */
export function PayApp() {
  const bugs = useBugs();
  const bugsRef = useRef(bugs);
  const stateRef = useRef<PayState>(emptyPayState);
  const frame = useRef<HTMLIFrameElement>(null);
  const [state, setState] = useState<PayState>(emptyPayState);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [threeDs, setThreeDs] = useState(false);
  const [busy, setBusy] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const [refundInput, setRefundInput] = useState("");
  const [refundError, setRefundError] = useState<string | null>(null);

  useEffect(() => {
    bugsRef.current = bugs;
  }, [bugs]);

  function save(next: PayState) {
    stateRef.current = next;
    setState(next);
    try {
      localStorage.setItem(PAY_KEY, JSON.stringify(next));
    } catch {}
  }

  function succeed() {
    setThreeDs(false);
    setBusy(false);
    setMessage(null);
    save({ ...stateRef.current, status: "pending", webhookAt: Date.now() + WEBHOOK_DELAY_MS });
  }

  function charge(number: string) {
    if (number === CARDS.declined) return fail("Thẻ bị từ chối");
    if (number === CARDS.insufficient) return fail("Số dư thẻ không đủ");
    if (number === CARDS.threeDs) {
      // BUG-01: bỏ qua bước xác thực 3D Secure
      if (bugsRef.current.has("BUG-01")) return succeed();
      setThreeDs(true);
      return;
    }
    if (number === CARDS.success || number === CARDS.successVisa) return succeed();
    fail("Thẻ bị từ chối");
  }

  function fail(text: string) {
    setBusy(false);
    setThreeDs(false);
    setMessage({ kind: "error", text });
  }

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const s = loadPay();
    stateRef.current = s;
    setState(s);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "card-frame-ready") return setFrameReady(true);
      if (e.data?.type !== "card-result") return;
      if (!e.data.ok) {
        setBusy(false);
        return setMessage({ kind: "error", text: "Vui lòng kiểm tra thông tin thẻ" });
      }
      charge(e.data.number);
    };
    window.addEventListener("message", onMessage);

    // Webhook trả về sau một khoảng trễ; kiểm tra theo giờ hiện tại nên sống sót qua tải lại trang.
    const t = setInterval(() => {
      const cur = stateRef.current;
      if (cur.status === "pending" && cur.webhookAt !== null && Date.now() >= cur.webhookAt) {
        save({
          ...cur,
          status: "paid",
          webhookAt: null,
          paid: ORDER_AMOUNT,
          revenue: cur.revenue + ORDER_AMOUNT,
          events: [...cur.events, { id: "evt_1", type: "payment.succeeded" }],
        });
        setMessage({ kind: "success", text: "Thanh toán thành công" });
      }
    }, 300);
    return () => {
      window.removeEventListener("message", onMessage);
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pay() {
    setMessage(null);
    setBusy(true);
    frame.current?.contentWindow?.postMessage({ type: "pay" }, window.location.origin);
  }

  function resendWebhook() {
    const cur = stateRef.current;
    // BR-06: webhook gửi lại cùng event id phải được xử lý idempotent. BUG-03: cộng doanh thu lần nữa.
    if (bugsRef.current.has("BUG-03"))
      return save({ ...cur, revenue: cur.revenue + ORDER_AMOUNT, events: [...cur.events, { id: "evt_1", type: "payment.succeeded", note: "gửi lại" }] });
    save({ ...cur, events: [...cur.events, { id: "evt_1", type: "payment.succeeded", note: "trùng, bỏ qua" }] });
  }

  function refund(e: React.FormEvent) {
    e.preventDefault();
    const cur = stateRef.current;
    const amount = Number(refundInput);
    const remaining = cur.paid - cur.refunded;
    if (!Number.isInteger(amount) || amount <= 0) return setRefundError("Số tiền hoàn phải lớn hơn 0");
    if (amount > remaining && !bugsRef.current.has("BUG-02")) return setRefundError("Số tiền hoàn vượt quá số tiền còn lại");
    const refunded = cur.refunded + amount;
    save({
      ...cur,
      refunded,
      revenue: cur.revenue - amount,
      status: refunded >= cur.paid ? "refunded" : "partial",
      events: [...cur.events, { id: `evt_r${cur.events.length}`, type: "charge.refunded" }],
    });
    setRefundError(null);
    setRefundInput("");
  }

  function reset() {
    try {
      localStorage.removeItem(PAY_KEY);
    } catch {}
    stateRef.current = emptyPayState;
    setState(emptyPayState);
    setMessage(null);
    setThreeDs(false);
    setBusy(false);
    setRefundError(null);
    setRefundInput("");
    setFrameReady(false);
    frame.current?.contentWindow?.location.reload();
  }

  if (!ready) return null;

  const canPay = state.status === "unpaid";
  const canRefund = state.status === "paid" || state.status === "partial";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <section aria-label="Đơn hàng" className="space-y-1 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Đơn hàng #1001</h2>
        <p className="text-sm">
          Số tiền: <b data-testid="order-amount">{fmtMoney(ORDER_AMOUNT)}</b>
        </p>
        <p className="text-sm">
          Trạng thái: <b data-testid="order-status">{STATUS_LABEL[state.status]}</b>
        </p>
        <p className="text-sm" data-testid="order-refunded">
          Đã hoàn: {fmtMoney(state.refunded)}
        </p>
        <p className="text-sm" data-testid="revenue">
          Doanh thu ghi nhận: {fmtMoney(state.revenue)}
        </p>
      </section>

      {canPay && (
        <section aria-label="Thanh toán" className="space-y-3 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">Thanh toán bằng thẻ</h2>
          <iframe ref={frame} src="/lab/pay/frame" title="Khung nhập thẻ" className="h-52 w-full rounded-md border" />
          <Button onClick={pay} disabled={!frameReady || busy || threeDs}>
            Thanh toán
          </Button>
        </section>
      )}

      {message && (
        <p role="alert" className={message.kind === "error" ? "text-sm text-destructive" : "text-sm text-green-700 dark:text-green-400"} data-testid="pay-message">
          {message.text}
        </p>
      )}

      {threeDs && (
        <div role="dialog" aria-label="Xác thực 3D Secure" className="space-y-3 rounded-xl border-2 border-primary p-5">
          <h2 className="font-semibold">Xác thực 3D Secure</h2>
          <p className="text-sm text-muted-foreground">Ngân hàng yêu cầu xác thực giao dịch này.</p>
          <div className="flex gap-2">
            <Button onClick={succeed}>Xác thực</Button>
            <Button variant="outline" onClick={() => fail("Xác thực 3D Secure thất bại")}>
              Thất bại
            </Button>
          </div>
        </div>
      )}

      {canRefund && (
        <form onSubmit={refund} noValidate aria-label="Hoàn tiền" className="space-y-3 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">Hoàn tiền</h2>
          <div className="space-y-1.5">
            <Label htmlFor="refund-amount">Số tiền hoàn</Label>
            <Input id="refund-amount" inputMode="numeric" value={refundInput} onChange={(e) => setRefundInput(e.target.value)} />
          </div>
          {refundError && (
            <p role="alert" className="text-sm text-destructive" data-testid="refund-error">
              {refundError}
            </p>
          )}
          <Button type="submit">Hoàn tiền</Button>
        </form>
      )}

      <section aria-label="Webhook" className="space-y-2 rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sự kiện webhook</h2>
          {state.events.length > 0 && (
            <Button size="sm" variant="outline" onClick={resendWebhook}>
              Gửi lại webhook
            </Button>
          )}
        </div>
        <ul className="space-y-1 font-mono text-xs">
          {state.events.length === 0 && <li className="text-muted-foreground">Chưa có sự kiện.</li>}
          {state.events.map((ev, i) => (
            <li key={i} data-testid="webhook-event">
              {ev.type} · {ev.id}
              {ev.note ? ` (${ev.note})` : ""}
            </li>
          ))}
        </ul>
      </section>

      <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
        Reset dữ liệu lab
      </Button>
    </div>
  );
}
