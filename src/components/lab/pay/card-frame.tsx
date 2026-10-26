"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { luhn } from "@/lib/labs/pay-rules";

/** Khung nhập thẻ chạy trong iframe (giống Stripe Elements): trang cha chỉ nhận lại kết quả qua postMessage. */
export function CardFrame() {
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const values = useRef({ number, expiry, cvc });

  useEffect(() => {
    values.current = { number, expiry, cvc };
  }, [number, expiry, cvc]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== "pay") return;
      const v = values.current;
      const digits = v.number.replace(/\s/g, "");
      let err: string | null = null;
      const m = /^(\d{2})\/(\d{2})$/.exec(v.expiry);
      if (!luhn(digits)) err = "Số thẻ không hợp lệ";
      else if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) err = "Ngày hết hạn không hợp lệ";
      else {
        const now = new Date();
        const exp = new Date(2000 + Number(m[2]), Number(m[1]), 1); // đầu tháng sau ngày hết hạn
        if (exp <= now) err = "Thẻ đã hết hạn";
      }
      if (!err && !/^\d{3}$/.test(v.cvc)) err = "CVC gồm 3 chữ số";
      setError(err);
      window.parent.postMessage(err ? { type: "card-result", ok: false, error: err } : { type: "card-result", ok: true, number: digits }, window.location.origin);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="space-y-3 p-3">
      <div className="space-y-1.5">
        <Label htmlFor="card-number">Số thẻ</Label>
        <Input id="card-number" inputMode="numeric" autoComplete="off" placeholder="1234 1234 1234 1234" value={number} onChange={(e) => setNumber(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="card-expiry">Hết hạn (MM/YY)</Label>
          <Input id="card-expiry" autoComplete="off" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="card-cvc">CVC</Label>
          <Input id="card-cvc" inputMode="numeric" autoComplete="off" placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value)} />
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive" data-testid="card-error">
          {error}
        </p>
      )}
    </div>
  );
}
