"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import {
  ORDERS_KEY,
  PRODUCTS,
  TOKENS_KEY,
  TOKEN_TTL_MS,
  fmtMoney,
  readJson,
  writeJson,
  type MailOrder,
  type MailToken,
} from "@/lib/labs/mail-rules";

/** Trang đơn hàng mở từ liên kết trong email. */
export function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<MailOrder | null | undefined>(undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(readJson<MailOrder[]>(ORDERS_KEY, []).find((o) => o.id === id) ?? null);
  }, [id]);

  if (order === undefined) return null;
  if (!order)
    return (
      <p role="alert" className="rounded-xl border p-6 text-red-700 dark:text-red-400" data-testid="order-missing">
        Không tìm thấy đơn hàng #{id}
      </p>
    );
  const p = PRODUCTS.find((x) => x.sku === order.sku)!;
  return (
    <section aria-label="Chi tiết đơn hàng" className="space-y-2 rounded-xl border p-6">
      <h2 className="text-lg font-semibold" data-testid="order-title">
        Đơn hàng #{order.id}
      </h2>
      <p data-testid="order-line">
        {order.qty} × {p.vi}
      </p>
      <p data-testid="order-total">Tổng cộng: {fmtMoney(order.total, "vi")}</p>
      <p className="text-sm text-muted-foreground">Khách hàng: {order.name} ({order.email})</p>
    </section>
  );
}

/** Trang đặt lại mật khẩu mở từ liên kết trong email (token một lần, hiệu lực 15 phút). */
export function ResetPage() {
  const params = useSearchParams();
  const bugs = useBugs();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"checking" | "ok" | "invalid" | "done">("checking");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = readJson<Record<string, MailToken>>(TOKENS_KEY, {})[token];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(t && !t.used && Date.now() - t.issuedAt <= TOKEN_TTL_MS ? "ok" : "invalid");
  }, [token]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const tokens = readJson<Record<string, MailToken>>(TOKENS_KEY, {});
    const t = tokens[token];
    if (!t || t.used || Date.now() - t.issuedAt > TOKEN_TTL_MS) return setStatus("invalid");
    if (pw.length < 8 || !/\d/.test(pw)) return setError("Mật khẩu tối thiểu 8 ký tự và có ít nhất một chữ số");
    if (pw !== confirm) return setError("Mật khẩu xác nhận không khớp");
    // BUG-03: liên kết không bị vô hiệu sau khi dùng
    if (!bugs.has("BUG-03")) writeJson(TOKENS_KEY, { ...tokens, [token]: { ...t, used: true } });
    setStatus("done");
  }

  if (status === "checking") return null;
  if (status === "invalid")
    return (
      <p role="alert" className="rounded-xl border p-6 text-red-700 dark:text-red-400" data-testid="reset-invalid">
        Liên kết không hợp lệ, đã được sử dụng hoặc đã hết hạn
      </p>
    );
  if (status === "done")
    return (
      <p role="status" className="rounded-xl border p-6" data-testid="reset-done">
        Đã đổi mật khẩu thành công
      </p>
    );
  return (
    <form onSubmit={submit} noValidate aria-label="Biểu mẫu đặt lại" className="space-y-4 rounded-xl border p-6">
      <h2 className="text-lg font-semibold">Đặt mật khẩu mới</h2>
      <div className="space-y-1.5">
        <Label htmlFor="new-pw">Mật khẩu mới</Label>
        <Input id="new-pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new-pw2">Nhập lại mật khẩu</Label>
        <Input id="new-pw2" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive" data-testid="reset-error">
          {error}
        </p>
      )}
      <Button type="submit">Đổi mật khẩu</Button>
    </form>
  );
}
