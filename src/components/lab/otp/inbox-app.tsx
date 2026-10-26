"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INBOX_KEY, loadInbox, type InboxMail } from "@/lib/labs/otp-rules";

/** Hộp thư giả: lab “gửi” email vào localStorage, trang này hiển thị chúng. */
export function InboxApp() {
  const [mails, setMails] = useState<InboxMail[] | null>(null);

  useEffect(() => {
    const refresh = () => setMails(loadInbox());
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  function clear() {
    try {
      localStorage.removeItem(INBOX_KEY);
    } catch {}
    setMails([]);
  }

  if (mails === null) return null;

  return (
    <section aria-label="Hộp thư" className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground" data-testid="inbox-count">
          {mails.length} thư
        </p>
        <Button variant="outline" size="sm" onClick={clear} data-testid="inbox-clear">
          Xoá tất cả
        </Button>
      </div>
      {mails.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
          Hộp thư trống. Hãy yêu cầu gửi mã OTP ở trang lab.
        </p>
      ) : (
        <ul className="space-y-3">
          {mails.map((m) => (
            <li key={m.id} data-testid="email-item" className="space-y-1 rounded-xl border p-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4" /> Tới: <span data-testid="email-to">{m.to}</span>
              </p>
              <p className="font-medium" data-testid="email-subject">
                {m.subject}
              </p>
              <p data-testid="email-body">{m.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
