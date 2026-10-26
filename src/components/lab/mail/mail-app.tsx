"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import { pushMail } from "@/lib/labs/otp-rules";
import { describeMirror, mirrorToRealInbox } from "@/lib/byo/mail-delivery";
import {
  ORDERS_KEY,
  PRODUCTS,
  REGISTERED,
  TOKENS_KEY,
  clearMailLab,
  isEmail,
  orderMail,
  readJson,
  resetMail,
  writeJson,
  type Lang,
  type MailOrder,
  type MailToken,
} from "@/lib/labs/mail-rules";

type Msg = { kind: "error" | "success"; text: string } | null;

/** Cửa hàng giả gửi email giao dịch: xác nhận đơn hàng (đa ngôn ngữ) và đặt lại mật khẩu. Thư nằm ở /lab/inbox. */
export function MailApp() {
  const bugs = useBugs();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sku, setSku] = useState(PRODUCTS[0].sku);
  const [qty, setQty] = useState("1");
  const [lang, setLang] = useState<Lang>("vi");
  const [orderMsg, setOrderMsg] = useState<Msg>(null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState<Msg>(null);
  const [realStatus, setRealStatus] = useState<string | null>(null);

  /** Gửi thêm email thật nếu người học đã bật trong Cài đặt → Dịch vụ của tôi. */
  function mirror(mail: { to: string; subject: string; body: string }) {
    void mirrorToRealInbox(mail).then((res) => setRealStatus(res ? describeMirror(res, mail.to) : null));
  }

  function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    const q = Number(qty);
    if (!name.trim() || name.trim().length > 50) return setOrderMsg({ kind: "error", text: "Tên khách hàng bắt buộc, tối đa 50 ký tự" });
    if (!isEmail(email.trim())) return setOrderMsg({ kind: "error", text: "Email không hợp lệ" });
    if (!Number.isInteger(q) || q < 1 || q > 10) return setOrderMsg({ kind: "error", text: "Số lượng là số nguyên từ 1 đến 10" });

    const orders = readJson<MailOrder[]>(ORDERS_KEY, []);
    const price = PRODUCTS.find((p) => p.sku === sku)!.price;
    const order: MailOrder = { id: `A${1001 + orders.length}`, name: name.trim(), email: email.trim(), sku, qty: q, lang, total: price * q };
    writeJson(ORDERS_KEY, [...orders, order]);
    const m = orderMail(order, window.location.origin, bugs);
    pushMail({ to: order.email, subject: m.subject, body: m.body, sentAt: Date.now() });
    mirror({ to: order.email, subject: m.subject, body: m.body });
    setOrderMsg({ kind: "success", text: `Đã đặt đơn #${order.id}. Email xác nhận đã được gửi tới ${order.email}` });
  }

  function requestReset(e: React.FormEvent) {
    e.preventDefault();
    const addr = resetEmail.trim().toLowerCase();
    if (!isEmail(addr)) return setResetMsg({ kind: "error", text: "Email không hợp lệ" });
    // BR-04: luôn trả thông báo trung tính; chỉ gửi thư cho email đã đăng ký (BUG-01: gửi cho cả email lạ)
    if (REGISTERED.includes(addr) || bugs.has("BUG-01")) {
      const token = `t-${Math.random().toString(36).slice(2, 10)}`;
      const tokens = readJson<Record<string, MailToken>>(TOKENS_KEY, {});
      tokens[token] = { email: addr, issuedAt: Date.now(), used: false };
      writeJson(TOKENS_KEY, tokens);
      const m = resetMail(token, window.location.origin);
      pushMail({ to: addr, subject: m.subject, body: m.body, sentAt: Date.now() });
      mirror({ to: addr, subject: m.subject, body: m.body });
    }
    setResetMsg({ kind: "success", text: "Nếu email đã đăng ký, chúng tôi đã gửi liên kết đặt lại mật khẩu" });
  }

  const msgEl = (m: Msg, id: string) =>
    m && (
      <p role="alert" className={m.kind === "error" ? "text-sm text-destructive" : "text-sm text-green-700 dark:text-green-400"} data-testid={id}>
        {m.text}
      </p>
    );

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <form onSubmit={placeOrder} noValidate aria-label="Đặt hàng" className="space-y-3 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Đặt hàng</h2>
        <div className="space-y-1.5">
          <Label htmlFor="mail-name">Tên khách hàng</Label>
          <Input id="mail-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mail-email">Email đặt hàng</Label>
          <Input id="mail-email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="mail-sku">Sản phẩm</Label>
            <select id="mail-sku" className="h-8 w-full rounded-lg border bg-background px-2 text-sm" value={sku} onChange={(e) => setSku(e.target.value)}>
              {PRODUCTS.map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.vi}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mail-qty">Số lượng</Label>
            <Input id="mail-qty" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mail-lang">Ngôn ngữ email</Label>
            <select id="mail-lang" className="h-8 w-full rounded-lg border bg-background px-2 text-sm" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        {msgEl(orderMsg, "order-message")}
        <Button type="submit">Đặt hàng</Button>
      </form>

      <form onSubmit={requestReset} noValidate aria-label="Quên mật khẩu" className="space-y-3 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Quên mật khẩu</h2>
        <p className="text-sm text-muted-foreground">
          Tài khoản đã đăng ký: <code>user@lab.dev</code>
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="mail-reset-email">Email tài khoản</Label>
          <Input id="mail-reset-email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
        </div>
        {msgEl(resetMsg, "reset-message")}
        <Button type="submit">Gửi liên kết đặt lại</Button>
      </form>

      {realStatus && (
        <p className="text-xs text-muted-foreground" data-testid="real-mail-status">
          {realStatus}
        </p>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        data-testid="reset-data"
        onClick={() => {
          clearMailLab();
          setOrderMsg(null);
          setResetMsg(null);
          setRealStatus(null);
        }}
      >
        Reset dữ liệu lab
      </Button>
    </div>
  );
}
