"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SMS_KEY, loadSms, type SmsMessage } from "@/lib/labs/otp-rules";

/** Hộp tin nhắn giả: lab “gửi” SMS vào localStorage, trang này hiển thị chúng. */
export function SmsApp() {
  const [list, setList] = useState<SmsMessage[] | null>(null);

  useEffect(() => {
    const refresh = () => setList(loadSms());
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  function clear() {
    try {
      localStorage.removeItem(SMS_KEY);
    } catch {}
    setList([]);
  }

  if (list === null) return null;

  return (
    <section aria-label="Hộp tin nhắn" className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground" data-testid="sms-count">
          {list.length} tin nhắn
        </p>
        <Button variant="outline" size="sm" onClick={clear} data-testid="sms-clear">
          Xoá tất cả
        </Button>
      </div>
      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
          Chưa có tin nhắn. Ở lab OTP hãy chọn “Nhận mã qua SMS”.
        </p>
      ) : (
        <ul className="space-y-3">
          {list.map((m) => (
            <li key={m.id} data-testid="sms-item" className="space-y-1 rounded-xl border p-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="size-4" /> Tới: <span data-testid="sms-to">{m.to}</span>
              </p>
              <p data-testid="sms-body">{m.body}</p>
              <p className="text-xs text-muted-foreground">{m.body.length} ký tự (tối đa 160 cho một tin nhắn)</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
